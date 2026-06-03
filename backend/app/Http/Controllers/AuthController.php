<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // #region AUTENTICACIÓN Y REGISTRO

/**
 * @description Registra un nuevo usuario en el ERP validando el BattleTag 
 * y extrayendo los datos del personaje desde su URL de Raider.io.
 */
public function register(Request $request) // <--- Cambiado de 'registrar' a 'register'
{
    // #region VALIDADOR DE ENTRADA
    $request->validate([
        'name'         => 'required|string|max:255',
        'email'        => 'required|string|email|max:255|unique:users',
        'password'     => 'required|string|min:8|confirmed',
        'battletag'    => 'required|string|max:50|unique:users,battletag',
        'raiderio_url' => ['required', 'url', 'regex:~raider\.io/characters/[^/]+/[^/]+/[^/]+~i']
    ]);
    // #endregion

    // #region EXTRACCIÓN DE DATOS RAIDER.IO
    $url = $request->input('raiderio_url');
    
    $region = null;
    $reino = null;
    $nombreMain = null;

    if (preg_match('~raider\.io/characters/([^/]+)/([^/]+)/([^/]+)~i', $url, $matches)) {
        $region     = $matches[1];
        $reino      = $matches[2];
        $nombreMain = $matches[3];
    }
    // #endregion

    // #region ALMACENAMIENTO EN BASE DE DATOS
    $user = User::create([
        'battletag'   => $request->input('battletag'),
        'name'        => $request->input('name'),
        'email'       => $request->input('email'),
        'password'    => Hash::make($request->input('password')),
        'nombre_main' => $nombreMain,
        'reino'       => $reino,
        'region'      => $region,
    ]);
    // #endregion

    // #region RESPUESTA JSON
    return response()->json([
        'status'  => 'success',
        'message' => 'Cuenta de hermandad creada correctamente.',
        'user'    => $user
    ], 201);
    // #endregion
}

// #endregion
}