'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Gamepad2, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
        router.refresh()
      } else {
        if (!username.trim()) throw new Error('Хэрэглэгчийн нэр оруулна уу')
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            username: username.trim(),
            is_verified_seller: false,
            total_sales: 0,
            rating: 0,
          })
        }
        router.push('/')
        router.refresh()
      }
    } catch (e: any) {
      setError(e.message || 'Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl glow-orange mb-4">
            <Gamepad2 size={28} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white">
            {mode === 'login' ? 'НЭВТРЭХ' : 'БҮРТГЭЛТЭЙ БОЛОХ'}
          </h1>
        </div>

        <div className="bg-dark-900 border border-dark-700 rounded-2xl p-8">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-dark-800 p-1 mb-6">
            {(['login', 'register'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-brand-600 text-white' : 'text-dark-400 hover:text-white'}`}>
                {m === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-dark-300 text-sm mb-1.5 block">Хэрэглэгчийн нэр</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="username" />
              </div>
            )}
            <div>
              <label className="text-dark-300 text-sm mb-1.5 block">И-мэйл</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-colors"
                placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-dark-300 text-sm mb-1.5 block">Нууц үг</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 transition-colors"
                  placeholder="••••••••" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition-all glow-orange-sm hover:glow-orange mt-2">
              {loading ? 'Уншиж байна...' : mode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
