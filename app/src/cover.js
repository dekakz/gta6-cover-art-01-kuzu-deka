// drawCover: paints a complete Solmar Bay cover onto a canvas.
// Order: white gutters and panel photos, colour grade, title band with its
// sunset gradient and skyline silhouette, lettering, then stickers. The
// canvas's own width/height decide the export size, so the same state
// renders identically at 1080x1080, 1080x1350 and 1920x1080.
import { panelsForLayout, photoAreaRect, titleBandRect } from './layouts.js';
import { applyGrade, gradeBandGradient, gradeFor } from './grades.js';
import { drawCoverLettering } from './lettering.js';
import { drawStickers } from './stickers.js';
import { drawPhotoInPanel } from './photos.js';

/** A tiny deterministic skyline silhouette for the foot of the title band. */
export function drawSkylineSilhouette(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(8, 4, 16, 0.85)';
  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  let cx = x;
  while (cx < x + w) {
    const bw = w * (0.03 + rand() * 0.05);
    const bh = h * (0.3 + rand() * 0.45);
    ctx.fillRect(cx, y + h - bh, bw, bh);
    if (rand() > 0.5) {
      ctx.fillStyle = '#ffd23f';
      ctx.fillRect(cx + bw * 0.3, y + h - bh * 0.6, Math.max(2, bw * 0.14), Math.max(2, bh * 0.12));
      ctx.fillStyle = 'rgba(8, 4, 16, 0.85)';
    }
    cx += bw + w * 0.004;
  }
  ctx.restore();
}

/**
 * Draws the whole cover.
 * `state` is { photos, assignments, crops, layout, grade, title, tagline,
 * location, barText, stickers, selectedPanel }.
 * Returns the list of panel rectangles in canvas pixels (for hit-testing).
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const bandF = titleBandRect();
  const areaF = photoAreaRect();
  const band = { x: bandF.x * w, y: bandF.y * h, w: bandF.w * w, h: bandF.h * h };
  const area = { x: areaF.x * w, y: areaF.y * h, w: areaF.w * w, h: areaF.h * h };
  const panels = panelsForLayout(state.layout || 'hero-5');
  const gutter = Math.max(3, Math.round(w * 0.004));

  // Backdrop: white gutters show between panels.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Panels: photo, or a warm placeholder when a panel has no photo yet.
  const rects = panels.map((panel, i) => {
    const rect = {
      x: area.x + panel.x * area.w + (panel.x > 0 ? gutter / 2 : 0),
      y: area.y + panel.y * area.h + (panel.y > 0 ? gutter / 2 : 0),
      w: panel.w * area.w - (panel.x > 0 ? gutter / 2 : 0) - (panel.x + panel.w < 1 ? gutter / 2 : 0),
      h: panel.h * area.h - (panel.y > 0 ? gutter / 2 : 0) - (panel.y + panel.h < 1 ? gutter / 2 : 0),
    };
    const photoIdx = (state.assignments || [])[i] ?? 0;
    const img = (state.photos || [])[photoIdx] || null;
    if (img) {
      drawPhotoInPanel(ctx, img, panel, rect, state.crops?.[i]);
    } else {
      const g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      g.addColorStop(0, '#ffb347');
      g.addColorStop(1, '#c026d3');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `600 ${Math.max(13, rect.w * 0.045)}px Oswald, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    }
    return rect;
  });

  // Colour grade over the photo area, then the title band.
  applyGrade(ctx, w, h, area.h, state.grade || 'sunset');
  ctx.fillStyle = gradeBandGradient(ctx, band.x, band.y, band.w, band.h, state.grade || 'sunset');
  ctx.fillRect(band.x, band.y, band.w, band.h);
  ctx.fillStyle = '#ffd23f';
  ctx.fillRect(band.x, band.y, band.w, Math.max(2, h * 0.003));
  drawSkylineSilhouette(ctx, band.x, band.y + band.h * 0.62, band.w, band.h * 0.38);

  drawCoverLettering(ctx, band, {
    title: state.title,
    tagline: state.tagline,
    location: state.location,
    barText: state.barText,
    halftone: gradeFor(state.grade || 'sunset').halftone,
  });
  drawStickers(ctx, w, h, area.h, state.stickers);

  // Selected panel outline, for the editor only.
  if (state.selectedPanel != null && rects[state.selectedPanel]) {
    const r = rects[state.selectedPanel];
    ctx.save();
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = Math.max(3, w * 0.005);
    ctx.setLineDash([14, 8]);
    ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);
    ctx.restore();
  }
  return rects;
}
