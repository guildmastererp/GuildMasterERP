<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RosterRaidController extends Controller
{
    /**
     * Obtiene la lista actual de personajes en el roster.
     * * Retorna los datos básicos del personaje (código, nombre, clase y función)
     * ordenados por su función dentro de la raid.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRoster()
    {
        $roster = DB::table('aux_roster_actual')
            ->join('aux_personajes', 'aux_roster_actual.codigoPersonaje', '=', 'aux_personajes.codigo')
            ->select('aux_personajes.codigo', 'aux_personajes.nombre', 'aux_personajes.clase', 'aux_personajes.funcion')
            ->orderBy('aux_personajes.funcion', 'asc')
            ->get();

        return response()->json($roster);
    }

    /**
     * Añade un nuevo personaje al roster oficial.
     * * Valida los permisos del usuario (Master u Oficial) y comprueba 
     * que el personaje no se encuentre ya registrado previamente.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addToRoster(Request $request)
    {
        $user = $request->user();
        
        if (!in_array($user->codigo_rol, ['0001', '0002'])) {
            return response()->json(['message' => 'Rango insuficiente para gestionar el roster.'], 403);
        }

        $request->validate(['codigoPersonaje' => 'required|string']);

        $exists = DB::table('aux_roster_actual')->where('codigoPersonaje', $request->codigoPersonaje)->exists();
        if ($exists) {
            return response()->json(['message' => 'El personaje ya está convocado.'], 400);
        }

        DB::table('aux_roster_actual')->insert([
            'codigo' => $request->codigoPersonaje, 
            'codigoPersonaje' => $request->codigoPersonaje
        ]);

        return response()->json(['message' => 'Personaje añadido al roster oficial.']);
    }

    /**
     * Expulsa a un personaje del roster.
     * * Requiere verificación de nivel de acceso administrativo antes de 
     * proceder con la eliminación del registro.
     *
     * @param \Illuminate\Http\Request $request
     * @param string $codigoPersonaje El código identificador del personaje a expulsar
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeFromRoster(Request $request, $codigoPersonaje)
    {
        $user = $request->user();
        if (!in_array($user->codigo_rol, ['0001', '0002'])) {
            return response()->json(['message' => 'Rango insuficiente.'], 403);
        }

        DB::table('aux_roster_actual')->where('codigoPersonaje', $codigoPersonaje)->delete();

        return response()->json(['message' => 'Personaje expulsado del roster.']);
    }
}