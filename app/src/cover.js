// The full cover renderer: photos, grade, seams, role tags, story
// captions, scrim, lettering, stickers and the bottom strip, drawn onto
// any canvas at any size. The photo area is the top 93% of the canvas;
// the bottom 7% is the strip. Nothing is drawn outside the canvas, text
// is measured before it is placed, and every photo is clipped to its
// panel, so a photo can never bleed into its neighbour.
'use strict';

const PHOTO_AREA = 0.93;

// Renders the whole cover for `state` onto `ctx` at W x H pixels.
function renderCover(ctx, state, W, H) {
  const photoH = H * PHOTO_AREA;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#160a1e';
  ctx.fillRect(0, 0, W, H);

  const panels = layoutPanels(state.layout, W, photoH);
  const grade = GRADES[state.grade] || GRADES.sunset;

  // --- Photos, one per panel, clipped to its polygon. ---
  panels.forEach((panel, i) => {
    const slot = state.panels[Math.min(i, state.panels.length - 1)];
    const src = state.onePhoto ? state.panels[0].src : slot.src;
    ctx.save();
    tracePanel(ctx, panel);
    ctx.clip();
    drawPanelPhoto(ctx, src, panel, slot);
    ctx.restore();
  });

  // --- Grade tint, warm foot gradient and vignette over the photos. ---
  ctx.save();
  ctx.fillStyle = grade.tint;
  ctx.fillRect(0, 0, W, photoH);
  const foot = ctx.createLinearGradient(0, photoH * 0.55, 0, photoH);
  foot.addColorStop(0, 'rgba(255,90,40,0)');
  foot.addColorStop(1, 'rgba(255,90,40,0.12)');
  ctx.fillStyle = foot;
  ctx.fillRect(0, photoH * 0.55, W, photoH * 0.45);
  const vig = ctx.createRadialGradient(W / 2, photoH / 2, Math.min(W, photoH) * 0.42, W / 2, photoH / 2, Math.max(W, photoH) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.20)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, photoH);
  ctx.restore();

  // --- Panel seams and the outer frame. ---
  ctx.save();
  ctx.strokeStyle = '#0d0208';
  ctx.lineWidth = Math.max(2, W * 0.0025);
  panels.forEach((panel) => {
    tracePanel(ctx, panel);
    ctx.stroke();
  });
  ctx.lineWidth = Math.max(3, W * 0.0035);
  ctx.strokeRect(0, 0, W, photoH);
  ctx.restore();

  // --- Scrim behind the title zone, so the letters stay legible over
  // any photo, however bright. It goes down before the chips, so the
  // chips stay bright on top of it. ---
  const zone = { x: 0, y: photoH * 0.50, w: W, h: photoH * 0.36 };
  drawTitleScrim(ctx, grade, W, photoH);

  // --- Role tags and story captions. ---
  const pillRect = state.wanted ? measureWantedPill(ctx, state, W, photoH) : null;
  const titleZoneRect = { x: W * 0.03, y: photoH * 0.50, w: W * 0.94, h: photoH * 0.36 };
  const chipRects = [];
  panels.forEach((panel, i) => {
    const slot = state.panels[Math.min(i, state.panels.length - 1)];
    if (state.layout !== 'single') {
      const rects = drawPanelChips(ctx, panel, slot, grade, photoH, pillRect, titleZoneRect);
      if (rects.role) chipRects.push(rects.role);
      if (rects.cap) chipRects.push(rects.cap);
    } else {
      const rect = drawRoleTagOnly(ctx, panel, slot, grade);
      if (rect) chipRects.push(rect);
    }
  });

  // --- Lettering. ---
  const title = drawTitle(ctx, state, W, zone);
  drawTagline(ctx, state, W, title.bottom, title.fontSize);
  const quoteTop = drawQuoteChip(ctx, state, W, title.top);
  drawLocationLabel(ctx, state, W, quoteTop);

  // --- Stickers. ---
  if (state.wanted) {
    const pill = drawWantedPill(ctx, state, W, photoH);
    drawVolChip(ctx, state, W, pill);
  }
  if (state.seal) {
    // The seal goes on a panel seam; it tries the usual spot first, then
    // alternates, and never covers a chip, the WANTED pill or the title.
    const r = Math.max(26, W * 0.038);
    const blocked = [...chipRects, titleZoneRect];
    if (pillRect) blocked.push(pillRect);
    const candidates = [
      [W * 0.68, photoH * 0.335],
      [W * 0.86, photoH * 0.16],
      [W * 0.30, photoH * 0.16],
      [W * 0.50, photoH * 0.335],
      [W * 0.14, photoH * 0.16],
    ];
    let pos = candidates[0];
    for (const [cx, cy] of candidates) {
      const hit = blocked.some((b) => rectsOverlap(cx - r, cy - r, r * 2, r * 2, b.x, b.y, b.w, b.h));
      if (!hit) { pos = [cx, cy]; break; }
    }
    drawGoldSeal(ctx, W, photoH, pos[0], pos[1]);
  }
  if (state.collectors) drawCollectorsPill(ctx, W, photoH);
  if (state.ribbon) drawRibbon(ctx, W, photoH, state.barText);

  // --- Bottom strip. ---
  drawBottomStrip(ctx, state, W, H, photoH);
}

