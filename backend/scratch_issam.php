<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$issam = \App\Models\User::where('name', 'issam')->first();
if ($issam) {
    echo "User issam ID: " . $issam->id . PHP_EOL;
    $orders = \App\Models\Order::where('assigned_to', $issam->id)->where('status', 'new')->get();
    echo "New orders count for issam: " . $orders->count() . PHP_EOL;
}
