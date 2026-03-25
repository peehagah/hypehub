'use client'

import { useState } from 'react'
import { Users, BarChart3, TrendingUp, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkspaceDashboardMetrics } from '@/lib/types'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

export interface WorkspaceOption {
  id: string
  name: string
}

interface MetricsCardsProps {
  workspaces: WorkspaceOption[]
  metricsMap: Record<string, WorkspaceDashboardMetrics>
}

export function MetricsCards({ workspaces, metricsMap }: MetricsCardsProps) {
  const [selectedId, setSelectedId] = useState<string>(workspaces[0]?.id ?? '')

  const m: WorkspaceDashboardMetrics = metricsMap[selectedId] ?? {
    followers: null,
    posts: null,
    engagement_rate: null,
    weekly_engagement: null,
    weekly_growth: null,
  }

  const cards = [
    {
      label: 'Seguidores',
      value: m.followers != null ? formatNumber(m.followers) : '—',
      delta: 'total no Instagram',
      deltaPositive: true,
      icon: <Users size={18} />,
      color: '#ff6b6b',
      glow: 'rgba(255,107,107,0.15)',
    },
    {
      label: 'Posts Instagram',
      value: m.posts != null ? formatNumber(m.posts) : '—',
      delta: 'total publicados',
      deltaPositive: true,
      icon: <BarChart3 size={18} />,
      color: '#9b59ff',
      glow: 'rgba(155,89,255,0.15)',
    },
    {
      label: 'Engajamento 7 dias',
      value: m.weekly_engagement != null ? `${m.weekly_engagement.toFixed(2)}%` : '—',
      delta: m.weekly_engagement != null
        ? (m.weekly_engagement >= 3 ? 'acima da média' : 'abaixo da média')
        : 'sem dados recentes',
      deltaPositive: m.weekly_engagement != null ? m.weekly_engagement >= 3 : true,
      icon: <TrendingUp size={18} />,
      color: '#ff4dca',
      glow: 'rgba(255,77,202,0.15)',
    },
    {
      label: 'Crescimento Semanal',
      value: m.weekly_growth != null
        ? (m.weekly_growth >= 0 ? `+${formatNumber(m.weekly_growth)}` : formatNumber(m.weekly_growth))
        : '—',
      delta: m.weekly_growth != null ? 'seguidores em 7 dias' : 'dados insuficientes',
      deltaPositive: m.weekly_growth != null ? m.weekly_growth >= 0 : true,
      icon: <ArrowUpRight size={18} />,
      color: '#f59e0b',
      glow: 'rgba(245,158,11,0.15)',
    },
  ]

  return (
    <div className="space-y-3">
      {/* Workspace selector */}
      {workspaces.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs text-slate-500 font-medium flex-shrink-0">Perfil primário:</span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1a1d2e] border border-[#2a2d3e] overflow-x-auto scrollbar-none">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setSelectedId(ws.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0 min-h-[36px]',
                  selectedId === ws.id
                    ? 'bg-[#2a2d3e] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                )}
              >
                {ws.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4 metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl border border-[#2a2d3e] p-4 transition-all duration-200 hover:border-[#3a3d4e] group"
            style={{ background: '#1a1d2e' }}
          >
            {/* Background glow */}
            <div
              className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity"
              style={{ background: card.glow }}
            />

            <div className="relative">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: `${card.color}20`, color: card.color }}
              >
                {card.icon}
              </div>

              <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>

              <div className={cn(
                'flex items-center gap-1 mt-2 text-xs font-medium',
                card.deltaPositive ? 'text-green-400' : 'text-slate-500'
              )}>
                <span>{card.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
