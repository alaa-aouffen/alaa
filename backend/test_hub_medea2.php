<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$token = config('zrexpress.token');
$tenantId = config('zrexpress.tenant_id');

$res = Http::withoutVerifying()->withHeaders([
    'X-Api-Key' => $token, 'X-Tenant' => $tenantId, 'Accept' => 'application/json'
])->post("https://api.zrexpress.app/api/v1/hubs/search", [
    'page' => 1,
    'pageSize' => 100
]);
$hubs = $res->json()['items'] ?? [];
$medeaHub = null;
foreach($hubs as $hub) {
    if (strpos(strtolower($hub['name']), 'medea') !== false || strpos(strtolower($hub['address']['city']), 'medea') !== false) {
        $medeaHub = $hub;
        break;
    }
}
if ($medeaHub) {
    echo "Found Medea Hub: " . $medeaHub['id'] . " - " . $medeaHub['name'] . "\n";
} else {
    echo "No Medea hub found. Showing all cities:\n";
    foreach($hubs as $hub) {
        echo $hub['address']['city'] . ", ";
    }
}
