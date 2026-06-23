<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CallLog;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var User $user */
        $user = Auth::guard('api')->user();

        // Generate a cache key based on the user ID and all request parameters
        $cacheKey = 'dashboard_stats_user_' . $user->id . '_' . md5(json_encode(request()->all()));

        // Cache the dashboard for 60 seconds (1 minute) to avoid high DB latency
        return \Illuminate\Support\Facades\Cache::remember($cacheKey, 60, function () use ($user) {
            if ($user->isAdmin()) {
                return $this->adminStats();
            }
            return $this->agentStats($user);
        });
    }

    private function adminStats()
    {
        $request = request();
        $dateFilter = $request->input('date') ? \Carbon\Carbon::parse($request->input('date')) : \Carbon\Carbon::today();
        
        $wilayaStartDate = $request->input('wilaya_start') ? \Carbon\Carbon::parse($request->input('wilaya_start'))->startOfDay() : \Carbon\Carbon::now()->subDays(7)->startOfDay();
        $wilayaEndDate = $request->input('wilaya_end') ? \Carbon\Carbon::parse($request->input('wilaya_end'))->endOfDay() : \Carbon\Carbon::now()->endOfDay();

        // Status breakdown filter — default to today
        $statusStartDate = $request->input('status_start') ? \Carbon\Carbon::parse($request->input('status_start'))->startOfDay() : \Carbon\Carbon::today()->startOfDay();
        $statusEndDate   = $request->input('status_end')   ? \Carbon\Carbon::parse($request->input('status_end'))->endOfDay()   : \Carbon\Carbon::today()->endOfDay();

        $totalOrders   = Order::count();
        $totalAgents   = User::where('role', 'agent')->where('is_active', true)->count();
        $totalCalls    = CallLog::count();
        
        // Stats for selected date (agents/products panel)
        $ordersToday = Order::whereDate('created_at', $dateFilter)->count();
        $confirmedToday = Order::where('status', 'confirmed')->whereDate('updated_at', $dateFilter)->count();
        $callsToday = CallLog::whereDate('called_at', $dateFilter)->count();

        // Orders by status breakdown — filtered by status date range
        $byStatus = Order::select('status', DB::raw('count(*) as count'))
            ->whereBetween('created_at', [$statusStartDate, $statusEndDate])
            ->groupBy('status')
            ->pluck('count', 'status');

        $statusTotal    = $byStatus->sum();
        $newOrders      = $byStatus->get('new', 0);
        $confirmedOrders = $byStatus->get('confirmed', 0);
        $cancelledOrders = $byStatus->get('cancelled', 0);
        $deliveredOrders = $byStatus->get('delivered', 0);

        $confirmationRate = $statusTotal > 0
            ? round(($confirmedOrders / $statusTotal) * 100, 1)
            : 0;

        // Orders by wilaya (top 10) with confirmation counts within selected period
        $byWilaya = Order::select('wilaya', 
                DB::raw('count(*) as count'),
                DB::raw('sum(case when status = "confirmed" then 1 else 0 end) as confirmed_count')
            )
            ->whereBetween('created_at', [$wilayaStartDate, $wilayaEndDate])
            ->groupBy('wilaya')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Top performing agents (Selected Date)
        $topAgents = User::where('role', 'agent')
            ->withCount([
                'callLogs as calls_today' => function ($q) use ($dateFilter) {
                    $q->whereDate('called_at', $dateFilter);
                },
                'assignedOrders as confirmed_today' => function ($q) use ($dateFilter) {
                    $q->where('status', 'confirmed')
                      ->whereDate('updated_at', $dateFilter);
                },
                'assignedOrders as shipped_today' => function ($q) use ($dateFilter) {
                    $q->where('status', 'shipped')
                      ->whereDate('updated_at', $dateFilter);
                }
            ])
            ->orderBy('confirmed_today', 'desc')
            ->orderBy('calls_today', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email']);

        // Orders by product for selected date (grouping variations like (x2))
        $ordersTodayForProducts = Order::whereDate('created_at', $dateFilter)
            ->get(['product_name']);
            
        $byProductToday = $ordersTodayForProducts->groupBy(function($order) {
            // Remove (x2), (x3) etc., " - Copy 1", and trailing/leading spaces
            $cleanName = preg_replace('/(?:\s*\(x\d+\))|(?:\s*-\s*Copy\s*\d*)/i', '', $order->product_name);
            return trim($cleanName);
        })->map(function($group, $name) {
            return [
                'product_name' => $name,
                'count' => $group->count()
            ];
        })->sortByDesc('count')->values();

        return response()->json([
            'total_orders'      => $totalOrders,
            'new_orders'        => $newOrders,
            'confirmed_orders'  => $confirmedOrders,
            'cancelled_orders'  => $cancelledOrders,
            'delivered_orders'  => $deliveredOrders,
            'status_total'      => $statusTotal,
            'total_agents'      => $totalAgents,
            'total_calls'       => $totalCalls,
            'confirmation_rate' => $confirmationRate,
            'by_status'         => $byStatus,
            'by_wilaya'         => $byWilaya,
            'top_agents'        => $topAgents,
            'by_product_today'  => $byProductToday,
            'orders_today'      => $ordersToday,
            'confirmed_today'   => $confirmedToday,
            'calls_today'       => $callsToday,
            'confirmation_rate_today' => $ordersToday > 0 ? round(($confirmedToday / $ordersToday) * 100, 1) : 0,
        ]);
    }

    private function agentStats(User $user)
    {
        $delay = (int) \App\Models\Setting::get('order_processing_delay_days', 0);
        $thresholdDate = $delay > 0 ? now()->subDays($delay - 1)->startOfDay() : null;

        $assignedQuery = Order::where('assigned_to', $user->id);
        $confirmedQuery = Order::where('assigned_to', $user->id)->where('status', 'confirmed');
        $cancelledQuery = Order::where('assigned_to', $user->id)->where('status', 'cancelled');
        
        if ($thresholdDate) {
            $assignedQuery->where('created_at', '<', $thresholdDate);
            $confirmedQuery->where('created_at', '<', $thresholdDate);
            $cancelledQuery->where('created_at', '<', $thresholdDate);
        }

        $assignedOrders  = $assignedQuery->count();
        $confirmedOrders = $confirmedQuery->count();
        $cancelledOrders = $cancelledQuery->count();
        
        $pendingQuery = Order::where('assigned_to', $user->id)
            ->whereIn('status', ['assigned', 'in_progress', 'new']);
            
        if ($thresholdDate) {
            $pendingQuery->where('created_at', '<', $thresholdDate);
        }
        
        $pendingOrders = $pendingQuery->count();
        $totalCalls = CallLog::where('agent_id', $user->id)->count();
        
        $confirmationRate = $assignedOrders > 0
            ? round(($confirmedOrders / $assignedOrders) * 100, 1)
            : 0;

        // Show only new orders (Ayor/Smart Routing) that passed the delay
        $pendingListQuery = Order::where('assigned_to', $user->id)
            ->where('status', 'new');
            
        if ($thresholdDate) {
            $pendingListQuery->where('created_at', '<', $thresholdDate);
        }

        $pendingList = $pendingListQuery->orderBy('created_at', 'desc')
            ->get(['id', 'customer_name', 'customer_phone', 'wilaya', 'status', 'call_attempts', 'created_at']);

        return response()->json([
            'assigned_orders'   => $assignedOrders,
            'confirmed_orders'  => $confirmedOrders,
            'cancelled_orders'  => $cancelledOrders,
            'pending_orders'    => $pendingOrders,
            'total_calls'       => $totalCalls,
            'confirmation_rate' => $confirmationRate,
            'pending_list'      => $pendingList,
        ]);
    }
}
