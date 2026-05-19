import Phaser from 'phaser';
import PlayerMech from '../entities/PlayerMech';
import OtherMech from '../entities/OtherMech';
import Laser from '../entities/Laser';
import Crate from '../entities/Crate';
import Portal from '../entities/Portal';

export default class ArenaScene extends Phaser.Scene {
    constructor() {
        super('ArenaScene');
    }

    preload() {
        // Preload assets (with fallbacks handled if missing)
        this.load.image('mech_ranger', '/assets/images/ranger.png');
        this.load.image('mech_defender', '/assets/images/defender.png');
        this.load.image('mech_hunter', '/assets/images/hunter.png');
        this.load.image('bg_floor', '/assets/images/floor.png');
        
        // Create fallbacks just in case the images fail to load
        this.createFallbacks();
    }

    createFallbacks() {
        // Ranger (Balanced, Hexagon, Gunmetal + Neon Orange)
        const rangerG = this.make.graphics({ x: 0, y: 0, add: false });
        rangerG.lineStyle(3, 0xf97316, 1);
        rangerG.fillStyle(0x4b5563, 1);
        rangerG.beginPath();
        rangerG.moveTo(25, 0); rangerG.lineTo(50, 15); rangerG.lineTo(50, 35);
        rangerG.lineTo(25, 50); rangerG.lineTo(0, 35); rangerG.lineTo(0, 15);
        rangerG.closePath();
        rangerG.fillPath(); rangerG.strokePath();
        // Visor
        rangerG.fillStyle(0xf97316, 1);
        rangerG.fillTriangle(25, 5, 40, 20, 25, 20);
        rangerG.generateTexture('fallback_ranger', 50, 50);

        // Defender (Tank, Rectangle, Dark Metal + Crimson)
        const defenderG = this.make.graphics({ x: 0, y: 0, add: false });
        defenderG.lineStyle(4, 0xdc2626, 1);
        defenderG.fillStyle(0x1f2937, 1);
        defenderG.fillRect(0, 0, 60, 40);
        defenderG.strokeRect(0, 0, 60, 40);
        // Visor
        defenderG.fillStyle(0xdc2626, 1);
        defenderG.fillRect(45, 10, 10, 20);
        defenderG.generateTexture('fallback_defender', 60, 40);

        // Hunter (Fast, Triangle, Carbon Black + Cyan)
        const hunterG = this.make.graphics({ x: 0, y: 0, add: false });
        hunterG.lineStyle(2, 0x06b6d4, 1);
        hunterG.fillStyle(0x0f172a, 1);
        hunterG.fillTriangle(0, 0, 40, 15, 0, 30);
        hunterG.strokeTriangle(0, 0, 40, 15, 0, 30);
        hunterG.generateTexture('fallback_hunter', 40, 30);

        // Laser Placeholder
        const laserGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        laserGraphics.fillStyle(0x06b6d4, 1); // Cyan laser
        laserGraphics.fillRect(0, 0, 24, 4);  
        laserGraphics.generateTexture('laser', 24, 4);
        
        // Particle Placeholder
        const particleG = this.make.graphics({ x: 0, y: 0, add: false });
        particleG.fillStyle(0xffffff, 1);
        particleG.fillCircle(4, 4, 4);
        particleG.generateTexture('particle', 8, 8);

        // Crate Placeholder
        const crateGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        crateGraphics.lineStyle(2, 0xeab308, 1); // Yellow border
        crateGraphics.fillStyle(0x422006, 1);    // Dark brown fill
        crateGraphics.fillRect(0, 0, 50, 50);
        crateGraphics.strokeRect(0, 0, 50, 50);
        crateGraphics.beginPath();
        crateGraphics.moveTo(0, 0); crateGraphics.lineTo(50, 50);
        crateGraphics.moveTo(50, 0); crateGraphics.lineTo(0, 50);
        crateGraphics.strokePath();
        crateGraphics.generateTexture('crate', 50, 50);
        
        // Floor tile fallback
        const floorG = this.make.graphics({ x: 0, y: 0, add: false });
        floorG.fillStyle(0x0f172a, 1);
        floorG.fillRect(0, 0, 100, 100);
        floorG.lineStyle(1, 0x1e293b, 1);
        floorG.strokeRect(0, 0, 100, 100);
        floorG.generateTexture('fallback_floor', 100, 100);
    }

