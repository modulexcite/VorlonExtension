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
