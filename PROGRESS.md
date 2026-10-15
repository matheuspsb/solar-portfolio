# Progress

## Done

- [x] 1. Foundation (Next 16, React 19, TS strict, ESLint, Prettier, Vitest, Playwright, React Compiler).
- [x] 2. Tokens (Tailwind v4 `@theme`) and atoms: Button, IconButton, Heading, Text, Link, VisuallyHidden.
- [x] 3. Data model: `CelestialBodyConfig`, validation, `content/` (Sun + About).
- [x] 4. Pure functions: rotation, circular navigation, motion, star field, scene quality.
- [x] 5. Base scene: Canvas, camera, OrbitControls, lights, star field (dynamic, client only).
- [x] 6. Sun: textured (CC BY 4.0, WebP 2048/1024), rotation, bloom. Texture failure falls back to a solid color.

- [x] 7. Interaction: hover (scale + cursor + hint), keyboard focus (hidden buttons + 3D focus ring), selection state.
- [x] 8. About panel: modal dialog (focus trap, Esc, outside click, focus return, inert background), axe clean, CC BY credit in panel.
- [x] 9. Quick-access menu (top-right disclosure, fed by body config, focus returns to its button).
- [x] 10. Fallback: WebGL detection, error boundary (with retry), context lost/restored notice; content stays reachable.
- [x] 11. Reduced motion (live, via matchMedia hook: no rotation, instant highlight, no damping) and responsiveness (camera framing by aspect ratio, quality tiers, no horizontal scroll at 320px).
- [x] 12. Performance (see metrics below).

## Next

- 13. Visual polish (corona, surface movement, camera/panel transitions).

## Design handoffs applied (uncommitted by request: the user commits each part)

- **Panel "Sobre" (1a + LinkedIn pill from 1b):** done; see DECISIONS.md. Stack changed to React, Next.js, TypeScript, Node.js, PostgreSQL, React Native.
- **Quick-access menu (2b, orbital):** done; see DECISIONS.md. Validation after the redesign: lint, typecheck, 505 unit tests, 37 e2e (incl. axe with the
  menu expanded and the panel open, reduced-motion checks, on-screen position at 1280 and 375 px), production build.
- Low-value tests (render-only, class comparisons, copy pinning) were removed on request: 474 -> 505 tests after adding the new ones.
- **Cleanup audit** (unused variants/tokens/exports/scripts/tests, one real styling bug fixed): see DECISIONS.md. Final: 489 unit tests, 37 e2e, lint/typecheck/build green.
- **Folder restructure** to features + shared kernel with lint-enforced boundaries (DECISIONS.md); 122 files moved, no behavior change: 489 unit tests, 37 e2e, build green.
- **Phase 2 started: Mercury ("Contato")**: data model with orbits and validation, `OrbitGroup`/`OrbitPath`/`PlanetMesh`, system framing, Contact section,
  responsive menu arc, Mercury texture and credits. See DECISIONS.md. 560 unit tests, 41 e2e (keyboard, menu, hover/click on Mercury, axe on the
  Contact panel, narrow-phone menu). Still to do: camera fly-to, more planets (Projetos, Experiencia), moons.

## Performance metrics (production build, Lighthouse 13 in headless Chromium with SwiftShader software WebGL)

| Step                                                                                    | Mobile perf | Desktop perf   | Mobile TBT              | Desktop TBT | A11y | Best practices | SEO |
| --------------------------------------------------------------------------------------- | ----------- | -------------- | ----------------------- | ----------- | ---- | -------------- | --- |
| Baseline (before item 12)                                                               | 70          | 74             | 2110-2440 ms            | 690 ms      | 100  | 96             | 100 |
| + favicon, source maps, demand frameloop                                                | 70          | 74             | 1910 ms                 | 710 ms      | 100  | 100            | 100 |
| + lazy post-processing chunk                                                            | 71-72       | -              | 1600-1810 ms            | -           | 100  | 100            | 100 |
| + scene mount deferred to idle (`useIdleReady`)                                         | 72-79       | 79             | 860-1770 ms             | 480 ms      | 100  | 100            | 100 |
| + WebGL probe deferred to idle and its context released                                 | 76-79       | **95**         | 850-1100 ms             | 180 ms      | 100  | 100            | 100 |
| + panel and orbital-menu redesign (fonts via `next/font`, JetBrains Mono not preloaded) | 76          | 94             | 930-960 ms              | 190 ms      | 100  | 100            | 100 |
| + Mercury (second texture, orbit, Lambert planet)                                       | 70-71       | 83-94 (noisy)  | 1500-1700 ms            | 200-380 ms  | 100  | 100            | 100 |
| + camera focus, live orbits with panel open, contact form (form lazy-loaded)            | 69-72       | 85-91 (one 78) | 1460-1710 ms (one 2430) | 240-470 ms  | 100  | 100            | 100 |

