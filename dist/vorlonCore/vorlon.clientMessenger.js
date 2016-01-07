var VORLON;
(function (VORLON) {
    class ClientMessenger {
        constructor(side, serverUrl, sessionId, clientId, listenClientId) {
            this._isConnected = false;
            this._isConnected = false;
            this._sessionId = sessionId;
            this._clientId = clientId;
            VORLON.Core._listenClientId = listenClientId;
            this._serverUrl = serverUrl;
            switch (side) {
                case VORLON.RuntimeSide.Client:
                    this._socket = io.connect(serverUrl);
                    this._isConnected = true;
                    break;
                case VORLON.RuntimeSide.Dashboard:
                    this._socket = io.connect(serverUrl + "/dashboard");
                    this._isConnected = true;
                    break;
            }
            if (this.isConnected) {
                var manager = io.Manager(serverUrl);
                manager.on('connect_error', (err) => {
                    if (this.onError) {
                        this.onError(err);
                    }
                });
                this._socket.on('message', message => {
                    var received = JSON.parse(message);
                    if (this.onRealtimeMessageReceived) {
                        this.onRealtimeMessageReceived(received);
                    }
                });
                this._socket.on('helo', message => {
                    //console.log('messenger helo', message);
                    VORLON.Core._listenClientId = message;
                    if (this.onHeloReceived) {
                        this.onHeloReceived(message);
                    }
                });
                this._socket.on('identify', message => {
                    //console.log('messenger identify', message);
                    if (this.onIdentifyReceived) {
                        this.onIdentifyReceived(message);
                    }
                });
                this._socket.on('stoplisten', () => {
                    if (this.onStopListenReceived) {
                        this.onStopListenReceived();
                    }
                });
                this._socket.on('refreshclients', () => {
                    //console.log('messenger refreshclients');
                    if (this.onRefreshClients) {
                        this.onRefreshClients();
                    }
                });
                this._socket.on('addclient', client => {
                    //console.log('messenger refreshclients');
                    if (this.onAddClient) {
                        this.onAddClient(client);
                    }
                });
                this._socket.on('removeclient', client => {
                    //console.log('messenger refreshclients');
                    if (this.onRemoveClient) {
                        this.onRemoveClient(client);
                    }
                });
                this._socket.on('reload', message => {
                    //console.log('messenger reloadclient', message);
                    VORLON.Core._listenClientId = message;
                    if (this.onReload) {
                        this.onReload(message);
                    }
                });
            }
        }
        get isConnected() {
            return this._isConnected;
        }
        set clientId(value) {
            this._clientId = value;
        }
        get socketId() {
            return this._socket.id;
        }
        stopListening() {
            if (this._socket) {
                this._socket.removeAllListeners();
            }
        }
        sendRealtimeMessage(pluginID, objectToSend, side, messageType = "message", command) {
            var message = {
                metadata: {
                    pluginID: pluginID,
                    side: side,
                    sessionId: this._sessionId,
                    clientId: this._clientId,
                    listenClientId: VORLON.Core._listenClientId
                },
                data: objectToSend
            };
            if (command)
                message.command = command;
            if (!this.isConnected) {
                // Directly raise response locally
                if (this.onRealtimeMessageReceived) {
                    this.onRealtimeMessageReceived(message);
                }
                return;
            }
            else {
                if (VORLON.Core._listenClientId !== "" || messageType !== "message") {
                    var strmessage = JSON.stringify(message);
                    this._socket.emit(messageType, strmessage);
                }
            }
        }
        sendMonitoringMessage(pluginID, message) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                    }
                }
            };
            xhr.open("POST", this._serverUrl + "api/push");
            xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
            var data = JSON.stringify({ "_idsession": this._sessionId, "id": pluginID, "message": message });
            //xhr.setRequestHeader("Content-length", data.length.toString());
            xhr.send(data);
        }
        getMonitoringMessage(pluginID, onMonitoringMessage, from = "-20", to = "-1") {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (onMonitoringMessage)
                            onMonitoringMessage(JSON.parse(xhr.responseText));
                    }
                    else {
                        if (onMonitoringMessage)
                            onMonitoringMessage(null);
                    }
                }
                else {
                    if (onMonitoringMessage)
                        onMonitoringMessage(null);
                }
            };
            xhr.open("GET", this._serverUrl + "api/range/" + this._sessionId + "/" + pluginID + "/" + from + "/" + to);
            xhr.send();
        }
    }
    VORLON.ClientMessenger = ClientMessenger;
})(VORLON || (VORLON = {}));
