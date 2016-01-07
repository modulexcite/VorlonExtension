chrome.browserAction.onClicked.addListener((activeTab) => {
    chrome.tabs.create({ url: 'dashboard/index.html' }, (tab) => {
    });
});
