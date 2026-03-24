import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/conversations/:id/messages
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[messages GET]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
