'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { GAMES, formatPrice, formatDate, calcCommission } from '@/lib/utils'
import { GameType } from '@/types'
import { Shield, MessageSquare, Eye, Star, ChevronLeft, Share2 } from 'lucide-react'

export default function ListingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.from('listings').select('*, seller:profiles(*)')
      .eq('id', id).single()
      .then(({ data }) => {
        setListing(data)
        setLoading(false)
        // increment view
        supabase.from('listings').update({ views: (data?.views || 0) + 1 }).eq('id', id)
      })
  }, [id])

  const startChat = async () => {
    if (!user) { router.push('/auth'); return }
    // check existing convo
    const { data: existing } = await supabase.from('conversations')
      .select('id').eq('listing_id', id).eq('buyer_id', user.id).single()
    if (existing) { router.push(`/chat/${existing.id}`); return }
    // create new
    const { data: convo } = await supabase.from('conversations').insert({
      listing_id: id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
    }).select().single()
    if (convo) router.push(`/chat/${convo.id}`)
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-80 bg-dark-800 rounded-2xl" />
        <div className="h-8 bg-dark-800 rounded w-2/3" />
        <div className="h-6 bg-dark-800 rounded w-1/4" />
      </div>
    </div>
  )
  if (!listing) return <div className="text-center py-20 text-dark-400">Зар олдсонгүй</div>

  const game = GAMES[listing.game as GameType]
  const { commission, sellerReceives } = calcCommission(listing.price)
  const isOwner = user?.id === listing.seller_id

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/listings" className="flex items-center gap-1 text-dark-400 hover:text-white text-sm mb-6 transition-colors">
        <ChevronLeft size={16} /> Буцах
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
            <div className={`h-72 bg-gradient-to-br ${game.color} relative flex items-center justify-center`}>
              {listing.images?.length > 0 ? (
                <img src={listing.images[imgIdx]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">{game.emoji}</span>
              )}
            </div>
            {listing.images?.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {listing.images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${imgIdx === i ? 'border-brand-500' : 'border-dark-700'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="font-display text-3xl font-bold text-white leading-tight">{listing.title}</h1>
              <button onClick={() => navigator.share?.({ title: listing.title, url: window.location.href })}
                className="text-dark-400 hover:text-white transition-colors flex-shrink-0">
                <Share2 size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-dark-800 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                {game.emoji} {game.label}
              </span>
              <span className="text-dark-400 text-sm flex items-center gap-1">
                <Eye size={14} /> {listing.views} үзсэн
              </span>
              <span className="text-dark-400 text-sm">{formatDate(listing.created_at)}</span>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-dark-300 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Price + Seller */}
        <div className="space-y-4">
          {/* Price card */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <p className="text-dark-400 text-sm mb-1">Үнэ</p>
            <p className="font-display text-4xl font-bold text-brand-400 mb-4">{formatPrice(listing.price)}</p>

            {!isOwner && (
              <button onClick={startChat}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white py-3.5 rounded-xl font-semibold transition-all glow-orange-sm hover:glow-orange flex items-center justify-center gap-2">
                <MessageSquare size={18} /> Худалдагчтай чатлах
              </button>
            )}
            {isOwner && (
              <div className="text-center">
                <Link href={`/listings/${id}/edit`}
                  className="block w-full bg-dark-800 hover:bg-dark-700 text-white py-3.5 rounded-xl font-semibold transition-all text-center">
                  Зар засах
                </Link>
              </div>
            )}

            {/* Commission info */}
            <div className="mt-4 p-3 bg-dark-800 rounded-xl text-xs text-dark-400 space-y-1">
              <div className="flex justify-between">
                <span>Үнэ:</span>
                <span className="text-white">{formatPrice(listing.price)}</span>
              </div>
              <div className="flex justify-between">
                <span>Шимтгэл (5%):</span>
                <span className="text-red-400">-{formatPrice(commission)}</span>
              </div>
              <div className="flex justify-between border-t border-dark-700 pt-1 mt-1">
                <span>Худалдагч авах:</span>
                <span className="text-green-400 font-medium">{formatPrice(sellerReceives)}</span>
              </div>
            </div>
          </div>

          {/* Seller card */}
          {listing.seller && (
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Худалдагч</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center text-lg font-bold">
                  {listing.seller.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-white">{listing.seller.username}</span>
                    {listing.seller.is_verified_seller && (
                      <Shield size={14} className="text-brand-400 fill-brand-400/20" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-dark-400">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span>{listing.seller.rating?.toFixed(1) || '0.0'}</span>
                    <span>· {listing.seller.total_sales} зарагдсан</span>
                  </div>
                </div>
              </div>
              {listing.seller.is_verified_seller && (
                <div className="mt-3 flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-xl px-3 py-2 text-xs text-brand-300">
                  <Shield size={12} className="fill-brand-400/20" />
                  Баталгаажсан худалдагч
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
