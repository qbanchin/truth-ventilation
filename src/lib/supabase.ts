
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
