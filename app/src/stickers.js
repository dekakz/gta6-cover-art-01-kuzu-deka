// Stickers and badges for Solmar Bay Cover Studio (v2).
// Each sticker is a small canvas drawing the editor can toggle: a spiky
// EST. 2026 starburst (moved to the seam between the hero and the right
// panels), a diagonal ribbon whose text is measured and shrunk so it can
// never clip, a NEW circle badge, a COLLECTORS EDITION pill (bottom-right
// of the photo area, just above the strip), a five-star rating row, plus
// the v2 additions — a WANTED ★★★★★ pill (top-right), a VOL. chip
// (top-left) and a barcode helper for the bottom strip. Positions are
// fractions of the canvas so stickers scale with every export size.

/** Draws a spiky starburst badge with centred text lines. */
export function drawStarburst(ctx, cx, cy, r, lines, fill = '#ffd23f', ink = '#1a0b00') {
  const spikes = 14;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rr = i % 2 === 0 ? r : r * 0.78;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * rr;
    const py = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = r * 0.12;
  ctx.shadowOffsetY = r * 0.05;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.strokeStyle = ink;
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fs = r * 0.24;
  ctx.font = `700 ${fs}px Oswald, sans-serif`;
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, cy + (i - (lines.length - 1) / 2) * fs * 1.15);
  });
  ctx.restore();
}

/**
 * Draws a diagonal ribbon across the top-left corner. The text is
 * measured first and the font shrunk until the whole ribbon — band and
 * text — fits inside the canvas, so the text can never clip at the corner.
 */
export function drawRibbon(ctx, w, text) {
  const label = (text || 'SAME TROUBLE').toUpperCase();
  const bandH = Math.max(22, w * 0.032);
  let fs = bandH * 0.52;
  ctx.font = `700 ${fs}px Oswald, sans-serif`;
  while (fs > 9 && ctx.measureText(label).width > w * 0.3) {
    fs -= 1;
    ctx.font = `700 ${fs}px Oswald, sans-serif`;
  }
  const tw = ctx.measureText(label).width;
  const half = tw / 2 + Math.max(14, w * 0.012);
  // Centre far enough right that the rotated band's left corner stays on-canvas.
  const cx = Math.max(half * 0.95 + bandH * 0.6, w * 0.16);
  ctx.save();
  ctx.translate(cx, bandH * 0.95);
  ctx.rotate(-Math.PI / 5.6);
  ctx.fillStyle = '#ff2ea6';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
  ctx.fillRect(-half, -bandH / 2, half * 2, bandH);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${fs}px Oswald, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 0, 1);
  ctx.restore();
}

/** Draws a round NEW badge. */
export function drawNewBadge(ctx, cx, cy, r) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ff2ea6';
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = r * 0.15;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${r * 0.62}px Oswald, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NEW', cx, cy + 1);
  ctx.restore();
}

/**
 * Draws a COLLECTORS EDITION pill ending at `rightX`, top at `topY`.
 * `canvasW` scales the type so the pill reads at every export size.
 */
export function drawCollectorsPill(ctx, rightX, topY, text, canvasW) {
  const fs = Math.max(12, canvasW * 0.0135);
  ctx.save();
  ctx.font = `700 ${fs}px Oswald, sans-serif`;
  const pad = fs * 0.9;
  const tw = ctx.measureText(text).width;
  const h = fs * 2.1;
  ctx.fillStyle = '#ffd23f';
  ctx.strokeStyle = '#1a0b00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rightX - tw - pad * 2, topY, tw + pad * 2, h, h / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1a0b00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, rightX - tw / 2 - pad, topY + h / 2 + 1);
  ctx.restore();
}

