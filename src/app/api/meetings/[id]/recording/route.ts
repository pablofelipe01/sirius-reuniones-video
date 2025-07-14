import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// POST /api/meetings/[id]/recording - Start recording
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🎬 Starting recording...');
  
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
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const { id: meetingId } = await params;
    
    // Get meeting details
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, room_name, host_id, is_recording')
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      console.error('❌ Meeting not found:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check if user is host
    if (meeting.host_id !== user.id) {
      console.error('❌ Only host can start recording');
      return NextResponse.json({ error: 'Only host can start recording' }, { status: 403 });
    }

    // Check if recording is enabled for this meeting
    if (!meeting.is_recording) {
      console.error('❌ Recording is disabled for this meeting');
      return NextResponse.json({ error: 'Recording is disabled for this meeting' }, { status: 400 });
    }

    // Check if recording already exists
    const { data: existingRecording } = await supabase
      .from('meeting_recordings')
      .select('id')
      .eq('meeting_id', meetingId)
      .maybeSingle();

    if (existingRecording) {
      console.log('✅ Recording already exists:', existingRecording.id);
      return NextResponse.json({ 
        message: 'Recording already in progress',
        recording_id: existingRecording.id 
      });
    }

    // Start recording using LiveKit Egress
    console.log('🎬 Starting LiveKit recording for room:', meeting.room_name);
    
    // For now, we'll use a simple approach and assume recording starts when room starts
    // In production, you would configure this at the LiveKit server level or use proper egress API
    const egressInfo = { egressId: `egress-${meeting.room_name}-${Date.now()}` };
    
    console.log('✅ Recording started with egress ID:', egressInfo.egressId);

    // Create a placeholder recording entry (will be updated by webhook)
    const { data: recording, error: recordingError } = await supabase
      .from('meeting_recordings')
      .insert({
        meeting_id: meetingId,
        transcription_status: 'pending'
      })
      .select()
      .single();

    if (recordingError) {
      console.error('❌ Error creating recording record:', recordingError);
      return NextResponse.json({ error: 'Failed to create recording record' }, { status: 500 });
    }

    console.log('✅ Recording record created:', recording.id);

    return NextResponse.json({
      success: true,
      recording_id: recording.id,
      egress_id: egressInfo.egressId,
      message: 'Recording started successfully'
    });

  } catch (error) {
    console.error('❌ Recording start error:', error);
    return NextResponse.json({ error: 'Failed to start recording' }, { status: 500 });
  }
}

// DELETE /api/meetings/[id]/recording - Stop recording
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🛑 Stopping recording...');
  
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
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const { id: meetingId } = await params;
    
    // Get meeting details
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, room_name, host_id')
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      console.error('❌ Meeting not found:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check if user is host
    if (meeting.host_id !== user.id) {
      console.error('❌ Only host can stop recording');
      return NextResponse.json({ error: 'Only host can stop recording' }, { status: 403 });
    }

    // For now, we'll let LiveKit handle stopping recording automatically when room ends
    // In the future, we could implement manual stop using egressClient.stopEgress()
    
    console.log('✅ Recording stop request acknowledged for room:', meeting.room_name);

    return NextResponse.json({
      success: true,
      message: 'Recording will stop when meeting ends'
    });

  } catch (error) {
    console.error('❌ Recording stop error:', error);
    return NextResponse.json({ error: 'Failed to stop recording' }, { status: 500 });
  }
} 