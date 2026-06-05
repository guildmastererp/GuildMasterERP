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
Route::middleware('auth:sanctum')->group(function () {
    
    // Obtener info del usuario actual
    Route::get('/user', function (Request $request) {
        return $request->user()->load('personaje');
    });

    // Gestión del Roster del Perfil (Cambiado a PerfilController)
    Route::get('/mis-personajes', [PerfilController::class, 'misPersonajes']);
    Route::post('/añadir-personaje', [PerfilController::class, 'añadirPersonaje']);
    Route::post('/marcar-main', [PerfilController::class, 'marcarComoMain']);
    Route::post('/actualizar-puntos', [App\Http\Controllers\PersonajeController::class, 'actualizarPuntos'])->middleware('auth:sanctum');

    // Guardado manual y Combos del Perfil (Cambiado a PerfilController)
    Route::get('/aux-clases', [PerfilController::class, 'getClases']);
    Route::get('/aux-specs', [PerfilController::class, 'getSpecs']);
    Route::get('/aux-profesiones', [PerfilController::class, 'getProfesiones']);
    Route::get('/aux-funciones', [PerfilController::class, 'getFunciones']);
    Route::post('/actualizar-datos-personaje', [PerfilController::class, 'actualizarDatosPersonaje']);

    // Rutas de Raid (OrganizacionRaidController)
    Route::get('/roster', [App\Http\Controllers\OrganizacionRaidController::class, 'getRoster']);

    // Buscador de la hermandad (Se queda en PersonajeController)
    Route::get('/aux-personajes', [PersonajeController::class, 'getAllAuxPersonajes']);
    
    // Gestión de cuenta (Cambiado a GestionController)
    Route::post('/ajustes/email', [App\Http\Controllers\GestionController::class, 'updateEmail']);
    Route::post('/ajustes/password', [App\Http\Controllers\GestionController::class, 'updatePassword']);
    Route::delete('/ajustes/borrar', [App\Http\Controllers\GestionController::class, 'deleteAccount']);
});