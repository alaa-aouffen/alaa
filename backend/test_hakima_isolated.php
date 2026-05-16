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

$hakimaPhone = '+213755432187';

echo "Testing Hakima Phone with Bouira Territories (Validated IDs):\n";
$r = zrRequest('POST', 'https://api.zrexpress.app/api/v1/customers/individual', [
    'name'  => 'Hakima Test Bouira',
    'phone' => ['number1' => $hakimaPhone],
    'addresses' => [
        [
            'city'                => 'Bouira',
            'cityTerritoryId'     => 'a1f0229c-4f34-40aa-9238-fadde6757cba',
            'district'            => 'Bechloul',
            'districtTerritoryId' => 'a4bab5b1-7e6e-479d-b9a7-548a8061b3a6',
            'country'             => 'Algeria',
            'street'              => 'N/A',
            'isPrimary'           => true
        ]
    ]
], $headers);

echo "Status: " . $r['status'] . "\n";
echo "Response: " . $r['raw'] . "\n";
