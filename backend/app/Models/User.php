<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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

    // Relación 1:1 para saber cuál es el personaje principal actual
    public function personaje()
    {
        return $this->belongsTo(Personaje::class, 'codigo_main', 'codigo');
    }

    // Relación 1:N para obtener TODOS los personajes de este usuario (Mains y Alters)
    public function personajes()
    {
        return $this->hasMany(Personaje::class, 'user_battletag', 'battletag');
    }
}