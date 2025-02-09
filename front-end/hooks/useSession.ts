import { SessionContext } from "@/contexts/SessionContext";
import { useContext } from "react";

const dev = process.env.NODE_ENV === 'development';

// This hook can be used to access the user info.
export function useSession() {
    const value = useContext(SessionContext);
    if (dev) {
        if (!value) {
            throw new Error('useSession must be wrapped in a <SessionProvider />');
        }
    }

    return value;
};