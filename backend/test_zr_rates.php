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

$urls = [
    '/api/v1/rates',
    '/api/v1/pricing',
    '/api/v1/fees',
    '/api/v1/tariffs'
];

foreach ($urls as $url) {
    echo "Testing $url...\n";
    $res = Http::withoutVerifying()->withHeaders($headers)->get($baseUrl . $url);
    echo "Status: " . $res->status() . "\n";
    if ($res->successful()) {
        echo "Body: " . substr($res->body(), 0, 200) . "\n";
    }
}
