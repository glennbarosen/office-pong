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

# Check TypeScript
pnpm types:check

# Format code
pnpm prettier
```

## Tech Stack

- **React 18** with TypeScript
- **TanStack Router** for file-based routing
- **TanStack Query** for state management
- **Jøkul Design System** for UI components
- **Tailwind CSS** for styling
- **Vite** for fast development

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── navigation/    # Bottom navigation
│   ├── header/        # Top header
│   ├── layout/        # Layout components
│   └── links/         # Router links
├── hooks/             # Custom React hooks
├── pages/             # Main pages
│   ├── Leaderboard.tsx # Rankings
│   ├── Profile.tsx     # Player profile
│   └── NewMatch.tsx    # Register new match
├── routes/            # TanStack Router routes
├── types/             # TypeScript types
├── data/              # Local JSON database
└── utils/             # Helper functions
```

## Development

The app uses a local JSON file (`src/data/db.json`) as a database for rapid prototyping. In the future, this can be replaced with Supabase or another backend.

## Contributing

This is an internal office app - contributions and improvement suggestions are welcome!
