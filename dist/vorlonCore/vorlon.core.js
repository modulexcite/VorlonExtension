var VORLON;
(function (VORLON) {
    class _Core {
        constructor() {
            this._clientPlugins = new Array();
            this._dashboardPlugins = new Array();
            this._socketIOWaitCount = 0;
            this.debug = false;
            this._RetryTimeout = 1002;
        }
        get Messenger() {
            return VORLON.Core._messenger;
        }
        get ClientPlugins() {
            return VORLON.Core._clientPlugins;
        }
        get DashboardPlugins() {
            return VORLON.Core._dashboardPlugins;
        }
        RegisterClientPlugin(plugin) {
            VORLON.Core._clientPlugins.push(plugin);
        }
        RegisterDashboardPlugin(plugin) {
            VORLON.Core._dashboardPlugins.push(plugin);
        }
        StopListening() {
            if (VORLON.Core._messenger) {
                VORLON.Core._messenger.stopListening();
                delete VORLON.Core._messenger;
            }
        }
        StartClientSide(serverUrl = "'http://localhost:1337/'", sessionId = "", listenClientId = "") {
            VORLON.Core._side = VORLON.RuntimeSide.Client;
            VORLON.Core._sessionID = sessionId;
            VORLON.Core._listenClientId = listenClientId;
            // Checking socket.io
            if (typeof (window) !== 'undefined' && window.io === undefined) {
                if (this._socketIOWaitCount < 10) {
                    this._socketIOWaitCount++;
                    // Let's wait a bit just in case socket.io was loaded asynchronously
                    setTimeout(function () {
                        console.log("Vorlon.js: waiting for socket.io to load...");
                        VORLON.Core.StartClientSide(serverUrl, sessionId, listenClientId);
                    }, 1000);
                }
                else {
                    console.log("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.");
                    VORLON.Core.ShowError("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.", 0);
                }
                return;
            }
            // Cookie
            var clientId;
            if (typeof (window) !== 'undefined') {
                clientId = VORLON.Tools.ReadCookie("vorlonJS_clientId");
                if (!clientId) {
                    clientId = VORLON.Tools.CreateGUID();
                    VORLON.Tools.CreateCookie("vorlonJS_clientId", clientId, 1);
                }
            }
            else {
                clientId = VORLON.Tools.CreateGUID();
            }
            // Creating the messenger
            if (VORLON.Core._messenger) {
                VORLON.Core._messenger.stopListening();
                delete VORLON.Core._messenger;
            }
            VORLON.Core._messenger = new VORLON.ClientMessenger(VORLON.Core._side, serverUrl, sessionId, clientId, listenClientId);
            // Connect messenger to dispatcher
            VORLON.Core.Messenger.onRealtimeMessageReceived = VORLON.Core._Dispatch;
            VORLON.Core.Messenger.onHeloReceived = VORLON.Core._OnIdentificationReceived;
            VORLON.Core.Messenger.onIdentifyReceived = VORLON.Core._OnIdentifyReceived;
            VORLON.Core.Messenger.onStopListenReceived = VORLON.Core._OnStopListenReceived;
            VORLON.Core.Messenger.onError = VORLON.Core._OnError;
            VORLON.Core.Messenger.onReload = VORLON.Core._OnReloadClient;
            this.sendHelo();
            // Launch plugins
            for (var index = 0; index < VORLON.Core._clientPlugins.length; index++) {
                var plugin = VORLON.Core._clientPlugins[index];
                plugin.startClientSide();
            }
            // Handle client disconnect
            if (typeof (window) !== 'undefined') {
                window.addEventListener("beforeunload", function () {
                    VORLON.Core.Messenger.sendRealtimeMessage("", { socketid: VORLON.Core.Messenger.socketId }, VORLON.Core._side, "clientclosed");
                }, false);
            }
            // Start global dirty check, at this point document is not ready,
            // little timeout to defer starting dirtycheck
            setTimeout(() => {
                this.startClientDirtyCheck();
            }, 500);
        }
        sendHelo() {
            if (typeof (window) === 'undefined') {
            }
            else {
                // Say 'helo'
                var heloMessage = {
                    ua: navigator.userAgent,
                    identity: sessionStorage["vorlonClientIdentity"] || localStorage["vorlonClientIdentity"]
                };
            }
            VORLON.Core.Messenger.sendRealtimeMessage("", heloMessage, VORLON.Core._side, "helo");
        }
        startClientDirtyCheck() {
            //sometimes refresh is called before document was loaded
            if (!document.body) {
                setTimeout(() => {
                    this.startClientDirtyCheck();
                }, 200);
                return;
            }
            var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || null;
            if (mutationObserver) {
                if (!document.body.__vorlon)
                    document.body.__vorlon = {};
                var config = { attributes: true, childList: true, subtree: true, characterData: true };
                document.body.__vorlon._observerMutationObserver = new mutationObserver((mutations) => {
                    var sended = false;
                    var cancelSend = false;
                    var sendComandId = [];
                    mutations.forEach((mutation) => {
                        if (cancelSend) {
                            for (var i = 0; i < sendComandId.length; i++) {
                                clearTimeout(sendComandId[i]);
                            }
                            cancelSend = false;
                        }
                        if (mutation.target && mutation.target.__vorlon && mutation.target.__vorlon.ignore) {
                            cancelSend = true;
                            return;
                        }
                        if (mutation.previousSibling && mutation.previousSibling.__vorlon && mutation.previousSibling.__vorlon.ignore) {
                            cancelSend = true;
                            return;
                        }
                        if (mutation.target && !sended && mutation.target.__vorlon && mutation.target.parentNode && mutation.target.parentNode.__vorlon && mutation.target.parentNode.__vorlon.internalId) {
                            sendComandId.push(setTimeout(() => {
                                var internalId = null;
                                if (mutation && mutation.target && mutation.target.parentNode && mutation.target.parentNode.__vorlon && mutation.target.parentNode.__vorlon.internalId)
                                    internalId = mutation.target.parentNode.__vorlon.internalId;
                                VORLON.Core.Messenger.sendRealtimeMessage('ALL_PLUGINS', {
                                    type: 'contentchanged',
                                    internalId: internalId
                                }, VORLON.Core._side, 'message');
                            }, 300));
                        }
                        sended = true;
                    });
                });
                document.body.__vorlon._observerMutationObserver.observe(document.body, config);
            }
            else {
                console.log("dirty check using html string");
                var content;
                if (document.body)
                    content = document.body.innerHTML;
                setInterval(() => {
                    var html = document.body.innerHTML;
                    if (content != html) {
                        content = html;
                        VORLON.Core.Messenger.sendRealtimeMessage('ALL_PLUGINS', {
                            type: 'contentchanged'
                        }, VORLON.Core._side, 'message');
                    }
                }, 2000);
            }
        }
        StartDashboardSide(serverUrl = "'http://localhost:1337/'", sessionId = "", listenClientId = "", divMapper = null) {
            VORLON.Core._side = VORLON.RuntimeSide.Dashboard;
            VORLON.Core._sessionID = sessionId;
            VORLON.Core._listenClientId = listenClientId;
            /* Notification elements */
            VORLON.Core._errorNotifier = document.createElement('x-notify');
            VORLON.Core._errorNotifier.setAttribute('type', 'error');
            VORLON.Core._errorNotifier.setAttribute('position', 'top');
            VORLON.Core._errorNotifier.setAttribute('duration', 5000);
            VORLON.Core._messageNotifier = document.createElement('x-notify');
            VORLON.Core._messageNotifier.setAttribute('position', 'top');
            VORLON.Core._messageNotifier.setAttribute('duration', 4000);
            document.body.appendChild(VORLON.Core._errorNotifier);
            document.body.appendChild(VORLON.Core._messageNotifier);
            // Checking socket.io
            if (typeof (window) !== 'undefined' && window.io === undefined) {
                if (this._socketIOWaitCount < 10) {
                    this._socketIOWaitCount++;
                    // Let's wait a bit just in case socket.io was loaded asynchronously
                    setTimeout(function () {
                        console.log("Vorlon.js: waiting for socket.io to load...");
                        VORLON.Core.StartDashboardSide(serverUrl, sessionId, listenClientId, divMapper);
                    }, 1000);
                }
                else {
                    console.log("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.");
                    VORLON.Core.ShowError("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.", 0);
                }
                return;
            }
            // Cookie
            var clientId = VORLON.Tools.ReadCookie("vorlonJS_clientId");
            if (!clientId) {
                clientId = VORLON.Tools.CreateGUID();
                VORLON.Tools.CreateCookie("vorlonJS_clientId", clientId, 1);
            }
            // Creating the messenger
            if (VORLON.Core._messenger) {
                VORLON.Core._messenger.stopListening();
                delete VORLON.Core._messenger;
            }
            VORLON.Core._messenger = new VORLON.ClientMessenger(VORLON.Core._side, serverUrl, sessionId, clientId, listenClientId);
            // Connect messenger to dispatcher
            VORLON.Core.Messenger.onRealtimeMessageReceived = VORLON.Core._Dispatch;
            VORLON.Core.Messenger.onHeloReceived = VORLON.Core._OnIdentificationReceived;
            VORLON.Core.Messenger.onIdentifyReceived = VORLON.Core._OnIdentifyReceived;
            VORLON.Core.Messenger.onStopListenReceived = VORLON.Core._OnStopListenReceived;
            VORLON.Core.Messenger.onError = VORLON.Core._OnError;
            // Say 'helo'
            var heloMessage = {
                ua: navigator.userAgent
            };
            VORLON.Core.Messenger.sendRealtimeMessage("", heloMessage, VORLON.Core._side, "helo");
            // Launch plugins
            for (var index = 0; index < VORLON.Core._dashboardPlugins.length; index++) {
                var plugin = VORLON.Core._dashboardPlugins[index];
                plugin.startDashboardSide(divMapper ? divMapper(plugin.getID()) : null);
            }
        }
        _OnStopListenReceived() {
            VORLON.Core._listenClientId = "";
        }
        _OnIdentifyReceived(message) {
            //console.log('identify ' + message);
            if (VORLON.Core._side === VORLON.RuntimeSide.Dashboard) {
                VORLON.Core._messageNotifier.innerHTML = message;
                VORLON.Core._messageNotifier.show();
            }
            else {
                var div = document.createElement("div");
                div.className = "vorlonIdentifyNumber";
                div.style.position = "absolute";
                div.style.left = "0";
                div.style.top = "50%";
                div.style.marginTop = "-150px";
                div.style.width = "100%";
                div.style.height = "300px";
                div.style.fontFamily = "Arial";
                div.style.fontSize = "300px";
                div.style.textAlign = "center";
                div.style.color = "white";
                div.style.textShadow = "2px 2px 5px black";
                div.style.zIndex = "100";
                div.innerHTML = message;
                document.body.appendChild(div);
                setTimeout(() => {
                    document.body.removeChild(div);
                }, 4000);
            }
        }
        ShowError(message, timeout = 5000) {
            if (VORLON.Core._side === VORLON.RuntimeSide.Dashboard) {
                VORLON.Core._errorNotifier.innerHTML = message;
                VORLON.Core._errorNotifier.setAttribute('duration', timeout);
                VORLON.Core._errorNotifier.show();
            }
            else {
                var divError = document.createElement("div");
                divError.style.position = "absolute";
                divError.style.top = "0";
                divError.style.left = "0";
                divError.style.width = "100%";
                divError.style.height = "100px";
                divError.style.backgroundColor = "red";
                divError.style.textAlign = "center";
                divError.style.fontSize = "30px";
                divError.style.paddingTop = "20px";
                divError.style.color = "white";
                divError.style.fontFamily = "consolas";
                divError.style.zIndex = "1001";
                divError.innerHTML = message;
                document.body.appendChild(divError);
                if (timeout) {
                    setTimeout(() => {
                        document.body.removeChild(divError);
                    }, timeout);
                }
            }
        }
        _OnError(err) {
            VORLON.Core.ShowError("Error while connecting to server. Server may be offline.<BR>Error message: " + err.message);
        }
        _OnIdentificationReceived(id) {
            VORLON.Core._listenClientId = id;
            if (VORLON.Core._side === VORLON.RuntimeSide.Client) {
                // Refresh plugins
                for (var index = 0; index < VORLON.Core._clientPlugins.length; index++) {
                    var plugin = VORLON.Core._clientPlugins[index];
                    plugin.refresh();
                }
            }
            else {
                //Stop bouncing and hide waiting page
                var elt = document.querySelector('.dashboard-plugins-overlay');
                VORLON.Tools.AddClass(elt, 'hidden');
                VORLON.Tools.RemoveClass(elt, 'bounce');
                document.getElementById('test').style.visibility = 'visible';
            }
        }
        _OnReloadClient(id) {
            document.location.reload();
        }
        _RetrySendingRealtimeMessage(plugin, message) {
            setTimeout(() => {
                if (plugin.isReady()) {
                    VORLON.Core._DispatchFromClientPluginMessage(plugin, message);
                    return;
                }
                VORLON.Core._RetrySendingRealtimeMessage(plugin, message);
            }, VORLON.Core._RetryTimeout);
        }
        _Dispatch(message) {
            if (!message.metadata) {
                console.error('invalid message ' + JSON.stringify(message));
                return;
            }
            if (message.metadata.pluginID == 'ALL_PLUGINS') {
                VORLON.Core._clientPlugins.forEach((plugin) => {
                    VORLON.Core._DispatchPluginMessage(plugin, message);
                });
                VORLON.Core._dashboardPlugins.forEach((plugin) => {
                    VORLON.Core._DispatchPluginMessage(plugin, message);
                });
            }
            else {
                VORLON.Core._clientPlugins.forEach((plugin) => {
                    if (plugin.getID() === message.metadata.pluginID) {
                        VORLON.Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
                VORLON.Core._dashboardPlugins.forEach((plugin) => {
                    if (plugin.getID() === message.metadata.pluginID) {
                        VORLON.Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
            }
        }
        _DispatchPluginMessage(plugin, message) {
            plugin.trace('received ' + JSON.stringify(message));
            if (message.metadata.side === VORLON.RuntimeSide.Client) {
                if (!plugin.isReady()) {
                    VORLON.Core._RetrySendingRealtimeMessage(plugin, message);
                }
                else {
                    VORLON.Core._DispatchFromClientPluginMessage(plugin, message);
                }
            }
            else {
                VORLON.Core._DispatchFromDashboardPluginMessage(plugin, message);
            }
        }
        _DispatchFromClientPluginMessage(plugin, message) {
            if (message.command && plugin.DashboardCommands) {
                var command = plugin.DashboardCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromClientSide(message.data);
        }
        _DispatchFromDashboardPluginMessage(plugin, message) {
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
    VORLON._Core = _Core;
    VORLON.Core = new _Core();
})(VORLON || (VORLON = {}));
