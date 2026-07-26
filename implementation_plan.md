# Melhorias Completas — Dino 67

Plano de implementação para adicionar fases temáticas, power-ups, efeitos visuais, e funcionalidades sociais ao jogo.

## Resumo das Melhorias

| # | Feature | Descrição |
|---|---------|-----------|
| 1 | Fases Temáticas | 3 fases a cada 500 pontos: Deserto → Noite → Vulcão |
| 2 | Obstáculos Temáticos | Cactos (Deserto), Morcegos (Noite), Rochas de Lava (Vulcão) |
| 3 | Power-ups | Escudo, Slowmo, Ímã de Pontos — coletáveis no caminho |
| 4 | Partículas | Poeira ao correr, trail no pulo, explosão na colisão, brilho no power-up |
| 5 | Parallax + Céu | Nuvens deslizantes + ciclo de cores do céu por fase |
| 6 | Barra de Power-up | Indicador visual de duração do power-up ativo |
| 7 | Compartilhar | Botão "Compartilhar Recorde" via Web Share API |
| 8 | Estatísticas | Partidas jogadas, média, fase máxima, sequência de pulos |

---

## Proposta de Mudanças

### Sistema de Fases — `[NEW] src/core/PhaseManager.js`

Gerencia transições de fase com base na pontuação:

```
Fase 1: DESERTO   (0–499 pontos)    → Céu laranja-quente, nuvens claras
Fase 2: NOITE     (500–999 pontos)  → Céu escuro, estrelas cintilantes
Fase 3: VULCÃO    (1000+ pontos)    → Céu vermelho/magma, partículas de cinza
```

- Cada fase define: `skyColor`, `groundColor`, `cloudStyle`, `obstacleTypes`, `particleColor`
- Ao cruzar o limiar de 500/1000 pontos → exibe banner "FASE X" animado no centro do canvas por 2 segundos
- Toca som de transição (`SoundSynth.playPhaseTransition()`)
- Após Fase 3 (1000+), a velocidade continua aumentando, mas o tema se mantém (Vulcão)

---

### Obstáculos Temáticos — `[MODIFY] src/entities/Obstacle.js`

Novos tipos de obstáculos vinculados às fases:

| Fase | Obstáculos | Sprite Pixel-Art |
|------|-----------|-----------------|
| Deserto | `CACTUS_SMALL`, `CACTUS_DOUBLE`, `CACTUS_TRIPLE`, `PTERODACTYL` | Cactos atuais + pterodáctilo |
| Noite | `BAT_LOW`, `BAT_HIGH`, `TOMBSTONE`, `TOMBSTONE_DOUBLE` | Morcegos voando (asa batendo), lápides no chão |
| Vulcão | `LAVA_ROCK`, `LAVA_ROCK_DOUBLE`, `FIREBALL` | Rochas de lava no chão, bolas de fogo voando |

- `BAT_LOW` / `BAT_HIGH`: Semelhante ao pterodáctilo, mas com sprite de morcego (menor, mais rápido)
- `TOMBSTONE`: Obstáculo terrestre estilo lápide
- `LAVA_ROCK`: Rocha irregular no chão
- `FIREBALL`: Projétil voando horizontalmente em altura variada

O `Engine.spawnObstacle()` consultará o `PhaseManager` para saber quais tipos spawnar.

---

### Power-ups — `[NEW] src/entities/PowerUp.js`

Coletáveis que aparecem aleatoriamente no caminho:

| Power-up | Ícone Pixel-Art | Efeito | Duração |
|----------|----------------|--------|---------|
| **Escudo** | Bolha azul-ciano brilhante | Absorve 1 colisão e desaparece | Até ser usado |
| **Slowmo** | Relógio roxo | Velocidade do jogo cai para 60% | 3 segundos |
| **Ímã de Pontos** | Estrela dourada | Pontuação multiplicada por 3x | 5 segundos |

**Regras de spawn:**
- Chance de spawn: ~15% a cada ciclo de spawn de obstáculo
- Só 1 power-up ativo por vez na tela
- Posição: flutua ~30px acima do chão, no lado direito
- Colisão com o dino → coleta e efeito ativado
- Quando ativo, exibir **barra de duração** na parte superior do canvas (abaixo do HUD de score)

---

### Sistema de Partículas — `[NEW] src/core/ParticleSystem.js`

Motor leve de partículas 2D para efeitos visuais:

| Efeito | Quando | Partículas |
|--------|--------|-----------|
| Poeira ao correr | Dino no chão (estado RUNNING) | 2-3 pontos pequenos saindo dos pés, cor do chão |
| Trail no pulo | Dino subindo (velocityY < 0) | Rastro de pontos atrás do dino, fade out |
| Explosão na colisão | Game Over | 15-20 fragmentos explodindo do ponto de colisão, screen shake |
| Brilho no power-up | Ao coletar power-up | Burst de 10 partículas coloridas (cor do power-up) |
| Cinzas vulcânicas | Fase Vulcão (background) | Partículas lentas caindo do topo do canvas |

**Implementação:**
- Array de objetos `{x, y, vx, vy, life, maxLife, size, color, alpha}`
- `update(dt)` move e reduz `life`
- `draw(ctx)` renderiza com `globalAlpha` baseado em `life/maxLife`
- Partículas mortas são recicladas (object pooling para performance mobile)

---

### Parallax e Cenário — `[NEW] src/entities/Sky.js`

Renderiza o fundo do canvas com profundidade:

