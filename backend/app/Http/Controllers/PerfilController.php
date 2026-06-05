<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PerfilController extends Controller
{
    // #region GESTIÓN DE PERSONAJES DEL USUARIO (ROSTER)

    public function misPersonajes(Request $request)
    {
        // Devuelve el array de todos los personajes vinculados al battletag del usuario
        return response()->json($request->user()->personajes);
    }

    public function añadirPersonaje(Request $request)
    {
        $request->validate([
            'raiderio_url' => ['required', 'url', 'regex:~raider\.io/characters/[^/]+/[^/]+/[^/]+~i']
        ]);

        $url = $request->input('raiderio_url');
        preg_match('~raider\.io/characters/([^/]+)/([^/]+)/([^/]+)~i', $url, $matches);

        $ultimo = DB::table('aux_personajes')->orderBy('id', 'desc')->first();
        $nuevoId = $ultimo ? ($ultimo->id + 1) : 1;
        $codigoGenerado = str_pad($nuevoId, 4, '0', STR_PAD_LEFT);

        DB::table('aux_personajes')->insert([
            'codigo'         => $codigoGenerado,
            'nombre'         => $matches[3],
            'reino'          => $matches[2],
            'region'         => $matches[1],
            'es_main'        => false, // Por defecto es un alter
            'user_battletag' => $request->user()->battletag
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Alter añadido correctamente a tu hermandad.'
        ], 201);
    }

    public function marcarComoMain(Request $request)
    {
        $request->validate([
            'codigo' => 'required|string'
        ]);

        $user = $request->user();
        $nuevoCodigoMain = $request->input('codigo');

        DB::transaction(function () use ($user, $nuevoCodigoMain) {
            // 1. Asignamos el nuevo código al usuario
            $user->codigo_main = $nuevoCodigoMain;
            $user->save();

            // 2. Limpiamos el flag de main en todos sus personajes
            DB::table('aux_personajes')
                ->where('user_battletag', $user->battletag)
                ->update(['es_main' => false]);

            // 3. Activamos el flag solo en el seleccionado
            DB::table('aux_personajes')
                ->where('codigo', $nuevoCodigoMain)
                ->update(['es_main' => true]);
        });

        return response()->json([
            'status'  => 'success',
            'message' => 'Personaje principal actualizado con éxito.'
        ]);
    }

    // #endregion

    // #region DATOS AUXILIARES (COMBOS DEL PERFIL)

    public function getClases()
    {
        return response()->json(DB::table('aux_clase')->orderBy('nombre', 'asc')->get());
    }

    public function getSpecs()
    {
        return response()->json(DB::table('aux_spec')->orderBy('nombre', 'asc')->get());
    }

    public function getProfesiones()
    {
        return response()->json(DB::table('aux_profesion')->orderBy('nombre', 'asc')->get());
    }

    public function getFunciones()
    {
        return response()->json(DB::table('aux_funcion')->orderBy('nombre', 'asc')->get());
    }

    // #endregion

    // #region ACTUALIZACIÓN MANUAL DE DATOS

    public function actualizarDatosPersonaje(Request $request)
    {
        $request->validate([
            'codigo' => 'required|string',
            'clase' => 'nullable|string',
            'spec' => 'nullable|string',
            'profesion' => 'nullable|string',
            'funcion' => 'nullable|string'
        ]);

        try {
            DB::table('aux_personajes')
                ->where('codigo', $request->input('codigo'))
                ->update([
                    'clase' => $request->input('clase'),
                    'spec' => $request->input('spec'),
                    'profesion' => $request->input('profesion'),
                    'funcion' => $request->input('funcion')
                ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Personaje actualizado correctamente.'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al guardar en base de datos.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // #endregion
}