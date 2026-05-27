<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    // Un rol tiene muchos usuarios (ej: el rol "Raider" lo tienen 20 personas)
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}