**Camadas (de trás para frente):**
1. **Gradiente do céu** — Cor sólida ou gradiente que muda por fase
2. **Estrelas** (só na Fase Noite) — Pontos brancos pequenos cintilando
3. **Nuvens pixel-art** — 3-5 nuvens deslizando a 30% da velocidade do chão
4. **Partículas de ambiente** (cinza na Fase Vulcão)

**Transição entre fases:**
- Ao mudar de fase, o gradiente do céu faz um fade suave (interpolação de cor por ~60 frames)

---

### Barra de Duração de Power-up — `[MODIFY] src/core/Engine.js`

Quando um power-up temporário está ativo (Slowmo ou Ímã):
- Renderizar uma **barra horizontal fina** abaixo do score, no canto superior direito
- Cor da barra = cor do power-up (roxo = Slowmo, dourado = Ímã)
- Largura diminui linearmente conforme o tempo restante
- Quando o tempo acaba, a barra desaparece e o efeito cessa

---

### Compartilhar Recorde — `[MODIFY] src/ui/HUD.js`

Novo botão na tela de Game Over: **"📤 Compartilhar Recorde"**

- Usa a `navigator.share()` (Web Share API) com fallback para copiar texto
- Texto: `🦖 Fiz {score} pontos no Dino 67 e cheguei na {fase}! Consegue me superar? Jogue agora: {url}`
- Se `navigator.share` não estiver disponível → `navigator.clipboard.writeText()` + toast "Link copiado!"

---

### Estatísticas Pessoais — `[NEW] src/core/PlayerStats.js`

Dados salvos em localStorage (`dino67_stats`):

| Estatística | Cálculo |
|-------------|---------|
| Total de partidas | Incrementa a cada Game Over |
| Pontuação média | Soma total / total de partidas |
| Fase mais alta alcançada | Max entre atual e salvo |
| Maior sequência de pulos | Contador de pulos consecutivos sem morrer (resetado no Game Over) |
| Melhor pontuação local | Já existe em `Storage.js` |

**Exibição:** Card sutil na tela de Game Over, abaixo da pontuação, com as 4 estatísticas formatadas.

---

## Arquivos Modificados

### `[MODIFY] src/core/Engine.js`
- Integrar `PhaseManager`, `ParticleSystem`, `Sky`, `PowerUp`
- Lógica de spawn de power-ups no loop de obstáculos
- Aplicar efeitos de power-ups ativos (Slowmo na velocidade, Ímã no score, Escudo na colisão)
- Renderizar barra de duração de power-up ativo
- Screen shake na colisão
- Chamar `PlayerStats.recordGameOver()` no game over
- Registrar contagem de pulos para estatísticas

### `[MODIFY] src/core/SoundSynth.js`
- Adicionar `playPhaseTransition()` — arpejo ascendente épico
- Adicionar `playPowerUpCollect()` — som brilhante de coleta
- Adicionar `playShieldBreak()` — som de escudo quebrando

### `[MODIFY] src/entities/Obstacle.js`
- Adicionar novos tipos: `BAT_LOW`, `BAT_HIGH`, `TOMBSTONE`, `TOMBSTONE_DOUBLE`, `LAVA_ROCK`, `LAVA_ROCK_DOUBLE`, `FIREBALL`
- Sprites pixel-art procedurais para cada novo tipo
- Hitboxes adequadas

### `[MODIFY] src/ui/HUD.js`
- Botão "Compartilhar Recorde" no Game Over modal
- Card de estatísticas pessoais no Game Over modal
- Banner de "FASE X" renderizado via overlay (ou diretamente no canvas)

### `[MODIFY] index.html`
- Adicionar elementos DOM para banner de fase (se feito via HTML overlay)
- Botão de compartilhar no modal de Game Over
- Container de estatísticas no modal de Game Over

### `[NEW] src/core/PhaseManager.js`
- Definição das 3 fases (Deserto, Noite, Vulcão)
- Lógica de transição baseada em pontuação
- Paletas de cores e tipos de obstáculo por fase

### `[NEW] src/core/ParticleSystem.js`
- Motor de partículas 2D leve com object pooling
- Métodos: `emit(type, x, y, config)`, `update(dt)`, `draw(ctx)`

### `[NEW] src/core/PlayerStats.js`
- CRUD de estatísticas em localStorage
- Métodos: `recordGameOver(score, phase, jumps)`, `getStats()`

### `[NEW] src/entities/PowerUp.js`
- Entidade coletável com sprite pixel-art animado
- Tipos: `SHIELD`, `SLOWMO`, `MAGNET`
- Animação de flutuação (bob up/down) e brilho

### `[NEW] src/entities/Sky.js`
- Renderização de fundo com parallax
- Nuvens, estrelas, gradientes de céu por fase

---

## Plano de Verificação

### Testes Manuais
1. Jogar até 500 pontos e verificar transição Deserto → Noite (banner + mudança de cor)
2. Jogar até 1000 pontos e verificar transição Noite → Vulcão
3. Verificar que obstáculos mudam por fase (cactos → morcegos/lápides → rochas/fireballs)
4. Coletar cada power-up e verificar efeitos:
   - Escudo: absorve 1 hit, aura visível, som de quebra quando usado
   - Slowmo: velocidade cai, efeito visual azulado, barra diminuindo
   - Ímã: score 3x, números dourados, barra diminuindo
5. Verificar partículas: poeira ao correr, trail no pulo, explosão no game over
6. Verificar nuvens em parallax no fundo
7. Testar botão "Compartilhar Recorde" no Game Over
8. Verificar estatísticas acumuladas após múltiplas partidas
9. Testar no celular via ngrok para performance mobile

### Build
- `npm run build` para verificar que não há erros de compilação
