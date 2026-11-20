# Solmar Bay Cover Studio v3

A static web app that turns your own photos into GTA-style multi-panel
cover art: giant striped key-art lettering over the photos, per-panel role
tags and story captions, a press-quote chip, WANTED / VOL. / seal stickers,
and one-click PNG export in 1080x1080, 1080x1350 and 1920x1080.

## Run it

```
node serve.ts
```

Then open `http://localhost:8080` in desktop Chrome. Everything is local:
no network requests, no build step, no uploads — photos are read on your
own machine.

## Use it

1. Click **Load the 12 sample photos** (or drop in your own photos).
2. Pick a preset (Sunset Chase, Neon Vice, Coral Heat, Palm Noir), a layout
   (10) and a colour grade (8).
3. Edit the title, tagline, quote, and each panel's role, place, time and
   flavour; drag the zoom / pan sliders to crop each photo.
4. Click **Export all 3 sizes** — three PNGs download at once.

## What is inside

- `app/index.html` — the editor page (preview canvas + controls).
- `app/style.css` — layout, fonts, controls.
- `app/src/layouts.js` — 10 panel layouts (key-art default).
- `app/src/grades.js` — 8 colour grades with striped title bands.
- `app/src/photos.js` — the 12 sample photos, cover-fit crop/pan.
- `app/src/lettering.js` — striped 3D title, script tagline, quote chip.
- `app/src/stickers.js` — WANTED pill, VOL. chip, gold seal, barcode.
- `app/src/cover.js` — the full canvas renderer.
- `app/src/export.js` — PNG export in the three post sizes.
- `app/src/editor.js` — state, presets, and all editor controls.
- `app/src/shots.js` — screenshot presets (`?shot=cover|editor|portrait|square`).
- `app/src/main.js` — boot.
- `app/fonts/` — Anton, Bebas Neue, Pacifico, Oswald (SIL OFL).
- `app/samples/` — 12 original photos made with an image model.
- `main.ts` — hands the app in (copies app/ + screenshots/, writes dossier.json).

## Originality

All lettering, captions, quotes and photos are original. No Rockstar Games
logo, artwork, character or font is used anywhere.
