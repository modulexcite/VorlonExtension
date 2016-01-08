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
                    chrome.runtime.sendMessage({extensionCommand: "getDashboardTabId"}, function(response) {
                        if(response){
                            this._dashboardTabId = response.tabId;
                        }
                    });
                    chrome.runtime.onMessage.addListener(
                        function(request, sender, sendResponse) {
                            switch (request.extensionCommand) {
                                case "broadcastDashboardTabId":
                                    this._dashboardTabId = request.tabId;
                                    break;
                                case "message": 
                                    var received = <VorlonMessage>JSON.parse(request.message);
                                    this.onRealtimeMessageReceived(received);
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
                        function(request, sender, sendResponse) {
                            switch (request.extensionCommand) {
                                case "getDashboardTabId":
                                    sendResponse({tabId: this._dashboardTabId});
                                    break;
                                case "message":
                                    var received = <VorlonMessage>JSON.parse(request.message);
                                    this.onRealtimeMessageReceived(received);
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
                    data: objectToSend,
                    extensionCommand: "message"
                };

                if (command) {
                    message.command = command;
                }

                switch (side) {
                    case RuntimeSide.Client:
                        chrome.tabs.sendMessage(this._dashboardTabId, JSON.stringify(message));
                        break;
                    case RuntimeSide.Dashboard:
                        chrome.tabs.sendMessage(this._targetTabId, JSON.stringify(message));
                        break;
                return;
            }
        }
    }
}
