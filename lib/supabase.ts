import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zuvlslccrtalsbaukqi.supabase.co';
const supabaseAnonKey = 'sb_publishable_rIzePKK5iQp_N7ezG0tKng_ODNpaCJN';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);