import type { VolumeControlElements } from "./types";

export class AudioManager {
  static masterVolume = 0.3;
  static volumeSlider: HTMLInputElement | null = null;
  static previousVolume = 0.3;

  // DOM Elements
  private readonly elements: VolumeControlElements;

  constructor() {
    this.elements = this.initializeElements();
    this.bindEvents();
  }

  private bindEvents(): void {
    const soundMap = {
      eatSound: () => AudioManager.playEatSound(),
      gameOverSound: () => AudioManager.playGameOverSound(),
      muteBtn: () => {
        AudioManager.toggleMute();
        this.elements.muteBtn?.classList.toggle("pressed");
        const isMuted = AudioManager.getMasterVolume() === 0;
        this.elements.muteBtn!.setAttribute(
          "aria-pressed",
          isMuted ? "true" : "false"
        );
        this.elements.muteBtn!.textContent = isMuted ? "🔊 Unmute" : "🔇 Mute";
      },
    };

    Object.entries(soundMap).forEach(([key, handler]) => {
      this.elements[key as keyof VolumeControlElements]?.addEventListener(
        "click",
        handler
      );
    });
  }

  private initializeElements(): VolumeControlElements {
    const elementIds = {
      eatSound: "eat-sound",
      gameOverSound: "game-over-sound",
      muteBtn: "mute-btn",
    };
    const elements: Partial<VolumeControlElements> = {};

    Object.entries(elementIds).forEach(([key, id]) => {
      const element = document.getElementById(id);
      if (!element) {
        throw new Error(`Element with id '${id}' not found`);
      }
      (elements as any)[key] = element;
    });

    return elements as VolumeControlElements;
  }

  static initVolumeControl(sliderId: string) {
    const slider = document.getElementById(sliderId) as HTMLInputElement;
    if (!slider || slider.type !== "range") {
      console.warn(
        `Element with ID "${sliderId}" not found or is not a range input`
      );
      return;
    }

    this.volumeSlider = slider;
    slider.min = "0";
    slider.max = "100";
    slider.value = String(this.masterVolume * 100);

    slider.addEventListener("input", (event) => {
      const target = event.target as HTMLInputElement | null;
      if (target && target.value !== undefined) {
        this.setMasterVolume(parseInt(target.value) / 100);
      }
    });
  }

  static setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));

    if (this.volumeSlider) {
      this.volumeSlider.value = String(this.masterVolume * 100);
    }

    const display = document.getElementById("volumeDisplay");
    if (display) {
      display.textContent = Math.round(this.masterVolume * 100) + "%";
    }
  }

  static getMasterVolume() {
    return this.masterVolume;
  }

  static toggleMute() {
    if (this.masterVolume > 0) {
      this.previousVolume = this.masterVolume;
      this.setMasterVolume(0);
    } else {
      this.setMasterVolume(this.previousVolume);
    }

    const muteBtn = document.getElementById("muteBtn");
    if (muteBtn) {
      muteBtn.textContent = this.masterVolume === 0 ? "🔊 Unmuted" : "🔇 Muted";
    }
  }

  static createAudioContext() {
    try {
      return new (window.AudioContext || window.AudioContext)();
    } catch (error) {
      console.warn("AudioContext not supported:", error);
      return null;
    }
  }

  static playEatSound() {
    if (this.masterVolume === 0) return;

    const audioContext = this.createAudioContext();
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "square";

      const adjustedVolume = 0.3 * this.masterVolume;
      gainNode.gain.setValueAtTime(adjustedVolume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01 * this.masterVolume,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn("Failed to play eat sound:", error);
    }
  }

  static playGameOverSound() {
    if (this.masterVolume === 0) return;

    const audioContext = this.createAudioContext();
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        200,
        audioContext.currentTime + 0.5
      );
      oscillator.type = "sawtooth";

      const adjustedVolume = 0.3 * this.masterVolume;
      gainNode.gain.setValueAtTime(adjustedVolume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01 * this.masterVolume,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn("Failed to play game over sound:", error);
    }
  }
}

export function playEatSound() {
  AudioManager.playEatSound();
}

export function playGameOverSound() {
  AudioManager.playGameOverSound();
}

export function toggleMute() {
  AudioManager.toggleMute();
}

export function setVolume(percentage: number) {
  AudioManager.setMasterVolume(percentage / 100);
}
