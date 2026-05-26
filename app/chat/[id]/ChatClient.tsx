'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Message = { role: 'user' | 'assistant'; content: string }

export default function ChatClient({
  conversationId, isShared, title, initialMessages, userName
}: {
  conversationId: string
  isShared: boolean
  title: string
  initialMessages: Message[]
  userName: string
}) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: text, isShared }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ حدث خطأ، حاول مرة أخرى.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ تعذر الاتصال.' }])
    }
    setLoading(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)'
      }}>
        <button className="btn-ghost" onClick={() => router.push('/dashboard')}
          style={{ padding: '6px 10px', fontSize: '13px' }}>← لوحة التحكم</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{isShared ? '🏠' : '💬'}</span>
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>{title}</h1>
          {isShared && (
            <span style={{
              background: '#6366f120', color: '#818cf8', fontSize: '11px',
              padding: '2px 8px', borderRadius: '12px', border: '1px solid #6366f140'
            }}>مشترك</span>
          )}
        </div>
        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{messages.length} رسالة</span>
      </header>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🧠</div>
            <p style={{ margin: 0, fontSize: '16px' }}>ابدأ محادثتك</p>
            <p style={{ margin: '6px 0 0', fontSize: '13px' }}>سأتذكر كل شيء تقوله</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            gap: '10px', alignItems: 'flex-start'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
              background: m.role === 'user' ? 'var(--accent)' : 'var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '600'
            }}>
              {m.role === 'user' ? userName.charAt(0).toUpperCase() : '🧠'}
            </div>
            <div style={{
              maxWidth: '70%', padding: '12px 16px', borderRadius: '12px',
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface)',
              border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
              fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--border)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '13px'
            }}>🧠</div>
            <div style={{
              padding: '12px 16px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '12px',
              display: 'flex', gap: '4px', alignItems: 'center'
            }}>
              {[0, 1, 2].map(d => (
                <span key={d} style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: 'var(--muted)',
                  animation: 'pulse 1.2s ease-in-out infinite',
                  animationDelay: `${d * 0.2}s`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: '16px 20px', borderTop: '1px solid var(--border)',
        background: 'var(--surface)'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize() }}
            onKeyDown={handleKey}
            placeholder="اكتب رسالتك... (Enter للإرسال، Shift+Enter لسطر جديد)"
            rows={1}
            style={{
              flex: 1, resize: 'none', fontSize: '14px',
              padding: '10px 14px', lineHeight: '1.5'
            }}
          />
          <button
            className="btn-primary"
            onClick={send}
            disabled={loading || !input.trim()}
            style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
          >
            {loading ? '...' : 'إرسال'}
          </button>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>
          يعمل بـ OpenRouter · {isShared ? 'غرفة مشتركة — يرى الجميع المحادثة' : 'محادثة خاصة'}
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
