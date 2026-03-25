'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Workspace } from '@/lib/types'

interface SidebarProps {
  workspaces?: Workspace[]
}

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/office', label: 'Escritório', icon: Building2 },
  { href: '/prospects', label: 'Prospects', icon: Users },
]

export function Sidebar({ workspaces = [] }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  const navContent = (
    <>
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-[#2a2d3e]', collapsed && 'justify-center px-0')}>
        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg shadow-pink-500/20">
          <span className="text-white font-bold text-lg leading-none">H</span>
        </div>
        {!collapsed && (
          <div>
            <span className="font-bold text-base gradient-text">HypeHub</span>
            <p className="text-[10px] text-slate-500 -mt-0.5">Marketing AI Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-gradient-to-r from-coral/20 to-purple/10 text-white border border-coral/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5',
                collapsed && 'justify-center px-0'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className={active ? 'text-coral' : ''} />
              {!collapsed && label}
            </Link>
          )
        })}

        {/* Clientes section */}
        {!collapsed && (
          <div className="pt-4 pb-1">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3">
              Clientes
            </p>
          </div>
        )}
        {collapsed && <div className="py-2 border-t border-[#2a2d3e] mx-2" />}

        {workspaces.map((ws) => (
          <Link
            key={ws.id}
            href={`/workspace/${ws.slug}`}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group',
              pathname === `/workspace/${ws.slug}`
                ? 'bg-white/5 text-white'
                : 'text-slate-500 hover:text-slate-200 hover:bg-white/5',
              collapsed && 'justify-center px-0'
            )}
            title={collapsed ? ws.name : undefined}
          >
            {/* Color dot */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ background: `${ws.color}25`, color: ws.color }}
            >
              {ws.name.slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{ws.name}</p>
                <div className="flex items-center gap-1">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: !ws.is_prospect ? '#22c55e' : '#6b7280' }}
                  />
                  <span className="text-[10px] text-slate-600 capitalize">{ws.status ?? (!ws.is_prospect ? 'active' : 'prospect')}</span>
                </div>
              </div>
            )}
            {!collapsed && ws.whatsapp_active && (
              <MessageSquare size={12} className="text-green-500 flex-shrink-0" />
            )}
          </Link>
        ))}
      </nav>

      {/* WhatsApp indicator */}
      {!collapsed && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
          <span className="text-xs text-green-400 font-medium">WhatsApp ativo</span>
          <span className="ml-auto text-[10px] text-green-600 font-bold">3 online</span>
        </div>
      )}

      {/* User / Bottom */}
      <div className="border-t border-[#2a2d3e] p-3 space-y-1">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors text-sm',
            collapsed && 'justify-center px-0'
          )}
        >
          <Settings size={16} />
          {!collapsed && 'Configurações'}
        </Link>

        {/* Avatar */}
        <div className={cn('flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors', collapsed && 'justify-center px-0')}>
          <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            P
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white truncate">Pedro</p>
              <p className="text-[10px] text-slate-500 truncate">Admin</p>
            </div>
          )}
          {!collapsed && <LogOut size={14} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0" />}
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile hamburger button (fixed, always visible on mobile) ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 md:hidden w-10 h-10 rounded-xl bg-[#161822] border border-[#2a2d3e] flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-lg"
        aria-label="Abrir menu"
      >
        <Menu size={18} />
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          'relative hidden md:flex flex-col h-screen transition-all duration-300 ease-in-out border-r border-[#2a2d3e] flex-shrink-0',
          collapsed ? 'w-16' : 'w-60'
        )}
        style={{ background: '#161822' }}
      >
        {/* Collapse toggle - desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-[#2a2d3e] border border-[#3a3d4e] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#3a3d4e] transition-colors"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
        {navContent}
      </aside>

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-72 transition-transform duration-300 ease-in-out border-r border-[#2a2d3e] md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: '#161822' }}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-[#2a2d3e] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          aria-label="Fechar menu"
        >
          <X size={14} />
        </button>
        {navContent}
      </aside>
    </>
  )
}
