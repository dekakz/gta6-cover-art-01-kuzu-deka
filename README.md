[![make.fun — Make GTA 6 Cover Art](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/dekakz/gta6-cover-art-01-kuzu-deka/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/dekakz/gta6-cover-art-01-kuzu-deka/reward.svg)](https://make.fun/c/gta6-cover-art-01)

# Solmar Bay Cover Studio

A GTA-style cover art maker for make.fun's **Make GTA 6 Cover Art** bounty. Turn your own photos into a multi-panel sunset-city poster — a giant gradient title overlapping the photos, script tagline, press quote, per-panel story captions and authentic stickers — and export it in all three post sizes at once.

**v2 (Key Art)** — rebuilt after v1's dev 0.733460 (rank 578): the flat title band is gone. Photos fill the full canvas, the giant title straddles the photo seam with a purple 3D offset, and a thin palm-silhouette strip carries the bar text, credit line and barcode underneath.

- **10 layouts** — Key Art (6-panel collage, the default), Hero 5, Grid 9, Split 4, Tilt diagonals, Full Bleed, Duo, Triptych, Magazine, Skyline Band
- **8 colour grades** — Sunset, Neon Vice, Coral Heat, Palm Dusk, Midnight, Golden Hour, Halftone, Noir (canvas duotone/tint overlays, vignette, grain); each grade also colours the thin bottom strip
- **Lettering** — auto-fitting condensed title with gradient fill, black outline and purple 3D extrusion (Anton), Pacifico script tagline overlapping the title's bottom edge, Oswald location label, press-quote chip with gold stars; optional halftone-dot title effect
- **Panel captions** — every panel gets its own black story chip: PLACE + time + flavor line, editable per panel
- **Stickers** — EST. 2026 starburst on the panel seam, NEW badge, diagonal ribbon (measured so it can never clip), COLLECTORS EDITION pill, WANTED ★★★★★ pill, VOL. chip, 1–5 star rating wired into the quote line
- **Photos** — file upload (multiple), drag-and-drop, 12 bundled original sample photos (6 new key-art photos + 6 v1 photos); per-panel photo assignment, per-panel crop/zoom/pan (drag on the canvas or sliders, pan can never expose an empty edge); one photo across all panels or a different photo per panel
- **Export** — one click exports all three sizes at once as PNGs: 1080×1080, 1080×1350, 1920×1080, plus individual size buttons; exports wait for the bundled fonts so lettering never falls back
- **One-click posters** — 4 preset combos (Sunset Chase, Neon Vice, Coral Heat, Halftone Noir), each with its own quote and captions

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network at runtime: every script, font and image is a file under `app/`. Fonts are SIL OFL (Anton, Oswald, Bebas Neue, Pacifico — see `app/fonts/OFL.txt`). Sample photos are original AI-made images; no Rockstar logos, artwork, characters or fonts are used anywhere.

## Screenshots

1. `screenshots/1-cover.jpg` — exported 1920×1080 landscape cover (Key Art, Sunset grade)
2. `screenshots/2-editor.jpg` — the editor in a browser with photos loaded
3. `screenshots/3-cover.jpg` — exported 1080×1350 portrait cover (Key Art, Neon Vice grade)
4. `screenshots/4-cover-square.jpg` — exported 1080×1080 square cover (Key Art, Coral Heat grade)
