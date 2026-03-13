import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface WebhookPayload {
  type: string
  table: string
  record: {
    id: string
    user_id: string
    post_id: string
    content?: string
  }
}

serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json()
    
    // Only process new likes
    if (payload.type !== 'INSERT' || payload.table !== 'likes') {
      return new Response('OK', { status: 200 })
    }

    const like = payload.record

    // Get post owner
    const { data: post } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', like.post_id)
      .single()

    if (!post || post.user_id === like.user_id) {
      return new Response('No notification needed', { status: 200 })
    }

    // Get liker info
    const { data: liker } = await supabase
      .from('users')
      .select('username')
      .eq('id', like.user_id)
      .single()

    // Create notification
    await supabase.from('notifications').insert({
      user_id: post.user_id,
      sender_id: like.user_id,
      type: 'like',
      reference_id: like.post_id,
      content: `${liker?.username || 'Someone'} liked your post`,
    })

    return new Response('Notification created', { status: 200 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return new Response('Error', { status: 500 })
  }
})
