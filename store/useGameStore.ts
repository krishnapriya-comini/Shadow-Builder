import { create } from 'zustand';
import type { GamePhase } from '../types';

interface GameState {
  gamePhase: GamePhase;
  previousPhase: GamePhase;
  score: number;
  timeLeft: number;
  timeRemaining: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  setGamePhase: (phase: GamePhase) => void;
  incrementScore: (points?: number) => void;
  setTimeLeft: (time: number) => void;
  tickTimer: () => void;
  startCountdown: () => void;
  startPlaying: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  showReflections: () => void;
  restartGame: () => void;
  resetGame: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  gamePhase: 'intro',
  previousPhase: 'intro',
  score: 0,
  timeLeft: 60,
  timeRemaining: 60,
  soundEnabled: true,
  musicEnabled: true,
  setGamePhase: (phase) => set({ gamePhase: phase }),
  incrementScore: (points = 1) => set((state) => ({ score: state.score + points })),
  setTimeLeft: (time) => set({ timeLeft: time, timeRemaining: time }),
  tickTimer: () => set((state) => {
    if (state.gamePhase !== 'playing') return state;
    const nextTime = Math.max(0, state.timeLeft - 1);
    if (nextTime === 0) {
      return { timeLeft: 0, timeRemaining: 0, gamePhase: 'gameoverScreen' };
    }
    return { timeLeft: nextTime, timeRemaining: nextTime };
  }),
  startCountdown: () => set({ gamePhase: 'countdown' }),
  startPlaying: () => set({ gamePhase: 'playing', timeLeft: 60, timeRemaining: 60 }),
  pauseGame: () => set((state) => ({ previousPhase: state.gamePhase, gamePhase: 'paused' })),
  resumeGame: () => set((state) => ({ gamePhase: state.previousPhase === 'paused' ? 'playing' : state.previousPhase })),
  endGame: () => set({ gamePhase: 'gameoverScreen' }),
  showReflections: () => set({ gamePhase: 'reflections' }),
  restartGame: () => set({ gamePhase: 'countdown', previousPhase: 'intro', score: 0, timeLeft: 60, timeRemaining: 60 }),
  resetGame: () => set({ gamePhase: 'intro', previousPhase: 'intro', score: 0, timeLeft: 60, timeRemaining: 60 }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
}));
