<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$alaa = \App\Models\User::where('name', 'alaa')->first();
if ($alaa) {
    echo "User alaa ID: " . $alaa->id . PHP_EOL;
    $orders = \App\Models\Order::where('assigned_to', $alaa->id)->where('status', 'new')->get();
    echo "New orders count for alaa: " . $orders->count() . PHP_EOL;
    foreach($orders as $o) {
        echo "Order #$o->id created_at: $o->created_at" . PHP_EOL;
    }
} else {
    echo "User alaa not found" . PHP_EOL;
}
