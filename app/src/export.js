// Export for Solmar Bay Cover Studio: renders the cover at the three
// common post sizes and downloads them as PNGs, one click for all three
// or one button per size. Rendering reuses drawCover on an offscreen
// canvas, so an export is exactly what the live preview shows.

import { drawCover } from './cover.js';

/** The three post sizes: square, portrait, landscape. */
export const EXPORT_SIZES = [
  { id: 'square', label: 'Square 1080 x 1080', w: 1080, h: 1080, file: 'solmar-bay-cover-1080x1080.png' },
  { id: 'portrait', label: 'Portrait 1080 x 1350', w: 1080, h: 1350, file: 'solmar-bay-cover-1080x1350.png' },
  { id: 'landscape', label: 'Landscape 1920 x 1080', w: 1920, h: 1080, file: 'solmar-bay-cover-1920x1080.png' },
];

/** Renders the cover at `size` and resolves to a PNG Blob. */
export function renderCoverBlob(state, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, { ...state, selectedPanel: null });
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed'))), 'image/png');
  });
}

/** Downloads a Blob as a file. */
export function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/** Exports one size. Resolves to the filename. */
export async function exportOneSize(state, sizeId) {
  const size = EXPORT_SIZES.find((s) => s.id === sizeId) || EXPORT_SIZES[0];
  const blob = await renderCoverBlob(state, size);
  downloadBlob(blob, size.file);
  return size.file;
}

/**
 * Exports all three sizes, one after another, calling `onProgress(done,
 * total, label)` after each. Resolves to the list of filenames.
 */
export async function exportAllSizes(state, onProgress) {
  const files = [];
  for (let i = 0; i < EXPORT_SIZES.length; i++) {
    const size = EXPORT_SIZES[i];
    const blob = await renderCoverBlob(state, size);
    downloadBlob(blob, size.file);
    files.push(size.file);
    if (onProgress) onProgress(i + 1, EXPORT_SIZES.length, size.label);
    // Let the browser breathe between downloads so none is dropped.
    await new Promise((r) => setTimeout(r, 250));
  }
  return files;
}
