import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/conversations?agentId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agentId')

  if (!agentId) {
    return NextResponse.json({ error: 'agentId required' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .eq('agent_id', agentId)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[conversations GET]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
