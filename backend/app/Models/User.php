<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // #region CONFIGURACIÓN DE LLAVES Y MODELO

    // 1. Definimos que la Clave Primaria real es el BattleTag
    protected $primaryKey = 'battletag';

    // 2. Como es un String (Varchar) y no un entero, desactivamos el incremento automático en Eloquent
    public $incrementing = false;

    // 3. Le indicamos que el tipo de datos de la clave es una cadena de texto
    protected $keyType = 'string';

    // #endregion

    // #region ATRIBUTOS PERMISIVOS (MASS ASSIGNMENT)
    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'battletag',
        'name',
        'email',
        'password',
        'nombre_main',
        'reino',
        'region',
    ];
    // #endregion

    // #region ATRIBUTOS OCULTOS
    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];
    // #endregion
}