import { websiteOrigin } from "./chrome-extension/constants";
import { supabase } from "./chrome-extension/lib/supabaseClient";

// chrome.runtime.onInstalled.addListener(() => {
//     checkSessionAndAuthenticate();
// });

chrome.storage.local.get(['session'], (result) => {
    if (!result.session) {
        console.log('No session found, redirecting to authentication website...');
        // No session found, redirect to the authentication website
        chrome.tabs.create({ url: websiteOrigin }, (_tab) => {
            console.log('Authentication website opened', _tab);
        });
    } else {
        console.log('Session found:', result.session);
        supabase.auth.setSession(result.session);
    }
});

// Listen for messages from the authentication website
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (sender.origin !== websiteOrigin) {
        console.warn(`Blocked message from unexpected origin: ${sender.origin}`);
        return;
    }
    const { action, accessToken, refreshToken } = message;
    console.log('Received message:', message);
    if (action === "authDataReceived") {
        console.log('Received auth data:', accessToken, refreshToken);
        // Store the session data
        chrome.storage.local.set({ session: { accessToken, refreshToken } }, () => {
            console.log('Session stored successfully');
            sendResponse({ success: true });
            supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        });
    } else {
        console.warn('Received unexpected message', message);
        sendResponse({ success: false });
    }
    return true; // Keep the message channel open for sendResponse
});