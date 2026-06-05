<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 1. Crear tabla aux_region
        Schema::create('aux_region', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 4)->unique();
            $table->string('nombre');
        });

        // 2. Crear tabla aux_reino
        Schema::create('aux_reino', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 4)->unique();
            $table->string('nombre');
        });

        // 3. Modificar aux_personajes
        Schema::table('aux_personajes', function (Blueprint $table) {
            // Eliminamos los campos de texto plano antiguos
            $table->dropColumn('reino');
            $table->dropColumn('region');

            // Añadimos los nuevos campos relacionales y los puntos
            $table->string('codigoRegion', 4)->nullable()->after('nombre');
            $table->string('codigoReino', 4)->nullable()->after('codigoRegion');
            $table->integer('puntos')->default(0)->after('es_main');
        });
    }

    public function down()
    {
        Schema::table('aux_personajes', function (Blueprint $table) {
            $table->string('reino')->nullable();
            $table->string('region')->nullable();
            
            $table->dropColumn('codigoRegion');
            $table->dropColumn('codigoReino');
            $table->dropColumn('puntos');
        });

        Schema::dropIfExists('aux_reino');
        Schema::dropIfExists('aux_region');
    }
};