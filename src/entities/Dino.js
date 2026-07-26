/**
 * Dino.js
 * Entidade do Dinossauro T-Rex com física de pulo, gravidade e renderização pixel-art.
 */

export class Dino {
  constructor(groundY) {
    this.groundY = groundY; // Linha de solo (Y)
    this.width = 44;
    this.height = 47;
    this.x = 80;
    this.y = groundY - this.height;

    // Física
    this.velocityY = 0;
    this.gravity = 0.75;
    this.jumpForce = -13.5;
    this.isJumping = false;

    // Estado de Animação
    this.animTimer = 0;
    this.legFrame = 0; // 0 ou 1
    this.state = 'RUNNING'; // 'RUNNING', 'JUMPING', 'CRASHED'
  }

  jump() {
    if (!this.isJumping && this.state !== 'CRASHED') {
      this.velocityY = this.jumpForce;
      this.isJumping = true;
      this.state = 'JUMPING';
      return true; // Retorna true se pulou com sucesso
    }
    return false;
  }

  update(deltaTime) {
    if (this.state === 'CRASHED') return;

    // Normalização Delta Time para base 60 FPS (independente de telas 60Hz, 120Hz ou variações de FPS no celular)
    const dtScale = Math.min(2.5, deltaTime / 16.6667);

    // Aplica gravidade e velocidade Y multiplicados pelo delta time escalado
    if (this.isJumping) {
      this.y += this.velocityY * dtScale;
      this.velocityY += this.gravity * dtScale;

      // Detecção de toque no chão
      if (this.y >= this.groundY - this.height) {
        this.y = this.groundY - this.height;
        this.isJumping = false;
        this.velocityY = 0;
        this.state = 'RUNNING';
      }
    } else {
      // Animação de corrida (troca de pernas)
      this.animTimer += deltaTime;
      if (this.animTimer > 100) { // Alterna pernas a cada 100ms
        this.legFrame = (this.legFrame === 0) ? 1 : 0;
        this.animTimer = 0;
      }
    }
  }

  // Caixa de colisão refinada (Hitbox levemente menor para evitar colisões injustas)
  getHitbox() {
    const paddingX = 6;
    const paddingTop = 4;
    return {
      x: this.x + paddingX,
      y: this.y + paddingTop,
      width: this.width - (paddingX * 2),
      height: this.height - paddingTop
    };
  }

  draw(ctx, color = '#535353') {
    ctx.save();
    ctx.fillStyle = color;

    const x = Math.round(this.x);
    const y = Math.round(this.y);

    // Renderização Procedural em Pixel-Art do T-Rex Chrome Original (Matriz 2D de Pixels)
    // Tamanho do pixel = 2px (escala de renderização)
    const p = 2; // Pixel scale

    // Desenha o corpo principal (Cabeça, olhos, braço, dorso, cauda)
    // Cabeça & Focinho
    ctx.fillRect(x + 22 * p, y + 0 * p, 10 * p, 6 * p);
    ctx.fillRect(x + 20 * p, y + 2 * p, 14 * p, 4 * p);

    // Olho (Recorte em negativo / furo no pixel art)
    ctx.clearRect(x + 24 * p, y + 1 * p, 2 * p, 2 * p);

    // Boca aberta / dentes
    ctx.fillRect(x + 20 * p, y + 6 * p, 10 * p, 2 * p);

    // Tronco & Costas
    ctx.fillRect(x + 16 * p, y + 6 * p, 4 * p, 12 * p);
    ctx.fillRect(x + 12 * p, y + 8 * p, 10 * p, 10 * p);

    // Cauda
    ctx.fillRect(x + 4 * p, y + 10 * p, 8 * p, 4 * p);
    ctx.fillRect(x + 0 * p, y + 12 * p, 6 * p, 2 * p);

    // Braço curto
    ctx.fillRect(x + 20 * p, y + 9 * p, 3 * p, 2 * p);

    // Pernas dependendo da animação
    if (this.state === 'CRASHED') {
      // Olho em X se bateu
      ctx.fillRect(x + 24 * p, y + 1 * p, 2 * p, 2 * p); // Preenche o olho
      // Pernas estáticas
      ctx.fillRect(x + 12 * p, y + 18 * p, 3 * p, 5 * p);
      ctx.fillRect(x + 18 * p, y + 18 * p, 3 * p, 5 * p);
    } else if (this.isJumping) {
      // Pernas recolhidas no pulo
      ctx.fillRect(x + 12 * p, y + 18 * p, 3 * p, 3 * p);
      ctx.fillRect(x + 17 * p, y + 18 * p, 3 * p, 3 * p);
    } else {
      // Pernas correndo (Alternando legFrame 0 e 1)
      if (this.legFrame === 0) {
        // Perna esquerda estendida, direita recolhida
        ctx.fillRect(x + 12 * p, y + 18 * p, 3 * p, 5 * p); // Perna Esq
        ctx.fillRect(x + 12 * p, y + 22 * p, 5 * p, 2 * p); // Pé Esq

        ctx.fillRect(x + 18 * p, y + 18 * p, 3 * p, 3 * p); // Perna Dir
      } else {
        // Perna direita estendida, esquerda recolhida
        ctx.fillRect(x + 12 * p, y + 18 * p, 3 * p, 3 * p); // Perna Esq

        ctx.fillRect(x + 18 * p, y + 18 * p, 3 * p, 5 * p); // Perna Dir
        ctx.fillRect(x + 18 * p, y + 22 * p, 5 * p, 2 * p); // Pé Dir
      }
    }

    ctx.restore();
  }

  reset() {
    this.y = this.groundY - this.height;
    this.velocityY = 0;
    this.isJumping = false;
    this.state = 'RUNNING';
  }
}
