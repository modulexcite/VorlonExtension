var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var ModernizrReportDashboard = (function (_super) {
        __extends(ModernizrReportDashboard, _super);
        function ModernizrReportDashboard() {
            _super.call(this, "modernizrReport", "control.html", "control.css");
            this._filterList = {};
            this._ready = false;
            this._id = "MODERNIZR";
            //this.debug = true;
        }
        ModernizrReportDashboard.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this._cssFeaturesListTable = VORLON.Tools.QuerySelectorById(div, "cssFeaturesList");
                _this._htmlFeaturesListTable = VORLON.Tools.QuerySelectorById(div, "htmlFeaturesList");
                _this._miscFeaturesListTable = VORLON.Tools.QuerySelectorById(div, "miscFeaturesList");
                _this._nonCoreFeaturesListTable = VORLON.Tools.QuerySelectorById(div, "nonCoreFeaturesList");
                var list = _this._filterList;
                var filter = document.getElementById('css_feature_filter');
                filter.addEventListener('input', function () {
                    var value = filter.value;
                    for (var z in list) {
                        list[z].setAttribute('data-feature-visibility', z.indexOf(value) > -1 ? '' : 'hidden');
                    }
                });
                _this._ready = true;
            });
        };
        ModernizrReportDashboard.prototype.displayClientFeatures = function (receivedObject) {
            var _this = this;
            if (!receivedObject || !receivedObject.features)
                return;
            var targettedTable;
            var supportedFeatures = receivedObject.features;
            if (supportedFeatures && supportedFeatures.length)
                for (var i = 0; i < supportedFeatures.length; i++) {
                    switch (supportedFeatures[i].type) {
                        case "css":
                            targettedTable = this._cssFeaturesListTable;
                            break;
                        case "misc":
                            targettedTable = this._miscFeaturesListTable;
                            break;
                        case "noncore":
                            targettedTable = this._nonCoreFeaturesListTable;
                            break;
                        default:
                            targettedTable = this._htmlFeaturesListTable;
                            break;
                    }
                    var rowCount = targettedTable.rows.length;
                    var row = targettedTable.insertRow(rowCount);
                    row.insertCell(0).innerHTML = supportedFeatures[i].featureName;
                    var cellSupported = row.insertCell(1);
                    cellSupported.align = "center";
                    if (supportedFeatures[i].isSupported) {
                        if (supportedFeatures[i].supportLevel) {
                            switch (supportedFeatures[i].supportLevel) {
                                case "probably":
                                case "maybe":
                                case "true":
                                    cellSupported.className = "modernizrFeatureSupported";
                                    cellSupported.innerHTML = "✔";
                                    break;
                                case "false":
                                case "":
                                    cellSupported.className = "modernizrFeatureUnsupported";
                                    cellSupported.innerHTML = "×";
                                    break;
                            }
                        }
                        else {
                            cellSupported.className = "modernizrFeatureSupported";
                            cellSupported.innerHTML = "✔";
                        }
                    }
                    else {
                        cellSupported.className = "modernizrFeatureUnsupported";
                        cellSupported.innerHTML = "×";
                    }
                }
            Array.prototype.slice.call(document.querySelectorAll('.modernizr-features-list td:first-child'), 0).forEach(function (node) {
                _this._filterList[node.textContent.toLowerCase()] = node.parentNode;
            });
        };
        return ModernizrReportDashboard;
    })(VORLON.DashboardPlugin);
    VORLON.ModernizrReportDashboard = ModernizrReportDashboard;
    ModernizrReportDashboard.prototype.DashboardCommands = {
        clientfeatures: function (data) {
            var plugin = this;
            plugin.displayClientFeatures(data);
        }
    };
    // Register
    VORLON.Core.RegisterDashboardPlugin(new ModernizrReportDashboard());
})(VORLON || (VORLON = {}));
