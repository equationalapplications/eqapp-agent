import { websiteOrigin } from "./chrome-extension/constants";

chrome.runtime.onInstalled.addListener(() => {
    checkSessionAndAuthenticate();
});

function checkSessionAndAuthenticate() {
    // Check if there's an existing session
    chrome.storage.local.get(['session'], (result) => {
        if (!result.session) {
            // No session found, redirect to the authentication website
            chrome.tabs.create({ url: websiteOrigin }, (_tab) => {
                // Listen for messages from the authentication website
                chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                    if (sender.origin !== websiteOrigin) {
                        console.warn(`Blocked message from unexpected origin: ${sender.origin}`);
                        return;
                    }

                    const { action, accessToken, refreshToken } = message;
                    if (action === "authDataReceived") {
                        console.log('Received auth data:', accessToken, refreshToken);
                        // Store the session data
                        chrome.storage.local.set({ session: { accessToken, refreshToken } }, () => {
                            console.log('Session stored successfully');
                            sendResponse({ success: true });
                        });
                    } else {
                        console.warn('Received unexpected message', message);
                        sendResponse({ success: false });
                    }
                    return true; // Keep the message channel open for sendResponse
                });
            });
        } else {
            console.log('Session found:', result.session);
        }
    });
}