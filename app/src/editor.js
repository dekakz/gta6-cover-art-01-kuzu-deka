// Editor for Solmar Bay Cover Studio: the state, the controls, and the
// live preview. One photo in, three steps out: pick a layout and a grade,
// write the caption, export all three sizes. Every control redraws the
// same canvas drawCover paints for export, so the preview never lies.
import { drawCover } from './cover.js';
import { LAYOUTS, LAYOUT_IDS, panelsForLayout } from './layouts.js';
import { GRADES, GRADE_IDS } from './grades.js';
import { EXPORT_SIZES, exportAllSizes, exportOneSize } from './export.js';
import { defaultAssignments, defaultCrop, loadImage, loadImageFile } from './photos.js';

/** The six bundled sample photos (original AI-made images, free to use). */
export const SAMPLE_PHOTOS = [
  { id: 'street', label: 'Art-deco street', file: 'samples/street.jpg' },
  { id: 'boulevard', label: 'Boulevard queen', file: 'samples/boulevard.jpg' },
  { id: 'neon', label: 'Neon street', file: 'samples/neon.jpg' },
  { id: 'marina', label: 'Marina dusk', file: 'samples/marina.jpg' },
  { id: 'lifeguard', label: 'Lifeguard tower', file: 'samples/lifeguard.jpg' },
  { id: 'pier', label: 'Pier fisherman', file: 'samples/pier.jpg' },
];

/** One-click poster presets: a layout + grade + caption that already works. */
export const PRESETS = [
  { id: 'sunset-chase', name: 'Sunset Chase', layout: 'hero-5', grade: 'sunset', title: 'SUNSET CHASE', tagline: 'every street is a stage', location: 'SOLMAR BAY', barText: 'ONE CITY. EVERY LIGHT TELLS A STORY.' },
  { id: 'neon-vice', name: 'Neon Vice', layout: 'grid-9', grade: 'neon-vice', title: 'NEON VICE', tagline: 'neon tides, golden streets', location: 'CORAL BAY', barText: 'ONE CITY. EVERY NIGHT HAS A PRICE.' },
  { id: 'coral-heat', name: 'Coral Heat', layout: 'magazine', grade: 'coral-heat', title: 'CORAL HEAT', tagline: 'golden hour, hot pursuit', location: 'SOLMAR BAY', barText: 'ONE CITY. EVERY SECRET HAS A VIEW.' },
  { id: 'halftone-noir', name: 'Halftone Noir', layout: 'tilt', grade: 'halftone', title: 'PALM MERIDIAN', tagline: 'neon harbor nights', location: 'SOLMAR BAY', barText: 'ONE CITY. EVERY SHADOW KEEPS A SECRET.' },
];

/** Fresh editor state. */
export function defaultState() {
  return {
    photos: [],
    photoNames: [],
    assignments: [],
    crops: [],
    layout: 'hero-5',
    grade: 'sunset',
    title: 'SUNSET CHASE',
    tagline: 'every street is a stage',
    location: 'SOLMAR BAY',
    barText: 'ONE CITY. EVERY LIGHT TELLS A STORY.',
    stickers: { est: true, isNew: true, ribbon: true, ribbonText: 'SAME TROUBLE', collectors: true, stars: true, starRating: 4 },
    photoMode: 'each',
    selectedPanel: 0,
    previewSize: 'landscape',
  };
}

/** Rebuilds assignments/crops after the layout or photo list changes. */
export function syncPanels(state) {
  const count = panelsForLayout(state.layout).length;
  const keptAssignments = state.assignments.slice(0, count);
  while (keptAssignments.length < count) {
    keptAssignments.push(state.photoMode === 'one' ? 0 : keptAssignments.length % Math.max(1, state.photos.length));
  }
  state.assignments = keptAssignments;
  while (state.crops.length < count) state.crops.push(defaultCrop());
  state.crops = state.crops.slice(0, count);
  state.selectedPanel = Math.min(state.selectedPanel, count - 1);
}

/** Applies a preset combo to the state. */
export function applyPreset(state, presetId) {
  const p = PRESETS.find((x) => x.id === presetId) || PRESETS[0];
  state.layout = p.layout;
  state.grade = p.grade;
  state.title = p.title;
  state.tagline = p.tagline;
  state.location = p.location;
  state.barText = p.barText;
  syncPanels(state);
  return p;
}

