import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  console.log('🎫 Starting LiveKit token generation...');
  
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
    const { roomName, participantName } = body;

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: 'Room name and participant name are required' },
        { status: 400 }
      );
    }

    // Verify user has access to this room
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, host_id')
      .eq('room_name', roomName)
      .single();

    if (meetingError || !meeting) {
      console.error('❌ Meeting not found:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check if user is host or participant
    const { data: participant, error: participantError } = await supabase
      .from('meeting_participants')
      .select('id')
      .eq('meeting_id', meeting.id)
      .eq('user_id', user.id)
      .single();

    const isHost = meeting.host_id === user.id;
    const isParticipant = !!participant;

    if (!isHost && !isParticipant) {
      console.error('❌ User not authorized for this meeting');
      return NextResponse.json({ error: 'Not authorized for this meeting' }, { status: 403 });
    }

    console.log('✅ User authorized for room:', roomName, isHost ? '(Host)' : '(Participant)');

    // Generate LiveKit token
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('❌ LiveKit credentials not configured');
      return NextResponse.json(
        { error: 'LiveKit not configured' },
        { status: 500 }
      );
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: participantName,
    });

    // Grant permissions based on role
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      // Hosts get additional permissions
      canUpdateOwnMetadata: true,
      roomAdmin: isHost,
      roomRecord: isHost,
    });

    const jwt = await token.toJwt();

    console.log('✅ Token generated for:', participantName, 'in room:', roomName);

    return NextResponse.json({
      token: jwt,
      url: process.env.LIVEKIT_URL,
      roomName,
      participantName,
      isHost,
    });
  } catch (error) {
    console.error('❌ Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
} 