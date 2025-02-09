chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getAuthToken" && sender?.tab?.id) { // Handle the auth request from the popup
        chrome.scripting.executeScript({
            target: { tabId: sender.tab.id }, // Target the correct tab
            func: () => {
                return document.cookie;
            },
        }, (results) => {
            if (results && results[0] && results[0].result) {
                const cookies = results[0].result.split(';');
                let accessToken = null;
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.startsWith('your-cookie-name=')) { // Replace 'your-cookie-name'
                        accessToken = cookie.substring('your-cookie-name='.length);
                        break;
                    }
                }
                sendResponse({ token: accessToken });
            } else {
                sendResponse({ token: null });
            }
        });
        return true; // Important: Indicate asynchronous response
    }
});