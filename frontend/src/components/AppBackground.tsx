/**
 * Static brand atmosphere for the authenticated app: a deep field of radial
 * glows (token-driven, so it re-tints on theme switch) plus a fine grain
 * overlay — the calm counterpart to the landing's animated shader. Replaces
 * the old WebGL mesh gradient (cheaper, quieter behind data-heavy screens).
 */
export default function AppBackground() {
  return (
    <>
      <div className="app-bg" aria-hidden="true" />
      <div className="app-noise" aria-hidden="true" />
    </>
  );
}
