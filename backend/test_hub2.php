<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$token = config('zrexpress.token');
$tenantId = config('zrexpress.tenant_id');

$payload = [
    'description'    => 'test',
    'deliveryType'   => 'pickup-point',
    'amount'         => 3000.0,
    'externalId'     => "TEST82-HUB",
    'customer' => [
        'customerId' => "71934876-cbda-4c5e-8b87-5997cf9cc761",
        'name'       => "test",
        'phone'      => ['number1' => '+213555131166']
    ],
    'orderedProducts' => [
        [
            'productName' => 'test',
            'unitPrice'   => 3000.0,
            'quantity'    => 1,
            'stockType'   => 'none'
        ]
    ],
    'deliveryAddress' => [
        'street'              => "test",
        'city'                => "Medea",
        'cityTerritoryId'     => '0e0f2d43-6d78-47dd-8bb7-0f2771cb97ff',
        'district'            => 'Medea',
        'districtTerritoryId' => '60f4499d-cead-453c-bc3a-5b19201d2627',
        'country'             => 'Algeria',
        'hubId'               => '0da58310-7e5b-4825-ab4a-ae3b290894a5' // Hub Médéa 26
    ],
    'weight' => [
        'weight'            => 0.5,
        'dimensionalWeight' => 0.5
    ]
];

$create = Http::withoutVerifying()
    ->withHeaders(['X-Api-Key' => $token, 'X-Tenant' => $tenantId, 'Accept' => 'application/json'])
    ->post("https://api.zrexpress.app/api/v1/parcels", $payload);

echo "Create Parcel Status: " . $create->status() . "\n";
echo "Body: " . $create->body() . "\n";
