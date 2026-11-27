# Kich.dev.br - Otávio Kich Mata

Personal hub of Otávio Kich Mata: International Relations at UFSC, migration research, browser games and a Power BI dashboard.

Live site: [https://kich.dev.br](https://kich.dev.br)

## Pages and files

The page is a TV with nine channels ("Nove canais"). They keep their numbers, so the dial skips 03 and 07. Each section is drawn in its own style, and every one ends with a museum label (`.placa`) naming the style and how it is made. The gralha-azul shows up in every channel, drawn the way that channel draws. Between channels runs a strip of TV static, and the bar at the top shows the channel on screen.

- `index.html`: markup and copy. Every text exists in Portuguese and English (`data-l="pt"` / `data-l="en"`); the PT/EN switch remembers the choice.
- `assets/v3/base.css`: what all channels share: the OSD bar, the static, the placa, hidden pinhões, the newspaper TV guide ("Programação"), the lightbox and the tube switching off.
- `assets/v3/chNN-*.css`: one file per channel, with that channel's drawing rules.
- `assets/v3/main.js`: what crosses channels (OSD, guide, pinhão hunt, lightbox, e-mail) and the small per-channel touches. `core.js` holds the shared helpers and the PT/EN strings used by scripts.
- `assets/v3/ch01-sala.js`, `ch02-kapi.js`, `ch05-passaporte.js`, `ch09-ficha.js`: the channels with engines of their own.
- `assets/v3/pixel-room.js` and `assets/v3/img/`: generated art: the 72 × 72 room (as text, one character per pixel), the TV de tubo marks and favicons, cursors, the RPG hand, the capybara passport photo, the cordel woodcut and the share image `og.png`.
- `assets/v3/print.css`: "Salvar em PDF" prints only the CV, in its Swiss document form.
- `assets/js/character-renderer.js`: copy of `kapistudios/assets/js/character-renderer.js`, the game's own character renderer, loaded only when the RPG status screen shows.
- `tools/pixel/`: the Python that draws the room, the marks and the small art (`export_v3.py <assets/v3>` and `assets_v3.py <assets/v3/img>`, with Pillow), and `og.html`, the share image template (render it at 1200 × 630 with the site served on port 3013). Not deployed.
- `jogos.html`: the previous games portal (not linked from the hub).

The channels:

| CH | Section | Style |
|---|---|---|
| 01 | Sala (hero) | 16-bit pixel art. A capybara and a quero-quero play War on a TV de tubo; the TV previews the other channels. The dice (War rules, ties to the defence), the animals, the knob and the cuia answer clicks. |
| 02 | Kapi Online | Strong ink lines and copper rim light over the frosted glass wedge. The cursor wipes the frost; its amount follows the temperature in São Joaquim, SC (Open-Meteo, free, no key). Wedge shape: `--lt`, `--rt`, `--lb`, `--rb` on `.ch-kapi`. To swap the video, change `#kapi-video` and the button's `data-video`. |
| 04 | Pesquisa | Pen-and-paper notebook: handwriting, taped slips, rubber stamps, highlighter. |
| 05 | Passaporte | Guilloché security print, ink stamps, typed entries and a split-flap departures board for the languages. |
| 06 | Painel Sul-Sul | Two-colour risograph; the Global South criterion toggle swaps the inks. |
| 08 | Fliperama | Manga page; the gameplay videos turn from black and white to colour on hover. |
| 09 | Ficha | 16-bit RPG status screen with the live Frost Champion, or the same CV as a Swiss document. |
| 10 | Cordel | Woodcut chapbook: the deleted TikTok channel, in verse. |
| 11 | Contato | Test pattern; a button switches the tube off. |

Pinhão hunt: one hidden pinhão per channel, drawn in that channel's style (`data-seed` buttons), counted in the OSD bar and saved in `localStorage` (`kich-seeds-v3`). Finding all 9 unlocks "Mata completa" in the RPG feats.

Everything respects `prefers-reduced-motion`: no autoplay, no channel surfing on the TV, no flips, no stamps landing.

## Featured Games

- **2MMORPG**: Classic 2D Action-RPG MMORPG running in real-time WebSockets with spatial chunking, procedural skeletal animations, dynamic PvE & PvP, and equipment progression.
- **Pinball Heroes**: Arcade pinball physics engine blended with RPG monster encounters, bumpers, flippers, and kinetic score multipliers.
- **Clair Tactics**: Isometric turn-based tactical strategy RPG on a living hexagonal grid with hero positioning and abilities.

## Key Architecture & Features

- **Interactive Canvas Previews**:
  - Live simulated canvas demos directly on game cards (procedural combat animations, pinball physics simulation, isometric tactics cursor grid).
- **Embedded HD Video Showcases**:
  - In-card video loop previews and full-screen HD modal previews for each game.
- **Terminal Command Palette**:
  - Press `Ctrl + K` (or `/`) to open an interactive command palette supporting instant search, category filtering, theme switching, and quick navigation.
- **Lineless Dark Aesthetic**:
  - Tailored color gradients, subtle laser border angles, backdrop blurs, and glassmorphic card treatments.
  - Zero emojis used across the codebase, UI, and styling.
- **Privacy & Cookie Control**:
  - Native CookieHub integration and Google Analytics tracking.

## Local Development

Run the portal locally using Vite:

```bash
# Install dependencies
npm install

# Start local dev server (port 3003)
npm run dev

# Or serve directly
npm run serve
```

## Production Build

```bash
npm run build
npm run preview
```

## Repository & Synchronization

This project is maintained as a standalone satellite repository synchronized from the primary MMORPG workspace:

- **Upstream Repository**: [https://github.com/tavmata/myhub](https://github.com/tavmata/myhub)
- **Deployment**: Automatic GitHub Pages / custom domain routing to `kich.dev.br`.

## License

MIT
