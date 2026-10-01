# Allu Arjun — Beyond the Frame

A cinematic Allu Arjun fan site with an animated 3D AA signature, scroll-driven film panels, and silent native video loops.

## Run locally

Requires Node.js 22.13 or newer and pnpm 11.25.

```sh
git clone https://github.com/sakshamfit/AA.git
cd AA
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by the development server (normally http://localhost:5173).

```sh
pnpm typecheck
pnpm build
pnpm start
```

Every component is a client component and there are no API routes or server actions, so the production build pre-renders the entire site into static files in `dist/client`. That output can be hosted anywhere, Vercel included. The build also still emits the Cloudflare Worker files in `dist/server`.

This repository contains the complete source, 3D geometry, styles, all 13 project images and all 9 local MP4 clips, including additional Pushpa footage. No Git LFS setup or separate asset download is needed. Dependencies and generated build caches are rebuilt from the source and lockfile.

## Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md). Vercel is configured out of the box through `vercel.json`: build with `pnpm build`, output directory `dist/client`. Cloudflare Workers deployment is documented there too. No API keys or database are required by the website itself.

After signing in to your Cloudflare account:

```sh
pnpm exec wrangler login
pnpm deploy
```

The deploy command builds the project and deploys `dist/server/wrangler.json` under the Worker name `allu-arjun-cinematic`.

## Editing guide

| File | Purpose |
| --- | --- |
| `app/page.tsx` | Film lineup, copy, scene layout and scrolling |
| `app/globals.css` | Colors, sizing and responsive layouts |
| `app/sculpture.tsx` | 3D AA rendering and fallback |
| `app/aa-shape.json` | AA geometry; generator in `scripts/build-aa-geometry.mjs` |
| `app/motion.ts` | Shared animation state |
| `app/film-loop.tsx` | Muted autoplay and scene-aware playback |
| `app/soundtrack.ts` | Sarrainodu anthem: composition, synth voices, offline render, playback controller |
| `app/sound-bridge.tsx` | Autoplay attempt, bottom-left Stop control, volume slider |
| `app/layout.tsx` | Page metadata and viewport settings |
| `public/images/`, `public/videos/` | Locally hosted media |

Original UI components, build helpers and vendor license notices are included. `ASSET_SOURCES.json` records media provenance; `MOTION_REFERENCE.md` documents the animation reference.

## Automatic playback

RAAKA, Pushpa 2, DJ, Sarrainodu, Ala Vaikunthapurramuloo, and Race Gurram each have their own silent loop. The DJ and Sarrainodu focus panels and the final Allu Arjun portrait also start automatically. No YouTube embed, play button, or resume switch is needed. Footage pauses while its scene is offscreen or the browser tab is hidden, then resumes automatically on return. Playback uses muted, inline H.264 MP4 for broad browser compatibility. Device-level autoplay restrictions can still override browser playback.

## Sarrainodu soundtrack

The site opens with music: an eight-bar *Sarrainodu* anthem loop (104 BPM) that starts automatically with the page and can be stopped from the dock pinned to the bottom-left corner.

- `app/soundtrack.ts` composes and renders the loop with the Web Audio API — dhol, ketti-style reed lead, brass stabs, ghungroo bells, sub bass and a crowd bed. It is pre-rendered once in an `OfflineAudioContext`, so playback is a single looping buffer: no JS timers to glitch when a tab is backgrounded, and the reverb tail is folded onto the head so the repeat point is seamless.
- The film's songs are owned by Lahari Music, so no film recording is bundled or streamed here. The loop is an original theme in the same mass-folk spirit — no melody, hook or recording from the film is reproduced.
- Hold the rights to the real track? Publish it at `public/audio/sarrainodu.mp3` and the site detects it on load and plays that instead, with the same controls (see `public/audio/README.md`).

`app/sound-bridge.tsx` owns the interface and the autoplay handshake:

- **Corner dock, bottom-left.** Track name, live meter, volume slider and **STOP**. Stop fades out in 350 ms and releases the audio graph; the same button turns into PLAY to start again.
- **Autoplay, honestly.** Browsers refuse unmuted audio before a visitor interacts with the page, so the site attempts playback immediately and, when that is refused, shows "TAP TO PLAY" and unlocks itself on the next click or key press — the music starts on its own as soon as the browser allows it rather than failing silently.
- **Ducked, not drowned.** The music falls to a quarter of its level while the navigation sheet is open.


Film configuration is in `app/page.tsx`; playback behavior is in `app/film-loop.tsx`; 3D rendering is in `app/sculpture.tsx`.

## Responsive layout and video quality

Videos use full-frame `object-fit: contain` sizing, so the layout never crops the actor's head. Phone film panels keep a 16:9 frame; focus sections stack the video and text; the portrait places its title below the video. Landscape phones use two columns. The layout accounts for display safe areas and stable viewport height.

Phones and touch devices use native touch scrolling. Desktop wheel scrolling uses Lenis. Video elements remain mounted between scenes, preload before arrival, and pause when offscreen. Software 3D rendering holds a still frame behind idle video panels while keeping the geometry responsive to scrolling. WebGL rendering retains its animated reflections.

The DJ, Sarrainodu, Ala Vaikunthapurramuloo and Race Gurram replacement loops use 1280×720, 25 fps excerpts from the official Geetha Arts birthday filmography montage. RAAKA and the portrait retain official Sun Pictures HD footage; Pushpa retains its HD promotional trailer loop. No low-resolution clip has been upscaled and presented as native HD.

`ASSET_SOURCES.json` records provenance. This is an independent fan tribute; media and trademarks remain owned by their respective rights holders.
