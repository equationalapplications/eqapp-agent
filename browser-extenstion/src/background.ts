chrome.runtime.onMessage.addListener((
    request: any, // Type the request appropriately later
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void // Type the response
) => {
    if (request.action === "executeTask") {
        const { task } = request;

        executeTask(task).then((result) => {
            sendResponse({ status: "success", result });
        });

        return true; // Keep the message channel open for sendResponse
    }

    // Handle authDataReceived action
    if (request.action === "authDataReceived") {
        const { accessToken, refreshToken } = request;

        // Store or use the tokens as needed
        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);

        // Example: Store tokens in local storage
        chrome.storage.local.set({ accessToken, refreshToken }, () => {
            console.log("Tokens stored");
        });

        sendResponse({ status: "success" });
        return true;
    }

    return false; // Important: Return false if you're not handling the message synchronously
});

// Execute a task in the browser
async function executeTask(task: string): Promise<string> {  // Type the task and return type
    return new Promise<string>((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs && tabs.length > 0 && tabs[0].id) { // Safety check for tabs
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabs[0].id },
                        func: (task: string) => { // Type the task argument in the injected function
                            // Perform the task in the browser
                            if (task.includes("search")) {
                                const query = task.split("search for ")[1];
                                const input = document.querySelector("input[name='q']") as HTMLInputElement | null; // Type the input
                                if (input) {
                                    input.value = query;
                                    const form = document.querySelector("form") as HTMLFormElement | null; // Type the form
                                    if (form) {
                                        form.submit();
                                    }
                                }
                            }
                            return "Task executed successfully.";
                        },
                        args: [task],
                    },
                    (results) => {
                        if (results && results.length > 0 && results[0].result) { // Check results
                            resolve(results[0].result as string); // Type the result
                        } else {
                            resolve("Task execution failed.");
                        }
                    }
                );
            } else {
                resolve("No active tab found."); // Handle the case where no active tab is found
            }
        });
    });
}