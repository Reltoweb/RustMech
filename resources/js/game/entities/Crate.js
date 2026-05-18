import Phaser from 'phaser';

export default class Crate extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'crate');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.hp = 100;
        
        // Physics properties
        this.setImmovable(true);
        // Crates shouldn't bounce too much or move when hit by lasers
        this.body.pushable = false; 
    }

    takeDamage(amount) {
        this.hp -= amount;

        // Visual feedback (flash red)
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint();
        });

        if (this.hp <= 0) {
            this.destroy(); // Remove completely
        }
    }

    destroy(fromScene) {
        if (this.scene && this.scene.explosionEmitter) {
            this.scene.explosionEmitter.emitParticleAt(this.x, this.y, 30);
        }
        super.destroy(fromScene);
    }
}
