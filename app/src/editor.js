// editor.js — the studio's state, its four one-click presets, and the
// wiring between the controls and the preview. The cover itself is drawn
// by cover.js; this file only owns what the user can change.

import { LAYOUTS } from './layouts.js';
import { GRADES } from './grades.js';
import { SAMPLES, loadPhoto, photoSrc, getCachedPhoto } from './photos.js';
import { exportPNG, exportAll, SIZES, sizeById } from './export.js';

const ROLE_TAGS = [
  'THE DRIVER', 'THE LOOKOUT', 'THE PILOT', 'THE RUNNER',
  'THE SPOTTER', 'THE DEALER', 'THE GHOST',
];

function panel(photo, role, caption, px, py, zoom) {
  return { photo, role, caption, px, py, zoom: zoom || 1 };
}

const DEFAULT_PANELS = [
  panel('hero-driver', 'THE DRIVER', 'Sunset on the strip, engine still warm.', 0.5, 0.32),
  panel('neon-arcade', 'THE LOOKOUT', 'She sees everything before it happens.', 0.5, 0.3),
  panel('speedboat', 'THE PILOT', 'Full throttle past the skyline.', 0.5, 0.5),
  panel('rider-night', 'THE RUNNER', 'Nobody catches the night rider.', 0.5, 0.4),
  panel('skyline-dusk', 'THE SPOTTER', 'The city never sleeps, and neither do we.', 0.5, 0.45),
  panel('gas-neon', 'THE DEALER', 'Fuel, neon, and a fresh tank of trouble.', 0.5, 0.35),
  panel('beach-bonfire', 'THE GHOST', 'Gone before the smoke clears.', 0.5, 0.55),
];

export const PRESETS = [
  {
    id: 'sunset-chase',
    name: 'Sunset Chase',
    layoutId: 'key-art',
    gradeId: 'sunset-strip',
    title: 'SUNSET CHASE',
    tagline: 'every street is a stage',
    quote: 'The most wanted poster of the year — five stars, no notes.',
    quoteSource: 'THE SOLMAR GAZETTE',
    titleStyle: 'stripes',
    panels: [
      panel('hero-driver', 'THE DRIVER', 'Sunset on the strip, engine still warm.', 0.5, 0.32),
      panel('neon-arcade', 'THE LOOKOUT', 'She sees everything before it happens.', 0.5, 0.3),
      panel('speedboat', 'THE PILOT', 'Full throttle past the skyline.', 0.5, 0.5),
      panel('rider-night', 'THE RUNNER', 'Nobody catches the night rider.', 0.5, 0.4),
      panel('skyline-dusk', 'THE SPOTTER', 'The city never sleeps, and neither do we.', 0.5, 0.45),
      panel('gas-neon', 'THE DEALER', 'Fuel, neon, and a fresh tank of trouble.', 0.5, 0.35),
      panel('beach-bonfire', 'THE GHOST', 'Gone before the smoke clears.', 0.5, 0.55),
    ],
  },
  {
    id: 'neon-vice',
    name: 'Neon Vice',
    layoutId: 'triple-strip',
    gradeId: 'neon-vice',
    title: 'NEON VICE',
    tagline: 'the night never clocks out',
    quote: 'Neon-drenched and impossible to ignore — a cover that hums.',
    quoteSource: 'THE SOLMAR GAZETTE',
    titleStyle: 'stripes',
    panels: [
      panel('neon-arcade', 'THE LOOKOUT', 'She sees everything before it happens.', 0.5, 0.3),
      panel('rider-night', 'THE RUNNER', 'Nobody catches the night rider.', 0.5, 0.4),
      panel('gas-neon', 'THE DEALER', 'Fuel, neon, and a fresh tank of trouble.', 0.5, 0.35),
      panel('hero-driver', 'THE DRIVER', 'Sunset on the strip, engine still warm.', 0.5, 0.32),
      panel('speedboat', 'THE PILOT', 'Full throttle past the skyline.', 0.5, 0.5),
      panel('skyline-dusk', 'THE SPOTTER', 'The city never sleeps, and neither do we.', 0.5, 0.45),
      panel('beach-bonfire', 'THE GHOST', 'Gone before the smoke clears.', 0.5, 0.55),
    ],
  },
  {
    id: 'coral-heat',
    name: 'Coral Heat',
    layoutId: 'hero-bottom',
    gradeId: 'coral-heat',
    title: 'CORAL HEAT',
    tagline: 'chasing the last light',
    quote: 'Warm as the last light on the bay, sharp as a getaway plan.',
    quoteSource: 'THE SOLMAR GAZETTE',
    titleStyle: 'stripes',
    panels: [
      panel('duo-convertible', 'THE GETAWAY', 'Two seats, one sunset, no brakes.', 0.5, 0.45),
      panel('hero-driver', 'THE DRIVER', 'Sunset on the strip, engine still warm.', 0.5, 0.32),
      panel('beach-bonfire', 'THE GHOST', 'Gone before the smoke clears.', 0.5, 0.55),
      panel('speedboat', 'THE PILOT', 'Full throttle past the skyline.', 0.5, 0.5),
      panel('neon-arcade', 'THE LOOKOUT', 'She sees everything before it happens.', 0.5, 0.3),
      panel('rider-night', 'THE RUNNER', 'Nobody catches the night rider.', 0.5, 0.4),
      panel('skyline-dusk', 'THE SPOTTER', 'The city never sleeps, and neither do we.', 0.5, 0.45),
    ],
  },
  {
    id: 'palm-noir',
    name: 'Palm Noir',
    layoutId: 'quad-grid',
    gradeId: 'palm-noir',
    title: 'PALM NOIR',
    tagline: 'the city keeps receipts',
    quote: 'Noir with a tan — the slickest cover on the stand.',
    quoteSource: 'THE SOLMAR GAZETTE',
    titleStyle: 'stripes',
    panels: [
      panel('boulevard-palms', 'THE FIXER', 'Every palm has a price.', 0.5, 0.45),
      panel('marina-dawn', 'THE ANGLER', 'First light, last catch.', 0.5, 0.5),
      panel('coast-aerial', 'THE CAPTAIN', 'The coast belongs to the bold.', 0.5, 0.5),
      panel('diner-night', 'THE WHEELMAN', 'Coffee at midnight, keys at dawn.', 0.5, 0.4),
      panel('hero-driver', 'THE DRIVER', 'Sunset on the strip, engine still warm.', 0.5, 0.32),
      panel('neon-arcade', 'THE LOOKOUT', 'She sees everything before it happens.', 0.5, 0.3),
      panel('speedboat', 'THE PILOT', 'Full throttle past the skyline.', 0.5, 0.5),
    ],
  },
];

