import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🗑️ Starting delete meeting API...');
  
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

    console.log('🗑️ Deleting meeting with ID:', meetingId);

    // Verify the meeting exists and user is the host
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, host_id, started_at, ended_at')
      .eq('id', meetingId)
      .single();

    if (meetingError) {
      console.error('❌ Error fetching meeting:', meetingError);
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Check if user is the host
    if (meeting.host_id !== user.id) {
      console.error('❌ User not authorized to delete meeting');
      return NextResponse.json({ error: 'Only the host can delete the meeting' }, { status: 403 });
    }

    // Check if meeting has already started
    if (meeting.started_at) {
      console.error('❌ Cannot delete meeting that has already started');
      return NextResponse.json({ error: 'Cannot delete a meeting that has already started' }, { status: 400 });
    }

    // Delete the meeting (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('meetings')
      .delete()
      .eq('id', meetingId);

    if (deleteError) {
      console.error('❌ Error deleting meeting:', deleteError);
      return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 });
    }

    console.log('✅ Meeting deleted successfully:', meeting.title);

    return NextResponse.json({ 
      success: true,
      message: 'Meeting deleted successfully'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 