<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
                    'aux_personajes.clase', 'aux_personajes.spec', 'aux_personajes.funcion',
                    'aux_personajes.profesion1', 'aux_personajes.profesion2', 
                    'aux_personajes.profesion_sec1', 'aux_personajes.profesion_sec2',
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

    public function actualizarPuntos(Request $request)
    {
        $user = $request->user();
        
        if (!in_array($user->codigo_rol, ['0001', '0002'])) {
            return response()->json(['message' => 'No tienes rango suficiente para hacer esto.'], 403);
        }

        $request->validate([
            'codigo' => 'required|string',
            'cantidad' => 'required|numeric'
        ]);

        try {
            DB::table('aux_personajes')
                ->where('codigo', $request->input('codigo'))
                ->increment('puntos', $request->input('cantidad'));

            $nuevosPuntos = DB::table('aux_personajes')->where('codigo', $request->input('codigo'))->value('puntos');

            return response()->json([
                'status' => 'success',
                'message' => 'Puntos actualizados correctamente.',
                'nuevosPuntos' => $nuevosPuntos
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar puntos.'], 500);
        }
    }

    // NUEVO MÉTODO PARA QUE LOS OFICIALES EDITEN A CUALQUIERA
    public function actualizarConfiguracionOficial(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->codigo_rol, ['0001', '0002'])) {
            return response()->json(['message' => 'Rango insuficiente.'], 403);
        }

        $request->validate([
            'codigo' => 'required|string',
            'clase' => 'nullable|string',
            'spec' => 'nullable|string',
            'funcion' => 'nullable|string',
            'profesion1' => 'nullable|string',
            'profesion2' => 'nullable|string',
            'profesion_sec1' => 'nullable|string',
            'profesion_sec2' => 'nullable|string'
        ]);

        try {
            DB::table('aux_personajes')
                ->where('codigo', $request->input('codigo'))
                ->update([
                    'clase' => $request->input('clase'),
                    'spec' => $request->input('spec'),
                    'funcion' => $request->input('funcion'),
                    'profesion1' => $request->input('profesion1'),
                    'profesion2' => $request->input('profesion2'),
                    'profesion_sec1' => $request->input('profesion_sec1'),
                    'profesion_sec2' => $request->input('profesion_sec2')
                ]);

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al guardar.'], 500);
        }
    }
}