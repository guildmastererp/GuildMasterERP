<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RosterRaidController extends Controller
{
    // #region OBTENER ROSTER
    public function getRoster()
    {
        $roster = DB::table('aux_roster_actual')
            ->join('aux_personajes', 'aux_roster_actual.codigoPersonaje', '=', 'aux_personajes.codigo')
            ->select('aux_personajes.codigo', 'aux_personajes.nombre', 'aux_personajes.clase', 'aux_personajes.funcion')
            ->orderBy('aux_personajes.funcion', 'asc')
            ->get();

        return response()->json($roster);
    }
    // #endregion

    // #region AÑADIR AL ROSTER
    public function addToRoster(Request $request)
    {
        $user = $request->user();
        
        // Seguridad: Solo Master (0001) y Oficial (0002)
        if (!in_array($user->codigo_rol, ['0001', '0002'])) {
            return response()->json(['message' => 'Rango insuficiente para gestionar el roster.'], 403);
        }

        $request->validate(['codigoPersonaje' => 'required|string']);

        // Comprobamos que no esté ya dentro
        $exists = DB::table('aux_roster_actual')->where('codigoPersonaje', $request->codigoPersonaje)->exists();
        if ($exists) {
            return response()->json(['message' => 'El personaje ya está convocado.'], 400);
        }

        // Insertamos
        DB::table('aux_roster_actual')->insert([
            'codigo' => $request->codigoPersonaje, 
            'codigoPersonaje' => $request->codigoPersonaje
        ]);

        return response()->json(['message' => 'Personaje añadido al roster oficial.']);
    }
    // #endregion

    // #region EXPULSAR DEL ROSTER
    public function removeFromRoster(Request $request, $codigoPersonaje)
    {
        $user = $request->user();
        if (!in_array($user->codigo_rol, ['0001', '0002'])) {
            return response()->json(['message' => 'Rango insuficiente.'], 403);
        }

        DB::table('aux_roster_actual')->where('codigoPersonaje', $codigoPersonaje)->delete();

        return response()->json(['message' => 'Personaje expulsado del roster.']);
    }
    // #endregion
}