'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/user'

interface OnlineUser {
  user_id: string
  online_at: string
  user: User
}

interface UsePresenceProps {
  currentUserId: string
}

export function usePresence({ currentUserId }: UsePresenceProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const supabase = createClient()

  // Update presence on mount and visibility change
  useEffect(() => {
    if (!currentUserId) return

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    })

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState()
      const users: OnlineUser[] = []
      
      Object.entries(presenceState).forEach(([key, value]) => {
        if (key !== currentUserId && value.length > 0) {
          const presence = value[0] as unknown as { user: User; online_at: string }
          if (presence.user && presence.online_at) {
            users.push({
              user_id: key,
              online_at: presence.online_at,
              user: presence.user,
            })
          }
        }
      })
      
      setOnlineUsers(users)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track current user presence
        await channel.track({
          user_id: currentUserId,
          online_at: new Date().toISOString(),
        })
      }
    })

    // Update presence periodically
    const interval = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        await channel.track({
          user_id: currentUserId,
          online_at: new Date().toISOString(),
        })
      }
    }, 30000) // Every 30 seconds

    // Handle visibility change
    const handleVisibilityChange = () => {
      setIsOnline(document.visibilityState === 'visible')
      if (document.visibilityState === 'visible') {
        channel.track({
          user_id: currentUserId,
          online_at: new Date().toISOString(),
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      channel.unsubscribe()
    }
  }, [currentUserId, supabase])

  return { onlineUsers, isOnline }
}

interface UseRealtimePostsProps {
  onNewPost?: (post: unknown) => void
  onPostUpdate?: (post: unknown) => void
  onPostDelete?: (postId: string) => void
}

export function useRealtimePosts({
  onNewPost,
  onPostUpdate,
  onPostDelete,
}: UseRealtimePostsProps) {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && onNewPost) {
            onNewPost(payload.new)
          } else if (payload.eventType === 'UPDATE' && onPostUpdate) {
            onPostUpdate(payload.new)
          } else if (payload.eventType === 'DELETE' && onPostDelete) {
            onPostDelete(payload.old.id)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, onNewPost, onPostUpdate, onPostDelete])
}

interface UseRealtimeNotificationsProps {
  userId: string
  onNewNotification?: (notification: unknown) => void
}

export function useRealtimeNotifications({
  userId,
  onNewNotification,
}: UseRealtimeNotificationsProps) {
  const supabase = createClient()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    // Get initial unread count
    supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_read', false)
      .then(({ count }) => {
        setUnreadCount(count || 0)
      })

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1)
          onNewNotification?.(payload.new)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId, supabase, onNewNotification])

  const markAsRead = useCallback(async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    setUnreadCount(0)
  }, [userId, supabase])

  return { unreadCount, markAsRead }
}
