# Decisions

## Versions (verified on npm / official docs, 2026-10-03)

next 16.3.8 · react/react-dom 19.3.0 · three 0.186.1 · @react-three/fiber 9.8.1 · @react-three/drei 10.7.9 ·
@react-three/postprocessing 3.1.3 · babel-plugin-react-compiler 1.0.0 · vitest 5.0.3 · @playwright/test 1.63.0 ·
@react-three/test-renderer 9.1.1 · eslint 9.39 · prettier 3.9 · typescript 5.9.

- **TypeScript 5.9 instead of 7.0:** 7.0 is the native port; the lint/Next toolchain is validated on 5.x. Stable choice.
- **ESLint 9 instead of 10:** eslint-config-next 16 targets the flat config on ESLint 9.
- **pnpm 9.15** (available). Node 22.12.

## React 19 and React Compiler

- React Compiler is **stable** (react.dev) and Next.js 16 supports it via `reactCompiler: true` plus
  `babel-plugin-react-compiler`. Memoization comes from the compiler (build plugin), not from React 19 itself.
- Enabled globally. Do **not** use `useMemo`/`useCallback`/`React.memo` by default; only with a measured or
  semantic reason (e.g. stable identity for a library), with a comment.
- Escape hatch: `'use no memo'` directive per component/hook (compilationMode `annotation` is the opt-in alternative).
  Any component that needs it for R3F `useFrame` mutations will be documented here.
- React 19 features: `ref` as a prop (no `forwardRef`) is used by atoms; `use`/Actions/`useOptimistic` have no real
  problem to solve in this phase (no async data, no forms) so they are not used.

## Tooling

- `id-length` ESLint rule (min 2) enforces the "no one-letter names" rule; `no-console` and `no-explicit-any` are errors.
- Playwright uses SwiftShader flags so WebGL works in headless Chromium.
- The foundation smoke tests could not be seen failing "for the right reason" because there was no code to fail
  against; from the next iteration on, tests are run red first.

## Styling: Tailwind CSS v4 (user override)

The user asked mid-session to "use tailwind", overriding the CLAUDE.md default of CSS Modules. Tailwind v4
(`tailwindcss` + `@tailwindcss/postcss`) is used; design tokens live in the `@theme` block of
`src/design-system/tokens/tokens.css` (single source of truth; utilities such as `bg-sun-400` derive from it).
Components use utility classes that reference tokens only: no arbitrary hex/px values in components.
The "colocated style file" rule becomes "styles are utility classes in the component file".
Reduced-motion zeroes the duration tokens.

## three pinned to 0.182

`three` 0.186 logs "THREE.Clock: This module has been deprecated" at runtime because @react-three/fiber 9.8.1 still
uses `Clock`. The project requires a clean console, so `three` (and `@types/three`) are pinned to 0.182.0.
Revisit when R3F moves to `THREE.Timer`.

## Scene structure

`SolarSystemSceneLoader` (client) loads `SolarSystemScene` with `next/dynamic({ ssr: false })` and chooses a quality tier
from the viewport width (`lib/scene-quality`). `StarField` keeps an explicit `useMemo` (stable buffer identity for R3F).

## React Compiler in practice (verified)

- The production chunks contain `useMemoCache`, so the compiler is active for app code, including the R3F components.
- No `'use no memo'` was needed. `useFrame` callbacks mutate refs/three objects only (`mesh.rotation`, `material.uniforms` through a
  ref), which the compiler's lint accepts. Mutating a `useState` value inside `useFrame` is flagged (`react-hooks/immutability`), so
  uniforms are mutated through the material ref instead.
- The only explicit `useMemo` is in `StarField` (stable buffer identity for R3F; documented in the file).
- Vitest runs without the compiler plugin; behavior must not depend on memoization.

## Other decisions

