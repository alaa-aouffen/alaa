<?php

use App\Models\Order;
use App\Services\ZRExpressService;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$orderId = 70; // Hakima order which was failing
$order = Order::find($orderId);

if (!$order) {
    echo "Order $orderId not found.\n";
    exit;
}

echo "Testing shipment for Order: $orderId - {$order->customer_name}\n";
echo "Phone in DB: {$order->customer_phone}\n";

$service = new ZRExpressService();

try {
    $result = $service->createShipment($order);
    echo "Success!\n";
    echo "Tracking Number: " . $result['tracking_number'] . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
