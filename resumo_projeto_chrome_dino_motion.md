# 🦖 Resumo do Projeto: Chrome Dino Runner Motion Control

## 1. Visão Geral do Projeto
O projeto consiste em uma releitura web do clássico **Chrome Dinosaur Game** (o jogo do dinossauro sem internet do Google Chrome), controlado inteiramente por **gestos corporais e captação de movimento** via webcam, sem necessidade de teclado ou touch.

* **Objetivo do Jogador:** Sobreviver o maior tempo possível desviando de obstáculos (cactos e pterodáctilos), acumulando pontuação progressiva.
* **Mecânica Principal:** Levar os braços verticalmente acima da linha dos ombros faz o dinossauro **pular**.
* **Estática Visual:** Pixel art minimalista em preto e branco (estilo monocromático do Chrome original), com indicador visual da câmera e pontos de rastreamento.

---

## 2. Tecnologias Utilizadas

| Camada | Tecnologia | Função no Projeto |
| :--- | :--- | :--- |
| **Rastreamento de Movimento** | **MediaPipe Pose (JS)** | Processamento de visão computacional em tempo real para detectar articulações do jogador. |
| **Game Engine / Renderização** | **Phaser.js** (ou Canvas 2D / Three.js) | Renderização do loop do jogo, física simples, detecção de colisão e sprites. |
| **Frontend Web** | **HTML5 + CSS3 + Vanilla JS / TS** | Estrutura da página, exibição da câmera e interface do usuário (UI). |

---

## 3. Lógica de Captura e Controle (Gestos)

1. **Leitura dos Keypoints da Câmera:**
   * Mapeamento constante de `left_shoulder` (ombro esquerdo), `right_shoulder` (ombro direito), `left_wrist` (punho esquerdo) e `right_wrist` (punho direito).

2. **Condição de Pulo (Gatilho):**
   * $	ext{Pulo Activado} = (Y_{	ext{punho\_esquerdo}} < Y_{	ext{ombro\_esquerdo}}) \lor (Y_{	ext{punho\_direito}} < Y_{	ext{ombro\_direito}})$
   * *Nota:* Como as coordenadas no Canvas HTML iniciam com $Y = 0$ no topo da tela, valores menores de $Y$ significam que a mão está acima do ombro.

3. **Prevenção de Falsos Disparos (Debounce / State Toggle):**
   * O pulo só é disparado na **transição** do estado `no_chao` para `pulando` para evitar acionamentos contínuos indevidos.

---

## 4. Estrutura Visual e Layout da Tela

* **Canvas Principal do Jogo (Centralizado):**
  * Dinossauro monocromático no chão.
  * Chão com textura em movimento (*parallax/tileSprite*).
  * Obstáculos surgindo da direita para a esquerda com velocidade incremental.
  * Placares de *Current Score* e *High Score*.
* **PIP (Picture-in-Picture) da Câmera:**
  * Pequeno feed da webcam no canto superior (direito ou esquerdo).
  * Exibição do esqueleto simplificado (linhas e pontos) sobre o feed para dar *feedback* imediato ao jogador sobre o rastreamento.

---

## 5. Próximos Passos de Desenvolvimento

- [ ] Configurar boilerplate HTML5 + Phaser.js.
- [ ] Integrar MediaPipe Pose via CDN / NPM com feed da webcam.
- [ ] Implementar a lógica de gatilho do pulo via coordenadas $Y$.
- [ ] Criar o cenário e dinossauro com movimentação de pulo e gravidade.
- [ ] Adicionar gerador de obstáculos com detecção de colisão.
- [ ] Adicionar efeitos sonoros retrô e tela de Game Over.