- **Scene description lives in data** (`content/scene.ts`) and reaches the canvas as `aria-label` through props, so components hold no copy.
- **Credits are data** (`content/credits.ts`) and are shown inside the panel (CC BY 4.0 requires visible attribution).
- **Keyboard zoom** (`+` / `-`) was implemented even though the spec marks it optional; it is disabled while the panel is open and ignores Ctrl/Cmd/Alt combos.
- **Panel width constant** (`PANEL_WIDTH_PIXELS = 448`) mirrors the `--size-panel-width` CSS token (28rem); it only drives how far the Sun glides aside.
- **Playwright never reuses a server** (`reuseExistingServer: false`) so e2e always tests a fresh production build.

## Panel redesign (Claude Design handoff, option 1a + LinkedIn button from 1b)

The handoff (an HTML reference, since removed from the repo) was used as a visual reference only; none of its markup or inline styles
was copied. It was translated into the project's architecture:

- **Tokens first.** The palette, type scale, radii, shadows, easing and orbit durations live in `tokens/tokens.css` (`@theme`):
  `panel-*`, `line-*`, `ink-*`, `ember-*`, `nebula-300`, `planet-*`, `emblem-*`, `text-display|stat|body|tag|credit|eyebrow|label`,
  `tracking-*`, `rounded-block`, `shadow-planet|dot|emblem`, `ease-panel`. The old `text-*`, `sun-300/600`, `space-900..600`, `on-accent`
  and `border` tokens were replaced everywhere (menu, buttons, hint and fallback card now share the new palette).
- **Atomic split.** Atoms: `Label`, `PlanetDot`, `CloseIcon`, `ArrowUpRightIcon`; `Link` gained `variant="button"` (the 1b LinkedIn
  pill); `Text`/`Heading`/`IconButton`/`Button` were restyled. Molecules: `PanelHeader`, `OrbitEmblem`, `DataGrid`/`DataCell`,
  `RuledHeading`, `StackChip`/`StackList`, `AboutSection`. `ContentPanel` got a pinned `footer` (credits) and a `panelLabel`.
- **Data, not markup.** `AboutContent` now carries `experience`, `location` (with coordinates) and `stack` items with a `tone` and `size`
  (resolved to `planet-*` color tokens and spacing-scale sizes). `section.panelLabel` ("Sobre · Objeto 001") feeds the header.
- **Fonts via `next/font/google`** (Bricolage Grotesque and JetBrains Mono), exposed as `--font-sans` / `--font-mono`.
- **The "M" is gone.** The little Sun in the emblem uses the existing `sun-small.webp` texture (through `next/image`), with the
  design's gradient as fallback. Orbits spin with CSS and stop entirely under `prefers-reduced-motion`.
- **Accessibility deviations from the mock:** `ink-400` was lightened (`#6f6a82` -> `#7f7a92`) and `ink-500` merged into it because
  the original grays were 3.8:1 and 2.9:1 on the panel (AA needs 4.5:1); credit links keep their underline (WCAG 1.4.1: they sit in
  gray text and color alone would not distinguish them); the dialog is named with `aria-label` ("Sobre") and the person's name is the
  `h2`, since the header caption ("SOBRE · OBJETO 001") is decoration rather than a heading.
- **Panel width** is 452px (token `--size-panel-width: 28.25rem`); `PANEL_WIDTH_PIXELS` mirrors it and a test keeps them equal.
- **Gotcha:** a color token and a font-size token with the same name collide in Tailwind (`text-chip` resolved to the color and
  silently dropped the size); sizes use `tag`, not `chip`.

## Quick-access menu redesign (handoff option 2b, "Órbita")

Again a visual reference only (`design/Acesso Rapido.dc.html`); the markup, inline styles and its React-in-a-string logic were not used.

- **Behavior unchanged, look and choreography replaced.** Open/close, `Esc`, outside click, focus-first-item, arrow navigation, focus
  return to the toggle and the "open the panel from here" flow are the same code paths; the existing behavior tests still pass untouched.
- **Atomic split.** `OrbitMenuToggle` (pill button with a ringed planet whose ring flips when open, `PlanetToggleIcon`) and
  `OrbitMenuItem` (label card + glowing planet) are molecules; `PlanetDot` gained an `orbit` size and `Label` a `code` size.
  `QuickAccessMenu` is the organism that wires them. The old `MenuItem` molecule was deleted.
