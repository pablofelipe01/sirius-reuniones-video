import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  console.log('🎫 Starting guest LiveKit token generation...');
  
  try {
    const body = await request.json();
    const { roomName, participantName } = body;

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: 'Room name and participant name are required' },
        { status: 400 }
      );
    }

    // Verify that the meeting exists using admin client
    const { data: meeting, error: meetingError } = await supabaseAdmin
      .from('meetings')
      .select('id, title, ended_at')
      .eq('room_name', roomName)
      .single();

    if (meetingError || !meeting) {
      console.error('❌ Meeting not found:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check if meeting has ended
    if (meeting.ended_at) {
      console.error('❌ Meeting has ended');
      return NextResponse.json({ error: 'Meeting has ended' }, { status: 403 });
    }

    console.log('✅ Guest authorized for room:', roomName);

    // Generate LiveKit token for guest
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('❌ LiveKit credentials not configured');
      return NextResponse.json(
        { error: 'LiveKit not configured' },
        { status: 500 }
      );
    }

    // Generate unique guest ID
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const token = new AccessToken(apiKey, apiSecret, {
      identity: guestId,
      name: participantName,
    });

    // Grant guest permissions (limited compared to authenticated users)
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
      // Guests cannot record or admin
      roomAdmin: false,
      roomRecord: false,
    });

    const jwt = await token.toJwt();

    console.log('✅ Guest token generated for:', participantName, 'in room:', roomName);

    return NextResponse.json({
      token: jwt,
      url: process.env.LIVEKIT_URL,
      roomName,
      participantName,
      isHost: false,
      isGuest: true,
    });

  } catch (error) {
    console.error('❌ Guest token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate guest token' },
      { status: 500 }
    );
  }
} 