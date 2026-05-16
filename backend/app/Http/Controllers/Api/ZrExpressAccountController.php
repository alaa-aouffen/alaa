<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ZrExpressAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ZrExpressAccountController extends Controller
{
    /**
     * List all accounts.
     */
    public function index()
    {
        $accounts = ZrExpressAccount::withCount('users')->get();
        return response()->json($accounts);
    }

    /**
     * Create a new account.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:255',
            'tenant_id' => 'required|string',
            'token'     => 'required|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $account = ZrExpressAccount::create($request->all());

        return response()->json($account, 201);
    }

    /**
     * Show a specific account.
     */
    public function show(ZrExpressAccount $zrExpressAccount)
    {
        return response()->json($zrExpressAccount);
    }

    /**
     * Update account info.
     */
    public function update(Request $request, ZrExpressAccount $zrExpressAccount)
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'sometimes|string|max:255',
            'tenant_id' => 'sometimes|string',
            'token'     => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $zrExpressAccount->update($request->all());

        return response()->json($zrExpressAccount);
    }

    /**
     * Delete an account.
     */
    public function destroy(ZrExpressAccount $zrExpressAccount)
    {
        if ($zrExpressAccount->users()->exists()) {
            return response()->json(['message' => 'Impossible de supprimer un compte lié à des agents.'], 422);
        }
        
        $zrExpressAccount->delete();
        return response()->json(['message' => 'Compte ZR Express supprimé.']);
    }
}
