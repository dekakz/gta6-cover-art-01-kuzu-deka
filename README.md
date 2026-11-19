[![make.fun — Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/dekakz/gta6-cover-art-01-kuzu-deka/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/dekakz/gta6-cover-art-01-kuzu-deka/reward.svg)](https://make.fun/c/gta6-cover-art-01)

# Solmar Bay Cover Studio

A GTA-style cover art maker for make.fun's **Make GTA 6 Cover Art** bounty. Turn your own photos into a multi-panel sunset-city poster — bold gradient title, script tagline, skyline strip and stickers — and export it in all three post sizes at once.

- **9 layouts** — Hero 5 (1 big + 4 small), Grid 9, Split 4, Tilt diagonals, Full Bleed, Duo, Triptych, Magazine, Skyline Band
- **8 colour grades** — Sunset, Neon Vice, Coral Heat, Palm Dusk, Midnight, Golden Hour, Halftone, Noir (canvas duotone/tint overlays, vignette, grain)
- **Lettering** — auto-fitting condensed title with gradient fill, black outline and drop shadow (Anton), Pacifico script tagline, Oswald location label and tagline bar; optional halftone-dot title effect
- **Stickers** — EST. 2026 starburst, NEW badge, diagonal ribbon, COLLECTORS EDITION pill, 1–5 star rating
- **Photos** — file upload (multiple), drag-and-drop, 6 bundled original sample photos; per-panel photo assignment, per-panel crop/zoom/pan (drag on the canvas or sliders); one photo across all panels or a different photo per panel
- **Export** — one click exports all three sizes at once as PNGs: 1080×1080, 1080×1350, 1920×1080, plus individual size buttons
- **One-click posters** — 4 preset combos (Sunset Chase, Neon Vice, Coral Heat, Halftone Noir)

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network at runtime: every script, font and image is a file under `app/`. Fonts are SIL OFL (Anton, Oswald, Bebas Neue, Pacifico — see `app/fonts/OFL.txt`). Sample photos are original AI-made images; no Rockstar logos, artwork, characters or fonts are used anywhere.

## Screenshots

1. `screenshots/1-cover.jpg` — exported 1920×1080 landscape cover (Hero 5, Sunset grade)
2. `screenshots/2-editor.jpg` — the editor in a browser with photos loaded
3. `screenshots/3-cover.jpg` — exported 1080×1350 portrait cover (Grid 9, Neon Vice grade)
4. `screenshots/4-cover-square.jpg` — exported 1080×1080 square cover (Magazine, Coral Heat grade)
