import { supabase } from './client';
import { supabaseAdmin } from './admin';
import type { Database } from '@/types/database';

type User = Database['public']['Tables']['users']['Row'];

/**
 * Get current user profile from our custom users table
 */
export async function getCurrentUserProfile(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    return null;
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return false;
  }
}

/**
 * Check if current user is admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const profile = await getCurrentUserProfile();
    return profile?.role === 'super_admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get user statistics
 */
export async function getUserStats() {
  try {
    const { data: totalUsers, error: totalError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true });

    const { data: activeUsers, error: activeError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { data: admins, error: adminError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'super_admin');

    if (totalError || activeError || adminError) {
      console.error('Error fetching user stats:', { totalError, activeError, adminError });
      return {
        total: 0,
        active: 0,
        admins: 0
      };
    }

    return {
      total: totalUsers?.length || 0,
      active: activeUsers?.length || 0,
      admins: admins?.length || 0
    };
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return {
      total: 0,
      active: 0,
      admins: 0
    };
  }
} 