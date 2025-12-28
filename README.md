# DevilBox - Maxwell's Demon Game

A web-based physics game inspired by Maxwell's Demon thought experiment. Control a door to sort particles and challenge entropy!

## About the Game

The setup is based on the famous Maxwell's Demon thought experiment:

- A box (chamber) is divided into two parts by a wall with a small door
- The box is filled with particles - 50% red and 50% blue
- You, the player, operate the door
- Your goal is to separate particles by color: allow only red particles to pass to one side and only blue particles to the other
- The result is a sorted box, with all red particles on one side and all blue particles on the other

> The increase in entropy caused by the player's own actions (energy consumption and information processing) always exceeds the decrease in entropy from sorting the particles, thus preserving the second law of thermodynamics.

## Tech Stack

- **[Phaser 3](https://phaser.io/)** - Game framework
- **[Vite](https://vitejs.dev/)** - Build tool and dev server

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The game will be available at `http://localhost:3032`

### Build

Create a production build:

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
src/
├── main.js        # Entry point
├── config/        # Game configuration
├── managers/      # Game state and system managers
├── objects/       # Game objects (particles, door, etc.)
├── scenes/        # Phaser scenes
├── ui/            # UI components
└── utils/         # Utility functions
```

## License

ISC
