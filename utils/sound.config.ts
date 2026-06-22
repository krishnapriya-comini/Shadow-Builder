// sound.config.ts
// Sound configuration for Dinner Prep Game

import { SoundConfig } from './SoundManager';
import { getAssetUrl } from './assetUrl';

// Sound effects configuration
export const soundConfig: SoundConfig[] = [
  // UI Sounds
  {
    key: 'buttonTap',
    path: getAssetUrl('/sounds/button_tap.mp3'),
    volume: 0.5,
    preload: 'auto',
  },
  {
    key: 'whoosh',
    path: getAssetUrl('/sounds/whoosh.mp3'),
    volume: 0.4,
    preload: 'auto',
  },

  // Game Sounds
  {
    key: 'success',
    path: getAssetUrl('/sounds/success.mp3'),
    volume: 0.6,
    preload: 'auto',
  },
  {
    key: 'error',
    path: getAssetUrl('/sounds/error.mp3'),
    volume: 0.5,
    preload: 'auto',
  },
  {
    key: 'match',
    path: getAssetUrl('/sounds/match.mp3'),
    volume: 0.6,
    preload: 'auto',
  },
  {
    key: 'drop',
    path: getAssetUrl('/sounds/drop.mp3'),
    volume: 0.5,
    preload: 'auto',
  },
  {
    key: 'levelComplete',
    path: getAssetUrl('/sounds/level_complete.mp3'),
    volume: 0.7,
    preload: 'auto',
  },

  // Background Music
  {
    key: 'backgroundMusic',
    path: getAssetUrl('/sounds/background_music.mp3'),
    volume: 0.3,
    loop: true,
    preload: 'auto',
  },
];

export default soundConfig;
