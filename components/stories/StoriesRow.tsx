'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/user'

interface Story {
  id: string
  user_id: string
  media_url: string
  media_type: 'image' | 'video'
  created_at: string
  user: {
    id: string
    username: string
    avatar_url: string
    display_name: string
  }
}

interface StoriesRowProps {
  currentUser: User
}

export function StoriesRow({ currentUser }: StoriesRowProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        user:users(id, username, avatar_url, display_name)
      `)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (!error && data) {
      // Group by user and take latest from each
      const userStories = new Map<string, Story>()
      data.forEach((story: Story) => {
        if (!userStories.has(story.user_id)) {
          userStories.set(story.user_id, story)
        }
      })
      setStories(Array.from(userStories.values()))
    }
    setLoading(false)
  }

  return (
    <div className="bg-white border-b">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {/* Add Story Button */}
          <Link href="/story/create" className="flex flex-col items-center min-w-[64px]">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs mt-1 text-gray-600">Your Story</span>
          </Link>

          {/* Stories from other users */}
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/stories/${story.user.username}`}
              className="flex flex-col items-center min-w-[64px]"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <img
                    src={story.user.avatar_url || '/default-avatar.png'}
                    alt={story.user.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs mt-1 text-gray-600 truncate w-16 text-center">
                {story.user.username}
              </span>
            </Link>
          ))}

          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center min-w-[64px]">
                  <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
                  <div className="w-12 h-3 bg-gray-200 rounded mt-1 animate-pulse" />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
