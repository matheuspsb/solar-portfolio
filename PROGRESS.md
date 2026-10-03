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

## Next
- 12. Performance (measure, optimize, measure again; Lighthouse), 13. Polish.

## Pending reminders
- Polish: bloom is subtle; corona shader and surface movement planned for item 13.

## Learnings
- Playwright e2e builds and serves production on port 3100 and never reuses an existing server (stop manual servers first, or the port is busy).
- `scripts/screenshot.mjs <name> [w] [h]` captures a screenshot of the running server into `screenshots/`.
- three 0.186 + R3F 9.8 logs a Clock deprecation warning; three is pinned to 0.182 (see DECISIONS.md).
