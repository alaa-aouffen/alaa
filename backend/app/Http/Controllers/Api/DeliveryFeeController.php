<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryFee;
use Illuminate\Http\Request;

class DeliveryFeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(DeliveryFee::orderBy('wilaya_code')->get());
    }

    /**
     * Display the specified resource by wilaya name.
     */
    public function show(string $wilaya)
    {
        // Try exact match or clean name
        $fee = DeliveryFee::where('wilaya_name', $wilaya)->first();
        
        if (!$fee) {
            // Try cleaning common prefix like "16 - Alger"
            if (str_contains($wilaya, ' - ')) {
                $parts = explode(' - ', $wilaya);
                if (isset($parts[1])) {
                    $wilaya = trim($parts[1]);
                    $fee = DeliveryFee::where('wilaya_name', 'like', '%' . $wilaya . '%')->first();
                }
            } else {
                $fee = DeliveryFee::where('wilaya_name', 'like', '%' . $wilaya . '%')->first();
            }
        }

        if (!$fee) {
            return response()->json(['message' => 'Tarif non trouvé'], 404);
        }

        return response()->json($fee);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'home_fee' => 'required|integer|min:0',
            'desk_fee' => 'required|integer|min:0',
        ]);

        $fee = DeliveryFee::findOrFail($id);
        $fee->update($request->only(['home_fee', 'desk_fee']));

        return response()->json($fee);
    }
}
