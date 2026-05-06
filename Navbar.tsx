'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Gamepad2, MessageSquare, Plus, User, LogOut, Shield, Menu, X } from 'lucide-react'

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single()
          .then(({ data: p }) => setProfile(p))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: p }) => setProfile(p))
      } else {
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/90 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center glow-orange-sm group-hover:glow-orange transition-all">
            <Gamepad2 size={18} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-wide">
            GAME<span className="text-brand-500">MARKET</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/listings" className={`text-sm font-medium transition-colors ${pathname === '/listings' ? 'text-brand-400' : 'text-dark-300 hover:text-white'}`}>
            Зар хайх
          </Link>
          {user && (
            <>
              <Link href="/listings/new" className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus size={16} /> Зар нэмэх
              </Link>
              <Link href="/chat" className="relative text-dark-300 hover:text-white transition-colors">
                <MessageSquare size={20} />
              </Link>
              <div className="flex items-center gap-2 group relative">
                <Link href="/seller/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-dark-700 border border-dark-600 flex items-center justify-center text-xs font-medium">
                    {profile?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  {profile?.is_verified_seller && (
                    <Shield size={14} className="text-brand-400" />
                  )}
                </Link>
                <button onClick={handleLogout} className="text-dark-400 hover:text-red-400 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
              {profile?.username === 'admin' && (
                <Link href="/admin" className="text-xs text-dark-400 hover:text-brand-400 transition-colors">
                  Admin
                </Link>
              )}
            </>
          )}
          {!user && (
            <Link href="/auth" className="bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5">
              <User size={15} /> Нэвтрэх
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-dark-300" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-900 border-t border-dark-800 px-4 py-4 flex flex-col gap-3">
          <Link href="/listings" className="text-dark-300 py-2" onClick={() => setMenuOpen(false)}>Зар хайх</Link>
          {user ? (
            <>
              <Link href="/listings/new" className="text-brand-400 py-2" onClick={() => setMenuOpen(false)}>+ Зар нэмэх</Link>
              <Link href="/chat" className="text-dark-300 py-2" onClick={() => setMenuOpen(false)}>Чат</Link>
              <Link href="/seller/dashboard" className="text-dark-300 py-2" onClick={() => setMenuOpen(false)}>Профайл</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="text-red-400 py-2 text-left">Гарах</button>
            </>
          ) : (
            <Link href="/auth" className="text-white py-2" onClick={() => setMenuOpen(false)}>Нэвтрэх</Link>
          )}
        </div>
      )}
    </nav>
  )
}
