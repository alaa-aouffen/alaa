<?php
$apiKey   = '3g33Bc7DaAIxsARUFa5Be82SMDbwZiTJgcDMkoda0dAtxGjfelCxj9oONJxO1e0I';
$tenantId = 'ce8a721c-6b7f-47e2-884a-3bac69951bc2';
$headers = [
    "X-Api-Key: $apiKey",
    "X-Tenant: $tenantId",
    'Accept: application/json',
    'Content-Type: application/json'
];

function zrRequest($method, $url, $headers, $payload = null) {
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

$trackingNumber = '70cca006-7f18-42a9-a726-5b54b2924003';

echo "\nFetching active parcel for $trackingNumber\n";
$r = zrRequest('GET', "https://api.zrexpress.app/api/v1/parcels/{$trackingNumber}", $headers);

echo "Status: " . $r['status'] . "\n";
echo "Response:\n";
print_r($r['body']);
