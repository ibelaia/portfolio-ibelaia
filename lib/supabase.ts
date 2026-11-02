import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zuvlslccrtalsbaukqi.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dmxzbGNjcnRhbHNiYXVrcWkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMDAwMDAwMCwiZXhwIjoyMDQ1NTYwMDAwfQ.Zi6Inp1dmxZJi6Inp1dmxZJi6Inp1dmxZJi6Inp1dmxZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);