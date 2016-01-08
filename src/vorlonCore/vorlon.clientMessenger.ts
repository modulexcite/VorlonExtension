"use strict"
module VORLON {
    export interface VorlonMessageMetadata {
        pluginID : string;
        side : RuntimeSide;
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
                    chrome.runtime.sendMessage({extensionCommand: "getDashboardTabId"}, (response) => {
                        if(response){
                            this._dashboardTabId = response.tabId;
                        }
                    });
                    chrome.runtime.onMessage.addListener(
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
                    chrome.tabs.getCurrent((tab) => {
                         this._dashboardTabId = tab.id;
                         chrome.runtime.sendMessage(
                            {extensionCommand: "broadcastDashboardTabId", 
                            tabId: tab.id});
                        });
                   chrome.runtime.onMessage.addListener(
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
                        side: side
                    },
                    data: objectToSend
                };

                if (command) {
                    message.command = command;
                }

                switch (side) {
                    case RuntimeSide.Client:
                        message.extensionCommand = "messageToDashboard";
                        chrome.runtime.sendMessage(message);
                        break;
                    case RuntimeSide.Dashboard:
                        message.extensionCommand = "messageToClient";
                        chrome.tabs.sendMessage(this._targetTabId, message);
                        break;
                return;
            }
        }
    }
}
