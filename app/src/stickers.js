// stickers.js — the cover's stickers: WANTED pill, VOL chip, gold seal,
// barcode and the bottom credit strip, plus a palm silhouette drawn in
// the corners. All of it is drawn on canvas, so exports match the preview.

import { roundRect } from './lettering.js';

const LABEL_FONT = '"Bebas Neue", "Arial Narrow", sans-serif';
const CHIP_FONT = 'Oswald, sans-serif';

// --- WANTED pill ---------------------------------------------------------
export function measureWanted(ctx, k) {
  const px = Math.round(22 * k);
  ctx.font = `400 ${px}px ${LABEL_FONT}`;
  const textW = ctx.measureText('WANTED').width;
  const h = Math.round(34 * k);
  const w = Math.round(textW + 30 * k);
  return { w, h, px };
}

export function drawWanted(ctx, x, y, k) {
  const { w, h, px } = measureWanted(ctx, k);
  ctx.save();
  ctx.fillStyle = '#d90429';
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, 2 * k);
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `400 ${px}px ${LABEL_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★ WANTED ★', x + w / 2, y + h / 2 + 1);
  ctx.restore();
  return { x, y, w, h };
}

// --- VOL chip ------------------------------------------------------------
export function drawVol(ctx, x, y, k) {
  const px = Math.round(18 * k);
  ctx.font = `400 ${px}px ${LABEL_FONT}`;
  const label = 'VOL. 01';
  const w = Math.round(ctx.measureText(label).width + 22 * k);
  const h = Math.round(30 * k);
  ctx.save();
  ctx.fillStyle = 'rgba(13, 10, 20, 0.85)';
  roundRect(ctx, x, y, w, h, 5 * k);
  ctx.fill();
  ctx.lineWidth = Math.max(1, 1.5 * k);
  ctx.strokeStyle = '#f5b90d';
  ctx.stroke();
  ctx.fillStyle = '#f5b90d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  ctx.restore();
  return { x, y, w, h };
}

// --- Gold seal -----------------------------------------------------------
export function drawSeal(ctx, cx, cy, r, grade) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.21);
  ctx.fillStyle = grade.seal;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.05);
  ctx.strokeStyle = '#7a5b00';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#241300';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `400 ${r * 0.3}px ${LABEL_FONT}`;
  ctx.fillText('ORIGINAL', 0, -r * 0.26);
  ctx.fillText('COVER ART', 0, r * 0.05);
  ctx.font = `${r * 0.34}px sans-serif`;
  ctx.fillText('★', 0, r * 0.38);
  ctx.restore();
  return { x: cx - r, y: cy - r, w: r * 2, h: r * 2 };
}

// --- Barcode -------------------------------------------------------------
// A fixed bar pattern (not a real barcode), drawn from a seed string so
// every export of the same cover is identical.
export function drawBarcode(ctx, x, y, w, h) {
  const seed = '8901234567890';
  let code = 0;
  for (const ch of seed) code = (code * 31 + ch.charCodeAt(0)) >>> 0;
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111111';
  let bx = x + 4;
  const top = y + 4;
  const barH = h - 16;
  let n = code;
  while (bx < x + w - 6) {
    n = (n * 1103515245 + 12345) >>> 0;
    const bw = 1 + (n % 3);
    if (n % 5 < 3) ctx.fillRect(bx, top, bw, barH);
    bx += bw + 1 + (n % 2);
  }
  ctx.font = `400 ${Math.max(8, h * 0.16)}px ${CHIP_FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('8 901234 567890', x + w / 2, y + h - 2);
  ctx.restore();
  return { x, y, w, h };
}

// --- Bottom strip --------------------------------------------------------
export function drawBottomStrip(ctx, W, H, k) {
  const h = Math.max(30, Math.round(H * 0.052));
  const y = H - h;
  ctx.save();
  ctx.fillStyle = '#0d0a14';
  ctx.fillRect(0, y, W, h);
  ctx.fillStyle = '#f5b90d';
  ctx.fillRect(0, y, W, Math.max(2, 3 * k));
  const px = Math.round(15 * k);
  ctx.font = `400 ${px}px ${LABEL_FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('SOLMAR BAY  •  A LEONIDA STORY', 14 * k, y + h / 2 + 1);
  const creditPx = Math.round(11 * k);
  ctx.font = `400 ${creditPx}px ${CHIP_FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  const credit = '© 2026 SOLMAR BAY STUDIO — ALL PHOTOS AI-GENERATED';
  const cw = ctx.measureText(credit).width;
  const bw = Math.round(120 * k);
  ctx.fillText(credit, W - bw - cw - 20 * k, y + h / 2 + 1);
  drawBarcode(ctx, W - bw - 8 * k, y + 5 * k, bw, h - 10 * k);
  ctx.restore();
  return { x: 0, y, w: W, h };
}

// --- Palm silhouette -----------------------------------------------------
export function drawPalm(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.06);
  ctx.lineCap = 'round';
  // Trunk: a gentle curve.
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + s * 0.08, y - s * 0.55, x + s * 0.16, y - s * 0.95);
  ctx.stroke();
  // Fronds: five arcs fanning from the crown.
  const cx = x + s * 0.16;
  const cy = y - s * 0.95;
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.95 + i * 0.22);
    const ex = cx + Math.cos(a) * s * 0.55;
    const ey = cy + Math.sin(a) * s * 0.32 + s * 0.22;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(
      cx + Math.cos(a) * s * 0.3,
      cy + Math.sin(a) * s * 0.18 - s * 0.12,
      ex,
      ey,
    );
    ctx.stroke();
  }
  ctx.restore();
}
