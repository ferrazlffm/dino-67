/**
 * Ground.js
 * Renderizador da linha do chão com textura pixel-art e rolamento infinito.
 */

export class Ground {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.y = canvasHeight - 40; // Linha base do chão
    this.xOffset = 0;
    this.bumpPattern = [];
    this.initBumpPattern();
  }

  initBumpPattern() {
    // Cria variações de relevo (pequenas pedras/linhas) geradas proceduralmente
    this.bumpPattern = [];
    for (let i = 0; i < 200; i++) {
      this.bumpPattern.push({
        x: i * 25 + Math.random() * 10,
        length: Math.floor(Math.random() * 4) + 1,
        height: Math.random() > 0.5 ? 2 : 1
      });
    }
  }

  update(speed, deltaTime) {
    this.xOffset += speed * (deltaTime / 1000) * 60;
  }

  draw(ctx, themeColor = '#535353') {
    ctx.save();
    ctx.strokeStyle = themeColor;
    ctx.fillStyle = themeColor;
    ctx.lineWidth = 2;

    // Linha contínua do solo
    ctx.beginPath();
    ctx.moveTo(0, this.y);
    ctx.lineTo(this.canvasWidth, this.y);
    ctx.stroke();

    // Pequenas pedrinhas/detalhes no solo deslizando com offset
    const totalPatternWidth = 200 * 25;
    for (let bump of this.bumpPattern) {
      let renderX = (bump.x - this.xOffset) % totalPatternWidth;
      if (renderX < 0) renderX += totalPatternWidth;

      if (renderX < this.canvasWidth) {
        ctx.fillRect(renderX, this.y + 4, bump.length * 3, bump.height);
      }
    }

    ctx.restore();
  }

  reset() {
    this.xOffset = 0;
  }
}
