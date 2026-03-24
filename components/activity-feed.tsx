'use client'

import { Zap, AlertTriangle, FileText, CheckCircle2, MessageSquare, Bot } from 'lucide-react'
import { timeAgo } from '@/lib/utils'
import type { ActivityLogEntry } from '@/lib/types'

interface ActivityFeedProps {
  entries: ActivityLogEntry[]
  compact?: boolean
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  task_completed: { icon: <CheckCircle2 size={14} />, color: '#22c55e' },
  task_started: { icon: <Zap size={14} />, color: '#f59e0b' },
  agent_error: { icon: <AlertTriangle size={14} />, color: '#ef4444' },
  content_published: { icon: <FileText size={14} />, color: '#9b59ff' },
  message_sent: { icon: <MessageSquare size={14} />, color: '#ff4dca' },
  report_generated: { icon: <FileText size={14} />, color: '#ff6b6b' },
}

const DEFAULT_ACTION = { icon: <Bot size={14} />, color: '#6b7280' }

export function ActivityFeed({ entries, compact = false }: ActivityFeedProps) {
  if (compact) {
    return (
      <div className="space-y-2">
        {entries.map((entry) => {
          const cfg = ACTION_CONFIG[entry.action] ?? DEFAULT_ACTION
          return (
            <div key={entry.id} className="flex gap-2 items-start">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${cfg.color}15`, color: cfg.color }}
              >
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 leading-snug truncate">{entry.description}</p>
                <p className="text-[10px] text-slate-600">{timeAgo(entry.created_at)}</p>
              </div>
            </div>
          )
        })}
        {entries.length === 0 && (
          <p className="text-xs text-slate-600 py-2 text-center">Nenhuma atividade</p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-4">
      <h3 className="text-sm font-semibold text-white mb-4">Feed de Atividades</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[18px] top-0 bottom-0 w-px bg-[#2a2d3e]" />

        <div className="space-y-4">
          {entries.map((entry) => {
            const cfg = ACTION_CONFIG[entry.action] ?? DEFAULT_ACTION
            return (
              <div key={entry.id} className="flex gap-3 relative animate-fade-in">
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border border-[#2a2d3e] z-10"
                  style={{ background: `${cfg.color}15`, color: cfg.color }}
                >
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-xs text-slate-300 leading-relaxed">{entry.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-600">{timeAgo(entry.created_at)}</span>
                    {entry.workspace_id && (
                      <span className="text-[10px] text-slate-700">·</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {entries.length === 0 && (
        <p className="text-center text-sm text-slate-700 py-8">Nenhuma atividade recente</p>
      )}
    </div>
  )
}
