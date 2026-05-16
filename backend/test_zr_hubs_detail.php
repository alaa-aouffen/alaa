<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$token = config('zrexpress.token');
$tenantId = config('zrexpress.tenant_id');

$res = Http::withoutVerifying()->withHeaders([
    'X-Api-Key' => $token, 'X-Tenant' => $tenantId, 'Accept' => 'application/json'
])->post("https://api.zrexpress.app/api/v1/hubs/search", [
    'territoryId' => '0e0f2d43-6d78-47dd-8bb7-0f2771cb97ff',
    'page' => 1,
    'pageSize' => 5
]);
echo "Status: " . $res->status() . "\n";
print_r($res->json());
