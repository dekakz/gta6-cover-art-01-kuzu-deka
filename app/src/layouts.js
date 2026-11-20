// Panel layouts for the cover: each layout is a list of panels covering the
// photo area (the full canvas minus the bottom strip). Coordinates are
// fractions of the photo area: x, y, w, h in 0..1. A panel may carry a
// `slant` (fraction of its own width): its top edge shifts right by that
// amount, which draws the diagonal comic-book seams the genre is known
// for. Every layout uses at most 6 panels; the editor keeps 6 panel slots
// and a layout simply uses the first N of them.
'use strict';

const LAYOUTS = {
  'key-art': {
    label: 'Key Art',
    panels: [
      { x: 0, y: 0, w: 0.46, h: 0.66 },
      { x: 0.46, y: 0, w: 0.27, h: 0.33 },
      { x: 0.73, y: 0, w: 0.27, h: 0.33 },
      { x: 0.46, y: 0.33, w: 0.54, h: 0.33 },
      { x: 0, y: 0.66, w: 0.46, h: 0.34 },
      { x: 0.46, y: 0.66, w: 0.54, h: 0.34 },
    ],
  },
  'grid-6': {
    label: 'Grid 6',
    panels: [
      { x: 0, y: 0, w: 0.3333, h: 0.5 },
      { x: 0.3333, y: 0, w: 0.3334, h: 0.5 },
      { x: 0.6667, y: 0, w: 0.3333, h: 0.5 },
      { x: 0, y: 0.5, w: 0.3333, h: 0.5 },
      { x: 0.3333, y: 0.5, w: 0.3334, h: 0.5 },
      { x: 0.6667, y: 0.5, w: 0.3333, h: 0.5 },
    ],
  },
  duo: {
    label: 'Duo',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 },
    ],
  },
  'trio-slant': {
    label: 'Trio Slant',
    panels: [
      { x: 0, y: 0, w: 0.36, h: 1, slant: 0.06 },
      { x: 0.34, y: 0, w: 0.34, h: 1, slant: 0.06 },
      { x: 0.66, y: 0, w: 0.34, h: 1, slant: 0.06 },
    ],
  },
  'hero-left': {
    label: 'Hero Left',
    panels: [
      { x: 0, y: 0, w: 0.55, h: 1 },
      { x: 0.55, y: 0, w: 0.45, h: 0.3333 },
      { x: 0.55, y: 0.3333, w: 0.45, h: 0.3334 },
      { x: 0.55, y: 0.6667, w: 0.45, h: 0.3333 },
    ],
  },
  'hero-right': {
    label: 'Hero Right',
    panels: [
      { x: 0, y: 0, w: 0.45, h: 0.3333 },
      { x: 0, y: 0.3333, w: 0.45, h: 0.3334 },
      { x: 0, y: 0.6667, w: 0.45, h: 0.3333 },
      { x: 0.45, y: 0, w: 0.55, h: 1 },
    ],
  },
  single: {
    label: 'Single',
    panels: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
  quad: {
    label: 'Quad',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  'strip-5': {
    label: 'Strip 5',
    panels: [
      { x: 0, y: 0, w: 0.3333, h: 0.55 },
      { x: 0.3333, y: 0, w: 0.3334, h: 0.55 },
      { x: 0.6667, y: 0, w: 0.3333, h: 0.55 },
      { x: 0, y: 0.55, w: 0.5, h: 0.45 },
      { x: 0.5, y: 0.55, w: 0.5, h: 0.45 },
    ],
  },
  poster: {
    label: 'Poster',
    panels: [
      { x: 0.28, y: 0, w: 0.44, h: 0.64 },
      { x: 0, y: 0, w: 0.28, h: 0.64 },
      { x: 0.72, y: 0, w: 0.28, h: 0.64 },
      { x: 0, y: 0.64, w: 0.5, h: 0.36 },
      { x: 0.5, y: 0.64, w: 0.5, h: 0.36 },
    ],
  },
};

// The panel rectangles of a layout, in pixels, inside a photo area of
// width pw and height ph. A slanted panel keeps its bounding rect; the
// slant only shapes the clip path the renderer builds from the same data.
function layoutPanels(name, pw, ph) {
  const def = LAYOUTS[name] || LAYOUTS['key-art'];
  return def.panels.map((p) => ({
    x: p.x * pw,
    y: p.y * ph,
    w: p.w * pw,
    h: p.h * ph,
    slant: (p.slant || 0) * p.w * pw,
  }));
}

// The polygon of a panel (a parallelogram when slanted, a rect otherwise),
// as [x, y] points in photo-area pixels, clockwise from the top-left.
function panelPolygon(panel) {
  const s = panel.slant || 0;
  return [
    [panel.x + s, panel.y],
    [panel.x + panel.w + s, panel.y],
    [panel.x + panel.w, panel.y + panel.h],
    [panel.x, panel.y + panel.h],
  ];
}
