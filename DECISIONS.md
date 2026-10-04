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
