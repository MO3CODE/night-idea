'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-client'

type Conv = { id: string; title: string; created_at: string; updated_at: string }
type Room = { id: string; name: string; created_at: string }

export default function DashboardClient({
  user, conversations, sharedRooms
}: {
  user: User
  conversations: Conv[]
  sharedRooms: Room[]
}) {
  const router = useRouter()
  const supabase = createClient()
  const [tab, setTab] = useState<'private' | 'shared'>('private')
  const [newRoomName, setNewRoomName] = useState('')
  const [creating, setCreating] = useState(false)

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'مستخدم'

  async function newChat() {
    const { data } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title: 'محادثة جديدة', messages: [] })
      .select('id').single()
    if (data) router.push(`/chat/${data.id}`)
  }

  async function createRoom() {
    if (!newRoomName.trim()) return
    setCreating(true)
    const { data } = await supabase
      .from('shared_rooms')
      .insert({ name: newRoomName.trim(), created_by: user.id, messages: [] })
      .select('id').single()
    setCreating(false)
    setNewRoomName('')
    if (data) router.push(`/chat/shared-${data.id}`)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sidebarStyle: React.CSSProperties = {
    width: '260px', minHeight: '100vh', background: 'var(--surface)',
    borderLeft: '1px solid var(--border)', padding: '20px 16px',
    display: 'flex', flexDirection: 'column', gap: '8px'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'row-reverse' }}>
      <aside style={sidebarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'var(--accent)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: 'white',
            flexShrink: 0
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</p>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)' }}>مساحتك الشخصية</p>
          </div>
          <button className="btn-ghost" onClick={logout} style={{ padding: '4px 8px', fontSize: '12px' }}>خروج</button>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg)', borderRadius: '8px', padding: '3px' }}>
          {(['private', 'shared'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '6px', borderRadius: '6px', fontSize: '12px',
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? 'white' : 'var(--muted)'
            }}>
              {t === 'private' ? 'خاص' : 'مشترك'}
            </button>
          ))}
        </div>

        {tab === 'private' ? (
          <>
            <button className="btn-primary" onClick={newChat} style={{ width: '100%', marginTop: '4px' }}>
              + محادثة جديدة
            </button>
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              {conversations.length === 0 && (
                <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>لا توجد محادثات بعد</p>
              )}
              {conversations.map(c => (
                <button key={c.id} className="btn-ghost" onClick={() => router.push(`/chat/${c.id}`)}
                  style={{ width: '100%', textAlign: 'right', padding: '10px 12px' }}>
                  <span style={{ fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    💬 {c.title}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <input placeholder="اسم الغرفة" value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createRoom()}
                style={{ flex: 1, fontSize: '13px', padding: '8px 10px' }} />
              <button className="btn-primary" onClick={createRoom} disabled={creating} style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                {creating ? '...' : 'إنشاء'}
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              {sharedRooms.length === 0 && (
                <p style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>لا توجد غرف مشتركة</p>
              )}
              {sharedRooms.map(r => (
                <button key={r.id} className="btn-ghost" onClick={() => router.push(`/chat/shared-${r.id}`)}
                  style={{ width: '100%', textAlign: 'right', padding: '10px 12px' }}>
                  <span style={{ fontSize: '13px' }}>🏠 {r.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '40px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
          <h2 style={{ margin: '0 0 8px', fontSize: '24px' }}>أهلاً {name}</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>اختر محادثة أو أنشئ واحدة جديدة</p>
        </div>
      </main>
    </div>
  )
}
