/** Small procedural cues. Sound reinforces events; nothing depends on hearing it. */
export type Cue = 'sample' | 'exit-open' | 'gate' | 'jammed' | 'fail' | 'won' | 'start'

export class Sound {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  enabled = true
  volume = 0.6

  /** Must run inside a user gesture on iOS. */
  unlock() {
    if (this.context) { void this.context.resume().catch(() => {}); return }
    try {
      const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Context) return
      this.context = new Context()
      this.master = this.context.createGain()
      this.master.connect(this.context.destination)
    } catch { this.context = null }
  }

  private tone(frequency: number, start: number, duration: number, type: OscillatorType = 'sine', level = 0.25, glideTo?: number) {
    const ctx = this.context, master = this.master
    if (!ctx || !master) return
    const t = ctx.currentTime + start
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, t)
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + duration)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(level, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.connect(gain).connect(master)
    osc.start(t)
    osc.stop(t + duration + 0.02)
  }

  play(cue: Cue) {
    if (!this.enabled || !this.context || !this.master || this.volume <= 0) return
    this.master.gain.value = this.volume * 0.5
    switch (cue) {
      case 'start': this.tone(392, 0, 0.12, 'triangle', 0.15); break
      case 'sample': this.tone(660, 0, 0.09, 'triangle'); this.tone(990, 0.07, 0.14, 'triangle'); break
      case 'exit-open': [523, 659, 784].forEach((f, i) => this.tone(f, i * 0.06, 0.25, 'sine', 0.18)); break
      case 'gate': this.tone(180, 0, 0.06, 'square', 0.12); this.tone(240, 0.05, 0.08, 'triangle', 0.2); break
      case 'jammed': this.tone(110, 0, 0.18, 'sawtooth', 0.1); break
      case 'fail': this.tone(330, 0, 0.32, 'triangle', 0.25, 110); break
      case 'won': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.09, 0.35, 'sine', 0.2)); break
    }
  }
}
