<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
            
            // 1. Extraemos los datos de la URL
            $url = $request->input('raiderio_url');
            preg_match('~raider\.io/characters/([^/]+)/([^/]+)/([^/]+)~i', $url, $matches);
            
            $regionUrl = strtolower($matches[1]);
            $reinoUrl  = strtolower($matches[2]);
            $nombrePj  = ucfirst(strtolower($matches[3]));

            // 2. Buscamos el código de la Región (EU, US...)
            $regionDb = DB::table('aux_region')->whereRaw('LOWER(nombre) = ?', [$regionUrl])->first();
            $codigoRegion = $regionDb ? $regionDb->codigo : null;

            // 3. Buscamos el código del Reino salvando los guiones y apóstrofes
            $todosLosReinos = DB::table('aux_reino')->get();
            $codigoReino = null;
            
            foreach ($todosLosReinos as $reino) {
                // Convertimos "Zul'jin" a "zuljin" y "Dun Modr" a "dun-modr" para comparar
                $nombreLimpio = Str::slug(str_replace("'", "", $reino->nombre));
                
                if ($nombreLimpio === $reinoUrl) {
                    $codigoReino = $reino->codigo;
                    break;
                }
            }
            
            // 4. Generamos ID autoincremental
            $ultimo = DB::table('aux_personajes')->orderBy('id', 'desc')->first();
            $nuevoId = $ultimo ? ($ultimo->id + 1) : 1;
            $codigoGenerado = str_pad($nuevoId, 4, '0', STR_PAD_LEFT);

            // 5. Guardamos en la BD usando códigos en vez de textos
            DB::table('aux_personajes')->insert([
                'codigo'         => $codigoGenerado,
                'nombre'         => $nombrePj,
                'codigoRegion'   => $codigoRegion,
                'codigoReino'    => $codigoReino,
                'es_main'        => true,
                'puntos'         => 0, // Iniciamos en 0 por defecto
                'user_battletag' => $request->input('battletag')
            ]);

            // 6. Creamos el usuario
            $user = User::create([
                'battletag'   => $request->input('battletag'),
                'name'        => $request->input('name'),
                'email'       => $request->input('email'),
                'password'    => Hash::make($request->input('password')),
                'codigo_main' => $codigoGenerado,
            ]);

            $user->load('personajes'); // Recargamos para devolver al front si hace falta

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

        // Buscamos el usuario de forma simple, sin forzar relaciones
        $user = User::where('email', $request->email)->first();

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
        ], 200);
    }
    // #endregion
}