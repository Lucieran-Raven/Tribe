import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MessagesClient } from './MessagesClient'

export default async function MessagesPage() {
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

  // Get conversations with other user info
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      user1:users!user1_id(id, username, display_name, avatar_url),
      user2:users!user2_id(id, username, display_name, avatar_url)
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  // Format conversations with other_user
  const formattedConversations = (conversations || []).map((conv) => ({
    ...conv,
    other_user: conv.user1_id === user.id ? conv.user2 : conv.user1,
  }))

  return (
    <MessagesClient
      currentUser={profile}
      conversations={formattedConversations}
    />
  )
}
