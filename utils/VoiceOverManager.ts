export type VoiceOverKey = string;

class VoiceOverManager {
  private currentAudio: HTMLAudioElement | null = null;
  private audioBaseUrl = '';

  setAudioBaseUrl(url: string) {
    this.audioBaseUrl = url.replace(/\/$/, '');
  }

  async playNarrative(key: VoiceOverKey, filename?: string) {
    if (!this.audioBaseUrl || !filename) return;
    this.stop();
    this.currentAudio = new Audio(`${this.audioBaseUrl}/${filename}`);
    await this.currentAudio.play().catch(() => undefined);
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  pause() {
    this.currentAudio?.pause();
  }
}

export const voiceOverManager = new VoiceOverManager();
