<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrganizacionRaidController extends Controller
{
    /**
     * Obtiene la lista actual de personajes que conforman el roster de la raid.
     * Realiza un cruce con la tabla de personajes para recuperar y devolver 
     * el nombre, la clase y la función de combate de cada integrante, 
     * ordenados alfabéticamente por su rol (DPS, Healer, Tanque).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRoster()
    {
        $roster = DB::table('aux_roster_actual')
            ->join('aux_personajes', 'aux_roster_actual.codigoPersonaje', '=', 'aux_personajes.codigo')
            ->select('aux_personajes.nombre', 'aux_personajes.clase', 'aux_personajes.funcion')
            ->orderBy('aux_personajes.funcion', 'asc') // Ordena por rol (DPS, Healer, Tanque)
            ->get();

        return response()->json($roster);
    }
}