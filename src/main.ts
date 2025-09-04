import { AudioManager } from "./AudioManager";
import { SnakeGame } from "./SnakeGame";
import "./style.css";

window.addEventListener("load", (): void => {
  try {
    new SnakeGame();
    new AudioManager();
  } catch (error) {
    console.error("Failed to initialize Snake Game:", error);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  AudioManager.initVolumeControl("volumeSlider");

  const display = document.getElementById("volumeDisplay");
  if (display) {
    display.textContent =
      Math.round(AudioManager.getMasterVolume() * 100) + "%";
  }
});
