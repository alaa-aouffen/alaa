<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$order = \App\Models\Order::first();
if ($order) {
    $agent = $order->agent;
    echo json_encode([
        'order_id' => $order->id,
        'agent' => $agent ? $agent->name : null,
        'account' => ($agent && $agent->zrExpressAccount) ? $agent->zrExpressAccount->name : null
    ]);
} else {
    echo "No orders found.";
}
