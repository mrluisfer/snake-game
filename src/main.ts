import { SnakeGame } from "./SnakeGame";
import "./style.css";

window.addEventListener("load", (): void => {
  try {
    new SnakeGame();
  } catch (error) {
    console.error("Failed to initialize Snake Game:", error);
  }
});
