<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserWeapon extends Model
{
    protected $table = 'user_weapons';
    protected $fillable = ['user_id', 'weapon_id', 'equipped_on_mech_id', 'current_ammo'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function weapon()
    {
        return $this->belongsTo(Weapon::class);
    }

    public function equippedOnMech()
    {
        return $this->belongsTo(UserMech::class, 'equipped_on_mech_id');
    }
}
