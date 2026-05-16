<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = \App\Models\User::all(['name', 'role']);
foreach($users as $u) {
    echo $u->name . ' : ' . $u->role . PHP_EOL;
}
