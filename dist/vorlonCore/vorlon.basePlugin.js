var VORLON;
(function (VORLON) {
    class BasePlugin {
        constructor(name) {
            this.name = name;
            this._ready = true;
            this._id = "";
            this._type = VORLON.PluginType.OneOne;
            this.traceLog = (msg) => { console.log(msg); };
            this.traceNoop = (msg) => { };
            this.loadingDirectory = "vorlon/plugins";
            this.debug = VORLON.Core.debug;
        }
        get Type() {
            return this._type;
        }
        get debug() {
            return this._debug;
        }
        set debug(val) {
            this._debug = val;
            if (val) {
                this.trace = this.traceLog;
            }
            else {
                this.trace = this.traceNoop;
            }
        }
        getID() {
            return this._id;
        }
        isReady() {
            return this._ready;
        }
    }
    VORLON.BasePlugin = BasePlugin;
})(VORLON || (VORLON = {}));
