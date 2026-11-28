# scripts

Helper scripts for local development and testing. These are **not** used in production.

## `seed.mjs` — seed test data

Seeds the local database with the scenarios in [`seed-data.json`](./seed-data.json). Re-running it is
safe: groups whose names are already present are skipped in API mode and reset in `--sql` mode.

### Requirements

- Node 18+ (already required for the frontend).
- **API mode (default):** the backend must be running, because the seed goes through
  `POST /api/groups/create` and the backend applies the Flyway schema on startup.
- **`--sql` mode:** a reachable PostgreSQL and `psql`. On Windows, `psql.exe` is located
  automatically even when it is not on `PATH`.

The database `convoke_db` and user `convoke_user` must already exist. Flyway creates the schema and
tables; these scripts do not create the database.

### Usage

From the repo root:

```bash
# Default: seed through the running backend (no psql needed)
node scripts/seed.mjs

# Seed directly through psql (backend can be stopped)
node scripts/seed.mjs --sql

# Show the configured test credentials
node scripts/seed.mjs --list

# Seed just one scenario
node scripts/seed.mjs --only MIKES-FRIENDS
```

### Default scenarios

| Group | Password |
|---|---|
| `MIKES-FRIENDS` | `abc12345` |
| `SECOND-GROUP` | `xyz98765` |

### Options and environment

Run `node scripts/seed.mjs --help` for every flag. Common ones:

| Option | Environment variable | Default |
|---|---|---|
| `--base-url` | `CONVOKE_BASE_URL` | `http://localhost:8080` |
| `--db-host` | `PGHOST` | `localhost` |
| `--db-port` | `PGPORT` | `5432` |
| `--db-name` | `PGDATABASE` | `convoke_db` |
| `--db-user` | `PGUSER` | `convoke_user` |
| `--db-password` | `PGPASSWORD` | `secret` |
| `--schema` | `CONVOKE_DB_SCHEMA` | `convoke_db` |

`--sql` mode uses the `passwordHash` in `seed-data.json`; API mode hashes the plaintext `password`
at runtime. If you change a password, either update its hash (cost-10 BCrypt) or just use the
default API mode.

### Adding a scenario

Append an entry to `groups` in `seed-data.json`:

```json
{
  "name": "EMPTY-GROUP",
  "password": "pass1234",
  "passwordHash": "$2a$10$..."
}
```

Then re-run `node scripts/seed.mjs` (API mode ignores `passwordHash`).
