/**
 * PhaseManager.js
 * Gerencia as 3 fases temáticas do jogo baseadas na pontuação.
 * Fase 1 (0-499): Deserto
 * Fase 2 (500-999): Noite
 * Fase 3 (1000+): Vulcão
 */

export const PHASES = [
  {
    id: 1,
    name: 'DESERTO',
    minScore: 0,
    skyColorDark: '#202124',
    skyColorLight: '#f7f7f7',
    groundColorDark: '#e8eaed',
    groundColorLight: '#535353',
    particleColorDark: '#888888',
    particleColorLight: '#aaaaaa',
    obstacleTypes: ['CACTUS_SMALL', 'CACTUS_DOUBLE', 'CACTUS_TRIPLE', 'PTERODACTYL'],
    hasStars: false,
    hasVolcanicAsh: false
  },
  {
    id: 2,
    name: 'NOITE ESTRELADA',
    minScore: 500,
    skyColorDark: '#0b0f19',
    skyColorLight: '#1a233a',
    groundColorDark: '#7f8ea3',
    groundColorLight: '#4a5b70',
    particleColorDark: '#5c708a',
    particleColorLight: '#8a9bb3',
    obstacleTypes: ['BAT_LOW', 'BAT_HIGH', 'TOMBSTONE', 'TOMBSTONE_DOUBLE'],
    hasStars: true,
    hasVolcanicAsh: false
  },
  {
    id: 3,
    name: 'VULCÃO',
    minScore: 1000,
    skyColorDark: '#2b0a0a',
    skyColorLight: '#3d1212',
    groundColorDark: '#d96459',
    groundColorLight: '#993d35',
    particleColorDark: '#ff6b4a',
    particleColorLight: '#ff8c73',
    obstacleTypes: ['LAVA_ROCK', 'LAVA_ROCK_DOUBLE', 'FIREBALL'],
    hasStars: false,
    hasVolcanicAsh: true
  }
];

export class PhaseManager {
  constructor() {
    this.currentPhaseIndex = 0;
    this.bannerTimer = 0;
    this.bannerDuration = 2000; // ms
    this.showingBanner = false;
    this.bannerText = '';
  }

  reset() {
    this.currentPhaseIndex = 0;
    this.bannerTimer = 0;
    this.showingBanner = false;
    this.bannerText = '';
  }

  getCurrentPhase() {
    return PHASES[this.currentPhaseIndex];
  }

  update(score, deltaTime) {
    let newPhaseIndex = this.currentPhaseIndex;
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (score >= PHASES[i].minScore) {
        newPhaseIndex = i;
        break;
      }
    }

    let transitioned = false;
    if (newPhaseIndex !== this.currentPhaseIndex) {
      this.currentPhaseIndex = newPhaseIndex;
      this.showingBanner = true;
      this.bannerTimer = this.bannerDuration;
      this.bannerText = `FASE ${PHASES[newPhaseIndex].id}: ${PHASES[newPhaseIndex].name}`;
      transitioned = true;
    }

    if (this.showingBanner) {
      this.bannerTimer -= deltaTime;
      if (this.bannerTimer <= 0) {
        this.showingBanner = false;
      }
    }

    return {
      transitioned,
      currentPhase: this.getCurrentPhase(),
      showingBanner: this.showingBanner,
      bannerText: this.bannerText,
      bannerProgress: this.showingBanner ? (this.bannerTimer / this.bannerDuration) : 0
    };
  }

  drawBanner(ctx, canvasWidth, canvasHeight, isDarkMode) {
    if (!this.showingBanner) return;

    ctx.save();

    // Transparência baseada na entrada/saída do banner
    const alpha = Math.min(1, Math.sin((1 - (this.bannerTimer / this.bannerDuration)) * Math.PI));

    ctx.globalAlpha = alpha;

    // Fundo do banner
    const bannerHeight = 50;
    const bannerY = canvasHeight / 2 - bannerHeight / 2 - 40;

    ctx.fillStyle = isDarkMode ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(0, bannerY, canvasWidth, bannerHeight);

    // Borda neon
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, bannerY, canvasWidth, bannerHeight);

    // Texto do banner
    ctx.fillStyle = isDarkMode ? '#ffffff' : '#111111';
    ctx.font = 'bold 16px "Press Start 2P", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.bannerText, canvasWidth / 2, bannerY + bannerHeight / 2);

    ctx.restore();
  }
}
