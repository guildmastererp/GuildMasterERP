<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CharacterController;

// El controlador debe llevar ::class detrás, NO .php
Route::get('/characters', [CharacterController::class, 'index']);