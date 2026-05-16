<?php
$apiKey   = '3g33Bc7DaAIxsARUFa5Be82SMDbwZiTJgcDMkoda0dAtxGjfelCxj9oONJxO1e0I';
$tenantId = 'ce8a721c-6b7f-47e2-884a-3bac69951bc2';
$headers = [
    "X-Api-Key: $apiKey",
    "X-Tenant: $tenantId",
    'Accept: application/json',
    'Content-Type: application/json'
];

function zrRequest($method, $url, $payload, $headers) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    if ($payload) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    $resp = curl_exec($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);
    return ['status' => $info['http_code'], 'body' => json_decode($resp, true), 'raw' => $resp];
}

$testPhones = [
    '+213755432187', // International avec +
    '0755432187',    // Local
    '213755432187',  // International sans +
];

foreach ($testPhones as $phone) {
    echo "Testing phone: $phone\n";
    $r = zrRequest('POST', 'https://api.zrexpress.app/api/v1/customers/individual', [
        'name'  => 'Test Phone ' . $phone,
        'phone' => ['number1' => $phone],
        'addresses' => [
            [
                'city'                => 'Blida',
                'cityTerritoryId'     => 'a7e764cf-e9ca-4c1f-8232-89852d102aec',
                'district'            => 'Bouinan',
                'districtTerritoryId' => '6460f5c7-299f-4fa7-bcd3-6c539eba39a8',
                'country'             => 'Algeria',
                'street'              => 'N/A',
                'isPrimary'           => true
            ]
        ]
    ], $headers);
    echo "Status: " . $r['status'] . "\n";
    echo "Response: " . $r['raw'] . "\n\n";
}
