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
- Validação: lint, typecheck, 774 testes unitários, 54 e2e (incluindo axe nas telas de erro e de entrega, 320/375 px e movimento reduzido) e build passando.
- Métricas: JS inicial ~195 KB gzip (formulário e zod em chunk preguiçoso); Lighthouse mobile 69-71 (TBT 1,5-2,0 s, mesma causa de antes), desktop 91-93, acessibilidade/boas práticas/SEO 100.

## Próxima fase (proposta, não implementada): planetas e órbitas

Objetivo: cada planeta é uma seção (Projetos, Experiência, Contato...). A arquitetura atual já é orientada a dados; o que muda:

1. **Dados.** Estender `CelestialBodyConfig` (`lib/celestial-body.ts`) com `kind: 'star' | 'planet' | 'moon'` e, para corpos em órbita,
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
