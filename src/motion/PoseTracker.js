/**
 * PoseTracker.js
 * Módulo de visão computacional em tempo real usando MediaPipe Pose.
 * Rastreia as articulações dos ombros e punhos e detecta o gesto de pulo.
 */

export class PoseTracker {
  constructor({ videoElement, canvasElement, onJumpTrigger, onStatusChange }) {
    this.videoEl = videoElement;
    this.canvasEl = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.onJumpTrigger = onJumpTrigger;
    this.onStatusChange = onStatusChange;

    this.pose = null;
    this.camera = null;
    this.isTracking = false;

    // Estado do Gesto (Prevenção de Falsos Disparos / Debounce)
    this.handRaised = false; // Estado atual se a mão está acima do ombro

    // Métricas para renderização do HUD PIP
    this.lastMetrics = {
      leftWristY: 0,
      leftShoulderY: 0,
      rightWristY: 0,
      rightShoulderY: 0,
      jumpDetected: false
    };
  }

  async init() {
    try {
      // Tenta obter a instância do Pose global (carregado via script tag CDN no index.html)
      const PoseClass = window.Pose || (await import('@mediapipe/pose')).Pose;
      const CameraClass = window.Camera || (await import('@mediapipe/camera_utils')).Camera;

      if (!PoseClass) {
        throw new Error('MediaPipe Pose não encontrado na página.');
      }

      this.pose = new PoseClass({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      // Modelo Lite (complexity 0): ultra leve, até 3x mais rápido em celulares e GPUs móveis
      this.pose.setOptions({
        modelComplexity: 0,
        smoothLandmarks: false,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.pose.onResults((results) => this.handleResults(results));

      let isProcessingFrame = false;

      this.camera = new CameraClass(this.videoEl, {
        onFrame: async () => {
          // Processamento assíncrono não-bloqueante: pula quadros se a GPU do celular ainda estiver processando
          if (this.isTracking && this.videoEl.readyState >= 2 && !isProcessingFrame) {
            isProcessingFrame = true;
            try {
              await this.pose.send({ image: this.videoEl });
            } catch (e) {
              console.warn('Erro ao processar frame da câmera:', e);
            } finally {
              isProcessingFrame = false;
            }
          }
        },
        width: 256,
        height: 192
      });

      await this.camera.start();
      this.isTracking = true;
      if (this.onStatusChange) this.onStatusChange('active', 'Rastreando');
      return true;

    } catch (err) {
      console.error('Erro ao inicializar MediaPipe Pose / Câmera:', err);
      if (this.onStatusChange) this.onStatusChange('error', 'Erro ao acessar webcam');
      return false;
    }
  }

  stop() {
    this.isTracking = false;
    if (this.camera) {
      this.camera.stop();
    }
    if (this.onStatusChange) this.onStatusChange('off', 'Desativado');
  }

  handleResults(results) {
    if (!results.poseLandmarks) {
      this.drawPlaceholder();
      return;
    }

    const landmarks = results.poseLandmarks;

    // Coordenadas das articulações de interesse (0.0 a 1.0)
    // 11 = Ombro Esquerdo, 12 = Ombro Direito
    // 15 = Punho Esquerdo, 16 = Punho Direito
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    if (leftShoulder && rightShoulder && leftWrist && rightWrist) {
      // Limiar do pulo: 20% abaixo dos ombros (nível dos cotovelos) para facilidade de acionamento
      const offsetBelowShoulder = 0.20;
      const leftThreshold = leftShoulder.y + offsetBelowShoulder;
      const rightThreshold = rightShoulder.y + offsetBelowShoulder;

      // Como Y cresce para baixo, wrist.y < threshold significa que a mão está acima da linha do cotovelo
      const isLeftWristAbove = (leftWrist.visibility > 0.5) && (leftWrist.y < leftThreshold);
      const isRightWristAbove = (rightWrist.visibility > 0.5) && (rightWrist.y < rightThreshold);

      const isCurrentHandRaised = isLeftWristAbove || isRightWristAbove;

      // Lógica de disparo no estado de transição (Grounded -> Hand Raised)
      if (isCurrentHandRaised && !this.handRaised) {
        this.handRaised = true;
        if (this.onJumpTrigger) {
          this.onJumpTrigger();
        }
      } else if (!isCurrentHandRaised) {
        this.handRaised = false;
      }

      this.lastMetrics = {
        leftWristY: Math.round(leftWrist.y * 100),
        leftShoulderY: Math.round((leftShoulder.y + offsetBelowShoulder) * 100),
        rightWristY: Math.round(rightWrist.y * 100),
        rightShoulderY: Math.round((rightShoulder.y + offsetBelowShoulder) * 100),
        jumpDetected: this.handRaised
      };
    }

    // Desenha o esqueleto neon na janela PIP da câmera
    this.drawSkeleton(landmarks);
  }

  drawSkeleton(landmarks) {
    const ctx = this.ctx;
    const w = this.canvasEl.width;
    const h = this.canvasEl.height;

    ctx.clearRect(0, 0, w, h);

    // Linha limite horizontal de gatilho (20% abaixo dos ombros / nível dos cotovelos)
    const ls = landmarks[11];
    const rs = landmarks[12];
    if (ls && rs) {
      const avgThresholdY = (((ls.y + rs.y) / 2) + 0.20) * h;
      ctx.save();
      ctx.strokeStyle = this.handRaised ? '#ff3366' : 'rgba(0, 255, 204, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, avgThresholdY);
      ctx.lineTo(w, avgThresholdY);
      ctx.stroke();
      ctx.restore();
    }

    // Conexões de membros principais (Ombros, Cotovelos, Punhos, Quadril)
    const connections = [
      [11, 12], // Ombro a Ombro
      [11, 13], [13, 15], // Braço Esquerdo
      [12, 14], [14, 16], // Braço Direito
      [11, 23], [12, 24], [23, 24] // Quadril
    ];

    ctx.save();
    ctx.strokeStyle = this.handRaised ? '#ff3366' : '#00ffcc';
    ctx.lineWidth = 3;

    for (let [i, j] of connections) {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(p1.x * w, p1.y * h);
        ctx.lineTo(p2.x * w, p2.y * h);
        ctx.stroke();
      }
    }

    // Desenha pontos brilhantes nas articulações
    for (let index of [11, 12, 13, 14, 15, 16]) {
      const lm = landmarks[index];
      if (lm && lm.visibility > 0.5) {
        ctx.fillStyle = (index === 15 || index === 16) && this.handRaised ? '#ffffff' : '#00ffcc';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  drawPlaceholder() {
    this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
  }
}
