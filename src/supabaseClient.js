import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzirquwwfdexfhbirrye.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6aXJxdXd3ZmRleGZoYmlycnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTY5MTYsImV4cCI6MjA5NjY5MjkxNn0.1PuCYJ-HX6EiUXP3L4D5SxXaMpA6K4U9EzM4HciCkhY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

