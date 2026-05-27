<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Los atributos que se pueden rellenar de forma masiva.
     */
    protected $fillable = [
        'battletag',
        'email',
        'password',
        'role_id',
    ];

    /**
     * Los atributos que deben ocultarse en las respuestas JSON (seguridad).
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Los atributos que se castean automáticamente.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * RELACIÓN: Un usuario pertenece a un único Rol.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * RELACIÓN: Un usuario puede tener muchos personajes en la hermandad.
     */
    public function characters(): HasMany
    {
        return $this->hasMany(Character::class);
    }
}