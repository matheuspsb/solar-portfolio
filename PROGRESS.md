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

### Etapa 5: motor puro, parte 3 (colisão, integridade e pontuação)

- **Caso de uso** (anotado antes dos testes). Quem joga espera que um tiro derrube o bug que tocou (besouro em três tiros, dado em dois), que o pontos subam com o combo, que um bug que escapa pela base quebre a sequência, que bater num bug ou num rasgo custe integridade com um respiro de 1,4 s e que o patch devolva a integridade (ou 50 pontos com tudo cheio). Se falhasse: tiros que atravessam inimigos, dano contínuo sem respiro, pontuação inflada ou partida que nunca termina.
- **Feito.** `engine/collisions` (`resolveShotHits`: um tiro, um alvo, dano e brilho; `resolveDroneContacts`: patch, corpo, estilhaço e rasgo, dano uma vez por passo) e `engine/scoring` (`RunStats`, `getComboMultiplier`, `applyDestroyed` com prêmios e patch sorteado só para dado, `applyLeaks`, `tickCombo`, `getRunOutcome`). O motor está completo: a sessão (etapa 7) só precisa encadear as chamadas.
- **Bordas cobertas.** Um tiro nunca acerta dois alvos; dois tiros no mesmo passo acabam o dado; estilhaço, rasgo e patch não são atingíveis; invulnerável não leva dano nem perde a entidade; a invulnerabilidade é descontada antes dos contatos; só um dano por passo; patch coletado mesmo invulnerável e no passo do dano; aviso de rasgo é inofensivo; multiplicador sobe no meio de um grupo de mortes; combo, tempo e vazamento com `NaN`, negativo e `Infinity`; integridade 0 vence o fim do tempo; listas vazias; entradas não alteradas.
- **Validação.** Lint, typecheck e unitários. Sem e2e nem navegador (nada na tela mudou). Mutações (dano sem respiro, estilhaço removido ao tocar, multiplicador depois do kill, queda sem derrota) falham como esperado.

### Etapa 6: resultados e recordes

- **Caso de uso** (anotado antes dos testes). Ao fim da partida quem joga vê o que fez (pontos, bugs, dados, melhor combo, integridade que sobrou), o rank com a frase, se bateu o recorde e, se foi muito bem, que algo selado no fliperama reagiu. O recorde e o cartucho ROOT:// desbloqueado sobrevivem a recarregar a página. Se falhasse: recorde perdido ou rebaixado, "NEW BEST" com zero ponto, cartucho que desbloqueia sem querer ou que nunca desbloqueia, ou a página quebrar com o `localStorage` bloqueado.
- **Feito.** `venus-arcade/results/`: `rank` (`getRank`, faixas em `content/arcade.ts`), `run-result` (`buildRunResult`: resumo, rank, `isNewBest`, `nextBest`, `reachedRoot`, `showsRootHint`) e `records` (`readRecords`, `saveRunResult`, chaves `venusArcade.best` e `venusArcade.root`). `ROOT_SCORE = 5000` e a dica a partir de 60% estão em `engine/constants`.
- **Bordas cobertas.** Faixas nos limites exatos (799/800, 4999/5000); pontuação negativa, `NaN` e infinita; recorde corrompido (`abc`, `-5`, `12.5`, `NaN`, `Infinity`, `1e400`); só o valor exato `1` desbloqueia; `localStorage` bloqueado ou ausente; outra aba com recorde maior (nunca rebaixa); zero ponto não grava nada; `rootScore` calibrável por parâmetro.
- **Validação.** Lint, typecheck e unitários. Sem e2e nem navegador (nenhuma tela mudou). Mutações (dica sem exigir "não chegou ao root", gravar sem comparar com o recorde guardado) falham; a mutação de `isNewBest` revelou uma guarda redundante (`score > 0`) que foi removida.
- **Revisão do Matheus.** Os recordes passaram a ser separados por modo: `venusArcade.best` (normal) e `venusArcade.best.hotfix`. `buildRunResult` recebe `mode`, `readRecords(storage, mode)` lê o recorde do modo, e `saveRunResult` grava na chave do modo da partida sem rebaixar o outro. O desbloqueio continua único. 6 testes novos (188 no total da feature).

### Etapa 7: máquina de sessão e teclado

