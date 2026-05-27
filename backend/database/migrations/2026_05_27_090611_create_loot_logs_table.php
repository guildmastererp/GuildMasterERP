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
    Schema::create('loot_logs', function (Blueprint $table) {
        $table->id();
        $table->foreignId('raid_id')->constrained()->onDelete('cascade');
        $table->foreignId('character_id')->constrained()->onDelete('cascade');
        
        $table->string('item_name'); // Ej: "Espada magna de Camorrista"
        $table->string('item_quality')->default('Epic'); // Rare, Epic, Legendary
        $table->integer('points_spent'); // Cuántos puntos de prioridad le costó el item
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loot_logs');
    }
};
