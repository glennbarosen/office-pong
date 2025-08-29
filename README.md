# RK Admin Frontend

| This is an application for managing system messages across the advisor apps 🚨

## Prerequisites

- Node.js 18+
- PNPM package manager
- SSL certificates in `./certs/` directory (for HTTPS development)

## Set up SSL

If using a Mac, make sure you have installed the "ALLOW - Sudo commands" application in SelfService. If you are having issues, try reinstalling it.

Edit your hosts file to add an entry for our local domain

```
sudo /usr/bin/vi /etc/hosts
```

Add the line

127.0.0.1 local.test.sparebank1.no

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Start with mock data (no backend required)
pnpm dev:mock

# Build for production
pnpm build
```

The app will be available at `https://local.test.sparebank1.no` (requires SSL certificates in `./certs/`).

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── cards/          # Message cards
│   ├── form-fields/    # Form input components
│   ├── header/         # Navigation header
│   └── tags/           # Status/type tags
├── hooks/              # Custom React hooks for API calls
├── pages/              # Main page components
├── routes/             # TanStack Router route definitions
│   ├── _auth/          # Protected routes requiring authentication
│   └── __root.tsx      # Root layout
├── mocks/              # MSW mock data for development
├── types/              # Auto-generated TypeScript types from OpenAPI
└── utils/              # Helper functions and constants
```

## Key Technologies

- **React 18** with TypeScript
- **TanStack Router** for file-based routing with authentication guards
- **TanStack Query** for server state management and caching
- **MSW** for API mocking during development
- **Vite** for fast development and building

## Authentication Flow

1. Protected routes are under `/_auth/` and require user authentication
2. User data is fetched once and cached globally
3. 401 responses automatically invalidate user cache and redirect to login
4. Authenticate by having a active session in `porten.test` or by running backend with `AUTH_BYPASS=true`

## Development

```bash
# Generate types from OpenAPI spec
pnpm types:gen

# Check for Typescript errors
pnpm types:check

# Run tests
pnpm test

# Format code
pnpm prettier

# Check formatting
pnpm prettier:check

# Lint code
pnpm lint
```

## API Integration

- In development, the app proxies `/api/*` requests to `http://localhost:8080` for backend integration
- Use `pnpm dev:mock` to run with mock data (MSW) when backend is unavailable
- API types are auto-generated from OpenAPI spec using `pnpm types:gen`
