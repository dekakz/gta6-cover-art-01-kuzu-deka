// cover.js — the cover renderer.
//
// Panels first, then lettering and stickers, then the story chips. The
// chips are the fussy part: every role tag and caption is measured first
// and placed where it cannot touch the title, the WANTED pill, the quote
// chip, the bottom strip, or any chip placed before it. A chip that fits
// nowhere is dropped rather than drawn over something else.

import { layoutById, panelRect, panelPath } from './layouts.js';
import { gradeById } from './grades.js';
import { drawTitle, drawTagline, drawQuoteChip, fitTitleSize } from './lettering.js';
import { drawWanted, drawVol, drawSeal, drawBottomStrip, drawPalm } from './stickers.js';
import { drawCoverPhoto, sampleById } from './photos.js';

const LABEL_FONT = '"Bebas Neue", "Arial Narrow", sans-serif';
const CHIP_FONT = 'Oswald, sans-serif';

function overlaps(a, b, pad) {
  if (!a || !b) return false;
  const p = pad || 0;
  return (
    a.x - p < b.x + b.w + p &&
    a.x + a.w + p > b.x - p &&
    a.y - p < b.y + b.h + p &&
    a.y + a.h + p > b.y - p
  );
}

function inside(inner, outer, tol) {
  const t = tol || 0;
  return (
    inner.x >= outer.x - t &&
    inner.y >= outer.y - t &&
    inner.x + inner.w <= outer.x + outer.w + t &&
    inner.y + inner.h <= outer.y + outer.h + t
  );
}

function wrapText(ctx, text, maxW) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width <= maxW || !line) {
      line = trial;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 2);
}

// Measure one panel's chip group (role tag over caption chip) without
// drawing it. Returns null when the panel has nothing to say.
function measureChipGroup(ctx, panelState, maxCaptionW, k) {
  const role = String(panelState.role || '').trim();
  const caption = String(panelState.caption || '').trim();
  if (!role && !caption) return null;

  let roleW = 0;
  let roleH = 0;
  if (role) {
    const px = Math.round(19 * k);
    ctx.font = `400 ${px}px ${LABEL_FONT}`;
    roleW = Math.round(ctx.measureText(role.toUpperCase()).width + 20 * k);
    roleH = Math.round(26 * k);
  }

  let captionLines = [];
  let captionW = 0;
  let captionH = 0;
  if (caption) {
    const px = Math.round(15 * k);
    ctx.font = `600 ${px}px ${CHIP_FONT}`;
    captionLines = wrapText(ctx, caption, maxCaptionW);
    captionW = Math.round(Math.max(...captionLines.map((l) => ctx.measureText(l).width)) + 20 * k);
    captionH = Math.round(captionLines.length * px * 1.3 + 12 * k);
  }

  const w = Math.max(roleW, captionW);
  const h = roleH + (caption ? 4 * k + captionH : 0);
  return { role, caption, captionLines, roleW, roleH, captionW, captionH, w, h };
}

