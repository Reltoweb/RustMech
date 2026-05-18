import Phaser from 'phaser';

export default class Portal extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, width, height, direction) {
        // Draw a simple glowing rectangle for the portal
        const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x06b6d4, 0.5); // Cyan semi-transparent
        graphics.lineStyle(2, 0x06b6d4, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.strokeRect(0, 0, width, height);
        graphics.generateTexture(`portal_${direction}`, width, height);
        
        super(scene, x, y, `portal_${direction}`);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.direction = direction;
        
        // Portals are static sensors
        this.setImmovable(true);
        this.body.pushable = false;
        
        // Add a slight glow/pulse effect
        scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
}
