<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ZRExpressWebhookController extends Controller
{
    /**
     * Handle incoming webhooks from ZR Express (via Svix).
     */
    public function handle(Request $request)
    {
        // Security: Verify Svix Signature
        $secret = 'whsec_V2FpeMcoeiqdcfr/5nfhAsEq47CFbmsQ';
        $signature = $request->header('svix-signature');
        $timestamp = $request->header('svix-timestamp');
        $msgId = $request->header('svix-id');

        if (!$signature || !$timestamp || !$msgId) {
            Log::warning('ZR Express Webhook: Missing security headers');
            return response()->json(['message' => 'Missing headers'], 401);
        }

        // Ideally we should use the Svix library or manual HMAC check here.
        // For now, we log the attempts. In production, we'll enforce strict HMAC verification.
        
        $payload = $request->all();
        $eventType = $payload['eventType'] ?? null;
        $data = $payload['data'] ?? [];

        Log::info('ZR Express Webhook Received', [
            'type' => $eventType,
            'trackingNumber' => $data['trackingNumber'] ?? 'N/A'
        ]);

        // Process only parcel state updates
        if ($eventType === 'parcel.state.updated' && !empty($data['trackingNumber'])) {
            $trackingNumber = $data['trackingNumber'];
            $newState = $data['currentState']['stateName'] ?? $data['stateName'] ?? 'Inconnu';

            // Find the order by tracking number
            $order = Order::where('tracking_number', $trackingNumber)->first();

            if ($order) {
                $order->update([
                    'shipping_status' => $newState
                ]);
                
                Log::info("Order #{$order->id} updated via Webhook: {$newState}");
                return response()->json(['message' => 'Status updated'], 200);
            }

            Log::warning("Webhook received for unknown tracking number: {$trackingNumber}");
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json(['message' => 'Event ignored'], 200);
    }
}
