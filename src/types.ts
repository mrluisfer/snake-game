export interface Position {
  x: number;
  y: number;
}

export interface Food extends Position {
  emoji: string;
  points: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  color: string;
}

export type Direction = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

export interface GameElements {
  scoreElement: HTMLElement;
  highScoreElement: HTMLElement;
  finalScoreElement: HTMLElement;
  gameOverElement: HTMLElement;
  startScreenElement: HTMLElement;
  startBtn: HTMLButtonElement;
  restartBtn: HTMLButtonElement;

  // Key Controls if the user play with only mouse
  keyUp: HTMLElement;
  keyDown: HTMLElement;
  keyLeft: HTMLElement;
  keyRight: HTMLElement;
  keySpace: HTMLElement;
}

export interface VolumeControlElements {
  eatSound: HTMLButtonElement;
  gameOverSound: HTMLButtonElement;
  muteBtn: HTMLButtonElement;
}
