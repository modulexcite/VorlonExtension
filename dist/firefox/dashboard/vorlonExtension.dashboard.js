"use strict";
window.browser = (function () {
    return window.browser ||
        window.chrome ||
        window.msBrowser;
})();
var VORLON;
(function (VORLON) {
    var DashboardManager = (function () {
        function DashboardManager(tabId) {
            //Dashboard session id
            DashboardManager.PluginsLoaded = false;
            DashboardManager.DisplayingTab = false;
            //Client ID
            DashboardManager.TargetTabid = tabId;
            DashboardManager.TabList = {};
            DashboardManager.CatalogUrl = "../pluginscatalog.json";
            DashboardManager.GetTabs();
            browser.tabs.onCreated.addListener(function (tab) {
                DashboardManager.addTab(DashboardManager.GetInternalTabObject(tab));
            });
            browser.tabs.onRemoved.addListener(function (tabId, removeInfo) {
                if (tabId === DashboardManager.TargetTabid) {
                    DashboardManager.showWaitingLogo();
                }
                DashboardManager.removeTab({ 'id': tabId });
            });
            browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                var internalTab = DashboardManager.GetInternalTabObject(tab);
                //internalTab.name = changeInfo.title;
                DashboardManager.renameTab(internalTab);
            });
            browser.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
                DashboardManager.removeTab({ 'id': removedTabId });
                browser.tabs.get(addedTabId, function (tab) {
                    DashboardManager.addTab(DashboardManager.GetInternalTabObject(tab));
                });
            });
        }
        DashboardManager.GetInternalTabObject = function (tab) {
            return {
                'id': tab.id,
                'name': tab.title
            };
        };
        DashboardManager.GetTabs = function () {
            //Init ClientTab Object
            DashboardManager.TabList = {};
            //Loading tab list
            var tabs = [];
            browser.tabs.getCurrent(function (currentTab) {
                browser.tabs.query({}, function (tabresult) {
                    for (var i = 0; i < tabresult.length; i++) {
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
                });
            });
        };
        DashboardManager.AddTabToList = function (tab) {
            var tablist = document.getElementById("clientsListPaneContentList");
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
            pluginlistelementa.textContent = " " + (tab.name);
            pluginlistelementa.setAttribute("href", "?tabid=" + tab.id);
            pluginlistelement.appendChild(pluginlistelementa);
            DashboardManager.TabList[tab.id] = tab;
        };
        DashboardManager.TabCount = function () {
            return Object.keys(DashboardManager.TabList).length;
        };
        DashboardManager.loadPlugins = function () {
            var _this = this;
            if (DashboardManager.TargetTabid == null && isNaN(DashboardManager.TargetTabid)) {
                return;
            }
            if (this.PluginsLoaded) {
                // Start Listening
                return;
            }
            var xhr = new XMLHttpRequest();
            var divPluginsTop = document.getElementById("pluginsPaneTop");
            var divPluginTopTabs = document.getElementById("pluginsListPaneTop");
            var coreLoaded = false;
            xhr.onreadystatechange = function () {
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
                            pluginscript.setAttribute("src", "../plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".dashboard.js");
                            pluginscript.onload = function (oError) {
                                pluginLoaded++;
                                if (pluginLoaded >= catalog.plugins.length) {
                                    //Start listening server
                                    VORLON.Core.StartDashboardSide(DashboardManager.TargetTabid, DashboardManager.divMapper);
                                    coreLoaded = true;
                                    _this.PluginsLoaded = true;
                                    DashboardManager.hideWaitingLogo();
                                }
                            };
                            document.body.appendChild(pluginscript);
                        }
                    }
                }
            };
            xhr.open("GET", browser.extension.getURL(DashboardManager.CatalogUrl));
            xhr.send();
        };
        DashboardManager.hideWaitingLogo = function () {
            var elt = document.querySelector('.dashboard-plugins-overlay');
            VORLON.Tools.AddClass(elt, 'hidden');
        };
        DashboardManager.showWaitingLogo = function () {
            var elt = document.querySelector('.dashboard-plugins-overlay');
            VORLON.Tools.RemoveClass(elt, 'hidden');
        };
        DashboardManager.divMapper = function (pluginId) {
            var divId = pluginId + "div";
            return (document.getElementById(divId) || document.querySelector("[data-plugin=" + pluginId + "]"));
        };
        DashboardManager.addTab = function (tab) {
            DashboardManager.AddTabToList(tab);
            if (!DashboardManager.DisplayingTab) {
                DashboardManager.loadPlugins();
            }
        };
        DashboardManager.removeTab = function (tab) {
            var tabInList = document.getElementById(tab.id);
            if (tabInList) {
                if (tab.id === DashboardManager.TargetTabid) {
                    DashboardManager.TargetTabid = null;
                }
                tabInList.parentElement.removeChild(tabInList);
                DashboardManager.removeInTabList(tab);
                if (DashboardManager.TabCount() === 0) {
                    DashboardManager.DisplayingTab = false;
                }
            }
        };
        DashboardManager.renameTab = function (tab) {
            var tabInList = document.getElementById(tab.id);
            if (tabInList) {
                tabInList.firstChild.innerText = " " + (tab.name);
            }
        };
        DashboardManager.removeInTabList = function (tab) {
            if (DashboardManager.TabList[tab.id] != null) {
                delete DashboardManager.TabList[tab.id];
            }
        };
        return DashboardManager;
    })();
    VORLON.DashboardManager = DashboardManager;
})(VORLON || (VORLON = {}));
