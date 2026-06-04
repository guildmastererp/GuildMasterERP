<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Rutas de autenticación (No necesitan token)
Route::post('/registro', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas (Requieren el Token Bearer)
Route::middleware('auth:sanctum')->group(function () {
    
    // Ruta que devuelve el usuario logueado con su personaje vinculado
    Route::get('/user', function (Request $request) {
        // Cargamos la relación 'personaje' definida en el Modelo User
        return $request->user()->load('personaje');
    });

});