/**
 * Runs the is_standby migration directly on the Supabase database.
 * Uses pg (node-postgres) via the Supabase Session Pooler — which accepts
 * the service_role JWT as the password (Supavisor JWT auth, all plans).
 *
 * Usage: node scripts/migrate-standby.mjs
 */

import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const require = createRequire(import.meta.url)

// ── Load .env.local ──────────────────────────────────────────────────────────
const envPath = resolve(__dirname, '../.env.local')
const envFile = readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envFile
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=')
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
    })
)

const supabaseUrl  = env.NEXT_PUBLIC_SUPABASE_URL  // e.g. https://xxxx.supabase.co
const serviceKey   = env.SUPABASE_SERVICE_ROLE_KEY
const anonKey      = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

// Extract project ref from URL: https://REF.supabase.co → REF
const projectRef = supabaseUrl.replace('https://', '').split('.')[0]
console.log(`📦  Project ref: ${projectRef}`)

const { Client } = require('pg')

const SQL = [
  `ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS is_standby boolean DEFAULT false;`,
  `UPDATE public.workspaces SET is_standby = true WHERE slug = 'ecomfisc';`,
]

// Supabase Supavisor regions to try (session pooler, port 5432, accepts JWT auth)
const POOLER_REGIONS = [
  'us-east-1',
  'us-west-1',
  'eu-west-1',
  'eu-central-1',
  'ap-southeast-1',
]

async function tryConnect(config) {
  const client = new Client(config)
  try {
    await client.connect()
    return client
  } catch (e) {
    await client.end().catch(() => {})
    throw e
  }
}

async function runMigration() {
  let client = null

  // ── Attempt 1: Direct DB connection ──────────────────────────────
  // Note: this uses the service_role key as password — works only if
  // the Supabase project has JWT auth enabled on the direct connection.
  const directHost = `db.${projectRef}.supabase.co`
  console.log(`\n🔌  Trying direct connection → ${directHost}:5432 …`)
  try {
    client = await tryConnect({
      host: directHost,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: serviceKey,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    })
    console.log(`✅  Connected via direct connection`)
  } catch (e) {
    console.log(`   ↳ Failed: ${e.message}`)
  }

  // ── Attempt 2: Session Pooler (Supavisor) ─────────────────────────
  // Supabase Supavisor on port 5432 accepts service_role JWT as password.
  if (!client) {
    for (const region of POOLER_REGIONS) {
      const host = `aws-0-${region}.pooler.supabase.com`
      console.log(`🔌  Trying pooler → ${host}:5432 …`)
      try {
        client = await tryConnect({
          host,
          port: 5432,
          database: 'postgres',
          user: `postgres.${projectRef}`,
          password: serviceKey,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 8000,
        })
        console.log(`✅  Connected via Supavisor session pooler (${region})`)
        break
      } catch (e) {
        console.log(`   ↳ Failed: ${e.message}`)
      }
    }
  }

  // ── Attempt 3: Transaction Pooler (port 6543) ─────────────────────
  if (!client) {
    for (const region of POOLER_REGIONS) {
      const host = `aws-0-${region}.pooler.supabase.com`
      console.log(`🔌  Trying transaction pooler → ${host}:6543 …`)
      try {
        client = await tryConnect({
          host,
          port: 6543,
          database: 'postgres',
          user: `postgres.${projectRef}`,
          password: serviceKey,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 8000,
        })
        console.log(`✅  Connected via transaction pooler (${region})`)
        break
      } catch (e) {
        console.log(`   ↳ Failed: ${e.message}`)
      }
    }
  }

  if (!client) {
    console.error('\n❌  All connection attempts failed.')
    console.error('\n📋  Run these 2 lines in the Supabase SQL Editor manually:')
    SQL.forEach(sql => console.error(`    ${sql}`))
    console.error('\n    Dashboard → SQL Editor: https://supabase.com/dashboard/project/' + projectRef + '/sql/new')
    process.exit(1)
  }

  // ── Run SQL ───────────────────────────────────────────────────────
  try {
    for (const sql of SQL) {
      console.log(`\n⚡  Running: ${sql.slice(0, 80)}…`)
      const result = await client.query(sql)
      console.log(`   ✅  OK (rowCount: ${result.rowCount})`)
    }

    // Verify
    const { rows } = await client.query(
      `SELECT id, name, slug, is_standby FROM public.workspaces WHERE slug = 'ecomfisc'`
    )
    if (rows.length > 0) {
      console.log(`\n🎉  Ecomfisc is_standby = ${rows[0].is_standby}`)
    } else {
      console.warn('\n⚠️  No workspace found with slug = ecomfisc')
    }
  } catch (e) {
    console.error(`\n❌  SQL error: ${e.message}`)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
