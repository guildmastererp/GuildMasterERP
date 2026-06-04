<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $primaryKey = 'battletag';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'battletag', 'name', 'email', 'password', 'codigo_main',
    ];

    // Esta relación es la que hace que el .load('personaje') funcione
    public function personaje()
    {
        return $this->belongsTo(Personaje::class, 'codigo_main', 'codigo');
    }
}