export function presetById(id) {
  return PRESETS.find((p) => p.id === id) || PRESETS[0];
}

export function applyPreset(state, presetId) {
  const preset = presetById(presetId);
  state.presetId = preset.id;
  state.layoutId = preset.layoutId;
  state.gradeId = preset.gradeId;
  state.title = preset.title;
  state.tagline = preset.tagline;
  state.quote = preset.quote;
  state.quoteSource = preset.quoteSource;
  state.titleStyle = preset.titleStyle;
  state.panels = preset.panels.map((p) => ({ ...p }));
  state.selectedPanel = 0;
  return state;
}

export function defaultState() {
  const state = {
    presetId: 'sunset-chase',
    layoutId: 'key-art',
    gradeId: 'sunset-strip',
    title: 'SUNSET CHASE',
    tagline: 'every street is a stage',
    quote: 'The most wanted poster of the year — five stars, no notes.',
    quoteSource: 'THE SOLMAR GAZETTE',
    titleStyle: 'stripes',
    sizeId: '1080x1350',
    onePhoto: false,
    selectedPanel: 0,
    panels: DEFAULT_PANELS.map((p) => ({ ...p })),
  };
  return applyPreset(state, 'sunset-chase');
}

export { ROLE_TAGS };

// --- Uploads --------------------------------------------------------------
const uploads = new Map();
let uploadCount = 0;

export function resolvePhoto(panelState) {
  if (!panelState || !panelState.photo) return null;
  if (String(panelState.photo).startsWith('upload:')) {
    const up = uploads.get(panelState.photo);
    return up ? up.img : null;
  }
  return getCachedPhoto(panelState.photo);
}

export function addUpload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        uploadCount += 1;
        const key = `upload:${uploadCount}`;
        uploads.set(key, { img, label: file.name || `Upload ${uploadCount}` });
        resolve(key);
      };
      img.onerror = () => reject(new Error('could not read that image'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('could not read that file'));
    reader.readAsDataURL(file);
  });
}

