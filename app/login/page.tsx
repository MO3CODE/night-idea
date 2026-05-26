'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      })
      if (error) { setError(error.message); setLoading(false); return }
      setError('تحقق من بريدك الإلكتروني لتأكيد الحساب')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('البريد أو كلمة المرور غير صحيحة'); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '40px 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', background: 'var(--accent)',
            borderRadius: '12px', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px'
          }}>🧠</div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600' }}>MindBase</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '14px' }}>
            مساحة الفريق الذكية
          </p>
        </div>

        <div style={{
          display: 'flex', background: 'var(--bg)',
          borderRadius: '8px', padding: '4px', marginBottom: '24px'
        }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px', borderRadius: '6px', fontSize: '14px',
              background: mode === m ? 'var(--accent)' : 'transparent',
              color: mode === m ? 'white' : 'var(--muted)',
            }}>
              {m === 'login' ? 'دخول' : 'حساب جديد'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mode === 'signup' && (
            <input
              placeholder="الاسم الكامل"
              value={name} onChange={e => setName(e.target.value)}
              required style={{ width: '100%' }}
            />
          )}
          <input
            type="email" placeholder="البريد الإلكتروني"
            value={email} onChange={e => setEmail(e.target.value)}
            required style={{ width: '100%' }}
          />
          <input
            type="password" placeholder="كلمة المرور"
            value={password} onChange={e => setPassword(e.target.value)}
            required minLength={6} style={{ width: '100%' }}
          />

          {error && (
            <p style={{
              margin: 0, padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
              background: error.includes('تحقق') ? '#0f2' + '0' : '#ff000020',
              color: error.includes('تحقق') ? '#4ade80' : '#f87171',
              border: `1px solid ${error.includes('تحقق') ? '#4ade8040' : '#f8717140'}`
            }}>{error}</p>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', marginTop: '4px' }}>
            {loading ? 'جاري...' : mode === 'login' ? 'دخول' : 'إنشاء حساب'}
          </button>
        </form>
      </div>
    </div>
  )
}
