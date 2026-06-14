<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * List all agents (admin only).
     */
    public function index()
    {
        $users = User::where('role', 'agent')
            ->withCount(['assignedOrders', 'callLogs'])
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }

    /**
     * Create a new agent (admin only).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name'                  => $request->name,
            'email'                 => $request->email,
            'password'              => $request->password,
            'role'                  => 'agent',
            'is_active'             => true,
        ]);

        return response()->json($user, 201);
    }

    /**
     * Show a specific user.
     */
    public function show(User $agent)
    {
        $agent->loadCount(['assignedOrders', 'callLogs']);
        return response()->json($agent);
    }

    /**
     * Update agent info (admin only).
     */
    public function update(Request $request, User $agent)
    {
        $validator = Validator::make($request->all(), [
            'name'                  => 'sometimes|string|max:255',
            'email'                 => ['sometimes', 'email', Rule::unique('users')->ignore($agent->id)],
            'password'              => 'sometimes|string|min:6',
            'is_active'             => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'email', 'is_active']);
        if ($request->filled('password')) {
            $data['password'] = $request->password;
        }

        $agent->update($data);

        return response()->json($agent);
    }

    /**
     * Delete an agent (admin only).
     */
    public function destroy(User $agent)
    {
        if ($agent->role === 'admin') {
            return response()->json(['message' => 'Impossible de supprimer un administrateur.'], 403);
        }
        $agent->delete();
        return response()->json(['message' => 'Agent supprimé avec succès.']);
    }
}