/** Draws a row of five stars, `filled` of them gold, the rest outline. */
export function drawStarRow(ctx, cx, cy, size, filled) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px sans-serif`;
  const gap = size * 1.15;
  const startX = cx - ((5 - 1) * gap) / 2;
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < filled ? '#ffd23f' : 'rgba(255,255,255,0.35)';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 3;
    ctx.fillText('★', startX + i * gap, cy);
  }
  ctx.restore();
}

/** WANTED pill: black pill, gold text and stars, ending at `rightX`. */
export function drawWantedPill(ctx, rightX, topY, canvasW, rating) {
  const fs = Math.max(12, canvasW * 0.014);
  const stars = '★'.repeat(Math.max(0, Math.min(5, rating ?? 5)));
  const label = `WANTED ${stars}`;
  ctx.save();
  ctx.font = `700 ${fs}px Oswald, sans-serif`;
  const pad = fs * 0.9;
  const tw = ctx.measureText(label).width;
  const h = fs * 2.1;
  ctx.fillStyle = '#0d0208';
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = Math.max(1.5, fs * 0.08);
  ctx.beginPath();
  ctx.roundRect(rightX - tw - pad * 2, topY, tw + pad * 2, h, h / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffd23f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rightX - tw / 2 - pad, topY + h / 2 + 1);
  ctx.restore();
}

/** VOL. chip: small cyan chip, black text, slight tilt, ending at `rightX`. */
export function drawVolChip(ctx, rightX, y, canvasW, text) {
  const label = (text || 'VOL. 06').toUpperCase();
  const fs = Math.max(12, canvasW * 0.014);
  ctx.save();
  ctx.font = `700 ${fs}px Oswald, sans-serif`;
  const pad = fs * 0.9;
  const tw = ctx.measureText(label).width;
  const h = fs * 2.1;
  const w = tw + pad * 2;
  ctx.translate(rightX - w, y);
  ctx.rotate(-0.05);
  ctx.fillStyle = '#00e5ff';
  ctx.strokeStyle = '#062a33';
  ctx.lineWidth = Math.max(1.5, fs * 0.08);
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#062a33';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, w / 2, h / 2 + 1);
  ctx.restore();
}

/** Deterministic barcode: white bars of varied width inside (x, y, w, h). */
export function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  let seed = 987654;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  let bx = x;
  while (bx < x + w - 2) {
    const bw = 1 + rand() * (w * 0.045);
    if (rand() > 0.45) ctx.fillRect(bx, y, Math.max(1, bw * 0.6), h);
    bx += bw + w * 0.012;
  }
  ctx.restore();
}

/**
 * Paints every enabled sticker from `stickers` onto the cover.
 * `stickers` is { est, isNew, ribbon, ribbonText, collectors, stars,
 * starRating, wanted, vol }.
 */
export function drawStickers(ctx, w, h, photoH, stickers) {
  if (!stickers) return;
  // EST. starburst on the seam between the hero and the right panels.
  if (stickers.est) {
    drawStarburst(ctx, w * 0.68, photoH * 0.33, Math.max(26, w * 0.038), ['EST.', '2026']);
  }
  if (stickers.isNew) {
    drawNewBadge(ctx, w * 0.955, photoH * 0.22, Math.max(20, w * 0.028));
  }
  if (stickers.ribbon) {
    drawRibbon(ctx, w, stickers.ribbonText || 'SAME TROUBLE');
  }
  if (stickers.wanted) {
    drawWantedPill(ctx, w * 0.99, h * 0.015, w, stickers.starRating ?? 5);
  }
  if (stickers.vol) {
    // VOL. chip sits under the WANTED pill, right-aligned with it, so the
    // top-left corner stays clear for the ribbon and the hero caption.
    drawVolChip(ctx, w * 0.99, h * 0.075, w, stickers.vol);
  }
  if (stickers.collectors) {
    drawCollectorsPill(ctx, w * 0.985, photoH - Math.max(30, w * 0.024), 'COLLECTORS EDITION', w);
  }
  // The star rating itself lives in the press-quote line (cover.js passes
  // starRating to the lettering); there is no separate star row in v2,
  // so the toggle only gates the quote stars and nothing is painted here.
}
