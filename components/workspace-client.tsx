'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Activity,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
  Loader2,
  RefreshCw,
  Instagram,
  type LucideProps,
} from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
import { cn } from '@/lib/utils'
import { KanbanBoard } from '@/components/kanban-board'
import { ActivityFeed } from '@/components/activity-feed'
import { ChatInterface } from '@/components/chat-interface'
import type { Workspace, Task, Agent, Metric, ActivityLogEntry } from '@/lib/types'

const TABS = ['Visão Geral', 'Chat com Agentes', 'Tasks', 'Relatórios'] as const
type Tab = (typeof TABS)[number]

const AGENT_TYPE_COLORS: Record<string, string> = {
  orchestrator: '#ff6b6b',
  content: '#ff4dca',
  analytics: '#9b59ff',
  social: '#3b82f6',
  prospect: '#10b981',
}

const STATUS_DOT: Record<string, string> = {
  running: 'bg-green-400',
  idle: 'bg-yellow-400',
  error: 'bg-red-500',
  stopped: 'bg-slate-500',
}

interface WorkspaceClientProps {
  workspace: Workspace
  tasks: Task[]
  agents: Agent[]
  metrics: Metric[]
  activity: ActivityLogEntry[]
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

// Extract the latest value for a specific metric from the metrics array
function getLatestMetric(metrics: Metric[], name: string): number | null {
  const found = metrics
    .filter((m) => m.metric_name === name)
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())[0]
  return found ? found.value : null
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtext,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  subtext?: string
}) {
  return (
    <div className="rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtext && <p className="text-xs text-slate-600 mt-1">{subtext}</p>}
    </div>
  )
}

