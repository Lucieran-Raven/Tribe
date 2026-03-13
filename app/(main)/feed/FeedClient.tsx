'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PostCard } from '@/components/feed/PostCard'
import { StoriesRow } from '@/components/stories/StoriesRow'
import { PresenceIndicator } from '@/components/realtime/PresenceIndicator'
import { useRealtimePosts } from '@/lib/realtime/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

interface FeedClientProps {
  currentUser: User
}

export function FeedClient({ currentUser }: FeedClientProps) {
  const [posts, setPosts] = useState<(Post & { user: User })[]>([])
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    const { data: postsData, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url)
      `)
      .eq('type', 'post')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching posts:', error)
      return
    }

    if (postsData) {
      setPosts(postsData as (Post & { user: User })[])
      
      // Get liked posts
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', currentUser.id)
        .in('post_id', postsData.map((p: Post) => p.id))
      
      if (likes) {
        setLikedPosts(new Set(likes.map((l) => l.post_id)))
      }

      // Get saved posts
      const { data: saved } = await supabase
        .from('saved_posts')
        .select('post_id')
        .eq('user_id', currentUser.id)
        .in('post_id', postsData.map((p: Post) => p.id))
      
      if (saved) {
        setSavedPosts(new Set(saved.map((s) => s.post_id)))
      }
    }
    
    setLoading(false)
  }, [currentUser.id, supabase])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  // Real-time posts subscription
  useRealtimePosts({
    onNewPost: (newPost) => {
      setPosts((prev) => [newPost as Post & { user: User }, ...prev])
    },
    onPostUpdate: (updatedPost) => {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === (updatedPost as Post).id ? (updatedPost as Post & { user: User }) : post
        )
      )
    },
    onPostDelete: (postId) => {
      setPosts((prev) => prev.filter((post) => post.id !== postId))
    },
  })

  const handleLike = async (postId: string) => {
    const { error } = await supabase.from('likes').insert({
      user_id: currentUser.id,
      post_id: postId,
    })

    if (!error) {
      setLikedPosts((prev) => new Set(prev).add(postId))
    }
  }

  const handleUnlike = async (postId: string) => {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('post_id', postId)

    if (!error) {
      setLikedPosts((prev) => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Tribe</h1>
          <nav className="flex items-center gap-4">
            <a href="/feed" className="text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </a>
            <a href="/explore" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </a>
            <a href="/create" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </a>
            <a href="/messages" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </a>
            <a href={`/profile/${currentUser.username}`} className="text-gray-600 hover:text-gray-900">
              <Avatar className="w-6 h-6">
                <AvatarImage src={currentUser.avatar_url} alt={currentUser.username} />
                <AvatarFallback className="text-xs bg-gray-200">
                  {currentUser.display_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </a>
          </nav>
        </div>
      </header>

      {/* Stories Row */}
      <StoriesRow currentUser={currentUser} />

      {/* Main Feed */}
      <main className="max-w-2xl mx-auto px-4 py-6 relative">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUser.id}
                onLike={handleLike}
                onUnlike={handleUnlike}
                isLiked={likedPosts.has(post.id)}
                isSaved={savedPosts.has(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
            <p className="text-gray-600 mt-1">Be the first to share something with your tribe!</p>
            <button
              onClick={() => router.push('/create')}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Post
            </button>
          </div>
        )}
        {/* Real-time Presence Indicator */}
        <PresenceIndicator
          userId={currentUser.id}
          currentUserId={currentUser.id}
          showOnlineUsers
        />
      </main>
    </div>
  )
}
