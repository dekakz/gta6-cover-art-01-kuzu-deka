// Nine multi-panel layouts for Solmar Bay Cover Studio.
// Every layout is a pure function of the photo area (the canvas above the
// title band) and returns panels as fractions of that area, plus the title
// band itself as a fraction of the whole canvas. A panel may carry `slant`
// (a diagonal cut, in fractions of its own width) for the tilt layout, or
// `poly` points for a fully custom shape. drawCover in cover.js clips to
// these shapes, so a layout never has to know how to paint.

/** The title band: y and height as fractions of the canvas height. */
export function titleBandRect() {
  return { x: 0, y: 0.78, w: 1, h: 0.22 };
}

/** Photo area: everything above the title band, as fractions of the canvas. */
export function photoAreaRect() {
  return { x: 0, y: 0, w: 1, h: 0.78 };
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

/** Returns the panel list for a layout id, falling back to Hero 5. */
export function panelsForLayout(layoutId) {
  const entry = LAYOUTS[layoutId] || LAYOUTS['hero-5'];
  return entry.fn();
}
