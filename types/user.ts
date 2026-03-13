export interface User {
  id: string
  email: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  cover_url?: string
  role: 'user' | 'creator' | 'admin' | 'super_admin'
  is_verified: boolean
  is_private: boolean
  university_id?: string
  graduation_year?: number
  course?: string
  posts_count: number
  followers_count: number
  following_count: number
  reels_count: number
  stories_count: number
  is_online: boolean
  last_active?: string
  last_post_at?: string
  settings: {
    notifications: boolean
    allow_tagging: boolean
    allow_messages: string
    private_account: boolean
  }
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface University {
  id: string
  name: string
  short_name?: string
  logo_url?: string
  cover_url?: string
  country?: string
  city?: string
  email_domains: string[]
  is_verified: boolean
  members_count: number
  posts_count: number
  created_at: string
  updated_at: string
}
