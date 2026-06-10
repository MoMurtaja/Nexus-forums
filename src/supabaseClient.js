import { createClient } from '@supabase/supabase-js';

// Replace these strings with your actual keys from the Supabase Dashboard settings!
const supabaseUrl = 'https://your-project-id.supabase.co';
const supabaseAnonKey = 'your-actual-anonymous-api-key-here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

