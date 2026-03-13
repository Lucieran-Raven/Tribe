'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { meilisearch, MEILI_INDEXES } from '@/lib/meilisearch/client'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

interface ExploreClientProps {
  initialPosts: (Post & { user: User })[]
}

export function ExploreClient({ initialPosts }: ExploreClientProps) {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts')
  const [results, setResults] = useState<{ posts: (Post & { user: User })[]; users: User[] }>({
    posts: initialPosts,
    users: [],
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const [searchResults, setSearchResults] = useState<{
    posts: unknown[]
    users: unknown[]
  }>({ posts: [], users: [] })

  const searchWithMeilisearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults({ posts: [], users: [] })
      return
    }

    setLoading(true)
    
    try {
      // Search posts with Meilisearch (typo-tolerant)
      const postsIndex = meilisearch.index(MEILI_INDEXES.posts)
      const postsResults = await postsIndex.search(searchQuery, {
        limit: 20,
        attributesToHighlight: ['caption'],
      })
      
      // Search users with Meilisearch (typo-tolerant)
      const usersIndex = meilisearch.index(MEILI_INDEXES.users)
      const usersResults = await usersIndex.search(searchQuery, {
        limit: 20,
        attributesToHighlight: ['username', 'display_name'],
      })
      
      setSearchResults({
        posts: postsResults.hits,
        users: usersResults.hits,
      })
    } catch (error) {
      console.error('Meilisearch error:', error)
      // Fallback to Supabase search if Meilisearch fails
      fallbackSupabaseSearch(searchQuery)
    }
    
    setLoading(false)
  }, [])

  const fallbackSupabaseSearch = async (searchQuery: string) => {
    // Search posts
    const { data: postsData } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, username, display_name, avatar_url)
      `)
      .eq('type', 'post')
      .or(`caption.ilike.%${searchQuery}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    // Search users
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
      .limit(20)

    setResults({
      posts: (postsData as (Post & { user: User })[]) || [],
      users: (usersData as User[]) || [],
    })
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchWithMeilisearch(query)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, searchWithMeilisearch])

  const displayedPosts = query.trim() ? (searchResults.posts as (Post & { user: User })[]) : results.posts
  const displayedUsers = query.trim() ? (searchResults.users as User[]) : results.users

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="Search posts, users... (typo-tolerant!)"
              className="w-full bg-gray-100 rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-4">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Users
            </button>
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : activeTab === 'posts' ? (
          <div className="grid grid-cols-3 gap-4">
            {results.posts.length > 0 ? (
              results.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                >
                  {post.media_urls[0] ? (
                    <img
                      src={post.media_urls[0]}
                      alt={post.caption || 'Post'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-16">
                <p className="text-gray-500">No posts found</p>
              </div>
            )}
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-4">
            {results.users.length > 0 ? (
              results.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar_url} alt={user.username} />
                    <AvatarFallback className="bg-gray-200">
                      {user.display_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.display_name}</p>
                    {user.course && (
                      <p className="text-xs text-gray-400">{user.course}</p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">Enter a hashtag to search</p>
            <p className="text-sm text-gray-400 mt-2">Try #campus, #events, or #study</p>
          </div>
        )}
      </main>
    </div>
  )
}
