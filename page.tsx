import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import { GAMES, formatPrice } from '@/lib/utils'
import { Shield, TrendingUp, MessageSquare, ChevronRight, Zap } from 'lucide-react'
import { GameType, Listing } from '@/types'

export default async function Home() {
  const supabase = createServerSupabase()
  const { data: listings } = await supabase
    .from('listings')
    .select('*, seller:profiles(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: stats } = await supabase.rpc('get_stats')

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-brand-800/10 rounded-full blur-3xl" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 mb-6 text-brand-400 text-sm font-medium">
            <Zap size={14} className="fill-current" />
            Монголын №1 тоглоомын аккаунт платформ
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-bold text-white mb-6 leading-none tracking-tight">
            GAME<span className="text-brand-500">MARKET</span>
            <span className="block text-4xl md:text-5xl mt-2 text-dark-300">MN</span>
          </h1>
          <p className="text-dark-300 text-lg mb-10 max-w-xl mx-auto">
            Mobile Legends, Standoff 2, PUBG аккаунтаа аюулгүй, хурдан зарж ав.
            Verified seller системтэй, шимтгэл ердөө <span className="text-brand-400 font-semibold">5%</span>.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/listings" className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all glow-orange-sm hover:glow-orange flex items-center gap-2">
              Зар үзэх <ChevronRight size={18} />
            </Link>
            <Link href="/listings/new" className="bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white px-8 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-2">
              Зар нэмэх
            </Link>
          </div>
        </div>
      </section>

      {/* Games */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-white mb-8 text-center">
          ТОГЛООМ СОНГОХ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(GAMES) as [GameType, typeof GAMES[GameType]][]).map(([key, game]) => (
            <Link key={key} href={`/listings?game=${key}`}
              className="group relative overflow-hidden rounded-2xl border border-dark-700 bg-dark-900 p-8 card-hover text-center">
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="text-5xl mb-4">{game.emoji}</div>
              <h3 className="font-display text-2xl font-bold text-white">{game.label}</h3>
              <p className="text-dark-400 text-sm mt-2">Зар харах →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Verified Seller', desc: 'Баталгаажсан худалдагчид. Нэг удаа 99,000₮ төлж verified badge авна.', color: 'text-brand-400' },
            { icon: MessageSquare, title: 'Шууд чат', desc: 'Buyer-Seller хооронд realtime чат. Хурдан, хялбар харилцаа.', color: 'text-blue-400' },
            { icon: TrendingUp, title: '5% Шимтгэл', desc: 'Зөвхөн амжилттай гүйлгээнд 5% шимтгэл. Нуугдмал төлбөр байхгүй.', color: 'text-green-400' },
          ].map((f) => (
            <div key={f.title} className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <f.icon className={`${f.color} mb-4`} size={28} />
              <h3 className="font-display text-xl font-bold text-white mb-2">{f.title}</h3>
              <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent listings */}
      {listings && listings.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold text-white">СҮҮЛИЙН ЗАРУУД</h2>
            <Link href="/listings" className="text-brand-400 hover:text-brand-300 text-sm font-medium flex items-center gap-1">
              Бүгдийг харах <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ListingCard({ listing }: { listing: any }) {
  const game = GAMES[listing.game as GameType]
  return (
    <Link href={`/listing/${listing.id}`} className="group bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden card-hover">
      {/* Image */}
      <div className={`h-40 bg-gradient-to-br ${game.color} relative flex items-center justify-center`}>
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{game.emoji}</span>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-dark-950/80 text-white text-xs px-2 py-1 rounded-full font-medium">
            {game.label}
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2 group-hover:text-brand-400 transition-colors">
          {listing.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-bold text-brand-400">
            {formatPrice(listing.price)}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-dark-400 text-xs">{listing.seller?.username}</span>
            {listing.seller?.is_verified_seller && (
              <Shield size={12} className="text-brand-400 fill-brand-400/20" />
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
