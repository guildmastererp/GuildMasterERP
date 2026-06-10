<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PersonajeController; 
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\RosterRaidController;
use App\Http\Controllers\LootRaidController;
use App\Http\Controllers\MiticasController;
use App\Http\Controllers\GestionController;
use App\Http\Controllers\GuiasController; 
use App\Http\Controllers\EventosController;

// #region RUTAS PÚBLICAS
/**
 * Rutas accesibles sin autenticación.
 * Utilizadas para el registro de nuevos usuarios y el inicio de sesión.
 */
Route::post('/registro', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
// #endregion

// #region RUTAS PRIVADAS
/**
 * Rutas protegidas por el middleware Sanctum.
 * Requieren que el usuario esté autenticado con un token válido.
 */
Route::middleware('auth:sanctum')->group(function () {
    
    // #region INFORMACIÓN DEL USUARIO
    /**
     * Obtiene la información del usuario actual autenticado y su personaje principal.
     */
    Route::get('/user', function (Request $request) {
        return $request->user()->load('personaje');
    });
    // #endregion

    // #region GESTIÓN DEL PERFIL Y ROSTER PERSONAL
    /**
     * Rutas para gestionar los personajes propios del usuario (alters), 
     * marcar su main y obtener datos auxiliares para los selectores.
     */
    Route::get('/mis-personajes', [PerfilController::class, 'misPersonajes']);
    Route::post('/añadir-personaje', [PerfilController::class, 'añadirPersonaje']);
    Route::post('/marcar-main', [PerfilController::class, 'marcarComoMain']);
    Route::get('/aux-clases', [PerfilController::class, 'getClases']);
    Route::get('/aux-specs', [PerfilController::class, 'getSpecs']);
    Route::get('/aux-profesiones', [PerfilController::class, 'getProfesiones']);
    Route::get('/aux-funciones', [PerfilController::class, 'getFunciones']);
    Route::post('/actualizar-datos-personaje', [PerfilController::class, 'actualizarDatosPersonaje']);
    // #endregion

    // #region GESTIÓN DE PUNTOS Y OFICIALES
    /**
     * Rutas reservadas para la administración técnica y el control de puntuación 
     * por parte de los oficiales y el maestro de hermandad.
     */
    Route::post('/actualizar-puntos', [PersonajeController::class, 'actualizarPuntos']);
    Route::post('/actualizar-configuracion-oficial', [PersonajeController::class, 'actualizarConfiguracionOficial']);
    // #endregion

    // #region GESTIÓN DE RAID Y LOOT
    /**
     * Rutas para la organización de la raid, control de asistencia (roster general) 
     * y el registro del historial de botín repartido.
     */
    Route::get('/roster', [RosterRaidController::class, 'getRoster']);
    Route::post('/roster/add', [RosterRaidController::class, 'addToRoster']);
    Route::delete('/roster/remove/{codigo}', [RosterRaidController::class, 'removeFromRoster']);
    
    Route::get('/loot', [LootRaidController::class, 'getHistorialLoot']);
    Route::post('/loot/add', [LootRaidController::class, 'addLoot']);
    Route::delete('/loot/remove/{id}', [LootRaidController::class, 'deleteLoot']);
    Route::get('/loot/estructura', [LootRaidController::class, 'getEstructuraRaids']);
    
    Route::get('/aux-personajes', [PersonajeController::class, 'getAllAuxPersonajes']);
    // #endregion

    // #region MÍTICAS+ Y GUÍAS
    /**
     * Rutas para el registro, consulta y sincronización (mediante Raider.io) 
     * de las mazmorras Míticas+, además del acceso a la biblioteca de guías.
     */
    Route::get('/miticas', [MiticasController::class, 'getRegistros']);
    Route::get('/miticas/estructura', [MiticasController::class, 'getEstructura']);
    Route::post('/miticas/add', [MiticasController::class, 'addRegistro']);
    Route::delete('/miticas/remove/{id}', [MiticasController::class, 'deleteRegistro']);
    Route::post('/miticas/sincronizar', [MiticasController::class, 'sincronizarRaiderIo']); 
    Route::get('/miticas/guias-lista', [GuiasController::class, 'getGuias']); 
    // #endregion

    // #region TABLÓN DE EVENTOS
    /**
     * Rutas para gestionar el calendario de eventos comunitarios 
     * y las inscripciones o cancelaciones de los miembros.
     */
    Route::get('/eventos', [EventosController::class, 'getEventos']);
    Route::get('/eventos/tipos', [EventosController::class, 'getTipos']);
    Route::post('/eventos/add', [EventosController::class, 'addEvento']);
    Route::delete('/eventos/remove/{id}', [EventosController::class, 'deleteEvento']);
    Route::get('/eventos/proximos', [EventosController::class, 'getProximosConInscritos']);
    Route::post('/eventos/inscribir', [EventosController::class, 'inscribirse']);
    Route::delete('/eventos/desinscribir/{evento}/{personaje}', [EventosController::class, 'desinscribirse']);
    // #endregion
    
    // #region AJUSTES DE CUENTA
    /**
     * Rutas de configuración privada, actualización de credenciales 
     * y eliminación definitiva de la cuenta.
     */
    Route::post('/ajustes/email', [GestionController::class, 'updateEmail']);
    Route::post('/ajustes/password', [GestionController::class, 'updatePassword']);
    Route::delete('/ajustes/borrar', [GestionController::class, 'deleteAccount']);
    // #endregion

});
// #endregion