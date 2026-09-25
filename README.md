# Kich.dev.br - Indie 2D Browser Games Portal

Modern, responsive web games portal created by Otavio Kich showcasing custom 2D browser games developed for instant play without downloads or pay-to-win mechanics.

Live site: [https://kich.dev.br](https://kich.dev.br)

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
