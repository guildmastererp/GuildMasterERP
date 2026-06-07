<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventosController extends Controller
{
    public function getEventos()
    {
        return DB::table('eventos')
            ->join('aux_tipoEvento', 'eventos.codigoTipo', '=', 'aux_tipoEvento.codigo')
            ->select('eventos.*', 'aux_tipoEvento.nombre as nombre_tipo')
            ->orderBy('fecha_evento', 'asc')
            ->get();
    }

    public function addEvento(Request $request)
    {
        $ultimoCodigo = DB::table('eventos')->max('codigo');
        $nuevoCodigo = $ultimoCodigo ? str_pad((int)$ultimoCodigo + 1, 4, '0', STR_PAD_LEFT) : '0001';

        DB::table('eventos')->insert([
            'codigo' => $nuevoCodigo,
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'fecha_evento' => $request->fecha_evento,
            'codigoTipo' => $request->codigoTipo
        ]);

        return response()->json(['message' => 'Evento creado.']);
    }

    public function getTipos() { return DB::table('aux_tipoEvento')->get(); }

    public function deleteEvento($id)
{
    DB::table('eventos')->where('id', $id)->delete();
    return response()->json(['message' => 'Evento eliminado']);
}

public function getProximosConInscritos()
    {
        $hoy = now()->format('Y-m-d H:i:s');
        
        $eventos = DB::table('eventos')
            ->join('aux_tipoEvento', 'eventos.codigoTipo', '=', 'aux_tipoEvento.codigo')
            ->select('eventos.*', 'aux_tipoEvento.nombre as nombre_tipo')
            ->where('fecha_evento', '>=', $hoy)
            ->orderBy('fecha_evento', 'asc')
            ->get();

        // Por cada evento, buscamos quién se ha apuntado
        foreach ($eventos as $evento) {
            $evento->inscritos = DB::table('evento_inscripciones')
                ->join('aux_personajes', 'evento_inscripciones.codigo_personaje', '=', 'aux_personajes.codigo')
                ->where('evento_inscripciones.codigo_evento', $evento->codigo)
                ->select('aux_personajes.codigo', 'aux_personajes.nombre', 'aux_personajes.clase', 'aux_personajes.funcion')
                ->get();
        }

        return response()->json($eventos);
    }

public function inscribirse(Request $request)
    {
        // 1. Comprobamos si la inscripción ya existe en la BBDD
        $existe = DB::table('evento_inscripciones')
            ->where('codigo_evento', $request->codigo_evento)
            ->where('codigo_personaje', $request->codigo_personaje)
            ->exists();

        // 2. Solo insertamos si NO existe previamente
        if (!$existe) {
            DB::table('evento_inscripciones')->insert([
                'codigo_evento' => $request->codigo_evento,
                'codigo_personaje' => $request->codigo_personaje
            ]);
        }
        
        return response()->json(['message' => 'Inscrito correctamente']);
    }

    public function desinscribirse($evento, $personaje)
    {
        DB::table('evento_inscripciones')
            ->where('codigo_evento', $evento)
            ->where('codigo_personaje', $personaje)
            ->delete();
        return response()->json(['message' => 'Desapuntado con éxito']);
    }
    
}