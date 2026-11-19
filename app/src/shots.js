// Fixed scenes for screenshots: `?shot=cover` shows one exported cover
// alone, `?shot=editor` shows the editor with photos loaded. Query knobs:
// layout, grade, photo (comma list of sample ids), caption, tagline,
// location, bar, preset, size (square|portrait|landscape).
// window.__shotReady is set once the cover is painted.
import { SAMPLE_PHOTOS } from './editor.js';

export async function runShot(shot, query, editor) {
  const { state } = editor;
  if (shot === 'cover') document.body.classList.add('shot-cover');

  const preset = query.get('preset');
  if (preset) editor.applyPreset(preset);

  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('caption')) state.title = query.get('caption');
  if (query.get('tagline')) state.tagline = query.get('tagline');
  if (query.get('location')) state.location = query.get('location');
  if (query.get('bar')) state.barText = query.get('bar');

  const size = query.get('size') || (shot === 'cover' ? 'landscape' : 'landscape');
  editor.setPreviewSize(size);

  const photoIds = (query.get('photo') || 'street,boulevard,neon,marina,lifeguard,pier')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const known = photoIds.filter((id) => SAMPLE_PHOTOS.some((s) => s.id === id));
  await editor.loadSamples(known.length ? known : ['street', 'boulevard', 'neon', 'marina']);

  // Hide the editor chrome for a pure cover shot, keep it for editor shots.
  if (shot === 'cover') state.selectedPanel = null;
  editor.redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
