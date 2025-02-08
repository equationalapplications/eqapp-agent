import { AppState } from 'react-native'
import { createClient } from '@supabase/supabase-js'
import Constants from "expo-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types on this are wrong. This exists, and `host` does not.
const origin = (
    Constants?.expoConfig as unknown as { hostUri?: string }
)?.hostUri
    ?.split(":")
    .shift();
const dev = process.env.NODE_ENV === 'development';

const devSupabaseUrl = origin ? `http://${origin}:54321` : `http://127.0.0.1:54321`;

const supabaseUrl = dev ? devSupabaseUrl : process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = dev ? process.env.EXPO_PUBLIC_DEV_SUPABASE_ANON_KEY : process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is not defined');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
})

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground.When this is added, you will continue
// to receive `onAuthStateChange` events with the`TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
});