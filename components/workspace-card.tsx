'use client'

import Link from 'next/link'
import { MessageSquare, Users, TrendingUp, BarChart3, ExternalLink } from 'lucide-react'
import type { Workspace } from '@/lib/types'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

interface WorkspaceCardMetrics {
  followers: number | null
  engagement_rate: number | null
  posts: number | null
}

interface WorkspaceCardProps {
  workspace: Workspace
  metrics?: WorkspaceCardMetrics | null
}

export function WorkspaceCard({ workspace, metrics }: WorkspaceCardProps) {
  const isStandby = workspace.is_standby === true || workspace.status === 'paused'

  return (
    <Link href={`/workspace/${workspace.slug}`}>
      <div
        className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:shadow-lg cursor-pointer ${
          isStandby
            ? 'border-[#2a2d3e] bg-[#14161f] opacity-60 grayscale hover:opacity-75'
            : 'border-[#2a2d3e] bg-[#1a1d2e] hover:border-[#3a3d4e]'
        }`}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
          style={{ background: isStandby ? '#4a4d5e' : workspace.color }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mt-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{
                background: isStandby ? '#2a2d3e' : `${workspace.color}20`,
                color: isStandby ? '#4a4d5e' : workspace.color,
              }}
            >
              {workspace.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{workspace.name}</h3>
              <p className="text-[11px] text-slate-500">{workspace.industry ?? workspace.niche}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {workspace.whatsapp_active && !isStandby && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                <MessageSquare size={10} className="text-green-400" />
                <span className="text-[10px] text-green-400">WA</span>
              </div>
            )}
            {isStandby ? (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/30">
                <span className="text-[10px] text-slate-500 font-medium">Standby</span>
              </div>
            ) : (
              <div className={`w-2 h-2 rounded-full ${!workspace.is_prospect ? 'bg-green-500' : 'bg-slate-600'}`} />
            )}
          </div>
        </div>

        {/* Instagram stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="flex flex-col items-center p-2 rounded-lg bg-[#0f1117]">
            <Users size={13} className="text-slate-500 mb-1" />
            <span className="text-sm font-bold text-white">
              {isStandby || metrics?.followers == null ? '—' : formatNumber(metrics.followers)}
            </span>
            <span className="text-[10px] text-slate-600">Audiência</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-[#0f1117]">
            <TrendingUp size={13} className="text-slate-500 mb-1" />
            <span className="text-sm font-bold text-white">
              {isStandby || metrics?.engagement_rate == null ? '—' : `${metrics.engagement_rate.toFixed(1)}%`}
            </span>
            <span className="text-[10px] text-slate-600">Engajamento</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-lg bg-[#0f1117]">
            <BarChart3 size={13} className="text-slate-500 mb-1" />
            <span className="text-sm font-bold text-white">
              {isStandby || metrics?.posts == null ? '—' : formatNumber(metrics.posts)}
            </span>
            <span className="text-[10px] text-slate-600">Posts</span>
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
