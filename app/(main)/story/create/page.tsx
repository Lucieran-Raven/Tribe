import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateStory } from '@/components/stories/CreateStory'

export default async function CreateStoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get full user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  return <CreateStory user={profile} />
}
