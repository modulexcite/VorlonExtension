"use strict";
var VBE;
(function (VBE) {
    var DashboardManager = (function () {
        function DashboardManager(tabId) {
            //Dashboard session id
            DashboardManager.PluginsLoaded = false;
            DashboardManager.DisplayingTab = false;
            //Client ID
            DashboardManager.ListenTabid = tabId;
            DashboardManager.TabList = {};
            DashboardManager.CatalogUrl = "./plugincatalog.json";
            DashboardManager.GetTabs();
            chrome.tabs.onCreated.addListener(function (tab) {
                DashboardManager.addTab(DashboardManager.GetInternalTabObject(tab));
            });
            chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
                DashboardManager.removeTab({ 'id': tabId });
            });
            chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                var internalTab = DashboardManager.GetInternalTabObject(tab);
                //internalTab.name = changeInfo.title;
                DashboardManager.renameTab(internalTab);
            });
            chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
                DashboardManager.removeTab({ 'id': removedTabId });
                chrome.tabs.get(addedTabId, function (tab) {
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
        DashboardManager.ListenFake = function (pluginid) {
            var messagesDiv = DashboardManager.divMapper(pluginid);
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                messagesDiv.innerText += messagesDiv.innerText + (sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
            });
        };
        DashboardManager.GetTabs = function () {
            //Init ClientTab Object
            DashboardManager.TabList = {};
            //Loading tab list
            var tabs = [];
            chrome.tabs.query({}, function (tabresult) {
                for (var i = 0; i < tabresult.length; i++) {
                    tabs.push(DashboardManager.GetInternalTabObject(tabresult[i]));
                }
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
            });
        };
        DashboardManager.AddTabToList = function (tab) {
            var tablist = document.getElementById("clientsListPaneContentList");
            if (DashboardManager.ListenTabid == null) {
                DashboardManager.ListenTabid = tab.id;
            }
            var pluginlistelement = document.createElement("li");
            pluginlistelement.classList.add('client');
            pluginlistelement.id = tab.id;
            if (tab.id == DashboardManager.ListenTabid) {
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
            pluginlistelementa.textContent = " " + (tab.name) + " - " + tab.id;
            pluginlistelementa.setAttribute("href", "?tabid=" + tab.id);
            pluginlistelement.appendChild(pluginlistelementa);
            DashboardManager.TabList[tab.id] = tab;
        };
        DashboardManager.TabCount = function () {
            return Object.keys(DashboardManager.TabList).length;
        };
        DashboardManager.UpdateTabInfo = function () {
            if (DashboardManager.TabList[DashboardManager.ListenTabid] != null) {
                DashboardManager.ListenTabDisplayid = DashboardManager.TabList[DashboardManager.ListenTabid].displayid;
            }
            document.querySelector('[data-hook~=tab-id]').textContent = DashboardManager.ListenTabDisplayid;
        };
        DashboardManager.loadPlugins = function () {
            var _this = this;
            if (DashboardManager.ListenTabid == null) {
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
                            // var pluginscript = document.createElement("script");
                            // pluginscript.setAttribute("src",  "/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".dashboard.min.js");
                            // pluginscript.onload = (oError) => {
                            //     pluginLoaded++;
                            //     if (pluginLoaded >= pluginstoload) {
                            //Start listening server
                            DashboardManager.ListenFake(plugin.id);
                            coreLoaded = true;
                            _this.PluginsLoaded = true;
                            var elt = document.querySelector('.dashboard-plugins-overlay');
                            VBE.Tools.AddClass(elt, 'hidden');
                        }
                        DashboardManager.UpdateTabInfo();
                    }
                }
            };
            xhr.open("GET", chrome.extension.getURL(DashboardManager.CatalogUrl));
            xhr.send();
        };
        DashboardManager.divMapper = function (pluginId) {
            var divId = pluginId + "div";
            return (document.getElementById(divId) || document.querySelector("[data-plugin=" + pluginId + "]"));
        };
        DashboardManager.prototype.identify = function () {
            //Core.Messenger.sendRealtimeMessage("", { "_sessionid": DashboardManager.SessionId }, VORLON.RuntimeSide.Dashboard, "identify");
        };
        DashboardManager.ResetDashboard = function (reload) {
            //Todo
        };
        DashboardManager.ReloadClient = function () {
            //Todo
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
                if (tab.id === DashboardManager.ListenTabid) {
                    DashboardManager.ListenTabid = null;
                }
                tabInList.parentElement.removeChild(tabInList);
                DashboardManager.removeInTabList(tab);
                if (DashboardManager.TabCount() === 0) {
                    DashboardManager.ResetDashboard(false);
                    DashboardManager.DisplayingTab = false;
                }
            }
        };
        DashboardManager.renameTab = function (tab) {
            var tabInList = document.getElementById(tab.id);
            if (tabInList) {
                tabInList.firstChild.innerText = " " + (tab.name) + " - " + tab.id;
            }
        };
        DashboardManager.removeInTabList = function (tab) {
            if (DashboardManager.TabList[tab.id] != null) {
                delete DashboardManager.TabList[tab.id];
            }
        };
        return DashboardManager;
    })();
    VBE.DashboardManager = DashboardManager;
    var Tools = (function () {
        function Tools() {
        }
        Tools.QueryString = function () {
            // This function is anonymous, is executed immediately and 
            // the return value is assigned to QueryString!
            var query_string = {};
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                // If first entry with this name
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = decodeURIComponent(pair[1]);
                }
                else if (typeof query_string[pair[0]] === "string") {
                    var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                    query_string[pair[0]] = arr;
                }
                else {
                    query_string[pair[0]].push(decodeURIComponent(pair[1]));
                }
            }
            return query_string;
        };
        Tools.RemoveEmpties = function (arr) {
            var len = arr.length;
            for (var i = len - 1; i >= 0; i--) {
                if (!arr[i]) {
                    arr.splice(i, 1);
                    len--;
                }
            }
            return len;
        };
        Tools.AddClass = function (e, name) {
            if (e.classList) {
                if (name.indexOf(" ") < 0) {
                    e.classList.add(name);
                }
                else {
                    var namesToAdd = name.split(" ");
                    Tools.RemoveEmpties(namesToAdd);
                    for (var i = 0, len = namesToAdd.length; i < len; i++) {
                        e.classList.add(namesToAdd[i]);
                    }
                }
                return e;
            }
            else {
                var className = e.className;
                var names = className.split(" ");
                var l = Tools.RemoveEmpties(names);
                var toAdd;
                if (name.indexOf(" ") >= 0) {
                    namesToAdd = name.split(" ");
                    Tools.RemoveEmpties(namesToAdd);
                    for (i = 0; i < l; i++) {
                        var found = namesToAdd.indexOf(names[i]);
                        if (found >= 0) {
                            namesToAdd.splice(found, 1);
                        }
                    }
                    if (namesToAdd.length > 0) {
                        toAdd = namesToAdd.join(" ");
                    }
                }
                else {
                    var saw = false;
                    for (i = 0; i < l; i++) {
                        if (names[i] === name) {
                            saw = true;
                            break;
                        }
                    }
                    if (!saw) {
                        toAdd = name;
                    }
                }
                if (toAdd) {
                    if (l > 0 && names[0].length > 0) {
                        e.className = className + " " + toAdd;
                    }
                    else {
                        e.className = toAdd;
                    }
                }
                return e;
            }
        };
        Tools.RemoveClass = function (e, name) {
            if (e.classList) {
                if (e.classList.length === 0) {
                    return e;
                }
                var namesToRemove = name.split(" ");
                Tools.RemoveEmpties(namesToRemove);
                for (var i = 0, len = namesToRemove.length; i < len; i++) {
                    e.classList.remove(namesToRemove[i]);
                }
                return e;
            }
            else {
                var original = e.className;
                if (name.indexOf(" ") >= 0) {
                    namesToRemove = name.split(" ");
                    Tools.RemoveEmpties(namesToRemove);
                }
                else {
                    if (original.indexOf(name) < 0) {
                        return e;
                    }
                    namesToRemove = [name];
                }
                var removed;
                var names = original.split(" ");
                var namesLen = Tools.RemoveEmpties(names);
                for (i = namesLen - 1; i >= 0; i--) {
                    if (namesToRemove.indexOf(names[i]) >= 0) {
                        names.splice(i, 1);
                        removed = true;
                    }
                }
                if (removed) {
                    e.className = names.join(" ");
                }
                return e;
            }
        };
        Tools.ToggleClass = function (e, name, callback) {
            if (e.className.match(name)) {
                Tools.RemoveClass(e, name);
                if (callback)
                    callback(false);
            }
            else {
                Tools.AddClass(e, name);
                if (callback)
                    callback(true);
            }
        };
        return Tools;
    })();
    VBE.Tools = Tools;
})(VBE || (VBE = {}));
