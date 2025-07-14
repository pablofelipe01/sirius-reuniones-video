import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  console.log('📊 Starting simple stats API...');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
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

    // Return mock data for now to test if authentication works
    const mockStats = {
      activeMeetings: 0,
      completedMeetings: 0,
      upcomingMeetings: 0,
      totalParticipants: 0
    };

    const mockRecentMeetings: object[] = [];

    console.log('✅ Returning mock stats');

    return NextResponse.json({
      stats: mockStats,
      recentMeetings: mockRecentMeetings,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 