- **Geometry is pure and tested.** `lib/orbit-layout.ts`: `getOrbitPositions` (one item at 138 degrees; N items spread 100-170 degrees on a
  200px radius), `getOrbitDelaySeconds` (0.1 s + 0.08 s per item), `formatObjectCode` ("OBJ-001"). The component only turns the numbers into
  CSS variables (`--orbit-x/y/delay`) that Tailwind utilities consume.
- **Data, not markup.** `section.menuTone` (planet color) joins `menuLabel`; the `OBJ-00N` code is derived from the item's position.
  `StackTone` was renamed `PlanetTone` because stack items and menu destinations share the palette.
- **Choreography lives in tokens.** `ease-orbit-ring`, `ease-orbit-item`, `shadow-planet-strong|toggle`, `ember-700`, `tracking-code` plus
  `transition-orbit-*` utilities in `tokens.css`. Tailwind v4 animates `translate`, `scale` and `rotate` as separate properties, so the
  transitions list those instead of `transform`. With `prefers-reduced-motion` every transition collapses to a 200 ms fade (verified in e2e).
- **Always mounted, but closed means gone for assistive tech.** To animate the exit the destinations stay in the DOM; while collapsed the
  list is `inert` and `aria-hidden`, so they are not focusable or announced. The toggle precedes them in the DOM, so Tab goes button ->
  destinations. The catalog code is `aria-hidden`, so the accessible name is just "Sobre".
- **Known limit:** with many destinations the arc (100-170 degrees) can push left-most labels off narrow phones; fix when a second
  destination exists (shrink the radius by viewport or switch to a vertical stack on small screens).
- **Fonts:** JetBrains Mono is `preload: false` (only small captions use it); Bricolage Grotesque stays preloaded.

## Cleanup audit (unused code, duplicated helpers, weak tests)

Done with `knip`, a few throwaway scripts (exports referenced only by themselves/tests, CSS tokens never used as a class, every class
name in the components checked against the compiled CSS) and a read of all test titles. Findings and fixes:

- **Real bug found:** `BodyHint` and the `SceneFallback` card still used tokens removed during the palette migration
  (`border-border-strong`, `text-text-primary`, `border-border`). Tailwind drops unknown classes silently, so the hint lost its border
  color and the fallback card got a `currentColor` border. Both now use the new tokens. Lesson: after renaming tokens, check every class
  against the build output, not only the types.
- **Unused variants/props removed:** `Button` `floating`; `Heading` sizes `md|lg|2xl`; `Text` `as` and the `primary` tone (it is now a plain
  `<p>`); `Label` tones `accent-muted|cool` and `as="div"`; `VisuallyHidden` `as` h1/h2/h3/p; the `coral` planet tone.
- **Unused tokens removed:** `sun-400/500` (the scene reads `sceneTokens`, the CSS copies only fed a sync test), `radius-sm|md`,
  `z-scene|z-overlay`, `ember-600`, `text-base|lg|2xl`. `scene-tokens.test` now syncs only the colors that exist on both sides.
- **Needless exports** turned private (types only used inside their file, `loadTextureWithThree`); `postcss` dropped from devDependencies
  (Next/Tailwind bring it); undocumented one-off scripts deleted (`screenshot-focus|menu|panel`, `lighthouse-details`).
- **Test hooks in production markup removed:** `data-orbit`, `data-planet`, `data-rule` existed only so tests could count elements.
- **Tests deleted (505 -> 489):** one that could never fail
  (`toHaveTextContent('')` matches anything), tests of Tailwind class names or of element counts, a constant-shape check, a duplicate of
  another test (`forwards selection`), "renders a span by default" style checks, and the trivial hex-format check.
- **Kept on purpose:** the sync tests that read `tokens.css` (they catch silent drift), the contract tests of atoms (ref/props forwarding),
  and the edge-case tests of pure functions.

## Folder structure: features with colocation (replaces the layer-first layout)

