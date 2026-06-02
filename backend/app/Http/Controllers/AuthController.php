<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validamos los datos que envía Angular
        $request->validate([
            'correo' => 'required|email|unique:users,email',
            'contrasenya' => 'required|min:6',
            'nombre' => 'required|string',
            'battletag' => 'required|string',
            'nombreMain' => 'required|string'
        ]);

        // 2. Creamos el usuario
        $user = User::create([
            'name' => $request->nombre,
            'email' => $request->correo,
            'password' => Hash::make($request->contrasenya),
            'battletag' => $request->battletag,
            'nombre_main' => $request->nombreMain
        ]);

        return response()->json([
            'message' => 'Usuario registrado con éxito',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        // 1. Validamos la petición
        $request->validate([
            'correo' => 'required|email',
            'contrasenya' => 'required'
        ]);

        // 2. Buscamos al usuario
        $user = User::where('email', $request->correo)->first();

        // 3. Comprobamos contraseña
        if (!$user || !Hash::check($request->contrasenya, $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        return response()->json([
            'message' => 'Login correcto',
            'user' => $user
        ]);
    }
}