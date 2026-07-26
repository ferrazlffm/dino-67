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
        }
      });
    }

    const success = await poseTracker.init();
    if (success) {
      const updateHUDLoop = () => {
        if (poseTracker && poseTracker.isTracking) {
          hud.updateGestureIndicator(poseTracker.handRaised, poseTracker.lastMetrics);
          requestAnimationFrame(updateHUDLoop);
        }
      };
      updateHUDLoop();
    }
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

  // Pulo ativado EXCLUSIVAMENTE por gestos (PoseTracker).
  // Toque na Tela / Clique / Teclado agora PAUSAM a partida se o jogo estiver em andamento.
  const handleInteractionPause = (e) => {
    // Evita acionar se o toque/clique ocorreu em botões do modal, controles ou pip
    if (e.target.closest('.modal-content') || e.target.closest('.canvas-controls-overlay') || e.target.closest('.pip-card')) {
      return;
    }
    if (engine.state === 'PLAYING') {
      e.preventDefault();
      engine.pause();
    }
  };

  canvasWrapper.addEventListener('touchstart', handleInteractionPause, { passive: false });
  canvasWrapper.addEventListener('mousedown', handleInteractionPause);

  // Pressionar QUALQUER tecla durante o jogo PAUSA a partida
  window.addEventListener('keydown', (e) => {
    if (engine.state === 'PLAYING') {
      e.preventDefault();
      engine.pause();
    } else if (engine.state === 'PAUSED' && (e.code === 'Space' || e.code === 'KeyP' || e.code === 'Escape')) {
      e.preventDefault();
      engine.resume();
    }
  });

  // Renderiza quadro estático inicial no canvas
  engine.render();
});

