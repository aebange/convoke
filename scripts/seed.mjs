#!/usr/bin/env node
// Seeds a local/dev Convoke database with the test scenarios in seed-data.json.
//
// Default mode talks to the running backend over HTTP, so it needs no psql and
// works the same on Windows, macOS, and Linux. It requires the backend to be up
// (which is also what applies the Flyway schema).
//
// --sql mode writes directly through psql. It works with the backend stopped and
// auto-locates psql.exe on Windows (including when it is not on PATH). That path
// needs a reachable database and an already-migrated schema.

import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync, readdirSync} from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SEED_FILE = join(HERE, 'seed-data.json');

const argv = process.argv.slice(2);

function hasFlag(name) {
  return argv.includes(`--${name}`);
}

function option(name, fallback) {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
}

function fail(message) {
  console.error(`\n[seed] ERROR: ${message}\n`);
  process.exit(1);
}

function info(message) {
  console.log(`[seed] ${message}`);
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const useSql = hasFlag('sql');
const baseUrl = option('base-url', process.env.CONVOKE_BASE_URL || 'http://localhost:8080')
  .replace(/\/+$/, '');

const db = {
  host: option('db-host', process.env.PGHOST || 'localhost'),
  port: option('db-port', process.env.PGPORT || '5432'),
  name: option('db-name', process.env.PGDATABASE || 'convoke_db'),
  user: option('db-user', process.env.PGUSER || 'convoke_user'),
  password: option('db-password', process.env.PGPASSWORD || 'secret'),
  schema: option('schema', process.env.CONVOKE_DB_SCHEMA || 'convoke_db'),
};

if (hasFlag('help') || hasFlag('h')) {
  console.log(`
Usage: node scripts/seed.mjs [options]

Default: seed through the running backend at http://localhost:8080 (no psql needed).
--sql:   seed through psql instead (backend may be stopped; psql is auto-located).

Options:
  --sql                  Use psql instead of the HTTP API.
  --base-url <url>       Backend base URL (default: ${baseUrl}).
  --db-host <host>       Database host for --sql (default: ${db.host}).
  --db-port <port>       Database port for --sql (default: ${db.port}).
  --db-name <name>       Database name for --sql (default: ${db.name}).
  --db-user <user>       Database user for --sql (default: ${db.user}).
  --db-password <pass>   Database password for --sql (default: from PGPASSWORD).
  --schema <schema>      Database schema for --sql (default: ${db.schema}).
  --only <name>          Seed only the group with this name.
  --list                 Print the configured scenarios and exit.
  --help                 Show this help.
`);
  process.exit(0);
}

let seed;
try {
  seed = JSON.parse(readFileSync(SEED_FILE, 'utf8'));
} catch (error) {
  fail(`could not read ${SEED_FILE}: ${error.message}`);
}

let groups = Array.isArray(seed.groups) ? seed.groups : [];
const only = option('only', null);
if (only) {
  groups = groups.filter((group) => group.name.toLowerCase() === only.toLowerCase());
  if (groups.length === 0) {
    fail(`no scenario named "${only}" in seed-data.json`);
  }
}

if (groups.length === 0) {
  fail('seed-data.json defines no groups');
}

if (hasFlag('list')) {
  for (const group of groups) {
    console.log(`${group.name}\t${group.password}`);
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------
// API mode
// ---------------------------------------------------------------------------
async function apiRequest(path, init) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, init);
  } catch (error) {
    fail(`could not reach the backend at ${baseUrl} (${error.message}).\n` +
      '       Start the backend first, or re-run with --sql to seed through psql.');
  }
  return response;
}

