// Editor state, presets and controls. The state is the single source of
// truth: every control writes into it and calls renderCover again. A
// preset sets the layout, grade, lettering, stickers and the panel photos
// in one click; everything it sets stays editable afterwards.
'use strict';

// The four one-click presets. All titles, taglines, quotes and captions
// are the studio's own — nothing here copies another entry's wording.
const PRESETS = {
  'sunset-chase': {
    label: 'Sunset Chase',
    layout: 'key-art',
    grade: 'sunset',
    title: 'SUNSET CHASE',
    tagline: 'every street is a stage',
    quote: 'GOLDEN HOURS, DARKER DEALS',
    source: 'THE SOLMAR GAZETTE',
    stars: 5,
    barText: 'ONE COAST · NO RULES · COMING SOON',
    credit: 'A SOLMAR BAY PICTURE · STARRING YOU · SHOT ON YOUR OWN CAMERA',
    photos: ['samples/hero-driver.jpg', 'samples/duo-convertible.jpg', 'samples/neon-arcade.jpg', 'samples/rider-night.jpg', 'samples/speedboat.jpg', 'samples/gas-neon.jpg'],
  },
  'neon-vice': {
    label: 'Neon Vice',
    layout: 'trio-slant',
    grade: 'neon-vice',
    title: 'NEON VICE',
    tagline: 'the night never clocks out',
    quote: 'MIDNIGHT RUNS ON NEON',
    source: 'THE NEON REVIEW',
    stars: 5,
    barText: 'SIX STREETS · ONE NIGHT · NO CURFEW',
    credit: 'A NEON VICE PRODUCTION · STARRING YOUR CREW · SHOT ON YOUR OWN CAMERA',
    photos: ['samples/neon-arcade.jpg', 'samples/rider-night.jpg', 'samples/hero-driver.jpg', 'samples/duo-convertible.jpg', 'samples/speedboat.jpg', 'samples/gas-neon.jpg'],
    // Tall slant panels crop hard: frame the faces, not the middles.
    tweaks: [{ i: 0, zoom: 1.0, py: 0.12 }, { i: 1, py: 0.35 }, { i: 2, px: 0.32 }],
  },
  'coral-heat': {
    label: 'Coral Heat',
    layout: 'hero-left',
    grade: 'coral-heat',
    title: 'CORAL HEAT',
    tagline: 'chasing the last light',
    quote: 'SALT AIR, FAST CARS',
    source: 'THE SUNSET POST',
    stars: 4,
    barText: 'SALT AIR · FAST CARS · LAST LIGHT',
    credit: 'A CORAL HEAT PICTURE · STARRING YOU · SHOT ON YOUR OWN CAMERA',
    photos: ['samples/hero-driver.jpg', 'samples/speedboat.jpg', 'samples/coast-aerial.jpg', 'samples/marina-dawn.jpg', 'samples/duo-convertible.jpg', 'samples/gas-neon.jpg'],
    tweaks: [{ i: 0, px: 0.45, py: 0.4 }, { i: 3, py: 0.5 }],
  },
  'palm-noir': {
    label: 'Palm Noir',
    layout: 'grid-6',
    grade: 'halftone',
    title: 'PALM NOIR',
    tagline: 'the city keeps receipts',
    quote: 'EVERY SHADOW HAS A PRICE',
    source: 'THE NIGHT DESK',
    stars: 5,
    barText: 'EVERY SHADOW · HAS A PRICE · COMING SOON',
    credit: 'A PALM NOIR PICTURE · STARRING YOU · SHOT ON YOUR OWN CAMERA',
    photos: ['samples/skyline-dusk.jpg', 'samples/hero-driver.jpg', 'samples/neon-arcade.jpg', 'samples/diner-night.jpg', 'samples/rider-night.jpg', 'samples/beach-bonfire.jpg'],
  },
};

