<script setup>
import { Link, usePage } from '@inertiajs/vue3';
import axios from 'axios';

const props = defineProps({
    auth: Object,
    mechs: Array,
    weapons: Array,
});

const page = usePage();

const buyItem = async (item, type) => {
    try {
        const response = await axios.post('/api/shop/buy', {
            id: item.id,
            type: type
        });

        // Update the user credits in the page props dynamically
        page.props.auth.user.credits = response.data.credits;
        
        alert(response.data.success);
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            alert("Erreur : " + error.response.data.error);
        } else {
            console.error("Erreur lors de l'achat :", error);
        }
    }
};
</script>

<template>
    <div class="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-orange-500 selection:text-white pb-12">
        <!-- Header / Navbar (Shared structure) -->
        <header class="bg-gray-800 border-b border-gray-700 shadow-md mb-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <div class="shrink-0 flex items-center text-orange-500 font-bold text-2xl tracking-wider">
                            XBLASTER
                        </div>
                        <nav class="ml-10 flex space-x-8">
                            <Link href="/garage" class="text-gray-300 hover:text-orange-400 hover:border-gray-300 border-b-2 border-transparent px-1 pt-1 text-sm font-medium transition duration-150 ease-in-out">
                                Garage
                            </Link>
                            <Link href="/shop" class="text-orange-500 border-b-2 border-orange-500 px-1 pt-1 text-sm font-medium">
                                Shop
                            </Link>
                        </nav>
                    </div>
                    <div v-if="$page.props.auth && $page.props.auth.user" class="flex items-center space-x-6">
                        <div class="flex flex-col text-right">
                            <span class="text-xs text-gray-400 uppercase tracking-widest">Pilote</span>
                            <span class="text-sm font-bold text-blue-400">{{ $page.props.auth.user.name }}</span>
                        </div>
                        <div class="flex space-x-4 bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
                            <div class="flex flex-col">
                                <span class="text-[10px] text-gray-500 uppercase font-bold">Crédits</span>
                                <span class="text-sm font-mono text-gray-200">{{ $page.props.auth.user.credits }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[10px] text-orange-500/80 uppercase font-bold">Uridium</span>
                                <span class="text-sm font-mono text-orange-400">{{ $page.props.auth.user.uridium }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <!-- Mechs Section -->
            <section>
                <h2 class="text-2xl font-bold uppercase tracking-widest text-white mb-6 border-b border-gray-700 pb-2 flex items-center">
                    <span class="w-3 h-3 bg-cyan-500 mr-3 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                    Châssis Mechs
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="mech in mechs" :key="mech.id" class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg hover:border-cyan-500/50 transition-colors group flex flex-col">
                        <div class="p-6 flex-grow">
                            <div class="flex justify-between items-start mb-4">
                                <h3 class="text-xl font-bold text-cyan-400 uppercase tracking-wider">{{ mech.name }}</h3>
                                <div class="bg-gray-900 px-3 py-1 rounded text-sm font-mono text-gray-300 border border-gray-700">
                                    {{ mech.price }} C
                                </div>
                            </div>
                            
                            <div class="space-y-3 mt-6">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Intégrité (HP)</span>
                                    <span class="font-mono text-white">{{ mech.base_hp }}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Armure</span>
                                    <span class="font-mono text-white">{{ mech.base_armor }}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Vitesse</span>
                                    <span class="font-mono text-white">{{ mech.base_speed }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="p-4 border-t border-gray-700 bg-gray-900/50">
                            <button @click="buyItem(mech, 'mech')" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors uppercase tracking-wider text-sm shadow-[0_0_10px_rgba(8,145,178,0.4)]">
                                Acheter
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Weapons Section -->
            <section>
                <h2 class="text-2xl font-bold uppercase tracking-widest text-white mb-6 border-b border-gray-700 pb-2 flex items-center">
                    <span class="w-3 h-3 bg-orange-500 mr-3 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
                    Armement
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="weapon in weapons" :key="weapon.id" class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg hover:border-orange-500/50 transition-colors group flex flex-col">
                        <div class="p-6 flex-grow">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-xl font-bold text-orange-400 uppercase tracking-wider">{{ weapon.name }}</h3>
                                <div class="bg-gray-900 px-3 py-1 rounded text-sm font-mono text-gray-300 border border-gray-700">
                                    {{ weapon.price }} C
                                </div>
                            </div>
                            <span class="inline-block text-xs uppercase tracking-widest text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800 mb-4">{{ weapon.type }}</span>
                            
                            <div class="space-y-3">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Dégâts</span>
                                    <span class="font-mono text-white">{{ weapon.damage }}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Cadence (ms)</span>
                                    <span class="font-mono text-white">{{ weapon.fire_rate }}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Capacité Mun.</span>
                                    <span class="font-mono text-white">{{ weapon.ammo_capacity }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="p-4 border-t border-gray-700 bg-gray-900/50">
                            <button @click="buyItem(weapon, 'weapon')" class="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded transition-colors uppercase tracking-wider text-sm shadow-[0_0_10px_rgba(234,88,12,0.4)]">
                                Acheter
                            </button>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    </div>
</template>
