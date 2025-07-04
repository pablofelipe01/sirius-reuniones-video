import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  console.log('🔐 Testing authentication...');
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Test basic auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication failed', 
        details: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      console.error('❌ No user found');
      return NextResponse.json({ 
        success: false, 
        error: 'No user found' 
      }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    // Test basic database access
    const { data: testData, error: dbError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', user.email)
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        },
        database: {
          success: false,
          error: dbError.message
        }
      });
    }

    console.log('✅ Database access successful');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      },
      database: {
        success: true,
        userData: testData
      }
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 