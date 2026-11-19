// Photo handling for Solmar Bay Cover Studio: loading images, assigning
// them to panels, and drawing each panel with its own crop (zoom + pan).
// A crop is { zoom, ox, oy }: zoom 1 fills the panel edge to edge, larger
// zooms in; ox/oy pan the photo inside the panel from -1 to 1. Crops are
// per panel, so one photo can fill every panel with a different framing,
// or every panel can hold a different photo.

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${url}`));
    img.src = url;
  });
}

/** Loads an image from a File the user picked or dropped. */
export function loadImageFile(file) {
  return loadImage(URL.createObjectURL(file));
}

/** A fresh crop: no zoom, centred. */
export function defaultCrop() {
  return { zoom: 1, ox: 0, oy: 0 };
}

/**
 * Builds the default per-panel photo assignment for `panelCount` panels
 * from `photoCount` photos. Mode 'one' fills every panel with photo 0;
 * mode 'each' cycles through the photos so every panel differs.
 */
export function defaultAssignments(panelCount, photoCount, mode) {
  const out = [];
  for (let i = 0; i < panelCount; i++) {
    out.push(mode === 'one' ? 0 : photoCount > 0 ? i % photoCount : 0);
  }
  return out;
}

/**
 * Draws `img` into `rect` (canvas pixels) with a cover fit, then applies
 * the crop's zoom and pan. The image is clipped to the rect by the caller
 * when the panel is a custom shape; here it simply fills the rectangle.
 */
export function drawPhotoInRect(ctx, img, rect, crop) {
  if (!img) return;
  const { x, y, w, h } = rect;
  const base = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const scale = base * (crop?.zoom ?? 1);
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  const cx = x + w / 2 + (crop?.ox ?? 0) * (pw - w) * 0.25;
  const cy = y + h / 2 + (crop?.oy ?? 0) * (ph - h) * 0.25;
  ctx.drawImage(img, cx - pw / 2, cy - ph / 2, pw, ph);
}

/** Draws `img` into a panel that may be slanted: clips to the panel's
 * parallelogram (panel and rect both in canvas pixels), then paints the
 * photo across the panel's bounding box. */
export function drawPhotoInPanel(ctx, img, panel, rect, crop) {
  if (panel.slant) {
    const s = panel.slant * rect.w;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(rect.x + s, rect.y);
    ctx.lineTo(rect.x + rect.w, rect.y);
    ctx.lineTo(rect.x + rect.w - s, rect.y + rect.h);
    ctx.lineTo(rect.x, rect.y + rect.h);
    ctx.closePath();
    ctx.clip();
    drawPhotoInRect(ctx, img, rect, crop);
    ctx.restore();
  } else {
    drawPhotoInRect(ctx, img, rect, crop);
  }
}
