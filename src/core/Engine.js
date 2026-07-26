/**
 * Engine.js
 * Game Loop Principal, física, spawn de obstáculos, power-ups, fases temáticas e sistema de partículas.
 */

import { Dino } from '../entities/Dino.js';
import { Ground } from '../entities/Ground.js';
import { Obstacle } from '../entities/Obstacle.js';
import { PowerUp } from '../entities/PowerUp.js';
import { Sky } from '../entities/Sky.js';
import { PhaseManager } from './PhaseManager.js';
import { ParticleSystem } from './ParticleSystem.js';
import { PlayerStats } from './PlayerStats.js';
import { soundSynth } from './SoundSynth.js';
import { Storage } from './Storage.js';

export class Engine {
  constructor(canvasElement, hud) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.hud = hud;

    this.groundY = this.canvas.height - 40;
    this.dino = new Dino(this.groundY);
    this.ground = new Ground(this.canvas.width, this.canvas.height);
    this.sky = new Sky(this.canvas.width, this.canvas.height);
    this.phaseManager = new PhaseManager();
    this.particleSystem = new ParticleSystem();

    this.obstacles = [];
    this.powerUps = [];

    // Estados do jogo: 'READY', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.state = 'READY';

    // Velocidade & Pontuação
    this.baseSpeed = 6.0;
    this.speed = this.baseSpeed;
    this.score = 0;
    this.highScore = Storage.getHighScore();
    this.lastScoreMilestone = 0;

    // Power-ups & Habilidades
    this.hasShield = false;
    this.activePowerUp = null; // { type: 'SLOWMO' | 'MAGNET', timer: ms, maxTimer: ms }

    // Estatísticas da sessão
    this.sessionJumps = 0;
    this.shakeTimer = 0;

    // Gerenciador de Spawns
    this.obstacleTimer = 0;
    this.nextSpawnInterval = 1500; // ms

    // Loop delta time
    this.lastTime = 0;
    this.themeColor = '#e8eaed';
    this.canvasBg = '#202124';
    this.isDarkMode = true;

