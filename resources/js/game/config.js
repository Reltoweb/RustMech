import Phaser from 'phaser';
import ArenaScene from './scenes/ArenaScene';

export default {
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        width: '100%',
        height: '100%'
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            fps: 60,
            debug: false
        }
    },
    scene: [ArenaScene],
    backgroundColor: '#0f172a' // Tailwind slate-900
};
