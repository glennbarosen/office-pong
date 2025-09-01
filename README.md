# Office Pong Leaderboard

A mobile-first ping pong leaderboard app for the office! 🏓

_Vibe coded for maximum fun and minimal complexity._

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

# Run tests
pnpm test

# Check TypeScript
pnpm types:check

# Format code
pnpm prettier

# Check code formatting
pnpm prettier:check

# Lint code
pnpm lint
```

## Tech Stack

- **React 18** with TypeScript
- **TanStack Router** for file-based routing
- **TanStack Query** for state management
- **Jøkul Design System** for UI components
- **Tailwind CSS** + **Sass** for styling
- **Supabase** for database and backend
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
│   ├── dataService.ts # Data fetching service
│   ├── eloService.ts  # ELO rating calculations
│   ├── matchService.ts # Match operations
│   ├── supabase.ts    # Supabase client and types
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

The app uses **Supabase** as the backend database for storing players, matches, and calculating ELO ratings. The database schema is fully typed with TypeScript for type safety.

### Environment Setup

Create an `env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Testing

Unit tests are written with **Vitest** and **Testing Library**. Run tests with:

```bash
pnpm test
```

## Contributing

This is an internal office app - contributions and improvement suggestions are welcome!