    this.hud.updateScores(0, this.highScore);
  }

  setTheme(isDark) {
    this.isDarkMode = isDark;
    this.themeColor = isDark ? '#e8eaed' : '#535353';
    this.canvasBg = isDark ? '#202124' : '#f7f7f7';
  }

  start() {
    if (this.state === 'READY' || this.state === 'GAMEOVER') {
      this.reset();
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  pause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.hud.showPauseModal(() => this.resume());
    }
  }

  resume() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  triggerJump() {
    if (this.state === 'PLAYING') {
      const jumped = this.dino.jump();
      if (jumped) {
        this.sessionJumps += 1;
        soundSynth.playJump();
        this.particleSystem.emitJumpTrail(this.dino.x, this.dino.y + 20, '#00ffcc');
      }
    }
  }

  reset() {
    this.dino.reset();
    this.ground.reset();
    this.phaseManager.reset();
    this.particleSystem.reset();

    this.obstacles = [];
    this.powerUps = [];
    this.hasShield = false;
    this.activePowerUp = null;

    this.score = 0;
    this.speed = this.baseSpeed;
    this.obstacleTimer = 0;
    this.lastScoreMilestone = 0;
    this.sessionJumps = 0;
    this.shakeTimer = 0;

    this.highScore = Storage.getHighScore();
    this.hud.updateScores(0, this.highScore);
  }

  spawnObstacle() {
    const currentPhase = this.phaseManager.getCurrentPhase();
    const types = currentPhase.obstacleTypes;

    const randomType = types[Math.floor(Math.random() * types.length)];
    this.obstacles.push(new Obstacle(randomType, this.canvas.width, this.groundY));

    // Chance (18%) de spawnar um Power-up junto se nenhum estiver em tela
    if (Math.random() < 0.18 && this.powerUps.length === 0) {
      const powerUpTypes = ['SHIELD', 'SLOWMO', 'MAGNET'];
      const pType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      this.powerUps.push(new PowerUp(pType, this.canvas.width, this.groundY));
    }

    // Intervalo de spawn ajustado pela velocidade
    const effectiveSpeed = this.getEffectiveSpeed();
    const minTime = 1000 / (effectiveSpeed / 6.0);
    const maxTime = 2400 / (effectiveSpeed / 6.0);
    this.nextSpawnInterval = Math.random() * (maxTime - minTime) + minTime;
  }

  getEffectiveSpeed() {
    let s = this.speed;
    if (this.activePowerUp && this.activePowerUp.type === 'SLOWMO') {
      s *= 0.6; // 40% mais lento
    }
    return s;
  }

  checkCollisions() {
    const dinoBox = this.dino.getHitbox();

    // 1. Colisão com Power-ups
    for (let pUp of this.powerUps) {
      if (pUp.markedForRemoval) continue;

      const pBox = pUp.getHitbox();
      if (
        dinoBox.x < pBox.x + pBox.width &&
        dinoBox.x + dinoBox.width > pBox.x &&
        dinoBox.y < pBox.y + pBox.height &&
        dinoBox.y + dinoBox.height > pBox.y
      ) {
        pUp.markedForRemoval = true;
        this.collectPowerUp(pUp.type);
      }
    }

    // 2. Colisão com Obstáculos
    for (let obs of this.obstacles) {
      const obsBox = obs.getHitbox();

      if (
        dinoBox.x < obsBox.x + obsBox.width &&
        dinoBox.x + dinoBox.width > obsBox.x &&
        dinoBox.y < obsBox.y + obsBox.height &&
        dinoBox.y + dinoBox.height > obsBox.y
      ) {
        if (this.hasShield) {
          // Escudo absorve o impacto!
          this.hasShield = false;
          obs.markedForRemoval = true;
          soundSynth.playShieldBreak();
          this.particleSystem.emitExplosion(obsBox.x + obsBox.width / 2, obsBox.y + obsBox.height / 2, '#00ffcc');
          this.shakeTimer = 200;
        } else {
          this.handleGameOver();
        }
        break;
      }
    }
  }

  collectPowerUp(type) {
    soundSynth.playPowerUpCollect();
    const color = type === 'SHIELD' ? '#00ffcc' : type === 'SLOWMO' ? '#c084fc' : '#ffd700';
    this.particleSystem.emitPowerUpBurst(this.dino.x + 20, this.dino.y + 20, color);

    if (type === 'SHIELD') {
      this.hasShield = true;
    } else if (type === 'SLOWMO') {
      this.activePowerUp = { type: 'SLOWMO', timer: 3000, maxTimer: 3000 };
    } else if (type === 'MAGNET') {
      this.activePowerUp = { type: 'MAGNET', timer: 5000, maxTimer: 5000 };
    }
  }

  handleGameOver() {
    this.state = 'GAMEOVER';
    this.dino.state = 'CRASHED';
    soundSynth.playHit();
    this.shakeTimer = 350;

    const dinoBox = this.dino.getHitbox();
    this.particleSystem.emitExplosion(dinoBox.x + dinoBox.width / 2, dinoBox.y + dinoBox.height / 2, '#ff3366');

    const isNewRecord = Storage.saveHighScore(Math.floor(this.score));
    if (isNewRecord) {
      this.highScore = Math.floor(this.score);
    }

    const currentPhase = this.phaseManager.getCurrentPhase();
    const stats = PlayerStats.recordGameOver(this.score, currentPhase.id, this.sessionJumps);

    this.render();
    this.hud.showGameOverModal(
      Math.floor(this.score),
      this.highScore,
      isNewRecord,
      stats,
      currentPhase.name,
      () => this.start()
    );
  }

  update(deltaTime) {
    if (this.state !== 'PLAYING') return;

    // Atualiza temporizador de efeito de tremor de tela
    if (this.shakeTimer > 0) {
      this.shakeTimer -= deltaTime;
    }

    // Multiplicador de pontos se o Ímã estiver ativo
    const scoreMultiplier = (this.activePowerUp && this.activePowerUp.type === 'MAGNET') ? 3 : 1;
    this.score += (deltaTime / 1000) * 12 * scoreMultiplier;
    this.speed = Math.min(13.0, this.baseSpeed + (this.score / 250));

    const effectiveSpeed = this.getEffectiveSpeed();

    // Atualiza Temporizador de Power-up Ativo
    if (this.activePowerUp) {
      this.activePowerUp.timer -= deltaTime;
      if (this.activePowerUp.timer <= 0) {
        this.activePowerUp = null;
      }
    }

    // Atualiza Fase Atual & Transição
    const phaseInfo = this.phaseManager.update(this.score, deltaTime);
    if (phaseInfo.transitioned) {
      soundSynth.playPhaseTransition();
    }

    // Emissão contínua de partículas
    const currentPhase = phaseInfo.currentPhase;
    if (currentPhase.hasVolcanicAsh) {
      this.particleSystem.emitVolcanicAsh(this.canvas.width);
    }

    if (!this.dino.isJumping) {
      this.particleSystem.emitDust(this.dino.x, this.dino.y + this.dino.height, currentPhase.particleColorDark);
    } else if (this.dino.velocityY < 0) {
      this.particleSystem.emitJumpTrail(this.dino.x, this.dino.y + 20, '#00ffcc');
    }

    this.particleSystem.update(deltaTime);

    // Som a cada 100 pontos
    const currentMilestone = Math.floor(this.score / 100);
    if (currentMilestone > this.lastScoreMilestone) {
      this.lastScoreMilestone = currentMilestone;
      soundSynth.playScoreMilestone();
    }

    this.hud.updateScores(this.score, this.highScore);

    // Atualiza Entidades
    this.sky.update(effectiveSpeed, deltaTime);
    this.dino.update(deltaTime);
    this.ground.update(effectiveSpeed, deltaTime);

    // Gerencia Spawns de Obstáculos
    this.obstacleTimer += deltaTime;
    if (this.obstacleTimer >= this.nextSpawnInterval) {
      this.spawnObstacle();
      this.obstacleTimer = 0;
    }

    // Atualiza obstáculos e power-ups
    for (let obs of this.obstacles) {
      obs.update(effectiveSpeed, deltaTime);
    }
    this.obstacles = this.obstacles.filter(obs => !obs.markedForRemoval);

    for (let pUp of this.powerUps) {
      pUp.update(effectiveSpeed, deltaTime);
    }
    this.powerUps = this.powerUps.filter(pUp => !pUp.markedForRemoval);

    // Verifica Colisões
    this.checkCollisions();
  }

  render() {
    const currentPhase = this.phaseManager.getCurrentPhase();

    ctxSaveAndShake: {
      this.ctx.save();

      // Screen Shake (Efeito de tremor)
      if (this.shakeTimer > 0) {
        const shakeX = (Math.random() - 0.5) * 6;
        const shakeY = (Math.random() - 0.5) * 6;
        this.ctx.translate(shakeX, shakeY);
      }

      // 1. Céu & Cenário (Parallax)
      this.sky.draw(this.ctx, currentPhase, this.isDarkMode);

      // 2. Chão
      const groundColor = this.isDarkMode ? currentPhase.groundColorDark : currentPhase.groundColorLight;
      this.ground.draw(this.ctx, groundColor);

      // 3. Obstáculos
      for (let obs of this.obstacles) {
        obs.draw(this.ctx, this.themeColor);
      }

      // 4. Power-ups no chão/ar
      for (let pUp of this.powerUps) {
        pUp.draw(this.ctx);
      }

      // 5. Partículas
      this.particleSystem.draw(this.ctx);

      // 6. Dino
      this.dino.draw(this.ctx, this.themeColor);

      // Aura de Escudo ao redor do Dino
      if (this.hasShield) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 255, 204, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([4, 4]);
        this.ctx.beginPath();
        this.ctx.arc(this.dino.x + 22, this.dino.y + 23, 30, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }

      // 7. Banner de Transição de Fase
      this.phaseManager.drawBanner(this.ctx, this.canvas.width, this.canvas.height, this.isDarkMode);

      // 8. Barra de Duração de Power-up Ativo
      if (this.activePowerUp) {
        const barWidth = 140;
        const barHeight = 8;
        const barX = this.canvas.width - 160;
        const barY = 40;
        const progress = Math.max(0, this.activePowerUp.timer / this.activePowerUp.maxTimer);

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        this.ctx.fillStyle = this.activePowerUp.type === 'SLOWMO' ? '#c084fc' : '#ffd700';
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(this.activePowerUp.type === 'SLOWMO' ? '⚡ SLOWMO' : '⭐ 3X SCORE', barX - 6, barY + 7);

        this.ctx.restore();
      }

      this.ctx.restore();
    }
  }

  loop(currentTime) {
    if (this.state !== 'PLAYING') return;

    const deltaTime = Math.min(100, currentTime - this.lastTime);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    if (this.state === 'PLAYING') {
      requestAnimationFrame((t) => this.loop(t));
    }
  }
}
