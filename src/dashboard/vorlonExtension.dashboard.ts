"use strict"
window.browser = (function(){
  return  window.browser      ||
          window.chrome       ||
          window.msBrowser;
})();

module VORLON {
   declare var $: any;
    
   export class DashboardManager {
        static CatalogUrl: string;
        static TargetTabid: number;
        static DisplayingTab: boolean;
        static TabList: any;
        static PluginsLoaded: boolean;
        
        constructor(tabId) {
            //Dashboard session id
            DashboardManager.PluginsLoaded = false;
            DashboardManager.DisplayingTab = false;
            //Client ID
            DashboardManager.TargetTabid = tabId;
            DashboardManager.TabList = {};
            DashboardManager.CatalogUrl = "../pluginscatalog.json";
            DashboardManager.GetTabs();
            
            browser.tabs.onCreated.addListener((tab) => {
                DashboardManager.addTab(DashboardManager.GetInternalTabObject(tab));
            });
            
            browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
                DashboardManager.removeTab({'id': tabId});
                if(tabId === DashboardManager.TargetTabid){
                    DashboardManager.showWaitingLogo();
                }
            });
            
            browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                var internalTab = DashboardManager.GetInternalTabObject(tab);
                //internalTab.name = changeInfo.title;
                DashboardManager.renameTab(internalTab);
            });
            
             browser.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
                DashboardManager.removeTab({'id': removedTabId});
                browser.tabs.get(addedTabId, (tab: browser.tabs.Tab) => {
                    DashboardManager.addTab(DashboardManager.GetInternalTabObject(tab));
                });
            });
        }
        
        public static GetInternalTabObject(tab:browser.tabs.Tab): any{
             return {
                    'id': tab.id,
                    'name': tab.title
                };
        }
        
        public static GetTabs(): void {
            
            //Init ClientTab Object
            DashboardManager.TabList = {};

            //Loading tab list
            var tabs = [];
            browser.tabs.getCurrent((currentTab) => {
                browser.tabs.query({}, (tabresult) => {
                    for(var i = 0; i < tabresult.length; i++){
                        var tab = DashboardManager.GetInternalTabObject(tabresult[i]);
                        if (tab.id === currentTab.id) {
                            continue;
                        }
                        tabs.push(tab);
                    }

                    //Test if the client to display is in the list
                    var contains = false;
                    if (tabs && tabs.length) {
                        for (var j = 0; j < tabs.length; j++) {
                            if (tabs[j].id === DashboardManager.TargetTabid) {
                                contains = true;
                                break;
                            }
                        }
                    }
                    
                    //Get the client list placeholder
                    var divClientsListPane = <HTMLDivElement> document.getElementById("clientsListPaneContent");
                    
                    //Create the new empty list
                    var clientlist = document.createElement("ul");
                    clientlist.setAttribute("id", "clientsListPaneContentList")
                    divClientsListPane.appendChild(clientlist);
                                            
                    for (var i = 0; i < tabs.length; i++) {
                        var tab = tabs[i];
                        DashboardManager.AddTabToList(tab);
                    }
                    
                    if (contains) {
                        DashboardManager.loadPlugins();
                    }
                });
            });
        }
        
        public static AddTabToList(tab: any){
           var tablist = <HTMLUListElement> document.getElementById("clientsListPaneContentList");
            
            if (DashboardManager.TargetTabid == null) {
                DashboardManager.TargetTabid = tab.id;
            }

            var pluginlistelement = document.createElement("li");
            pluginlistelement.classList.add('client');
            pluginlistelement.id = tab.id;
            if (tab.id == DashboardManager.TargetTabid) {
                pluginlistelement.classList.add('active');
            }
            
            var tabs = tablist.children;
            
             if(tabs.length === 0 || DashboardManager.TabList[(<HTMLElement>tabs[tabs.length - 1]).id].name < tab.name){
                tablist.appendChild(pluginlistelement);
            }
            else if(tabs.length === 1){
                var firstClient = <HTMLElement>tabs[tabs.length - 1];
                tablist.insertBefore(pluginlistelement, firstClient);
            }
            else{
                for (var i = 0; i < tabs.length - 1; i++) {
                    var currentClient = <HTMLElement>(tabs[i]);
                    var nextClient = <HTMLElement>(tabs[i+1]);
                    if(DashboardManager.TabList[currentClient.id].name < tab.name
                    &&  DashboardManager.TabList[nextClient.id].name >= tab.name){
                        tablist.insertBefore(pluginlistelement, nextClient);
                        break;
                    }
                    else if(i === 0){
                        tablist.insertBefore(pluginlistelement, currentClient);
                    }
                }
            }
            
            var pluginlistelementa = document.createElement("a");
            pluginlistelementa.textContent = " " + (tab.name);
            pluginlistelementa.setAttribute("href", "?tabid=" + tab.id);
            pluginlistelement.appendChild(pluginlistelementa);

            DashboardManager.TabList[tab.id] = tab;
        } 
        
        static TabCount(): number{
            return Object.keys(DashboardManager.TabList).length;
        }

        public static loadPlugins(): void {
            if(DashboardManager.TargetTabid == null && isNaN(DashboardManager.TargetTabid)){
                return;
            }
                
            if(this.PluginsLoaded){
               // Start Listening
                return;
            }
            
            let xhr = new XMLHttpRequest();
            let divPluginsTop = <HTMLDivElement> document.getElementById("pluginsPaneTop");
            let divPluginTopTabs = <HTMLDivElement> document.getElementById("pluginsListPaneTop");
            let coreLoaded = false;
           
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var catalog;
                        try {
                            catalog = JSON.parse(xhr.responseText);
                        } catch (ex) {
                            throw new Error("The catalog JSON is not well-formed");
                        }

                        var pluginLoaded = 0;
                        
                        for (var i = 0; i < catalog.plugins.length; i++) {
                            var plugin = catalog.plugins[i];
                            var existingLocation = document.querySelector('[data-plugin=' + plugin.id + ']');

                            if (!existingLocation) {
                                var pluginmaindiv = document.createElement('div');
                                pluginmaindiv.classList.add('plugin');
                                pluginmaindiv.classList.add('plugin-' + plugin.id.toLowerCase());
                                pluginmaindiv.setAttribute('data-plugin', plugin.id);

                                var plugintab = document.createElement('div');
                                plugintab.classList.add('tab');
                                plugintab.textContent = plugin.name;
                                plugintab.setAttribute('data-plugin-target', plugin.id);

                                if (divPluginsTop.children.length === 1) {
                                    pluginmaindiv.classList.add("active");
                                }
                                divPluginsTop.appendChild(pluginmaindiv);
                                divPluginTopTabs.appendChild(plugintab);
                            }
                            var pluginscript = document.createElement("script");
                            pluginscript.setAttribute("src",  "../plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".dashboard.js");

                            pluginscript.onload = (oError) => {
                                pluginLoaded++;
                                if (pluginLoaded >= catalog.plugins.length) {
                                    //Start listening server
                                    VORLON.Core.StartDashboardSide(DashboardManager.TargetTabid, DashboardManager.divMapper);
                                    coreLoaded = true;
                                    this.PluginsLoaded = true;
                                    DashboardManager.hideWaitingLogo();
                                }
                            };
                            document.body.appendChild(pluginscript);
                        }
                        DashboardManager.UpdateTabInfo();
                    }
                }
            }

            xhr.open("GET", browser.extension.getURL(DashboardManager.CatalogUrl));
            xhr.send();
        }
        
        public static hideWaitingLogo(): void{
            var elt = <HTMLElement>document.querySelector('.dashboard-plugins-overlay');
            VORLON.Tools.AddClass(elt, 'hidden');
        }
        
        public static showWaitingLogo(): void{
            var elt = <HTMLElement>document.querySelector('.dashboard-plugins-overlay');
            VORLON.Tools.RemoveClass(elt, 'hidden');
        }
       
        public static divMapper(pluginId: number): HTMLDivElement {
            let divId = pluginId + "div";
            return <HTMLDivElement> (document.getElementById(divId) || document.querySelector(`[data-plugin=${pluginId}]`));
        }

        public static addTab(tab: any): void {
            DashboardManager.AddTabToList(tab);
            if(!DashboardManager.DisplayingTab){
                DashboardManager.loadPlugins();
            }
        }
        
        public static removeTab(tab: any): void {
            let tabInList = <HTMLLIElement> document.getElementById(tab.id);
            if(tabInList){
                if(tab.id === DashboardManager.TargetTabid){
                    DashboardManager.TargetTabid = null;
                    //Start listening server
                }
                
                tabInList.parentElement.removeChild(tabInList);   
                DashboardManager.removeInTabList(tab);
                        
                if (DashboardManager.TabCount() === 0) {
                    DashboardManager.DisplayingTab = false;
                }
            }
        }
        
        public static renameTab(tab): void {
            let tabInList = <HTMLLIElement> document.getElementById(tab.id);
            
            if(tabInList){
                (<HTMLLIElement>tabInList.firstChild).innerText = " " + (tab.name);
            }
        }
        
        public static removeInTabList(tab: any): void{
            if(DashboardManager.TabList[tab.id] != null){
                delete DashboardManager.TabList[tab.id];
            }
        }
   }
}