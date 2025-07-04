import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface Meeting {
  id: string;
  title: string;
  room_name: string;
  scheduled_at: string;
  ended_at: string | null;
  started_at: string | null;
  host_id: string;
}

export async function GET() {
  console.log('📊 Starting admin stats API (bypasses RLS)...');
  
  try {
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // For testing, we'll get stats for all users
    // In production, you'd want to get user ID from JWT token
    
    // Get total meeting participants
    const { data: allParticipations, error: participationError } = await supabase
      .from('meeting_participants')
      .select('meeting_id');

    if (participationError) {
      console.error('❌ Error fetching participations:', participationError);
      return NextResponse.json({ error: 'Failed to fetch participations' }, { status: 500 });
    }

    const meetingIds = [...new Set(allParticipations?.map(p => p.meeting_id) || [])];
    
    // Get meeting details
    let activeMeetings = 0;
    let completedMeetings = 0;
    let upcomingMeetings = 0;
    let recentMeetings: Meeting[] = [];

    if (meetingIds.length > 0) {
      const { data: meetings, error: meetingsError } = await supabase
        .from('meetings')
        .select('id, title, room_name, scheduled_at, ended_at, started_at, host_id')
        .in('id', meetingIds)
        .order('scheduled_at', { ascending: false });

      if (meetingsError) {
        console.error('❌ Error fetching meetings:', meetingsError);
      } else if (meetings) {
        const now = new Date();
        
        meetings.forEach(meeting => {
          // Calculate status based on timestamps
          if (meeting.ended_at) {
            // Meeting has ended
            completedMeetings++;
          } else if (meeting.started_at) {
            // Meeting has started but not ended
            activeMeetings++;
          } else if (new Date(meeting.scheduled_at) > now) {
            // Future meeting
            upcomingMeetings++;
          }
          // We ignore past meetings that never started (missed/cancelled)
        });

        recentMeetings = meetings.slice(0, 5) as Meeting[];
      }
    }

    // Get total participants
    const totalParticipants = allParticipations?.length || 0;

    const stats = {
      activeMeetings,
      completedMeetings,
      upcomingMeetings,
      totalParticipants
    };

    console.log('✅ Admin stats calculated:', stats);

    return NextResponse.json({
      stats,
      recentMeetings,
      note: 'Using admin mode - bypasses RLS'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 