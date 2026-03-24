import { createClient } from '@supabase/supabase-js'
import type { Workspace, Agent, Task, Metric, ActivityLogEntry, DailySummary } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side singleton (no strict generic to avoid type conflicts)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client (for Server Components / Route Handlers)
// Uses service role key for unrestricted access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// ---- Helper query functions ----

export async function getWorkspaces(): Promise<Workspace[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from('workspaces')
    .select('*')
    .eq('is_prospect', false)   // Only actual clients, not prospects
    .order('created_at', { ascending: true })
  if (error) console.error('[getWorkspaces]', error.message)
  return (data as Workspace[]) ?? []
}

export async function getWorkspaceTasks(workspaceId: string): Promise<Task[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
  if (error) console.error('[getWorkspaceTasks]', error.message)
  return (data as Task[]) ?? []
}

export async function getWorkspaceAgents(workspaceId: string): Promise<Agent[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from('agents')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })
  if (error) console.error('[getWorkspaceAgents]', error.message)
  return (data as Agent[]) ?? []
}

export async function getWorkspaceMetrics(workspaceId: string): Promise<Metric[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from('metrics')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('recorded_at', { ascending: false })
    .limit(50)
  if (error) console.error('[getWorkspaceMetrics]', error.message)
  return (data as Metric[]) ?? []
}

export async function getDailySummary(): Promise<DailySummary | null> {
  const sb = createServerClient()
  // Daily summaries table — just get the most recent one
  const { data, error } = await sb
    .from('daily_summaries')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) {
    // Table might have different schema — silently return null
    return null
  }
  return (data as DailySummary) ?? null
}

export async function getAlerts(): Promise<ActivityLogEntry[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from('activity_log')
    .select('*')
    .eq('action', 'agent_error')
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) console.error('[getAlerts]', error.message)
  return (data as ActivityLogEntry[]) ?? []
}

export async function getActivityLog(limit = 20): Promise<ActivityLogEntry[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) console.error('[getActivityLog]', error.message)
  return (data as ActivityLogEntry[]) ?? []
}

export async function getAllTasks(): Promise<Task[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) console.error('[getAllTasks]', error.message)
  return (data as Task[]) ?? []
}

export async function getAllAgents(): Promise<Agent[]> {
  const sb = createServerClient()
  const { data, error } = await sb
    .from('agents')
    .select('*')
    .order('workspace_id', { ascending: true })
  if (error) console.error('[getAllAgents]', error.message)
  return (data as Agent[]) ?? []
}
