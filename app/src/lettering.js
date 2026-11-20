// Key-art lettering: the giant title, the script tagline, the press-quote
// chip and the location label. The title is drawn on its own offscreen
// canvas — a dark offset copy for the 3D extrusion, a thick black stroke,
// then a fill of horizontal sunset bands (or a smooth gradient) — and the
// finished block is stamped onto the cover, so the band alignment never
// depends on where the title sits on the page.
'use strict';

// Fits a font size so `text` fits `maxWidth`: starts at `start` and shrinks
// until it fits or hits the floor. Returns the size in pixels.
function fitFontSize(ctx, text, maxWidth, start, family, weight) {
  let size = start;
  const floor = Math.max(8, start * 0.28);
  ctx.font = `${weight || 400} ${size}px ${family}`;
  while (size > floor && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `${weight || 400} ${size}px ${family}`;
  }
  return size;
}

// Splits a title into one or two lines: a single line when it fits at a
// readable size, otherwise the split at the space nearest the middle.
function splitTitle(title) {
  const words = String(title || '').trim().split(/\s+/);
  if (words.length <= 1) return [String(title || '').trim()];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ').length;
    const b = words.slice(i).join(' ').length;
    const d = Math.abs(a - b);
    if (d < bestDiff) { bestDiff = d; best = i; }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

// A canvas pattern of horizontal bands in the grade's colours, one band
// set per `height` pixels, so a title filled with it gets the striped
// sunset look the best posters share.
function stripePattern(ctx, grade, height) {
  const g = GRADES[grade] || GRADES.sunset;
  const band = document.createElement('canvas');
  band.width = 8;
  band.height = Math.max(8, Math.round(height));
  const b = band.getContext('2d');
  const n = g.bands.length;
  for (let i = 0; i < n; i++) {
    b.fillStyle = g.bands[i];
    b.fillRect(0, (i * band.height) / n, band.width, band.height / n + 1);
  }
  return ctx.createPattern(band, 'repeat');
}

// A smooth vertical gradient through the grade's band colours.
function bandGradient(ctx, grade, top, height) {
  const g = GRADES[grade] || GRADES.sunset;
  const grad = ctx.createLinearGradient(0, top, 0, top + height);
  g.bands.forEach((c, i) => grad.addColorStop(i / (g.bands.length - 1), c));
  return grad;
}

// Draws the title block and returns its metrics {top, bottom, fontSize} in
// cover pixels. `zone` is {x, y, w, h} in cover pixels; the title is
// centred in it. Two lines at most; the font shrinks until the longest
// line fits 94% of the cover width.
function drawTitle(ctx, state, W, zone) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const title = (state.title || '').toUpperCase();
  const maxW = W * 0.94;
  const oneLine = fitFontSize(ctx, title, maxW, zone.h * 0.52, 'Anton', 400);
  let lines = [title];
  let fontSize = oneLine;
  if (oneLine < zone.h * 0.30 && title.indexOf(' ') > 0) {
    lines = splitTitle(title);
    const longest = lines.reduce((a, b) => (a.length >= b.length ? a : b));
    fontSize = fitFontSize(ctx, longest, maxW, zone.h * 0.44, 'Anton', 400);
  }
  const lineH = fontSize * 1.04;
  const blockH = lineH * lines.length;
  const top = zone.y + (zone.h - blockH) / 2;

  // Offscreen block: offset copy, stroke, band fill, then one drawImage.
  const off = document.createElement('canvas');
  off.width = W;
  off.height = Math.ceil(blockH + fontSize * 0.14);
  const o = off.getContext('2d');
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  o.lineJoin = 'round';
  const ox = fontSize * 0.045;
  const oy = fontSize * 0.055;
  lines.forEach((line, i) => {
    const cy = lineH * (i + 0.5) + fontSize * 0.03;
    o.font = `400 ${fontSize}px Anton`;
    // 3D extrusion: the same letters, shifted down-right in deep purple.
    o.fillStyle = grade.offset;
    o.fillText(line, W / 2 + ox, cy + oy);
    // Thick black outline.
    o.strokeStyle = '#0d0208';
    o.lineWidth = Math.max(3, fontSize * 0.16);
    o.strokeText(line, W / 2, cy);
    // Band fill (stripes) or smooth gradient, by the title style.
    o.fillStyle = state.titleStyle === 'gradient'
      ? bandGradient(o, state.grade, cy - fontSize / 2, fontSize)
      : stripePattern(o, state.grade, fontSize);
    o.fillText(line, W / 2, cy);
  });
  // Two white sparkles at the title's ends, for the printed-poster glint.
  drawSparkle(o, W * 0.045, top - zone.y + fontSize * 0.32, fontSize * 0.10);
  drawSparkle(o, W * 0.955, top - zone.y + blockH - fontSize * 0.30, fontSize * 0.08);
  ctx.drawImage(off, 0, top - fontSize * 0.03);
  return { top, bottom: top + blockH, fontSize, lines };
}

