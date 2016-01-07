declare var dashboard: any;



declare module VBE {
    class DashboardManager {
        static CatalogUrl: string;
        static ListenTabid: string;
        static DisplayingTab: boolean;
        static ListenTabDisplayid: string;
        static TabList: any;
        static PluginsLoaded: boolean;
        constructor(tabId: any);
        static GetClients(): void;
        static AddTabToList(tab: any): void;
        static TabCount(): number;
        static UpdateTabInfo(): void;
        static loadPlugins(): void;
        static divMapper(pluginId: string): HTMLDivElement;
        identify(): void;
        static ResetDashboard(reload?: boolean): void;
        static ReloadClient(): void;
        static addClient(client: any): void;
        static removeClient(client: any): void;
        static removeInClientList(client: any): void;
    }
}

declare module VBE.BestPractices {
    class Plugin {
    }
}
