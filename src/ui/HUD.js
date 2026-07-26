/**
 * HUD.js
 * Gerenciador de Interface do Usuário (HUD), placares, botões de ação e modais de pré-configuração.
 */

export class HUD {
  constructor() {
    // Elementos do DOM
    this.hiScoreEl = document.getElementById('hi-score');
    this.currentScoreEl = document.getElementById('current-score');
    
    this.modalScreen = document.getElementById('modal-screen');
    this.modalTitle = document.getElementById('modal-title');
    this.modalDesc = document.getElementById('modal-desc');
    this.modalIcon = document.getElementById('modal-icon');
    this.btnStartGame = document.getElementById('btn-start-game');
    this.pregameSetupEl = document.getElementById('pregame-setup');

    // Botões Overlay
    this.btnTheme = document.getElementById('btn-theme');
    this.btnSound = document.getElementById('btn-sound');
    this.btnCamera = document.getElementById('btn-camera');

    // Botões do Modal Pregame
    this.modalBtnTheme = document.getElementById('modal-btn-theme');
    this.modalBtnSound = document.getElementById('modal-btn-sound');
    this.modalBtnCamera = document.getElementById('modal-btn-camera');

    this.poseStatusEl = document.getElementById('pose-status');
    this.gestureIndicator = document.getElementById('gesture-indicator');
    this.gestureText = document.getElementById('gesture-text');
    this.metricLeftWrist = document.getElementById('metric-left-wrist');
    this.metricRightWrist = document.getElementById('metric-right-wrist');
    this.cameraPromptStatus = document.getElementById('camera-prompt-status');

    this.isDarkMode = true;
    this.isSoundOn = true;
    this.isCameraActive = false;
  }

  formatScore(score) {
    return Math.floor(score).toString().padStart(5, '0');
  }

  updateScores(currentScore, highScore) {
    this.currentScoreEl.textContent = this.formatScore(currentScore);
    this.hiScoreEl.textContent = this.formatScore(highScore);
  }

  showStartModal(onStart) {
    this.modalIcon.textContent = '🦖';
    this.modalTitle.textContent = 'CONFIGURAÇÃO INICIAL';
    this.modalDesc.innerHTML = 'Configure as opções abaixo. <strong>A câmera precisa estar conectada</strong> para liberar o jogo!';
    this.pregameSetupEl.style.display = 'flex';
    this.btnStartGame.textContent = 'JOGAR AGORA';

    // Desativa o botão de início até que a câmera esteja pronta
    if (!this.isCameraActive) {
      this.btnStartGame.disabled = true;
      this.btnStartGame.setAttribute('disabled', 'true');
    }

    this.btnStartGame.onclick = () => {
      if (!this.btnStartGame.disabled && this.isCameraActive) {
        this.modalScreen.classList.remove('active');
        onStart();
      }
    };
  }

  showPauseModal(onResume) {
    this.modalIcon.textContent = '⏸️';
    this.modalTitle.textContent = 'JOGO PAUSADO';
    this.modalDesc.textContent = 'Clique abaixo para continuar a partida.';
    this.pregameSetupEl.style.display = 'none';
    this.btnStartGame.textContent = 'CONTINUAR';
    this.btnStartGame.disabled = false;
    this.btnStartGame.removeAttribute('disabled');
    this.modalScreen.classList.add('active');

    this.btnStartGame.onclick = () => {
      this.modalScreen.classList.remove('active');
      onResume();
    };
  }

  showGameOverModal(finalScore, highScore, isNewRecord, onRestart) {
    this.modalIcon.textContent = isNewRecord ? '🏆' : '💀';
    this.modalTitle.textContent = isNewRecord ? 'NOVO RECORDE!' : 'GAME OVER';
    this.modalDesc.innerHTML = `Sua pontuação: <strong>${this.formatScore(finalScore)}</strong><br/>Maior pontuação: <strong>${this.formatScore(highScore)}</strong>`;
    this.pregameSetupEl.style.display = 'none';
    this.btnStartGame.textContent = 'JOGAR NOVAMENTE';
    this.btnStartGame.disabled = false;
    this.btnStartGame.removeAttribute('disabled');
    this.modalScreen.classList.add('active');

    this.btnStartGame.onclick = () => {
      this.modalScreen.classList.remove('active');
      onRestart();
    };
  }

