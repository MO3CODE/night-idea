import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { callOpenRouter } from '@/lib/openrouter'

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type ChatRequest = { conversationId?: unknown; message?: unknown; isShared?: unknown }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MAX_MESSAGE_LENGTH = 4000

function parseHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return []

  return value.filter((item): item is ChatMessage =>
    typeof item === 'object' &&
    item !== null &&
    ('role' in item && (item.role === 'user' || item.role === 'assistant')) &&
    ('content' in item && typeof item.content === 'string')
  )
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body: ChatRequest
    try {
      body = await req.json() as ChatRequest
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const conversationId = typeof body.conversationId === 'string' ? body.conversationId : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const isShared = body.isShared === true

    if (!UUID_PATTERN.test(conversationId) || !message || message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    let storedMessages: unknown
    let title: string | null = null

    if (isShared) {
      const { data, error } = await supabase
        .from('shared_rooms')
        .select('messages')
        .eq('id', conversationId)
        .maybeSingle()

      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      storedMessages = data.messages
    } else {
      const { data, error } = await supabase
        .from('conversations')
        .select('messages, title')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      storedMessages = data.messages
      title = data.title
    }

    const history = parseHistory(storedMessages)

    const userMsg = { role: 'user', content: message }
    const updatedHistory = [...history, userMsg]

    const systemPrompt = isShared
      ? 'أنت مساعد ذكي لفريق عمل. أجب بشكل واضح ومختصر. يمكنك التحدث بالعربية والإنجليزية حسب لغة المستخدم.'
      : 'أنت مساعد شخصي ذكي. تذكر تفاصيل المحادثة وساعد المستخدم في أفكاره ومشاريعه. تحدث بالعربية ما لم يطلب غير ذلك.'

    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...updatedHistory.slice(-20),
    ]

    const aiReply = await callOpenRouter(aiMessages)

    const assistantMsg = { role: 'assistant', content: aiReply }
    const finalHistory = [...updatedHistory, assistantMsg]

    const isDefaultTitle = title === 'محادثة جديدة'
    const newTitle = isDefaultTitle && finalHistory.length <= 3
      ? message.slice(0, 40)
      : title

    const updatedAt = new Date().toISOString()
    const { error: updateError } = isShared
      ? await supabase
        .from('shared_rooms')
        .update({ messages: finalHistory, updated_at: updatedAt })
        .eq('id', conversationId)
      : await supabase
        .from('conversations')
        .update({ messages: finalHistory, title: newTitle, updated_at: updatedAt })
        .eq('id', conversationId)
        .eq('user_id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({ reply: aiReply })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
