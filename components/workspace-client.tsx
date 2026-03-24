'use client'

import { useState } from 'react'
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

export function WorkspaceClient({
  workspace,
  tasks,
  agents,
  activity,
}: Omit<WorkspaceClientProps, 'metrics'> & { metrics?: Metric[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('Visão Geral')

  const todoTasks = tasks.filter((t) => t.status === 'todo')
  const doingTasks = tasks.filter((t) => t.status === 'doing')
  const doneTasks = tasks.filter((t) => t.status === 'done')

  const runningAgents = agents.filter((a) => a.status === 'running').length
  const errorAgents = agents.filter((a) => a.status === 'error').length

  // Tasks done this week
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const doneThisWeek = doneTasks.filter(
    (t) => new Date(t.updated_at) >= oneWeekAgo
  ).length

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg flex-shrink-0"
          style={{
            background: `${workspace.color}20`,
            color: workspace.color,
            boxShadow: `0 0 20px ${workspace.color}30`,
          }}
        >
          {workspace.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white">{workspace.name}</h1>
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
        <div className="flex items-center gap-1 border-b border-[#2a2d3e] mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px flex items-center gap-2 ${
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

        {/* Tab: Visão Geral */}
        {activeTab === 'Visão Geral' && (
          <div className="space-y-6 animate-fade-in">
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
