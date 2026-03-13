import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ExploreClient } from './ExploreClient'

export default async function ExplorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get initial posts for explore grid
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      user:users(id, username, display_name, avatar_url)
    `)
    .eq('type', 'post')
    .order('created_at', { ascending: false })
    .limit(18)

  return <ExploreClient initialPosts={posts || []} />
}
