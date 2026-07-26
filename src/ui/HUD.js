import { soundSynth } from '../core/SoundSynth.js';
import { rankingService } from '../services/supabase.js';

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

    // Elementos do Ranking
    this.btnRanking = document.getElementById('btn-ranking');
    this.btnShowRanking = document.getElementById('btn-show-ranking');
    this.rankingModal = document.getElementById('ranking-modal');
    this.btnCloseRanking = document.getElementById('btn-close-ranking');
    this.btnCloseRankingFooter = document.getElementById('btn-close-ranking-footer');
    this.rankingList = document.getElementById('ranking-list');
    this.rankingInputContainer = document.getElementById('ranking-input-container');
    this.playerNameInput = document.getElementById('player-name-input');
    this.rankingForm = document.getElementById('ranking-form');
    this.btnSubmitScore = document.getElementById('btn-submit-score');

    // Overlay de Contagem Regressiva
    this.countdownOverlay = document.getElementById('countdown-overlay');
    this.countdownNumber = document.getElementById('countdown-number');
    this.countdownTimer = null;

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

    this.btnShareScore = document.getElementById('btn-share-score');
    this.gameoverStatsContainer = document.getElementById('gameover-stats-container');
    this.statGames = document.getElementById('stat-games');
    this.statAvg = document.getElementById('stat-avg');
    this.statJumps = document.getElementById('stat-jumps');

    this.isDarkMode = true;
    this.isSoundOn = true;
    this.isCameraActive = false;

    this.setupRankingEvents();
  }

  setupRankingEvents() {
    const openRanking = () => this.openRankingModal();
    const closeRanking = () => this.closeRankingModal();

    if (this.btnRanking) this.btnRanking.onclick = openRanking;
    if (this.btnShowRanking) this.btnShowRanking.onclick = openRanking;
    if (this.btnCloseRanking) this.btnCloseRanking.onclick = closeRanking;
    if (this.btnCloseRankingFooter) this.btnCloseRankingFooter.onclick = closeRanking;
  }

  async openRankingModal() {
    if (!this.rankingModal) return;
    this.rankingModal.classList.add('active');
    await this.loadAndRenderRanking();
  }

  closeRankingModal() {
    if (!this.rankingModal) return;
    this.rankingModal.classList.remove('active');
  }

  async loadAndRenderRanking() {
    if (!this.rankingList) return;
    this.rankingList.innerHTML = '<p class="loading-text">Carregando Top 5...</p>';

    const scores = await rankingService.getTopScores();

    if (!scores || scores.length === 0) {
      this.rankingList.innerHTML = '<p class="loading-text">Nenhum recorde registrado ainda. Seja o primeiro!</p>';
      return;
    }

    // Atualiza a maior pontuação global se houver registro no ranking
    if (scores[0] && scores[0].score > 0) {
      this.hiScoreEl.textContent = this.formatScore(scores[0].score);
    }

    this.rankingList.innerHTML = scores.map((item, index) => {
      const rankPos = index + 1;
      const topClass = rankPos <= 3 ? `top-${rankPos}` : '';
      const name = (item.player_name || 'ANÔNIMO').substring(0, 10);
      const scoreFormatted = this.formatScore(item.score);

      return `
        <div class="ranking-item ${topClass}">
          <div class="rank-left">
            <span class="rank-position">#${rankPos}</span>
            <span class="player-name">${name}</span>
          </div>
          <span class="player-score">${scoreFormatted}</span>
        </div>
      `;
    }).join('');
  }

  formatScore(score) {
    return Math.floor(score).toString().padStart(5, '0');
  }

  updateScores(currentScore, highScore) {
    this.currentScoreEl.textContent = this.formatScore(currentScore);
    this.hiScoreEl.textContent = this.formatScore(highScore);
  }

  startCountdown(onComplete) {
    if (this.btnRanking) this.btnRanking.style.display = 'none';
    if (this.btnCamera) this.btnCamera.style.display = 'none';
    if (this.btnTheme) this.btnTheme.style.display = 'none';

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    this.modalScreen.classList.remove('active');

    if (!this.countdownOverlay || !this.countdownNumber) {
      if (onComplete) onComplete();
      return;
    }

    this.countdownOverlay.classList.add('active');

    let count = 3;
    this.countdownNumber.classList.remove('go');
    this.countdownNumber.textContent = count.toString();
    this.countdownNumber.style.animation = 'none';
    void this.countdownNumber.offsetHeight;
    this.countdownNumber.style.animation = 'popCount 0.4s ease-out';

    soundSynth.playCountdown(false);

    this.countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        this.countdownNumber.classList.remove('go');
        this.countdownNumber.textContent = count.toString();
        this.countdownNumber.style.animation = 'none';
        void this.countdownNumber.offsetHeight;
        this.countdownNumber.style.animation = 'popCount 0.4s ease-out';
        soundSynth.playCountdown(false);
      } else if (count === 0) {
        this.countdownNumber.classList.add('go');
        this.countdownNumber.textContent = 'VAI!';
        this.countdownNumber.style.animation = 'none';
        void this.countdownNumber.offsetHeight;
        this.countdownNumber.style.animation = 'popCount 0.4s ease-out';
        soundSynth.playCountdown(true);
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.countdownOverlay.classList.remove('active');
        if (onComplete) onComplete();
      }
    }, 1000);
  }

  showStartModal(onStart) {
    if (this.btnRanking) this.btnRanking.style.display = 'flex';
    if (this.btnCamera) this.btnCamera.style.display = 'inline-flex';
    if (this.btnTheme) this.btnTheme.style.display = 'flex';
    if (this.gameoverStatsContainer) this.gameoverStatsContainer.style.display = 'none';
    if (this.btnShareScore) this.btnShareScore.style.display = 'none';

    this.modalIcon.textContent = '🦖';
    this.modalTitle.textContent = 'CONFIGURAÇÃO INICIAL';
    this.modalDesc.innerHTML = '<strong>A câmera precisa estar conectada</strong> para liberar o jogo!';
    this.pregameSetupEl.style.display = 'flex';
    if (this.rankingInputContainer) this.rankingInputContainer.style.display = 'none';
    if (this.btnShowRanking) this.btnShowRanking.style.display = 'flex';
    this.btnStartGame.textContent = 'JOGAR AGORA';

    // Desativa o botão de início até que a câmera esteja pronta
    if (!this.isCameraActive) {
      this.btnStartGame.disabled = true;
      this.btnStartGame.setAttribute('disabled', 'true');
    }

    this.btnStartGame.onclick = () => {
      if (!this.btnStartGame.disabled && this.isCameraActive) {
        this.startCountdown(onStart);
      }
    };

    // Carrega a maior pontuação inicial do ranking
    rankingService.getTopScores().then(scores => {
      if (scores && scores[0] && scores[0].score > 0) {
        this.hiScoreEl.textContent = this.formatScore(scores[0].score);
      }
    });
  }

  showPauseModal(onResume) {
    if (this.btnRanking) this.btnRanking.style.display = 'flex';
    if (this.btnCamera) this.btnCamera.style.display = 'inline-flex';
    if (this.btnTheme) this.btnTheme.style.display = 'flex';
    if (this.gameoverStatsContainer) this.gameoverStatsContainer.style.display = 'none';
    if (this.btnShareScore) this.btnShareScore.style.display = 'none';

    this.modalIcon.textContent = '⏸️';
    this.modalTitle.textContent = 'JOGO PAUSADO';
    this.modalDesc.textContent = 'Clique abaixo para continuar a partida.';
    this.pregameSetupEl.style.display = 'none';
    if (this.rankingInputContainer) this.rankingInputContainer.style.display = 'none';
    if (this.btnShowRanking) this.btnShowRanking.style.display = 'none';
    this.btnStartGame.textContent = 'CONTINUAR';
    this.btnStartGame.disabled = false;
    this.btnStartGame.removeAttribute('disabled');
    this.modalScreen.classList.add('active');

    this.btnStartGame.onclick = () => {
      this.startCountdown(onResume);
    };
  }

  async showGameOverModal(finalScore, highScore, isNewRecord, stats, phaseName, onRestart) {
    if (this.btnRanking) this.btnRanking.style.display = 'flex';
    if (this.btnCamera) this.btnCamera.style.display = 'inline-flex';
    if (this.btnTheme) this.btnTheme.style.display = 'flex';
    this.modalIcon.textContent = isNewRecord ? '🏆' : '💀';
    this.modalTitle.textContent = isNewRecord ? 'NOVO RECORDE!' : 'GAME OVER';
    this.modalDesc.innerHTML = `Sua pontuação: <strong>${this.formatScore(finalScore)}</strong> (${phaseName || 'DESERTO'})<br/>Maior pontuação: <strong>${this.formatScore(highScore)}</strong>`;
    this.pregameSetupEl.style.display = 'none';
    if (this.btnShowRanking) this.btnShowRanking.style.display = 'flex';

    // Atualiza container de estatísticas
    if (stats && this.gameoverStatsContainer) {
      this.gameoverStatsContainer.style.display = 'block';
      if (this.statGames) this.statGames.textContent = stats.totalGames || 0;
      if (this.statAvg) this.statAvg.textContent = Math.floor(stats.totalScore / (stats.totalGames || 1));
      if (this.statJumps) this.statJumps.textContent = stats.maxJumpsSequence || 0;
    }

    // Botão de compartilhar recorde
    if (this.btnShareScore) {
      this.btnShareScore.style.display = 'inline-flex';
      this.btnShareScore.onclick = () => {
        const shareText = `🦖 Fiz ${this.formatScore(finalScore)} pontos no Dino 67 na fase ${phaseName || 'DESERTO'}! Consegue me superar? Jogue agora: ${window.location.href}`;
        if (navigator.share) {
          navigator.share({
            title: 'Dino 67 - Meu Recorde',
            text: shareText,
            url: window.location.href
          }).catch(() => {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(shareText).then(() => {
            alert('📋 Link e pontuação copiados para a área de transferência!');
          });
        }
      };
    }

    // Verifica se a pontuação se qualifica para o Top 5
    const qualifies = await rankingService.isTopScore(finalScore);

    if (qualifies && this.rankingInputContainer) {
      this.rankingInputContainer.style.display = 'block';
      if (this.playerNameInput) {
        this.playerNameInput.value = '';
        this.playerNameInput.focus();
      }

      if (this.rankingForm) {
        this.rankingForm.onsubmit = async (e) => {
          e.preventDefault();
          const name = this.playerNameInput.value.trim().substring(0, 10);
          if (!name) return;

          this.btnSubmitScore.disabled = true;
          this.btnSubmitScore.textContent = '⏳ SALVANDO...';

          await rankingService.submitScore(name, finalScore);

          this.btnSubmitScore.disabled = false;
          this.btnSubmitScore.textContent = '✅ RECORD SALVO!';
          this.rankingInputContainer.style.display = 'none';

          await this.openRankingModal();
        };
      }
    } else {
      if (this.rankingInputContainer) this.rankingInputContainer.style.display = 'none';
    }

    this.btnStartGame.textContent = 'JOGAR NOVAMENTE';
    this.btnStartGame.disabled = false;
    this.btnStartGame.removeAttribute('disabled');
    this.modalScreen.classList.add('active');

    this.btnStartGame.onclick = () => {
      this.startCountdown(onRestart);
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
