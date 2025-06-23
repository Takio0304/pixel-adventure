# Phaser.js Game Project - Super Mario Clone

## Project Overview
This is a Phaser.js game project intended to create a platformer game similar to Super Mario. The project is currently in its initial setup phase.

## Technology Stack
- **Framework**: Phaser.js 3 (JavaScript game framework)
- **Game Type**: 2D Platformer
- **Inspiration**: Super Mario Bros style gameplay

## Project Structure (Planned)
```
game-project/
├── index.html          # Main HTML file to run the game
├── src/
│   ├── main.js        # Game initialization and configuration
│   ├── scenes/        # Game scenes (menu, levels, game over, etc.)
│   ├── entities/      # Player, enemies, and other game objects
│   ├── utils/         # Helper functions and utilities
│   └── config/        # Game configuration files
├── assets/
│   ├── images/        # Sprites, backgrounds, tiles
│   ├── audio/         # Sound effects and music
│   └── tilemaps/      # Level design files
├── package.json       # Node.js dependencies
└── CLAUDE.md          # This file
```

## Game Features (Planned)
- **Player Character**: Controllable character with jump, run, and power-up abilities
- **Enemies**: Various enemy types with different behaviors
- **Power-ups**: Items that enhance player abilities (similar to mushrooms, fire flowers)
- **Levels**: Multiple scrolling levels with platforms, obstacles, and secrets
- **Physics**: Gravity, collision detection, and platforming mechanics
- **Score System**: Points for collecting items and defeating enemies
- **Lives System**: Limited lives with game over functionality

## Development Status
**Current Status**: Initial project setup
- [ ] Set up Phaser.js environment
- [ ] Create basic HTML structure
- [ ] Initialize package.json with dependencies
- [ ] Create basic game configuration
- [ ] Implement player character with basic movement
- [ ] Design first level
- [ ] Add enemies and collision detection
- [ ] Implement power-up system
- [ ] Add UI elements (score, lives, timer)
- [ ] Create multiple levels
- [ ] Add sound effects and music
- [ ] Polish and optimize performance

## Getting Started
Once the project is set up, you'll be able to run the game by:
1. Installing dependencies: `npm install`
2. Starting a local server: `npm start` (or use a simple HTTP server)
3. Opening `index.html` in a web browser

## Key Concepts for Development
- **Phaser.Scene**: Each game state (menu, gameplay, game over) is a scene
- **Phaser.Physics.Arcade**: Simple physics engine for platformer mechanics
- **Tilemaps**: Use Tiled editor or similar for level design
- **Sprite Animations**: Define animations for player and enemy movements
- **Input Handling**: Keyboard controls for player movement and actions

## Notes for Future Claude Instances
- This is a web-based game using Phaser.js 3
- The game should run in modern web browsers without plugins
- Focus on clean, modular code structure
- Consider mobile-friendly controls for future iterations
- Performance optimization is important for smooth gameplay
- The game should capture the feel of classic platformers while adding unique elements

## Resources
- [Phaser.js Documentation](https://phaser.io/docs)
- [Phaser.js Examples](https://phaser.io/examples)
- [Platformer Tutorial](https://phaser.io/tutorials/making-your-first-phaser-3-game)