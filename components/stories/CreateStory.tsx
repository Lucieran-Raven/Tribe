'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types/user'

interface CreateStoryProps {
  user: User
}

export function CreateStory({ user }: CreateStoryProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async () => {
    if (!file) return

    setLoading(true)
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/stories/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('stories')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('stories')
        .getPublicUrl(fileName)

      // Create story (expires in 24h by default from DB)
      const { error: storyError } = await supabase.from('stories').insert({
        user_id: user.id,
        media_url: publicUrl,
        media_type: file.type.startsWith('video') ? 'video' : 'image',
      })

      if (storyError) throw storyError

      router.push('/feed')
    } catch (error) {
      console.error('Error creating story:', error)
      alert('Failed to create story. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
        <button onClick={() => router.back()} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="text-white font-semibold">New Story</span>
        <div className="w-6" />
      </header>

      {/* Content */}
      <div className="h-screen flex items-center justify-center">
        {!preview ? (
          <div className="text-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-4"
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <p className="text-white">Tap to add photo or video</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative w-full max-w-lg mx-auto">
            <img
              src={preview}
              alt="Story preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold disabled:opacity-50"
            >
              {loading ? 'Sharing...' : 'Share to Story'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
