import pg from 'pg'

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    // Small office app: a handful of connections is plenty, and keeping the
    // ceiling low leaves room for psql and migrations against the same server.
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
})

/**
 * Without this handler, an idle client erroring out — a Postgres restart, or a
 * redeploy of the database — emits an unhandled 'error' event and takes the
 * whole Node process down. The pool discards the client either way.
 */
pool.on('error', (error) => {
    console.error('Unexpected error on idle Postgres client:', error)
})

export { pool }
