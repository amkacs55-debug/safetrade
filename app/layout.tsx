import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'GameMarket MN — Тоглоомын аккаунт арилжаа',
  description: 'Mobile Legends, Standoff 2, PUBG аккаунт зарах, худалдан авах найдвартай платформ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="min-h-screen bg-dark-950">
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <footer className="border-t border-dark-800 py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center text-dark-400 text-sm">
            <p className="font-display text-lg text-dark-300 mb-2">GAMEMARKET MN</p>
            <p>© 2024 GameMarket. Бүх эрх хуулиар хамгаалагдсан.</p>
            <p className="mt-1">Шимтгэл: 5% · Verified Seller: 99,000₮ нэг удаа</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
