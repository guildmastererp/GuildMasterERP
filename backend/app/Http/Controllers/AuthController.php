<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Personaje;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    // #region AUTENTICACIÓN Y REGISTRO

    public function register(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|string|email|max:255|unique:users',
            'password'     => 'required|string|min:8|confirmed',
            'battletag'    => 'required|string|max:50|unique:users,battletag',
            'raiderio_url' => ['required', 'url', 'regex:~raider\.io/characters/[^/]+/[^/]+/[^/]+~i']
        ]);

        return DB::transaction(function () use ($request) {
            
            $url = $request->input('raiderio_url');
            preg_match('~raider\.io/characters/([^/]+)/([^/]+)/([^/]+)~i', $url, $matches);
            
            $ultimo = DB::table('aux_personajes')->orderBy('id', 'desc')->first();
            $nuevoId = $ultimo ? ($ultimo->id + 1) : 1;
            $codigoGenerado = str_pad($nuevoId, 4, '0', STR_PAD_LEFT);

            DB::table('aux_personajes')->insert([
                'codigo'         => $codigoGenerado,
                'nombre'         => $matches[3],
                'reino'          => $matches[2],
                'region'         => $matches[1],
                'es_main'        => true,
                'user_battletag' => $request->input('battletag') // Vinculamos el dueño
            ]);

            $user = User::create([
                'battletag'   => $request->input('battletag'),
                'name'        => $request->input('name'),
                'email'       => $request->input('email'),
                'password'    => Hash::make($request->input('password')),
                'codigo_main' => $codigoGenerado,
            ]);

            $user->load('personaje');

            return response()->json([
                'status'  => 'success',
                'message' => 'Cuenta y personaje registrados correctamente.',
                'user'    => $user
            ], 201);
        });
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::with('personaje')->where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Las credenciales introducidas son incorrectas.',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Has iniciado sesión correctamente.',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user
        ]);
    }
    // #endregion
}