'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, Loader2, AlertCircle, Plus, MessageSquare, Clock } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import type { Agent } from '@/lib/types'

// ---- Types --------------------------------------------------------

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

interface StoredConversation {
  id: string
  title: string | null
  created_at: string
  updated_at: string | null
}

interface ChatInterfaceProps {
  agents: Agent[]
  workspaceId: string
}

// ---- Constants ----------------------------------------------------

const AGENT_TYPE_COLORS: Record<string, string> = {
  orchestrator: '#ff6b6b',
  content:      '#ff4dca',
  analytics:    '#9b59ff',
  social:       '#3b82f6',
  prospect:     '#10b981',
}

const AGENT_TYPE_LABELS: Record<string, string> = {
  orchestrator: 'Orquestrador',
  content:      'Conteúdo',
  analytics:    'Analytics',
  social:       'Social',
  prospect:     'Prospects',
}

const STATUS_DOT: Record<string, string> = {
  running: 'bg-green-400',
  idle:    'bg-yellow-400',
  error:   'bg-red-500',
  stopped: 'bg-slate-500',
}

// ---- Helpers ------------------------------------------------------

function agentColor(agent: Agent) {
  return AGENT_TYPE_COLORS[agent.role ?? agent.type ?? ''] ?? '#9b59ff'
}
function agentLabel(agent: Agent) {
  return AGENT_TYPE_LABELS[agent.role ?? agent.type ?? ''] ?? (agent.role ?? agent.type ?? '')
}

function AgentAvatar({ agent, size = 'md' }: { agent: Agent; size?: 'sm' | 'md' }) {
  const color = agentColor(agent)
  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center font-bold flex-shrink-0',
        size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
      )}
      style={{ background: `${color}25`, color }}
    >
      {agent.name.slice(0, 2).toUpperCase()}
    </div>
  )
}

// ---- SSE parser ---------------------------------------------------
// Proper buffered SSE parsing: accumulates across chunks, splits on \n\n,
// handles multi-byte UTF-8 sequences correctly with stream:true.

async function* parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<{ text?: string; error?: string; conversationId?: string }> {
  const decoder = new TextDecoder('utf-8', { fatal: false })
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // Split on SSE event boundary (blank line)
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? '' // keep incomplete event

    for (const event of events) {
      if (!event.trim()) continue
      for (const line of event.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') return
        try {
          yield JSON.parse(payload) as { text?: string; error?: string; conversationId?: string }
        } catch {
          console.warn('[SSE] parse error:', payload.slice(0, 80))
        }
      }
    }
  }

  // Flush decoder and handle any remaining buffered data
  const tail = decoder.decode(undefined, { stream: false })
  if (tail) buffer += tail
  for (const line of buffer.split('\n')) {
    if (!line.startsWith('data: ')) continue
    const payload = line.slice(6).trim()
    if (payload && payload !== '[DONE]') {
      try { yield JSON.parse(payload) } catch { /* ignore */ }
    }
  }
}

// ---- Main component -----------------------------------------------