function drawChipGroup(ctx, group, x, y, grade, k) {
  let cy = y;
  if (group.role) {
    ctx.save();
    ctx.fillStyle = grade.accent;
    ctx.beginPath();
    ctx.rect(x, cy, group.roleW, group.roleH);
    ctx.fill();
    ctx.fillStyle = grade.accentInk;
    ctx.font = `400 ${Math.round(19 * k)}px ${LABEL_FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(group.role.toUpperCase(), x + 10 * k, cy + group.roleH / 2 + 1);
    ctx.restore();
    cy += group.roleH + 4 * k;
  }
  if (group.caption) {
    const px = Math.round(15 * k);
    ctx.save();
    ctx.fillStyle = 'rgba(13, 10, 20, 0.88)';
    ctx.beginPath();
    ctx.rect(x, cy, group.captionW, group.captionH);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${px}px ${CHIP_FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    group.captionLines.forEach((line, i) => {
      ctx.fillText(line, x + 10 * k, cy + 6 * k + i * px * 1.3);
    });
    ctx.restore();
  }
}

// Render the whole cover for `state` onto ctx at W x H.
// resolvePhoto(panelState) returns the Image for a panel (sample or upload).
// opts.selected highlights one panel index for the editor.
// Returns a debug record of every placed rect, for QA.
export function renderCover(ctx, state, W, H, resolvePhoto, opts) {
  const o = opts || {};
  const k = Math.min(W, H) / 1080;
  const layout = layoutById(state.layoutId);
  const grade = gradeById(state.gradeId);
  const debug = { chips: [], skipped: [], seal: null, titleZone: null };

  ctx.save();
  ctx.fillStyle = '#0d0a14';
  ctx.fillRect(0, 0, W, H);

  // 1. Panels: photo, grade tint, dark gutter.
  layout.panels.forEach((panel, i) => {
    const rect = panelRect(panel, W, H);
    const panelState = state.panels[i] || {};
    // One-photo mode: every panel shows the first panel's photo.
    const photoState = state.onePhoto ? state.panels[0] || panelState : panelState;
    const sample = sampleById(photoState.photo);
    ctx.save();
    panelPath(ctx, rect);
    ctx.clip();
    const img = resolvePhoto ? resolvePhoto(photoState) : null;
    if (img) {
      drawCoverPhoto(
        ctx,
        img,
        rect.x,
        rect.y,
        rect.w,
        rect.h,
        photoState.zoom || 1,
        photoState.px == null ? sample.px : photoState.px,
        photoState.py == null ? sample.py : photoState.py,
      );
    } else {
      ctx.fillStyle = '#241a33';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.fillStyle = grade.tint;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  });
  ctx.lineWidth = Math.max(2, 3 * k);
  ctx.strokeStyle = '#0d0a14';
  layout.panels.forEach((panel) => {
    panelPath(ctx, panelRect(panel, W, H));
    ctx.stroke();
  });

  // Selected panel outline (editor only).
  if (o.selected != null && layout.panels[o.selected]) {
    ctx.save();
    ctx.lineWidth = Math.max(3, 5 * k);
    ctx.strokeStyle = grade.accent;
    panelPath(ctx, panelRect(layout.panels[o.selected], W, H));
    ctx.stroke();
    ctx.restore();
  }

  // 2. Top row: WANTED left, VOL right, quote chip between them.
  const wanted = drawWanted(ctx, W * 0.025, H * 0.022, k);
  const volPx = Math.round(18 * k);
  ctx.font = `400 ${volPx}px ${LABEL_FONT}`;
  const volW = Math.round(ctx.measureText('VOL. 01').width + 22 * k);
  const vol = drawVol(ctx, W * 0.975 - volW, H * 0.022, k);
  const qx0 = wanted.x + wanted.w + 12 * k;
  const qx1 = vol.x - 12 * k;
  const quote = drawQuoteChip(ctx, {
    quote: state.quote,
    source: state.quoteSource,
    cx: (qx0 + qx1) / 2,
    y: H * 0.022,
    maxW: Math.max(120, qx1 - qx0),
    k,
  });

  // 3. Title, centred on 44% height, tagline under it.
  const titleMaxW = W * 0.94;
  const titleStartPx = Math.round(W * 0.165);
  const { px: titlePx, lines } = fitTitleSize(ctx, state.title, titleMaxW, titleStartPx);
  const titleBlockH = lines.length * titlePx * 0.98;
  const titleTop = H * 0.44 - titleBlockH / 2;
  const titleDrawn = drawTitle(ctx, {
    text: state.title,
    cx: W / 2,
    y: titleTop,
    maxW: titleMaxW,
    startPx: titleStartPx,
    style: state.titleStyle || 'stripes',
    grade,
  });
  const tagline = drawTagline(ctx, {
    text: state.tagline,
    cx: W / 2,
    y: titleTop + titleBlockH + 6 * k,
    maxW: W * 0.8,
  });
  // Dodge blockers are the TIGHT rects of the title lines and the tagline,
  // not the full-width box: chips may sit beside a short title line or
  // beside the tagline, where no letter actually is.
  const pad = 6 * k;
  const titleRects = (titleDrawn.lineRects || []).map((r) => ({
    x: r.x - pad,
    y: r.y - pad,
    w: r.w + pad * 2,
    h: r.h + pad * 2,
  }));
  if (tagline) {
    titleRects.push({
      x: tagline.x - pad,
      y: tagline.y - pad,
      w: tagline.w + pad * 2,
      h: tagline.h + pad * 2,
    });
  }
  const titleZone = {
    x: W * 0.03,
    y: titleTop - 6 * k,
    w: W * 0.94,
    h: titleBlockH + 12 * k + (tagline ? tagline.h + 6 * k : 0),
  };
  debug.titleZone = titleZone;
  debug.titleLines = titleRects;

  // 4. Bottom strip (fixed) and corner palms (decoration, under chips).
  const strip = drawBottomStrip(ctx, W, H, k);
  const palmSize = H * 0.085;
  ctx.save();
  drawPalm(ctx, W * 0.02, H - strip.h - 4 * k, palmSize, 'rgba(13, 10, 20, 0.5)');
  ctx.translate(W, 0);
  ctx.scale(-1, 1);
  drawPalm(ctx, W * 0.02, H - strip.h - 4 * k, palmSize, 'rgba(13, 10, 20, 0.5)');
  ctx.restore();

  // 5. Story chips, dodge-aware.
  const blockers = [...titleRects, quote, wanted, vol, strip].filter(Boolean);
  const placed = [];
  const inset = 12 * k;
  layout.panels.forEach((panel, i) => {
    const panelState = state.panels[i] || {};
    const clean = { x: panel.x * W, y: panel.y * H, w: panel.w * W, h: panel.h * H };
    const group = measureChipGroup(ctx, panelState, Math.min(clean.w - inset * 2, W * 0.5), k);
    if (!group) return;
    const anchors = [
      { x: clean.x + inset, y: clean.y + clean.h - inset - group.h }, // bottom-left
      { x: clean.x + inset, y: clean.y + inset }, // top-left
      { x: clean.x + clean.w - inset - group.w, y: clean.y + clean.h - inset - group.h }, // bottom-right
      { x: clean.x + clean.w - inset - group.w, y: clean.y + inset }, // top-right
    ];
    let spot = null;
    for (const a of anchors) {
      const rect = { x: a.x, y: a.y, w: group.w, h: group.h };
      if (!inside(rect, clean, 2)) continue;
      if (blockers.some((b) => overlaps(rect, b, 3 * k))) continue;
      if (placed.some((p) => overlaps(rect, p, 3 * k))) continue;
      spot = rect;
      break;
    }
    // Nudge-up fallback: slide the bottom-left spot up until it clears.
    if (!spot) {
      for (let step = 1; step <= 6; step++) {
        const rect = {
          x: clean.x + inset,
          y: clean.y + clean.h - inset - group.h - step * (group.h + 8 * k),
          w: group.w,
          h: group.h,
        };
        if (!inside(rect, clean, 2)) break;
        if (blockers.some((b) => overlaps(rect, b, 3 * k))) continue;
        if (placed.some((p) => overlaps(rect, p, 3 * k))) continue;
        spot = rect;
        break;
      }
    }
    // Role-only fallback at the bottom-left corner.
    if (!spot && group.role) {
      const solo = { ...group, caption: '', captionLines: [], captionW: 0, captionH: 0, w: group.roleW, h: group.roleH };
      const rect = { x: clean.x + inset, y: clean.y + clean.h - inset - solo.h, w: solo.w, h: solo.h };
      if (
        inside(rect, clean, 2) &&
        !blockers.some((b) => overlaps(rect, b, 3 * k)) &&
        !placed.some((p) => overlaps(rect, p, 3 * k))
      ) {
        drawChipGroup(ctx, solo, rect.x, rect.y, grade, k);
        placed.push(rect);
        debug.chips.push({ panel: i, rect, anchor: 'bottom-left-role-only', role: group.role, caption: '' });
        return;
      }
    }
    if (!spot) {
      debug.skipped.push(i);
      return;
    }
    drawChipGroup(ctx, group, spot.x, spot.y, grade, k);
    placed.push(spot);
    debug.chips.push({ panel: i, rect: spot, role: group.role, caption: group.caption });
  });

  // 6. Gold seal: first candidate spot clear of everything. Bottom corners
  // first: faces sit high in a panel, so the bottom corners are the
  // safest places for a seal.
  const sealR = Math.max(26, H * 0.052);
  const sealSpots = [
    [0.14, 0.8],
    [0.86, 0.8],
    [0.14, 0.16],
    [0.86, 0.16],
    [0.5, 0.87],
  ];
  for (const [fx, fy] of sealSpots) {
    const rect = { x: fx * W - sealR, y: fy * H - sealR, w: sealR * 2, h: sealR * 2 };
    if (blockers.some((b) => overlaps(rect, b, 2 * k))) continue;
    if (placed.some((p) => overlaps(rect, p, 2 * k))) continue;
    debug.seal = drawSeal(ctx, fx * W, fy * H, sealR, grade);
    break;
  }

  ctx.restore();
  return debug;
}
