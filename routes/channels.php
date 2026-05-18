<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('arena.{roomId}', function ($user, $roomId) {
    $activeMech = $user->mechs()->with('mech')->where('is_active', true)->first();
    $mechName = $activeMech ? strtolower($activeMech->mech->name) : 'ranger';
    
    return [
        'id' => $user->id, 
        'name' => $user->name,
        'mechName' => $mechName
    ];
});