- After the redesign LCP moved from ~2.2 s to ~2.5 s on mobile (the LCP element is the menu button text; 8 KB of render-blocking CSS and the web font are on its path). Bundle total 465 KB gzip.

- Bundle (gzip, all chunks): ~446 KB total; the three/R3F chunk (~229 KB) loads lazily, after content and menu are visible.
  Content, menu and panel render server-side before any 3D code runs (CLS = 0).
- Desktop reaches the >90 target (95). Mobile stays at 76-79 **in this environment**: Lighthouse runs on a CPU-emulated GPU (SwiftShader) with 4x CPU throttle;
  total blocking time comes from evaluating three.js (~1 MB raw) and compiling shaders in software. LCP element is the menu button (text, SSR).
  The first WebGL context creation alone cost ~0.9 s of main thread under SwiftShader (the probe now waits for idle and releases its context). Tried: lazy bundle split, idle-deferred mount, demand frameloop, deferred probe; not tried yet: replacing `@react-three/postprocessing` (n8ao is bundled) with `postprocessing` directly (~100 KB raw).
- FPS (SwiftShader, so pessimistic): 1280x800 about 11 fps (CPU raster of bloom), 375x740 about 38 fps. On real GPUs the scene (one 18k-triangle sphere, <=2600 points, bloom) is far below budget. Measure with `node scripts/measure-fps.mjs`.
- Idle cost: the render loop switches to `demand` only when reduced motion is preferred (planets keep orbiting behind the open panel since the camera-focus work; e2e verifies the orbit keeps moving).
- Contact form: `react-hook-form` + `zod` are lazy-loaded with the form (`React.lazy` in `ContactSection`). Eagerly imported they added ~120 KB gzip to the initial JS (found by measuring); now the initial JS is ~195 KB gzip and the total build is ~570 KB gzip including lazy chunks (three, bloom, form).
- Tools: `scripts/lighthouse.mjs`, `scripts/bundle-size.mjs`, `scripts/bundle-analyze.mjs`, `scripts/measure-fps.mjs`.

## Pending reminders

## Learnings

- Tailwind v4 has no `duration-*` theme namespace: durations are plain CSS variables + `@utility duration-*` in tokens.css, and the reduced-motion override lives in a plain `:root` media query (`@theme` inside `@media` is ignored).
- R3F `<shaderMaterial uniforms>`: the material ends up with its own uniforms object, so mutate through a ref to the material, not the object passed in (the React Compiler lint also flags the latter).
- Axe measures colors mid-animation: wait for `document.getAnimations()` to finish before scanning.

- Playwright e2e builds and serves production on port 3100 and never reuses an existing server (stop manual servers first, or the port is busy).
- `scripts/screenshot.mjs <name> [w] [h]` captures a screenshot of the running server into `screenshots/`.
- three 0.186 + R3F 9.8 logs a Clock deprecation warning; three is pinned to 0.182 (see DECISIONS.md).

## Câmera, órbitas ao vivo e formulário de contato

- Planetas continuam orbitando com o painel aberto; a câmera gira em torno do Sol até o corpo focado/selecionado (Tab, setas, clique, menu).
- Formulário de contato (react-hook-form + zod) com Server Action. **Pendente de integração:** a entrega (`services/contact.ts`) descarta a mensagem.
- Validação: lint, typecheck, 669 testes unitários, 48 e2e (incl. axe no painel com erros do formulário, 320 px) e build passando.