  updatePoseStatus(status, label) {
    this.poseStatusEl.className = `pose-badge ${status}`;
    this.poseStatusEl.textContent = label;

    if (status === 'connecting') {
      this.cameraPromptStatus.className = 'status-box info';
      this.cameraPromptStatus.innerHTML = '<span class="status-dot"></span><span>⏳ Conectando câmera e inicializando rastreador...</span>';
      this.modalBtnCamera.disabled = true;
    } else if (status === 'active') {
      this.isCameraActive = true;
      this.cameraPromptStatus.className = 'status-box success';
      this.cameraPromptStatus.innerHTML = '<span class="status-dot"></span><span>✅ Câmera pronta! Rastreamento por gestos ativado.</span>';
      
      // Habilita o botão JOGAR AGORA
      this.btnStartGame.disabled = false;
      this.btnStartGame.removeAttribute('disabled');

      // Atualiza visual dos botões de câmera
      const camText = this.btnCamera.querySelector('.cam-text');
      if (camText) camText.textContent = 'Câmera Pronta';
      this.btnCamera.classList.remove('btn-primary');
      this.btnCamera.classList.add('btn-accent');

      this.modalBtnCamera.className = 'btn btn-accent btn-block setup-cam-btn';
      this.modalBtnCamera.innerHTML = '✅ Câmera Conectada e Pronta!';
      this.modalBtnCamera.disabled = false;
    } else if (status === 'error') {
      this.isCameraActive = false;
      this.cameraPromptStatus.className = 'status-box warning';
      this.cameraPromptStatus.innerHTML = '<span class="status-dot"></span><span>❌ Permissão de câmera negada. Ative a câmera para jogar.</span>';
      this.btnStartGame.disabled = true;
      this.btnStartGame.setAttribute('disabled', 'true');
      this.modalBtnCamera.disabled = false;
    }
  }

  updateGestureIndicator(isJumping) {
    if (isJumping) {
      this.gestureIndicator.className = 'gesture-indicator jumping';
      this.gestureText.textContent = 'PULO';
    } else {
      this.gestureIndicator.className = 'gesture-indicator grounded';
      this.gestureText.textContent = 'CHÃO';
    }
  }

  setupThemeToggle(onToggle) {
    const toggleHandler = () => {
      this.isDarkMode = !this.isDarkMode;
      document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light');
      
      const themeIconStr = this.isDarkMode ? '🌙' : '☀️';
      const themeTextStr = this.isDarkMode ? 'Tema Escuro' : 'Tema Claro';

      this.btnTheme.querySelector('.theme-icon').textContent = themeIconStr;
      this.modalBtnTheme.querySelector('.theme-icon').textContent = themeIconStr;
      this.modalBtnTheme.querySelector('.theme-label').textContent = themeTextStr;

      onToggle(this.isDarkMode);
    };

    this.btnTheme.onclick = toggleHandler;
    this.modalBtnTheme.onclick = toggleHandler;
  }

  setupSoundToggle(onToggle) {
    const toggleHandler = () => {
      this.isSoundOn = !this.isSoundOn;
      
      const soundIconStr = this.isSoundOn ? '🔊' : '🔇';
      const soundTextStr = this.isSoundOn ? 'Som Ligado' : 'Som Mudo';

      this.btnSound.querySelector('.sound-icon').textContent = soundIconStr;
      this.modalBtnSound.querySelector('.sound-icon').textContent = soundIconStr;
      this.modalBtnSound.querySelector('.sound-label').textContent = soundTextStr;

      onToggle(this.isSoundOn);
    };

    this.btnSound.onclick = toggleHandler;
    this.modalBtnSound.onclick = toggleHandler;
  }
}
