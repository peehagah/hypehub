'use client'

import { Circle, Clock, CheckCircle2, Plus } from 'lucide-react'
import type { Task, Workspace, TaskStatus } from '@/lib/types'

interface KanbanBoardProps {
  tasks: Task[]
  workspaces: Workspace[]
}

const COLUMNS: { id: TaskStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'todo', label: 'A Fazer', icon: <Circle size={14} />, color: '#6b7280' },
  { id: 'doing', label: 'Em Progresso', icon: <Clock size={14} />, color: '#f59e0b' },
  { id: 'done', label: 'Concluído', icon: <CheckCircle2 size={14} />, color: '#22c55e' },
]

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: '#6b7280' },
  medium: { label: 'Média', color: '#3b82f6' },
  high: { label: 'Alta', color: '#f59e0b' },
  urgent: { label: 'Urgente', color: '#ef4444' },
}

export function KanbanBoard({ tasks, workspaces }: KanbanBoardProps) {
  const getWorkspace = (id: string) => workspaces.find((w) => w.id === id)

  return (
    <div className="grid grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id)
        return (
          <div key={col.id} className="flex flex-col gap-3">
            {/* Column header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{ color: col.color }}>{col.icon}</span>
                <span className="text-sm font-semibold text-slate-300">{col.label}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${col.color}20`, color: col.color }}
                >
                  {colTasks.length}
                </span>
              </div>
              <button className="text-slate-600 hover:text-slate-300 transition-colors">
                <Plus size={14} />
              </button>
            </div>

            {/* Tasks */}
            <div className="space-y-2 min-h-[100px]">
              {colTasks.map((task) => {
                const ws = getWorkspace(task.workspace_id)
                const priority = PRIORITY_CONFIG[task.priority]
                return (
                  <div
                    key={task.id}
                    className="group relative rounded-xl border border-[#2a2d3e] bg-[#1a1d2e] p-3 hover:border-[#3a3d4e] transition-all duration-150 cursor-pointer"
                  >
                    {/* Workspace color stripe */}
                    {ws && (
                      <div
                        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                        style={{ background: ws.color }}
                      />
                    )}

                    <div className="pl-2">
                      {/* Workspace badge */}
                      {ws && (
                        <div
                          className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full mb-2"
                          style={{ background: `${ws.color}20`, color: ws.color }}
                        >
                          {ws.name}
                        </div>
                      )}

                      <p className="text-xs font-medium text-white leading-relaxed">{task.title}</p>

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a2d3e] text-slate-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: priority.color }}
                        >
                          ● {priority.label}
                        </span>
                        {task.due_date && (
                          <span className="text-[10px] text-slate-600">
                            {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(task.due_date))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

              {colTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#2a2d3e] p-6 flex items-center justify-center">
                  <p className="text-xs text-slate-700">Nenhuma task</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
