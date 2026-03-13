'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { meilisearch, MEILI_INDEXES } from '@/lib/meilisearch/client'
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
      // Search posts
      const postsIndex = meilisearch.index(MEILI_INDEXES.posts)
      const postsResults = await postsIndex.search(searchQuery, {
        limit: 20,
        attributesToHighlight: ['caption'],
      })
      
      // Search users
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
    }
    
    setLoading(false)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchWithMeilisearch(query)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, searchWithMeilisearch])

  const displayedPosts = query.trim() ? searchResults.posts : results.posts
  const displayedUsers = query.trim() ? searchResults.users : results.users

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
            {displayedPosts.length > 0 ? (
              displayedPosts.map((post: unknown) => {
                const p = post as Post & { user: User; _formatted?: { caption?: string } }
                return (
                  <Link
                    key={p.id}
                    href={`/post/${p.id}`}
                    className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    {p.media_urls?.[0] ? (
                      <img
                        src={p.media_urls[0]}
                        alt={p.caption || 'Post'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 p-4">
                        <p className="text-sm text-center line-clamp-3">
                          <span dangerouslySetInnerHTML={{ 
                            __html: p._formatted?.caption || p.caption || '' 
                          }} />
                        </p>
                      </div>
                    )}
                  </Link>
                )
              })
            ) : (
              <div className="col-span-3 text-center py-16">
                <p className="text-gray-500">No posts found</p>
                {query && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try a different search term (we handle typos!)
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedUsers.length > 0 ? (
              displayedUsers.map((user: unknown) => {
                const u = user as User & { _formatted?: { username?: string; display_name?: string } }
                return (
                  <Link
                    key={u.id}
                    href={`/profile/${u.username}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={u.avatar_url} alt={u.username} />
                      <AvatarFallback className="bg-gray-200">
                        {u.display_name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p 
                        className="font-semibold"
                        dangerouslySetInnerHTML={{ 
                          __html: u._formatted?.username || u.username 
                        }}
                      />
                      <p 
                        className="text-sm text-gray-500"
                        dangerouslySetInnerHTML={{ 
                          __html: u._formatted?.display_name || u.display_name 
                        }}
                      />
                      {u.course && (
                        <p className="text-xs text-gray-400">{u.course}</p>
                      )}
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500">No users found</p>
                {query && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try a different search term (we handle typos!)
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
