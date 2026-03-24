import { NextRequest, NextResponse } from 'next/server'
import { fetchInstagramProfile } from '@/lib/apify'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
// Apify runs can take up to ~60s — extend the default timeout
export const maxDuration = 120

export async function GET(req: NextRequest) {
  // Debug: confirm env var is present server-side
  const tokenPresent = !!process.env.APIFY_API_TOKEN
  console.log('[social-metrics] APIFY_API_TOKEN present:', tokenPresent)
  if (tokenPresent) {
    console.log('[social-metrics] Token prefix:', process.env.APIFY_API_TOKEN?.slice(0, 12) + '...')
  }

  const { searchParams } = req.nextUrl
  const username = searchParams.get('username')
  const workspaceId = searchParams.get('workspace_id')

  if (!username) {
    return NextResponse.json({ error: 'username é obrigatório' }, { status: 400 })
  }

  let profile
  try {
    profile = await fetchInstagramProfile(username)
  } catch (err) {
    const message = err instanceof Error ? err.message : `Falha ao buscar dados de @${username}`
    console.error('[social-metrics]', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // Save snapshot to Supabase if workspace_id provided
  if (workspaceId) {
    const sb = createServerClient()
    const now = new Date().toISOString()

    const rows: Array<{
      workspace_id: string
      metric_name: string
      value: number
      previous_value: number | null
      source: string
      recorded_at: string
    }> = [
      { workspace_id: workspaceId, metric_name: 'instagram_followers', value: profile.followers, previous_value: null, source: 'apify', recorded_at: now },
      { workspace_id: workspaceId, metric_name: 'instagram_following', value: profile.following, previous_value: null, source: 'apify', recorded_at: now },
      { workspace_id: workspaceId, metric_name: 'instagram_posts', value: profile.posts, previous_value: null, source: 'apify', recorded_at: now },
    ]

    if (profile.engagement_rate !== null) {
      rows.push({ workspace_id: workspaceId, metric_name: 'instagram_engagement_rate', value: profile.engagement_rate, previous_value: null, source: 'apify', recorded_at: now })
    }

    const { error } = await sb.from('metrics').insert(rows)
    if (error) {
      console.error('[social-metrics] Supabase insert error:', error.message)
    }
  }

  return NextResponse.json({
    username: profile.username,
    full_name: profile.fullName,
    biography: profile.biography,
    followers: profile.followers,
    following: profile.following,
    posts: profile.posts,
    is_verified: profile.isVerified,
    is_private: profile.isPrivate,
    engagement_rate: profile.engagement_rate,
    fetched_at: profile.fetched_at,
  })
}
