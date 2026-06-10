<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Registra un nuevo usuario en el sistema junto con su personaje principal.
     * Extrae los datos de la URL de Raider.io proporcionada, cruza la información 
     * con las tablas auxiliares de región y reino, y guarda tanto el personaje 
     * como la cuenta de usuario de forma segura mediante una transacción de base de datos.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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
            
            $regionUrl = strtolower($matches[1]);
            $reinoUrl  = strtolower($matches[2]);
            $nombrePj  = ucfirst(strtolower($matches[3]));

            $regionDb = DB::table('aux_region')->whereRaw('LOWER(nombre) = ?', [$regionUrl])->first();
            $codigoRegion = $regionDb ? $regionDb->codigo : null;

            $todosLosReinos = DB::table('aux_reino')->get();
            $codigoReino = null;
            
            foreach ($todosLosReinos as $reino) {
                $nombreLimpio = Str::slug(str_replace("'", "", $reino->nombre));
                
                if ($nombreLimpio === $reinoUrl) {
                    $codigoReino = $reino->codigo;
                    break;
                }
            }
            
            $ultimo = DB::table('aux_personajes')->orderBy('id', 'desc')->first();
            $nuevoId = $ultimo ? ($ultimo->id + 1) : 1;
            $codigoGenerado = str_pad($nuevoId, 4, '0', STR_PAD_LEFT);

            DB::table('aux_personajes')->insert([
                'codigo'         => $codigoGenerado,
                'nombre'         => $nombrePj,
                'codigoRegion'   => $codigoRegion,
                'codigoReino'    => $codigoReino,
                'es_main'        => true,
                'puntos'         => 0, // Iniciamos en 0 por defecto
                'user_battletag' => $request->input('battletag')
            ]);

            $user = User::create([
                'battletag'   => $request->input('battletag'),
                'name'        => $request->input('name'),
                'email'       => $request->input('email'),
                'password'    => Hash::make($request->input('password')),
                'codigo_main' => $codigoGenerado,
            ]);

            $user->load('personajes');

            return response()->json([
                'status'  => 'success',
                'message' => 'Cuenta y personaje registrados correctamente.',
                'user'    => $user
            ], 201);
        });
    }

    /**
     * Autentica a un usuario existente y genera su token de acceso.
     * Valida las credenciales proporcionadas (email y contraseña) y, de ser correctas, 
     * emite un token de Sanctum para autorizar futuras peticiones a la API.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

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
}