<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Mech;
use App\Models\Weapon;
use App\Models\User;
use App\Models\UserMech;
use App\Models\UserWeapon;

class GameDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ranger = Mech::create([
            'name' => 'Ranger',
            'base_hp' => 1000,
            'base_speed' => 300,
            'base_armor' => 50,
            'price' => 0
        ]);

        $defender = Mech::create([
            'name' => 'Defender',
            'base_hp' => 1500,
            'base_speed' => 200,
            'base_armor' => 100,
            'price' => 10000
        ]);

        $hunter = Mech::create([
            'name' => 'Hunter',
            'base_hp' => 800,
            'base_speed' => 400,
            'base_armor' => 25,
            'price' => 10000
        ]);

        $laser = Weapon::create([
            'name' => 'Laser de base',
            'damage' => 50,
            'fire_rate' => 500,
            'ammo_capacity' => 9999,
            'price' => 0,
            'type' => 'laser'
        ]);

        $rocket = Weapon::create([
            'name' => 'Lance-roquettes',
            'damage' => 200,
            'fire_rate' => 1500,
            'ammo_capacity' => 50,
            'price' => 5000,
            'type' => 'rocket'
        ]);

        $plasma = Weapon::create([
            'name' => 'Canon Plasma',
            'damage' => 100,
            'fire_rate' => 800,
            'ammo_capacity' => 200,
            'price' => 7500,
            'type' => 'plasma'
        ]);

        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@xblaster.com',
            'password' => bcrypt('password'),
            'credits' => 0,
            'uridium' => 0
        ]);

        $userMech = UserMech::create([
            'user_id' => $testUser->id,
            'mech_id' => $ranger->id,
            'current_hp' => 1000,
            'is_active' => true
        ]);

        UserWeapon::create([
            'user_id' => $testUser->id,
            'weapon_id' => $laser->id,
            'equipped_on_mech_id' => $userMech->id,
            'current_ammo' => 9999
        ]);
    }
}
