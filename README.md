# VezMat (MatRogueLike)

Roguelike math game prototype for grade-6 students.
Stack: React + TypeScript + Vite + Tailwind (utility classes + custom CSS).

## Current Features

- Login with player name.
- Tower selection (2 dummy towers).
- Run loop: room -> combat/chest/empty -> miniboss -> boss.
- Combat with timer, answer options, items, and enemy HP.
- Equivalent answer check for fractions (example: `1/2` equals `2/4`).
- Reward/chest item flow.
- HUD with minimap + health bar.
- Separate `runStats` and `sessionStats`.
- Settings with local persistence (timer length, sound toggle, reduced motion).

## Local Run

```powershell
npm install
npm run dev -- --host
```

Open `http://localhost:5173/`.

## Environment Configuration

Copy `.env.example` to `.env` and adjust values when needed.

```powershell
Copy-Item .env.example .env
```

Available variables:
- `VITE_API_MODE` - `mock` or `real`
- `VITE_API_BASE_URL` - backend base URL
- `VITE_API_TIMEOUT_MS` - HTTP timeout in milliseconds

## Quality Checks

```powershell
npm run lint
npm run build
```

## Project Structure (important parts)

- `src/types/game.ts` - core domain types (`GameState`, `PlayerStats`, `GameSettings`, `Problem`, `Item`).
- `src/hooks/useGameState.ts` - central reducer + game flow + localStorage persistence.
- `src/services/api/` - API client abstraction (`mock` and `real` adapters).
- `docs/backend-contract.md` - draft backend contract for run/problem endpoints.
- `src/components/CombatScreen.tsx` - battle UI, timer UX, answer handling.
- `src/screens/SettingsScreen.tsx` - user-configurable settings.

## Next Milestones

### 1) Backend + Database integration

- Introduce backend API for:
  - player profile
  - generated problems
  - run history/statistics
- Recommended first API contract:
  - `POST /api/runs/start`
  - `POST /api/runs/{id}/answer`
  - `POST /api/runs/{id}/finish`
  - `GET /api/problems/next?topic=fractions&difficulty=2`

### 2) Kubernetes deployment

- Containerize frontend (`Dockerfile`) and serve static build via Nginx.
- Add manifests/Helm chart for:
  - `Deployment`
  - `Service`
  - `Ingress`
  - config via `ConfigMap` (API base URL)

### 3) Problem generation pipeline

- Start with deterministic template generator (fractions, decimals, multiplication).
- Add difficulty tiers per floor.
- Keep answer canonicalization in one shared utility module.

### 4) Art and backgrounds

- Keep placeholder UI for now.
- Replace with hand-drawn assets in incremental passes:
  1. screen backgrounds
  2. wizard + enemy sprites
  3. item icons and room markers