// The live state. Panel slots always number 6; a layout uses the first N.
const state = {
  size: '1920x1080',
  layout: 'key-art',
  grade: 'sunset',
  preset: 'sunset-chase',
  title: 'SUNSET CHASE',
  tagline: 'every street is a stage',
  location: 'SOLMAR BAY',
  quote: 'GOLDEN HOURS, DARKER DEALS',
  source: 'THE SOLMAR GAZETTE',
  quoteStars: 5,
  titleStyle: 'stripes',
  barText: 'ONE COAST · NO RULES · COMING SOON',
  credit: 'A SOLMAR BAY PICTURE · STARRING YOU · SHOT ON YOUR OWN CAMERA',
  vol: 'VOL. 06',
  wanted: true,
  seal: true,
  collectors: true,
  ribbon: false,
  onePhoto: false,
  panels: [],
};

// Photos the user added (object URLs), shown in the panel photo menus.
const userPhotos = [];

// A fresh panel slot from a sample's defaults.
function slotFromSample(src) {
  const s = SAMPLES.find((x) => x.src === src);
  return {
    src,
    role: s ? s.role : '',
    place: s ? s.place : '',
    time: s ? s.time : '',
    flavor: s ? s.flavor : '',
    zoom: 1.12,
    px: 0.5,
    py: 0.42,
  };
}

// Applies a preset: layout, grade, lettering, stickers and panel photos.
function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  state.preset = name;
  state.layout = p.layout;
  state.grade = p.grade;
  state.title = p.title;
  state.tagline = p.tagline;
  state.quote = p.quote;
  state.source = p.source;
  state.quoteStars = p.stars;
  state.barText = p.barText;
  state.credit = p.credit;
  state.panels = p.photos.map((src) => slotFromSample(src));
  while (state.panels.length < 6) state.panels.push(slotFromSample(SAMPLES[state.panels.length].src));
  (p.tweaks || []).forEach((t) => {
    const slot = state.panels[t.i];
    if (!slot) return;
    if (t.zoom !== undefined) slot.zoom = t.zoom;
    if (t.px !== undefined) slot.px = t.px;
    if (t.py !== undefined) slot.py = t.py;
  });
  syncInputs();
  buildPanelList();
  render();
}

// The preview canvas, re-rendered from state at the chosen size.
function render() {
  const canvas = document.getElementById('cover');
  const dims = EXPORT_SIZES[state.size] || EXPORT_SIZES['1920x1080'];
  if (canvas.width !== dims[0]) canvas.width = dims[0];
  if (canvas.height !== dims[1]) canvas.height = dims[1];
  renderCover(canvas.getContext('2d'), state, dims[0], dims[1]);
}

// Copies the state back into the lettering / sticker inputs.
function syncInputs() {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
  const check = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };
  set('inTitle', state.title);
  set('inTagline', state.tagline);
  set('inLocation', state.location);
  set('inQuote', state.quote);
  set('inQuoteSource', state.source);
  set('inStars', state.quoteStars);
  set('inTitleStyle', state.titleStyle);
  set('inVol', state.vol);
  set('inBarText', state.barText);
  set('inCredit', state.credit);
  check('inWanted', state.wanted);
  check('inSeal', state.seal);
  check('inCollectors', state.collectors);
  check('inRibbon', state.ribbon);
  check('onePhoto', state.onePhoto);
  document.querySelectorAll('#presetGrid .preset-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.preset === state.preset);
  });
  document.querySelectorAll('#layoutGrid .layout-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.layout === state.layout);
  });
  document.querySelectorAll('#gradeRow .grade-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.grade === state.grade);
  });
  document.querySelectorAll('#sizeRow .size-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.size === state.size);
  });
}

// Builds the preset buttons.
function buildPresetGrid() {
  const grid = document.getElementById('presetGrid');
  grid.innerHTML = '';
  Object.entries(PRESETS).forEach(([key, p]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'preset-btn';
    b.dataset.preset = key;
    b.innerHTML = '';
    const title = document.createElement('b');
    title.textContent = p.title;
    const sub = document.createElement('span');
    sub.textContent = `${p.label} · ${LAYOUTS[p.layout].label}`;
    b.appendChild(title);
    b.appendChild(sub);
    b.addEventListener('click', () => applyPreset(key));
    grid.appendChild(b);
  });
}

