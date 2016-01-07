﻿"use strict"
module VORLON {

    export class _Core {
        _clientPlugins = new Array<ClientPlugin>();
        _dashboardPlugins = new Array<DashboardPlugin>();
        _messenger: ClientMessenger;
        _tabId: number;
        _side: RuntimeSide;

        public get Messenger(): ClientMessenger {
            return Core._messenger;
        }

        public get ClientPlugins(): Array<ClientPlugin> {
            return Core._clientPlugins;
        }

        public get DashboardPlugins(): Array<DashboardPlugin> {
            return Core._dashboardPlugins;
        }

        public RegisterClientPlugin(plugin: ClientPlugin): void {
            Core._clientPlugins.push(plugin);
        }

        public RegisterDashboardPlugin(plugin: DashboardPlugin): void {
            Core._dashboardPlugins.push(plugin);
        }

        public StartClientSide(): void {
            Core._side = RuntimeSide.Client;
         
            //Get the tab id
            chrome.tabs.getCurrent((tab: chrome.tabs.Tab) => {
                Core._tabId = tab.id;
                Core._messenger = new ClientMessenger(Core._side, Core._tabId);

                // Connect messenger to dispatcher
                Core.Messenger.onRealtimeMessageReceived = Core._Dispatch;

                // Launch plugins
                for (var index = 0; index < Core._clientPlugins.length; index++) {
                    var plugin = Core._clientPlugins[index];
                    plugin.startClientSide();
                }
            });
        }

        public StartDashboardSide(tabid: number, divMapper: (number) => HTMLDivElement): void {
            Core._side = RuntimeSide.Dashboard;
            Core._tabId = tabid;
            Core._messenger = new ClientMessenger(Core._side, Core._tabId);

            // Connect messenger to dispatcher
            Core.Messenger.onRealtimeMessageReceived = Core._Dispatch;

            // Launch plugins
            for (var index = 0; index < Core._dashboardPlugins.length; index++) {
                var plugin = Core._dashboardPlugins[index];
                plugin.startDashboardSide(divMapper ? divMapper(plugin.getID()) : null);
            }
        }

        private _OnIdentificationReceived(id: number): void {
            Core._tabId = id;

            if (Core._side === RuntimeSide.Client) {
                // Refresh plugins
                for (var index = 0; index < Core._clientPlugins.length; index++) {
                    var plugin = Core._clientPlugins[index];
                    plugin.refresh();
                }
            }
        }

        private _Dispatch(message: VorlonMessage): void {
            if (!message.metadata) {
                console.error('invalid message ' + JSON.stringify(message));
                return;
            }

            if (message.metadata.pluginID == 'ALL_PLUGINS') {
                Core._clientPlugins.forEach((plugin) => {
                    Core._DispatchPluginMessage(plugin, message);
                });
                Core._dashboardPlugins.forEach((plugin) => {
                    Core._DispatchPluginMessage(plugin, message);
                });
            }
            else {
                Core._clientPlugins.forEach((plugin) => {
                    if (plugin.getID() === message.metadata.pluginID) {
                        Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
                Core._dashboardPlugins.forEach((plugin) => {
                    if (plugin.getID() === message.metadata.pluginID) {
                        Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
            }
        }

        private _DispatchPluginMessage(plugin: BasePlugin, message: VorlonMessage): void {
            if (message.metadata.side === RuntimeSide.Client) {
                Core._DispatchFromClientPluginMessage(<DashboardPlugin>plugin, message);
            } else {
                Core._DispatchFromDashboardPluginMessage(<ClientPlugin>plugin, message);
            }
        }

        private _DispatchFromClientPluginMessage(plugin: DashboardPlugin, message: VorlonMessage): void {
            if (message.command && plugin.DashboardCommands) {
                var command = plugin.DashboardCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromClientSide(message.data);
        }

        private _DispatchFromDashboardPluginMessage(plugin: ClientPlugin, message: VorlonMessage): void {
            if (message.command && plugin.ClientCommands) {
                var command = plugin.ClientCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromDashboardSide(message.data);
        }
    }

    export var Core = new _Core();
}

