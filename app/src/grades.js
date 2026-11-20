// Colour grades: each grade drives the title bands, the tagline, the
// bottom strip, the photo tint and the scrim. The title is filled with
// horizontal sunset bands (see lettering.js) — the band colours below are
// what makes each grade read as its own poster at a glance.
'use strict';

const GRADES = {
  sunset: {
    label: 'Sunset',
    swatch: 'linear-gradient(135deg,#ffd166,#ff5e62 55%,#b537f2)',
    bands: ['#fff7d6', '#ffd166', '#ff9a3d', '#ff5e62', '#c44dff'],
    offset: '#3b0a54',
    tagline: '#ff7ad9',
    strip: ['#2a0f38', '#7a1e4d'],
    tint: 'rgba(255,110,40,0.10)',
    scrim: 'rgba(12,4,24,0.62)',
    accent: '#ffd166',
  },
  'neon-vice': {
    label: 'Neon Vice',
    swatch: 'linear-gradient(135deg,#7df9ff,#ff7ad9 55%,#3d0a5e)',
    bands: ['#e8fbff', '#7df9ff', '#ff7ad9', '#b537f2', '#3d0a5e'],
    offset: '#12022e',
    tagline: '#7df9ff',
    strip: ['#0a1030', '#4d0a5e'],
    tint: 'rgba(120,60,255,0.12)',
    scrim: 'rgba(6,2,26,0.62)',
    accent: '#7df9ff',
  },
  'coral-heat': {
    label: 'Coral Heat',
    swatch: 'linear-gradient(135deg,#fff3c4,#ff7e5f 55%,#e94f8a)',
    bands: ['#fff3c4', '#ffb347', '#ff7e5f', '#e94f8a', '#7a1fa2'],
    offset: '#4d0a2e',
    tagline: '#ffe27a',
    strip: ['#3d0f22', '#8a2a4d'],
    tint: 'rgba(255,90,90,0.10)',
    scrim: 'rgba(20,4,14,0.60)',
    accent: '#ffb347',
  },
  halftone: {
    label: 'Halftone',
    swatch: 'linear-gradient(135deg,#f5f5f5,#9a9a9a 55%,#111111)',
    bands: ['#ffffff', '#e2e2e2', '#b5b5b5', '#5f5f5f', '#161616'],
    offset: '#000000',
    tagline: '#ffd166',
    strip: ['#141414', '#3a3a3a'],
    tint: 'rgba(0,0,0,0.14)',
    scrim: 'rgba(0,0,0,0.62)',
    accent: '#ffd166',
  },
  'palm-gold': {
    label: 'Palm Gold',
    swatch: 'linear-gradient(135deg,#fffbe6,#f5b942 55%,#7a3b12)',
    bands: ['#fffbe6', '#ffe27a', '#f5b942', '#d97b29', '#7a3b12'],
    offset: '#3a1c05',
    tagline: '#ff9a3d',
    strip: ['#2e1a05', '#6b3d10'],
    tint: 'rgba(255,170,40,0.12)',
    scrim: 'rgba(16,8,2,0.60)',
    accent: '#ffe27a',
  },
  midnight: {
    label: 'Midnight',
    swatch: 'linear-gradient(135deg,#dfe9ff,#5b6cff 55%,#2b1055)',
    bands: ['#dfe9ff', '#8fb8ff', '#5b6cff', '#9d4edd', '#2b1055'],
    offset: '#0b0626',
    tagline: '#c9b8ff',
    strip: ['#0a0a2e', '#2b1055'],
    tint: 'rgba(60,80,255,0.12)',
    scrim: 'rgba(4,2,22,0.62)',
    accent: '#8fb8ff',
  },
  candy: {
    label: 'Candy',
    swatch: 'linear-gradient(135deg,#ffd6ec,#ff4d6d 55%,#7b2d8b)',
    bands: ['#ffffff', '#ffd6ec', '#ff8ac2', '#ff4d6d', '#7b2d8b'],
    offset: '#3d0a33',
    tagline: '#7df9ff',
    strip: ['#33102e', '#7b1e5e'],
    tint: 'rgba(255,80,150,0.10)',
    scrim: 'rgba(18,2,16,0.60)',
    accent: '#ff8ac2',
  },
  chrome: {
    label: 'Chrome',
    swatch: 'linear-gradient(135deg,#ffffff,#9aa8b8 55%,#2e3a4a)',
    bands: ['#ffffff', '#dfe6ee', '#9aa8b8', '#5f7086', '#2e3a4a'],
    offset: '#101820',
    tagline: '#ffd166',
    strip: ['#101820', '#33404f'],
    tint: 'rgba(120,150,180,0.10)',
    scrim: 'rgba(4,8,12,0.62)',
    accent: '#dfe6ee',
  },
};

// The bottom strip's gradient for a grade, as a canvas gradient.
function gradeStripGradient(ctx, grade, w, h) {
  const g = GRADES[grade] || GRADES.sunset;
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, g.strip[0]);
  grad.addColorStop(1, g.strip[1]);
  return grad;
}
