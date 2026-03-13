import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { recipient_id } = await request.json()

  if (!recipient_id) {
    return NextResponse.json({ error: 'Missing recipient_id' }, { status: 400 })
  }

  // Prevent self-messaging
  if (user.id === recipient_id) {
    return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
  }

  // Check if conversation already exists
  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(user1_id.eq.${user.id},user2_id.eq.${recipient_id}),and(user1_id.eq.${recipient_id},user2_id.eq.${user.id})`)
    .single()

  if (existingConv) {
    return NextResponse.json({ conversation_id: existingConv.id })
  }

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user1_id: user.id,
      user2_id: recipient_id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ conversation_id: data.id })
}
