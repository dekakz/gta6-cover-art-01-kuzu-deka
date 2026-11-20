// layouts.js — the ten panel layouts of Solmar Bay Cover Studio.
//
// A layout is a list of panels in unit coordinates (0..1 across the cover).
// Each panel has x, y, w, h and a slant: the slant shears the panel's top
// edge sideways by slant * panel-height, which gives the diagonal cuts of
// the more dynamic layouts. Panels are drawn back to front with a dark
// gutter between them, so a slanted edge never leaves a gap.

export const LAYOUTS = [
  {
    id: 'key-art',
    name: 'Key Art',
    panels: [
      { x: 0.0, y: 0.0, w: 0.56, h: 1.0, slant: 0 },
      { x: 0.56, y: 0.0, w: 0.44, h: 0.34, slant: 0 },
      { x: 0.56, y: 0.34, w: 0.22, h: 0.33, slant: 0 },
      { x: 0.78, y: 0.34, w: 0.22, h: 0.33, slant: 0 },
      { x: 0.56, y: 0.67, w: 0.44, h: 0.33, slant: 0 },
    ],
  },
  {
    id: 'duo-split',
    name: 'Duo Split',
    panels: [
      { x: 0.0, y: 0.0, w: 0.5, h: 1.0, slant: 0.05 },
      { x: 0.5, y: 0.0, w: 0.5, h: 1.0, slant: -0.05 },
    ],
  },
  {
    id: 'triple-strip',
    name: 'Triple Strip',
    panels: [
      { x: 0.0, y: 0.0, w: 1.0, h: 0.36, slant: 0 },
      { x: 0.0, y: 0.36, w: 1.0, h: 0.32, slant: 0 },
      { x: 0.0, y: 0.68, w: 1.0, h: 0.32, slant: 0 },
    ],
  },
  {
    id: 'quad-grid',
    name: 'Quad Grid',
    panels: [
      { x: 0.0, y: 0.0, w: 0.5, h: 0.5, slant: 0 },
      { x: 0.5, y: 0.0, w: 0.5, h: 0.5, slant: 0 },
      { x: 0.0, y: 0.5, w: 0.5, h: 0.5, slant: 0 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5, slant: 0 },
    ],
  },
  {
    id: 'hero-bottom',
    name: 'Hero Bottom',
    panels: [
      { x: 0.0, y: 0.0, w: 1.0, h: 0.42, slant: 0 },
      { x: 0.0, y: 0.42, w: 0.5, h: 0.58, slant: 0 },
      { x: 0.5, y: 0.42, w: 0.5, h: 0.58, slant: 0 },
    ],
  },
  {
    id: 'hero-top',
    name: 'Hero Top',
    panels: [
      { x: 0.0, y: 0.0, w: 0.5, h: 0.58, slant: 0 },
      { x: 0.5, y: 0.0, w: 0.5, h: 0.58, slant: 0 },
      { x: 0.0, y: 0.58, w: 1.0, h: 0.42, slant: 0 },
    ],
  },
  {
    id: 'diagonal',
    name: 'Diagonal',
    panels: [
      { x: 0.0, y: 0.0, w: 1.0, h: 0.34, slant: 0.09 },
      { x: 0.0, y: 0.34, w: 1.0, h: 0.33, slant: -0.09 },
      { x: 0.0, y: 0.67, w: 1.0, h: 0.33, slant: 0.09 },
    ],
  },
  {
    id: 'magazine',
    name: 'Magazine',
    panels: [
      { x: 0.22, y: 0.0, w: 0.56, h: 0.66, slant: 0 },
      { x: 0.0, y: 0.0, w: 0.22, h: 0.33, slant: 0 },
      { x: 0.78, y: 0.0, w: 0.22, h: 0.33, slant: 0 },
      { x: 0.0, y: 0.33, w: 0.22, h: 0.33, slant: 0 },
      { x: 0.78, y: 0.33, w: 0.22, h: 0.33, slant: 0 },
      { x: 0.0, y: 0.66, w: 0.5, h: 0.34, slant: 0 },
      { x: 0.5, y: 0.66, w: 0.5, h: 0.34, slant: 0 },
    ],
  },
  {
    id: 'wide-banner',
    name: 'Wide Banner',
    panels: [
      { x: 0.0, y: 0.0, w: 1.0, h: 0.55, slant: 0 },
      { x: 0.0, y: 0.55, w: 0.34, h: 0.45, slant: 0 },
      { x: 0.34, y: 0.55, w: 0.33, h: 0.45, slant: 0 },
      { x: 0.67, y: 0.55, w: 0.33, h: 0.45, slant: 0 },
    ],
  },
  {
    id: 'portrait-stack',
    name: 'Portrait Stack',
    panels: [
      { x: 0.0, y: 0.0, w: 0.36, h: 0.5, slant: 0 },
      { x: 0.0, y: 0.5, w: 0.36, h: 0.5, slant: 0 },
      { x: 0.36, y: 0.0, w: 0.64, h: 1.0, slant: 0 },
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((layout) => layout.id === id) || LAYOUTS[0];
}

// The most panels any layout holds; the editor keeps one slot per panel.
export const MAX_PANELS = Math.max(...LAYOUTS.map((l) => l.panels.length));

// Pixel rectangle of a panel on a W x H canvas, with a small bleed so
// slanted neighbours never show a hairline gap between them.
export function panelRect(panel, W, H) {
  const bleed = 2;
  return {
    x: panel.x * W - bleed,
    y: panel.y * H - bleed,
    w: panel.w * W + bleed * 2,
    h: panel.h * H + bleed * 2,
    slant: panel.slant,
  };
}

// The clip polygon of a panel: a parallelogram whose top edge is sheared
// by slant * height. With slant 0 it is the plain rectangle.
export function panelPath(ctx, rect) {
  const shift = rect.slant * rect.h;
  ctx.beginPath();
  ctx.moveTo(rect.x + shift, rect.y);
  ctx.lineTo(rect.x + rect.w + shift, rect.y);
  ctx.lineTo(rect.x + rect.w, rect.y + rect.h);
  ctx.lineTo(rect.x, rect.y + rect.h);
  ctx.closePath();
}
