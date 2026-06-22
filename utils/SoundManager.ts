// SoundManager.ts
// Audio management for Dinner Prep Game

export interface SoundConfig {
    key: string;
    path: string;
    volume?: number;
    loop?: boolean;
    preload?: 'auto' | 'metadata' | 'none';
}

class SoundManager {
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private backgroundMusic: HTMLAudioElement | null = null;
    private backgroundMusicKey: string | null = null;
    private isMuted: boolean = false;
    private masterVolume: number = 1.0;
    private backgroundVolume: number = 0.3;
    private isAudioUnlocked: boolean = false;

    constructor() {
        console.log('[SoundManager] Initialized');
    }

    /**
     * Register a sound for later playback
     */
    register(config: SoundConfig): void {
        if (this.sounds.has(config.key)) {
            console.log(`[SoundManager] Sound "${config.key}" already registered`);
            return;
        }

        const audio = new Audio(config.path);
        audio.volume = (config.volume ?? 1.0) * this.masterVolume;
        audio.loop = config.loop ?? false;
        audio.preload = config.preload ?? 'auto';

        this.sounds.set(config.key, audio);
        console.log(`[SoundManager] Registered sound: ${config.key}`);
    }

    /**
     * Play a sound by key
     */
    play(key: string, options?: { volume?: number; loop?: boolean }): HTMLAudioElement | null {
        if (this.isMuted) return null;

        const audio = this.sounds.get(key);
        if (!audio) {
            console.warn(`[SoundManager] Sound "${key}" not found`);
            return null;
        }

        // Clone the audio for overlapping sounds
        const clone = audio.cloneNode() as HTMLAudioElement;
        clone.volume = (options?.volume ?? audio.volume) * this.masterVolume;
        clone.loop = options?.loop ?? audio.loop;

        clone.play().catch(err => {
            console.warn(`[SoundManager] Failed to play "${key}":`, err);
        });

        return clone;
    }

    /**
     * Stop a specific sound
     */
    stop(audio: HTMLAudioElement): void {
        audio.pause();
        audio.currentTime = 0;
    }

    /**
     * Start background music
     */
    playBackgroundMusic(key: string): void {
        if (this.backgroundMusicKey === key && this.backgroundMusic) {
            // Already playing this track
            if (this.backgroundMusic.paused) {
                this.backgroundMusic.play().catch(console.warn);
            }
            return;
        }

        // Stop current background music
        this.stopBackgroundMusic();

        const audio = this.sounds.get(key);
        if (!audio) {
            console.warn(`[SoundManager] Background music "${key}" not found`);
            return;
        }

        this.backgroundMusic = audio.cloneNode() as HTMLAudioElement;
        this.backgroundMusic.volume = this.backgroundVolume * this.masterVolume;
        this.backgroundMusic.loop = true;
        this.backgroundMusicKey = key;

        if (!this.isMuted) {
            this.backgroundMusic.play().catch(console.warn);
        }
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic(): void {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            this.backgroundMusic = null;
            this.backgroundMusicKey = null;
        }
    }

    /**
     * Pause background music
     */
    pauseBackgroundMusic(): void {
        if (this.backgroundMusic && !this.backgroundMusic.paused) {
            this.backgroundMusic.pause();
        }
    }

    /**
     * Resume background music
     */
    resumeBackgroundMusic(): void {
        if (this.backgroundMusic && this.backgroundMusic.paused && !this.isMuted) {
            this.backgroundMusic.play().catch(console.warn);
        }
    }

    /**
     * Get current background volume
     */
    getBackgroundVolume(): number {
        return this.backgroundVolume;
    }

    /**
     * Set background music volume (0-1)
     */
    setBackgroundVolume(volume: number): void {
        this.backgroundVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.backgroundVolume * this.masterVolume;
        }
    }

    /**
     * Fade background music to a target volume
     */
    fadeBackgroundMusic(targetVolume: number, duration: number = 500): Promise<void> {
        return new Promise((resolve) => {
            if (!this.backgroundMusic) {
                resolve();
                return;
            }

            const startVolume = this.backgroundMusic.volume;
            const volumeDiff = targetVolume - startVolume;
            const steps = 20;
            const stepDuration = duration / steps;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;
                const newVolume = startVolume + (volumeDiff * progress);

                if (this.backgroundMusic) {
                    this.backgroundMusic.volume = Math.max(0, Math.min(1, newVolume));
                }

                if (currentStep >= steps) {
                    clearInterval(interval);
                    resolve();
                }
            }, stepDuration);
        });
    }

    /**
     * Restore background music volume
     */
    restoreBackgroundMusic(duration: number = 500): Promise<void> {
        return this.fadeBackgroundMusic(this.backgroundVolume * this.masterVolume, duration);
    }

    /**
     * Set mute state
     */
    setMuted(muted: boolean): void {
        this.isMuted = muted;
        if (muted) {
            this.pauseBackgroundMusic();
        } else {
            this.resumeBackgroundMusic();
        }
    }

    /**
     * Get mute state
     */
    isMutedState(): boolean {
        return this.isMuted;
    }

    /**
     * Set master volume (0-1)
     */
    setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.backgroundVolume * this.masterVolume;
        }
    }

    /**
     * Force unlock audio context (call on user interaction)
     */
    forceUnlockAudio(): void {
        if (this.isAudioUnlocked) return;

        // Create a silent audio context to unlock
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const buffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start();
            ctx.resume().then(() => {
                console.log('[SoundManager] Audio unlocked');
                this.isAudioUnlocked = true;
            });
        }
    }

    /**
     * Check if audio is unlocked
     */
    isUnlocked(): boolean {
        return this.isAudioUnlocked;
    }
}

// Singleton instance
export const soundManager = new SoundManager();
