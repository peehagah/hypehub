'use client'

import { Users, TrendingUp, CheckSquare, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardItem {
  label: string
  value: string
  delta: string
  deltaPositive: boolean
  icon: React.ReactNode
  color: string
  glow: string
}

export interface ConsolidatedMetrics {
  totalFollowers: number | null
  avgEngagementRate: number | null  // average % across workspaces
  totalPosts: number | null
  activeClients: number
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function buildMetrics(consolidated?: ConsolidatedMetrics | null, taskCount = 0, pendingCount = 0): MetricCardItem[] {
  const followers = consolidated?.totalFollowers
  const engagement = consolidated?.avgEngagementRate
  const posts = consolidated?.totalPosts
  const activeClients = consolidated?.activeClients ?? 0

  return [
    {
      label: 'Audiência Total',
      value: followers != null ? formatNumber(followers) : '—',
      delta: engagement != null
        ? `${engagement.toFixed(1)}% engajamento médio`
        : 'Instagram',
      deltaPositive: engagement != null ? engagement >= 3 : true,
      icon: <Users size={18} />,
      color: '#ff6b6b',
      glow: 'rgba(255,107,107,0.15)',
    },
    {
      label: 'Posts Instagram',
      value: posts != null ? formatNumber(posts) : '—',
      delta: 'total publicados',
      deltaPositive: true,
      icon: <TrendingUp size={18} />,
      color: '#9b59ff',
      glow: 'rgba(155,89,255,0.15)',
    },
    {
      label: 'Tasks na Semana',
      value: String(taskCount),
      delta: `${pendingCount} pendentes`,
      deltaPositive: pendingCount === 0,
      icon: <CheckSquare size={18} />,
      color: '#ff4dca',
      glow: 'rgba(255,77,202,0.15)',
    },
    {
      label: 'Clientes Ativos',
      value: String(activeClients),
      delta: 'workspaces ativos',
      deltaPositive: true,
      icon: <Building2 size={18} />,
      color: '#f59e0b',
      glow: 'rgba(245,158,11,0.15)',
    },
  ]
}

interface MetricsCardsProps {
  consolidated?: ConsolidatedMetrics | null
  taskCount?: number
  pendingCount?: number
}

export function MetricsCards({ consolidated, taskCount = 0, pendingCount = 0 }: MetricsCardsProps) {
  const metrics = buildMetrics(consolidated, taskCount, pendingCount)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl border border-[#2a2d3e] p-4 transition-all duration-200 hover:border-[#3a3d4e] group"
          style={{ background: '#1a1d2e' }}
        >
          {/* Background glow */}
          <div
            className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity"
            style={{ background: m.glow }}
          />

          <div className="relative">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${m.color}20`, color: m.color }}
            >
              {m.icon}
            </div>

            <p className="text-2xl font-bold text-white tracking-tight">{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>

            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              m.deltaPositive ? 'text-green-400' : 'text-slate-500'
            )}>
              {m.deltaPositive && m.delta.startsWith('+') && <span>↑</span>}
              <span>{m.delta}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
