import { createClient } from '@supabase/supabase-js';

const isDev = import.meta.env.DEV;

const supabaseUrl = isDev ? import.meta.env.VITE_DEV_SUPABASE_URL  : import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = isDev ?  import.meta.env.VITE_DEV_SUPABASE_ANON_KEY : import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);