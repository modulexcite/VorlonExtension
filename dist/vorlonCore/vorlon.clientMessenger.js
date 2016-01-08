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
                        if (response) {
                            _this._dashboardTabId = response.tabId;
                        }
                    });
                    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
                    chrome.tabs.getCurrent(function (tab) {
                        _this._dashboardTabId = tab.id;
                        chrome.runtime.sendMessage({ extensionCommand: "broadcastDashboardTabId",
                            tabId: tab.id });
                    });
                    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
                    chrome.runtime.sendMessage(message);
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    message.extensionCommand = "messageToClient";
                    chrome.tabs.sendMessage(this._targetTabId, message);
                    break;
                    return;
            }
        };
        return ClientMessenger;
    })();
    VORLON.ClientMessenger = ClientMessenger;
})(VORLON || (VORLON = {}));
