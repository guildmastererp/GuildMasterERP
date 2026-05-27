<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Character;
use Illuminate\Http\JsonResponse;

class CharacterController extends Controller
{
    /**
     * Devuelve el listado de todos los personajes del gremio.
     */
    public function index(): JsonResponse
    {
        // Cogemos todos los personajes e incluimos el usuario al que pertenecen (Eager Loading)
        $characters = Character::with('user.role')->get();

        return response()->json([
            'status' => 'success',
            'data' => $characters
        ], 200);
    }
}