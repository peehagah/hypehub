import { NextRequest, NextResponse } from 'next/server'
import { fetchInstagramStats } from '@/lib/socialblade'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const username = searchParams.get('username')
  const workspaceId = searchParams.get('workspace_id')

  if (!username) {
    return NextResponse.json({ error: 'username is required' }, { status: 400 })
  }

  let stats
  try {
    stats = await fetchInstagramStats(username)
  } catch (err) {
    const message = err instanceof Error ? err.message : `Failed to fetch stats for @${username}`
    return NextResponse.json({ error: message }, { status: 502 })
  }

  if (!stats) {
    return NextResponse.json(
      { error: `Não foi possível buscar dados para @${username}. Tente novamente.` },
      { status: 502 }
    )
  }

  // Save to Supabase metrics table if workspace_id is provided
  if (workspaceId) {
    const sb = createServerClient()
    const now = new Date().toISOString()

    const upserts = [
      {
        workspace_id: workspaceId,
        metric_name: 'followers',
        metric_value: stats.followers,
        metric_unit: null,
        dimension: 'instagram',
        recorded_at: now,
      },
      {
        workspace_id: workspaceId,
        metric_name: 'following',
        metric_value: stats.following,
        metric_unit: null,
        dimension: 'instagram',
        recorded_at: now,
      },
      {
        workspace_id: workspaceId,
        metric_name: 'posts',
        metric_value: stats.posts,
        metric_unit: null,
        dimension: 'instagram',
        recorded_at: now,
      },
      {
        workspace_id: workspaceId,
        metric_name: 'growth_rate_weekly',
        metric_value: stats.growth_rate_weekly,
        metric_unit: '%',
        dimension: 'instagram',
        recorded_at: now,
      },
    ]

    // Insert new metric rows (each refresh creates a new snapshot)
    const { error } = await sb.from('metrics').insert(upserts)
    if (error) {
      console.error('[social-metrics] Failed to save metrics:', error.message)
    }

    // Save daily history entries (last 30 days)
    if (stats.daily_history.length > 0) {
      const historyRows = stats.daily_history.slice(-30).map((entry) => ({
        workspace_id: workspaceId,
        metric_name: 'followers_daily',
        metric_value: entry.followers,
        metric_unit: null,
        dimension: 'instagram',
        recorded_at: new Date(entry.date).toISOString(),
      }))

      // Only insert if we have valid dates
      const validRows = historyRows.filter((r) => !isNaN(new Date(r.recorded_at).getTime()))
      if (validRows.length > 0) {
        const { error: histError } = await sb.from('metrics').insert(validRows)
        if (histError) {
          console.error('[social-metrics] Failed to save history:', histError.message)
        }
      }
    }
  }

  return NextResponse.json({
    username: stats.username,
    followers: stats.followers,
    following: stats.following,
    posts: stats.posts,
    growth_rate_weekly: stats.growth_rate_weekly,
    daily_history: stats.daily_history,
    fetched_at: new Date().toISOString(),
  })
}
