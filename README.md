# 🦖 Dino 67 - Motion Control Game

**Dino 67** é uma releitura interativa do clássico jogo do dinossauro, controlada inteiramente por **gestos corporais e movimento via webcam** usando a biblioteca **MediaPipe Pose** e renderizada nativamente em **HTML5 Canvas 2D**.

---

## 🎮 Recursos e Mecânicas

- 📷 **Controle por Gestos:** Levante os braços até a altura dos cotovelos/peito para fazer o dinossauro **pular** e desviar de cactos e pterodáctilos.
- 🔊 **Efeitos Sonoros 8-Bit Nativos:** Áudio retrô sintetizado via **Web Audio API** (sem arquivos MP3 externos).
- 🏆 **Recorde Persistente (High Score):** Maior pontuação salva automaticamente no `localStorage`.
- 📱 **Mobile-First & Responsivo:** Design fluido adaptado para celulares e desktops com suporte a comandos de toque na tela.
- 🌙 **Modo Escuro / Claro:** Alternância de tema integrada.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3 (Design Tokens), Vanilla JavaScript (ES Modules).
- **Visão Computacional:** [MediaPipe Pose](https://google.github.io/mediapipe/solutions/pose.html) (Modelo Lite ultra leve).
- **Engine / Renderização:** HTML5 Canvas 2D nativo.
- **Áudio:** Web Audio API.
- **Build Tool:** [Vite](https://vitejs.dev/).

---

## 💻 Como Rodar o Projeto Localmente

1. **Clone este repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/dino-67.git
   cd dino-67
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no seu navegador:**
   Abra `http://localhost:5173/` (ou o IP da sua rede local exibido no terminal).

---

## 📝 Licença

Este projeto é de código aberto e está sob a licença MIT.