- **Caso de uso** (anotado antes dos testes). A tela do jogo precisa de uma partida inteira como dado: título, contagem 3-2-1-GO, partida, pausa, banner de fim e resultados, tudo avançando por `advanceSession(sessão, dt, direção, sorteio)`. Quem joga espera que a pausa congele tudo (e que perder o foco da janela pause sem ligar a pausa fora de hora), que `Esc`, `P`, `R`, `Q`, `Enter`, `Espaço` e `M` façam o que o protótipo faz em cada fase, que uma aba esquecida por minutos não pule a partida e que `WASD` e setas movam o drone sem se anularem de forma estranha. Se falhasse: o jogo continuaria por trás do menu de pausa, uma pausa sem tela travaria a contagem, ou um quadro de 10 s atravessaria o mapa inteiro.
- **Feito.** `venus-arcade/session/`: `session` (`GameSession`, `createSession`, `beginCountdown`, `pauseSession`, `resumeSession`, `restartSession`, `resizeSession`, `aimSession`), `advance-session` (um passo por fase, com a ordem do protótipo na partida), `countdown` (rótulo 3, 2, 1 e GO) e `keyboard` (`trackKey`, `getKeyboardDirection`, `interpretKey` por fase). Cada passo devolve também `events` (prêmios, patches coletados, vazamentos, dano e disparo) para a tela e o áudio.
- **Bordas cobertas.** Passo `0`, negativo, `NaN` e `Infinity` (nada muda) e um passo de 600 s (limitado a 0,05 s); pausa só vale na partida (perder o foco em qualquer outra fase não faz nada); retomar só da pausa; recomeçar leva ao novo recorde a bater; redimensionar mantém o drone dentro; teclas opostas se anulam e letra mais seta contam uma vez; teclas ignoradas na contagem e no banner; mesma sorteio, mesma partida; a sessão de entrada não é alterada.
- **Validação.** Lint, typecheck e unitários. Sem e2e nem navegador (nenhuma tela mudou). Mutações (passo sem limite, vazamento ignorado, recomeço sem o recorde novo, pausa fora da partida, teclas que não se anulam) falham como esperado.

### Etapa 8: tokens, fonte Silkscreen e átomos

- **Caso de uso** (anotado antes dos testes). O fliperama precisa de uma identidade própria (fósforo âmbar sobre quase preto, fonte de pixel) que não vaze para o resto do site, de cores que o canvas do jogo também leia e de peças pequenas e reutilizáveis (botão, título de pixel, chip, legenda) para as telas das etapas 9 a 12. Quem joga precisa ler tudo: texto abaixo de 4,5:1 sobre o fundo ou botão menor que 44 px quebram a acessibilidade pedida no handoff. Se falhasse: cores soltas em cada tela, um token trocado em um lado e não no outro, ou texto ilegível no CRT.
- **Feito.** Tokens de cor `arcade-*` e `venus-*` e a fonte `--font-pixel` em `tokens.css`; o espelho para o canvas em `styles/arcade-tokens.ts`; a Silkscreen self-hosted por `next/font/local` (só o peso 400, 8 KB, sem preload porque só o fliperama a usa); `venus-arcade/ui/` com `ArcadeButton` (primário dourado e secundário contornado, alvo de toque de 44 px, ou 48 px no primário), `Kicker`, `PixelTitle` (fósforo, alerta e root) e `StatusChip`.
- **Testes.** Os tokens do canvas espelham o CSS (12 cores) e todo token usado como texto (tinta, fósforo, root, cobre, alerta, laranja queimado e dourado) passa de 4,5:1 sobre o fundo da tela, assim como o texto escuro do botão primário sobre o dourado. O `ArcadeButton` nunca envia um formulário sem querer e respeita `disabled`. Os outros átomos só repassam classes, então não têm teste próprio.
- **Validação.** Lint, typecheck, unitários e build. No navegador (build de produção, página temporária já removida): a Silkscreen carrega (confirmado por `document.fonts`), sem requisições falhas, títulos, chips e botões legíveis sobre `#0b0705`. Nenhuma classe do Tailwind fora do formato canônico.

### Etapa 9: boot e home

