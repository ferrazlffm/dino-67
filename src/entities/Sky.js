/**
 * Sky.js
 * Renderizador de fundo com profundidade (Parallax, Nuvens, Estrelas e Céu Adaptativo).
 */

export class Sky {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.clouds = [];
    this.stars = [];
    this.initClouds();
    this.initStars();
  }

  initClouds() {
    this.clouds = [];
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: Math.random() * this.canvasWidth,
        y: 30 + Math.random() * 80,
        width: 46 + Math.random() * 20,
        height: 14 + Math.random() * 6,
        speedScale: 0.2 + Math.random() * 0.15
      });
    }
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 30; i++) {
      this.stars.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * (this.canvasHeight - 120),
        size: Math.random() > 0.8 ? 2 : 1,
        twinkleSpeed: Math.random() * 0.05 + 0.01,
        alpha: Math.random()
      });
    }
  }

  update(speed, deltaTime) {
    // Atualiza nuvens (efeito parallax deslizante)
    for (const cloud of this.clouds) {
      cloud.x -= speed * cloud.speedScale * (deltaTime / 1000) * 60;
      if (cloud.x + cloud.width < -10) {
        cloud.x = this.canvasWidth + Math.random() * 50;
        cloud.y = 30 + Math.random() * 80;
      }
    }

    // Cintilação de estrelas
    for (const star of this.stars) {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 1 || star.alpha < 0.2) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }
    }
  }

  draw(ctx, phase, isDarkMode) {
    ctx.save();

    // 1. Cor de Fundo do Céu baseada na Fase e Tema
    const skyColor = isDarkMode ? phase.skyColorDark : phase.skyColorLight;
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 2. Estrelas (Visíveis na Fase Noite Estrelada)
    if (phase.hasStars) {
      for (const star of this.stars) {
        ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
      }
    }

    // 3. Nuvens em Pixel-Art
    ctx.globalAlpha = isDarkMode ? 0.35 : 0.6;
    ctx.fillStyle = isDarkMode ? '#8a9bb3' : '#a0a0a0';

    for (const cloud of this.clouds) {
      const x = Math.round(cloud.x);
      const y = Math.round(cloud.y);
      // Sprite simples de nuvem pixelada
      ctx.fillRect(x + 10, y, 26, 6);
      ctx.fillRect(x + 4, y + 4, 38, 6);
      ctx.fillRect(x, y + 8, 46, 6);
    }

    ctx.restore();
  }
}
