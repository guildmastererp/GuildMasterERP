<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personaje extends Model
{
    use HasFactory;

    // #region PROPIEDADES
    
    protected $table = 'aux_personajes';

    protected $fillable = [
        'codigo',
        'nombre',
        'reino',
        'region',
        'es_main',
    ];
    
    // #endregion

    // #region MÉTODOS

    /**
     * Obtiene la cuenta de usuario propietaria de este personaje.
     * Establece una relación inversa para identificar a qué usuario 
     * pertenece este registro, vinculándolo a través del 'codigo_main'.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'codigo_main', 'codigo');
    }

    // #endregion
}