function AgentStatusCard({ agent }: { agent: Agent }) {
  const color = AGENT_TYPE_COLORS[(agent.role ?? agent.type ?? '')] ?? '#9b59ff'
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-[#2a2d3e] bg-[#0f1117]">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: `${color}25`, color }}
      >
        {agent.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate">{agent.name}</p>
        <p className="text-[10px] text-slate-500 capitalize">{(agent.role ?? agent.type ?? '')}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className={cn('w-2 h-2 rounded-full', STATUS_DOT[agent.status] ?? 'bg-slate-500')} />
        <span className="text-[10px] text-slate-500 capitalize">{agent.status}</span>
      </div>
    </div>
  )
}

function InstagramMetricsPanel({
  metrics,
  workspaceId,
  instagramHandle,
}: {
  metrics: Metric[]
  workspaceId: string
  instagramHandle: string | null | undefined
}) {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const followers = getLatestMetric(metrics, 'instagram_followers')
  const following = getLatestMetric(metrics, 'instagram_following')
  const posts = getLatestMetric(metrics, 'instagram_posts')
  const engagementRate = getLatestMetric(metrics, 'instagram_engagement_rate')

  const hasData = followers !== null

  const handleRefresh = useCallback(async () => {
    if (!instagramHandle) return
    setRefreshing(true)
    setRefreshError(null)
    try {
      const params = new URLSearchParams({ username: instagramHandle, workspace_id: workspaceId })
      const res = await fetch(`/api/social-metrics?${params}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? `HTTP ${res.status}`)
      }
      setLastRefreshed(new Date())
      router.refresh()
    } catch (err) {
      setRefreshError(err instanceof Error ? err.message : 'Erro ao atualizar')
    } finally {
      setRefreshing(false)
    }
  }, [instagramHandle, workspaceId, router])

  return (
    <div className="rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Instagram size={16} className="text-pink-400" />
        <h3 className="text-sm font-semibold text-white">Instagram</h3>
        {instagramHandle && (
          <span className="text-xs text-slate-500">@{instagramHandle}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-[10px] text-slate-600">
              Atualizado {lastRefreshed.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {instagramHandle ? (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                refreshing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border border-pink-500/20'
              )}
            >
              <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Atualizando…' : 'Atualizar métricas'}
            </button>
          ) : (
            <span className="text-[10px] text-slate-600 italic">Configure instagram_handle no workspace</span>
          )}
        </div>
      </div>

      {refreshError && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {refreshError}
        </div>
      )}

      {hasData ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg bg-[#0f1117] border border-[#2a2d3e] p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Seguidores</p>
            <p className="text-xl font-bold text-white">{formatNumber(followers!)}</p>
          </div>
          <div className="rounded-lg bg-[#0f1117] border border-[#2a2d3e] p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Seguindo</p>
            <p className="text-xl font-bold text-white">{following !== null ? formatNumber(following) : '—'}</p>
          </div>
          <div className="rounded-lg bg-[#0f1117] border border-[#2a2d3e] p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Posts</p>
            <p className="text-xl font-bold text-white">{posts !== null ? formatNumber(posts) : '—'}</p>
          </div>
          <div className="rounded-lg bg-[#0f1117] border border-[#2a2d3e] p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Engajamento</p>
            <p
              className={cn(
                'text-xl font-bold',
                engagementRate === null ? 'text-slate-500' : engagementRate >= 3 ? 'text-green-400' : 'text-yellow-400'
              )}
            >
              {engagementRate !== null ? `${engagementRate.toFixed(2)}%` : '—'}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-slate-600">
          <Instagram size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum dado de Instagram disponível</p>
          {instagramHandle ? (
            <p className="text-xs mt-1">Clique em &quot;Atualizar métricas&quot; para buscar dados reais</p>
          ) : (
            <p className="text-xs mt-1">Configure o instagram_handle no workspace e clique em Atualizar métricas</p>
          )}
        </div>
      )}
    </div>
  )
}

export function WorkspaceClient({
  workspace,
  tasks,
  agents,
  metrics = [],
  activity,
}: Omit<WorkspaceClientProps, 'metrics'> & { metrics?: Metric[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('Visão Geral')

  const todoTasks = tasks.filter((t) => t.status === 'todo')
  const doingTasks = tasks.filter((t) => t.status === 'doing')
  const doneTasks = tasks.filter((t) => t.status === 'done')

  const runningAgents = agents.filter((a) => a.status === 'running').length
  const errorAgents = agents.filter((a) => a.status === 'error').length

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const doneThisWeek = doneTasks.filter(
    (t) => new Date(t.updated_at) >= oneWeekAgo
  ).length

  const isStandby = workspace.is_standby === true || workspace.status === 'paused'

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Standby banner */}
      {isStandby && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-800/40 text-slate-400 text-sm">
          <div className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" />
          <span>
            <span className="font-semibold text-slate-300">Standby</span>
            {' '}— este cliente está pausado. Métricas e agentes não estão ativos.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-base md:text-lg font-bold shadow-lg flex-shrink-0"
          style={{
            background: `${workspace.color}20`,
            color: workspace.color,
            boxShadow: `0 0 20px ${workspace.color}30`,
          }}
        >
          {workspace.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-white">{workspace.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {(workspace.industry ?? workspace.niche) && <span>{workspace.industry ?? workspace.niche} · </span>}
            {workspace.description}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: !workspace.is_prospect ? '#22c55e20' : '#6b728020',
              color: !workspace.is_prospect ? '#22c55e' : '#6b7280',
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: !workspace.is_prospect ? '#22c55e' : '#6b7280' }}
            />
            {!workspace.is_prospect ? 'Ativo' : 'Prospect'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <div className="flex items-center gap-1 border-b border-[#2a2d3e] mb-6 min-w-max md:min-w-0">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 md:px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px flex items-center gap-2 whitespace-nowrap min-h-[44px] ${
                  activeTab === tab
                    ? 'border-coral text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab === 'Visão Geral' && <LayoutDashboard size={14} />}
                {tab === 'Chat com Agentes' && <MessageSquare size={14} />}
                {tab === 'Tasks' && <CheckSquare size={14} />}
                {tab === 'Relatórios' && <BarChart3 size={14} />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Visão Geral */}
        {activeTab === 'Visão Geral' && (
          <div className="space-y-6 animate-fade-in">
            {/* Instagram Metrics Panel */}
            <InstagramMetricsPanel
              metrics={metrics}
              workspaceId={workspace.id}
              instagramHandle={
                workspace.instagram_handle ??
                (workspace.onboarding_data as Record<string, unknown> | null)?.instagram_handle as string | null
              }
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Tasks Abertas"
                value={todoTasks.length + doingTasks.length}
                icon={CheckSquare}
                color="#ff6b6b"
                subtext={`${todoTasks.length} a fazer · ${doingTasks.length} em andamento`}
              />
              <StatCard
                label="Concluídas essa semana"
                value={doneThisWeek}
                icon={CheckCircle2}
                color="#22c55e"
                subtext={`${doneTasks.length} total concluídas`}
              />
              <StatCard
                label="Agentes"
                value={agents.length}
                icon={Users}
                color="#9b59ff"
                subtext={`${runningAgents} rodando · ${errorAgents > 0 ? `${errorAgents} com erro` : 'todos ok'}`}
              />
              <StatCard
                label="Atividades recentes"
                value={activity.length}
                icon={Activity}
                color="#3b82f6"
                subtext="últimas 20 ações"
              />
            </div>

            {/* Agent Health + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agent Status Panel */}
              <div className="rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} className="text-slate-400" />
                  <h3 className="text-sm font-semibold text-white">Agentes</h3>
                  <span className="ml-auto text-xs text-slate-500">{agents.length} total</span>
                </div>
                {agents.length === 0 ? (
                  <div className="text-center py-8 text-slate-600">
                    <p className="text-sm">Nenhum agente configurado</p>
                    <p className="text-xs mt-1">Visite /api/seed para criar agentes</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {agents.map((agent) => (
                      <AgentStatusCard key={agent.id} agent={agent} />
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-slate-400" />
                  <h3 className="text-sm font-semibold text-white">Atividade Recente</h3>
                </div>
                {activity.length === 0 ? (
                  <div className="text-center py-8 text-slate-600">
                    <p className="text-sm">Nenhuma atividade registrada</p>
                  </div>
                ) : (
                  <ActivityFeed entries={activity.slice(0, 8)} compact />
                )}
              </div>
            </div>

            {/* Task summary */}
            <div className="rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-slate-400" />
                <h3 className="text-sm font-semibold text-white">Resumo de Tasks</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {(
                  [
                    { label: 'A Fazer', tasks: todoTasks, color: '#6b7280', icon: Circle },
                    { label: 'Em Andamento', tasks: doingTasks, color: '#f59e0b', icon: Loader2 },
                    { label: 'Concluídas', tasks: doneTasks, color: '#22c55e', icon: CheckCircle2 },
                  ] as { label: string; tasks: Task[]; color: string; icon: LucideIcon }[]
                ).map(({ label, tasks: tList, color, icon: Icon }) => (
                  <div key={label} className="rounded-lg bg-[#0f1117] p-4 border border-[#2a2d3e]">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={14} style={{ color }} />
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                    <p className="text-xl font-bold text-white">{tList.length}</p>
                    {tList.slice(0, 2).map((t) => (
                      <p key={t.id} className="text-[10px] text-slate-600 truncate mt-1">{t.title}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Chat com Agentes */}
        {activeTab === 'Chat com Agentes' && (
          <div className="animate-fade-in">
            <ChatInterface agents={agents} workspaceId={workspace.id} />
          </div>
        )}

        {/* Tab: Tasks */}
        {activeTab === 'Tasks' && (
          <div className="animate-fade-in">
            <KanbanBoard tasks={tasks} workspaces={[workspace]} />
          </div>
        )}

        {/* Tab: Relatórios */}
        {activeTab === 'Relatórios' && (
          <div className="animate-fade-in">
            <div className="rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-8 text-center">
              <BarChart3 size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Relatórios Semanais</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Os relatórios automáticos serão gerados pelos agentes com base nas métricas e atividades do workspace.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-[#2a2d3e] text-slate-400 text-sm">
                <AlertCircle size={14} />
                Em breve — integração com métricas
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
