'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { GAMES, formatDate } from '@/lib/utils'
import { GameType } from '@/types'
import { MessageSquare } from 'lucide-react'

export default function ChatListPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setUser(data.user)
      const { data: convos } = await supabase
        .from('conversations')
        .select('*, listing:listings(*), buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*)')
        .or(`buyer_id.eq.${data.user.id},seller_id.eq.${data.user.id}`)
        .order('created_at', { ascending: false })
      setConversations(convos || [])
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-dark-800 rounded-2xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-4xl font-bold text-white mb-8">ЧАТ</h1>
      {conversations.length === 0 ? (
        <div className="text-center py-20 text-dark-400">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-display text-xl">Чат байхгүй байна</p>
          <p className="text-sm mt-2">Зар дээрээс чатлах товч дарна уу</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map(convo => {
            const other = user?.id === convo.buyer_id ? convo.seller : convo.buyer
            const game = convo.listing ? GAMES[convo.listing.game as GameType] : null
            return (
              <Link key={convo.id} href={`/chat/${convo.id}`}
                className="flex items-center gap-4 bg-dark-900 border border-dark-800 rounded-2xl p-4 hover:border-dark-600 transition-all card-hover">
                <div className="w-12 h-12 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {other?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{other?.username}</span>
                    {game && <span className="text-xs text-dark-400">{game.emoji}</span>}
                  </div>
                  <p className="text-dark-400 text-sm truncate">{convo.listing?.title}</p>
                </div>
                <span className="text-dark-500 text-xs flex-shrink-0">{formatDate(convo.created_at)}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
