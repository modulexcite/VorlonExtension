"use strict";
var VORLON;
(function (VORLON) {
    var ClientMessenger = (function () {
        function ClientMessenger(side, targetTabId) {
            var _this = this;
            this._targetTabId = targetTabId;
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    chrome.runtime.sendMessage({ extensionCommand: "getDashboardTabId" }, function (response) {
                        this._dashboardTabId = response.tabId;
                    });
                    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        switch (request.extensionCommand) {
                            case "broadcastDashboardTabId":
                                this._dashboardTabId = request.tabId;
                                break;
                            case "message":
                                var received = JSON.parse(request.message);
                                this.onRealtimeMessageReceived(received);
                                break;
                        }
                    });
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    chrome.tabs.getCurrent(function (tab) {
                        _this._dashboardTabId = tab.id;
                        chrome.runtime.sendMessage({ extensionCommand: "broadcastDashboardTabId",
                            tabId: tab.id });
                    });
                    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        switch (request.extensionCommand) {
                            case "getDashboardTabId":
                                sendResponse({ tabId: this._dashboardTabId });
                                break;
                            case "message":
                                var received = JSON.parse(request.message);
                                this.onRealtimeMessageReceived(received);
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
                    side: side
                },
                data: objectToSend,
                extensionCommand: "message"
            };
            if (command) {
                message.command = command;
            }
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    chrome.tabs.sendMessage(this._dashboardTabId, JSON.stringify(message));
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    chrome.tabs.sendMessage(this._targetTabId, JSON.stringify(message));
                    break;
                    return;
            }
        };
        return ClientMessenger;
    })();
    VORLON.ClientMessenger = ClientMessenger;
})(VORLON || (VORLON = {}));
