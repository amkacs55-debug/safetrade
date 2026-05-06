import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { GameType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const COMMISSION_RATE = 0.05 // 5%
export const VERIFIED_SELLER_FEE = 99000 // 99,000 MNT

export const GAMES: Record<GameType, { label: string; color: string; emoji: string }> = {
  mobile_legends: { label: 'Mobile Legends', color: 'from-blue-500 to-cyan-400', emoji: '⚔️' },
  standoff2:      { label: 'Standoff 2',     color: 'from-orange-500 to-red-500', emoji: '🔫' },
  pubg:           { label: 'PUBG',            color: 'from-yellow-500 to-amber-400', emoji: '🪖' },
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('mn-MN', {
    style: 'currency',
    currency: 'MNT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date))
}

export function calcCommission(price: number) {
  const commission = Math.round(price * COMMISSION_RATE)
  return { commission, sellerReceives: price - commission }
}

