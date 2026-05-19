<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\GarageController;
use App\Http\Controllers\ArenaController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/shop/buy', [ShopController::class, 'buy']);
    Route::post('/garage/equip', [GarageController::class, 'equip']);
    Route::post('/arena/reward/kill', [ArenaController::class, 'killReward']);
    Route::post('/arena/reward/crate', [ArenaController::class, 'crateReward']);
});
