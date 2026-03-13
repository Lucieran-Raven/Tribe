import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReelsClient } from './ReelsClient'

export default async function ReelsPage() {
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

  return <ReelsClient currentUser={profile} />
}
