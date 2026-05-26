import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const { data: sharedRooms } = await supabase
    .from('shared_rooms')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })

  return (
    <DashboardClient
      user={user}
      conversations={conversations || []}
      sharedRooms={sharedRooms || []}
    />
  )
}
