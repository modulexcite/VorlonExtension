var VORLON;
(function (VORLON) {
    class ClientPlugin extends VORLON.BasePlugin {
        constructor(name) {
            super(name);
        }
        startClientSide() { }
        onRealtimeMessageReceivedFromDashboardSide(receivedObject) { }
        sendToDashboard(data) {
            if (VORLON.Core.Messenger)
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Client, "message");
        }
        sendCommandToDashboard(command, data = null) {
            if (VORLON.Core.Messenger) {
                this.trace(this.getID() + ' send command to dashboard ' + command);
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Client, "message", command);
            }
        }
        refresh() {
            console.error("Please override plugin.refresh()");
        }
        _loadNewScriptAsync(scriptName, callback, waitForDOMContentLoaded) {
            var basedUrl = "";
            if (this.loadingDirectory.indexOf('http') === 0) {
                if (scriptName[0] == "/") {
                    basedUrl = "";
                }
                else {
                    basedUrl = this.loadingDirectory + "/" + this.name + "/";
                }
            }
            else {
                if (scriptName[0] == "/") {
                    basedUrl = vorlonBaseURL;
                }
                else {
                    basedUrl = vorlonBaseURL + "/" + this.loadingDirectory + "/" + this.name + "/";
                }
            }
            function loadScript() {
                var scriptToLoad = document.createElement("script");
                scriptToLoad.setAttribute("src", basedUrl + scriptName);
                scriptToLoad.onload = callback;
                var first = document.getElementsByTagName('script')[0];
                first.parentNode.insertBefore(scriptToLoad, first);
            }
            if (!waitForDOMContentLoaded || document.body) {
                loadScript();
            }
            else {
                document.addEventListener("DOMContentLoaded", () => {
                    this._loadNewScriptAsync(scriptName, callback, waitForDOMContentLoaded);
                });
            }
        }
    }
    VORLON.ClientPlugin = ClientPlugin;
})(VORLON || (VORLON = {}));