// A four-point star sparkle at (x, y) with radius r.
function drawSparkle(ctx, x, y, r) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
  ctx.restore();
}

// Draws the script tagline overlapping the title's bottom edge, tilted a
// couple of degrees, in the grade's tagline colour with a dark outline.
function drawTagline(ctx, state, W, titleBottom, fontSize) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const tag = state.tagline || '';
  if (!tag) return titleBottom;
  const size = Math.max(14, fontSize * 0.34);
  ctx.save();
  ctx.translate(W / 2, titleBottom - size * 0.08);
  ctx.rotate(-0.035);
  ctx.font = `400 ${size}px Pacifico`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(20,0,20,0.85)';
  ctx.lineWidth = Math.max(2, size * 0.10);
  ctx.strokeText(tag, 0, 0);
  ctx.fillStyle = grade.tagline;
  ctx.fillText(tag, 0, 0);
  ctx.restore();
  return titleBottom + size * 0.72;
}

// Draws the press-quote chip centred above the title: gold stars, the
// quote in condensed caps, and its source. Returns the chip's top edge.
function drawQuoteChip(ctx, state, W, titleTop) {
  const stars = '★'.repeat(Math.max(1, Math.min(5, state.quoteStars || 5)));
  const quote = (state.quote || '').toUpperCase();
  const source = (state.source || '').toUpperCase();
  const size = Math.max(12, W * 0.017);
  ctx.font = `600 ${size}px Oswald`;
  const textW = ctx.measureText(` ${quote}  —  ${source}`).width;
  ctx.font = `${size}px Oswald`;
  const starsW = ctx.measureText(stars).width;
  const pad = size * 0.9;
  const chipW = Math.min(W * 0.92, starsW + textW + pad * 2 + size * 0.4);
  const chipH = size * 2.1;
  const x = (W - chipW) / 2;
  const y = titleTop - chipH - size * 0.55;
  roundRect(ctx, x, y, chipW, chipH, chipH / 2);
  ctx.fillStyle = 'rgba(10,4,18,0.88)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,209,102,0.55)';
  ctx.lineWidth = Math.max(1, W * 0.001);
  ctx.stroke();
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  let cx = x + pad;
  ctx.font = `${size}px Oswald`;
  ctx.fillStyle = '#ffd166';
  ctx.fillText(stars, cx, y + chipH / 2);
  cx += starsW + size * 0.4;
  ctx.font = `600 ${size}px Oswald`;
  ctx.fillStyle = '#fff7d6';
  ctx.fillText(quote, cx, y + chipH / 2);
  cx += ctx.measureText(quote).width + size * 0.5;
  ctx.font = `400 ${size * 0.85}px Oswald`;
  ctx.fillStyle = '#ffd166';
  ctx.fillText(`— ${source}`, cx, y + chipH / 2);
  return y;
}

// Draws the location label in tracked-out caps above the quote chip.
function drawLocationLabel(ctx, state, W, quoteTop) {
  const label = (state.location || '').toUpperCase();
  if (!label) return;
  const size = Math.max(11, W * 0.015);
  ctx.save();
  ctx.font = `600 ${size}px Oswald`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = `${size * 0.42}px`; } catch (e) { /* older canvas */ }
  ctx.fillStyle = '#fff7d6';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = size * 0.4;
  ctx.fillText(label, W / 2, quoteTop - size * 1.05);
  ctx.restore();
}

// A rounded-rectangle path (fill/stroke left to the caller).
function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}