// Builds the layout buttons (10).
function buildLayoutGrid() {
  const grid = document.getElementById('layoutGrid');
  grid.innerHTML = '';
  Object.entries(LAYOUTS).forEach(([key, def]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'layout-btn';
    b.dataset.layout = key;
    b.textContent = def.label;
    b.addEventListener('click', () => {
      state.layout = key;
      state.preset = '';
      syncInputs();
      buildPanelList();
      render();
    });
    grid.appendChild(b);
  });
}

// Builds the grade swatches (8).
function buildGradeRow() {
  const row = document.getElementById('gradeRow');
  row.innerHTML = '';
  Object.entries(GRADES).forEach(([key, g]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'grade-btn';
    b.dataset.grade = key;
    b.title = g.label;
    b.setAttribute('aria-label', g.label);
    b.style.background = g.swatch;
    b.addEventListener('click', () => {
      state.grade = key;
      syncInputs();
      render();
    });
    row.appendChild(b);
  });
}

// The photo menu options for a panel: the 12 samples, then user photos.
function photoOptions() {
  const opts = SAMPLES.map((s) => ({ value: s.src, label: s.src.split('/').pop() }));
  userPhotos.forEach((u) => opts.push({ value: u.src, label: `★ ${u.name}` }));
  return opts;
}

// Builds one editable card per panel the current layout uses.
function buildPanelList() {
  const list = document.getElementById('panelList');
  list.innerHTML = '';
  const def = LAYOUTS[state.layout] || LAYOUTS['key-art'];
  const n = def.panels.length;
  for (let i = 0; i < n; i++) {
    const slot = state.panels[i];
    const card = document.createElement('div');
    card.className = 'panel-card';
    const h = document.createElement('h3');
    h.textContent = `Panel ${i + 1}${i === 0 ? ' — hero' : ''}`;
    card.appendChild(h);

    const sel = document.createElement('select');
    sel.setAttribute('aria-label', `Panel ${i + 1} photo`);
    photoOptions().forEach((o) => {
      const opt = document.createElement('option');
      opt.value = o.value;
      opt.textContent = o.label;
      if (o.value === slot.src) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      slot.src = sel.value;
      const s = SAMPLES.find((x) => x.src === sel.value);
      if (s) {
        slot.role = s.role;
        slot.place = s.place;
        slot.time = s.time;
        slot.flavor = s.flavor;
      }
      loadImage(sel.value).then(() => render());
      buildPanelList();
      render();
    });
    const selLabel = document.createElement('label');
    selLabel.textContent = 'Photo';
    selLabel.appendChild(sel);
    card.appendChild(selLabel);

    const grid3 = document.createElement('div');
    grid3.className = 'grid3';
    [['Role', 'role', 16], ['Place', 'place', 20], ['Time', 'time', 10]].forEach(([label, key, max]) => {
      const lab = document.createElement('label');
      lab.textContent = label;
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.maxLength = max;
      inp.value = slot[key];
      inp.addEventListener('input', () => { slot[key] = inp.value; render(); });
      lab.appendChild(inp);
      grid3.appendChild(lab);
    });
    card.appendChild(grid3);

    const flavLabel = document.createElement('label');
    flavLabel.textContent = 'Story line';
    const flav = document.createElement('input');
    flav.type = 'text';
    flav.maxLength = 32;
    flav.value = slot.flavor;
    flav.addEventListener('input', () => { slot.flavor = flav.value; render(); });
    flavLabel.appendChild(flav);
    card.appendChild(flavLabel);

    [['Zoom', 'zoom', 1, 1.8, 0.05], ['Pan X', 'px', 0, 1, 0.01], ['Pan Y', 'py', 0, 1, 0.01]].forEach(([label, key, min, max, step]) => {
      const row = document.createElement('div');
      row.className = 'slider-row';
      const lab = document.createElement('span');
      lab.textContent = label;
      const range = document.createElement('input');
      range.type = 'range';
      range.min = String(min);
      range.max = String(max);
      range.step = String(step);
      range.value = String(slot[key]);
      range.setAttribute('aria-label', `Panel ${i + 1} ${label}`);
      range.addEventListener('input', () => { slot[key] = parseFloat(range.value); render(); });
      row.appendChild(lab);
      row.appendChild(range);
      card.appendChild(row);
    });

    list.appendChild(card);
  }
}

