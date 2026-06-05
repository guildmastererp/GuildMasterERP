<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('aux_rol', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 4)->unique();
            $table->string('nombre');
            // Opcional: $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('aux_rol');
    }
};