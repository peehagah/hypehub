/**
 * POST /api/run-migration
 * Runs the is_standby migration on the Supabase database.
 * Uses the service role key via direct Supabase query API.
 * Only accessible with the SEED_SECRET in production.
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const ALTER_SQL = `ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS is_standby boolean DEFAULT false;`
const UPDATE_SQL = `UPDATE public.workspaces SET is_standby = true WHERE slug = 'ecomfisc';`

async function runSqlViaSupabaseApi(sql: string): Promise<{ ok: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Supabase exposes a SQL execution endpoint via the pg-meta API (internal)
  // For self-hosted or API-accessible projects we try several known endpoints
  const endpoints = [
    `${supabaseUrl}/rest/v1/rpc/exec_sql`,              // custom exec_sql function if exists
    `${supabaseUrl}/pg/sql`,                             // pg-meta (Supabase self-hosted)
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
        },
        body: JSON.stringify({ query: sql }),
      })
      if (res.ok) {
        return { ok: true }
      }
    } catch {
      // try next endpoint
    }
  }

  return { ok: false, error: 'No SQL execution endpoint available — run manually in Supabase SQL Editor' }
}

export async function GET(req: Request) {
  // Protection in production
  if (process.env.NODE_ENV === 'production') {
    const url = new URL(req.url)
    const secret = url.searchParams.get('secret')
    if (secret !== process.env.SEED_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const sb = createServerClient()
  const results: Record<string, unknown> = {}

  // ── Step 1: Try to run ALTER TABLE via direct SQL API ──────────────
  const alterResult = await runSqlViaSupabaseApi(ALTER_SQL)
  results.alter_table = alterResult

  // ── Step 2: Check if column already exists ─────────────────────────
  const { error: checkError } = await sb
    .from('workspaces')
    .select('id, is_standby')
    .limit(1)

  if (checkError) {
    // Column likely doesn't exist yet
    results.column_exists = false
    results.column_check_error = checkError.message
    results.instructions = [
      'The is_standby column does not exist in the database yet.',
      'Run this SQL in the Supabase SQL Editor:',
      ALTER_SQL,
      UPDATE_SQL,
    ]
    return NextResponse.json({ success: false, results }, { status: 200 })
  }

  results.column_exists = true

  // ── Step 3: Set Ecomfisc as standby ───────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError, count } = await (sb as any)
    .from('workspaces')
    .update({ is_standby: true })
    .eq('slug', 'ecomfisc')
    .select('id, name, slug, is_standby')

  if (updateError) {
    results.update_error = updateError.message
    return NextResponse.json({ success: false, results }, { status: 500 })
  }

  results.ecomfisc_updated = true
  results.rows_affected = count

  // ── Step 4: Verify ─────────────────────────────────────────────────
  const { data: verify } = await sb
    .from('workspaces')
    .select('id, name, slug, is_standby')
    .eq('slug', 'ecomfisc')
    .maybeSingle()

  results.verified = verify

  return NextResponse.json({ success: true, results })
}