// Adds user photos from a FileList: object URLs, shown in the menus and
// assigned to the first panels in order.
function addUserFiles(files) {
  let added = 0;
  Array.from(files || []).forEach((f) => {
    if (!f.type || f.type.indexOf('image/') !== 0) return;
    const url = URL.createObjectURL(f);
    userPhotos.push({ src: url, name: f.name });
    const slot = state.panels[added % state.panels.length];
    slot.src = url;
    slot.role = '';
    slot.place = f.name.replace(/\.[^.]+$/, '').toUpperCase().slice(0, 20);
    slot.time = '';
    slot.flavor = 'YOUR PHOTO';
    loadImage(url).then(() => render());
    added++;
  });
  if (added > 0) {
    buildPanelList();
    render();
  }
  return added;
}

// Wires every control to the state.
function bindEditor() {
  buildPresetGrid();
  buildLayoutGrid();
  buildGradeRow();
  buildPanelList();

  const on = (id, ev, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(ev, fn);
  };
  on('inTitle', 'input', (e) => { state.title = e.target.value.toUpperCase(); render(); });
  on('inTagline', 'input', (e) => { state.tagline = e.target.value; render(); });
  on('inLocation', 'input', (e) => { state.location = e.target.value.toUpperCase(); render(); });
  on('inQuote', 'input', (e) => { state.quote = e.target.value.toUpperCase(); render(); });
  on('inQuoteSource', 'input', (e) => { state.source = e.target.value.toUpperCase(); render(); });
  on('inStars', 'input', (e) => { state.quoteStars = parseInt(e.target.value, 10) || 5; render(); });
  on('inTitleStyle', 'change', (e) => { state.titleStyle = e.target.value; render(); });
  on('inVol', 'input', (e) => { state.vol = e.target.value.toUpperCase(); render(); });
  on('inBarText', 'input', (e) => { state.barText = e.target.value.toUpperCase(); render(); });
  on('inCredit', 'input', (e) => { state.credit = e.target.value.toUpperCase(); render(); });
  on('inWanted', 'change', (e) => { state.wanted = e.target.checked; render(); });
  on('inSeal', 'change', (e) => { state.seal = e.target.checked; render(); });
  on('inCollectors', 'change', (e) => { state.collectors = e.target.checked; render(); });
  on('inRibbon', 'change', (e) => { state.ribbon = e.target.checked; render(); });
  on('onePhoto', 'change', (e) => { state.onePhoto = e.target.checked; render(); });

  document.querySelectorAll('#sizeRow .size-btn').forEach((b) => {
    b.addEventListener('click', () => {
      state.size = b.dataset.size;
      syncInputs();
      render();
    });
  });

  on('exportOne', 'click', () => exportPNG(state, state.size));
  on('exportAll', 'click', () => exportAll(state, document.getElementById('exportNote')));
  on('loadSamples', 'click', () => {
    applyPreset(state.preset || 'sunset-chase');
    preloadSamples().then(() => render());
  });
  on('uploadInput', 'change', (e) => {
    addUserFiles(e.target.files);
    e.target.value = '';
  });

  // Drag and drop onto the preview.
  const wrap = document.querySelector('.canvas-wrap');
  const hint = document.getElementById('dropHint');
  if (wrap) {
    ['dragenter', 'dragover'].forEach((ev) => wrap.addEventListener(ev, (e) => {
      e.preventDefault();
      if (hint) hint.classList.add('show');
    }));
    ['dragleave', 'drop'].forEach((ev) => wrap.addEventListener(ev, (e) => {
      e.preventDefault();
      if (hint) hint.classList.remove('show');
    }));
    wrap.addEventListener('drop', (e) => addUserFiles(e.dataTransfer.files));
  }
}
