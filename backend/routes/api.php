<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Rutas públicas de autenticación para Angular
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Ruta protegida
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});