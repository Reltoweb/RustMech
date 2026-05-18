<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({
    auth: Object,
    activeMech: Object,
    equippedWeapons: Array,
});
</script>

<template>
    <div class="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-orange-500 selection:text-white">
        <!-- Header / Navbar -->
        <header class="bg-gray-800 border-b border-gray-700 shadow-md">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <div class="shrink-0 flex items-center text-orange-500 font-bold text-2xl tracking-wider">
                            XBLASTER
                        </div>
                        <nav class="ml-10 flex space-x-8">
                            <Link href="/garage" class="text-orange-500 border-b-2 border-orange-500 px-1 pt-1 text-sm font-medium">
                                Garage
                            </Link>
                            <Link href="/shop" class="text-gray-300 hover:text-orange-400 hover:border-gray-300 border-b-2 border-transparent px-1 pt-1 text-sm font-medium transition duration-150 ease-in-out">
                                Shop
                            </Link>
                        </nav>
                    </div>
                    <div class="flex items-center space-x-6">
                        <div class="flex flex-col text-right">
                            <span class="text-xs text-gray-400 uppercase tracking-widest">Pilote</span>
                            <span class="text-sm font-bold text-blue-400">{{ auth.user.name }}</span>
                        </div>
                        <div class="flex space-x-4 bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
                            <div class="flex flex-col">
                                <span class="text-[10px] text-gray-500 uppercase font-bold">Crédits</span>
                                <span class="text-sm font-mono text-gray-200">{{ auth.user.credits }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[10px] text-orange-500/80 uppercase font-bold">Uridium</span>
                                <span class="text-sm font-mono text-orange-400">{{ auth.user.uridium }}</span>
                            </div>
                        </div>
                        <Link href="/logout" method="post" as="button" class="text-sm text-gray-400 hover:text-white">
                            Déconnexion
                        </Link>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Left Column: Mech Visual -->
                <div class="col-span-2">
                    <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl relative">
                        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-orange-900/20"></div>
                        
                        <div class="p-6 relative z-10 flex flex-col items-center justify-center min-h-[400px]">
                            <h2 class="text-2xl font-bold uppercase tracking-widest text-white mb-8 border-b border-gray-600 pb-2 inline-block">Mech Actif</h2>
                            
                            <div v-if="activeMech" class="relative group">
                                <div class="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                                <div class="relative w-64 h-64 bg-gray-900 border-2 border-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                                    <div class="text-center">
                                        <div class="w-32 h-32 bg-gray-700 mx-auto mb-4 border border-gray-500 rotate-45 transform transition-transform group-hover:rotate-90 duration-500"></div>
                                        <span class="text-xl font-bold text-cyan-400 uppercase tracking-widest">{{ activeMech.mech.name }}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div v-else class="text-gray-500 italic">
                                Aucun Mech actif sélectionné.
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-8 flex justify-center">
                        <Link href="/arena" class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-orange-600 font-pj rounded-xl hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 ring-offset-gray-900 shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(234,88,12,0.6)] uppercase tracking-widest overflow-hidden">
                            <span class="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                            Entrer dans l'Arène
                        </Link>
                    </div>
                </div>

                <!-- Right Column: Stats & Equipment -->
                <div class="space-y-8">
                    
                    <!-- Stats (HUD) -->
                    <div class="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
                        <h3 class="text-lg font-bold text-gray-300 uppercase tracking-wider mb-6 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                            Statistiques du Système
                        </h3>
                        
                        <div v-if="activeMech" class="space-y-5">
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="font-medium text-gray-400">Intégrité (HP)</span>
                                    <span class="font-mono text-green-400">{{ activeMech.current_hp }} / {{ activeMech.mech.base_hp }}</span>
                                </div>
                                <div class="w-full bg-gray-900 rounded-full h-2.5 border border-gray-700 overflow-hidden">
                                    <div class="bg-green-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]" :style="{ width: (activeMech.current_hp / activeMech.mech.base_hp * 100) + '%' }"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="font-medium text-gray-400">Armure</span>
                                    <span class="font-mono text-blue-400">{{ activeMech.mech.base_armor }}</span>
                                </div>
                                <div class="w-full bg-gray-900 rounded-full h-2.5 border border-gray-700 overflow-hidden">
                                    <div class="bg-blue-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" :style="{ width: Math.min((activeMech.mech.base_armor / 200 * 100), 100) + '%' }"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="font-medium text-gray-400">Vitesse</span>
                                    <span class="font-mono text-yellow-400">{{ activeMech.mech.base_speed }}</span>
                                </div>
                                <div class="w-full bg-gray-900 rounded-full h-2.5 border border-gray-700 overflow-hidden">
                                    <div class="bg-yellow-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)]" :style="{ width: Math.min((activeMech.mech.base_speed / 500 * 100), 100) + '%' }"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Equipment -->
                    <div class="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
                        <h3 class="text-lg font-bold text-gray-300 uppercase tracking-wider mb-6 flex items-center">
                            <svg class="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Armement Équipé
                        </h3>
                        
                        <div v-if="equippedWeapons.length > 0" class="space-y-4">
                            <div v-for="userWeapon in equippedWeapons" :key="userWeapon.id" class="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-500 transition-colors">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h4 class="font-bold text-orange-400">{{ userWeapon.weapon.name }}</h4>
                                        <div class="text-xs text-gray-500 mt-1 uppercase">{{ userWeapon.weapon.type }}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-mono text-gray-300">Dmg: {{ userWeapon.weapon.damage }}</div>
                                        <div class="text-xs text-gray-500 mt-1">Mun: <span class="text-gray-300">{{ userWeapon.current_ammo }}</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-gray-500 italic text-sm text-center py-4">
                            Aucune arme équipée.
                        </div>
                    </div>
                    
                </div>
            </div>
        </main>
    </div>
</template>
