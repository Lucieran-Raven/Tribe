'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SavePostButton } from './SavePostButton'
import { ShareButton } from './ShareButton'
import { formatCaptionWithHashtags } from '@/lib/utils/hashtags'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'

interface PostCardProps {
  post: Post & { user: User }
  currentUserId?: string
  onLike: (postId: string) => void
  onUnlike: (postId: string) => void
  isLiked: boolean
  isSaved?: boolean
}

export function PostCard({ post, currentUserId, onLike, onUnlike, isLiked, isSaved = false }: PostCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleLike = () => {
    if (liked) {
      setLiked(false)
      setLikesCount((prev) => prev - 1)
      onUnlike(post.id)
    } else {
      setLiked(true)
      setLikesCount((prev) => prev + 1)
      onLike(post.id)
    }
  }

  const hasMultipleImages = post.media_urls && post.media_urls.length > 1

  return (
    <div className="bg-white border rounded-lg mb-4">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={post.user.avatar_url} alt={post.user.username} />
            <AvatarFallback className="bg-gray-200 text-xs">
              {post.user.display_name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{post.user.username}</span>
        </Link>
        <button className="text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
      </div>

      {/* Image Carousel */}
      <div className="relative">
        {post.media_urls && post.media_urls.length > 0 ? (
          <>
            <img
              src={post.media_urls[currentImageIndex]}
              alt="Post content"
              className="w-full aspect-square object-cover"
            />
            {hasMultipleImages && (
              <>
                {/* Image indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                  {post.media_urls.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
                {/* Navigation arrows */}
                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex((prev) => prev - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white"
                  >
                    ←
                  </button>
                )}
                {currentImageIndex < post.media_urls.length - 1 && (
                  <button
                    onClick={() => setCurrentImageIndex((prev) => prev + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white"
                  >
                    →
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`transition-transform active:scale-125 ${liked ? 'text-red-500' : 'text-gray-700'}`}
            >
              <svg className="w-6 h-6" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <Link href={`/post/${post.id}`} className="text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            <ShareButton postId={post.id} username={post.user.username} />
          </div>
          <SavePostButton postId={post.id} isSaved={isSaved} />
        </div>

        {/* Likes count */}
        {likesCount > 0 && (
          <p className="font-semibold text-sm mb-1">
            {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption with Hashtags */}
        {post.caption && (
          <p className="text-sm">
            <Link href={`/profile/${post.user.username}`} className="font-semibold">
              {post.user.username}
            </Link>{' '}
            {formatCaptionWithHashtags(post.caption).map((part, idx) =>
              part.type === 'hashtag' ? (
                <Link
                  key={idx}
                  href={`/explore?tag=${part.content.slice(1)}`}
                  className="text-blue-600 hover:underline"
                >
                  {part.content}
                </Link>
              ) : (
                <span key={idx}>{part.content}</span>
              )
            )}
          </p>
        )}

        {/* Comments link */}
        {post.comments_count > 0 && (
          <Link href={`/post/${post.id}`} className="text-gray-500 text-sm mt-1 block">
            View all {post.comments_count} comments
          </Link>
        )}

        {/* Timestamp */}
        <p className="text-gray-400 text-xs mt-1">
          {new Date(post.created_at).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>
    </div>
  )
}
