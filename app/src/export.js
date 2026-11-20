// PNG export: renders the cover offscreen at the exact post size and
// downloads it. The export waits for the bundled fonts first, so an
// export can never fall back to a system font.
'use strict';

const EXPORT_SIZES = {
  '1920x1080': [1920, 1080],
  '1080x1080': [1080, 1080],
  '1080x1350': [1080, 1350],
};

// Waits until the four bundled fonts are usable at the sizes the cover
// needs (Anton for the title, Pacifico for the tagline, Oswald for chips,
// Bebas Neue for the ribbon).
function waitForCoverFonts() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.all([
    document.fonts.load('400 100px Anton'),
    document.fonts.load('400 40px Pacifico'),
    document.fonts.load('600 20px Oswald'),
    document.fonts.load('400 20px "Bebas Neue"'),
    document.fonts.ready,
  ]).catch(() => undefined);
}

// Renders one PNG of the cover at `sizeKey` and downloads it as
// solmar-bay-cover-<size>.png. Returns a promise for the blob.
async function exportPNG(state, sizeKey) {
  await waitForCoverFonts();
  const dims = EXPORT_SIZES[sizeKey];
  if (!dims) throw new Error(`unknown size ${sizeKey}`);
  const [w, h] = dims;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  renderCover(canvas.getContext('2d'), state, w, h);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `solmar-bay-cover-${sizeKey}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return blob;
}

// Exports all three post sizes, one after another, and reports progress
// into #exportNote. A short pause between downloads keeps the browser
// from dropping one.
async function exportAll(state, noteEl) {
  const keys = Object.keys(EXPORT_SIZES);
  for (let i = 0; i < keys.length; i++) {
    if (noteEl) noteEl.textContent = `Exporting ${i + 1} of ${keys.length}…`;
    await exportPNG(state, keys[i]);
    await new Promise((r) => setTimeout(r, 350));
  }
  if (noteEl) noteEl.textContent = 'Done — 3 PNGs downloaded.';
}
