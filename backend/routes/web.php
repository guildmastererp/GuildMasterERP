<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// archivo inutilizado para definir rutas web, ya que el backend se comunica exclusivamente a través de API RESTful.