<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$o = \App\Models\Order::latest()->first();
echo "Latest order ID: " . $o->id . PHP_EOL;
echo "Created At: " . $o->created_at . PHP_EOL;
