declare var dashboardTabId: number;

declare var qs: any;
declare var tabid: number;
declare var vorlonDashboard: VBE.DashboardManager;

declare module VBE {
    class DashboardManager {
        static CatalogUrl: string;
        static ListenTabid: number;
        static DisplayingTab: boolean;
        static ListenTabDisplayid: string;
        static TabList: any;
        static PluginsLoaded: boolean;
        constructor(tabId: any);
        static GetInternalTabObject(tab: chrome.tabs.Tab): any;
        static ListenFake(pluginid: any): void;
        static GetTabs(): void;
        static AddTabToList(tab: any): void;
        static TabCount(): number;
        static UpdateTabInfo(): void;
        static loadPlugins(): void;
        static divMapper(pluginId: string): HTMLDivElement;
        identify(): void;
        static ResetDashboard(reload: boolean): void;
        static ReloadClient(): void;
        static addTab(tab: any): void;
        static removeTab(tab: any): void;
        static renameTab(tab: any): void;
        static removeInTabList(tab: any): void;
    }
    class Tools {
        static QueryString(): {};
        static RemoveEmpties(arr: string[]): number;
        static AddClass(e: HTMLElement, name: string): HTMLElement;
        static RemoveClass(e: HTMLElement, name: string): HTMLElement;
        static ToggleClass(e: HTMLElement, name: string, callback?: (hasClass: boolean) => void): void;
    }
}

declare module VORLON {
    class BasePlugin {
        name: string;
        _ready: boolean;
        protected _id: string;
        protected _debug: boolean;
        _type: PluginType;
        trace: (msg) => void;
        protected traceLog: (msg: any) => void;
        protected traceNoop: (msg: any) => void;
        loadingDirectory: string;
        constructor(name: string);
        Type: PluginType;
        debug: boolean;
        getID(): string;
        isReady(): boolean;
    }
}

declare module VORLON {
    interface VorlonMessageMetadata {
        pluginID: string;
        side: RuntimeSide;
        sessionId: string;
        clientId: string;
        listenClientId: string;
    }
    interface VorlonMessage {
        metadata: VorlonMessageMetadata;
        command?: string;
        data?: any;
    }
    class ClientMessenger {
        private _socket;
        private _isConnected;
        private _sessionId;
        private _clientId;
        private _listenClientId;
        private _serverUrl;
        onRealtimeMessageReceived: (message: VorlonMessage) => void;
        onHeloReceived: (id: string) => void;
        onIdentifyReceived: (id: string) => void;
        onRemoveClient: (id: any) => void;
        onAddClient: (id: any) => void;
        onStopListenReceived: () => void;
        onRefreshClients: () => void;
        onReload: (id: string) => void;
        onError: (err: Error) => void;
        isConnected: boolean;
        clientId: string;
        socketId: string;
        constructor(side: RuntimeSide, serverUrl: string, sessionId: string, clientId: string, listenClientId: string);
        stopListening(): void;
        sendRealtimeMessage(pluginID: string, objectToSend: any, side: RuntimeSide, messageType?: string, command?: string): void;
        sendMonitoringMessage(pluginID: string, message: string): void;
        getMonitoringMessage(pluginID: string, onMonitoringMessage: (messages: string[]) => any, from?: string, to?: string): any;
    }
}

declare module VORLON {
    class ClientPlugin extends BasePlugin {
        ClientCommands: any;
        constructor(name: string);
        startClientSide(): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        sendToDashboard(data: any): void;
        sendCommandToDashboard(command: string, data?: any): void;
        refresh(): void;
        _loadNewScriptAsync(scriptName: string, callback: () => void, waitForDOMContentLoaded?: boolean): void;
    }
}

