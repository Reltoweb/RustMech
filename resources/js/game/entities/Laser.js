import Phaser from 'phaser';

export default class Laser extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'laser');
        this.setBlendMode(Phaser.BlendModes.ADD); // Glow effect
    }

    fire(x, y, angle) {
        this.enableBody(true, x, y, true, true);
        
        // Offset rotation to visually match the sprite's forward direction if needed
        this.setRotation(angle);

        // Calculate velocity based on angle
        const speed = 800; // Fast projectile speed
        this.scene.physics.velocityFromRotation(angle, speed, this.body.velocity);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Despawn logic: Out of bounds
        // The bounds check can be simple bounds or world bounds. 
        if (
            this.y <= 0 || 
            this.y >= this.scene.physics.world.bounds.height ||
            this.x <= 0 || 
            this.x >= this.scene.physics.world.bounds.width
        ) {
            this.disableBody(true, true);
        }
    }
}
