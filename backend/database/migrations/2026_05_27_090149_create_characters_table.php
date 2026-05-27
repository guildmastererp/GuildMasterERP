<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('characters', function (Blueprint $table) {
        $table->id();
        // Clave ajena que conecta con la tabla de usuarios. Si se borra el usuario, se borran sus personajes.
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
        $table->string('name');
        $table->string('realm'); // El servidor (ej: Dun Modr)
        $table->string('class'); // Guerrero, Cazador, Mago...
        $table->string('spec');  // Furia, Puntería, Fuego...
        $table->integer('ilvl'); // Nivel de objeto
        $table->boolean('is_main')->default(false); // ¿Es el personaje principal?
        $table->timestamps();
        
        // Esta línea evita que se duplique el mismo personaje en el mismo servidor
        $table->unique(['name', 'realm']); 
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('characters');
    }
};
