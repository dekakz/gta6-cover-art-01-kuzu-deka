// Stickers and the bottom strip: the WANTED pill, the VOL. chip, the gold
// seal, the collector's pill, the optional diagonal ribbon, the palm
// silhouettes, the bar text, the credit line and the barcode. Every one of
// them is drawn, never pasted as an image, so they stay sharp at any size.
'use strict';

// The WANTED pill's rectangle, measured without drawing, so the panel
// chips can dodge it.
function measureWantedPill(ctx, state, W, photoH) {
  const stars = '★'.repeat(Math.max(1, Math.min(5, state.quoteStars || 5)));
  const text = `WANTED ${stars}`;
  const size = Math.max(12, W * 0.016);
  ctx.font = `600 ${size}px Oswald`;
  const tw = ctx.measureText(text).width;
  const pad = size * 0.9;
  const w = tw + pad * 2;
  const h = size * 2.0;
  return { x: W - w - W * 0.018, y: photoH * 0.022, w, h };
}

// The WANTED pill, top-right of the photo area, with the quote's stars.
function drawWantedPill(ctx, state, W, photoH) {
  const stars = '★'.repeat(Math.max(1, Math.min(5, state.quoteStars || 5)));
  const text = `WANTED ${stars}`;
  const size = Math.max(12, W * 0.016);
  const { x, y, w, h } = measureWantedPill(ctx, state, W, photoH);
  ctx.font = `600 ${size}px Oswald`;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.strokeStyle = '#0d0208';
  ctx.lineWidth = Math.max(1.5, W * 0.0012);
  ctx.stroke();
  ctx.fillStyle = '#160a1e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
  return { x, y, w, h };
}

// The VOL. chip, tucked under the WANTED pill.
function drawVolChip(ctx, state, W, below) {
  const text = (state.vol || '').toUpperCase();
  if (!text) return;
  const size = Math.max(11, W * 0.015);
  ctx.font = `600 ${size}px Oswald`;
  const tw = ctx.measureText(text).width;
  const pad = size * 0.8;
  const w = tw + pad * 2;
  const h = size * 1.9;
  const x = W - w - W * 0.018;
  const y = below.y + below.h + size * 0.5;
  roundRect(ctx, x, y, w, h, 4);
  ctx.fillStyle = '#7df9ff';
  ctx.fill();
  ctx.fillStyle = '#0a1030';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
}

// The gold seal: a starburst with two lines of text, centred on (cx, cy)
// — the caller picks a seam that is clear of chips and lettering, so it
// never covers a face, a photo's centre or a caption.
function drawGoldSeal(ctx, W, photoH, cx, cy) {
  const r = Math.max(26, W * 0.038);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const points = 14;
  for (let i = 0; i < points * 2; i++) {
    const ang = (i * Math.PI) / points - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.82;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd166';
  ctx.fill();
  ctx.strokeStyle = '#7a4d00';
  ctx.lineWidth = Math.max(1.5, W * 0.0015);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
  ctx.strokeStyle = '#7a4d00';
  ctx.lineWidth = Math.max(1, W * 0.001);
  ctx.stroke();
  ctx.fillStyle = '#160a1e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const size = Math.max(9, r * 0.24);
  ctx.font = `600 ${size}px Oswald`;
  ctx.fillText('ORIGINAL', 0, -size * 0.55);
  ctx.fillText('COVER ART', 0, size * 0.55);
  ctx.font = `${size * 0.9}px Oswald`;
  ctx.fillText('★ ★ ★', 0, size * 1.45);
  ctx.restore();
}

// The COLLECTOR'S EDITION pill, bottom-right just above the strip.
function drawCollectorsPill(ctx, W, photoH) {
  const text = "COLLECTOR'S EDITION";
  const size = Math.max(11, W * 0.014);
  ctx.font = `600 ${size}px Oswald`;
  const tw = ctx.measureText(text).width;
  const pad = size * 0.9;
  const w = tw + pad * 2;
  const h = size * 1.9;
  const x = W - w - W * 0.018;
  const y = photoH - h - photoH * 0.018;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = '#ff5da2';
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2 + 1);
}