## Contato em etapas (cometa + Correio de Hermes)

- Painel de contato refeito conforme o handoff 3b: três perguntas (Nome, E-mail, Mensagem), cometa percorrendo o arco com rastro, planetas que acendem com onda, linha do campo que enche, ✓ no e-mail válido, tremida na validação, anel contador de 500, cometa saindo com linhas de velocidade e a entrega com envelope alado, brilho em Mercúrio, carimbo "Entregue" e recibo.
- Validação: lint, typecheck, 686 testes unitários (depois de três podas de testes redundantes), 54 e2e (incluindo axe nas telas de erro e de entrega, 320/375 px e movimento reduzido) e build passando.
- Métricas: JS inicial ~195 KB gzip (formulário e zod em chunk preguiçoso); Lighthouse mobile 69-71 (TBT 1,5-2,0 s, mesma causa de antes), desktop 91-93, acessibilidade/boas práticas/SEO 100.

## Envio por e-mail (Resend)

- A Server Action agora entrega por e-mail pelo Resend (`services/`), com o cliente injetável nos testes, escape de HTML, `reply-to` com o e-mail do visitante e log do erro real só no servidor. 706 testes unitários, lint, typecheck, build e e2e do contato passando (o e2e usa `CONTACT_DELIVERY=disabled`).
- **Pendente (só você pode fazer):** gerar a chave no Resend, preencher `.env.local` e cadastrar as variáveis na Vercel. Proteção contra bots: honeypot + tempo mínimo + sinais obrigatórios implementados (`domain/bot-guard.ts`, 726 testes unitários); falta o limite por IP no painel da Vercel (veja DECISIONS.md, camada 2).

## Hover "Alvo travado"

- Substituiu o rótulo genérico dos astros pelo overlay do handoff 5a (cantoneiras, linha de telemetria, ficha com nome decodificado), com a projeção 3D→2D na cena e a nova feature `target-lock`; toque em dois passos; leve brilho no astro em hover/foco.
- Validação: lint, typecheck, 796 testes unitários, 57 e2e (incluindo teclado, movimento reduzido e celular de 360 px) e build passando. JS inicial ~198 KB gzip; Lighthouse mobile 69-70, desktop 84-89, acessibilidade/boas práticas/SEO 100.

## Loading "Nascimento do sistema"

- **O que é.** Tela de loading da primeira visita da sessão (handoff em `design/design_handoff_loading`): estrelas, hiperespaço, nebulosa, ignição, órbitas e a revelação da página, em **8,0 s** (o protótipo tinha 14 s). A animação roda sempre inteira e na mesma velocidade; a carga real nunca a acelera. Se a cena 3D ainda não estiver pronta quando a etapa Órbitas termina, a animação segura ali (planetas seguem orbitando, rótulo "Finalizando", barra em 99%) e só encerra quando a cena for revelada; teto de segurança de 15 s.
- **Casos de uso e bordas cobertos.** Delta de tempo `NaN`, negativo, zero, `Infinity` e enorme (aba em segundo plano); tempo fora de [0, total]; "Pular" com a cena não pronta; `Esc` repetido e com o loader já fechado; `Tab` preso no botão "Pular"; `sessionStorage` bloqueado ou ausente; movimento reduzido (estático, sem quadros agendados, termina ao revelar a cena); cena sem WebGL (libera na hora); visita repetida (nenhum flash: um script inline marca o `<html>` antes da hidratação).
- **Números (build de produção, SwiftShader).** JS inicial 198,5 → 209,6 KB gzip (+11 KB). Lighthouse mobile 69 (LCP 2,6 s, TBT 1,28 s), desktop 81, acessibilidade, boas práticas e SEO 100. O loader sozinho roda a 60 fps (mediana de 17 ms) mesmo com CPU 4x mais lenta; o blocking total é o mesmo com ou sem ele (`node scripts/measure-loader.mjs first|seen|loader-only <cpu> <largura> <altura>`).
- **Aprendizado.** Na primeira versão a barra seguia `max(animada, real)`; com a cena já carregada ela mostrava 100% na etapa 3, então o progresso real saiu da barra (ver DECISIONS.md). O LCP subiu para 4,7 s porque o rótulo da etapa só pintava depois da hidratação; o HUD agora é visível já no HTML do servidor (LCP volta a 2,6 s e a primeira pintura já mostra "carregando" em vez de preto).
- **Testes.** 923 unitários, 63 e2e (o fixture `e2e/fixtures.ts` marca o loader como visto; `e2e/loader.spec.ts` cobre a primeira visita, `Esc`, "Pular", recarga, axe e movimento reduzido).
- **Pendências registradas.** T26 (hover perdido quando a textura chega sob o ponteiro, flake raro do e2e) e T27 (pausar o render da cena enquanto o loader a cobre) em `TASKS.md`.

