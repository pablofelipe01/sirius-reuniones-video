import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomName: string }> }
) {
  console.log('🔍 Getting meeting info by room name...');
  
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
    
    // Get authenticated user (still required for security)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (!user) {
      console.error('❌ No user found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    const { roomName } = await params;

    // Get meeting details (no permission check - just basic info)
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select(`
        id,
        title,
        description,
        room_name,
        host_id,
        scheduled_at,
        started_at,
        ended_at,
        is_recording,
        created_at
      `)
      .eq('room_name', roomName)
      .single();

    if (meetingError) {
      console.error('❌ Error fetching meeting:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Get host info (for display purposes)
    const { data: host, error: hostError } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', meeting.host_id)
      .single();

    if (hostError) {
      console.warn('⚠️ Could not fetch host info:', hostError);
    }

    console.log('✅ Meeting info retrieved:', meeting.title);

    return NextResponse.json({ 
      meeting: {
        ...meeting,
        host: host || null
      }
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 