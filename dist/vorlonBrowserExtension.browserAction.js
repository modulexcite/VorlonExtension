var dashboardTabId = -1; // no id by default
chrome.browserAction.onClicked.addListener(function (activeTab) {
    if (dashboardTabId === -1) {
        chrome.tabs.create({ url: 'dashboard/index.html' }, function (tab) {
            dashboardTabId = tab.id;
        });
    }
});
chrome.tabs.onRemoved.addListener(function (removetabid, removeInfo) {
    if (dashboardTabId != -1 && removetabid === dashboardTabId) {
        dashboardTabId = -1;
    }
});
