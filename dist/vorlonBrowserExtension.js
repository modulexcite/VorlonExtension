var VBE;
(function (VBE) {
    class DashboardManager {
        constructor(tabId) {
            //Dashboard session id
            DashboardManager.PluginsLoaded = false;
            DashboardManager.DisplayingTab = false;
            //Client ID
            DashboardManager.ListenTabid = tabId;
            DashboardManager.TabList = {};
            DashboardManager.GetClients();
            DashboardManager.CatalogUrl = "./plugincatalog.json";
        }
        static GetClients() {
            //Init ClientList Object
            DashboardManager.TabList = {};
            //Loading client list
            //TODO : Change with real content 
            var tabs = [
                {
                    'id': 'qsdq98',
                    'name': 'Tab 1'
                },
                {
                    'id': 'qsdq98',
                    'name': 'MonCul 1'
                }
            ];
            //Test if the client to display is in the list
            var contains = false;
            if (tabs && tabs.length) {
                for (var j = 0; j < tabs.length; j++) {
                    if (tabs[j].id === DashboardManager.ListenTabid) {
                        contains = true;
                        break;
                    }
                }
            }
            //Get the client list placeholder
            var divClientsListPane = document.getElementById("clientsListPaneContent");
            //Create the new empty list
            var clientlist = document.createElement("ul");
            clientlist.setAttribute("id", "clientsListPaneContentList");
            divClientsListPane.appendChild(clientlist);
            for (var i = 0; i < tabs.length; i++) {
                var tab = tabs[i];
                DashboardManager.AddTabToList(tab);
            }
            if (contains) {
                DashboardManager.loadPlugins();
            }
        }
        static AddTabToList(tab) {
            var tablist = document.getElementById("clientsListPaneContentList");
            if (DashboardManager.ListenTabid === "") {
                DashboardManager.ListenTabid = tab.id;
            }
            var pluginlistelement = document.createElement("li");
            pluginlistelement.classList.add('client');
            pluginlistelement.id = tab.id;
            if (tab.id === DashboardManager.ListenTabid) {
                pluginlistelement.classList.add('active');
            }
            var tabs = tablist.children;
            //remove ghosts ones
            for (var i = 0; i < tabs.length; i++) {
                var currentTab = (tabs[i]);
                if (DashboardManager.TabList[currentTab.id].name === tab.name) {
                    tablist.removeChild(currentTab);
                    i--;
                }
            }
            if (tabs.length === 0 || DashboardManager.TabList[tabs[tabs.length - 1].id].name < tab.name) {
                tablist.appendChild(pluginlistelement);
            }
            else if (tabs.length === 1) {
                var firstClient = tabs[tabs.length - 1];
                tablist.insertBefore(pluginlistelement, firstClient);
            }
            else {
                for (var i = 0; i < tabs.length - 1; i++) {
                    var currentClient = (tabs[i]);
                    var nextClient = (tabs[i + 1]);
                    if (DashboardManager.TabList[currentClient.id].name < tab.name
                        && DashboardManager.TabList[nextClient.id].name >= tab.name) {
                        tablist.insertBefore(pluginlistelement, nextClient);
                        break;
                    }
                    else if (i === 0) {
                        tablist.insertBefore(pluginlistelement, currentClient);
                    }
                }
            }
            var pluginlistelementa = document.createElement("a");
            pluginlistelementa.textContent = " " + (tab.name) + " - " + tab.id;
            pluginlistelementa.setAttribute("href", "#toto");
            pluginlistelement.appendChild(pluginlistelementa);
            DashboardManager.TabList[tab.id] = tab;
        }
        static TabCount() {
            return Object.keys(DashboardManager.TabList).length;
        }
        static UpdateTabInfo() {
            if (DashboardManager.TabList[DashboardManager.ListenTabid] != null) {
                DashboardManager.ListenTabDisplayid = DashboardManager.TabList[DashboardManager.ListenTabid].displayid;
            }
            document.querySelector('[data-hook~=tab-id]').textContent = DashboardManager.ListenTabDisplayid;
        }
        static loadPlugins() {
            if (DashboardManager.ListenTabid === "") {
                return;
            }
            if (this.PluginsLoaded) {
                // Start Listening
                return;
            }
            let xhr = new XMLHttpRequest();
            let divPluginsTop = document.getElementById("pluginsPaneTop");
            let divPluginTopTabs = document.getElementById("pluginsListPaneTop");
            let coreLoaded = false;
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var catalog;
                        try {
                            catalog = JSON.parse(xhr.responseText);
                        }
                        catch (ex) {
                            throw new Error("The catalog JSON is not well-formed");
                        }
                        var pluginLoaded = 0;
                        var pluginstoload = 0;
                        //Cleaning unwanted plugins
                        for (var i = 0; i < catalog.plugins.length; i++) {
                            if (catalog.plugins[i].enabled) {
                                pluginstoload++;
                            }
                        }
                        for (var i = 0; i < catalog.plugins.length; i++) {
                            var plugin = catalog.plugins[i];
                            if (!plugin.enabled) {
                                continue;
                            }
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
                            pluginscript.setAttribute("src", "/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".dashboard.min.js");
                            pluginscript.onload = (oError) => {
                                pluginLoaded++;
                                if (pluginLoaded >= pluginstoload) {
                                    //Start listening server
                                    coreLoaded = true;
                                    this.PluginsLoaded = true;
                                }
                            };
                            document.body.appendChild(pluginscript);
                        }
                        DashboardManager.UpdateTabInfo();
                    }
                }
            };
            xhr.open("GET", DashboardManager.CatalogUrl);
            xhr.send();
        }
        static divMapper(pluginId) {
            let divId = pluginId + "div";
            return (document.getElementById(divId) || document.querySelector(`[data-plugin=${pluginId}]`));
        }
        identify() {
            //Core.Messenger.sendRealtimeMessage("", { "_sessionid": DashboardManager.SessionId }, VORLON.RuntimeSide.Dashboard, "identify");
        }
        static ResetDashboard(reload = true) {
            //Todo
        }
        static ReloadClient() {
            //Todo
        }
        static addClient(client) {
            DashboardManager.AddTabToList(client);
            if (!DashboardManager.DisplayingTab) {
                DashboardManager.loadPlugins();
            }
        }
        static removeClient(client) {
            let clientInList = document.getElementById(client.clientid);
            if (clientInList) {
                if (client.clientid === DashboardManager.ListenTabid) {
                    DashboardManager.ListenTabid = "";
                }
                clientInList.parentElement.removeChild(clientInList);
                DashboardManager.removeInClientList(client);
                if (DashboardManager.TabCount() === 0) {
                    DashboardManager.ResetDashboard(false);
                    DashboardManager.DisplayingTab = false;
                }
            }
        }
        static removeInClientList(client) {
            if (DashboardManager.TabList[client.clientid] != null) {
                delete DashboardManager.TabList[client.clientid];
            }
        }
    }
    VBE.DashboardManager = DashboardManager;
})(VBE || (VBE = {}));
