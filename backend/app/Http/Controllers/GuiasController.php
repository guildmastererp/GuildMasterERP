<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // <-- ¡Faltaba importar DB!

class GuiasController extends Controller
{
    public function getGuias()
    {
        // Devuelve las guías ordenadas por mazmorra e incluimos la Temporada para los filtros
        return DB::table('aux_guias')
            ->join('aux_mitica', 'aux_guias.codigoMitica', '=', 'aux_mitica.codigo')
            ->select('aux_guias.*', 'aux_mitica.nombre as nombre_mazmorra', 'aux_mitica.codigoTemporada')
            ->get();
    }
}