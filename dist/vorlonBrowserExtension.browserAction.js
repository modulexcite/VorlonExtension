window.browser = (function () {
    return window.browser ||
        window.chrome ||
        window.msBrowser;
})();
var dashboardTabId = -1; // no id by default
browser.browserAction.onClicked.addListener(function (activeTab) {
    if (dashboardTabId === -1) {
        browser.tabs.create({ url: 'dashboard/index.html' }, function (tab) {
            dashboardTabId = tab.id;
        });
    }
});
browser.tabs.onRemoved.addListener(function (removetabid, removeInfo) {
    if (dashboardTabId != -1 && removetabid === dashboardTabId) {
        dashboardTabId = -1;
    }
});
