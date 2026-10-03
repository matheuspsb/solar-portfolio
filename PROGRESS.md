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

## Performance metrics (production build, Lighthouse 13 in headless Chromium with SwiftShader software WebGL)

| Step                                            | Mobile perf | Desktop perf | Mobile TBT   | Desktop TBT | A11y | Best practices | SEO |
| ----------------------------------------------- | ----------- | ------------ | ------------ | ----------- | ---- | -------------- | --- |
| Baseline (before item 12)                       | 70          | 74           | 2110-2440 ms | 690 ms      | 100  | 96             | 100 |
| + favicon, source maps, demand frameloop        | 70          | 74           | 1910 ms      | 710 ms      | 100  | 100            | 100 |
| + lazy post-processing chunk                    | 71-72       | -            | 1600-1810 ms | -           | 100  | 100            | 100 |
| + scene mount deferred to idle (`useIdleReady`) | 72-79       | 79           | 860-1770 ms  | 480 ms      | 100  | 100            | 100 |

- Bundle (gzip, all chunks): ~446 KB total; the three/R3F chunk (~229 KB) loads lazily, after content and menu are visible.
  Content, menu and panel render server-side before any 3D code runs (CLS = 0).
- Performance < 90 target not reached **in this environment**: Lighthouse runs on a CPU-emulated GPU (SwiftShader) with 4x CPU throttle;
  total blocking time comes from evaluating three.js (~1 MB raw) and compiling shaders in software. LCP element is the menu button (text, SSR).
  Tried: lazy bundle split, idle-deferred mount, demand frameloop; not tried yet: replacing `@react-three/postprocessing` (n8ao is bundled) with `postprocessing` directly (~100 KB raw).
- FPS (SwiftShader, so pessimistic): 1280x800 about 11 fps (CPU raster of bloom), 375x740 about 38 fps. On real GPUs the scene (one 18k-triangle sphere, <=2600 points, bloom) is far below budget. Measure with `node scripts/measure-fps.mjs`.
- Idle cost: the render loop switches to `demand` when reduced motion is preferred or the panel covers the scene (e2e verifies no frames change).
- Tools: `scripts/lighthouse.mjs`, `scripts/bundle-size.mjs`, `scripts/bundle-analyze.mjs`, `scripts/measure-fps.mjs`.

## Pending reminders

## Learnings

- Tailwind v4 has no `duration-*` theme namespace: durations are plain CSS variables + `@utility duration-*` in tokens.css, and the reduced-motion override lives in a plain `:root` media query (`@theme` inside `@media` is ignored).
- R3F `<shaderMaterial uniforms>`: the material ends up with its own uniforms object, so mutate through a ref to the material, not the object passed in (the React Compiler lint also flags the latter).
- Axe measures colors mid-animation: wait for `document.getAnimations()` to finish before scanning.

- Playwright e2e builds and serves production on port 3100 and never reuses an existing server (stop manual servers first, or the port is busy).
- `scripts/screenshot.mjs <name> [w] [h]` captures a screenshot of the running server into `screenshots/`.
- three 0.186 + R3F 9.8 logs a Clock deprecation warning; three is pinned to 0.182 (see DECISIONS.md).

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
