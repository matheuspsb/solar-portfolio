# Handoff: Venus Arcade (fliperama escondido em Vênus)

## Overview
Experiência do planeta Vênus no portfólio em sistema solar 3D. O visitante clica em Vênus, a câmera mergulha no planeta, um CRT liga e aparece um fliperama alienígena. Ele tem 3 cartuchos, o jogo principal **BUG HUNTER: PRODUCTION IS UNDER ATTACK**, a tela de resultados e um easter egg.

## Sobre os arquivos
`Venus Arcade.dc.html` é um **protótipo hi-fi em HTML**, não código de produção. Abra no navegador para jogar. A classe `Component` no fim do arquivo é a **fonte da verdade** para lógica, tempos, spawn, pontuação e sprites. Recrie em React/Next.js seguindo os padrões do codebase:
- Overlay de tela cheia por cima do canvas 3D.
- Jogo num `<canvas>` 2D com loop `requestAnimationFrame`.
- HUD e telas em DOM.

Use o painel de Tweaks (prop `startAt`) para abrir direto em cada estado: `space`, `boot`, `home`, `title`, `play`, `paused`, `crash`, `results`, `easter`. As outras props são `forceMobile`, `reducedMotion` e `rootScore`.

## Fidelidade
Alta. Cores, fontes, tempos e regras de jogo estão descritos abaixo e no código.

## Fluxo / máquina de estados
`space → zoom (1.7s) → boot (~3s) → home → play[title → count → run ⇄ paused → end] → results`

- **space**: a cena atual do site.
  - Hover ou foco em Vênus mostra o "alvo travado" (padrão 5a, já implementado): "ALVO TRAVADO · 003 / VÊNUS / Algo zumbe sob as nuvens / Clique para pousar →".
  - No mobile aparece a dica "TOQUE EM VÊNUS PARA POUSAR".
- **zoom**: em produção, use o **planeta 3D real**.
  - A câmera avança até Vênus preencher a tela (1.7s, `cubic-bezier(.75,0,.2,1)`), com brilho 1.5 e saturação 1.2.
  - Uma névoa laranja radial (`#ffcf8a → #e0803a → #8a3415 → #1a0805`) entra em 1.1s, com delay de .5s.
  - Partículas: 180 riscos radiais saindo do centro de Vênus e acelerando (velocidade × (1 + 1.8T)), nas cores `#ffe2b0 #f2b56b #e0803a #fff`.
- **boot**:
  - O fliperama faz fade-in (.7s) e a tela liga com `crtOn` (.8s: scale(.6,.004) → scale(1,.004) → scale(1,1.03) → 1, com brightness 4 → 1).
  - Depois entram 6 linhas de BIOS, uma a cada 230ms, e o título "VENUS ARCADE — SYSTEM ONLINE_" com pop.
  - Vai para a home sozinho em ~1.5s. Qualquer tecla pula.
- **Voltar ao sistema solar**: o fliperama faz fade-out (.65s) enquanto a câmera se afasta (1.1s) e a névoa some.

## Layout
- **Topo** (fixo, 64px):
  - Esquerda: "← Sistema solar" (no mobile, "← Sistema").
  - Direita: botão de som (desligado por padrão, aria-pressed) e o menu **Acesso rápido** que já existe (2b).
- **Cabine** (centro, `min(1080px,100%)`, max-height 780):
  - Moldura: gradiente `#22160f → #120b08`, borda `#3a261a`, radius 26px.
  - Gravação "⟟⏃⍀⏚ · CAB-02" e um LED "PWR" piscando.
  - Tela: radius 16px, fundo `#0b0705`, `container-type:inline-size`. Os tamanhos usam `cqw`.
- **Overlays do CRT** (pointer-events none):
  - Scanlines (`#00000047` 1px a cada 3px, opacity .55, flicker de 4s).
  - Ruído de 128px com 5% de opacidade.
  - Vinheta, um reflexo a 160° e um tint interno `#f2b56b12`.
- **Telas largas (>1240px)**: duas cabines vizinhas apagadas, "CAB-01 · OFFLINE" e "CAB-03 · 464 °C", com LEDs.
- **Legenda de teclas** (desktop, home e jogo): MOUSE·WASD Move · AUTO Fire · ESC Pause/back · R Restart · M Sound.
- **Mobile (<720px)**:
  - Cabine quase em tela cheia (padding 8px), sem legenda e sem cabines laterais.
  - Controles de toque: arrastar move o drone de forma relativa, mantendo o offset do dedo, com `touch-action:none`.

