import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// For client-side usage with anonymous key
export const createSupabaseClient = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
};

// For server-side usage with service role key for admin access
export const createSupabaseAdmin = () => {
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error('Missing Supabase admin environment variables');
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};

// Singleton client for client-side usage
export const supabase = createSupabaseClient(); 