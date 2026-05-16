<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "PHP now: " . now()->toDateTimeString() . PHP_EOL;
echo "PHP startOfDay: " . now()->subDays(0)->startOfDay()->toDateTimeString() . PHP_EOL;

$dbTime = \Illuminate\Support\Facades\DB::select("SELECT NOW() as now")[0]->now;
echo "DB now: " . $dbTime . PHP_EOL;

$firstOrder = \App\Models\Order::orderBy('created_at', 'desc')->first();
if ($firstOrder) {
    echo "First Order ID: " . $firstOrder->id . PHP_EOL;
    echo "First Order created_at: " . $firstOrder->created_at . PHP_EOL;
}
