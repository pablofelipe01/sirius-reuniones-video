import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🔚 Ending meeting...');
  
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

    const { id: meetingId } = await params;

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
      console.error('❌ User not authorized to end meeting');
      return NextResponse.json({ error: 'Only the host can end the meeting' }, { status: 403 });
    }

    // Check if meeting is already ended
    if (meeting.ended_at) {
      console.log('⚠️ Meeting already ended');
      return NextResponse.json({ 
        message: 'Meeting already ended',
        meeting: {
          ...meeting,
          ended_at: meeting.ended_at
        }
      });
    }

    // Check if meeting was never started
    if (!meeting.started_at) {
      console.log('⚠️ Ending meeting that was never started');
    }

    const endTime = new Date().toISOString();

    // End the meeting
    const { data: updatedMeeting, error: updateError } = await supabase
      .from('meetings')
      .update({
        ended_at: endTime
      })
      .eq('id', meetingId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error ending meeting:', updateError);
      return NextResponse.json({ error: 'Failed to end meeting' }, { status: 500 });
    }

    // Update all participants who haven't left yet
    const { error: participantsUpdateError } = await supabase
      .from('meeting_participants')
      .update({
        left_at: endTime
      })
      .eq('meeting_id', meetingId)
      .is('left_at', null);

    if (participantsUpdateError) {
      console.warn('⚠️ Error updating participants left_at:', participantsUpdateError);
      // Don't fail the request, just log the warning
    } else {
      console.log('✅ Updated participants left_at times');
    }

    console.log('✅ Meeting ended:', meeting.title);

    return NextResponse.json({
      message: 'Meeting ended successfully',
      meeting: updatedMeeting,
      ended_at: endTime
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 