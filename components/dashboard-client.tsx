'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertBanner } from '@/components/alert-banner'
import { DailySummaryCard } from '@/components/daily-summary'
import { QuickCommandBar, QuickCommandModal } from '@/components/quick-command'
import { MetricsCards } from '@/components/metrics-cards'
import type { WorkspaceOption } from '@/components/metrics-cards'
import { QuickActions } from '@/components/quick-actions'
import { WorkspaceCard, ProspectCard } from '@/components/workspace-card'
import { AgentHealth } from '@/components/agent-health'
import { KanbanBoard } from '@/components/kanban-board'
import { ActivityFeed } from '@/components/activity-feed'
import type { Workspace, Task, Agent, ActivityLogEntry, Alert, DailySummary, WorkspaceDashboardMetrics } from '@/lib/types'

const TABS = ['Clientes', 'Tasks', 'Atividade'] as const
type Tab = (typeof TABS)[number]

interface DashboardClientProps {
  workspaces: Workspace[]
  tasks: Task[]
  agents: Agent[]
  activity: ActivityLogEntry[]
  alerts: Alert[]
  dailySummary: DailySummary | null
  workspaceOptions: WorkspaceOption[]
  metricsMap: Record<string, WorkspaceDashboardMetrics>
}

export function DashboardClient({
  workspaces,
  tasks,
  agents,
  activity,
  alerts,
  dailySummary,
  workspaceOptions,
  metricsMap,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Clientes')
  const [cmdOpen, setCmdOpen] = useState(false)

  // Cmd+K handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCmdOpen((o) => !o)
    }
    if (e.key === 'Escape') setCmdOpen(false)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      {/* Quick Command Modal */}
      <QuickCommandModal isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* 1. Alert Banner */}
      <AlertBanner alerts={alerts} />

      <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Page header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Visão consolidada de todos os clientes ·{' '}
            {new Intl.DateTimeFormat('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(new Date())}
          </p>
        </div>

        {/* 2. Daily Summary */}
        {dailySummary && <DailySummaryCard summary={dailySummary} />}

        {/* 3. Quick Command Bar */}
        <QuickCommandBar onOpen={() => setCmdOpen(true)} />

        {/* 4. Metrics Cards with workspace selector */}
        <MetricsCards workspaces={workspaceOptions} metricsMap={metricsMap} />

        {/* 5. Quick Actions */}
        <QuickActions />

        {/* 6. Tabs */}
        <div>
          {/* Tab nav */}
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
            <div className="flex items-center gap-1 border-b border-[#2a2d3e] mb-6 min-w-max md:min-w-0">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px whitespace-nowrap min-h-[44px] ${
                    activeTab === tab
                      ? 'border-coral text-white'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab: Clientes */}
          {activeTab === 'Clientes' && (
            <div className="space-y-6 animate-fade-in">
              {workspaces.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg mb-2">Nenhum workspace ativo</p>
                  <p className="text-sm">Adicione clientes para começar</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...workspaces]
                    .sort((a, b) => {
                      const aS = a.is_standby === true || a.status === 'paused' ? 1 : 0
                      const bS = b.is_standby === true || b.status === 'paused' ? 1 : 0
                      return aS - bS
                    })
                    .map((ws) => {
                    const wsMetrics = metricsMap[ws.id] ?? null
                    return (
                      <WorkspaceCard
                        key={ws.id}
                        workspace={ws}
                        metrics={wsMetrics ? {
                          followers: wsMetrics.followers,
                          engagement_rate: wsMetrics.engagement_rate,
                          posts: wsMetrics.posts,
                        } : null}
                      />
                    )
                  })}
                  {/* Prospect CTA */}
                  <ProspectCard />
                </div>
              )}

              {/* Agent Health Panel */}
              <AgentHealth agents={agents} />
            </div>
          )}

          {/* Tab: Tasks */}
          {activeTab === 'Tasks' && (
            <div className="animate-fade-in">
              <KanbanBoard tasks={tasks} workspaces={workspaces} />
            </div>
          )}

          {/* Tab: Atividade */}
          {activeTab === 'Atividade' && (
            <div className="animate-fade-in">
              <ActivityFeed entries={activity} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
