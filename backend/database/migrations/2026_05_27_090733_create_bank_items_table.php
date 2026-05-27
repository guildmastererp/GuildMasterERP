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
    Schema::create('bank_items', function (Blueprint $table) {
        $table->id();
        $table->string('name')->unique(); // Ej: "Frasco de poder previsor"
        $table->integer('quantity')->default(0); // Cantidad actual en el banco
        $table->string('category'); // Consumibles, Materiales, Runas, Varios
        $table->integer('required_quantity')->default(0); // Objetivo para el tablón de necesidades
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_items');
    }
};
