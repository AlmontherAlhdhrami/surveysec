import { createClient } from "@supabase/supabase-js";

// Load environment variables
const SUPABASE_URL = 'https://jnkvjxtheefxahaxssey.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impua3ZqeHRoZWVmeGFoYXhzc2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczMDUwMDgsImV4cCI6MjA1Mjg4MTAwOH0.VJwWViDZYOWGDpL16Hk0NM_90UsJzV3AMDdTqaQCcSk';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
