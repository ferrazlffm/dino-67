/**
 * PowerUp.js
 * Entidade de itens coletáveis que concedem habilidades temporárias.
 * Tipos:
 *  - 'SHIELD': Bolha protetora (absorve 1 colisão)
 *  - 'SLOWMO': Desacelera a velocidade do jogo por 3 segundos
 *  - 'MAGNET': Triplica a pontuação obtida por 5 segundos
 */

export class PowerUp {
  constructor(type, canvasWidth, groundY) {
    this.type = type; // 'SHIELD', 'SLOWMO', 'MAGNET'
    this.x = canvasWidth + 30;
    this.groundY = groundY;
    this.width = 32;
    this.height = 32;
    this.y = this.groundY - 80; // Altura de flutuação elevada no ar
    this.baseY = this.y;

    this.bobTimer = Math.random() * Math.PI * 2;
    this.markedForRemoval = false;
  }

  update(speed, deltaTime) {
    this.x -= speed * (deltaTime / 1000) * 60;

    // Animação de flutuação suave (bob up/down)
    this.bobTimer += (deltaTime / 1000) * 4;
    this.y = this.baseY + Math.sin(this.bobTimer) * 5;

    if (this.x + this.width < -20) {
      this.markedForRemoval = true;
    }
  }

  getHitbox() {
    // Área de captura magnética expandida (+15px) para facilitar a coleta sem exigência de precisão milimétrica
    const padding = 15;
    return {
      x: this.x - padding,
      y: this.y - padding,
      width: this.width + (padding * 2),
      height: this.height + (padding * 2)
    };
  }

  draw(ctx) {
    ctx.save();

    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const w = this.width;
    const h = this.height;

    if (this.type === 'SHIELD') {
      // Escudo: Esfera Azul Ciano
      ctx.fillStyle = 'rgba(0, 255, 204, 0.3)';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ícone interno (Escudo Pixel)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 10, y + 8, 10, 4);
      ctx.fillRect(x + 8, y + 12, 14, 6);
      ctx.fillRect(x + 10, y + 18, 10, 4);
      ctx.fillRect(x + 13, y + 22, 4, 3);
    } else if (this.type === 'SLOWMO') {
      // Slowmo: Círculo Roxo com Relógio
      ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ponteiros de Relógio
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 14, y + 8, 2, 8); // Ponteiro vertical
      ctx.fillRect(x + 14, y + 14, 6, 2); // Ponteiro horizontal
    } else if (this.type === 'MAGNET') {
      // Ímã/Estrela Dourada
      ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Estrela Pixel 3x Score
      ctx.fillStyle = '#ffea00';
      // Desenho simplificado de estrela
      ctx.fillRect(x + 13, y + 6, 4, 18);
      ctx.fillRect(x + 6, y + 13, 18, 4);
      ctx.fillRect(x + 9, y + 9, 12, 12);
    }

    ctx.restore();
  }
}
