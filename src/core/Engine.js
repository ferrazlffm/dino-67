/**
 * Engine.js
 * Game Loop Principal, física, spawn de obstáculos, colisões e controle de velocidade.
 */

import { Dino } from '../entities/Dino.js';
import { Ground } from '../entities/Ground.js';
import { Obstacle } from '../entities/Obstacle.js';
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
    this.obstacles = [];

    // Estados do jogo: 'READY', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.state = 'READY';

    // Velocidade & Pontuação
    this.baseSpeed = 6.0;
    this.speed = this.baseSpeed;
    this.score = 0;
    this.highScore = Storage.getHighScore();
    this.lastScoreMilestone = 0;

    // Gerenciador de Spawns
    this.obstacleTimer = 0;
    this.nextSpawnInterval = 1500; // ms

    // Loop delta time
    this.lastTime = 0;
    this.themeColor = '#e8eaed';
    this.canvasBg = '#202124';

    this.hud.updateScores(0, this.highScore);
  }

  setTheme(isDark) {
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
        soundSynth.playJump();
      }
    }
  }

  reset() {
    this.dino.reset();
    this.ground.reset();
    this.obstacles = [];
    this.score = 0;
    this.speed = this.baseSpeed;
    this.obstacleTimer = 0;
    this.lastScoreMilestone = 0;
    this.highScore = Storage.getHighScore();
    this.hud.updateScores(0, this.highScore);
  }

  spawnObstacle() {
    const types = ['CACTUS_SMALL', 'CACTUS_DOUBLE', 'CACTUS_TRIPLE'];
    
    // Adiciona Pterodáctilos aéreos a partir de 150 pontos
    if (this.score > 150) {
      types.push('PTERODACTYL');
    }

    const randomType = types[Math.floor(Math.random() * types.length)];
    this.obstacles.push(new Obstacle(randomType, this.canvas.width, this.groundY));

    // Calcula próximo intervalo de spawn com base na velocidade (mais rápido conforme a velocidade aumenta)
    const minTime = 1000 / (this.speed / 6.0);
    const maxTime = 2400 / (this.speed / 6.0);
    this.nextSpawnInterval = Math.random() * (maxTime - minTime) + minTime;
  }

  checkCollisions() {
    const dinoBox = this.dino.getHitbox();

    for (let obs of this.obstacles) {
      const obsBox = obs.getHitbox();

      // Teste AABB (Axis-Aligned Bounding Box)
      if (
        dinoBox.x < obsBox.x + obsBox.width &&
        dinoBox.x + dinoBox.width > obsBox.x &&
        dinoBox.y < obsBox.y + obsBox.height &&
        dinoBox.y + dinoBox.height > obsBox.y
      ) {
        this.handleGameOver();
        break;
      }
    }
  }

  handleGameOver() {
    this.state = 'GAMEOVER';
    this.dino.state = 'CRASHED';
    soundSynth.playHit();

    const isNewRecord = Storage.saveHighScore(Math.floor(this.score));
    if (isNewRecord) {
      this.highScore = Math.floor(this.score);
    }

    this.render(); // Renderiza quadro final com dino abalado
    this.hud.showGameOverModal(
      Math.floor(this.score),
      this.highScore,
      isNewRecord,
      () => this.start()
    );
  }

  update(deltaTime) {
    if (this.state !== 'PLAYING') return;

    // Atualiza pontuação e velocidade progressiva
    this.score += (deltaTime / 1000) * 12;
    this.speed = Math.min(13.0, this.baseSpeed + (this.score / 250));

    // Toca som a cada 100 pontos atingidos
    const currentMilestone = Math.floor(this.score / 100);
    if (currentMilestone > this.lastScoreMilestone) {
      this.lastScoreMilestone = currentMilestone;
      soundSynth.playScoreMilestone();
    }

    this.hud.updateScores(this.score, this.highScore);

    // Atualiza Entidades
    this.dino.update(deltaTime);
    this.ground.update(this.speed, deltaTime);

    // Gerencia Spawns de Obstáculos
    this.obstacleTimer += deltaTime;
    if (this.obstacleTimer >= this.nextSpawnInterval) {
      this.spawnObstacle();
      this.obstacleTimer = 0;
    }

    // Atualiza e filtra obstáculos fora da tela
    for (let obs of this.obstacles) {
      obs.update(this.speed, deltaTime);
    }
    this.obstacles = this.obstacles.filter(obs => !obs.markedForRemoval);

    // Verifica Colisões
    this.checkCollisions();
  }

  render() {
    // Limpa o canvas principal
    this.ctx.fillStyle = this.canvasBg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Renderiza Entidades na Ordem
    this.ground.draw(this.ctx, this.themeColor);
    
    for (let obs of this.obstacles) {
      obs.draw(this.ctx, this.themeColor);
    }

    this.dino.draw(this.ctx, this.themeColor);
  }

  loop(currentTime) {
    if (this.state !== 'PLAYING') return;

    const deltaTime = Math.min(100, currentTime - this.lastTime); // Cap em 100ms para evitar saltos
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    if (this.state === 'PLAYING') {
      requestAnimationFrame((t) => this.loop(t));
    }
  }
}
