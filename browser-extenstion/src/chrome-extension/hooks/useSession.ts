import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

export const useSession = () => {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const getSessionFromStorage = async () => {
            // Get session from chrome.local storage
            chrome.storage.local.get(['session'], async (result) => {
                if (result.session) {
                    // Set the session in Supabase
                    const res = await supabase.auth.setSession(result.session);
                    setSession(res.data.session);
                    await chrome.storage.local.set({ session: res.data.session });
                }
            });
        };
        getSessionFromStorage();

        // Listen for changes in auth state
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                console.log('Auth state changed:', _event, session);
                setSession(session);
                // Set the session in chrome.local storage
                await chrome.storage.local.set({ session });
            }
        );
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { session };
};