- **Caso de uso** (anotado antes dos testes). Quem entra no fliperama vê a máquina ligar (BIOS, título) e cai numa prateleira com três cartuchos. Qualquer tecla pula a inicialização; setas, mouse, foco e `Tab` escolhem o cartucho; `Enter` ou clique insere. O primeiro abre o jogo; o segundo balança e diz "NO SIGNAL"; o terceiro é um cadeado ("? ? ?") até o visitante provar o que sabe, e reage com "ACCESS DENIED". Quem usa leitor de tela ouve tudo em português, sem o segredo do cartucho selado. Se falhasse: `Esc` fecharia o fliperama durante o boot, o selado revelaria o nome, a seleção sairia do foco do teclado, ou um cartucho rejeitado ficaria a rejeitar para sempre.
- **Feito.** `venus-arcade/flow/` (`boot-timeline`, `cartridges`, `arcade-flow`, `use-arcade-flow`, `home-view`), `sprites/` (os 8 bitmaps do protótipo e `drawSprite`), `screens/` (`BootScreen`, `HomeScreen`, `CartridgeButton`, `GamePlaceholder`) e `ui/PixelSprite`. Textos em `content/arcade.ts` (jogo em inglês, acessibilidade em português), cores dos cartuchos e tamanhos em `tokens.css`, movimento em `styles/motion/arcade.css` (ligar do CRT, subida das linhas, pop, piscar, balanço, bob).
- **Mudança de comportamento.** `Esc` durante o boot pula o boot em vez de fechar o fliperama; na prateleira volta à cena solar. Dois e2e e dois testes do portfólio passaram a apertar `Esc` duas vezes.
- **Bordas cobertas.** Linha do tempo do boot com tempo `NaN`, negativo e infinito; mover a seleção dá a volta nas pontas; clicar num cartucho o seleciona e insere; o selado devolve "acesso negado" e o quebrado "sem sinal"; a rejeição some em 1,1 s e uma nova rejeição reinicia a espera; desmontar não deixa quadro nem temporizador; o recorde mostrado é o do modo do cartucho selecionado; ao voltar do jogo o foco volta ao cartucho.
- **Validação.** Lint, typecheck, 1423 unitários, 74 e2e (incluindo axe na prateleira) e build. No navegador (1280x720 e 375x740): boot com as linhas e a dica de pular, prateleira legível, cartucho selecionado levantado, rejeição vermelha, console sem erros e sem avisos.
- **Pendente da etapa 10.** O botão de inserir abre um `GamePlaceholder` (marcado com `TODO(venus-arcade-step-10)`) até o jogo existir.

### Etapa 10: jogo jogável

- **Caso de uso** (anotado antes dos testes). Quem insere o BUG HUNTER vê o cartão de título, aperta Enter, passa pela contagem 3-2-1-GO e joga: o drone segue o mouse ou o teclado, atira sozinho, os bugs descem, o placar mostra pontos, combo, tempo e integridade, acertos viram partículas e números flutuantes, dano treme a tela, e a partida acaba no banner de fim. Se falhasse: um desenho que não bate com o protótipo, efeitos que continuam com movimento reduzido ligado, uma aba esquecida que faz o jogo pular segundos, ou o recorde que não é gravado ao terminar.
- **Feito.** `render/draw-game` (fundo com grade que rola, rasgos com aviso e faixas, bugs, dados com rachadura, estilhaços com fantasma azul, patches, tiros, drone com piscar de invulnerável e escapamento, partículas, textos flutuantes e tremor); `effects/` (`effects` e `step-effects`: o que aconteceu no passo vira partículas, textos e tremor); `hud/` (`hud-snapshot` puro e `GameHud`); `game/` (`advance-game`: sessão, efeitos e rolagem em um passo só; `use-game-session`: laço de quadros, teclado, ponteiro, redimensionamento, pausa ao esconder a aba e ao perder o foco); `session/apply-command`; telas `GameScreen` e `GameOverlay` (título, contagem, banner de fim, pausa e resumo mínimos). `ArcadeExperience` grava o resultado com `saveRunResult` e atualiza os recordes. O `GamePlaceholder` foi removido.
- **Motor.** `Award` ganhou `kind` (a cor do estouro) e o movimento devolve `leakedXs` (a pista do vazamento); `StepEvents` também.
- **Bordas cobertas.** Passo `0`, negativo, `NaN` e `Infinity` (nada muda); passo de 90 s limitado a um passo; pausa congela a grade; movimento reduzido mantém a grade parada e remove o tremor; vazamento sem combo não avisa; recorde com `NaN`/negativo/gigante no placar; integridade 0 não desenha o drone; tremor só enquanto dura.
- **Validação.** Lint, typecheck, unitários, e2e (jogo abre, placar visível, pausa e retomada com Esc, axe no título e durante a partida) e build. No navegador (1280x800 e 390x780): título, partida com bugs, dados, estilhaços e tiros, console sem erros e sem avisos.
- **Pendente.** Pausa e toque (etapa 11), tela de resultados (12), som (13), mergulho da câmera (14), cabine e CRT (15). O botão "PRESS ENTER" ainda aparece em telas de toque; a etapa 11 troca por toque.

### Etapa 11: pausa e toque

