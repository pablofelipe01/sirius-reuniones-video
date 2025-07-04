import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service role para pruebas de admin
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

export async function POST() {
  const logs: string[] = [];
  
  try {
    logs.push('🔍 Testing Supabase connection...');
    
    // 1. Test basic connection
    const { error: healthError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);
    
    if (healthError) {
      logs.push('❌ Connection failed: ' + healthError.message);
      return NextResponse.json({ success: false, logs });
    }
    
    logs.push('✅ Basic connection successful');
    
    // 2. Test super admin exists
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'pablo@siriusregenerative.com')
      .single();
    
    if (adminError || !adminUser) {
      logs.push('❌ Super admin not found: ' + (adminError?.message || 'User not found'));
      return NextResponse.json({ success: false, logs });
    }
    
    logs.push('✅ Super admin found: ' + JSON.stringify({
      email: adminUser.email,
      role: adminUser.role,
      status: adminUser.status
    }));
    
    // 3. Test all tables exist
    const tables = [
      'users', 'meetings', 'meeting_participants', 
      'meeting_recordings', 'chat_messages', 
      'whiteboard_snapshots', 'processing_queue'
    ] as const;
    
    for (const table of tables) {
      const { error } = await supabaseAdmin
        .from(table as keyof Database['public']['Tables'])
        .select('*')
        .limit(1);
      
      if (error) {
        logs.push(`❌ Table ${table} not accessible: ${error.message}`);
        return NextResponse.json({ success: false, logs });
      }
    }
    
    logs.push('✅ All tables accessible');
    
    // 4. Test creating a test meeting (and clean up)
    const testMeeting = {
      title: 'Test Meeting',
      room_name: `test-${Date.now()}`,
      host_id: adminUser.id,
      description: 'Test meeting for connection verification'
    };
    
    const { data: meeting, error: meetingError } = await supabaseAdmin
      .from('meetings')
      .insert(testMeeting)
      .select()
      .single();
    
    if (meetingError || !meeting) {
      logs.push('❌ Failed to create test meeting: ' + (meetingError?.message || 'Unknown error'));
      return NextResponse.json({ success: false, logs });
    }
    
    logs.push('✅ Test meeting created successfully');
    
    // Clean up test meeting
    await supabaseAdmin
      .from('meetings')
      .delete()
      .eq('id', meeting.id);
    
    logs.push('✅ Test meeting cleaned up');
    
    // 5. Get database statistics
    const stats = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('meetings').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('meeting_participants').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('chat_messages').select('*', { count: 'exact', head: true })
    ]);
    
    const dbStats = {
      users: stats[0].count || 0,
      meetings: stats[1].count || 0,
      participants: stats[2].count || 0,
      messages: stats[3].count || 0
    };
    
    logs.push('🎉 All Supabase tests passed!');
    
    return NextResponse.json({ 
      success: true, 
      logs,
      stats: dbStats
    });
    
  } catch (error) {
    logs.push('❌ Unexpected error: ' + (error as Error).message);
    return NextResponse.json({ success: false, logs });
  }
} 