<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // <-- ESTO ES VITAL

class PersonajeController extends Controller
{
    public function getAllAuxPersonajes(Request $request)
    {
        try {
            $personajes = DB::table('aux_personajes')
                ->leftJoin('aux_reino', 'aux_personajes.codigoReino', '=', 'aux_reino.codigo')
                ->leftJoin('aux_region', 'aux_personajes.codigoRegion', '=', 'aux_region.codigo')
                ->select(
                    'aux_personajes.codigo', 'aux_personajes.nombre', 'aux_personajes.es_main', 
                    'aux_personajes.spec', 'aux_personajes.profesion', 'aux_personajes.funcion',
                    'aux_personajes.puntos', 'aux_reino.nombre as reino', 'aux_region.nombre as region'
                )
                ->orderBy('aux_personajes.nombre', 'asc')
                ->get();

            return response()->json($personajes, 200);

        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al consultar la base de datos de personajes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}