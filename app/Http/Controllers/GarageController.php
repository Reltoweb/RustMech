<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class GarageController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $activeUserMech = $user->mechs()
            ->with('mech')
            ->where('is_active', true)
            ->first();

        $equippedWeapons = [];
        if ($activeUserMech) {
            $equippedWeapons = $user->weapons()
                ->with('weapon')
                ->where('equipped_on_mech_id', $activeUserMech->id)
                ->get();
        }

        return Inertia::render('Garage/Index', [
            'auth' => ['user' => $user],
            'activeMech' => $activeUserMech,
            'equippedWeapons' => $equippedWeapons,
        ]);
    }

    public function equip(Request $request)
    {
        $request->validate([
            'user_weapon_id' => 'required|integer',
            'user_mech_id' => 'required|integer'
        ]);

        $user = Auth::user();

        $weapon = $user->weapons()->find($request->user_weapon_id);
        $mech = $user->mechs()->find($request->user_mech_id);

        if (!$weapon || !$mech) {
            return response()->json(['error' => 'Équipement introuvable'], 404);
        }

        $weapon->equipped_on_mech_id = $mech->id;
        $weapon->save();

        return response()->json(['success' => 'Arme équipée avec succès']);
    }
}
