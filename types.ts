export type GamePhase = 'intro' | 'countdown' | 'playing' | 'paused' | 'gameoverScreen' | 'endScreen' | 'reflections';

export interface GameSession {
  score: number;
  maxScore: number;
  levelReached?: number;
  levelsCompleted?: number;
}
