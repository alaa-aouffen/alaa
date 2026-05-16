<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$o = \App\Models\Order::find(158);
if ($o) {
    echo "Order #158 created_at: " . $o->created_at . PHP_EOL;
} else {
    echo "Order #158 not found" . PHP_EOL;
}
