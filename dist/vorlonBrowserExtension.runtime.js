"use strict";
var VORLON;
(function (VORLON) {
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
        Tools.QuerySelectorById = function (root, id) {
            if (root.querySelector) {
                return root.querySelector("#" + id);
            }
            return document.getElementById(id);
        };
        Tools.SetImmediate = function (func) {
            if (window.setImmediate) {
                setImmediate(func);
            }
            else {
                setTimeout(func, 0);
            }
        };
        Tools.setLocalStorageValue = function (key, data) {
            if (localStorage) {
                try {
                    localStorage.setItem(key, data);
                }
                catch (e) {
                }
            }
        };
        Tools.getLocalStorageValue = function (key) {
            if (localStorage) {
                try {
                    return localStorage.getItem(key);
                }
                catch (e) {
                    //local storage is not available (private mode maybe)
                    return "";
                }
            }
        };
        Tools.Hook = function (rootObject, functionToHook, hookingFunction) {
            var previousFunction = rootObject[functionToHook];
            rootObject[functionToHook] = function () {
                var optionalParams = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    optionalParams[_i - 0] = arguments[_i];
                }
                hookingFunction(optionalParams);
                previousFunction.apply(rootObject, optionalParams);
            };
            return previousFunction;
        };
        Tools.HookProperty = function (rootObject, propertyToHook, callback) {
            var initialValue = rootObject[propertyToHook];
            Object.defineProperty(rootObject, propertyToHook, {
                get: function () {
                    if (callback) {
                        callback(VORLON.Tools.getCallStack(1));
                    }
                    return initialValue;
                }
            });
        };
        Tools.getCallStack = function (skipped) {
            skipped = skipped || 0;
            try {
                //Throw an error to generate a stack trace
                throw new Error();
            }
            catch (e) {
                //Split the stack trace into each line
                var stackLines = e.stack.split('\n');
                var callerIndex = 0;
                //Now walk though each line until we find a path reference
                for (var i = 2 + skipped, l = stackLines.length; i < l; i++) {
                    if (!(stackLines[i].indexOf("http://") >= 0))
                        continue;
                    //We skipped all the lines with out an http so we now have a script reference
                    //This one is the class constructor, the next is the getScriptPath() call
                    //The one after that is the user code requesting the path info (so offset by 2)
                    callerIndex = i;
                    break;
                }
                var res = {
                    stack: e.stack,
                };
                var linetext = stackLines[callerIndex];
                //Now parse the string for each section we want to return
                //var pathParts = linetext.match(/((http[s]?:\/\/.+\/)([^\/]+\.js))([\/]):/);
                // if (pathParts){
                //     
                // }
                var opening = linetext.indexOf("http://") || linetext.indexOf("https://");
                if (opening > 0) {
                    var closing = linetext.indexOf(")", opening);
                    if (closing < 0)
                        closing = linetext.length - 1;
                    var filename = linetext.substr(opening, closing - opening);
                    var linestart = filename.indexOf(":", filename.lastIndexOf("/"));
                    res.file = filename.substr(0, linestart);
                }
                return res;
            }
        };
        Tools.CreateCookie = function (name, value, days) {
            var expires;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            else {
                expires = "";
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        };
        Tools.ReadCookie = function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return "";
        };
        // from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#answer-2117523
        Tools.CreateGUID = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
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
        Tools.htmlToString = function (text) {
            return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };
        return Tools;
    })();
    VORLON.Tools = Tools;
    var FluentDOM = (function () {
        function FluentDOM(nodeType, className, parentElt, parent) {
            this.childs = [];
            if (nodeType) {
                this.element = document.createElement(nodeType);
                if (className)
                    this.element.className = className;
                if (parentElt)
                    parentElt.appendChild(this.element);
                this.parent = parent;
                if (parent) {
                    parent.childs.push(this);
                }
            }
        }
        FluentDOM.forElement = function (element) {
            var res = new FluentDOM(null);
            res.element = element;
            return res;
        };
        FluentDOM.prototype.addClass = function (classname) {
            this.element.classList.add(classname);
            return this;
        };
        FluentDOM.prototype.toggleClass = function (classname) {
            this.element.classList.toggle(classname);
            return this;
        };
        FluentDOM.prototype.className = function (classname) {
            this.element.className = classname;
            return this;
        };
        FluentDOM.prototype.opacity = function (opacity) {
            this.element.style.opacity = opacity;
            return this;
        };
        FluentDOM.prototype.display = function (display) {
            this.element.style.display = display;
            return this;
        };
        FluentDOM.prototype.hide = function () {
            this.element.style.display = 'none';
            return this;
        };
        FluentDOM.prototype.visibility = function (visibility) {
            this.element.style.visibility = visibility;
            return this;
        };
        FluentDOM.prototype.text = function (text) {
            this.element.textContent = text;
            return this;
        };
        FluentDOM.prototype.html = function (text) {
            this.element.innerHTML = text;
            return this;
        };
        FluentDOM.prototype.attr = function (name, val) {
            this.element.setAttribute(name, val);
            return this;
        };
        FluentDOM.prototype.editable = function (editable) {
            this.element.contentEditable = editable ? "true" : "false";
            return this;
        };
        FluentDOM.prototype.style = function (name, val) {
            this.element.style[name] = val;
            return this;
        };
        FluentDOM.prototype.appendTo = function (elt) {
            elt.appendChild(this.element);
            return this;
        };
        FluentDOM.prototype.append = function (nodeType, className, callback) {
            var child = new FluentDOM(nodeType, className, this.element, this);
            if (callback) {
                callback(child);
            }
            return this;
        };
        FluentDOM.prototype.createChild = function (nodeType, className) {
            var child = new FluentDOM(nodeType, className, this.element, this);
            return child;
        };
        FluentDOM.prototype.click = function (callback) {
            this.element.addEventListener('click', callback);
            return this;
        };
        FluentDOM.prototype.blur = function (callback) {
            this.element.addEventListener('blur', callback);
            return this;
        };
        FluentDOM.prototype.keydown = function (callback) {
            this.element.addEventListener('keydown', callback);
            return this;
        };
        return FluentDOM;
    })();
    VORLON.FluentDOM = FluentDOM;
})(VORLON || (VORLON = {}));

