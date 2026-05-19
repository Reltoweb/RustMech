<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mech extends Model
{
    protected $table = 'mechs';
    protected $fillable = ['name', 'base_hp', 'base_speed', 'base_armor', 'price'];
}
