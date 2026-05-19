import Phaser from 'phaser';

export default class PlayerMech extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, laserGroup) {
        // Determine correct sprite key based on user data
        const currentUser = scene.registry.get('user');
        const activeMechName = scene.registry.get('activeMech')?.mech?.name?.toLowerCase() || 'ranger';
        
        let textureKey = `mech_${activeMechName}`;
        if (!scene.textures.exists(textureKey)) {
            textureKey = `fallback_${activeMechName}`;
        }
        
        super(scene, x, y, textureKey);
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.laserGroup = laserGroup;
        
        this.setCollideWorldBounds(true);

        this.speed = 300;
        this.lastFired = 0; // For cooldown tracking

        // Health and Stats
        this.maxHp = 1000;
        this.hp = this.maxHp;

        // Visual Health Bar
        this.healthBarBg = this.scene.add.graphics();
        this.healthBarFg = this.scene.add.graphics();
        this.updateHealthBar();

        // Network state
        this.channel = this.scene.registry.get('channel');
        this.currentUser = this.scene.registry.get('user');
        this.lastWhisperTime = 0;

        // Setup keyboard inputs (WASD / ZQSD)
        this.cursors = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            z: Phaser.Input.Keyboard.KeyCodes.Z,
            q: Phaser.Input.Keyboard.KeyCodes.Q
        });

        // Setup Thruster Particle Emitter
        this.thrusterEmitter = this.scene.add.particles(0, 0, this.scene.textures.exists('particle') ? 'particle' : 'fallback_particle', {
            speed: 50,
            lifespan: 300,
            scale: { start: 1.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            tint: 0xf97316, // Orange
            emitting: false
        });

        // Track mouse position directly for movement and firing
        this.targetRotation = 0;
        this.scene.input.on('pointermove', (pointer) => {
            this.targetRotation = Phaser.Math.Angle.Between(
                this.x, 
                this.y, 
                pointer.worldX, 
                pointer.worldY
            );
        });

        // Listen for firing
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.fireLaser();
            }
        });
    }

    fireLaser() {
        // Enforce 300ms cooldown
        if (this.scene.time.now < this.lastFired + 300) {
            return;
        }

        const laser = this.laserGroup.getFirstDead(false);

        if (laser) {
            // Calculate spawn position at the "front" of the mech.
            // Using targetRotation (which points toward mouse)
            // Mech size is roughly 40x40. We offset by ~25px to spawn at the nose.
            const spawnDistance = 25;
            const spawnX = this.x + Math.cos(this.targetRotation) * spawnDistance;
            const spawnY = this.y + Math.sin(this.targetRotation) * spawnDistance;

            laser.fire(spawnX, spawnY, this.targetRotation);
            
            this.lastFired = this.scene.time.now;

            // Broadcast firing event
            if (this.channel && this.currentUser) {
                this.channel.whisper('playerFired', {
                    id: this.currentUser.id,
                    x: spawnX,
                    y: spawnY,
                    angle: this.targetRotation
                });
            }
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Reset velocity
        this.setVelocity(0);

        // Handle movement
        if (this.cursors.up.isDown || this.cursors.z.isDown) {
            this.setVelocityY(-this.speed);
        } else if (this.cursors.down.isDown) {
            this.setVelocityY(this.speed);
        }

        if (this.cursors.left.isDown || this.cursors.q.isDown) {
            this.setVelocityX(-this.speed);
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(this.speed);
        }

        // Normalize velocity for diagonal movement
        this.body.velocity.normalize().scale(this.speed);

        // Handle rotation towards mouse
        // Note: The generated texture's "front" is at the top (0 degrees in texture space),
        // but Phaser 0 degrees is facing right. We add Math.PI / 2 to visually match.
        this.rotation = this.targetRotation + Math.PI / 2;

        // Note: We also must allow continuous firing if the mouse button is held down
        if (this.scene.input.activePointer.isDown && this.scene.input.activePointer.leftButtonDown()) {
            this.fireLaser();
        }

        // Handle Thruster VFX
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            // Position thruster at the back of the mech
            const backDistance = 25;
            const backX = this.x - Math.cos(this.targetRotation) * backDistance;
            const backY = this.y - Math.sin(this.targetRotation) * backDistance;
            
            this.thrusterEmitter.setPosition(backX, backY);
            // Angle opposite to movement
            const angle = Phaser.Math.RadToDeg(this.targetRotation) + 180;
            this.thrusterEmitter.setAngle({ min: angle - 15, max: angle + 15 });
            this.thrusterEmitter.start();
        } else {
            this.thrusterEmitter.stop();
        }

        // Update health bar position
        this.updateHealthBar();

        // Broadcast movement
        if (this.channel && this.currentUser && time > this.lastWhisperTime + 50) {
            // Only send if moving or rotating to save bandwidth
            if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0 || this.rotation !== this.lastSentRotation) {
                this.channel.whisper('playerMoved', {
                    id: this.currentUser.id,
                    x: this.x,
                    y: this.y,
                    rotation: this.rotation
                });
                this.lastWhisperTime = time;
                this.lastSentRotation = this.rotation;
            }
        }
    }

    updateHealthBar() {
        if (!this.active) return;
        
        const width = 50;
        const height = 6;
        const x = this.x - width / 2;
        const y = this.y - 40;

        this.healthBarBg.clear();
        this.healthBarBg.fillStyle(0x000000, 0.8);
        this.healthBarBg.fillRect(x, y, width, height);

        this.healthBarFg.clear();
        
        // Color based on percentage
        const percent = this.hp / this.maxHp;
        let color = 0x00ff00; // Green
        if (percent < 0.3) color = 0xff0000; // Red
        else if (percent < 0.6) color = 0xffff00; // Yellow

        this.healthBarFg.fillStyle(color, 1);
        this.healthBarFg.fillRect(x, y, width * percent, height);
    }

    takeDamage(amount, attackerId) {
        if (this.hp <= 0) return; // Already dead

        this.hp -= amount;
        this.updateHealthBar();

        // Flash red
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.active) this.clearTint();
        });
        
        // Show floating text
        if (this.scene.showFloatingText) {
            this.scene.showFloatingText(this.x, this.y, `-${amount}`, 0xff0000);
        }

        // Camera shake
        this.scene.cameras.main.shake(100, 0.005);

        if (this.hp <= 0) {
            this.die(attackerId);
        }
    }

    die(attackerId) {
        // Emit death event for the Scene/Vue to handle
        this.scene.events.emit('playerDied', attackerId);
        
        // Trigger Explosion
        if (this.scene.explosionEmitter) {
            this.scene.explosionEmitter.emitParticleAt(this.x, this.y, 30);
        }
        
        // Big camera shake on death
        this.scene.cameras.main.shake(300, 0.02);

        // Clean up graphics
        this.healthBarBg.destroy();
        this.healthBarFg.destroy();
        this.thrusterEmitter.stop();
        
        // Disable physics and hide
        this.disableBody(true, true);
    }

    destroy(fromScene) {
        if (this.healthBarBg) this.healthBarBg.destroy();
        if (this.healthBarFg) this.healthBarFg.destroy();
        if (this.thrusterEmitter) this.thrusterEmitter.destroy();
        super.destroy(fromScene);
    }
}