// Traces a panel's polygon (slant included) as the current path.
function tracePanel(ctx, panel) {
  const pts = panelPolygon(panel);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

// Draws one panel's photo (or a dark placeholder while it loads).
function drawPanelPhoto(ctx, src, panel, slot) {
  const img = loadedImages.get(src);
  if (img) {
    drawPhotoCover(ctx, img, panel.x, panel.y, panel.w, panel.h, slot.zoom, slot.px, slot.py);
    return;
  }
  // Not loaded yet (or failed): paint a dark stand-in so no white gap shows.
  const g = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.w, panel.y + panel.h);
  g.addColorStop(0, '#2a0f38');
  g.addColorStop(1, '#160a1e');
  ctx.fillStyle = g;
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
}

// The soft dark band behind the title zone, so the letters stay legible
// over any photo, however bright.
function drawTitleScrim(ctx, grade, W, photoH) {
  const g = ctx.createLinearGradient(0, photoH * 0.44, 0, photoH * 0.94);
  g.addColorStop(0, 'rgba(12,4,24,0)');
  g.addColorStop(0.22, grade.scrim);
  g.addColorStop(0.85, grade.scrim);
  g.addColorStop(1, 'rgba(12,4,24,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, photoH * 0.44, W, photoH * 0.50);
}

// Whether two rectangles overlap (used for the chip-dodging below).
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// One panel's chips, placed so nothing ever overlaps. The role tag sits
// top-left and the story caption bottom-left by default. Either chip
// moves when its default spot would land under the title zone (the title
// is drawn later and would cover it): the caption goes under the role tag
// at the top when the panel's foot is in the zone but its head is clear,
// and the role tag goes above the caption at the foot when its head is in
// the zone but its foot is clear. When the role tag would run under the
// WANTED pill, it moves to the bottom stack above the caption; when there
// is no room at all, a chip is dropped rather than drawn under something.
// Tiny panels keep the role tag only. Returns the rectangles actually
// drawn, {role, cap}, so the seal can dodge them.
function drawPanelChips(ctx, panel, slot, grade, photoH, pillRect, titleZone) {
  const role = (slot.role || '').toUpperCase();
  const place = (slot.place || '').toUpperCase();
  const flavor = (slot.flavor || '').toUpperCase();
  const time = slot.time || '';
  const padX = Math.max(4, panel.w * 0.02);
  const padY = Math.max(4, panel.h * 0.03);
  const x = panel.x + padX + (panel.slant || 0) * 0.5;
  const topY = panel.y + padY;

  // Role tag metrics: sized to the panel, never oversized.
  let roleBox = null;
  if (role) {
    const fs = Math.max(11, Math.min(30, panel.w * 0.055, panel.h * 0.075));
    ctx.font = `600 ${fs}px Oswald`;
    const tw = ctx.measureText(role).width;
    roleBox = { fs, w: tw + fs * 1.75, h: fs * 1.85, x, y: topY };
  }

  // Caption metrics (skipped on tiny panels).
  let capBox = null;
  const small = panel.w < photoH * 0.22 || panel.h < photoH * 0.16;
  if (!small && (place || flavor)) {
    const fs = Math.max(10, Math.min(panel.w * 0.055, photoH * 0.020));
    const fs2 = fs * 0.82;
    ctx.font = `600 ${fs}px Oswald`;
    const line1 = time ? `${place}  ·  ${time}` : place;
    const w1 = ctx.measureText(line1).width;
    ctx.font = `400 ${fs2}px Oswald`;
    const w2 = ctx.measureText(flavor).width;
    const pad = fs * 0.8;
    capBox = { fs, fs2, line1, flavor, pad, w: Math.max(w1, w2) + pad * 2, h: fs * 1.7 + fs2 * 1.25 + pad * 0.7, x };
  }

  const inTitleZone = (r) => rectsOverlap(r.x, r.y, r.w, r.h, titleZone.x, titleZone.y, titleZone.w, titleZone.h);
  const fitsInPanel = (r) => r.y >= panel.y + 2 && r.y + r.h <= panel.y + panel.h - 2;

  // Caption first: bottom-left, unless that lands under the title, in
  // which case it stacks under the role tag at the top.
  let capPos = null;
  if (capBox) {
    const bottom = { x: capBox.x, y: panel.y + panel.h - capBox.h - padY, w: capBox.w, h: capBox.h };
    if (!inTitleZone(bottom)) {
      capPos = bottom;
    } else if (roleBox) {
      const stacked = { x: capBox.x, y: roleBox.y + roleBox.h + roleBox.fs * 0.45, w: capBox.w, h: capBox.h };
      if (fitsInPanel(stacked) && !inTitleZone(stacked)) capPos = stacked;
    }
  }

  // Role tag: top-left, unless that lands under the title, in which case
  // it goes to the bottom stack above the caption.
  let rolePos = null;
  if (roleBox) {
    const top = { x: roleBox.x, y: roleBox.y, w: roleBox.w, h: roleBox.h };
    if (!inTitleZone(top)) {
      rolePos = top;
    } else {
      const aboveCap = capPos
        ? { x: roleBox.x, y: capPos.y - roleBox.h - roleBox.fs * 0.4, w: roleBox.w, h: roleBox.h }
        : { x: roleBox.x, y: panel.y + panel.h - roleBox.h - padY, w: roleBox.w, h: roleBox.h };
      if (fitsInPanel(aboveCap) && !inTitleZone(aboveCap)) rolePos = aboveCap;
    }
  }

  // WANTED-pill dodge: the tag moves to the bottom stack, above the
  // caption; when there is no room at all, the tag is dropped, never
  // drawn under the pill.
  if (rolePos && pillRect && rectsOverlap(rolePos.x, rolePos.y, roleBox.w, roleBox.h, pillRect.x, pillRect.y, pillRect.w, pillRect.h)) {
    const dodge = capPos
      ? { x: roleBox.x, y: capPos.y - roleBox.h - roleBox.fs * 0.4, w: roleBox.w, h: roleBox.h }
      : { x: roleBox.x, y: panel.y + panel.h - roleBox.h - padY, w: roleBox.w, h: roleBox.h };
    rolePos = fitsInPanel(dodge) && !inTitleZone(dodge) ? dodge : null;
  }

  if (rolePos) drawRoleTagAt(ctx, role, roleBox, rolePos, grade);
  if (capPos && capBox) drawCaptionChipAt(ctx, capBox, capPos);
  return {
    role: rolePos ? { x: rolePos.x, y: rolePos.y, w: roleBox.w, h: roleBox.h } : null,
    cap: capPos ? { x: capPos.x, y: capPos.y, w: capBox.w, h: capBox.h } : null,
  };
}

// The single-photo layout shows a role tag only, bottom-left, clear of
// the title zone. Returns the rectangle drawn, or null.
function drawRoleTagOnly(ctx, panel, slot, grade) {
  const role = (slot.role || '').toUpperCase();
  if (!role) return null;
  const fs = Math.max(14, Math.min(34, panel.w * 0.028));
  ctx.font = `600 ${fs}px Oswald`;
  const tw = ctx.measureText(role).width;
  const box = { fs, w: tw + fs * 1.75, h: fs * 1.85, x: panel.x + 14, y: 0 };
  const pos = { x: box.x, y: panel.y + panel.h - box.h - 14 };
  drawRoleTagAt(ctx, role, box, pos, grade);
  return { x: pos.x, y: pos.y, w: box.w, h: box.h };
}

// A role tag: a black chip with an accent tab, drawn at `pos`.
function drawRoleTagAt(ctx, role, box, pos, grade) {
  ctx.fillStyle = 'rgba(10,4,18,0.88)';
  ctx.fillRect(pos.x, pos.y, box.w, box.h);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(pos.x, pos.y, box.fs * 0.35, box.h);
  ctx.fillStyle = '#fff7d6';
  ctx.font = `600 ${box.fs}px Oswald`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(role, pos.x + box.fs * 0.7 + box.fs * 0.35, pos.y + box.h / 2 + 1);
}

// A story caption chip: PLACE + time on the first line, the flavour line
// under it, drawn at `pos`.
function drawCaptionChipAt(ctx, cap, pos) {
  ctx.fillStyle = 'rgba(10,4,18,0.86)';
  ctx.fillRect(pos.x, pos.y, cap.w, cap.h);
  ctx.fillStyle = '#ff5da2';
  ctx.fillRect(pos.x, pos.y, cap.fs * 0.3, cap.h);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${cap.fs}px Oswald`;
  ctx.fillStyle = '#fff7d6';
  ctx.fillText(cap.line1, pos.x + cap.pad + cap.fs * 0.3, pos.y + cap.pad * 0.45 + cap.fs * 0.72);
  ctx.font = `400 ${cap.fs2}px Oswald`;
  ctx.fillStyle = 'rgba(255,247,214,0.85)';
  ctx.fillText(cap.flavor, pos.x + cap.pad + cap.fs * 0.3, pos.y + cap.pad * 0.45 + cap.fs * 1.7 + cap.fs2 * 0.5);
}
