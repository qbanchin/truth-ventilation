
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zbchheswoxbjfibouiyc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiY2hoZXN3b3hiamZpYm91aXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzQ5NTMsImV4cCI6MjA1NTkxMDk1M30.Sg_oTC2dJj7JKm4YkZV9zFNbuXK9WyEqzHbsKV8DxiA';

if (!supabaseUrl) {
  console.error('Supabase URL is missing');
}
if (!supabaseAnonKey) {
  console.error('Supabase Anon Key is missing');
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

export type Truth = {
  id: number;
  text: string;
  user_id: string;
  created_at: string;
  is_anonymous: boolean;
};

export type Comment = {
  id: number;
  truth_id: number;
  text: string;
  user_id: string;
  created_at: string;
  is_fact_check?: boolean;
};

