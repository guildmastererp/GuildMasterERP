<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class MiticasController extends Controller
{
    // Obtener todos los registros para el Grid
    public function getRegistros()
    {
        $registros = DB::table('aux_registroMiticas')
            ->join('aux_personajes', 'aux_registroMiticas.codigoPersonaje', '=', 'aux_personajes.codigo')
            ->join('aux_mitica', 'aux_registroMiticas.codigoMitica', '=', 'aux_mitica.codigo')
            ->select(
                'aux_registroMiticas.*', 
                'aux_personajes.nombre as personaje_nombre',
                'aux_mitica.nombre as mitica_nombre'
            )
            ->orderBy('aux_registroMiticas.fecha', 'desc')
            ->orderBy('aux_registroMiticas.id', 'desc')
            ->get();

        return response()->json($registros);
    }

    // Estructura para los combos del formulario
    public function getEstructura()
    {
        return response()->json([
            'expansiones' => DB::table('aux_expansion')->get(),
            'temporadas'  => DB::table('aux_temporada')->get(),
            'miticas'     => DB::table('aux_mitica')->get()
        ]);
    }

    // Añadir un nuevo registro manual
    public function addRegistro(Request $request)
    {
        $user = $request->user();
        if (!in_array($user->codigo_rol, ['0001', '0002'])) {
            return response()->json(['message' => 'Sin permisos.'], 403);
        }

        $request->validate([
            'fecha' => 'required|date',
            'codigoMitica' => 'required|string',
            'nivel' => 'required|integer',
            'resultado' => 'required|string',
            'codigoPersonaje' => 'required|string'
        ]);

        $ultimoCodigo = DB::table('aux_registroMiticas')->max('codigo');
        $nuevoCodigo = $ultimoCodigo ? str_pad((int)$ultimoCodigo + 1, 4, '0', STR_PAD_LEFT) : '0001';

        DB::table('aux_registroMiticas')->insert([
            'codigo' => $nuevoCodigo,
            'codigoMitica' => $request->codigoMitica,
            'nivel' => $request->nivel,
            'resultado' => $request->resultado,
            'codigoPersonaje' => $request->codigoPersonaje,
            'fecha' => $request->fecha . ' 00:00:00'
        ]);

        return response()->json(['message' => 'Mítica registrada correctamente.']);
    }

    // Sincronización Mágica con Raider.IO (Abierta a todos los usuarios logueados)
    public function sincronizarRaiderIo(Request $request)
    {
        // ELIMINADO EL BLOQUEO DE ROL PARA PERMITIR A CUALQUIERA SINCRONIZAR
        
        $personajes = DB::table('aux_personajes')
            ->join('aux_reino', 'aux_personajes.codigoReino', '=', 'aux_reino.codigo')
            ->select('aux_personajes.*', 'aux_reino.nombre as nombre_reino')
            ->get();

        $miticasDB = DB::table('aux_mitica')->get();
        
        $stats = [
            'insertadas' => 0,
            'personajes_encontrados' => 0,
            'personajes_fallidos' => 0,
            'mazmorras_no_cruzadas' => []
        ];

        // Diccionario: Nombre API Raider.io => Nombre limpio en tu BD
        $mapeoNombres = [
            'Magisters\' Terrace' => 'Magisters\' Terrace',
            'Maisara Caverns' => 'Maisara Caverns',
            'Nexus-Point Xenas' => 'Nexus-Point Xenas',
            'Algeth\'ar Academy' => 'Algeth\'ar Academy',
            'Seat of the Triumvirate' => 'Seat of the Triumvirate',
            'Skyreach' => 'Skyreach',
            'Pit of Saron' => 'Pit of Saron',
            'The Necrotic Wake' => 'Estela Necrótica', 
        ];

        foreach ($personajes as $p) {
            $response = Http::timeout(10)->get('https://raider.io/api/v1/characters/profile', [
                'region' => 'eu', 
                'realm'  => strtolower($p->nombre_reino),
                'name'   => strtolower($p->nombre),
                'fields' => 'mythic_plus_recent_runs'
            ]);

            if ($response->successful()) {
                $stats['personajes_encontrados']++;
                $data = $response->json();

                if (!empty($data['mythic_plus_recent_runs'])) {
                    foreach ($data['mythic_plus_recent_runs'] as $run) {
                        $fechaRun = date('Y-m-d H:i:s', strtotime($run['completed_at']));
                        
                        $existe = DB::table('aux_registroMiticas')
                            ->where('codigoPersonaje', $p->codigo)
                            ->where('fecha', $fechaRun)
                            ->exists();

                        if (!$existe) {
                            $nombreEnMiBD = $mapeoNombres[$run['dungeon']] ?? $run['dungeon'];
                            $miticaEncontrada = $miticasDB->firstWhere('nombre', $nombreEnMiBD);

                            if ($miticaEncontrada) {
                                $ultimoCodigo = DB::table('aux_registroMiticas')->max('codigo');
                                $nuevoCodigo = $ultimoCodigo ? str_pad((int)$ultimoCodigo + 1, 4, '0', STR_PAD_LEFT) : '0001';

                                $resultado = $run['num_keystone_upgrades'] > 0 ? 'En Tiempo' : 'Depletada';

                                DB::table('aux_registroMiticas')->insert([
                                    'codigo'          => $nuevoCodigo,
                                    'codigoMitica'    => $miticaEncontrada->codigo,
                                    'nivel'           => $run['mythic_level'],
                                    'resultado'       => $resultado,
                                    'codigoPersonaje' => $p->codigo,
                                    'fecha'           => $fechaRun
                                ]);

                                $stats['insertadas']++;
                            } else {
                                if (!in_array($nombreEnMiBD, $stats['mazmorras_no_cruzadas'])) {
                                    $stats['mazmorras_no_cruzadas'][] = $nombreEnMiBD;
                                }
                            }
                        }
                    }
                }
            } else {
                $stats['personajes_fallidos']++;
            }
        }

        // Construir un mensaje detallado
        $mensajeDetalle = "Sincronización completada. Nuevas: " . $stats['insertadas'] . ". \n";
        $mensajeDetalle .= "Personajes R.IO OK: " . $stats['personajes_encontrados'] . ". \n";
        
        if ($stats['personajes_fallidos'] > 0) {
            $mensajeDetalle .= "Personajes NO encontrados: " . $stats['personajes_fallidos'] . ". \n";
        }
        
        if (count($stats['mazmorras_no_cruzadas']) > 0) {
            $mensajeDetalle .= "\nATENCIÓN: Falta mapear estas mazmorras: " . implode(", ", $stats['mazmorras_no_cruzadas']);
        }

        return response()->json(['message' => $mensajeDetalle]);
    }

    // Eliminar registro
    public function deleteRegistro(Request $request, $id)
    {
        DB::table('aux_registroMiticas')->where('id', $id)->delete();
        return response()->json(['message' => 'Registro eliminado.']);
    }
}