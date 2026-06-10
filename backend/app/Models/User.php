<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // #region PROPIEDADES
    protected $primaryKey = 'battletag';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'battletag',
        'name',
        'email',
        'password',
        'codigo_main',
        'codigo_rol', 
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];
    // #endregion

    // #region MÉTODOS

    /**
     * Obtiene el personaje principal vinculado a este usuario.
     * Establece una relación 1:1 basándose en el 'codigo_main' registrado en la cuenta.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function personaje()
    {
        return $this->belongsTo(Personaje::class, 'codigo_main', 'codigo');
    }

    /**
     * Obtiene todos los personajes registrados bajo esta cuenta.
     * Establece una relación 1:N utilizando el 'battletag' como clave foránea
     * para recuperar tanto al personaje principal como a todos los alters.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function personajes()
    {
        return $this->hasMany(Personaje::class, 'user_battletag', 'battletag');
    }

    // #endregion
}