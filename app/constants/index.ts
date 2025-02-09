import Constants from "expo-constants";

const dev = process.env.NODE_ENV === 'development';

// Types on this are wrong. This exists, and `host` does not.
export const origin = (
    Constants?.expoConfig as unknown as { hostUri?: string }
)?.hostUri
    ?.split(":")
    .shift();

export const extensionOrigin = dev ? '*' : process.env.EXPO_PUBLIC_EXTENSION_TARGET;
export const devSupabaseUrl = origin ? `http://${origin}:54321` : `http://127.0.0.1:54321`;
export const supabaseUrl = dev ? devSupabaseUrl : process.env.EXPO_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = dev ? process.env.EXPO_PUBLIC_DEV_SUPABASE_ANON_KEY : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const turnstileKey = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY;