async function apiSeed() {
  info(`seeding via ${baseUrl}`);
  let created = 0;
  let skipped = 0;

  for (const group of groups) {
    const check = await apiRequest(`/api/groups/check-name?name=${encodeURIComponent(group.name)}`);
    if (!check.ok) {
      fail(`check-name for "${group.name}" returned ${check.status}: ${await check.text()}`);
    }
    const availability = await check.json();

    if (availability.exists) {
      info(`skip  ${group.name} (already exists)`);
      skipped++;
      continue;
    }

    const response = await apiRequest('/api/groups/create', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name: group.name, password: group.password}),
    });
    const body = await response.text();

    if (!response.ok) {
      fail(`create "${group.name}" returned ${response.status}: ${body}`);
    }

    let id = '?';
    try {
      id = JSON.parse(body).id ?? id;
    } catch {
      // Non-JSON success body; keep the placeholder id.
    }
    info(`create ${group.name} (id=${id})`);
    created++;
  }

  info(`done: ${created} created, ${skipped} already present`);
  console.log(`\nTest credentials:\n${groups.map((g) => `  ${g.name} / ${g.password}`).join('\n')}\n`);
}

// ---------------------------------------------------------------------------
// SQL mode
// ---------------------------------------------------------------------------
function locatePsql() {
  if (process.env.PSQL) {
    return process.env.PSQL;
  }

  const locator = process.platform === 'win32' ? 'where' : 'which';
  const located = spawnSync(locator, ['psql'], {encoding: 'utf8'});
  if (located.status === 0 && located.stdout.trim()) {
    return located.stdout.split(/\r?\n/)[0].trim();
  }

  if (process.platform === 'win32') {
    const roots = [
      process.env.ProgramFiles || 'C:\\Program Files',
      process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)',
    ];
    for (const root of roots) {
      const versionsDir = join(root, 'PostgreSQL');
      if (!existsSync(versionsDir)) {
        continue;
      }
      const versions = readdirSync(versionsDir)
        .filter((entry) => /^\d+/.test(entry))
        .sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
      for (const version of versions) {
        const candidate = join(versionsDir, version, 'bin', 'psql.exe');
        if (existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }

  return null;
}

function quote(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlSeed(psql) {
  const names = groups.map((group) => group.name.toLowerCase());
  const missingHashes = groups.filter((group) => !group.passwordHash).map((group) => group.name);
  if (missingHashes.length > 0) {
    fail(`--sql mode needs passwordHash for: ${missingHashes.join(', ')}`);
  }

  const statements = [
    `set search_path to "${db.schema.replace(/"/g, '""')}";`,
    'begin;',
    `delete from groups where lower(name) in (${names.map(quote).join(', ')});`,
    'insert into groups (name, password_hash) values',
    groups.map((group) => `  (${quote(group.name)}, ${quote(group.passwordHash)})`).join(',\n') + ';',
    'commit;',
    '',
  ];
  const sql = statements.join('\n');

  info(`seeding via ${psql}`);
  const result = spawnSync(
    psql,
    [
      '-h', db.host,
      '-p', db.port,
      '-U', db.user,
      '-d', db.name,
      '-v', 'ON_ERROR_STOP=1',
      '-X',
      '-q',
      '-f', '-',
    ],
    {
      input: sql,
      encoding: 'utf8',
      env: {...process.env, PGPASSWORD: db.password},
    },
  );

  if (result.error) {
    fail(`could not run psql: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim();
    fail(`psql exited with ${result.status}${detail ? `:\n${detail}` : ''}\n` +
      '       If the schema/tables are missing, start the backend once so Flyway migrates first.');
  }

  info(`done: reset ${groups.length} group(s)`);
  console.log(`\nTest credentials:\n${groups.map((g) => `  ${g.name} / ${g.password}`).join('\n')}\n`);
}

async function main() {
  if (useSql) {
    const psql = locatePsql();
    if (!psql) {
      fail('could not find psql.\n' +
        '       Install PostgreSQL, put psql on PATH, set PSQL=/path/to/psql, or drop --sql\n' +
        '       to seed through the backend instead.');
    }
    sqlSeed(psql);
    return;
  }
  await apiSeed();
}

main().catch((error) => fail(error.stack || error.message));
