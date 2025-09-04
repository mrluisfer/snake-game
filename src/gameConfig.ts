export const GAME_CONFIG = {
  GRID_SIZE: 20,
  MIN_GAME_SPEED: 50,
  MAX_GAME_SPEED: 150,
  INITIAL_SNAKE_POS: { x: 10, y: 10 },
  HIGH_SCORE_KEY: "snakeHighScore",
  FOOD_EMOJIS: [
    { emoji: "🍎", points: 10 },
    { emoji: "🍰", points: 15 },
    { emoji: "🍌", points: 10 },
    { emoji: "🍕", points: 20 },
    { emoji: "🍓", points: 12 },
    { emoji: "🥕", points: 8 },
    { emoji: "🍇", points: 10 },
    { emoji: "🍊", points: 10 },
  ],
} as const;
