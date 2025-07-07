import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  console.log('🔍 Checking user existence...');
  
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    
    // Get authenticated user (required for security)
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (!currentUser) {
      console.error('❌ No user found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log('✅ User authenticated:', currentUser.email);

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in our users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, status, role')
      .eq('email', normalizedEmail)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking user:', userError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!user) {
      console.log('❌ User not found:', normalizedEmail);
      return NextResponse.json({ 
        user: null,
        message: 'User not found'
      });
    }

    // Check if user is approved (optional - you might want to allow pending users)
    if (user.status === 'blocked') {
      console.log('❌ User is blocked:', normalizedEmail);
      return NextResponse.json({ 
        user: null,
        message: 'User is blocked'
      });
    }

    console.log('✅ User found:', user.email, 'Status:', user.status);

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        status: user.status,
        role: user.role
      },
      message: 'User found'
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 