**Why:** `hooks/` and `lib/` had become dumping grounds (most of their files served a single part of the app), and one component was
spread over `molecules/`, `organisms/`, `hooks/` and `lib/`. Sources consulted: the
[Next.js project structure guide](https://nextjs.org/docs/app/getting-started/project-structure) (unopinionated; shows "split project files by
feature or route" with only globally shared code at the root), [bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
(feature folders with their own components/hooks/utils; shared code only when several features use it; features must not import each
other and compose at the app level; enforce it with `import/no-restricted-paths`-style lint rules) and
[Kent C. Dodds on colocation](https://kentcdodds.com/blog/colocation) ("place code as close to where it is relevant as possible";
abstract only when genuinely reused).

**Rules adopted**

1. Default to colocation. Promote to `lib/`, `hooks/` or `design-system/` only when 2+ features use it.
2. `features/solar-scene`, `content-panel`, `quick-access-menu` are isolated. `features/portfolio` is the composition layer: it is the only
   one that imports other features, and only through their `index.ts` (public API). `app/` imports `features/portfolio`.
3. Shared code (`lib`, `hooks`, `design-system`, `content`) never imports from `features/` or `app/`. Enforced in `eslint.config.mjs`
   with `no-restricted-imports` (checked by adding throwaway violations: all rules fire).
4. Inside a feature the structure is only as deep as needed (`components/`, `hooks/`, `lib/`, `sections/`); small features stay flat.
5. Tests live next to what they test; per-component folders were flattened (`atoms/Button.tsx`, not `atoms/Button/Button.tsx`).

**What moved where (summary)**

- Scene math/hooks (`rotation`, `damp`, `star-field`, `scene-quality`, `scene-settings`, `camera-framing`, `panel-offset`, `zoom`, `motion`,
  `webgl-support`, texture/viewport/reduced-motion/availability hooks) -> `features/solar-scene`. The page-to-scene contract (`SceneProps`)
  now lives there too and the loader reuses it.
- `focus-trap`, `use-modal-focus`, `format-count` and the About section pieces -> `features/content-panel`.
- `orbit-layout` -> `features/quick-access-menu`. `body-labels`, `use-body-interaction`, `SceneFallback`, `BodyHint`, `SceneKeyboardControls` ->
  `features/portfolio`.
- Stayed shared: `lib/{celestial-body, credit, interaction-state, circular-navigation, join-class-names}`, `hooks/{use-arrow-navigation, use-idle-ready}`,
  `design-system/{tokens, atoms}`, `content/`. The `Credit` type moved out of a component into `lib/credit.ts` (data was importing a UI file).
- CLAUDE.md section 5.4 was updated to describe this layout (the earlier atoms/molecules/organisms tree no longer applies to features).

## Phase 2, first planet: Mercury = "Contato"

- **Why Mercury:** the messenger of the gods, the closest planet to the Sun (contact should be within reach) and the fastest orbit
  ("I answer quickly"); the handoff already called the contact link "transmissão".
- **Data model (`lib/celestial-body.ts`):** `kind: 'star' | 'planet'` and `orbit: { radius, periodSeconds, phaseRadians } | null`
  (a circular orbit around the star at the center; no `parentId`/moons/inclination yet, YAGNI). `validateCelestialBodies` now also requires
  exactly one star, no orbit for stars, an orbit for planets, positive finite radius/period, a finite phase, and an orbit that clears the
  star. `SectionContent` gained `ContactContent` (`headline`, `summary`, `channels`); `PlanetTone` gained `periwinkle` (the handoff's Contato color).
- **Scene (`features/solar-scene`):** `OrbitGroup` moves its children with `advanceRotation` (same frame-rate independent, clamped math as
  the Sun's spin) and `getOrbitPosition` (pure); `OrbitPath` is a faint flat ring that ignores pointer events; `PlanetMesh` is a
  `MeshLambertMaterial` sphere (diffuse is enough for a rough rocky planet and compiles a cheaper shader than PBR) lit by the Sun's point
  light, plus an invisible click target of at least 0.9 units so a tiny moving planet is easy to hit. The Sun and the planet share
  `useBodyMotion` (spin + highlight scale) and `useBodyPointerHandlers` (hover/click, orbit drags ignored). `CelestialBody` dispatches on `kind`.
- **Framing:** the camera now frames the whole system (`getBodyExtent` = orbit radius + body radius, `SYSTEM_SCREEN_FILL = 0.8`), so the Sun is
  smaller than before (about 37% of the height instead of 55%). The camera sits slightly above the orbital plane (`[0, 4, 9.5]`) so orbits
  read as ellipses. e2e Sun-size bounds were widened accordingly (0.25 to 0.5).
- **Reduced motion:** the orbit does not advance (Mercury rests at its phase), the planet does not spin; e2e verifies the canvas is static.
- **Menu with two destinations:** `getOrbitRadius(viewportWidth)` shrinks the arc on narrow phones (320 px gets 140 instead of 200) so the
  left-most label stays on screen (tested for 320 to 390 px); `use-viewport-size` was promoted to shared `hooks/` because the menu and the
  scene both use it. This closes the known limit recorded for the orbital menu.
- **Texture:** `2k_mercury.jpg` from Solar System Scope (same page, author and CC BY 4.0 as the Sun), converted to `mercury.webp` (1024 px) and
  `mercury-small.webp` (512 px); credited in `CREDITS.md` and in the panel footer (`content/credits.ts`).
- **Contact copy is a placeholder:** "Vamos conversar?" and the one-line summary are proposed text, and the only channel is the LinkedIn link
  that was already approved. E-mail, GitHub etc. were not added because they were not provided; add them to `content/contact.ts`.
- **Not done yet from the Phase 2 proposal:** moons/`parentId`; more planets.
  Cost measured: mobile Lighthouse moved from 76 to about 71 (software WebGL, one more texture and shader), desktop from 94 to 83-94 (noisy).

## Camera focus, live orbits and the contact form

- **Planets keep orbiting with the panel open.** The render loop used to stop while the panel was open (`getFrameloop(isPanelOpen, reducedMotion)`).
  It now depends only on reduced motion (`getFrameloop(prefersReducedMotion)`): `always`, or `demand` when motion is reduced. The cost of
  keeping the loop alive behind the panel was judged smaller than a frozen scene; `KeyboardZoom` is still disabled while the panel is open.
- **Camera follows the focused or selected body.** `CameraFocus` swings the camera around the Sun (azimuth only, target stays at the origin),
  so zoom, OrbitControls and the system framing are untouched and the focused body ends up in front of the Sun instead of behind it. The goal
  azimuth is the body's own azimuth plus a side offset (`CAMERA_FOCUS_SIDE_OFFSET_RADIANS = 0.9`) so the Sun does not hide it, and it is
  recomputed every frame, so the camera tracks a moving planet. Damped over the shortest arc (`stepAngleToward`, rate
  `cameraFocusEasingRate`); instant with reduced motion. A user drag (OrbitControls `start`) cancels the following until a new focus
  (`nonce` in `useCameraTarget`) arrives. Pure math in `lib/camera-focus.ts`. Click, Tab/arrows and the menu all go through `useCameraTarget`.
- **Delivery through Resend.** `app/actions.ts` is a Next Server Action: it reads the environment (`readDeliveryConfig`), picks a
  `ContactDelivery` (`createContactDelivery`) and runs the shared handler, which re-validates, delivers and answers a generic error when
  delivery throws (the real cause goes only to the server log through the injected `reportError`). `services/` holds `contact-email` (pure
  e-mail builder: escaped html, plain text, single-line subject, `replyTo` = the visitor), `resend-delivery` (talks to an injected
  `EmailClient`, so tests never call the API), `delivery-config` and `contact-delivery`. The `resend` package is only imported by the
  Server Action, so it stays out of the browser bundle.
- **Configuration.** `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` (see `.env.example`; none is `NEXT_PUBLIC_`, so they stay on
  the server). Missing variables make every send fail visibly (server log names the missing variables) instead of dropping messages silently.
  `CONTACT_DELIVERY=disabled` is the explicit off switch: the message is accepted and discarded (Playwright sets it so e2e never e-mails).
  With the Resend test sender (`onboarding@resend.dev`) only the account owner's address can receive; verify a domain to send elsewhere.
  Rate limiting and spam protection (honeypot, captcha) are still not included.
- **What replaced what.** The single-page form (`ContactForm`, `FormField`, `Input`, `Textarea`) was deleted. The panel asks Nome, E-mail and
  Mensagem one at a time; a comet travels an arc with three planets (progress), and a successful send ends on a delivery scene (envelope with
  wings flying to Mercury, "Entregue" stamp, receipt). Copy lives in `content/contact.ts` (typed by `lib/contact-content.ts`), with
  `{firstName}`/`{email}` placeholders filled by `fillTemplate`.
- **Structure (all in `features/content-panel/sections/contact/`).** Pure and tested: `arc-geometry` (quadratic arc, trail segments, planet
  state), `comet-motion` (easeInOutCubic, tween frame, frame-rate independent tail chase), `contact-flow` (reducer: step, status
  asking/sending/done, error, field motion), `receipt`, `delivery-geometry`, `answer-progress`, `action-presentation`, `stage-scale`. Hooks:
  `use-comet` (rAF tween with an injectable `FrameScheduler`, returns a promise per travel) and `use-element-width`. Presentational:
  `ArcJourney`, `JourneyPlanet`, `WarpLines`, `DeliveryScene` (+ `MercuryPlanet`, `FlyingEnvelope`, `DeliveryStamp`), `QuestionHeading`,
  `AnswerField`, `AnswerFooter`, `StepActions`, `LinkedInCard`, `DeliveryReceipt`, `JourneyStage`. `ContactSection` is the organism that wires
  react-hook-form (values and the final `zodResolver` pass), the reducer and the comet.
- **Validation.** One schema, per-field messages from the design ("Digite seu nome para continuar.", "Esse e-mail parece incompleto.",
  "Escreva uma mensagem antes de enviar."). `validateContactField` validates a single step; the message limit is now 500 (counter ring) and the
  minimum is 1 non-blank character, as in the design. The server action re-validates everything.
- **Send order.** The comet exits and the request runs in parallel; the delivery scene only plays when the result is ok. On a failure (or a
  thrown submitter) the comet flies back from the exit point to the message planet, the error appears in the live note line and the text is kept.
  A `ref` lock plus the reducer guard prevent double submits.
- **Motion and reduced motion.** Keyframes and `animate-*` utilities live in `design-system/tokens/journey-motion.css` (delays through
  `--animation-delay`), always applied with `motion-safe:`; JS-driven parts (comet, ripples, warp, envelope) also check
  `usePrefersReducedMotion` (promoted to shared `hooks/` because the panel and the scene both use it): positions jump, the delivery scene shows
  its final state and no animation runs (e2e checks zero running animations).
- **Responsiveness.** The drawings use the design's 450 px coordinate space inside a box that is scaled with `transform: scale(width / 450)`
  (measured with a `ResizeObserver`), and the stage height transitions between 150 and 340 px.
- **Accessibility.** The question is the panel's `h2` (`aria-label` with the whole sentence; the animated words are `aria-hidden`), the input
  label is the question, the hint/error line is the field's `aria-describedby` (errors use `role="alert"`), the decorative arc and scene are
  `aria-hidden`, finished planets are real buttons ("Voltar para NOME"), focus goes to the next field on every step change (and back to the
  field after an error or a failed send) and to the confirmation heading on delivery. Colors from the design that failed AA on the dark
  background (`#5d586f`, `#4d4960`, `#6f6a82`) use `ink-400` (`#7f7a92`); the error color is the design's `#f07f6a` (`danger-400`).
- **Layout.** `ContentPanel` no longer pads its body; each section brings its own padding so the contact stage can bleed to the panel edges.
- **Bundle.** `SectionView` lazy-loads the contact section, so react-hook-form and zod stay out of the initial JS (about 195 KB gzip).
- **Known simplification.** The protocol shown on the receipt (`MSG-XXXX`) is derived from the lengths of name and message, as in the design;
  it is decorative, not an id from the server. Delivery itself is still the no-op placeholder (`services/contact.ts`).

## CI and test hygiene

- **CI (`.github/workflows/ci.yml`).** Runs on pull requests and on pushes to `prod`: lint, typecheck, `prettier --check`, unit tests and build.
  The Playwright job is disabled (kept as a commented block with a `TODO(ci)`): the tests that capture the WebGL canvas time out on the 2-vCPU
  GitHub runners, where WebGL is rasterized on the CPU. The suite passes locally (`pnpm test:e2e`, about 2 minutes).
- **Test pruning.** Three audits removed tests that only checked native behavior (a button that is clickable, a ref that is forwarded), copied
  constants or copy into the assertion, or repeated what a higher-level test already proves. The rule is in `CLAUDE.md` (section 4.1): keep a
  test when it protects a rule or a behavior that would break for the visitor (focus, accessibility, validation, math with edge cases,
  legally required attribution), and delete the lower-level duplicate when a higher-level test covers it.

## Contact endpoint: threat model and abuse protection

Sources: the Next.js docs shipped with the installed version (`guides/server-actions`, `guides/data-security`, `guides/backend-for-frontend`,
`guides/production-checklist`). Server Actions are public POST endpoints: Next.js adds encrypted action IDs, an Origin/Host (CSRF) check and a
1 MB body cap, but the docs say to treat every action as an untrusted entry point, validate input, return only what the UI needs and rate limit
expensive operations such as sending e-mail.

| Threat                                                                                                                      | Status                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Forged or oversized input                                                                                                   | Covered: the shared zod schema runs again on the server (name 2 to 100, e-mail up to 254, message up to 500 characters) and Next caps the body at 1 MB.               |
| Header injection in the e-mail                                                                                              | Covered: Resend takes structured fields, the subject is collapsed to one line, `replyTo` is a validated address.                                                      |
| HTML injection into the owner inbox                                                                                         | Covered: name, e-mail and message are HTML-escaped.                                                                                                                   |
| Open relay (sending to other people)                                                                                        | Covered: `from` and `to` come from server environment variables, never from the request.                                                                              |
| Secret exposure                                                                                                             | Covered: variables are not `NEXT_PUBLIC_`, only `app/actions.ts` reads `process.env`, `resend` is not in the browser bundle, errors shown to the visitor are generic. |
| Cross-site POST from another origin                                                                                         | Covered by Next's Origin/Host check. It does not stop a script that forges the header, so it is not a defense against bots.                                           |
| Naive bots: scripts that fill every field, or POST straight to the action                                                   | Covered by layer 1 below (honeypot, minimum time, required signals). A determined attacker who reads the code can forge them.                                         |
| Flood from one source (quota exhaustion: the free Resend plan has a daily and monthly cap, so a flood blocks real messages) | **Not covered yet.** Needs layer 2 (host) and/or 3 (shared store).                                                                                                    |
| Content spam (links, ads) from a single real visitor                                                                        | Not covered; needs a captcha or content rules if it shows up.                                                                                                         |

Layers, cheapest first:

1. **Done: honeypot, minimum time and required signals** (`lib/bot-guard.ts`, checked by the handler after validation). The form carries a hidden
   `homepage` input (`inert`, `aria-hidden`, out of the tab order) and the time since the panel opened (`elapsedMs`, measured in the browser, so
   there is no clock skew). The server treats a filled hidden field, less than 2 s (`MIN_FILL_MS`) or missing signals (a direct POST that skipped
   the form) as a bot: it answers `{ ok: true }` without sending anything, so a bot cannot tell it was blocked, and logs the reason
   (`reportBlocked`). The threshold is deliberately low so a fast human with autofill is not dropped silently.
2. **To do in the Vercel dashboard: host-level rate limit.** Project, Firewall, add a rule: method `POST`, path `/` (that is where the Server
   Action posts), rate limit per IP (for example 10 requests per minute), action Deny/429. Check which limits the current plan allows. Abusive
   traffic then never reaches the function or the Resend quota.
3. **Optional: in-code limiter** keyed by IP plus a global daily cap, backed by a shared store (Redis); an in-memory counter does not work on
   serverless because instances do not share memory. The IP comes from `headers()` (`x-forwarded-for` / `x-real-ip`), trustworthy only behind a
   proxy that sets it (Vercel does); self-hosted setups need a trusted proxy configuration.
4. **Optional: captcha** (for example Cloudflare Turnstile) only if spam persists.
