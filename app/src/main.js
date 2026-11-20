// Boot: builds the editor, applies a screenshot preset when ?shot= is
// present, preloads the sample photos and the bundled fonts, then renders.
// Exposes window.SolmarBay for the screenshot driver and for debugging:
// { state, render, exportPNG, exportAll }.
'use strict';

function boot() {
  // Default panels come from the Sunset Chase preset.
  applyPreset('sunset-chase');
  bindEditor();

  const shot = getShot();
  if (shot) {
    state.size = shot.size;
    applyPreset(shot.preset);
    document.body.classList.add(shot.mode === 'cover' ? 'shot-cover' : 'shot-editor');
  }
  syncInputs();

  // Render once right away (photos paint in as they load), then again
  // once the fonts and the samples are ready.
  render();
  const ready = Promise.all([
    waitForCoverFonts(),
    preloadSamples(),
  ]);
  ready.then(() => {
    render();
    document.body.setAttribute('data-ready', 'true');
    window.SolmarBayReady = true;
  });

  window.SolmarBay = {
    state,
    render,
    exportPNG: (size) => exportPNG(state, size || state.size),
    exportAll: () => exportAll(state, document.getElementById('exportNote')),
  };
}

boot();
