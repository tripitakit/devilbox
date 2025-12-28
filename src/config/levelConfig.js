export const levels = [
  {
    id: 1,
    name: "Introduction",
    particleCount: 6,
    particleSpeed: 100,
    timeLimit: null,
    doorOpenDelay: 0,
    starThresholds: {
      time: [90, 60, 40]
    }
  },
  {
    id: 2,
    name: "Getting Warmer",
    particleCount: 10,
    particleSpeed: 120,
    timeLimit: null,
    doorOpenDelay: 0,
    starThresholds: {
      time: [120, 90, 60]
    }
  },
  {
    id: 3,
    name: "Under Pressure",
    particleCount: 14,
    particleSpeed: 140,
    timeLimit: 240,
    doorOpenDelay: 0,
    starThresholds: {
      time: [180, 140, 100]
    }
  },
  {
    id: 4,
    name: "Heat Wave",
    particleCount: 18,
    particleSpeed: 160,
    timeLimit: 300,
    doorOpenDelay: 100,
    starThresholds: {
      time: [220, 170, 120]
    }
  },
  {
    id: 5,
    name: "Chaos Theory",
    particleCount: 24,
    particleSpeed: 180,
    timeLimit: 360,
    doorOpenDelay: 150,
    starThresholds: {
      time: [280, 220, 160]
    }
  },
  {
    id: 6,
    name: "Brownian Motion",
    particleCount: 28,
    particleSpeed: 200,
    timeLimit: 420,
    doorOpenDelay: 150,
    starThresholds: {
      time: [340, 270, 200]
    }
  },
  {
    id: 7,
    name: "Entropy Rising",
    particleCount: 32,
    particleSpeed: 220,
    timeLimit: 480,
    doorOpenDelay: 180,
    starThresholds: {
      time: [400, 320, 240]
    }
  },
  {
    id: 8,
    name: "Thermal Storm",
    particleCount: 36,
    particleSpeed: 240,
    timeLimit: 540,
    doorOpenDelay: 180,
    starThresholds: {
      time: [450, 360, 280]
    }
  },
  {
    id: 9,
    name: "Absolute Zero",
    particleCount: 40,
    particleSpeed: 260,
    timeLimit: 600,
    doorOpenDelay: 200,
    starThresholds: {
      time: [500, 400, 320]
    }
  },
  {
    id: 10,
    name: "Maxwell's Challenge",
    particleCount: 50,
    particleSpeed: 280,
    timeLimit: 720,
    doorOpenDelay: 200,
    starThresholds: {
      time: [600, 480, 380]
    }
  }
];

export function getLevelById(id) {
  return levels.find(level => level.id === id) || levels[0];
}

export function getNextLevel(currentId) {
  const nextId = currentId + 1;
  return levels.find(level => level.id === nextId);
}
