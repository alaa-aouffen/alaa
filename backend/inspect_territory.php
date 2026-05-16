<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;

$baseUrl = config('zrexpress.base_url');
$token = config('zrexpress.token');
$tenantId = config('zrexpress.tenant_id');

$headers = [
    'X-Api-Key' => $token,
    'X-Tenant'  => $tenantId,
    'Accept'    => 'application/json',
];

// Search for a wilaya (e.g. Oran) to see the territory object structure
$res = Http::withoutVerifying()->withHeaders($headers)->post($baseUrl . '/api/v1/territories/search', [
    'keyword' => 'Oran',
    'page' => 1,
    'pageSize' => 5
]);

echo "Territories Search Response:\n";
echo json_encode($res->json(), JSON_PRETTY_PRINT) . "\n";
