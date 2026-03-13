'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Story } from '@/types/post'
import type { User } from '@/types/user'

interface StoryViewerProps {
  username: string
  stories: (Story & { user: User })[]
  currentUserId: string
}

export function StoryViewer({ username, stories, currentUserId }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const currentStory = stories[currentIndex]
  const STORY_DURATION = 5000 // 5 seconds per story

  // Track view
  useEffect(() => {
    if (currentStory && currentStory.user_id !== currentUserId) {
      supabase.rpc('add_story_viewer', {
        story_id: currentStory.id,
        viewer_id: currentUserId,
      })
    }
  }, [currentStory, currentUserId, supabase])

  // Progress timer
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext()
          return 0
        }
        return prev + (100 / (STORY_DURATION / 100))
      })
    }, 100)

    return () => clearInterval(interval)
  }, [currentIndex, isPaused])

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setProgress(0)
    } else {
      router.push('/feed')
    }
  }, [currentIndex, stories.length, router])

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setProgress(0)
    }
  }

  const handleTouchStart = () => setIsPaused(true)
  const handleTouchEnd = () => setIsPaused(false)

  if (!currentStory) return null

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img
            src={currentStory.user.avatar_url || '/default-avatar.png'}
            alt={currentStory.user.username}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-white font-semibold">{currentStory.user.username}</span>
          <span className="text-white/60 text-sm">
            {new Date(currentStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <button onClick={() => router.push('/feed')} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Story content */}
      <div
        className="h-full flex items-center justify-center"
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentStory.media_type === 'video' ? (
          <video
            src={currentStory.media_url}
            className="max-h-full max-w-full"
            autoPlay
            muted
            playsInline
            onEnded={goToNext}
          />
        ) : (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        )}
      </div>

      {/* Navigation zones */}
      <div className="absolute inset-0 flex">
        <button
          className="w-1/3 h-full"
          onClick={goToPrevious}
        />
        <button
          className="w-1/3 h-full"
          onClick={() => setIsPaused(!isPaused)}
        />
        <button
          className="w-1/3 h-full"
          onClick={goToNext}
        />
      </div>

      {/* Viewers count (for own stories) */}
      {currentStory.user_id === currentUserId && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{(currentStory.viewers || []).length} views</span>
        </div>
      )}
    </div>
  )
}
