<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ArenaController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $activeUserMech = $user->mechs()
            ->with('mech')
            ->where('is_active', true)
            ->first();

        return Inertia::render('Arena/Game', [
            'auth' => [
                'user' => $user
            ],
            'activeMech' => $activeUserMech
        ]);
    }

    public function killReward(Request $request)
    {
        $user = auth()->user();
        $user->credits += 100;
        $user->save();

        return response()->json(['success' => true, 'credits' => $user->credits, 'reward' => 100]);
    }

    public function crateReward(Request $request)
    {
        $user = auth()->user();
        $reward = rand(10, 50);
        $user->credits += $reward;
        $user->save();

        return response()->json(['success' => true, 'credits' => $user->credits, 'reward' => $reward]);
    }
}
