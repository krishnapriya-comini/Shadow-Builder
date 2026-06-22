/**
 * Challenge Progress Service — Shadow Builder
 * Handles saving and loading progress for the Shadow Builder challenge.
 *
 * Score = number of shadow shapes built in a 60-second round.
 * Stars:  3★ = 8+ shapes, 2★ = 5–7, 1★ = 2–4, 0★ = 0–1.
 * Progress % = best shapes built / TARGET_SHAPES (10) capped at 100.
 *
 * Storage Keys (prefixed with `sb_`):
 * - sb_high_score: Highest score (shapes built) achieved
 * - sb_total_games: Total games played
 * - sb_total_levels: Total levels/shapes completed
 * - sb_stars_earned: Highest stars ever earned (0–3)
 * - sb_challenge_completed: Whether challenge is completed (3 stars)
 * - sb_last_updated: Timestamp of last progress update
 */

const STORAGE_PREFIX = 'sb_';
const CHALLENGE_ID = 'shadow-builder';
// Shapes built that count as 100% challenge progress / full completion.
const TARGET_SHAPES = 10;
const STARS_3_THRESHOLD = 8;
const STARS_2_THRESHOLD = 5;
const STARS_1_THRESHOLD = 2;

export interface GameSessionData {
  score: number;
  levelsCompleted: number;
  timePlayed: number;
  completedAt: string;
}

export interface ChallengeProgress {
  highScore: number;
  totalGamesPlayed: number;
  totalLevelsCompleted: number;
  starsEarned: number;
  challengeCompleted: boolean;
  lastUpdated: string;
}

interface EventBus {
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => () => void;
}

class ChallengeProgressService {
  private eventBus: EventBus | null = null;
  private unsubscribeProgressLoaded: (() => void) | null = null;

  /**
   * Set the event bus for MFE communication and request progress from parent
   */
  setEventBus(eventBus: EventBus | null) {
    this.eventBus = eventBus;

    // Listen for progress loaded from parent (backend sync)
    if (eventBus) {
      this.unsubscribeProgressLoaded = eventBus.on('mfe:progress-loaded', (data: any) => {
        if (data.challengeId === CHALLENGE_ID) {
          console.log('[ChallengeProgressService] Received progress from parent:', data);
          this.mergeBackendProgress(data);
        }
      });

      // Request progress from parent on mount
      eventBus.emit('mfe:request-progress', { challengeId: CHALLENGE_ID });
    }
  }

  /**
   * Cleanup event listeners
   */
  cleanup() {
    if (this.unsubscribeProgressLoaded) {
      this.unsubscribeProgressLoaded();
      this.unsubscribeProgressLoaded = null;
    }
  }

  /**
   * Merge progress from backend with local progress (keep highest)
   */
  private mergeBackendProgress(backendData: any) {
    try {
      const localProgress = this.getProgress();

      // Merge: keep highest values
      const mergedHighScore = Math.max(localProgress.highScore, backendData.highScore || 0);
      const mergedTotalGames = Math.max(localProgress.totalGamesPlayed, backendData.totalGamesPlayed || 0);
      const mergedTotalLevels = Math.max(localProgress.totalLevelsCompleted, backendData.totalLevelsCompleted || 0);
      const mergedStars = Math.max(localProgress.starsEarned, backendData.starsEarned || 0);
      const mergedCompleted = localProgress.challengeCompleted || backendData.challengeCompleted || false;

      // Update localStorage with merged data
      localStorage.setItem(this.getKey('high_score'), mergedHighScore.toString());
      localStorage.setItem(this.getKey('total_games'), mergedTotalGames.toString());
      localStorage.setItem(this.getKey('total_levels'), mergedTotalLevels.toString());
      localStorage.setItem(this.getKey('stars_earned'), mergedStars.toString());
      localStorage.setItem(this.getKey('challenge_completed'), mergedCompleted.toString());

      this.updateTimestamp();
      console.log('[ChallengeProgressService] Merged backend progress');
    } catch (error) {
      console.error('[ChallengeProgressService] Error merging backend progress:', error);
    }
  }

