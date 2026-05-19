<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Mech;
use App\Models\Weapon;

class ShopController extends Controller
{
    public function index()
    {
        $mechs = Mech::all();
        $weapons = Weapon::all();

        return Inertia::render('Shop/Index', [
            'mechs' => $mechs,
            'weapons' => $weapons,
        ]);
    }

    public function buy(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'type' => 'required|string|in:mech,weapon'
        ]);

        $user = auth()->user();
        $itemType = $request->type;
        $itemId = $request->id;

        if ($itemType === 'mech') {
            $item = Mech::find($itemId);
            if (!$item) return response()->json(['error' => 'Mech introuvable'], 404);

            if ($user->credits < $item->price) {
                return response()->json(['error' => 'Crédits insuffisants'], 400);
            }

            $user->credits -= $item->price;
            $user->save();

            $user->mechs()->create([
                'mech_id' => $item->id,
                'current_hp' => $item->base_hp,
                'is_active' => false
            ]);

            return response()->json(['success' => 'Mech acheté avec succès', 'credits' => $user->credits]);
        } else if ($itemType === 'weapon') {
            $item = Weapon::find($itemId);
            if (!$item) return response()->json(['error' => 'Arme introuvable'], 404);

            if ($user->credits < $item->price) {
                return response()->json(['error' => 'Crédits insuffisants'], 400);
            }

            $user->credits -= $item->price;
            $user->save();

            $user->weapons()->create([
                'weapon_id' => $item->id,
                'current_ammo' => $item->ammo_capacity,
                'equipped_on_mech_id' => null
            ]);

            return response()->json(['success' => 'Arme achetée avec succès', 'credits' => $user->credits]);
        }

        return response()->json(['error' => 'Type invalide'], 400);
    }
}
