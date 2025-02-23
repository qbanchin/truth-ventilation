
import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables with fallbacks to empty strings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

// Check if the values are present after initialization
if (!supabaseUrl) {
  console.error('Supabase URL is missing. Please check your Supabase connection.');
}
if (!supabaseAnonKey) {
  console.error('Supabase Anon Key is missing. Please check your Supabase connection.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
);

export type Confession = {
  id: number;
  text: string;
  user_id: string;
  created_at: string;
  is_anonymous: boolean;
};

export type Comment = {
  id: number;
  confession_id: number;
  text: string;
  user_id: string;
  created_at: string;
};