## Vênus (cenário, sem interação)

- Vênus orbita na cena como corpo sem seção: fora do menu e do teclado, sem área de clique nem alvo travado. A interação e a seção entram na próxima etapa (ver DECISIONS.md).
- Validação: lint, typecheck, 949 testes unitários (15 novos: corpo sem seção, estrela sem seção, órbitas que se cruzam, `getInteractiveBodies`, malha sem alvo de clique, portfólio ignorando o cenário), 64 e2e com 1 worker (incluindo `e2e/venus.spec.ts`) e build passando. Screenshots em 1280x800 e 375x740: composição equilibrada, Sol um pouco menor pela câmera mais afastada.
- Textura de Vênus aplicada (`venus.webp`/`venus-small.webp`, crédito em `CREDITS.md` e no rodapé do painel). Conferida em 1280x800 e 375x740: planeta laranja-bege fosco, sem brilho exagerado, composição mantida. e2e novo confere o carregamento da textura.

## T1: props da cena repassadas em bloco

- O `SolarSystemSceneLoader` deixou de desestruturar e repassar uma a uma as props de `SceneProps`; o tipo da cena passou a ser composto (`SceneProps & SceneSettings`). Sem mudança de comportamento.
- Validação: lint, typecheck, 935 testes unitários e build passando. e2e: 61 de 63 com 2 workers; as 2 falhas (`camera-focus` e `loader` de primeira visita) são de tempo sob SwiftShader neste ambiente, e passam com 1 worker (o `camera-focus` falhou também no código anterior à mudança). O Chromium do ambiente é o 1194, mais antigo que o esperado pelo Playwright; rodei com `executablePath` em uma config local descartada.
- Próximo: T2 (interação do corpo celeste até a malha).

## Rascunho do contato

- O formulário de contato guarda nome, e-mail, mensagem e etapa no `localStorage` e os restaura ao reabrir o painel, recarregar ou voltar à aba; apaga ao entregar. Sem Zustand, sem Context, sem cookie (ver DECISIONS.md).
- Revisão de simplicidade: o acesso seguro ao storage, que estava duplicado, virou `lib/safe-storage.ts` (usado também por `loader-seen`); saíram a retomada por validação de etapas (o fluxo já garante), a deduplicação de gravações (sem ganho medido), uma constante e uma função duplicadas e um teste de integração redundante.
- Validação: lint, typecheck, testes unitários e build passando; e2e do contato (incluindo recarregar e retomar) passando. O e2e de primeira visita do loader falha neste ambiente também no `prod` sem esta mudança (loader de 10 s sob SwiftShader estoura os 30 s do teste).

- Bug corrigido: o painel piscava no Windows na etapa da mensagem com a janela a ~949 px de altura (ciclo da barra de rolagem com a escala do `JourneyStage`). Correção: `scrollbar-gutter: stable` no painel; e2e `panel-layout.spec.ts` reproduz e trava o caso. Varredura de 700 a 970 px na etapa da mensagem sem oscilação.

## Próxima fase (proposta, não implementada): planetas e órbitas

Objetivo: cada planeta é uma seção (Projetos, Experiência, Contato...). A arquitetura atual já é orientada a dados; o que muda:

