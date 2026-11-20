// shots.js — screenshot presets driven by the URL query string.
//
//   ?shot=cover&preset=sunset-chase&size=1920x1080   full-bleed cover
//   ?shot=editor&preset=neon-vice                   the editor, a photo loaded
//
// The maker uses these to take the entry's screenshots; the app itself
// never needs them. Unknown values fall back to the defaults.

import { presetById, applyPreset } from './editor.js';
import { layoutById } from './layouts.js';
import { gradeById } from './grades.js';
import { sizeById } from './export.js';

export function applyShotParams(state) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (params.get('preset')) applyPreset(state, params.get('preset'));
  if (params.get('layout')) state.layoutId = layoutById(params.get('layout')).id;
  if (params.get('grade')) state.gradeId = gradeById(params.get('grade')).id;
  if (params.get('size')) state.sizeId = sizeById(params.get('size')).id;
  if (params.get('title')) state.title = params.get('title').toUpperCase();
  if (params.get('tagline')) state.tagline = params.get('tagline');
  if (params.get('quote')) state.quote = params.get('quote');
  if (params.get('source')) state.quoteSource = params.get('source').toUpperCase();
  if (params.get('style')) state.titleStyle = params.get('style');
  return { shot: shot === 'cover' || shot === 'editor' ? shot : null };
}
