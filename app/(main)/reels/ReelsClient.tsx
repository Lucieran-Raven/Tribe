'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

interface ReelsClientProps {
  currentUser: User
}

export function ReelsClient({ currentUser }: ReelsClientProps) {
  const [reels, setReels] = useState<(Post & { user: User })[]>([])
  const [loading, setLoading] = useState(true)
  const [currentReelIndex, setCurrentReelIndex] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchReels()
  }, [])

  const fetchReels = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url)
      `)
      .eq('type', 'reel')
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data) {
      setReels(data as (Post & { user: User })[])
    }
    setLoading(false)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const scrollTop = container.scrollTop
    const reelHeight = container.clientHeight
    const newIndex = Math.round(scrollTop / reelHeight)
    
    if (newIndex !== currentReelIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentReelIndex(newIndex)
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-black flex">
      {/* Sidebar */}
      <div className="hidden md:flex w-20 flex-col items-center py-6 border-r border-white/10">
        <Link href="/feed" className="text-white mb-8">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        <Link href="/explore" className="text-white/60 mb-8">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>
        <Link href="/create" className="text-white/60 mb-8">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
        <Link href={`/profile/${currentUser.username}`} className="text-white/60">
          <Avatar className="w-6 h-6">
            <AvatarImage src={currentUser.avatar_url} alt={currentUser.username} />
            <AvatarFallback className="bg-gray-600 text-xs">
              {currentUser.display_name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      {/* Reels Feed */}
      <div 
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
      >
        {reels.length > 0 ? (
          reels.map((reel, index) => (
            <div 
              key={reel.id} 
              className="h-screen snap-start relative flex items-center justify-center"
            >
              {/* Video/Content */}
              <div className="relative w-full max-w-md h-full">
                {reel.media_urls[0] ? (
                  <video
                    src={reel.media_urls[0]}
                    className="w-full h-full object-cover"
                    autoPlay={index === currentReelIndex}
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span className="text-white/50">No video</span>
                  </div>
                )}

                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-3 mb-3">
                    <Link href={`/profile/${reel.user.username}`}>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={reel.user.avatar_url} alt={reel.user.username} />
                        <AvatarFallback className="bg-gray-600">
                          {reel.user.display_name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link href={`/profile/${reel.user.username}`} className="text-white font-semibold text-sm">
                        {reel.user.username}
                      </Link>
                      <p className="text-white/70 text-xs">{reel.caption}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-white">
                    <button className="flex items-center gap-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm">{reel.likes_count || 0}</span>
                    </button>
                    <button className="flex items-center gap-1">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm">{reel.comments_count || 0}</span>
                    </button>
                    <button>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white">
            <svg className="w-16 h-16 mb-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No reels yet</h3>
            <p className="text-white/60 mb-4">Be the first to share a reel!</p>
            <Link
              href="/create"
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700"
            >
              Create Reel
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
