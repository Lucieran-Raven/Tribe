'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Post } from '@/types/post'
import type { User } from '@/types/user'
import type { Comment } from '@/types/post'

interface PostDetailClientProps {
  post: Post & { user: User }
  comments: (Comment & { user: User })[]
  currentUser: User
}

export function PostDetailClient({ post, comments: initialComments, currentUser }: PostDetailClientProps) {
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState(initialComments)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user liked this post
    supabase
      .from('likes')
      .select('id')
      .eq('post_id', post.id)
      .eq('user_id', currentUser.id)
      .single()
      .then(({ data }) => {
        setLiked(!!data)
      })
  }, [post.id, currentUser.id, supabase])

  const handleLike = async () => {
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', currentUser.id)
      setLiked(false)
      setLikesCount((prev) => prev - 1)
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: currentUser.id })
      setLiked(true)
      setLikesCount((prev) => prev + 1)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: post.id,
        user_id: currentUser.id,
        content: newComment,
      })
      .select('*, user:users(id, username, display_name, avatar_url)')
      .single()

    if (!error && data) {
      setComments((prev) => [data as Comment & { user: User }, ...prev])
      setNewComment('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Post</h1>
          <div className="w-6" />
        </div>
      </header>

      {/* Post Content */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {/* User Header */}
        <div className="flex items-center justify-between mb-4">
          <Link href={`/profile/${post.user.username}`} className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.user.avatar_url} alt={post.user.username} />
              <AvatarFallback className="bg-gray-200">
                {post.user.display_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold">{post.user.username}</span>
          </Link>
        </div>

        {/* Image */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mb-4">
            <img
              src={post.media_urls[0]}
              alt="Post content"
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`transition-transform active:scale-125 ${liked ? 'text-red-500' : 'text-gray-700'}`}
            >
              <svg className="w-6 h-6" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button className="text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <button className="text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Likes */}
        {likesCount > 0 && (
          <p className="font-semibold text-sm mb-2">
            {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-sm mb-4">
            <Link href={`/profile/${post.user.username}`} className="font-semibold">
              {post.user.username}
            </Link>{' '}
            {post.caption}
          </p>
        )}

        {/* Timestamp */}
        <p className="text-gray-400 text-xs mb-6">
          {new Date(post.created_at).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>

        {/* Comments Section */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">Comments</h3>

          {/* Comment Input */}
          <form onSubmit={handleSubmitComment} className="flex gap-3 mb-6">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser.avatar_url} alt={currentUser.username} />
              <AvatarFallback className="bg-gray-200 text-xs">
                {currentUser.display_name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <input
                type="text"
                value={newComment}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <Button type="submit" disabled={!newComment.trim() || loading} size="sm">
              Post
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Link href={`/profile/${comment.user.username}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user.avatar_url} alt={comment.user.username} />
                    <AvatarFallback className="bg-gray-200 text-xs">
                      {comment.user.display_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <Link href={`/profile/${comment.user.username}`} className="font-semibold text-sm">
                    {comment.user.username}
                  </Link>
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </main>
    </div>
  )
}
