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

declare module VBE.BestPractices {
    class Plugin {
    }
}
