<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Rutas Públicas
Route::post('/registro', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas Privadas ERP
Route::middleware('auth:sanctum')->group(function () {
    
    // Obtener info del usuario actual
    Route::get('/user', function (Request $request) {
        return $request->user()->load('personaje');
    });

    // Gestión de personajes de WoW
    Route::get('/mis-personajes', [AuthController::class, 'misPersonajes']);
    Route::post('/añadir-personaje', [AuthController::class, 'añadirPersonaje']);
    Route::post('/marcar-main', [AuthController::class, 'marcarComoMain']);
});