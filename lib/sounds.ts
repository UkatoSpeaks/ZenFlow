// Sound utilities for ZenFlow
// Generates notification sounds using Web Audio API

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

export type SoundType = 'notification' | 'break' | 'click' | 'success' | 'warning';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  fadeOut?: boolean;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig[]> = {
  notification: [
    { frequency: 587.33, duration: 0.15, type: 'sine', volume: 0.3, fadeOut: true }, // D5
    { frequency: 880, duration: 0.2, type: 'sine', volume: 0.3, fadeOut: true },     // A5
  ],
  break: [
    { frequency: 523.25, duration: 0.2, type: 'sine', volume: 0.25, fadeOut: true }, // C5
    { frequency: 659.25, duration: 0.2, type: 'sine', volume: 0.25, fadeOut: true }, // E5
    { frequency: 783.99, duration: 0.3, type: 'sine', volume: 0.25, fadeOut: true }, // G5
  ],
  click: [
    { frequency: 1000, duration: 0.05, type: 'square', volume: 0.1 },
  ],
  success: [
    { frequency: 523.25, duration: 0.1, type: 'sine', volume: 0.2 },  // C5
    { frequency: 659.25, duration: 0.1, type: 'sine', volume: 0.2 },  // E5
    { frequency: 783.99, duration: 0.15, type: 'sine', volume: 0.25 }, // G5
    { frequency: 1046.5, duration: 0.25, type: 'sine', volume: 0.3, fadeOut: true },  // C6
  ],
  warning: [
    { frequency: 440, duration: 0.15, type: 'triangle', volume: 0.3 },  // A4
    { frequency: 349.23, duration: 0.2, type: 'triangle', volume: 0.25 }, // F4
  ],
};

export function playSound(type: SoundType, volume = 1): void {
  if (typeof window === 'undefined') return;
  
  try {
    const ctx = getAudioContext();
    const configs = SOUND_CONFIGS[type];
    let startTime = ctx.currentTime;

    configs.forEach((config, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, startTime);

      const adjustedVolume = config.volume * volume;
      gainNode.gain.setValueAtTime(adjustedVolume, startTime);
      
      if (config.fadeOut) {
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + config.duration);
      }

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + config.duration);

      // Add small gap between notes
      startTime += config.duration + 0.02;
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

// Preload audio context on user interaction
export function initAudio(): void {
  if (typeof window === 'undefined') return;
  
  const handleInteraction = () => {
    getAudioContext();
    document.removeEventListener('click', handleInteraction);
    document.removeEventListener('keydown', handleInteraction);
    document.removeEventListener('touchstart', handleInteraction);
  };

  document.addEventListener('click', handleInteraction);
  document.addEventListener('keydown', handleInteraction);
  document.addEventListener('touchstart', handleInteraction);
}

// Play notification sound with browser notification
export async function playNotificationWithAlert(
  title: string,
  body: string,
  soundType: SoundType = 'notification',
  volume = 1
): Promise<void> {
  // Play sound
  playSound(soundType, volume);
  
  // Show browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

export default {
  playSound,
  initAudio,
  playNotificationWithAlert,
  requestNotificationPermission,
};
