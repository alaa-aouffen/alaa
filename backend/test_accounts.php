<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$accounts = \App\Models\ZrExpressAccount::all();
echo "Accounts:\n";
foreach ($accounts as $account) {
    echo "- {$account->name} (Tenant: {$account->tenant_id})\n";
}

$agents = \App\Models\User::whereNotNull('zr_express_account_id')->with('zrExpressAccount')->get();
echo "\nAgents with accounts:\n";
foreach ($agents as $agent) {
    echo "- {$agent->name} -> Sub-Account: {$agent->zrExpressAccount->name} (Tenant: {$agent->zrExpressAccount->tenant_id})\n";
}
