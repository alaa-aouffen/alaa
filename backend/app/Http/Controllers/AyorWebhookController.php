<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Order;

class AyorWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        Log::info('Ayor Webhook Received', ['payload' => $request->all()]);

        // Ayor sends messages via a Pub/Sub like wrapper.
        // We look for message.data which is base64 encoded JSON.
        
        $messageData = $request->input('message.data');
        
        if (!$messageData) {
            // Not a valid Ayor webhook or missing data
            return response()->json(['status' => 'error', 'message' => 'Missing message data'], 400);
        }
        
        // Decode the base64 string
        $decodedJson = base64_decode($messageData);
        $payload = json_decode($decodedJson, true);
        
        if (!$payload || !isset($payload['data'])) {
            return response()->json(['status' => 'error', 'message' => 'Invalid JSON payload'], 400);
        }

        Log::info('AYOR_RAW_PAYLOAD: ' . json_encode($payload));
        
        // Check if it's an order created event
        if ($payload['event_type'] !== 'order.created') {
            return response()->json(['status' => 'ignored', 'message' => 'Not an order.created event']);
        }
        
        $orderData = $payload['data'];
        
        // Check if order already exists to prevent duplicates
        if (Order::where('ayor_order_id', $orderData['order_id'])->exists()) {
            return response()->json(['status' => 'success', 'message' => 'Order already exists']);
        }
        
        // Extract client info
        $clientInfo = $orderData['client_info'] ?? [];
        $wilaya = $clientInfo['state'] ?? $clientInfo['wilaya'] ?? 'Inconnue';
        $commune = $clientInfo['city'] ?? $clientInfo['commune'] ?? $clientInfo['town'] ?? null;

        // Extract delivery type using Ayor's 'is_stop_desk' field
        $isStopDesk = $orderData['is_stop_desk'] ?? false;
        $deliveryType = $isStopDesk ? 'pickup-point' : 'home';
        
        // Combine product names
        $orderLines = $orderData['order_lines'] ?? [];
        $productNames = [];
        $totalQuantity = 0;
        $unitPrice = 0;
        
        foreach ($orderLines as $line) {
            $productNames[] = $line['product_name'] . ($line['quantity'] > 1 ? ' (x' . $line['quantity'] . ')' : '');
            $totalQuantity += $line['quantity'];
            
            if ($unitPrice === 0) {
                // Take the unit price of the first item as a reference
                $unitPrice = $line['reduced_price'] ?? $line['unit_price'] ?? 0;
            }
        }
        
        $productNameString = !empty($productNames) ? implode(', ', $productNames) : 'Produit inconnu';
        
        // --- SMART ROUTING LOGIC ---
        $categoryId = null;
        $assignedTo = null;
        
        // Fetch all categories
        $categories = \App\Models\Category::all();
        
        foreach ($categories as $category) {
            if (empty($category->keywords)) continue;
            
            $keywords = array_map('trim', explode(',', $category->keywords));
            
            foreach ($keywords as $keyword) {
                // Remove empty keywords to avoid matching everything
                if (empty($keyword)) continue;
                
                if (stripos($productNameString, $keyword) !== false) {
                    $categoryId = $category->id;
                    $assignedTo = $category->user_id;
                    break 2; // Break both loops since we found a match
                }
            }
        }
        
        // If no keyword match, assign to the first admin fallback
        if (!$assignedTo) {
            $admin = \App\Models\User::where('role', 'admin')->where('is_active', true)->first() ?? \App\Models\User::where('role', 'admin')->first();
            if ($admin) {
                $assignedTo = $admin->id;
            }
        }
        // --- END SMART ROUTING ---
        
        // Create the order
        $order = Order::create([
            'customer_name' => $clientInfo['full_name'] ?? 'Client Ayor',
            'customer_phone' => $clientInfo['phone_number'] ?? '',
            'wilaya' => $wilaya,
            'commune' => $commune,
            'address' => $clientInfo['address'] ?? null,
            'product_name' => $productNameString,
            'quantity' => $totalQuantity > 0 ? $totalQuantity : 1,
            'unit_price' => $unitPrice,
            'total_price' => $orderData['total_price'] ?? 0,
            'status' => 'new',
            'ayor_order_id' => $orderData['order_id'],
            'category_id' => $categoryId,
            'assigned_to' => $assignedTo,
            'delivery_type' => $deliveryType,
        ]);
        
        Log::info('Ayor Webhook Processed: Order ID ' . $order->id . ' created from Ayor Order ' . $orderData['order_id']);

        return response()->json(['status' => 'success', 'message' => 'Order created successfully', 'order_id' => $order->id]);
    }
}
