'use client'

import { usePresence } from '@/lib/realtime/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface PresenceIndicatorProps {
  userId: string
  currentUserId: string
  showOnlineUsers?: boolean
}

export function PresenceIndicator({
  userId,
  currentUserId,
  showOnlineUsers = false,
}: PresenceIndicatorProps) {
  const { onlineUsers, isOnline } = usePresence({ currentUserId })
  
  const isUserOnline = userId === currentUserId 
    ? isOnline 
    : onlineUsers.some((u) => u.user_id === userId)

  if (showOnlineUsers) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-50">
        <h3 className="font-semibold text-sm mb-2">
          Online ({onlineUsers.length + 1})
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {/* Current user */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                You
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <span className="text-sm">You</span>
          </div>
          
          {/* Other online users */}
          {onlineUsers.map((user) => (
            <div key={user.user_id} className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.user.avatar_url} alt={user.user.username} />
                  <AvatarFallback className="text-xs bg-gray-200">
                    {user.user.display_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <span className="text-sm">{user.user.username}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Simple indicator for profile/header
  return (
    <div className="relative inline-block">
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white z-10"
        style={{ backgroundColor: isUserOnline ? '#22c55e' : '#9ca3af' }}
      />
    </div>
  )
}
