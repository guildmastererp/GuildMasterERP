<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Character extends Model
{
    use HasFactory;

    /**
     * Los atributos que se pueden rellenar de forma masiva.
     */
    protected $fillable = [
        'user_id', 
        'name', 
        'realm', 
        'class', 
        'spec', 
        'ilvl', 
        'is_main'
    ];

    /**
     * RELACIÓN: El personaje pertenece a un usuario (dueño) de la plataforma.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}