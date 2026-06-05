<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Lo añadimos, por ejemplo, justo después del email o battletag
            $table->string('codigo_rol', 4)->default('0003')->after('email'); 
            
            // Si quieres añadir la restricción de clave foránea real en BD:
            // $table->foreign('codigo_rol')->references('codigo')->on('aux_rol');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // $table->dropForeign(['codigo_rol']); // Si activaste la foránea
            $table->dropColumn('codigo_rol');
        });
    }
};