## Home (cartuchos)
- Kicker "⟟ 3 CARTRIDGES DETECTED ⟟", título "VENUS ARCADE" (Silkscreen, `#ffcf8a`, glow) e "BEST · 000000".
- Grid de 3 colunas. Cada cartucho tem:
  - Um entalhe no topo.
  - Corpo `#2a1b13 → #160e0a`.
  - Rótulo quadrado com gradiente, scanlines, sprite pixel-art (46%) e glifo no canto.
  - Nome, código e status.
- **Selecionado (hover, foco ou setas)**: translateY(-12px) com overshoot, borda `#f2b56b`, glow e sprite com bob de 1.6s.
- **Descrição**: aparece abaixo, junto com a ação.
- **Cartuchos**:

| Cartucho | Status | Ao inserir |
|---|---|---|
| BUG HUNTER | READY | Abre o jogo |
| SULFUR DRIFT | NO SIGNAL | Shake + "NO SIGNAL · CARTRIDGE REJECTED" |
| ROOT:// (bloqueado: "? ? ?", cadeado) | SEALED / UNLOCKED | Bloqueado: "ACCESS DENIED". Desbloqueado: Hotfix mode |

## BUG HUNTER

### Regras

**Partida**: 45s. O drone atira sozinho a cada 0.15s; no Hotfix, a cada 0.10s com 3 tiros (±0.22 rad). Velocidade dos tiros: 780px/s.

**Movimento do drone**:
- Mouse: segue o cursor (lerp `1-exp(-14dt)`).
- Teclado: WASD ou setas a 480px/s.
- Área permitida: de 14% a 100% da altura da tela.

**Integridade**: 3 vidas. Um impacto tira 1, dá 1.4s de invulnerabilidade (piscando), zera o combo e faz shake de .35s.

**Combo**: cada kill soma +1 e o combo zera após 2.4s sem kill. Multiplicador = `1 + min(4, floor(combo/6))`, até ×5.

**Dificuldade**: `d = t/45`. Os intervalos e velocidades interpolam com `mix(a,b,d)`.

**Entidades** (`px` = 4 no desktop e 3 quando a tela tem menos de 560px):

