import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('▶️ Starting meeting...');
  
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

    const { id: meetingId } = params;

    // Get meeting details
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, host_id, started_at, ended_at')
      .eq('id', meetingId)
      .single();

    if (meetingError) {
      console.error('❌ Error fetching meeting:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check if user is the host
    if (meeting.host_id !== user.id) {
      console.error('❌ User not authorized to start meeting');
      return NextResponse.json({ error: 'Only the host can start the meeting' }, { status: 403 });
    }

    // Check if meeting is already started
    if (meeting.started_at) {
      console.log('⚠️ Meeting already started');
      return NextResponse.json({ 
        message: 'Meeting already started',
        meeting: {
          ...meeting,
          started_at: meeting.started_at
        }
      });
    }

    // Check if meeting is ended
    if (meeting.ended_at) {
      console.error('❌ Cannot start ended meeting');
      return NextResponse.json({ error: 'Cannot start an ended meeting' }, { status: 400 });
    }

    // Start the meeting
    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meetings')
      .update({
        started_at: new Date().toISOString()
      })
      .eq('id', meetingId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error starting meeting:', updateError);
      return NextResponse.json({ error: 'Failed to start meeting' }, { status: 500 });
    }

    console.log('✅ Meeting started:', meeting.title);

    return NextResponse.json({
      message: 'Meeting started successfully',
      meeting: updatedMeeting
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 