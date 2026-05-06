'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { formatDate, GAMES, formatPrice } from '@/lib/utils'
import { GameType } from '@/types'
import { Send, ChevronLeft, Shield } from 'lucide-react'

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [convo, setConvo] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setUser(data.user)

      // Load conversation
      const { data: c } = await supabase.from('conversations')
        .select('*, listing:listings(*), buyer:profiles!conversations_buyer_id_fkey(*), seller:profiles!conversations_seller_id_fkey(*)')
        .eq('id', id).single()
      setConvo(c)

      // Load messages
      const { data: msgs } = await supabase.from('messages')
        .select('*, sender:profiles(*)')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })
      setMessages(msgs || [])
    })

    // Realtime subscription
    const channel = supabase.channel(`chat:${id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${id}`
      }, async (payload) => {
        const { data: msg } = await supabase.from('messages')
          .select('*, sender:profiles(*)')
          .eq('id', payload.new.id).single()
        if (msg) setMessages(prev => [...prev, msg])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || !user || sending) return
    setSending(true)
    await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: user.id,
      content: text.trim(),
    })
    setText('')
    setSending(false)
  }

  const other = user?.id === convo?.buyer_id ? convo?.seller : convo?.buyer
  const game = convo?.listing ? GAMES[convo.listing.game as GameType] : null

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-dark-900 border-b border-dark-800 px-4 py-3 flex items-center gap-3">
        <Link href="/chat" className="text-dark-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </Link>
        {other && (
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center font-bold text-sm">
              {other.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-sm">{other.username}</span>
                {other.is_verified_seller && <Shield size={12} className="text-brand-400" />}
              </div>
              {convo?.listing && (
                <p className="text-dark-400 text-xs truncate max-w-48">
                  {game?.emoji} {convo.listing.title} · <span className="text-brand-400">{formatPrice(convo.listing.price)}</span>
                </p>
              )}
            </div>
          </div>
        )}
        {convo?.listing && (
          <Link href={`/listing/${convo.listing.id}`}
            className="text-xs text-dark-400 hover:text-brand-400 transition-colors border border-dark-700 px-2 py-1 rounded-lg">
            Зар харах
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12 text-dark-500">
            <p className="text-sm">Чат эхлүүлнэ үү...</p>
          </div>
        )}
        {messages.map((msg: any) => {
          const isMe = msg.sender_id === user?.id
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                isMe ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-dark-800 text-dark-100 rounded-bl-sm'
              }`}>
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-brand-200' : 'text-dark-500'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-dark-900 border-t border-dark-800 p-4">
        <div className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-brand-500"
            placeholder="Мессеж бичих..." />
          <button onClick={sendMessage} disabled={!text.trim() || sending}
            className="w-12 h-12 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