  /**
   * Get the storage key with prefix
   */
  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  /**
   * Get current progress from localStorage
   */
  getProgress(): ChallengeProgress {
    try {
      const highScore = parseInt(localStorage.getItem(this.getKey('high_score')) || '0', 10);
      const totalGamesPlayed = parseInt(localStorage.getItem(this.getKey('total_games')) || '0', 10);
      const totalLevelsCompleted = parseInt(localStorage.getItem(this.getKey('total_levels')) || '0', 10);
      const starsEarned = parseInt(localStorage.getItem(this.getKey('stars_earned')) || '0', 10);
      const challengeCompleted = localStorage.getItem(this.getKey('challenge_completed')) === 'true';
      const lastUpdated = localStorage.getItem(this.getKey('last_updated')) || new Date().toISOString();

      return {
        highScore,
        totalGamesPlayed,
        totalLevelsCompleted,
        starsEarned,
        challengeCompleted,
        lastUpdated,
      };
    } catch (error) {
      console.error('[ChallengeProgressService] Error getting progress:', error);
      return {
        highScore: 0,
        totalGamesPlayed: 0,
        totalLevelsCompleted: 0,
        starsEarned: 0,
        challengeCompleted: false,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Save game session and update aggregate stats
   */
  saveGameSession(session: GameSessionData): void {
    try {
      const currentProgress = this.getProgress();

      // Update aggregate stats
      const newHighScore = Math.max(currentProgress.highScore, session.score);
      const newTotalGames = currentProgress.totalGamesPlayed + 1;
      const newTotalLevels = currentProgress.totalLevelsCompleted + session.levelsCompleted;

      // Calculate stars based on shapes built this round (keep highest ever).
      let stars = currentProgress.starsEarned;
      if (session.score >= STARS_3_THRESHOLD) {
        stars = Math.max(stars, 3);
      } else if (session.score >= STARS_2_THRESHOLD) {
        stars = Math.max(stars, 2);
      } else if (session.score >= STARS_1_THRESHOLD) {
        stars = Math.max(stars, 1);
      }

      const challengeCompleted = stars >= 3;
      // 0–100 percent: best round's shapes built toward the target.
      const progressPercent = Math.min(100, Math.round((newHighScore / TARGET_SHAPES) * 100));

      // Save to localStorage
      localStorage.setItem(this.getKey('high_score'), newHighScore.toString());
      localStorage.setItem(this.getKey('total_games'), newTotalGames.toString());
      localStorage.setItem(this.getKey('total_levels'), newTotalLevels.toString());
      localStorage.setItem(this.getKey('stars_earned'), stars.toString());
      localStorage.setItem(this.getKey('challenge_completed'), challengeCompleted.toString());

      this.updateTimestamp();

      console.log(`[ChallengeProgressService] Saved game session: score=${session.score}, highScore=${newHighScore}`);

      // Notify parent app via EventBus
      if (this.eventBus) {
        this.eventBus.emit('mfe:progress-updated', {
          challengeId: CHALLENGE_ID,
          progress: {
            progressType: 'single-session',
            highScore: newHighScore,
            totalGamesPlayed: newTotalGames,
            totalLevelsCompleted: newTotalLevels,
            starsEarned: stars,
            challengeCompleted,
            progress: progressPercent, // 0–100 percent
          },
        });
      }
    } catch (error) {
      console.error('[ChallengeProgressService] Error saving game session:', error);
    }
  }

  /**
   * Check if this is a returning user (has played before)
   */
  isReturningUser(): boolean {
    return this.getProgress().totalGamesPlayed > 0;
  }

  /**
   * Check if challenge is completed (3 stars)
   */
  isChallengeCompleted(): boolean {
    return localStorage.getItem(this.getKey('challenge_completed')) === 'true';
  }

  /**
   * Get number of stars earned
   */
  getStarsEarned(): number {
    return parseInt(localStorage.getItem(this.getKey('stars_earned')) || '0', 10);
  }

  /**
   * Get high score
   */
  getHighScore(): number {
    return parseInt(localStorage.getItem(this.getKey('high_score')) || '0', 10);
  }

  /**
   * Clear all progress (for testing/reset)
   */
  clearProgress(): void {
    try {
      localStorage.removeItem(this.getKey('high_score'));
      localStorage.removeItem(this.getKey('total_games'));
      localStorage.removeItem(this.getKey('total_levels'));
      localStorage.removeItem(this.getKey('stars_earned'));
      localStorage.removeItem(this.getKey('challenge_completed'));
      localStorage.removeItem(this.getKey('last_updated'));

      console.log('[ChallengeProgressService] Progress cleared');

      // Notify parent app
      if (this.eventBus) {
        this.eventBus.emit('mfe:progress-cleared', {
          challengeId: CHALLENGE_ID,
        });
      }
    } catch (error) {
      console.error('[ChallengeProgressService] Error clearing progress:', error);
    }
  }

  /**
   * Update the last updated timestamp
   */
  private updateTimestamp(): void {
    localStorage.setItem(this.getKey('last_updated'), new Date().toISOString());
  }

  /**
   * Get summary for parent app
   */
  getSummary(): {
    highScore: number;
    totalGamesPlayed: number;
    starsEarned: number;
    challengeCompleted: boolean;
    progressPercent: number;
  } {
    const progress = this.getProgress();

    // Progress percent: best round's shapes built toward the target (0–100%).
    const progressPercent = Math.min(100, Math.round((progress.highScore / TARGET_SHAPES) * 100));

    return {
      highScore: progress.highScore,
      totalGamesPlayed: progress.totalGamesPlayed,
      starsEarned: progress.starsEarned,
      challengeCompleted: progress.challengeCompleted,
      progressPercent,
    };
  }
}

// Singleton instance
export const challengeProgressService = new ChallengeProgressService();

export default challengeProgressService;
