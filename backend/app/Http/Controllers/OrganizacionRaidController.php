<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrganizacionRaidController extends Controller
{
    // #region GESTIÓN DEL ROSTER
    
    public function getRoster()
    {
        $roster = DB::table('aux_roster_actual')
            ->join('aux_personajes', 'aux_roster_actual.codigoPersonaje', '=', 'aux_personajes.codigo')
            ->select('aux_personajes.nombre', 'aux_personajes.clase', 'aux_personajes.funcion')
            ->orderBy('aux_personajes.funcion', 'asc') // Ordena por rol (DPS, Healer, Tanque)
            ->get();

        return response()->json($roster);
    }

    // #endregion
}