declare module VORLON {
    class _Core {
        _clientPlugins: ClientPlugin[];
        _dashboardPlugins: DashboardPlugin[];
        _messenger: ClientMessenger;
        _sessionID: string;
        _listenClientId: string;
        _side: RuntimeSide;
        _errorNotifier: any;
        _messageNotifier: any;
        _socketIOWaitCount: number;
        debug: boolean;
        _RetryTimeout: number;
        Messenger: ClientMessenger;
        ClientPlugins: Array<ClientPlugin>;
        DashboardPlugins: Array<DashboardPlugin>;
        RegisterClientPlugin(plugin: ClientPlugin): void;
        RegisterDashboardPlugin(plugin: DashboardPlugin): void;
        StopListening(): void;
        StartClientSide(serverUrl?: string, sessionId?: string, listenClientId?: string): void;
        sendHelo(): void;
        startClientDirtyCheck(): void;
        StartDashboardSide(serverUrl?: string, sessionId?: string, listenClientId?: string, divMapper?: (string) => HTMLDivElement): void;
        private _OnStopListenReceived();
        private _OnIdentifyReceived(message);
        private ShowError(message, timeout?);
        private _OnError(err);
        private _OnIdentificationReceived(id);
        private _OnReloadClient(id);
        private _RetrySendingRealtimeMessage(plugin, message);
        private _Dispatch(message);
        private _DispatchPluginMessage(plugin, message);
        private _DispatchFromClientPluginMessage(plugin, message);
        private _DispatchFromDashboardPluginMessage(plugin, message);
    }
    var Core: _Core;
}

declare module VORLON {
    class DashboardPlugin extends BasePlugin {
        htmlFragmentUrl: any;
        cssStyleSheetUrl: any;
        DashboardCommands: any;
        constructor(name: string, htmlFragmentUrl: string, cssStyleSheetUrl: string);
        startDashboardSide(div: HTMLDivElement): void;
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
        sendToClient(data: any): void;
        sendCommandToClient(command: string, data?: any): void;
        sendCommandToPluginClient(pluginId: string, command: string, data?: any): void;
        sendCommandToPluginDashboard(pluginId: string, command: string, data?: any): void;
        _insertHtmlContentAsync(divContainer: HTMLDivElement, callback: (filledDiv: HTMLDivElement) => void): void;
        private _stripContent(content);
    }
}

declare module VORLON {
    enum RuntimeSide {
        Client = 0,
        Dashboard = 1,
        Both = 2,
    }
    enum PluginType {
        OneOne = 0,
        MulticastReceiveOnly = 1,
        Multicast = 2,
    }
}

declare module VORLON {
    class Tools {
        static QuerySelectorById(root: HTMLElement, id: string): HTMLElement;
        static SetImmediate(func: () => void): void;
        static setLocalStorageValue(key: string, data: string): void;
        static getLocalStorageValue(key: string): any;
        static Hook(rootObject: any, functionToHook: string, hookingFunction: (...optionalParams: any[]) => void): void;
        static HookProperty(rootObject: any, propertyToHook: string, callback: any): void;
        static getCallStack(skipped: any): any;
        static CreateCookie(name: string, value: string, days: number): void;
        static ReadCookie(name: string): string;
        static CreateGUID(): string;
        static RemoveEmpties(arr: string[]): number;
        static AddClass(e: HTMLElement, name: string): HTMLElement;
        static RemoveClass(e: HTMLElement, name: string): HTMLElement;
        static ToggleClass(e: HTMLElement, name: string, callback?: (hasClass: boolean) => void): void;
        static htmlToString(text: any): any;
    }
    class FluentDOM {
        element: HTMLElement;
        childs: Array<FluentDOM>;
        parent: FluentDOM;
        constructor(nodeType: string, className?: string, parentElt?: Element, parent?: FluentDOM);
        static forElement(element: HTMLElement): FluentDOM;
        addClass(classname: string): FluentDOM;
        toggleClass(classname: string): FluentDOM;
        className(classname: string): FluentDOM;
        opacity(opacity: string): FluentDOM;
        display(display: string): FluentDOM;
        hide(): FluentDOM;
        visibility(visibility: string): FluentDOM;
        text(text: string): FluentDOM;
        html(text: string): FluentDOM;
        attr(name: string, val: string): FluentDOM;
        editable(editable: boolean): FluentDOM;
        style(name: string, val: string): FluentDOM;
        appendTo(elt: Element): FluentDOM;
        append(nodeType: string, className?: string, callback?: (fdom: FluentDOM) => void): FluentDOM;
        createChild(nodeType: string, className?: string): FluentDOM;
        click(callback: (EventTarget) => void): FluentDOM;
        blur(callback: (EventTarget) => void): FluentDOM;
        keydown(callback: (EventTarget) => void): FluentDOM;
    }
}

declare module VBE.BestPractices {
    class ClientPlugin {
    }
}

declare module VBE.BestPractices {
    class DashboardPlugin {
    }
}
