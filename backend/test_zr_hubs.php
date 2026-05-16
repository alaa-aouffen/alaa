<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$token = config('zrexpress.token');
$tenantId = config('zrexpress.tenant_id');

$endpoints = [
    '/api/v1/offices',
    '/api/v1/pickup-points',
    '/api/v1/agencies',
    '/api/v1/desks',
    '/api/v1/stopdesks',
    '/api/v1/hubs/search' // with empty post
];

foreach ($endpoints as $ep) {
    if (strpos($ep, 'search') !== false) {
        $res = Http::withoutVerifying()->withHeaders([
            'X-Api-Key' => $token, 'X-Tenant' => $tenantId, 'Accept' => 'application/json'
        ])->post("https://api.zrexpress.app" . $ep, ['page'=>1, 'pageSize'=>5]);
    } else {
        $res = Http::withoutVerifying()->withHeaders([
            'X-Api-Key' => $token, 'X-Tenant' => $tenantId, 'Accept' => 'application/json'
        ])->get("https://api.zrexpress.app" . $ep);
    }
    echo "Endpoint: $ep => Status: " . $res->status() . "\n";
}
