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
window.browser = window.browser ||
    window.chrome ||
    window.msBrowser;
var VORLON;
(function (VORLON) {
    var ClientMessenger = (function () {
        function ClientMessenger(side, targetTabId) {
            var _this = this;
            this._targetTabId = targetTabId;
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        _this.onRealtimeMessageReceived(request);
                    });
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                        _this.onRealtimeMessageReceived(request);
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
                    browser.runtime.sendMessage(message);
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    browser.tabs.sendMessage(this._targetTabId, message);
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
            }
            VORLON.Core.Messenger.sendRealtimeMessage("ALL_PLUGINS", {}, VORLON.RuntimeSide.Dashboard, "refresh");
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
        ClientPlugin.prototype.trace = function (message) {
            console.log(message);
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

/*! modernizr 3.2.0 (Custom Build) | MIT *
 * http://modernizr.com/download/?-adownload-ambientlight-animation-apng-appearance-applicationcache-atobbtoa-audio-audioloop-audiopreload-backdropfilter-backgroundblendmode-backgroundcliptext-backgroundsize-batteryapi-bdi-beacon-bgpositionshorthand-bgpositionxy-bgrepeatspace_bgrepeatround-bgsizecover-blobconstructor-bloburls-blobworkers-borderimage-borderradius-boxshadow-boxsizing-canvas-canvasblending-canvastext-canvaswinding-capture-checked-classlist-contains-contenteditable-contextmenu-cookies-cors-createelementattrs_createelement_attrs-cryptography-cssall-cssanimations-csscalc-csschunit-csscolumns-cssescape-cssexunit-cssfilters-cssgradients-csshairline-csshyphens_softhyphens_softhyphensfind-cssinvalid-cssmask-csspointerevents-csspositionsticky-csspseudoanimations-csspseudotransitions-cssreflections-cssremunit-cssresize-cssscrollbar-csstransforms-csstransforms3d-csstransitions-cssvalid-cssvhunit-cssvmaxunit-cssvminunit-cssvwunit-cubicbezierrange-customevent-customprotocolhandler-dart-datachannel-datalistelem-dataset-datauri-dataview-dataworkers-details-devicemotion_deviceorientation-directory-display_runin-displaytable-documentfragment-ellipsis-emoji-es5-es5array-es5date-es5function-es5object-es5string-es5syntax-es5undefined-es6array-es6collections-es6math-es6number-es6object-es6string-eventlistener-eventsource-exiforientation-fetch-fileinput-filereader-filesystem-flash-flexbox-flexboxlegacy-flexboxtweener-flexwrap-fontface-forcetouch-formattribute-formvalidation-framed-fullscreen-gamepads-generatedcontent-generators-geolocation-getrandomvalues-getusermedia-hashchange-hidden-hiddenscroll-history-hsla-htmlimports-ie8compat-imgcrossorigin-indexeddb-indexeddbblob-inlinesvg-input-inputformaction-inputformenctype-inputformmethod-inputformtarget-inputtypes-intl-jpeg2000-jpegxr-json-lastchild-ligatures-localizednumber-localstorage-lowbandwidth-lowbattery-matchmedia-mathml-mediaqueries-microdata-multiplebgs-mutationobserver-notification-nthchild-objectfit-olreversed-oninput-opacity-outputelem-overflowscrolling-pagevisibility-peerconnection-performance-picture-placeholder-pointerevents-pointerlock-postmessage-preserve3d-progressbar_meter-promises-proximity-queryselector-quotamanagement-regions-requestanimationframe-requestautocomplete-rgba-ruby-sandbox-scriptasync-scriptdefer-scrollsnappoints-seamless-search-serviceworker-sessionstorage-shapes-sharedworkers-siblinggeneral-sizes-smil-speechrecognition-speechsynthesis-srcdoc-srcset-strictmode-stylescoped-subpixelfont-supports-svg-svgasimg-svgclippaths-svgfilters-svgforeignobject-target-template-templatestrings-textalignlast-textareamaxlength-textshadow-texttrackapi_track-time-todataurljpeg_todataurlpng_todataurlwebp-touchevents-transferables-typedarrays-unicode-unicoderange-unknownelements-urlparser-userdata-userselect-vibrate-video-videoautoplay-videoloop-videopreload-vml-webaudio-webgl-webglextensions-webintents-webp-webpalpha-webpanimation-webplossless_webp_lossless-websockets-websocketsbinary-websqldatabase-webworkers-willchange-wrapflow-xdomainrequest-xhr2-xhrresponsetype-xhrresponsetypearraybuffer-xhrresponsetypeblob-xhrresponsetypedocument-xhrresponsetypejson-xhrresponsetypetext-setclasses !*/
!function(window,document,undefined){function is(A,e){return typeof A===e}function testRunner(){var A,e,t,n,r,i,o;for(var d in tests)if(tests.hasOwnProperty(d)){if(A=[],e=tests[d],e.name&&(A.push(e.name.toLowerCase()),e.options&&e.options.aliases&&e.options.aliases.length))for(t=0;t<e.options.aliases.length;t++)A.push(e.options.aliases[t].toLowerCase());for(n=is(e.fn,"function")?e.fn():e.fn,r=0;r<A.length;r++)i=A[r],o=i.split("."),1===o.length?Modernizr[o[0]]=n:(!Modernizr[o[0]]||Modernizr[o[0]]instanceof Boolean||(Modernizr[o[0]]=new Boolean(Modernizr[o[0]])),Modernizr[o[0]][o[1]]=n),classes.push((n?"":"no-")+o.join("-"))}}function setClasses(A){var e=docElement.className,t=Modernizr._config.classPrefix||"";if(isSVG&&(e=e.baseVal),Modernizr._config.enableJSClass){var n=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");e=e.replace(n,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(e+=" "+t+A.join(" "+t),isSVG?docElement.className.baseVal=e:docElement.className=e)}function createElement(){return"function"!=typeof document.createElement?document.createElement(arguments[0]):isSVG?document.createElementNS.call(document,"http://www.w3.org/2000/svg",arguments[0]):document.createElement.apply(document,arguments)}function getBody(){var A=document.body;return A||(A=createElement(isSVG?"svg":"body"),A.fake=!0),A}function contains(A,e){return!!~(""+A).indexOf(e)}function roundedEquals(A,e){return A-1===e||A===e||A+1===e}function cssToDOM(A){return A.replace(/([a-z])-([a-z])/g,function(A,e,t){return e+t.toUpperCase()}).replace(/^-/,"")}function addTest(A,e){if("object"==typeof A)for(var t in A)hasOwnProp(A,t)&&addTest(t,A[t]);else{A=A.toLowerCase();var n=A.split("."),r=Modernizr[n[0]];if(2==n.length&&(r=r[n[1]]),"undefined"!=typeof r)return Modernizr;e="function"==typeof e?e():e,1==n.length?Modernizr[n[0]]=e:(!Modernizr[n[0]]||Modernizr[n[0]]instanceof Boolean||(Modernizr[n[0]]=new Boolean(Modernizr[n[0]])),Modernizr[n[0]][n[1]]=e),setClasses([(e&&0!=e?"":"no-")+n.join("-")]),Modernizr._trigger(A,e)}return Modernizr}function injectElementWithStyles(A,e,t,n){var r,i,o,d,a="modernizr",s=createElement("div"),l=getBody();if(parseInt(t,10))for(;t--;)o=createElement("div"),o.id=n?n[t]:a+(t+1),s.appendChild(o);return r=createElement("style"),r.type="text/css",r.id="s"+a,(l.fake?l:s).appendChild(r),l.appendChild(s),r.styleSheet?r.styleSheet.cssText=A:r.appendChild(document.createTextNode(A)),s.id=a,l.fake&&(l.style.background="",l.style.overflow="hidden",d=docElement.style.overflow,docElement.style.overflow="hidden",docElement.appendChild(l)),i=e(s,A),l.fake?(l.parentNode.removeChild(l),docElement.style.overflow=d,docElement.offsetHeight):s.parentNode.removeChild(s),!!i}function fnBind(A,e){return function(){return A.apply(e,arguments)}}function testDOMProps(A,e,t){var n;for(var r in A)if(A[r]in e)return t===!1?A[r]:(n=e[A[r]],is(n,"function")?fnBind(n,t||e):n);return!1}function domToCSS(A){return A.replace(/([A-Z])/g,function(A,e){return"-"+e.toLowerCase()}).replace(/^ms-/,"-ms-")}function nativeTestProps(A,e){var t=A.length;if("CSS"in window&&"supports"in window.CSS){for(;t--;)if(window.CSS.supports(domToCSS(A[t]),e))return!0;return!1}if("CSSSupportsRule"in window){for(var n=[];t--;)n.push("("+domToCSS(A[t])+":"+e+")");return n=n.join(" or "),injectElementWithStyles("@supports ("+n+") { #modernizr { position: absolute; } }",function(A){return"absolute"==getComputedStyle(A,null).position})}return undefined}function testProps(A,e,t,n){function r(){o&&(delete mStyle.style,delete mStyle.modElem)}if(n=is(n,"undefined")?!1:n,!is(t,"undefined")){var i=nativeTestProps(A,t);if(!is(i,"undefined"))return i}for(var o,d,a,s,l,c=["modernizr","tspan"];!mStyle.style;)o=!0,mStyle.modElem=createElement(c.shift()),mStyle.style=mStyle.modElem.style;for(a=A.length,d=0;a>d;d++)if(s=A[d],l=mStyle.style[s],contains(s,"-")&&(s=cssToDOM(s)),mStyle.style[s]!==undefined){if(n||is(t,"undefined"))return r(),"pfx"==e?s:!0;try{mStyle.style[s]=t}catch(u){}if(mStyle.style[s]!=l)return r(),"pfx"==e?s:!0}return r(),!1}function testPropsAll(A,e,t,n,r){var i=A.charAt(0).toUpperCase()+A.slice(1),o=(A+" "+cssomPrefixes.join(i+" ")+i).split(" ");return is(e,"string")||is(e,"undefined")?testProps(o,e,n,r):(o=(A+" "+domPrefixes.join(i+" ")+i).split(" "),testDOMProps(o,e,t))}function testAllProps(A,e,t){return testPropsAll(A,undefined,undefined,e,t)}var classes=[],tests=[],ModernizrProto={_version:"3.2.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(A,e){var t=this;setTimeout(function(){e(t[A])},0)},addTest:function(A,e,t){tests.push({name:A,fn:e,options:t})},addAsyncTest:function(A){tests.push({name:null,fn:A})}},Modernizr=function(){};Modernizr.prototype=ModernizrProto,Modernizr=new Modernizr,Modernizr.addTest("applicationcache","applicationCache"in window),Modernizr.addTest("blobconstructor",function(){try{return!!new Blob}catch(A){return!1}},{aliases:["blob-constructor"]}),Modernizr.addTest("cookies",function(){try{document.cookie="cookietest=1";var A=-1!=document.cookie.indexOf("cookietest=");return document.cookie="cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT",A}catch(e){return!1}}),Modernizr.addTest("cors","XMLHttpRequest"in window&&"withCredentials"in new XMLHttpRequest),Modernizr.addTest("customprotocolhandler",function(){if(!navigator.registerProtocolHandler)return!1;try{navigator.registerProtocolHandler("thisShouldFail")}catch(A){return A instanceof TypeError}return!1}),Modernizr.addTest("customevent","CustomEvent"in window&&"function"==typeof window.CustomEvent),Modernizr.addTest("dataview","undefined"!=typeof DataView&&"getFloat64"in DataView.prototype),Modernizr.addTest("eventlistener","addEventListener"in window),Modernizr.addTest("geolocation","geolocation"in navigator),Modernizr.addTest("history",function(){var A=navigator.userAgent;return-1===A.indexOf("Android 2.")&&-1===A.indexOf("Android 4.0")||-1===A.indexOf("Mobile Safari")||-1!==A.indexOf("Chrome")||-1!==A.indexOf("Windows Phone")?window.history&&"pushState"in window.history:!1}),Modernizr.addTest("ie8compat",!window.addEventListener&&!!document.documentMode&&7===document.documentMode),Modernizr.addTest("json","JSON"in window&&"parse"in JSON&&"stringify"in JSON),Modernizr.addTest("notification",function(){if(!window.Notification||!window.Notification.requestPermission)return!1;if("granted"===window.Notification.permission)return!0;try{new window.Notification("")}catch(A){if("TypeError"===A.name)return!1}return!0}),Modernizr.addTest("postmessage","postMessage"in window),Modernizr.addTest("queryselector","querySelector"in document&&"querySelectorAll"in document),Modernizr.addTest("serviceworker","serviceWorker"in navigator),Modernizr.addTest("svg",!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect),Modernizr.addTest("templatestrings",function(){var supports;try{eval("``"),supports=!0}catch(e){}return!!supports}),Modernizr.addTest("typedarrays","ArrayBuffer"in window),Modernizr.addTest("websockets","WebSocket"in window&&2===window.WebSocket.CLOSING),Modernizr.addTest("xdomainrequest","XDomainRequest"in window),Modernizr.addTest("webaudio",function(){var A="webkitAudioContext"in window,e="AudioContext"in window;return Modernizr._config.usePrefixes?A||e:e});var CSS=window.CSS;Modernizr.addTest("cssescape",CSS?"function"==typeof CSS.escape:!1);var newSyntax="CSS"in window&&"supports"in window.CSS,oldSyntax="supportsCSS"in window;Modernizr.addTest("supports",newSyntax||oldSyntax),Modernizr.addTest("target",function(){var A=window.document;if(!("querySelectorAll"in A))return!1;try{return A.querySelectorAll(":target"),!0}catch(e){return!1}}),Modernizr.addTest("microdata","getItems"in document),Modernizr.addTest("mutationobserver",!!window.MutationObserver||!!window.WebKitMutationObserver),Modernizr.addTest("picture","HTMLPictureElement"in window),Modernizr.addTest("es5date",function(){var A="2013-04-12T06:06:37.307Z",e=!1;try{e=!!Date.parse(A)}catch(t){}return!!(Date.now&&Date.prototype&&Date.prototype.toISOString&&Date.prototype.toJSON&&e)}),Modernizr.addTest("es5object",function(){return!!(Object.keys&&Object.create&&Object.getPrototypeOf&&Object.getOwnPropertyNames&&Object.isSealed&&Object.isFrozen&&Object.isExtensible&&Object.getOwnPropertyDescriptor&&Object.defineProperty&&Object.defineProperties&&Object.seal&&Object.freeze&&Object.preventExtensions)}),Modernizr.addTest("strictmode",function(){"use strict";return!this}()),Modernizr.addTest("es5syntax",function(){var value,obj,stringAccess,getter,setter,reservedWords,zeroWidthChars;try{return stringAccess=eval('"foobar"[3] === "b"'),getter=eval("({ get x(){ return 1 } }).x === 1"),eval("({ set x(v){ value = v; } }).x = 1"),setter=1===value,eval("obj = ({ if: 1 })"),reservedWords=1===obj["if"],zeroWidthChars=eval("_‌‍ = true"),stringAccess&&getter&&setter&&reservedWords&&zeroWidthChars}catch(ignore){return!1}});var docElement=document.documentElement;Modernizr.addTest("contextmenu","contextMenu"in docElement&&"HTMLMenuItemElement"in window),Modernizr.addTest("cssall","all"in docElement.style),Modernizr.addTest("willchange","willChange"in docElement.style),Modernizr.addTest("classlist","classList"in docElement),Modernizr.addTest("documentfragment",function(){return"createDocumentFragment"in document&&"appendChild"in docElement});var isSVG="svg"===docElement.nodeName.toLowerCase();Modernizr.addTest("audio",function(){var A=createElement("audio"),e=!1;try{(e=!!A.canPlayType)&&(e=new Boolean(e),e.ogg=A.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),e.mp3=A.canPlayType('audio/mpeg; codecs="mp3"').replace(/^no$/,""),e.opus=A.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/,""),e.wav=A.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),e.m4a=(A.canPlayType("audio/x-m4a;")||A.canPlayType("audio/aac;")).replace(/^no$/,""))}catch(t){}return e}),Modernizr.addTest("canvas",function(){var A=createElement("canvas");return!(!A.getContext||!A.getContext("2d"))}),Modernizr.addTest("canvastext",function(){return Modernizr.canvas===!1?!1:"function"==typeof createElement("canvas").getContext("2d").fillText}),Modernizr.addTest("contenteditable",function(){if("contentEditable"in docElement){var A=createElement("div");return A.contentEditable=!0,"true"===A.contentEditable}}),Modernizr.addTest("emoji",function(){if(!Modernizr.canvastext)return!1;var A=window.devicePixelRatio||1,e=12*A,t=createElement("canvas"),n=t.getContext("2d");return n.fillStyle="#f00",n.textBaseline="top",n.font="32px Arial",n.fillText("🐨",0,0),0!==n.getImageData(e,e,1,1).data[0]}),Modernizr.addTest("olreversed","reversed"in createElement("ol")),Modernizr.addTest("userdata",!!createElement("div").addBehavior),Modernizr.addTest("video",function(){var A=createElement("video"),e=!1;try{(e=!!A.canPlayType)&&(e=new Boolean(e),e.ogg=A.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),e.h264=A.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),e.webm=A.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,""),e.vp9=A.canPlayType('video/webm; codecs="vp9"').replace(/^no$/,""),e.hls=A.canPlayType('application/x-mpegURL; codecs="avc1.42E01E"').replace(/^no$/,""))}catch(t){}return e}),Modernizr.addTest("vml",function(){var A,e=createElement("div"),t=!1;return isSVG||(e.innerHTML='<v:shape id="vml_flag1" adj="1" />',A=e.firstChild,A.style.behavior="url(#default#VML)",t=A?"object"==typeof A.adj:!0),t}),Modernizr.addTest("webanimations","animate"in createElement("div")),Modernizr.addTest("webgl",function(){var A=createElement("canvas"),e="probablySupportsContext"in A?"probablySupportsContext":"supportsContext";return e in A?A[e]("webgl")||A[e]("experimental-webgl"):"WebGLRenderingContext"in window}),Modernizr.addTest("adownload",!window.externalHost&&"download"in createElement("a")),Modernizr.addTest("audioloop","loop"in createElement("audio")),Modernizr.addTest("canvasblending",function(){if(Modernizr.canvas===!1)return!1;var A=createElement("canvas").getContext("2d");try{A.globalCompositeOperation="screen"}catch(e){}return"screen"===A.globalCompositeOperation});var canvas=createElement("canvas");Modernizr.addTest("todataurljpeg",function(){return!!Modernizr.canvas&&0===canvas.toDataURL("image/jpeg").indexOf("data:image/jpeg")}),Modernizr.addTest("todataurlpng",function(){return!!Modernizr.canvas&&0===canvas.toDataURL("image/png").indexOf("data:image/png")}),Modernizr.addTest("todataurlwebp",function(){var A=!1;try{A=!!Modernizr.canvas&&0===canvas.toDataURL("image/webp").indexOf("data:image/webp")}catch(e){}return A}),Modernizr.addTest("canvaswinding",function(){if(Modernizr.canvas===!1)return!1;var A=createElement("canvas").getContext("2d");return A.rect(0,0,10,10),A.rect(2,2,6,6),A.isPointInPath(5,5,"evenodd")===!1}),Modernizr.addTest("bgpositionshorthand",function(){var A=createElement("a"),e=A.style,t="right 10px bottom 10px";return e.cssText="background-position: "+t+";",e.backgroundPosition===t}),Modernizr.addTest("multiplebgs",function(){var A=createElement("a").style;return A.cssText="background:url(https://),url(https://),red url(https://)",/(url\s*\(.*?){3}/.test(A.background)}),Modernizr.addTest("csspointerevents",function(){var A=createElement("a").style;return A.cssText="pointer-events:auto","auto"===A.pointerEvents}),Modernizr.addTest("regions",function(){if(isSVG)return!1;var A=Modernizr.prefixed("flowFrom"),e=Modernizr.prefixed("flowInto"),t=!1;if(!A||!e)return t;var n=createElement("iframe"),r=createElement("div"),i=createElement("div"),o=createElement("div"),d="modernizr_flow_for_regions_check";i.innerText="M",r.style.cssText="top: 150px; left: 150px; padding: 0px;",o.style.cssText="width: 50px; height: 50px; padding: 42px;",o.style[A]=d,r.appendChild(i),r.appendChild(o),docElement.appendChild(r);var a,s,l=i.getBoundingClientRect();return i.style[e]=d,a=i.getBoundingClientRect(),s=parseInt(a.left-l.left,10),docElement.removeChild(r),42==s?t=!0:(docElement.appendChild(n),l=n.getBoundingClientRect(),n.style[e]=d,a=n.getBoundingClientRect(),l.height>0&&l.height!==a.height&&0===a.height&&(t=!0)),i=o=r=n=undefined,t}),Modernizr.addTest("cssremunit",function(){var A=createElement("a").style;try{A.fontSize="3rem"}catch(e){}return/rem/.test(A.fontSize)}),Modernizr.addTest("rgba",function(){var A=createElement("a").style;return A.cssText="background-color:rgba(150,255,150,.5)",(""+A.backgroundColor).indexOf("rgba")>-1}),Modernizr.addTest("createelementattrs",function(){try{return"test"==createElement('<input name="test" />').getAttribute("name")}catch(A){return!1}},{aliases:["createelement-attrs"]}),Modernizr.addTest("dataset",function(){var A=createElement("div");return A.setAttribute("data-a-b","c"),!(!A.dataset||"c"!==A.dataset.aB)}),Modernizr.addTest("hidden","hidden"in createElement("a")),Modernizr.addTest("bdi",function(){var A=createElement("div"),e=createElement("bdi");e.innerHTML="&#1573;",A.appendChild(e),docElement.appendChild(A);var t="rtl"===(window.getComputedStyle?getComputedStyle(e,null):e.currentStyle).direction;return docElement.removeChild(A),t}),Modernizr.addTest("outputelem","value"in createElement("output")),Modernizr.addTest("progressbar",createElement("progress").max!==undefined),Modernizr.addTest("meter",createElement("meter").max!==undefined),Modernizr.addTest("ruby",function(){function A(A,e){var t;return window.getComputedStyle?t=document.defaultView.getComputedStyle(A,null).getPropertyValue(e):A.currentStyle&&(t=A.currentStyle[e]),t}function e(){docElement.removeChild(t),t=null,n=null,r=null}var t=createElement("ruby"),n=createElement("rt"),r=createElement("rp"),i="display",o="fontSize";return t.appendChild(r),t.appendChild(n),docElement.appendChild(t),"none"==A(r,i)||"ruby"==A(t,i)&&"ruby-text"==A(n,i)||"6pt"==A(r,o)&&"6pt"==A(n,o)?(e(),!0):(e(),!1)}),Modernizr.addTest("template","content"in createElement("template")),Modernizr.addTest("time","valueAsDate"in createElement("time")),Modernizr.addTest("unknownelements",function(){var A=createElement("a");return A.innerHTML="<xyz></xyz>",1===A.childNodes.length});var hasEvent=function(){function A(A,t){var n;return A?(t&&"string"!=typeof t||(t=createElement(t||"div")),A="on"+A,n=A in t,!n&&e&&(t.setAttribute||(t=createElement("div")),t.setAttribute(A,""),n="function"==typeof t[A],t[A]!==undefined&&(t[A]=undefined),t.removeAttribute(A)),n):!1}var e=!("onblur"in document.documentElement);return A}();ModernizrProto.hasEvent=hasEvent,Modernizr.addTest("ambientlight",hasEvent("devicelight",window)),Modernizr.addTest("hashchange",function(){return hasEvent("hashchange",window)===!1?!1:document.documentMode===undefined||document.documentMode>7}),Modernizr.addTest("inputsearchevent",hasEvent("search"));var inputElem=createElement("input"),inputattrs="autocomplete autofocus list placeholder max min multiple pattern required step".split(" "),attrs={};Modernizr.input=function(A){for(var e=0,t=A.length;t>e;e++)attrs[A[e]]=!!(A[e]in inputElem);return attrs.list&&(attrs.list=!(!createElement("datalist")||!window.HTMLDataListElement)),attrs}(inputattrs),Modernizr.addTest("datalistelem",Modernizr.input.list);var inputtypes="search tel url email datetime date month week time datetime-local number range color".split(" "),inputs={};Modernizr.inputtypes=function(A){for(var e,t,n,r=A.length,i="1)",o=0;r>o;o++)inputElem.setAttribute("type",e=A[o]),n="text"!==inputElem.type&&"style"in inputElem,n&&(inputElem.value=i,inputElem.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(e)&&inputElem.style.WebkitAppearance!==undefined?(docElement.appendChild(inputElem),t=document.defaultView,n=t.getComputedStyle&&"textfield"!==t.getComputedStyle(inputElem,null).WebkitAppearance&&0!==inputElem.offsetHeight,docElement.removeChild(inputElem)):/^(search|tel)$/.test(e)||(n=/^(url|email)$/.test(e)?inputElem.checkValidity&&inputElem.checkValidity()===!1:inputElem.value!=i)),inputs[A[o]]=!!n;return inputs}(inputtypes);var prefixes=ModernizrProto._config.usePrefixes?" -webkit- -moz- -o- -ms- ".split(" "):[];ModernizrProto._prefixes=prefixes,Modernizr.addTest("csscalc",function(){var A="width:",e="calc(10px);",t=createElement("a");return t.style.cssText=A+prefixes.join(e+A),!!t.style.length}),Modernizr.addTest("cubicbezierrange",function(){var A=createElement("a");return A.style.cssText=prefixes.join("transition-timing-function:cubic-bezier(1,0,0,1.1); "),!!A.style.length}),Modernizr.addTest("cssgradients",function(){for(var A,e="background-image:",t="gradient(linear,left top,right bottom,from(#9f9),to(white));",n="",r=0,i=prefixes.length-1;i>r;r++)A=0===r?"to ":"",n+=e+prefixes[r]+"linear-gradient("+A+"left top, #9f9, white);";Modernizr._config.usePrefixes&&(n+=e+"-webkit-"+t);var o=createElement("a"),d=o.style;return d.cssText=n,(""+d.backgroundImage).indexOf("gradient")>-1}),Modernizr.addTest("opacity",function(){var A=createElement("a").style;return A.cssText=prefixes.join("opacity:.55;"),/^0.55$/.test(A.opacity)}),Modernizr.addTest("csspositionsticky",function(){var A="position:",e="sticky",t=createElement("a"),n=t.style;return n.cssText=A+prefixes.join(e+";"+A).slice(0,-A.length),-1!==n.position.indexOf(e)});var modElem={elem:createElement("modernizr")};Modernizr._q.push(function(){delete modElem.elem}),Modernizr.addTest("csschunit",function(){var A,e=modElem.elem.style;try{e.fontSize="3ch",A=-1!==e.fontSize.indexOf("ch")}catch(t){A=!1}return A}),Modernizr.addTest("cssexunit",function(){var A,e=modElem.elem.style;try{e.fontSize="3ex",A=-1!==e.fontSize.indexOf("ex")}catch(t){A=!1}return A}),Modernizr.addTest("hsla",function(){var A=createElement("a").style;return A.cssText="background-color:hsla(120,40%,100%,.5)",contains(A.backgroundColor,"rgba")||contains(A.backgroundColor,"hsla")});var hasOwnProp;!function(){var A={}.hasOwnProperty;hasOwnProp=is(A,"undefined")||is(A.call,"undefined")?function(A,e){return e in A&&is(A.constructor.prototype[e],"undefined")}:function(e,t){return A.call(e,t)}}(),ModernizrProto._l={},ModernizrProto.on=function(A,e){this._l[A]||(this._l[A]=[]),this._l[A].push(e),Modernizr.hasOwnProperty(A)&&setTimeout(function(){Modernizr._trigger(A,Modernizr[A])},0)},ModernizrProto._trigger=function(A,e){if(this._l[A]){var t=this._l[A];setTimeout(function(){var A,n;for(A=0;A<t.length;A++)(n=t[A])(e)},0),delete this._l[A]}},Modernizr._q.push(function(){ModernizrProto.addTest=addTest}),Modernizr.addAsyncTest(function(){var A=new Image;A.onerror=function(){addTest("exiforientation",!1,{aliases:["exif-orientation"]})},A.onload=function(){addTest("exiforientation",2!==A.width,{aliases:["exif-orientation"]})},A.src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAASUkqAAgAAAABABIBAwABAAAABgASAAAAAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAIDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+/iiiigD/2Q=="}),Modernizr.addAsyncTest(function(){var A,e,t=function(A){docElement.contains(A)||docElement.appendChild(A)},n=function(A){A.fake&&A.parentNode&&A.parentNode.removeChild(A)},r=function(A,e){var t=!!A;if(t&&(t=new Boolean(t),t.blocked="blocked"===A),addTest("flash",function(){return t}),e&&s.contains(e)){for(;e.parentNode!==s;)e=e.parentNode;s.removeChild(e)}};try{e="ActiveXObject"in window&&"Pan"in new window.ActiveXObject("ShockwaveFlash.ShockwaveFlash")}catch(i){}if(A=!("plugins"in navigator&&"Shockwave Flash"in navigator.plugins||e),A||isSVG)r(!1);else{var o,d,a=createElement("embed"),s=getBody();if(a.type="application/x-shockwave-flash",s.appendChild(a),!("Pan"in a||e))return t(s),r("blocked",a),void n(s);o=function(){return t(s),docElement.contains(s)?(docElement.contains(a)?(d=a.style.cssText,""!==d?r("blocked",a):r(!0,a)):r("blocked"),void n(s)):(s=document.body||s,a=createElement("embed"),a.type="application/x-shockwave-flash",s.appendChild(a),setTimeout(o,1e3))},setTimeout(o,10)}}),addTest("htmlimports","import"in createElement("link")),Modernizr.addAsyncTest(function(){function A(){clearTimeout(e),window.removeEventListener("deviceproximity",A),addTest("proximity",!0)}var e,t=300;"ondeviceproximity"in window&&"onuserproximity"in window?(window.addEventListener("deviceproximity",A),e=setTimeout(function(){window.removeEventListener("deviceproximity",A),addTest("proximity",!1)},t)):addTest("proximity",!1)}),Modernizr.addAsyncTest(function(){function A(t){clearTimeout(e);var r=t!==undefined&&"loadeddata"===t.type?!0:!1;n.removeEventListener("loadeddata",A,!1),addTest("audiopreload",r),n.parentNode.removeChild(n)}var e,t=300,n=createElement("audio"),r=n.style;if(!(Modernizr.audio&&"preload"in n))return void addTest("audiopreload",!1);r.position="absolute",r.height=0,r.width=0;try{if(Modernizr.audio.mp3)n.src="data:audio/mpeg;base64,//MUxAAB6AXgAAAAAPP+c6nf//yi/6f3//MUxAMAAAIAAAjEcH//0fTX6C9Lf//0//MUxA4BeAIAAAAAAKX2/6zv//+IlR4f//MUxBMCMAH8AAAAABYWalVMQU1FMy45//MUxBUB0AH0AAAAADkuM1VVVVVVVVVV//MUxBgBUATowAAAAFVVVVVVVVVVVVVV";else if(Modernizr.audio.m4a)n.src="data:audio/x-m4a;base64,AAAAGGZ0eXBNNEEgAAACAGlzb21pc28yAAAACGZyZWUAAAAfbWRhdN4EAABsaWJmYWFjIDEuMjgAAAFoAQBHAAACiG1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAYAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAG0dHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAYAAAAAAAAAAAAAAAAAQAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAABUG1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAArEQAAAQAVcQAAAAAAC1oZGxyAAAAAAAAAABzb3VuAAAAAAAAAAAAAAAAU291bmRIYW5kbGVyAAAAAPttaW5mAAAAEHNtaGQAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAL9zdGJsAAAAW3N0c2QAAAAAAAAAAQAAAEttcDRhAAAAAAAAAAEAAAAAAAAAAAACABAAAAAArEQAAAAAACdlc2RzAAAAAAMZAAEABBFAFQAAAAABftAAAAAABQISCAYBAgAAABhzdHRzAAAAAAAAAAEAAAABAAAEAAAAABxzdHNjAAAAAAAAAAEAAAABAAAAAQAAAAEAAAAUc3RzegAAAAAAAAAXAAAAAQAAABRzdGNvAAAAAAAAAAEAAAAoAAAAYHVkdGEAAABYbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAraWxzdAAAACOpdG9vAAAAG2RhdGEAAAABAAAAAExhdmY1Mi42NC4y";else if(Modernizr.audio.ogg)n.src="data:audio/ogg;base64,T2dnUwACAAAAAAAAAAD/QwAAAAAAAM2LVKsBHgF2b3JiaXMAAAAAAUSsAAAAAAAAgLsAAAAAAAC4AU9nZ1MAAAAAAAAAAAAA/0MAAAEAAADmvOe6Dy3/////////////////MgN2b3JiaXMdAAAAWGlwaC5PcmcgbGliVm9yYmlzIEkgMjAwNzA2MjIAAAAAAQV2b3JiaXMfQkNWAQAAAQAYY1QpRplS0kqJGXOUMUaZYpJKiaWEFkJInXMUU6k515xrrLm1IIQQGlNQKQWZUo5SaRljkCkFmVIQS0kldBI6J51jEFtJwdaYa4tBthyEDZpSTCnElFKKQggZU4wpxZRSSkIHJXQOOuYcU45KKEG4nHOrtZaWY4updJJK5yRkTEJIKYWSSgelU05CSDWW1lIpHXNSUmpB6CCEEEK2IIQNgtCQVQAAAQDAQBAasgoAUAAAEIqhGIoChIasAgAyAAAEoCiO4iiOIzmSY0kWEBqyCgAAAgAQAADAcBRJkRTJsSRL0ixL00RRVX3VNlVV9nVd13Vd13UgNGQVAAABAEBIp5mlGiDCDGQYCA1ZBQAgAAAARijCEANCQ1YBAAABAABiKDmIJrTmfHOOg2Y5aCrF5nRwItXmSW4q5uacc845J5tzxjjnnHOKcmYxaCa05pxzEoNmKWgmtOacc57E5kFrqrTmnHPGOaeDcUYY55xzmrTmQWo21uaccxa0pjlqLsXmnHMi5eZJbS7V5pxzzjnnnHPOOeecc6oXp3NwTjjnnHOi9uZabkIX55xzPhmne3NCOOecc84555xzzjnnnHOC0JBVAAAQAABBGDaGcacgSJ+jgRhFiGnIpAfdo8MkaAxyCqlHo6ORUuoglFTGSSmdIDRkFQAACAAAIYQUUkghhRRSSCGFFFKIIYYYYsgpp5yCCiqppKKKMsoss8wyyyyzzDLrsLPOOuwwxBBDDK20EktNtdVYY62555xrDtJaaa211koppZRSSikIDVkFAIAAABAIGWSQQUYhhRRSiCGmnHLKKaigAkJDVgEAgAAAAgAAADzJc0RHdERHdERHdERHdETHczxHlERJlERJtEzL1ExPFVXVlV1b1mXd9m1hF3bd93Xf93Xj14VhWZZlWZZlWZZlWZZlWZZlWYLQkFUAAAgAAIAQQgghhRRSSCGlGGPMMeegk1BCIDRkFQAACAAgAAAAwFEcxXEkR3IkyZIsSZM0S7M8zdM8TfREURRN01RFV3RF3bRF2ZRN13RN2XRVWbVdWbZt2dZtX5Zt3/d93/d93/d93/d93/d1HQgNWQUASAAA6EiOpEiKpEiO4ziSJAGhIasAABkAAAEAKIqjOI7jSJIkSZakSZ7lWaJmaqZneqqoAqEhqwAAQAAAAQAAAAAAKJriKabiKaLiOaIjSqJlWqKmaq4om7Lruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7ruq7rui4QGrIKAJAAANCRHMmRHEmRFEmRHMkBQkNWAQAyAAACAHAMx5AUybEsS9M8zdM8TfRET/RMTxVd0QVCQ1YBAIAAAAIAAAAAADAkw1IsR3M0SZRUS7VUTbVUSxVVT1VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTVN0zRNIDRkJQAABADAYo3B5SAhJSXl3hDCEJOeMSYhtV4hBJGS3jEGFYOeMqIMct5C4xCDHggNWREARAEAAMYgxxBzyDlHqZMSOeeodJQa5xyljlJnKcWYYs0oldhSrI1zjlJHraOUYiwtdpRSjanGAgAAAhwAAAIshEJDVgQAUQAAhDFIKaQUYow5p5xDjCnnmHOGMeYcc44556B0UirnnHROSsQYc445p5xzUjonlXNOSiehAACAAAcAgAALodCQFQFAnACAQZI8T/I0UZQ0TxRFU3RdUTRd1/I81fRMU1U90VRVU1Vt2VRVWZY8zzQ901RVzzRV1VRVWTZVVZZFVdVt03V123RV3ZZt2/ddWxZ2UVVt3VRd2zdV1/Zd2fZ9WdZ1Y/I8VfVM03U903Rl1XVtW3VdXfdMU5ZN15Vl03Vt25VlXXdl2fc103Rd01Vl2XRd2XZlV7ddWfZ903WF35VlX1dlWRh2XfeFW9eV5XRd3VdlVzdWWfZ9W9eF4dZ1YZk8T1U903RdzzRdV3VdX1dd19Y105Rl03Vt2VRdWXZl2fddV9Z1zzRl2XRd2zZdV5ZdWfZ9V5Z13XRdX1dlWfhVV/Z1WdeV4dZt4Tdd1/dVWfaFV5Z14dZ1Ybl1XRg+VfV9U3aF4XRl39eF31luXTiW0XV9YZVt4VhlWTl+4ViW3feVZXRdX1ht2RhWWRaGX/id5fZ943h1XRlu3efMuu8Mx++k+8rT1W1jmX3dWWZfd47hGDq/8OOpqq+brisMpywLv+3rxrP7vrKMruv7qiwLvyrbwrHrvvP8vrAso+z6wmrLwrDatjHcvm4sv3Acy2vryjHrvlG2dXxfeArD83R1XXlmXcf2dXTjRzh+ygAAgAEHAIAAE8pAoSErAoA4AQCPJImiZFmiKFmWKIqm6LqiaLqupGmmqWmeaVqaZ5qmaaqyKZquLGmaaVqeZpqap5mmaJqua5qmrIqmKcumasqyaZqy7LqybbuubNuiacqyaZqybJqmLLuyq9uu7Oq6pFmmqXmeaWqeZ5qmasqyaZquq3meanqeaKqeKKqqaqqqraqqLFueZ5qa6KmmJ4qqaqqmrZqqKsumqtqyaaq2bKqqbbuq7Pqybeu6aaqybaqmLZuqatuu7OqyLNu6L2maaWqeZ5qa55mmaZqybJqqK1uep5qeKKqq5ommaqqqLJumqsqW55mqJ4qq6omea5qqKsumatqqaZq2bKqqLZumKsuubfu+68qybqqqbJuqauumasqybMu+78qq7oqmKcumqtqyaaqyLduy78uyrPuiacqyaaqybaqqLsuybRuzbPu6aJqybaqmLZuqKtuyLfu6LNu678qub6uqrOuyLfu67vqucOu6MLyybPuqrPq6K9u6b+sy2/Z9RNOUZVM1bdtUVVl2Zdn2Zdv2fdE0bVtVVVs2TdW2ZVn2fVm2bWE0Tdk2VVXWTdW0bVmWbWG2ZeF2Zdm3ZVv2ddeVdV/XfePXZd3murLty7Kt+6qr+rbu+8Jw667wCgAAGHAAAAgwoQwUGrISAIgCAACMYYwxCI1SzjkHoVHKOecgZM5BCCGVzDkIIZSSOQehlJQy5yCUklIIoZSUWgshlJRSawUAABQ4AAAE2KApsThAoSErAYBUAACD41iW55miatqyY0meJ4qqqaq27UiW54miaaqqbVueJ4qmqaqu6+ua54miaaqq6+q6aJqmqaqu67q6Lpqiqaqq67qyrpumqqquK7uy7Oumqqqq68quLPvCqrquK8uybevCsKqu68qybNu2b9y6ruu+7/vCka3rui78wjEMRwEA4AkOAEAFNqyOcFI0FlhoyEoAIAMAgDAGIYMQQgYhhJBSSiGllBIAADDgAAAQYEIZKDRkRQAQJwAAGEMppJRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkgppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkqppJRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoplVJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSCgCQinAAkHowoQwUGrISAEgFAACMUUopxpyDEDHmGGPQSSgpYsw5xhyUklLlHIQQUmktt8o5CCGk1FJtmXNSWosx5hgz56SkFFvNOYdSUoux5ppr7qS0VmuuNedaWqs115xzzbm0FmuuOdecc8sx15xzzjnnGHPOOeecc84FAOA0OACAHtiwOsJJ0VhgoSErAYBUAAACGaUYc8456BBSjDnnHIQQIoUYc845CCFUjDnnHHQQQqgYc8w5CCGEkDnnHIQQQgghcw466CCEEEIHHYQQQgihlM5BCCGEEEooIYQQQgghhBA6CCGEEEIIIYQQQgghhFJKCCGEEEIJoZRQAABggQMAQIANqyOcFI0FFhqyEgAAAgCAHJagUs6EQY5Bjw1BylEzDUJMOdGZYk5qMxVTkDkQnXQSGWpB2V4yCwAAgCAAIMAEEBggKPhCCIgxAABBiMwQCYVVsMCgDBoc5gHAA0SERACQmKBIu7iALgNc0MVdB0IIQhCCWBxAAQk4OOGGJ97whBucoFNU6iAAAAAAAAwA4AEA4KAAIiKaq7C4wMjQ2ODo8AgAAAAAABYA+AAAOD6AiIjmKiwuMDI0Njg6PAIAAAAAAAAAAICAgAAAAAAAQAAAAICAT2dnUwAE7AwAAAAAAAD/QwAAAgAAADuydfsFAQEBAQEACg4ODg==";else{if(!Modernizr.audio.wav)return void addTest("audiopreload",!1);n.src="data:audio/wav;base64,UklGRvwZAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YdgZAAAAAAEA/v8CAP//AAABAP////8DAPz/BAD9/wEAAAAAAAAAAAABAP7/AgD//wAAAQD//wAAAQD//wAAAQD+/wIA//8AAAAAAAD//wIA/v8BAAAA//8BAAAA//8BAP//AQAAAP//AQD//wEAAAD//wEA//8BAP//AQD//wEA//8BAP//AQD+/wMA/f8DAP3/AgD+/wIA/////wMA/f8CAP7/AgD+/wMA/f8CAP7/AgD//wAAAAAAAAAAAQD+/wIA/v8CAP7/AwD9/wIA/v8BAAEA/v8CAP7/AQAAAAAAAAD//wEAAAD//wIA/f8DAP7/AQD//wEAAAD//wEA//8CAP7/AQD//wIA/v8CAP7/AQAAAAAAAAD//wEAAAAAAAAA//8BAP//AgD9/wQA+/8FAPz/AgAAAP//AgD+/wEAAAD//wIA/v8CAP3/BAD8/wQA/P8DAP7/AwD8/wQA/P8DAP7/AQAAAAAA//8BAP//AgD+/wEAAAD//wIA/v8BAP//AQD//wEAAAD//wEA//8BAAAAAAAAAP//AgD+/wEAAAAAAAAAAAD//wEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//AgD+/wIA/v8BAP//AQABAP7/AQD//wIA/v8CAP3/AwD/////AgD9/wMA/v8BAP//AQAAAP//AQD//wEA//8BAP//AAABAP//AAABAP//AQD//wAAAAACAP3/AwD9/wIA//8BAP//AQD//wEA//8BAP//AgD9/wMA/v8AAAIA/f8CAAAA/v8EAPv/BAD9/wIAAAD+/wQA+v8HAPr/BAD+/wEAAAD//wIA/f8EAPz/BAD7/wUA/P8EAPz/AwD+/wEAAAD//wEAAAAAAP//AgD8/wUA+/8FAPz/AwD9/wIA//8AAAEA/v8CAP//AQD//wAAAAABAP//AgD9/wMA/f8EAPz/AwD+/wAAAwD7/wUA/P8DAP7/AQAAAP//AgD+/wEAAQD+/wIA/v8BAAEA/v8CAP7/AQAAAP//AgD9/wMA/f8DAP7/AgD+/wEAAAAAAAEA//8AAAEA/v8DAP3/AgD//wEA//8BAP7/AwD9/wMA/v8BAP//AQAAAP//AgD9/wMA/v8BAP//AQAAAP//AgD+/wEAAQD+/wIA/////wIA//8AAAEA/f8DAP//AAABAP////8DAP3/AwD+/wEA//8BAP//AQAAAAAA//8BAP//AQD//wEA//8BAP//AAAAAAEA//8BAP7/AgD//wEA//8AAAAAAAAAAAAAAAD//wIA/v8BAAAA//8BAAEA/v8BAAAA//8DAPz/AwD+/wIA/v8CAP3/AwD+/wEAAAD//wEA//8BAAAA//8BAAAA/v8EAPv/BAD+/wAAAAABAP7/AgD//wAAAAABAP7/AgD//wAAAAAAAAAAAAABAP3/BAD8/wQA/f8BAAAAAAABAP7/AgD+/wIA/v8CAP7/AgD+/wIA/v8BAAAAAAD//wIA/f8DAP7/AAABAP//AAACAPz/BAD9/wIA//8AAP//AwD9/wMA/P8EAP3/AwD9/wIA//8BAP//AQD+/wMA/f8DAP7/AAABAP//AQAAAP//AQD//wIA/f8DAP7/AQAAAP//AQAAAAAA//8CAP7/AQABAP7/AgD+/wEAAQD+/wIA/v8CAP////8CAP7/AgD//wAAAAABAP7/AwD9/wIAAAD+/wMA/f8CAP//AQD+/wMA/f8CAP//AAACAPz/BQD6/wUA/v///wIA/v8CAP3/BAD7/wYA+v8FAPz/AwD/////AgD+/wEAAAD//wEAAAD//wIA/f8DAP7/AQAAAP//AgD//wAA//8BAAAAAAAAAP//AQD//wEA//8AAAIA/f8DAP3/AgAAAP//AQD//wEA//8AAAEA//8BAP////8CAP//AAABAP3/BAD9/wIA/v8BAAEA//8BAP7/AgD//wEA//8AAAEA//8BAP//AAAAAAEA//8BAP7/AgD//wEA//8AAAAAAQD+/wIA/v8BAAAAAAD//wIA/v8BAAAAAAAAAAAAAQD+/wMA/f8CAP//AQD//wIA/f8DAP7/AQD//wEA//8CAP7/AAABAP7/AwD9/wMA/v8AAAEA//8BAAAAAAD//wIA/v8BAAAA//8CAP7/AgD+/wEA//8CAP7/AgD//wAAAAAAAAAAAQD//wEA/v8DAPz/BQD8/wIA//8AAAEAAAD//wEA//8BAP//AQAAAAAA//8BAP//AgD+/wEAAAAAAP//AQD+/wMA/////wEA/v8CAP//AQD//wEA//8AAAEA//8BAAAA/v8EAPz/AwD+/wEAAAAAAAAA//8CAP7/AQD//wEA//8BAP//AAABAP7/AwD9/wIA//8BAP//AQD//wEA//8AAAEA/v8EAPv/BAD9/wIA//8BAP7/AwD9/wIA//8AAAEA//8BAP//AQD//wAAAQD//wEAAAD+/wMA/v8AAAIA/f8DAP7/AQD//wAAAQD+/wMA/f8CAP//AAABAP7/AgD+/wMA/f8CAP7/AQABAP7/AgD+/wIA/v8CAP7/AwD8/wMA//8AAAEA//8AAAAAAAABAP//AQD//wAAAQD//wIA/f8DAP3/AwD+/wAAAgD9/wIA//8AAAEAAAD+/wMA/P8FAPv/BAD9/wIA//8AAP//AgD+/wIA/v8BAAAAAAD//wEAAAAAAP//AQD//wEA//8BAP//AAABAP7/AwD9/wIA//8BAP//AAABAP//AQD//wAAAQD//wEA//8BAP//AAABAAAA//8BAP7/AwD9/wMA/f8DAP3/AgD//wEA//8BAP7/AgD//wAAAgD8/wQA/f8CAP//AQD+/wMA/f8CAP7/AgD//wAAAAAAAAAAAAABAP7/AwD9/wIA/v8DAP3/AwD9/wIA/v8DAPz/BQD7/wQA/f8CAP7/AwD9/wMA/f8CAP//AQAAAP7/AwD+/wEA//8AAAEAAAAAAP//AAABAP//AQAAAP7/AwD9/wMA/f8CAP//AQD//wEA//8AAAIA/f8CAAAA//8BAAAA//8BAAAA/v8EAPv/BAD9/wIA//8AAAEA/v8CAP//AAABAP//AAABAP//AAABAP7/AwD8/wQA/f8CAAAA/v8DAP3/AwD9/wMA/v8BAAAA//8BAAAA//8CAP7/AQAAAAAAAAAAAAAA//8CAP7/AgD+/wIA/v8CAP7/AgD//wAAAQD//wAAAQD//wAAAQD//wAAAQD+/wIA//8AAAAAAQD+/wMA/f8CAP//AQD//wEA//8AAAEA/v8DAP3/AgD//wAAAAABAP7/AwD9/wIA//8AAAEA/v8DAP3/AgD//wAAAAABAP7/AwD8/wMA/v8CAP//AAD//wIA/v8CAP7/AQABAP7/AQAAAP//AgD/////AQD//wEAAAD//wEA/v8EAPv/BAD9/wMA/v8BAAAA//8BAAEA/P8GAPr/BQD8/wMA/v8BAAAA//8CAP7/AQABAP3/BAD7/wYA+/8EAPz/AwD//wEA//8BAP7/BAD8/wMA/v8AAAIA/v8BAAAA//8BAAAA//8BAAAA//8CAP3/AwD+/wAAAgD8/wUA/P8DAP7/AAABAAAAAAD//wEAAAD//wIA/f8DAP7/AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAEA/f8EAPz/AwD/////AgD+/wIA/f8DAP7/AgD+/wEA//8CAP7/AQD//wEAAAAAAP//AQAAAP//AgD9/wMA/v8BAAAA//8BAP//AQAAAP//AAACAP3/BAD7/wQA/v8BAAAA//8BAP//AQAAAP//AQAAAP7/BAD7/wUA+/8EAP3/AgD//wAAAQD+/wIA//8AAAEA/v8CAP//AQD+/wEAAAAAAAAAAAD//wEA//8CAP3/AwD9/wIA//8AAAAAAAAAAAAA//8BAP//AgD+/wEA//8CAP7/AQAAAP//AgD/////AgD/////AgD+/wIA//8AAP//AQABAP7/AgD9/wMA/v8CAP////8BAAAAAAAAAAAA//8CAP////8DAPz/AwD+/wEAAAAAAP//AQD//wEAAAD//wEAAAD+/wQA+/8FAPz/AgAAAP//AgD9/wMA/v8BAAAAAAD//wEAAAD//wIA/v8BAAAAAAD//wIA/v8BAAAA//8BAAAA//8CAP7/AQD//wEA//8BAAAA//8BAP//AAABAP//AQAAAP7/AgD//wEA//8AAAAAAQD+/wMA/P8EAP7///8DAPz/BQD8/wEAAQD+/wMA/v8AAAEA//8BAP//AQD//wEA/v8CAP//AQD//wAAAAABAAAA//8BAP//AQAAAAAA//8BAP//AgD+/wAAAQD//wIA/f8CAP//AQAAAP7/AwD9/wMA/v8BAP//AAABAP//AgD9/wIA//8BAAAA//8BAAAA//8CAP3/AwD+/wEAAAD+/wQA/P8DAP7/AAACAP7/AQAAAP//AQAAAP//AQAAAP//AgD9/wIAAAD//wIA/f8DAP7/AQD//wEA//8CAP7/AQD//wAAAQD//wEA//8AAAAAAQD//wEAAAD9/wUA+/8FAPz/AgD//wAAAQD//wAAAQD+/wMA/f8BAAEA/v8CAP7/AgD+/wIA/v8BAAAAAAAAAAAAAAD//wIA/v8CAP////8CAP7/AgD+/wIA/v8CAP7/AQAAAP//AQAAAP//AQD//wAAAQD//wAAAQD+/wMA/f8CAAAA/v8DAP3/AgAAAP//AQAAAP7/AwD9/wMA/v8BAP//AQD//wEAAAD+/wMA/f8CAAAA/v8CAP//AAAAAAEA//8AAAEA/v8DAP3/AwD9/wIA//8BAP//AgD8/wQA/v8BAAAA/v8CAP//AQD//wAAAAAAAAEA/f8EAPz/BAD9/wIA//8AAAAAAAABAP//AAAAAAAAAAABAP3/BAD9/wIA/v8BAAEA//8AAAAA//8CAP7/AgD9/wQA+/8FAPv/BQD8/wMA/f8DAP3/AwD+/wAAAgD9/wMA/f8CAAAA/v8EAPv/BQD7/wUA/P8DAP///v8DAP3/BAD8/wMA/f8DAP7/AQD//wEAAAD//wEA/v8CAAAA/v8CAP7/AgD//wAAAAAAAAAAAQD+/wIA//8AAAEA/v8DAPz/BAD9/wIA//8AAP//AgD//wEA/v8BAAAAAQD//wAAAAAAAAEA//8AAAEA//8BAP//AAABAP//AQD+/wIA/v8DAPz/BAD8/wQA/f8BAAAAAQD+/wMA/P8DAP//AAAAAAAAAAD//wMA+/8FAP3/AQABAP3/BAD8/wMA/v8BAAAA//8CAP3/AwD+/wEAAQD9/wMA/f8EAPz/BAD7/wQA/v8BAAEA/f8DAP7/AQAAAP//AgD+/wEAAAD//wIA/v8CAP7/AgD+/wEAAQD//wEA/v8CAP7/BAD7/wQA/f8CAAAA//8AAAAAAAABAP//AQD+/wEAAQD+/wMA/f8BAAEA/v8DAPz/AwD/////AwD8/wQA/P8DAP7/AgD//wAA//8BAAAAAAAAAP//AgD+/wEAAAD//wIA/v8BAAAA//8CAP3/AgD//wAAAQD+/wIA/v8BAAAA//8CAP7/AgD+/wEA//8CAP3/BAD7/wQA/v8BAAAA//8AAAEAAAD//wIA/f8DAP7/AgD+/wIA/v8CAP7/AgD+/wEAAAAAAP//AgD9/wMA/v8BAP//AgD9/wMA/v8AAAEA//8BAP//AQD//wEA//8AAAEA/v8EAPz/AgD//wAAAQAAAP//AAABAP//AQD//wEAAAD//wEA//8BAAEA/f8DAP7/AQABAP3/AwD+/wIA/////wEAAAAAAAAAAAD//wIA/v8CAP////8CAP7/AgD//wAA//8CAP3/BAD9/wAAAgD9/wMA/v8BAP//AQAAAP//AQAAAP//AgD9/wMA/f8EAPz/AwD+/wEAAAAAAAAAAAD//wIA/f8EAP3/AAABAAAA//8CAP7/AQAAAP//AQAAAAAA//8BAP//AQAAAP//AQAAAP//AQAAAP//AgD9/wMA/v8BAP//AQAAAP//AQD//wIA/v8CAP3/BAD9/wEAAAD//wEAAQD9/wMA/f8CAAAA/v8DAP3/AgD//wAAAQD+/wIA/v8CAP7/AQAAAP//AgD+/wEAAAAAAP//AwD7/wUA/f8BAAEA/v8BAAEA/v8DAP3/AgD//wEA//8BAP//AQD//wEA//8CAP3/BAD7/wQA/////wIA/v8AAAIA/v8CAP3/BAD7/wUA/P8DAP3/AwD9/wMA/v8AAAIA/v8CAP7/AgD+/wIA//8AAAEA/v8CAP7/AgD//wAAAAD//wEAAAAAAAAA//8BAP7/BAD7/wUA/P8CAAAA//8BAP//AQAAAP//AgD9/wMA/v8BAAAA//8BAAAA//8CAP3/AwD+/wEA//8CAP3/AwD+/wAAAwD8/wIAAAD//wIA/////wIA/v8CAP7/AgD+/wEAAAAAAAAAAAAAAP//AgD+/wIA//8AAAAA//8CAP7/AgD+/wEA//8CAP3/AwD9/wMA/v8BAP7/AwD9/wMA/f8CAP//AQD+/wIA//8BAP//AQD+/wMA/v8BAAAA//8BAAAA//8CAP7/AQAAAP//AgD+/wIA/v8CAP//AAAAAAEA//8BAP//AAABAAAA//8BAP//AQD//wEA//8BAP//AQAAAP//AQD//wEAAAD//wIA/f8CAAAA//8BAAAA//8BAP//AAABAP//AQD//wAAAAAAAAEA/v8CAP//AQD//wAAAAABAP7/AwD9/wIAAAD+/wIA//8BAP//AgD9/wMA/f8DAP7/AgD+/wEAAAAAAAEA/v8CAP7/AgD//wAAAAAAAAAAAAAAAP//AgD/////AgD9/wQA/f8BAAAAAAAAAAEA/f8DAP////8DAP3/AQABAP7/AgD//wAAAQD+/wMA/f8CAP7/AQABAP7/AwD7/wYA+v8FAP3/AQABAP7/AgD+/wMA/f8CAP7/AwD+/wEA//8BAP//AQAAAP7/BQD5/wcA+v8FAPz/AwD+/wIA/v8BAAAA//8DAPv/BQD8/wMA/////wEAAAAAAAAAAAD//wIA/f8DAP7/AQAAAP//AQAAAP//AgD+/wIA/v8BAAEA/f8EAPz/AwD+/wEA//8CAP7/AQD//wEA//8CAP7/AQAAAP//AgD+/wEAAAAAAAAAAAAAAAAAAAD//wIA/f8EAPz/AwD+/wEA//8CAP7/AgD+/wEAAQD+/wEAAQD+/wIA/////wIA//8AAAAAAAAAAAAAAAD//wEAAAAAAP//AgD9/wMA/v8BAP//AQAAAP//AQD//wEA//8BAP//AQD//wEA//8BAP//AQAAAP7/AwD9/wMA/v8BAP7/AwD9/wMA/v8BAP//AAABAP//AQD//wAAAAABAP//AAAAAAAAAQD//wEA/v8CAAAA/v8EAPv/BAD9/wIAAAD+/wMA/P8DAP//AAAAAP//AQD//wIA/f8DAP3/AwD9/wMA/v8BAAAA//8BAAAA//8CAP3/AwD9/wQA+/8FAPv/BQD8/wMA/v8BAAAA//8BAP//AgD+/wEAAAD//wIA/v8BAAEA/f8DAP3/AgAAAP//AQD//wAAAQD//wEA//8BAP//AQD//wEA/v8DAP3/AgAAAP7/AwD9/wIAAAD//wEAAAD//wIA/f8DAP7/AgD9/wQA+/8FAPz/AgAAAP//AgD9/wIA//8BAP//AQD//wEA//8BAP//AQD//wIA/f8DAP3/AgD//wAAAQD+/wIA/v8BAAEA/v8CAP7/AgD+/wMA/P8DAP//AAABAP7/AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEA/v8CAP3/BAD8/wMA/v8BAAAAAAD//wEAAAAAAAAAAAD//wEAAAAAAAAA//8BAP//AgD+/wEA//8CAP3/AwD9/wMA/f8EAPv/BAD+/wAAAQD//wEA//8BAP//AAABAP//AQD//wEAAAD//wEA//8BAP//AgD9/wMA/v8AAAIA/f8DAP7/AAACAP3/AwD+/wEA//8BAP//AQAAAP//AQAAAP7/AwD9/wMA/v8AAAEA//8BAP//AAAAAAEA//8AAAEA/v8CAP//AAAAAAEA/v8DAPz/BAD9/wEAAQD+/wEAAQD9/wQA/P8DAP7/AQAAAAAAAAAAAAAAAAAAAAAAAQD+/wIA/////wIA/v8BAAAA//8BAP//AQD//wEA//8BAAAA/v8EAPz/AwD///7/BAD8/wMA/////wIA/v8CAP////8CAP7/AgD+/wIA/v8CAP////8CAP7/AwD9/wIA/v8CAP//AAABAP7/AwD9/wEAAQD+/wMA/f8CAP//AAAAAAEA/v8DAPz/BAD9/wIA/v8CAP7/AgD//wAAAAD//wIA/v8CAP7/AQAAAAAA//8CAP7/AgD+/wIA/v8CAP7/AwD8/wUA+v8GAPv/AwD//wAAAAAAAAAA//8DAPv/BQD9/wAAAgD9/wMA/v8BAP//AQAAAP//AgD9/wMA/v8BAAAA//8BAAAAAAAAAP//AQAAAAAAAAD//wEA//8CAP3/AwD+/wAAAgD+/wEAAAD//wIA/v8CAP7/AgD/////AwD8/wUA/P8CAP//AQD//wIA/f8DAP3/AwD+/wAAAQD+/wMA/f8DAP3/AgD//wAAAQD//wEA//8BAP7/AwD+/wEA//8AAAEA//8CAPz/BAD9/wIA//8AAAEA/v8DAPz/BAD9/wIA//8AAAEA/v8CAP7/AgD//wEA/f8EAPz/BAD+////AgD//wAAAQD//wAAAQD//wEA//8BAP7/AwD+/wEA";
}}catch(i){return void addTest("audiopreload",!1)}n.setAttribute("preload","auto"),n.style.cssText="display:none",docElement.appendChild(n),setTimeout(function(){n.addEventListener("loadeddata",A,!1),e=setTimeout(A,t)},0)});var testStyles=ModernizrProto.testStyles=injectElementWithStyles;Modernizr.addTest("hiddenscroll",function(){return testStyles("#modernizr {width:100px;height:100px;overflow:scroll}",function(A){return A.offsetWidth===A.clientWidth})}),Modernizr.addTest("mathml",function(){var A;return testStyles("#modernizr{position:absolute;display:inline-block}",function(e){e.innerHTML+="<math><mfrac><mi>xx</mi><mi>yy</mi></mfrac></math>",A=e.offsetHeight>e.offsetWidth}),A}),Modernizr.addTest("touchevents",function(){var A;if("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)A=!0;else{var e=["@media (",prefixes.join("touch-enabled),("),"heartz",")","{#modernizr{top:9px;position:absolute}}"].join("");testStyles(e,function(e){A=9===e.offsetTop})}return A}),Modernizr.addTest("unicoderange",function(){return Modernizr.testStyles('@font-face{font-family:"unicodeRange";src:local("Arial");unicode-range:U+0020,U+002E}#modernizr span{font-size:20px;display:inline-block;font-family:"unicodeRange",monospace}#modernizr .mono{font-family:monospace}',function(A){for(var e=[".",".","m","m"],t=0;t<e.length;t++){var n=createElement("span");n.innerHTML=e[t],n.className=t%2?"mono":"",A.appendChild(n),e[t]=n.clientWidth}return e[0]!==e[1]&&e[2]===e[3]})}),Modernizr.addTest("unicode",function(){var A,e=createElement("span"),t=createElement("span");return testStyles("#modernizr{font-family:Arial,sans;font-size:300em;}",function(n){e.innerHTML=isSVG?"妇":"&#5987",t.innerHTML=isSVG?"☆":"&#9734",n.appendChild(e),n.appendChild(t),A="offsetWidth"in e&&e.offsetWidth!==t.offsetWidth}),A}),Modernizr.addTest("checked",function(){return testStyles("#modernizr {position:absolute} #modernizr input {margin-left:10px} #modernizr :checked {margin-left:20px;display:block}",function(A){var e=createElement("input");return e.setAttribute("type","checkbox"),e.setAttribute("checked","checked"),A.appendChild(e),20===e.offsetLeft})}),testStyles("#modernizr{display: table; direction: ltr}#modernizr div{display: table-cell; padding: 10px}",function(A){var e,t=A.childNodes;e=t[0].offsetLeft<t[1].offsetLeft,Modernizr.addTest("displaytable",e,{aliases:["display-table"]})},2);var blacklist=function(){var A=navigator.userAgent,e=A.match(/applewebkit\/([0-9]+)/gi)&&parseFloat(RegExp.$1),t=A.match(/w(eb)?osbrowser/gi),n=A.match(/windows phone/gi)&&A.match(/iemobile\/([0-9])+/gi)&&parseFloat(RegExp.$1)>=9,r=533>e&&A.match(/android/gi);return t||r||n}();blacklist?Modernizr.addTest("fontface",!1):testStyles('@font-face {font-family:"font";src:url("https://")}',function(A,e){var t=document.getElementById("smodernizr"),n=t.sheet||t.styleSheet,r=n?n.cssRules&&n.cssRules[0]?n.cssRules[0].cssText:n.cssText||"":"",i=/src/i.test(r)&&0===r.indexOf(e.split(" ")[0]);Modernizr.addTest("fontface",i)}),testStyles('#modernizr{font:0/0 a}#modernizr:after{content:":)";visibility:hidden;font:7px/1 a}',function(A){Modernizr.addTest("generatedcontent",A.offsetHeight>=7)}),Modernizr.addTest("hairline",function(){return testStyles("#modernizr {border:.5px solid transparent}",function(A){return 1===A.offsetHeight})}),Modernizr.addTest("cssinvalid",function(){return testStyles("#modernizr input{height:0;border:0;padding:0;margin:0;width:10px} #modernizr input:invalid{width:50px}",function(A){var e=createElement("input");return e.required=!0,A.appendChild(e),e.clientWidth>10})}),testStyles("#modernizr div {width:100px} #modernizr :last-child{width:200px;display:block}",function(A){Modernizr.addTest("lastchild",A.lastChild.offsetWidth>A.firstChild.offsetWidth)},2),testStyles("#modernizr div {width:1px} #modernizr div:nth-child(2n) {width:2px;}",function(A){for(var e=A.getElementsByTagName("div"),t=!0,n=0;5>n;n++)t=t&&e[n].offsetWidth===n%2+1;Modernizr.addTest("nthchild",t)},5),testStyles("#modernizr{overflow: scroll; width: 40px; height: 40px; }#"+prefixes.join("scrollbar{width:0px} #modernizr::").split("#").slice(1).join("#")+"scrollbar{width:0px}",function(A){Modernizr.addTest("cssscrollbar",40==A.scrollWidth)}),Modernizr.addTest("siblinggeneral",function(){return testStyles("#modernizr div {width:100px} #modernizr div ~ div {width:200px;display:block}",function(A){return 200==A.lastChild.offsetWidth},2)}),testStyles("#modernizr{position: absolute; top: -10em; visibility:hidden; font: normal 10px arial;}#subpixel{float: left; font-size: 33.3333%;}",function(A){var e=A.firstChild;e.innerHTML="This is a text written in Arial",Modernizr.addTest("subpixelfont",window.getComputedStyle?"44px"!==window.getComputedStyle(e,null).getPropertyValue("width"):!1)},1,["subpixel"]),Modernizr.addTest("cssvalid",function(){return testStyles("#modernizr input{height:0;border:0;padding:0;margin:0;width:10px} #modernizr input:valid{width:50px}",function(A){var e=createElement("input");return A.appendChild(e),e.clientWidth>10})}),testStyles("#modernizr { height: 50vh; }",function(A){var e=parseInt(window.innerHeight/2,10),t=parseInt((window.getComputedStyle?getComputedStyle(A,null):A.currentStyle).height,10);Modernizr.addTest("cssvhunit",t==e)}),testStyles("#modernizr1{width: 50vmax}#modernizr2{width:50px;height:50px;overflow:scroll}#modernizr3{position:fixed;top:0;left:0;bottom:0;right:0}",function(A){var e=A.childNodes[2],t=A.childNodes[1],n=A.childNodes[0],r=parseInt((t.offsetWidth-t.clientWidth)/2,10),i=n.clientWidth/100,o=n.clientHeight/100,d=parseInt(50*Math.max(i,o),10),a=parseInt((window.getComputedStyle?getComputedStyle(e,null):e.currentStyle).width,10);Modernizr.addTest("cssvmaxunit",roundedEquals(d,a)||roundedEquals(d,a-r))},3),testStyles("#modernizr1{width: 50vm;width:50vmin}#modernizr2{width:50px;height:50px;overflow:scroll}#modernizr3{position:fixed;top:0;left:0;bottom:0;right:0}",function(A){var e=A.childNodes[2],t=A.childNodes[1],n=A.childNodes[0],r=parseInt((t.offsetWidth-t.clientWidth)/2,10),i=n.clientWidth/100,o=n.clientHeight/100,d=parseInt(50*Math.min(i,o),10),a=parseInt((window.getComputedStyle?getComputedStyle(e,null):e.currentStyle).width,10);Modernizr.addTest("cssvminunit",roundedEquals(d,a)||roundedEquals(d,a-r))},3),testStyles("#modernizr { width: 50vw; }",function(A){var e=parseInt(window.innerWidth/2,10),t=parseInt((window.getComputedStyle?getComputedStyle(A,null):A.currentStyle).width,10);Modernizr.addTest("cssvwunit",t==e)}),Modernizr.addTest("details",function(){var A,e=createElement("details");return"open"in e?(testStyles("#modernizr details{display:block}",function(t){t.appendChild(e),e.innerHTML="<summary>a</summary>b",A=e.offsetHeight,e.open=!0,A=A!=e.offsetHeight}),A):!1});var mq=function(){var A=window.matchMedia||window.msMatchMedia;return A?function(e){var t=A(e);return t&&t.matches||!1}:function(A){var e=!1;return injectElementWithStyles("@media "+A+" { #modernizr { position: absolute; } }",function(A){e="absolute"==(window.getComputedStyle?window.getComputedStyle(A,null):A.currentStyle).position}),e}}();ModernizrProto.mq=mq,Modernizr.addTest("mediaqueries",mq("only all"));var omPrefixes="Moz O ms Webkit",domPrefixes=ModernizrProto._config.usePrefixes?omPrefixes.toLowerCase().split(" "):[];ModernizrProto._domPrefixes=domPrefixes,Modernizr.addTest("pointerevents",function(){var A=!1,e=domPrefixes.length;for(A=Modernizr.hasEvent("pointerdown");e--&&!A;)hasEvent(domPrefixes[e]+"pointerdown")&&(A=!0);return A});var cssomPrefixes=ModernizrProto._config.usePrefixes?omPrefixes.split(" "):[];ModernizrProto._cssomPrefixes=cssomPrefixes;var atRule=function(A){var e,t=prefixes.length,n=window.CSSRule;if("undefined"==typeof n)return undefined;if(!A)return!1;if(A=A.replace(/^@/,""),e=A.replace(/-/g,"_").toUpperCase()+"_RULE",e in n)return"@"+A;for(var r=0;t>r;r++){var i=prefixes[r],o=i.toUpperCase()+"_"+e;if(o in n)return"@-"+i.toLowerCase()+"-"+A}return!1};ModernizrProto.atRule=atRule;var mStyle={style:modElem.elem.style};Modernizr._q.unshift(function(){delete mStyle.style});var testProp=ModernizrProto.testProp=function(A,e,t){return testProps([A],undefined,e,t)};Modernizr.addTest("textshadow",testProp("textShadow","1px 1px")),ModernizrProto.testAllProps=testPropsAll;var prefixed=ModernizrProto.prefixed=function(A,e,t){return 0===A.indexOf("@")?atRule(A):(-1!=A.indexOf("-")&&(A=cssToDOM(A)),e?testPropsAll(A,e,t):testPropsAll(A,"pfx"))};Modernizr.addTest("batteryapi",!!prefixed("battery",navigator),{aliases:["battery-api"]});var crypto=prefixed("crypto",window);Modernizr.addTest("crypto",!!prefixed("subtle",crypto)),Modernizr.addTest("dart",!!prefixed("startDart",navigator)),Modernizr.addTest("forcetouch",function(){return hasEvent(prefixed("mouseforcewillbegin",window,!1),window)?MouseEvent.WEBKIT_FORCE_AT_MOUSE_DOWN&&MouseEvent.WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN:!1}),Modernizr.addTest("fullscreen",!(!prefixed("exitFullscreen",document,!1)&&!prefixed("cancelFullScreen",document,!1))),Modernizr.addTest("gamepads",!!prefixed("getGamepads",navigator));var indexeddb=prefixed("indexedDB",window);Modernizr.addTest("indexeddb",!!indexeddb),indexeddb&&Modernizr.addTest("indexeddb.deletedatabase","deleteDatabase"in indexeddb),Modernizr.addAsyncTest(function(){var A,e,t=prefixed("indexedDB",window),n="detect-blob-support",r=!1;if(!Modernizr.indexeddb||!Modernizr.indexeddb.deleteDatabase)return!1;try{t.deleteDatabase(n).onsuccess=function(){A=t.open(n,1),A.onupgradeneeded=function(){A.result.createObjectStore("store")},A.onsuccess=function(){e=A.result;try{e.transaction("store","readwrite").objectStore("store").put(new Blob,"key"),r=!0}catch(i){r=!1}finally{addTest("indexeddbblob",r),e.close(),t.deleteDatabase(n)}}}}catch(i){addTest("indexeddbblob",!1)}}),Modernizr.addTest("intl",!!prefixed("Intl",window)),Modernizr.addTest("pagevisibility",!!prefixed("hidden",document,!1)),Modernizr.addTest("performance",!!prefixed("performance",window)),Modernizr.addTest("pointerlock",!!prefixed("exitPointerLock",document)),Modernizr.addTest("quotamanagement",function(){var A=prefixed("temporaryStorage",navigator),e=prefixed("persistentStorage",navigator);return!(!A||!e)}),Modernizr.addTest("requestanimationframe",!!prefixed("requestAnimationFrame",window),{aliases:["raf"]}),Modernizr.addTest("vibrate",!!prefixed("vibrate",navigator)),Modernizr.addTest("webintents",!!prefixed("startActivity",navigator)),Modernizr.addTest("lowbattery",function(){var A=.2,e=prefixed("battery",navigator);return!!(e&&!e.charging&&e.level<=A)});var crypto=prefixed("crypto",window),supportsGetRandomValues;if(crypto&&"getRandomValues"in crypto&&"Uint32Array"in window){var array=new Uint32Array(10),values=crypto.getRandomValues(array);supportsGetRandomValues=values&&is(values[0],"number")}Modernizr.addTest("getrandomvalues",!!supportsGetRandomValues),Modernizr.addTest("backgroundblendmode",prefixed("backgroundBlendMode","text")),Modernizr.addTest("objectfit",!!prefixed("objectFit"),{aliases:["object-fit"]}),Modernizr.addTest("wrapflow",function(){var A=prefixed("wrapFlow");if(!A||isSVG)return!1;var e=A.replace(/([A-Z])/g,function(A,e){return"-"+e.toLowerCase()}).replace(/^ms-/,"-ms-"),t=createElement("div"),n=createElement("div"),r=createElement("span");n.style.cssText="position: absolute; left: 50px; width: 100px; height: 20px;"+e+":end;",r.innerText="X",t.appendChild(n),t.appendChild(r),docElement.appendChild(t);var i=r.offsetLeft;return docElement.removeChild(t),n=r=t=undefined,150==i}),ModernizrProto.testAllProps=testAllProps,Modernizr.addTest("ligatures",testAllProps("fontFeatureSettings",'"liga" 1')),Modernizr.addTest("cssanimations",testAllProps("animationName","a",!0)),Modernizr.addTest("csspseudoanimations",function(){var A=!1;if(!Modernizr.cssanimations||!window.getComputedStyle)return A;var e=["@",Modernizr._prefixes.join("keyframes csspseudoanimations { from { font-size: 10px; } }@").replace(/\@$/,""),'#modernizr:before { content:" "; font-size:5px;',Modernizr._prefixes.join("animation:csspseudoanimations 1ms infinite;"),"}"].join("");return Modernizr.testStyles(e,function(e){A="10px"===window.getComputedStyle(e,":before").getPropertyValue("font-size")}),A}),Modernizr.addTest("appearance",testAllProps("appearance")),Modernizr.addTest("backdropfilter",testAllProps("backdropFilter")),Modernizr.addTest("backgroundcliptext",function(){return testAllProps("backgroundClip","text")}),Modernizr.addTest("bgpositionxy",function(){return testAllProps("backgroundPositionX","3px",!0)&&testAllProps("backgroundPositionY","5px",!0)}),Modernizr.addTest("bgrepeatround",testAllProps("backgroundRepeat","round")),Modernizr.addTest("bgrepeatspace",testAllProps("backgroundRepeat","space")),Modernizr.addTest("backgroundsize",testAllProps("backgroundSize","100%",!0)),Modernizr.addTest("bgsizecover",testAllProps("backgroundSize","cover")),Modernizr.addTest("borderimage",testAllProps("borderImage","url() 1",!0)),Modernizr.addTest("borderradius",testAllProps("borderRadius","0px",!0)),Modernizr.addTest("boxshadow",testAllProps("boxShadow","1px 1px",!0)),Modernizr.addTest("boxsizing",testAllProps("boxSizing","border-box",!0)&&(document.documentMode===undefined||document.documentMode>7)),function(){Modernizr.addTest("csscolumns",function(){var A=!1,e=testAllProps("columnCount");try{(A=!!e)&&(A=new Boolean(A))}catch(t){}return A});for(var A,e,t=["Width","Span","Fill","Gap","Rule","RuleColor","RuleStyle","RuleWidth","BreakBefore","BreakAfter","BreakInside"],n=0;n<t.length;n++)A=t[n].toLowerCase(),e=testAllProps("column"+t[n]),("breakbefore"===A||"breakafter"===A||"breakinside"==A)&&(e=e||testAllProps(t[n])),Modernizr.addTest("csscolumns."+A,e)}(),Modernizr.addTest("displayrunin",testAllProps("display","run-in"),{aliases:["display-runin"]}),Modernizr.addTest("ellipsis",testAllProps("textOverflow","ellipsis")),Modernizr.addTest("cssfilters",function(){if(Modernizr.supports)return testAllProps("filter","blur(2px)");var A=createElement("a");return A.style.cssText=prefixes.join("filter:blur(2px); "),!!A.style.length&&(document.documentMode===undefined||document.documentMode>9)}),Modernizr.addTest("flexbox",testAllProps("flexBasis","1px",!0)),Modernizr.addTest("flexboxlegacy",testAllProps("boxDirection","reverse",!0)),Modernizr.addTest("flexboxtweener",testAllProps("flexAlign","end",!0)),Modernizr.addTest("flexwrap",testAllProps("flexWrap","wrap",!0)),Modernizr.addAsyncTest(function(){function A(){function t(){try{var A=createElement("div"),e=createElement("span"),t=A.style,n=0,r=0,i=!1,o=document.body.firstElementChild||document.body.firstChild;return A.appendChild(e),e.innerHTML="Bacon ipsum dolor sit amet jerky velit in culpa hamburger et. Laborum dolor proident, enim dolore duis commodo et strip steak. Salami anim et, veniam consectetur dolore qui tenderloin jowl velit sirloin. Et ad culpa, fatback cillum jowl ball tip ham hock nulla short ribs pariatur aute. Pig pancetta ham bresaola, ut boudin nostrud commodo flank esse cow tongue culpa. Pork belly bresaola enim pig, ea consectetur nisi. Fugiat officia turkey, ea cow jowl pariatur ullamco proident do laborum velit sausage. Magna biltong sint tri-tip commodo sed bacon, esse proident aliquip. Ullamco ham sint fugiat, velit in enim sed mollit nulla cow ut adipisicing nostrud consectetur. Proident dolore beef ribs, laborum nostrud meatball ea laboris rump cupidatat labore culpa. Shankle minim beef, velit sint cupidatat fugiat tenderloin pig et ball tip. Ut cow fatback salami, bacon ball tip et in shank strip steak bresaola. In ut pork belly sed mollit tri-tip magna culpa veniam, short ribs qui in andouille ham consequat. Dolore bacon t-bone, velit short ribs enim strip steak nulla. Voluptate labore ut, biltong swine irure jerky. Cupidatat excepteur aliquip salami dolore. Ball tip strip steak in pork dolor. Ad in esse biltong. Dolore tenderloin exercitation ad pork loin t-bone, dolore in chicken ball tip qui pig. Ut culpa tongue, sint ribeye dolore ex shank voluptate hamburger. Jowl et tempor, boudin pork chop labore ham hock drumstick consectetur tri-tip elit swine meatball chicken ground round. Proident shankle mollit dolore. Shoulder ut duis t-bone quis reprehenderit. Meatloaf dolore minim strip steak, laboris ea aute bacon beef ribs elit shank in veniam drumstick qui. Ex laboris meatball cow tongue pork belly. Ea ball tip reprehenderit pig, sed fatback boudin dolore flank aliquip laboris eu quis. Beef ribs duis beef, cow corned beef adipisicing commodo nisi deserunt exercitation. Cillum dolor t-bone spare ribs, ham hock est sirloin. Brisket irure meatloaf in, boudin pork belly sirloin ball tip. Sirloin sint irure nisi nostrud aliqua. Nostrud nulla aute, enim officia culpa ham hock. Aliqua reprehenderit dolore sunt nostrud sausage, ea boudin pork loin ut t-bone ham tempor. Tri-tip et pancetta drumstick laborum. Ham hock magna do nostrud in proident. Ex ground round fatback, venison non ribeye in.",document.body.insertBefore(A,o),t.cssText="position:absolute;top:0;left:0;width:5em;text-align:justify;text-justification:newspaper;",n=e.offsetHeight,r=e.offsetWidth,t.cssText="position:absolute;top:0;left:0;width:5em;text-align:justify;text-justification:newspaper;"+prefixes.join("hyphens:auto; "),i=e.offsetHeight!=n||e.offsetWidth!=r,document.body.removeChild(A),A.removeChild(e),i}catch(d){return!1}}function n(A,e){try{var t=createElement("div"),n=createElement("span"),r=t.style,i=0,o=!1,d=!1,a=!1,s=document.body.firstElementChild||document.body.firstChild;return r.cssText="position:absolute;top:0;left:0;overflow:visible;width:1.25em;",t.appendChild(n),document.body.insertBefore(t,s),n.innerHTML="mm",i=n.offsetHeight,n.innerHTML="m"+A+"m",d=n.offsetHeight>i,e?(n.innerHTML="m<br />m",i=n.offsetWidth,n.innerHTML="m"+A+"m",a=n.offsetWidth>i):a=!0,d===!0&&a===!0&&(o=!0),document.body.removeChild(t),t.removeChild(n),o}catch(l){return!1}}function r(A){try{var e,t=createElement("input"),n=createElement("div"),r="lebowski",i=!1,o=document.body.firstElementChild||document.body.firstChild;n.innerHTML=r+A+r,document.body.insertBefore(n,o),document.body.insertBefore(t,n),t.setSelectionRange?(t.focus(),t.setSelectionRange(0,0)):t.createTextRange&&(e=t.createTextRange(),e.collapse(!0),e.moveEnd("character",0),e.moveStart("character",0),e.select());try{window.find?i=window.find(r+r):(e=window.self.document.body.createTextRange(),i=e.findText(r+r))}catch(d){i=!1}return document.body.removeChild(n),document.body.removeChild(t),i}catch(d){return!1}}return document.body||document.getElementsByTagName("body")[0]?(addTest("csshyphens",function(){if(!testAllProps("hyphens","auto",!0))return!1;try{return t()}catch(A){return!1}}),addTest("softhyphens",function(){try{return n("&#173;",!0)&&n("&#8203;",!1)}catch(A){return!1}}),void addTest("softhyphensfind",function(){try{return r("&#173;")&&r("&#8203;")}catch(A){return!1}})):void setTimeout(A,e)}var e=300;setTimeout(A,e)}),Modernizr.addTest("cssmask",testAllProps("maskRepeat","repeat-x",!0)),Modernizr.addTest("overflowscrolling",testAllProps("overflowScrolling","touch",!0)),Modernizr.addTest("cssreflections",testAllProps("boxReflect","above",!0)),Modernizr.addTest("cssresize",testAllProps("resize","both",!0)),Modernizr.addTest("scrollsnappoints",testAllProps("scrollSnapType")),Modernizr.addTest("shapes",testAllProps("shapeOutside","content-box",!0)),Modernizr.addTest("textalignlast",testAllProps("textAlignLast")),Modernizr.addTest("csstransforms",function(){return-1===navigator.userAgent.indexOf("Android 2.")&&testAllProps("transform","scale(1)",!0)}),Modernizr.addTest("csstransforms3d",function(){var A=!!testAllProps("perspective","1px",!0),e=Modernizr._config.usePrefixes;if(A&&(!e||"webkitPerspective"in docElement.style)){var t,n="#modernizr{width:0;height:0}";Modernizr.supports?t="@supports (perspective: 1px)":(t="@media (transform-3d)",e&&(t+=",(-webkit-transform-3d)")),t+="{#modernizr{width:7px;height:18px;margin:0;padding:0;border:0}}",testStyles(n+t,function(e){A=7===e.offsetWidth&&18===e.offsetHeight})}return A}),Modernizr.addTest("preserve3d",testAllProps("transformStyle","preserve-3d")),Modernizr.addTest("csstransitions",testAllProps("transition","all",!0)),Modernizr.addTest("csspseudotransitions",function(){var A=!1;if(!Modernizr.csstransitions||!window.getComputedStyle)return A;var e='#modernizr:before { content:" "; font-size:5px;'+Modernizr._prefixes.join("transition:0s 100s;")+"}#modernizr.trigger:before { font-size:10px; }";return Modernizr.testStyles(e,function(e){window.getComputedStyle(e,":before").getPropertyValue("font-size"),e.className+="trigger",A="5px"===window.getComputedStyle(e,":before").getPropertyValue("font-size")}),A}),Modernizr.addTest("userselect",testAllProps("userSelect","none",!0)),Modernizr.addTest("texttrackapi","function"==typeof createElement("video").addTextTrack),Modernizr.addTest("track","kind"in createElement("track")),Modernizr.addTest("es5array",function(){return!!(Array.prototype&&Array.prototype.every&&Array.prototype.filter&&Array.prototype.forEach&&Array.prototype.indexOf&&Array.prototype.lastIndexOf&&Array.prototype.map&&Array.prototype.some&&Array.prototype.reduce&&Array.prototype.reduceRight&&Array.isArray)}),Modernizr.addTest("es5function",function(){return!(!Function.prototype||!Function.prototype.bind)}),Modernizr.addTest("es5string",function(){return!(!String.prototype||!String.prototype.trim)}),Modernizr.addTest("es5undefined",function(){var A,e;try{e=window.undefined,window.undefined=12345,A="undefined"==typeof window.undefined,window.undefined=e}catch(t){return!1}return A}),Modernizr.addTest("es5",function(){return!!(Modernizr.es5array&&Modernizr.es5date&&Modernizr.es5function&&Modernizr.es5object&&Modernizr.strictmode&&Modernizr.es5string&&Modernizr.json&&Modernizr.es5syntax&&Modernizr.es5undefined)}),Modernizr.addTest("es6array",!!(Array.prototype&&Array.prototype.copyWithin&&Array.prototype.fill&&Array.prototype.find&&Array.prototype.findIndex&&Array.prototype.keys&&Array.prototype.entries&&Array.prototype.values&&Array.from&&Array.of)),Modernizr.addTest("es6collections",!!(window.Map&&window.Set&&window.WeakMap&&window.WeakSet)),Modernizr.addTest("contains",is(String.prototype.contains,"function")),Modernizr.addTest("generators",function(){try{new Function("function* test() {}")()}catch(A){return!1}return!0}),Modernizr.addTest("es6math",!!(Math&&Math.clz32&&Math.cbrt&&Math.imul&&Math.sign&&Math.log10&&Math.log2&&Math.log1p&&Math.expm1&&Math.cosh&&Math.sinh&&Math.tanh&&Math.acosh&&Math.asinh&&Math.atanh&&Math.hypot&&Math.trunc&&Math.fround)),Modernizr.addTest("es6number",!!(Number.isFinite&&Number.isInteger&&Number.isSafeInteger&&Number.isNaN&&Number.parseInt&&Number.parseFloat&&Number.isInteger(Number.MAX_SAFE_INTEGER)&&Number.isInteger(Number.MIN_SAFE_INTEGER)&&Number.isFinite(Number.EPSILON))),Modernizr.addTest("es6object",!!(Object.assign&&Object.is&&Object.setPrototypeOf)),Modernizr.addTest("promises",function(){return"Promise"in window&&"resolve"in window.Promise&&"reject"in window.Promise&&"all"in window.Promise&&"race"in window.Promise&&function(){var A;return new window.Promise(function(e){A=e}),"function"==typeof A}()}),Modernizr.addTest("es6string",!!(String.fromCodePoint&&String.raw&&String.prototype.codePointAt&&String.prototype.repeat&&String.prototype.startsWith&&String.prototype.endsWith&&String.prototype.contains)),Modernizr.addTest("devicemotion","DeviceMotionEvent"in window),Modernizr.addTest("deviceorientation","DeviceOrientationEvent"in window),Modernizr.addTest("oninput",function(){var A,e=createElement("input");if(e.setAttribute("oninput","return"),hasEvent("oninput",docElement)||"function"==typeof e.oninput)return!0;try{var t=document.createEvent("KeyboardEvent");A=!1;var n=function(e){A=!0,e.preventDefault(),e.stopPropagation()};t.initKeyEvent("keypress",!0,!0,window,!1,!1,!1,!1,0,"e".charCodeAt(0)),docElement.appendChild(e),e.addEventListener("input",n,!1),e.focus(),e.dispatchEvent(t),e.removeEventListener("input",n,!1),docElement.removeChild(e)}catch(r){A=!1}return A}),Modernizr.addTest("filereader",!!(window.File&&window.FileList&&window.FileReader)),Modernizr.addTest("filesystem",!!prefixed("requestFileSystem",window)),Modernizr.addTest("capture","capture"in createElement("input")),Modernizr.addTest("fileinput",function(){if(navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/))return!1;var A=createElement("input");return A.type="file",!A.disabled}),Modernizr.addTest("fileinputdirectory",function(){var A=createElement("input"),e="directory";if(A.type="file",e in A)return!0;for(var t=0,n=domPrefixes.length;n>t;t++)if(domPrefixes[t]+e in A)return!0;return!1}),Modernizr.addTest("formattribute",function(){var A,e=createElement("form"),t=createElement("input"),n=createElement("div"),r="formtest"+(new Date).getTime(),i=!1;e.id=r;try{t.setAttribute("form",r)}catch(o){document.createAttribute&&(A=document.createAttribute("form"),A.nodeValue=r,t.setAttributeNode(A))}return n.appendChild(e),n.appendChild(t),docElement.appendChild(n),i=e.elements&&1===e.elements.length&&t.form==e,n.parentNode.removeChild(n),i}),Modernizr.addTest("placeholder","placeholder"in createElement("input")&&"placeholder"in createElement("textarea")),Modernizr.addTest("requestautocomplete",!!prefixed("requestAutocomplete",createElement("form"))),Modernizr.addTest("formvalidation",function(){var A=createElement("form");if(!("checkValidity"in A&&"addEventListener"in A))return!1;if("reportValidity"in A)return!0;var e,t=!1;return Modernizr.formvalidationapi=!0,A.addEventListener("submit",function(A){(!window.opera||window.operamini)&&A.preventDefault(),A.stopPropagation()},!1),A.innerHTML='<input name="modTest" required><button></button>',testStyles("#modernizr form{position:absolute;top:-99999em}",function(n){n.appendChild(A),e=A.getElementsByTagName("input")[0],e.addEventListener("invalid",function(A){t=!0,A.preventDefault(),A.stopPropagation()},!1),Modernizr.formvalidationmessage=!!e.validationMessage,A.getElementsByTagName("button")[0].click()}),t}),Modernizr.addTest("localizednumber",function(){if(!Modernizr.inputtypes.number)return!1;if(!Modernizr.formvalidation)return!1;var A,e=createElement("div"),t=getBody(),n=function(){return docElement.insertBefore(t,docElement.firstElementChild||docElement.firstChild)}();e.innerHTML='<input type="number" value="1.0" step="0.1"/>';var r=e.childNodes[0];n.appendChild(e),r.focus();try{document.execCommand("InsertText",!1,"1,1")}catch(i){}return A="number"===r.type&&1.1===r.valueAsNumber&&r.checkValidity(),n.removeChild(e),t.fake&&n.parentNode.removeChild(n),A}),Modernizr.addTest("sandbox","sandbox"in createElement("iframe")),Modernizr.addTest("seamless","seamless"in createElement("iframe")),Modernizr.addTest("srcdoc","srcdoc"in createElement("iframe")),Modernizr.addAsyncTest(function(){if(!Modernizr.canvas)return!1;var A=new Image,e=createElement("canvas"),t=e.getContext("2d");A.onload=function(){addTest("apng",function(){return"undefined"==typeof e.getContext?!1:(t.drawImage(A,0,0),0===t.getImageData(0,0,1,1).data[3])})},A.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACGFjVEwAAAABAAAAAcMq2TYAAAANSURBVAiZY2BgYPgPAAEEAQB9ssjfAAAAGmZjVEwAAAAAAAAAAQAAAAEAAAAAAAAAAAD6A+gBAbNU+2sAAAARZmRBVAAAAAEImWNgYGBgAAAABQAB6MzFdgAAAABJRU5ErkJggg=="}),Modernizr.addTest("imgcrossorigin","crossOrigin"in createElement("img")),Modernizr.addAsyncTest(function(){var A=new Image;A.onload=A.onerror=function(){addTest("jpeg2000",1==A.width)},A.src="data:image/jp2;base64,/0//UQAyAAAAAAABAAAAAgAAAAAAAAAAAAAABAAAAAQAAAAAAAAAAAAEBwEBBwEBBwEBBwEB/1IADAAAAAEAAAQEAAH/XAAEQED/ZAAlAAFDcmVhdGVkIGJ5IE9wZW5KUEVHIHZlcnNpb24gMi4wLjD/kAAKAAAAAABYAAH/UwAJAQAABAQAAf9dAAUBQED/UwAJAgAABAQAAf9dAAUCQED/UwAJAwAABAQAAf9dAAUDQED/k8+kEAGvz6QQAa/PpBABr994EAk//9k="}),Modernizr.addAsyncTest(function(){var A=new Image;A.onload=A.onerror=function(){addTest("jpegxr",1==A.width,{aliases:["jpeg-xr"]})},A.src="data:image/vnd.ms-photo;base64,SUm8AQgAAAAFAAG8AQAQAAAASgAAAIC8BAABAAAAAQAAAIG8BAABAAAAAQAAAMC8BAABAAAAWgAAAMG8BAABAAAAHwAAAAAAAAAkw91vA07+S7GFPXd2jckNV01QSE9UTwAZAYBxAAAAABP/gAAEb/8AAQAAAQAAAA=="}),Modernizr.addAsyncTest(function(){var A,e,t,n=createElement("img"),r="sizes"in n;!r&&"srcset"in n?(e="data:image/gif;base64,R0lGODlhAgABAPAAAP///wAAACH5BAAAAAAALAAAAAACAAEAAAICBAoAOw==",A="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",t=function(){addTest("sizes",2==n.width)},n.onload=t,n.onerror=t,n.setAttribute("sizes","9px"),n.srcset=A+" 1w,"+e+" 8w",n.src=A):addTest("sizes",r)}),Modernizr.addTest("srcset","srcset"in createElement("img")),Modernizr.addAsyncTest(function(){var A=new Image;A.onerror=function(){addTest("webpalpha",!1,{aliases:["webp-alpha"]})},A.onload=function(){addTest("webpalpha",1==A.width,{aliases:["webp-alpha"]})},A.src="data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA=="}),Modernizr.addAsyncTest(function(){var A=new Image;A.onerror=function(){addTest("webpanimation",!1,{aliases:["webp-animation"]})},A.onload=function(){addTest("webpanimation",1==A.width,{aliases:["webp-animation"]})},A.src="data:image/webp;base64,UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"}),Modernizr.addAsyncTest(function(){var A=new Image;A.onerror=function(){addTest("webplossless",!1,{aliases:["webp-lossless"]})},A.onload=function(){addTest("webplossless",1==A.width,{aliases:["webp-lossless"]})},A.src="data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="}),Modernizr.addAsyncTest(function(){function A(A,e,t){function n(e){var n=e&&"load"===e.type?1==r.width:!1,i="webp"===A;addTest(A,i?new Boolean(n):n),t&&t(e)}var r=new Image;r.onerror=n,r.onload=n,r.src=e}var e=[{uri:"data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",name:"webp"},{uri:"data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==",name:"webp.alpha"},{uri:"data:image/webp;base64,UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA",name:"webp.animation"},{uri:"data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=",name:"webp.lossless"}],t=e.shift();A(t.name,t.uri,function(t){if(t&&"load"===t.type)for(var n=0;n<e.length;n++)A(e[n].name,e[n].uri)})}),Modernizr.addTest("inputformaction",!!("formAction"in createElement("input")),{aliases:["input-formaction"]}),Modernizr.addTest("inputformenctype",!!("formEnctype"in createElement("input")),{aliases:["input-formenctype"]}),Modernizr.addTest("inputformmethod",!!("formMethod"in createElement("input"))),Modernizr.addTest("inputformtarget",!!("formtarget"in createElement("input")),{aliases:["input-formtarget"]}),Modernizr.addTest("beacon","sendBeacon"in navigator),Modernizr.addTest("lowbandwidth",function(){var A=navigator.connection||{type:0};return 3==A.type||4==A.type||/^[23]g$/.test(A.type)}),Modernizr.addTest("eventsource","EventSource"in window),Modernizr.addTest("fetch","fetch"in window),Modernizr.addTest("xhrresponsetype",function(){if("undefined"==typeof XMLHttpRequest)return!1;var A=new XMLHttpRequest;return A.open("get","/",!0),"response"in A}()),Modernizr.addTest("xhr2","XMLHttpRequest"in window&&"withCredentials"in new XMLHttpRequest),Modernizr.addTest("scriptasync","async"in createElement("script")),Modernizr.addTest("speechsynthesis","SpeechSynthesisUtterance"in window),Modernizr.addTest("localstorage",function(){var A="modernizr";try{return localStorage.setItem(A,A),localStorage.removeItem(A),!0}catch(e){return!1}}),Modernizr.addTest("sessionstorage",function(){var A="modernizr";try{return sessionStorage.setItem(A,A),sessionStorage.removeItem(A),
!0}catch(e){return!1}}),Modernizr.addTest("scriptdefer","defer"in createElement("script")),Modernizr.addTest("speechrecognition",!!prefixed("SpeechRecognition",window)),Modernizr.addTest("websqldatabase","openDatabase"in window),Modernizr.addTest("svgfilters",function(){var A=!1;try{A="SVGFEColorMatrixElement"in window&&2==SVGFEColorMatrixElement.SVG_FECOLORMATRIX_TYPE_SATURATE}catch(e){}return A}),Modernizr.addTest("stylescoped","scoped"in createElement("style")),Modernizr.addTest("svgasimg",document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image","1.1")),Modernizr.addTest("textareamaxlength",!!("maxLength"in createElement("textarea"))),Modernizr.addTest("inlinesvg",function(){var A=createElement("div");return A.innerHTML="<svg/>","http://www.w3.org/2000/svg"==("undefined"!=typeof SVGRect&&A.firstChild&&A.firstChild.namespaceURI)});var url=prefixed("URL",window,!1);url=url&&window[url],Modernizr.addTest("bloburls",url&&"revokeObjectURL"in url&&"createObjectURL"in url),Modernizr.addAsyncTest(function(){function A(){var A=new Image;A.onerror=function(){addTest("datauri",!0),Modernizr.datauri=new Boolean(!0),Modernizr.datauri.over32kb=!1},A.onload=function(){addTest("datauri",!0),Modernizr.datauri=new Boolean(!0),Modernizr.datauri.over32kb=1==A.width&&1==A.height};for(var e="R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";e.length<33e3;)e="\r\n"+e;A.src="data:image/gif;base64,"+e}-1!==navigator.userAgent.indexOf("MSIE 7.")&&setTimeout(function(){addTest("datauri",!1)},10);var e=new Image;e.onerror=function(){addTest("datauri",!1)},e.onload=function(){1==e.width&&1==e.height?A():addTest("datauri",!1)},e.src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="}),Modernizr.addTest("urlparser",function(){var A;try{return A=new URL("http://modernizr.com/"),"http://modernizr.com/"===A.href}catch(e){return!1}}),Modernizr.addAsyncTest(function(){function A(t){clearTimeout(e),n.removeEventListener("playing",A,!1),addTest("videoautoplay",t&&"playing"===t.type||0!==n.currentTime),n.parentNode.removeChild(n)}var e,t=300,n=createElement("video"),r=n.style;if(!(Modernizr.video&&"autoplay"in n))return void addTest("videoautoplay",!1);r.position="absolute",r.height=0,r.width=0;try{if(Modernizr.video.ogg)n.src="data:video/ogg;base64,T2dnUwACAAAAAAAAAABmnCATAAAAAHDEixYBKoB0aGVvcmEDAgEAAQABAAAQAAAQAAAAAAAFAAAAAQAAAAAAAAAAAGIAYE9nZ1MAAAAAAAAAAAAAZpwgEwEAAAACrA7TDlj///////////////+QgXRoZW9yYSsAAABYaXBoLk9yZyBsaWJ0aGVvcmEgMS4xIDIwMDkwODIyIChUaHVzbmVsZGEpAQAAABoAAABFTkNPREVSPWZmbXBlZzJ0aGVvcmEtMC4yOYJ0aGVvcmG+zSj3uc1rGLWpSUoQc5zmMYxSlKQhCDGMYhCEIQhAAAAAAAAAAAAAEW2uU2eSyPxWEvx4OVts5ir1aKtUKBMpJFoQ/nk5m41mUwl4slUpk4kkghkIfDwdjgajQYC8VioUCQRiIQh8PBwMhgLBQIg4FRba5TZ5LI/FYS/Hg5W2zmKvVoq1QoEykkWhD+eTmbjWZTCXiyVSmTiSSCGQh8PB2OBqNBgLxWKhQJBGIhCHw8HAyGAsFAiDgUCw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDAwPEhQUFQ0NDhESFRUUDg4PEhQVFRUOEBETFBUVFRARFBUVFRUVEhMUFRUVFRUUFRUVFRUVFRUVFRUVFRUVEAwLEBQZGxwNDQ4SFRwcGw4NEBQZHBwcDhATFhsdHRwRExkcHB4eHRQYGxwdHh4dGxwdHR4eHh4dHR0dHh4eHRALChAYKDM9DAwOExo6PDcODRAYKDlFOA4RFh0zV1A+EhYlOkRtZ00YIzdAUWhxXDFATldneXhlSFxfYnBkZ2MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEhIVGRoaGhoSFBYaGhoaGhUWGRoaGhoaGRoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhESFh8kJCQkEhQYIiQkJCQWGCEkJCQkJB8iJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQREhgvY2NjYxIVGkJjY2NjGBo4Y2NjY2MvQmNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRISEhUXGBkbEhIVFxgZGxwSFRcYGRscHRUXGBkbHB0dFxgZGxwdHR0YGRscHR0dHhkbHB0dHR4eGxwdHR0eHh4REREUFxocIBERFBcaHCAiERQXGhwgIiUUFxocICIlJRcaHCAiJSUlGhwgIiUlJSkcICIlJSUpKiAiJSUlKSoqEBAQFBgcICgQEBQYHCAoMBAUGBwgKDBAFBgcICgwQEAYHCAoMEBAQBwgKDBAQEBgICgwQEBAYIAoMEBAQGCAgAfF5cdH1e3Ow/L66wGmYnfIUbwdUTe3LMRbqON8B+5RJEvcGxkvrVUjTMrsXYhAnIwe0dTJfOYbWrDYyqUrz7dw/JO4hpmV2LsQQvkUeGq1BsZLx+cu5iV0e0eScJ91VIQYrmqfdVSK7GgjOU0oPaPOu5IcDK1mNvnD+K8LwS87f8Jx2mHtHnUkTGAurWZlNQa74ZLSFH9oF6FPGxzLsjQO5Qe0edcpttd7BXBSqMCL4k/4tFrHIPuEQ7m1/uIWkbDMWVoDdOSuRQ9286kvVUlQjzOE6VrNguN4oRXYGkgcnih7t13/9kxvLYKQezwLTrO44sVmMPgMqORo1E0sm1/9SludkcWHwfJwTSybR4LeAz6ugWVgRaY8mV/9SluQmtHrzsBtRF/wPY+X0JuYTs+ltgrXAmlk10xQHmTu9VSIAk1+vcvU4ml2oNzrNhEtQ3CysNP8UeR35wqpKUBdGdZMSjX4WVi8nJpdpHnbhzEIdx7mwf6W1FKAiucMXrWUWVjyRf23chNtR9mIzDoT/6ZLYailAjhFlZuvPtSeZ+2oREubDoWmT3TguY+JHPdRVSLKxfKH3vgNqJ/9emeEYikGXDFNzaLjvTeGAL61mogOoeG3y6oU4rW55ydoj0lUTSR/mmRhPmF86uwIfzp3FtiufQCmppaHDlGE0r2iTzXIw3zBq5hvaTldjG4CPb9wdxAme0SyedVKczJ9AtYbgPOzYKJvZZImsN7ecrxWZg5dR6ZLj/j4qpWsIA+vYwE+Tca9ounMIsrXMB4Stiib2SPQtZv+FVIpfEbzv8ncZoLBXc3YBqTG1HsskTTotZOYTG+oVUjLk6zhP8bg4RhMUNtfZdO7FdpBuXzhJ5Fh8IKlJG7wtD9ik8rWOJxy6iQ3NwzBpQ219mlyv+FLicYs2iJGSE0u2txzed++D61ZWCiHD/cZdQVCqkO2gJpdpNaObhnDfAPrT89RxdWFZ5hO3MseBSIlANppdZNIV/Rwe5eLTDvkfWKzFnH+QJ7m9QWV1KdwnuIwTNtZdJMoXBf74OhRnh2t+OTGL+AVUnIkyYY+QG7g9itHXyF3OIygG2s2kud679ZWKqSFa9n3IHD6MeLv1lZ0XyduRhiDRtrNnKoyiFVLcBm0ba5Yy3fQkDh4XsFE34isVpOzpa9nR8iCpS4HoxG2rJpnRhf3YboVa1PcRouh5LIJv/uQcPNd095ickTaiGBnWLKVWRc0OnYTSyex/n2FofEPnDG8y3PztHrzOLK1xo6RAml2k9owKajOC0Wr4D5x+3nA0UEhK2m198wuBHF3zlWWVKWLN1CHzLClUfuoYBcx4b1llpeBKmbayaR58njtE9onD66lUcsg0Spm2snsb+8HaJRn4dYcLbCuBuYwziB8/5U1C1DOOz2gZjSZtrLJk6vrLF3hwY4Io9xuT/ruUFRSBkNtUzTOWhjh26irLEPx4jPZL3Fo3QrReoGTTM21xYTT9oFdhTUIvjqTkfkvt0bzgVUjq/hOYY8j60IaO/0AzRBtqkTS6R5ellZd5uKdzzhb8BFlDdAcrwkE0rbXTOPB+7Y0FlZO96qFL4Ykg21StJs8qIW7h16H5hGiv8V2Cflau7QVDepTAHa6Lgt6feiEvJDM21StJsmOH/hynURrKxvUpQ8BH0JF7BiyG2qZpnL/7AOU66gt+reLEXY8pVOCQvSsBtqZTNM8bk9ohRcwD18o/WVkbvrceVKRb9I59IEKysjBeTMmmbA21xu/6iHadLRxuIzkLpi8wZYmmbbWi32RVAUjruxWlJ//iFxE38FI9hNKOoCdhwf5fDe4xZ81lgREhK2m1j78vW1CqkuMu/AjBNK210kzRUX/B+69cMMUG5bYrIeZxVSEZISmkzbXOi9yxwIfPgdsov7R71xuJ7rFcACjG/9PzApqFq7wEgzNJm2suWESPuwrQvejj7cbnQxMkxpm21lUYJL0fKmogPPqywn7e3FvB/FCNxPJ85iVUkCE9/tLKx31G4CgNtWTTPFhMvlu8G4/TrgaZttTChljfNJGgOT2X6EqpETy2tYd9cCBI4lIXJ1/3uVUllZEJz4baqGF64yxaZ+zPLYwde8Uqn1oKANtUrSaTOPHkhvuQP3bBlEJ/LFe4pqQOHUI8T8q7AXx3fLVBgSCVpMba55YxN3rv8U1Dv51bAPSOLlZWebkL8vSMGI21lJmmeVxPRwFlZF1CpqCN8uLwymaZyjbXHCRytogPN3o/n74CNykfT+qqRv5AQlHcRxYrC5KvGmbbUwmZY/29BvF6C1/93x4WVglXDLFpmbapmF89HKTogRwqqSlGbu+oiAkcWFbklC6Zhf+NtTLFpn8oWz+HsNRVSgIxZWON+yVyJlE5tq/+GWLTMutYX9ekTySEQPLVNQQ3OfycwJBM0zNtZcse7CvcKI0V/zh16Dr9OSA21MpmmcrHC+6pTAPHPwoit3LHHqs7jhFNRD6W8+EBGoSEoaZttTCZljfduH/fFisn+dRBGAZYtMzbVMwvul/T/crK1NQh8gN0SRRa9cOux6clC0/mDLFpmbarmF8/e6CopeOLCNW6S/IUUg3jJIYiAcDoMcGeRbOvuTPjXR/tyo79LK3kqqkbxkkMRAOB0GODPItnX3Jnxro/25Ud+llbyVVSN4ySGIgHA6DHBnkWzr7kz410f7cqO/Syt5KqpFVJwn6gBEvBM0zNtZcpGOEPiysW8vvRd2R0f7gtjhqUvXL+gWVwHm4XJDBiMpmmZtrLfPwd/IugP5+fKVSysH1EXreFAcEhelGmbbUmZY4Xdo1vQWVnK19P4RuEnbf0gQnR+lDCZlivNM22t1ESmopPIgfT0duOfQrsjgG4tPxli0zJmF5trdL1JDUIUT1ZXSqQDeR4B8mX3TrRro/2McGeUvLtwo6jIEKMkCUXWsLyZROd9P/rFYNtXPBli0z398iVUlVKAjFlY437JXImUTm2r/4ZYtMy61hf16RPJIU9nZ1MABAwAAAAAAAAAZpwgEwIAAABhp658BScAAAAAAADnUFBQXIDGXLhwtttNHDhw5OcpQRMETBEwRPduylKVB0HRdF0A";else{if(!Modernizr.video.h264)return void addTest("videoautoplay",!1);n.src="data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAs1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjYwMSBhMGNkN2QzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuZQQAAAu5tb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAAZAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACGHRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAAZAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAgAAAAIAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAGQAAAAAAAEAAAAAAZBtZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAACgAAAAEAFXEAAAAAAAtaGRscgAAAAAAAAAAdmlkZQAAAAAAAAAAAAAAAFZpZGVvSGFuZGxlcgAAAAE7bWluZgAAABR2bWhkAAAAAQAAAAAAAAAAAAAAJGRpbmYAAAAcZHJlZgAAAAAAAAABAAAADHVybCAAAAABAAAA+3N0YmwAAACXc3RzZAAAAAAAAAABAAAAh2F2YzEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAgACAEgAAABIAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY//8AAAAxYXZjQwFkAAr/4QAYZ2QACqzZX4iIhAAAAwAEAAADAFA8SJZYAQAGaOvjyyLAAAAAGHN0dHMAAAAAAAAAAQAAAAEAAAQAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAsUAAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU2LjQwLjEwMQ=="}}catch(i){return void addTest("videoautoplay",!1)}n.setAttribute("autoplay",""),n.style.cssText="display:none",docElement.appendChild(n),setTimeout(function(){n.addEventListener("playing",A,!1),e=setTimeout(A,t)},0)}),Modernizr.addTest("videoloop","loop"in createElement("video")),Modernizr.addAsyncTest(function(){if(Modernizr.webglextensions=new Boolean(!1),Modernizr.webgl){var A,e,t;try{A=createElement("canvas"),e=A.getContext("webgl")||A.getContext("experimental-webgl"),t=e.getSupportedExtensions()}catch(n){return}e!==undefined&&(Modernizr.webglextensions=new Boolean(!0));for(var r=-1,i=t.length;++r<i;)Modernizr.webglextensions[t[r]]=!0;A=undefined}}),Modernizr.addTest("getusermedia",!!prefixed("getUserMedia",navigator)),Modernizr.addTest("videopreload","preload"in createElement("video")),Modernizr.addTest("peerconnection",!!prefixed("RTCPeerConnection",window)),Modernizr.addTest("datachannel",function(){if(!Modernizr.peerconnection)return!1;for(var A=0,e=domPrefixes.length;e>A;A++){var t=window[domPrefixes[A]+"RTCPeerConnection"];if(t){var n=new t({iceServers:[{url:"stun:0"}]});return"createDataChannel"in n}}return!1}),Modernizr.addTest("websocketsbinary",function(){var A,e="https:"==location.protocol?"wss":"ws";if("WebSocket"in window){if(A="binaryType"in WebSocket.prototype)return A;try{return!!new WebSocket(e+"://.").binaryType}catch(t){}}return!1}),Modernizr.addTest("atobbtoa","atob"in window&&"btoa"in window,{aliases:["atob-btoa"]}),Modernizr.addTest("framed",window.location!=top.location),Modernizr.addTest("matchmedia",!!prefixed("matchMedia",window)),Modernizr.addAsyncTest(function(){function A(){addTest("blobworkers",!1),e()}function e(){d&&n.revokeObjectURL(d),o&&o.terminate(),a&&clearTimeout(a)}try{var t=window.BlobBuilder,n=window.URL;Modernizr._config.usePrefix&&(t=t||window.MozBlobBuilder||window.WebKitBlobBuilder||window.MSBlobBuilder||window.OBlobBuilder,n=n||window.MozURL||window.webkitURL||window.MSURL||window.OURL);var r,i,o,d,a,s="Modernizr",l="this.onmessage=function(e){postMessage(e.data)}";try{r=new Blob([l],{type:"text/javascript"})}catch(c){}r||(i=new t,i.append(l),r=i.getBlob()),d=n.createObjectURL(r),o=new Worker(d),o.onmessage=function(A){addTest("blobworkers",s===A.data),e()},o.onerror=A,a=setTimeout(A,200),o.postMessage(s)}catch(c){A()}}),Modernizr.addAsyncTest(function(){try{var A="Modernizr",e=new Worker("data:text/javascript;base64,dGhpcy5vbm1lc3NhZ2U9ZnVuY3Rpb24oZSl7cG9zdE1lc3NhZ2UoZS5kYXRhKX0=");e.onmessage=function(t){e.terminate(),addTest("dataworkers",A===t.data),e=null},e.onerror=function(){addTest("dataworkers",!1),e=null},setTimeout(function(){addTest("dataworkers",!1)},200),e.postMessage(A)}catch(t){setTimeout(function(){addTest("dataworkers",!1)},0)}}),Modernizr.addTest("sharedworkers","SharedWorker"in window);var toStringFn={}.toString;Modernizr.addTest("svgclippaths",function(){return!!document.createElementNS&&/SVGClipPath/.test(toStringFn.call(document.createElementNS("http://www.w3.org/2000/svg","clipPath")))}),Modernizr.addTest("svgforeignobject",function(){return!!document.createElementNS&&/SVGForeignObject/.test(toStringFn.call(document.createElementNS("http://www.w3.org/2000/svg","foreignObject")))}),Modernizr.addTest("smil",function(){return!!document.createElementNS&&/SVGAnimate/.test(toStringFn.call(document.createElementNS("http://www.w3.org/2000/svg","animate")))});var testXhrType=function(A){if("undefined"==typeof XMLHttpRequest)return!1;var e=new XMLHttpRequest;e.open("get","/",!0);try{e.responseType=A}catch(t){return!1}return"response"in e&&e.responseType==A};Modernizr.addTest("xhrresponsetypearraybuffer",testXhrType("arraybuffer")),Modernizr.addTest("xhrresponsetypeblob",testXhrType("blob")),Modernizr.addTest("xhrresponsetypedocument",testXhrType("document")),Modernizr.addTest("xhrresponsetypejson",testXhrType("json")),Modernizr.addTest("xhrresponsetypetext",testXhrType("text")),Modernizr.addTest("webworkers","Worker"in window),Modernizr.addAsyncTest(function(){function A(){addTest("transferables",!1),e()}function e(){d&&URL.revokeObjectURL(d),a&&a.terminate(),r&&clearTimeout(r)}var t=!!(Modernizr.blobconstructor&&Modernizr.bloburls&&Modernizr.webworkers&&Modernizr.typedarrays);if(!t)return addTest("transferables",!1);try{var n,r,i='var hello = "world"',o=new Blob([i],{type:"text/javascript"}),d=URL.createObjectURL(o),a=new Worker(d);a.onerror=A,r=setTimeout(A,200),n=new ArrayBuffer(1),a.postMessage(n,[n]),addTest("transferables",0===n.byteLength),e()}catch(s){A()}}),testRunner(),setClasses(classes),delete ModernizrProto.addTest,delete ModernizrProto.addAsyncTest;for(var i=0;i<Modernizr._q.length;i++)Modernizr._q[i]();window.Modernizr=Modernizr}(window,document);
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
                if (Modernizr.audio) {
                    this.supportedFeatures.push({ featureName: "Audio - ogg", isSupported: true, supportLevel: Modernizr.audio.ogg, type: "html" });
                    this.supportedFeatures.push({ featureName: "Audio - mp3", isSupported: true, supportLevel: Modernizr.audio.webm, type: "html" });
                    this.supportedFeatures.push({ featureName: "Audio - wav", isSupported: true, supportLevel: Modernizr.audio.wav, type: "html" });
                    this.supportedFeatures.push({ featureName: "Audio - m4a", isSupported: true, supportLevel: Modernizr.audio.m4a, type: "html" });
                }
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
                this.supportedFeatures.push({ featureName: "Flexible Box Model", isSupported: Modernizr.flexbox, type: "css" });
                this.supportedFeatures.push({ featureName: "Flexbox legacy", isSupported: Modernizr.flexboxlegacy, type: "css" });
                this.supportedFeatures.push({ featureName: "@font-face", isSupported: Modernizr.fontface, type: "css" });
                this.supportedFeatures.push({ featureName: "CSS Generated Content (:before/:after)", isSupported: Modernizr.generatedcontent, type: "css" });
                this.supportedFeatures.push({ featureName: "Geolocation API", isSupported: Modernizr.geolocation, type: "misc" });
                this.supportedFeatures.push({ featureName: "hashchange Event", isSupported: Modernizr.hashchange, type: "html" });
                this.supportedFeatures.push({ featureName: "History Management", isSupported: Modernizr.history, type: "html" });
                this.supportedFeatures.push({ featureName: "Color Values hsla()", isSupported: Modernizr.hsla, type: "css" });
                this.supportedFeatures.push({ featureName: "IndexedDB", isSupported: Modernizr.indexeddb, type: "html" });
                this.supportedFeatures.push({ featureName: "Inline SVG in HTML5", isSupported: Modernizr.inlinesvg, type: "misc" });
                /* Inputs... */
                this.supportedFeatures.push({ featureName: "Input Attribute autocomplete", isSupported: Modernizr.input.autocomplete, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Attribute autofocus", isSupported: Modernizr.input.autofocus, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Attribute list", isSupported: Modernizr.input.list, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Attribute placeholder", isSupported: Modernizr.input.placeholder, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Attribute max", isSupported: Modernizr.input.max, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Attribute min", isSupported: Modernizr.input.min, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Attribute multiple", isSupported: Modernizr.input.multiple, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Attribute pattern", isSupported: Modernizr.input.pattern, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Attribute required", isSupported: Modernizr.input.required, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Attribute step", isSupported: Modernizr.input.step, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Search (type=search)", isSupported: Modernizr.inputtypes.search, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Telephone (type=tel)", isSupported: Modernizr.inputtypes.tel, type: "html" });
                this.supportedFeatures.push({ featureName: "Input URL (type=url)", isSupported: Modernizr.inputtypes.url, type: "html" });
                this.supportedFeatures.push({ featureName: "Input E-mail (type=email)", isSupported: Modernizr.inputtypes.email, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Date and Time (type=datetime)", isSupported: Modernizr.inputtypes.datetime, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Date (type=date)", isSupported: Modernizr.inputtypes.date, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Month (type=month)", isSupported: Modernizr.inputtypes.month, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Week (type=week)", isSupported: Modernizr.inputtypes.week, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Time (type=time)", isSupported: Modernizr.inputtypes.time, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Local Date and Time (type=datetime-local)", isSupported: Modernizr.inputtypes['datetime-local'], type: "html" });
                this.supportedFeatures.push({ featureName: "Input Number (type=number)", isSupported: Modernizr.inputtypes.number, type: "html" });
                this.supportedFeatures.push({ featureName: "Input Color (type=color)", isSupported: Modernizr.inputtypes.color, type: "html" });
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
                if (Modernizr.video) {
                    this.supportedFeatures.push({ featureName: "Video - ogg", isSupported: true, supportLevel: Modernizr.video.ogg, type: "html" });
                    this.supportedFeatures.push({ featureName: "Video - webm", isSupported: true, supportLevel: Modernizr.video.webm, type: "html" });
                    this.supportedFeatures.push({ featureName: "Video - h264", isSupported: true, supportLevel: Modernizr.video.h264, type: "html" });
                }
                this.supportedFeatures.push({ featureName: "WebGL", isSupported: Modernizr.webgl, type: "misc" });
                this.supportedFeatures.push({ featureName: "Web Sockets", isSupported: ("WebSocket" in window), type: "html" });
                this.supportedFeatures.push({ featureName: "Web SQL Database", isSupported: Modernizr.websqldatabase, type: "html" });
                this.supportedFeatures.push({ featureName: "Web Workers", isSupported: Modernizr.webworkers, type: "html" });
                this.supportedFeatures.push({ featureName: "Ambient Light Events", isSupported: Modernizr.ambientlight, type: "noncore" });
                this.supportedFeatures.push({ featureName: "A [download] attribute", isSupported: Modernizr.adownload, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Mozilla Audio Data API", isSupported: Modernizr.audiodata, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Web Audio API", isSupported: Modernizr.webaudio, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Battery API", isSupported: Modernizr.batteryapi, type: "noncore" });
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
                this.supportedFeatures.push({ featureName: "CSS Filters", isSupported: Modernizr.cssfilters, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Hyphens", isSupported: Modernizr.csshyphens, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Soft Hyphens (shy)", isSupported: Modernizr.softhyphens, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Soft Hyphens find-on-page", isSupported: Modernizr.softhyphensfind, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Pseudo-Class :last-child", isSupported: Modernizr.lastchild, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Mask", isSupported: Modernizr.cssmask, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Media Queries", isSupported: Modernizr.mediaqueries, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Overflow Scrolling", isSupported: Modernizr.overflowscrolling, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Pointer Events", isSupported: Modernizr.pointerevents, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS position: sticky", isSupported: Modernizr.csspositionsticky, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Font rem Units", isSupported: Modernizr.cssremunit, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS resize", isSupported: Modernizr.cssresize, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Styleable Scrollbars", isSupported: Modernizr.cssscrollbar, type: "noncore" });
                this.supportedFeatures.push({ featureName: "SubPixel Font Rendering", isSupported: Modernizr.subpixelfont, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Feature Queries @supports", isSupported: Modernizr.supports, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS user-select", isSupported: Modernizr.userselect, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Viewport Units vh", isSupported: Modernizr.cssvhunit, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Viewport Units vmax", isSupported: Modernizr.cssvmaxunit, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Viewport Units vmin", isSupported: Modernizr.cssvminunit, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Viewport Units vw", isSupported: Modernizr.cssvwunit, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Custom Protocol Handler", isSupported: Modernizr.customprotocolhandler, type: "noncore" });
                this.supportedFeatures.push({ featureName: "DataView (JavaScript Typed Arrays)", isSupported: Modernizr.dataview, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 ClassList API", isSupported: Modernizr.classlist, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Datasets", isSupported: Modernizr.dataset, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Microdata", isSupported: Modernizr.microdata, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Details & Summary", isSupported: Modernizr.details, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Output", isSupported: Modernizr.outputelem, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Progress Bar", isSupported: Modernizr.progressbar, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Meter", isSupported: Modernizr.meter, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Ruby, Rt, Rp elements", isSupported: Modernizr.ruby, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Time", isSupported: Modernizr.time, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Track", isSupported: Modernizr.track, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Text Track API", isSupported: Modernizr.texttrackapi, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Canvas Text Emoji", isSupported: Modernizr.emoji, type: "noncore" });
                this.supportedFeatures.push({ featureName: "ECMAScript 5 Strict Mode", isSupported: Modernizr.strictmode, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Device Motion", isSupported: Modernizr.devicemotion, type: "noncore" });
                this.supportedFeatures.push({ featureName: "HTML5 Device Orientation", isSupported: Modernizr.deviceorientation, type: "noncore" });
                this.supportedFeatures.push({ featureName: "File API", isSupported: Modernizr.filereader, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Filesystem API", isSupported: Modernizr.filesystem, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Input Type file", isSupported: Modernizr.fileinput, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Input Attribute form", isSupported: Modernizr.formattribute, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Web Speech API", isSupported: Modernizr.speechinput, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Interactive Form Validation", isSupported: Modernizr.formvalidation, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Fullscreen API", isSupported: Modernizr.fullscreen, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Gamepad", isSupported: Modernizr.gamepads, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Stream API", isSupported: Modernizr.getusermedia, type: "noncore" });
                this.supportedFeatures.push({ featureName: "IE8 compat mode", isSupported: Modernizr.ie8compat, type: "noncore" });
                this.supportedFeatures.push({ featureName: "IFrame sandbox", isSupported: Modernizr.sandbox, type: "noncore" });
                this.supportedFeatures.push({ featureName: "IFrame seamless", isSupported: Modernizr.seamless, type: "noncore" });
                this.supportedFeatures.push({ featureName: "IFrame srcdoc", isSupported: Modernizr.srcdoc, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Image Format apng", isSupported: Modernizr.apng, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Image Format webp", isSupported: Modernizr.webp, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Native JSON Parsing", isSupported: Modernizr.json, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Reverse Ordered Lists", isSupported: Modernizr.olreversed, type: "noncore" });
                this.supportedFeatures.push({ featureName: "MathML", isSupported: Modernizr.mathml, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Network Information API", isSupported: Modernizr.lowbandwidth, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Server-Sent Events", isSupported: Modernizr.eventsource, type: "noncore" });
                this.supportedFeatures.push({ featureName: "XMLHttpRequest Level 2", isSupported: Modernizr.xhr2, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Web Notifications", isSupported: Modernizr.notification, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Navigation Timing", isSupported: Modernizr.performance, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Pointer Lock API", isSupported: Modernizr.pointerlock, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Quota Storage Management API", isSupported: Modernizr.quotamanagement, type: "noncore" });
                this.supportedFeatures.push({ featureName: "requestAnimationFrame", isSupported: Modernizr.raf, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Script async", isSupported: Modernizr.scriptasync, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Script defer", isSupported: Modernizr.scriptdefer, type: "noncore" });
                this.supportedFeatures.push({ featureName: "CSS Style Scoped", isSupported: Modernizr.stylescoped, type: "noncore" });
                this.supportedFeatures.push({ featureName: "SVG Filters", isSupported: Modernizr.svgfilters, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Unicode Special Characters", isSupported: Modernizr.unicode, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Data URI Scheme", isSupported: Modernizr.datauri, type: "noncore" });
                this.supportedFeatures.push({ featureName: "IE userData", isSupported: Modernizr.userdata, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Vibration API", isSupported: Modernizr.vibrate, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Web Intents", isSupported: Modernizr.webintents, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Web Sockets binaryType", isSupported: Modernizr.websocketsbinary, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Window Framed", isSupported: Modernizr.framed, type: "noncore" });
                this.supportedFeatures.push({ featureName: "Shared Web Workers", isSupported: Modernizr.sharedworkers, type: "noncore" });
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

/*! aXe v1.1.1
 * Copyright (c) 2015 Deque Systems, Inc.
 *
 * Your use of this Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This entire copyright notice must appear in every copy of this file you
 * distribute or in any file that contains substantial portions of this source
 * code.
 */
!function(a,b){function c(a){"use strict";var b,d,e=a;if(null!==a&&"object"==typeof a)if(Array.isArray(a))for(e=[],b=0,d=a.length;d>b;b++)e[b]=c(a[b]);else{e={};for(b in a)e[b]=c(a[b])}return e}function d(a){"use strict";var b=a||{};return b.rules=b.rules||[],b.tools=b.tools||[],b.checks=b.checks||[],b.data=b.data||{checks:{},rules:{}},b}function e(a,b,c){"use strict";var d,e;for(d=0,e=a.length;e>d;d++)b[c](a[d])}function f(a){"use strict";a=d(a),S.commons=R=a.commons,this.reporter=a.reporter,this.rules=[],this.tools={},this.checks={},e(a.rules,this,"addRule"),e(a.tools,this,"addTool"),e(a.checks,this,"addCheck"),this.data=a.data||{checks:{},rules:{}},H(a.style)}function g(a){"use strict";this.id=a.id,this.data=null,this.relatedNodes=[],this.result=null}function h(a){"use strict";this.id=a.id,this.options=a.options,this.selector=a.selector,this.evaluate=a.evaluate,a.after&&(this.after=a.after),a.matches&&(this.matches=a.matches),this.enabled=a.hasOwnProperty("enabled")?a.enabled:!0}function i(a,b){"use strict";if(!T.isHidden(b)){var c=T.findBy(a,"node",b);c||a.push({node:b,include:[],exclude:[]})}}function j(a,c,d){"use strict";a.frames=a.frames||[];var e,f,g=b.querySelectorAll(d.shift());a:for(var h=0,i=g.length;i>h;h++){f=g[h];for(var j=0,k=a.frames.length;k>j;j++)if(a.frames[j].node===f){a.frames[j][c].push(d);break a}e={node:f,include:[],exclude:[]},d&&e[c].push(d),a.frames.push(e)}}function k(a){"use strict";if(a&&"object"==typeof a||a instanceof NodeList){if(a instanceof Node)return{include:[a],exclude:[]};if(a.hasOwnProperty("include")||a.hasOwnProperty("exclude"))return{include:a.include||[b],exclude:a.exclude||[]};if(a.length===+a.length)return{include:a,exclude:[]}}return"string"==typeof a?{include:[a],exclude:[]}:{include:[b],exclude:[]}}function l(a,c){"use strict";for(var d,e=[],f=0,g=a[c].length;g>f;f++){if(d=a[c][f],"string"==typeof d){e=e.concat(T.toArray(b.querySelectorAll(d)));break}d&&d.length?d.length>1?j(a,c,d):e=e.concat(T.toArray(b.querySelectorAll(d[0]))):e.push(d)}return e.filter(function(a){return a})}function m(a){"use strict";var c=this;this.frames=[],this.initiator=a&&"boolean"==typeof a.initiator?a.initiator:!0,this.page=!1,a=k(a),this.exclude=a.exclude,this.include=a.include,this.include=l(this,"include"),this.exclude=l(this,"exclude"),T.select("frame, iframe",this).forEach(function(a){M(a,c)&&i(c.frames,a)}),1===this.include.length&&this.include[0]===b&&(this.page=!0)}function n(a){"use strict";this.id=a.id,this.result=S.constants.result.NA,this.pageLevel=a.pageLevel,this.impact=null,this.nodes=[]}function o(a,b){"use strict";this._audit=b,this.id=a.id,this.selector=a.selector||"*",this.excludeHidden="boolean"==typeof a.excludeHidden?a.excludeHidden:!0,this.enabled="boolean"==typeof a.enabled?a.enabled:!0,this.pageLevel="boolean"==typeof a.pageLevel?a.pageLevel:!1,this.any=a.any||[],this.all=a.all||[],this.none=a.none||[],this.tags=a.tags||[],a.matches&&(this.matches=a.matches)}function p(a){"use strict";return T.getAllChecks(a).map(function(b){var c=a._audit.checks[b.id||b];return"function"==typeof c.after?c:null}).filter(Boolean)}function q(a,b){"use strict";var c=[];return a.forEach(function(a){var d=T.getAllChecks(a);d.forEach(function(a){a.id===b&&c.push(a)})}),c}function r(a){"use strict";return a.filter(function(a){return a.filtered!==!0})}function s(a){"use strict";var b=["any","all","none"],c=a.nodes.filter(function(a){var c=0;return b.forEach(function(b){a[b]=r(a[b]),c+=a[b].length}),c>0});return a.pageLevel&&c.length&&(c=[c.reduce(function(a,c){return a?(b.forEach(function(b){a[b].push.apply(a[b],c[b])}),a):void 0})]),c}function t(a){"use strict";a.source=a.source||{},this.id=a.id,this.options=a.options,this._run=a.source.run,this._cleanup=a.source.cleanup,this.active=!1}function u(a){"use strict";if(!S._audit)throw new Error("No audit configured");var c=T.queue();Object.keys(S._audit.tools).forEach(function(a){var b=S._audit.tools[a];b.active&&c.defer(function(a){b.cleanup(a)})}),T.toArray(b.querySelectorAll("frame, iframe")).forEach(function(a){c.defer(function(b){return T.sendCommandToFrame(a,{command:"cleanup-tool"},b)})}),c.then(a)}function v(a,c){"use strict";var d=a&&a.context||{};d.include&&!d.include.length&&(d.include=[b]);var e=a&&a.options||{};switch(a.command){case"rules":return x(d,e,c);case"run-tool":return y(a.parameter,a.selectorArray,e,c);case"cleanup-tool":return u(c)}}function w(a){"use strict";return"string"==typeof a&&W[a]?W[a]:"function"==typeof a?a:V}function x(a,b,c){"use strict";a=new m(a);var d=T.queue(),e=S._audit;a.frames.length&&d.defer(function(c){T.collectResultsFromFrames(a,b,"rules",null,c)}),d.defer(function(c){e.run(a,b,c)}),d.then(function(d){var f=T.mergeResults(d.map(function(a){return{results:a}}));a.initiator&&(f=e.after(f,b),f=f.map(T.finalizeRuleResult)),c(f)})}function y(a,c,d,e){"use strict";if(!S._audit)throw new Error("No audit configured");if(c.length>1){var f=b.querySelector(c.shift());return T.sendCommandToFrame(f,{options:d,command:"run-tool",parameter:a,selectorArray:c},e)}var g=b.querySelector(c.shift());S._audit.tools[a].run(g,d,e)}function z(a,b){"use strict";if(b=b||300,a.length>b){var c=a.indexOf(">");a=a.substring(0,c+1)}return a}function A(a){"use strict";var b=a.outerHTML;return b||"function"!=typeof XMLSerializer||(b=(new XMLSerializer).serializeToString(a)),z(b||"")}function B(a,b){"use strict";b=b||{},this.selector=b.selector||[T.getSelector(a)],this.source=void 0!==b.source?b.source:A(a),this.element=a}function C(a,b){"use strict";Object.keys(S.constants.raisedMetadata).forEach(function(c){var d=S.constants.raisedMetadata[c],e=b.reduce(function(a,b){var e=d.indexOf(b[c]);return e>a?e:a},-1);d[e]&&(a[c]=d[e])})}function D(a){"use strict";var b=a.any.length||a.all.length||a.none.length;return b?S.constants.result.FAIL:S.constants.result.PASS}function E(a){"use strict";function b(a){return T.extendBlacklist({},a,["result"])}var c=T.extendBlacklist({violations:[],passes:[]},a,["nodes"]);return a.nodes.forEach(function(a){var d=T.getFailingChecks(a),e=D(d);return e===S.constants.result.FAIL?(C(a,T.getAllChecks(d)),a.any=d.any.map(b),a.all=d.all.map(b),a.none=d.none.map(b),void c.violations.push(a)):(a.any=a.any.filter(function(a){return a.result}).map(b),a.all=a.all.map(b),a.none=a.none.map(b),void c.passes.push(a))}),C(c,c.violations),c.result=c.violations.length?S.constants.result.FAIL:c.passes.length?S.constants.result.PASS:c.result,c}function F(a){"use strict";for(var b=1,c=a.nodeName;a=a.previousElementSibling;)a.nodeName===c&&b++;return b}function G(a,b){"use strict";var c,d,e=a.parentNode.children;if(!e)return!1;var f=e.length;for(c=0;f>c;c++)if(d=e[c],d!==a&&T.matchesSelector(d,b))return!0;return!1}function H(a){"use strict";if(X&&X.parentNode&&(X.parentNode.removeChild(X),X=null),a){var c=b.head||b.getElementsByTagName("head")[0];return X=b.createElement("style"),X.type="text/css",void 0===X.styleSheet?X.appendChild(b.createTextNode(a)):X.styleSheet.cssText=a,c.appendChild(X),X}}function I(a,b,c){"use strict";a.forEach(function(a){a.node.selector.unshift(c),a.node=new T.DqElement(b,a.node);var d=T.getAllChecks(a);d.length&&d.forEach(function(a){a.relatedNodes.forEach(function(a){a.selector.unshift(c),a=new T.DqElement(b,a)})})})}function J(a,b){"use strict";for(var c,d,e=b[0].node,f=0,g=a.length;g>f;f++)if(d=a[f].node,c=T.nodeSorter(d.element,e.element),c>0||0===c&&e.selector.length<d.selector.length)return void a.splice.apply(a,[f,0].concat(b));a.push.apply(a,b)}function K(a){"use strict";return a&&a.results?Array.isArray(a.results)?a.results.length?a.results:null:[a.results]:null}function L(a){"use strict";return a.sort(function(a,b){return T.contains(a,b)?1:-1})[0]}function M(a,b){"use strict";var c=b.include&&L(b.include.filter(function(b){return T.contains(b,a)})),d=b.exclude&&L(b.exclude.filter(function(b){return T.contains(b,a)}));return!d&&c||d&&T.contains(d,c)?!0:!1}function N(a,b,c){"use strict";for(var d=0,e=b.length;e>d;d++)-1===a.indexOf(b[d])&&M(b[d],c)&&a.push(b[d])}var O,P=function(){"use strict";function a(a){var b,c,d=a.Element.prototype,e=["matches","matchesSelector","mozMatchesSelector","webkitMatchesSelector","msMatchesSelector"],f=e.length;for(b=0;f>b;b++)if(c=e[b],d[c])return c}var b;return function(c,d){return b&&c[b]||(b=a(c.ownerDocument.defaultView)),c[b](d)}}(),Q=function(a){"use strict";for(var b,c=String(a),d=c.length,e=-1,f="",g=c.charCodeAt(0);++e<d;){if(b=c.charCodeAt(e),0==b)throw new Error("INVALID_CHARACTER_ERR");f+=b>=1&&31>=b||b>=127&&159>=b||0==e&&b>=48&&57>=b||1==e&&b>=48&&57>=b&&45==g?"\\"+b.toString(16)+" ":(1!=e||45!=b||45!=g)&&(b>=128||45==b||95==b||b>=48&&57>=b||b>=65&&90>=b||b>=97&&122>=b)?c.charAt(e):"\\"+c.charAt(e)}return f};!function(a){function b(a,b,c){var d=b&&c||0,e=0;for(b=b||[],a.toLowerCase().replace(/[0-9a-f]{2}/g,function(a){16>e&&(b[d+e++]=l[a])});16>e;)b[d+e++]=0;return b}function c(a,b){var c=b||0,d=k;return d[a[c++]]+d[a[c++]]+d[a[c++]]+d[a[c++]]+"-"+d[a[c++]]+d[a[c++]]+"-"+d[a[c++]]+d[a[c++]]+"-"+d[a[c++]]+d[a[c++]]+"-"+d[a[c++]]+d[a[c++]]+d[a[c++]]+d[a[c++]]+d[a[c++]]+d[a[c++]]}function d(a,b,d){var e=b&&d||0,f=b||[];a=a||{};var g=null!=a.clockseq?a.clockseq:p,h=null!=a.msecs?a.msecs:(new Date).getTime(),i=null!=a.nsecs?a.nsecs:r+1,j=h-q+(i-r)/1e4;if(0>j&&null==a.clockseq&&(g=g+1&16383),(0>j||h>q)&&null==a.nsecs&&(i=0),i>=1e4)throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");q=h,r=i,p=g,h+=122192928e5;var k=(1e4*(268435455&h)+i)%4294967296;f[e++]=k>>>24&255,f[e++]=k>>>16&255,f[e++]=k>>>8&255,f[e++]=255&k;var l=h/4294967296*1e4&268435455;f[e++]=l>>>8&255,f[e++]=255&l,f[e++]=l>>>24&15|16,f[e++]=l>>>16&255,f[e++]=g>>>8|128,f[e++]=255&g;for(var m=a.node||o,n=0;6>n;n++)f[e+n]=m[n];return b?b:c(f)}function e(a,b,d){var e=b&&d||0;"string"==typeof a&&(b="binary"==a?new j(16):null,a=null),a=a||{};var g=a.random||(a.rng||f)();if(g[6]=15&g[6]|64,g[8]=63&g[8]|128,b)for(var h=0;16>h;h++)b[e+h]=g[h];return b||c(g)}var f,g=a.crypto||a.msCrypto;if(!f&&g&&g.getRandomValues){var h=new Uint8Array(16);f=function(){return g.getRandomValues(h),h}}if(!f){var i=new Array(16);f=function(){for(var a,b=0;16>b;b++)0===(3&b)&&(a=4294967296*Math.random()),i[b]=a>>>((3&b)<<3)&255;return i}}for(var j="function"==typeof a.Buffer?a.Buffer:Array,k=[],l={},m=0;256>m;m++)k[m]=(m+256).toString(16).substr(1),l[k[m]]=m;var n=f(),o=[1|n[0],n[1],n[2],n[3],n[4],n[5]],p=16383&(n[6]<<8|n[7]),q=0,r=0;O=e,O.v1=d,O.v4=e,O.parse=b,O.unparse=c,O.BufferClass=j}(a);var R,S={},T=S.utils={};T.matchesSelector=P,T.escapeSelector=Q,T.clone=c;var U={};f.prototype.addRule=function(a){"use strict";a.metadata&&(this.data.rules[a.id]=a.metadata);for(var b,c=0,d=this.rules.length;d>c;c++)if(b=this.rules[c],b.id===a.id)return void(this.rules[c]=new o(a,this));this.rules.push(new o(a,this))},f.prototype.addTool=function(a){"use strict";this.tools[a.id]=new t(a)},f.prototype.addCheck=function(a){"use strict";a.metadata&&(this.data.checks[a.id]=a.metadata),this.checks[a.id]=new h(a)},f.prototype.run=function(a,b,c){"use strict";var d=T.queue();this.rules.forEach(function(c){T.ruleShouldRun(c,a,b)&&d.defer(function(d){c.run(a,b,d)})}),d.then(c)},f.prototype.after=function(a,b){"use strict";var c=this.rules;return a.map(function(a){var d=T.findBy(c,"id",a.id);return d.after(a,b)})},h.prototype.matches=function(a){"use strict";return!this.selector||T.matchesSelector(a,this.selector)?!0:!1},h.prototype.run=function(a,b,c){"use strict";b=b||{};var d=b.hasOwnProperty("enabled")?b.enabled:this.enabled,e=b.options||this.options;if(d&&this.matches(a)){var f,h=new g(this),i=T.checkHelper(h,c);try{f=this.evaluate.call(i,a,e)}catch(j){return S.log(j.message,j.stack),void c(null)}i.isAsync||(h.result=f,setTimeout(function(){c(h)},0))}else c(null)},o.prototype.matches=function(){"use strict";return!0},o.prototype.gather=function(a){"use strict";var b=T.select(this.selector,a);return this.excludeHidden?b.filter(function(a){return!T.isHidden(a)}):b},o.prototype.runChecks=function(a,b,c,d){"use strict";var e=this,f=T.queue();this[a].forEach(function(a){var d=e._audit.checks[a.id||a],g=T.getCheckOption(d,e.id,c);f.defer(function(a){d.run(b,g,a)})}),f.then(function(b){b=b.filter(function(a){return a}),d({type:a,results:b})})},o.prototype.run=function(a,b,c){"use strict";var d,e=this.gather(a),f=T.queue(),g=this;d=new n(this),e.forEach(function(a){g.matches(a)&&f.defer(function(c){var e=T.queue();e.defer(function(c){g.runChecks("any",a,b,c)}),e.defer(function(c){g.runChecks("all",a,b,c)}),e.defer(function(c){g.runChecks("none",a,b,c)}),e.then(function(b){if(b.length){var e=!1,f={node:new T.DqElement(a)};b.forEach(function(a){var b=a.results.filter(function(a){return a});f[a.type]=b,b.length&&(e=!0)}),e&&d.nodes.push(f)}c()})})}),f.then(function(){c(d)})},o.prototype.after=function(a,b){"use strict";var c=p(this),d=this.id;return c.forEach(function(c){var e=q(a.nodes,c.id),f=T.getCheckOption(c,d,b),g=c.after(e,f);e.forEach(function(a){-1===g.indexOf(a)&&(a.filtered=!0)})}),a.nodes=s(a),a},t.prototype.run=function(a,b,c){"use strict";b="undefined"==typeof b?this.options:b,this.active=!0,this._run(a,b,c)},t.prototype.cleanup=function(a){"use strict";this.active=!1,this._cleanup(a)},S.constants={},S.constants.result={PASS:"PASS",FAIL:"FAIL",NA:"NA"},S.constants.raisedMetadata={impact:["minor","moderate","serious","critical"]},S.version="dev",a.axe=S,S.log=function(){"use strict";"object"==typeof console&&console.log&&Function.prototype.apply.call(console.log,console,arguments)},S.cleanup=u,S.configure=function(a){"use strict";var b=S._audit;if(!b)throw new Error("No audit configured");a.reporter&&("function"==typeof a.reporter||W[a.reporter])&&(b.reporter=a.reporter),a.checks&&a.checks.forEach(function(a){b.addCheck(a)}),a.rules&&a.rules.forEach(function(a){b.addRule(a)}),a.tools&&a.tools.forEach(function(a){b.addTool(a)})},S.getRules=function(a){"use strict";a=a||[];var b=a.length?S._audit.rules.filter(function(b){return!!a.filter(function(a){return-1!==b.tags.indexOf(a)}).length}):S._audit.rules,c=S._audit.data.rules||{};return b.map(function(a){var b=c[a.id]||{};return{ruleId:a.id,description:b.description,help:b.help,helpUrl:b.helpUrl,tags:a.tags}})},S._load=function(a){"use strict";T.respondable.subscribe("axe.ping",function(a,b){b({axe:!0})}),T.respondable.subscribe("axe.start",v),S._audit=new f(a)};var V,W={};S.reporter=function(a,b,c){"use strict";W[a]=b,c&&(V=b)},S.a11yCheck=function(a,b,c){"use strict";"function"==typeof b&&(c=b,b={}),b&&"object"==typeof b||(b={});var d=S._audit;if(!d)throw new Error("No audit configured");var e=w(b.reporter||d.reporter);x(a,b,function(a){e(a,c)})},S.tool=y,U.failureSummary=function(a){"use strict";var b={};return b.none=a.none.concat(a.all),b.any=a.any,Object.keys(b).map(function(a){return b[a].length?S._audit.data.failureSummaries[a].failureMessage(b[a].map(function(a){return a.message||""})):void 0}).filter(function(a){return void 0!==a}).join("\n\n")},U.formatCheck=function(a){"use strict";return{id:a.id,impact:a.impact,message:a.message,data:a.data,relatedNodes:a.relatedNodes.map(U.formatNode)}},U.formatChecks=function(a,b){"use strict";return a.any=b.any.map(U.formatCheck),a.all=b.all.map(U.formatCheck),a.none=b.none.map(U.formatCheck),a},U.formatNode=function(a){"use strict";return{target:a?a.selector:null,html:a?a.source:null}},U.formatRuleResult=function(a){"use strict";return{id:a.id,description:a.description,help:a.help,helpUrl:a.helpUrl||null,impact:null,tags:a.tags,nodes:[]}},U.splitResultsWithChecks=function(a){"use strict";return U.splitResults(a,U.formatChecks)},U.splitResults=function(b,c){"use strict";var d=[],e=[];return b.forEach(function(a){function b(b){var d=b.result||a.result,e=U.formatNode(b.node);return e.impact=b.impact||null,c(e,b,d)}var f,g=U.formatRuleResult(a);f=T.clone(g),f.impact=a.impact||null,f.nodes=a.violations.map(b),g.nodes=a.passes.map(b),f.nodes.length&&d.push(f),g.nodes.length&&e.push(g)}),{violations:d,passes:e,url:a.location.href,timestamp:new Date}},S.reporter("na",function(a,b){"use strict";var c=a.filter(function(a){return 0===a.violations.length&&0===a.passes.length}).map(U.formatRuleResult),d=U.splitResultsWithChecks(a);b({violations:d.violations,passes:d.passes,notApplicable:c,timestamp:d.timestamp,url:d.url})}),S.reporter("no-passes",function(a,b){"use strict";var c=U.splitResultsWithChecks(a);b({violations:c.violations,timestamp:c.timestamp,url:c.url})}),S.reporter("raw",function(a,b){"use strict";b(a)}),S.reporter("v1",function(a,b){"use strict";var c=U.splitResults(a,function(a,b,c){return c===S.constants.result.FAIL&&(a.failureSummary=U.failureSummary(b)),a});b({violations:c.violations,passes:c.passes,timestamp:c.timestamp,url:c.url})}),S.reporter("v2",function(a,b){"use strict";var c=U.splitResultsWithChecks(a);b({violations:c.violations,passes:c.passes,timestamp:c.timestamp,url:c.url})},!0),T.checkHelper=function(a,b){"use strict";return{isAsync:!1,async:function(){return this.isAsync=!0,function(c){a.value=c,b(a)}},data:function(b){a.data=b},relatedNodes:function(b){b=b instanceof Node?[b]:T.toArray(b),a.relatedNodes=b.map(function(a){return new T.DqElement(a)})}}},T.sendCommandToFrame=function(a,b,c){"use strict";var d=a.contentWindow;if(!d)return S.log("Frame does not have a content window",a),c({});var e=setTimeout(function(){e=setTimeout(function(){S.log("No response from frame: ",a),c(null)},0)},500);T.respondable(d,"axe.ping",null,function(){clearTimeout(e),e=setTimeout(function(){S.log("Error returning results from frame: ",a),c({}),c=null},3e4),T.respondable(d,"axe.start",b,function(a){c&&(clearTimeout(e),c(a))})})},T.collectResultsFromFrames=function(a,b,c,d,e){"use strict";function f(e){var f={options:b,command:c,parameter:d,context:{initiator:!1,page:a.page,include:e.include||[],exclude:e.exclude||[]}};g.defer(function(a){var b=e.node;T.sendCommandToFrame(b,f,function(c){return c?a({results:c,frameElement:b,frame:T.getSelector(b)}):void a(null)})})}for(var g=T.queue(),h=a.frames,i=0,j=h.length;j>i;i++)f(h[i]);g.then(function(a){e(T.mergeResults(a))})},T.contains=function(a,b){"use strict";return"function"==typeof a.contains?a.contains(b):!!(16&a.compareDocumentPosition(b))},B.prototype.toJSON=function(){"use strict";return{selector:this.selector,source:this.source}},T.DqElement=B,T.extendBlacklist=function(a,b,c){"use strict";c=c||[];for(var d in b)b.hasOwnProperty(d)&&-1===c.indexOf(d)&&(a[d]=b[d]);return a},T.extendMetaData=function(a,b){"use strict";for(var c in b)if(b.hasOwnProperty(c))if("function"==typeof b[c])try{a[c]=b[c](a)}catch(d){a[c]=null}else a[c]=b[c]},T.getFailingChecks=function(a){"use strict";var b=a.any.filter(function(a){return!a.result});return{all:a.all.filter(function(a){return!a.result}),any:b.length===a.any.length?b:[],none:a.none.filter(function(a){return!!a.result})}},T.finalizeRuleResult=function(a){"use strict";return T.publishMetaData(a),E(a)},T.findBy=function(a,b,c){"use strict";a=a||[];var d,e;for(d=0,e=a.length;e>d;d++)if(a[d][b]===c)return a[d]},T.getAllChecks=function(a){"use strict";var b=[];return b.concat(a.any||[]).concat(a.all||[]).concat(a.none||[])},T.getCheckOption=function(a,b,c){"use strict";var d=((c.rules&&c.rules[b]||{}).checks||{})[a.id],e=(c.checks||{})[a.id],f=a.enabled,g=a.options;return e&&(e.hasOwnProperty("enabled")&&(f=e.enabled),e.hasOwnProperty("options")&&(g=e.options)),d&&(d.hasOwnProperty("enabled")&&(f=d.enabled),d.hasOwnProperty("options")&&(g=d.options)),{enabled:f,options:g}},T.getSelector=function(a){"use strict";function c(a){return T.escapeSelector(a)}for(var d,e=[];a.parentNode;){if(d="",a.id&&1===b.querySelectorAll("#"+T.escapeSelector(a.id)).length){e.unshift("#"+T.escapeSelector(a.id));break}if(a.className&&"string"==typeof a.className&&(d="."+a.className.trim().split(/\s+/).map(c).join("."),("."===d||G(a,d))&&(d="")),!d){if(d=T.escapeSelector(a.nodeName).toLowerCase(),"html"===d||"body"===d){e.unshift(d);break}G(a,d)&&(d+=":nth-of-type("+F(a)+")")}e.unshift(d),a=a.parentNode}return e.join(" > ")};var X;T.isHidden=function(b,c){"use strict";if(9===b.nodeType)return!1;var d=a.getComputedStyle(b,null);return d&&b.parentNode&&"none"!==d.getPropertyValue("display")&&(c||"hidden"!==d.getPropertyValue("visibility"))&&"true"!==b.getAttribute("aria-hidden")?T.isHidden(b.parentNode,!0):!0},T.mergeResults=function(a){"use strict";var b=[];return a.forEach(function(a){var c=K(a);c&&c.length&&c.forEach(function(c){c.nodes&&a.frame&&I(c.nodes,a.frameElement,a.frame);var d=T.findBy(b,"id",c.id);d?c.nodes.length&&J(d.nodes,c.nodes):b.push(c)})}),b},T.nodeSorter=function(a,b){"use strict";return a===b?0:4&a.compareDocumentPosition(b)?-1:1},T.publishMetaData=function(a){"use strict";function b(a){return function(b){var d=c[b.id]||{},e=d.messages||{},f=T.extendBlacklist({},d,["messages"]);f.message=b.result===a?e.pass:e.fail,T.extendMetaData(b,f)}}var c=S._audit.data.checks||{},d=S._audit.data.rules||{},e=T.findBy(S._audit.rules,"id",a.id)||{};a.tags=T.clone(e.tags||[]);var f=b(!0),g=b(!1);a.nodes.forEach(function(a){a.any.forEach(f),a.all.forEach(f),a.none.forEach(g)}),T.extendMetaData(a,T.clone(d[a.id]||{}))},function(){"use strict";function a(){}function b(){function b(){for(var a=e.length;a>f;f++){var b=e[f],d=b.shift();b.push(c(f)),d.apply(null,b)}}function c(a){return function(b){e[a]=b,--g||d()}}function d(){h(e)}var e=[],f=0,g=0,h=a;return{defer:function(a){e.push([a]),++g,b()},then:function(a){h=a,g||d()},abort:function(b){h=a,b(e)}}}T.queue=b}(),function(b){"use strict";function c(a){return"object"==typeof a&&"string"==typeof a.uuid&&a._respondable===!0}function d(a,b,c,d,e){var f={uuid:d,topic:b,message:c,_respondable:!0};h[d]=e,a.postMessage(JSON.stringify(f),"*")}function e(a,b,c,e){var f=O.v1();d(a,b,c,f,e)}function f(a,b){var c=b.topic,d=b.message,e=i[c];e&&e(d,g(a.source,null,b.uuid))}function g(a,b,c){return function(e,f){d(a,b,e,c,f)}}var h={},i={};e.subscribe=function(a,b){i[a]=b},a.addEventListener("message",function(a){if("string"==typeof a.data){var b;try{b=JSON.parse(a.data)}catch(d){}if(c(b)){var e=b.uuid;h[e]&&(h[e](b.message,g(a.source,b.topic,e)),h[e]=null),f(a,b)}}},!1),b.respondable=e}(T),T.ruleShouldRun=function(a,b,c){"use strict";if(a.pageLevel&&!b.page)return!1;var d=c.runOnly,e=(c.rules||{})[a.id];return d?"rule"===d.type?-1!==d.values.indexOf(a.id):!!(d.values||[]).filter(function(b){return-1!==a.tags.indexOf(b)}).length:(e&&e.hasOwnProperty("enabled")?e.enabled:a.enabled)?!0:!1},T.select=function(a,b){"use strict";for(var c,d=[],e=0,f=b.include.length;f>e;e++)c=b.include[e],c.nodeType===c.ELEMENT_NODE&&T.matchesSelector(c,a)&&N(d,[c],b),N(d,c.querySelectorAll(a),b);return d.sort(T.nodeSorter)},T.toArray=function(a){"use strict";return Array.prototype.slice.call(a)},S._load({data:{rules:{accesskeys:{description:"Ensures every accesskey attribute value is unique",help:"accesskey attribute value must be unique",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/accesskeys"},"area-alt":{description:"Ensures <area> elements of image maps have alternate text",help:"Active <area> elements must have alternate text",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/area-alt"},"aria-allowed-attr":{description:"Ensures ARIA attributes are allowed for an element's role",help:"Elements must only use allowed ARIA attributes",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/aria-allowed-attr"},"aria-required-attr":{description:"Ensures elements with ARIA roles have all required ARIA attributes",help:"Required ARIA attributes must be provided",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/aria-required-attr"},"aria-required-children":{description:"Ensures elements with an ARIA role that require child roles contain them",help:"Certain ARIA roles must contain particular children",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/aria-required-children"},"aria-required-parent":{description:"Ensures elements with an ARIA role that require parent roles are contained by them",help:"Certain ARIA roles must be contained by particular parents",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/aria-required-parent"},"aria-roles":{description:"Ensures all elements with a role attribute use a valid value",help:"ARIA roles used must conform to valid values",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/aria-roles"},"aria-valid-attr-value":{description:"Ensures all ARIA attributes have valid values",help:"ARIA attributes must conform to valid values",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/aria-valid-attr-value"},"aria-valid-attr":{description:"Ensures attributes that begin with aria- are valid ARIA attributes",help:"ARIA attributes must conform to valid names",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/aria-valid-attr"},"audio-caption":{description:"Ensures <audio> elements have captions",help:"<audio> elements must have a captions track",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/audio-caption"},blink:{description:"Ensures <blink> elements are not used",help:"<blink> elements are deprecated and must not be used",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/blink"},"button-name":{description:"Ensures buttons have discernible text",help:"Buttons must have discernible text",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/button-name"},bypass:{description:"Ensures each page has at least one mechanism for a user to bypass navigation and jump straight to the content",help:"Page must have means to bypass repeated blocks",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/bypass"},checkboxgroup:{description:'Ensures related <input type="checkbox"> elements have a group and that that group designation is consistent',help:"Checkbox inputs with the same name attribute value must be part of a group",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/checkboxgroup"},"color-contrast":{description:"Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",help:"Elements must have sufficient color contrast",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/color-contrast"},"data-table":{description:"Ensures data tables are marked up semantically and have the correct header structure",help:"Data tables should be marked up properly",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/data-table"},"definition-list":{description:"Ensures <dl> elements are structured correctly",help:"<dl> elements must only directly contain properly-ordered <dt> and <dd> groups, <script> or <template> elements",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/definition-list"},dlitem:{description:"Ensures <dt> and <dd> elements are contained by a <dl>",help:"<dt> and <dd> elements must be contained by a <dl>",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/dlitem"},"document-title":{description:"Ensures each HTML document contains a non-empty <title> element",help:"Documents must have <title> element to aid in navigation",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/document-title"},"duplicate-id":{description:"Ensures every id attribute value is unique",help:"id attribute value must be unique",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/duplicate-id"},"empty-heading":{description:"Ensures headings have discernible text",help:"Headings must not be empty",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/empty-heading"},"frame-title":{description:"Ensures <iframe> and <frame> elements contain a unique and non-empty title attribute",help:"Frames must have unique title attribute",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/frame-title"},"heading-order":{description:"Ensures the order of headings is semantically correct",help:"Heading levels should only increase by one",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/heading-order"},"html-lang":{description:"Ensures every HTML document has a lang attribute and its value is valid",help:"<html> element must have a valid lang attribute",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/html-lang"},"image-alt":{description:"Ensures <img> elements have alternate text or a role of none or presentation",help:"Images must have alternate text",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/image-alt"},"input-image-alt":{description:'Ensures <input type="image"> elements have alternate text',help:"Image buttons must have alternate text",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/input-image-alt"},"label-title-only":{description:"Ensures that every form element is not solely labeled using the title or aria-describedby attributes",help:"Form elements should have a visible label",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/label-title-only"},label:{description:"Ensures every form element has a label",help:"Form elements must have labels",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/label"},"layout-table":{description:"Ensures presentational <table> elements do not use <th>, <caption> elements or the summary attribute",help:"Layout tables must not use data table elements",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/layout-table"},"link-name":{description:"Ensures links have discernible text",help:"Links must have discernible text",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/link-name"},list:{description:"Ensures that lists are structured correctly",help:"<ul> and <ol> must only directly contain <li>, <script> or <template> elements",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/list"},listitem:{description:"Ensures <li> elements are used semantically",help:"<li> elements must be contained in a <ul> or <ol>",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/listitem"},marquee:{description:"Ensures <marquee> elements are not used",help:"<marquee> elements are deprecated and must not be used",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/marquee"},"meta-refresh":{description:'Ensures <meta http-equiv="refresh"> is not used',help:"Timed refresh must not exist",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/meta-refresh"},"meta-viewport":{description:'Ensures <meta name="viewport"> does not disable text scaling and zooming',help:"Zooming and scaling must not be disabled",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/meta-viewport"},"object-alt":{description:"Ensures <object> elements have alternate text",help:"<object> elements must have alternate text",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/object-alt"},radiogroup:{description:'Ensures related <input type="radio"> elements have a group and that the group designation is consistent',help:"Radio inputs with the same name attribute value must be part of a group",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/radiogroup"},region:{description:"Ensures all content is contained within a landmark region",help:"Content should be contained in a landmark region",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/region"},scope:{description:"Ensures the scope attribute is used correctly on tables",help:"scope attribute should be used correctly",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/scope"},"server-side-image-map":{description:"Ensures that server-side image maps are not used",help:"Server-side image maps must not be used",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/server-side-image-map"},"skip-link":{description:"Ensures the first link on the page is a skip link",help:"The page should have a skip link as its first link",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/skip-link"},tabindex:{description:"Ensures tabindex attribute values are not greater than 0",help:"Elements should not have tabindex greater than zero",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/tabindex"},"valid-lang":{description:"Ensures lang attributes have valid values",help:"lang attribute must have a valid value",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/valid-lang"},"video-caption":{description:"Ensures <video> elements have captions",help:"<video> elements must have captions",
helpUrl:"https://dequeuniversity.com/rules/axe/1.1/video-caption"},"video-description":{description:"Ensures <video> elements have audio descriptions",help:"<video> elements must have an audio description track",helpUrl:"https://dequeuniversity.com/rules/axe/1.1/video-description"}},checks:{accesskeys:{impact:"critical",messages:{pass:function(a){var b="Accesskey attribute value is unique";return b},fail:function(a){var b="Document has multiple elements with the same accesskey";return b}}},"non-empty-alt":{impact:"critical",messages:{pass:function(a){var b="Element has a non-empty alt attribute";return b},fail:function(a){var b="Element has no alt attribute or the alt attribute is empty";return b}}},"aria-label":{impact:"critical",messages:{pass:function(a){var b="aria-label attribute exists and is not empty";return b},fail:function(a){var b="aria-label attribute does not exist or is empty";return b}}},"aria-labelledby":{impact:"critical",messages:{pass:function(a){var b="aria-labelledby attribute exists and references elements that are visible to screen readers";return b},fail:function(a){var b="aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty or not visible";return b}}},"aria-allowed-attr":{impact:"critical",messages:{pass:function(a){var b="ARIA attributes are used correctly for the defined role";return b},fail:function(a){var b="ARIA attribute"+(a.data&&a.data.length>1?"s are":" is")+" not allowed:",c=a.data;if(c)for(var d,e=-1,f=c.length-1;f>e;)d=c[e+=1],b+=" "+d;return b}}},"aria-required-attr":{impact:"critical",messages:{pass:function(a){var b="All required ARIA attributes are present";return b},fail:function(a){var b="Required ARIA attribute"+(a.data&&a.data.length>1?"s":"")+" not present:",c=a.data;if(c)for(var d,e=-1,f=c.length-1;f>e;)d=c[e+=1],b+=" "+d;return b}}},"aria-required-children":{impact:"critical",messages:{pass:function(a){var b="Required ARIA children are present";return b},fail:function(a){var b="Required ARIA "+(a.data&&a.data.length>1?"children":"child")+" role not present:",c=a.data;if(c)for(var d,e=-1,f=c.length-1;f>e;)d=c[e+=1],b+=" "+d;return b}}},"aria-required-parent":{impact:"critical",messages:{pass:function(a){var b="Required ARIA parent role present";return b},fail:function(a){var b="Required ARIA parent"+(a.data&&a.data.length>1?"s":"")+" role not present:",c=a.data;if(c)for(var d,e=-1,f=c.length-1;f>e;)d=c[e+=1],b+=" "+d;return b}}},invalidrole:{impact:"critical",messages:{pass:function(a){var b="ARIA role is valid";return b},fail:function(a){var b="Role must be one of the valid ARIA roles";return b}}},abstractrole:{impact:"serious",messages:{pass:function(a){var b="Abstract roles are not used";return b},fail:function(a){var b="Abstract roles cannot be directly used";return b}}},"aria-valid-attr-value":{impact:"critical",messages:{pass:function(a){var b="ARIA attribute values are valid";return b},fail:function(a){var b="Invalid ARIA attribute value"+(a.data&&a.data.length>1?"s":"")+":",c=a.data;if(c)for(var d,e=-1,f=c.length-1;f>e;)d=c[e+=1],b+=" "+d;return b}}},"aria-valid-attr":{impact:"critical",messages:{pass:function(a){var b="ARIA attribute name"+(a.data&&a.data.length>1?"s":"")+" are valid";return b},fail:function(a){var b="Invalid ARIA attribute name"+(a.data&&a.data.length>1?"s":"")+":",c=a.data;if(c)for(var d,e=-1,f=c.length-1;f>e;)d=c[e+=1],b+=" "+d;return b}}},caption:{impact:"critical",messages:{pass:function(a){var b="The multimedia element has a captions track";return b},fail:function(a){var b="The multimedia element does not have a captions track";return b}}},exists:{impact:"minor",messages:{pass:function(a){var b="Element does not exist";return b},fail:function(a){var b="Element exists";return b}}},"non-empty-if-present":{impact:"critical",messages:{pass:function(a){var b="Element ";return b+=a.data?"has a non-empty value attribute":"does not have a value attribute"},fail:function(a){var b="Element has a value attribute and the value attribute is empty";return b}}},"non-empty-value":{impact:"critical",messages:{pass:function(a){var b="Element has a non-empty value attribute";return b},fail:function(a){var b="Element has no value attribute or the value attribute is empty";return b}}},"button-has-visible-text":{impact:"critical",messages:{pass:function(a){var b="Element has inner text that is visible to screen readers";return b},fail:function(a){var b="Element does not have inner text that is visible to screen readers";return b}}},"role-presentation":{impact:"moderate",messages:{pass:function(a){var b='Element\'s default semantics were overriden with role="presentation"';return b},fail:function(a){var b='Element\'s default semantics were not overridden with role="presentation"';return b}}},"role-none":{impact:"moderate",messages:{pass:function(a){var b='Element\'s default semantics were overriden with role="none"';return b},fail:function(a){var b='Element\'s default semantics were not overridden with role="none"';return b}}},"duplicate-img-label":{impact:"minor",messages:{pass:function(a){var b="Element does not duplicate existing text in <img> alt text";return b},fail:function(a){var b="Element contains <img> element with alt text that duplicates existing text";return b}}},"focusable-no-name":{impact:"serious",messages:{pass:function(a){var b="Element is not in tab order or has accessible text";return b},fail:function(a){var b="Element is in tab order and does not have accessible text";return b}}},"internal-link-present":{impact:"critical",messages:{pass:function(a){var b="Valid skip link found";return b},fail:function(a){var b="No valid skip link found";return b}}},"header-present":{impact:"moderate",messages:{pass:function(a){var b="Page has a header";return b},fail:function(a){var b="Page does not have a header";return b}}},landmark:{impact:"serious",messages:{pass:function(a){var b="Page has a landmark region";return b},fail:function(a){var b="Page does not have a landmark region";return b}}},"group-labelledby":{impact:"critical",messages:{pass:function(a){var b='All elements with the name "'+a.data.name+'" reference the same element with aria-labelledby';return b},fail:function(a){var b='All elements with the name "'+a.data.name+'" do not reference the same element with aria-labelledby';return b}}},fieldset:{impact:"critical",messages:{pass:function(a){var b="Element is contained in a fieldset";return b},fail:function(a){var b="",c=a.data&&a.data.failureCode;return b+="no-legend"===c?"Fieldset does not have a legend as its first child":"empty-legend"===c?"Legend does not have text that is visible to screen readers":"mixed-inputs"===c?"Fieldset contains unrelated inputs":"no-group-label"===c?"ARIA group does not have aria-label or aria-labelledby":"group-mixed-inputs"===c?"ARIA group contains unrelated inputs":"Element does not have a containing fieldset or ARIA group"}}},"color-contrast":{impact:"critical",messages:{pass:function(a){var b="";return b+=a.data&&a.data.contrastRatio?"Element has sufficient color contrast of "+a.data.contrastRatio:"Unable to determine contrast ratio"},fail:function(a){var b="Element has insufficient color contrast of "+a.data.contrastRatio+" (foreground color: "+a.data.fgColor+", background color: "+a.data.bgColor+", font size: "+a.data.fontSize+", font weight: "+a.data.fontWeight+")";return b}}},"consistent-columns":{impact:"critical",messages:{pass:function(a){var b="Table has consistent column widths";return b},fail:function(a){var b="Table does not have the same number of columns in every row";return b}}},"cell-no-header":{impact:"critical",messages:{pass:function(a){var b="All data cells have table headers";return b},fail:function(a){var b="Some data cells do not have table headers";return b}}},"headers-visible-text":{impact:"critical",messages:{pass:function(a){var b="Header cell has visible text";return b},fail:function(a){var b="Header cell does not have visible text";return b}}},"headers-attr-reference":{impact:"critical",messages:{pass:function(a){var b="headers attribute references elements that are visible to screen readers";return b},fail:function(a){var b="headers attribute references element that is not visible to screen readers";return b}}},"th-scope":{impact:"serious",messages:{pass:function(a){var b="<th> elements use scope attribute";return b},fail:function(a){var b="<th> elements must use scope attribute";return b}}},"no-caption":{impact:"serious",messages:{pass:function(a){var b="Table has a <caption>";return b},fail:function(a){var b="Table does not have a <caption>";return b}}},"th-headers-attr":{impact:"serious",messages:{pass:function(a){var b="<th> elements do not use headers attribute";return b},fail:function(a){var b="<th> elements should not use headers attribute";return b}}},"th-single-row-column":{impact:"serious",messages:{pass:function(a){var b="<th> elements are used when there is only a single row and single column of headers";return b},fail:function(a){var b="<th> elements should only be used when there is a single row and single column of headers";return b}}},"same-caption-summary":{impact:"moderate",messages:{pass:function(a){var b="Content of summary attribute and <caption> are not duplicated";return b},fail:function(a){var b="Content of summary attribute and <caption> element are indentical";return b}}},rowspan:{impact:"critical",messages:{pass:function(a){var b="Table does not have cells with rowspan attribute greater than 1";return b},fail:function(a){var b="Table has cells whose rowspan attribute is not equal to 1";return b}}},"structured-dlitems":{impact:"serious",messages:{pass:function(a){var b="When not empty, element has both <dt> and <dd> elements";return b},fail:function(a){var b="When not empty, element does not have at least one <dt> element followed by at least one <dd> element";return b}}},"only-dlitems":{impact:"serious",messages:{pass:function(a){var b="Element only has children that are <dt> or <dd> elements";return b},fail:function(a){var b="Element has children that are not <dt> or <dd> elements";return b}}},dlitem:{impact:"serious",messages:{pass:function(a){var b="Description list item has a <dl> parent element";return b},fail:function(a){var b="Description list item does not have a <dl> parent element";return b}}},"doc-has-title":{impact:"moderate",messages:{pass:function(a){var b="Document has a non-empty <title> element";return b},fail:function(a){var b="Document does not have a non-empty <title> element";return b}}},"duplicate-id":{impact:"critical",messages:{pass:function(a){var b="Document has no elements that share the same id attribute";return b},fail:function(a){var b="Document has multiple elements with the same id attribute: "+a.data;return b}}},"has-visible-text":{impact:"critical",messages:{pass:function(a){var b="Element has text that is visible to screen readers";return b},fail:function(a){var b="Element does not have text that is visible to screen readers";return b}}},"non-empty-title":{impact:"critical",messages:{pass:function(a){var b="Element has a title attribute";return b},fail:function(a){var b="Element has no title attribute or the title attribute is empty";return b}}},"unique-frame-title":{impact:"serious",messages:{pass:function(a){var b="Element's title attribute is unique";return b},fail:function(a){var b="Element's title attribute is not unique";return b}}},"heading-order":{impact:"minor",messages:{pass:function(a){var b="Heading order valid";return b},fail:function(a){var b="Heading order invalid";return b}}},"has-lang":{impact:"serious",messages:{pass:function(a){var b="The <html> element has a lang attribute";return b},fail:function(a){var b="The <html> element does not have a lang attribute";return b}}},"valid-lang":{impact:"serious",messages:{pass:function(a){var b="Value of lang attribute is included in the list of valid languages";return b},fail:function(a){var b="Value of lang attribute not included in the list of valid languages";return b}}},"has-alt":{impact:"critical",messages:{pass:function(a){var b="Element has an alt attribute";return b},fail:function(a){var b="Element does not have an alt attribute";return b}}},"title-only":{impact:"serious",messages:{pass:function(a){var b="Form element does not solely use title attribute for its label";return b},fail:function(a){var b="Only title used to generate label for form element";return b}}},"implicit-label":{impact:"critical",messages:{pass:function(a){var b="Form element has an implicit (wrapped) <label>";return b},fail:function(a){var b="Form element does not have an implicit (wrapped) <label>";return b}}},"explicit-label":{impact:"critical",messages:{pass:function(a){var b="Form element has an explicit <label>";return b},fail:function(a){var b="Form element does not have an explicit <label>";return b}}},"help-same-as-label":{impact:"minor",messages:{pass:function(a){var b="Help text (title or aria-describedby) does not duplicate label text";return b},fail:function(a){var b="Help text (title or aria-describedby) text is the same as the label text";return b}}},"multiple-label":{impact:"serious",messages:{pass:function(a){var b="Form element does not have multiple <label> elements";return b},fail:function(a){var b="Form element has multiple <label> elements";return b}}},"has-th":{impact:"serious",messages:{pass:function(a){var b="Layout table does not use <th> elements";return b},fail:function(a){var b="Layout table uses <th> elements";return b}}},"has-caption":{impact:"serious",messages:{pass:function(a){var b="Layout table does not use <caption> element";return b},fail:function(a){var b="Layout table uses <caption> element";return b}}},"has-summary":{impact:"serious",messages:{pass:function(a){var b="Layout table does not use summary attribute";return b},fail:function(a){var b="Layout table uses summary attribute";return b}}},"only-listitems":{impact:"serious",messages:{pass:function(a){var b="List element only has children that are <li>, <script> or <template> elements";return b},fail:function(a){var b="List element has children that are not <li>, <script> or <template> elements";return b}}},listitem:{impact:"critical",messages:{pass:function(a){var b="List item has a <ul> or <ol> parent element";return b},fail:function(a){var b="List item does not have a <ul> or <ol> parent element";return b}}},"meta-refresh":{impact:"critical",messages:{pass:function(a){var b="<meta> tag does not immediately refresh the page";return b},fail:function(a){var b="<meta> tag forces timed refresh of page";return b}}},"meta-viewport":{impact:"critical",messages:{pass:function(a){var b="<meta> tag does not disable zooming";return b},fail:function(a){var b="<meta> tag disables zooming";return b}}},region:{impact:"moderate",messages:{pass:function(a){var b="Content contained by ARIA landmark";return b},fail:function(a){var b="Content not contained by an ARIA landmark";return b}}},"html5-scope":{impact:"serious",messages:{pass:function(a){var b="Scope attribute is only used on table header elements (<th>)";return b},fail:function(a){var b="In HTML 5, scope attributes may only be used on table header elements (<th>)";return b}}},"html4-scope":{impact:"serious",messages:{pass:function(a){var b="Scope attribute is only used on table cell elements (<th> and <td>)";return b},fail:function(a){var b="In HTML 4, the scope attribute may only be used on table cell elements (<th> and <td>)";return b}}},"scope-value":{impact:"critical",messages:{pass:function(a){var b="Scope attribute is used correctly";return b},fail:function(a){var b="The value of the scope attribute may only be 'row' or 'col'";return b}}},"skip-link":{impact:"critical",messages:{pass:function(a){var b="Valid skip link found";return b},fail:function(a){var b="No valid skip link found";return b}}},tabindex:{impact:"serious",messages:{pass:function(a){var b="Element does not have a tabindex greater than 0";return b},fail:function(a){var b="Element has a tabindex greater than 0";return b}}},description:{impact:"serious",messages:{pass:function(a){var b="The multimedia element has an audio description track";return b},fail:function(a){var b="The multimedia element does not have an audio description track";return b}}}},failureSummaries:{any:{failureMessage:function(a){var b="Fix any of the following:",c=a;if(c)for(var d,e=-1,f=c.length-1;f>e;)d=c[e+=1],b+="\n  "+d.split("\n").join("\n  ");return b}},none:{failureMessage:function(a){var b="Fix all of the following:",c=a;if(c)for(var d,e=-1,f=c.length-1;f>e;)d=c[e+=1],b+="\n  "+d.split("\n").join("\n  ");return b}}}},rules:[{id:"accesskeys",selector:"[accesskey]",tags:["wcag2a","wcag211"],all:[],any:[],none:["accesskeys"]},{id:"area-alt",selector:"map area[href]",excludeHidden:!1,tags:["wcag2a","wcag111","section508","section508a"],all:[],any:["non-empty-alt","aria-label","aria-labelledby"],none:[]},{id:"aria-allowed-attr",tags:["wcag2a","wcag411"],all:[],any:["aria-allowed-attr"],none:[]},{id:"aria-required-attr",selector:"[role]",tags:["wcag2a","wcag411"],all:[],any:["aria-required-attr"],none:[]},{id:"aria-required-children",selector:"[role]",tags:["wcag2a","wcag411"],all:[],any:["aria-required-children"],none:[]},{id:"aria-required-parent",selector:"[role]",tags:["wcag2a","wcag411"],all:[],any:["aria-required-parent"],none:[]},{id:"aria-roles",selector:"[role]",tags:["wcag2a","wcag411"],all:[],any:[],none:["invalidrole","abstractrole"]},{id:"aria-valid-attr-value",tags:["wcag2a","wcag411"],all:[],any:[{options:[],id:"aria-valid-attr-value"}],none:[]},{id:"aria-valid-attr",tags:["wcag2a","wcag411"],all:[],any:[{options:[],id:"aria-valid-attr"}],none:[]},{id:"audio-caption",selector:"audio",excludeHidden:!1,tags:["wcag2a","wcag122","section508","section508a"],all:[],any:[],none:["caption"]},{id:"blink",selector:"blink",tags:["wcag2a","wcag222"],all:[],any:[],none:["exists"]},{id:"button-name",selector:'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]',tags:["wcag2a","wcag412","section508","section508a"],all:[],any:["non-empty-if-present","non-empty-value","button-has-visible-text","aria-label","aria-labelledby","role-presentation","role-none"],none:["duplicate-img-label","focusable-no-name"]},{id:"bypass",selector:"html",pageLevel:!0,matches:function(a){return!!a.querySelector("a[href]")},tags:["wcag2a","wcag241","section508","section508o"],all:[],any:["internal-link-present","header-present","landmark"],none:[]},{id:"checkboxgroup",selector:"input[type=checkbox][name]",tags:["wcag2a","wcag131"],all:[],any:["group-labelledby","fieldset"],none:[]},{id:"color-contrast",selector:"*",tags:["wcag2aa","wcag143"],all:[],any:["color-contrast"],none:[]},{id:"data-table",selector:"table",matches:function(a){return R.table.isDataTable(a)},tags:["wcag2a","wcag131"],all:[],any:["consistent-columns"],none:["cell-no-header","headers-visible-text","headers-attr-reference","th-scope","no-caption","th-headers-attr","th-single-row-column","same-caption-summary","rowspan"]},{id:"definition-list",selector:"dl",tags:["wcag2a","wcag131"],all:[],any:[],none:["structured-dlitems","only-dlitems"]},{id:"dlitem",selector:"dd, dt",tags:["wcag2a","wcag131"],all:[],any:["dlitem"],none:[]},{id:"document-title",selector:"html",tags:["wcag2a","wcag242"],all:[],any:["doc-has-title"],none:[]},{id:"duplicate-id",selector:"[id]",tags:["wcag2a","wcag411"],all:[],any:["duplicate-id"],none:[]},{id:"empty-heading",selector:'h1, h2, h3, h4, h5, h6, [role="heading"]',tags:["wcag2a","wcag131"],all:[],any:["has-visible-text","role-presentation","role-none"],none:[]},{id:"frame-title",selector:"frame, iframe",tags:["wcag2a","wcag241"],all:[],any:["non-empty-title"],none:["unique-frame-title"]},{id:"heading-order",selector:"h1,h2,h3,h4,h5,h6,[role=heading]",enabled:!1,tags:["best-practice"],all:[],any:["heading-order"],none:[]},{id:"html-lang",selector:"html",tags:["wcag2a","wcag311"],all:[],any:["has-lang"],none:[{options:["aa","ab","ae","af","ak","am","an","ar","as","av","ay","az","ba","be","bg","bh","bi","bm","bn","bo","br","bs","ca","ce","ch","co","cr","cs","cu","cv","cy","da","de","dv","dz","ee","el","en","eo","es","et","eu","fa","ff","fi","fj","fo","fr","fy","ga","gd","gl","gn","gu","gv","ha","he","hi","ho","hr","ht","hu","hy","hz","ia","id","ie","ig","ii","ik","in","io","is","it","iu","iw","ja","ji","jv","jw","ka","kg","ki","kj","kk","kl","km","kn","ko","kr","ks","ku","kv","kw","ky","la","lb","lg","li","ln","lo","lt","lu","lv","mg","mh","mi","mk","ml","mn","mo","mr","ms","mt","my","na","nb","nd","ne","ng","nl","nn","no","nr","nv","ny","oc","oj","om","or","os","pa","pi","pl","ps","pt","qu","rm","rn","ro","ru","rw","sa","sc","sd","se","sg","sh","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sv","sw","ta","te","tg","th","ti","tk","tl","tn","to","tr","ts","tt","tw","ty","ug","uk","ur","uz","ve","vi","vo","wa","wo","xh","yi","yo","za","zh","zu"],id:"valid-lang"}]},{id:"image-alt",selector:"img",tags:["wcag2a","wcag111","section508","section508a"],all:[],any:["has-alt","aria-label","aria-labelledby","non-empty-title","role-presentation","role-none"],none:[]},{id:"input-image-alt",selector:'input[type="image"]',tags:["wcag2a","wcag111","section508","section508a"],all:[],any:["non-empty-alt","aria-label","aria-labelledby"],none:[]},{id:"label-title-only",selector:"input:not([type='hidden']):not([type='image']):not([type='button']):not([type='submit']):not([type='reset']), select, textarea",enabled:!1,tags:["best-practice"],all:[],any:[],none:["title-only"]},{id:"label",selector:"input:not([type='hidden']):not([type='image']):not([type='button']):not([type='submit']):not([type='reset']), select, textarea",tags:["wcag2a","wcag332","wcag131","section508","section508n"],all:[],any:["aria-label","aria-labelledby","implicit-label","explicit-label","non-empty-title"],none:["help-same-as-label","multiple-label"]},{id:"layout-table",selector:"table",matches:function(a){return!R.table.isDataTable(a)},tags:["wcag2a","wcag131"],all:[],any:[],none:["has-th","has-caption","has-summary"]},{id:"link-name",selector:'a[href]:not([role="button"]), [role=link][href]',tags:["wcag2a","wcag111","wcag412","section508","section508a"],all:[],any:["has-visible-text","aria-label","aria-labelledby","role-presentation","role-none"],none:["duplicate-img-label","focusable-no-name"]},{id:"list",selector:"ul, ol",tags:["wcag2a","wcag131"],all:[],any:[],none:["only-listitems"]},{id:"listitem",selector:"li",tags:["wcag2a","wcag131"],all:[],any:["listitem"],none:[]},{id:"marquee",selector:"marquee",tags:["wcag2a","wcag222","section508","section508j"],all:[],any:[],none:["exists"]},{id:"meta-refresh",selector:'meta[http-equiv="refresh"]',excludeHidden:!1,tags:["wcag2a","wcag2aaa","wcag221","wcag224","wcag325"],all:[],any:["meta-refresh"],none:[]},{id:"meta-viewport",selector:'meta[name="viewport"]',excludeHidden:!1,tags:["wcag2aa","wcag144"],all:[],any:["meta-viewport"],none:[]},{id:"object-alt",selector:"object",tags:["wcag2a","wcag111"],all:[],any:["has-visible-text"],none:[]},{id:"radiogroup",selector:"input[type=radio][name]",tags:["wcag2a","wcag131"],all:[],any:["group-labelledby","fieldset"],none:[]},{id:"region",selector:"html",pageLevel:!0,enabled:!1,tags:["best-practice"],all:[],any:["region"],none:[]},{id:"scope",selector:"[scope]",enabled:!1,tags:["best-practice"],all:[],any:["html5-scope","html4-scope"],none:["scope-value"]},{id:"server-side-image-map",selector:"img[ismap]",tags:["wcag2a","wcag211","section508","section508f"],all:[],any:[],none:["exists"]},{id:"skip-link",selector:"a[href]",pageLevel:!0,enabled:!1,tags:["best-practice"],all:[],any:["skip-link"],none:[]},{id:"tabindex",selector:"[tabindex]",tags:["best-practice"],all:[],any:["tabindex"],none:[]},{id:"valid-lang",selector:"[lang]:not(html), [xml\\:lang]:not(html)",tags:["wcag2aa","wcag312"],all:[],any:[],none:[{options:["aa","ab","ae","af","ak","am","an","ar","as","av","ay","az","ba","be","bg","bh","bi","bm","bn","bo","br","bs","ca","ce","ch","co","cr","cs","cu","cv","cy","da","de","dv","dz","ee","el","en","eo","es","et","eu","fa","ff","fi","fj","fo","fr","fy","ga","gd","gl","gn","gu","gv","ha","he","hi","ho","hr","ht","hu","hy","hz","ia","id","ie","ig","ii","ik","in","io","is","it","iu","iw","ja","ji","jv","jw","ka","kg","ki","kj","kk","kl","km","kn","ko","kr","ks","ku","kv","kw","ky","la","lb","lg","li","ln","lo","lt","lu","lv","mg","mh","mi","mk","ml","mn","mo","mr","ms","mt","my","na","nb","nd","ne","ng","nl","nn","no","nr","nv","ny","oc","oj","om","or","os","pa","pi","pl","ps","pt","qu","rm","rn","ro","ru","rw","sa","sc","sd","se","sg","sh","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sv","sw","ta","te","tg","th","ti","tk","tl","tn","to","tr","ts","tt","tw","ty","ug","uk","ur","uz","ve","vi","vo","wa","wo","xh","yi","yo","za","zh","zu"],id:"valid-lang"}]},{id:"video-caption",selector:"video",tags:["wcag2a","wcag122","wcag123","section508","section508a"],all:[],any:[],none:["caption"]},{id:"video-description",selector:"video",tags:["wcag2aa","wcag125","section508","section508a"],all:[],any:[],none:["description"]}],checks:[{id:"abstractrole",evaluate:function(a,b){return"abstract"===R.aria.getRoleType(a.getAttribute("role"))}},{id:"aria-allowed-attr",matches:function(a){var b=a.getAttribute("role");b||(b=R.aria.implicitRole(a));var c=R.aria.allowedAttr(b);if(b&&c){var d=/^aria-/;if(a.hasAttributes())for(var e=a.attributes,f=0,g=e.length;g>f;f++)if(d.test(e[f].nodeName))return!0}return!1},evaluate:function(a,b){var c,d,e,f=[],g=a.getAttribute("role"),h=a.attributes;if(g||(g=R.aria.implicitRole(a)),e=R.aria.allowedAttr(g),g&&e)for(var i=0,j=h.length;j>i;i++)c=h[i],d=c.nodeName,R.aria.validateAttr(d)&&-1===e.indexOf(d)&&f.push(d+'="'+c.nodeValue+'"');return f.length?(this.data(f),!1):!0}},{id:"invalidrole",evaluate:function(a,b){return!R.aria.isValidRole(a.getAttribute("role"))}},{id:"aria-required-attr",evaluate:function(a,b){var c=[];if(a.hasAttributes()){var d,e=a.getAttribute("role"),f=R.aria.requiredAttr(e);if(e&&f)for(var g=0,h=f.length;h>g;g++)d=f[g],a.getAttribute(d)||c.push(d)}return c.length?(this.data(c),!1):!0}},{id:"aria-required-children",evaluate:function(a,b){function c(a,b,c){if(null===a)return!1;var d=g(b),e=['[role="'+b+'"]'];return d&&(e=e.concat(d)),e=e.join(","),c?h(a,e)||!!a.querySelector(e):!!a.querySelector(e)}function d(a,b){var d,e;for(d=0,e=a.length;e>d;d++)if(null!==a[d]&&c(a[d],b,!0))return!0;return!1}function e(a,b,e){var f,g=b.length,h=[],j=i(a,"aria-owns");for(f=0;g>f;f++){var k=b[f];if(c(a,k)||d(j,k)){if(!e)return null}else e&&h.push(k)}return h.length?h:!e&&b.length?b:null}var f=R.aria.requiredOwned,g=R.aria.implicitNodes,h=R.utils.matchesSelector,i=R.dom.idrefs,j=a.getAttribute("role"),k=f(j);if(!k)return!0;var l=!1,m=k.one;if(!m){var l=!0;m=k.all}var n=e(a,m,l);return n?(this.data(n),!1):!0}},{id:"aria-required-parent",evaluate:function(a,c){function d(a){var b=R.aria.implicitNodes(a)||[];return b.concat('[role="'+a+'"]').join(",")}function e(a,b,c){var e,f,g=a.getAttribute("role"),h=[];if(b||(b=R.aria.requiredContext(g)),!b)return null;for(e=0,f=b.length;f>e;e++){if(c&&R.utils.matchesSelector(a,d(b[e])))return null;if(R.dom.findUp(a,d(b[e])))return null;h.push(b[e])}return h}function f(a){for(var c=[],d=null;a;)a.id&&(d=b.querySelector("[aria-owns~="+R.utils.escapeSelector(a.id)+"]"),d&&c.push(d)),a=a.parentNode;return c.length?c:null}var g=e(a);if(!g)return!0;var h=f(a);if(h)for(var i=0,j=h.length;j>i;i++)if(g=e(h[i],g,!0),!g)return!0;return this.data(g),!1}},{id:"aria-valid-attr-value",matches:function(a){var b=/^aria-/;if(a.hasAttributes())for(var c=a.attributes,d=0,e=c.length;e>d;d++)if(b.test(c[d].nodeName))return!0;return!1},evaluate:function(a,b){b=Array.isArray(b)?b:[];for(var c,d,e=[],f=/^aria-/,g=a.attributes,h=0,i=g.length;i>h;h++)c=g[h],d=c.nodeName,-1===b.indexOf(d)&&f.test(d)&&!R.aria.validateAttrValue(a,d)&&e.push(d+'="'+c.nodeValue+'"');return e.length?(this.data(e),!1):!0},options:[]},{id:"aria-valid-attr",matches:function(a){var b=/^aria-/;if(a.hasAttributes())for(var c=a.attributes,d=0,e=c.length;e>d;d++)if(b.test(c[d].nodeName))return!0;return!1},evaluate:function(a,b){b=Array.isArray(b)?b:[];for(var c,d=[],e=/^aria-/,f=a.attributes,g=0,h=f.length;h>g;g++)c=f[g].nodeName,-1===b.indexOf(c)&&e.test(c)&&!R.aria.validateAttr(c)&&d.push(c);return d.length?(this.data(d),!1):!0},options:[]},{id:"color-contrast",matches:function(a){var c=a.nodeName,d=a.type,e=b;if("INPUT"===c)return-1===["hidden","range","color","checkbox","radio","image"].indexOf(d)&&!a.disabled;if("SELECT"===c)return!!a.options.length&&!a.disabled;if("TEXTAREA"===c)return!a.disabled;if("OPTION"===c)return!1;if("BUTTON"===c&&a.disabled)return!1;if("LABEL"===c){var f=a.htmlFor&&e.getElementById(a.htmlFor);if(f&&f.disabled)return!1;var f=a.querySelector('input:not([type="hidden"]):not([type="image"]):not([type="button"]):not([type="submit"]):not([type="reset"]), select, textarea');if(f&&f.disabled)return!1}if(a.id){var f=e.querySelector("[aria-labelledby~="+R.utils.escapeSelector(a.id)+"]");if(f&&f.disabled)return!1}if(""===R.text.visible(a,!1,!0))return!1;var g,h,i=b.createRange(),j=a.childNodes,k=j.length;for(h=0;k>h;h++)g=j[h],3===g.nodeType&&""!==R.text.sanitize(g.nodeValue)&&i.selectNodeContents(g);var l=i.getClientRects();for(k=l.length,h=0;k>h;h++)if(R.dom.visuallyOverlaps(l[h],a))return!0;return!1},evaluate:function(b,c){var d=[],e=R.color.getBackgroundColor(b,d),f=R.color.getForegroundColor(b);if(null===f||null===e)return!0;var g=a.getComputedStyle(b),h=parseFloat(g.getPropertyValue("font-size")),i=g.getPropertyValue("font-weight"),j=-1!==["bold","bolder","600","700","800","900"].indexOf(i),k=R.color.hasValidContrastRatio(e,f,h,j);return this.data({fgColor:f.toHexString(),bgColor:e.toHexString(),contrastRatio:k.contrastRatio.toFixed(2),fontSize:(72*h/96).toFixed(1)+"pt",fontWeight:j?"bold":"normal"}),k.isValid||this.relatedNodes(d),k.isValid}},{id:"fieldset",evaluate:function(a,c){function d(a,b){return R.utils.toArray(a.querySelectorAll('select,textarea,button,input:not([name="'+b+'"]):not([type="hidden"])'))}function e(a,b){var c=a.firstElementChild;if(!c||"LEGEND"!==c.nodeName)return j.relatedNodes([a]),i="no-legend",!1;if(!R.text.accessibleText(c))return j.relatedNodes([c]),i="empty-legend",!1;var e=d(a,b);return e.length?(j.relatedNodes(e),i="mixed-inputs",!1):!0}function f(a,b){var c=R.dom.idrefs(a,"aria-labelledby").some(function(a){return a&&R.text.accessibleText(a)}),e=a.getAttribute("aria-label");if(!(c||e&&R.text.sanitize(e)))return j.relatedNodes(a),i="no-group-label",!1;var f=d(a,b);return f.length?(j.relatedNodes(f),i="group-mixed-inputs",!1):!0}function g(a,b){return R.utils.toArray(a).filter(function(a){return a!==b})}function h(c){var d=R.utils.escapeSelector(a.name),h=b.querySelectorAll('input[type="'+R.utils.escapeSelector(a.type)+'"][name="'+d+'"]');if(h.length<2)return!0;var k=R.dom.findUp(c,"fieldset"),l=R.dom.findUp(c,'[role="group"]'+("radio"===a.type?',[role="radiogroup"]':""));return l||k?k?e(k,d):f(l,d):(i="no-group",j.relatedNodes(g(h,c)),!1)}var i,j=this,k={name:a.getAttribute("name"),type:a.getAttribute("type")},l=h(a);return l||(k.failureCode=i),this.data(k),l},after:function(a,b){var c={};return a.filter(function(a){if(a.result)return!0;var b=a.data;if(b){if(c[b.type]=c[b.type]||{},!c[b.type][b.name])return c[b.type][b.name]=[b],!0;var d=c[b.type][b.name].some(function(a){return a.failureCode===b.failureCode});return d||c[b.type][b.name].push(b),!d}return!1})}},{id:"group-labelledby",evaluate:function(a,c){this.data({name:a.getAttribute("name"),type:a.getAttribute("type")});var d=b.querySelectorAll('input[type="'+R.utils.escapeSelector(a.type)+'"][name="'+R.utils.escapeSelector(a.name)+'"]');return d.length<=1?!0:0!==[].map.call(d,function(a){var b=a.getAttribute("aria-labelledby");return b?b.split(/\s+/):[]}).reduce(function(a,b){return a.filter(function(a){return-1!==b.indexOf(a)})}).filter(function(a){
var c=b.getElementById(a);return c&&R.text.accessibleText(c)}).length},after:function(a,b){var c={};return a.filter(function(a){var b=a.data;return b&&(c[b.type]=c[b.type]||{},!c[b.type][b.name])?(c[b.type][b.name]=!0,!0):!1})}},{id:"accesskeys",evaluate:function(a,b){return this.data(a.getAttribute("accesskey")),this.relatedNodes([a]),!0},after:function(a,b){var c={};return a.filter(function(a){return c[a.data]?(c[a.data].relatedNodes.push(a.relatedNodes[0]),!1):(c[a.data]=a,a.relatedNodes=[],!0)}).map(function(a){return a.result=!!a.relatedNodes.length,a})}},{id:"focusable-no-name",evaluate:function(a,b){var c=a.getAttribute("tabindex"),d=R.dom.isFocusable(a)&&c>-1;return d?!R.text.accessibleText(a):!1}},{id:"tabindex",evaluate:function(a,b){return a.tabIndex<=0}},{id:"duplicate-img-label",evaluate:function(a,b){for(var c=a.querySelectorAll("img"),d=R.text.visible(a,!0),e=0,f=c.length;f>e;e++){var g=R.text.accessibleText(c[e]);if(g===d&&""!==d)return!0}return!1},enabled:!1},{id:"explicit-label",evaluate:function(a,c){var d=b.querySelector('label[for="'+R.utils.escapeSelector(a.id)+'"]');return d?!!R.text.accessibleText(d):!1},selector:"[id]"},{id:"help-same-as-label",evaluate:function(a,b){var c=R.text.label(a),d=a.getAttribute("title");if(!c)return!1;if(!d&&(d="",a.getAttribute("aria-describedby"))){var e=R.dom.idrefs(a,"aria-describedby");d=e.map(function(a){return a?R.text.accessibleText(a):""}).join("")}return R.text.sanitize(d)===R.text.sanitize(c)},enabled:!1},{id:"implicit-label",evaluate:function(a,b){var c=R.dom.findUp(a,"label");return c?!!R.text.accessibleText(c):!1}},{id:"multiple-label",evaluate:function(a,c){for(var d=[].slice.call(b.querySelectorAll('label[for="'+R.utils.escapeSelector(a.id)+'"]')),e=a.parentNode;e;)"LABEL"===e.tagName&&-1===d.indexOf(e)&&d.push(e),e=e.parentNode;return this.relatedNodes(d),d.length>1}},{id:"title-only",evaluate:function(a,b){var c=R.text.label(a);return!(c||!a.getAttribute("title")&&!a.getAttribute("aria-describedby"))}},{id:"has-lang",evaluate:function(a,b){return a.hasAttribute("lang")||a.hasAttribute("xml:lang")}},{id:"valid-lang",options:["aa","ab","ae","af","ak","am","an","ar","as","av","ay","az","ba","be","bg","bh","bi","bm","bn","bo","br","bs","ca","ce","ch","co","cr","cs","cu","cv","cy","da","de","dv","dz","ee","el","en","eo","es","et","eu","fa","ff","fi","fj","fo","fr","fy","ga","gd","gl","gn","gu","gv","ha","he","hi","ho","hr","ht","hu","hy","hz","ia","id","ie","ig","ii","ik","in","io","is","it","iu","iw","ja","ji","jv","jw","ka","kg","ki","kj","kk","kl","km","kn","ko","kr","ks","ku","kv","kw","ky","la","lb","lg","li","ln","lo","lt","lu","lv","mg","mh","mi","mk","ml","mn","mo","mr","ms","mt","my","na","nb","nd","ne","ng","nl","nn","no","nr","nv","ny","oc","oj","om","or","os","pa","pi","pl","ps","pt","qu","rm","rn","ro","ru","rw","sa","sc","sd","se","sg","sh","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sv","sw","ta","te","tg","th","ti","tk","tl","tn","to","tr","ts","tt","tw","ty","ug","uk","ur","uz","ve","vi","vo","wa","wo","xh","yi","yo","za","zh","zu"],evaluate:function(a,b){var c=(a.getAttribute("lang")||"").trim().toLowerCase(),d=(a.getAttribute("xml:lang")||"").trim().toLowerCase(),e=[];return(b||[]).forEach(function(a){a=a.toLowerCase(),!c||c!==a&&0!==c.indexOf(a.toLowerCase()+"-")||(c=null),!d||d!==a&&0!==d.indexOf(a.toLowerCase()+"-")||(d=null)}),d&&e.push('xml:lang="'+d+'"'),c&&e.push('lang="'+c+'"'),e.length?(this.data(e),!0):!1}},{id:"dlitem",evaluate:function(a,b){return"DL"===a.parentNode.tagName}},{id:"has-listitem",evaluate:function(a,b){var c=a.children;if(0===c.length)return!0;for(var d=0;d<c.length;d++)if("LI"===c[d].nodeName)return!1;return!0}},{id:"listitem",evaluate:function(a,b){return-1!==["UL","OL"].indexOf(a.parentNode.tagName)}},{id:"only-dlitems",evaluate:function(a,b){for(var c,d=[],e=a.childNodes,f=!1,g=0;g<e.length;g++)c=e[g],1===c.nodeType&&"DT"!==c.nodeName&&"DD"!==c.nodeName&&"SCRIPT"!==c.nodeName&&"TEMPLATE"!==c.nodeName?d.push(c):3===c.nodeType&&""!==c.nodeValue.trim()&&(f=!0);d.length&&this.relatedNodes(d);var h=!!d.length||f;return h}},{id:"only-listitems",evaluate:function(a,b){for(var c,d=[],e=a.childNodes,f=!1,g=0;g<e.length;g++)c=e[g],1===c.nodeType&&"LI"!==c.nodeName&&"SCRIPT"!==c.nodeName&&"TEMPLATE"!==c.nodeName?d.push(c):3===c.nodeType&&""!==c.nodeValue.trim()&&(f=!0);return d.length&&this.relatedNodes(d),!!d.length||f}},{id:"structured-dlitems",evaluate:function(a,b){var c=a.children;if(!c||!c.length)return!1;for(var d=!1,e=!1,f=0;f<c.length;f++){if("DT"===c[f].nodeName&&(d=!0),d&&"DD"===c[f].nodeName)return!1;"DD"===c[f].nodeName&&(e=!0)}return d||e}},{id:"caption",evaluate:function(a,b){return!a.querySelector("track[kind=captions]")}},{id:"description",evaluate:function(a,b){return!a.querySelector("track[kind=descriptions]")}},{id:"meta-viewport",evaluate:function(a,b){for(var c,d=a.getAttribute("content")||"",e=d.split(/[;,]/),f={},g=0,h=e.length;h>g;g++){c=e[g].split("=");var i=c.shift();i&&c.length&&(f[i.trim()]=c.join("=").trim())}return f["maximum-scale"]&&parseFloat(f["maximum-scale"])<5?!1:"no"===f["user-scalable"]?!1:!0}},{id:"header-present",selector:"html",evaluate:function(a,b){return!!a.querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]')}},{id:"heading-order",evaluate:function(a,b){var c=a.getAttribute("aria-level");if(null!==c)return this.data(parseInt(c,10)),!0;var d=a.tagName.match(/H(\d)/);return d?(this.data(parseInt(d[1],10)),!0):!0},after:function(a,b){if(a.length<2)return a;for(var c=a[0].data,d=1;d<a.length;d++)a[d].result&&a[d].data>c+1&&(a[d].result=!1),c=a[d].data;return a}},{id:"internal-link-present",selector:"html",evaluate:function(a,b){return!!a.querySelector('a[href^="#"]')}},{id:"landmark",selector:"html",evaluate:function(a,b){return!!a.querySelector('[role="main"]')}},{id:"meta-refresh",evaluate:function(a,b){var c=a.getAttribute("content")||"",d=c.split(/[;,]/);return""===c||"0"===d[0]}},{id:"region",evaluate:function(a,b){function c(a){return h&&R.dom.isFocusable(R.dom.getElementByReference(h,"href"))&&h===a}function d(a){var b=a.getAttribute("role");return b&&-1!==g.indexOf(b)}function e(a){return d(a)?null:c(a)?f(a):R.dom.isVisible(a,!0)&&(R.text.visible(a,!0,!0)||R.dom.isVisualContent(a))?a:f(a)}function f(a){var b=R.utils.toArray(a.children);return 0===b.length?[]:b.map(e).filter(function(a){return null!==a}).reduce(function(a,b){return a.concat(b)},[])}var g=R.aria.getRolesByType("landmark"),h=a.querySelector("a[href]"),i=f(a);return this.relatedNodes(i),!i.length},after:function(a,b){return[a[0]]}},{id:"skip-link",selector:"a[href]",evaluate:function(a,b){return R.dom.isFocusable(R.dom.getElementByReference(a,"href"))},after:function(a,b){return[a[0]]}},{id:"unique-frame-title",evaluate:function(a,b){return this.data(a.title),!0},after:function(a,b){var c={};return a.forEach(function(a){c[a.data]=void 0!==c[a.data]?++c[a.data]:0}),a.filter(function(a){return!!c[a.data]})}},{id:"aria-label",evaluate:function(a,b){var c=a.getAttribute("aria-label");return!!(c?R.text.sanitize(c).trim():"")}},{id:"aria-labelledby",evaluate:function(a,b){var c,d,e=R.dom.idrefs(a,"aria-labelledby"),f=e.length;for(d=0;f>d;d++)if(c=e[d],c&&R.text.accessibleText(c).trim())return!0;return!1}},{id:"button-has-visible-text",evaluate:function(a,b){return R.text.accessibleText(a).length>0},selector:'button, [role="button"]:not(input)'},{id:"doc-has-title",evaluate:function(a,c){var d=b.title;return!!(d?R.text.sanitize(d).trim():"")}},{id:"duplicate-id",evaluate:function(a,c){for(var d=b.querySelectorAll('[id="'+R.utils.escapeSelector(a.id)+'"]'),e=[],f=0;f<d.length;f++)d[f]!==a&&e.push(d[f]);return e.length&&this.relatedNodes(e),this.data(a.getAttribute("id")),d.length<=1},after:function(a,b){var c=[];return a.filter(function(a){return-1===c.indexOf(a.data)?(c.push(a.data),!0):!1})}},{id:"exists",evaluate:function(a,b){return!0}},{id:"has-alt",evaluate:function(a,b){return a.hasAttribute("alt")}},{id:"has-visible-text",evaluate:function(a,b){return R.text.accessibleText(a).length>0}},{id:"non-empty-alt",evaluate:function(a,b){var c=a.getAttribute("alt");return!!(c?R.text.sanitize(c).trim():"")}},{id:"non-empty-if-present",evaluate:function(a,b){var c=a.getAttribute("value");return this.data(c),null===c||""!==R.text.sanitize(c).trim()},selector:'[type="submit"], [type="reset"]'},{id:"non-empty-title",evaluate:function(a,b){var c=a.getAttribute("title");return!!(c?R.text.sanitize(c).trim():"")}},{id:"non-empty-value",evaluate:function(a,b){var c=a.getAttribute("value");return!!(c?R.text.sanitize(c).trim():"")},selector:'[type="button"]'},{id:"role-none",evaluate:function(a,b){return"none"===a.getAttribute("role")}},{id:"role-presentation",evaluate:function(a,b){return"presentation"===a.getAttribute("role")}},{id:"cell-no-header",evaluate:function(a,b){for(var c,d,e=[],f=0,g=a.rows.length;g>f;f++){c=a.rows[f];for(var h=0,i=c.cells.length;i>h;h++)d=c.cells[h],!R.table.isDataCell(d)||R.aria.label(d)||R.table.getHeaders(d).length||e.push(d)}return e.length?(this.relatedNodes(e),!0):!1}},{id:"consistent-columns",evaluate:function(a,b){for(var c,d=R.table.toArray(a),e=[],f=0,g=d.length;g>f;f++)0===f?c=d[f].length:c!==d[f].length&&e.push(a.rows[f]);return!e.length}},{id:"has-caption",evaluate:function(a,b){return!!a.caption}},{id:"has-summary",evaluate:function(a,b){return!!a.summary}},{id:"has-th",evaluate:function(a,b){for(var c,d,e=[],f=0,g=a.rows.length;g>f;f++){c=a.rows[f];for(var h=0,i=c.cells.length;i>h;h++)d=c.cells[h],"TH"===d.nodeName&&e.push(d)}return e.length?(this.relatedNodes(e),!0):!1}},{id:"headers-attr-reference",evaluate:function(a,b){function c(a){a&&R.text.accessibleText(a)||g.push(e)}for(var d,e,f,g=[],h=0,i=a.rows.length;i>h;h++){d=a.rows[h];for(var j=0,k=d.cells.length;k>j;j++)e=d.cells[j],f=R.dom.idrefs(e,"headers"),f.length&&f.forEach(c)}return g.length?(this.relatedNodes(g),!0):!1}},{id:"headers-visible-text",evaluate:function(a,b){for(var c,d,e=[],f=0,g=a.rows.length;g>f;f++){c=a.rows[f];for(var h=0,i=c.cells.length;i>h;h++)d=c.cells[h],R.table.isHeader(d)&&!R.text.accessibleText(d)&&e.push(d)}return e.length?(this.relatedNodes(e),!0):!1}},{id:"html4-scope",evaluate:function(a,c){return R.dom.isHTML5(b)?!1:"TH"===a.nodeName||"TD"===a.nodeName}},{id:"html5-scope",evaluate:function(a,c){return R.dom.isHTML5(b)?"TH"===a.nodeName:!1}},{id:"no-caption",evaluate:function(a,b){return!(a.caption||{}).textContent},enabled:!1},{id:"rowspan",evaluate:function(a,b){for(var c,d,e=[],f=0,g=a.rows.length;g>f;f++){c=a.rows[f];for(var h=0,i=c.cells.length;i>h;h++)d=c.cells[h],1!==d.rowSpan&&e.push(d)}return e.length?(this.relatedNodes(e),!0):!1}},{id:"same-caption-summary",selector:"table",evaluate:function(a,b){return!(!a.summary||!a.caption)&&a.summary===R.text.accessibleText(a.caption)}},{id:"scope-value",evaluate:function(a,b){var c=a.getAttribute("scope");return"row"!==c&&"col"!==c}},{id:"th-headers-attr",evaluate:function(a,b){for(var c,d,e=[],f=0,g=a.rows.length;g>f;f++){c=a.rows[f];for(var h=0,i=c.cells.length;i>h;h++)d=c.cells[h],"TH"===d.nodeName&&d.getAttribute("headers")&&e.push(d)}return e.length?(this.relatedNodes(e),!0):!1}},{id:"th-scope",evaluate:function(a,b){for(var c,d,e=[],f=0,g=a.rows.length;g>f;f++){c=a.rows[f];for(var h=0,i=c.cells.length;i>h;h++)d=c.cells[h],"TH"!==d.nodeName||d.getAttribute("scope")||e.push(d)}return e.length?(this.relatedNodes(e),!0):!1}},{id:"th-single-row-column",evaluate:function(a,b){for(var c,d,e,f=[],g=[],h=0,i=a.rows.length;i>h;h++){c=a.rows[h];for(var j=0,k=c.cells.length;k>j;j++)d=c.cells[j],d.nodeName&&(R.table.isColumnHeader(d)&&-1===g.indexOf(h)?g.push(h):R.table.isRowHeader(d)&&(e=R.table.getCellPosition(d),-1===f.indexOf(e.x)&&f.push(e.x)))}return g.length>1||f.length>1?!0:!1}}],commons:function(){function c(b){var c,d=a.getComputedStyle(b);if("none"!==d.getPropertyValue("background-image"))return null;var e=d.getPropertyValue("background-color");"transparent"===e?c=new r.Color(0,0,0,0):(c=new r.Color,c.parseRgbString(e));var f=d.getPropertyValue("opacity");return c.alpha=c.alpha*f,c}function d(a){"use strict";var b=a.match(/rect\s*\(([0-9]+)px,?\s*([0-9]+)px,?\s*([0-9]+)px,?\s*([0-9]+)px\s*\)/);return b&&5===b.length?b[3]-b[1]<=0&&b[2]-b[4]<=0:!1}function e(a){var c=null;return a.id&&(c=b.querySelector('label[for="'+v.escapeSelector(a.id)+'"]'))?c:c=s.findUp(a,"label")}function f(a){return-1!==["button","reset","submit"].indexOf(a.type)}function g(a){return"TEXTAREA"===a.nodeName||"SELECT"===a.nodeName||"INPUT"===a.nodeName&&"hidden"!==a.type}function h(a){return-1!==["BUTTON","SUMMARY","A"].indexOf(a.nodeName)}function i(a){return-1!==["TABLE","FIGURE"].indexOf(a.nodeName)}function j(a){if("INPUT"===a.nodeName)return!a.hasAttribute("type")||-1!==y.indexOf(a.getAttribute("type"))&&a.value?a.value:"";if("SELECT"===a.nodeName){var b=a.options;if(b&&b.length){for(var c="",d=0;d<b.length;d++)b[d].selected&&(c+=" "+b[d].text);return u.sanitize(c)}return""}return"TEXTAREA"===a.nodeName&&a.value?a.value:""}function k(a,b){var c=a.querySelector(b);return c?u.accessibleText(c):""}function l(a){if(!a)return!1;switch(a.nodeName){case"SELECT":case"TEXTAREA":return!0;case"INPUT":return!a.hasAttribute("type")||-1!==y.indexOf(a.getAttribute("type"));default:return!1}}function m(a){return"INPUT"===a.nodeName&&"image"===a.type||-1!==["IMG","APPLET","AREA"].indexOf(a.nodeName)}function n(a){return!!u.sanitize(a)}var o={},p=o.aria={},q=p._lut={};q.attributes={"aria-activedescendant":{type:"idref"},"aria-atomic":{type:"boolean",values:["true","false"]},"aria-autocomplete":{type:"nmtoken",values:["inline","list","both","none"]},"aria-busy":{type:"boolean",values:["true","false"]},"aria-checked":{type:"nmtoken",values:["true","false","mixed","undefined"]},"aria-colcount":{type:"int"},"aria-colindex":{type:"int"},"aria-colspan":{type:"int"},"aria-controls":{type:"idrefs"},"aria-describedby":{type:"idrefs"},"aria-disabled":{type:"boolean",values:["true","false"]},"aria-dropeffect":{type:"nmtokens",values:["copy","move","reference","execute","popup","none"]},"aria-expanded":{type:"nmtoken",values:["true","false","undefined"]},"aria-flowto":{type:"idrefs"},"aria-grabbed":{type:"nmtoken",values:["true","false","undefined"]},"aria-haspopup":{type:"boolean",values:["true","false"]},"aria-hidden":{type:"boolean",values:["true","false"]},"aria-invalid":{type:"nmtoken",values:["true","false","spelling","grammar"]},"aria-label":{type:"string"},"aria-labelledby":{type:"idrefs"},"aria-level":{type:"int"},"aria-live":{type:"nmtoken",values:["off","polite","assertive"]},"aria-multiline":{type:"boolean",values:["true","false"]},"aria-multiselectable":{type:"boolean",values:["true","false"]},"aria-orientation":{type:"nmtoken",values:["horizontal","vertical"]},"aria-owns":{type:"idrefs"},"aria-posinset":{type:"int"},"aria-pressed":{type:"nmtoken",values:["true","false","mixed","undefined"]},"aria-readonly":{type:"boolean",values:["true","false"]},"aria-relevant":{type:"nmtokens",values:["additions","removals","text","all"]},"aria-required":{type:"boolean",values:["true","false"]},"aria-rowcount":{type:"int"},"aria-rowindex":{type:"int"},"aria-rowspan":{type:"int"},"aria-selected":{type:"nmtoken",values:["true","false","undefined"]},"aria-setsize":{type:"int"},"aria-sort":{type:"nmtoken",values:["ascending","descending","other","none"]},"aria-valuemax":{type:"decimal"},"aria-valuemin":{type:"decimal"},"aria-valuenow":{type:"decimal"},"aria-valuetext":{type:"string"}},q.globalAttributes=["aria-atomic","aria-busy","aria-controls","aria-describedby","aria-disabled","aria-dropeffect","aria-flowto","aria-grabbed","aria-haspopup","aria-hidden","aria-invalid","aria-label","aria-labelledby","aria-live","aria-owns","aria-relevant"],q.role={alert:{type:"widget",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},alertdialog:{type:"widget",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},application:{type:"landmark",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},article:{type:"structure",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null,implicit:["article"]},banner:{type:"landmark",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},button:{type:"widget",attributes:{allowed:["aria-expanded","aria-pressed"]},owned:null,nameFrom:["author","contents"],context:null,implicit:["button",'input[type="button"]','input[type="image"]']},cell:{type:"structure",attributes:{allowed:["aria-colindex","aria-colspan","aria-rowindex","aria-rowspan"]},owned:null,nameFrom:["author","contents"],context:["row"]},checkbox:{type:"widget",attributes:{required:["aria-checked"]},owned:null,nameFrom:["author","contents"],context:null,implicit:['input[type="checkbox"]']},columnheader:{type:"structure",attributes:{allowed:["aria-expanded","aria-sort","aria-readonly","aria-selected","aria-required"]},owned:null,nameFrom:["author","contents"],context:["row"]},combobox:{type:"composite",attributes:{required:["aria-expanded"],allowed:["aria-autocomplete","aria-required","aria-activedescendant"]},owned:{all:["listbox","textbox"]},nameFrom:["author"],context:null},command:{nameFrom:["author"],type:"abstract"},complementary:{type:"landmark",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null,implicit:["aside"]},composite:{nameFrom:["author"],type:"abstract"},contentinfo:{type:"landmark",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},definition:{type:"structure",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},dialog:{type:"widget",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null,implicit:["dialog"]},directory:{type:"structure",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author","contents"],context:null},document:{type:"structure",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null,implicit:["body"]},form:{type:"landmark",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},grid:{type:"composite",attributes:{allowed:["aria-level","aria-multiselectable","aria-readonly","aria-activedescendant","aria-expanded"]},owned:{one:["rowgroup","row"]},nameFrom:["author"],context:null},gridcell:{type:"widget",attributes:{allowed:["aria-selected","aria-readonly","aria-expanded","aria-required"]},owned:null,nameFrom:["author","contents"],context:["row"]},group:{type:"structure",attributes:{allowed:["aria-activedescendant","aria-expanded"]},owned:null,nameFrom:["author"],context:null,implicit:["details"]},heading:{type:"structure",attributes:{allowed:["aria-level","aria-expanded"]},owned:null,nameFrom:["author","contents"],context:null,implicit:["h1","h2","h3","h4","h5","h6"]},img:{type:"structure",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null,implicit:["img"]},input:{nameFrom:["author"],type:"abstract"},landmark:{nameFrom:["author"],type:"abstract"},link:{type:"widget",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author","contents"],context:null,implicit:["a[href]"]},list:{type:"structure",attributes:{allowed:["aria-expanded"]},owned:{all:["listitem"]},nameFrom:["author"],context:null,implicit:["ol","ul"]},listbox:{type:"composite",attributes:{allowed:["aria-activedescendant","aria-multiselectable","aria-required","aria-expanded"]},owned:{all:["option"]},nameFrom:["author"],context:null,implicit:["select"]},listitem:{type:"structure",attributes:{allowed:["aria-level","aria-posinset","aria-setsize","aria-expanded"]},owned:null,nameFrom:["author","contents"],context:["list"],implicit:["li"]},log:{type:"widget",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},main:{type:"landmark",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},marquee:{type:"widget",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},math:{type:"structure",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},menu:{type:"composite",attributes:{allowed:["aria-activedescendant","aria-expanded"]},owned:{one:["menuitem","menuitemradio","menuitemcheckbox"]},nameFrom:["author"],context:null},menubar:{type:"composite",attributes:{allowed:["aria-activedescendant","aria-expanded"]},owned:null,nameFrom:["author"],context:null},menuitem:{type:"widget",attributes:null,owned:null,nameFrom:["author","contents"],context:["menu","menubar"]},menuitemcheckbox:{type:"widget",attributes:{required:["aria-checked"]},owned:null,nameFrom:["author","contents"],context:["menu","menubar"]},menuitemradio:{type:"widget",attributes:{allowed:["aria-selected","aria-posinset","aria-setsize"],required:["aria-checked"]},owned:null,nameFrom:["author","contents"],context:["menu","menubar"]},navigation:{type:"landmark",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},none:{type:"structure",attributes:null,owned:null,nameFrom:["author"],context:null},note:{type:"structure",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},option:{type:"widget",attributes:{allowed:["aria-selected","aria-posinset","aria-setsize","aria-checked"]},owned:null,nameFrom:["author","contents"],context:["listbox"]},presentation:{type:"structure",attributes:null,owned:null,nameFrom:["author"],context:null},progressbar:{type:"widget",attributes:{allowed:["aria-valuetext","aria-valuenow","aria-valuemax","aria-valuemin"]},owned:null,nameFrom:["author"],context:null},radio:{type:"widget",attributes:{allowed:["aria-selected","aria-posinset","aria-setsize"],required:["aria-checked"]},owned:null,nameFrom:["author","contents"],context:null,implicit:['input[type="radio"]']},radiogroup:{type:"composite",attributes:{allowed:["aria-activedescendant","aria-required","aria-expanded"]},owned:{all:["radio"]},nameFrom:["author"],context:null},range:{nameFrom:["author"],type:"abstract"},region:{type:"structure",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null,implicit:["section"]},roletype:{type:"abstract"},row:{type:"structure",attributes:{allowed:["aria-level","aria-selected","aria-activedescendant","aria-expanded"]},owned:{one:["cell","columnheader","rowheader","gridcell"]},nameFrom:["author","contents"],context:["rowgroup","grid","treegrid","table"]},rowgroup:{type:"structure",attributes:{allowed:["aria-activedescendant","aria-expanded"]},owned:{all:["row"]},nameFrom:["author","contents"],context:["grid","table"]},rowheader:{type:"structure",attributes:{allowed:["aria-sort","aria-required","aria-readonly","aria-expanded","aria-selected"]},owned:null,nameFrom:["author","contents"],context:["row"]},scrollbar:{type:"widget",attributes:{required:["aria-controls","aria-orientation","aria-valuenow","aria-valuemax","aria-valuemin"],allowed:["aria-valuetext"]},owned:null,nameFrom:["author"],context:null},search:{type:"landmark",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},searchbox:{type:"widget",attributes:{allowed:["aria-activedescendant","aria-autocomplete","aria-multiline","aria-readonly","aria-required"]},owned:null,nameFrom:["author"],context:null,implicit:['input[type="search"]']},section:{nameFrom:["author","contents"],type:"abstract"},sectionhead:{nameFrom:["author","contents"],type:"abstract"},select:{nameFrom:["author"],type:"abstract"},separator:{type:"structure",attributes:{allowed:["aria-expanded","aria-orientation"]},owned:null,nameFrom:["author"],context:null},slider:{type:"widget",attributes:{allowed:["aria-valuetext","aria-orientation"],required:["aria-valuenow","aria-valuemax","aria-valuemin"]},owned:null,nameFrom:["author"],context:null},spinbutton:{type:"widget",attributes:{allowed:["aria-valuetext","aria-required"],required:["aria-valuenow","aria-valuemax","aria-valuemin"]},owned:null,nameFrom:["author"],context:null},status:{type:"widget",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null,implicit:["output"]},structure:{type:"abstract"},"switch":{type:"widget",attributes:{required:["aria-checked"]},owned:null,nameFrom:["author","contents"],context:null},tab:{type:"widget",attributes:{allowed:["aria-selected","aria-expanded"]},owned:null,nameFrom:["author","contents"],context:["tablist"]},table:{type:"structure",attributes:{allowed:["aria-colcount","aria-rowcount"]},owned:{one:["rowgroup","row"]},nameFrom:["author"],context:null,implicit:["table"]},tablist:{type:"composite",attributes:{allowed:["aria-activedescendant","aria-expanded","aria-level","aria-multiselectable"]},owned:{all:["tab"]},nameFrom:["author"],context:null},tabpanel:{type:"widget",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},text:{type:"structure",owned:null,nameFrom:["author","contents"],context:null},textbox:{type:"widget",attributes:{allowed:["aria-activedescendant","aria-autocomplete","aria-multiline","aria-readonly","aria-required"]},owned:null,nameFrom:["author"],context:null,implicit:['input[type="text"]',"input:not([type])"]},timer:{type:"widget",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author"],context:null},toolbar:{type:"structure",attributes:{allowed:["aria-activedescendant","aria-expanded"]},owned:null,nameFrom:["author"],context:null,implicit:['menu[type="toolbar"]']},tooltip:{type:"widget",attributes:{allowed:["aria-expanded"]},owned:null,nameFrom:["author","contents"],context:null},tree:{type:"composite",attributes:{allowed:["aria-activedescendant","aria-multiselectable","aria-required","aria-expanded"]},owned:{all:["treeitem"]},nameFrom:["author"],context:null},treegrid:{type:"composite",attributes:{allowed:["aria-activedescendant","aria-expanded","aria-level","aria-multiselectable","aria-readonly","aria-required"]},owned:{all:["treeitem"]},nameFrom:["author"],context:null},treeitem:{type:"widget",attributes:{allowed:["aria-checked","aria-selected","aria-expanded","aria-level","aria-posinset","aria-setsize"]},owned:null,nameFrom:["author","contents"],context:["treegrid","tree"]},widget:{type:"abstract"},window:{nameFrom:["author"],type:"abstract"}};var r={};o.color=r;var s=o.dom={},t=o.table={},u=o.text={},v=o.utils={};v.escapeSelector=S.utils.escapeSelector,v.matchesSelector=S.utils.matchesSelector,v.clone=S.utils.clone,p.requiredAttr=function(a){"use strict";var b=q.role[a],c=b&&b.attributes&&b.attributes.required;return c||[]},p.allowedAttr=function(a){"use strict";var b=q.role[a],c=b&&b.attributes&&b.attributes.allowed||[],d=b&&b.attributes&&b.attributes.required||[];return c.concat(q.globalAttributes).concat(d)},p.validateAttr=function(a){"use strict";return!!q.attributes[a]},p.validateAttrValue=function(a,c){"use strict";var d,e,f,g,h=b,i=a.getAttribute(c),j=q.attributes[c];if(!j)return!0;if(j.values)return"string"==typeof i&&-1!==j.values.indexOf(i.toLowerCase())?!0:!1;switch(j.type){case"idref":return!(!i||!h.getElementById(i));case"idrefs":for(d=v.tokenList(i),e=0,f=d.length;f>e;e++)if(d[e]&&!h.getElementById(d[e]))return!1;return!!d.length;case"string":return!0;case"decimal":return g=i.match(/^[-+]?([0-9]*)\.?([0-9]*)$/),!(!g||!g[1]&&!g[2]);case"int":return/^[-+]?[0-9]+$/.test(i)}},p.label=function(a){var b,c;return a.getAttribute("aria-labelledby")&&(b=s.idrefs(a,"aria-labelledby"),c=b.map(function(a){return a?u.visible(a,!0):""}).join(" ").trim())?c:(c=a.getAttribute("aria-label"),c&&(c=u.sanitize(c).trim())?c:null)},p.isValidRole=function(a){"use strict";return q.role[a]?!0:!1},p.getRolesWithNameFromContents=function(){return Object.keys(q.role).filter(function(a){return q.role[a].nameFrom&&-1!==q.role[a].nameFrom.indexOf("contents")})},p.getRolesByType=function(a){return Object.keys(q.role).filter(function(b){return q.role[b].type===a})},p.getRoleType=function(a){var b=q.role[a];return b&&b.type||null},p.requiredOwned=function(a){"use strict";var b=null,c=q.role[a];return c&&(b=v.clone(c.owned)),b},p.requiredContext=function(a){"use strict";var b=null,c=q.role[a];return c&&(b=v.clone(c.context)),b},p.implicitNodes=function(a){"use strict";var b=null,c=q.role[a];return c&&c.implicit&&(b=v.clone(c.implicit)),b},p.implicitRole=function(a){"use strict";var b,c,d,e=q.role;for(b in e)if(e.hasOwnProperty(b)&&(c=e[b],c.implicit))for(var f=0,g=c.implicit.length;g>f;f++)if(d=c.implicit[f],v.matchesSelector(a,d))return b;return null},r.Color=function(a,b,c,d){this.red=a,this.green=b,this.blue=c,this.alpha=d,this.toHexString=function(){var a=Math.round(this.red).toString(16),b=Math.round(this.green).toString(16),c=Math.round(this.blue).toString(16);return"#"+(this.red>15.5?a:"0"+a)+(this.green>15.5?b:"0"+b)+(this.blue>15.5?c:"0"+c)};var e=/^rgb\((\d+), (\d+), (\d+)\)$/,f=/^rgba\((\d+), (\d+), (\d+), (\d*(\.\d+)?)\)/;this.parseRgbString=function(a){var b=a.match(e);return b?(this.red=parseInt(b[1],10),this.green=parseInt(b[2],10),this.blue=parseInt(b[3],10),void(this.alpha=1)):(b=a.match(f),b?(this.red=parseInt(b[1],10),this.green=parseInt(b[2],10),this.blue=parseInt(b[3],10),void(this.alpha=parseFloat(b[4]))):void 0)},this.getRelativeLuminance=function(){var a=this.red/255,b=this.green/255,c=this.blue/255,d=.03928>=a?a/12.92:Math.pow((a+.055)/1.055,2.4),e=.03928>=b?b/12.92:Math.pow((b+.055)/1.055,2.4),f=.03928>=c?c/12.92:Math.pow((c+.055)/1.055,2.4);return.2126*d+.7152*e+.0722*f}},r.flattenColors=function(a,b){var c=a.alpha,d=(1-c)*b.red+c*a.red,e=(1-c)*b.green+c*a.green,f=(1-c)*b.blue+c*a.blue,g=a.alpha+b.alpha*(1-a.alpha);return new r.Color(d,e,f,g)},r.getContrast=function(a,b){if(!b||!a)return null;b.alpha<1&&(b=r.flattenColors(b,a));var c=a.getRelativeLuminance(),d=b.getRelativeLuminance();return(Math.max(d,c)+.05)/(Math.min(d,c)+.05)},r.hasValidContrastRatio=function(a,b,c,d){var e=r.getContrast(a,b),f=d&&Math.ceil(72*c)/96<14||!d&&Math.ceil(72*c)/96<18;return{isValid:f&&e>=4.5||!f&&e>=3,contrastRatio:e}},s.isOpaque=function(a){var b=c(a);return null===b||1===b.alpha?!0:!1};var w=function(c,d){for(var e,f,g,h,i,j,k,l=[],m=!1,n=c,o=a.getComputedStyle(n);null!==n&&(!s.isOpaque(n)||0===parseInt(o.getPropertyValue("height"),10));)g=o.getPropertyValue("position"),h=o.getPropertyValue("top"),i=o.getPropertyValue("bottom"),j=o.getPropertyValue("left"),k=o.getPropertyValue("right"),("static"!==g&&"relative"!==g||"relative"===g&&("auto"!==j||"auto"!==k||"auto"!==h||"auto"!==i))&&(m=!0),n=n.parentElement,null!==n&&(o=a.getComputedStyle(n),0!==parseInt(o.getPropertyValue("height"),10)&&l.push(n));if(m&&s.supportsElementsFromPoint(b)){if(e=s.elementsFromPoint(b,Math.ceil(d.left+1),Math.ceil(d.top+1)),f=e.indexOf(c),-1===f)return null;e&&f<e.length-1&&(l=e.slice(f+1))}return l};r.getBackgroundColor=function(a,b){var d,e,f=c(a);if(!b||null!==f&&0===f.alpha||b.push(a),null===f||1===f.alpha)return f;a.scrollIntoView();var g=a.getBoundingClientRect(),h=a,i=[{color:f,node:a}],j=w(h,g);if(!j)return null;for(;1!==f.alpha;){if(d=j.shift(),!d&&"HTML"!==h.tagName)return null;if(d||"HTML"!==h.tagName){if(!s.visuallyContains(a,d))return null;if(e=c(d),!b||null!==e&&0===e.alpha||b.push(d),null===e)return null}else e=new r.Color(255,255,255,1);h=d,f=e,i.push({color:f,node:h})}for(var k=i.pop(),l=k.color;void 0!==(k=i.pop());)l=r.flattenColors(k.color,l);return l},r.getForegroundColor=function(b){var c=a.getComputedStyle(b),d=new r.Color;d.parseRgbString(c.getPropertyValue("color"));var e=c.getPropertyValue("opacity");if(d.alpha=d.alpha*e,1===d.alpha)return d;var f=r.getBackgroundColor(b);return null===f?null:r.flattenColors(d,f)},s.supportsElementsFromPoint=function(a){var b=a.createElement("x");return b.style.cssText="pointer-events:auto","auto"===b.style.pointerEvents||!!a.msElementsFromPoint},s.elementsFromPoint=function(a,b,c){var d,e,f,g=[],h=[];if(a.msElementsFromPoint){var i=a.msElementsFromPoint(b,c);return i?Array.prototype.slice.call(i):null;
}for(;(d=a.elementFromPoint(b,c))&&-1===g.indexOf(d)&&null!==d&&(g.push(d),h.push({value:d.style.getPropertyValue("pointer-events"),priority:d.style.getPropertyPriority("pointer-events")}),d.style.setProperty("pointer-events","none","important"),!s.isOpaque(d)););for(e=h.length;f=h[--e];)g[e].style.setProperty("pointer-events",f.value?f.value:"",f.priority);return g},s.findUp=function(a,c){"use strict";var d,e=b.querySelectorAll(c),f=e.length;if(!f)return null;for(e=v.toArray(e),d=a.parentNode;d&&-1===e.indexOf(d);)d=d.parentNode;return d},s.getElementByReference=function(a,c){"use strict";var d,e=a.getAttribute(c),f=b;if(e&&"#"===e.charAt(0)){if(e=e.substring(1),d=f.getElementById(e))return d;if(d=f.getElementsByName(e),d.length)return d[0]}return null},s.getElementCoordinates=function(a){"use strict";var c=s.getScrollOffset(b),d=c.left,e=c.top,f=a.getBoundingClientRect();return{top:f.top+e,right:f.right+d,bottom:f.bottom+e,left:f.left+d,width:f.right-f.left,height:f.bottom-f.top}},s.getScrollOffset=function(a){"use strict";if(!a.nodeType&&a.document&&(a=a.document),9===a.nodeType){var b=a.documentElement,c=a.body;return{left:b&&b.scrollLeft||c&&c.scrollLeft||0,top:b&&b.scrollTop||c&&c.scrollTop||0}}return{left:a.scrollLeft,top:a.scrollTop}},s.getViewportSize=function(a){"use strict";var b,c=a.document,d=c.documentElement;return a.innerWidth?{width:a.innerWidth,height:a.innerHeight}:d?{width:d.clientWidth,height:d.clientHeight}:(b=c.body,{width:b.clientWidth,height:b.clientHeight})},s.idrefs=function(a,c){"use strict";var d,e,f=b,g=[],h=a.getAttribute(c);if(h)for(h=v.tokenList(h),d=0,e=h.length;e>d;d++)g.push(f.getElementById(h[d]));return g},s.isFocusable=function(a){"use strict";if(!a||a.disabled||!s.isVisible(a)&&"AREA"!==a.nodeName)return!1;switch(a.nodeName){case"A":case"AREA":if(a.href)return!0;break;case"INPUT":return"hidden"!==a.type;case"TEXTAREA":case"SELECT":case"DETAILS":case"BUTTON":return!0}var b=a.getAttribute("tabindex");return b&&!isNaN(parseInt(b,10))?!0:!1},s.isHTML5=function(a){var b=a.doctype;return null===b?!1:"html"===b.name&&!b.publicId&&!b.systemId},s.isNode=function(a){"use strict";return a instanceof Node},s.isOffscreen=function(c){"use strict";var d,e=b.documentElement,f=a.getComputedStyle(b.body||e).getPropertyValue("direction"),g=s.getElementCoordinates(c);if(g.bottom<0)return!0;if("ltr"===f){if(g.right<0)return!0}else if(d=Math.max(e.scrollWidth,s.getViewportSize(a).width),g.left>d)return!0;return!1},s.isVisible=function(b,c,e){"use strict";var f,g=b.nodeName,h=b.parentNode;return 9===b.nodeType?!0:(f=a.getComputedStyle(b,null),null===f?!1:"none"===f.getPropertyValue("display")||"STYLE"===g||"SCRIPT"===g||!c&&d(f.getPropertyValue("clip"))||!e&&("hidden"===f.getPropertyValue("visibility")||!c&&s.isOffscreen(b))||c&&"true"===b.getAttribute("aria-hidden")?!1:h?s.isVisible(h,c,!0):!1)},s.isVisualContent=function(a){"use strict";switch(a.tagName.toUpperCase()){case"IMG":case"IFRAME":case"OBJECT":case"VIDEO":case"AUDIO":case"CANVAS":case"SVG":case"MATH":case"BUTTON":case"SELECT":case"TEXTAREA":case"KEYGEN":case"PROGRESS":case"METER":return!0;case"INPUT":return"hidden"!==a.type;default:return!1}},s.visuallyContains=function(b,c){var d=b.getBoundingClientRect(),e=c.getBoundingClientRect(),f=e.top,g=e.left,h={top:f-c.scrollTop,bottom:f-c.scrollTop+c.scrollHeight,left:g-c.scrollLeft,right:g-c.scrollLeft+c.scrollWidth};if(d.left<h.left&&d.left<e.left||d.top<h.top&&d.top<e.top||d.right>h.right&&d.right>e.right||d.bottom>h.bottom&&d.bottom>e.bottom)return!1;var i=a.getComputedStyle(c);return d.right>e.right||d.bottom>e.bottom?"scroll"===i.overflow||"auto"===i.overflow||"hidden"===i.overflow||c instanceof HTMLBodyElement||c instanceof HTMLHtmlElement:!0},s.visuallyOverlaps=function(b,c){var d=c.getBoundingClientRect(),e=d.top,f=d.left,g={top:e-c.scrollTop,bottom:e-c.scrollTop+c.scrollHeight,left:f-c.scrollLeft,right:f-c.scrollLeft+c.scrollWidth};if(b.left>g.right&&b.left>d.right||b.top>g.bottom&&b.top>d.bottom||b.right<g.left&&b.right<d.left||b.bottom<g.top&&b.bottom<d.top)return!1;var h=a.getComputedStyle(c);return b.left>d.right||b.top>d.bottom?"scroll"===h.overflow||"auto"===h.overflow||c instanceof HTMLBodyElement||c instanceof HTMLHtmlElement:!0},t.getCellPosition=function(a){for(var b,c=t.toArray(s.findUp(a,"table")),d=0;d<c.length;d++)if(c[d]&&(b=c[d].indexOf(a),-1!==b))return{x:b,y:d}},t.getHeaders=function(a){if(a.getAttribute("headers"))return o.dom.idrefs(a,"headers");for(var b,c=[],d=o.table.toArray(o.dom.findUp(a,"table")),e=o.table.getCellPosition(a),f=e.x-1;f>=0;f--)b=d[e.y][f],o.table.isRowHeader(b)&&c.unshift(b);for(var g=e.y-1;g>=0;g--)b=d[g][e.x],b&&o.table.isColumnHeader(b)&&c.unshift(b);return c},t.isColumnHeader=function(a){var b=a.getAttribute("scope");if("col"===b)return!0;if(b||"TH"!==a.nodeName)return!1;for(var c,d=t.getCellPosition(a),e=t.toArray(s.findUp(a,"table")),f=e[d.y],g=0,h=f.length;h>g;g++)if(c=f[g],c!==a&&t.isDataCell(c))return!1;return!0},t.isDataCell=function(a){return a.children.length||a.textContent.trim()?"TD"===a.nodeName:!1},t.isDataTable=function(b){var c=b.getAttribute("role");if(("presentation"===c||"none"===c)&&!s.isFocusable(b))return!1;if("true"===b.getAttribute("contenteditable")||s.findUp(b,'[contenteditable="true"]'))return!0;if("grid"===c||"treegrid"===c||"table"===c)return!0;if("landmark"===o.aria.getRoleType(c))return!0;if("0"===b.getAttribute("datatable"))return!1;if(b.getAttribute("summary"))return!0;if(b.tHead||b.tFoot||b.caption)return!0;for(var d=0,e=b.children.length;e>d;d++)if("COLGROUP"===b.children[d].nodeName)return!0;for(var f,g,h=0,i=b.rows.length,j=!1,k=0;i>k;k++){f=b.rows[k];for(var l=0,m=f.cells.length;m>l;l++){if(g=f.cells[l],j||g.offsetWidth===g.clientWidth&&g.offsetHeight===g.clientHeight||(j=!0),g.getAttribute("scope")||g.getAttribute("headers")||g.getAttribute("abbr"))return!0;if("TH"===g.nodeName)return!0;if(1===g.children.length&&"ABBR"===g.children[0].nodeName)return!0;h++}}if(b.getElementsByTagName("table").length)return!1;if(2>i)return!1;var n=b.rows[Math.ceil(i/2)];if(1===n.cells.length&&1===n.cells[0].colSpan)return!1;if(n.cells.length>=5)return!0;if(j)return!0;var p,q;for(k=0;i>k;k++){if(f=b.rows[k],p&&p!==a.getComputedStyle(f).getPropertyValue("background-color"))return!0;if(p=a.getComputedStyle(f).getPropertyValue("background-color"),q&&q!==a.getComputedStyle(f).getPropertyValue("background-image"))return!0;q=a.getComputedStyle(f).getPropertyValue("background-image")}return i>=20?!0:s.getElementCoordinates(b).width>.95*s.getViewportSize(a).width?!1:10>h?!1:b.querySelector("object, embed, iframe, applet")?!1:!0},t.isHeader=function(a){return t.isColumnHeader(a)||t.isRowHeader(a)?!0:a.id?!!b.querySelector('[headers~="'+v.escapeSelector(a.id)+'"]'):!1},t.isRowHeader=function(a){var b=a.getAttribute("scope");if("row"===b)return!0;if(b||"TH"!==a.nodeName)return!1;if(t.isColumnHeader(a))return!1;for(var c,d=t.getCellPosition(a),e=t.toArray(s.findUp(a,"table")),f=0,g=e.length;g>f;f++)if(c=e[f][d.x],c!==a&&t.isDataCell(c))return!1;return!0},t.toArray=function(a){for(var b=[],c=a.rows,d=0,e=c.length;e>d;d++){var f=c[d].cells;b[d]=b[d]||[];for(var g=0,h=0,i=f.length;i>h;h++)for(var j=0;j<f[h].colSpan;j++){for(var k=0;k<f[h].rowSpan;k++){for(b[d+k]=b[d+k]||[];b[d+k][g];)g++;b[d+k][g]=f[h]}g++}}return b};var x={submit:"Submit",reset:"Reset"},y=["text","search","tel","url","email","date","time","number","range","color"],z=["a","em","strong","small","mark","abbr","dfn","i","b","s","u","code","var","samp","kbd","sup","sub","q","cite","span","bdo","bdi","br","wbr","ins","del","img","embed","object","iframe","map","area","script","noscript","ruby","video","audio","input","textarea","select","button","label","output","datalist","keygen","progress","command","canvas","time","meter"];return u.accessibleText=function(a){function b(a,b,c){var i="";if(h(a)&&(i=d(a,!1,!1)||"",n(i)))return i;if("FIGURE"===a.nodeName&&(i=k(a,"figcaption"),n(i)))return i;if("TABLE"===a.nodeName){if(i=k(a,"caption"),n(i))return i;if(i=a.getAttribute("title")||a.getAttribute("summary")||"",n(i))return i}if(m(a))return a.getAttribute("alt")||"";if(g(a)&&!c){if(f(a))return a.value||a.title||x[a.type]||"";var j=e(a);if(j)return o(j,b,!0)}return""}function c(a,b,c){return!b&&a.hasAttribute("aria-labelledby")?u.sanitize(s.idrefs(a,"aria-labelledby").map(function(b){return a===b&&q.pop(),o(b,!0,a!==b)}).join(" ")):c&&l(a)||!a.hasAttribute("aria-label")?"":u.sanitize(a.getAttribute("aria-label"))}function d(a,b,c){for(var d,e=a.childNodes,f="",g=0;g<e.length;g++)d=e[g],3===d.nodeType?f+=d.textContent:1===d.nodeType&&(-1===z.indexOf(d.nodeName.toLowerCase())&&(f+=" "),f+=o(e[g],b,c));return f}function o(a,e,f){"use strict";var g="";if(null===a||!s.isVisible(a,!0)||-1!==q.indexOf(a))return"";q.push(a);var h=a.getAttribute("role");return g+=c(a,e,f),n(g)?g:(g=b(a,e,f),n(g)?g:f&&(g+=j(a),n(g))?g:i(a)||h&&-1===p.getRolesWithNameFromContents().indexOf(h)||(g=d(a,e,f),!n(g))?a.hasAttribute("title")?a.getAttribute("title"):"":g)}var q=[];return u.sanitize(o(a))},u.label=function(a){var c,d;return(d=p.label(a))?d:a.id&&(c=b.querySelector('label[for="'+v.escapeSelector(a.id)+'"]'),d=c&&u.visible(c,!0))?d:(c=s.findUp(a,"label"),d=c&&u.visible(c,!0),d?d:null)},u.sanitize=function(a){"use strict";return a.replace(/\r\n/g,"\n").replace(/\u00A0/g," ").replace(/[\s]{2,}/g," ").trim()},u.visible=function(a,b,c){"use strict";var d,e,f,g=a.childNodes,h=g.length,i="";for(d=0;h>d;d++)e=g[d],3===e.nodeType?(f=e.nodeValue,f&&s.isVisible(a,b)&&(i+=e.nodeValue)):c||(i+=u.visible(e,b));return u.sanitize(i)},v.toArray=function(a){"use strict";return Array.prototype.slice.call(a)},v.tokenList=function(a){"use strict";return a.trim().replace(/\s{2,}/g," ").split(" ")},o}()}),S.version="1.1.1"}(window,window.document);
/* jshint unused:false */
/* global base64_decode, CSSWizardView, window, console, jQuery */
(function(global) {
  'use strict';
  var fi = function() {

    this.cssImportStatements = [];
    this.cssKeyframeStatements = [];

    this.cssRegex = new RegExp('([\\s\\S]*?){([\\s\\S]*?)}', 'gi');
    this.cssMediaQueryRegex = '((@media [\\s\\S]*?){([\\s\\S]*?}\\s*?)})';
    this.cssKeyframeRegex = '((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})';
    this.combinedCSSRegex = '((\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})'; //to match css & media queries together
    this.cssCommentsRegex = '(\\/\\*[\\s\\S]*?\\*\\/)';
    this.cssImportStatementRegex = new RegExp('@import .*?;', 'gi');
  };

  /*
    Strip outs css comments and returns cleaned css string

    @param css, the original css string to be stipped out of comments

    @return cleanedCSS contains no css comments
  */
  fi.prototype.stripComments = function(cssString) {
    var regex = new RegExp(this.cssCommentsRegex, 'gi');

    return cssString.replace(regex, '');
  };

  /*
    Parses given css string, and returns css object
    keys as selectors and values are css rules
    eliminates all css comments before parsing

    @param source css string to be parsed

    @return object css
  */
  fi.prototype.parseCSS = function(source) {

    if (source === undefined) {
      return [];
    }

    var css = [];
    //strip out comments
    //source = this.stripComments(source);

    //get import statements

    while (true) {
      var imports = this.cssImportStatementRegex.exec(source);
      if (imports !== null) {
        this.cssImportStatements.push(imports[0]);
        css.push({
          selector: '@imports',
          type: 'imports',
          styles: imports[0]
        });
      } else {
        break;
      }
    }
    source = source.replace(this.cssImportStatementRegex, '');
    //get keyframe statements
    var keyframesRegex = new RegExp(this.cssKeyframeRegex, 'gi');
    var arr;
    while (true) {
      arr = keyframesRegex.exec(source);
      if (arr === null) {
        break;
      }
      css.push({
        selector: '@keyframes',
        type: 'keyframes',
        styles: arr[0]
      });
    }
    source = source.replace(keyframesRegex, '');

    //unified regex
    var unified = new RegExp(this.combinedCSSRegex, 'gi');

    while (true) {
      arr = unified.exec(source);
      if (arr === null) {
        break;
      }
      var selector = '';
      if (arr[2] === undefined) {
        selector = arr[5].split('\r\n').join('\n').trim();
      } else {
        selector = arr[2].split('\r\n').join('\n').trim();
      }

      /*
        fetch comments and associate it with current selector
      */
      var commentsRegex = new RegExp(this.cssCommentsRegex, 'gi');
      var comments = commentsRegex.exec(selector);
      if (comments !== null) {
        selector = selector.replace(commentsRegex, '').trim();
      }

      //determine the type
      if (selector.indexOf('@media') !== -1) {
        //we have a media query
        var cssObject = {
          selector: selector,
          type: 'media',
          subStyles: this.parseCSS(arr[3] + '\n}') //recursively parse media query inner css
        };
        if (comments !== null) {
          cssObject.comments = comments[0];
        }
        css.push(cssObject);
      } else {
        //we have standart css
        var rules = this.parseRules(arr[6]);
        var style = {
          selector: selector,
          rules: rules
        };
        if (selector === '@font-face') {
          style.type = 'font-face';
        }
        if (comments !== null) {
          style.comments = comments[0];
        }
        css.push(style);
      }
    }

    return css;
  };

  /*
    parses given string containing css directives
    and returns an array of objects containing ruleName:ruleValue pairs

    @param rules, css directive string example
        \n\ncolor:white;\n    font-size:18px;\n
  */
  fi.prototype.parseRules = function(rules) {
    //convert all windows style line endings to unix style line endings
    rules = rules.split('\r\n').join('\n');
    var ret = [];

    rules = rules.split(';');

    //proccess rules line by line
    for (var i = 0; i < rules.length; i++) {
      var line = rules[i];

      //determine if line is a valid css directive, ie color:white;
      line = line.trim();
      if (line.indexOf(':') !== -1) {
        //line contains :
        line = line.split(':');
        var cssDirective = line[0].trim();
        var cssValue = line.slice(1).join(':').trim();

        //more checks
        if (cssDirective.length < 1 || cssValue.length < 1) {
          continue; //there is no css directive or value that is of length 1 or 0
          // PLAIN WRONG WHAT ABOUT margin:0; ?
        }

        //push rule
        ret.push({
          directive: cssDirective,
          value: cssValue
        });
      } else {
        //if there is no ':', but what if it was mis splitted value which starts with base64
        if (line.trim().substr(0, 7) == 'base64,') { //hack :)
          ret[ret.length - 1].value += line.trim();
        } else {
          //add rule, even if it is defective
          if (line.length > 0) {
            ret.push({
              directive: '',
              value: line,
              defective: true
            });
          }
        }
      }
    }

    return ret; //we are done!
  };
  /*
    just returns the rule having given directive
    if not found returns false;
  */
  fi.prototype.findCorrespondingRule = function(rules, directive, value) {
    if (value === undefined) {
      value = false;
    }
    var ret = false;
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].directive == directive) {
        ret = rules[i];
        if (value === rules[i].value) {
          break;
        }
      }
    }
    return ret;
  };

  /*
      Finds styles that have given selector, compress them,
      and returns them
  */
  fi.prototype.findBySelector = function(cssObjectArray, selector, contains) {
    if (contains === undefined) {
      contains = false;
    }

    var found = [];
    for (var i = 0; i < cssObjectArray.length; i++) {
      if (contains === false) {
        if (cssObjectArray[i].selector === selector) {
          found.push(cssObjectArray[i]);
        }
      } else {
        if (cssObjectArray[i].selector.indexOf(selector) !== -1) {
          found.push(cssObjectArray[i]);
        }
      }

    }
    if (found.length < 2) {
      return found;
    } else {
      var base = found[0];
      for (i = 1; i < found.length; i++) {
        this.intelligentCSSPush([base], found[i]);
      }
      return [base]; //we are done!! all properties merged into base!
    }
  };

  /*
    deletes cssObjects having given selector, and returns new array
  */
  fi.prototype.deleteBySelector = function(cssObjectArray, selector) {
    var ret = [];
    for (var i = 0; i < cssObjectArray.length; i++) {
      if (cssObjectArray[i].selector !== selector) {
        ret.push(cssObjectArray[i]);
      }
    }
    return ret;
  };

  /*
      Compresses given cssObjectArray and tries to minimize
      selector redundence.
  */
  fi.prototype.compressCSS = function(cssObjectArray) {
    var compressed = [];
    var done = {};
    for (var i = 0; i < cssObjectArray.length; i++) {
      var obj = cssObjectArray[i];
      if (done[obj.selector] === true) {
        continue;
      }

      var found = this.findBySelector(cssObjectArray, obj.selector); //found compressed
      if (found.length !== 0) {
        compressed.push(found[0]);
        done[obj.selector] = true;
      }
    }
    return compressed;
  };

  /*
    Received 2 css objects with following structure
      {
        rules : [{directive:"", value:""}, {directive:"", value:""}, ...]
        selector : "SOMESELECTOR"
      }

    returns the changed(new,removed,updated) values on css1 parameter, on same structure

    if two css objects are the same, then returns false
      
      if a css directive exists in css1 and     css2, and its value is different, it is included in diff
      if a css directive exists in css1 and not css2, it is then included in diff
      if a css directive exists in css2 but not css1, then it is deleted in css1, it would be included in diff but will be marked as type='DELETED'

      @object css1 css object
      @object css2 css object

      @return diff css object contains changed values in css1 in regards to css2 see test input output in /test/data/css.js
  */
  fi.prototype.cssDiff = function(css1, css2) {
    if (css1.selector !== css2.selector) {
      return false;
    }

    //if one of them is media query return false, because diff function can not operate on media queries
    if ((css1.type === 'media' || css2.type === 'media')) {
      return false;
    }

    var diff = {
      selector: css1.selector,
      rules: []
    };
    var rule1, rule2;
    for (var i = 0; i < css1.rules.length; i++) {
      rule1 = css1.rules[i];
      //find rule2 which has the same directive as rule1
      rule2 = this.findCorrespondingRule(css2.rules, rule1.directive, rule1.value);
      if (rule2 === false) {
        //rule1 is a new rule in css1
        diff.rules.push(rule1);
      } else {
        //rule2 was found only push if its value is different too
        if (rule1.value !== rule2.value) {
          diff.rules.push(rule1);
        }
      }
    }

    //now for rules exists in css2 but not in css1, which means deleted rules
    for (var ii = 0; ii < css2.rules.length; ii++) {
      rule2 = css2.rules[ii];
      //find rule2 which has the same directive as rule1
      rule1 = this.findCorrespondingRule(css1.rules, rule2.directive);
      if (rule1 === false) {
        //rule1 is a new rule
        rule2.type = 'DELETED'; //mark it as a deleted rule, so that other merge operations could be true
        diff.rules.push(rule2);
      }
    }


    if (diff.rules.length === 0) {
      return false;
    }
    return diff;
  };

  /*
      Merges 2 different css objects together
      using intelligentCSSPush,

      @param cssObjectArray, target css object array
      @param newArray, source array that will be pushed into cssObjectArray parameter
      @param reverse, [optional], if given true, first parameter will be traversed on reversed order
              effectively giving priority to the styles in newArray
  */
  fi.prototype.intelligentMerge = function(cssObjectArray, newArray, reverse) {
    if (reverse === undefined) {
      reverse = false;
    }


    for (var i = 0; i < newArray.length; i++) {
      this.intelligentCSSPush(cssObjectArray, newArray[i], reverse);
    }
    for (i = 0; i < cssObjectArray.length; i++) {
      var cobj = cssObjectArray[i];
      if (cobj.type === 'media' ||  (cobj.type === 'keyframes')) {
        continue;
      }
      cobj.rules = this.compactRules(cobj.rules);
    }
  };

  /*
    inserts new css objects into a bigger css object
    with same selectors groupped together

    @param cssObjectArray, array of bigger css object to be pushed into
    @param minimalObject, single css object
    @param reverse [optional] default is false, if given, cssObjectArray will be reversly traversed
            resulting more priority in minimalObject's styles
  */
  fi.prototype.intelligentCSSPush = function(cssObjectArray, minimalObject, reverse) {
    var pushSelector = minimalObject.selector;
    //find correct selector if not found just push minimalObject into cssObject
    var cssObject = false;

    if (reverse === undefined) {
      reverse = false;
    }

    if (reverse === false) {
      for (var i = 0; i < cssObjectArray.length; i++) {
        if (cssObjectArray[i].selector === minimalObject.selector) {
          cssObject = cssObjectArray[i];
          break;
        }
      }
    } else {
      for (var j = cssObjectArray.length - 1; j > -1; j--) {
        if (cssObjectArray[j].selector === minimalObject.selector) {
          cssObject = cssObjectArray[j];
          break;
        }
      }
    }

    if (cssObject === false) {
      cssObjectArray.push(minimalObject); //just push, because cssSelector is new
    } else {
      if (minimalObject.type !== 'media') {
        for (var ii = 0; ii < minimalObject.rules.length; ii++) {
          var rule = minimalObject.rules[ii];
          //find rule inside cssObject
          var oldRule = this.findCorrespondingRule(cssObject.rules, rule.directive);
          if (oldRule === false) {
            cssObject.rules.push(rule);
          } else if (rule.type == 'DELETED') {
            oldRule.type = 'DELETED';
          } else {
            //rule found just update value

            oldRule.value = rule.value;
          }
        }
      } else {
        cssObject.subStyles = minimalObject.subStyles; //TODO, make this intelligent too
      }

    }
  };

  /*
    filter outs rule objects whose type param equal to DELETED

    @param rules, array of rules

    @returns rules array, compacted by deleting all unneccessary rules
  */
  fi.prototype.compactRules = function(rules) {
    var newRules = [];
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].type !== 'DELETED') {
        newRules.push(rules[i]);
      }
    }
    return newRules;
  };
  /*
    computes string for ace editor using this.css or given cssBase optional parameter

    @param [optional] cssBase, if given computes cssString from cssObject array
  */
  fi.prototype.getCSSForEditor = function(cssBase, depth) {
    if (depth === undefined) {
      depth = 0;
    }
    var ret = '';
    if (cssBase === undefined) {
      cssBase = this.css;
    }
    //append imports
    for (var i = 0; i < cssBase.length; i++) {
      if (cssBase[i].type == 'imports') {
        ret += cssBase[i].styles + '\n\n';
      }
    }
    for (i = 0; i < cssBase.length; i++) {
      var tmp = cssBase[i];
      if (tmp.selector === undefined) { //temporarily omit media queries
        continue;
      }
      var comments = "";
      if (tmp.comments !== undefined) {
        comments = tmp.comments + '\n';
      }

      if (tmp.type == 'media') { //also put media queries to output
        ret += comments + tmp.selector + '{\n';
        ret += this.getCSSForEditor(tmp.subStyles, depth + 1);
        ret += '}\n\n';
      } else if (tmp.type !== 'keyframes' && tmp.type !== 'imports') {
        ret += this.getSpaces(depth) + comments + tmp.selector + ' {\n';
        ret += this.getCSSOfRules(tmp.rules, depth + 1);
        ret += this.getSpaces(depth) + '}\n\n';
      }
    }

    //append keyFrames
    for (i = 0; i < cssBase.length; i++) {
      if (cssBase[i].type == 'keyframes') {
        ret += cssBase[i].styles + '\n\n';
      }
    }

    return ret;
  };

  fi.prototype.getImports = function(cssObjectArray) {
    var imps = [];
    for (var i = 0; i < cssObjectArray.length; i++) {
      if (cssObjectArray[i].type == 'imports') {
        imps.push(cssObjectArray[i].styles);
      }
    }
    return imps;
  };
  /*
    given rules array, returns visually formatted css string
    to be used inside editor
  */
  fi.prototype.getCSSOfRules = function(rules, depth) {
    var ret = '';
    for (var i = 0; i < rules.length; i++) {
      if (rules[i] === undefined) {
        continue;
      }
      if (rules[i].defective === undefined) {
        ret += this.getSpaces(depth) + rules[i].directive + ' : ' + rules[i].value + ';\n';
      } else {
        ret += this.getSpaces(depth) + rules[i].value + ';\n';
      }

    }
    return ret || '\n';
  };

  /*
      A very simple helper function returns number of spaces appended in a single string,
      the number depends input parameter, namely input*2
  */
  fi.prototype.getSpaces = function(num) {
    var ret = '';
    for (var i = 0; i < num * 4; i++) {
      ret += ' ';
    }
    return ret;
  };

  /*
    Given css string or objectArray, parses it and then for every selector,
    prepends this.cssPreviewNamespace to prevent css collision issues

    @returns css string in which this.cssPreviewNamespace prepended
  */
  fi.prototype.applyNamespacing = function(css, forcedNamespace) {
    var cssObjectArray = css;
    var namespaceClass = '.' + this.cssPreviewNamespace;
    if(forcedNamespace !== undefined){
      namespaceClass = forcedNamespace;
    }

    if (typeof css === 'string') {
      cssObjectArray = this.parseCSS(css);
    }

    for (var i = 0; i < cssObjectArray.length; i++) {
      var obj = cssObjectArray[i];

      //bypass namespacing for @font-face @keyframes @import
      if(obj.selector.indexOf('@font-face') > -1 || obj.selector.indexOf('keyframes') > -1 || obj.selector.indexOf('@import') > -1 || obj.selector.indexOf('.form-all') > -1 || obj.selector.indexOf('#stage') > -1){
        continue;
      }

      if (obj.type !== 'media') {
        var selector = obj.selector.split(',');
        var newSelector = [];
        for (var j = 0; j < selector.length; j++) {
          if (selector[j].indexOf('.supernova') === -1) { //do not apply namespacing to selectors including supernova
            newSelector.push(namespaceClass + ' ' + selector[j]);
          } else {
            newSelector.push(selector[j]);
          }
        }
        obj.selector = newSelector.join(',');
      } else {
        obj.subStyles = this.applyNamespacing(obj.subStyles, forcedNamespace); //handle media queries as well
      }
    }

    return cssObjectArray;
  };

  /*
    given css string or object array, clears possible namespacing from
    all of the selectors inside the css
  */
  fi.prototype.clearNamespacing = function(css, returnObj) {
    if (returnObj === undefined) {
      returnObj = false;
    }
    var cssObjectArray = css;
    var namespaceClass = '.' + this.cssPreviewNamespace;
    if (typeof css === 'string') {
      cssObjectArray = this.parseCSS(css);
    }

    for (var i = 0; i < cssObjectArray.length; i++) {
      var obj = cssObjectArray[i];

      if (obj.type !== 'media') {
        var selector = obj.selector.split(',');
        var newSelector = [];
        for (var j = 0; j < selector.length; j++) {
          newSelector.push(selector[j].split(namespaceClass + ' ').join(''));
        }
        obj.selector = newSelector.join(',');
      } else {
        obj.subStyles = this.clearNamespacing(obj.subStyles, true); //handle media queries as well
      }
    }
    if (returnObj === false) {
      return this.getCSSForEditor(cssObjectArray);
    } else {
      return cssObjectArray;
    }

  };

  /*
    creates a new style tag (also destroys the previous one)
    and injects given css string into that css tag
  */
  fi.prototype.createStyleElement = function(id, css, format) {
    if (format === undefined) {
      format = false;
    }

    if (this.testMode === false && format!=='nonamespace') {
      //apply namespacing classes
      css = this.applyNamespacing(css);
    }

    if (typeof css != 'string') {
      css = this.getCSSForEditor(css);
    }
    //apply formatting for css
    if (format === true) {
      css = this.getCSSForEditor(this.parseCSS(css));
    }

    if (this.testMode !== false) {
      return this.testMode('create style #' + id, css); //if test mode, just pass result to callback
    }

    var __el = document.getElementById( id );
    if(__el){
      __el.parentNode.removeChild( __el );  
    }

    var head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');

    style.id = id;
    style.type = 'text/css';

    head.appendChild(style);

    if (style.styleSheet && !style.sheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  };

  global.cssjs = fi;

})(this);

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var Accessibility;
            (function (Accessibility) {
                Accessibility.aXeCheck = {
                    id: "accessibility.aXeCheck",
                    title: "aXe accessibility check",
                    description: "We are using aXe helps you catch accessibility issues early.",
                    prepare: function (rulecheck, analyzeSummary) {
                        analyzeSummary.pendingLoad++;
                        // Using aXe
                        axe.a11yCheck(document, function (results) {
                            rulecheck.items = [];
                            rulecheck.failed = (results.violations.length > 0);
                            rulecheck.skipRootLevel = rulecheck.failed;
                            for (var index = 0; index < results.violations.length; index++) {
                                var check = results.violations[index];
                                var item = {
                                    description: check.description,
                                    failed: true,
                                    id: check.id,
                                    title: check.help,
                                    type: "blockitems",
                                    items: []
                                };
                                rulecheck.items.push(item);
                                for (var nodeIndex = 0; nodeIndex < check.nodes.length; nodeIndex++) {
                                    var node = check.nodes[nodeIndex];
                                    var nodeEntry = {
                                        title: node.html,
                                        items: []
                                    };
                                    item.items.push(nodeEntry);
                                    for (var anyIndex = 0; anyIndex < node.any.length; anyIndex++) {
                                        nodeEntry.items.push({ title: node.any[anyIndex].message });
                                    }
                                }
                            }
                            analyzeSummary.pendingLoad--;
                        });
                    }
                };
            })(Accessibility = Rules.Accessibility || (Rules.Accessibility = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.deviceIcons = {
                    id: "mobileweb.deviceIcons",
                    title: "define platform icons",
                    description: "Platform icons helps user pinning your website with an icon that fits well on mobile device home.",
                    nodeTypes: ["meta", "link"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        rulecheck.data = {
                            hasWindowsIcons: false,
                            hasWindowsNotification: false,
                            hasIOSIcons: false
                        };
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        if (node.nodeName == "LINK") {
                            var rel = node.getAttribute("rel");
                            if (rel && rel == "apple-touch-icon-precomposed") {
                                rulecheck.data.hasIOSIcons = true;
                            }
                        }
                        else if (node.nodeName == "META") {
                            var name = node.getAttribute("name");
                            if (name) {
                                if (name.toLowerCase() == "msapplication-notification") {
                                    rulecheck.data.hasWindowsNotification = true;
                                }
                                else if (name.toLowerCase().indexOf("msapplication-") == 0) {
                                    rulecheck.data.hasWindowsIcons = true;
                                }
                            }
                        }
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                        if (!rulecheck.data.hasIOSIcons) {
                            rulecheck.failed = true;
                            rulecheck.items.push({
                                title: 'add Apple - iOS icons by adding link tags like <link rel="apple-touch-icon" href="youricon" sizes="57x57"" />'
                            });
                        }
                        if (!rulecheck.data.hasWindowsIcons) {
                            rulecheck.failed = true;
                            //https://msdn.microsoft.com/en-us/library/dn255024(v=vs.85).aspx
                            rulecheck.items.push({
                                title: 'add Microsoft - Windows tiles by adding meta tags like <link name="msapplication-square150x150logo" content="yourimage" />'
                            });
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var CSS;
            (function (CSS) {
                CSS.mobileMediaqueries = {
                    id: "mobileweb.usemediaqueries",
                    title: "use responsive approaches",
                    description: "Even if your website target only certain devices, you may have users with unexpected devices or screen ratio.",
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        if (!rulecheck.data) {
                            rulecheck.data = {
                                cssnbqueries: 0,
                                domnbqueries: 0
                            };
                        }
                    },
                    check: function (url, ast, rulecheck, analyzeSummary) {
                        //console.log("check css prefixes");
                        this.checkNodes(url, rulecheck, ast);
                    },
                    checkNodes: function (url, rulecheck, ast) {
                        if (!ast)
                            return;
                        ast.forEach(function (node, i) {
                            var nodeitem = null;
                            //scan content for media queries
                            if (node.type === "media") {
                                var media = node.selector;
                                if (media) {
                                    media = media.toLowerCase();
                                    if (media.indexOf("width") >= 0 || media.indexOf("height") >= 0) {
                                        rulecheck.data.cssnbqueries++;
                                    }
                                }
                            }
                        });
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                    }
                };
            })(CSS = Rules.CSS || (Rules.CSS = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.mobileMediaqueries = {
                    id: "mobileweb.usemediaqueries",
                    title: "use responsive approaches",
                    description: "Even if your website target only certain devices, you may have users with unexpected devices or screen ratio.",
                    nodeTypes: ["link"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        if (!rulecheck.data) {
                            rulecheck.data = {
                                cssnbqueries: 0,
                                domnbqueries: 0
                            };
                        }
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlstring) {
                        if (!node.getAttribute)
                            return;
                        var rel = node.getAttribute("rel");
                        if (rel && rel.toLocaleLowerCase() == "stylesheet") {
                            var media = node.getAttribute("media");
                            if (media) {
                                media = media.toLowerCase();
                                if (media.indexOf("width") >= 0 || media.indexOf("height") >= 0) {
                                    rulecheck.data.domnbqueries++;
                                }
                            }
                        }
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                        //console.log("media queries css:" + rulecheck.cssnbqueries + ", dom:" + rulecheck.domnbqueries);
                        if (rulecheck.data.cssnbqueries == 0 && rulecheck.data.domnbqueries == 0) {
                            if (rulecheck.data.cssnbqueries == 0) {
                                rulecheck.failed = true;
                                rulecheck.items.push({
                                    title: 'your css (either files or inline) does not use any media queries'
                                });
                            }
                            if (rulecheck.data.domnbqueries == 0) {
                                rulecheck.failed = true;
                                rulecheck.items.push({
                                    title: 'your link tags does not use any media queries'
                                });
                            }
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.useViewport = {
                    id: "mobileweb.use-viewport",
                    title: "use meta viewport",
                    description: "Use meta viewport tag to choose how your website will get scaled on smaller devices like phones. Define at least &lt;meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"&gt;",
                    nodeTypes: ["meta"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.failed = true;
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        var viewportattr = node.getAttribute("name");
                        if (viewportattr && viewportattr.toLowerCase() == "viewport") {
                            rulecheck.failed = false;
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var Files;
            (function (Files) {
                Files.contentEncoding = {
                    id: "performances.contentencoding",
                    title: "encode static content",
                    description: "content encoding like gzip or deflate helps reducing the network bandwith required to display your website, it is especially important for mobile devices. Use content encoding for static files like CSS and JavaScript files.",
                    check: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        for (var n in analyzeSummary.files.stylesheets) {
                            var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                            if (!isVorlonInjection && analyzeSummary.files.stylesheets[n].encoding && analyzeSummary.files.stylesheets[n].encoding == "none") {
                                rulecheck.failed = true;
                                rulecheck.items.push({
                                    title: "use content encoding for " + n
                                });
                            }
                        }
                        for (var n in analyzeSummary.files.scripts) {
                            var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                            if (!isVorlonInjection && analyzeSummary.files.scripts[n].encoding && analyzeSummary.files.scripts[n].encoding == "none") {
                                rulecheck.failed = true;
                                rulecheck.items.push({
                                    title: "use content encoding for " + n
                                });
                            }
                        }
                    }
                };
            })(Files = Rules.Files || (Rules.Files = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var Files;
            (function (Files) {
                Files.filesMinification = {
                    id: "performances.minification",
                    title: "minify static files",
                    description: "minification helps reducing the network bandwith required to display your website, it is especially important for mobile devices. Minify static files like CSS and JavaScript files.",
                    check: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        for (var n in analyzeSummary.files.stylesheets) {
                            var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                            if (!isVorlonInjection) {
                                var charPerLines = this.getAverageCharacterPerLine(analyzeSummary.files.stylesheets[n].content);
                                if (charPerLines < 50) {
                                    rulecheck.failed = true;
                                    rulecheck.items.push({
                                        title: "minify " + n
                                    });
                                }
                            }
                        }
                        for (var n in analyzeSummary.files.scripts) {
                            var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                            if (!isVorlonInjection) {
                                var charPerLines = this.getAverageCharacterPerLine(analyzeSummary.files.scripts[n].content);
                                if (charPerLines < 50) {
                                    rulecheck.failed = true;
                                    rulecheck.items.push({
                                        title: "minify " + n
                                    });
                                }
                            }
                        }
                    },
                    getAverageCharacterPerLine: function (content) {
                        if (!content)
                            return 1000;
                        var lines = content.split('\n');
                        if (lines.length == 0)
                            return 1000;
                        var total = 0;
                        lines.forEach(function (l) {
                            total += l.length;
                        });
                        return total / lines.length;
                    }
                };
            })(Files = Rules.Files || (Rules.Files = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.dontUsePlugins = {
                    id: "webstandards.dont-use-plugins",
                    title: "object and embed",
                    description: "With HTML5 embed or object tags can often be replaced with HTML5 features.",
                    nodeTypes: ["EMBED", "OBJECT"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        //console.log("check for plugins");
                        var source = null, data = null, type = null;
                        var source = node.getAttribute("src");
                        if (source)
                            source = source.toLowerCase();
                        else
                            source = "";
                        var data = node.getAttribute("data");
                        if (data)
                            data = data.toLowerCase();
                        else
                            data = "";
                        var type = node.getAttribute("type");
                        if (type)
                            type = type.toLowerCase();
                        else
                            type = "";
                        if (source.indexOf(".swf") > 0 || data.indexOf("swf") > 0) {
                            rulecheck.failed = true;
                            rulecheck.items.push({ message: "consider using HTML5 instead of Flash", content: VORLON.Tools.htmlToString(node.outerHTML) });
                        }
                        else if (type.indexOf("silverlight") > 0) {
                            rulecheck.failed = true;
                            rulecheck.items.push({ message: "consider using HTML5 instead of Silverlight", content: VORLON.Tools.htmlToString(node.outerHTML) });
                        }
                        else if (source.indexOf(".svg") > 0 || data.indexOf("svg") > 0) {
                            rulecheck.failed = true;
                            rulecheck.items.push({ message: "dont't use SVG with " + node.nodeType, content: VORLON.Tools.htmlToString(node.outerHTML) });
                        }
                        else {
                            rulecheck.failed = true;
                            rulecheck.items.push({ message: "use HTML5 instead of embed or object elements", content: VORLON.Tools.htmlToString(node.outerHTML) });
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.browserdetection = {
                    id: "webstandards.avoid-browser-detection",
                    exceptions: [
                        "ajax.googleapis.com",
                        "ajax.aspnetcdn.com",
                        "ajax.microsoft.com",
                        "jquery",
                        "mootools",
                        "prototype",
                        "protoaculous",
                        "google-analytics.com",
                        "partner.googleadservices.com"
                    ],
                    title: "avoid browser detection",
                    description: "Nowadays, browser have very similar user agent, and browser feature moves very fast. Browser detection leads to britle code. Consider using feature detection instead.",
                    nodeTypes: ["#comment"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                    },
                    isException: function (file) {
                        if (!file)
                            return false;
                        return this.exceptions.some(function (e) {
                            return file.indexOf(e) >= 0;
                        });
                    },
                    inspectAccesses: function (root, property, rulecheck) {
                        var _this = this;
                        var items = root[property];
                        if (items && items.length) {
                            items.forEach(function (item) {
                                var isException = _this.isException(item.file);
                                if (!isException) {
                                    rulecheck.failed = true;
                                    var stacked = item.stack.split("\n");
                                    var check = {
                                        title: "access to window.navigator." + property,
                                        content: stacked.slice(3, stacked.length).join("<br/>")
                                    };
                                    if (item.file) {
                                        check.title = check.title + " from " + item.file;
                                    }
                                    rulecheck.items.push(check);
                                }
                                else {
                                }
                            });
                        }
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                        var detection = analyzeSummary.browserDetection;
                        this.inspectAccesses(detection, "userAgent", rulecheck);
                        this.inspectAccesses(detection, "appVersion", rulecheck);
                        this.inspectAccesses(detection, "appName", rulecheck);
                        this.inspectAccesses(detection, "product", rulecheck);
                        this.inspectAccesses(detection, "vendor", rulecheck);
                    },
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.dontUseBrowserConditionalComment = {
                    id: "webstandards.avoid-browser-specific-css",
                    title: "avoid conditional comments",
                    description: "Conditional comments are not the best way to adapt your website to target browser, and support is dropped for IE > 9.",
                    nodeTypes: ["#comment"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        //console.log("checking comment " + node.nodeValue);
                        var commentContent = node.nodeValue.toLowerCase();
                        var hasConditionalComment = commentContent.indexOf("[if ie ") >= 0 ||
                            commentContent.indexOf("[if !ie]") >= 0 ||
                            commentContent.indexOf("[if gt ie ") >= 0 ||
                            commentContent.indexOf("[if gte ie ") >= 0 ||
                            commentContent.indexOf("[if lt ie ") >= 0 ||
                            commentContent.indexOf("[if lte ie ") >= 0;
                        if (hasConditionalComment) {
                            rulecheck.failed = true;
                            rulecheck.items.push({
                                title: VORLON.Tools.htmlToString(node.nodeValue)
                            });
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var CSS;
            (function (CSS) {
                CSS.cssfallback = {
                    id: "webstandards.cssfallback",
                    title: "incorrect use of css fallback",
                    description: "Ensure css fallback.",
                    prepare: function (rulecheck, analyzeSummary) {
                        this.fallBackErrorList = [];
                    },
                    check: function (url, ast, rulecheck, analyzeSummary) {
                        var parsed = ast;
                        for (var i = 0; i < parsed.length; i++) {
                            var selector = parsed[i].selector;
                            var rules = parsed[i].rules;
                            var resultsList = this.checkPrefix(rules);
                            if (resultsList.length > 0) {
                                // if (!results[url])
                                //     results[url] = {}
                                // if (!results[url][selector])
                                //     results[url][selector] = [];
                                //     
                                // for (var x = 0; x < resultsList.length; x++) {
                                //     results[url][selector].push(resultsList[x]);
                                // }
                                this.fallBackErrorList.push(resultsList);
                            }
                        }
                    },
                    capitalizeFirstLetter: function (string) {
                        return string.charAt(0).toUpperCase() + string.slice(1);
                    },
                    checkPrefix: function (rules) {
                        var errorList = [];
                        if (rules && rules.length)
                            for (var i = 0; i < rules.length; i++) {
                                if (rules[i].directive.indexOf('-webkit') === 0) {
                                    var _unprefixedPropertyName = this.unprefixedPropertyName(rules[i].directive);
                                    var good = this.checkIfNoPrefix(rules, _unprefixedPropertyName);
                                    if (!good) {
                                        var divTest = document.createElement('div');
                                        divTest.style['webkit' + this.capitalizeFirstLetter(_unprefixedPropertyName)] = rules[i].value;
                                        if (divTest.style['webkit' + this.capitalizeFirstLetter(_unprefixedPropertyName)] !== undefined) {
                                            good = true;
                                        }
                                    }
                                    if (!good) {
                                        errorList.push(rules[i].directive);
                                    }
                                }
                            }
                        return errorList;
                    },
                    checkIfNoPrefix: function (rules, prefix) {
                        var present = false;
                        if (rules && rules.length)
                            for (var i = 0; i < rules.length; i++) {
                                if (rules[i].directive.indexOf(prefix) === 0) {
                                    present = true;
                                    break;
                                }
                            }
                        if (!present) {
                            present = this.checkIfMsPrefix(rules, prefix);
                        }
                        return present;
                    },
                    checkIfMsPrefix: function (rules, prefix) {
                        var present = false;
                        if (rules && rules.length)
                            for (var i = 0; i < rules.length; i++) {
                                if (rules[i].directive.indexOf('-ms-' + prefix) === 0) {
                                    present = true;
                                    break;
                                }
                            }
                        return present;
                    },
                    unprefixedPropertyName: function (property) {
                        return property.replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", "");
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                        //console.log("check css css fallback");
                        var nodes = [];
                        rulecheck.items = [];
                        var failed = false;
                        if (!this.fallBackErrorList) {
                            rulecheck.title = "(disabled !) incorrect use of css fallback";
                            failed = true;
                            var np = {
                                title: "the check of css Fallback is disabled",
                                type: "blockitems",
                                failed: true,
                                items: []
                            };
                            rulecheck.items.push(np);
                        }
                        else {
                            for (var ii = 0; ii < this.fallBackErrorList.length; ii++) {
                                for (var fallErrorFile in this.fallBackErrorList[ii]) {
                                    failed = true;
                                    var fallError = this.fallBackErrorList[ii][fallErrorFile];
                                    var proprules = {
                                        title: fallErrorFile,
                                        type: "itemslist",
                                        items: []
                                    };
                                    for (var errorFile in fallError) {
                                        var peroor = {
                                            failed: true,
                                            id: "." + fallError[errorFile][ind],
                                            items: [],
                                            title: errorFile
                                        };
                                        proprules.items.push(peroor);
                                        for (var ind = 0; ind < fallError[errorFile].length; ind++) {
                                            peroor.items.push({
                                                failed: true, id: "." + fallError[errorFile][ind], items: [],
                                                title: "from " + fallError[errorFile][ind] + " to " + fallError[errorFile][ind].replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", ""), type: "error"
                                            });
                                        }
                                        if (proprules.items.length) {
                                            rulecheck.items.push(proprules);
                                        }
                                    }
                                }
                            }
                        }
                        rulecheck.failed = failed;
                    },
                };
            })(CSS = Rules.CSS || (Rules.CSS = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var CSS;
            (function (CSS) {
                var compatiblePrefixes = {
                    'animation': 'webkit',
                    'animation-delay': 'webkit',
                    'animation-direction': 'webkit',
                    'animation-duration': 'webkit',
                    'animation-fill-mode': 'webkit',
                    'animation-iteration-count': 'webkit',
                    'animation-name': 'webkit',
                    'animation-play-state': 'webkit',
                    'animation-timing-function': 'webkit',
                    'appearance': 'webkit moz',
                    'border-end': 'webkit moz',
                    'border-end-color': 'webkit moz',
                    'border-end-style': 'webkit moz',
                    'border-end-width': 'webkit moz',
                    'border-image': 'webkit o',
                    'border-start': 'webkit moz',
                    'border-start-color': 'webkit moz',
                    'border-start-style': 'webkit moz',
                    'border-start-width': 'webkit moz',
                    'box-sizing': 'webkit',
                    'column-count': 'webkit moz',
                    'column-gap': 'webkit moz',
                    'column-rule': 'webkit moz',
                    'column-rule-color': 'webkit moz',
                    'column-rule-style': 'webkit moz',
                    'column-rule-width': 'webkit moz',
                    'column-width': 'webkit moz',
                    'hyphens': 'webkit moz ms',
                    'margin-end': 'webkit moz',
                    'margin-start': 'webkit moz',
                    'padding-end': 'webkit moz',
                    'padding-start': 'webkit moz',
                    'tab-size': 'webkit moz o',
                    'text-size-adjust': 'webkit moz ms',
                    'transform': 'webkit ms',
                    'transform-origin': 'webkit ms',
                    'transition': 'webkit moz o',
                    'transition-delay': 'webkit moz o',
                    'transition-duration': 'webkit',
                    'transition-property': 'webkit',
                    'transition-timing-function': 'webkit',
                    'user-select': 'webkit moz ms'
                };
                var variations, prefixed, arrayPush = Array.prototype.push, applyTo = new Array();
                for (var prop in compatiblePrefixes) {
                    if (compatiblePrefixes.hasOwnProperty(prop)) {
                        variations = [];
                        prefixed = compatiblePrefixes[prop].split(' ');
                        for (var i = 0, len = prefixed.length; i < len; i++) {
                            variations.push('-' + prefixed[i] + '-' + prop);
                        }
                        compatiblePrefixes[prop] = variations;
                        variations.forEach(function (obj, i) {
                            applyTo[obj] = i;
                        });
                    }
                }
                CSS.cssprefixes = {
                    id: "webstandards.prefixes",
                    title: "incorrect use of prefixes",
                    description: "Ensure you use all vendor prefixes and unprefixed version for HTML5 CSS properties.",
                    check: function (url, ast, rulecheck, analyzeSummary) {
                        //console.log("check css prefixes");
                        var nodes = [];
                        var filerules = {
                            title: url,
                            type: "itemslist",
                            items: []
                        };
                        rulecheck.items = rulecheck.items || [];
                        this.checkNodes(url, compatiblePrefixes, filerules, ast, nodes);
                        if (filerules.items.length) {
                            rulecheck.items.push(filerules);
                            rulecheck.failed = true;
                        }
                    },
                    unprefixedPropertyName: function (property) {
                        return property.replace("-webkit-", "").replace("-moz-", "").replace("-o-", "").replace("-ms-", "");
                    },
                    getMissingPrefixes: function (compatiblePrefixes, node, property) {
                        var allProperty = compatiblePrefixes[property];
                        var prefixes = [];
                        allProperty.forEach(function (prop, y) {
                            var hasPrefix = node.rules.some(function (r) { return r.directive == prop; });
                            if (!hasPrefix) {
                                prefixes.push(prop);
                            }
                        });
                        return prefixes;
                    },
                    checkNodes: function (url, compatiblePrefixes, rulecheck, ast, nodes) {
                        var _this = this;
                        if (!ast)
                            return;
                        ast.forEach(function (node, i) {
                            var nodeitem = null;
                            if (node.rules && node.rules.length > 0) {
                                var checked = {};
                                for (var x = 0, len = node.rules.length; x < len; x++) {
                                    var property = node.rules[x].directive;
                                    var unprefixed = _this.unprefixedPropertyName(property);
                                    if (!checked[unprefixed] && compatiblePrefixes.hasOwnProperty(unprefixed)) {
                                        if (compatiblePrefixes[unprefixed].indexOf(unprefixed) == -1)
                                            compatiblePrefixes[unprefixed].push(unprefixed);
                                        var missings = _this.getMissingPrefixes(compatiblePrefixes, node, unprefixed);
                                        if (missings.length) {
                                            if (!nodeitem) {
                                                rulecheck.failed = true;
                                                rulecheck.items = rulecheck.items || [];
                                                nodeitem = {
                                                    title: node.selector,
                                                    items: []
                                                };
                                                rulecheck.items.push(nodeitem);
                                            }
                                            nodeitem.items.push({
                                                title: "<strong>" + unprefixed + "</strong> : missing " + missings,
                                            });
                                        }
                                    }
                                    checked[unprefixed] = true;
                                }
                            }
                            //scan content of media queries
                            if (node.type === "media") {
                                _this.checkNodes(url, compatiblePrefixes, rulecheck, node.subStyles, nodes);
                            }
                        });
                    }
                };
            })(CSS = Rules.CSS || (Rules.CSS = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var DOM;
            (function (DOM) {
                DOM.modernDocType = {
                    id: "webstandards.documentmode",
                    title: "use modern doctype",
                    description: "Modern doctype like &lt;!DOCTYPE html&gt; are better for browser compatibility and enable using HTML5 features.",
                    nodeTypes: ["META"],
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                    },
                    check: function (node, rulecheck, analyzeSummary, htmlString) {
                        var httpequiv = node.getAttribute("http-equiv");
                        if (httpequiv && httpequiv.toLowerCase() == "x-ua-compatible") {
                            var content = node.getAttribute("content");
                            if (!(content.toLowerCase().indexOf("edge") >= 0)) {
                                rulecheck.failed = true;
                                //current.content = doctype.html;
                                rulecheck.items.push({
                                    title: "your website use IE's document mode compatibility for an older version of IE ",
                                    content: VORLON.Tools.htmlToString(node.outerHTML)
                                });
                            }
                        }
                    },
                    endcheck: function (rulecheck, analyzeSummary) {
                        //console.log("checking comment " + node.nodeValue);
                        var doctype = analyzeSummary.doctype || {};
                        var current = {
                            title: "used doctype is <br/>" + VORLON.Tools.htmlToString(doctype.html)
                        };
                        if (doctype.publicId || doctype.systemId) {
                            rulecheck.failed = true;
                            //current.content = doctype.html;
                            rulecheck.items.push(current);
                        }
                    }
                };
            })(DOM = Rules.DOM || (Rules.DOM = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var JavaScript;
            (function (JavaScript) {
                var libraries = [
                    {
                        name: 'Prototype',
                        minVersions: [
                            { major: '1.7.', minor: '2' }
                        ],
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/Prototype JavaScript framework, version (\d+\.\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'Dojo',
                        minVersions: [
                            { major: '1.5.', minor: '3' },
                            { major: '1.6.', minor: '2' },
                            { major: '1.7.', minor: '5' },
                            { major: '1.8.', minor: '5' },
                            { major: '1.9.', minor: '2' },
                            { major: '1.10.', minor: '0' }
                        ],
                        check: function (checkVersion, scriptText) {
                            if (scriptText.indexOf('dojo') === -1) {
                                return false;
                            }
                            var version = scriptText.match(/\.version\s*=\s*\{\s*major:\s*(\d+)\D+(\d+)\D+(\d+)/m);
                            if (version) {
                                return checkVersion(this, version[1] + '.' + version[2] + '.' + version[3]);
                            }
                            version = scriptText.match(/\s*major:\s*(\d+),\s*minor:\s*(\d+),\s*patch:\s*(\d+),/mi);
                            return version && checkVersion(this, version[1] + '.' + version[2] + '.' + version[3]);
                        }
                    },
                    {
                        name: 'Mootools',
                        minVersions: [
                            { major: '1.2.', minor: '6' },
                            { major: '1.4.', minor: '5' },
                            { major: '1.5.', minor: '' }
                        ],
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/this.MooTools\s*=\s*\{version:\s*'(\d+\.\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'SWFObject',
                        minVersions: [
                            { major: '2.', minor: '2' }
                        ],
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/\*\s+SWFObject v(\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery Form Plugin',
                        minVersions: [
                            { major: '3.', minor: '22' }
                        ],
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/Form Plugin\s+\*\s+version: (\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'Modernizr',
                        minVersions: [
                            { major: '2.5.', minor: '2' },
                            { major: '2.6.', minor: '2' },
                            { major: '2.7.', minor: '1' },
                            { major: '2.8.', minor: '3' }
                        ],
                        check: function (checkVersion, scriptText) {
                            // Static analysis. :(  The version is set as a local variable, far from
                            // where Modernizr._version is set. Just see if we have a comment header.
                            // ALT: look for /VAR="1.2.3"/ then for /._version=VAR/ ... ugh.
                            var version = scriptText.match(/\*\s*Modernizr\s+(\d+\.\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery cookie',
                        minVersions: [
                            { major: '1.3.', minor: '1' },
                            { major: '1.4.', minor: '1' }
                        ],
                        patchOptional: false,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/\*\s*jQuery Cookie Plugin v(\d+\.\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'hoverIntent',
                        minVersions: [
                            { major: '1.8.', minor: '1' }
                        ],
                        patchOptional: false,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/\*\s*hoverIntent v(\d+\.\d+\.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery Easing',
                        minVersions: [
                            { major: '1.3.', minor: '0' }
                        ],
                        patchOptional: true,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/\*\s*jQuery Easing v(\d+\.\d+)\s*/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'underscore',
                        minVersions: [
                            { major: '1.8.', minor: '3' },
                            { major: '1.7.', minor: '0' },
                            { major: '1.6.', minor: '0' },
                            { major: '1.5.', minor: '2' }
                        ],
                        patchOptional: false,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/exports._(?:.*)?.VERSION="(\d+.\d+.\d+)"/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'hammer js',
                        minVersions: [
                            { major: '2.0.', minor: '4' }
                        ],
                        patchOptional: false,
                        check: function (checkVersion, scriptText) {
                            if (scriptText.indexOf('hammer.input') !== -1) {
                                var version = scriptText.match(/.VERSION\s*=\s*['|"](\d+.\d+.\d+)['|"]/m);
                                return version && checkVersion(this, version[1]);
                            }
                            return false;
                        }
                    },
                    {
                        name: 'jQuery Superfish',
                        minVersions: [
                            { major: '1.7.', minor: '4' }
                        ],
                        patchOptional: false,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/jQuery Superfish Menu Plugin - v(\d+.\d+.\d+)"/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery mousewheel',
                        minVersions: [
                            { major: '3.1.', minor: '12' }
                        ],
                        patchOptional: true,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/.mousewheel={version:"(\d+.\d+.\d+)/);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery mobile',
                        minVersions: [
                            { major: '1.4.', minor: '5' },
                            { major: '1.3.', minor: '2' }
                        ],
                        patchOptional: true,
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/.mobile,{version:"(\d+.\d+.\d+)/);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery UI',
                        minVersions: [
                            { major: '1.8.', minor: '24' },
                            { major: '1.9.', minor: '2' },
                            { major: '1.10.', minor: '4' },
                            { major: '1.11.', minor: '4' }
                        ],
                        check: function (checkVersion, scriptText) {
                            var version = scriptText.match(/\.ui,[\s\r\n]*\{[\s\r\n]*version:\s*"(\d+.\d+.\d+)/m);
                            return version && checkVersion(this, version[1]);
                        }
                    },
                    {
                        name: 'jQuery',
                        minVersions: [
                            { major: '1.6.', minor: '4' },
                            { major: '1.7.', minor: '2' },
                            { major: '1.8.', minor: '2' },
                            { major: '1.9.', minor: '1' },
                            { major: '1.10.', minor: '2' },
                            { major: '1.11.', minor: '3' },
                            { major: '2.0.', minor: '3' },
                            { major: '2.1.', minor: '4' }
                        ],
                        patchOptional: true,
                        check: function (checkVersion, scriptText) {
                            //We search the version in the header
                            //Explanation: Some libraries have things like: Requires: jQuery v1.7.1 (cycle, for example)
                            //We are matching regex that contain jQuery vx.y.z but do not have : right before jQuery
                            var regex = /(?:jQuery\s*v)(\d+.\d+.\d+)\s/g;
                            var regversion = regex.exec(scriptText);
                            if (regversion) {
                                var isPluginRegExp = new RegExp('(?::\\s*)' + regversion[0], 'g');
                                if (!isPluginRegExp.exec(scriptText)) {
                                    return checkVersion(this, regversion[1]);
                                }
                            }
                            var matchversion = scriptText.match(/jquery:\s*"([^"]+)/);
                            if (matchversion) {
                                return checkVersion(this, matchversion[1]);
                            }
                            //If header fails, we look with another pattern
                            var regex = /(?:jquery[,\)].{0,200}=")(\d+\.\d+)(\..*?)"/gi;
                            var results = regex.exec(scriptText);
                            var version = results ? (results[1] + (results[2] || '')) : null;
                            return version && checkVersion(this, version);
                        }
                    }
                ];
                JavaScript.librariesVersions = {
                    id: "webstandards.javascript-libraries-versions",
                    title: "update javascript libraries",
                    description: "Try being up to date with your JavaScript libraries like jQuery. Latest versions usually improves performances and browsers compatibility.",
                    prepare: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                    },
                    check: function (url, javascriptContent, rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        var filecheck = null;
                        if (!javascriptContent || url == "inline")
                            return;
                        for (var i = 0; i < libraries.length; i++) {
                            var lib = libraries[i], result;
                            result = lib.check.call(lib, this.checkVersion, javascriptContent);
                            if (result && result.needsUpdate) {
                                if (!filecheck) {
                                    filecheck = {
                                        title: url,
                                        items: []
                                    };
                                    rulecheck.items.push(filecheck);
                                }
                                filecheck.items.push({
                                    title: "detected " + result.name + " version " + result.version,
                                });
                                rulecheck.failed = true;
                                break;
                            }
                        }
                    },
                    checkVersion: function (library, version) {
                        var vinfo = {
                            name: library.name,
                            needsUpdate: true,
                            minVersion: library.minVersions[0].major + library.minVersions[0].minor,
                            version: version,
                            bannedVersion: null
                        };
                        if (library.patchOptional) {
                            // If lib can have an implied ".0", add it when needed
                            // match 1.17, 1.17b2, 1.17-beta2; not 1.17.0, 1.17.2, 1.17b2
                            var parts = version.match(/^(\d+\.\d+)(.*)$/);
                            if (parts && !/^\.\d+/.test(parts[2])) {
                                version = parts[1] + '.0' + parts[2];
                            }
                        }
                        for (var i = 0; i < library.minVersions.length; i++) {
                            var gv = library.minVersions[i];
                            if (version.indexOf(gv.major) === 0) {
                                vinfo.minVersion = gv.major + gv.minor;
                                vinfo.needsUpdate = +version.slice(gv.major.length) < +gv.minor;
                                break;
                            }
                        }
                        if (library.bannedVersions) {
                            if (library.bannedVersions.indexOf(version) >= 0) {
                                vinfo.bannedVersion = version;
                                vinfo.needsUpdate = true;
                            }
                        }
                        return vinfo;
                    }
                };
            })(JavaScript = Rules.JavaScript || (Rules.JavaScript = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var WebStandardsClient = (function (_super) {
        __extends(WebStandardsClient, _super);
        function WebStandardsClient() {
            var _this = this;
            _super.call(this, "webstandards");
            this._currentAnalyze = {};
            this.browserDetectionHook = {
                userAgent: [],
                appVersion: [],
                appName: [],
                product: [],
                vendor: [],
            };
            this.exceptions = [
                "vorlon.max.js",
                "vorlon.min.js",
                "vorlon.js",
                "google-analytics.com"
            ];
            this._id = "WEBSTANDARDS";
            //this.debug = true;
            this._loadNewScriptAsync("css.js", function () {
                _this._loadNewScriptAsync("axe.min.js", function () {
                    _this._ready = true;
                }, true);
            }, true);
        }
        WebStandardsClient.prototype.refresh = function () {
        };
        // Start the clientside code
        WebStandardsClient.prototype.startClientSide = function () {
            this.hook(window.navigator, "userAgent");
            this.hook(window.navigator, "appVersion");
            this.hook(window.navigator, "appName");
            this.hook(window.navigator, "product");
            this.hook(window.navigator, "vendor");
        };
        WebStandardsClient.prototype.hook = function (root, prop) {
            var _this = this;
            VORLON.Tools.HookProperty(root, prop, function (stack) {
                //this.trace("browser detection " + stack.file);
                //this.trace(stack.stack);
                if (stack.file) {
                    if (_this.exceptions.some(function (s) { return stack.file.indexOf(s) >= 0; })) {
                        //this.trace("skip browser detection access " + stack.file)
                        return;
                    }
                }
                _this.browserDetectionHook[prop].push(stack);
            });
        };
        WebStandardsClient.prototype.startNewAnalyze = function (data) {
            var _this = this;
            this.trace("start webstandards analyze " + data.id);
            this._currentAnalyze = {
                id: data.id,
                results: {},
                processing: true,
                canceled: false,
                location: window.location.href,
                html: document.documentElement.outerHTML,
                browserDetection: this.browserDetectionHook,
                doctype: {
                    html: null,
                    name: null,
                    publicId: null,
                    systemId: null
                },
                files: {
                    scripts: {},
                    stylesheets: {}
                },
                pendingLoad: 0,
                lastActivity: new Date()
            };
            this.prepareAnalyze(this._currentAnalyze);
            var node = document.doctype;
            if (node) {
                var doctypeHtml = "<!DOCTYPE "
                    + node.name
                    + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '')
                    + (!node.publicId && node.systemId ? ' SYSTEM' : '')
                    + (node.systemId ? ' "' + node.systemId + '"' : '')
                    + '>';
                this._currentAnalyze.doctype = {
                    html: doctypeHtml,
                    name: node.name,
                    publicId: node.publicId,
                    systemId: node.systemId
                };
            }
            var stylesheets = document.querySelectorAll("link[rel=stylesheet]");
            var nbStylesheets = stylesheets.length;
            for (var i = 0; i < stylesheets.length; i++) {
                var s = stylesheets[i];
                var href = s.attributes.getNamedItem("href");
                if (href) {
                    var file = { url: href.value, loaded: false, content: null };
                    this._currentAnalyze.files.stylesheets[href.value] = file;
                    this.getDocumentContent({ analyzeid: data.id, url: href.value }, file, function (url, file) {
                        _this.analyzeCssDocument(url, file.content, _this._currentAnalyze);
                    });
                }
            }
            var scripts = document.querySelectorAll("script");
            var nbScripts = scripts.length;
            for (var i = 0; i < scripts.length; i++) {
                var s = scripts[i];
                var src = s.attributes.getNamedItem("src");
                if (src && src.value) {
                    var isVorlon = src.value.indexOf('vorlon.js') > 0 || src.value.indexOf('vorlon.min.js') > 0 || src.value.indexOf('vorlon.max.js') > 0;
                    if (!isVorlon) {
                        var file = { url: src.value, loaded: false, content: null };
                        this._currentAnalyze.files.scripts[src.value] = file;
                        this.getDocumentContent({ analyzeid: data.id, url: src.value }, file, function (url, file) {
                            _this.analyzeJsDocument(url, file.content, _this._currentAnalyze);
                        });
                    }
                }
            }
            this.analyzeDOM(document, this._currentAnalyze.html, this._currentAnalyze);
            this._refreshLoop = setInterval(function () {
                _this.checkLoadingState();
            }, 1000);
        };
        WebStandardsClient.prototype.checkLoadingState = function () {
            if (this._currentAnalyze && this._currentAnalyze.pendingLoad <= 0) {
                this.trace("resource load completed");
                this._currentAnalyze.processing = false;
            }
            if (!this._currentAnalyze || this._currentAnalyze.ended || this._currentAnalyze.canceled) {
                return;
            }
            if (this._currentAnalyze.processing) {
                return;
            }
            else {
                this._currentAnalyze.ended = true;
                this.endAnalyze(this._currentAnalyze);
            }
        };
        WebStandardsClient.prototype.initialiseRuleSummary = function (rule, analyze) {
            var tokens = rule.id.split('.');
            var current = analyze.results;
            var id = "";
            current.rules = current.rules || {};
            tokens.forEach(function (t) {
                id = (id.length > 0) ? "." + t : t;
                if (!current.rules) {
                    current.rules = {};
                }
                if (!current.rules[t])
                    current.rules[t] = { id: id };
                current = current.rules[t];
            });
            if (current.failed === undefined) {
                current.failed = false;
                current.title = rule.title;
                current.description = rule.description;
            }
            return current;
        };
        WebStandardsClient.prototype.prepareAnalyze = function (analyze) {
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var cssrule = VORLON.WebStandards.Rules.CSS[n];
                if (cssrule) {
                    var current = this.initialiseRuleSummary(cssrule, analyze);
                    if (cssrule.prepare)
                        cssrule.prepare(current, analyze);
                }
            }
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var scriptrule = VORLON.WebStandards.Rules.JavaScript[n];
                if (scriptrule) {
                    var current = this.initialiseRuleSummary(scriptrule, analyze);
                    if (scriptrule.prepare)
                        scriptrule.prepare(current, analyze);
                }
            }
            for (var n in VORLON.WebStandards.Rules.Accessibility) {
                var accessibilityRule = VORLON.WebStandards.Rules.Accessibility[n];
                if (accessibilityRule) {
                    var current = this.initialiseRuleSummary(accessibilityRule, analyze);
                    if (accessibilityRule.prepare)
                        accessibilityRule.prepare(current, analyze);
                }
            }
        };
        WebStandardsClient.prototype.endAnalyze = function (analyze) {
            clearInterval(this._refreshLoop);
            for (var n in VORLON.WebStandards.Rules.DOM) {
                var rule = VORLON.WebStandards.Rules.DOM[n];
                if (rule && !rule.generalRule && rule.endcheck) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.endcheck(current, analyze);
                }
            }
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var cssrule = VORLON.WebStandards.Rules.CSS[n];
                if (cssrule) {
                    var current = this.initialiseRuleSummary(cssrule, analyze);
                    if (cssrule.endcheck)
                        cssrule.endcheck(current, analyze);
                }
            }
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var scriptrule = VORLON.WebStandards.Rules.JavaScript[n];
                if (scriptrule) {
                    var current = this.initialiseRuleSummary(scriptrule, analyze);
                    if (scriptrule.endcheck)
                        scriptrule.endcheck(current, analyze);
                }
            }
            this.analyzeFiles(this._currentAnalyze);
            this.trace("sending result to dashboard");
            this.sendCommandToDashboard("analyseResult", { result: this._currentAnalyze });
        };
        WebStandardsClient.prototype.cancelAnalyse = function (id) {
            clearInterval(this._refreshLoop);
            this.trace("canceling analyze " + id);
            if (this._currentAnalyze && this._currentAnalyze.id == id) {
                this.trace("analyze " + id + " canceled");
                this._currentAnalyze.canceled = true;
                this._currentAnalyze.processing = false;
                this.sendCommandToDashboard("analyseCanceled", { id: this._currentAnalyze.id });
            }
        };
        WebStandardsClient.prototype.analyzeDOM = function (document, htmlContent, analyze) {
            var _this = this;
            var generalRules = [];
            var commonRules = [];
            var rules = {
                domRulesIndex: {},
                domRulesForAllNodes: []
            };
            //we index rules based on target node types
            for (var n in VORLON.WebStandards.Rules.DOM) {
                var rule = VORLON.WebStandards.Rules.DOM[n];
                if (rule) {
                    var rulecheck = this.initialiseRuleSummary(rule, analyze);
                    if (rule.prepare) {
                        rule.prepare(rulecheck, analyze);
                    }
                    if (rule.generalRule) {
                        generalRules.push(rule);
                    }
                    else {
                        commonRules.push(rule);
                        if (rule.nodeTypes.length) {
                            rule.nodeTypes.forEach(function (n) {
                                n = n.toUpperCase();
                                if (!rules.domRulesIndex[n])
                                    rules.domRulesIndex[n] = [];
                                rules.domRulesIndex[n].push(rule);
                            });
                        }
                        else {
                            rules.domRulesForAllNodes.push(rule);
                        }
                    }
                }
            }
            this.analyzeDOMNode(document, rules, analyze, htmlContent);
            generalRules.forEach(function (rule) {
                _this.applyDOMNodeRule(document, rule, analyze, htmlContent);
            });
        };
        WebStandardsClient.prototype.analyzeDOMNode = function (node, rules, analyze, htmlContent) {
            var _this = this;
            if (node.nodeName === "STYLE") {
                this.analyzeCssDocument("inline", node.innerHTML, analyze);
            }
            if (node.nodeName === "SCRIPT") {
                var domnode = node;
                var scriptType = domnode.getAttribute("type");
                var hasContent = domnode.innerHTML.trim().length > 0;
                if (!scriptType || scriptType == "text/javascript" && hasContent) {
                    this.analyzeJsDocument("inline", domnode.innerHTML, analyze);
                }
            }
            var specificRules = rules.domRulesIndex[node.nodeName.toUpperCase()];
            if (specificRules && specificRules.length) {
                specificRules.forEach(function (r) {
                    _this.applyDOMNodeRule(node, r, analyze, htmlContent);
                });
            }
            if (rules.domRulesForAllNodes && rules.domRulesForAllNodes.length) {
                rules.domRulesForAllNodes.forEach(function (r) {
                    _this.applyDOMNodeRule(node, r, analyze, htmlContent);
                });
            }
            for (var i = 0, l = node.childNodes.length; i < l; i++) {
                this.analyzeDOMNode(node.childNodes[i], rules, analyze, htmlContent);
            }
        };
        WebStandardsClient.prototype.applyDOMNodeRule = function (node, rule, analyze, htmlContent) {
            var current = this.initialiseRuleSummary(rule, analyze);
            rule.check(node, current, analyze, htmlContent);
        };
        WebStandardsClient.prototype.analyzeCssDocument = function (url, content, analyze) {
            var parser = new cssjs();
            var parsed = parser.parseCSS(content);
            this.trace("processing css " + url);
            //we index rules based on target node types
            for (var n in VORLON.WebStandards.Rules.CSS) {
                var rule = VORLON.WebStandards.Rules.CSS[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(url, parsed, current, analyze);
                }
            }
        };
        WebStandardsClient.prototype.analyzeFiles = function (analyze) {
            for (var n in VORLON.WebStandards.Rules.Files) {
                var rule = VORLON.WebStandards.Rules.Files[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(current, analyze);
                }
            }
        };
        WebStandardsClient.prototype.analyzeJsDocument = function (url, content, analyze) {
            this.trace("processing script " + url);
            for (var n in VORLON.WebStandards.Rules.JavaScript) {
                var rule = VORLON.WebStandards.Rules.JavaScript[n];
                if (rule) {
                    var current = this.initialiseRuleSummary(rule, analyze);
                    rule.check(url, content, current, analyze);
                }
            }
        };
        WebStandardsClient.prototype.getDocumentContent = function (data, file, resultcallback) {
            var _this = this;
            this._currentAnalyze.pendingLoad++;
            this.trace("request file " + data.url + " " + this._currentAnalyze.pendingLoad);
            this.xhrDocumentContent(data, function (url, content, status, contentlength, encoding, error) {
                file.content = content;
                file.loaded = (error == null || error == undefined);
                file.encoding = encoding;
                file.contentLength = contentlength;
                file.error = error;
                file.status = status;
                _this._currentAnalyze.lastActivity = new Date();
                _this._currentAnalyze.pendingLoad--;
                _this.checkLoadingState();
                if (file.loaded && !_this._currentAnalyze.canceled) {
                    resultcallback(data.url, file);
                }
            });
        };
        WebStandardsClient.prototype.xhrDocumentContent = function (data, resultcallback) {
            var _this = this;
            var xhr = null;
            var completed = false;
            var timeoutRef = null;
            if (!data || !data.url) {
                this.trace("invalid fetch request");
                return;
            }
            var documentUrl = data.url;
            if (documentUrl.indexOf("//") === 0) {
                documentUrl = window.location.protocol + documentUrl;
            }
            documentUrl = this.getAbsolutePath(documentUrl);
            this.trace("fetching " + documentUrl);
            try {
                xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            completed = true;
                            clearTimeout(timeoutRef);
                            var encoding = xhr.getResponseHeader("X-VorlonProxyEncoding") || xhr.getResponseHeader("content-encoding");
                            var contentLength = xhr.getResponseHeader("content-length");
                            _this.trace("encoding for " + data.url + " is " + encoding);
                            resultcallback(data.url, xhr.responseText, xhr.status, contentLength, encoding, null);
                        }
                        else {
                            completed = true;
                            clearTimeout(timeoutRef);
                            resultcallback(data.url, null, xhr.status, null, null, xhr.responseText);
                        }
                    }
                };
                xhr.open("GET", documentUrl, true);
                xhr.send(null);
                timeoutRef = setTimeout(function () {
                    if (!completed) {
                        completed = true;
                        _this.trace("fetch timeout for " + data.url);
                        xhr.abort();
                        resultcallback(data.url, null, null, null, null, "timeout");
                    }
                }, 20 * 1000);
            }
            catch (e) {
                console.error(e);
                completed = true;
                clearTimeout(timeoutRef);
                resultcallback(data.url, null, null, null, null, e.message);
            }
        };
        WebStandardsClient.prototype.getAbsolutePath = function (url) {
            var a = document.createElement('a');
            a.href = url;
            return a.href;
        };
        return WebStandardsClient;
    })(VORLON.ClientPlugin);
    VORLON.WebStandardsClient = WebStandardsClient;
    WebStandardsClient.prototype.ClientCommands = {
        startNewAnalyze: function (data) {
            var plugin = this;
            plugin.startNewAnalyze(data);
        },
        cancelAnalyze: function (data) {
            var plugin = this;
            plugin.cancelAnalyse(data.id);
        }
    };
    //Register the plugin with vorlon core
    VORLON.Core.RegisterClientPlugin(new WebStandardsClient());
})(VORLON || (VORLON = {}));

"use strict";
var VORLON;
(function (VORLON) {
    //Start the core
    VORLON.Core.StartClientSide();
})(VORLON || (VORLON = {}));
