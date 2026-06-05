<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Forzamos a que las tres tablas hablen exactamente la misma codificación
        DB::statement('ALTER TABLE aux_personajes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
        DB::statement('ALTER TABLE aux_reino CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
        DB::statement('ALTER TABLE aux_region CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    }

    public function down()
    {
        // No es necesario revertir un cambio de codificación
    }
};