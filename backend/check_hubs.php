<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$token = '3g33Bc7DaAIxsARUFa5Be82SMDbwZiTJgcDMkoda0dAtxGjfelCxj9oONJxO1e0I';
$tenant = 'a60b64cc-487e-424e-a142-5671185a1827';
$baseUrl = 'https://api.zrexpress.app';

$response = Illuminate\Support\Facades\Http::withoutVerifying()
    ->withHeaders([
        'X-Api-Key' => $token,
        'X-Tenant' => $tenant,
        'Accept' => 'application/json',
    ])
    ->post("{$baseUrl}/api/v1/hubs/search", [
        'page' => 1,
        'pageSize' => 100
    ]);

if ($response->successful()) {
    $hubs = $response->json()['items'] ?? [];
    echo "Hubs found: " . count($hubs) . "\n";
    foreach ($hubs as $hub) {
        $dist = $hub['address']['district'] ?? 'N/A';
        $city = $hub['address']['city'] ?? 'N/A';
        echo "- {$hub['name']} (ID: {$hub['id']}, District: {$dist}, City: {$city}, Type: " . ($hub['type'] ?? 'N/A') . ")\n";
    }
} else {
    echo "Error: " . $response->status() . " " . $response->body() . "\n";
}
