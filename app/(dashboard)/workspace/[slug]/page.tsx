// Server Component — fetches workspace data from Supabase
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'
import { WorkspaceClient } from '@/components/workspace-client'
import type { Workspace, Task, Agent, Metric, ActivityLogEntry } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: { slug: string }
}

export default async function WorkspacePage({ params }: Props) {
  const supabase = createServerClient()

  // Fetch workspace by slug
  const { data: wsData, error: wsError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()

  if (wsError || !wsData) {
    notFound()
  }

  const workspace = wsData as unknown as Workspace

  // Fetch related data in parallel
  const [tasksResult, agentsResult, metricsResult, activityResult] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('agents')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('metrics')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('recorded_at', { ascending: false })
      .limit(20),
    supabase
      .from('activity_log')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const tasks = (tasksResult.data as unknown as Task[]) ?? []
  const agents = (agentsResult.data as unknown as Agent[]) ?? []
  const metrics = (metricsResult.data as unknown as Metric[]) ?? []
  const activity = (activityResult.data as unknown as ActivityLogEntry[]) ?? []

  return (
    <WorkspaceClient
      workspace={workspace}
      tasks={tasks}
      agents={agents}
      metrics={metrics}
      activity={activity}
    />
  )
}
