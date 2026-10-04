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
