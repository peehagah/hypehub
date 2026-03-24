'use client'

import { useState } from 'react'
import { AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Alert } from '@/lib/types'

interface AlertBannerProps {
  alerts: Alert[]
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  if (!alerts.length || dismissed) return null

  const alert = alerts[current]

  return (
    <div className="w-full bg-red-950/80 border-b border-red-800/50 px-4 py-2.5 flex items-center gap-3 animate-fade-in">
      <div className="flex items-center gap-2 flex-shrink-0">
        <AlertTriangle size={15} className="text-red-400" />
        <span className="text-red-400 font-semibold text-xs uppercase tracking-wider">Alerta Urgente</span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ background: alert.workspaceColor }}
        >
          {alert.workspace}
        </span>
      </div>

      <p className="text-red-200 text-sm flex-1 truncate">{alert.message}</p>

      {/* Navigation */}
      {alerts.length > 1 && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setCurrent((c) => (c - 1 + alerts.length) % alerts.length)}
            className="text-red-400 hover:text-white transition-colors p-0.5"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-red-600 text-xs">{current + 1}/{alerts.length}</span>
          <button
            onClick={() => setCurrent((c) => (c + 1) % alerts.length)}
            className="text-red-400 hover:text-white transition-colors p-0.5"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <button
        onClick={() => setDismissed(true)}
        className="text-red-600 hover:text-red-300 transition-colors flex-shrink-0"
      >
        <X size={15} />
      </button>
    </div>
  )
}
