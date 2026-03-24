'use client'

import { Sparkles, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { DailySummary } from '@/lib/types'

interface DailySummaryCardProps {
  summary: DailySummary
}

export function DailySummaryCard({ summary }: DailySummaryCardProps) {
  const [expanded, setExpanded] = useState(false)

  const today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#2a2d3e] p-5"
      style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.08) 0%, rgba(26,29,46,1) 40%, rgba(155,89,255,0.08) 100%)' }}
    >
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ff4dca 0%, transparent 70%)' }}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium capitalize">{today}</p>
              <h2 className="text-sm font-semibold text-white">Resumo do Dia</h2>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-500 hover:text-white transition-colors p-1"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-300 leading-relaxed">{summary.summary}</p>

        {expanded && (
          <div className="mt-4 space-y-3 animate-fade-in">
            {summary.highlights.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp size={13} className="text-green-400" />
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Destaques</span>
                </div>
                <ul className="space-y-1">
                  {summary.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">▸</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.alerts.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertCircle size={13} className="text-red-400" />
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Alertas</span>
                </div>
                <ul className="space-y-1">
                  {summary.alerts.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">▸</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
