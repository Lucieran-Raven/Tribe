'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Comment } from '@/types/post'
import type { User } from '@/types/user'

interface CommentItemProps {
  comment: Comment & { user: User; replies?: (Comment & { user: User })[] }
  currentUser: User
  postId: string
  onReply: (parentId: string, content: string) => void
  depth?: number
}

function CommentItem({ comment, currentUser, postId, onReply, depth = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    onReply(comment.id, replyContent)
    setReplyContent('')
    setShowReplyForm(false)
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="flex gap-3">
        <Link href={`/profile/${comment.user.username}`}>
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.user.avatar_url} alt={comment.user.username} />
            <AvatarFallback className="bg-gray-200 text-xs">
              {comment.user.display_name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <Link href={`/profile/${comment.user.username}`} className="font-semibold text-sm">
              {comment.user.username}
            </Link>
            <p className="text-sm">{comment.content}</p>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="font-semibold hover:text-gray-700"
            >
              Reply
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="flex gap-2 mt-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 border border-gray-300 rounded-full px-3 py-1 text-sm"
              />
              <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                Reply
              </Button>
            </form>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUser={currentUser}
                  postId={postId}
                  onReply={onReply}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface CommentSectionProps {
  postId: string
  comments: (Comment & { user: User })[]
  currentUser: User
  onCommentAdded: () => void
}

export function CommentSection({ postId, comments, currentUser, onCommentAdded }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Organize comments into threads
  const organizedComments = organizeComments(comments)

  function organizeComments(flatComments: (Comment & { user: User })[]): (Comment & { user: User; replies?: (Comment & { user: User })[] })[] {
    const commentMap = new Map<string, Comment & { user: User; replies?: (Comment & { user: User })[] }>()
    const rootComments: (Comment & { user: User; replies?: (Comment & { user: User })[] })[] = []

    // First pass: create map
    flatComments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // Second pass: organize into tree
    flatComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id)
        if (parent) {
          if (!parent.replies) parent.replies = []
          parent.replies.push(commentWithReplies)
        }
      } else {
        rootComments.push(commentWithReplies)
      }
    })

    return rootComments
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUser.id,
      content: newComment,
    })

    if (!error) {
      setNewComment('')
      onCommentAdded()
    }
    setLoading(false)
  }

  const handleReply = async (parentId: string, content: string) => {
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: currentUser.id,
      content,
      parent_id: parentId,
    })

    if (!error) {
      onCommentAdded()
    }
  }

  return (
    <div className="border-t pt-4">
      <h3 className="font-semibold mb-4">Comments ({comments.length})</h3>

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
        {organizedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUser={currentUser}
            postId={postId}
            onReply={handleReply}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
      )}
    </div>
  )
}