"use strict";
var VORLON;
(function (VORLON) {
    (function (RuntimeSide) {
        RuntimeSide[RuntimeSide["Client"] = 0] = "Client";
        RuntimeSide[RuntimeSide["Dashboard"] = 1] = "Dashboard";
        RuntimeSide[RuntimeSide["Both"] = 2] = "Both";
    })(VORLON.RuntimeSide || (VORLON.RuntimeSide = {}));
    var RuntimeSide = VORLON.RuntimeSide;
    (function (PluginType) {
        PluginType[PluginType["OneOne"] = 0] = "OneOne";
        PluginType[PluginType["MulticastReceiveOnly"] = 1] = "MulticastReceiveOnly";
        PluginType[PluginType["Multicast"] = 2] = "Multicast";
    })(VORLON.PluginType || (VORLON.PluginType = {}));
    var PluginType = VORLON.PluginType;
})(VORLON || (VORLON = {}));

"use strict";
var VORLON;
(function (VORLON) {
    var ClientMessenger = (function () {
        function ClientMessenger(side, targetTabId) {
            var _this = this;
            this._targetTabId = targetTabId;
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    chrome.runtime.sendMessage({ extensionCommand: "getDashboardTabId" }, function (response) {
                        if (response) {
                            _this._dashboardTabId = response.tabId;
                        }
                    });
                    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        switch (request.extensionCommand) {
                            case "broadcastDashboardTabId":
                                _this._dashboardTabId = request.tabId;
                                break;
                            case "messageToClient":
                                _this.onRealtimeMessageReceived(request);
                                break;
                        }
                    });
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    chrome.tabs.getCurrent(function (tab) {
                        _this._dashboardTabId = tab.id;
                        chrome.runtime.sendMessage({ extensionCommand: "broadcastDashboardTabId",
                            tabId: tab.id });
                    });
                    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        switch (request.extensionCommand) {
                            case "getDashboardTabId":
                                sendResponse({ tabId: _this._dashboardTabId });
                                break;
                            case "messageToDashboard":
                                _this.onRealtimeMessageReceived(request);
                                break;
                        }
                    });
                    break;
            }
        }
        ClientMessenger.prototype.sendRealtimeMessage = function (pluginID, objectToSend, side, messageType, command) {
            if (messageType === void 0) { messageType = "message"; }
            var message = {
                metadata: {
                    pluginID: pluginID,
                    side: side,
                    messageType: messageType
                },
                data: objectToSend
            };
            if (command) {
                message.command = command;
            }
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    message.extensionCommand = "messageToDashboard";
                    chrome.runtime.sendMessage(message);
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    message.extensionCommand = "messageToClient";
                    chrome.tabs.sendMessage(this._targetTabId, message);
                    break;
                    return;
            }
        };
        return ClientMessenger;
    })();
    VORLON.ClientMessenger = ClientMessenger;
})(VORLON || (VORLON = {}));

