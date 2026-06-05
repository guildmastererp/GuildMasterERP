<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LootRaidController extends Controller
{
   public function getHistorialLoot()
{
    $loot = DB::table('registroLootRaid')
        ->join('aux_personajes', 'registroLootRaid.codigoPersonaje', '=', 'aux_personajes.codigo')
        ->join('aux_itemraid', 'registroLootRaid.codigoItemRaid', '=', 'aux_itemraid.codigo') // NUEVO JOIN
        ->select(
            'registroLootRaid.id', 
            'registroLootRaid.fecha', 
            'aux_itemraid.nombre as item_nombre', // Obtenemos el nombre
            'aux_personajes.nombre as personaje_nombre'
        )
        ->orderBy('registroLootRaid.fecha', 'desc')
        ->orderBy('registroLootRaid.id', 'desc')
        ->get();

    return response()->json($loot);
}

    public function addLoot(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->codigo_rol, ['0001', '0002'])) {
            return response()->json(['message' => 'Solo Master y Oficiales pueden repartir loot.'], 403);
        }

        $request->validate([
            'fecha' => 'required|date',
            'bosses' => 'required|array', // Validamos que llegue el array de selección múltiple
            'codigoPersonaje' => 'required|string|max:4'
        ]);

        foreach ($request->bosses as $codigoItem) {
            // Generar nuevo código único por cada inserción dentro del bucle
            $ultimoCodigo = DB::table('registroLootRaid')->max('codigo');
            $nuevoCodigo = $ultimoCodigo ? str_pad((int)$ultimoCodigo + 1, 4, '0', STR_PAD_LEFT) : '0001';

            DB::table('registroLootRaid')->insert([
                'codigo' => $nuevoCodigo,
                'codigoItemRaid' => $codigoItem, // Aquí guardamos el código del boss/item
                'codigoPersonaje' => $request->codigoPersonaje,
                'fecha' => $request->fecha . ' 00:00:00'
            ]);
        }

        return response()->json(['message' => 'Loot registrado correctamente para los elementos seleccionados.']);
    }

    public function deleteLoot(Request $request, $id)
    {
        $user = $request->user();
        if (!in_array($user->codigo_rol, ['0001', '0002'])) {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        DB::table('registroLootRaid')->where('id', $id)->delete();
        return response()->json(['message' => 'Registro de loot eliminado.']);
    }

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