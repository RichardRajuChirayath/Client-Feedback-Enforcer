// Create the context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "enforceFeedback",
        title: "Enforce this Feedback",
        contexts: ["selection"]
    });
});

// Handle the context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "enforceFeedback") {
        const feedbackText = info.selectionText;

        // Store the text temporarily and open the popup or handled in background
        chrome.storage.local.set({ lastCapturedFeedback: feedbackText }, () => {
            // We notify the user via action badge or just let them open the popup
            chrome.action.setBadgeText({ text: "!" });
            chrome.action.setBadgeBackgroundColor({ color: "#6366f1" });

            console.log("Feedback captured:", feedbackText);
        });
    }
});
