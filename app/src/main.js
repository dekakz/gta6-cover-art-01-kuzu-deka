// Solmar Bay Cover Studio (v2, key art): loads the bundled fonts, starts
// the editor, and hands a `?shot=` query to shots.js for deterministic
// screenshots. The default cover is the 6-panel Key Art layout with the
// giant title overlapping the photo seam, per-panel caption chips, a press
// quote, WANTED / VOL. stickers and a thin palm bottom strip.
import { createEditor } from './editor.js';
import { runShot } from './shots.js';

/** Loads the bundled OFL fonts so the canvas can paint with them. */
export async function loadFonts() {
  const faces = [
    ['Anton', 'fonts/Anton-Regular.woff2', 400],
    ['Oswald', 'fonts/Oswald.woff2', 600],
    ['Pacifico', 'fonts/Pacifico-Regular.woff2', 400],
    ['Bebas Neue', 'fonts/BebasNeue-Regular.woff2', 400],
  ];
  for (const [family, url, weight] of faces) {
    try {
      const face = new FontFace(family, `url(${url})`, { weight: String(weight) });
      const loaded = await face.load();
      document.fonts.add(loaded);
    } catch (e) {
      // The canvas falls back to system fonts; the cover still draws.
    }
  }
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 1500)),
    ]);
  } catch { /* fonts are best-effort */ }
}

const canvas = document.getElementById('cover');
const editor = createEditor(canvas);
window.__editor = editor;

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  await loadFonts();
  await runShot(shot, query, editor);
} else {
  loadFonts().then(() => editor.redraw());
  // Load the sample photos so the first paint already shows the studio:
  // the six new key-art photos fill the six Key Art panels first, then
  // the six v1 photos are available for the other layouts.
  editor.loadSamples(['hero-convertible', 'man-face', 'sports-car', 'gas-station', 'motorcycle', 'aerial-coast', 'street', 'boulevard', 'neon', 'marina', 'lifeguard', 'pier']);
}
