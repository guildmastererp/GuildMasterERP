<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PersonajeController extends Controller
{
    // #region MÉTODOS DE BÚSQUEDA Y COMUNIDAD

    /**
     * @description Obtiene todos los personajes de la tabla aux_personajes para el buscador de la comunidad.
     * @param Request $request Petición HTTP entrante.
     * @return \Illuminate\Http\JsonResponse Array de personajes o mensaje de error.
     */
    public function getAllAuxPersonajes(Request $request)
    {
        try {
            // Añadimos 'spec', 'profesion' y 'funcion' al select
            $personajes = DB::table('aux_personajes')
                            ->select('codigo', 'nombre', 'reino', 'region', 'es_main', 'spec', 'profesion', 'funcion')
                            ->orderBy('nombre', 'asc')
                            ->get();

            return response()->json($personajes, 200);

        } catch (\Exception $e) {
            return response()->json([
                'mensaje' => 'Error al consultar la base de datos de personajes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // #endregion
}