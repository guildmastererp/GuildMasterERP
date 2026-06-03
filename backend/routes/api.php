<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// #region RUTAS PÚBLICAS DE AUTENTICACIÓN
Route::post('/registro', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
// #endregion

// #region RUTAS PROTEGIDAS
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
// #endregion