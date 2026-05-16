<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test creating order 82 via ZR
$zr = app(\App\Services\ZRExpressService::class);
$order = \App\Models\Order::find(82);
if ($order) {
    try {
        echo "Trying delivery_type: " . $order->delivery_type . "\n";
        $res = $zr->createShipment($order);
        echo "Success: " . json_encode($res) . "\n";
    } catch (\Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
} else {
    echo "Order 82 not found.\n";
}
