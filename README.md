# Office Pong Leaderboard

A mobile-first ping pong leaderboard app for the office! 🏓

_Vibe coded for maximum fun and minimal complexity._

> AI agents: see [`AGENTS.md`](./AGENTS.md) for architecture, conventions, and gotchas.

## Overview

This app helps you keep track of ping pong matches and rankings at the office with a trust-based system. Players can register match results themselves, and the system automatically calculates ELO ratings.

## Features

- 📱 **Mobile-first design** with bottom navigation
- 🏆 **ELO-based leaderboard** requiring minimum 5 matches
- 👤 **Player profiles** with stats and match history
- ⚡ **Quick match registration** with automatic player creation
- 🎯 **Trust-based system** - no complicated authentication
- 🇳🇴 **Norwegian text** throughout the app (because why not)

## Rules

- First to 11 points wins
- Must win by at least 2 points
- New players start with 1200 ELO
- Minimum 5 matches to appear on leaderboard

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

- SSH access to the Dokku server
- `dokku` git remote configured (should already be set up)

### Deploying a new version

After making changes and committing locally:

```bash
# Push to both GitHub (backup) and Dokku (deploy)
git push origin main && git push dokku main
```

The Dokku server will automatically:
1. Detect the new commits
2. Build a Docker image using the `Dockerfile`
3. Install dependencies with pnpm (using frozen lockfile)
4. Start a new container
5. Run healthchecks to verify the app is working
6. Redirect traffic to the new container
7. Gracefully shut down the old container after 60 seconds

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
├── components/         # Reusable UI components
│   ├── common/        # Common components (DateDisplay, LoadingSpinner, etc.)
│   ├── header/        # Top header
│   ├── layout/        # Layout components (Container, FullBleed)
│   ├── links/         # Router links with Jøkul styling
│   ├── match-card/    # Match card component
│   └── errors/        # Error handling components
├── hooks/             # Custom React hooks
├── lib/               # Core business logic and services
│   ├── eloService.ts  # ELO rating calculations
│   ├── matchService.ts # Match operations
│   ├── validation.ts  # Zod schemas and match validation rules
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
