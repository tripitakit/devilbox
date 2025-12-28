import Phaser from 'phaser';
import Chamber from '../objects/Chamber.js';
import Door from '../objects/Door.js';
import ParticleManager from '../managers/ParticleManager.js';
import EntropyManager from '../managers/EntropyManager.js';
import InputManager from '../managers/InputManager.js';
import { audioManager } from '../managers/AudioManager.js';
import { getLevelById } from '../config/levelConfig.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.levelId = data.level || 1;
    this.levelConfig = getLevelById(this.levelId);
    this.isGameOver = false;
    this.isPaused = false;
    this.elapsedTime = 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Start background music (audio already initialized from menu)
    audioManager.startMusic(this.levelId);

    // Create chamber
    this.chamber = new Chamber(this, width / 2, height / 2 + 30);

    // Create door with audio callbacks
    this.door = new Door(this, this.chamber.getCenterX(), height / 2 + 30);

    // Create particle manager and spawn particles
    this.particleManager = new ParticleManager(this);
    this.particleManager.spawnParticles(
      this.levelConfig.particleCount,
      this.levelConfig.particleSpeed,
      this.chamber
    );

    // Create entropy manager
    this.entropyManager = new EntropyManager(this);

    // Setup collisions with audio
    this.setupCollisions();

    // Setup input with audio
    this.inputManager = new InputManager(
      this,
      () => {
        this.door.open();
        audioManager.playDoorOpen();
      },
      () => {
        this.door.close();
        audioManager.playDoorClose();
      }
    );

    // Launch UI scene
    this.scene.launch('UIScene', {
      levelId: this.levelId,
      levelName: this.levelConfig.name,
      timeLimit: this.levelConfig.timeLimit
    });

    // Listen for pause
    this.events.on('pauseRequested', () => {
      if (!this.isGameOver) {
        this.pauseGame();
      }
    });

    // Listen for resume from pause scene
    this.events.on('resume', () => {
      this.isPaused = false;
      this.physics.resume();
      audioManager.startMusic(this.levelId);
    });
  }

  setupCollisions() {
    const particleGroup = this.particleManager.getGroup();
    const particleArray = particleGroup.getChildren();

    // Particles collide with chamber walls - low "boing" sound
    this.physics.add.collider(
      particleArray,
      this.chamber.walls,
      this.onWallCollision,
      null,
      this
    );

    // Particles collide with door blocker when closed
    this.physics.add.collider(
      particleArray,
      this.door.getBlocker(),
      this.onWallCollision,
      null,
      this
    );

    // Particles collide with each other - energy-based sound
    this.physics.add.collider(
      particleArray,
      particleArray,
      this.onParticleCollision,
      null,
      this
    );
  }

  onWallCollision(particle, wall) {
    // Calculate velocity for sound intensity
    const velocity = Math.sqrt(
      particle.body.velocity.x ** 2 + particle.body.velocity.y ** 2
    );
    audioManager.playWallBounce(velocity);
  }

  onParticleCollision(particle1, particle2) {
    // Calculate relative velocity (energy exchanged)
    const relVelX = particle1.body.velocity.x - particle2.body.velocity.x;
    const relVelY = particle1.body.velocity.y - particle2.body.velocity.y;
    const relSpeed = Math.sqrt(relVelX ** 2 + relVelY ** 2);

    // Energy exchanged is proportional to relative velocity squared
    const energyExchanged = (relSpeed * relSpeed) / (this.levelConfig.particleSpeed ** 2);

    audioManager.playParticleCollision(energyExchanged);
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    // Update elapsed time
    this.elapsedTime += delta / 1000;

    // Calculate entropy
    const entropy = this.entropyManager.calculateEntropy(
      this.particleManager,
      this.chamber.getCenterX()
    );

    // Send updates to UI
    this.events.emit('updateUI', {
      entropy: entropy,
      time: this.elapsedTime,
      counts: this.particleManager.countByColorAndSide(this.chamber.getCenterX())
    });

    // Check win condition
    if (this.particleManager.checkWinCondition(this.chamber.getCenterX())) {
      this.onWin();
    }

    // Check time limit
    if (this.levelConfig.timeLimit && this.elapsedTime >= this.levelConfig.timeLimit) {
      this.onTimeUp();
    }
  }

  pauseGame() {
    this.isPaused = true;
    this.physics.pause();
    this.inputManager.forceClose();
    audioManager.stopMusic();
    this.scene.launch('PauseScene', { levelId: this.levelId });
  }

  onWin() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.physics.pause();
    this.inputManager.forceClose();

    // Play victory sound
    audioManager.playLevelComplete();

    // Calculate stars based on time
    const stars = this.calculateStars(this.elapsedTime);

    // Save progress
    this.saveProgress(stars);

    // Delay before showing game over
    this.time.delayedCall(1000, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene', {
        won: true,
        levelId: this.levelId,
        time: this.elapsedTime,
        stars: stars
      });
    });
  }

  onTimeUp() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.physics.pause();
    this.inputManager.forceClose();
    audioManager.stopMusic();

    this.time.delayedCall(500, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene', {
        won: false,
        levelId: this.levelId,
        time: this.elapsedTime,
        stars: 0
      });
    });
  }

  calculateStars(time) {
    const thresholds = this.levelConfig.starThresholds.time;
    if (time <= thresholds[2]) return 3;
    if (time <= thresholds[1]) return 2;
    if (time <= thresholds[0]) return 1;
    return 1; // Always at least 1 star for winning
  }

  saveProgress(stars) {
    const progress = JSON.parse(localStorage.getItem('devilbox_save') || '{}');

    // Update level score if better
    const existingScore = progress.levelScores?.[this.levelId];
    if (!existingScore || stars > existingScore.stars ||
        (stars === existingScore.stars && this.elapsedTime < existingScore.time)) {
      progress.levelScores = progress.levelScores || {};
      progress.levelScores[this.levelId] = {
        time: this.elapsedTime,
        stars: stars
      };
    }

    // Unlock next level
    const nextLevel = this.levelId + 1;
    progress.unlockedLevels = progress.unlockedLevels || [1];
    if (!progress.unlockedLevels.includes(nextLevel)) {
      progress.unlockedLevels.push(nextLevel);
    }

    // Update current level
    if (nextLevel > (progress.currentLevel || 1)) {
      progress.currentLevel = nextLevel;
    }

    localStorage.setItem('devilbox_save', JSON.stringify(progress));
  }

  shutdown() {
    audioManager.stopMusic();
    if (this.inputManager) {
      this.inputManager.destroy();
    }
    this.events.off('pauseRequested');
    this.events.off('resume');
  }
}
