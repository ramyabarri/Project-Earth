# AI Sustainability Intelligence Platform

Interactive frontend prototype (Digital Twin) demonstrating an AI-powered,
sustainability-aware workload scheduling system for data centers.

Everything is simulated in the browser — no backend, no APIs, no auth.
All assets (3D models, fonts, draco decoder) are bundled locally, so the
app runs fully offline on any machine.

## Features

- **3D Digital Twin** — a data hall with six server clusters (real GLB models),
  straight coolant pipes with flowing pulses, and land terrain outside.
- **Agent Control Room** — a glass meeting room where 4 AI agents
  (Monitoring, Prediction, Scheduling, Sustainability) hold a live discussion
  around a holographic table.
- **Sustainability scheduler** — scores every data center on CPU, water,
  carbon, temperature, and energy; the best one glows green.
- **Human-in-the-Loop** — switch scheduling policy (Balanced / Performance /
  Water / Carbon / Energy First) and watch the recommendation change instantly.
- **Live simulation** — new AI workloads arrive every 5 s, telemetry updates
  every 2 s, KPI dashboard animates in real time.

## Requirements

- Node.js 18+ (20+ recommended)
- npm 9+
- A WebGL2-capable browser (Chrome, Edge, Firefox, Safari)

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Production build

```bash
npm run build
npm run preview   # serves the dist/ folder locally
```

The build uses relative paths (`base: './'`), so `dist/` can be served from
any static file server or subpath — no configuration needed.

## Tech stack

React (Vite) · Three.js · React Three Fiber · drei · Tailwind CSS 4 ·
Framer Motion · Zustand

## Project structure

```
public/
  models/       # GLB models (server clusters, meeting table, agent bot)
  draco/        # local draco decoder (no CDN needed)
src/
  components/
    3d/         # Digital Twin scene (terrain, hall, pipes, agents, ...)
    dashboard/  # page views (Dashboard, Sustainability, HITL, Reports)
    layout/     # sidebar + top navigation
    panels/     # KPI cards, recommendation panel, detail modal
  data/         # mock JSON data (servers, agents, policies)
  hooks/        # simulation loop
  store/        # zustand app store
  utils/        # scheduler scoring + asset path helpers
```
