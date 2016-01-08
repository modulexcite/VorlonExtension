"use strict"
window.browser = (function(){
  return  window.browser      ||
          window.chrome       ||
          window.msBrowser;
})();

module VORLON {
    export interface VorlonMessageMetadata {
        pluginID : string;
        side : RuntimeSide;
        messageType: string;
    }

    export interface VorlonMessage {
        metadata: VorlonMessageMetadata;
        command?: string;
        data? : any;
        extensionCommand? : string;
    }

    export class ClientMessenger {
        private _targetTabId: number;
        private _dashboardTabId: number;
        public onRealtimeMessageReceived: (message: VorlonMessage) => void;

        constructor(side: RuntimeSide, targetTabId?: number) {
            this._targetTabId = targetTabId;
            
            switch (side) {
                case RuntimeSide.Client:
                    browser.runtime.sendMessage({extensionCommand: "getDashboardTabId"}, (response) => {
                        if(response){
                            this._dashboardTabId = response.tabId;
                        }
                    });
                    browser.runtime.onMessage.addListener(
                        (request, sender, sendResponse) => {
                            switch (request.extensionCommand) {
                                case "broadcastDashboardTabId":
                                    this._dashboardTabId = request.tabId;
                                    break;
                                case "messageToClient": 
                                    this.onRealtimeMessageReceived(request);
                                    break;
                            }
                        });
                    break;
                case RuntimeSide.Dashboard:
                    browser.tabs.getCurrent((tab) => {
                         this._dashboardTabId = tab.id;
                         browser.runtime.sendMessage(
                            {extensionCommand: "broadcastDashboardTabId", 
                            tabId: tab.id});
                        });
                   browser.runtime.onMessage.addListener(
                        (request, sender, sendResponse) => {
                            switch (request.extensionCommand) {
                                case "getDashboardTabId":
                                    sendResponse({tabId: this._dashboardTabId});
                                    break;
                                case "messageToDashboard":
                                    this.onRealtimeMessageReceived(request);
                                    break;
                            } 
                        });
                    break;
                }
            }

            public sendRealtimeMessage(pluginID: string, objectToSend: any, side: RuntimeSide, messageType = "message", command?:string): void {
                var message: VorlonMessage = {
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
                    case RuntimeSide.Client:
                        message.extensionCommand = "messageToDashboard";
                        browser.runtime.sendMessage(message);
                        break;
                    case RuntimeSide.Dashboard:
                        message.extensionCommand = "messageToClient";
                        browser.tabs.sendMessage(this._targetTabId, message);
                        break;
                return;
            }
        }
    }
}