1. **Dados.** Estender `CelestialBodyConfig` (`domain/celestial-body.ts`) com `kind: 'star' | 'planet' | 'moon'` e, para corpos em órbita,
   `orbit: { parentId, radius, periodSeconds, phase, inclination }`. Validar em `validateCelestialBodies`: `parentId` existente, sem ciclos,
   raio de órbita > raio do pai, período finito > 0. Novos tipos de conteúdo entram em `SectionContent` e ganham um case em `SectionView`.
   Testes: ids duplicados, órbita sem pai, ciclo pai-filho, lista com planeta sem textura.
2. **Funções puras.** `lib/orbit.ts` (`getOrbitPosition({ orbit, elapsedSeconds })`, usando o mesmo clamp de delta de `rotation.ts`) e
   `getOrbitPath(...)` para desenhar o anel. A navegação circular (`getAdjacentId`) e o menu já funcionam com N corpos.
3. **Cena.** `CelestialBody` passa a escolher a malha por `kind` (hoje só `SunMesh`; criar `PlanetMesh` com material Lambert/Standard,
   que usa a `SceneLights` já posicionada no Sol) e a ser envolvido por um `OrbitGroup` que aplica a posição orbital em `useFrame`
   (com `prefersReducedMotion` congelando a órbita). `SunCorona`/bloom ficam só nas estrelas (`kind === 'star'`).
4. **Câmera.** Reaproveitar `getFramingDistance` para enquadrar o sistema inteiro (raio = maior órbita + margem) e adicionar
   `CameraFocus` para voar até o corpo selecionado (duração via `getTransitionSeconds`, zero com movimento reduzido), no mesmo estilo de
   `CameraViewOffset`.
5. **Interação.** `SceneKeyboardControls` e `QuickAccessMenu` já listam todos os corpos; o `FocusRing` e o `BodyHint` vêm do `CelestialBody`.
   Para planetas pequenos aumentar a área clicável com uma esfera de raycast invisível (`raycast` só nela) sem alterar o visual.
6. **Performance.** Rever o tier de qualidade por número de corpos (`lib/scene-quality.ts`), instanciar geometrias iguais
   (`InstancedMesh` ou `useMemo` explícito) e manter o carregamento lazy de texturas por corpo (`useTexture` já é por URL).
7. **Testes e2e.** Percorrer todos os corpos com Tab/setas, abrir cada painel, axe com a cena cheia, e checar que órbitas param com
   movimento reduzido.

## T2: interação do corpo celeste lida direto pela malha

- **Caso de uso.** Quem visita aponta, clica ou foca um astro e espera o mesmo destaque, cursor e abertura de seção de antes; com movimento reduzido, o destaque continua instantâneo. Para quem mantém o código, adicionar um planeta não deve exigir repassar handlers por `CelestialBody`. Se quebrasse, o astro deixaria de reagir ao ponteiro, abriria a seção errada (handler ligado ao id errado), o cursor ficaria preso em "pointer" depois que o astro sai da cena, ou o destaque animaria com movimento reduzido.
- **Feito.** Novo contexto `BodyInteractionProvider` montado pela `SolarSystemScene`; `SunMesh` e `PlanetMesh` leem destaque, easing, handlers e cursor com `useBodyInteraction(id)`; `CelestialBody` lê o destaque (anel de foco) e o movimento reduzido do contexto e não repassa mais nenhuma prop de interação. Props: `SunMesh` 10 → 5, `PlanetMesh` 9 → 5.
- **Validação.** Lint, typecheck, 958 testes unitários (antes 935; novos: hook, id certo nos handlers, destaque de outro corpo ignorado, cursor devolvido ao desmontar, destaque instantâneo com movimento reduzido, anel de foco), 65 e2e com 1 worker e build passando. No navegador: hover no Sol (alvo travado, cursor pointer → auto), clique abre "Sobre", `Esc` fecha, foco de teclado em Mercúrio mostra anel e alvo; console sem erros.
- **Próximo:** T3 (`emblemTextureUrl` no conteúdo "Sobre").

## Venus Arcade (branch `feat/venus-arcade`)

