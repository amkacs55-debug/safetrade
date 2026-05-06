'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { GAMES, formatPrice, formatDate, VERIFIED_SELLER_FEE } from '@/lib/utils'
import { GameType } from '@/types'
import { Shield, Plus, Edit, Trash2, Star, TrendingUp, Package, MessageSquare } from 'lucide-react'

export default function SellerDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [verifyStep, setVerifyStep] = useState(false)
  const [paymentProof, setPaymentProof] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      setProfile(p)
      const { data: l } = await supabase.from('listings').select('*').eq('seller_id', data.user.id).order('created_at', { ascending: false })
      setListings(l || [])
    })
  }, [])

  const deleteListing = async (id: string) => {
    if (!confirm('Устгах уу?')) return
    await supabase.from('listings').update({ status: 'removed' }).eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
  }

  const submitVerify = async () => {
    setSubmitting(true)
    await supabase.from('verification_payments').insert({
      user_id: user.id,
      amount: VERIFIED_SELLER_FEE,
      status: 'pending',
      payment_proof: paymentProof,
    })
    setVerifyMsg('Хүсэлт илгээгдлээ. Admin 24 цагийн дотор шалгана.')
    setSubmitting(false)
    setVerifyStep(false)
  }

  const activeListing = listings.filter(l => l.status === 'active')
  const soldListing = listings.filter(l => l.status === 'sold')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-4xl font-bold text-white mb-8">МИНИЙ ДАШБОРД</h1>

      {/* Profile card */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-2xl font-bold text-white">
            {profile?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display text-2xl font-bold text-white">{profile?.username}</h2>
              {profile?.is_verified_seller && (
                <span className="flex items-center gap-1 bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs px-2.5 py-1 rounded-full font-medium">
                  <Shield size={11} /> Verified Seller
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-dark-400">
              <span className="flex items-center gap-1"><Star size={13} className="text-yellow-400" /> {profile?.rating?.toFixed(1) || '0.0'}</span>
              <span>{profile?.total_sales} зарагдсан</span>
            </div>
          </div>
        </div>

        {/* Verify badge CTA */}
        {!profile?.is_verified_seller && (
          <div className="mt-4 p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl">
            {verifyMsg ? (
              <p className="text-brand-300 text-sm">{verifyMsg}</p>
            ) : !verifyStep ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-semibold text-sm">Verified Seller badge авах</p>
                  <p className="text-dark-400 text-xs mt-0.5">Нэг удаа {formatPrice(VERIFIED_SELLER_FEE)} төлж итгэлцлийг нэмэгдүүлнэ</p>
                </div>
                <button onClick={() => setVerifyStep(true)}
                  className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap">
                  <Shield size={14} /> Авах
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-white text-sm font-medium">QPay эсвэл SocialPay дээр <span className="text-brand-400">{formatPrice(VERIFIED_SELLER_FEE)}</span> шилжүүлнэ үү</p>
                <p className="text-dark-400 text-xs">Данс: 1234567890 · GameMarket</p>
                <input value={paymentProof} onChange={e => setPaymentProof(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-brand-500"
                  placeholder="Гүйлгээний дугаар эсвэл зурагны URL" />
                <div className="flex gap-2">
                  <button onClick={submitVerify} disabled={!paymentProof || submitting}
                    className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                    {submitting ? 'Илгээж байна...' : 'Хүсэлт илгээх'}
                  </button>
                  <button onClick={() => setVerifyStep(false)} className="text-dark-400 text-sm px-4 py-2">Болих</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Package, label: 'Идэвхтэй зар', value: activeListing.length, color: 'text-blue-400' },
          { icon: TrendingUp, label: 'Зарагдсан', value: soldListing.length, color: 'text-green-400' },
          { icon: Star, label: 'Үнэлгээ', value: profile?.rating?.toFixed(1) || '0.0', color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="bg-dark-900 border border-dark-800 rounded-2xl p-4 text-center">
            <s.icon size={24} className={`${s.color} mx-auto mb-2`} />
            <p className="font-display text-2xl font-bold text-white">{s.value}</p>
            <p className="text-dark-400 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* My listings */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-white">МИНИЙ ЗАРУУД</h3>
          <Link href="/listings/new" className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white px-3 py-2 rounded-xl text-sm font-medium transition-all">
            <Plus size={15} /> Нэмэх
          </Link>
        </div>

        {listings.length === 0 ? (
          <p className="text-dark-400 text-center py-8">Зар байхгүй байна</p>
        ) : (
          <div className="space-y-2">
            {listings.map(l => {
              const game = GAMES[l.game as GameType]
              return (
                <div key={l.id} className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl">
                  <span className="text-2xl">{game?.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{l.title}</p>
                    <div className="flex items-center gap-2 text-xs text-dark-400">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        l.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        l.status === 'sold' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-dark-700 text-dark-400'
                      }`}>{l.status}</span>
                      <span>{formatPrice(l.price)}</span>
                      <span>{l.views} үзсэн</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/listing/${l.id}`} className="p-1.5 text-dark-400 hover:text-white transition-colors">
                      <Edit size={15} />
                    </Link>
                    <button onClick={() => deleteListing(l.id)} className="p-1.5 text-dark-400 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
