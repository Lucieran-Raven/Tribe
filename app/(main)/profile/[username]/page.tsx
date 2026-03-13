import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProfilePageClient } from '@/components/profile/ProfilePageClient'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  // Get profile user
  const { data: profileUser } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  
  if (!profileUser) {
    notFound()
  }
  
  // Get user's posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', profileUser.id)
    .eq('type', 'post')
    .order('created_at', { ascending: false })
  
  // Check if following
  let isFollowing = false
  if (currentUser && currentUser.id !== profileUser.id) {
    const { data: follow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profileUser.id)
      .maybeSingle()
    
    isFollowing = !!follow
  }
  
  const isOwnProfile = currentUser?.id === profileUser.id
  
  return (
    <ProfilePageClient
      user={profileUser}
      posts={posts || []}
      isOwnProfile={isOwnProfile}
      isFollowing={isFollowing}
    />
  )
}