- **Caso de uso** (anotado antes dos testes). Quem joga no celular não tem Esc nem mouse: precisa de um botão de pausa de 44 px no placar, de uma tela de pausa com retomar, recomeçar e sair, e de arrastar o dedo para pilotar sem o dedo cobrir o drone. No desktop o mouse continua levando o drone direto. Se falhasse: partida sem como pausar no toque, o drone "pulando" para baixo do dedo no primeiro toque, ou texto de controles que fala de teclado para quem só tem dedo.
- **Feito.** `session/pointer-aim` (`startDrag`, `aimFromPointer`: mouse vai direto, toque guarda o deslocamento do primeiro toque), toque com `setPointerCapture` e `pointerup`/`pointercancel` encerrando o arrasto no `use-game-session`; `hud/format-clock` (relógio `00:SS`); botão de pausa no placar (habilitado só durante a partida); `screens/PauseScreen` (retomar com foco inicial, recomeçar, sair, tempo restante e dica de controles); textos de título e de controles diferentes para toque; hook genérico `hooks/use-media-query` (o `usePrefersReducedMotion` passou a usá-lo, mesma API).
- **Bordas cobertas.** Toque sem arrasto iniciado é ignorado; arrasto com deslocamento negativo; relógio com `NaN`, negativo, infinito e acima de um minuto; mídia indisponível vira falso.
- **Validação.** Lint, typecheck, unitários, e2e (botão de pausa, recomeço pela pausa e axe na pausa) e build. No navegador, desktop e celular (390x780 com toque): título com "TAP TO START", pausa legível, console limpo.

### Etapa 12: fim da partida e resultados

- **Caso de uso** (anotado antes dos testes). Ao acabar o tempo ou a integridade, quem joga vê um banner (implantação concluída ou sistema caiu) e depois a tela de resultados: pontos com milhar, "NEW BEST", rank e frase, os quatro números da partida, a dica do cartucho selado quando chegou perto e o recorde. O foco cai em "jogar de novo" (R ou Enter também recomeçam) e Esc volta à prateleira. Leitor de tela ouve pontos, rank e novo recorde. Se falhasse: pontuação sem separador de milhar, recorde menor que a pontuação feita, dica de cartucho aparecendo para quem já o abriu ou para quem foi mal, foco perdido atrás da tela.
- **Feito.** `results/results-view` (visão pura: pontos, estatísticas, recorde com seis dígitos, dica), `screens/ResultsScreen`, `screens/EndBanner` (banner por tipo de fim, com tremor de queda e pop na vitória, só com movimento permitido), `HudSnapshot.result`, keyframe `arcade-crash` e tokens de tamanho e de fundo do banner. O resumo provisório foi removido. O easter egg do root (ROOT ACCESS) continua para a etapa 16.
- **Bordas cobertas.** Pontuação zero e grande; recorde guardado maior que a pontuação; dica só entre 60% e 100% do limite do root; integridade em fração; o snapshot do HUD muda quando o resultado chega.
- **Validação.** Lint, typecheck, unitários, e2e (resultado após uma partida inteira, foco em "jogar de novo", axe, `R` recomeça) e build. No navegador, desktop e celular: banner de fim e resultados legíveis, console limpo.

### Etapa 13: áudio

- **Caso de uso** (anotado antes dos testes). O fliperama fica mudo até o visitante ligar o som (botão no topo ou tecla `M`); só então os sons sintetizados do protótipo tocam: linhas do boot e troca de cartucho (blip), rejeição e dano (hit), tiro (a cada segundo tiro), destruição (kill), patch e "GO" (pick), contagem (blip), fim da partida (hit ou end). Se falhasse: som tocando sem o visitante ter pedido, o contexto de áudio criado antes do gesto (bloqueado pelo navegador), tiro virando zumbido, erro derrubando o jogo num navegador sem áudio, ou `M` ligando e desligando duas vezes.
- **Feito.** `audio/` com `sound-specs` (os 7 tons do protótipo), `sound-player` (contexto criado só ao ligar, retomado se suspenso, injetável, tolera falha e fecha ao sair), `step-sounds` (função pura: o que um passo do jogo faz soar), `use-sound-player`, `use-arcade-sounds` (boot, seleção e rejeição) e `ui/SoundToggle` (botão com `aria-pressed`, texto só em telas largas). `M` liga e desliga em qualquer tela; no jogo o hook da partida o encaminha, para não contar duas vezes. O tom `boot` já existe e será usado no mergulho da câmera (etapa 14).
- **Bordas cobertas.** Nada toca nem cria contexto antes de ligar; desligar silencia; navegador sem áudio ou contexto que lança não derrubam nada e não repetem a tentativa; liberar fecha o contexto; vários alvos no mesmo passo soam uma vez; tiro soa no 1º, 3º, 5º; contagem soa só quando o número muda; fim soa uma vez; entrar na prateleira e abrir o boot não soam.
- **Validação.** Lint, typecheck, unitários, e2e (mudo até ligar, um único `AudioContext`, botão e `M`) e build. No navegador, desktop e celular: botão visível, `M` na prateleira e na partida, console limpo.

