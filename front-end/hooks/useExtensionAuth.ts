import { useEffect } from 'react';
import { extensionOrigin } from '@/constants';
import { useSession } from './useSession';

export const useExtensionAuth = () => {
    const { session } = useSession();

    useEffect(() => {
        // Listen for messages from the extension
        const messageHandler = (event: MessageEvent) => {
            console.log('Received message from extension:', event.data, event.origin, extensionOrigin);
            if (event.origin !== extensionOrigin) {
                console.warn(`Blocked message from unexpected origin: ${event.origin}`);
                return;
            }
            const { action } = event.data;
            if (action === "authenticateExtension") {
                console.log('Received authenticateExtension message from extension');
                if (session && typeof session !== 'boolean') {
                    const accessToken = session?.access_token;
                    const refreshToken = session?.refresh_token;
                    if (window.opener && window.opener !== window) { // Check if opened by extension
                        console.log('Sending auth data to extension...', accessToken, refreshToken, window.opener);
                        window.opener.postMessage({
                            action: "authDataReceived",
                            accessToken: accessToken,
                            refreshToken: refreshToken,
                        }, '*');//extensionOrigin);
                    }
                }
            }
        };

        window.addEventListener('message', messageHandler);
        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('message', messageHandler);
        };
    }, [session]);

};