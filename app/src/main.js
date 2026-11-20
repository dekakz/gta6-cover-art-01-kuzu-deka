// main.js — boot for Solmar Bay Cover Studio.
//
// Loads the fonts and the sample photos, applies any screenshot preset
// from the URL, then renders. In cover mode the app is just the cover,
// full-bleed; otherwise it is the editor with a live preview.

import { renderCover } from './cover.js';
import { defaultState, initEditor, resolvePhoto } from './editor.js';
import { preloadPhotos } from './photos.js';
import { applyShotParams } from './shots.js';
import { renderExport, exportAll, exportPNG, SIZES } from './export.js';

const state = defaultState();
const shot = applyShotParams(state);
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');

let lastDebug = null;

function previewScale(size) {
  const longest = Math.max(size.w, size.h);
  return Math.min(1, 900 / longest);
}

function renderPreview() {
  const size = SIZES.find((s) => s.id === state.sizeId) || SIZES[0];
  if (shot.shot === 'cover') {
    // Full-bleed: the canvas is the viewport, at device pixels.
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    lastDebug = renderCover(ctx, state, w, h, resolvePhoto);
  } else {
    const scale = previewScale(size);
    canvas.width = Math.round(size.w * scale);
    canvas.height = Math.round(size.h * scale);
    lastDebug = renderCover(ctx, state, canvas.width, canvas.height, resolvePhoto, {
      selected: state.selectedPanel,
    });
  }
  window.__COVER_DEBUG__ = lastDebug;
  return lastDebug;
}

async function boot() {
  try {
    if (shot.shot === 'cover') {
      document.body.classList.add('shot-cover');
    }
    await Promise.race([
      Promise.all([
        document.fonts.load('400 100px Anton'),
        document.fonts.load('400 100px "Bebas Neue"'),
        document.fonts.load('400 100px Pacifico'),
        document.fonts.load('600 100px Oswald'),
      ]),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);
    await preloadPhotos();
    if (shot.shot !== 'cover') {
      initEditor(state, canvas, { onChange: renderPreview });
    }
    renderPreview();
    if (shot.shot === 'cover') {
      // A second pass once every font is really in, so the cover shot
      // never catches a fallback face.
      await document.fonts.ready;
      renderPreview();
    }
    window.__READY__ = true;
  } catch (err) {
    window.__READY_ERROR__ = String(err && err.message ? err.message : err);
    window.__READY__ = true;
  }
}

// QA hooks: the maker drives exports and reads results from the console.
window.SolmarBay = { state, renderCover, renderPreview, exportAll, exportPNG, SIZES };
window.__exportTest = async () => {
  const out = [];
  for (const size of SIZES) {
    const { blob } = await renderExport(state, size.id, resolvePhoto);
    out.push({ id: size.id, w: size.w, h: size.h, bytes: blob.size, type: blob.type });
  }
  return out;
};

window.addEventListener('resize', () => {
  if (shot.shot === 'cover') renderPreview();
});

boot();
