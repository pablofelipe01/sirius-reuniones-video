import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomName: string }> }
) {
  console.log('🌐 Getting public meeting info by room name...');
  
  try {
    const { roomName } = await params;

    // Get basic meeting details using admin client (no auth required)
    const { data: meeting, error: meetingError } = await supabaseAdmin
      .from('meetings')
      .select(`
        id,
        title,
        room_name,
        scheduled_at,
        started_at,
        ended_at
      `)
      .eq('room_name', roomName)
      .single();

    if (meetingError) {
      console.error('❌ Error fetching meeting:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    if (!meeting) {
      console.error('❌ Meeting not found');
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    console.log('✅ Public meeting info fetched:', meeting.room_name);

    // Return only public information
    return NextResponse.json({
      success: true,
      meeting: {
        title: meeting.title,
        room_name: meeting.room_name,
        scheduled_at: meeting.scheduled_at,
        started_at: meeting.started_at,
        ended_at: meeting.ended_at,
        // Don't expose sensitive info like host_id, etc.
      }
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 