    init(data) {
        // Retrieve spawn position passed when starting the scene
        this.spawnX = data.spawnX !== undefined ? data.spawnX : 1920 / 2;
        this.spawnY = data.spawnY !== undefined ? data.spawnY : 1080 / 2;
    }

    create() {
        const arenaWidth = 1920;
        const arenaHeight = 1080;
        
        // Set world bounds to closed arena
        this.physics.world.setBounds(0, 0, arenaWidth, arenaHeight);

        // Add tiled floor
        this.floor = this.add.tileSprite(arenaWidth/2, arenaHeight/2, arenaWidth, arenaHeight, this.textures.exists('bg_floor') ? 'bg_floor' : 'fallback_floor');

        // Setup Laser Pool
        this.lasers = this.physics.add.group({
            classType: Laser,
            maxSize: 30,
            runChildUpdate: true
        });

        // Setup Explosion Emitter
        this.explosionEmitter = this.add.particles(0, 0, this.textures.exists('particle') ? 'particle' : 'fallback_particle', {
            lifespan: 600,
            speed: { min: 100, max: 300 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            blendMode: 'ADD',
            tint: [0xf97316, 0xeab308, 0xff0000],
            emitting: false
        });

        // Instantiate Player
        this.player = new PlayerMech(this, this.spawnX, this.spawnY, this.lasers);
        
        // Setup camera to follow the player
        this.cameras.main.setBounds(0, 0, arenaWidth, arenaHeight);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05);

        // Setup Other Players Group
        this.otherPlayersGroup = this.physics.add.group();

        // Instantiate Portals
        this.portals = this.physics.add.group();
        
        // Top Portal
        this.portals.add(new Portal(this, arenaWidth/2, 10, 200, 20, 'top'));
        // Bottom Portal
        this.portals.add(new Portal(this, arenaWidth/2, arenaHeight - 10, 200, 20, 'bottom'));
        // Left Portal
        this.portals.add(new Portal(this, 10, arenaHeight/2, 20, 200, 'left'));
        // Right Portal
        this.portals.add(new Portal(this, arenaWidth - 10, arenaHeight/2, 20, 200, 'right'));

        // Instantiate Crates
        this.crates = this.physics.add.group();
        for (let i = 0; i < 5; i++) { // Reduced crates for smaller arena
            const x = Phaser.Math.Between(100, arenaWidth - 100);
            const y = Phaser.Math.Between(100, arenaHeight - 100);
            const crate = new Crate(this, x, y);
            this.crates.add(crate);
        }

        // Setup Collisions
        // Mech hits crates -> they act as solid walls
        this.physics.add.collider(this.player, this.crates);

        // Lasers hit crates
        this.physics.add.overlap(this.lasers, this.crates, this.handleLaserHitCrate, null, this);
        
        // Player hits portal
        this.physics.add.overlap(this.player, this.portals, this.handlePlayerHitPortal, null, this);
        
        // Lasers hit other players
        this.physics.add.overlap(this.lasers, this.otherPlayersGroup, this.handleLaserHitOtherPlayer, null, this);

        // Multiplayer logic
        this.otherPlayers = {};
        this.channel = this.registry.get('channel');
        this.currentUser = this.registry.get('user');

        if (this.channel) {
            this.channel
                .here((users) => {
                    users.forEach(user => {
                        if (user.id !== this.currentUser.id) {
                            this.addOtherPlayer(user);
                        }
                    });
                })
                .joining((user) => {
                    this.addOtherPlayer(user);
                })
                .leaving((user) => {
                    this.removeOtherPlayer(user.id);
                })
                .listenForWhisper('playerMoved', (e) => {
                    const otherPlayer = this.otherPlayers[e.id];
                    if (otherPlayer) {
                        otherPlayer.targetX = e.x;
                        otherPlayer.targetY = e.y;
                        otherPlayer.targetRotation = e.rotation;
                    }
                })
                .listenForWhisper('playerFired', (e) => {
                    if (this.otherPlayers[e.id]) {
                        const laser = this.lasers.getFirstDead(false);
                        if (laser) {
                            laser.fire(e.x, e.y, e.angle);
                        }
                    }
                })
                .listenForWhisper('playerHit', (e) => {
                    if (e.targetId === this.currentUser.id) {
                        this.player.takeDamage(e.damage, e.attackerId);
                    } else if (this.otherPlayers[e.targetId]) {
                        // Show floating text for other players getting hit by someone else
                        this.showFloatingText(this.otherPlayers[e.targetId].x, this.otherPlayers[e.targetId].y, `-${e.damage}`, 0xff0000);
                    }
                })
                .listenForWhisper('playerDestroyed', (e) => {
                    // Check if local player was the attacker who destroyed this mech
                    if (e.attackerId === this.currentUser.id) {
                        // Call the API for reward
                        window.axios.post('/api/arena/reward/kill')
                            .then(response => {
                                // Find where the destroyed player was to show floating text
                                const deadMech = this.otherPlayers[e.targetId];
                                if (deadMech) {
                                    this.showFloatingText(deadMech.x, deadMech.y, `+${response.data.reward} Crédits!`, 0x00ff00);
                                    this.events.emit('updateCredits', response.data.credits);
                                }
                            })
                            .catch(error => console.error("Error claiming kill reward:", error));
                    }

                    // Remove the destroyed player from the local scene
                    this.removeOtherPlayer(e.targetId);
                });
        }

        // Listen for local player death
        this.events.on('playerDied', this.handlePlayerDeath, this);
    }

