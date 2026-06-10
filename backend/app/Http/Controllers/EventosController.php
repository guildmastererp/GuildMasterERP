<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EventosController extends Controller
{
    /**
     * Obtiene el listado completo de todos los eventos programados.
     * Realiza un cruce con la tabla auxiliar de tipos de evento para incluir
     * el nombre del tipo y los ordena cronológicamente.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getEventos()
    {
        return DB::table('eventos')
            ->join('aux_tipoEvento', 'eventos.codigoTipo', '=', 'aux_tipoEvento.codigo')
            ->select('eventos.*', 'aux_tipoEvento.nombre as nombre_tipo')
            ->orderBy('fecha_evento', 'asc')
            ->get();
    }

    /**
     * Añade un nuevo evento al calendario.
     * Genera automáticamente un código secuencial de 4 dígitos para el 
     * nuevo registro antes de insertarlo en la base de datos.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Obtiene el listado de tipos de evento disponibles.
     * Utilizado para cargar las opciones en los desplegables de creación de eventos.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getTipos() 
    { 
        return DB::table('aux_tipoEvento')->get(); 
    }

    /**
     * Elimina un evento específico del sistema.
     *
     * @param int $id El identificador interno (ID) del evento a borrar.
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteEvento($id)
    {
        DB::table('eventos')->where('id', $id)->delete();
        return response()->json(['message' => 'Evento eliminado']);
    }

    /**
     * Recupera los eventos futuros (cuya fecha es mayor o igual a hoy) e incluye
     * el listado detallado de los personajes inscritos en cada uno de ellos.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProximosConInscritos()
    {
        $hoy = now()->format('Y-m-d H:i:s');
        
        $eventos = DB::table('eventos')
            ->join('aux_tipoEvento', 'eventos.codigoTipo', '=', 'aux_tipoEvento.codigo')
            ->select('eventos.*', 'aux_tipoEvento.nombre as nombre_tipo')
            ->where('fecha_evento', '>=', $hoy)
            ->orderBy('fecha_evento', 'asc')
            ->get();

        foreach ($eventos as $evento) {
            $evento->inscritos = DB::table('evento_inscripciones')
                ->join('aux_personajes', 'evento_inscripciones.codigo_personaje', '=', 'aux_personajes.codigo')
                ->where('evento_inscripciones.codigo_evento', $evento->codigo)
                ->select('aux_personajes.codigo', 'aux_personajes.nombre', 'aux_personajes.clase', 'aux_personajes.funcion')
                ->get();
        }

        return response()->json($eventos);
    }

    /**
     * Registra a un personaje en un evento concreto.
     * Comprueba primero que no exista una inscripción previa para evitar duplicados.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function inscribirse(Request $request)
    {
        $existe = DB::table('evento_inscripciones')
            ->where('codigo_evento', $request->codigo_evento)
            ->where('codigo_personaje', $request->codigo_personaje)
            ->exists();

        if (!$existe) {
            DB::table('evento_inscripciones')->insert([
                'codigo_evento' => $request->codigo_evento,
                'codigo_personaje' => $request->codigo_personaje
            ]);
        }
        
        return response()->json(['message' => 'Inscrito correctamente']);
    }

    /**
     * Anula la inscripción de un personaje en un evento.
     *
     * @param string $evento El código del evento.
     * @param string $personaje El código del personaje a desapuntar.
     * @return \Illuminate\Http\JsonResponse
     */
    public function desinscribirse($evento, $personaje)
    {
        DB::table('evento_inscripciones')
            ->where('codigo_evento', $evento)
            ->where('codigo_personaje', $personaje)
            ->delete();
            
        return response()->json(['message' => 'Desapuntado con éxito']);
    }
}