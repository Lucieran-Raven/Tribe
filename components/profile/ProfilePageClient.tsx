'use client'

import { useState } from 'react'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/user'
import type { Post } from '@/types/post'

interface ProfilePageProps {
  user: User
  posts: Post[]
  isOwnProfile: boolean
  isFollowing: boolean
}

export function ProfilePageClient({ user, posts, isOwnProfile, isFollowing }: ProfilePageProps) {
  const [userPosts] = useState(posts)
  const supabase = createClient()

  const handleFollow = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return

    await supabase.from('follows').insert({
      follower_id: currentUser.id,
      following_id: user.id,
    })
  }

  const handleUnfollow = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return

    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUser.id)
      .eq('following_id', user.id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        postsCount={userPosts.length}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
      />

      {/* Posts Grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4">
          {userPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            >
              {post.media_urls[0] ? (
                <img
                  src={post.media_urls[0]}
                  alt={post.caption || 'Post'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {userPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
            <p className="text-gray-600 mt-1">
              {isOwnProfile ? 'Share your first post with your tribe!' : 'This user has not posted anything yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
