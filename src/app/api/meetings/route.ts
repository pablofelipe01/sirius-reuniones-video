import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Helper function to generate unique room names
function generateRoomName(): string {
  const adjectives = ['cosmic', 'stellar', 'quantum', 'cyber', 'neural', 'digital', 'fusion', 'matrix'];
  const nouns = ['nexus', 'sphere', 'portal', 'chamber', 'dome', 'hub', 'core', 'zone'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  
  return `${adjective}-${noun}-${number}`;
}

export async function GET() {
  console.log('📅 Starting meetings API...');
  
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

    // Get user's meeting participations
    const { data: participations, error: participationsError } = await supabase
      .from('meeting_participants')
      .select('meeting_id')
      .eq('user_id', user.id);

    if (participationsError) {
      console.error('❌ Error fetching participations:', participationsError);
      return NextResponse.json({ error: 'Failed to fetch user meetings' }, { status: 500 });
    }

    const meetingIds = participations?.map(p => p.meeting_id) || [];
    
    if (meetingIds.length === 0) {
      console.log('✅ No meetings found for user');
      return NextResponse.json({ meetings: [] });
    }

    // Get meetings details with correct schema fields
    const { data: meetings, error: meetingsError } = await supabase
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
        livekit_room_sid,
        created_at
      `)
      .in('id', meetingIds)
      .order('scheduled_at', { ascending: false });

    if (meetingsError) {
      console.error('❌ Error fetching meetings:', meetingsError);
      return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 });
    }

    // For each meeting, get participants
    const meetingsWithParticipants = await Promise.all(
      (meetings || []).map(async (meeting) => {
        const { data: participants, error: participantsError } = await supabase
          .from('meeting_participants')
          .select(`
            user_id,
            guest_name,
            joined_at,
            left_at,
            speaking_duration_seconds,
            users!inner(full_name, email, avatar_url)
          `)
          .eq('meeting_id', meeting.id);

        if (participantsError) {
          console.error('❌ Error fetching participants for meeting:', meeting.id, participantsError);
          return {
            ...meeting,
            participants: []
          };
        }

        return {
          ...meeting,
          participants: participants || []
        };
      })
    );

    console.log('✅ Meetings fetched:', meetingsWithParticipants.length);

    return NextResponse.json({ meetings: meetingsWithParticipants });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('📝 Starting create meeting API...');
  
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

    const body = await request.json();
    const { title, description, scheduled_at } = body;

    console.log('📝 Creating meeting with data:', { title, scheduled_at });

    // Validate required fields
    if (!title || !scheduled_at) {
      return NextResponse.json({ error: 'Title and scheduled time are required' }, { status: 400 });
    }

    // Generate unique room name
    const room_name = generateRoomName();

    // Create meeting with correct schema fields
    const { data: meeting, error: createError } = await supabase
      .from('meetings')
      .insert({
        title,
        description: description || null,
        room_name,
        host_id: user.id,  // Using correct field name
        scheduled_at,
        is_recording: true,
        room_style: 'futuristic'
      })
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
      .single();

    if (createError) {
      console.error('❌ Error creating meeting:', createError);
      return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
    }

    console.log('✅ Meeting created:', meeting.id, 'Room:', meeting.room_name);

    // Add creator as participant (without role field since it doesn't exist)
    const { error: participantError } = await supabase
      .from('meeting_participants')
      .insert({
        meeting_id: meeting.id,
        user_id: user.id
      });

    if (participantError) {
      console.error('❌ Error adding participant:', participantError);
      // Don't fail the request, just log the error
    } else {
      console.log('✅ Creator added as participant');
    }

    return NextResponse.json({ 
      meeting,
      room_code: meeting.room_name,
      join_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/join/${meeting.room_name}`
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 