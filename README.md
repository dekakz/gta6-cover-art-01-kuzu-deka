[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/dekakz/gta6-cover-art-01-kuzu-deka/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/dekakz/gta6-cover-art-01-kuzu-deka/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Solmar Bay — Cover Studio

A GTA 6-style cover art maker that runs entirely offline in desktop Chrome. Pick one of four one-click presets (Sunset Chase, Neon Vice, Coral Heat, Palm Noir), or build your own: 10 multi-panel layouts, 8 sunset/neon colour grades, 12 AI-generated sample photos plus your own uploads, per-panel crop/zoom/pan, editable role tags and story captions, a giant striped sunset title with 3D depth, a script tagline, a press-quote chip, WANTED pill, VOL chip, gold seal, barcode and credit strip — and one-click PNG export in all three post sizes (1080 × 1080, 1080 × 1350, 1920 × 1080).

Everything is original: no Rockstar Games logo, artwork, or font. The fonts (Anton, Bebas Neue, Pacifico, Oswald) ship under the SIL Open Font License, and the sample photos were made with an image model. Photos you load never leave your machine.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## How it works

1. Pick a preset, a layout, and a grade.
2. Click a panel to edit it: choose a photo (or upload your own), set its role tag and caption, crop with zoom and pan.
3. Edit the title, tagline, and press quote — the chips dodge the title, the WANTED pill, and each other, so nothing ever overlaps.
4. Export one PNG, or all three sizes at once.

## Layout

- `main.ts` — entrypoint: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`.
- `app/index.html`, `app/style.css` — editor shell and styling.
- `app/src/layouts.js` — 10 panel layouts (Key Art, Duo Split, Triple Strip, Quad Grid, Hero Bottom, Hero Top, Diagonal, Magazine, Wide Banner, Portrait Stack).
- `app/src/grades.js` — 8 colour grades with title-band palettes.
- `app/src/photos.js` — 12 sample photos, cover-fit crop/pan.
- `app/src/lettering.js` — striped/gradient 3D title, script tagline, press-quote chip.
- `app/src/stickers.js` — WANTED pill, VOL chip, gold seal, barcode, bottom strip, palms.
- `app/src/cover.js` — full renderer with dodge-aware chip placement.
- `app/src/export.js` — PNG export in 1080 × 1080, 1080 × 1350, 1920 × 1080.
- `app/src/editor.js` — state, 4 presets, control wiring.
- `app/src/shots.js`, `app/src/main.js` — screenshot presets and boot.
- `app/fonts/` — Anton, Bebas Neue, Pacifico, Oswald (SIL OFL).
- `app/samples/` — 12 AI-generated photos.
- `screenshots/` — the cover and the editor at work.
