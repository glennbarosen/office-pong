# Fremtind kontorpong

A mobile-first ping pong leaderboard app for the office! 🏓

_Vibe coded for maximum fun and minimal complexity._

> AI agents: see [`AGENTS.md`](./AGENTS.md) for architecture, conventions, and gotchas.

## Overview

This app helps you keep track of ping pong matches and rankings at the office with a trust-based system. Players can register match results themselves, and the system automatically calculates ELO ratings.

## Features

- 📱 **Mobile-first design**, navigated via the header and "Se alle" links from the overview
- 🏆 **ELO-based leaderboard**; players need 5 matches before their rating counts, but everyone is listed (tagged "Mangler kamper" until then), with a rating-tier badge (Nybegynner/Ekspert/Mester/Stormester) once they qualify
- 🔥 **Form and streaks** — each player's last five results and current win/loss streak, on the leaderboard and their profile
- 👤 **Player profiles** with stats, match history, and a head-to-head table against every opponent they've faced
- 🖼️ **Avatars** on the profile page — initials on a colour swatch, or a real image if one is set
- ⚡ **Quick match registration** with automatic player creation
- 🎯 **Trust-based system** - no complicated authentication
- 🇳🇴 **Norwegian text** throughout the app (because why not)

## Rules

- First to 11 points wins
- Must win by at least 2 points; past 11 (deuce), the winner's margin must be exactly 2 (12-10, 13-11, ...)
- New players start with 1200 ELO
- Minimum 5 matches before a player is eligible to be ranked — they still appear on the leaderboard before that, sorted last with a "Mangler kamper" tag

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run the built app locally
pnpm start
```

## Deployment

This app is deployed on a self-hosted Dokku server on Hetzner Cloud.

### Prerequisites

- None — deployment is automatic on merge to `main` via GitHub Actions
  (`.github/workflows/deploy.yml`)

### Deploying a new version

Merging to `main` deploys automatically. The GitHub Actions workflow pushes
to Dokku using a dedicated CI deploy key (registered on the Dokku host via
`dokku ssh-keys:add`, stored as the `DOKKU_SSH_PRIVATE_KEY` repo secret —
separate from any personal machine's key so it can be revoked independently).

The Dokku server will automatically:
1. Detect the new commits
2. Build a Docker image using the `Dockerfile`
3. Install dependencies with pnpm (using frozen lockfile)
4. Run `db/migrate.sh` against the app's database (`app.json`'s `predeploy`
   hook) — if this fails, the deploy stops here and the old container keeps
   serving traffic
5. Start a new container
6. Run healthchecks against `/api/health` (`app.json`'s `healthchecks.web`) to
   verify the app is working
7. Redirect traffic to the new container
8. Gracefully shut down the old container after 60 seconds

If CI is down, deploy manually from a machine with SSH access to the Dokku
host:

```bash
ssh personal 'sudo dokku git:sync --build office-pong https://github.com/glennbarosen/office-pong.git main'
```

### Database migrations

Migrations run **automatically on every deploy**, via `app.json`'s
`scripts.dokku.predeploy` hook — Dokku runs `sh db/migrate.sh` in a one-off
container built from the new image, using the app's `DATABASE_URL`, before
any traffic moves to it. If a migration fails, the deploy aborts and the
previous container keeps running; nothing is left half-migrated.

`db/migrate.sh` applies every file in `db/migrations/`, in filename order, and
is safe to re-run — already-applied changes are no-ops. The runtime Docker
image installs `postgresql-client` and copies `db/` in specifically so this
script has what it needs at predeploy time (see `Dockerfile`).

Constraints are added **validated**, so a migration aborts if existing rows
violate one rather than modifying them. That is deliberate — the match history
is the point of the app. Each migration lists pre-flight `SELECT`s in its header
comment; **run those by hand before merging a migration that tightens an
existing rule**, so you're not finding out about violating rows via a failed
production deploy. If a deploy does abort on a migration, that pre-flight
query is where to start.

To apply a migration ahead of the deploy that needs it, or to run one by hand
against production for any other reason:

```bash
# From the Dokku host, against the app's database
dokku postgres:connect <postgres-service> < db/migrations/001_add_indexes.sql

