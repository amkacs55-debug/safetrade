'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { GAMES, formatPrice, calcCommission } from '@/lib/utils'
import { GameType } from '@/types'
import { Upload, X, Info } from 'lucide-react'

export default function NewListingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [game, setGame] = useState<GameType>('mobile_legends')
  const [price, setPrice] = useState('')
  const [images, setImages] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth'); return }
      setUser(data.user)
    })
  }, [])

  const handleSubmit = async () => {
    if (!title || !description || !price) {
      setError('Бүх талбарыг бөглөнө үү'); return
    }
    setLoading(true); setError('')
    try {
      const { data, error } = await supabase.from('listings').insert({
        seller_id: user.id,
        title,
        description,
        game,
        price: parseInt(price),
        images: images.filter(Boolean),
        status: 'active',
        views: 0,
      }).select().single()
      if (error) throw error
      router.push(`/listing/${data.id}`)
    } catch (e: any) {
      setError(e.message || 'Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  const priceNum = parseInt(price) || 0
  const { commission, sellerReceives } = calcCommission(priceNum)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-4xl font-bold text-white mb-8">ЗАР НЭМЭХ</h1>

      <div className="space-y-6">
        {/* Game */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <label className="text-white font-semibold mb-3 block">Тоглоом сонгох</label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(GAMES) as [GameType, any][]).map(([k, v]) => (
              <button key={k} onClick={() => setGame(k)}
                className={`py-4 rounded-xl border-2 transition-all text-center ${game === k ? 'border-brand-500 bg-brand-500/10' : 'border-dark-700 bg-dark-800 hover:border-dark-600'}`}>
                <div className="text-3xl mb-1">{v.emoji}</div>
                <div className="text-xs text-dark-300 font-medium">{v.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Title + Desc */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-white font-semibold mb-2 block">Гарчиг</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500"
              placeholder="Жишээ: ML Diamond 5 аккаунт 50+ баатар" />
          </div>
          <div>
            <label className="text-white font-semibold mb-2 block">Дэлгэрэнгүй</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 resize-none"
              placeholder="Аккаунтын дэлгэрэнгүй мэдээлэл, rank, skin, эд хэрэгсэл..." />
          </div>
        </div>

        {/* Images */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <label className="text-white font-semibold mb-3 block">Зурагны URL-ууд</label>
          <div className="space-y-2">
            {images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input value={img} onChange={e => {
                  const n = [...images]; n[i] = e.target.value; setImages(n)
                }}
                  className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-dark-500 focus:outline-none focus:border-brand-500"
                  placeholder="https://i.imgur.com/..." />
                {images.length > 1 && (
                  <button onClick={() => setImages(images.filter((_, j) => j !== i))} className="text-dark-400 hover:text-red-400 transition-colors">
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {images.length < 5 && (
            <button onClick={() => setImages([...images, ''])} className="mt-2 text-brand-400 text-sm hover:text-brand-300 transition-colors flex items-center gap-1">
              <Upload size={14} /> Зураг нэмэх
            </button>
          )}
        </div>

        {/* Price */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <label className="text-white font-semibold mb-2 block">Үнэ (₮)</label>
          <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="1000"
            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-dark-500 focus:outline-none focus:border-brand-500 text-xl font-display"
            placeholder="50000" />

          {priceNum > 0 && (
            <div className="mt-4 p-4 bg-dark-800 rounded-xl">
              <div className="flex items-center gap-1.5 text-dark-300 text-xs mb-2">
                <Info size={12} /> Шимтгэлийн тооцоо
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Та тавих үнэ:</span>
                  <span className="text-white">{formatPrice(priceNum)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Шимтгэл (5%):</span>
                  <span className="text-red-400">-{formatPrice(commission)}</span>
                </div>
                <div className="flex justify-between border-t border-dark-700 pt-1 font-medium">
                  <span className="text-dark-300">Та авах дүн:</span>
                  <span className="text-green-400">{formatPrice(sellerReceives)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white py-4 rounded-xl font-semibold text-lg transition-all glow-orange-sm hover:glow-orange">
          {loading ? 'Хадгалж байна...' : 'Зар нийтлэх'}
        </button>
      </div>
    </div>
  )
}