"use strict";
var VORLON;
(function (VORLON) {
    var _Core = (function () {
        function _Core() {
            this._clientPlugins = new Array();
            this._dashboardPlugins = new Array();
        }
        Object.defineProperty(_Core.prototype, "Messenger", {
            get: function () {
                return VORLON.Core._messenger;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(_Core.prototype, "ClientPlugins", {
            get: function () {
                return VORLON.Core._clientPlugins;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(_Core.prototype, "DashboardPlugins", {
            get: function () {
                return VORLON.Core._dashboardPlugins;
            },
            enumerable: true,
            configurable: true
        });
        _Core.prototype.RegisterClientPlugin = function (plugin) {
            VORLON.Core._clientPlugins.push(plugin);
        };
        _Core.prototype.RegisterDashboardPlugin = function (plugin) {
            VORLON.Core._dashboardPlugins.push(plugin);
        };
        _Core.prototype.StartClientSide = function () {
            VORLON.Core._side = VORLON.RuntimeSide.Client;
            VORLON.Core._messenger = new VORLON.ClientMessenger(VORLON.Core._side);
            // Connect messenger to dispatcher
            VORLON.Core.Messenger.onRealtimeMessageReceived = VORLON.Core._Dispatch;
            // Launch plugins
            for (var index = 0; index < VORLON.Core._clientPlugins.length; index++) {
                var plugin = VORLON.Core._clientPlugins[index];
                plugin.startClientSide();
            }
        };
        _Core.prototype.StartDashboardSide = function (tabid, divMapper) {
            VORLON.Core._side = VORLON.RuntimeSide.Dashboard;
            VORLON.Core._messenger = new VORLON.ClientMessenger(VORLON.Core._side, tabid);
            // Connect messenger to dispatcher
            VORLON.Core.Messenger.onRealtimeMessageReceived = VORLON.Core._Dispatch;
            // Launch plugins
            for (var index = 0; index < VORLON.Core._dashboardPlugins.length; index++) {
                var plugin = VORLON.Core._dashboardPlugins[index];
                plugin.startDashboardSide(divMapper ? divMapper(plugin.getID()) : null);
                VORLON.Core.Messenger.sendRealtimeMessage(plugin.getID(), {}, VORLON.RuntimeSide.Dashboard, "refresh");
            }
        };
        _Core.prototype._Dispatch = function (message) {
            if (!message.metadata) {
                console.error('invalid message ' + JSON.stringify(message));
                return;
            }
            if (message.metadata.pluginID == 'ALL_PLUGINS') {
                VORLON.Core._clientPlugins.forEach(function (plugin) {
                    VORLON.Core._DispatchPluginMessage(plugin, message);
                });
                VORLON.Core._dashboardPlugins.forEach(function (plugin) {
                    VORLON.Core._DispatchPluginMessage(plugin, message);
                });
            }
            else {
                VORLON.Core._clientPlugins.forEach(function (plugin) {
                    if (plugin.getID() === message.metadata.pluginID) {
                        VORLON.Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
                VORLON.Core._dashboardPlugins.forEach(function (plugin) {
                    if (plugin.getID() === message.metadata.pluginID) {
                        VORLON.Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
            }
        };
        _Core.prototype._DispatchPluginMessage = function (plugin, message) {
            if (message.metadata.side === VORLON.RuntimeSide.Client) {
                VORLON.Core._DispatchFromClientPluginMessage(plugin, message);
            }
            else {
                if (message.metadata.messageType === "refresh") {
                    plugin.refresh();
                }
                else {
                    VORLON.Core._DispatchFromDashboardPluginMessage(plugin, message);
                }
            }
        };
        _Core.prototype._DispatchFromClientPluginMessage = function (plugin, message) {
            if (message.command && plugin.DashboardCommands) {
                var command = plugin.DashboardCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromClientSide(message.data);
        };
        _Core.prototype._DispatchFromDashboardPluginMessage = function (plugin, message) {
            if (message.command && plugin.ClientCommands) {
                var command = plugin.ClientCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromDashboardSide(message.data);
        };
        return _Core;
    })();
    VORLON._Core = _Core;
    VORLON.Core = new _Core();
})(VORLON || (VORLON = {}));

"use strict";
var VORLON;
(function (VORLON) {
    var BasePlugin = (function () {
        function BasePlugin(name) {
            this.name = name;
            this._ready = true;
            this._id = "";
            this._type = VORLON.PluginType.OneOne;
            this.loadingDirectory = "../plugins";
        }
        Object.defineProperty(BasePlugin.prototype, "Type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        BasePlugin.prototype.getID = function () {
            return this._id;
        };
        BasePlugin.prototype.isReady = function () {
            return this._ready;
        };
        return BasePlugin;
    })();
    VORLON.BasePlugin = BasePlugin;
})(VORLON || (VORLON = {}));

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var ClientPlugin = (function (_super) {
        __extends(ClientPlugin, _super);
        function ClientPlugin(name) {
            _super.call(this, name);
        }
        ClientPlugin.prototype.startClientSide = function () { };
        ClientPlugin.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) { };
        ClientPlugin.prototype.sendToDashboard = function (data) {
            if (VORLON.Core.Messenger)
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Client, "message");
        };
        ClientPlugin.prototype.sendCommandToDashboard = function (command, data) {
            if (data === void 0) { data = null; }
            if (VORLON.Core.Messenger) {
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Client, "message", command);
            }
        };
        ClientPlugin.prototype.refresh = function () {
            console.error("Please override plugin.refresh()");
        };
        ClientPlugin.prototype._loadNewScriptAsync = function (scriptName, callback, waitForDOMContentLoaded) {
            callback();
            // NOTHING ELSE NEEDED IN EXTENSION VERSION
        };
        return ClientPlugin;
    })(VORLON.BasePlugin);
    VORLON.ClientPlugin = ClientPlugin;
})(VORLON || (VORLON = {}));

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var SampleClient = (function (_super) {
        __extends(SampleClient, _super);
        function SampleClient() {
            _super.call(this, "sample"); // Name
            this._ready = true; // No need to wait
            console.log('Started');
        }
        //Return unique id for your plugin
        SampleClient.prototype.getID = function () {
            return "SAMPLE";
        };
        SampleClient.prototype.refresh = function () {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard
            //we don't really need to do anything in this sample
        };
        // This code will run on the client //////////////////////
        // Start the clientside code
        SampleClient.prototype.startClientSide = function () {
            //don't actually need to do anything at startup
        };
        // Handle messages from the dashboard, on the client
        SampleClient.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            console.log('Got message from sample plugin', receivedObject.message);
            //The dashboard will send us an object like { message: 'hello' }
            //Let's just return it, reversed
            var data = {
                message: receivedObject.message.split("").reverse().join("")
            };
            this.sendToDashboard(data);
        };
        return SampleClient;
    })(VORLON.ClientPlugin);
    VORLON.SampleClient = SampleClient;
    //Register the plugin with vorlon core
    VORLON.Core.RegisterClientPlugin(new SampleClient());
})(VORLON || (VORLON = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var ModernizrReportClient = (function (_super) {
        __extends(ModernizrReportClient, _super);
        function ModernizrReportClient() {
            _super.call(this, "modernizrReport");
            this.supportedFeatures = [];
            this._ready = false;
            this._id = "MODERNIZR";
            //this.debug = true;
        }
        ModernizrReportClient.prototype.startClientSide = function () {
            this.loadModernizrFeatures();
        };
        ModernizrReportClient.prototype.loadModernizrFeatures = function () {
            var _this = this;
            this._loadNewScriptAsync("modernizr.js", function () {
                _this.checkSupportedFeatures();
            }, true);
        };
        ModernizrReportClient.prototype.checkSupportedFeatures = function () {
            if (typeof Modernizr != 'undefined' && Modernizr) {
                this.supportedFeatures = [];
                this.supportedFeatures.push({ featureName: "Application cache", isSupported: Modernizr.applicationcache, type: "html" });
                this.supportedFeatures.push({ featureName: "Audio tag", isSupported: Modernizr.audio, type: "html" });
                this.supportedFeatures.push({ featureName: "background-size", isSupported: Modernizr.backgroundsize, type: "css" });
                this.supportedFeatures.push({ featureName: "border-image", isSupported: Modernizr.borderimage, type: "css" });
                this.supportedFeatures.push({ featureName: "border-radius", isSupported: Modernizr.borderradius, type: "css" });
                this.supportedFeatures.push({ featureName: "box-shadow", isSupported: Modernizr.boxshadow, type: "css" });
                this.supportedFeatures.push({ featureName: "canvas", isSupported: Modernizr.canvas, type: "html" });
                this.supportedFeatures.push({ featureName: "canvas text", isSupported: Modernizr.canvastext, type: "html" });
                this.supportedFeatures.push({ featureName: "CSS Animations", isSupported: Modernizr.cssanimations, type: "css" });
                this.supportedFeatures.push({ featureName: "CSS Columns", isSupported: Modernizr.csscolumns, type: "css" });
                this.supportedFeatures.push({ featureName: "CSS Gradients", isSupported: Modernizr.cssgradients, type: "css" });
                this.supportedFeatures.push({ featureName: "CSS Reflections", isSupported: Modernizr.cssreflections, type: "css" });
                this.supportedFeatures.push({ featureName: "CSS Transforms", isSupported: Modernizr.csstransforms, type: "css" });
                this.supportedFeatures.push({ featureName: "CSS Transforms 3d", isSupported: Modernizr.csstransforms3d, type: "css" });
                this.supportedFeatures.push({ featureName: "CSS Transitions", isSupported: Modernizr.csstransitions, type: "css" });
                this.supportedFeatures.push({ featureName: "Drag'n'drop", isSupported: Modernizr.draganddrop, type: "html" });
                this.supportedFeatures.push({ featureName: "Flexbox", isSupported: Modernizr.flexbox, type: "css" });
                this.supportedFeatures.push({ featureName: "@font-face", isSupported: Modernizr.fontface, type: "css" });
                this.supportedFeatures.push({ featureName: "CSS Generated Content (:before/:after)", isSupported: Modernizr.generatedcontent, type: "css" });
                this.supportedFeatures.push({ featureName: "Geolocation API", isSupported: Modernizr.geolocation, type: "misc" });
                this.supportedFeatures.push({ featureName: "hashchange Event", isSupported: Modernizr.hashchange, type: "html" });
                this.supportedFeatures.push({ featureName: "History Management", isSupported: Modernizr.history, type: "html" });
                this.supportedFeatures.push({ featureName: "Color Values hsla()", isSupported: Modernizr.hsla, type: "css" });
                this.supportedFeatures.push({ featureName: "IndexedDB", isSupported: Modernizr.indexeddb, type: "html" });
                this.supportedFeatures.push({ featureName: "Inline SVG in HTML5", isSupported: Modernizr.inlinesvg, type: "misc" });
                this.supportedFeatures.push({ featureName: "Input Attribute autocomplete", isSupported: Modernizr.input.autocomplete, type: "html" });
                /* TO DO: Inputs... */
                this.supportedFeatures.push({ featureName: "localStorage", isSupported: Modernizr.localstorage, type: "html" });
                this.supportedFeatures.push({ featureName: "Multiple backgrounds", isSupported: Modernizr.multiplebgs, type: "css" });
                this.supportedFeatures.push({ featureName: "opacity", isSupported: Modernizr.opacity, type: "css" });
                this.supportedFeatures.push({ featureName: "Cross-window Messaging", isSupported: Modernizr.postmessage, type: "html" });
                this.supportedFeatures.push({ featureName: "Color Values rgba()", isSupported: Modernizr.rgba, type: "css" });
                this.supportedFeatures.push({ featureName: "sessionStorage", isSupported: Modernizr.sessionstorage, type: "html" });
                this.supportedFeatures.push({ featureName: "SVG SMIL animation", isSupported: Modernizr.smil, type: "misc" });
                this.supportedFeatures.push({ featureName: "SVG", isSupported: Modernizr.svg, type: "misc" });
                this.supportedFeatures.push({ featureName: "SVG Clipping Paths", isSupported: Modernizr.svgclippaths, type: "misc" });
                this.supportedFeatures.push({ featureName: "text-shadow", isSupported: Modernizr.textshadow, type: "css" });
                this.supportedFeatures.push({ featureName: "Touch Events", isSupported: Modernizr.touch, type: "misc" });
                this.supportedFeatures.push({ featureName: "Video", isSupported: Modernizr.video, type: "html" });
                this.supportedFeatures.push({ featureName: "WebGL", isSupported: Modernizr.webgl, type: "misc" });
                this.supportedFeatures.push({ featureName: "Web Sockets", isSupported: ("WebSocket" in window), type: "html" });
                this.supportedFeatures.push({ featureName: "Web SQL Database", isSupported: Modernizr.websqldatabase, type: "html" });
                this.supportedFeatures.push({ featureName: "Web Workers", isSupported: Modernizr.webworkers, type: "html" });
                this.supportedFeatures.push({ featureName: "Ambient Light Events", isSupported: Modernizr.ambientlight, type: "noncore" });
                this.supportedFeatures.push({ featureName: "A [download] attribute", isSupported: Modernizr.adownload, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Mozilla Audio Data API", isSupported: Modernizr.audiodata, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Web Audio API", isSupported: Modernizr.webaudio, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Battery Status API", isSupported: Modernizr.battery, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Low Battery Level", isSupported: Modernizr.lowbattery, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Blob Constructor", isSupported: Modernizr.blobconstructor, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Canvas toDataURL image/jpeg", isSupported: Modernizr.todataurljpeg, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Canvas toDataURL image/png", isSupported: Modernizr.todataurlpng, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Canvas toDataURL image/webp", isSupported: Modernizr.todataurlwebp, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Content Editable Attribute", isSupported: Modernizr.contenteditable, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Content Security Policy", isSupported: Modernizr.contentsecuritypolicy, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Context Menu", isSupported: Modernizr.contextmenu, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Cookie", isSupported: Modernizr.cookies, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Cross-Origin Resource Sharing", isSupported: Modernizr.cors, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS background-position Shorthand", isSupported: Modernizr.bgpositionshorthand, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS background-position-x/y", isSupported: Modernizr.bgpositionxy, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS background-repeat: space", isSupported: Modernizr.bgrepeatspace, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS background-repeat: round", isSupported: Modernizr.bgrepeatround, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS background-size: cover", isSupported: Modernizr.bgsizecover, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Box Sizing", isSupported: Modernizr.boxsizing, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Calc", isSupported: Modernizr.csscalc, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Cubic Bezier Range", isSupported: Modernizr.cubicbezierrange, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Gamepad", isSupported: Modernizr.gamepads, type: "noncore" });
                //this.supportedFeatures.push({ featureName: "", isSupported: Modernizr.display-runin, type: "noncore" });
                //this.supportedFeatures.push({ featureName: "", isSupported: Modernizr.display-table, type: "noncore" });
                this.sendFeaturesToDashboard();
            }
        };
        ModernizrReportClient.prototype.sendFeaturesToDashboard = function () {
            var message = {};
            message.features = this.supportedFeatures || [];
            this.sendCommandToDashboard("clientfeatures", message);
        };
        ModernizrReportClient.prototype.refresh = function () {
            if (this.supportedFeatures && this.supportedFeatures.length) {
                this.sendFeaturesToDashboard();
            }
            else {
                this.loadModernizrFeatures();
            }
        };
        return ModernizrReportClient;
    })(VORLON.ClientPlugin);
    VORLON.ModernizrReportClient = ModernizrReportClient;
    ModernizrReportClient.prototype.ClientCommands = {
        refresh: function (data) {
            var plugin = this;
            plugin.refresh();
        }
    };
    // Register
    VORLON.Core.RegisterClientPlugin(new ModernizrReportClient());
})(VORLON || (VORLON = {}));

"use strict";
var VORLON;
(function (VORLON) {
    //Start the core
    VORLON.Core.StartClientSide();
})(VORLON || (VORLON = {}));
