export const isDev = import.meta.env.DEV;

export const supabaseUrl = isDev ? import.meta.env.VITE_DEV_SUPABASE_URL : import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = isDev ? import.meta.env.VITE_DEV_SUPABASE_ANON_KEY : import.meta.env.VITE_SUPABASE_ANON_KEY;
export const websiteOrigin = isDev ? '*' : import.meta.env.VITE_WEBSITE_ORIGIN;
