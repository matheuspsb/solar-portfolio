export function CrtOverlays() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-arcade-scanlines opacity-55 motion-safe:animate-arcade-flicker" />
      <div className="absolute inset-0 bg-arcade-noise opacity-5" />
      <div className="absolute inset-0 bg-arcade-vignette shadow-crt-glass" />
    </div>
  );
}
