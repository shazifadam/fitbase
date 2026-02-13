import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
    }

    // Create user record if it doesn't exist
    if (data.user) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', data.user.id)
        .single()

      if (!existingUser) {
        // Create new user record
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            auth_id: data.user.id,
            email: data.user.email || '',
            display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            photo_url: data.user.user_metadata?.avatar_url || null,
          })

        if (insertError) {
          console.error('Error creating user record:', insertError)
        }
      }
    }
  }

  // Redirect to home page after successful sign in
  return NextResponse.redirect(`${origin}/`)
}
