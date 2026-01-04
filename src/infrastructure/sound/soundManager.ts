class SoundManager {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
  }

  playBeep() {
    if (this.isMuted) return;
    try {
        const ctx = this.getContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.warn("Audio play failed", e);
    }
  }

  playFinish() {
    if (this.isMuted) return;
    try {
        const ctx = this.getContext();
        if (ctx.state === 'suspended') ctx.resume();

        const playNote = (freq: number, time: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
            
            osc.start(time);
            osc.stop(time + duration);
        }
        
        const now = ctx.currentTime;
        playNote(523.25, now, 0.2); // C5
        playNote(659.25, now + 0.1, 0.2); // E5
        playNote(783.99, now + 0.2, 0.4); // G5
    } catch (e) {
        console.warn("Audio play failed", e);
    }
  }
}

export const soundManager = new SoundManager();