Plano aprovado em 2026-10-13 a partir do handoff `design/design_handoff_venus_arcade/`. Um commit por etapa; ao fim de cada etapa, parar e esperar a revisão do Matheus. Decisões do Matheus: texto do jogo em inglês e acessibilidade em português; o fliperama é estado (sem rota nova); escolher Sobre ou Contato no menu dentro do fliperama sai dele e abre o painel; `rootScore` calibrado com o tempo (começa em 5000); recordes no `localStorage`; pastas por área dentro da feature.

Etapas: 1 Vênus vira entrada · 2 casca imersiva (menu fora do `inert`, Esc em camadas, cena em `frameloop="never"`, fecha a T27) · 3–5 motor puro (regras, drone, tiros, entidades, spawn, colisão, integridade, pontuação) · 6 resultados e recordes · 7 máquina de sessão e teclado · 8 tokens, Silkscreen e átomos · 9 boot e home · 10 jogo jogável · 11 pausa e toque · 12 fim e resultados · 13 áudio · 14 mergulho da câmera · 15 acabamento · 16 easter egg · 17 medição final.

### Etapa 1: Vênus vira entrada

- **Caso de uso** (registrado depois dos testes, fora da ordem do ciclo). Quem visita vê Vênus como destino: no Tab e nas setas, no menu de acesso rápido e no alvo travado ("Clique para pousar"). Selecionar abre o fliperama em tela cheia (por enquanto só a casca), e `Esc` ou "← Sistema solar" devolvem o visitante e o foco a Vênus. Se quebrasse, Vênus abriria um painel vazio, o foco se perderia atrás de uma camada `inert`, ou o menu cobriria destinos no celular.
- **Feito.** `BodySection` virou união `PanelSection | ImmersiveSection` (`presentation`); a seção imersiva tem `experience` e `callToAction` e dispensa título e rótulo de painel. Vênus ganhou a seção `venus-arcade` (tom `copper`). O alvo travado recebe `cta: { lead, accent }` montado por corpo. O portfolio abre seções de painel no `ContentPanel` e experiências no `ImmersiveView`, que carrega `features/venus-arcade` sob demanda. `useModalFocus` e `focus-trap` subiram para `hooks/` e `lib/` (agora usados por duas features).
- **Bug encontrado e corrigido.** Com três destinos, o menu orbital se sobrepunha em 320 a 400 px (o item a 170° invadia o botão, o que já acontecia em 320 px com dois itens, e "Contato" encostava em "Sobre"). Agora o arco começa a 90°, a reserva horizontal é de 200 px e telas abaixo de 375 px usam uma coluna sob o botão. Um e2e mede as caixas reais em 320, 375 e 1280 px.
- **Validação.** Lint, typecheck, 1016 testes unitários, 70 e2e (1 worker), build. JS inicial 205,1 KB gzip; o fliperama fica em um chunk à parte (0,8 KB). No navegador: alvo travado de Vênus, clique e `Esc`, foco devolvido, menu em 320, 375 e 1280 px, console sem erros.

### Etapa 2: casca imersiva

- **Caso de uso.** Dentro do fliperama, quem visita usa só os controles dele e volta pelo "← Sistema solar" ou `Esc`; o Tab fica preso no fliperama. A cena 3D, totalmente coberta, para de renderizar e volta ao sair; atrás de um painel ela continua viva, como antes. Se quebrasse, a GPU gastaria renderizando uma cena invisível.
- **Feito.** A cena recebe `isHidden` e usa `frameloop="never"` enquanto o fliperama a cobre. O cabeçalho do fliperama se alinha ao canto (`pt-5`, `px-5`).
- **Revisão do Matheus.** A primeira versão (commit `4906bb1`) levava o menu "Acesso rápido" para dentro do fliperama, com `Esc` em camadas e rótulo curto no celular. A pedido do Matheus o menu saiu do fliperama para simplificar: foram embora o slot de menu, o protocolo de `Esc` (`preventDefault` + `defaultPrevented`), o breakpoint `xs` e o rótulo curto. A decisão D3 (Sobre/Contato pelo menu dentro do fliperama) deixa de valer.
- **Medição.** Desenhos WebGL por segundo (Chromium headless, SwiftShader): 308 com o fliperama fechado, 0 aberto, 174 depois de sair.
- **Validação.** Lint, typecheck, 1021 unitários, e2e de Vênus, menu, Mercúrio e painel, build.
- **Fora desta etapa.** A T27 (pausar a cena sob o loader) continua aberta: o `isHidden` serve para ela, mas o loader depende da cena para revelar e a T27 pede medição própria com `scripts/measure-loader.mjs`.

