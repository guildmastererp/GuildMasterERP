<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PerfilController extends Controller
{
    // #region GESTIÓN DE PERSONAJES DEL USUARIO (ROSTER)

    public function misPersonajes(Request $request)
    {
        // Hacemos JOIN para devolver los nombres reales de reino y región, y traemos los puntos
        $personajes = DB::table('aux_personajes')
            ->leftJoin('aux_reino', 'aux_personajes.codigoReino', '=', 'aux_reino.codigo')
            ->leftJoin('aux_region', 'aux_personajes.codigoRegion', '=', 'aux_region.codigo')
            ->where('user_battletag', $request->user()->battletag)
            ->select('aux_personajes.*', 'aux_reino.nombre as reino', 'aux_region.nombre as region')
            ->get();

        return response()->json($personajes);
    }

    public function añadirPersonaje(Request $request)
    {
        $request->validate([
            'raiderio_url' => ['required', 'url', 'regex:~raider\.io/characters/[^/]+/[^/]+/[^/]+~i']
        ]);

        $url = $request->input('raiderio_url');
        preg_match('~raider\.io/characters/([^/]+)/([^/]+)/([^/]+)~i', $url, $matches);

        $regionUrl = strtolower($matches[1]);
        $reinoUrl  = strtolower($matches[2]);
        $nombrePj  = ucfirst(strtolower($matches[3]));

        $regionDb = DB::table('aux_region')->whereRaw('LOWER(nombre) = ?', [$regionUrl])->first();
        $codigoRegion = $regionDb ? $regionDb->codigo : null;

        $todosLosReinos = DB::table('aux_reino')->get();
        $codigoReino = null;
        
        foreach ($todosLosReinos as $reino) {
            $nombreLimpio = Str::slug(str_replace("'", "", $reino->nombre));
            if ($nombreLimpio === $reinoUrl) {
                $codigoReino = $reino->codigo;
                break;
            }
        }

        $ultimo = DB::table('aux_personajes')->orderBy('id', 'desc')->first();
        $nuevoId = $ultimo ? ($ultimo->id + 1) : 1;
        $codigoGenerado = str_pad($nuevoId, 4, '0', STR_PAD_LEFT);

        DB::table('aux_personajes')->insert([
            'codigo'         => $codigoGenerado,
            'nombre'         => $nombrePj,
            'codigoRegion'   => $codigoRegion,
            'codigoReino'    => $codigoReino,
            'es_main'        => false,
            'puntos'         => 0,
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
            $user->codigo_main = $nuevoCodigoMain;
            $user->save();

            DB::table('aux_personajes')
                ->where('user_battletag', $user->battletag)
                ->update(['es_main' => false]);

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