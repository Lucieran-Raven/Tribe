export interface Post {
  id: string
  user_id: string
  caption?: string
  media_urls: string[]
  media_types: ('image' | 'video')[]
  thumbnail_url?: string
  type: 'post' | 'reel'
  duration?: number
  location_name?: string
  location_coordinates?: [number, number]
  campus_id?: string
  likes_count: number
  comments_count: number
  shares_count: number
  saves_count: number
  views_count: number
  tagged_users: string[]
  hashtags: string[]
  is_archived: boolean
  is_pinned: boolean
  comments_disabled: boolean
  hide_likes: boolean
  engagement_score: number
  created_at: string
  updated_at: string
  user?: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
}

export interface Story {
  id: string
  user_id: string
  media_url: string
  media_type: 'image' | 'video'
  duration: number
  allow_replies: boolean
  viewers: string[]
  view_count: number
  expires_at: string
  created_at: string
  user?: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id?: string
  content: string
  media_url?: string
  likes_count: number
  replies_count: number
  is_edited: boolean
  created_at: string
  updated_at: string
  user?: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
}

export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}
