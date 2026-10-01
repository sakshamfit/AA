# Deployment

The application uses React, Vinext/Vite and Three.js. Every component is a client
component, there are no API routes or server actions, so the production build
pre-renders the whole site to static files in `dist/client`. That static output is
what you deploy, and it works on any static host — Vercel included.

## Vercel (recommended, already configured)

`vercel.json` in the repository root pins everything Vercel needs:

| Setting | Value |
| --- | --- |
| Framework preset | `null` (do **not** let Vercel auto-detect Next.js or Vite) |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` |
| Output directory | `dist/client` |

### Why the framework preset is disabled

This project is not built by `next build` and it is not a plain `vite build` either.
It is built by Vite/Vinext through `scripts/run-framework.mjs`, which writes the
pre-rendered site to `dist/client`. If Vercel auto-detects the preset it looks for
`dist/index.html`, finds nothing there, and serves **404 NOT_FOUND**. Disabling
auto-detection and setting the output directory explicitly is what fixes that.

### Deploy

1. In Vercel, import the GitHub repository `sakshamfit/AA`.
2. Leave **Root Directory** as the repository root.
3. Leave **Production Branch** as `main`.
4. Do not override the build settings — `vercel.json` supplies them.
5. Deploy.

No environment variables, database, or external media service are required. All
images and videos are committed to the repository, so nothing needs downloading.

If Vercel does not pick up pnpm automatically, add
`npm install --global pnpm@11.25.0` to the install command. The `packageManager`
field in `package.json` pins pnpm 11.25.0 and `.nvmrc` pins Node.js 22.

## Cloudflare Workers

The static output also deploys to Cloudflare. The build still emits the Worker
configuration alongside the static assets.

1. In your Cloudflare account, create a Worker using the GitHub repository `sakshamfit/AA`.
2. Select the `main` branch and the repository root as the working directory.
3. Use Node.js 22.13 or newer and pnpm 11.25.0.

| Setting | Value |
| --- | --- |
| Dependency installation | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` |
| Deploy command | `pnpm exec wrangler deploy --config dist/server/wrangler.json --name allu-arjun-cinematic` |

## Deploy from a terminal

```sh
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm build
```

Then deploy `dist/client` with the CLI of your host. For Vercel:

```sh
pnpm exec vercel deploy --prebuilt
```

For Cloudflare:

```sh
pnpm exec wrangler login
pnpm exec wrangler deploy --config dist/server/wrangler.json --name allu-arjun-cinematic
```

## Production output

- `dist/client/index.html`: the pre-rendered homepage.
- `dist/client/404.html`: the pre-rendered not-found page.
- `dist/client/_next/`: bundled JavaScript and CSS.
- `dist/client/images/`, `dist/client/videos/`: all public assets, including the videos.
- `dist/server/`: Worker entry point and generated configuration, used only by the Cloudflare path.

Build output is regenerated and excluded from Git.

## Checking before deployment

```sh
pnpm typecheck
pnpm build
```

To preview the exact static output Vercel will serve:

```sh
pnpm build
python3 -m http.server 8080 --directory dist/client
```

Open http://localhost:8080. Check the mobile menu, scroll through the film scenes,
and confirm muted autoplay. All images, geometry and videos are committed locally
in this repository.
