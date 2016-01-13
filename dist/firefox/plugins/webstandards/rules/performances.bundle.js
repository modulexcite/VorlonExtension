var VORLON;
(function (VORLON) {
    var WebStandards;
    (function (WebStandards) {
        var Rules;
        (function (Rules) {
            var Files;
            (function (Files) {
                var cssFilesLimit = 5;
                var scriptsFilesLimit = 5;
                Files.filesBundle = {
                    id: "performances.bundles",
                    title: "try bundling your files",
                    description: "Multiple http requests makes your site slower, especially on mobile devices",
                    check: function (rulecheck, analyzeSummary) {
                        rulecheck.items = rulecheck.items || [];
                        rulecheck.type = "blockitems";
                        var countStylesheets = 0;
                        for (var n in analyzeSummary.files.stylesheets) {
                            var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                            if (!isVorlonInjection)
                                countStylesheets++;
                        }
                        if (countStylesheets > cssFilesLimit) {
                            rulecheck.failed = true;
                            rulecheck.items.push({
                                title: "You have more than " + cssFilesLimit + " stylesheets in your page, consider bundling your stylesheets."
                            });
                        }
                        var countScripts = 0;
                        for (var n in analyzeSummary.files.scripts) {
                            var isVorlonInjection = n.toLowerCase().indexOf("vorlon/plugins") >= 0;
                            if (!isVorlonInjection)
                                countScripts++;
                        }
                        if (countScripts > scriptsFilesLimit) {
                            rulecheck.failed = true;
                            rulecheck.items.push({
                                title: "You have more than " + scriptsFilesLimit + " scripts files in your page, consider bundling your scripts."
                            });
                        }
                    }
                };
            })(Files = Rules.Files || (Rules.Files = {}));
        })(Rules = WebStandards.Rules || (WebStandards.Rules = {}));
    })(WebStandards = VORLON.WebStandards || (VORLON.WebStandards = {}));
})(VORLON || (VORLON = {}));
