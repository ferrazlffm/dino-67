/**
 * SoundSynth.js
 * Sintetizador de efeitos sonoros retrô 8-bit nativo via Web Audio API.
 * Otimizado com suporte robusto para desbloqueio em dispositivos móveis (iOS Safari / Android Chrome).
 */

export class SoundSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.masterGain = null;
  }

  /**
   * Inicializa o contexto de áudio
   */
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 1.0;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Desbloqueia o contexto de áudio em dispositivos móveis (iOS/Android).
   * Deve ser executado em um manipulador de evento síncrono de clique/toque.
   */
  unlockMobileAudio() {
    this.init();
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      // Toca um tom ultracurto e quase inaudível para destravar os canais do iOS e Android
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.005, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.02);
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(0);
        osc.stop(this.ctx.currentTime + 0.02);
      } catch (e) {
        console.warn('Erro no unlock de áudio:', e);
      }
    }
  }

  /**
   * Alterna a execução de áudio (Mute / Unmute)
   */
  toggle() {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? 1.0 : 0.0;
    }
    return this.enabled;
  }

  /**
   * Efeito sonoro de pulo (onda quadrada ascendente 150Hz -> 600Hz em 0.15s)
   */
  playJump() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Erro ao tocar som de pulo:', e);
    }
  }

  /**
   * Efeito sonoro de conquista de pontos (arpejo clássico 8-bit)
   */
  playScoreMilestone() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);

        gain.gain.setValueAtTime(0.15, now + index * 0.06);
        gain.gain.linearRampToValueAtTime(0.001, now + (index + 1) * 0.06);

        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);

        osc.start(now + index * 0.06);
        osc.stop(now + (index + 1) * 0.06);
      });
    } catch (e) {
      console.warn('Erro ao tocar som de pontuação:', e);
    }
  }

  /**
   * Efeito sonoro de colisão / Game Over (onda serrote descendente)
   */
  playHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Erro ao tocar som de colisão:', e);
    }
  }
}

export const soundSynth = new SoundSynth();
