<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import { usePage } from '@inertiajs/vue3';
import Phaser from 'phaser';
import gameConfig from '../../game/config';

let gameInstance = null;
let channel = null;
const page = usePage();
const currentRoomId = ref(1);

const user = computed(() => page.props.auth.user);
const activeMechName = computed(() => page.props.activeMech?.mech?.name || 'Ranger');

const joinRoom = (roomId) => {
    if (channel) {
        window.Echo.leave(`arena.${currentRoomId.value}`);
    }
    
    currentRoomId.value = roomId;
    channel = window.Echo.join(`arena.${roomId}`);
    
    if (gameInstance) {
        gameInstance.registry.set('channel', channel);
    }
};

const switchRoom = (direction) => {
    // Calculate new spawn positions based on the direction the player went
    const arenaWidth = 1920;
    const arenaHeight = 1080;
    let spawnX, spawnY;
    let nextRoomId = currentRoomId.value;

    switch(direction) {
        case 'right':
            nextRoomId++;
            spawnX = 50;
            spawnY = arenaHeight / 2;
            break;
        case 'left':
            nextRoomId = Math.max(1, nextRoomId - 1); // Prevent room 0
            spawnX = arenaWidth - 50;
            spawnY = arenaHeight / 2;
            break;
        case 'bottom':
            nextRoomId += 10; // e.g., move to a room 'below'
            spawnX = arenaWidth / 2;
            spawnY = 50;
            break;
        case 'top':
            nextRoomId = Math.max(1, nextRoomId - 10);
            spawnX = arenaWidth / 2;
            spawnY = arenaHeight - 50;
            break;
    }

    joinRoom(nextRoomId);

    // Restart the scene with new spawn coordinates
    const scene = gameInstance.scene.getScene('ArenaScene');
    scene.scene.restart({ spawnX, spawnY });
};

onMounted(() => {
    // Initialize Phaser game
    gameInstance = new Phaser.Game(gameConfig);
    gameInstance.registry.set('user', user.value);
    gameInstance.registry.set('activeMech', page.props.activeMech);

    joinRoom(currentRoomId.value);

    // Listen for events from Phaser
    gameInstance.events.on('step', () => {
        const scene = gameInstance.scene.getScene('ArenaScene');
        if (scene && !scene.vueListenerAdded) {
            scene.events.on('requestRoomChange', (direction) => {
                switchRoom(direction);
            });
            scene.events.on('updateCredits', (newCredits) => {
                page.props.auth.user.credits = newCredits;
            });
            scene.events.on('localPlayerDestroyed', () => {
                // Wait 3 seconds then redirect to garage
                setTimeout(() => {
                    window.location.href = '/garage';
                }, 3000);
            });
            scene.vueListenerAdded = true;
        }
    });
});

onUnmounted(() => {
    // Leave channel
    if (channel) {
        window.Echo.leave(`arena.${currentRoomId.value}`);
    }
    // Destroy Phaser instance to prevent memory leaks in SPA
    if (gameInstance) {
        gameInstance.destroy(true);
        gameInstance = null;
    }
});
</script>

<template>
    <div class="relative w-screen h-screen overflow-hidden bg-black font-mono select-none">
        <!-- Dark Web HUD Overlay -->
        <div class="absolute top-0 left-0 w-full z-10 pointer-events-none p-6 flex justify-between items-start text-cyan-400">
            <!-- Top Left: Player Info & Stats -->
            <div class="flex flex-col gap-2">
                <div class="text-xs uppercase tracking-widest text-cyan-200 opacity-70">Pilot ID: {{ user.id }}</div>
                <div class="text-2xl font-bold tracking-wider text-white shadow-cyan-500/50 drop-shadow-md">PLAYER 1</div>
                <div class="flex gap-4 mt-2 border-l-2 border-cyan-500 pl-3">
                    <div>
                        <div class="text-xs text-cyan-600/80">CREDITS</div>
                        <div class="text-xl text-yellow-400 font-bold">{{ user.credits }}</div>
                    </div>
                    <div>
                        <div class="text-xs text-cyan-600/80">URIDIUM</div>
                        <div class="text-xl text-cyan-300 font-bold">{{ user.uridium }}</div>
                    </div>
                </div>
            </div>

            <!-- Top Right: Hangar Button & Mech Info -->
            <div class="flex flex-col items-end gap-3 pointer-events-auto">
                <Link href="/garage" class="group relative px-6 py-2 bg-slate-900 border border-cyan-800 hover:border-cyan-400 text-cyan-300 hover:text-cyan-100 font-medium tracking-widest text-sm uppercase transition-all overflow-hidden">
                    <div class="absolute inset-0 w-full h-full bg-cyan-900/20 group-hover:bg-cyan-500/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>
                    <div class="relative flex items-center">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        Hangar
                    </div>
                </Link>
                <div class="text-right border-r-2 border-orange-500 pr-3 mt-2">
                    <div class="text-xs text-orange-400/80 uppercase">Active Frame</div>
                    <div class="text-lg text-white font-bold tracking-wide">{{ activeMechName }}</div>
                </div>
            </div>
        </div>

        <!-- Scanner / Grid Overlay effect (optional subtlety) -->
        <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/60 z-0"></div>

        <!-- Phaser Canvas Container -->
        <div id="game-container" class="w-full h-full"></div>
    </div>
</template>
