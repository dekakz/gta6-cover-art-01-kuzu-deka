// Solmar Bay Cover Studio: loads the bundled fonts, starts the editor,
// and hands a `?shot=` query to shots.js for deterministic screenshots.
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
  // Load the sample photos so the first paint already shows the studio.
  editor.loadSamples(['street', 'boulevard', 'neon', 'marina', 'lifeguard', 'pier']);
}
