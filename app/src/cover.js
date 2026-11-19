// drawCover (v2, key art): paints a complete Solmar Bay cover onto a canvas.
// Order: white gutters and panel photos filling the canvas down to the
// thin bottom strip, colour grade, a soft dark scrim behind the virtual
// title zone, the giant title overlapping the photo seam, per-panel
// storytelling caption chips, stickers, then the thin bottom strip with
// palm silhouettes, tracked-out bar text, a credit line and a barcode.
// There is NO flat title band any more. The canvas's own width/height
// decide the export size, so the same state renders identically at
// 1080x1080, 1080x1350 and 1920x1080.
import { panelsForLayout, photoAreaRect, titleZoneRect, bottomStripRect } from './layouts.js';
import { applyGrade, gradeStripGradient, gradeFor } from './grades.js';
import { drawCoverLettering } from './lettering.js';
import { drawStickers, drawBarcode } from './stickers.js';
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

/** Deterministic palm silhouettes along the bottom strip. */
export function drawPalmSilhouettes(ctx, x, y, w, h) {
  ctx.save();
  ctx.strokeStyle = 'rgba(6, 2, 10, 0.9)';
  ctx.fillStyle = 'rgba(6, 2, 10, 0.9)';
  let seed = 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const step = Math.max(34, w * 0.055);
  for (let px = x + step * 0.4; px < x + w; px += step) {
    const ph = h * (0.55 + rand() * 0.4);
    const topY = y + h - ph;
    ctx.lineWidth = Math.max(2, w * 0.002);
    ctx.beginPath();
    ctx.moveTo(px, y + h);
    ctx.quadraticCurveTo(px + w * 0.004, y + h - ph * 0.6, px + w * 0.002, topY);
    ctx.stroke();
    // Seven fronds fanning from the crown.
    for (let f = 0; f < 7; f++) {
      const a = Math.PI * (1.05 + (f / 6) * 0.9);
      const fl = ph * (0.5 + rand() * 0.2);
      ctx.lineWidth = Math.max(1.5, w * 0.0016);
      ctx.beginPath();
      ctx.moveTo(px + w * 0.002, topY);
      ctx.quadraticCurveTo(
        px + Math.cos(a) * fl * 0.6, topY + Math.sin(a) * fl * 0.5 - ph * 0.12,
        px + Math.cos(a) * fl, topY + Math.sin(a) * fl * 0.7 + ph * 0.18,
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}

/**
 * Draws one panel's storytelling caption chip. `zone` is the title zone
 * in canvas pixels. The chip sits at the panel's bottom-left — except
 * for a panel ending in the zone's upper third, where the centred
 * location label and quote chip live: a right-of-centre panel's chip
 * goes to its top-right (clear of the EST starburst on the seam), and
 * on narrow canvases (square/portrait) a left panel's chip goes to its
 * top-left, so it never hides under the quote chip. Skipped entirely
 * when the panel is too small to read.
 */
export function drawPanelCaption(ctx, rect, caption, zone) {
  if (!caption || !caption.place) return;
  if (rect.w < 150 || rect.h < 90) return;
  const place = caption.place.trim().toUpperCase();
  const time = (caption.time || '').trim();
  const flavor = (caption.flavor || '').trim().toUpperCase();
  if (!place) return;
  const narrow = rect.w < 260;
  const fs = Math.max(11, Math.min(rect.w * 0.052, 26));
  const fs2 = Math.max(10, fs * 0.72);
  ctx.save();
  ctx.font = `700 ${fs}px Oswald, sans-serif`;
  const line1 = place;
  const line2 = narrow ? `${time}` : `${time} — ${flavor}`;
  ctx.font = `600 ${fs2}px Oswald, sans-serif`;
  const w2 = line2.trim() ? ctx.measureText(line2).width : 0;
  ctx.font = `700 ${fs}px Oswald, sans-serif`;
  const w1 = ctx.measureText(line1).width;
  const padX = Math.max(8, fs * 0.55);
  const chipW = Math.max(w1, w2) + padX * 2;
  const chipH = line2.trim() ? fs * 1.15 + fs2 * 1.25 + fs * 0.5 : fs * 1.7;
  // Keep the chip inside its panel: bottom-left, unless the panel ends
  // under the centred location/quote lines (zone's upper third).
  const cw = Math.min(chipW, rect.w - 12);
  const titleTop = zone.y + zone.h * 0.34;
  const underLettering = rect.y + rect.h > zone.y && rect.y + rect.h < titleTop;
  const rightOfCentre = rect.x / Math.max(1, zone.w) >= 0.4;
  const narrowCanvas = (zone.w * 0.3) / Math.max(1, zone.h) < 1.3; // canvas aspect < 1.3
  let cx = rect.x + 7;
  let cy = rect.y + rect.h - chipH - 7;
  if (underLettering && rightOfCentre) {
    cx = rect.x + rect.w - cw - 7; // top-right: clear of the seam starburst
    cy = rect.y + 7;
  } else if (underLettering && narrowCanvas) {
    cy = rect.y + 7; // top-left on narrow canvases: clear of the quote chip
  }
  ctx.beginPath();
  ctx.roundRect(cx, cy, cw, chipH, Math.max(3, chipH * 0.12));
  ctx.fillStyle = 'rgba(6, 3, 10, 0.82)';
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${fs}px Oswald, sans-serif`;
  ctx.fillText(line1, cx + padX, cy + fs * 1.05);
  if (line2.trim()) {
    ctx.fillStyle = '#ffd23f';
    ctx.font = `600 ${fs2}px Oswald, sans-serif`;
    ctx.fillText(line2, cx + padX, cy + fs * 1.15 + fs2 * 1.1);
  }
  ctx.restore();
}

/** Draws the thin bottom strip: gradient, palms, bar text, credit, barcode. */
export function drawBottomStrip(ctx, strip, state) {
  const { x, y, w, h } = strip;
  ctx.save();
  ctx.fillStyle = gradeStripGradient(ctx, x, y, w, h, state.grade || 'sunset');
  ctx.fillRect(x, y, w, h);
  drawPalmSilhouettes(ctx, x, y, w, h);
  // Tracked-out caps bar text, centred, shrinking to fit.
  const barText = (state.barText || '').trim().toUpperCase();
  if (barText) {
    let bs = Math.max(11, h * 0.34);
    ctx.font = `600 ${bs}px Oswald, sans-serif`;
    let spaced = barText.split('').join('\u2009');
    while (bs > 9 && ctx.measureText(spaced).width > w * 0.78) {
      bs -= 1;
      ctx.font = `600 ${bs}px Oswald, sans-serif`;
      spaced = barText.split('').join('\u2009');
    }
    if (ctx.measureText(spaced).width > w * 0.78) spaced = barText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff3d6';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 3;
    ctx.fillText(spaced, x + w * 0.46, y + h * 0.36);
    ctx.shadowBlur = 0;
  }
  // Tiny credit line under the bar text.
  const credit = 'SOLMAR BAY — A SOLMAR BAY COVER STUDIO PICTURE · STARRING YOU · SHOT ON YOUR OWN CAMERA';
  let cs = Math.max(8, h * 0.16);
  ctx.font = `500 ${cs}px Oswald, sans-serif`;
  while (cs > 7 && ctx.measureText(credit).width > w * 0.78) {
    cs -= 0.5;
    ctx.font = `500 ${cs}px Oswald, sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255, 243, 214, 0.75)';
  ctx.fillText(credit, x + w * 0.46, y + h * 0.78);
  // Barcode at the right end.
  drawBarcode(ctx, x + w * 0.93, y + h * 0.2, w * 0.055, h * 0.6);
  ctx.restore();
}

/**
 * Draws the whole cover.
 * `state` is { photos, assignments, crops, captions, layout, grade, title,
 * tagline, location, quote, barText, stickers, selectedPanel }.
 * Returns the list of panel rectangles in canvas pixels (for hit-testing).
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const zoneF = titleZoneRect();
  const areaF = photoAreaRect();
  const stripF = bottomStripRect();
  const zone = { x: zoneF.x * w, y: zoneF.y * h, w: zoneF.w * w, h: zoneF.h * h };
  const area = { x: areaF.x * w, y: areaF.y * h, w: areaF.w * w, h: areaF.h * h };
  const strip = { x: stripF.x * w, y: stripF.y * h, w: stripF.w * w, h: stripF.h * h };
  const panels = panelsForLayout(state.layout || 'key-art');
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

  // Colour grade over the photo area.
  applyGrade(ctx, w, h, area.h, state.grade || 'sunset');

  // Soft dark scrim behind the title zone so the giant title stays legible
  // over any photo, fading out at the zone's top and bottom edges.
  const scrim = ctx.createLinearGradient(0, zone.y, 0, zone.y + zone.h);
  scrim.addColorStop(0, 'rgba(0,0,0,0)');
  scrim.addColorStop(0.3, 'rgba(0,0,0,0.34)');
  scrim.addColorStop(0.62, 'rgba(0,0,0,0.42)');
  scrim.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = scrim;
  ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

  // Per-panel caption chips (before the lettering, so the title wins any overlap).
  rects.forEach((rect, i) => drawPanelCaption(ctx, rect, state.captions?.[i], zone));

  drawCoverLettering(ctx, zone, {
    title: state.title,
    tagline: state.tagline,
    location: state.location,
    quote: state.quote || null,
    stars: state.stickers?.stars ? (state.stickers.starRating ?? 5) : 0,
    halftone: gradeFor(state.grade || 'sunset').halftone,
  });
  drawStickers(ctx, w, h, area.h, state.stickers);

  // Thin bottom strip last, over everything below the photos.
  drawBottomStrip(ctx, strip, state);

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
