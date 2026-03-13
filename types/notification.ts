export interface Notification {
  id: string
  user_id: string
  sender_id?: string
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'system'
  content?: string
  reference_id?: string
  is_read: boolean
  created_at: string
  sender?: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
}
