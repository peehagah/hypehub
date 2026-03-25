// Server Component — fetches real data from Supabase
import {
  getWorkspaces,
  getAllTasks,
  getAllAgents,
  getActivityLog,
  getDailySummary,
  getMetricsForDashboard,
} from '@/lib/supabase'
import { DashboardClient } from '@/components/dashboard-client'
import type { Alert } from '@/lib/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [workspaces, tasks, agents, activity, dailySummary, metricsMap] = await Promise.all([
    getWorkspaces(),
    getAllTasks(),
    getAllAgents(),
    getActivityLog(30),
    getDailySummary(),
    getMetricsForDashboard(),
  ])

  // Build alerts from agent errors in activity log
  const alerts: Alert[] = agents
    .filter((a) => a.status === 'error')
    .slice(0, 3)
    .map((a) => {
      const ws = workspaces.find((w) => w.id === a.workspace_id)
      return {
        id: a.id,
        workspace: ws?.name ?? 'Workspace',
        workspaceColor: ws?.color ?? '#ff6b6b',
        message: a.error_message ?? `Agente ${a.name} em estado de erro`,
        severity: 'critical' as const,
        timestamp: a.updated_at ?? a.last_active_at ?? a.created_at,
      }
    })

  // Build workspace options for the primary profile selector
  // Only include workspaces that are not in standby/paused
  const workspaceOptions = workspaces
    .filter((ws) => ws.is_standby !== true && ws.status !== 'paused')
    .map((ws) => ({ id: ws.id, name: ws.name }))

  return (
    <DashboardClient
      workspaces={workspaces}
      tasks={tasks}
      agents={agents}
      activity={activity}
      alerts={alerts}
      dailySummary={dailySummary}
      workspaceOptions={workspaceOptions}
      metricsMap={metricsMap}
    />
  )
}
