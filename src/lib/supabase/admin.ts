import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Client with service role key for server-side admin operations
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default supabaseAdmin; 