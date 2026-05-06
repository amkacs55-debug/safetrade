export type GameType = 'mobile_legends' | 'standoff2' | 'pubg'

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  is_verified_seller: boolean
  verified_at: string | null
  total_sales: number
  rating: number
  created_at: string
}

export interface Listing {
  id: string
  seller_id: string
  game: GameType
  title: string
  description: string
  price: number
  images: string[]
  status: 'active' | 'sold' | 'pending' | 'removed'
  views: number
  created_at: string
  updated_at: string
  seller?: Profile
}

export interface Transaction {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  amount: number
  commission: number
  seller_receives: number
  status: 'pending' | 'completed' | 'cancelled' | 'disputed'
  created_at: string
  listing?: Listing
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: Profile
}

export interface Conversation {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  listing?: Listing
  buyer?: Profile
  seller?: Profile
  last_message?: Message
}

export interface Review {
  id: string
  reviewer_id: string
  seller_id: string
  transaction_id: string
  rating: number
  comment: string
  created_at: string
  reviewer?: Profile
}

export interface VerificationPayment {
  id: string
  user_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  payment_proof: string | null
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}
