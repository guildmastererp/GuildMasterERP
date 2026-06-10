<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LootRaidController extends Controller
{
    /**
     * Obtiene el historial completo de loot asignado en las raids.
     * * Realiza cruces con las tablas de personajes e ítems de raid para devolver 
     * los nombres reales en lugar de los identificadores, ordenados por fecha descendente.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getHistorialLoot()
    {
        $loot = DB::table('registroLootRaid')
            ->join('aux_personajes', 'registroLootRaid.codigoPersonaje', '=', 'aux_personajes.codigo')
            ->join('aux_itemraid', 'registroLootRaid.codigoItemRaid', '=', 'aux_itemraid.codigo')
            ->select(
                'registroLootRaid.id', 
                'registroLootRaid.fecha', 
                'aux_itemraid.nombre as item_nombre',
                'aux_personajes.nombre as personaje_nombre'
            )
            ->orderBy('registroLootRaid.fecha', 'desc')
            ->orderBy('registroLootRaid.id', 'desc')
            ->get();

        return response()->json($loot);
    }

    /**
     * Registra una o múltiples asignaciones de loot a un personaje.
     * * Valida los permisos de administrador (Master u Oficial) y permite 
     * inserciones por lotes iterando sobre un array de objetos, generando 
     * un código autoincremental único para cada registro.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addLoot(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->codigo_rol, ['0001', '0002'])) {
            return response()->json(['message' => 'Solo Master y Oficiales pueden repartir loot.'], 403);
        }

        $request->validate([
            'fecha' => 'required|date',
            'bosses' => 'required|array',
            'codigoPersonaje' => 'required|string|max:4'
        ]);

        foreach ($request->bosses as $codigoItem) {
            $ultimoCodigo = DB::table('registroLootRaid')->max('codigo');
            $nuevoCodigo = $ultimoCodigo ? str_pad((int)$ultimoCodigo + 1, 4, '0', STR_PAD_LEFT) : '0001';

            DB::table('registroLootRaid')->insert([
                'codigo' => $nuevoCodigo,
                'codigoItemRaid' => $codigoItem,
                'codigoPersonaje' => $request->codigoPersonaje,
                'fecha' => $request->fecha . ' 00:00:00'
            ]);
        }

        return response()->json(['message' => 'Loot registrado correctamente para los elementos seleccionados.']);
    }

    /**
     * Elimina un registro de loot específico del historial.
     * * Requiere validación estricta de rango (Master u Oficial) antes 
     * de ejecutar el borrado en la base de datos.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id 
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteLoot(Request $request, $id)
    {
        $user = $request->user();
        if (!in_array($user->codigo_rol, ['0001', '0002'])) {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        DB::table('registroLootRaid')->where('id', $id)->delete();
        return response()->json(['message' => 'Registro de loot eliminado.']);
    }

    /**
     * Obtiene la jerarquía maestra de datos para el módulo de Raid.
     * * Devuelve los catálogos completos de expansiones, temporadas, raids, 
     * jefes (bosses) e ítems necesarios para configurar y filtrar los formularios.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEstructuraRaids()
    {
        return response()->json([
            'expansiones' => DB::table('aux_expansion')->get(),
            'temporadas'  => DB::table('aux_temporada')->get(),
            'raids'       => DB::table('aux_raid')->get(),
            'bosses'      => DB::table('aux_bossraid')->get(),
            'items'       => DB::table('aux_itemraid')->get()
        ]);
    }
}