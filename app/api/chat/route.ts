/* eslint-disable @typescript-eslint/no-explicit-any */
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase'
import type { Agent } from '@/lib/types'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { messages, agentId, conversationId: existingConversationId } = await req.json()

    if (!agentId) {
      return new Response(JSON.stringify({ error: 'agentId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch agent from DB to get system prompt and model
    const supabase = createServerClient()
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (agentError || !agentData) {
      return new Response(JSON.stringify({ error: 'Agent not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const agent = agentData as unknown as Agent

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Build the SSE stream
    const encoder = new TextEncoder()

    console.log(`[chat] agentId=${agentId} model=${agent.model} messages=${messages.length}`)

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Update agent last_active_at and status
          await supabase
            .from('agents')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ last_active_at: new Date().toISOString(), status: 'running' } as any)
            .eq('id', agentId)

          // Derive title from the latest user message (first 60 chars)
          const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
          const titleFromMsg = lastUserMsg
            ? String(lastUserMsg.content).slice(0, 60) + (String(lastUserMsg.content).length > 60 ? '…' : '')
            : `Chat com ${agent.name}`

          // Create or reuse existing conversation
          let conversationId: string | null = existingConversationId ?? null
          if (!conversationId) {
            const { data: conv, error: convErr } = await supabase
              .from('conversations')
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .insert({
                agent_id: agentId,
                workspace_id: agent.workspace_id,
                channel: 'dashboard',
                title: titleFromMsg,
                user_id: null,
                metadata: {},
              } as any)
              .select('id')
              .single()
            if (convErr) console.error('[chat] create conversation:', convErr.message)
            conversationId = (conv as unknown as { id: string } | null)?.id ?? null
          }

          // Save latest user message to DB
          const latestUserMsg = messages[messages.length - 1]
          console.log(`[chat] saving user msg, convId=${conversationId}, role=${latestUserMsg?.role}, len=${String(latestUserMsg?.content ?? '').length}`)
          if (conversationId && latestUserMsg?.role === 'user') {
            const { error: userMsgErr } = await supabase.from('messages').insert({
              conversation_id: conversationId,
              role: 'user',
              content: String(latestUserMsg.content),
              tokens_used: null,
              metadata: {},
            } as any)
            if (userMsgErr) console.error('[chat] save user msg error:', userMsgErr.message)
          }

          let fullResponse = ''

          // Stream from Anthropic
          const anthropicStream = await anthropic.messages.stream({
            model: agent.model || 'claude-sonnet-4-6',
            max_tokens: (agent as Agent & { max_tokens?: number }).max_tokens || 4096,
            system: agent.system_prompt || 'You are a helpful marketing AI assistant for HypeHub.',
            messages: messages.map((m: { role: string; content: string }) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          })

          // Send conversationId to client first
          if (conversationId) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ conversationId })}\n\n`))
          }

          let chunkCount = 0
          for await (const chunk of anthropicStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text
              fullResponse += text
              chunkCount++

              // Send SSE event
              const event = `data: ${JSON.stringify({ text })}\n\n`
              controller.enqueue(encoder.encode(event))
            }
          }
          console.log(`[chat] streaming done — ${chunkCount} chunks, ${fullResponse.length} chars`)

          // Save assistant response + bump conversation updated_at
          console.log(`[chat] saving assistant msg, convId=${conversationId}, len=${fullResponse.length}`)
          if (conversationId && fullResponse) {
            const { error: asstMsgErr } = await supabase.from('messages').insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullResponse,
              tokens_used: null,
              metadata: {},
            } as any)
            if (asstMsgErr) console.error('[chat] save assistant msg error:', asstMsgErr.message)

            // Try to bump updated_at (best-effort — table may have auto-trigger)
            await supabase.from('conversations')
              .update({ updated_at: new Date().toISOString() } as any)
              .eq('id', conversationId)
          }

          // Update agent status back to idle
          await supabase
            .from('agents')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ status: 'idle', last_active_at: new Date().toISOString() } as any)
            .eq('id', agentId)

          // Send done event
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          // Update agent status to error
          await supabase
            .from('agents')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .update({ status: 'error', last_active_at: new Date().toISOString() } as any)
            .eq('id', agentId)

          const errorEvent = `data: ${JSON.stringify({ error: String(err) })}\n\n`
          controller.enqueue(encoder.encode(errorEvent))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
