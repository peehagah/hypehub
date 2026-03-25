'use client'

import { FileText, Plus, BarChart2, Download, Building2 } from 'lucide-react'

interface Action {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  glow: string
  onClick: () => void
}

const actions: Action[] = [
  {
    id: 'report',
    label: 'Gerar Relatórios',
    icon: <FileText size={18} />,
    color: '#ff6b6b',
    glow: 'rgba(255,107,107,0.2)',
    onClick: () => console.log('report'),
  },
  {
    id: 'task',
    label: 'Nova Task',
    icon: <Plus size={18} />,
    color: '#9b59ff',
    glow: 'rgba(155,89,255,0.2)',
    onClick: () => console.log('task'),
  },
  {
    id: 'prospect',
    label: 'Analisar Prospect',
    icon: <BarChart2 size={18} />,
    color: '#ff4dca',
    glow: 'rgba(255,77,202,0.2)',
    onClick: () => console.log('prospect'),
  },
  {
    id: 'export',
    label: 'Exportar',
    icon: <Download size={18} />,
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
    onClick: () => console.log('export'),
  },
  {
    id: 'office',
    label: 'Escritório Virtual',
    icon: <Building2 size={18} />,
    color: '#22c55e',
    glow: 'rgba(34,197,94,0.2)',
    onClick: () => console.log('office'),
  },
]

export function QuickActions() {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-3">Atalhos Rápidos</p>
      <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:pb-0 scrollbar-none">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#2a2d3e] bg-[#1a1d2e] transition-all duration-150 hover:border-[#3a3d4e] hover:scale-[1.02] group text-sm font-medium text-slate-300 hover:text-white flex-shrink-0 min-h-[44px]"
            style={{
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${action.glow}`
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
            }}
          >
            <span style={{ color: action.color }}>{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