### Etapa 3: motor puro, parte 1 (regras base, drone e tiros)

- **Caso de uso** (anotado antes dos testes). O jogo do fliperama precisa de um motor sem React nem canvas, em funções puras, para que as regras do handoff (45 s, drone que segue o mouse ou anda a 480 px/s pelo teclado, tiro automático a cada 0,15 s, leque de 3 tiros no Hotfix) sejam testáveis sem navegador. Quem joga espera que o drone nunca saia da área permitida, que um quadro longo (aba em segundo plano) não o faça atravessar a tela nem dispare dezenas de tiros, e que a diagonal não seja mais rápida. Se falhasse: drone fora da tela, rajada de tiros após uma pausa, partida mais fácil ou mais difícil que a desenhada.
- **Feito.** `features/venus-arcade/engine/`: `constants` (todos os números do handoff com nome), `play-field` (escala de pixel 4/3 e limites do drone), `difficulty` (`t / 45`, limitado), `drone` (`createDrone`, `aimDrone`, `stepDrone`), `shots` (`createWeapon`, `advanceWeapon`, `spawnShots`, `advanceShots`) e `time-step`. Tudo imutável: cada função devolve um valor novo.
- **Bordas cobertas.** Passo `0`, negativo, `NaN` e enorme; direção e ponteiro `NaN`; campo menor que o drone ou que a área útil; redimensionamento que deixa o drone fora; diagonal; teclas que se anulam; tiros que saem por cima ou pelos lados; lista vazia; a lista de entrada não é alterada.
- **Dedupe.** `clamp` e `mix` foram para `lib/math.ts` (o loading-screen tinha o próprio `mix`, agora importa de lá).
- **Validação.** Lint, typecheck e testes unitários. Nenhuma tela mudou, então não rodei e2e nem abri o navegador. Dois testes de mutação (diagonal sem normalizar e corte de tiros desligado) falham como esperado.

### Etapa 4: motor puro, parte 2 (entidades e spawn)

- **Caso de uso** (anotado antes dos testes). A partida precisa de bugs que descem em zigue-zague, dados corrompidos, estilhaços que não morrem, rasgos de glitch e patches, e de um gerador que os solte no ritmo do handoff, mais denso a cada segundo. Quem joga espera ondas previsíveis: sem besouros antes de 10 s, sem estilhaços antes de 6 s, sem rasgos antes de 14 s e nunca dois rasgos juntos. Se falhasse: a partida começaria impossível, ou monótona, ou um rasgo cobriria o outro e não haveria onde desviar.
- **Feito.** `engine/entities` (tipos e fábricas de `Bug` com `crawler` e `beetle`, `CorruptedData`, `Shard`, `Tear`, `Patch`), `engine/entity-motion` (`advanceEntities`: descida, zigue-zague limitado à largura, troca do glifo do dado, ciclo do rasgo, saída pela base e contagem de vazamentos de bug) e `engine/spawn` (`createSpawnTimers`, `spawnEntities` com os quatro relógios, regras de início por tipo e um rasgo por vez). O sorteio entra por parâmetro (`Random`), então os testes são determinísticos.
- **Bordas cobertas.** Passo `0`, negativo, `NaN` e `Infinity` (nada muda); pausa enorme (no máximo um de cada tipo); campo mais estreito que um sprite; sorteio no mínimo e no máximo; lista vazia; a lista de entrada não é alterada; vazamento só conta bugs (dado, estilhaço e patch que saem pela base não contam).
- **Validação.** Lint, typecheck e unitários. Nenhuma tela mudou, então sem e2e nem navegador. Mutações (estilhaços sem a espera dos 6 s, rasgo sem a regra "um por vez", vazamento zerado) falham como esperado.
