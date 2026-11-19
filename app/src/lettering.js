// Key-art lettering for Solmar Bay Cover Studio (v2).
// The title lives in a virtual title zone overlapping the photo seam —
// never in a flat band. It is set in Anton, auto-fitted to 0.94 of the
// canvas width, painted first as a dark-purple offset copy (3D extrusion),
// then with a thick black stroke and a warm white→gold→orange→pink
// gradient fill. The Pacifico tagline overlaps the title's bottom edge,
// the press quote (gold stars + quote + source) sits on a black chip just
// above the title, and the location label floats above the quote.

/** Largest Anton size (px) that fits `text` inside `maxWidth`. */
export function fitTitleSize(ctx, text, maxWidth, startSize) {
  let size = startSize;
  ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  while (size > 16 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  }
  return size;
}

/** Largest Oswald size (px) that fits `text` inside `maxWidth`. */
export function fitTextSize(ctx, text, maxWidth, startSize, weight = 600) {
  let size = startSize;
  ctx.font = `${weight} ${size}px Oswald, sans-serif`;
  while (size > 9 && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `${weight} ${size}px Oswald, sans-serif`;
  }
  return size;
}

/** Gradient fill for the title: white-gold at the top, hot pink at the foot. */
export function titleGradient(ctx, y, height) {
  const g = ctx.createLinearGradient(0, y, 0, y + height);
  g.addColorStop(0, '#fff7cc');
  g.addColorStop(0.35, '#ffd23f');
  g.addColorStop(0.7, '#ff7a3c');
  g.addColorStop(1, '#ff2ea6');
  return g;
}

/**
 * Paints the key-art title zone: location label, press-quote chip, the
 * giant title with its purple 3D offset, and the script tagline overlapping
 * the title's bottom edge.
 * `zone` is {x, y, w, h} in canvas pixels (titleZoneRect). `opts` carries
 * title, tagline, location, quote {text, source}, stars (0-5) and halftone.
 */
export function drawCoverLettering(ctx, zone, opts) {
  const { w, h, x, y } = zone;
  const cx = x + w / 2;
  const title = (opts.title || 'SOLMAR BAY').trim().toUpperCase();
  const location = (opts.location || '').trim().toUpperCase();
  const tagline = (opts.tagline || '').trim();
  const quote = opts.quote || null;
  const stars = Math.max(0, Math.min(5, opts.stars ?? 5));

  // Location label: small tracked-out caps with a star on each side.
  if (location) {
    const ls = Math.max(13, h * 0.062);
    ctx.font = `600 ${ls}px Oswald, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fff8e7';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = ls * 0.25;
    ctx.fillText(`★  ${location}  ★`, cx, y + h * 0.1);
    ctx.shadowBlur = 0;
  }

  // Press-quote chip: gold stars + quote + source on a black pill.
  if (quote && quote.text) {
    const qText = quote.text.trim().toUpperCase();
    const src = (quote.source || '').trim().toUpperCase();
    const starStr = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    let qs = Math.max(12, h * 0.056);
    const full = `${starStr}  “${qText}”${src ? ` — ${src}` : ''}`;
    qs = fitTextSize(ctx, full, w * 0.92, qs, 600);
    ctx.font = `600 ${qs}px Oswald, sans-serif`;
    const tw = ctx.measureText(full).width;
    const chipH = qs * 1.9;
    const chipW = tw + qs * 1.6;
    const chipX = cx - chipW / 2;
    const chipY = y + h * 0.14;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(chipX, chipY, chipW, chipH, chipH / 2);
    ctx.fillStyle = 'rgba(6, 3, 10, 0.85)';
    ctx.fill();
    ctx.lineWidth = Math.max(1, qs * 0.06);
    ctx.strokeStyle = 'rgba(255, 210, 63, 0.4)';
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Stars gold, quote cream, source gold — drawn as one measured line
    // in three runs so the colours can differ without re-measuring.
    const starW = ctx.measureText(`${starStr}  `).width;
    const quoteW = ctx.measureText(`“${qText}”`).width;
    let tx = cx - tw / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd23f';
    ctx.fillText(`${starStr}  `, tx, chipY + chipH / 2 + 1);
    tx += starW;
    ctx.fillStyle = '#fff8e7';
    ctx.fillText(`“${qText}”`, tx, chipY + chipH / 2 + 1);
    tx += quoteW;
    if (src) {
      ctx.fillStyle = '#ffd23f';
      ctx.fillText(` — ${src}`, tx, chipY + chipH / 2 + 1);
    }
    ctx.restore();
  }

  // Giant title: purple 3D offset copy, then black stroke + gradient fill.
  let titleTop = y + h * 0.34;
  let titleSize = 0;
  if (title) {
    titleTop = y + h * 0.34;
    titleSize = fitTitleSize(ctx, title, w * 0.94, h * 0.52);
    ctx.font = `${titleSize}px Anton, 'Arial Narrow', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';
    const dx = titleSize * 0.045;
    const dy = titleSize * 0.06;
    ctx.fillStyle = '#4c1d95';
    ctx.fillText(title, cx + dx, titleTop + dy);
    ctx.fillStyle = '#2a0a4a';
    ctx.fillText(title, cx + dx * 0.5, titleTop + dy * 0.5);
    ctx.strokeStyle = '#14060a';
    ctx.lineWidth = Math.max(3, titleSize * 0.1);
    ctx.strokeText(title, cx, titleTop);
    ctx.fillStyle = titleGradient(ctx, titleTop, titleSize);
    ctx.fillText(title, cx, titleTop);
    // Optional halftone dots, clipped to the title's own box.
    if (opts.halftone) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, titleTop, w, titleSize * 1.1);
      ctx.clip();
      ctx.globalCompositeOperation = 'source-atop';
      const gap = Math.max(6, titleSize / 14);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      for (let yy = titleTop; yy < titleTop + titleSize; yy += gap) {
        for (let xx = x; xx < x + w; xx += gap) {
          ctx.beginPath();
          ctx.arc(xx, yy, gap * 0.16, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  // Script tagline in hot pink, overlapping the title's bottom edge.
  if (tagline && titleSize > 0) {
    const ts = Math.max(16, h * 0.15);
    ctx.font = `${ts}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(20, 4, 16, 0.85)';
    ctx.lineWidth = Math.max(2, ts * 0.12);
    const ty = titleTop + titleSize * 0.94;
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = ts * 0.22;
    ctx.shadowOffsetY = ts * 0.06;
    ctx.strokeText(tagline, cx, ty);
    ctx.fillStyle = '#ff2ea6';
    ctx.fillText(tagline, cx, ty);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
}
