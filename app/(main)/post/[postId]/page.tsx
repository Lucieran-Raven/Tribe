import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PostDetailClient } from './PostDetailClient'

interface PostPageProps {
  params: Promise<{ postId: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get current user profile
  const { data: currentUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!currentUser) {
    redirect('/login')
  }

  // Get post with user
  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      user:users(id, username, display_name, avatar_url)
    `)
    .eq('id', postId)
    .single()

  if (!post) {
    notFound()
  }

  // Get comments with users
  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(id, username, display_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: false })

  return (
    <PostDetailClient
      post={post}
      comments={comments || []}
      currentUser={currentUser}
    />
  )
}
