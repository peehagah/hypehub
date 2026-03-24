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

const metrics: MetricCardItem[] = [
  {
    label: 'Audiência Total',
    value: '284.7k',
    delta: '+12.4%',
    deltaPositive: true,
    icon: <Users size={18} />,
    color: '#ff6b6b',
    glow: 'rgba(255,107,107,0.15)',
  },
  {
    label: 'Usuários SaaS',
    value: '1.847',
    delta: '+8.2%',
    deltaPositive: true,
    icon: <TrendingUp size={18} />,
    color: '#9b59ff',
    glow: 'rgba(155,89,255,0.15)',
  },
  {
    label: 'Tasks na Semana',
    value: '34',
    delta: '12 pendentes',
    deltaPositive: false,
    icon: <CheckSquare size={18} />,
    color: '#ff4dca',
    glow: 'rgba(255,77,202,0.15)',
  },
  {
    label: 'Clientes Ativos',
    value: '4',
    delta: '+1 este mês',
    deltaPositive: true,
    icon: <Building2 size={18} />,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
  },
]

export function MetricsCards() {
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
              {m.deltaPositive && <span>↑</span>}
              <span>{m.delta}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
