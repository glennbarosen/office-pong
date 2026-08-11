#!/usr/bin/env sh
# Apply every file in db/migrations/ in filename order against $DATABASE_URL.
#
# Migrations are written to be idempotent, so re-running is safe. There is no
# migration-state table: with a handful of files, `psql -f` in order is enough,
# and adding a framework for it would be more moving parts than schema.
#
# Usage:
#   pnpm db:migrate                      # uses DATABASE_URL from .env
#   DATABASE_URL=postgres://... pnpm db:migrate
set -eu

MIGRATIONS_DIR="$(dirname "$0")/migrations"

# Fall back to .env, which is where local development keeps it.
if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
    DATABASE_URL="$(grep -E '^DATABASE_URL=' .env | head -n 1 | cut -d= -f2-)"
fi

if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL is not set (and no .env found)." >&2
    exit 1
fi

for migration in "$MIGRATIONS_DIR"/*.sql; do
    echo "==> $(basename "$migration")"
    # ON_ERROR_STOP so a failing constraint aborts instead of scrolling past.
    psql "$DATABASE_URL" --set ON_ERROR_STOP=1 --quiet -f "$migration"
done

echo "All migrations applied."
