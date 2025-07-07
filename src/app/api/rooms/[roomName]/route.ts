import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomName: string } }
) {
  console.log('🔍 Starting meeting lookup by room name...');
  
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
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    if (!user) {
      console.error('❌ No user found');
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    const { roomName } = params;

    // Get meeting details
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
        room_style,
        created_at
      `)
      .eq('room_name', roomName)
      .single();

    if (meetingError) {
      console.error('❌ Error fetching meeting:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check if user has access to this meeting
    const isHost = meeting.host_id === user.id;
    
    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('meeting_participants')
      .select('id')
      .eq('meeting_id', meeting.id)
      .eq('user_id', user.id)
      .single();

    const isParticipant = !!participant;

    if (!isHost && !isParticipant) {
      console.error('❌ User not authorized for this meeting');
      return NextResponse.json({ error: 'Not authorized for this meeting' }, { status: 403 });
    }

    console.log('✅ Meeting found:', meeting.title, isHost ? '(Host)' : '(Participant)');

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 