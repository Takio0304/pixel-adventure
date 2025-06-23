export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PHYSICS_CONFIG = {
    gravity: { y: 1000 },
    debug: false
};

export const PLAYER_CONFIG = {
    speed: 200,
    dashSpeed: 350,
    jumpVelocity: -600,
    maxJumps: 1,
    size: {
        small: { width: 16, height: 16 },
        big: { width: 16, height: 24 }
    }
};

export const COLORS = {
    sky: 0x87CEEB,
    ground: 0x8B7355,
    cave: 0x2F4F4F,
    castle: 0x696969
};