### Etapa 14: mergulho da câmera

- **Caso de uso** (anotado antes dos testes). Quem escolhe Vênus não vê um corte seco: a câmera da cena 3D real avança até Vênus preencher a tela (1,7 s, curva `cubic-bezier(.75,0,.2,1)` do handoff), uma névoa laranja e 180 riscos radiais entram, e só então o fliperama aparece com fade-in. Ao sair, o fliperama some em 0,65 s enquanto a câmera recua em 1,1 s até onde estava. Com movimento reduzido nada disso acontece: o fliperama abre e fecha na hora. Se falhasse: a câmera parada num ponto errado ao voltar, controles de órbita brigando com o mergulho, o fliperama abrindo antes do fim do voo, ou o foco perdido.
- **Feito.** `solar-scene/lib/camera-dive` (curva, progresso, distância para o planeta encher a tela, pose final, interpolação) e `CameraDive` (componente R3F: guarda a pose de origem, segue o planeta, que continua a orbitar, desliga os controles durante o voo e os devolve ao fim da volta); `SceneProps.dive`; `portfolio/use-immersive-stage` (estágios `idle`, `diving`, `open`, `surfacing`, com temporizadores e salto direto com movimento reduzido); `venus-arcade/dive` (`streaks` puro e `DiveEffects` com a névoa e o canvas dos riscos); `ArcadeExperience` ganhou `isLeaving` (fade-out, inerte). A cena só para de renderizar no estágio `open`. O tom `boot` do protótipo saiu: o fliperama ainda não está montado durante o voo e o som começa mudo.
- **Bordas cobertas.** Progresso e duração inválidos (zero, `NaN`, infinito); distância sempre fora do planeta (campo de visão e proporção absurdos); câmera sobre o planeta; voltar sem ter ido; planeta ausente; planeta que se move durante o voo; sair no meio do mergulho; escolher Vênus de novo durante a volta; temporizadores limpos ao desmontar; movimento reduzido ligado no carregamento.
- **Validação.** Lint, typecheck, unitários, e2e (voo antes do fliperama, volta com o foco em Vênus, abertura imediata com movimento reduzido) e build. No navegador, com o relógio da página controlado: névoa e riscos entram sobre a cena com Vênus ao centro; console sem erros e sem avisos.

### Etapa 15: acabamento (cabine e CRT)

- **Caso de uso** (anotado antes dos testes). O fliperama deixa de ser uma tela preta em tela cheia e vira uma máquina: fundo em degradê quente, moldura da cabine com a gravação "CAB-02" e o LED "PWR", tela de vidro com scanlines que piscam, ruído, vinheta e reflexo, duas cabines apagadas ao lado em telas largas (acima de 1240 px), a legenda de teclas embaixo no desktop e, no celular, a cabine quase em tela cheia sem legenda nem cabines laterais. O cartão de título ganha a legenda de sprites (esmagar, limpar, evitar, pegar), o subtítulo vermelho e o modo Hotfix dourado. Se falhasse: decoração lida pelo leitor de tela, texto do jogo ilegível sob os overlays, LEDs e flicker rodando com movimento reduzido, ou a cabine empurrando o jogo para fora da tela no celular.
- **Feito.** `venus-arcade/cabinet/` (`CabinetShell`, `CabinetFrame`, `CrtOverlays`, `SideCabinets`, `KeyLegend`), utilitários de movimento e de fundo (`flicker`, `glow`, scanlines, ruído SVG, vinheta) em `styles/motion/arcade.css` e tokens de cor, sombra e tamanho em `tokens.css`; o `ArcadeExperience` agora compõe cabeçalho fixo de 64 px e cabine; o título do jogo ficou como no handoff (`GameOverlay`).
- **Testes.** A cabine expõe só o que está dentro da tela, esconde as decorações de tecnologias assistivas e lista os atalhos só quando pedido. O visual em si é validado no navegador e pelo axe nos e2e.
- **Validação.** Lint, typecheck, unitários, e2e (axe incluído) e build. No navegador, 1500x900, 1100x760 e 390x780: cabine, cabines laterais só na tela larga, legenda só no desktop, jogo e HUD legíveis no celular, console limpo.
