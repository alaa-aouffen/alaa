<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$token = config('zrexpress.token');
$tenantId = config('zrexpress.tenant_id');

$res = Http::withoutVerifying()->withHeaders([
    'X-Api-Key' => $token, 'X-Tenant' => $tenantId, 'Accept' => 'application/json'
])->post("https://api.zrexpress.app/api/v1/hubs/search", [
    'keyword' => 'Medea',
    'page' => 1,
    'pageSize' => 5
]);
echo "Search with keyword Medea:\n";
$hubs = $res->json()['items'] ?? [];
foreach($hubs as $hub) {
    echo $hub['id'] . " - " . $hub['name'] . " - CityID: " . $hub['address']['cityTerritoryId'] . "\n";
}
