/**
 * Decorative background for the intro hero: a dim grid of small ring
 * outlines in a staggered/triangular layout - the same pattern a real
 * tubesheet has when you look down the shell axis at the tube bundle. It
 * brightens near the cursor (a soft spotlight boost) and a colored glow
 * blob tracks the pointer, both driven by the --mx/--my/--glow-opacity
 * CSS custom properties set on the hero container in IntroHero.tsx and
 * inherited down here - this component only needs to be pointer-events:
 * none (see globals.css) so it never intercepts clicks on the real
 * content sitting above it.
 */
export function TubeFieldBackground() {
  return (
    <div
      className="tube-field pointer-events-none absolute inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
