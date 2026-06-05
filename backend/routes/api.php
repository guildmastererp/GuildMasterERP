<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PersonajeController; 
use App\Http\Controllers\PerfilController; // IMPORTAMOS EL NUEVO CONTROLADOR

// Rutas Públicas
Route::post('/registro', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas Privadas ERP
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
    Route::post('/actualizar-puntos', [PersonajeController::class, 'actualizarPuntos']);

    // Combos de Perfil (PerfilController)
    Route::get('/aux-clases', [PerfilController::class, 'getClases']);
    Route::get('/aux-specs', [PerfilController::class, 'getSpecs']);
    Route::get('/aux-profesiones', [PerfilController::class, 'getProfesiones']);
    Route::get('/aux-funciones', [PerfilController::class, 'getFunciones']);
    Route::post('/actualizar-datos-personaje', [PerfilController::class, 'actualizarDatosPersonaje']);

    // Rutas de Raid: Gestión del Roster (RosterRaidController)
    Route::get('/roster', [App\Http\Controllers\RosterRaidController::class, 'getRoster']);
    Route::post('/roster/add', [App\Http\Controllers\RosterRaidController::class, 'addToRoster']);
    Route::delete('/roster/remove/{codigo}', [App\Http\Controllers\RosterRaidController::class, 'removeFromRoster']);
    
    // Rutas de Raid: Registro de Loot (LootRaidController)
    Route::get('/loot', [App\Http\Controllers\LootRaidController::class, 'getHistorialLoot']);
    Route::post('/loot/add', [App\Http\Controllers\LootRaidController::class, 'addLoot']);
    Route::delete('/loot/remove/{id}', [App\Http\Controllers\LootRaidController::class, 'deleteLoot']);
    
    // NUEVA RUTA: Estructura de raids para los combos (LootRaidController)
    Route::get('/loot/estructura', [App\Http\Controllers\LootRaidController::class, 'getEstructuraRaids']);

    // Buscador de la hermandad (PersonajeController)
    Route::get('/aux-personajes', [PersonajeController::class, 'getAllAuxPersonajes']);
    
    // Gestión de cuenta (GestionController)
    Route::post('/ajustes/email', [App\Http\Controllers\GestionController::class, 'updateEmail']);
    Route::post('/ajustes/password', [App\Http\Controllers\GestionController::class, 'updatePassword']);
    Route::delete('/ajustes/borrar', [App\Http\Controllers\GestionController::class, 'deleteAccount']);
});