<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Personaje extends Model
{
    use HasFactory;

    // Nombre de la tabla en la base de datos
    protected $table = 'aux_personajes';

    // Campos que se pueden rellenar masivamente
    protected $fillable = [
        'codigo',
        'nombre',
        'reino',
        'region',
        'es_main',
    ];

    // Opcional: Relación inversa (si quieres ver qué usuario tiene este personaje)
    public function user()
    {
        return $this->belongsTo(User::class, 'codigo_main', 'codigo');
    }
}