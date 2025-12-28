import Particle from '../objects/Particle.js';

export default class ParticleManager {
  constructor(scene) {
    this.scene = scene;
    // Use a regular group - particles already have their own physics bodies
    this.particles = scene.add.group();
  }

  spawnParticles(count, speed, chamber) {
    const redCount = Math.floor(count / 2);
    const blueCount = count - redCount;

    const leftBounds = chamber.getLeftBounds();
    const rightBounds = chamber.getRightBounds();
    const padding = 30;

    // Spawn red particles (randomly on either side)
    for (let i = 0; i < redCount; i++) {
      const side = Math.random() < 0.5 ? leftBounds : rightBounds;
      const x = Phaser.Math.FloatBetween(side.left + padding, side.right - padding);
      const y = Phaser.Math.FloatBetween(side.top + padding, side.bottom - padding);

      const particle = new Particle(this.scene, x, y, 'red');
      this.particles.add(particle);
      particle.setRandomVelocity(speed);
    }

    // Spawn blue particles (randomly on either side)
    for (let i = 0; i < blueCount; i++) {
      const side = Math.random() < 0.5 ? leftBounds : rightBounds;
      const x = Phaser.Math.FloatBetween(side.left + padding, side.right - padding);
      const y = Phaser.Math.FloatBetween(side.top + padding, side.bottom - padding);

      const particle = new Particle(this.scene, x, y, 'blue');
      this.particles.add(particle);
      particle.setRandomVelocity(speed);
    }

    return this.particles;
  }

  getAll() {
    return this.particles.getChildren();
  }

  getGroup() {
    return this.particles;
  }

  countByColorAndSide(centerX) {
    const counts = {
      redLeft: 0,
      redRight: 0,
      blueLeft: 0,
      blueRight: 0
    };

    this.particles.getChildren().forEach(particle => {
      const isLeft = particle.x < centerX;
      if (particle.color === 'red') {
        isLeft ? counts.redLeft++ : counts.redRight++;
      } else {
        isLeft ? counts.blueLeft++ : counts.blueRight++;
      }
    });

    return counts;
  }

  checkWinCondition(centerX) {
    const counts = this.countByColorAndSide(centerX);
    const totalRed = counts.redLeft + counts.redRight;
    const totalBlue = counts.blueLeft + counts.blueRight;

    // Win: All red on one side, all blue on the other
    const allRedLeft = counts.redLeft === totalRed && counts.blueRight === totalBlue;
    const allRedRight = counts.redRight === totalRed && counts.blueLeft === totalBlue;

    return allRedLeft || allRedRight;
  }

  destroy() {
    this.particles.destroy(true);
  }
}
