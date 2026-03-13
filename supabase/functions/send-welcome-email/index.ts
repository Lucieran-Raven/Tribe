import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { record } = await req.json()
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Send welcome email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Tribe <welcome@tribeapp.com>',
        to: record.email,
        subject: 'Welcome to Tribe!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Welcome to Tribe, ${record.display_name || 'Friend'}!</h1>
            <p>Your campus social network is waiting for you.</p>
            <p>With Tribe, you can:</p>
            <ul>
              <li>Connect with classmates</li>
              <li>Share your campus moments</li>
              <li>Discover events and communities</li>
              <li>Message friends in real-time</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://tribeapp.com/feed" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Start Exploring
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">If you have any questions, just reply to this email.</p>
            <p style="color: #666; font-size: 14px;">The Tribe Team</p>
          </div>
        `,
      }),
    })

    if (!res.ok) {
      throw new Error(`Failed to send email: ${await res.text()}`)
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
