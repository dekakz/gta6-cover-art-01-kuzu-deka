// Ten multi-panel layouts for Solmar Bay Cover Studio (v2: key-art first).
// Every layout is a pure function of the photo area (the canvas above the
// thin bottom strip) and returns panels as fractions of that area. A panel
// may carry `slant` (a diagonal cut, in fractions of its own width) for the
// tilt layout. drawCover in cover.js clips to these shapes, so a layout
// never has to know how to paint. The giant title overlaps the photos in
// a virtual title zone (see titleZoneRect); there is no flat title band
// any more — the photos run y 0 → 0.93 and only a thin strip sits below.

/** The thin bottom strip: y and height as fractions of the canvas height. */
export function bottomStripRect() {
  return { x: 0, y: 0.93, w: 1, h: 0.07 };
}

/** Back-compat alias: v1 called the title band; v2's strip is the only
 * solid band left on the cover. */
export function titleBandRect() {
  return bottomStripRect();
}

/** Photo area: everything above the bottom strip, as fractions of the canvas. */
export function photoAreaRect() {
  return { x: 0, y: 0, w: 1, h: 0.93 };
}

/** Title zone: the virtual band the giant title, quote and tagline live in,
 * overlapping the photo seam. Fractions of the whole canvas. */
export function titleZoneRect() {
  return { x: 0, y: 0.52, w: 1, h: 0.3 };
}

/** Key Art (v2 default): hero left, two small panels top-right, a wide
 * panel mid-right, and two panels along the foot — the 6-panel collage
 * the winning covers use, built so the title can straddle the seam.
 * Heights are fractions of the photo area (0.93 of the canvas), so the
 * rows are 2/3 + 1/3 of the area — the panels fill it edge to edge. */
export function layoutKeyArt() {
  return [
    { x: 0, y: 0, w: 0.48, h: 2 / 3 },
    { x: 0.48, y: 0, w: 0.26, h: 1 / 3 },
    { x: 0.74, y: 0, w: 0.26, h: 1 / 3 },
    { x: 0.48, y: 1 / 3, w: 0.52, h: 1 / 3 },
    { x: 0, y: 2 / 3, w: 0.48, h: 1 / 3 },
    { x: 0.48, y: 2 / 3, w: 0.52, h: 1 / 3 },
  ];
}

/** Hero-5: one big hero panel left, four small panels in a 2x2 grid right. */
export function layoutHeroFive() {
  return [
    { x: 0, y: 0, w: 0.62, h: 1 },
    { x: 0.62, y: 0, w: 0.19, h: 0.5 },
    { x: 0.81, y: 0, w: 0.19, h: 0.5 },
    { x: 0.62, y: 0.5, w: 0.19, h: 0.5 },
    { x: 0.81, y: 0.5, w: 0.19, h: 0.5 },
  ];
}

/** Grid-9: nine equal panels, three by three. */
export function layoutGridNine() {
  const panels = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      panels.push({ x: c / 3, y: r / 3, w: 1 / 3, h: 1 / 3 });
    }
  }
  return panels;
}

/** Split-4: four equal quadrants. */
export function layoutSplitFour() {
  return [
    { x: 0, y: 0, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 },
    { x: 0, y: 0.5, w: 0.5, h: 0.5 },
    { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
  ];
}

/** Tilt: three diagonal panels cut on a slant, like a folded poster. */
export function layoutTiltDiagonal() {
  return [
    { x: 0, y: 0, w: 0.38, h: 1, slant: 0.12 },
    { x: 0.36, y: 0, w: 0.34, h: 1, slant: 0.12 },
    { x: 0.68, y: 0, w: 0.32, h: 1, slant: 0.12 },
  ];
}

/** Full-bleed hero: one photo fills the whole photo area. */
export function layoutFullBleedHero() {
  return [{ x: 0, y: 0, w: 1, h: 1 }];
}

/** Duo: two tall panels side by side. */
export function layoutDuo() {
  return [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0, w: 0.5, h: 1 },
  ];
}

/** Triptych: three tall panels. */
export function layoutTriptych() {
  return [
    { x: 0, y: 0, w: 1 / 3, h: 1 },
    { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
    { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
  ];
}

/** Magazine: big hero left, two stacked panels right, title band below. */
export function layoutMagazine() {
  return [
    { x: 0, y: 0, w: 0.66, h: 1 },
    { x: 0.66, y: 0, w: 0.34, h: 0.5 },
    { x: 0.66, y: 0.5, w: 0.34, h: 0.5 },
  ];
}

/** Skyline band: one wide hero on top, three small panels along the bottom. */
export function layoutSkylineBand() {
  return [
    { x: 0, y: 0, w: 1, h: 0.62 },
    { x: 0, y: 0.62, w: 1 / 3, h: 0.38 },
    { x: 1 / 3, y: 0.62, w: 1 / 3, h: 0.38 },
    { x: 2 / 3, y: 0.62, w: 1 / 3, h: 0.38 },
  ];
}

/** Registry: id -> { name, blurb, fn }. The editor builds its swatches from this. */
export const LAYOUTS = {
  'key-art': { name: 'Key Art', blurb: '6-panel collage, title over seam', fn: layoutKeyArt },
  'hero-5': { name: 'Hero 5', blurb: '1 big hero + 4 small', fn: layoutHeroFive },
  'grid-9': { name: 'Grid 9', blurb: '3 x 3 photo grid', fn: layoutGridNine },
  'split-4': { name: 'Split 4', blurb: 'Four equal quadrants', fn: layoutSplitFour },
  tilt: { name: 'Tilt', blurb: 'Diagonal slanted panels', fn: layoutTiltDiagonal },
  'full-bleed': { name: 'Full Bleed', blurb: 'One photo, edge to edge', fn: layoutFullBleedHero },
  duo: { name: 'Duo', blurb: 'Two tall panels', fn: layoutDuo },
  triptych: { name: 'Triptych', blurb: 'Three tall panels', fn: layoutTriptych },
  magazine: { name: 'Magazine', blurb: 'Hero + 2 stacked', fn: layoutMagazine },
  'skyline-band': { name: 'Skyline Band', blurb: 'Wide hero + 3 below', fn: layoutSkylineBand },
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

/** Returns the panel list for a layout id, falling back to Key Art. */
export function panelsForLayout(layoutId) {
  const entry = LAYOUTS[layoutId] || LAYOUTS['key-art'];
  return entry.fn();
}
