// Stickers and badges for Solmar Bay Cover Studio.
// Each sticker is a small canvas drawing the editor can toggle and move:
// a spiky EST. 2026 starburst, a diagonal ribbon, a NEW circle badge, a
// COLLECTORS EDITION pill, and a five-star rating row. Positions are given
// as fractions of the canvas so stickers scale with every export size.

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

/** Draws a diagonal ribbon across the top-left corner of the cover. */
export function drawRibbon(ctx, w, text) {
  const bandH = Math.max(22, w * 0.032);
  ctx.save();
  ctx.translate(w * 0.11, bandH * 0.6);
  ctx.rotate(-Math.PI / 5.2);
  ctx.fillStyle = '#ff2ea6';
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
  ctx.fillRect(-w * 0.24, -bandH / 2, w * 0.48, bandH);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${bandH * 0.52}px Oswald, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), 0, 1);
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

/** Draws a COLLECTORS EDITION pill in a corner of the photo area. */
export function drawCollectorsPill(ctx, x, y, text) {
  ctx.save();
  ctx.font = `700 ${Math.max(12, y * 0.02 + 12)}px Oswald, sans-serif`;
  const pad = 14;
  const tw = ctx.measureText(text).width;
  const h = 30;
  ctx.fillStyle = '#ffd23f';
  ctx.strokeStyle = '#1a0b00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - tw - pad * 2, y, tw + pad * 2, h, h / 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#1a0b00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x - tw / 2 - pad, y + h / 2 + 1);
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

/**
 * Paints every enabled sticker from `stickers` onto the cover.
 * `stickers` is { est, isNew, ribbon, ribbonText, collectors, stars, starRating }.
 */
export function drawStickers(ctx, w, h, photoH, stickers) {
  if (!stickers) return;
  if (stickers.est) {
    drawStarburst(ctx, w * 0.66, photoH * 0.52, Math.max(26, w * 0.038), ['EST.', '2026']);
  }
  if (stickers.isNew) {
    drawNewBadge(ctx, w * 0.95, photoH * 0.09, Math.max(20, w * 0.028));
  }
  if (stickers.ribbon) {
    drawRibbon(ctx, w, stickers.ribbonText || 'SAME TROUBLE');
  }
  if (stickers.collectors) {
    drawCollectorsPill(ctx, w * 0.985, photoH * 0.86, 'COLLECTORS EDITION');
  }
  if (stickers.stars) {
    drawStarRow(ctx, w * 0.88, photoH + h * 0.11, Math.max(16, w * 0.022), stickers.starRating ?? 4);
  }
}