// --- Controls -------------------------------------------------------------
// Wire every control in the editor panel. `hooks.onChange` re-renders the
// preview; `hooks.onExport` runs when an export button is pressed and
// returns a promise; `hooks.selectPanel` is called with the new index.
export function initEditor(state, canvas, hooks) {
  const $ = (id) => document.getElementById(id);
  const status = $('status');

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function refreshActiveStates() {
    document.querySelectorAll('#presets button').forEach((b) => {
      b.classList.toggle('active', b.dataset.preset === state.presetId);
    });
    document.querySelectorAll('#layouts button').forEach((b) => {
      b.classList.toggle('active', b.dataset.layout === state.layoutId);
    });
    document.querySelectorAll('#grades button').forEach((b) => {
      b.classList.toggle('active', b.dataset.grade === state.gradeId);
    });
    document.querySelectorAll('#title-style button').forEach((b) => {
      b.classList.toggle('active', b.dataset.style === state.titleStyle);
    });
    document.querySelectorAll('#sizes button').forEach((b) => {
      b.classList.toggle('active', b.dataset.size === state.sizeId);
    });
    document.querySelectorAll('#photo-grid button').forEach((b) => {
      b.classList.toggle('active', b.dataset.photo === currentPanel().photo);
    });
    const panelName = $('panel-name');
    if (panelName) panelName.textContent = `— panel ${state.selectedPanel + 1}`;
  }

  function currentPanel() {
    return state.panels[state.selectedPanel] || state.panels[0];
  }

  function refreshPanelControls() {
    const p = currentPanel();
    const role = $('role');
    const caption = $('caption');
    const zoom = $('zoom');
    const panx = $('panx');
    const pany = $('pany');
    if (role) role.value = p.role || '';
    if (caption) caption.value = p.caption || '';
    if (zoom) zoom.value = String(p.zoom || 1);
    if (panx) panx.value = String(p.px == null ? 0.5 : p.px);
    if (pany) pany.value = String(p.py == null ? 0.5 : p.py);
    refreshActiveStates();
  }

  function refreshWordControls() {
    const title = $('title');
    const tagline = $('tagline');
    const quote = $('quote');
    const quoteSource = $('quote-source');
    const onePhoto = $('one-photo');
    if (title) title.value = state.title;
    if (tagline) tagline.value = state.tagline;
    if (quote) quote.value = state.quote;
    if (quoteSource) quoteSource.value = state.quoteSource;
    if (onePhoto) onePhoto.checked = !!state.onePhoto;
  }

  function changed() {
    refreshActiveStates();
    hooks.onChange();
  }

  // Presets.
  const presetBox = $('presets');
  PRESETS.forEach((preset) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.preset = preset.id;
    b.textContent = preset.name;
    b.addEventListener('click', () => {
      applyPreset(state, preset.id);
      refreshWordControls();
      refreshPanelControls();
      setStatus(`${preset.name} loaded — export it or keep editing.`);
      changed();
    });
    presetBox.appendChild(b);
  });

  // Layouts.
  const layoutBox = $('layouts');
  LAYOUTS.forEach((layout) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.layout = layout.id;
    b.textContent = layout.name;
    b.title = `${layout.panels.length} panels`;
    b.addEventListener('click', () => {
      state.layoutId = layout.id;
      state.selectedPanel = 0;
      refreshPanelControls();
      setStatus(`${layout.name}: ${layout.panels.length} panels.`);
      changed();
    });
    layoutBox.appendChild(b);
  });

  // Grades.
  const gradeBox = $('grades');
  GRADES.forEach((grade) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.grade = grade.id;
    b.className = 'grade-swatch';
    b.title = grade.name;
    b.style.background = `linear-gradient(135deg, ${grade.bands[0]} 0%, ${grade.bands[2]} 55%, ${grade.bands[4]} 100%)`;
    const label = document.createElement('span');
    label.textContent = grade.name;
    b.appendChild(label);
    b.addEventListener('click', () => {
      state.gradeId = grade.id;
      setStatus(`${grade.name} grade.`);
      changed();
    });
    gradeBox.appendChild(b);
  });

  // Sizes.
  const sizeBox = $('sizes');
  SIZES.forEach((size) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.size = size.id;
    b.textContent = size.label;
    b.addEventListener('click', () => {
      state.sizeId = size.id;
      setStatus(`${size.label} — preview resized.`);
      changed();
    });
    sizeBox.appendChild(b);
  });

  // Title style.
  document.querySelectorAll('#title-style button').forEach((b) => {
    b.addEventListener('click', () => {
      state.titleStyle = b.dataset.style;
      changed();
    });
  });

  // Word inputs.
  $('title').addEventListener('input', (e) => {
    state.title = e.target.value.toUpperCase();
    changed();
  });
  $('tagline').addEventListener('input', (e) => {
    state.tagline = e.target.value;
    changed();
  });
  $('quote').addEventListener('input', (e) => {
    state.quote = e.target.value;
    changed();
  });
  $('quote-source').addEventListener('input', (e) => {
    state.quoteSource = e.target.value.toUpperCase();
    changed();
  });

  // Photo grid.
  const grid = $('photo-grid');
  SAMPLES.forEach((sample) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.photo = sample.id;
    b.className = 'photo-thumb';
    b.title = sample.label;
    const img = document.createElement('img');
    img.src = photoSrc(sample);
    img.alt = sample.label;
    img.loading = 'lazy';
    b.appendChild(img);
    const label = document.createElement('span');
    label.textContent = sample.label;
    b.appendChild(label);
    b.addEventListener('click', () => {
      currentPanel().photo = sample.id;
      const s = sampleById(sample.id);
      currentPanel().px = s.px;
      currentPanel().py = s.py;
      currentPanel().zoom = 1;
      refreshPanelControls();
      changed();
    });
    grid.appendChild(b);
  });

  // Uploads.
  const uploadInput = $('upload');
  async function handleFiles(files) {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const key = await addUpload(file);
        currentPanel().photo = key;
        currentPanel().px = 0.5;
        currentPanel().py = 0.5;
        currentPanel().zoom = 1;
        setStatus(`Loaded ${file.name} into panel ${state.selectedPanel + 1}.`);
        refreshPanelControls();
        changed();
      } catch (err) {
        setStatus(`Could not load ${file.name}.`);
      }
    }
  }
  uploadInput.addEventListener('change', () => {
    handleFiles([...uploadInput.files]);
    uploadInput.value = '';
  });
  canvas.addEventListener('dragover', (e) => e.preventDefault());
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files.length) handleFiles([...e.dataTransfer.files]);
  });

  // Per-panel controls.
  $('role').addEventListener('input', (e) => {
    currentPanel().role = e.target.value.toUpperCase();
    changed();
  });
  $('caption').addEventListener('input', (e) => {
    currentPanel().caption = e.target.value;
    changed();
  });
  $('zoom').addEventListener('input', (e) => {
    currentPanel().zoom = Number(e.target.value);
    changed();
  });
  $('panx').addEventListener('input', (e) => {
    currentPanel().px = Number(e.target.value);
    changed();
  });
  $('pany').addEventListener('input', (e) => {
    currentPanel().py = Number(e.target.value);
    changed();
  });
  $('one-photo').addEventListener('change', (e) => {
    state.onePhoto = e.target.checked;
    changed();
  });

  // Click a panel in the preview to edit it.
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const ux = (e.clientX - rect.left) / rect.width;
    const uy = (e.clientY - rect.top) / rect.height;
    const layout = LAYOUTS.find((l) => l.id === state.layoutId) || LAYOUTS[0];
    const hit = layout.panels.findIndex(
      (p) => ux >= p.x && ux <= p.x + p.w && uy >= p.y && uy <= p.y + p.h,
    );
    if (hit >= 0) {
      state.selectedPanel = hit;
      refreshPanelControls();
      setStatus(`Panel ${hit + 1} selected.`);
      hooks.onChange();
    }
  });

  // Export buttons.
  $('export-one').addEventListener('click', async () => {
    setStatus('Rendering PNG…');
    try {
      const size = sizeById(state.sizeId);
      const result = await exportPNG(state, state.sizeId, resolvePhoto);
      setStatus(`Exported ${result.name} (${size.w} × ${size.h}).`);
    } catch (err) {
      setStatus('Export failed — try again.');
    }
  });
  $('export-all').addEventListener('click', async () => {
    setStatus('Rendering all three sizes…');
    try {
      await exportAll(state, resolvePhoto, (result) => {
        setStatus(`Exported ${result.name}…`);
      });
      setStatus('Done — 3 PNGs: 1080 × 1080, 1080 × 1350, 1920 × 1080.');
    } catch (err) {
      setStatus('Export failed — try again.');
    }
  });

  refreshWordControls();
  refreshPanelControls();
  refreshActiveStates();
  return { refreshPanelControls, refreshWordControls, setStatus };
}

function sampleById(id) {
  return SAMPLES.find((s) => s.id === id) || SAMPLES[0];
}
