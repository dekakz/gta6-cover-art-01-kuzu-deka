// Screenshot presets: ?shot=cover|editor|portrait|square on the page URL
// picks a preset and a size and (for the cover shots) hides the editor
// chrome so the frame is the cover alone. The screenshot driver uses
// these; a person opening the page normally never sees them.
'use strict';

const SHOT_PRESETS = {
  cover: { preset: 'sunset-chase', size: '1920x1080', mode: 'cover' },
  editor: { preset: 'sunset-chase', size: '1920x1080', mode: 'editor' },
  portrait: { preset: 'neon-vice', size: '1080x1350', mode: 'cover' },
  square: { preset: 'coral-heat', size: '1080x1080', mode: 'cover' },
};

// The shot named by ?shot=, or null for a normal visit.
function getShot() {
  let name = null;
  try {
    name = new URLSearchParams(window.location.search).get('shot');
  } catch (e) {
    name = null;
  }
  if (!name || !SHOT_PRESETS[name]) return null;
  return { name, ...SHOT_PRESETS[name] };
}
