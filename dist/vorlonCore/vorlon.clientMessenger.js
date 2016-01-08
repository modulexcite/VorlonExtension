"use strict";
window.browser = (function () {
    return window.browser ||
        window.chrome ||
        window.msBrowser;
})();
var VORLON;
(function (VORLON) {
    var ClientMessenger = (function () {
        function ClientMessenger(side, targetTabId) {
            var _this = this;
            this._targetTabId = targetTabId;
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    browser.runtime.sendMessage({ extensionCommand: "getDashboardTabId" }, function (response) {
                        if (response) {
                            _this._dashboardTabId = response.tabId;
                        }
                    });
                    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        switch (request.extensionCommand) {
                            case "broadcastDashboardTabId":
                                _this._dashboardTabId = request.tabId;
                                break;
                            case "messageToClient":
                                _this.onRealtimeMessageReceived(request);
                                break;
                        }
                    });
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    browser.tabs.getCurrent(function (tab) {
                        _this._dashboardTabId = tab.id;
                        browser.runtime.sendMessage({ extensionCommand: "broadcastDashboardTabId",
                            tabId: tab.id });
                    });
                    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        switch (request.extensionCommand) {
                            case "getDashboardTabId":
                                sendResponse({ tabId: _this._dashboardTabId });
                                break;
                            case "messageToDashboard":
                                _this.onRealtimeMessageReceived(request);
                                break;
                        }
                    });
                    break;
            }
        }
        ClientMessenger.prototype.sendRealtimeMessage = function (pluginID, objectToSend, side, messageType, command) {
            if (messageType === void 0) { messageType = "message"; }
            var message = {
                metadata: {
                    pluginID: pluginID,
                    side: side,
                    messageType: messageType
                },
                data: objectToSend
            };
            if (command) {
                message.command = command;
            }
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    message.extensionCommand = "messageToDashboard";
                    browser.runtime.sendMessage(message);
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    message.extensionCommand = "messageToClient";
                    browser.tabs.sendMessage(this._targetTabId, message);
                    break;
                    return;
            }
        };
        return ClientMessenger;
    })();
    VORLON.ClientMessenger = ClientMessenger;
})(VORLON || (VORLON = {}));
