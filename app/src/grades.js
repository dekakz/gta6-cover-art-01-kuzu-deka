// Eight colour grades for Solmar Bay Cover Studio.
// A grade is data, not magic: warm/cool tint gradients painted over the
// photo area, a band gradient for the title strip, a vignette strength and
// a grain amount. applyGrade paints them onto a finished cover canvas;
// gradeBandGradient gives the title band its own sunset/neon sky. Every
// grade is deterministic (the grain uses a seeded pattern), so the same
// cover exports byte-identical PNGs every time.

export const GRADES = {
  sunset: {
    name: 'Sunset',
    swatch: '#ff7a3c',
    tint: [
      { stop: 0, color: 'rgba(255, 190, 90, 0.10)' },
      { stop: 0.6, color: 'rgba(255, 110, 60, 0.16)' },
      { stop: 1, color: 'rgba(214, 40, 120, 0.28)' },
    ],
    band: ['#ff9e2c', '#ff5e62', '#c026d3'],
    vignette: 0.32,
    grain: 0.05,
    halftone: false,
  },
  'neon-vice': {
    name: 'Neon Vice',
    swatch: '#ff2ea6',
    tint: [
      { stop: 0, color: 'rgba(0, 229, 255, 0.10)' },
      { stop: 0.55, color: 'rgba(255, 46, 166, 0.14)' },
      { stop: 1, color: 'rgba(90, 20, 160, 0.30)' },
    ],
    band: ['#12002e', '#7b2ff7', '#ff2ea6'],
    vignette: 0.4,
    grain: 0.06,
    halftone: false,
  },
  'coral-heat': {
    name: 'Coral Heat',
    swatch: '#ff6b6b',
    tint: [
      { stop: 0, color: 'rgba(255, 220, 130, 0.12)' },
      { stop: 0.5, color: 'rgba(255, 107, 107, 0.18)' },
      { stop: 1, color: 'rgba(160, 30, 90, 0.26)' },
    ],
    band: ['#ffb347', '#ff6b6b', '#8e2a5c'],
    vignette: 0.3,
    grain: 0.04,
    halftone: false,
  },
  'palm-dusk': {
    name: 'Palm Dusk',
    swatch: '#7c5cff',
    tint: [
      { stop: 0, color: 'rgba(255, 170, 120, 0.08)' },
      { stop: 0.6, color: 'rgba(124, 92, 255, 0.16)' },
      { stop: 1, color: 'rgba(20, 10, 60, 0.34)' },
    ],
    band: ['#f97316', '#7c3aed', '#1e1b4b'],
    vignette: 0.38,
    grain: 0.05,
    halftone: false,
  },
  midnight: {
    name: 'Midnight',
    swatch: '#1e3a8a',
    tint: [
      { stop: 0, color: 'rgba(60, 120, 255, 0.10)' },
      { stop: 1, color: 'rgba(4, 8, 40, 0.42)' },
    ],
    band: ['#0b1026', '#1e3a8a', '#0ea5e9'],
    vignette: 0.45,
    grain: 0.07,
    halftone: false,
  },
  'golden-hour': {
    name: 'Golden Hour',
    swatch: '#fbbf24',
    tint: [
      { stop: 0, color: 'rgba(255, 230, 150, 0.18)' },
      { stop: 0.6, color: 'rgba(255, 170, 40, 0.16)' },
      { stop: 1, color: 'rgba(180, 90, 20, 0.20)' },
    ],
    band: ['#fde68a', '#f59e0b', '#b45309'],
    vignette: 0.26,
    grain: 0.03,
    halftone: false,
  },
  halftone: {
    name: 'Halftone',
    swatch: '#111111',
    tint: [
      { stop: 0, color: 'rgba(255, 255, 255, 0.06)' },
      { stop: 1, color: 'rgba(0, 0, 0, 0.22)' },
    ],
    band: ['#facc15', '#f97316', '#111111'],
    vignette: 0.3,
    grain: 0.02,
    halftone: true,
  },
  noir: {
    name: 'Noir',
    swatch: '#444444',
    tint: [
      { stop: 0, color: 'rgba(255, 255, 255, 0.05)' },
      { stop: 1, color: 'rgba(0, 0, 0, 0.48)' },
    ],
    band: ['#525252', '#171717', '#000000'],
    vignette: 0.5,
    grain: 0.09,
    halftone: false,
  },
};

export const GRADE_IDS = Object.keys(GRADES);

/** Returns the grade record for an id, falling back to Sunset. */
export function gradeFor(gradeId) {
  return GRADES[gradeId] || GRADES.sunset;
}

/** Paints a grade's tint, vignette and grain over the photo area of a canvas. */
export function applyGrade(ctx, w, h, photoH, gradeId) {
  const grade = gradeFor(gradeId);
  const tint = ctx.createLinearGradient(0, 0, 0, photoH);
  for (const s of grade.tint) tint.addColorStop(s.stop, s.color);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, w, photoH);
  // Vignette: darkened corners over the whole cover.
  const v = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.35,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, `rgba(0,0,0,${grade.vignette})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  // Grain: deterministic dots from a tiny seeded generator, so exports repeat.
  if (grade.grain > 0) {
    let seed = 1234567;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    const step = Math.max(3, Math.round(w / 320));
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    const count = Math.floor((w * h * grade.grain) / (step * step * 14));
    for (let i = 0; i < count; i++) {
      const x = rand() * w;
      const y = rand() * h;
      ctx.globalAlpha = grade.grain * (0.4 + rand() * 0.6);
      ctx.fillRect(x, y, 1.4, 1.4);
    }
    ctx.globalAlpha = 1;
  }
  // Halftone: a dot screen over the photo area.
  if (grade.halftone) {
    const gap = Math.max(7, Math.round(w / 160));
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    for (let y = gap / 2; y < photoH; y += gap) {
      for (let x = gap / 2; x < w; x += gap) {
        const r = 1 + ((x + y) % gap) / gap * 1.6;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/** Vertical gradient for the title band of a grade. */
export function gradeBandGradient(ctx, x, y, w, h, gradeId) {
  const grade = gradeFor(gradeId);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, grade.band[0]);
  g.addColorStop(0.55, grade.band[1]);
  g.addColorStop(1, grade.band[2]);
  return g;
}
