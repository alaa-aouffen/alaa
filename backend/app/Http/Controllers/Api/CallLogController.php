<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CallLog;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CallLogController extends Controller
{
    /**
     * Log a call attempt for an order.
     * Automatically updates order status based on result.
     */
    public function store(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'result' => 'required|in:answered,not_reachable,confirmed,cancelled,postponed,wrong_number',
            'notes'  => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        /** @var \App\Models\User $agent */
        $agent = Auth::guard('api')->user();

        $log = CallLog::create([
            'order_id'  => $order->id,
            'agent_id'  => $agent->id,
            'result'    => $request->result,
            'notes'     => $request->notes,
            'called_at' => now(),
        ]);

        // Map call result → order status
        $statusMap = [
            'confirmed'     => 'confirmed',
            'cancelled'     => 'cancelled',
            'postponed'     => 'postponed',
            'not_reachable' => 'not_reachable',
            'answered'      => 'in_progress',
            'wrong_number'  => 'in_progress',
        ];

        $order->increment('call_attempts');
        $order->update(['status' => $statusMap[$request->result]]);

        return response()->json([
            'call_log' => $log->load('agent:id,name'),
            'order'    => $order->fresh(),
        ], 201);
    }

    /**
     * Get all call logs for a specific order.
     */
    public function index(Order $order)
    {
        $logs = $order->callLogs()
            ->with('agent:id,name')
            ->orderBy('called_at', 'desc')
            ->get();

        return response()->json($logs);
    }
}
