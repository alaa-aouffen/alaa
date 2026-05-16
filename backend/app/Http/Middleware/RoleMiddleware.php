<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * Usage: role:admin  or  role:agent
     */
    public function handle(Request $request, Closure $next, string $role)
    {
        $user = Auth::guard('api')->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        if ($user->role !== $role) {
            return response()->json(['message' => 'Accès refusé. Permission insuffisante.'], 403);
        }

        return $next($request);
    }
}
