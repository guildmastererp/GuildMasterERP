<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PerfilController extends Controller
{
    /**
     * Obtiene la lista de personajes asociados al usuario autenticado.
     * Realiza un JOIN para devolver los nombres reales del reino y la región,
     * además de los puntos acumulados por cada personaje.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Añade un nuevo personaje (alter) a la cuenta del usuario.
     * Procesa una URL de Raider.io para extraer la región, reino y nombre del personaje,
     * cruzando los datos con las tablas auxiliares para generar el nuevo registro.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Marca un personaje específico como el principal (main) del usuario.
     * Actualiza el código main en el usuario y gestiona el estado booleano
     * 'es_main' entre todos los personajes asociados a la cuenta.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Recupera el listado completo y ordenado alfabéticamente de las clases de personajes.
     * Utilizado para poblar los menús desplegables en el perfil.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getClases()
    {
        return response()->json(DB::table('aux_clase')->orderBy('nombre', 'asc')->get());
    }

    /**
     * Recupera el listado completo y ordenado alfabéticamente de las especializaciones (specs).
     * Utilizado para poblar los menús desplegables en el perfil.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSpecs()
    {
        return response()->json(DB::table('aux_spec')->orderBy('nombre', 'asc')->get());
    }

    /**
     * Recupera el listado completo y ordenado alfabéticamente de las profesiones.
     * Utilizado para poblar los menús desplegables en el perfil.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfesiones()
    {
        return response()->json(DB::table('aux_profesion')->orderBy('nombre', 'asc')->get());
    }

    /**
     * Recupera el listado completo y ordenado alfabéticamente de las funciones de combate (Tanque, Healer, DPS).
     * Utilizado para poblar los menús desplegables en el perfil.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFunciones()
    {
        return response()->json(DB::table('aux_funcion')->orderBy('nombre', 'asc')->get());
    }

    /**
     * Actualiza manualmente la configuración técnica de un personaje.
     * Permite guardar cambios en la clase, especialización, función y profesiones
     * (tanto principales como secundarias) del personaje indicado.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function actualizarDatosPersonaje(Request $request)
    {
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

            return response()->json(['status' => 'success', 'message' => 'Personaje actualizado correctamente.'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Error al guardar.'], 500);
        }
    }
}