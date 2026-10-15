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
`src/styles/tokens.css` (single source of truth; utilities such as `bg-sun-400` derive from it).
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
- **Fonts self-hosted via `next/font/local`** (Bricolage Grotesque and JetBrains Mono, variable weight, Latin subset in `src/app/fonts/`), exposed as `--font-sans` / `--font-mono`. They used to come from `next/font/google`, but the Vercel build failed with `module-not-found` on the generated font CSS (the build downloads the fonts from Google, and that fetch broke in the Vercel environment). Self-hosting makes the build independent of Google, and the visitor's browser no longer contacts Google either. Licenses in `CREDITS.md` (SIL OFL).
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
- **Data model (`domain/celestial-body.ts`):** `kind: 'star' | 'planet'` and `orbit: { radius, periodSeconds, phaseRadians } | null`
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
  wings flying to Mercury, "Entregue" stamp, receipt). Copy lives in `content/contact.ts` (typed by `domain/contact-content.ts`), with
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
- **Motion and reduced motion.** Keyframes and `animate-*` utilities live in `styles/journey-motion.css` (delays through
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

1. **Done: honeypot, minimum time and required signals** (`domain/bot-guard.ts`, checked by the handler after validation). The form carries a hidden
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

## Hover "Alvo travado" on the bodies (design handoff 5a)

- **What replaced what.** The generic pill that said "Sol · Sobre" / "Mercúrio · Contato" (`BodyHint`, `getHintLabel`) is gone. Hovering or
  focusing a body now locks on it: four corner brackets (`lockOn`), a telemetry polyline that draws itself, and a text card (kicker, name decoded
  letter by letter, description, call to open the section). Only variant 5a of the handoff was built.
- **Where it lives.** A new feature, `features/target-lock/` (overlay only, no 3D knowledge), plus a bridge in `solar-scene` and the composition in
  `portfolio` (the only place allowed to join features). Pure and tested: `telemetry-layout` (line geometry and edge flipping), `lock-frame`
  (box and corner size), `scramble-text`. Hooks: `use-intent-target` (80 ms to show, 150 ms to hide, immediate switch between bodies, no exit in
  between), `use-decoded-text` (30 ms ticks, one letter every two ticks, masked at first so nothing flashes the final name), `use-screen-frame`.
- **3D to 2D bridge.** `solar-scene/components/BodyTracker` runs inside the canvas: each frame it projects the tracked body (`project-sphere`:
  center and radius in CSS pixels, using the camera, so the panel view offset and the follow camera are respected), eases it (rate 17, about 0.25
  per 60 fps frame, instant with reduced motion) and publishes it only when it changes. The overlay never lives in the render loop: the frames
  travel through `lib/screen-frame.ts` (`createFrameChannel`, a tiny external store read with `useSyncExternalStore`), created in `portfolio` and
  shared by both sides, so features still do not import each other. The target does not glide from the previous body when it changes.
- **Data, not hard-coded.** Each body has `targeting: { code, description, anchor }` (`domain/celestial-body.ts`, validated). Accent color is the
  body's existing `menuTone`, the CTA is its `menuLabel`, the name is `name` upper-cased. Generic copy ("ALVO TRAVADO", "Clique para abrir", "→")
  is in `content/targeting.ts` and reaches the overlay through `PortfolioExperience`. The anchor is per body (Sun up and left, Mercury down and
  left); when the card would leave the screen the layout flips to the other side, then to the card above the line, falling back to the preferred
  side only if nothing fits.
- **Rules from the handoff.** One target at a time; the lock is dropped the moment a section opens and comes back only after it closes (the overlay
  is unmounted while a panel is open); keyboard focus shows the same lock (`focusedId` wins over `hoveredId`); the overlay is `aria-hidden` and
  `pointer-events-none` (the buttons already have names such as "Sol: abrir seção Sobre"); with reduced motion there is no scale, rotation, line
  drawing or decoding, only a 200 ms fade (`animate-target-fade`).
- **Touch.** A touch has no hover: the first tap on a body arms it (shows the lock), the second tap on the same body opens it, tapping empty
  space (`onPointerMissed`) clears it. The browser's `pointerout` after a finger lifts is ignored for touch so the lock does not vanish between
  taps (`use-body-pointer-handlers`).
- **Brightness on hover.** A highlighted body glows a little (`getHighlightGlow` 0.12): a `uGlow` multiplier in the Sun surface shader and
  `emissiveIntensity` on the planet; the cursor already turns into a pointer and the body already scales slightly.
- **Motion tokens.** `styles/target-motion.css` holds `lock-on`, `draw-line`, the card entrance and the reduced-motion fade.
- **Not done.** The decoded name has no per-letter sound or anything beyond the handoff. The card size is a constant (176 x 92 px) used for the
  edge check, not measured from the DOM.

## Two visual bugs found after the hover work

- **Mercury turned pale on hover.** The glow used a plain white `emissive`, which adds the same light to every pixel and washes the texture out.
  The planet now uses its own texture as `emissiveMap` (white emissive, so the glow is proportional to each pixel and keeps the surface detail);
  without a texture it glows in its fallback color.
- **On reload the orbit ring showed first and the lighting arrived late.** The ring is drawn at once, while the Sun and Mercury textures and the
  lazy bloom chunk arrive later, so the scene looked like it was lighting up behind the ring. The canvas is now revealed (fade, `duration-slow`,
  instant with reduced motion) only when every body has settled its texture (loaded, failed or none: `CelestialBody.onSettled`) and the effects
  are mounted (`SceneEffects.onReady`), through `use-scene-reveal`. A 4 s cap (`SCENE_REVEAL_MAX_WAIT_MS`) reveals it anyway, so a stuck load never
  leaves a blank screen. Measured on a production build: opacity stays near 0 until about 1.2 s, then fades in over about 0.3 s.

## Prop drilling: a context for the contact submitter only

- **Problem.** `onSendContactMessage` went through `PortfolioExperience` and `SectionView` only to reach `ContactSection`, and `targetingCopy` went
  through the page and `PortfolioExperience` to reach `TargetCard`.
- **Contact submitter: a context.** It is an injectable dependency (the Server Action in production, a fake in tests), so
  `ContactSubmitterProvider` / `useContactSubmitter` (`content-panel`) is the right tool. The hook throws a clear error outside the provider
  instead of returning a silent default. The provider is mounted by `PortfolioProviders` (`features/portfolio`, a client component):
  `app/page.tsx` is a Server Component and cannot import a feature barrel directly, because that would pull client-only hooks into the server
  graph (this broke the first attempt at the build).
- **Targeting copy: no context.** A first version used a second provider for this static text, which was over-engineering. `TargetCard` now
  imports `content/targeting.ts` directly (features may import `content/`); the kicker is built there from the body's `code`.
- **Not a context.** Interaction state (hover, focus, selection) stays as props: it changes often and a context would re-render every consumer.
- **Follow-ups.** The full scan of the other drilling cases is in `TASKS.md`.

## Folder structure, phase 1: `components`, `styles`, `domain`

- **Why.** `design-system/` held only ten small components plus a mix of CSS themes, animations and a TypeScript mirror of the colors, and `lib/` mixed
  product rules with generic helpers. The names promised more than the folders held and made it hard to know where to look.
- **Change.** `design-system/atoms` became `components/` (icons in `components/icons/`); `design-system/tokens` became `styles/` (`tokens.css`,
  `motion/journey.css`, `motion/target.css`, `scene-tokens.ts`); the product types and rules left `lib/` for `domain/` (`celestial-body`,
  `contact-content`, `contact-message`, `bot-guard`, `credit`, `interaction-state`), and `lib/` kept only generic pure utilities
  (`join-class-names`, `circular-navigation`, `screen-frame`). No code changed, only paths and imports.
- **No `molecules/` or `organisms/`.** No composite component is shared by two features, so those folders would be empty. Composites live in the
  feature that uses them and move to `components/` only when 2+ features share them.
- **Supersedes** the folder names in the earlier "Folder structure" section above (`design-system/{tokens, atoms}`, `lib/` as a catch-all).
  Next phases are in the plan discussed with the owner: subfolders inside `contact` and `solar-scene`, then sections as features.

## Folder structure, phase 2: subfolders in `contact` and `solar-scene`

- **`content-panel/sections/contact/` (40 files)** now has the section root (`ContactSection`, `LinkedInCard`) and three folders by what they draw:
  `journey/` (arc, planets, comet, stage, geometry and motion), `question/` (heading, field, footer, actions, flow state) and `delivery/`
  (scene, stamp, envelope, Mercury, receipt, geometry).
- **`solar-scene/components/` (21 files)** is split into `scene/` (the canvas, loader, lights, stars, effects, error boundary and body tracker),
  `bodies/` (celestial body, Sun, corona, planet, orbit and focus ring) and `camera/` (distance, focus, view offset and keyboard zoom).
- **Only paths changed.** A script moved 69 files with `git mv` (history is kept) and rewrote the relative imports. The delivery scene still
  imports the stage dimensions from `journey/arc-geometry`; a shared `stage` module is a candidate for a later cleanup.

## Folder structure, phase 3: sections as features

- **`about-section` and `contact-section` are features.** `content-panel` is now only the modal shell (panel, header, focus trap, attribution
  note); deleting a section no longer touches it. Each section feature exposes a single component through its `index.ts`.
- **`SectionView` moved to `features/portfolio`.** It maps `content.type` to a section, so it belongs to the composition layer, the only one
  allowed to import several features. The contact section stays lazy, so react-hook-form and zod are still out of the initial JS (about 198 KB gzip,
  checked on a clean production build).
- **`ContactSubmitterProvider` / `useContactSubmitter` moved to `src/hooks/`.** `portfolio` mounts it and `contact-section` reads it, which makes it
  shared code. Keeping it out of the section barrel also keeps that barrel exporting only the lazy component.
- **`RuledHeading`** moved with the About section, its only user. ESLint knows the two new features; only paths and imports changed.

## Loading screen ("Nascimento do sistema")

- **Duração e ritmo.** O handoff tem 14 s; a versão publicada tem 8,0 s (Vazio 1,1, Hiperespaço 1,6, Nebulosa 1,5, Ignição 1,2, Órbitas 1,8, Fim 0,8; começou com 7,0 s e subiu para 8,0 s porque o botão "Pular" permite uma animação mais generosa). `lib/timeline` guarda os dois eixos de tempo por etapa e `lib/time-warp` converte tempo real em tempo de design. Toda a cena (`lib/loader-frame`) é uma função pura do tempo de design, igual à do handoff, então os tempos internos (atraso das letras, ondas de choque) não foram reescritos.
- **A animação nunca acelera.** Uma primeira ideia era deixar o progresso real conduzir o relógio; foi descartada porque com cache ou rede rápida a animação ficaria rápida e estranha. O relógio avança em tempo real e a carga só pode **segurar** o fim da etapa Órbitas (`HOLD_REAL_SECONDS`). Delta por quadro é limitado a 0,1 s (aba em segundo plano não pula etapas) e há um teto de 15 s.
- **O que a barra mostra.** A barra segue a animação e fica em 99% até a cena ser revelada (`useSceneReveal`: texturas e efeitos prontos, ou 4 s de espera máxima). O progresso real (razão de texturas prontas) foi implementado e removido: como o carregamento termina cedo, `max(animada, real)` mostrava 100% na etapa 3. O rótulo "Sistema pronto" só aparece com a cena pronta; antes disso o HUD mostra "Finalizando".
- **Sinal da cena.** `SceneProps.onRevealChange(isRevealed)` sai de `useSceneReveal`; o `PortfolioExperience` junta isso com "cena indisponível" (sem WebGL ou erro) para liberar o loader na hora quando não há cena para esperar.
- **Primeira visita.** `sessionStorage['loaderSeen']`. Como a leitura só é possível no navegador, um script inline (`beforeInteractive`, `lib/loader-seen`) marca `data-loader-seen` no `<html>` antes da hidratação e o overlay some por CSS, sem flash para quem já viu. A decisão de renderizar ou não o overlay usa `useSyncExternalStore` com snapshot de servidor `false`, para não haver divergência na hidratação.
- **HUD no HTML do servidor.** O primeiro quadro tem o HUD e o rótulo da etapa 1 totalmente visíveis. Assim o HTML já pinta "carregando" (resolve a tela preta antes da hidratação) e o LCP do Lighthouse mobile voltou de 4,7 s para 2,6 s.
- **Foco e acessibilidade.** O overlay é um `dialog` modal, o botão "Pular" recebe o foco ao abrir e `Tab` fica preso nele (`preventDefault`). Foi tentado `inert` no conteúdo com estado no pai, mas ele ficava ativo durante a hidratação e engolia o primeiro `Tab` de quem já tinha visto o loader. O overlay é o primeiro filho do fragmento para que, ao sair, o `Tab` seguinte caia no primeiro controle da cena. A barra é um `progressbar` visualmente oculto; o desenho é `aria-hidden`.
- **Movimento reduzido.** `StaticLoader`: um quadro fixo (Sol, planetas e nome), nenhum quadro agendado, termina assim que a cena é revelada. "Pular" continua disponível.
- **Desenho.** Estrelas e poeira em um `<canvas>` 2D no espaço da viewport (pixel ratio até 2), o resto em SVG/DOM dentro de uma camada 1920x1080 escalada por "cover" e centrada no ponto (960, 500), que coincide com o centro da viewport onde fica o Sol 3D. Cores em `styles/loader-tokens.ts` (espelho do `tokens.css`), textos em `content/loader.ts`, tamanhos de fonte em tokens que respeitam largura e altura.
- **Compartilhado.** `FrameScheduler` virou `hooks/frame-scheduler` porque o cometa do contato e o loader o usam. `JetBrains Mono` voltou a ser pré-carregada porque o loader a usa no primeiro quadro.
- **e2e.** `e2e/fixtures.ts` marca o loader como visto para todos os testes (inclusive `browser.newPage` via `openPage`); só `e2e/loader.spec.ts` usa o `test` puro. Os helpers de hover esperam a cena ficar visível (ver T26).

## Comet position outside React state

- **Problem.** `useComet` guardava `head` e `tail` em `useState` e os atualizava a cada frame; como o hook vive em `ContactSection`, o formulário inteiro re-renderizava ~60 vezes por segundo durante a viagem.
- **Decision.** A posição vive em um store externo mínimo (`journey/comet-store`, com `subscribe`, `getSnapshot` e `set` que ignora valores iguais). `useComet` devolve o store e o `travelTo`; o `ArcJourney` lê com `useSyncExternalStore` (`use-comet-position`). Só ele re-renderiza durante a viagem. Foi escolhida a opção (c) da task porque mantém o desenho em React e não exige mexer em atributos SVG por ref.
- **WebGL.** Na mesma rodada, `useWebglContextEvents` substituiu o `onCreated` da cena (listeners agora com cleanup e callbacks sempre atuais).

## Bodies without a section (Venus as scenery)

- **Problem.** Vênus entra na cena antes de ter conteúdo; a próxima etapa dá a ele uma seção e a interação. Todo corpo exigia `section`, e menu, teclado, alvo travado e seleção liam esse campo direto.
- **Decision.** `section: BodySection | null`. Um corpo sem seção é só cenário: a cena o desenha e o faz orbitar, mas `PlanetMesh` não cria a esfera de clique (sem cursor, hover nem seleção) e o `PortfolioExperience` monta menu, teclado, alvo e seleção a partir de `getInteractiveBodies` (`domain/`). Dar a Vênus uma seção é preencher esse campo na lista; nenhum componente muda.
- **Validation.** Uma estrela precisa de seção (o Sol é a entrada do portfólio, e `SunMesh` é sempre interativo). Órbitas de planetas que se cruzam (faixa `orbit.radius ± radius`) são rejeitadas, com os dois ids na mensagem; uma órbita já inválida não é reportada de novo.
- **Venus.** Raio 0,72, órbita 6,2 com período de 180 s e fase 4 rad (lado oposto a Mercúrio). A câmera recua para enquadrar a órbita maior; o e2e de preenchimento do Sol continua passando. A rotação retrógrada real ficou de fora: a validação exige período positivo e não há ganho visual que justifique mudar isso agora.
- **Venus texture.** `2k_venus_atmosphere.jpg` (Solar System Scope, CC BY 4.0, mesma página e termos das outras), convertida para `venus.webp` (1024 px, 11 KB) e `venus-small.webp` (512 px, 4 KB) por `scripts/optimize-textures.mjs`, creditada em `CREDITS.md` e no rodapé do painel (`content/credits.ts`). O mapa de atmosfera é liso (laranja-bege sem relevo), então Vênus lê como um planeta de nuvens; a superfície real (`2k_venus_surface.jpg`) ficou de fora por não ser o que se vê de fora. O e2e `venus.spec.ts` confere que a textura é pedida e carrega.

## Scene props forwarded as a block (T1)

- **Problem.** `SolarSystemSceneLoader` desestruturava as 12 props de `SceneProps` e repassava 10 delas, uma a uma, sem usá-las; cada prop nova de interação pedia edição no tipo, no Loader e na cena.
- **Decision.** O Loader recebe `sceneProps` inteiro, lê só `bodies` e `isActive` (para calcular as configurações) e repassa tudo em bloco: `<SolarSystemScene {...sceneProps} {...settings} prefersReducedMotion />`. As props da cena passam a ser `SceneProps & SceneSettings & { prefersReducedMotion }`, sem lista duplicada. Agrupar em objetos (`interaction`, `lifecycle`, `tracking`) foi descartado: mudaria o contrato público e os testes sem ganho adicional, e o repasse dentro da cena até as malhas é o T2.
- **Testes.** Refatoração sem mudança de comportamento: nenhum teste novo (um teste de "repassa todas as props" testaria implementação). A cobertura vem dos testes de `PortfolioExperience` e dos e2e da cena.

## Body interaction read by the mesh (T2)

- **Problem.** `SolarSystemScene` montava por corpo `highlight`, `highlightEasingRate`, `onHoverChange`, `onSelect`, `rotationPeriodSeconds` derivado e `isAnimated`; `CelestialBody` só juntava tudo em `interaction` e espalhava nas malhas.
- **Decision.** Um contexto da feature (`hooks/use-body-interaction.tsx`): `SolarSystemScene` monta `BodyInteractionProvider` com `highlightOf`, `onHoverChange`, `onSelect` e `prefersReducedMotion` (dentro do `Canvas`, ao redor dos corpos). A malha chama `useBodyInteraction(id)`, que devolve destaque, taxa de easing e handlers já ligados ao id, e cuida do cursor (`useCursor` saiu do `CelestialBody`). `CelestialBody` lê só `useBodyHighlight(id)` (anel de foco) e `useScenePrefersReducedMotion()` (órbita, corona, rotação). Props: `SunMesh` 10 → 5, `PlanetMesh` 9 → 5; `CelestialBody` sem nenhuma prop de interação.
- **Por que contexto e não `usePrefersReducedMotion` direto no corpo.** A cena já recebe a preferência do Loader; ler o `matchMedia` de novo em cada corpo duplicaria a fonte e obrigaria os testes a trocar o `window.matchMedia` global. Pelo provider, os testes injetam o valor (`createFakeScene({ prefersReducedMotion: true })`).
- **Sem provider, erro.** `useBodyInteraction` fora do provider lança, em vez de devolver um padrão silencioso que deixaria o astro ignorando o ponteiro.
- **Testes.** `src/features/solar-scene/test/in-scene.tsx` (`createFakeScene`, `inScene`) é o apoio de teste das malhas e do corpo; fica dentro da feature porque só ela usa. Casos novos: handler ligado ao id certo, destaque de outro corpo ignorado, cursor devolvido quando o astro sai da cena com o ponteiro em cima, destaque instantâneo com movimento reduzido, anel de foco só no corpo focado.
- **Fora do escopo.** O contexto muda a cada hover/foco/seleção e re-renderiza os corpos, como antes com as props; reduzir isso é o T23.

## Contact draft kept across closed tabs

- **Problem.** Fechar a aba sem querer, recarregar ou o navegador descartar a página fazia o visitante perder nome, e-mail e mensagem.
- **Decision.** Rascunho no `localStorage`, dentro da feature (`contact-section/draft/`), sem Zustand e sem Context API. O react-hook-form já é a fonte de verdade dos campos; uma store do Zustand duplicaria esse estado (e a sincronização) e traria uma dependência só para persistir três strings. O que faltava era persistência, não estado compartilhado.
- **Por que não cookie.** Cookie vai em toda requisição ao domínio (páginas e Server Actions), então o rascunho do visitante iria ao servidor e a logs sem necessidade; tem limite de ~4 KB e exige codificação. O servidor não precisa do rascunho (o painel é renderizado no cliente). `sessionStorage` foi descartado porque não sobrevive ao fechamento da aba.
- **Formato.** `{ version, savedAt, startedAt, step, values }`, validado com zod ao ler (o tipo vem do schema): JSON inválido, versão diferente, campo ausente, texto acima dos limites do formulário ou etapa fora de 0–2 descartam o rascunho. Expira em 7 dias.
- **Quando salva e apaga.** Salva nos eventos (digitação e troca de etapa), sem `useEffect`; com tudo em branco, apaga em vez de gravar. Apaga ao entregar e em "Enviar outra"; mantém se a entrega falhar. A etapa salva é retomada como está: o fluxo só avança com respostas válidas e voltar para editar já salva a etapa anterior, e o envio valida tudo de novo.
- **Anti-bot.** O tempo de preenchimento (`elapsedMs`) conta desde o início do rascunho, não do retorno; quem volta e envia logo não é tratado como robô.
- **Storage seguro compartilhado.** O acesso protegido (navegação privada, storage bloqueado, cota cheia) virou `lib/safe-storage.ts`, usado pelo rascunho e pelo `loader-seen` (que tinha a mesma lógica). O storage é injetável (`draftStorage`), como no `LoadingGate`.

## Stable scrollbar gutter in the content panel

- **Problem.** No Windows (barra de rolagem que ocupa espaço), com o conteúdo do painel quase da altura da janela (etapa da mensagem do contato a ~949 px de altura, um desktop 1080p com barra de tarefas), o painel entrava em ciclo: a barra aparecia, a área ficava 15 px mais estreita, o `JourneyStage` reduzia a escala e a própria altura, o conteúdo cabia, a barra sumia, a largura voltava e tudo recomeçava. A tela piscava com os dois estados sobrepostos. O rascunho do contato tornou o caso comum, porque reabre direto na etapa da mensagem.
- **Decision.** `scrollbar-gutter: stable` no container de rolagem do painel: o espaço da barra fica sempre reservado e a largura não depende mais de haver rolagem, então o ciclo não pode acontecer. Mais simples e geral que travar a escala do palco ou medir a largura de outro elemento.
- **Teste.** `e2e/panel-layout.spec.ts` mostra a barra de rolagem (`--hide-scrollbars` desligado), usa 1366x949 com a etapa da mensagem restaurada e exige uma única largura durante 2 s. Falhava antes (duas larguras) e passa depois.

## Immersive sections (Venus Arcade, step 1)

- **Problem.** Toda seção abria o `ContentPanel` e exigia `title` e `panelLabel`. O fliperama de Vênus ocupa a tela inteira e não tem painel.
- **Decision.** `BodySection = PanelSection | ImmersiveSection`, discriminada por `presentation`. A seção imersiva tem `experience` (hoje só `'venus-arcade'`) e `callToAction` (texto do alvo travado); a validação pede `panelLabel` só para painel e `callToAction` só para imersiva. O portfolio escolhe o host pela apresentação (`getOpenPanel` / `getOpenExperience`), e o `ImmersiveView` faz o `lazy` da experiência, como o `SectionView` faz com o Contato. Menu, teclado, alvo travado e fallback incluem Vênus sem mudança, porque leem `getInteractiveBodies`.
- **Language (decided by Matheus).** Texto do jogo em inglês (BUG HUNTER, PAUSED, ranks); tudo que é acessibilidade e navegação em português.
- **URL (left to Claude).** O fliperama é estado, como os painéis: sem rota nova, sem histórico. Mantém a página única e estática; um endereço próprio pode vir depois se fizer falta.
- **Shared modal focus.** `useModalFocus` (`hooks/`) e `getTabTarget` (`lib/focus-trap`) saíram do `content-panel` porque o fliperama também é um diálogo modal (foco entra, Tab preso, Esc, foco devolvido).
- **Lazy loading.** `React.lazy` + `Suspense` em vez de `next/dynamic`: o fliperama só monta depois de um clique, então não há SSR a evitar, e o padrão já é o do Contato. O chunk inicial não contém o código do fliperama (verificado no build).

## Quick-access menu with three destinations

- **Problem.** O arco ia de 100° a 170° com raio `largura - 180`. Com o rótulo "Venus Arcade" (~144 px) o item mais à esquerda saía da tela em 320 px, invadia o botão "Acesso rápido" (o que já acontecia em 320 px com dois itens) e, entre 375 e ~400 px, "Contato" invadia o canto de "Sobre".
- **Decision.** O arco começa a 90° (o primeiro destino logo abaixo do botão), a reserva horizontal passou a 200 px, e abaixo de 375 px os destinos ficam em coluna sob o botão (sem o anel tracejado). O unitário garante que todo destino fica na tela e fora do botão para 1 a 3 itens; a sobreposição entre vizinhos é medida no e2e com o DOM real, porque depende da largura de cada rótulo.
- **Limit.** O arco comporta três destinos; com mais planetas o layout precisa de outra regra (anotado em `TASKS.md`).

## Arcade shell: no quick menu, paused scene (Venus Arcade, step 2)

- **No quick menu inside the arcade (Matheus).** O handoff mantinha o "Acesso rápido" visível no fliperama. Uma primeira versão fez isso (menu por slot, `Esc` em camadas com `preventDefault`/`defaultPrevented`, rótulo curto no celular), mas o Matheus preferiu tirar o menu do fliperama para simplificar. Dentro dele só há "← Sistema solar" e `Esc`; para ir a Sobre ou Contato, o visitante volta ao sistema solar.
- **Paused scene.** `SceneProps.isHidden` (cena totalmente coberta) leva o `frameloop` a `'never'`. Atrás de um painel a cena continua viva (`isHidden` falso). Medido: 0 desenhos por segundo com o fliperama aberto.

## Arcade engine, part 1 (Venus Arcade, step 3)

- **Pure and immutable.** O motor vive em `venus-arcade/engine/` e nunca importa React nem DOM. Cada passo recebe o estado e devolve um novo, o que torna os testes simples e permite repetir uma partida passo a passo.
- **Step semantics.** Um passo inválido (`0`, negativo, `NaN`, `Infinity`) não move nada. Um passo enorme **não** é limitado dentro do motor: o seguimento do mouse usa `1 - exp(-14 dt)` e chega ao alvo sem passar dele; a arma dispara no máximo um tiro por passo e reinicia o intervalo, como no protótipo. Quem limita o `dt` do laço (aba em segundo plano) é a máquina de sessão da etapa 7.
- **Pointer and keyboard.** O mouse só muda o alvo (`aimDrone`); o teclado move o drone direto e arrasta o alvo junto, como no protótipo (`stepDrone`). A direção do teclado entra como `{ x, y }` já resolvida (teclas que se anulam viram 0).
- **Cadence is frame-quantized.** O recarregamento volta ao intervalo cheio a cada tiro (sem carregar o resto), igual ao protótipo; a 60 fps o tiro de 0,15 s sai a cada 9 ou 10 quadros. Os testes comparam com o ideal numa tolerância, não com igualdade.
- **Shared math.** `lib/math.ts` ganhou `clamp` (NaN vira o mínimo) e `mix`; o `mix` do loading-screen foi removido de lá.

## Arcade engine, part 2 (Venus Arcade, step 4)

- **Randomness is injected.** O motor nunca chama `Math.random`: `spawnEntities` e `advanceEntities` recebem um `Random` (`() => número`). Os testes passam sorteios fixos (0, 0,5, 1) e a sessão (etapa 7) passará `Math.random`.
- **Bugs leak, nothing else does.** `advanceEntities` devolve `{ entities, leakedBugs }`. Só `crawler` e `beetle` contam como vazamento (o combo zera na etapa 5); dado, estilhaço e patch somem sem custo. O dado e o estilhaço saem 10 px abaixo da base, o bug sai quando passa da base.
- **Spawn order and one-per-step.** Como no protótipo, cada relógio gera no máximo uma entidade por chamada; depois de uma pausa enorme o jogo não despeja uma enxurrada. O relógio de estilhaços só corre depois de 6 s e o de rasgos depois de 14 s, e o rasgo espera o anterior terminar (o relógio fica negativo e o próximo sai logo em seguida).
- **Glyph and lane names.** `laneX` guarda a raia do bug (o que o protótipo chama `bx`); o `x` é a raia mais o zigue-zague, sempre limitado a `[raio, largura − raio]`.
- **Difficulty uses the elapsed time of the step.** O protótipo calcula a dificuldade antes de somar o `dt`; aqui o tempo já vem somado. A diferença é de um quadro e não muda a sensação.
- **Constants.** Todos os intervalos, velocidades e faixas do handoff estão nomeados em `constants.ts`, com `jitter` como par `[mínimo, máximo]`.

## Arcade engine, part 3 (Venus Arcade, step 5)

- **The engine is a set of small steps, not one big update.** O protótipo tem um `update` único; aqui cada regra é uma função pura (`advanceShots`, `spawnEntities`, `advanceEntities`, `resolveShotHits`, `applyDestroyed`, `resolveDroneContacts`, `applyLeaks`, `tickCombo`, `getRunOutcome`). A ordem de chamada (a do protótipo) fica por conta da sessão da etapa 7.
- **No effects inside the engine.** Explosões, textos flutuantes, tremor e som saem de dados que o motor devolve (`destroyed`, `awards`, `collectedPatches`, `hasHurt`, `leakedBugs`), nunca de chamadas de efeito. O tremor de 0,35 s e o `prefers-reduced-motion` são da camada visual.
- **One hit, one target.** Cada tiro acerta só o primeiro alvo da lista (como o `b.dead` do protótipo), e o dano é um por tiro. Brilho de 0,08 s no acerto que não mata.
- **Hurt rules.** Um dano por passo (o respiro de 1,4 s começa no mesmo passo), a invulnerabilidade é descontada antes de olhar os contatos, o patch é coletado com ou sem respiro, e estilhaço e rasgo machucam sem desaparecer; bug e dado desaparecem ao tocar o drone.
- **Patch.** Só dado solta patch (14%), e o sorteio só é feito para dado. Com integridade cheia o patch vale 50 pontos, sem multiplicador.
- **Combo.** O multiplicador usa o combo _antes_ da morte (como no protótipo); vazamento e dano zeram combo e janela; a janela é de 2,4 s.
- **Outcome.** Integridade 0 vence o fim do tempo no mesmo passo (derrota em vez de implantação).
