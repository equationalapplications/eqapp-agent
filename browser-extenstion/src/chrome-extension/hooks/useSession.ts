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
                    setSession(result.session);
                    // Set the session in Supabase
                    await supabase.auth.setSession(result.session);
                } else {
                    // If no session in chrome.storage, get session from Supabase
                    const { data: { session } } = await supabase.auth.getSession();
                    setSession(session);
                    // Store the session in chrome.local storage
                    chrome.storage.local.set({ session });
                }
            });
        };

        getSessionFromStorage();

        // Listen for changes in auth state
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                // Set the session in chrome.local storage
                chrome.storage.local.set({ session });
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { session };
};