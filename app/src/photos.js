// Sample photos and the cover-fit crop that draws them into panels.
// All twelve samples are original photos made with an image model for this
// studio: fictional people, no real person, no game artwork. A photo is
// drawn "cover" style — scaled to fill its panel, then panned — and the pan
// can never expose an edge, because the drawn image always covers the rect.
'use strict';

// One entry per sample: the file, the role tag and the story caption the
// panel shows by default. The strings are the studio's own.
const SAMPLES = [
  { src: 'samples/hero-driver.jpg', role: 'THE DRIVER', place: 'SOLMAR STRIP', time: '6:40 PM', flavor: 'TOP DOWN, NO PLANS' },
  { src: 'samples/duo-convertible.jpg', role: 'THE GETAWAY', place: 'COAST ROAD 9', time: '7:15 PM', flavor: 'CHASING THE LIGHT' },
  { src: 'samples/neon-arcade.jpg', role: 'THE LOOKOUT', place: 'NEON MILE', time: '11:58 PM', flavor: 'OUT PAST CURFEW' },
  { src: 'samples/rider-night.jpg', role: 'THE WHEELMAN', place: 'DUSK RIDGE', time: '8:05 PM', flavor: 'ONE LAST RIDE' },
  { src: 'samples/speedboat.jpg', role: 'THE PILOT', place: 'CORAL SHORE', time: '5:50 PM', flavor: 'THE WHOLE COAST' },
  { src: 'samples/skyline-dusk.jpg', role: 'THE SPOTTER', place: 'SKYLINE ROOF', time: '9:10 PM', flavor: 'EYES ON THE CITY' },
  { src: 'samples/gas-neon.jpg', role: 'THE FIXER', place: 'PALM FUEL', time: '1:20 AM', flavor: 'RAIN ON NEON' },
  { src: 'samples/coast-aerial.jpg', role: 'THE RUNNER', place: 'CLIFF RUN', time: '7:02 PM', flavor: 'NO BRAKES DOWNHILL' },
  { src: 'samples/marina-dawn.jpg', role: 'THE ANGLER', place: 'HARBOR LIGHTS', time: '6:05 AM', flavor: 'FIRST CAST' },
  { src: 'samples/boulevard-palms.jpg', role: 'THE CAPTAIN', place: 'SUNSET ROW', time: '6:42 PM', flavor: 'GOLDEN HOUR RUN' },
  { src: 'samples/diner-night.jpg', role: 'THE DEALER', place: 'THE DINER', time: '12:40 AM', flavor: 'COFFEE AND ALIBIS' },
  { src: 'samples/beach-bonfire.jpg', role: 'THE GHOST', place: 'BOARDWALK', time: '7:30 PM', flavor: 'SPARKS AND SALT AIR' },
];

// The cache of loaded images, keyed by src. Uploads land here too, under
// their object URL, so the renderer never cares where a photo came from.
const imageCache = new Map();

// The resolved <img> per src (null when a file failed to load). Filled in
// when a load finishes; the renderer reads this, never the promises.
const loadedImages = new Map();

// Loads one image (from the cache when already loaded). Resolves with the
// <img> element, or with null when the file cannot be read.
function loadImage(src) {
  const hit = imageCache.get(src);
  if (hit) return hit;
  const p = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { loadedImages.set(src, img); resolve(img); };
    img.onerror = () => { loadedImages.set(src, null); resolve(null); };
    img.src = src;
  });
  imageCache.set(src, p);
  return p;
}

// Preloads every sample photo. The cover renders once they resolve, so a
// first paint never shows an empty panel.
function preloadSamples() {
  return Promise.all(SAMPLES.map((s) => loadImage(s.src)));
}

// The natural aspect ratio of a loaded image (width / height), or 1.5
// while it is still loading, so layout math never divides by zero.
function imageAspect(img) {
  if (!img || !img.naturalWidth) return 1.5;
  return img.naturalWidth / img.naturalHeight;
}

// Draws an image cover-fit into a rect: scaled so it always covers the
// rect, then offset by the pan (px, py in 0..1) and the zoom (>= 1). The
// caller clips to the panel first; this never draws outside the rect.
function drawPhotoCover(ctx, img, x, y, w, h, zoom, px, py) {
  if (!img) return;
  const z = Math.max(1, zoom || 1);
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * z;
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const fx = Math.min(1, Math.max(0, px == null ? 0.5 : px));
  const fy = Math.min(1, Math.max(0, py == null ? 0.5 : py));
  const dx = x + (w - dw) * fx;
  const dy = y + (h - dh) * fy;
  ctx.drawImage(img, dx, dy, dw, dh);
}
