<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Weapon extends Model
{
    protected $fillable = ['name', 'damage', 'fire_rate', 'ammo_capacity', 'price', 'type'];
}
