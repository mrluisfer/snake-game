import type { Food, GameElements, Position } from "./types";
import { AudioManager } from "./AudioManager";
import { GAME_CONFIG } from "./gameConfig";
import { ParticleSystem } from "./ParticleSystem";
import { Colors } from "./Colors";

export class SnakeGame {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly tileCount: number;
  private readonly particleSystem: ParticleSystem;

  private snake: Position[] = [];
  private food!: Food;
  private dx!: number;
  private dy!: number;
  private score!: number;
  private highScore!: number;

  private gameRunning!: boolean;
  private gamePaused!: boolean;

  // DOM elements
  private readonly elements: GameElements;

  constructor() {
    this.canvas = this.initializeCanvas();
    this.ctx = this.initializeContext();
    this.tileCount = this.canvas.width / GAME_CONFIG.GRID_SIZE;

    this.particleSystem = new ParticleSystem(this.canvas);
    this.elements = this.initializeElements();

    this.resetGameState();
    this.bindEvents();
    this.updateScore();
  }

  private initializeCanvas(): HTMLCanvasElement {
    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    if (!canvas) {
      throw new Error("Canvas element with id 'gameCanvas' not found");
    }
    return canvas;
  }

  private initializeContext(): CanvasRenderingContext2D {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D context from canvas");
    }
    return ctx;
  }

  private initializeElements(): GameElements {
    const elementIds = {
      scoreElement: "score",
      highScoreElement: "highScore",
      finalScoreElement: "finalScore",
      gameOverElement: "gameOver",
      startScreenElement: "startScreen",
      startBtn: "startBtn",
      restartBtn: "restartBtn",
    };

    const elements: Partial<GameElements> = {};

    Object.entries(elementIds).forEach(([key, id]) => {
      const element = document.getElementById(id);
      if (!element) {
        throw new Error(`Element with id '${id}' not found`);
      }
      (elements as any)[key] = element;
    });

    return elements as GameElements;
  }

  private resetGameState(): void {
    this.snake = [{ ...GAME_CONFIG.INITIAL_SNAKE_POS }];
    this.dx = 0;
    this.dy = 0;
    this.score = 0;
    this.highScore = this.loadHighScore();
    this.gameRunning = false;
    this.gamePaused = false;
    this.generateFood();
  }

  private loadHighScore(): number {
    try {
      return parseInt(
        localStorage.getItem(GAME_CONFIG.HIGH_SCORE_KEY) || "0",
        10
      );
    } catch (error) {
      console.warn("Failed to load high score:", error);
      return 0;
    }
  }

  private saveHighScore(): void {
    try {
      localStorage.setItem(
        GAME_CONFIG.HIGH_SCORE_KEY,
        this.highScore.toString()
      );
    } catch (error) {
      console.warn("Failed to save high score:", error);
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  private bindEvents(): void {
    document.addEventListener("keydown", this.handleKeyPress.bind(this));
    this.elements.startBtn.addEventListener("click", () => this.startGame());
    this.elements.restartBtn.addEventListener("click", () =>
      this.restartGame()
    );
  }

  private handleKeyPress(e: KeyboardEvent): void {
    if (!this.gameRunning && e.code !== "Space") return;

    const keyActions: Record<string, () => void> = {
      ArrowUp: () => this.changeDirection(0, -1),
      ArrowDown: () => this.changeDirection(0, 1),
      ArrowLeft: () => this.changeDirection(-1, 0),
      ArrowRight: () => this.changeDirection(1, 0),
      Space: () => this.togglePause(),
    };

    const action = keyActions[e.code];
    if (action) {
      action();
      e.preventDefault();
    }
  }

  private changeDirection(newDx: number, newDy: number): void {
    // Prevent reverse direction
    if (newDx !== 0 && this.dx === 0) {
      this.dx = newDx;
      this.dy = 0;
    } else if (newDy !== 0 && this.dy === 0) {
      this.dx = 0;
      this.dy = newDy;
    }
  }

  private startGame(): void {
    this.gameRunning = true;
    this.gamePaused = false;
    this.elements.startScreenElement.classList.add("hidden");
    this.gameLoop();
  }

  private restartGame(): void {
    this.resetGameState();
    this.updateScore();
    this.elements.gameOverElement.classList.add("hidden");
    this.startGame();
  }

  private togglePause(): void {
    if (this.gameRunning) {
      this.gamePaused = !this.gamePaused;
      if (!this.gamePaused) {
        this.gameLoop();
      }
    }
  }

  private generateFood(): void {
    const randomFoodType =
      GAME_CONFIG.FOOD_EMOJIS[
        Math.floor(Math.random() * GAME_CONFIG.FOOD_EMOJIS.length)
      ];

    this.food = {
      x: Math.floor(Math.random() * this.tileCount),
      y: Math.floor(Math.random() * this.tileCount),
      emoji: randomFoodType.emoji,
      points: randomFoodType.points,
    };

    // Make sure food doesn't appear on the snake
    if (this.isFoodOnSnake()) {
      this.generateFood();
    }
  }

  private isFoodOnSnake(): boolean {
    return this.snake.some(
      (segment) => segment.x === this.food.x && segment.y === this.food.y
    );
  }

  private updateScore(): void {
    this.elements.scoreElement.textContent = this.score.toString();

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.elements.highScoreElement.textContent = this.highScore.toString();
      this.saveHighScore();
    } else {
      this.elements.highScoreElement.textContent = this.highScore.toString();
    }
  }

  private moveSnake(): void {
    const head: Position = {
      x: this.snake[0].x + this.dx,
      y: this.snake[0].y + this.dy,
    };

    this.snake.unshift(head);

    if (this.checkFoodCollision(head)) {
      this.handleFoodEaten();
    } else {
      this.snake.pop();
    }
  }

  private checkFoodCollision(head: Position): boolean {
    return head.x === this.food.x && head.y === this.food.y;
  }

  private handleFoodEaten(): void {
    this.score += this.food.points;
    this.updateScore();
    this.createFoodParticles();
    this.generateFood();
    AudioManager.playEatSound();
  }

  private createFoodParticles(): void {
    const centerX =
      this.food.x * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
    const centerY =
      this.food.y * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;

    for (let i = 0; i < 8; i++) {
      this.particleSystem.addParticle(centerX, centerY, Colors.primaryGreen);
    }
  }

  private checkCollision(): boolean {
    const head = this.snake[0];

    // Collision with walls
    if (this.isOutOfBounds(head)) {
      return true;
    }

    // If snake collides with itself
    return this.snake
      .slice(1)
      .some((segment) => head.x === segment.x && head.y === segment.y);
  }

  private isOutOfBounds(position: Position): boolean {
    return (
      position.x < 0 ||
      position.x >= this.tileCount ||
      position.y < 0 ||
      position.y >= this.tileCount
    );
  }

  private draw(): void {
    this.clearCanvas();
    this.drawGrid();
    this.drawSnake();
    this.drawFood();
    this.particleSystem.update();
    this.particleSystem.draw();

    if (this.gamePaused) {
      this.drawPauseIndicator();
    }
  }

  private clearCanvas(): void {
    this.ctx.fillStyle = Colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawSnake(): void {
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = Colors.accentGreen;

    this.snake.forEach((segment, index) => {
      if (index === 0) {
        this.ctx.fillStyle = Colors.primaryGreen;
        this.ctx.shadowBlur = 15;
      } else {
        this.ctx.fillStyle = Colors.secondaryGreen;
        this.ctx.shadowBlur = 5;
      }

      this.ctx.fillRect(
        segment.x * GAME_CONFIG.GRID_SIZE + 1,
        segment.y * GAME_CONFIG.GRID_SIZE + 1,
        GAME_CONFIG.GRID_SIZE - 2,
        GAME_CONFIG.GRID_SIZE - 2
      );
    });

    this.ctx.shadowBlur = 0;
  }

  private drawFood(): void {
    const pulse = Math.sin(Date.now() * 0.01) * 2;
    const x = this.food.x * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;
    const y = this.food.y * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2;

    this.ctx.save();
    this.ctx.font = `${GAME_CONFIG.GRID_SIZE + pulse}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(this.food.emoji, x, y);
    this.ctx.restore();
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = "rgba(0, 255, 0, 0.1)";
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= this.tileCount; i++) {
      const pos = i * GAME_CONFIG.GRID_SIZE;

      // Vertical Lines
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, this.canvas.height);
      this.ctx.stroke();

      // Horizontal Lines
      this.ctx.beginPath();
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(this.canvas.width, pos);
      this.ctx.stroke();
    }
  }

  private drawPauseIndicator(): void {
    this.ctx.fillStyle = "rgba(204, 255, 204, 0.8)";
    this.ctx.font = '20px "Press Start 2P"';
    this.ctx.textAlign = "center";
    this.ctx.fillText("PAUSED", this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.textAlign = "start";
  }

  private gameOver(): void {
    this.gameRunning = false;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.elements.highScoreElement.textContent = this.highScore.toString();
      this.saveHighScore();
    }

    this.elements.finalScoreElement.textContent = this.score.toString();
    this.elements.gameOverElement.classList.remove("hidden");
    AudioManager.playGameOverSound();
  }

  private calculateGameSpeed(): number {
    return Math.max(
      GAME_CONFIG.MIN_GAME_SPEED,
      GAME_CONFIG.MAX_GAME_SPEED - Math.min(this.score, 100)
    );
  }

  private gameLoop(): void {
    if (!this.gameRunning || this.gamePaused) return;

    setTimeout(() => {
      this.moveSnake();

      if (this.checkCollision()) {
        this.gameOver();
        return;
      }

      this.draw();
      this.gameLoop();
    }, this.calculateGameSpeed());
  }
}