// The optional diagonal ribbon across the top-left corner. The text is
// measured first and the font shrunk until the whole band fits on-canvas,
// so it can never clip the way a fixed-size ribbon does.
function drawRibbon(ctx, W, photoH, text) {
  const label = (text || 'COMING SOON').toUpperCase();
  const bandH = Math.max(20, photoH * 0.055);
  let size = bandH * 0.52;
  ctx.font = `400 ${size}px Bebas Neue`;
  const maxW = W * 0.42;
  while (size > 10 && ctx.measureText(label).width > maxW) {
    size -= 1;
    ctx.font = `400 ${size}px Bebas Neue`;
  }
  const tw = ctx.measureText(label).width;
  const bandW = tw + size * 2.4;
  ctx.save();
  ctx.translate(0, photoH * 0.10);
  ctx.rotate(-0.42);
  ctx.fillStyle = '#ff5e62';
  ctx.fillRect(-bandW * 0.25, -bandH / 2, bandW, bandH);
  ctx.strokeStyle = '#fff7d6';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-bandW * 0.25, -bandH / 2 + 3);
  ctx.lineTo(bandW * 0.75, -bandH / 2 + 3);
  ctx.moveTo(-bandW * 0.25, bandH / 2 - 3);
  ctx.lineTo(bandW * 0.75, bandH / 2 - 3);
  ctx.stroke();
  ctx.fillStyle = '#fff7d6';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bandW * 0.25, 1);
  ctx.restore();
}

// A palm silhouette at (x, baseline) with height h: a curved trunk and
// five drooping fronds, drawn in one colour.
function drawPalm(ctx, x, baseline, h, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1, h * 0.045);
  ctx.beginPath();
  ctx.moveTo(x, baseline);
  ctx.quadraticCurveTo(x + h * 0.08, baseline - h * 0.55, x + h * 0.02, baseline - h);
  ctx.stroke();
  const topX = x + h * 0.02;
  const topY = baseline - h;
  for (let i = 0; i < 5; i++) {
    const ang = Math.PI * (0.08 + i * 0.21);
    const len = h * (0.42 + (i % 2) * 0.08);
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(
      topX + Math.cos(ang) * len * 0.6, topY - Math.sin(ang) * len * 0.7,
      topX + Math.cos(ang) * len, topY - Math.sin(ang) * len * 0.35 + h * 0.22,
    );
    ctx.stroke();
  }
  ctx.restore();
}

// The bottom strip: grade gradient, palm silhouettes, the tracked-out bar
// text, the tiny credit line, and a barcode with a catalogue number.
function drawBottomStrip(ctx, state, W, H, photoH) {
  const stripH = H - photoH;
  const y = photoH;
  ctx.fillStyle = gradeStripGradient(ctx, state.grade, W, stripH);
  ctx.fillRect(0, y, W, stripH);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, y, W, Math.max(1, stripH * 0.06));
  // Palms along the strip, faint, so the text stays the star.
  const palmH = stripH * 0.85;
  for (let i = 0; i < 7; i++) {
    const px = W * (0.04 + i * 0.15) + (i % 2) * W * 0.02;
    drawPalm(ctx, px, y + stripH * 0.96, palmH, 'rgba(0,0,0,0.35)');
  }
  // Bar text, tracked out, centred.
  const bar = (state.barText || '').toUpperCase();
  const barSize = Math.max(10, stripH * 0.34);
  ctx.save();
  ctx.font = `600 ${barSize}px Oswald`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = `${barSize * 0.28}px`; } catch (e) { /* older canvas */ }
  ctx.fillStyle = '#fff7d6';
  ctx.fillText(bar, W / 2, y + stripH * 0.36);
  ctx.restore();
  // Credit line, tiny, centred under the bar text.
  const credit = (state.credit || '').toUpperCase();
  const crSize = Math.max(8, stripH * 0.17);
  ctx.save();
  ctx.font = `400 ${crSize}px Oswald`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = `${crSize * 0.18}px`; } catch (e) { /* older canvas */ }
  ctx.fillStyle = 'rgba(255,247,214,0.75)';
  ctx.fillText(credit, W / 2, y + stripH * 0.76);
  ctx.restore();
  drawBarcode(ctx, W, y, stripH);
}

// A deterministic barcode: bar widths from a fixed seed string, so the
// same cover always draws the same bars.
function drawBarcode(ctx, W, stripY, stripH) {
  const seed = 'SOLMARBAY06';
  let n = 0;
  for (const ch of seed) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  const bw = Math.max(26, W * 0.045);
  const bh = stripH * 0.52;
  const x0 = W - bw - W * 0.014;
  const y0 = stripY + stripH * 0.16;
  ctx.fillStyle = '#fff';
  ctx.fillRect(x0 - 3, y0 - 3, bw + 6, bh + 12);
  ctx.fillStyle = '#111';
  let x = x0;
  let s = n;
  while (x < x0 + bw - 2) {
    s = (s * 1103515245 + 12345) >>> 0;
    const wdt = 1 + (s % 3) * (W / 1600);
    const gap = 1 + ((s >> 4) % 3) * (W / 1600);
    if ((s >> 8) % 2 === 0) ctx.fillRect(x, y0, Math.max(1, wdt), bh);
    x += wdt + gap;
  }
  ctx.fillStyle = '#111';
  ctx.font = `${Math.max(7, stripH * 0.13)}px Oswald`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('0 62113 2026', x0 + bw / 2, y0 + bh + stripH * 0.10);
}
