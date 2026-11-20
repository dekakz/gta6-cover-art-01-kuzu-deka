// photos.js — the twelve sample photos and the cover-fit photo drawer.
//
// Every sample was made with an image model for this studio: no real
// person, no game artwork. px/py is the photo's focal point (0..1), so a
// tall panel frames the face instead of the middle of the frame.

export const SAMPLES = [
  { id: 'hero-driver', file: 'hero-driver.jpg', label: 'Hero driver', px: 0.5, py: 0.32 },
  { id: 'duo-convertible', file: 'duo-convertible.jpg', label: 'Coastal duo', px: 0.5, py: 0.45 },
  { id: 'neon-arcade', file: 'neon-arcade.jpg', label: 'Neon arcade', px: 0.5, py: 0.3 },
  { id: 'rider-night', file: 'rider-night.jpg', label: 'Night rider', px: 0.5, py: 0.4 },
  { id: 'speedboat', file: 'speedboat.jpg', label: 'Speedboat', px: 0.5, py: 0.5 },
  { id: 'skyline-dusk', file: 'skyline-dusk.jpg', label: 'Skyline dusk', px: 0.5, py: 0.45 },
  { id: 'gas-neon', file: 'gas-neon.jpg', label: 'Gas station neon', px: 0.5, py: 0.35 },
  { id: 'coast-aerial', file: 'coast-aerial.jpg', label: 'Coast aerial', px: 0.5, py: 0.5 },
  { id: 'marina-dawn', file: 'marina-dawn.jpg', label: 'Marina dawn', px: 0.5, py: 0.5 },
  { id: 'boulevard-palms', file: 'boulevard-palms.jpg', label: 'Boulevard palms', px: 0.5, py: 0.45 },
  { id: 'diner-night', file: 'diner-night.jpg', label: 'Diner night', px: 0.5, py: 0.4 },
  { id: 'beach-bonfire', file: 'beach-bonfire.jpg', label: 'Beach bonfire', px: 0.5, py: 0.55 },
];

export function sampleById(id) {
  return SAMPLES.find((sample) => sample.id === id) || SAMPLES[0];
}

const cache = new Map();

// The image already loaded for a key, or null when it is not loaded yet.
// The renderer is synchronous, so it only ever draws what is cached.
export function getCachedPhoto(key) {
  return cache.get(key) || null;
}

// Load one sample photo (or an uploaded data: URL) and cache it by key.
export function loadPhoto(key, src) {
  if (cache.has(key)) return Promise.resolve(cache.get(key));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      cache.set(key, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`could not load photo ${key}`));
    img.src = src;
  });
}

export function photoSrc(sample) {
  return `./samples/${sample.file}`;
}

export function preloadPhotos() {
  return Promise.all(
    SAMPLES.map((sample) => loadPhoto(sample.id, photoSrc(sample)).catch(() => null)),
  );
}

// Draw an image so it covers rect (x, y, w, h) with no edge ever showing.
// zoom multiplies the cover scale; px/py (0..1) pick the focal point the
// crop centres on, clamped so the photo can never slide past its own edge.
export function drawCoverPhoto(ctx, img, x, y, w, h, zoom, px, py) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(w / iw, h / ih);
  const scale = base * (zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const fx = Math.min(1, Math.max(0, px == null ? 0.5 : px));
  const fy = Math.min(1, Math.max(0, py == null ? 0.5 : py));
  // The focal point sits at (fx, fy) of the drawn image; clamp the offset
  // so the drawn image always covers the rect.
  let dx = x + w / 2 - fx * dw;
  let dy = y + h / 2 - fy * dh;
  dx = Math.min(x, Math.max(x + w - dw, dx));
  dy = Math.min(y, Math.max(y + h - dh, dy));
  ctx.drawImage(img, dx, dy, dw, dh);
}
