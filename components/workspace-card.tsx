'use client'

import Link from 'next/link'
import { MessageSquare, Users, CheckSquare, TrendingUp, ExternalLink } from 'lucide-react'
import type { Workspace } from '@/lib/types'

interface WorkspaceCardProps {
  workspace: Workspace
  taskCount?: number
  agentCount?: number
  audience?: string
}

export function WorkspaceCard({ workspace, taskCount = 0, agentCount = 0, audience = '—' }: WorkspaceCardProps) {
  return (
    <Link href={`/workspace/${workspace.slug}`}>
      <div className="group relative overflow-hidden rounded-xl border border-[#2a2d3e] p-4 bg-[#1a1d2e] hover:border-[#3a3d4e] transition-all duration-200 hover:shadow-lg cursor-pointer">
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
          style={{ background: workspace.color }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mt-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{ background: `${workspace.color}20`, color: workspace.color }}
            >
              {workspace.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{workspace.name}</h3>
              <p className="text-[11px] text-slate-500">{workspace.industry ?? workspace.niche}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {workspace.whatsapp_active && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                <MessageSquare size={10} className="text-green-400" />
                <span className="text-[10px] text-green-400">WA</span>
              </div>
            )}
            <div className={`w-2 h-2 rounded-full ${!workspace.is_prospect ? 'bg-green-500' : 'bg-slate-600'}`} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="flex flex-col items-center p-2 rounded-lg bg-[#0f1117]">
            <TrendingUp size={13} className="text-slate-500 mb-1" />
            <span className="text-sm font-bold text-white">{audience}</span>
            <span className="text-[10px] text-slate-600">Audiência</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-[#0f1117]">
            <CheckSquare size={13} className="text-slate-500 mb-1" />
            <span className="text-sm font-bold text-white">{taskCount}</span>
            <span className="text-[10px] text-slate-600">Tasks</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-[#0f1117]">
            <Users size={13} className="text-slate-500 mb-1" />
            <span className="text-sm font-bold text-white">{agentCount}</span>
            <span className="text-[10px] text-slate-600">Agentes</span>
          </div>
        </div>

        {/* External link icon on hover */}
        <ExternalLink
          size={12}
          className="absolute bottom-3 right-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </Link>
  )
}

// Prospect CTA Card
export function ProspectCard() {
  return (
    <Link href="/prospects">
      <div className="relative overflow-hidden rounded-xl border border-dashed border-[#3a3d4e] p-4 bg-[#1a1d2e] hover:border-coral/40 transition-all duration-200 cursor-pointer group h-full min-h-[140px] flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center mb-3 shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
          <Users size={18} className="text-white" />
        </div>
        <p className="text-sm font-semibold text-white">Novo Prospect</p>
        <p className="text-xs text-slate-500 mt-1">Analisar e qualificar lead</p>
      </div>
    </Link>
  )
}
