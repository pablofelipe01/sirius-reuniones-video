import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('👥 Adding participant to meeting...');
  
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
    const body = await request.json();
    const { user_id, guest_name } = body;

    // Validate that we have either user_id or guest_name
    if (!user_id && !guest_name) {
      return NextResponse.json({ error: 'Either user_id or guest_name is required' }, { status: 400 });
    }

    // Get meeting details
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, host_id, ended_at')
      .eq('id', meetingId)
      .single();

    if (meetingError) {
      console.error('❌ Error fetching meeting:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check if meeting has ended
    if (meeting.ended_at) {
      console.error('❌ Cannot join ended meeting');
      return NextResponse.json({ error: 'Cannot join an ended meeting' }, { status: 400 });
    }

    // If user_id is provided, check if they're already a participant
    if (user_id) {
      const { data: existingParticipant, error: checkError } = await supabase
        .from('meeting_participants')
        .select('id')
        .eq('meeting_id', meetingId)
        .eq('user_id', user_id)
        .single();

      if (existingParticipant) {
        console.log('⚠️ User already a participant');
        return NextResponse.json({ 
          message: 'User is already a participant',
          participant: existingParticipant
        });
      }

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error checking existing participant:', checkError);
        return NextResponse.json({ error: 'Failed to check participant status' }, { status: 500 });
      }
    }

    // Add participant
    const { data: newParticipant, error: insertError } = await supabase
      .from('meeting_participants')
      .insert({
        meeting_id: meetingId,
        user_id: user_id || null,
        guest_name: guest_name || null,
        joined_at: new Date().toISOString()
      })
      .select(`
        id,
        meeting_id,
        user_id,
        guest_name,
        joined_at,
        users(full_name, email)
      `)
      .single();

    if (insertError) {
      console.error('❌ Error adding participant:', insertError);
      return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 });
    }

    console.log('✅ Participant added:', user_id ? user.email : guest_name);

    return NextResponse.json({
      message: 'Participant added successfully',
      participant: newParticipant,
      meeting: {
        id: meeting.id,
        title: meeting.title
      }
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('👥 Getting meeting participants...');
  
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

    const { id: meetingId } = await params;

    // Check if user has access to this meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, host_id')
      .eq('id', meetingId)
      .single();

    if (meetingError) {
      console.error('❌ Error fetching meeting:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const isHost = meeting.host_id === user.id;
    
    // Check if user is a participant
    const { data: participant } = await supabase
      .from('meeting_participants')
      .select('id')
      .eq('meeting_id', meetingId)
      .eq('user_id', user.id)
      .single();

    const isParticipant = !!participant;

    if (!isHost && !isParticipant) {
      console.error('❌ User not authorized for this meeting');
      return NextResponse.json({ error: 'Not authorized for this meeting' }, { status: 403 });
    }

    // Get all participants
    const { data: participants, error: participantsError } = await supabase
      .from('meeting_participants')
      .select(`
        id,
        user_id,
        guest_name,
        joined_at,
        left_at,
        speaking_duration_seconds,
        users(full_name, email, avatar_url)
      `)
      .eq('meeting_id', meetingId)
      .order('joined_at', { ascending: true });

    if (participantsError) {
      console.error('❌ Error fetching participants:', participantsError);
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }

    console.log('✅ Participants fetched:', participants?.length || 0);

    return NextResponse.json({
      participants: participants || [],
      meeting: {
        id: meeting.id,
        title: meeting.title,
        isHost
      }
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 