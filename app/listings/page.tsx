'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { GAMES, formatPrice } from '@/lib/utils'
import { GameType } from '@/types'
import { Search, Shield, SlidersHorizontal, X } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Шинэ эхэнд' },
  { value: 'price_asc', label: 'Хямд эхэнд' },
  { value: 'price_desc', label: 'Үнэтэй эхэнд' },
]

export default function ListingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [game, setGame] = useState<string>(searchParams.get('game') || '')
  const [sort, setSort] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const supabase = createClient()

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('listings')
      .select('*, seller:profiles(*)')
      .eq('status', 'active')

    if (game) q = q.eq('game', game)
    if (search) q = q.ilike('title', `%${search}%`)
    if (minPrice) q = q.gte('price', parseInt(minPrice))
    if (maxPrice) q = q.lte('price', parseInt(maxPrice))
    if (verifiedOnly) q = q.eq('seller.is_verified_seller', true)

    if (sort === 'newest') q = q.order('created_at', { ascending: false })
    else if (sort === 'price_asc') q = q.order('price', { ascending: true })
    else if (sort === 'price_desc') q = q.order('price', { ascending: false })

    const { data } = await q.limit(50)
    setListings(data || [])
    setLoading(false)
  }, [game, search, sort, minPrice, maxPrice, verifiedOnly])

  useEffect(() => { fetchListings() }, [fetchListings])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-4xl font-bold text-white mb-8">ЗАРУУД</h1>

      {/* Filters */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-brand-500"
              placeholder="Зар хайх..." />
          </div>

          {/* Game filter */}
          <select value={game} onChange={e => setGame(e.target.value)}
            className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500">
            <option value="">Бүх тоглоом</option>
            {Object.entries(GAMES).map(([k, v]) => (
              <option key={k} value={k}>{v.emoji} {v.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Price range */}
          <input value={minPrice} onChange={e => setMinPrice(e.target.value)} type="number"
            className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm w-32 focus:outline-none focus:border-brand-500"
            placeholder="Min ₮" />
          <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} type="number"
            className="bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm w-32 focus:outline-none focus:border-brand-500"
            placeholder="Max ₮" />

          {/* Verified only */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)}
              className="rounded accent-brand-500" />
            <span className="text-sm text-dark-300 flex items-center gap-1">
              <Shield size={14} className="text-brand-400" /> Verified
            </span>
          </label>
        </div>
      </div>

      {/* Game tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ key: '', label: 'Бүгд', emoji: '🎮' }, ...Object.entries(GAMES).map(([k, v]) => ({ key: k, ...v }))].map(g => (
          <button key={g.key} onClick={() => setGame(g.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${game === g.key ? 'bg-brand-600 text-white' : 'bg-dark-800 text-dark-300 hover:text-white border border-dark-700'}`}>
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-dark-900 border border-dark-800 rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 text-dark-400">
          <p className="text-5xl mb-4">🎮</p>
          <p className="text-xl font-display">Зар олдсонгүй</p>
          <p className="text-sm mt-2">Хайлтаа өөрчилж үзнэ үү</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}

function ListingCard({ listing }: { listing: any }) {
  const game = GAMES[listing.game as GameType]
  return (
    <Link href={`/listing/${listing.id}`} className="group bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden card-hover block">
      <div className={`h-44 bg-gradient-to-br ${game.color} relative flex items-center justify-center overflow-hidden`}>
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-6xl">{game.emoji}</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/60 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="bg-dark-950/80 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full font-medium">
            {game.emoji} {game.label}
          </span>
        </div>
        {listing.seller?.is_verified_seller && (
          <div className="absolute top-3 right-3">
            <span className="bg-brand-500/90 backdrop-blur text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <Shield size={10} /> Verified
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm line-clamp-2 mb-3 group-hover:text-brand-400 transition-colors min-h-[2.5rem]">
          {listing.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-bold text-brand-400">
            {formatPrice(listing.price)}
          </span>
          <div className="text-right">
            <p className="text-dark-400 text-xs">{listing.seller?.username}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

