# Sentinel

A modern, static status dashboard that tracks whether my apps are up and how
they're performing. Built with **Next.js 16** (App Router, static export) and
deployed to **GitHub Pages** at
[vinersar31.github.io/sentinel](https://vinersar31.github.io/sentinel).

## How it works

GitHub Pages only serves static files, so there's no server to ping the apps.
Instead:

1. An hourly **GitHub Action** (`monitor.yml`) runs `scripts/monitor.ts`, which
   checks every app in `config/sites.ts` and records the result.
2. Results are written to JSON under `public/data/` (latest snapshot, per-app
   history, and incidents) and committed back to the repo.
3. The commit triggers a **rebuild + redeploy**, baking the latest data into the
   static site.
4. The dashboard reads that data and also offers a client-side **"Check now"**
   live ping for an instant reachability signal.

```
monitor.yml (hourly) ──► probe apps ──► public/data/*.json ──► commit
        └────────────────────────────────► build & deploy ──► GitHub Pages
```

## Metrics

- Up / down status and HTTP status code
- Response time, with a recent-history sparkline
- Uptime % over 24h / 7d / 30d
- Last-checked time (auto-refreshing)
- Incident history (when an app went down and for how long)

## Add or change an app

Edit [`config/sites.ts`](config/sites.ts) — it's the single source of truth for
both the monitor and the dashboard:

```ts
export const sites: Site[] = [
  { id: "my-app", name: "My App", url: "https://example.com", description: "…" },
];
```

Tuning knobs live in the same file: `UP_STATUS_THRESHOLD` (default `< 400` =
up), `HISTORY_RETENTION_DAYS` (default `30`), and `CHECK_TIMEOUT_MS`.

## Local development

```bash
npm install
npm run monitor   # probe the apps and refresh public/data
npm run dev       # http://localhost:3000
npm run build     # static export to ./out
```

## One-time GitHub Pages setup

In the repository: **Settings → Pages → Build and deployment → Source:
GitHub Actions**. After the first push to `main`, the `Deploy` workflow
publishes the site; the `Monitor` workflow then keeps it updated hourly (you can
also run it manually from the Actions tab).

