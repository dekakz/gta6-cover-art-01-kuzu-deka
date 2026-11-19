// Bold caption lettering for Solmar Bay Cover Studio.
// The title is set in Anton (a condensed display face shipped under
// app/fonts/), auto-fitted to the band width, filled with a warm gradient,
// stroked in black and drop-shadowed — the poster-title look. The tagline
// is Pacifico script, the location label and tagline bar are Oswald caps.
// drawCoverLettering paints everything that sits in the title band.

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

/** Gradient fill for the title: gold at the top, hot pink at the foot. */
export function titleGradient(ctx, y, height) {
  const g = ctx.createLinearGradient(0, y, 0, y + height);
  g.addColorStop(0, '#fff7cc');
  g.addColorStop(0.35, '#ffd23f');
  g.addColorStop(0.7, '#ff7a3c');
  g.addColorStop(1, '#ff2ea6');
  return g;
}

/**
 * Paints the title band: location label with stars, the big title,
 * the script tagline, and the tagline bar along the foot.
 * `band` is {x, y, w, h} in canvas pixels. `opts` carries the caption
 * strings, the star rating and whether the title gets halftone dots.
 */
export function drawCoverLettering(ctx, band, opts) {
  const { w, h, x, y } = band;
  const cx = x + w / 2;
  const title = (opts.title || 'SOLMAR BAY').trim().toUpperCase();
  const location = (opts.location || '').trim().toUpperCase();
  const tagline = (opts.tagline || '').trim();
  const barText = (opts.barText || '').trim().toUpperCase();

  // Location label: small tracked-out caps with a star on each side.
  if (location) {
    const ls = Math.max(14, h * 0.085);
    ctx.font = `600 ${ls}px Oswald, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fff8e7';
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = ls * 0.25;
    const label = `★  ${location}  ★`;
    ctx.fillText(label, cx, y + h * 0.13);
    ctx.shadowBlur = 0;
  }

  // Big title, auto-fitted, gradient fill, black outline, drop shadow.
  if (title) {
    const titleY = y + h * 0.22;
    const titleH = h * 0.38;
    const size = fitTitleSize(ctx, title, w * 0.94, titleH);
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = size * 0.08;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeStyle = '#14060a';
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.strokeText(title, cx, titleY);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = titleGradient(ctx, titleY, size);
    ctx.fillText(title, cx, titleY);
    // Optional halftone dots clipped to the title letters.
    if (opts.halftone) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      const gap = Math.max(6, size / 14);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      for (let yy = titleY; yy < titleY + size; yy += gap) {
        for (let xx = x; xx < x + w; xx += gap) {
          ctx.beginPath();
          ctx.arc(xx, yy, gap * 0.16, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  // Script tagline under the title.
  if (tagline) {
    const ts = Math.max(16, h * 0.15);
    ctx.font = `${ts}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffe9f6';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = ts * 0.2;
    ctx.fillText(tagline, cx, y + h * 0.74);
    ctx.shadowBlur = 0;
  }

  // Tagline bar: a dark strip along the foot with tracked-out caps.
  if (barText) {
    const barH = h * 0.16;
    const barY = y + h - barH;
    ctx.fillStyle = 'rgba(10, 4, 12, 0.72)';
    ctx.fillRect(x, barY, w, barH);
    const bs = Math.max(11, barH * 0.42);
    ctx.font = `600 ${bs}px Oswald, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff3d6';
    let spaced = barText.split('').join('\u2009');
    while (ctx.measureText(spaced).width > w * 0.92 && bs > 8) {
      spaced = barText;
      break;
    }
    ctx.fillText(spaced, cx, barY + barH / 2 + 1);
  }
}
