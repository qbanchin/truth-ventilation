
import { createClient } from '@supabase/supabase-js';

// Ensure these values are present
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Missing VITE_SUPABASE_URL');
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
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
