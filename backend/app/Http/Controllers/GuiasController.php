<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GuiasController extends Controller
{
    /**
     * Obtiene el listado de las guías estratégicas disponibles.
     * * Realiza un cruce con la tabla de mazmorras míticas para adjuntar 
     * el nombre de la mazmorra y su temporada correspondiente, permitiendo 
     * así la organización y el filtrado de las guías en la interfaz del cliente.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getGuias()
    {
        return DB::table('aux_guias')
            ->join('aux_mitica', 'aux_guias.codigoMitica', '=', 'aux_mitica.codigo')
            ->select('aux_guias.*', 'aux_mitica.nombre as nombre_mazmorra', 'aux_mitica.codigoTemporada')
            ->get();
    }
}