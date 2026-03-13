export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content?: string
  media_url?: string
  media_type?: string
  is_read: boolean
  is_delivered: boolean
  is_edited: boolean
  reply_to_id?: string
  created_at: string
  sender?: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
  }
}

export interface Conversation {
  id: string
  participants: string[]
  last_message_id?: string
  last_message_at?: string
  last_message_preview?: string
  last_message_sender_id?: string
  created_at: string
  updated_at: string
  participants_data?: {
    id: string
    username: string
    display_name: string
    avatar_url?: string
    is_online?: boolean
  }[]
  unread_count?: number
}
