<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class GestionController extends Controller
{
    /**
     * Actualiza la dirección de correo electrónico del usuario.
     * * Valida que el nuevo correo tenga un formato válido y que no esté
     * registrado previamente por otro usuario en la plataforma.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email,' . $request->user()->id
        ]);

        $user = $request->user();
        $user->email = $request->input('email');
        $user->save();

        return response()->json(['message' => 'Correo electrónico actualizado correctamente.']);
    }

    /**
     * Actualiza la contraseña de acceso a la cuenta del usuario.
     * * Requiere la verificación exitosa de la contraseña actual antes de 
     * proceder a cifrar y guardar la nueva contraseña.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed'
        ]);

        $user = $request->user();

        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json(['message' => 'La contraseña actual no es correcta.'], 400);
        }

        $user->password = Hash::make($request->input('new_password'));
        $user->save();

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    /**
     * Elimina de forma permanente la cuenta del usuario y sus datos.
     * * Ejecuta una transacción en la base de datos para garantizar que se 
     * borren todos los personajes vinculados a su Battletag junto con el usuario.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        DB::transaction(function () use ($user) {
            DB::table('aux_personajes')->where('user_battletag', $user->battletag)->delete();
            $user->delete();
        });

        return response()->json(['message' => 'Cuenta y personajes eliminados de la base de datos.']);
    }
}