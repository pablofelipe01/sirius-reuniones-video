import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('💾 Saving whiteboard snapshot...');
  
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

    console.log('✅ User authenticated:', user.email);

    const { id: meetingId } = await params;
    const body = await request.json();
    const { data, isAutoSave = false } = body;

    if (!data) {
      return NextResponse.json({ error: 'Whiteboard data is required' }, { status: 400 });
    }

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
    const { data: participant } = await supabase
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

    console.log('✅ User authorized for meeting:', meetingId, isHost ? '(Host)' : '(Participant)');

    // Save whiteboard snapshot
    const { data: snapshot, error: saveError } = await supabase
      .from('whiteboard_snapshots')
      .insert({
        meeting_id: meetingId,
        data: data,
        preview_url: null, // Could generate preview later
      })
      .select()
      .single();

    if (saveError) {
      console.error('❌ Error saving whiteboard:', saveError);
      return NextResponse.json({ error: 'Failed to save whiteboard' }, { status: 500 });
    }

    console.log('✅ Whiteboard saved:', snapshot.id, isAutoSave ? '(auto)' : '(manual)');

    return NextResponse.json({ 
      success: true, 
      snapshot: snapshot,
      message: isAutoSave ? 'Auto-saved' : 'Saved successfully'
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('📥 Loading whiteboard snapshot...');
  
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
    const { data: participant } = await supabase
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

    // Get the latest whiteboard snapshot
    const { data: snapshot, error: loadError } = await supabase
      .from('whiteboard_snapshots')
      .select('data, created_at')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (loadError && loadError.code !== 'PGRST116') { // Not found is ok
      console.error('❌ Error loading whiteboard:', loadError);
      return NextResponse.json({ error: 'Failed to load whiteboard' }, { status: 500 });
    }

    console.log('✅ Whiteboard loaded:', snapshot ? 'Found data' : 'No data (new board)');

    return NextResponse.json({ 
      data: snapshot?.data || null,
      lastModified: snapshot?.created_at || null
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 