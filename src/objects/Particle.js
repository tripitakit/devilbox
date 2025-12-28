import Phaser from 'phaser';
import { PARTICLE, COLORS } from '../utils/constants.js';

export default class Particle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, color) {
    const texture = color === 'red' ? 'particle-red' : 'particle-blue';
    super(scene, x, y, texture);

    this.color = color;
    this.scene = scene;
    this.baseSpeed = 100;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Create glow effect
    this.createGlow();

    // Physics configuration
    this.body.setBounce(1, 1);
    this.body.setCircle(PARTICLE.RADIUS);
    this.body.setOffset(16 - PARTICLE.RADIUS, 16 - PARTICLE.RADIUS);
    this.body.setMaxVelocity(PARTICLE.MAX_VELOCITY, PARTICLE.MAX_VELOCITY);
    this.body.setCollideWorldBounds(false);
    this.body.setDrag(0, 0);
    this.body.setAllowGravity(false);
  }

  createGlow() {
    const glowColor = this.color === 'red' ? COLORS.RED : COLORS.BLUE;

    // Create glow graphics
    this.glow = this.scene.add.graphics();
    this.glow.setDepth(-1); // Behind particle

    // Store glow color for updates
    this.glowColor = glowColor;
  }

  setRandomVelocity(speed) {
    this.baseSpeed = speed;
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    if (this.body) {
      this.body.setVelocity(vx, vy);
    }
  }

  getSpeed() {
    if (!this.body) return 0;
    return Math.sqrt(this.body.velocity.x ** 2 + this.body.velocity.y ** 2);
  }

  getEnergy() {
    // Kinetic energy proportional to velocity squared
    const speed = this.getSpeed();
    return (speed * speed) / (this.baseSpeed * this.baseSpeed);
  }

  updateGlow() {
    if (!this.glow || !this.active) return;

    this.glow.clear();

    const energy = this.getEnergy();
    const speed = this.getSpeed();

    // Only show glow when moving
    if (speed < 10) return;

    // Glow intensity based on energy (0 to 1, clamped)
    const intensity = Math.min(energy, 2) / 2;

    // Glow radius scales with energy
    const baseRadius = PARTICLE.RADIUS + 4;
    const glowRadius = baseRadius + intensity * 20;

    // Draw multiple layers for soft glow effect
    const layers = 4;
    for (let i = layers; i > 0; i--) {
      const layerRadius = baseRadius + (glowRadius - baseRadius) * (i / layers);
      const alpha = intensity * 0.15 * (1 - i / (layers + 1));

      this.glow.fillStyle(this.glowColor, alpha);
      this.glow.fillCircle(this.x, this.y, layerRadius);
    }
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.updateGlow();
  }

  getSide(centerX) {
    return this.x < centerX ? 'left' : 'right';
  }

  destroy(fromScene) {
    if (this.glow) {
      this.glow.destroy();
    }
    super.destroy(fromScene);
  }
}