/** Creates the editor: wires every control to the state and the canvas. */
export function createEditor(canvas) {
  const state = defaultState();
  const $ = (id) => document.getElementById(id);
  const status = $('status');
  let panelRects = [];

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function redraw() {
    panelRects = drawCover(canvas, state);
    const size = EXPORT_SIZES.find((s) => s.id === state.previewSize) || EXPORT_SIZES[2];
    const indicator = $('size-indicator');
    if (indicator) indicator.textContent = `Preview: ${size.label} — click a panel to select it, drag to pan its photo.`;
  }

  function setPreviewSize(sizeId) {
    state.previewSize = sizeId;
    const size = EXPORT_SIZES.find((s) => s.id === sizeId) || EXPORT_SIZES[2];
    canvas.width = size.w;
    canvas.height = size.h;
    redraw();
  }

  async function addPhoto(img, name) {
    state.photos.push(img);
    state.photoNames.push(name || `Photo ${state.photos.length}`);
    // In "different photo per panel" mode a new photo re-deals the panels
    // so every panel shows a different photo instead of all showing photo 0.
    if (state.photoMode === 'each' && state.photos.length > 1) {
      const count = panelsForLayout(state.layout).length;
      state.assignments = Array.from({ length: count }, (_, i) => i % state.photos.length);
    }
    syncPanels(state);
    renderPhotoList();
    redraw();
  }

  async function loadSamples(ids) {
    for (const id of ids) {
      const sample = SAMPLE_PHOTOS.find((s) => s.id === id);
      if (!sample) continue;
      try {
        const img = await loadImage(sample.file);
        await addPhoto(img, sample.label);
      } catch (e) {
        setStatus(`Could not load sample ${sample.label}.`);
      }
    }
    setStatus(`${state.photos.length} photos loaded. Pick a layout, a grade, then export.`);
  }

  function renderPhotoList() {
    const list = $('photo-list');
    if (!list) return;
    list.innerHTML = '';
    state.photos.forEach((img, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb';
      btn.title = `${state.photoNames[i]} — click to put it in the selected panel`;
      const thumb = document.createElement('img');
      thumb.src = img.src;
      thumb.alt = state.photoNames[i];
      btn.appendChild(thumb);
      btn.addEventListener('click', () => {
        state.assignments[state.selectedPanel] = i;
        redraw();
      });
      list.appendChild(btn);
    });
  }

  function buildSwatches() {
    const layoutBox = $('layout-swatches');
    if (layoutBox) {
      layoutBox.innerHTML = '';
      for (const id of LAYOUT_IDS) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'swatch' + (state.layout === id ? ' active' : '');
        b.dataset.layout = id;
        b.innerHTML = `<strong>${LAYOUTS[id].name}</strong><span>${LAYOUTS[id].blurb}</span>`;
        b.addEventListener('click', () => {
          state.layout = id;
          syncPanels(state);
          buildSwatches();
          renderPanelPicker();
          redraw();
        });
        layoutBox.appendChild(b);
      }
    }
    const gradeBox = $('grade-swatches');
    if (gradeBox) {
      gradeBox.innerHTML = '';
      for (const id of GRADE_IDS) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'swatch grade' + (state.grade === id ? ' active' : '');
        b.dataset.grade = id;
        b.innerHTML = `<span class="dot" style="background:${GRADES[id].swatch}"></span><strong>${GRADES[id].name}</strong>`;
        b.addEventListener('click', () => {
          state.grade = id;
          buildSwatches();
          redraw();
        });
        gradeBox.appendChild(b);
      }
    }
  }

  function renderPanelPicker() {
    const sel = $('panel-photo');
    if (!sel) return;
    sel.innerHTML = '';
    state.photos.forEach((img, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = state.photoNames[i];
      sel.appendChild(opt);
    });
    sel.value = String(state.assignments[state.selectedPanel] ?? 0);
    const label = $('panel-label');
    if (label) label.textContent = `Panel ${state.selectedPanel + 1} of ${panelsForLayout(state.layout).length}`;
    const zoom = $('crop-zoom');
    const panX = $('crop-x');
    const panY = $('crop-y');
    const crop = state.crops[state.selectedPanel] || defaultCrop();
    if (zoom) zoom.value = String(crop.zoom);
    if (panX) panX.value = String(crop.ox);
    if (panY) panY.value = String(crop.oy);
  }

  function bindControls() {
    const bindText = (id, key) => {
      const el = $(id);
      if (el) el.addEventListener('input', () => { state[key] = el.value; redraw(); });
    };
    bindText('title', 'title');
    bindText('tagline', 'tagline');
    bindText('location', 'location');
    bindText('bar-text', 'barText');

    const photoInput = $('photo');
    if (photoInput) {
      photoInput.addEventListener('change', async (e) => {
        for (const file of e.target.files) {
          try { await addPhoto(await loadImageFile(file), file.name); } catch { /* skip bad file */ }
        }
        setStatus(`${state.photos.length} photos loaded.`);
      });
    }
    const dropZone = $('drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('over'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'));
      dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('over');
        for (const file of e.dataTransfer.files) {
          if (!file.type.startsWith('image/')) continue;
          try { await addPhoto(await loadImageFile(file), file.name); } catch { /* skip */ }
        }
      });
    }
    const loadAll = $('load-samples');
    if (loadAll) loadAll.addEventListener('click', () => loadSamples(SAMPLE_PHOTOS.map((s) => s.id)));

    const modeOne = $('mode-one');
    const modeEach = $('mode-each');
    const setMode = (mode) => {
      state.photoMode = mode;
      state.assignments = defaultAssignments(panelsForLayout(state.layout).length, state.photos.length, mode);
      if (modeOne) modeOne.classList.toggle('active', mode === 'one');
      if (modeEach) modeEach.classList.toggle('active', mode === 'each');
      redraw();
    };
    if (modeOne) modeOne.addEventListener('click', () => setMode('one'));
    if (modeEach) modeEach.addEventListener('click', () => setMode('each'));

    const panelPhoto = $('panel-photo');
    if (panelPhoto) {
      panelPhoto.addEventListener('change', () => {
        state.assignments[state.selectedPanel] = Number(panelPhoto.value);
        redraw();
      });
    }
    const bindCrop = (id, key) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('input', () => {
        const crop = state.crops[state.selectedPanel] || defaultCrop();
        crop[key] = Number(el.value);
        state.crops[state.selectedPanel] = crop;
        redraw();
      });
    };
    bindCrop('crop-zoom', 'zoom');
    bindCrop('crop-x', 'ox');
    bindCrop('crop-y', 'oy');

    const presetBox = $('preset-swatches');
    if (presetBox) {
      presetBox.innerHTML = '';
      for (const p of PRESETS) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'swatch preset';
        b.innerHTML = `<strong>${p.name}</strong><span>${p.layout} · ${p.grade}</span>`;
        b.addEventListener('click', () => {
          applyPreset(state, p.id);
          syncInputs();
          buildSwatches();
          renderPanelPicker();
          redraw();
          setStatus(`Preset “${p.name}” applied — export when ready.`);
        });
        presetBox.appendChild(b);
      }
    }

    const bindSticker = (id, key) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('change', () => { state.stickers[key] = el.checked; redraw(); });
    };
    bindSticker('sticker-est', 'est');
    bindSticker('sticker-new', 'isNew');
    bindSticker('sticker-ribbon', 'ribbon');
    bindSticker('sticker-collectors', 'collectors');
    bindSticker('sticker-stars', 'stars');
    const stars = $('star-rating');
    if (stars) {
      stars.addEventListener('change', () => { state.stickers.starRating = Number(stars.value); redraw(); });
    }
    const ribbonText = $('ribbon-text');
    if (ribbonText) {
      ribbonText.addEventListener('input', () => { state.stickers.ribbonText = ribbonText.value; redraw(); });
    }

    const previewSel = $('preview-size');
    if (previewSel) previewSel.addEventListener('change', () => setPreviewSize(previewSel.value));

    const exportAll = $('export-all');
    if (exportAll) {
      exportAll.addEventListener('click', async () => {
        if (state.photos.length === 0) { setStatus('Load a photo first — try the sample photos.'); return; }
        exportAll.disabled = true;
        setStatus('Exporting all three sizes…');
        try {
          const files = await exportAllSizes(state, (done, total, label) => {
            setStatus(`Exported ${done} of ${total}: ${label}`);
          });
          setStatus(`Saved ${files.join(', ')}`);
        } catch (e) {
          setStatus('Export failed — try again.');
        }
        exportAll.disabled = false;
      });
    }
    for (const size of EXPORT_SIZES) {
      const btn = $(`export-${size.id}`);
      if (btn) {
        btn.addEventListener('click', async () => {
          if (state.photos.length === 0) { setStatus('Load a photo first — try the sample photos.'); return; }
          const file = await exportOneSize(state, size.id);
          setStatus(`Saved ${file}`);
        });
      }
    }

    // Canvas: click selects a panel, drag pans its photo.
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
    };
    canvas.addEventListener('pointerdown', (e) => {
      const p = point(e);
      const idx = panelRects.findIndex((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
      if (idx >= 0) {
        state.selectedPanel = idx;
        renderPanelPicker();
        redraw();
      }
      dragging = true;
      lastX = p.x;
      lastY = p.y;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const p = point(e);
      const crop = state.crops[state.selectedPanel] || defaultCrop();
      const rect = panelRects[state.selectedPanel];
      if (rect) {
        crop.ox += (p.x - lastX) / Math.max(40, rect.w * 0.4);
        crop.oy += (p.y - lastY) / Math.max(40, rect.h * 0.4);
        crop.ox = Math.max(-1, Math.min(1, crop.ox));
        crop.oy = Math.max(-1, Math.min(1, crop.oy));
        state.crops[state.selectedPanel] = crop;
        renderPanelPicker();
        redraw();
      }
      lastX = p.x;
      lastY = p.y;
    });
    canvas.addEventListener('pointerup', () => { dragging = false; });
  }

  function syncInputs() {
    const set = (id, value) => { const el = $(id); if (el) el.value = value; };
    set('title', state.title);
    set('tagline', state.tagline);
    set('location', state.location);
    set('bar-text', state.barText);
  }

  syncPanels(state);
  buildSwatches();
  bindControls();
  renderPanelPicker();
  setPreviewSize('landscape');

  return {
    state,
    redraw,
    loadSamples,
    setPreviewSize,
    applyPreset: (id) => { applyPreset(state, id); syncInputs(); buildSwatches(); renderPanelPicker(); redraw(); },
    setStatus,
  };
}
