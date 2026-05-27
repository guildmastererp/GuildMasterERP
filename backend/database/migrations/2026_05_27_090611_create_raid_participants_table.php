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
    Schema::create('raid_participants', function (Blueprint $table) {
        $table->id();
        // Clave ajena a raids. Si se borra la raid, se limpia este registro.
        $table->foreignId('raid_id')->constrained()->onDelete('cascade');
        // Clave ajena a characters. Si se borra el personaje, se limpia su asistencia.
        $table->foreignId('character_id')->constrained()->onDelete('cascade');
        
        $table->string('role_selected'); // Tanque, Healer, DPS (el rol con el que va a esa raid)
        $table->string('attendance_status')->default('Confirmed'); // Confirmed, Absent, Late
        $table->timestamps();

        // Evitamos que un mismo personaje se apunte dos veces a la misma raid
        $table->unique(['raid_id', 'character_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('raid_participants');
    }
};
