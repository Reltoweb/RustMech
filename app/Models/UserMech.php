<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserMech extends Model
{
    protected $table = 'user_mechs';
    protected $fillable = ['user_id', 'mech_id', 'current_hp', 'is_active'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mech()
    {
        return $this->belongsTo(Mech::class);
    }
}
