<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    /**
     * List orders — admins see all, agents see only assigned.
     */
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();

        $query = Order::with(['agent:id,name,email', 'category'])
            ->orderBy('created_at', 'desc');

        if ($user->isAgent()) {
            $query->where('assigned_to', $user->id);
            
            // Filter postponed orders: only show if postponed_date is today or in the past
            $query->where(function ($q) {
                $q->where('status', '!=', 'postponed')
                  ->orWhereNull('postponed_date')
                  ->orWhere('postponed_date', '<=', now()->toDateString());
            });
            
            // Apply delay filter
            $delay = (int) \App\Models\Setting::get('order_processing_delay_days', 0);
            if ($delay > 0) {
                $thresholdDate = now()->subDays($delay - 1)->startOfDay();
                $query->where('created_at', '<', $thresholdDate);
            }
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('wilaya')) {
            $query->where('wilaya', $request->wilaya);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('customer_name', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_phone', 'like', '%' . $request->search . '%')
                  ->orWhere('tracking_number', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->filled('product_name')) {
            $query->where('product_name', $request->product_name);
        }
        if ($request->filled('start_date')) {
            $query->where('created_at', '>=', \Carbon\Carbon::parse($request->start_date)->startOfDay());
        }
        if ($request->filled('end_date')) {
            $query->where('created_at', '<=', \Carbon\Carbon::parse($request->end_date)->endOfDay());
        }

        $orders = $query->paginate($request->get('per_page', 20));

        return response()->json($orders);
    }

    /**
     * Create a new order (admin only).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name'  => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'wilaya'         => 'required|string|max:100',
            'commune'        => 'nullable|string|max:100',
            'address'        => 'nullable|string',
            'product_name'   => 'required|string|max:255',
            'quantity'       => 'required|integer|min:1',
            'unit_price'     => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        $data['total_price'] = $request->quantity * $request->unit_price;

        $order = Order::create($data);

        return response()->json($order, 201);
    }

    /**
     * Show a single order with its call logs.
     */
    public function show(Order $order)
    {
        $order->load(['agent:id,name,email', 'callLogs.agent:id,name']);
        return response()->json($order);
    }

    /**
     * Update an order.
     */
    public function update(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'customer_name'  => 'sometimes|string|max:255',
            'customer_phone' => 'sometimes|string|max:20',
            'wilaya'         => 'sometimes|string|max:100',
            'commune'        => 'nullable|string|max:100',
            'address'        => 'nullable|string',
            'product_name'   => 'sometimes|string|max:255',
            'quantity'       => 'sometimes|integer|min:1',
            'unit_price'     => 'sometimes|numeric|min:0',
            'status'         => 'sometimes|in:new,assigned,in_progress,confirmed,cancelled,postponed,not_reachable,delivered,returned,shipped',
            'delivery_type'  => 'sometimes|in:home,pickup-point',
            'stopdesk_id'    => 'nullable|string',
            'assigned_to'    => 'nullable|exists:users,id',
            'notes'          => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Recalculate total if price/qty changes
        if ($request->filled('quantity') || $request->filled('unit_price')) {
            $qty   = $request->get('quantity', $order->quantity);
            $price = $request->get('unit_price', $order->unit_price);
            $request->merge(['total_price' => $qty * $price]);
        }

        // Auto-set status to assigned when assigning an agent
        if ($request->filled('assigned_to') && $order->status === 'new') {
            $request->merge(['status' => 'assigned']);
        }

        $order->update($request->all());

        return response()->json($order->fresh(['agent:id,name,email']));
    }

    /**
     * Send order to ZR Express shipping.
     */
    public function sendToShipping(Order $order, \App\Services\ZRExpressService $zrService)
    {
        // 1. Safety checks
        if ($order->tracking_number) {
            return response()->json(['message' => 'Cette commande a déjà été envoyée à la livraison.', 'tracking_number' => $order->tracking_number], 422);
        }

        if (empty($order->customer_phone) || (empty($order->address) && empty($order->wilaya))) {
            return response()->json(['message' => 'Le numéro de téléphone et la destination (Wilaya/Adresse) sont obligatoires pour l\'expédition.'], 422);
        }

        // Save delivery_type, stopdesk_id, and final_price if provided in request
        $deliveryType = request()->input('delivery_type', $order->delivery_type ?? 'home');
        $updates = [];

        if (in_array($deliveryType, ['home', 'pickup-point'])) {
            $updates['delivery_type'] = $deliveryType;
            if ($deliveryType === 'pickup-point' && request()->has('stopdesk_id')) {
                $updates['stopdesk_id'] = request()->input('stopdesk_id');
            }
        }

        if (request()->has('final_price') && request()->input('final_price') !== null) {
            $updates['total_price'] = request()->input('final_price');
        }

        if (!empty($updates)) {
            $order->update($updates);
        }

        try {
            // 2. Call Service — pass the chosen delivery type
            $result = $zrService->createShipment($order);

            if ($result['success']) {
                // 3. Update Order
                $order->update([
                    'tracking_number'  => $result['tracking_number'],
                    'shipping_company' => 'ZR Express',
                    'status'           => 'shipped',
                    'shipping_status'  => 'En attente d\'expédition'
                ]);

                return response()->json([
                    'message' => 'Commande envoyée avec succès à ZR Express.',
                    'tracking_number' => $order->tracking_number,
                    'order' => $order
                ]);
            }

            return response()->json(['message' => 'L\'envoi à ZR Express a échoué.'], 500);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur API: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Sync shipping status with ZR Express.
     */
    public function syncShippingStatus(Order $order, \App\Services\ZRExpressService $zrService)
    {
        if (!$order->tracking_number) {
            return response()->json(['message' => 'Aucun numéro de suivi pour cette commande.'], 422);
        }

        try {
            $statusData = $zrService->getReceipt($order->tracking_number, $order);

            if ($statusData && isset($statusData['data'])) {
                $updates = [
                    'shipping_status' => $statusData['status']
                ];

                // If we currently have a GUID as tracking_number, and the API returns a real trackingNumber, update it
                if (strlen($order->tracking_number) > 20 && isset($statusData['data']['trackingNumber'])) {
                    $updates['tracking_number'] = $statusData['data']['trackingNumber'];
                }

                $order->update($updates);

                return response()->json([
                    'message' => 'Statut synchronisé.',
                    'status' => $statusData['status'],
                    'tracking_number' => $order->tracking_number
                ]);
            }

            return response()->json(['message' => 'Impossible de récupérer le statut.'], 500);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get shipping history from ZR Express.
     */
    public function shippingHistory(Order $order, \App\Services\ZRExpressService $zrService)
    {
        if (!$order->tracking_number) {
            return response()->json([]);
        }

        $history = $zrService->getHistory($order->tracking_number, $order);
        return response()->json(['history' => $history]);
    }

    /**
     * Delete multiple orders (admin only).
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array',
            'order_ids.*' => 'exists:orders,id'
        ]);

        $count = Order::whereIn('id', $request->order_ids)->delete();

        return response()->json([
            'message' => "{$count} commandes supprimées avec succès."
        ]);
    }

    /**
     * Delete an order (admin only).
     */
    public function destroy(Order $order)
    {
        $order->delete();
        return response()->json(['message' => 'Commande supprimée.']);
    }
    /**
     * Get available hubs for an order's destination.
     */
    public function getAvailableHubs(Order $order, \App\Services\ZRExpressService $zrService)
    {
        try {
            $hubs = $zrService->getAvailableHubs($order);
            return response()->json($hubs);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }
}
