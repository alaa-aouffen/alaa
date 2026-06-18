<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ZRExpressService;
use Illuminate\Http\Request;

class TerritoryController extends Controller
{
    /**
     * Get territories from ZR Express API.
     * 
     * If parentId is not provided, returns wilayas (level=wilaya).
     * If parentId is provided, returns communes for that wilaya (level=commune).
     */
    public function index(Request $request, ZRExpressService $zrService)
    {
        $keyword = $request->get('keyword');
        $parentId = $request->get('parentId');
        
        // If no parentId, we fetch wilayas by default unless keyword is specific
        $level = $parentId ? 'commune' : 'wilaya';

        $territories = $zrService->searchTerritories($keyword, $parentId, $level);

        return response()->json($territories);
    }
}
