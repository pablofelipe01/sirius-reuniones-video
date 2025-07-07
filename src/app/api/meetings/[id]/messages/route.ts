import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/meetings/[id]/messages - Cargar historial de mensajes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('💬 Loading chat history...');
  
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
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify user has access to this meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, host_id')
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      console.error('❌ Meeting not found:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check if user is host or participant
    const isHost = meeting.host_id === user.id;
    
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

    // Load messages using the view for better performance
    const { data: messages, error: messagesError } = await supabase
      .from('meeting_messages_with_user')
      .select('*')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (messagesError) {
      console.error('❌ Error loading messages:', messagesError);
      return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
    }

    console.log(`✅ Loaded ${messages?.length || 0} messages`);

    return NextResponse.json({
      messages: messages || [],
      hasMore: (messages?.length || 0) === limit,
      totalCount: messages?.length || 0
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/meetings/[id]/messages - Guardar nuevo mensaje
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('💬 Saving new message...');
  
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
    const { message, messageType = 'text' } = body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 characters)' }, { status: 400 });
    }

    // Verify user has access to this meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, host_id, ended_at')
      .eq('id', meetingId)
      .single();

    if (meetingError || !meeting) {
      console.error('❌ Meeting not found:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Don't allow messages in ended meetings
    if (meeting.ended_at) {
      return NextResponse.json({ error: 'Cannot send messages to ended meeting' }, { status: 400 });
    }

    // Check if user is host or participant
    const isHost = meeting.host_id === user.id;
    
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

    // Save message
    const { data: savedMessage, error: saveError } = await supabase
      .from('meeting_messages')
      .insert({
        meeting_id: meetingId,
        user_id: user.id,
        message: message.trim(),
        message_type: messageType
      })
      .select(`
        id,
        meeting_id,
        user_id,
        message,
        message_type,
        created_at,
        updated_at
      `)
      .single();

    if (saveError) {
      console.error('❌ Error saving message:', saveError);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // Get full message data with user info
    const { data: fullMessage, error: fullMessageError } = await supabase
      .from('meeting_messages_with_user')
      .select('*')
      .eq('id', savedMessage.id)
      .single();

    if (fullMessageError) {
      console.error('❌ Error loading full message:', fullMessageError);
      // Return basic message if view fails
      return NextResponse.json({ message: savedMessage });
    }

    console.log('✅ Message saved:', fullMessage.message);

    return NextResponse.json({ message: fullMessage });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 