<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use App\Models\Character; // <-- Importamos el modelo de Personajes
use Illuminate\Support\Facades\Hash;

class RoleAndUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Creamos los Roles de la Guild
        $adminRole = Role::create([
            'name' => 'Oficial',
            'description' => 'Maestro de la hermandad y oficiales con control total de asistencia, loot y banco.'
        ]);

        $raiderRole = Role::create([
            'name' => 'Raider',
            'description' => 'Miembro activo del roster de banda con acceso a reclamar loot y ver prioridad.'
        ]);

        Role::create([
            'name' => 'Miembro',
            'description' => 'Rango social de la guild con acceso básico al tablón y banco.'
        ]);

        // 2. Creamos tu Usuario Oficial
        $userMichelle = User::create([
            'role_id' => $adminRole->id,
            'battletag' => 'MichelleGM#1234',
            'email' => 'michelle@guildmaster.com',
            'password' => Hash::make('abc123..'),
        ]);

        // 3. Creamos un Usuario Raider de prueba
        $userArthas = User::create([
            'role_id' => $raiderRole->id,
            'battletag' => 'ArthasDps#5678',
            'email' => 'arthas@gmail.com',
            'password' => Hash::make('abc123..'),
        ]);

        // 4. Sembramos Personajes de prueba vinculados a los usuarios
        // Tus personajes (Oficial)
        Character::create([
            'user_id' => $userMichelle->id,
            'name' => 'pruebaWarrior',
            'realm' => 'Dun Modr',
            'class' => 'Guerrero',
            'spec' => 'Furia',
            'ilvl' => 625,
            'is_main' => true,
        ]);

        Character::create([
            'user_id' => $userMichelle->id,
            'name' => 'pruebaPriest',
            'realm' => 'Dun Modr',
            'class' => 'Sacerdote',
            'spec' => 'Sagrado',
            'ilvl' => 610,
            'is_main' => false,
        ]);

        // Personaje del Raider de prueba
        Character::create([
            'user_id' => $userArthas->id,
            'name' => 'pruebaDK',
            'realm' => 'Zul\'jin',
            'class' => 'Caballero de la Muerte',
            'spec' => 'Profano',
            'ilvl' => 628,
            'is_main' => true,
        ]);
    }
}