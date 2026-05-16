<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$hubs = [
    [
        "id" => "2cf061b2-c846-4939-b70d-6180f5c24a78",
        "name" => "Tri Tipaza",
        "isPickupPoint" => false,
        "address" => ["districtTerritoryId" => "3b0d300d-a978-462e-9ea5-92bd6bb74567"]
    ],
    [
        "id" => "63681fd2-4545-4376-b2da-9c1679316b10",
        "name" => "Hub Tipaza",
        "isPickupPoint" => true,
        "address" => ["districtTerritoryId" => "3b0d300d-a978-462e-9ea5-92bd6bb74567"]
    ]
];

$territories = [
    "districtId" => "3b0d300d-a978-462e-9ea5-92bd6bb74567",
    "cityId" => "1435179a-6dbb-4d9c-a186-c521b2a57319"
];

$hub = collect($hubs)
    ->filter(fn($h) => ($h['isPickupPoint'] ?? false) === true)
    ->first(function($h) use ($territories) {
        return ($h['address']['districtTerritoryId'] ?? '') === $territories['districtId']
            || ($h['address']['cityTerritoryId'] ?? '') === $territories['cityId'];
    });

echo "Selected Hub: " . ($hub['name'] ?? 'None') . " (ID: " . ($hub['id'] ?? 'N/A') . ")\n";
if (($hub['id'] ?? '') === "63681fd2-4545-4376-b2da-9c1679316b10") {
    echo "SUCCESS: Correct hub selected.\n";
} else {
    echo "FAILURE: Incorrect hub selected.\n";
}
