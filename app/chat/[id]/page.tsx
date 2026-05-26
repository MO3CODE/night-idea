import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import ChatClient from './ChatClient'

type Message = { role: 'user' | 'assistant'; content: string }

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const isShared = id.startsWith('shared-')
  const realId = isShared ? id.replace('shared-', '') : id

  let title = ''
  let messages: Message[] = []

  if (isShared) {
    const { data } = await supabase
      .from('shared_rooms')
      .select('name, messages')
      .eq('id', realId)
      .single()
    if (!data) redirect('/dashboard')
    title = data.name
    messages = (data.messages || []) as Message[]
  } else {
    const { data } = await supabase
      .from('conversations')
      .select('title, messages')
      .eq('id', realId)
      .eq('user_id', user.id)
      .single()
    if (!data) redirect('/dashboard')
    title = data.title
    messages = (data.messages || []) as Message[]
  }

  return (
    <ChatClient
      conversationId={realId}
      isShared={isShared}
      title={title}
      initialMessages={messages}
      userName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'أنت'}
    />
  )
}
