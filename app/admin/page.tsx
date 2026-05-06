'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatDate, formatPrice } from '@/lib/utils'
import { Shield, CheckCircle, XCircle, Users, Package, AlertTriangle } from 'lucide-react'

const ADMIN_USERNAMES = ['admin'] // Add admin usernames here

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [tab, setTab] = useState<'verifications' | 'listings' | 'users'>('verifications')
  const [verifications, setVerifications] = useState<any[]>([])
  const [listings, setListings] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (!ADMIN_USERNAMES.includes(p?.username)) { router.push('/'); return }
      setProfile(p)
      loadData()
    })
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [v, l, u] = await Promise.all([
      supabase.from('verification_payments').select('*, user:profiles(*)').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('listings').select('*, seller:profiles(*)').order('created_at', { ascending: false }).limit(30),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
    ])
    setVerifications(v.data || [])
    setListings(l.data || [])
    setUsers(u.data || [])
    setLoading(false)
  }

  const approveVerification = async (id: string, userId: string) => {
    await supabase.from('verification_payments').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', id)
    await supabase.from('profiles').update({ is_verified_seller: true, verified_at: new Date().toISOString() }).eq('id', userId)
    setVerifications(prev => prev.filter(v => v.id !== id))
  }

  const rejectVerification = async (id: string) => {
    await supabase.from('verification_payments').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', id)
    setVerifications(prev => prev.filter(v => v.id !== id))
  }

  const removeListing = async (id: string) => {
    await supabase.from('listings').update({ status: 'removed' }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'removed' } : l))
  }

  const TABS = [
    { id: 'verifications', label: 'Баталгаажуулалт', count: verifications.length, icon: Shield },
    { id: 'listings', label: 'Зарууд', count: listings.length, icon: Package },
    { id: 'users', label: 'Хэрэглэгчид', count: users.length, icon: Users },
  ] as const

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield size={28} className="text-brand-400" />
        <h1 className="font-display text-4xl font-bold text-white">ADMIN ПАНЕЛ</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-300 hover:text-white border border-dark-700'}`}>
            <t.icon size={15} />
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20' : 'bg-brand-500/20 text-brand-400'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-dark-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Verifications */}
          {tab === 'verifications' && (
            <div className="space-y-3">
              {verifications.length === 0 && (
                <div className="text-center py-12 text-dark-400">
                  <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Хүлээгдэж буй хүсэлт байхгүй</p>
                </div>
              )}
              {verifications.map(v => (
                <div key={v.id} className="bg-dark-900 border border-dark-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{v.user?.username}</span>
                        <span className="text-xs text-dark-400">{formatDate(v.created_at)}</span>
                      </div>
                      <p className="text-dark-400 text-sm">Дүн: <span className="text-brand-400">{formatPrice(v.amount)}</span></p>
                      {v.payment_proof && (
                        <a href={v.payment_proof} target="_blank" rel="noopener noreferrer"
                          className="text-blue-400 text-sm hover:underline mt-1 block">
                          Төлбөрийн нотолгоо харах →
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveVerification(v.id, v.user_id)}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-xl text-sm font-medium transition-all">
                        <CheckCircle size={14} /> Зөвшөөрөх
                      </button>
                      <button onClick={() => rejectVerification(v.id)}
                        className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-3 py-2 rounded-xl text-sm font-medium transition-all">
                        <XCircle size={14} /> Татгалзах
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Listings */}
          {tab === 'listings' && (
            <div className="space-y-2">
              {listings.map(l => (
                <div key={l.id} className="flex items-center gap-3 bg-dark-900 border border-dark-800 rounded-xl p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{l.title}</p>
                    <p className="text-dark-400 text-xs">{l.seller?.username} · {formatPrice(l.price)} · {formatDate(l.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    l.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    l.status === 'sold' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-dark-700 text-dark-400'
                  }`}>{l.status}</span>
                  {l.status === 'active' && (
                    <button onClick={() => removeListing(l.id)}
                      className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs transition-colors">
                      <AlertTriangle size={12} /> Устгах
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-3 bg-dark-900 border border-dark-800 rounded-xl p-4">
                  <div className="w-9 h-9 rounded-full bg-dark-700 flex items-center justify-center font-bold text-sm">
                    {u.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-sm font-medium">{u.username}</span>
                      {u.is_verified_seller && <Shield size={12} className="text-brand-400" />}
                    </div>
                    <p className="text-dark-400 text-xs">{u.total_sales} зарагдсан · {formatDate(u.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${u.is_verified_seller ? 'bg-brand-500/20 text-brand-400' : 'bg-dark-700 text-dark-400'}`}>
                    {u.is_verified_seller ? 'Verified' : 'Regular'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
