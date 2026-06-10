<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    // #region PROPIEDADES
    
    protected $fillable = [
        'name', 
        'description'
    ];
    
    // #endregion

    // #region MÉTODOS

    /**
     * Obtiene todos los usuarios que tienen asignado este rol.
     * Establece una relación 1:N donde un rol específico puede estar 
     * vinculado a múltiples cuentas de usuario.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    // #endregion
}