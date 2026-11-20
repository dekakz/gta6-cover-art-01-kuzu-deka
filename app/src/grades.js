// grades.js — the eight colour grades of Solmar Bay Cover Studio.
//
// A grade sets the horizontal sunset bands the giant title is filled with,
// the tint washed over every photo, and the accent used by role tags,
// the gold seal and the small chips. Every grade is the studio's own
// palette; none of them copies a game's official artwork.

export const GRADES = [
  {
    id: 'sunset-strip',
    name: 'Sunset Strip',
    bands: ['#ffd319', '#ff9a3d', '#ff5e62', '#c724b1', '#5b2a86'],
    tint: 'rgba(255, 94, 98, 0.10)',
    accent: '#ffd319',
    accentInk: '#241300',
    seal: '#f5b90d',
  },
  {
    id: 'neon-vice',
    name: 'Neon Vice',
    bands: ['#00f5d4', '#00bbf9', '#9b5de5', '#f15bb5', '#fee440'],
    tint: 'rgba(155, 93, 229, 0.12)',
    accent: '#00f5d4',
    accentInk: '#04263a',
    seal: '#f5b90d',
  },
  {
    id: 'coral-heat',
    name: 'Coral Heat',
    bands: ['#ffe66d', '#ff9f43', '#ff6b6b', '#ee5253', '#8e2a5c'],
    tint: 'rgba(255, 107, 107, 0.10)',
    accent: '#ffe66d',
    accentInk: '#331400',
    seal: '#f5b90d',
  },
  {
    id: 'palm-noir',
    name: 'Palm Noir',
    bands: ['#fdfdfd', '#ffe66d', '#f0a35e', '#6b6b6b', '#141414'],
    tint: 'rgba(20, 20, 30, 0.18)',
    accent: '#ffe66d',
    accentInk: '#1a1a1a',
    seal: '#e8e8e8',
  },
  {
    id: 'vice-violet',
    name: 'Vice Violet',
    bands: ['#f72585', '#b5179e', '#7209b7', '#560bad', '#3a0ca3'],
    tint: 'rgba(114, 9, 183, 0.12)',
    accent: '#f72585',
    accentInk: '#2b0033',
    seal: '#f5b90d',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    bands: ['#fff3b0', '#ffea00', '#ffc300', '#ff8800', '#c1440e'],
    tint: 'rgba(255, 183, 3, 0.10)',
    accent: '#ffea00',
    accentInk: '#332200',
    seal: '#f5b90d',
  },
  {
    id: 'midnight-teal',
    name: 'Midnight Teal',
    bands: ['#caf0f8', '#90e0ef', '#00b4d8', '#0077b6', '#023e8a'],
    tint: 'rgba(0, 180, 216, 0.10)',
    accent: '#90e0ef',
    accentInk: '#03263a',
    seal: '#f5b90d',
  },
  {
    id: 'bubblegum',
    name: 'Bubblegum',
    bands: ['#ff8fab', '#ffc2d1', '#fb6f92', '#ff4d6d', '#7a0c2e'],
    tint: 'rgba(255, 143, 171, 0.10)',
    accent: '#ffc2d1',
    accentInk: '#3d0a1e',
    seal: '#f5b90d',
  },
];

export function gradeById(id) {
  return GRADES.find((grade) => grade.id === id) || GRADES[0];
}

// A vertical sunset gradient (for the "gradient" title style): the same
// band colours blended smoothly instead of striped.
export function gradeGradient(ctx, bands, x, y, w, h) {
  const gradient = ctx.createLinearGradient(x, y, x, y + h);
  bands.forEach((color, i) => {
    gradient.addColorStop(i / (bands.length - 1), color);
  });
  return gradient;
}

// A horizontal stripe pattern (for the "stripes" title style): one band
// per colour, repeated over the title's height.
export function gradeStripePattern(ctx, bands, bandHeight) {
  const tile = document.createElement('canvas');
  tile.width = 8;
  tile.height = Math.max(1, Math.round(bandHeight * bands.length));
  const tctx = tile.getContext('2d');
  bands.forEach((color, i) => {
    tctx.fillStyle = color;
    tctx.fillRect(0, Math.round(i * bandHeight), tile.width, Math.ceil(bandHeight));
  });
  return ctx.createPattern(tile, 'repeat');
}
