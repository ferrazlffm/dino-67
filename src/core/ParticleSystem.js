/**
 * ParticleSystem.js
 * Sistema de partículas 2D ultraleve para efeitos visuais do jogo.
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 120; // Limite para garantir 60fps em dispositivos móveis
  }

  reset() {
    this.particles = [];
  }

  emitDust(x, y, color = '#888888') {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x: x + (Math.random() * 8 - 4),
      y: y + Math.random() * 4,
      vx: -(Math.random() * 2 + 1),
      vy: -(Math.random() * 1.5),
      size: Math.random() * 3 + 2,
      color: color,
      life: 1.0,
      decay: Math.random() * 0.05 + 0.03
    });
  }

  emitJumpTrail(x, y, color = '#00ffcc') {
    if (this.particles.length >= this.maxParticles) return;
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: x + Math.random() * 20,
        y: y + Math.random() * 30 + 10,
        vx: -(Math.random() * 1.5 + 0.5),
        vy: Math.random() * 1 - 0.5,
        size: Math.random() * 3 + 2,
        color: color,
        life: 1.0,
        decay: 0.06
      });
    }
  }

  emitExplosion(x, y, color = '#ff3366') {
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24 + (Math.random() * 0.2);
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 3,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  emitPowerUpBurst(x, y, color = '#ffdd00') {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        size: Math.random() * 4 + 2,
        color: color,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  emitVolcanicAsh(canvasWidth) {
    if (this.particles.length >= this.maxParticles) return;
    if (Math.random() < 0.3) {
      this.particles.push({
        x: Math.random() * canvasWidth,
        y: -5,
        vx: (Math.random() - 0.5) * 1.5 - 1.5,
        vy: Math.random() * 2 + 1,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? '#ff4500' : '#ff8c00',
        life: 1.0,
        decay: 0.008
      });
    }
  }

  update(deltaTime) {
    const dtScale = Math.min(2.5, deltaTime / 16.6667);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dtScale;
      p.y += p.vy * dtScale;
      p.life -= p.decay * dtScale;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.round(p.size), Math.round(p.size));
    }
    ctx.restore();
  }
}
