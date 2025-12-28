export default class EntropyManager {
  constructor(scene) {
    this.scene = scene;
    this.currentEntropy = 1;
  }

  calculateEntropy(particleManager, centerX) {
    const counts = particleManager.countByColorAndSide(centerX);
    const leftTotal = counts.redLeft + counts.blueLeft;
    const rightTotal = counts.redRight + counts.blueRight;

    if (leftTotal === 0 || rightTotal === 0) {
      this.currentEntropy = 0;
      return 0;
    }

    // Calculate proportion of red on each side
    const pRedLeft = leftTotal > 0 ? counts.redLeft / leftTotal : 0;
    const pRedRight = rightTotal > 0 ? counts.redRight / rightTotal : 0;

    // Binary entropy for each side
    const entropyLeft = this.binaryEntropy(pRedLeft);
    const entropyRight = this.binaryEntropy(pRedRight);

    // Weighted average
    const total = leftTotal + rightTotal;
    this.currentEntropy = (entropyLeft * leftTotal + entropyRight * rightTotal) / total;

    return this.currentEntropy;
  }

  binaryEntropy(p) {
    if (p === 0 || p === 1) return 0;
    return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
  }

  getEntropy() {
    return this.currentEntropy;
  }
}
