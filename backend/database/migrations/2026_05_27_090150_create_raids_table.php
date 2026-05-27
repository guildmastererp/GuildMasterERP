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
    Schema::create('raids', function (Blueprint $table) {
        $table->id();
        $table->string('title'); // Ej: Palacio de la Liberación
        $table->string('zone');  // El mapa de la raid
        $table->string('difficulty')->default('Heroic'); // Normal, Heroic, Mythic
        $table->dateTime('scheduled_at'); // Fecha y hora de la raid
        $table->string('status')->default('Programada'); // Programada, Activa, Finalizada
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('raids');
    }
};