# Or locally, pointing at the production URL
DATABASE_URL="$(dokku postgres:info <postgres-service> --dsn)" pnpm db:migrate
```

### Monitor deployment

Watch logs in real-time:

```bash
ssh root@your-server-ip "dokku logs -f office-pong --tail 100"
```

Or check the latest deployment status:

```bash
ssh root@your-server-ip "dokku ps:inspect office-pong"
```

### App Details

- **URL:** https://kontorpong.glennbarosen.com
- **Server:** Hetzner Cloud (Dokku PaaS)
- **Runtime:** Node.js 24.x
- **Package Manager:** pnpm with lockfile
- **Container Port:** 3000
- **HTTPS:** Let's Encrypt (auto-renews 30 days before expiration)

---


## Tech Stack

- **React 18** with TypeScript
- **TanStack Start** for full-stack SSR + file-based routing
- **TanStack Query** for state management
- **Jøkul Design System** for UI components
- **Tailwind CSS** + **Sass** for styling
- **PostgreSQL** for the database, accessed via TanStack Start server functions
- **Vite** for fast development
- **Vitest** for unit testing
- **ESLint** + **Prettier** for code quality

## Project Structure

```
src/
├── components/         # Reusable UI components, one folder per domain
│   ├── common/        # Shared building blocks (EmptyState, QueryState, LoadingSpinner, PlayerLink, ...)
│   ├── header/         # Top header
│   ├── layout/         # Layout components (Container)
│   ├── leaderboard/    # Leaderboard row/card components (RankIcon, LeaderboardCard)
│   ├── links/          # Router links with Jøkul styling
│   ├── match-card/     # Match row/card component
│   ├── player-card/    # The player-selection card used on the new-match form
│   ├── player-metrics/ # A profile's charts (ELO history, win/loss, opponent stats)
│   └── errors/         # Error handling components
├── hooks/             # Custom React hooks
├── lib/               # Core business logic and services
│   ├── eloService.ts  # ELO rating calculations
│   ├── matchService.ts # Match operations
│   ├── validation.ts  # Zod schemas and match validation rules
│   ├── messages.ts    # Norwegian strings shared across modules
│   ├── server/        # createServerFn DB access (db.ts, players.ts, matches.ts)
│   └── __tests__/     # Unit tests
├── pages/             # Main page components
│   ├── Leaderboard.tsx # Rankings page
│   ├── Profile.tsx     # Player profile page
│   ├── NewMatch.tsx    # Register new match page
│   ├── Matches.tsx     # Match history page
│   └── Overview.tsx    # Overview/dashboard page
├── routes/            # TanStack Router route definitions
├── types/             # TypeScript type definitions
├── utils/             # Helper functions and utilities
├── styles/            # Global styles (SCSS + Tailwind)
└── test/              # Test setup and utilities
```

## Development

The app uses **PostgreSQL** as the backend database for storing players, matches, and calculating ELO ratings, accessed through TanStack Start server functions (`src/lib/server/`).

### Environment Setup

1. Copy the example env file:

    ```bash
    cp .env.example .env
    ```

2. Start a local Postgres instance via Docker Compose (schema is created automatically on first run from `db/init.sql`):

    ```bash
    pnpm db:up
    ```

3. Run the dev server as usual:

    ```bash
    pnpm dev
    ```

Other useful commands:

```bash
pnpm db:down    # stop the local database
pnpm db:reset   # wipe the local database and recreate it from scratch
pnpm db:logs    # tail the database container logs
```

### Testing

Unit tests are written with **Vitest** and **Testing Library**. Run tests with:

```bash
pnpm test
```

## Contributing

This is an internal office app - contributions and improvement suggestions are welcome!
