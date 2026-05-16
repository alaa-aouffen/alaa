<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Get all settings.
     */
    public function index()
    {
        return response()->json([
            'order_processing_delay_days' => (int) Setting::get('order_processing_delay_days', 1)
        ]);
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'order_processing_delay_days' => 'required|integer|min:0|max:30',
        ]);

        Setting::set('order_processing_delay_days', $request->order_processing_delay_days);

        return response()->json(['message' => 'Paramètres mis à jour avec succès']);
    }
}
