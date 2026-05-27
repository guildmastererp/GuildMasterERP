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
    Schema::create('points_transactions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('character_id')->constrained()->onDelete('cascade');
        $table->integer('amount'); // Puede ser positivo (+50 por Raid) o negativo (-100 por Loot)
        $table->string('reason');  // Ej: "Asistencia Raid", "Gasto Loot", "Míticas+ Semanal"
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('points_transactions');
    }
};
