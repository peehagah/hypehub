'use client'

import { Zap, AlertTriangle, Clock, StopCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'
import type { Agent } from '@/lib/types'

interface AgentHealthProps {
  agents: Agent[]
}

const statusConfig = {
  running: { label: 'Rodando', color: '#22c55e', bg: 'bg-green-500/10', icon: <Zap size={11} className="text-green-400" /> },
  idle: { label: 'Ocioso', color: '#94a3b8', bg: 'bg-slate-500/10', icon: <Clock size={11} className="text-slate-400" /> },
  error: { label: 'Erro', color: '#ef4444', bg: 'bg-red-500/10', icon: <AlertTriangle size={11} className="text-red-400" /> },
  stopped: { label: 'Parado', color: '#6b7280', bg: 'bg-gray-500/10', icon: <StopCircle size={11} className="text-gray-400" /> },
}

export function AgentHealth({ agents }: AgentHealthProps) {
  const running = agents.filter((a) => a.status === 'running').length
  const errors = agents.filter((a) => a.status === 'error').length

  return (
    <div className="rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Saúde dos Agentes</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {running} rodando · {errors} com erro · {agents.length} total
          </p>
        </div>
        <div className={cn('w-2.5 h-2.5 rounded-full', errors > 0 ? 'bg-red-500 pulse-dot' : 'bg-green-500')} />
      </div>

      <div className="space-y-2">
        {agents.map((agent) => {
          const cfg = statusConfig[agent.status]
          return (
            <div
              key={agent.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0f1117] border border-[#2a2d3e]"
            >
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', cfg.bg)}>
                {cfg.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-white truncate">{agent.name}</p>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0"
                    style={{ color: cfg.color, borderColor: `${cfg.color}30`, background: `${cfg.color}10` }}
                  >
                    {cfg.label}
                  </span>
                </div>
                {agent.error_message ? (
                  <p className="text-[10px] text-red-400 truncate mt-0.5">{agent.error_message}</p>
                ) : (
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {agent.last_active_at ? `Ativo ${timeAgo(agent.last_active_at)}` : 'Nunca ativo'}
                  </p>
                )}
              </div>

              {agent.status === 'error' && (
                <button className="flex-shrink-0 p-1.5 rounded-lg bg-[#2a2d3e] hover:bg-[#3a3d4e] transition-colors">
                  <RefreshCw size={12} className="text-slate-400" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
