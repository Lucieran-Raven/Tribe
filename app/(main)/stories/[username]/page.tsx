import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { StoryViewer } from '@/components/stories/StoryViewer'

interface StoriesPageProps {
  params: Promise<{ username: string }>
}

export default async function StoriesPage({ params }: StoriesPageProps) {
  const { username } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user whose stories we're viewing
  const { data: storyUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (!storyUser) {
    notFound()
  }

  // Get active stories for this user
  const { data: stories } = await supabase
    .from('stories')
    .select(`
      *,
      user:users(id, username, display_name, avatar_url)
    `)
    .eq('user_id', storyUser.id)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true })

  if (!stories || stories.length === 0) {
    redirect('/feed')
  }

  return (
    <StoryViewer
      username={username}
      stories={stories}
      currentUserId={user.id}
    />
  )
}
