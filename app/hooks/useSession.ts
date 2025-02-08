import { SessionContext } from "@/contexts/SessionContext";
import { useContext } from "react";

// This hook can be used to access the user info.
export function useSession() {
    const value = useContext(SessionContext);
    if (__DEV__) {
        if (!value) {
            throw new Error('useSession must be wrapped in a <SessionProvider />');
        }
    }

    return value;
};