<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SyncShipments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'shipments:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize shipment statuses from ZR Express API';

    /**
     * Execute the console command.
     */
    public function handle(\App\Services\ZRExpressService $zrService)
    {
        $this->info('Starting shipment sync...');

        // Fetch orders that are shipped but not yet delivered/returned
        $orders = \App\Models\Order::whereNotNull('tracking_number')
            ->where('shipping_company', 'ZR Express')
            ->whereNotIn('status', ['delivered', 'returned', 'cancelled'])
            ->get();

        if ($orders->isEmpty()) {
            $this->info('No orders to sync.');
            return;
        }

        foreach ($orders as $order) {
            $this->info("Checking order #{$order->id} (Tracking: {$order->tracking_number})");

            $receipt = $zrService->getReceipt($order->tracking_number);

            if ($receipt && isset($receipt['status'])) {
                $newStatus = $receipt['status']; // API returns status string

                // Map ZR status to our system status if needed
                // For now, update shipping_status field
                $order->update(['shipping_status' => $newStatus]);

                // Auto-update order status if delivered
                if (stripos($newStatus, 'delivered') !== false || stripos($newStatus, 'livré') !== false) {
                    $order->update(['status' => 'delivered']);
                }

                $this->info("Updated status to: {$newStatus}");
            } else {
                $this->warn("Could not fetch status for order #{$order->id}");
            }
        }

        $this->info('Sync completed.');
    }
}
