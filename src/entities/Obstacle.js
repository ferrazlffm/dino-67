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
        this.y = this.groundY - 65; 
        break;
      case 'BAT_LOW':
        this.width = 36;
        this.height = 24;
        this.y = this.groundY - 60;
        break;
      case 'BAT_HIGH':
        this.width = 36;
        this.height = 24;
        this.y = this.groundY - 85;
        break;
      case 'TOMBSTONE':
        this.width = 24;
        this.height = 36;
        this.y = this.groundY - this.height;
        break;
      case 'TOMBSTONE_DOUBLE':
        this.width = 48;
        this.height = 36;
        this.y = this.groundY - this.height;
        break;
      case 'LAVA_ROCK':
        this.width = 26;
        this.height = 34;
        this.y = this.groundY - this.height;
        break;
      case 'LAVA_ROCK_DOUBLE':
        this.width = 50;
        this.height = 34;
        this.y = this.groundY - this.height;
        break;
      case 'FIREBALL':
        this.width = 38;
        this.height = 24;
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

    // Animação de asas (Pterodáctilo e Morcegos)
    if (this.type === 'PTERODACTYL' || this.type.startsWith('BAT')) {
      this.wingTimer += deltaTime;
      if (this.wingTimer > 120) {
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

    if (this.type.startsWith('CACTUS')) {
      // Desenho de Cactos em Pixel Art
      const count = this.type === 'CACTUS_SMALL' ? 1 : (this.type === 'CACTUS_DOUBLE' ? 2 : 3);

      for (let c = 0; c < count; c++) {
        const offset = c * 22;
        ctx.fillRect(x + offset + 6, y, 8, 40);
        ctx.fillRect(x + offset + 2, y + 12, 4, 16);
        ctx.fillRect(x + offset + 2, y + 24, 8, 4);
        ctx.fillRect(x + offset + 14, y + 8, 4, 16);
        ctx.fillRect(x + offset + 10, y + 20, 8, 4);
      }
    } else if (this.type === 'PTERODACTYL') {
      ctx.fillRect(x + 30, y + 10, 14, 6);
      ctx.fillRect(x + 40, y + 12, 6, 2);
      ctx.fillRect(x + 32, y + 8, 4, 2);

      ctx.fillRect(x + 14, y + 12, 18, 8);
      ctx.fillRect(x + 6, y + 14, 8, 4);

      if (this.wingFrame === 0) {
        ctx.fillRect(x + 18, y + 0, 8, 12);
        ctx.fillRect(x + 12, y + 2, 6, 8);
      } else {
        ctx.fillRect(x + 18, y + 20, 8, 12);
        ctx.fillRect(x + 12, y + 18, 6, 8);
      }
    } else if (this.type.startsWith('BAT')) {
      // Morcego em Pixel Art
      ctx.fillRect(x + 14, y + 8, 8, 10); // Corpinho
      ctx.fillRect(x + 16, y + 4, 4, 4);  // Cabeça
      ctx.fillRect(x + 14, y + 2, 2, 3);  // Orelha esq
      ctx.fillRect(x + 20, y + 2, 2, 3);  // Orelha dir

      if (this.wingFrame === 0) {
        // Asas levantadas
        ctx.fillRect(x + 2, y + 2, 12, 6);
        ctx.fillRect(x + 22, y + 2, 12, 6);
      } else {
        // Asas apontando para baixo
        ctx.fillRect(x + 2, y + 12, 12, 6);
        ctx.fillRect(x + 22, y + 12, 12, 6);
      }
    } else if (this.type.startsWith('TOMBSTONE')) {
      // Lápides de cemitério em Pixel Art detalhado (Noite)
      const count = this.type === 'TOMBSTONE' ? 1 : 2;
      for (let c = 0; c < count; c++) {
        const offset = c * 24;

        // Base da lápide (Pedestal de pedra no solo)
        ctx.fillRect(x + offset + 1, y + 30, 22, 6);

        // Corpo principal da lápide (Pedra de topo arredondado gótico)
        ctx.fillRect(x + offset + 7, y, 10, 2);
        ctx.fillRect(x + offset + 5, y + 2, 14, 4);
        ctx.fillRect(x + offset + 3, y + 6, 18, 24);

        // Destaque de iluminação de luar na borda esquerda
        ctx.save();
        ctx.fillStyle = 'rgba(180, 210, 255, 0.4)';
        ctx.fillRect(x + offset + 3, y + 6, 2, 24);
        ctx.fillRect(x + offset + 5, y + 2, 2, 4);
        ctx.restore();

        // Entalhe de Cruz Latina no topo (Recorte)
        ctx.clearRect(x + offset + 11, y + 8, 2, 10);
        ctx.clearRect(x + offset + 8, y + 11, 8, 2);

        // Entalhe das letras "R I P" (Recortes em pixel art)
        // 'R'
        ctx.clearRect(x + offset + 6, y + 21, 3, 5);
        ctx.fillRect(x + offset + 7, y + 22, 1, 1); // Preenche meio do R
        // 'I'
        ctx.clearRect(x + offset + 11, y + 21, 2, 5);
        // 'P'
        ctx.clearRect(x + offset + 15, y + 21, 3, 5);
        ctx.fillRect(x + offset + 16, y + 22, 1, 1); // Preenche meio do P

        // Rachadura de desgate de tempo no canto superior direito (Recorte)
        ctx.clearRect(x + offset + 18, y + 6, 2, 3);
        ctx.clearRect(x + offset + 16, y + 9, 2, 2);
      }
    } else if (this.type.startsWith('LAVA_ROCK')) {
      // Rochas de lava (Vulcão)
      const count = this.type === 'LAVA_ROCK' ? 1 : 2;
      for (let c = 0; c < count; c++) {
        const offset = c * 24;
        ctx.fillRect(x + offset + 4, y, 18, 8);
        ctx.fillRect(x + offset, y + 8, 26, 26);
        // Fissura de magma brilhante
        ctx.save();
        ctx.fillStyle = '#ff4500';
        ctx.fillRect(x + offset + 8, y + 12, 4, 14);
        ctx.fillRect(x + offset + 12, y + 18, 6, 4);
        ctx.restore();
      }
    } else if (this.type === 'FIREBALL') {
      // Bola de Fogo
      ctx.fillStyle = '#ff4500';
      ctx.fillRect(x + 12, y + 4, 20, 16);
      ctx.fillRect(x + 8, y + 8, 28, 8);
      // Núcleo amarelo
      ctx.fillStyle = '#ffee00';
      ctx.fillRect(x + 18, y + 8, 10, 8);
      // Rastro de fogo
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(x, y + 8, 8, 8);
      ctx.fillRect(x + 4, y + 6, 8, 12);
    }

    ctx.restore();
  }
}
