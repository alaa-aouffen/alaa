<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CallLogController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\TerritoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ZrExpressAccountController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AyorWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Call Center Order Management System
|--------------------------------------------------------------------------
| Prefix: /api/v1
| Auth: JWT via guard:api
*/

Route::prefix('v1')->group(function () {

    // ─── Health check (no DB required) ───────────────────────────────
    Route::get('health', function () {
        return response()->json(['status' => 'ok', 'timestamp' => now()]);
    });

    // ─── DB debug (temporary) ─────────────────────────────────────────
    Route::get('db-debug', function () {
        try {
            \DB::connection()->getPdo();
            $tables = \DB::select('SHOW TABLES');
            return response()->json([
                'status' => 'connected',
                'host' => env('DB_HOST') ?: env('MYSQLHOST') ?: 'N/A',
                'database' => env('DB_DATABASE') ?: env('MYSQLDATABASE') ?: 'N/A',
                'tables_count' => count($tables),
                'DATABASE_URL_set' => !empty(env('DATABASE_URL')),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'host' => env('DB_HOST') ?: env('MYSQLHOST') ?: 'N/A',
                'database' => env('DB_DATABASE') ?: env('MYSQLDATABASE') ?: 'N/A',
                'DATABASE_URL_set' => !empty(env('DATABASE_URL')),
            ], 500);
        }
    });

    // ─── Public routes ───────────────────────────────────────────────
    Route::post('auth/login', [AuthController::class, 'login'])->name('login');

    // ─── Protected routes (JWT required) ─────────────────────────────
    Route::middleware('auth:api')->group(function () {

        // Auth
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::post('auth/refresh', [AuthController::class, 'refresh']);
        Route::get('auth/me', [AuthController::class, 'me']);

        // Dashboard (role-aware)
        Route::get('dashboard', [DashboardController::class, 'index']);

        // Territories (ZR Express)
        Route::get('territories', [TerritoryController::class, 'index']);

        // Orders — admins can do everything, agents can read and update
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::middleware('role:admin')->group(function () {
            Route::post('orders', [OrderController::class, 'store']);
            Route::delete('orders/{order}', [OrderController::class, 'destroy']);
            Route::post('orders/bulk-delete', [OrderController::class, 'bulkDelete']);
        });
        Route::put('orders/{order}', [OrderController::class, 'update']);
        Route::patch('orders/{order}', [OrderController::class, 'update']);
        Route::post('orders/{order}/ship', [OrderController::class, 'sendToShipping']);
        Route::get('orders/{order}/sync-shipping', [OrderController::class, 'syncShippingStatus']);
        Route::get('orders/{order}/shipping-history', [OrderController::class, 'shippingHistory']);
        Route::get('orders/{order}/hubs', [OrderController::class, 'getAvailableHubs']);

        // Call logs
        Route::get('orders/{order}/call-logs', [CallLogController::class, 'index']);
        Route::post('orders/{order}/call-logs', [CallLogController::class, 'store']);

        // Agents management (admin only)
        Route::middleware('role:admin')->group(function () {
            Route::apiResource('agents', UserController::class);
            Route::apiResource('categories', CategoryController::class);
            Route::apiResource('zr-express-accounts', ZrExpressAccountController::class);
            
            // Settings
            Route::get('settings', [SettingsController::class, 'index']);
            Route::post('settings', [SettingsController::class, 'update']);

            // Delivery Fees management
            Route::get('delivery-fees', [\App\Http\Controllers\Api\DeliveryFeeController::class, 'index']);
            Route::put('delivery-fees/{id}', [\App\Http\Controllers\Api\DeliveryFeeController::class, 'update']);
        });

        Route::get('delivery-fees/{wilaya}', [\App\Http\Controllers\Api\DeliveryFeeController::class, 'show']);
    });
});

// Webhooks (public endpoints)
Route::post('/webhook/ayor', [AyorWebhookController::class, 'handleWebhook']);
Route::post('/webhook/zr', [\App\Http\Controllers\ZRExpressWebhookController::class, 'handle']);
