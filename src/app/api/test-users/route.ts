import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    console.log('📊 Starting GET /api/test-users');

    // Get users from auth.users
    console.log('🔍 Fetching auth users...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return NextResponse.json({ 
        error: 'Failed to fetch auth users',
        details: authError.message 
      }, { status: 500 });
    }
    console.log(`✅ Auth users fetched: ${authUsers.users.length}`);

    // Get users from our custom table (with error handling)
    console.log('🔍 Fetching custom users...');
    let customUsers = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching custom users:', error);
        throw error;
      }
      customUsers = data || [];
      console.log(`✅ Custom users fetched: ${customUsers.length}`);
    } catch (customError) {
      console.error('❌ Custom users error:', customError);
      return NextResponse.json({ 
        error: 'Failed to fetch custom users',
        details: customError instanceof Error ? customError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Get user statistics (with error handling)
    console.log('🔍 Calculating stats...');
    let stats = { total: 0, active: 0, admins: 0 };
    try {
      const { count: totalCount, error: totalError } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: activeCount, error: activeError } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      const { count: adminCount, error: adminError } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'super_admin');

      if (totalError || activeError || adminError) {
        console.warn('⚠️ Stats calculation had errors, using default values');
      } else {
        stats = {
          total: totalCount || 0,
          active: activeCount || 0,
          admins: adminCount || 0
        };
      }
      console.log(`✅ Stats calculated:`, stats);
    } catch (statsError) {
      console.warn('⚠️ Stats calculation failed, using defaults:', statsError);
    }

    // Check sync status
    console.log('🔍 Calculating sync status...');
    const customUserIds = customUsers.map(u => u.id);
    
    const missingSyncUsers = authUsers.users.filter(
      authUser => !customUserIds.includes(authUser.id)
    );

    const response = {
      success: true,
      data: {
        authUsers: authUsers.users.map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.user_metadata?.full_name || null,
          createdAt: u.created_at,
          lastSignIn: u.last_sign_in_at
        })),
        customUsers: customUsers.map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          status: u.status,
          createdAt: u.created_at
        })),
        stats,
        sync: {
          authUsersCount: authUsers.users.length,
          customUsersCount: customUsers.length,
          missingSyncCount: missingSyncUsers.length,
          missingSyncUsers: missingSyncUsers.map(u => ({
            id: u.id,
            email: u.email,
            fullName: u.user_metadata?.full_name || null
          }))
        }
      }
    };

    console.log('✅ GET /api/test-users completed successfully');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Unexpected error in test-users GET:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting POST /api/test-users');
    
    const { action } = await request.json();
    console.log(`📝 Action received: ${action}`);

    if (action === 'force-sync') {
      // Get users from auth.users
      console.log('🔍 Fetching auth users for sync...');
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authError) {
        console.error('❌ Auth users fetch failed:', authError);
        return NextResponse.json({ 
          error: 'Failed to fetch auth users',
          details: authError.message 
        }, { status: 500 });
      }
      console.log(`✅ Auth users for sync: ${authUsers.users.length}`);

      // Get existing users from custom table
      console.log('🔍 Fetching existing custom users...');
      const { data: customUsers, error: customError } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .order('created_at', { ascending: false });

      if (customError) {
        console.error('❌ Custom users fetch failed:', customError);
        return NextResponse.json({ 
          error: 'Failed to fetch custom users',
          details: customError.message 
        }, { status: 500 });
      }
      
      const customUserEmails = (customUsers || []).map(u => u.email);
      console.log(`✅ Existing custom users: ${customUsers?.length || 0}`);
      console.log(`📧 Existing emails: ${customUserEmails.join(', ')}`);

      // Find users that need to be synced (compare by email, not ID)
      const usersToSync = authUsers.users.filter(
        authUser => !customUserEmails.includes(authUser.email!)
      );
      console.log(`📋 Users to sync: ${usersToSync.length}`);

      if (usersToSync.length === 0) {
        console.log('✅ All users already synced');
        return NextResponse.json({
          success: true,
          message: 'All users already synced',
          syncedCount: 0
        });
      }

      // Prepare insert data
      console.log('🔧 Preparing insert data...');
      const insertData = usersToSync.map(authUser => {
        const userData = {
          id: authUser.id,
          email: authUser.email!,
          full_name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
          role: authUser.email === 'pablo@siriusregenerative.com' ? 'super_admin' as const : 'team' as const,
          status: 'approved' as const,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at || authUser.created_at
        };
        console.log(`📝 Preparing user: ${userData.email} (${userData.role})`);
        return userData;
      });

      // Insert missing users with conflict handling
      console.log('💾 Inserting users...');
      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert(insertData, { 
          onConflict: 'email',
          ignoreDuplicates: true 
        })
        .select();

      if (error) {
        console.error('❌ Insert failed:', error);
        return NextResponse.json({ 
          error: 'Failed to sync users',
          details: error.message,
          code: error.code,
          hint: error.hint
        }, { status: 500 });
      }

      console.log(`✅ Successfully synced ${usersToSync.length} users`);
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${usersToSync.length} users`,
        syncedCount: usersToSync.length,
        syncedUsers: data
      });
    }

    console.log('❌ Invalid action received');
    return NextResponse.json({ 
      error: 'Invalid action' 
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Unexpected error in test-users POST:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 