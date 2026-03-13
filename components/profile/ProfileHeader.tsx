'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { User } from '@/types/user'

interface ProfileHeaderProps {
  user: User
  isOwnProfile: boolean
  isFollowing: boolean
  postsCount: number
  onFollow: () => void
  onUnfollow: () => void
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing,
  postsCount,
  onFollow,
  onUnfollow,
}: ProfileHeaderProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [loading, setLoading] = useState(false)

  const handleFollowClick = async () => {
    setLoading(true)
    if (following) {
      await onUnfollow()
      setFollowing(false)
    } else {
      await onFollow()
      setFollowing(true)
    }
    setLoading(false)
  }

  return (
    <div className="bg-white border-b">
      {/* Cover Image */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-400 to-purple-500 relative">
        {user.cover_url && (
          <img
            src={user.cover_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage src={user.avatar_url} alt={user.username} />
            <AvatarFallback className="text-3xl bg-gray-200">
              {user.display_name?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="mt-4 md:mt-0 md:ml-6 flex-1">
            <h1 className="text-2xl font-bold">{user.display_name}</h1>
            <p className="text-gray-600">@{user.username}</p>
            {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
          </div>

          <div className="mt-4 md:mt-0">
            {isOwnProfile ? (
              <Button variant="outline">
                <a href="/profile/edit">Edit Profile</a>
              </Button>
            ) : (
              <Button
                onClick={handleFollowClick}
                disabled={loading}
                variant={following ? 'outline' : 'default'}
              >
                {loading ? 'Loading...' : following ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 py-4 border-t">
          <div className="text-center">
            <span className="font-bold text-lg">{postsCount}</span>
            <span className="text-gray-600 ml-1">posts</span>
          </div>
          <div className="text-center">
            <span className="font-bold text-lg">{user.followers_count || 0}</span>
            <span className="text-gray-600 ml-1">followers</span>
          </div>
          <div className="text-center">
            <span className="font-bold text-lg">{user.following_count || 0}</span>
            <span className="text-gray-600 ml-1">following</span>
          </div>
        </div>

        {/* Additional Info */}
        {(user.university_id || user.graduation_year || user.course) && (
          <div className="py-4 text-sm text-gray-600">
            {user.university_id && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                </svg>
                <span>University</span>
              </div>
            )}
            {user.graduation_year && (
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Class of {user.graduation_year}</span>
              </div>
            )}
            {user.course && (
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{user.course}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
