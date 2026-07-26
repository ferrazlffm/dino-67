/**
 * Obstacle.js
 * Obstáculos terrestres (cactos simples, duplos e triplos) e aéreos (pterodáctilos).
 */

export class Obstacle {
  constructor(type, canvasWidth, groundY) {
    this.type = type; // 'CACTUS_SMALL', 'CACTUS_DOUBLE', 'CACTUS_TRIPLE', 'PTERODACTYL'
    this.x = canvasWidth + 20;
    this.groundY = groundY;
    this.wingFrame = 0;
    this.wingTimer = 0;
    this.markedForRemoval = false;

    this.setupDimensions();
  }

  setupDimensions() {
    switch (this.type) {
      case 'CACTUS_SMALL':
        this.width = 20;
        this.height = 40;
        this.y = this.groundY - this.height;
        break;
      case 'CACTUS_DOUBLE':
        this.width = 42;
        this.height = 40;
        this.y = this.groundY - this.height;
        break;
      case 'CACTUS_TRIPLE':
        this.width = 65;
        this.height = 40;
        this.y = this.groundY - this.height;
        break;
      case 'PTERODACTYL':
        this.width = 46;
        this.height = 32;
        // Altura de voo que exige um pulo no momento certo
        this.y = this.groundY - 65; 
        break;
      default:
        this.width = 20;
        this.height = 40;
        this.y = this.groundY - this.height;
    }
  }

  update(speed, deltaTime) {
    this.x -= speed * (deltaTime / 1000) * 60;

    // Se saiu completamente da tela
    if (this.x + this.width < -10) {
      this.markedForRemoval = true;
    }

    // Animação de batimento de asas para Pterodáctilo
    if (this.type === 'PTERODACTYL') {
      this.wingTimer += deltaTime;
      if (this.wingTimer > 150) {
        this.wingFrame = (this.wingFrame === 0) ? 1 : 0;
        this.wingTimer = 0;
      }
    }
  }

  getHitbox() {
    // Tolerância para colisão agradável e não punitiva (padding de 4px)
    const p = 4;
    return {
      x: this.x + p,
      y: this.y + p,
      width: this.width - (p * 2),
      height: this.height - (p * 2)
    };
  }

  draw(ctx, color = '#535353') {
    ctx.save();
    ctx.fillStyle = color;

    const x = Math.round(this.x);
    const y = Math.round(this.y);
    const p = 2; // pixel scale

    if (this.type.startsWith('CACTUS')) {
      // Desenho de Cactos em Pixel Art
      const count = this.type === 'CACTUS_SMALL' ? 1 : (this.type === 'CACTUS_DOUBLE' ? 2 : 3);

      for (let c = 0; c < count; c++) {
        const offset = c * 22;
        // Haste central do cacto
        ctx.fillRect(x + offset + 6, y, 8, 40);
        // Braço esquerdo
        ctx.fillRect(x + offset + 2, y + 12, 4, 16);
        ctx.fillRect(x + offset + 2, y + 24, 8, 4);
        // Braço direito
        ctx.fillRect(x + offset + 14, y + 8, 4, 16);
        ctx.fillRect(x + offset + 10, y + 20, 8, 4);
      }
    } else if (this.type === 'PTERODACTYL') {
      // Desenho do Pterodáctilo em Pixel Art
      // Cabeça & Bico
      ctx.fillRect(x + 30, y + 10, 14, 6);
      ctx.fillRect(x + 40, y + 12, 6, 2); // Bico pontudo
      ctx.fillRect(x + 32, y + 8, 4, 2);  // Olho

      // Tronco
      ctx.fillRect(x + 14, y + 12, 18, 8);
      ctx.fillRect(x + 6, y + 14, 8, 4);  // Cauda

      // Asas (Alterna posição em wingFrame 0 vs 1)
      if (this.wingFrame === 0) {
        // Asa para cima
        ctx.fillRect(x + 18, y + 0, 8, 12);
        ctx.fillRect(x + 12, y + 2, 6, 8);
      } else {
        // Asa para baixo
        ctx.fillRect(x + 18, y + 20, 8, 12);
        ctx.fillRect(x + 12, y + 18, 6, 8);
      }
    }

    ctx.restore();
  }
}
