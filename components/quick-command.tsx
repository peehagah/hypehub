'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, FileText, Plus, BarChart2, Download, Building2 } from 'lucide-react'

interface Command {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  category: string
  shortcut?: string
  action: () => void
}

function useCommands(): Command[] {
  return [
    {
      id: 'report', label: 'Gerar Relatório', description: 'Gerar relatório semanal consolidado',
      icon: <FileText size={16} />, category: 'Ações',
      action: () => console.log('report'),
    },
    {
      id: 'task', label: 'Nova Task', description: 'Criar uma nova tarefa',
      icon: <Plus size={16} />, category: 'Ações',
      action: () => console.log('task'),
    },
    {
      id: 'prospect', label: 'Analisar Prospect', description: 'Analisar perfil de novo prospect',
      icon: <BarChart2 size={16} />, category: 'Ações',
      action: () => console.log('prospect'),
    },
    {
      id: 'export', label: 'Exportar Dados', description: 'Exportar métricas em CSV/PDF',
      icon: <Download size={16} />, category: 'Ações',
      action: () => console.log('export'),
    },
    {
      id: 'office', label: 'Escritório Virtual', description: 'Abrir o escritório virtual de agentes',
      icon: <Building2 size={16} />, category: 'Navegação',
      action: () => console.log('office'),
    },
  ]
}

interface QuickCommandBarProps {
  isOpen: boolean
  onClose: () => void
}

export function QuickCommandModal({ isOpen, onClose }: QuickCommandBarProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const commands = useCommands()

  const filtered = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] modal-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#3a3d4e] shadow-2xl overflow-hidden animate-fade-in"
        style={{ background: '#1a1d2e' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2a2d3e]">
          <Search size={16} className="text-slate-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar comandos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-slate-600 text-sm outline-none"
          />
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[#2a2d3e] text-[10px] text-slate-500">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-2">
          {Object.keys(grouped).length === 0 && (
            <p className="text-center text-slate-600 text-sm py-8">Nenhum comando encontrado</p>
          )}
          {Object.entries(grouped).map(([category, cmds]) => (
            <div key={category}>
              <p className="px-4 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                {category}
              </p>
              {cmds.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.action(); onClose() }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#2a2d3e] flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-gradient-brand transition-all">
                    {cmd.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{cmd.label}</p>
                    <p className="text-xs text-slate-500 truncate">{cmd.description}</p>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[#2a2d3e] px-4 py-2 flex items-center gap-4 text-[10px] text-slate-600">
          <span><kbd className="px-1 py-0.5 rounded bg-[#2a2d3e] text-slate-500">↑↓</kbd> navegar</span>
          <span><kbd className="px-1 py-0.5 rounded bg-[#2a2d3e] text-slate-500">↵</kbd> executar</span>
          <span><kbd className="px-1 py-0.5 rounded bg-[#2a2d3e] text-slate-500">ESC</kbd> fechar</span>
        </div>
      </div>
    </div>
  )
}

interface QuickCommandBarTriggerProps {
  onOpen: () => void
}

export function QuickCommandBar({ onOpen }: QuickCommandBarTriggerProps) {
  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] text-slate-500 hover:text-slate-300 hover:border-[#3a3d4e] transition-all duration-150 group"
    >
      <Search size={16} />
      <span className="flex-1 text-left text-sm">Buscar ou executar um comando...</span>
      <div className="flex items-center gap-1">
        <kbd className="px-1.5 py-0.5 rounded bg-[#2a2d3e] text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors">⌘</kbd>
        <kbd className="px-1.5 py-0.5 rounded bg-[#2a2d3e] text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors">K</kbd>
      </div>
    </button>
  )
}
