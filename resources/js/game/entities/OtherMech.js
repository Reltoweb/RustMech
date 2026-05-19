import Phaser from 'phaser';

export default class OtherMech extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, id, name, mechName = 'ranger') {
        let textureKey = `mech_${mechName}`;
        if (!scene.textures.exists(textureKey)) {
            textureKey = `fallback_${mechName}`;
        }

        super(scene, x, y, textureKey);
        this.scene.add.existing(this);
        
        // No physics collision needed for now unless we add PvP collision
        // But let's add it to physics in case we want to check overlaps
        this.scene.physics.add.existing(this);

        this.playerId = id;
        this.playerName = name;
        
        // Target state for interpolation (lerp)
        this.targetX = x;
        this.targetY = y;
        this.targetRotation = 0;

        // Visual distinction (e.g., tint red for enemies)
        this.setTint(0xff5555);

        // Setup Thruster Particle Emitter
        this.thrusterEmitter = this.scene.add.particles(0, 0, this.scene.textures.exists('particle') ? 'particle' : 'fallback_particle', {
            speed: 50,
            lifespan: 300,
            scale: { start: 1.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            tint: 0xff0000, // Red for enemies
            emitting: false
        });

        // Add a simple nameplate
        this.nameText = this.scene.add.text(x, y - 40, name, {
            fontSize: '12px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Interpolate position and rotation towards target for smooth movement
        this.x = Phaser.Math.Linear(this.x, this.targetX, 0.2);
        this.y = Phaser.Math.Linear(this.y, this.targetY, 0.2);
        
        // Simple angle interpolation (can be tricky with wrapping, but this is okay for a start)
        this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, this.targetRotation, 0.2);

        // Handle Thruster VFX based on interpolation distance
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
        if (dist > 2) { // Threshold to prevent micro-stutters
            const backDistance = 25;
            const backX = this.x - Math.cos(this.rotation - Math.PI/2) * backDistance;
            const backY = this.y - Math.sin(this.rotation - Math.PI/2) * backDistance;
            
            this.thrusterEmitter.setPosition(backX, backY);
            const angle = Phaser.Math.RadToDeg(this.rotation - Math.PI/2) + 180;
            this.thrusterEmitter.setAngle({ min: angle - 15, max: angle + 15 });
            this.thrusterEmitter.start();
        } else {
            this.thrusterEmitter.stop();
        }

        // Update nameplate position
        this.nameText.setPosition(this.x, this.y - 40);
    }

    destroy(fromScene) {
        if (this.scene && this.scene.explosionEmitter) {
            this.scene.explosionEmitter.emitParticleAt(this.x, this.y, 30);
        }
        
        if (this.thrusterEmitter) {
            this.thrusterEmitter.destroy();
        }
        if (this.nameText) {
            this.nameText.destroy();
        }
        super.destroy(fromScene);
    }
}