| Entidade | Surge | Comportamento | HP | Pontos |
|---|---|---|---|---|
| Crawler | a cada mix(.8,.28)·rand(.7,1.3)s | Desce a mix(75,160) px/s com zigue-zague senoidal (amp 18–60) | 1 | 10 |
| Beetle | 22–32% dos spawns após 10s | Desce a mix(45,85), oscila pouco | 3 | 40 |
| Dado corrompido | a cada mix(3,1.7)s | Bloco que desce a 40–70 px/s com glifo trocando (0x, ERR, ??, #!, NaN, 404). 14% de chance de soltar um patch | 2 | 25 |
| Shard (glitch) | após 6s, a cada mix(2.4,.8)s | Cai a mix(170,320). **Não pode ser destruído.** | — | — |
| Tear (glitch) | após 14s, a cada mix(6,3.2)s, um por vez | Faixa horizontal: aviso tracejado piscando ".9s ! GLITCH INCOMING", depois fica ativa por 1s, com separação RGB | — | — |
| Patch | drop | Restaura +1 de integridade (com 3, dá +50) | — | — |

**Leak**: um bug que passa pela base zera o combo e mostra "LEAK".

**Fim**: integridade em 0 dá **SYSTEM CRASHED** (vermelho, glitch). O tempo chegando a 0 dá **DEPLOY SUCCESSFUL**. O banner fica 1.7s e depois vêm os resultados.

### Visual do jogo
- Fundo `#0b0705` com grade de pontos `#2e1c11` (32px) rolando a 24px/s e 5 trilhas verticais `#1e130b`.
- Sprites em pixel art (bitmaps no objeto `SP` do código), pré-renderizados em canvases offscreen por cor e escala.
  - Crawler `#ffb347`, Beetle `#e0603a`, dado `#f2b56b`.
  - Glitch `#e2574c` com cópia `#9fb4e8` deslocada.
  - Drone `#ffe2b0` (Hotfix `#ffd36b`), com propulsor piscando.
- Tiros: retângulos de 3×12, `#fff1c9`, com shadowBlur 8 `#f2b56b`.
- Explosões em partículas quadradas com gravidade e textos flutuantes "+pts" em Silkscreen.

### Telas do jogo
- **Título**:
  - Kicker "CARTRIDGE 01 · 45 SECONDS" e "BUG HUNTER" (Silkscreen grande).
  - Subtítulo "PRODUCTION IS UNDER ATTACK" em `#e2574c`.
  - Legenda com 4 itens (SQUASH / CLEAN / AVOID / CATCH), texto de controles e botão "START · ENTER" (no mobile, "TAP TO START").
- **Contagem**: 3 · 2 · 1 · GO, cada um com pop de .6s.
- **HUD**:
  - SCORE de 6 dígitos e o chip "x3 · 14 COMBO".
  - Timer 00:SS com barra (vermelha nos últimos 10s).
  - INTEGRITY com 3 losangos e o botão de pausa "II" (44px).
- **Pausa** (Esc/P, perda de foco da janela ou aba oculta): "PAUSED", RESUME · ESC, RESTART · R, QUIT TO ARCADE · Q e o lembrete dos controles.

## Resultados
- Kicker com o tipo de fim, score grande, chip "NEW BEST" e o rank com frase:

| Score | Rank | Frase |
|---|---|---|
| 0 | Intern on Call | You found the bugs. Production found you. |
| 800 | Junior Debugger | Solid first sprint. The tests are starting to trust you. |
| 2000 | Senior Bug Whisperer | Bugs hear your name and file their own tickets. |
| 3500 | Staff Exterminator | The uptime chart is a flat line, the good kind. |
| 5000 | Principal of Production | Pagers stay silent when you are on call. |

- Estatísticas: BUGS SQUASHED, DATA CLEANED, BEST COMBO e INTEGRITY LEFT.
- Botões: PLAY AGAIN · R e ARCADE · ESC.
- Com score ≥ 60% do rootScore sem atingir o rootScore, aparece a dica "A SEALED CARTRIDGE IN THE ARCADE REACTED TO THAT SCORE."

## Easter egg (score ≥ 5000)
- Bloco dourado "ROOT ACCESS": linhas de terminal digitadas, uma a cada 520ms (texto em `EGG` no código).
- No fim: "ROOT:// CARTRIDGE UNLOCKED · HOTFIX MODE" e o link "Talk to Matheus →", que deve abrir o painel de Contato.
- Desbloqueia o cartucho ROOT:// de forma persistente.

## Persistência
`localStorage`: `venusArcade.best` e `venusArcade.root`. Nada de login ou serviço externo.

## Áudio
WebAudio sintetizado com osciladores curtos. Fica **mudo até o usuário ativar**; o AudioContext só é criado nesse clique. Os sons e parâmetros estão em `sfx()`.

## Acessibilidade
- **Teclado**:
  - Tudo funciona por teclado: Vênus é focável e abre com Enter.
  - Cartuchos: Tab, setas e Enter.
  - Esc volta um nível.
- **Contraste**: textos ≥ 4.5:1 sobre `#0b0705`.
- **`prefers-reduced-motion`**:
  - Sem zoom (só fade), sem partículas da transição, sem shake, sem flicker, sem bob e sem crtOn.
- **Botões**: alvos de toque ≥ 44px e aria-labels nos botões de ícone.

## Tokens
- Fundo `#06050a` / `#0b0705`; cabine `#22160f`, `#120b08`, `#3a261a`.
- Vênus: `#ffcf8a` (fósforo), `#f2b56b` (ouro), `#ffb347` (âmbar), `#e0603a` (laranja queimado), `#e2574c` (vermelho), `#ffd36b` (root).
- Texto: `#ffe2b0`, `#d8c7b8`, `#a98a72`.
- Fontes: **Silkscreen** (display pixel), **Bricolage Grotesque** (leitura) e **JetBrains Mono** (dados), via Google Fonts.

## Notas de integração
- O botão "← Sistema solar" e o menu Acesso rápido continuam visíveis o tempo todo.
- Pause o render 3D enquanto o fliperama estiver aberto e retome ao voltar.
- O loop do jogo deve parar quando o fliperama fecha, e o canvas deve redimensionar com o container (DPR limitado a 2).
- Calibre o `rootScore` jogando; 5000 é uma estimativa.

## Files
- `Venus Arcade.dc.html`: protótipo completo e jogável.
- `support.js`: runtime necessário só para abrir o protótipo localmente.
