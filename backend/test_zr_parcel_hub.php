<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$token = config('zrexpress.token');
$tenantId = config('zrexpress.tenant_id');
$order = \App\Models\Order::find(82);
$zr = app(\App\Services\ZRExpressService::class);

// Force order type to pickup-point to simulate what API sends
$order->delivery_type = 'pickup-point';

// Let's copy payload logic from Service to test injecting hubId
// MOCK
$description = 'Test';
$amount = 3000.0;
$phone = '+213555131166';
$wilayaName = 'Médéa';
$communeName = 'Médéa';

$territoryRes = Http::withoutVerifying()->withHeaders(['X-Api-Key' => $token, 'X-Tenant' => $tenantId, 'Accept' => 'application/json'])
  ->post("https://api.zrexpress.app/api/v1/territories/search", ['keyword'  => $communeName, 'page' => 1, 'pageSize' => 5]);
$items = $territoryRes->json()['items'] ?? [];
$commune = collect($items)->firstWhere('level', 'commune') ?? $items[0];

$payload = [
    'description'    => $description,
    'deliveryType'   => 'pickup-point',
    'amount'         => $amount,
    'externalId'     => "TEST82",
    'customer' => [
        'customerId' => "71934876-cbda-4c5e-8b87-5997cf9cc761", // mock customer
        'name'       => "test",
        'phone'      => ['number1' => $phone]
    ],
    'orderedProducts' => [
        [
            'productName' => $description,
            'unitPrice'   => $amount,
            'quantity'    => 1,
            'stockType'   => 'none'
        ]
    ],
    'deliveryAddress' => [
        'street'              => "$wilayaName, {$commune['code']} - {$wilayaName} - {$communeName}",
        'city'                => "{$commune['code']} - {$wilayaName} - {$communeName}",
        'cityTerritoryId'     => $commune['parentId'],
        'district'            => $wilayaName,
        'districtTerritoryId' => $commune['id'],
        'country'             => 'Algeria',
        // TRY INJECTING hubId HERE:
        'hubId' => '0da58310-7e5b-4825-ab4a-ae3b290894a5' // the ID of Medea hub we found
    ],
    'weight' => [
        'weight'            => 0.5,
        'dimensionalWeight' => 0.5
    ]
];

$create = Http::withoutVerifying()
    ->withHeaders(['X-Api-Key' => $token, 'X-Tenant' => $tenantId, 'Accept' => 'application/json'])
    ->post("https://api.zrexpress.app/api/v1/parcels", $payload);

echo "Create Parcel with hubId inside deliveryAddress Status: " . $create->status() . "\n";
echo "Body: " . $create->body() . "\n";

