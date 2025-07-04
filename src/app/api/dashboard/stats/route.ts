import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
  console.log('📊 Starting dashboard stats API...');
  
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
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      console.error('❌ No user found');
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    // Get simple counts first
    const { data: userParticipations, error: participationError } = await supabase
      .from('meeting_participants')
      .select('meeting_id')
      .eq('user_id', user.id);

    if (participationError) {
      console.error('❌ Error fetching participations:', participationError);
      return NextResponse.json({ error: 'Failed to fetch user meetings' }, { status: 500 });
    }

    const meetingIds = userParticipations?.map(p => p.meeting_id) || [];
    
    // Get meeting details for user's meetings
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

    // Get total participants (simplified)
    const totalParticipants = meetingIds.length;

    const stats = {
      activeMeetings,
      completedMeetings,
      upcomingMeetings,
      totalParticipants
    };

    console.log('✅ Stats calculated:', stats);

    return NextResponse.json({
      stats,
      recentMeetings
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 