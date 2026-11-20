// export.js — PNG export in the three post sizes. Every export re-renders
// the cover at the exact pixel size, so the PNG is the preview, sharper.

import { renderCover } from './cover.js';

export const SIZES = [
  { id: '1080x1080', w: 1080, h: 1080, label: 'Square · 1080 × 1080' },
  { id: '1080x1350', w: 1080, h: 1350, label: 'Portrait · 1080 × 1350' },
  { id: '1920x1080', w: 1920, h: 1080, label: 'Landscape · 1920 × 1080' },
];

export function sizeById(id) {
  return SIZES.find((size) => size.id === id) || SIZES[0];
}

function slugTitle(title) {
  return String(title || 'cover')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'cover';
}

// Render one size to an offscreen canvas and return it (plus its blob).
export async function renderExport(state, sizeId, resolvePhoto) {
  const size = sizeById(sizeId);
  await document.fonts.ready;
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  const ctx = canvas.getContext('2d');
  renderCover(ctx, state, size.w, size.h, resolvePhoto);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return { canvas, blob, size };
}

// Download one PNG of the cover at sizeId.
export async function exportPNG(state, sizeId, resolvePhoto) {
  const { blob, size } = await renderExport(state, sizeId, resolvePhoto);
  const name = `solmar-bay-cover-${size.w}x${size.h}.png`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return { name, bytes: blob.size, size };
}

// Download all three sizes, one after another. Returns the three results.
export async function exportAll(state, resolvePhoto, onStep) {
  const results = [];
  for (const size of SIZES) {
    const result = await exportPNG(state, size.id, resolvePhoto);
    results.push(result);
    if (onStep) onStep(result);
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  return results;
}

export { slugTitle };
