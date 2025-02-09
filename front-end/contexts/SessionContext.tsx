import React, { createContext, useState, PropsWithChildren, useEffect } from 'react';
import { Session, SignOut } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient';

export const SessionContext = createContext<{
    session: Session | null | true
    signOut: (options?: SignOut) => Promise<void>
}>({
    session: null,
    signOut: () => new Promise<void>(() => { })
});

export function AuthContextProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);

    const signOut = async (options?: SignOut) => {
        const { error } = await supabase.auth.signOut(options);
        if (error) {
            throw new Error(`Error signing out ${error.message}`);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })
    }, [])

    return (<SessionContext.Provider
        value={{
            session,
            signOut
        }} >
        {children}
    </SessionContext.Provider>);
}