// lettering.js — the giant striped title, the script tagline and the
// press-quote chip. All lettering is drawn on canvas so the exported PNG
// looks exactly like the preview.

import { gradeGradient, gradeStripePattern } from './grades.js';

const TITLE_FONT = 'Anton, "Arial Black", sans-serif';
const TAGLINE_FONT = 'Pacifico, cursive';
const CHIP_FONT = 'Oswald, sans-serif';
const LABEL_FONT = '"Bebas Neue", "Arial Narrow", sans-serif';

// Split a title into one or two balanced lines that fit maxW at size px.
export function fitTitleLines(ctx, text, maxW, px) {
  const words = String(text || 'SOLMAR BAY').trim().split(/\s+/);
  ctx.font = `400 ${px}px ${TITLE_FONT}`;
  const single = words.join(' ');
  if (ctx.measureText(single).width <= maxW || words.length === 1) return [single];
  // Two lines: put the break where the two halves are closest in width.
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = ctx.measureText(words.slice(0, i).join(' ')).width;
    const b = ctx.measureText(words.slice(i).join(' ')).width;
    const diff = Math.abs(a - b);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

// The largest title size (px) whose lines fit maxW, starting from startPx.
export function fitTitleSize(ctx, text, maxW, startPx) {
  let px = startPx;
  while (px > 24) {
    const lines = fitTitleLines(ctx, text, maxW, px);
    ctx.font = `400 ${px}px ${TITLE_FONT}`;
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
    if (widest <= maxW) return { px, lines };
    px -= 4;
  }
  return { px, lines: fitTitleLines(ctx, text, maxW, px) };
}

// Draw the title centred on cx, its top at y. Returns the title's rect.
// style is 'stripes' (sunset bands) or 'gradient' (smooth blend). A purple
// offset copy behind it gives the 3D depth, and a thick black outline
// keeps the letters readable over any photo.
export function drawTitle(ctx, { text, cx, y, maxW, startPx, style, grade }) {
  const { px, lines } = fitTitleSize(ctx, text, maxW, startPx);
  const lineH = px * 0.98;
  const blockH = lines.length * lineH;
  const outline = Math.max(3, px * 0.085);
  const depth = Math.max(3, px * 0.055);

  let fill;
  if (style === 'gradient') {
    fill = gradeGradient(ctx, grade.bands, cx - maxW / 2, y, maxW, blockH);
  } else {
    fill = gradeStripePattern(ctx, grade.bands, blockH / grade.bands.length);
    // Align the pattern so the first band starts exactly at the title's top.
    if (fill && typeof fill.setTransform === 'function') {
      fill.setTransform(new DOMMatrix().translate(0, y % blockH));
    }
  }

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  const lineRects = [];
  lines.forEach((line, i) => {
    const ly = y + i * lineH;
    const lw = ctx.measureText(line).width;
    lineRects.push({ x: cx - lw / 2, y: ly, w: lw, h: lineH });
    // 3D offset copy, purple.
    ctx.font = `400 ${px}px ${TITLE_FONT}`;
    ctx.fillStyle = '#4b1d7a';
    ctx.fillText(line, cx + depth, ly + depth);
    // Black outline, then the striped / gradient fill.
    ctx.lineWidth = outline;
    ctx.strokeStyle = '#0d0a14';
    ctx.strokeText(line, cx, ly);
    ctx.fillStyle = fill;
    ctx.fillText(line, cx, ly);
  });
  ctx.restore();
  return { x: cx - maxW / 2, y, w: maxW, h: blockH, px, lines, lineRects };
}

// The script tagline under the title, slightly tilted, white with a dark
// outline. Returns its rect.
export function drawTagline(ctx, { text, cx, y, maxW }) {
  const clean = String(text || '').trim();
  if (!clean) return null;
  let px = Math.round(maxW * 0.052);
  ctx.font = `400 ${px}px ${TAGLINE_FONT}`;
  while (px > 14 && ctx.measureText(clean).width > maxW) {
    px -= 2;
    ctx.font = `400 ${px}px ${TAGLINE_FONT}`;
  }
  const w = ctx.measureText(clean).width;
  const h = px * 1.4;
  ctx.save();
  ctx.translate(cx, y + h / 2);
  ctx.rotate(-0.03);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, px * 0.12);
  ctx.strokeStyle = 'rgba(13, 10, 20, 0.9)';
  ctx.strokeText(clean, 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(clean, 0, 0);
  ctx.restore();
  return { x: cx - w / 2, y, w, h };
}

// The press-quote chip: five gold stars, the quote, and its source.
// maxW caps the chip; the quote wraps to at most two lines. Returns the
// chip's rect, or null when there is no quote text.
export function drawQuoteChip(ctx, { quote, source, cx, y, maxW, k }) {
  const text = String(quote || '').trim();
  if (!text) return null;
  const padX = 16 * k;
  const padY = 9 * k;
  const starPx = Math.round(15 * k);
  const quotePx = Math.round(17 * k);
  const sourcePx = Math.round(13 * k);
  const innerW = maxW - padX * 2;

  ctx.font = `600 ${quotePx}px ${CHIP_FONT}`;
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width <= innerW || !line) {
      line = trial;
    } else {
      lines.push(line);
      line = word;
    }
    if (lines.length === 2) break;
  }
  if (line) lines.push(line);
  if (lines.length > 2) {
    lines.length = 2;
    lines[1] = `${lines[1].replace(/\s+\S*$/, '')}…`;
  }
  const textW = Math.max(...lines.map((l) => ctx.measureText(l).width));
  const src = String(source || '').trim();
  ctx.font = `400 ${sourcePx}px ${LABEL_FONT}`;
  const srcW = src ? ctx.measureText(`— ${src}`).width : 0;
  const w = Math.min(maxW, Math.max(textW, srcW) + padX * 2);
  const h = padY * 2 + starPx + 4 * k + lines.length * quotePx * 1.25 + (src ? sourcePx * 1.5 : 0);

  const x = cx - w / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(13, 10, 20, 0.88)';
  roundRect(ctx, x, y, w, h, 8 * k);
  ctx.fill();
  ctx.lineWidth = Math.max(1, 1.5 * k);
  ctx.strokeStyle = 'rgba(245, 185, 13, 0.85)';
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  // Stars.
  ctx.fillStyle = '#f5b90d';
  ctx.font = `${starPx}px sans-serif`;
  ctx.fillText('★★★★★', cx, y + padY);
  // Quote lines.
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${quotePx}px ${CHIP_FONT}`;
  lines.forEach((l, i) => {
    ctx.fillText(`“${l}”`, cx, y + padY + starPx + 4 * k + i * quotePx * 1.25);
  });
  // Source.
  if (src) {
    ctx.fillStyle = '#f5b90d';
    ctx.font = `400 ${sourcePx}px ${LABEL_FONT}`;
    ctx.fillText(`— ${src}`, cx, y + padY + starPx + 4 * k + lines.length * quotePx * 1.25 + 2 * k);
  }
  ctx.restore();
  return { x, y, w, h };
}

export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
