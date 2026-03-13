'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SavePostButtonProps {
  postId: string
  isSaved: boolean
  onSave?: () => void
  onUnsave?: () => void
}

export function SavePostButton({ postId, isSaved: initialIsSaved, onSave, onUnsave }: SavePostButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase.from('saved_posts').insert({
      post_id: postId,
      user_id: (await supabase.auth.getUser()).data.user?.id || '',
    })

    if (!error) {
      setIsSaved(true)
      onSave?.()
    }
    setLoading(false)
  }

  const handleUnsave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user?.id || '')

    if (!error) {
      setIsSaved(false)
      onUnsave?.()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={isSaved ? handleUnsave : handleSave}
      disabled={loading}
      className={`transition-colors ${isSaved ? 'text-black fill-black' : 'text-gray-700 hover:text-gray-900'}`}
    >
      <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  )
}
