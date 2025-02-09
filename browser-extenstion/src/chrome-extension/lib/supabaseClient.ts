import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from '../constants';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);