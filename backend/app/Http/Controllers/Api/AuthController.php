<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Login and return JWT token.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }

        /** @var User $user */
        $user = Auth::guard('api')->user();

        if (!$user->is_active) {
            Auth::guard('api')->logout();
            return response()->json(['message' => 'Compte désactivé. Contactez votre administrateur.'], 403);
        }

        return $this->respondWithToken($token, $user);
    }

    /**
     * Get authenticated user profile.
     */
    public function me()
    {
        return response()->json(Auth::guard('api')->user());
    }

    /**
     * Logout and invalidate token.
     */
    public function logout()
    {
        Auth::guard('api')->logout();
        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    /**
     * Refresh JWT token.
     */
    public function refresh()
    {
        $token = Auth::guard('api')->refresh();
        return $this->respondWithToken($token, Auth::guard('api')->user());
    }

    /**
     * Format the token response.
     */
    protected function respondWithToken($token, $user)
    {
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => Auth::guard('api')->factory()->getTTL() * 60,
            'user'         => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ]);
    }
}
