// useSession.ts is a react hook to get the supabase session and listen for changes
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSession = () => {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        // get session from supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        // listen for changes in auth state
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
            }
        );
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { session };
};