    showFloatingText(x, y, message, color) {
        const text = this.add.text(x, y, message, {
            fontSize: '16px',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        if (color !== undefined) {
            text.setTint(color);
        }

        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1500,
            ease: 'Power1',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    handlePlayerDeath(attackerId) {
        if (this.channel && this.currentUser) {
            this.channel.whisper('playerDestroyed', {
                targetId: this.currentUser.id,
                attackerId: attackerId
            });
        }

        // Show giant text
        const text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'MÉCA DÉTRUIT', {
            fontSize: '64px',
            fontFamily: 'sans-serif',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 8
        }).setOrigin(0.5).setScrollFactor(0);

        // Tell Vue component we died so it can disconnect and redirect
        this.events.emit('localPlayerDestroyed');
    }

    addOtherPlayer(user) {
        if (!this.otherPlayers[user.id]) {
            const otherPlayer = new OtherMech(this, 1500, 1500, user.id, user.name, user.mechName);
            this.otherPlayers[user.id] = otherPlayer;
            this.otherPlayersGroup.add(otherPlayer);
        }
    }

    removeOtherPlayer(id) {
        if (this.otherPlayers[id]) {
            this.otherPlayers[id].destroy();
            delete this.otherPlayers[id];
        }
    }

    handlePlayerHitPortal(player, portal) {
        // Prevent multiple triggers
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Stop player movement
        this.player.setVelocity(0);
        this.player.active = false; // Disable further inputs temporarily

        // Emit an event that Game.vue will listen to
        this.events.emit('requestRoomChange', portal.direction);
    }

    handleLaserHitCrate(laser, crate) {
        // Disable laser
        laser.disableBody(true, true);

        // Apply damage
        const damage = 50;
        crate.takeDamage(damage);
        this.showFloatingText(crate.x, crate.y, `-${damage}`, 0xffa500);

        if (crate.hp <= 0) {
            // Call API for reward
            window.axios.post('/api/arena/reward/crate')
                .then(response => {
                    this.showFloatingText(crate.x, crate.y, `+${response.data.reward} Crédits`, 0xffd700);
                    this.events.emit('updateCredits', response.data.credits);
                })
                .catch(error => console.error("Error claiming crate reward:", error));
        }
    }

    handleLaserHitOtherPlayer(laser, otherPlayer) {
        // Disable laser
        laser.disableBody(true, true);

        const damage = 50;
        // Show floating text locally
        this.showFloatingText(otherPlayer.x, otherPlayer.y, `-${damage}`, 0xff0000);

        // Broadcast damage to the network
        if (this.channel && this.currentUser) {
            this.channel.whisper('playerHit', {
                targetId: otherPlayer.playerId,
                damage: damage,
                attackerId: this.currentUser.id
            });
        }
    }

    // No need for a scene-level update method since logic is encapsulated in Game Objects
}
