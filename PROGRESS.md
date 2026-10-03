# Progress

## Done
- [x] 1. Foundation (Next 16, React 19, TS strict, ESLint, Prettier, Vitest, Playwright, React Compiler).
- [x] 2. Tokens (Tailwind v4 `@theme`) and atoms: Button, IconButton, Heading, Text, Link, VisuallyHidden.
- [x] 3. Data model: `CelestialBodyConfig`, validation, `content/` (Sun + About).
- [x] 4. Pure functions: rotation, circular navigation, motion, star field, scene quality.
- [x] 5. Base scene: Canvas, camera, OrbitControls, lights, star field (dynamic, client only).
- [x] 6. Sun: textured (CC BY 4.0, WebP 2048/1024), rotation, bloom. Texture failure falls back to a solid color.

## Next
- 7. Sun interaction (hover, focus, select by mouse and keyboard).
- 8. About panel, 9. Quick-access menu, 10. Fallback, 11. Reduced motion/responsive, 12. Performance, 13. Polish.

## Pending reminders
- Visible CC BY attribution for the Sun texture must appear in the About panel footer (item 8).
- Reduced motion: `rotationPeriodSeconds` accepts `null`; the hook that feeds it comes in item 11.
- Polish: bloom is subtle; corona shader and surface movement planned for item 13.

## Learnings
- Playwright e2e builds and serves production on port 3100 (reuses an existing server locally; stop it after manual checks).
- `scripts/screenshot.mjs <name> [w] [h]` captures a screenshot of the running server into `screenshots/`.
- three 0.186 + R3F 9.8 logs a Clock deprecation warning; three is pinned to 0.182 (see DECISIONS.md).