export function ChatInterface({ agents }: ChatInterfaceProps) {
  const [selectedAgent, setSelectedAgent]   = useState<Agent | null>(agents[0] ?? null)
  const [conversations, setConversations]   = useState<StoredConversation[]>([])
  const [activeConvId, setActiveConvId]     = useState<string | null>(null)
  const [messages, setMessages]             = useState<ChatMessage[]>([])
  const [input, setInput]                   = useState('')
  const [isLoading, setIsLoading]           = useState(false)
  const [isLoadingConvs, setIsLoadingConvs] = useState(false)
  const [isLoadingMsgs, setIsLoadingMsgs]   = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  const messagesEndRef      = useRef<HTMLDivElement>(null)
  const inputRef            = useRef<HTMLTextAreaElement>(null)
  const streamingContentRef = useRef('')
  // Keep a ref to the current activeConvId so the sendMessage callback always reads latest value
  const activeConvIdRef     = useRef<string | null>(null)

  // Sync ref whenever state changes
  useEffect(() => { activeConvIdRef.current = activeConvId }, [activeConvId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversations whenever selected agent changes
  useEffect(() => {
    setActiveConvId(null)
    setMessages([])
    setConversations([])
    setError(null)
    if (selectedAgent) fetchConversations(selectedAgent.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAgent?.id])

  // ---- Data loaders -----------------------------------------------

  const fetchConversations = useCallback(async (agentId: string) => {
    setIsLoadingConvs(true)
    try {
      const res = await fetch(`/api/conversations?agentId=${agentId}`)
      if (!res.ok) throw new Error(await res.text())
      const data: StoredConversation[] = await res.json()
      setConversations(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('[fetchConversations]', e)
      setConversations([])
    } finally {
      setIsLoadingConvs(false)
    }
  }, [])

  const selectConversation = useCallback(async (conv: StoredConversation) => {
    if (activeConvIdRef.current === conv.id) return
    setActiveConvId(conv.id)
    setMessages([])
    setError(null)
    setIsLoadingMsgs(true)
    try {
      const res = await fetch(`/api/conversations/${conv.id}/messages`)
      if (!res.ok) throw new Error(await res.text())
      const data: { role: string; content: string }[] = await res.json()
      setMessages(
        (Array.isArray(data) ? data : []).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      )
    } catch (e) {
      console.error('[selectConversation]', e)
      setMessages([])
    } finally {
      setIsLoadingMsgs(false)
    }
  }, [])

  const startNewConversation = useCallback(() => {
    setActiveConvId(null)
    setMessages([])
    setError(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  // ---- Send message -----------------------------------------------

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading || !selectedAgent) return

    const userContent = input.trim()
    setInput('')
    setIsLoading(true)
    setError(null)
    streamingContentRef.current = ''

    const userMsg: ChatMessage = { role: 'user', content: userContent }

    // Optimistically add user msg + streaming placeholder
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: 'assistant', content: '', streaming: true },
    ])

    // Snapshot history BEFORE adding placeholder (for API call)
    const historyForAPI = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForAPI,
          agentId: selectedAgent.id,
          conversationId: activeConvIdRef.current, // send current conversation ID
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()

      for await (const event of parseSSEStream(reader)) {
        if (event.error) throw new Error(event.error)

        // API sends back conversationId on first message of a new conversation
        if (event.conversationId && !activeConvIdRef.current) {
          const newConvId = event.conversationId
          setActiveConvId(newConvId)
          // Refresh conversations list after a short delay (let DB settle)
          setTimeout(() => {
            if (selectedAgent) fetchConversations(selectedAgent.id)
          }, 600)
        }

        if (event.text) {
          streamingContentRef.current += event.text
          const snapshot = streamingContentRef.current
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = { role: 'assistant', content: snapshot, streaming: true }
            }
            return updated
          })
        }
      }

      // Finalise
      const finalContent = streamingContentRef.current
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = { role: 'assistant', content: finalContent, streaming: false }
        }
        return updated
      })

      // Refresh conversations list to update "updated_at" ordering
      if (selectedAgent) {
        setTimeout(() => fetchConversations(selectedAgent.id), 800)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      setMessages((prev) => {
        const updated = [...prev]
        if (updated[updated.length - 1]?.streaming) updated.pop()
        return updated
      })
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [input, isLoading, selectedAgent, messages, fetchConversations])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ---- Empty state ------------------------------------------------

  if (agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="text-center">
          <Bot size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum agente encontrado para este workspace.</p>
        </div>
      </div>
    )
  }

  // ---- Render ------------------------------------------------------

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[560px] rounded-xl border border-[#2a2d3e] overflow-hidden">

      {/* ── Left panel ──────────────────────────────────────────── */}
      <div className="w-64 flex-shrink-0 border-r border-[#2a2d3e] bg-[#161822] flex flex-col">

        {/* Agents section */}
        <div className="border-b border-[#2a2d3e]">
          <p className="px-4 pt-4 pb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
            Agentes
          </p>
          <div className="px-2 pb-2 space-y-0.5">
            {agents.map((agent) => {
              const color = agentColor(agent)
              const isSelected = selectedAgent?.id === agent.id
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-150 text-left',
                    isSelected
                      ? 'bg-white/10 border border-white/10'
                      : 'hover:bg-white/5 border border-transparent'
                  )}
                >
                  <AgentAvatar agent={agent} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{agent.name}</p>
                    <p className="text-[10px] truncate" style={{ color }}>{agentLabel(agent)}</p>
                  </div>
                  <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[agent.status] ?? 'bg-slate-500')} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Conversations section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header + Nova conversa button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2d3e]">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
              Conversas
            </p>
            <button
              onClick={startNewConversation}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2a2d3e] hover:bg-[#3a3d4e] transition-colors text-[10px] font-semibold text-slate-300 hover:text-white"
              title="Nova conversa"
            >
              <Plus size={11} />
              Nova
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {isLoadingConvs && (
              <div className="flex items-center justify-center py-6">
                <Loader2 size={16} className="text-slate-600 animate-spin" />
              </div>
            )}

            {!isLoadingConvs && conversations.length === 0 && (
              <div className="text-center py-6 px-3">
                <MessageSquare size={20} className="mx-auto text-slate-700 mb-2" />
                <p className="text-[11px] text-slate-600">Nenhuma conversa ainda</p>
                <p className="text-[10px] text-slate-700 mt-1">Envie uma mensagem para começar</p>
              </div>
            )}

            {!isLoadingConvs && conversations.map((conv) => {
              const isActive = activeConvId === conv.id
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150',
                    isActive
                      ? 'bg-white/10 border border-white/10'
                      : 'hover:bg-white/5 border border-transparent'
                  )}
                >
                  <p className="text-xs text-white truncate leading-snug">
                    {conv.title ?? 'Conversa sem título'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={9} className="text-slate-600 flex-shrink-0" />
                    <p className="text-[10px] text-slate-600 truncate">
                      {timeAgo(conv.updated_at ?? conv.created_at)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Right panel: Chat ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-[#0f1117] min-w-0">

        {/* Chat header */}
        {selectedAgent && (
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#2a2d3e] bg-[#1a1d2e] flex-shrink-0">
            <AgentAvatar agent={selectedAgent} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{selectedAgent.name}</p>
              <p className="text-[11px] text-slate-500">
                {selectedAgent.model} ·{' '}
                <span style={{ color: agentColor(selectedAgent) }}>{agentLabel(selectedAgent)}</span>
                {activeConvId && (
                  <span className="text-slate-700"> · conversa ativa</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className={cn('w-2 h-2 rounded-full', STATUS_DOT[selectedAgent.status] ?? 'bg-slate-500')} />
              <span className="text-xs text-slate-500 capitalize">{selectedAgent.status}</span>
            </div>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Loading messages indicator */}
          {isLoadingMsgs && (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={20} className="text-slate-600 animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!isLoadingMsgs && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <Bot size={36} className="text-slate-500 mb-3" />
              <p className="text-slate-400 text-sm font-medium">
                {selectedAgent
                  ? activeConvId
                    ? 'Carregando conversa…'
                    : `Nova conversa com ${selectedAgent.name}`
                  : 'Selecione um agente para começar'}
              </p>
              {selectedAgent && !activeConvId && (
                <p className="text-slate-600 text-xs mt-1 max-w-xs">
                  {selectedAgent.description ?? 'Pronto para ajudar com sua estratégia de marketing.'}
                </p>
              )}
            </div>
          )}

          {/* Message bubbles */}
          {!isLoadingMsgs && messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              {msg.role === 'assistant' && selectedAgent && (
                <AgentAvatar agent={selectedAgent} size="sm" />
              )}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  P
                </div>
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words',
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#ff6b6b] to-[#ff4dca] text-white rounded-tr-sm'
                    : 'bg-[#1a1d2e] border border-[#2a2d3e] text-slate-200 rounded-tl-sm'
                )}
              >
                {msg.streaming && !msg.content ? (
                  <span className="inline-flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                  </span>
                ) : (
                  <>
                    {msg.content}
                    {msg.streaming && (
                      <span className="inline-block w-0.5 h-4 bg-slate-400 animate-pulse ml-0.5 align-middle" />
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-[#2a2d3e] bg-[#1a1d2e] flex-shrink-0">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !selectedAgent}
              placeholder={
                selectedAgent
                  ? `Mensagem para ${selectedAgent.name}… (Enter para enviar)`
                  : 'Selecione um agente para começar'
              }
              rows={1}
              className="flex-1 bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 resize-none focus:outline-none focus:border-[#ff6b6b80] focus:ring-1 focus:ring-[#ff6b6b20] transition-all disabled:opacity-50 min-h-[44px] max-h-32"
              style={{ lineHeight: '1.5' }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${Math.min(el.scrollHeight, 128)}px`
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || !selectedAgent}
              className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex-shrink-0 shadow-lg shadow-pink-500/20"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-700 mt-2 text-center">
            Shift+Enter para nova linha · Enter para enviar
          </p>
        </div>
      </div>
    </div>
  )
}
