'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Notification } from '@/types/notification'
import type { User } from '@/types/user'

interface NotificationsClientProps {
  currentUser: User
  notifications: (Notification & { sender?: { id: string; username: string; display_name: string; avatar_url?: string } })[]
}

export function NotificationsClient({ currentUser, notifications: initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const supabase = createClient()

  // Subscribe to new notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        async (payload) => {
          const newNotification = payload.new as Notification
          // Fetch sender info
          if (newNotification.sender_id) {
            const { data: sender } = await supabase
              .from('users')
              .select('id, username, display_name, avatar_url')
              .eq('id', newNotification.sender_id)
              .single()
            
            const senderData = sender ? {
              id: sender.id as string,
              username: sender.username as string,
              display_name: sender.display_name as string,
              avatar_url: sender.avatar_url as string | undefined
            } : undefined
            
            setNotifications((prev) => [{ ...newNotification, sender: senderData }, ...prev])
          } else {
            setNotifications((prev) => [newNotification, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [currentUser.id, supabase])

  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
    }
  }, [supabase])

  const markAllAsRead = useCallback(async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser.id)
      .eq('is_read', false)

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    }
  }, [currentUser.id, supabase])

  const getNotificationText = (notification: Notification & { sender?: { id: string; username: string; display_name: string; avatar_url?: string } }) => {
    const senderName = notification.sender?.username || 'Someone'
    
    switch (notification.type) {
      case 'like':
        return `${senderName} liked your post`
      case 'comment':
        return `${senderName} commented on your post`
      case 'follow':
        return `${senderName} started following you`
      case 'mention':
        return `${senderName} mentioned you in a post`
      case 'message':
        return `${senderName} sent you a message`
      case 'system':
        return notification.content || 'New notification'
      default:
        return 'New notification'
    }
  }

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
      case 'comment':
      case 'mention':
        return `/post/${notification.reference_id}`
      case 'follow':
        return `/profile/${notification.sender_id}`
      case 'message':
        return `/messages`
      default:
        return '/notifications'
    }
  }

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter((n) => !n.is_read)
    : notifications

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-blue-600 text-sm font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="max-w-2xl mx-auto px-4 flex gap-6 border-b">
          <button
            onClick={() => setFilter('all')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              filter === 'unread'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </header>

      {/* Notifications List */}
      <main className="max-w-2xl mx-auto">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y">
            {filteredNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={getNotificationLink(notification)}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
              >
                {notification.sender ? (
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={notification.sender.avatar_url} alt={notification.sender.username} />
                    <AvatarFallback className="bg-gray-200">
                      {notification.sender.display_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                )}

                <div className="flex-1">
                  <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
                    {getNotificationText(notification)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600 mt-1">
              {filter === 'unread' 
                ? 'You\'re all caught up!' 
                : 'When someone interacts with you, you\'ll see it here'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
