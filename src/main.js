/**
 * main.js
 * Ponto de entrada da aplicação Chrome Dino Motion Control (Suporte Mobile First & Touch).
 */

import { HUD } from './ui/HUD.js';
import { Engine } from './core/Engine.js';
import { PoseTracker } from './motion/PoseTracker.js';
import { soundSynth } from './core/SoundSynth.js';

document.addEventListener('DOMContentLoaded', () => {
  // Inicialização de Elementos DOM e Módulos
  const gameCanvas = document.getElementById('game-canvas');
  const canvasWrapper = document.getElementById('canvas-wrapper');
  const webcamVideo = document.getElementById('webcam-video');
  const pipCanvas = document.getElementById('pip-canvas');
  const btnCamera = document.getElementById('btn-camera');

  const hud = new HUD();
  const engine = new Engine(gameCanvas, hud);

  let poseTracker = null;

  // Configuração inicial de tema e áudio
  engine.setTheme(hud.isDarkMode);

  // Desbloqueio e reativação contínua do Web Audio API no celular a cada toque
  const unlockAudioOnMobile = () => {
    soundSynth.unlockMobileAudio();
  };
  window.addEventListener('touchstart', unlockAudioOnMobile, { passive: true });
  window.addEventListener('touchend', unlockAudioOnMobile, { passive: true });
  window.addEventListener('click', unlockAudioOnMobile, { passive: true });
  window.addEventListener('pointerdown', unlockAudioOnMobile, { passive: true });

  hud.setupThemeToggle((isDark) => {
    engine.setTheme(isDark);
    if (engine.state !== 'PLAYING') {
      engine.render();
    }
  });

  hud.setupSoundToggle((isSoundOn) => {
    soundSynth.toggle();
  });

  // Exibe o modal de boas-vindas inicial
  hud.showStartModal(() => {
    engine.start();
  });

  // Inicialização do PoseTracker via Câmera
  const initWebcamTracker = async () => {
    hud.updatePoseStatus('connecting', 'Conectando');

    if (!poseTracker) {
      poseTracker = new PoseTracker({
        videoElement: webcamVideo,
        canvasElement: pipCanvas,
        onJumpTrigger: () => {
          engine.triggerJump();
          hud.updateGestureIndicator(true, poseTracker?.lastMetrics);
        },
        onStatusChange: (status, label) => {
          hud.updatePoseStatus(status, label);
        },
        onPoseUpdate: (handRaised, lastMetrics) => {
          hud.updateGestureIndicator(handRaised, lastMetrics);
        }
      });
    }

    await poseTracker.init();
  };

  btnCamera.addEventListener('click', () => {
    initWebcamTracker();
  });

  const modalBtnCamera = document.getElementById('modal-btn-camera');
  if (modalBtnCamera) {
    modalBtnCamera.addEventListener('click', () => {
      initWebcamTracker();
    });
  }

  // Suporte a Toque na Tela para Dispositivos Mobile (Touch / Tap to Jump)
  const handleTouchJump = (e) => {
    // Evita acionar se o toque ocorreu em botões do modal ou overlays
    if (e.target.closest('.modal-content') || e.target.closest('.header-actions') || e.target.closest('.canvas-controls-overlay')) {
      return;
    }
    // No Game Over, a partida só reinicia pelo botão "Jogar Novamente"
    if (engine.state === 'GAMEOVER' || engine.state === 'READY') {
      return;
    }
    e.preventDefault();
    engine.triggerJump();
  };

  canvasWrapper.addEventListener('touchstart', handleTouchJump, { passive: false });
  canvasWrapper.addEventListener('mousedown', (e) => {
    if (e.target.id === 'game-canvas' && engine.state === 'PLAYING') {
      engine.triggerJump();
    }
  });

  // Controles de Teclado (Fallback)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      engine.triggerJump();
    } else if (e.code === 'KeyP' || e.code === 'Escape') {
      e.preventDefault();
      if (engine.state === 'PLAYING') {
        engine.pause();
      } else if (engine.state === 'PAUSED') {
        engine.resume();
      }
    }
  });

  // Renderiza quadro estático inicial no canvas
  engine.render();
});
