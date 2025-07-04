import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

    // Get meetings details
    const { data: meetings, error: meetingsError } = await supabase
      .from('meetings')
      .select('*')
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
            joined_at,
            left_at,
            role,
            users!inner(full_name, email)
          `)
          .eq('meeting_id', meeting.id);

        if (participantsError) {
          console.error('❌ Error fetching participants for meeting:', meeting.id, participantsError);
          return {
            ...meeting,
            meeting_participants: []
          };
        }

        return {
          ...meeting,
          meeting_participants: participants || []
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
    const { title, description, scheduled_at, duration_minutes, max_participants } = body;

    console.log('📝 Creating meeting with data:', { title, scheduled_at, duration_minutes });

    // Validate required fields
    if (!title || !scheduled_at) {
      return NextResponse.json({ error: 'Title and scheduled time are required' }, { status: 400 });
    }

    // Create meeting
    const { data: meeting, error: createError } = await supabase
      .from('meetings')
      .insert({
        title,
        description: description || null,
        scheduled_at,
        duration_minutes: duration_minutes || 60,
        max_participants: max_participants || 10,
        creator_id: user.id,
        status: 'scheduled'
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating meeting:', createError);
      return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 });
    }

    console.log('✅ Meeting created:', meeting.id);

    // Add creator as participant
    const { error: participantError } = await supabase
      .from('meeting_participants')
      .insert({
        meeting_id: meeting.id,
        user_id: user.id,
        role: 'host'
      });

    if (participantError) {
      console.error('❌ Error adding participant:', participantError);
      // Don't fail the request, just log the error
    } else {
      console.log('✅ Creator added as participant');
    }

    return NextResponse.json({ meeting });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 