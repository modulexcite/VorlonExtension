var VORLON;
(function (VORLON) {
    class DashboardPlugin extends VORLON.BasePlugin {
        constructor(name, htmlFragmentUrl, cssStyleSheetUrl) {
            super(name);
            this.htmlFragmentUrl = htmlFragmentUrl;
            this.cssStyleSheetUrl = cssStyleSheetUrl;
            this.debug = VORLON.Core.debug;
        }
        startDashboardSide(div) { }
        onRealtimeMessageReceivedFromClientSide(receivedObject) { }
        sendToClient(data) {
            if (VORLON.Core.Messenger)
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Dashboard, "message");
        }
        sendCommandToClient(command, data = null) {
            if (VORLON.Core.Messenger) {
                this.trace(this.getID() + ' send command to client ' + command);
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, VORLON.RuntimeSide.Dashboard, "message", command);
            }
        }
        sendCommandToPluginClient(pluginId, command, data = null) {
            if (VORLON.Core.Messenger) {
                this.trace(this.getID() + ' send command to plugin client ' + command);
                VORLON.Core.Messenger.sendRealtimeMessage(pluginId, data, VORLON.RuntimeSide.Dashboard, "protocol", command);
            }
        }
        sendCommandToPluginDashboard(pluginId, command, data = null) {
            if (VORLON.Core.Messenger) {
                this.trace(this.getID() + ' send command to plugin dashboard ' + command);
                VORLON.Core.Messenger.sendRealtimeMessage(pluginId, data, VORLON.RuntimeSide.Client, "protocol", command);
            }
        }
        _insertHtmlContentAsync(divContainer, callback) {
            var basedUrl = vorlonBaseURL + "/" + this.loadingDirectory + "/" + this.name + "/";
            var alone = false;
            if (!divContainer) {
                // Not emptyDiv provided, let's plug into the main DOM
                divContainer = document.createElement("div");
                document.body.appendChild(divContainer);
                alone = true;
            }
            var request = new XMLHttpRequest();
            request.open('GET', basedUrl + this.htmlFragmentUrl, true);
            request.onreadystatechange = (ev) => {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        divContainer.innerHTML = this._stripContent(request.responseText);
                        var headID = document.getElementsByTagName("head")[0];
                        var cssNode = document.createElement('link');
                        cssNode.type = "text/css";
                        cssNode.rel = "stylesheet";
                        cssNode.href = basedUrl + this.cssStyleSheetUrl;
                        cssNode.media = "screen";
                        headID.appendChild(cssNode);
                        var firstDivChild = (divContainer.children[0]);
                        if (alone) {
                            firstDivChild.className = "alone";
                        }
                        callback(firstDivChild);
                    }
                    else {
                        throw new Error("Error status: " + request.status + " - Unable to load " + basedUrl + this.htmlFragmentUrl);
                    }
                }
            };
            request.send(null);
        }
        _stripContent(content) {
            // in case of SVG injection
            var xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im;
            // for HTML content
            var bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im;
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            }
            return content;
        }
    }
    VORLON.DashboardPlugin = DashboardPlugin;
})(VORLON || (VORLON = {}));
