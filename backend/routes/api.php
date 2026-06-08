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

// Rutas Públicas
Route::post('/registro', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas Privadas ERP
Route::middleware('auth:sanctum')->group(function () {
    
    // Obtener info del usuario actual
    Route::get('/user', function (Request $request) {
        return $request->user()->load('personaje');
    });

    // Gestión del Roster del Perfil (PerfilController)
    Route::get('/mis-personajes', [PerfilController::class, 'misPersonajes']);
    Route::post('/añadir-personaje', [PerfilController::class, 'añadirPersonaje']);
    Route::post('/marcar-main', [PerfilController::class, 'marcarComoMain']);
    
    // Gestión de Puntos y Configuración de Oficiales (PersonajeController)
    Route::post('/actualizar-puntos', [PersonajeController::class, 'actualizarPuntos']);
    Route::post('/actualizar-configuracion-oficial', [PersonajeController::class, 'actualizarConfiguracionOficial']); // <-- RUTA AÑADIDA AQUÍ

    // Combos de Perfil (PerfilController)
    Route::get('/aux-clases', [PerfilController::class, 'getClases']);
    Route::get('/aux-specs', [PerfilController::class, 'getSpecs']);
    Route::get('/aux-profesiones', [PerfilController::class, 'getProfesiones']);
    Route::get('/aux-funciones', [PerfilController::class, 'getFunciones']);
    Route::post('/actualizar-datos-personaje', [PerfilController::class, 'actualizarDatosPersonaje']);

    // Rutas de Raid: Gestión del Roster
    Route::get('/roster', [RosterRaidController::class, 'getRoster']);
    Route::post('/roster/add', [RosterRaidController::class, 'addToRoster']);
    Route::delete('/roster/remove/{codigo}', [RosterRaidController::class, 'removeFromRoster']);
    
    // Rutas de Raid: Registro de Loot
    Route::get('/loot', [LootRaidController::class, 'getHistorialLoot']);
    Route::post('/loot/add', [LootRaidController::class, 'addLoot']);
    Route::delete('/loot/remove/{id}', [LootRaidController::class, 'deleteLoot']);
    Route::get('/loot/estructura', [LootRaidController::class, 'getEstructuraRaids']);
    Route::get('/aux-personajes', [PersonajeController::class, 'getAllAuxPersonajes']);

    // Registro de Míticas 
    Route::get('/miticas', [MiticasController::class, 'getRegistros']);
    Route::get('/miticas/estructura', [MiticasController::class, 'getEstructura']);
    Route::post('/miticas/add', [MiticasController::class, 'addRegistro']);
    Route::delete('/miticas/remove/{id}', [MiticasController::class, 'deleteRegistro']);
    Route::post('/miticas/sincronizar', [MiticasController::class, 'sincronizarRaiderIo']); 
    Route::get('/miticas/guias-lista', [GuiasController::class, 'getGuias']); 

    // Eventos
    Route::get('/eventos', [EventosController::class, 'getEventos']);
    Route::get('/eventos/tipos', [EventosController::class, 'getTipos']);
    Route::post('/eventos/add', [EventosController::class, 'addEvento']);
    Route::delete('/eventos/remove/{id}', [EventosController::class, 'deleteEvento']);
    Route::get('/eventos/proximos', [EventosController::class, 'getProximosConInscritos']);
    Route::post('/eventos/inscribir', [EventosController::class, 'inscribirse']);
    Route::delete('/eventos/desinscribir/{evento}/{personaje}', [EventosController::class, 'desinscribirse']);
    
    // Gestión de cuenta
    Route::post('/ajustes/email', [GestionController::class, 'updateEmail']);
    Route::post('/ajustes/password', [GestionController::class, 'updatePassword']);
    Route::delete('/ajustes/borrar', [GestionController::class, 'deleteAccount']);
});