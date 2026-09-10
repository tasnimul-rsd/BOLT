#target aftereffects
#targetengine "bolt_engine"

/*
Bolt v17.1
Professional project cleanup, selected-keyframe motion, typography, native After Effects Render Queue
and Media Encoder setup, compact visual-bounds alignment, and icon-first Quick Tools.
Compact native After Effects interface with the fixed five-folder Project structure, hero and named scenes at root,
dependency and proxy collection with missing-media tolerance, retained-layer PSD/AI-safe collection, exact duplicate checks, explicit full-computer relinking, one-click safe cleanup,
stable native ScriptUI sizing, working width-aware row reflow, collision-safe outputs, compact one-click tools, simple composition rendering, and no recursive UI scaling.
Developed by Tasnimul Hasan Malik, Designer & Animator.
*/

(function BoltPanel(thisObj) {
    var VERSION = "17.1";
    var BUILD_ID = "17.1-top-ui-r4";

    // AE internal match-name constants — centralised so a typo fails visibly, not silently
    var AE_PROP_TRANSFORM   = "ADBE Transform Group";
    var AE_PROP_TEXT        = "ADBE Text Properties";
    var AE_PROP_EFFECTS     = "ADBE Effect Parade";
    var AE_PROP_MARKER      = "ADBE Marker";
    var AE_PROP_OPACITY     = "ADBE Opacity";
    var AE_PROP_POSITION    = "ADBE Position";
    var AE_PROP_SCALE       = "ADBE Scale";
    var AE_PROP_ROTATE_Z    = "ADBE Rotate Z";
    var AE_PROP_ANCHOR      = "ADBE Anchor Point";
    var AE_PROP_ANIMATORS   = "ADBE Text Animators";
    var AE_PROP_SELECTORS   = "ADBE Text Selectors";
    var AE_PROP_POS_X       = "ADBE Position_0";
    var AE_PROP_POS_Y       = "ADBE Position_1";
    var AE_PROP_POS_Z       = "ADBE Position_2";
    var AE_PROP_ORIENTATION = "ADBE Orientation";
    var SCRIPT_NAME = "Bolt";
    var SETTINGS_SECTION = "Bolt";
    var DEVELOPER_NAME = "Tasnimul Hasan Malik";
    var DEVELOPER_ROLE = "Designer & Animator";
    var BOLT_UPDATE_URL = "https://github.com/tasnimul-rsd/BOLT";

    var state = {
        ui: null,
        outputTemplates: [],
        lockedRenderComp: null,
        lockedHeroComp: null,
        templateCompId: null,
        scrollAreas: [],
        activeScrollArea: null,
        textFiltered: [],
        textSelectedIndex: 0,
        textCategoryFilter: "All",
        textModeValue: "IN",
        renderFormatValue: "H.264",
        renderQualityValue: "15 Mbps",
        renderTargetValue: "Composition",
        layerRangeValue: "Layer In / Out",
        renderAdvancedVisible: false,
        renderSyncBusy: false,
        layerAnalysis: null,
        layerChanges: [],
        layerExpressionEntries: [],
        lastSnapshotError: "",
        lastClipboardError: ""
    };



    var TEXT_PRESETS = [{"name":"Fade Up","x":0,"y":55,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":75},{"name":"Fade Down","x":0,"y":-55,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":true,"ease":75},{"name":"Fade Left","x":70,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":75},{"name":"Fade Right","x":-70,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":true,"ease":75},{"name":"Soft Rise","x":0,"y":28,"sx":100,"sy":100,"rot":0,"skew":0,"blur":8,"tracking":0,"reverse":false,"ease":82},{"name":"Soft Drop","x":0,"y":-28,"sx":100,"sy":100,"rot":0,"skew":0,"blur":8,"tracking":0,"reverse":true,"ease":82},{"name":"Slide Up","x":0,"y":110,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":70},{"name":"Slide Down","x":0,"y":-110,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":true,"ease":70},{"name":"Slide Left","x":140,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":70},{"name":"Slide Right","x":-140,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":true,"ease":70},{"name":"Pop In","x":0,"y":0,"sx":15,"sy":15,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":82},{"name":"Zoom In","x":0,"y":0,"sx":0,"sy":0,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":78},{"name":"Zoom Out","x":0,"y":0,"sx":180,"sy":180,"rot":0,"skew":0,"blur":6,"tracking":0,"reverse":true,"ease":78},{"name":"Micro Pop","x":0,"y":12,"sx":72,"sy":72,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":88},{"name":"Big Pop","x":0,"y":25,"sx":20,"sy":20,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":76},{"name":"Punch Scale","x":0,"y":0,"sx":55,"sy":55,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":90},{"name":"Stretch X","x":0,"y":0,"sx":15,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":76},{"name":"Stretch Y","x":0,"y":0,"sx":100,"sy":15,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":76},{"name":"Compress X","x":0,"y":0,"sx":180,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":true,"ease":76},{"name":"Compress Y","x":0,"y":0,"sx":100,"sy":180,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":true,"ease":76},{"name":"Flip X","x":0,"y":0,"sx":-100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":82},{"name":"Flip Y","x":0,"y":0,"sx":100,"sy":-100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":true,"ease":82},{"name":"Rotate CW","x":0,"y":0,"sx":100,"sy":100,"rot":70,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":80},{"name":"Rotate CCW","x":0,"y":0,"sx":100,"sy":100,"rot":-70,"skew":0,"blur":0,"tracking":0,"reverse":true,"ease":80},{"name":"Spin Reveal","x":0,"y":0,"sx":35,"sy":35,"rot":180,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":70},{"name":"Drop Rotate","x":0,"y":-75,"sx":100,"sy":100,"rot":-22,"skew":0,"blur":0,"tracking":0,"reverse":true,"ease":80},{"name":"Rise Rotate","x":0,"y":75,"sx":100,"sy":100,"rot":22,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":80},{"name":"Skew Left","x":45,"y":0,"sx":100,"sy":100,"rot":0,"skew":-28,"blur":0,"tracking":0,"reverse":false,"ease":76},{"name":"Skew Right","x":-45,"y":0,"sx":100,"sy":100,"rot":0,"skew":28,"blur":0,"tracking":0,"reverse":true,"ease":76},{"name":"Skew Reveal","x":0,"y":35,"sx":100,"sy":100,"rot":0,"skew":42,"blur":0,"tracking":0,"reverse":false,"ease":82},{"name":"Tracking Wide","x":0,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":95,"reverse":false,"ease":80},{"name":"Tracking Tight","x":0,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":-45,"reverse":true,"ease":80},{"name":"Tracking Rise","x":0,"y":45,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":65,"reverse":false,"ease":82},{"name":"Tracking Blur","x":0,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":25,"tracking":75,"reverse":false,"ease":82},{"name":"Typewriter Clean","x":0,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":100},{"name":"Typewriter Soft","x":0,"y":12,"sx":100,"sy":100,"rot":0,"skew":0,"blur":8,"tracking":0,"reverse":false,"ease":92},{"name":"Typewriter Wide","x":0,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":60,"reverse":false,"ease":100},{"name":"Blur Up","x":0,"y":55,"sx":100,"sy":100,"rot":0,"skew":0,"blur":35,"tracking":0,"reverse":false,"ease":82},{"name":"Blur Down","x":0,"y":-55,"sx":100,"sy":100,"rot":0,"skew":0,"blur":35,"tracking":0,"reverse":true,"ease":82},{"name":"Blur Left","x":70,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":28,"tracking":0,"reverse":false,"ease":82},{"name":"Blur Right","x":-70,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":28,"tracking":0,"reverse":true,"ease":82},{"name":"Blur Zoom","x":0,"y":0,"sx":30,"sy":30,"rot":0,"skew":0,"blur":45,"tracking":0,"reverse":false,"ease":86},{"name":"Blur Shrink","x":0,"y":0,"sx":165,"sy":165,"rot":0,"skew":0,"blur":45,"tracking":0,"reverse":true,"ease":86},{"name":"Kinetic Rise","x":0,"y":95,"sx":85,"sy":115,"rot":-10,"skew":0,"blur":0,"tracking":10,"reverse":false,"ease":80},{"name":"Kinetic Drop","x":0,"y":-95,"sx":115,"sy":85,"rot":10,"skew":0,"blur":0,"tracking":-10,"reverse":true,"ease":80},{"name":"Kinetic Left","x":120,"y":0,"sx":65,"sy":110,"rot":-8,"skew":-12,"blur":0,"tracking":20,"reverse":false,"ease":78},{"name":"Kinetic Right","x":-120,"y":0,"sx":110,"sy":65,"rot":8,"skew":12,"blur":0,"tracking":-20,"reverse":true,"ease":78},{"name":"Slide Stretch","x":95,"y":0,"sx":35,"sy":110,"rot":0,"skew":0,"blur":0,"tracking":20,"reverse":false,"ease":82},{"name":"Slide Compress","x":-95,"y":0,"sx":170,"sy":90,"rot":0,"skew":0,"blur":0,"tracking":-20,"reverse":true,"ease":82},{"name":"Neon Reveal","x":0,"y":20,"sx":100,"sy":100,"rot":0,"skew":0,"blur":55,"tracking":20,"reverse":false,"ease":88},{"name":"Glitch Reveal","x":35,"y":-12,"sx":92,"sy":108,"rot":8,"skew":22,"blur":12,"tracking":30,"reverse":false,"ease":68},{"name":"Flicker Reveal","x":0,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":true,"ease":35},{"name":"Tech Reveal","x":65,"y":0,"sx":75,"sy":100,"rot":0,"skew":-18,"blur":16,"tracking":55,"reverse":false,"ease":86},{"name":"Luxury Rise","x":0,"y":38,"sx":96,"sy":104,"rot":0,"skew":0,"blur":10,"tracking":35,"reverse":false,"ease":92},{"name":"Corporate Clean","x":0,"y":24,"sx":98,"sy":102,"rot":0,"skew":0,"blur":4,"tracking":18,"reverse":false,"ease":88},{"name":"Social Pop","x":0,"y":18,"sx":45,"sy":45,"rot":-7,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":82},{"name":"Fast Punch","x":0,"y":0,"sx":35,"sy":35,"rot":0,"skew":0,"blur":0,"tracking":0,"reverse":false,"ease":95},{"name":"Cinematic Fade","x":0,"y":18,"sx":105,"sy":105,"rot":0,"skew":0,"blur":22,"tracking":38,"reverse":false,"ease":94},{"name":"Editorial Rise","x":0,"y":60,"sx":88,"sy":112,"rot":-4,"skew":-8,"blur":8,"tracking":40,"reverse":false,"ease":90},{"name":"Editorial Drop","x":0,"y":-60,"sx":112,"sy":88,"rot":4,"skew":8,"blur":8,"tracking":-40,"reverse":true,"ease":90},{"name":"Clean Wipe Left","x":85,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":5,"tracking":12,"reverse":false,"ease":92},{"name":"Clean Wipe Right","x":-85,"y":0,"sx":100,"sy":100,"rot":0,"skew":0,"blur":5,"tracking":-12,"reverse":true,"ease":92},{"name":"Vertical Stretch","x":0,"y":40,"sx":100,"sy":5,"rot":0,"skew":0,"blur":8,"tracking":0,"reverse":false,"ease":84},{"name":"Horizontal Stretch","x":40,"y":0,"sx":5,"sy":100,"rot":0,"skew":0,"blur":8,"tracking":0,"reverse":false,"ease":84}];
    var GRADIENT_PRESETS = [{"name":"Aurora","a":"#6A5CFF","b":"#00E5C8","dir":"diag"},{"name":"Sunset","a":"#FF4D6D","b":"#FFB703","dir":"diag"},{"name":"Ocean","a":"#0061FF","b":"#60EFFF","dir":"vertical"},{"name":"Royal","a":"#2F2F7F","b":"#7B4FA0","dir":"diag"},{"name":"Midnight","a":"#0B1020","b":"#334155","dir":"vertical"},{"name":"Cyber","a":"#7C3AED","b":"#22D3EE","dir":"horizontal"},{"name":"Mango","a":"#FF7A18","b":"#FFD200","dir":"horizontal"},{"name":"Rose","a":"#FB7185","b":"#C084FC","dir":"diag"},{"name":"Forest","a":"#064E3B","b":"#34D399","dir":"vertical"},{"name":"Ice","a":"#E0F2FE","b":"#818CF8","dir":"diag"},{"name":"Mono","a":"#111827","b":"#E5E7EB","dir":"horizontal"},{"name":"Bolt","a":"#2F2F7F","b":"#00B8FF","dir":"diag"}];
    var COLOR_PALETTES = [{"name":"Bolt Brand","colors":["#2F2F7F","#7B4FA0","#00B8FF","#F5F7FF","#111827"]},{"name":"Modern Tech","colors":["#111827","#2563EB","#06B6D4","#A78BFA","#F8FAFC"]},{"name":"Luxury","colors":["#12100E","#6B4F2A","#D4AF37","#F3E9D2","#FFFFFF"]},{"name":"Neon","colors":["#0A0A0F","#7C3AED","#00E5FF","#FF2D95","#F8FF00"]},{"name":"Warm Editorial","colors":["#3B2314","#B45309","#F59E0B","#FED7AA","#FFF7ED"]},{"name":"Fresh","colors":["#064E3B","#10B981","#A7F3D0","#F0FDFA","#0F172A"]},{"name":"Soft Pastel","colors":["#C4B5FD","#FBCFE8","#BAE6FD","#FEF3C7","#F8FAFC"]},{"name":"Bold Social","colors":["#EF4444","#F97316","#FACC15","#22C55E","#3B82F6"]},{"name":"Cinema","colors":["#020617","#172554","#7C2D12","#B45309","#FDE68A"]},{"name":"Corporate","colors":["#0F172A","#1D4ED8","#64748B","#CBD5E1","#FFFFFF"]},{"name":"Beauty","colors":["#4C1D3D","#BE185D","#F9A8D4","#FCE7F3","#FFF1F2"]},{"name":"Earth","colors":["#292524","#57534E","#A16207","#D6D3D1","#FAFAF9"]}];
    var CURVE_PRESETS = [{"name":"Linear","type":"linear","in":0,"out":0},{"name":"Easy Ease","type":"bezier","in":33,"out":33},{"name":"Flow 55","type":"bezier","in":55,"out":55},{"name":"Flow 70","type":"bezier","in":70,"out":70},{"name":"Flow 85","type":"bezier","in":85,"out":85},{"name":"Smooth","type":"bezier","in":65,"out":65},{"name":"Snappy In","type":"bezier","in":20,"out":85},{"name":"Snappy Out","type":"bezier","in":85,"out":20},{"name":"Ease In","type":"bezier","in":85,"out":20},{"name":"Ease Out","type":"bezier","in":20,"out":85},{"name":"Hold","type":"hold","in":0,"out":0}];
    var GLOW_PRESETS = [
        {name:"Deep", passes:[[0,0.22,1.45],[28,0.85,0.82],[52,2.20,0.34]]},
        {name:"Soft", passes:[[8,0.35,0.85],[38,1.15,0.48],[68,2.60,0.18]]},
        {name:"Neon", passes:[[0,0.12,2.10],[18,0.55,1.05],[42,1.55,0.42]]},
        {name:"Cinematic", passes:[[12,0.28,1.15],[42,1.05,0.62],[70,2.80,0.22]]},
        {name:"Hot", passes:[[0,0.08,2.80],[12,0.40,1.35],[34,1.20,0.55]]}
    ];
    var PREMIUM_FONT_PRESETS = [
        {name:"Modern Sans", fonts:["Montserrat-SemiBold","Poppins-SemiBold","AvenirNext-DemiBold","Arial-BoldMT"], tracking:12, fauxBold:false},
        {name:"Luxury Serif", fonts:["CormorantGaramond-SemiBold","PlayfairDisplay-SemiBold","Georgia-Bold"], tracking:28, fauxBold:false},
        {name:"Editorial", fonts:["BodoniSvtyTwoITCTT-Book","Didot","TimesNewRomanPSMT"], tracking:10, fauxBold:false},
        {name:"Bold Display", fonts:["BebasNeue-Regular","Anton-Regular","Impact"], tracking:18, fauxBold:false},
        {name:"Clean Corporate", fonts:["Inter-SemiBold","HelveticaNeue-Medium","ArialMT"], tracking:4, fauxBold:false}
    ];
    var TEXT_VISUAL_PRESETS = ["Premium Shadow", "3D Lift", "Gold Title", "Glass Title", "Neon Title"];
    var RENDER_QUALITY_PROFILES = [
        {name:"Compact", bitrate:5, description:"Smaller H.264 delivery"},
        {name:"Balanced", bitrate:15, description:"Recommended H.264 delivery"},
        {name:"High", bitrate:40, description:"High-detail H.264 delivery"},
        {name:"Custom", bitrate:0, description:"Use the selected AE templates exactly"}
    ];

    function safeString(value) {
        if (value === null || value === undefined) {
            return "";
        }
        return String(value);
    }

    function trim(text) {
        return safeString(text).replace(/^\s+|\s+$/g, "");
    }

    function sanitizeName(name) {
        var text = trim(name).replace(/[\\\/:*?"<>|]/g, "_");
        text = text.replace(/[\.\s]+$/g, "");
        return text.length ? text : "Untitled";
    }

    function stripProjectExtension(name) {
        return safeString(name).replace(/\.(aep|aepx)$/i, "");
    }

    function stripVersionSuffix(name) {
        var output = safeString(name);
        output = output.replace(/(?:[_\- ]?v\d+)$/i, "");
        output = output.replace(/(?:[_\- ]?version[_\- ]?\d+)$/i, "");
        return output;
    }

    function padNumber(value, width) {
        var output = String(Math.max(0, parseInt(value, 10) || 0));
        while (output.length < width) {
            output = "0" + output;
        }
        return output;
    }

    function clampNumber(value, minimum, maximum, fallback) {
        var number = parseFloat(value);
        if (isNaN(number)) {
            number = fallback;
        }
        if (number < minimum) {
            number = minimum;
        }
        if (number > maximum) {
            number = maximum;
        }
        return number;
    }

    function normalizePath(pathValue) {
        var text = safeString(pathValue).replace(/\\/g, "/").replace(/\/+$/, "");
        if ($.os.toLowerCase().indexOf("windows") !== -1) {
            text = text.toLowerCase();
        }
        return text;
    }

    function isPathInside(childPath, parentPath) {
        var child = normalizePath(childPath);
        var parent = normalizePath(parentPath);
        return child === parent || child.indexOf(parent + "/") === 0;
    }

    function ensureFolder(folder) {
        if (!folder.exists && !folder.create()) {
            throw new Error("Could not create folder:\n" + folder.fsName);
        }
        return folder;
    }

    function splitFileName(fileName) {
        var match = safeString(fileName).match(/^(.*?)(\.[^\.]*)?$/);
        return {
            stem: match && match[1] ? match[1] : safeString(fileName),
            extension: match && match[2] ? match[2] : ""
        };
    }

    function uniqueFile(folder, preferredName) {
        var cleanName = sanitizeName(preferredName);
        var parts = splitFileName(cleanName);
        var candidate = new File(folder.fsName + "/" + cleanName);
        var count = 2;
        while (candidate.exists) {
            candidate = new File(folder.fsName + "/" + parts.stem + "_" + count + parts.extension);
            count++;
        }
        return candidate;
    }

    function nextVersionFile(folder, baseName, extension, startNumber, digits) {
        var version = Math.max(1, parseInt(startNumber, 10) || 1);
        var width = Math.max(1, parseInt(digits, 10) || 2);
        var candidate;
        do {
            candidate = new File(folder.fsName + "/" + sanitizeName(baseName) + "_v" + padNumber(version, width) + extension);
            version++;
        } while (candidate.exists);
        return candidate;
    }

    function renderOutputCollisionKey(file) {
        if (!file) { return ""; }
        var name = safeString(file.name);
        name = name.replace(/[_\-\s]*(?:\[[#0-9]+\]|#+)(\.[^\.]+)$/i, "$1");
        return normalizePath(file.parent.fsName + "/" + name);
    }

    function renderQueueReservedPaths() {
        var paths = {}, itemIndex, outputIndex, queueItem, module, file;
        if (!app.project || !app.project.renderQueue) { return paths; }
        for (itemIndex = 1; itemIndex <= app.project.renderQueue.numItems; itemIndex++) {
            queueItem = app.project.renderQueue.item(itemIndex);
            for (outputIndex = 1; outputIndex <= queueItem.numOutputModules; outputIndex++) {
                try {
                    module = queueItem.outputModule(outputIndex);
                    file = module.file;
                    if (file) {
                        paths[normalizePath(file.fsName)] = true;
                        paths[renderOutputCollisionKey(file)] = true;
                    }
                } catch (ignoreQueuedOutput) {}
            }
        }
        return paths;
    }

    function uniqueRenderFile(folder, preferredName, reservedPaths) {
        var cleanName = sanitizeName(preferredName), parts = splitFileName(cleanName);
        var candidate = new File(folder.fsName + "/" + cleanName), count = 2;
        while (candidate.exists || reservedPaths[normalizePath(candidate.fsName)] || reservedPaths[renderOutputCollisionKey(candidate)]) {
            candidate = new File(folder.fsName + "/" + parts.stem + "_" + count + parts.extension);
            count++;
        }
        return candidate;
    }

    function nextRenderVersionFile(folder, baseName, extension, startNumber, digits, reservedPaths) {
        var version = Math.max(1, parseInt(startNumber, 10) || 1);
        var width = Math.max(1, parseInt(digits, 10) || 2), candidate;
        do {
            candidate = new File(folder.fsName + "/" + sanitizeName(baseName) + "_v" + padNumber(version, width) + extension);
            version++;
        } while (candidate.exists || reservedPaths[normalizePath(candidate.fsName)] || reservedPaths[renderOutputCollisionKey(candidate)]);
        return candidate;
    }

    function fileSizeText(bytes) {
        if (bytes === null || bytes === undefined || isNaN(bytes)) {
            return "Unknown";
        }
        var value = Number(bytes);
        if (value < 1024) {
            return Math.round(value) + " B";
        }
        if (value < 1024 * 1024) {
            return (value / 1024).toFixed(1) + " KB";
        }
        if (value < 1024 * 1024 * 1024) {
            return (value / (1024 * 1024)).toFixed(1) + " MB";
        }
        return (value / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }

    function secondsText(seconds) {
        var value = Math.max(0, Number(seconds) || 0);
        var hours = Math.floor(value / 3600);
        var minutes = Math.floor((value % 3600) / 60);
        var secs = Math.floor(value % 60);
        var parts = [];
        if (hours > 0) {
            parts.push(hours + "h");
        }
        if (minutes > 0 || hours > 0) {
            parts.push(minutes + "m");
        }
        parts.push(secs + "s");
        return parts.join(" ");
    }

    function updateClockLabel() {
        if (!state.ui || !state.ui.clockLabel) { return; }
        try {
            var comp = app.project && app.project.activeItem instanceof CompItem ? app.project.activeItem : null;
            if (comp) {
                var frame = Math.max(0, Math.round(comp.time / comp.frameDuration));
                state.ui.clockLabel.text = comp.name + "  •  F" + frame;
                state.ui.clockLabel.helpTip = comp.width + "×" + comp.height + " • " + comp.frameRate.toFixed(2) + " fps • frame " + frame;
            } else {
                state.ui.clockLabel.text = "No active comp";
                state.ui.clockLabel.helpTip = "Open a composition to show its current frame.";
            }
        } catch (ignoreClock) {}
    }

    function setStatus(message, kind) {
        updateClockLabel();
        if (!state.ui || !state.ui.statusLabel) {
            try { $.writeln(safeString(message)); } catch (ignoreWrite) {}
            return;
        }
        var text = safeString(message).replace(/\r?\n/g, " • ");
        text = text.length ? text : "Ready";
        var maxStatusChars = 120;
        try { maxStatusChars = state.ui.panel.size.width < 500 ? 72 : (state.ui.panel.size.width < 700 ? 105 : 145); } catch (ignoreStatusWidth) {}
        if (text.length > maxStatusChars) {
            text = text.substring(0, Math.max(10, maxStatusChars - 3)) + "...";
        }
        state.ui.statusLabel.text = text;
        state.ui.statusLabel.helpTip = safeString(message);
        try {
            var color = [0.25, 0.82, 0.38];
            if (kind === "error") {
                color = [0.95, 0.28, 0.28];
            } else if (kind === "warning") {
                color = [0.95, 0.65, 0.18];
            }
            state.ui.statusLabel.graphics.foregroundColor = state.ui.statusLabel.graphics.newPen(
                state.ui.statusLabel.graphics.PenType.SOLID_COLOR,
                color,
                1
            );
        } catch (ignoreColor) {}
        try { state.ui.panel.update(); } catch (ignoreUpdate) {}
    }

    function log(message) {
        try { $.writeln(safeString(message)); } catch (ignoreWrite) {}
        var firstLine = safeString(message).split(/\r?\n/)[0];
        setStatus(firstLine, /^ERROR:/i.test(firstLine) ? "error" : "ok");
    }

    function setProgress(value, text) {
        if (state.ui && state.ui.progressBar) {
            state.ui.progressBar.value = clampNumber(value, 0, 100, 0);
        }
        if (state.ui && state.ui.progressLabel && text !== undefined) {
            state.ui.progressLabel.text = safeString(text);
        }
        if (text !== undefined) {
            setStatus(text, "ok");
        }
        try { if (state.ui) { state.ui.panel.update(); } } catch (ignore) {}
    }

    function showError(error) {
        var message = error && error.message ? error.message : safeString(error);
        setStatus(message, "error");
        if (state.ui && state.ui.progressBar) {
            state.ui.progressBar.value = 0;
        }
        alert(message, brandTitle("Error"), true);
    }

    function getProjectBaseName() {
        if (app.project && app.project.file) {
            return sanitizeName(stripVersionSuffix(stripProjectExtension(app.project.file.name)));
        }
        return "Untitled_Project";
    }

    function getWorkspaceRoot() {
        if (!app.project || !app.project.file) {
            return null;
        }
    
        var projectFile = app.project.file;
        var parent = projectFile.parent;
        if (!parent) { return null; }
    
        if (parent.name.toLowerCase() === "project" && parent.parent) {
            return parent.parent;
        }
    
        var baseName = getProjectBaseName();
        var compactBase = safeString(baseName).toLowerCase().replace(/[^a-z0-9]+/g, "");
        var compactParent = safeString(parent.name).toLowerCase().replace(/[^a-z0-9]+/g, "");
    
        // When the AEP already lives in a project-named folder, that folder is the
        // workspace root. Otherwise create a project-name folder beside the AEP.
        if (compactBase.length && compactBase === compactParent) {
            return parent;
        }
    
        try {
            var projectFolder = new Folder(parent.fsName + "/Project");
            var renderFolder = new Folder(parent.fsName + "/Render");
            var resourcesFolder = new Folder(parent.fsName + "/Resources");
            if (projectFolder.exists || renderFolder.exists || resourcesFolder.exists) {
                return parent;
            }
        } catch (ignoreWorkspaceProbe) {}
    
        return new Folder(parent.fsName + "/" + baseName);
    }

    function getWorkspaceFolders(rootFolder) {
        return {
            root: rootFolder,
            project: ensureFolder(new Folder(rootFolder.fsName + "/Project")),
            render: ensureFolder(new Folder(rootFolder.fsName + "/Render")),
            resources: ensureFolder(new Folder(rootFolder.fsName + "/Resources"))
        };
    }

    function updateAutomaticPaths() {
        var root = getWorkspaceRoot();
        if (!state.ui) {
            return;
        }
        if (root) {
            state.ui.workspacePath.text = root.fsName;
            state.ui.relinkPath.text = new Folder(root.fsName + "/Resources").fsName;
            state.ui.renderPath.text = new Folder(root.fsName + "/Render").fsName;
        }
    }

    function chooseWorkspaceRoot() {
        var automatic = getWorkspaceRoot();
        var text = state.ui ? trim(state.ui.workspacePath.text) : "";
    
        // A saved project always gets a deterministic project-name workspace.
        // This prevents a stale path from another project from being reused.
        if (automatic) {
            if (state.ui) { state.ui.workspacePath.text = automatic.fsName; }
            return automatic;
        }
    
        if (text.length) {
            return new Folder(text);
        }
    
        var selected = Folder.selectDialog(
            "Choose a parent folder. Bolt will create the project-name folder and place Project, Render, and Resources inside it."
        );
        if (selected) {
            var root = new Folder(selected.fsName + "/" + getProjectBaseName());
            if (state.ui) { state.ui.workspacePath.text = root.fsName; }
            return root;
        }
        return null;
    }

    function getFileExtension(file) {
        if (!file) {
            return "";
        }
        var match = file.name.match(/\.([^\.]+)$/);
        return match ? match[1].toLowerCase() : "";
    }

    function isImageExtension(extension) {
        return /^(jpg|jpeg|png|tif|tiff|tga|bmp|gif|webp|exr|dpx|cin|rla|rpf|hdr|heic|avif)$/i.test(extension);
    }

    function isAudioExtension(extension) {
        return /^(wav|mp3|aif|aiff|m4a|aac|flac|ogg|wma)$/i.test(extension);
    }

    function isVideoExtension(extension) {
        return /^(mov|mp4|m4v|avi|mxf|mpg|mpeg|wmv|webm|mts|m2ts|3gp|flv|r3d|braw|ari|crm)$/i.test(extension);
    }

    function categoryForFile(file) {
        var ext = getFileExtension(file);
        if (isAudioExtension(ext)) {
            return "Audio";
        }
        if (isVideoExtension(ext)) {
            return "Video";
        }
        if (isImageExtension(ext) || /^(psd|psb|ai|eps|svg)$/i.test(ext)) {
            return "Images";
        }
        return "Other";
    }


    function boltIsFootageItem(item) {
        if (!item) { return false; }
        try {
            if (typeof FootageItem !== "undefined" && item instanceof FootageItem) {
                return true;
            }
        } catch (ignoreFootageInstance) {}

        // Fallback for host/persistent-engine edge cases. CompItem has layers,
        // while file-backed FootageItem exposes mainSource and replace().
        try {
            return !!(
                item.mainSource &&
                typeof item.replace === "function" &&
                typeof item.numLayers === "undefined"
            );
        } catch (ignoreFootageFallback) {
            return false;
        }
    }

    function boltGetFootageFile(item) {
        var file = null;
        if (!item) { return null; }

        try { file = item.file; } catch (ignoreItemFile) { file = null; }
        if (file) { return file; }

        try {
            if (item.mainSource && item.mainSource.file) {
                file = item.mainSource.file;
            }
        } catch (ignoreMainSourceFile) {
            file = null;
        }
        return file || null;
    }


    function boltGetMissingFootageFile(item) {
        var pathValue = "";
        try {
            if (item && item.mainSource && item.mainSource.missingFootagePath) {
                pathValue = safeString(item.mainSource.missingFootagePath);
            }
        } catch (ignoreMissingSourcePath) {}
        if (!pathValue.length) {
            try {
                if (item && item.file && !item.file.exists) {
                    pathValue = safeString(item.file.fsName);
                }
            } catch (ignoreMissingItemFile) {}
        }
        return pathValue.length ? new File(pathValue) : null;
    }

    function boltGetProxyFile(item) {
        var file = null;
        if (!item) { return null; }
        try {
            if (item.proxySource && item.proxySource.file) {
                file = item.proxySource.file;
            }
        } catch (ignoreProxyFile) { file = null; }
        return file || null;
    }

    function boltGetMissingProxyFile(item) {
        var pathValue = "";
        try {
            if (item && item.proxySource && item.proxySource.missingFootagePath) {
                pathValue = safeString(item.proxySource.missingFootagePath);
            }
        } catch (ignoreMissingProxyPath) {}
        return pathValue.length ? new File(pathValue) : null;
    }

    function boltIsProxySequence(item) {
        var file = boltGetProxyFile(item) || boltGetMissingProxyFile(item);
        if (!file) { return false; }
        try {
            return !!(
                item.proxySource &&
                item.proxySource.isStill === false &&
                isImageExtension(getFileExtension(file))
            );
        } catch (ignoreProxySequence) {
            return false;
        }
    }

    function boltIsAVItemWithProxy(item) {
        if (!item) { return false; }
        try {
            if (item instanceof CompItem) { return true; }
        } catch (ignoreProxyCompCheck) {}
        return boltIsFootageItem(item);
    }

    function boltExpectedResourceFolder(resourcesFolder, unused) {
        if (unused) {
            return ensureFolder(new Folder(resourcesFolder.fsName + "/Unused"));
        }
        return ensureFolder(resourcesFolder);
    }

    function boltFileIsDirectlyIn(file, folder) {
        if (!file || !folder) { return false; }
        try {
            return !!(
                file.parent &&
                normalizePath(file.parent.fsName) === normalizePath(folder.fsName)
            );
        } catch (ignoreDirectParent) {
            return false;
        }
    }

    function isSequenceFootage(item) {
            var file = boltGetFootageFile(item) || boltGetMissingFootageFile(item);
            if (!boltIsFootageItem(item) || !file) { return false; }
            try {
                return !!(
                    item.mainSource &&
                    item.mainSource.isStill === false &&
                    isImageExtension(getFileExtension(file))
                );
            } catch (ignoreSequenceCheck) {
                return false;
            }
        }

    function escapeRegExp(text) {
        return safeString(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    function detectSequenceFiles(sourceFile) {
        var parsed = sourceFile.name.match(/^(.*?)(\d+)(\.[^\.]+)$/);
        if (!parsed) {
            return [];
        }
        var prefix = parsed[1];
        var digits = parsed[2].length;
        var suffix = parsed[3];
        var pattern = new RegExp("^" + escapeRegExp(prefix) + "\\d{" + digits + "}" + escapeRegExp(suffix) + "$", "i");
        var found = sourceFile.parent.getFiles(function (entry) {
            return entry instanceof File && pattern.test(entry.name);
        });
        found.sort(function (a, b) {
            var first = a.name.toLowerCase();
            var second = b.name.toLowerCase();
            return first < second ? -1 : (first > second ? 1 : 0);
        });
        return found;
    }


    function boltCopyTimeoutMs(source) {
        var bytes = 0;
        try { bytes = Math.max(0, Number(source.length || 0)); } catch (ignoreCopyLength) {}
        // 30 seconds minimum; up to five minutes for very large media.
        return Math.max(30000, Math.min(300000, 30000 + Math.round(bytes / (8 * 1024 * 1024)) * 1000));
    }

    function boltWaitForCopyComplete(source, target, timeoutMs) {
        var expected = 0, started = (new Date()).getTime(), stable = 0;
        try { expected = Math.max(0, Number(source.length || 0)); } catch (ignoreExpectedLength) {}
        timeoutMs = Math.max(1000, Number(timeoutMs) || 30000);

        while (((new Date()).getTime() - started) <= timeoutMs) {
            var current = new File(target.fsName), actual = -1;
            try {
                if (current.exists) { actual = Math.max(0, Number(current.length || 0)); }
            } catch (ignoreTargetLength) { actual = -1; }

            if (actual >= 0 && (expected === 0 || actual === expected)) {
                stable++;
                if (stable >= 2) { return current; }
            } else {
                stable = 0;
            }
            try { $.sleep(120); } catch (ignoreCopySleep) {}
        }
        return null;
    }

    function shellSingleQuote(text) {
        return "'" + safeString(text).replace(/'/g, "'\\''") + "'";
    }

    function copyFileChecked(source, target) {
            if (!source || !source.exists) {
                throw new Error(
                    "Source file is missing: " +
                    (source ? source.fsName : "Unknown file")
                );
            }
            if (normalizePath(source.fsName) === normalizePath(target.fsName)) {
                return source;
            }
    
            ensureFolder(target.parent);
            var timeoutMs = boltCopyTimeoutMs(source);
            if (copyFileReliable(source, target, timeoutMs)) {
                var completed = boltWaitForCopyComplete(source, target, timeoutMs);
                if (completed) { return completed; }
            }
    
            try {
                if (target.exists) { target.remove(); }
            } catch (ignorePartialCopyRemove) {}
    
            throw new Error(
                "Could not complete file copy:\n" +
                source.fsName +
                "\n\nTo:\n" +
                target.fsName
            );
        }

    function sourceKey(file) {
        return normalizePath(file.fsName);
    }

    function boltFileSizeKey(file) {
        if (!file || !file.exists) { return ""; }
        try { return String(Number(file.length || 0)); }
        catch (ignoreFileSize) { return ""; }
    }

    // Production-safe duplicate detection. Equal length is only an index hint;
    // every byte must match before Bolt reuses or removes a file.
    function boltFilesEqualExact(firstFile, secondFile) {
        if (!firstFile || !secondFile || !firstFile.exists || !secondFile.exists) { return false; }
        if (normalizePath(firstFile.fsName) === normalizePath(secondFile.fsName)) { return true; }
        var firstLength = 0, secondLength = 0;
        try {
            firstLength = Number(firstFile.length || 0);
            secondLength = Number(secondFile.length || 0);
        } catch (ignoreCompareLength) { return false; }
        if (firstLength !== secondLength) { return false; }
        var left = new File(firstFile.fsName), right = new File(secondFile.fsName);
        var openedLeft = false, openedRight = false, remaining = firstLength;
        var chunkSize = 65536, readSize, leftChunk, rightChunk;
        try {
            left.encoding = "BINARY";
            right.encoding = "BINARY";
            openedLeft = left.open("r");
            openedRight = right.open("r");
            if (!openedLeft || !openedRight) { return false; }
            while (remaining > 0) {
                readSize = Math.min(chunkSize, remaining);
                leftChunk = left.read(readSize);
                rightChunk = right.read(readSize);
                if (leftChunk !== rightChunk) { return false; }
                remaining -= readSize;
            }
            return true;
        } catch (ignoreExactCompare) {
            return false;
        } finally {
            try { if (openedLeft) { left.close(); } } catch (ignoreCloseLeft) {}
            try { if (openedRight) { right.close(); } } catch (ignoreCloseRight) {}
        }
    }

    function boltListFilesRecursive(folder, output, skipUnused) {
        if (!folder || !folder.exists) { return output; }
        var entries = [], i, entry;
        try { entries = folder.getFiles(); } catch (ignoreResourceScan) { return output; }
        for (i = 0; i < entries.length; i++) {
            entry = entries[i];
            if (entry instanceof Folder) {
                if (entry.name.charAt(0) === ".") { continue; }
                if (skipUnused && boltLayerLower(entry.name) === "unused") { continue; }
                boltListFilesRecursive(entry, output, skipUnused);
            } else if (entry instanceof File) {
                output.push(entry);
            }
        }
        return output;
    }

    function boltBuildResourceIndex(resourcesFolder) {
        var files = boltListFilesRecursive(resourcesFolder, [], false), index = {}, i, key;
        for (i = 0; i < files.length; i++) {
            key = boltFileSizeKey(files[i]);
            if (!key) { continue; }
            if (!index[key]) { index[key] = []; }
            index[key].push(files[i]);
        }
        return index;
    }

    function boltIndexResourceFile(context, file) {
        var key = boltFileSizeKey(file);
        if (!key) { return; }
        if (!context.resourceIndex[key]) { context.resourceIndex[key] = []; }
        context.resourceIndex[key].push(file);
    }

    function boltFindResourceDuplicate(context, source, targetFolder) {
            var key = boltFileSizeKey(source), items, i, candidate;
            if (!key || !targetFolder) { return null; }
            items = context.resourceIndex[key] || [];
    
            // A duplicate is reusable only when it is already directly inside the
            // requested destination. "Inside Resources" is not enough because
            // Resources/Unused and old category folders are nested below it.
            for (i = 0; i < items.length; i++) {
                candidate = items[i];
                try {
                    if (!candidate || !candidate.exists || !candidate.parent) { continue; }
                    if (normalizePath(candidate.fsName) === normalizePath(source.fsName)) { continue; }
                    if (normalizePath(candidate.parent.fsName) !== normalizePath(targetFolder.fsName)) { continue; }
                    if (boltFilesEqualExact(source, candidate)) { return candidate; }
                } catch (ignoreDuplicateCandidate) {}
            }
            return null;
        }

    function boltResourceFolder(resourcesFolder, file, unused) {
            if (unused) {
                return ensureFolder(new Folder(resourcesFolder.fsName + "/Unused"));
            }
            ensureFolder(resourcesFolder);
            return resourcesFolder;
        }

    function boltRelinkFootage(item, target, context, sequenceMode) {
            var itemKey = "";
            try { itemKey = String(item.id); } catch (ignoreRelinkItemID) {}
    
            if (
                context &&
                context.layeredDesignItemIds &&
                context.layeredDesignItemIds[itemKey] &&
                !context.layeredDesignMigrationActive
            ) {
                throw new Error(
                    "Retained-layer PSD/AI footage must be migrated as one design group."
                );
            }
    
            if (sequenceMode) { item.replaceWithSequence(target, false); }
            else { item.replace(target); }
            context.relinked++;
        }


    function boltRemoveFileReliable(file) {
        if (!file || !file.exists) { return true; }

        try {
            if (file.remove()) { return true; }
        } catch (ignoreNativeRemove) {}

        if ($.os.toLowerCase().indexOf("windows") !== -1) {
            try {
                var ps = windowsPowerShellExecutable();
                var command = '"' + ps +
                    '" -NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command "' +
                    "$ErrorActionPreference='SilentlyContinue'; Remove-Item -LiteralPath " +
                    psSingleQuote(file.fsName).replace(/"/g, '\\"') +
                    ' -Force"';
                system.callSystem(command);
                if (!(new File(file.fsName)).exists) { return true; }
            } catch (ignorePowerShellRemove) {}
        } else {
            try {
                system.callSystem("/bin/rm -f " + shellSingleQuote(file.fsName));
                if (!(new File(file.fsName)).exists) { return true; }
            } catch (ignoreShellRemove) {}
        }
        return !(new File(file.fsName)).exists;
    }

    function boltMoveFileWithUndo(source, target, context) {
        if (normalizePath(source.fsName) === normalizePath(target.fsName)) {
            return source;
        }
    
        ensureFolder(target.parent);
    
        if (target.exists) {
            if (boltFilesEqualExact(source, target)) {
                if (boltRemoveFileReliable(source)) {
                    context.diskMoves.push({
                        from:source.fsName,
                        to:target.fsName
                    });
                }
    
                if (
                    context.resourcesFolder &&
                    isPathInside(
                        target.fsName,
                        context.resourcesFolder.fsName
                    )
                ) {
                    boltIndexResourceFile(context, target);
                }
                return target;
            }
    
            target = uniqueFile(target.parent, target.name);
        }
    
        copyFileChecked(source, target);
    
        if (boltRemoveFileReliable(source)) {
            context.diskMoves.push({
                from:source.fsName,
                to:target.fsName
            });
        } else {
            context.warnings.push(
                "Copied but could not remove the old file: " +
                source.fsName
            );
        }
    
        if (
            context.resourcesFolder &&
            isPathInside(
                target.fsName,
                context.resourcesFolder.fsName
            )
        ) {
            boltIndexResourceFile(context, target);
        }
        return target;
    }

    function boltPlaceResourceFile(source, targetFolder, context) {
        var duplicate = boltFindResourceDuplicate(context, source, targetFolder);
    
        if (
            duplicate &&
            normalizePath(duplicate.fsName) !== normalizePath(source.fsName)
        ) {
            context.deduplicated++;
            if (isPathInside(source.fsName, context.resourcesFolder.fsName)) {
                context.duplicateSourceFiles[normalizePath(source.fsName)] = source;
            }
            return duplicate;
        }
    
        if (isPathInside(source.fsName, context.resourcesFolder.fsName)) {
            if (
                !context.organizeResources ||
                normalizePath(source.parent.fsName) ===
                    normalizePath(targetFolder.fsName)
            ) {
                boltIndexResourceFile(context, source);
                return source;
            }
            return boltMoveFileWithUndo(
                source,
                new File(targetFolder.fsName + "/" + source.name),
                context
            );
        }
    
        // Sources already living anywhere inside this project's workspace are
        // moved into Resources instead of copied and abandoned outside it.
        if (
            context.workspaceRoot &&
            isPathInside(source.fsName, context.workspaceRoot.fsName)
        ) {
            return boltMoveFileWithUndo(
                source,
                new File(targetFolder.fsName + "/" + source.name),
                context
            );
        }
    
        // Files outside the workspace are copied so the user's originals remain.
        var target = new File(targetFolder.fsName + "/" + source.name);
        if (target.exists) {
            if (boltFilesEqualExact(target, source)) {
                context.deduplicated++;
                boltIndexResourceFile(context, target);
                return target;
            }
            target = uniqueFile(targetFolder, source.name);
        }
    
        copyFileChecked(source, target);
        context.copied++;
        context.copiedFiles.push(target.fsName);
        boltIndexResourceFile(context, target);
        return target;
    }

    function archiveExactDuplicateSources(context) {
        var referenced = boltReferencedResourcePaths(), key, source, targetFolder, target;
        for (key in context.duplicateSourceFiles) {
            if (!context.duplicateSourceFiles.hasOwnProperty(key) || referenced[key]) { continue; }
            source = context.duplicateSourceFiles[key];
            if (!source || !source.exists) { continue; }
            try {
                targetFolder = ensureFolder(new Folder(context.resourcesFolder.fsName + "/Unused"));
                target = boltMoveFileWithUndo(source, new File(targetFolder.fsName + "/" + source.name), context);
                if (target) { context.archivedDuplicates++; }
            } catch (duplicateArchiveError) {
                context.warnings.push("Could not archive exact duplicate " + source.name + ": " + duplicateArchiveError.message);
            }
        }
    }

    function copySingleFootage(item, resourcesFolder, context, unused, sourceOverride) {
            var source = sourceOverride || boltGetFootageFile(item);
            if (!source) { return; }
    
            var key = sourceKey(source) + (unused ? "|unused" : "|used");
    
            if (context.sourceMap[key] && context.sourceMap[key].exists) {
                boltRelinkFootage(item, context.sourceMap[key], context, false);
                return;
            }
            context.sourceMap[key] = null;
    
            var targetFolder = boltResourceFolder(resourcesFolder, source, unused);
            var target = boltPlaceResourceFile(source, targetFolder, context);
            boltRelinkFootage(item, target, context, false);
            context.sourceMap[key] = target;
        }


    function boltCollectSequenceFiles(source, displayName, targetFolder, context) {
        var sequenceFiles = detectSequenceFiles(source);
        if (!sequenceFiles.length) { return null; }

        var prefix = "", index, desired, collision = false;
        for (index = 0; index < sequenceFiles.length; index++) {
            desired = new File(targetFolder.fsName + "/" + sequenceFiles[index].name);
            if (
                desired.exists &&
                normalizePath(desired.fsName) !== normalizePath(sequenceFiles[index].fsName) &&
                !boltFilesEqualExact(desired, sequenceFiles[index])
            ) {
                collision = true;
                break;
            }
        }
        if (collision) { prefix = sanitizeName(displayName) + "_"; }

        var firstTarget = null, target;
        for (index = 0; index < sequenceFiles.length; index++) {
            target = new File(targetFolder.fsName + "/" + prefix + sequenceFiles[index].name);

            if (normalizePath(target.fsName) === normalizePath(sequenceFiles[index].fsName)) {
                boltIndexResourceFile(context, sequenceFiles[index]);
                target = sequenceFiles[index];
            } else if (target.exists && boltFilesEqualExact(target, sequenceFiles[index])) {
                context.deduplicated++;
                boltIndexResourceFile(context, target);
            } else if (
                isPathInside(sequenceFiles[index].fsName, context.resourcesFolder.fsName) &&
                context.organizeResources
            ) {
                target = boltMoveFileWithUndo(sequenceFiles[index], target, context);
            } else {
                if (target.exists) { target = uniqueFile(targetFolder, prefix + sequenceFiles[index].name); }
                copyFileChecked(sequenceFiles[index], target);
                context.copied++;
                context.copiedFiles.push(target.fsName);
                boltIndexResourceFile(context, target);
            }
            if (!firstTarget) { firstTarget = target; }
        }
        return firstTarget;
    }

    function copySequenceFootage(item, resourcesFolder, context, unused, sourceOverride) {
            var source = sourceOverride || boltGetFootageFile(item);
            if (!source) { return; }
    
            var key = sourceKey(source) + (unused ? "|unused" : "|used");
            if (context.sourceMap[key] && context.sourceMap[key].exists) {
                boltRelinkFootage(item, context.sourceMap[key], context, true);
                return;
            }
            context.sourceMap[key] = null;
    
            var targetFolder = boltResourceFolder(resourcesFolder, source, unused);
            var firstTarget = boltCollectSequenceFiles(source, item.name, targetFolder, context);
            if (!firstTarget) {
                copySingleFootage(item, resourcesFolder, context, unused, source);
                return;
            }
    
            boltRelinkFootage(item, firstTarget, context, true);
            context.sourceMap[key] = firstTarget;
            context.sequences++;
        }

    function collectFootage(item, resourcesFolder, context, unused, sourceOverride) {
            var source = sourceOverride || boltGetFootageFile(item);
            if (!source) { return; }
    
            var mapKey = sourceKey(source) + (unused ? "|unused" : "|used");
    
            // If another Project item already collected this exact original source,
            // relink immediately even when the original file has since been moved.
            if (
                context.sourceMap[mapKey] &&
                context.sourceMap[mapKey].exists
            ) {
                try {
                    boltRelinkFootage(
                        item,
                        context.sourceMap[mapKey],
                        context,
                        isSequenceFootage(item)
                    );
                    return;
                } catch (mappedRelinkError) {
                    context.warnings.push(
                        item.name + ": mapped source could not be relinked: " +
                        mappedRelinkError.message
                    );
                }
            }
            context.sourceMap[mapKey] = null;
    
            if (!source.exists) {
                context.missing.push(item.name + " | " + source.fsName);
                return;
            }
    
            try {
                if (isSequenceFootage(item)) {
                    copySequenceFootage(
                        item,
                        resourcesFolder,
                        context,
                        unused,
                        source
                    );
                } else {
                    copySingleFootage(
                        item,
                        resourcesFolder,
                        context,
                        unused,
                        source
                    );
                }
            } catch (error) {
                context.warnings.push(item.name + ": " + error.message);
            }
        }

    function boltReferencedResourcePaths() {
            var referenced = {}, index, item, file, sequenceFiles, sequenceIndex;
            if (!app.project) { return referenced; }
    
            function addFileAndSequence(sourceFile, sequenceMode) {
                if (!sourceFile || !sourceFile.exists) { return; }
                referenced[normalizePath(sourceFile.fsName)] = true;
                if (!sequenceMode) { return; }
                try {
                    sequenceFiles = detectSequenceFiles(sourceFile);
                    for (sequenceIndex = 0; sequenceIndex < sequenceFiles.length; sequenceIndex++) {
                        referenced[normalizePath(sequenceFiles[sequenceIndex].fsName)] = true;
                    }
                } catch (ignoreReferencedSequence) {}
            }
    
            for (index = 1; index <= app.project.numItems; index++) {
                item = app.project.item(index);
                if (boltIsFootageItem(item)) {
                    file = boltGetFootageFile(item);
                    addFileAndSequence(file, isSequenceFootage(item));
                }
                file = boltGetProxyFile(item);
                addFileAndSequence(file, boltIsProxySequence(item));
            }
            return referenced;
        }

    function archiveUnusedResourceFiles(resourcesFolder, context) {
            if (!context.archiveUnused) { return; }
            var referenced = boltReferencedResourcePaths();
            var protectedPaths = {}, key, target, sequenceFiles, sequenceIndex;
    
            function protectMapped(map) {
                for (key in map) {
                    if (!map.hasOwnProperty(key)) { continue; }
                    target = map[key];
                    if (!target || !target.exists) { continue; }
                    protectedPaths[normalizePath(target.fsName)] = true;
                    try {
                        sequenceFiles = detectSequenceFiles(target);
                        for (sequenceIndex = 0; sequenceIndex < sequenceFiles.length; sequenceIndex++) {
                            protectedPaths[normalizePath(sequenceFiles[sequenceIndex].fsName)] = true;
                        }
                    } catch (ignoreProtectedSequence) {}
                }
            }
            protectMapped(context.sourceMap || {});
            protectMapped(context.proxySourceMap || {});
    
            var files = boltListFilesRecursive(resourcesFolder, [], true), index, file, targetFolder;
            for (index = 0; index < files.length; index++) {
                file = files[index];
                key = normalizePath(file.fsName);
                if (referenced[key] || protectedPaths[key]) { continue; }
                targetFolder = boltResourceFolder(resourcesFolder, file, true);
                if (isPathInside(file.fsName, targetFolder.fsName)) { continue; }
                try {
                    boltMoveFileWithUndo(file, new File(targetFolder.fsName + "/" + file.name), context);
                    context.archivedUnused++;
                } catch (error) {
                    context.warnings.push("Could not archive unused file " + file.name + ": " + error.message);
                }
            }
        }


    function boltRemoveEmptyResourceFolders(folder, resourcesFolder, unusedFolder, context) {
            if (!folder || !folder.exists) { return 0; }
            var entries = [], index, entry, removed = 0;
            try { entries = folder.getFiles(); } catch (ignoreFolderRead) { return 0; }
            for (index = 0; index < entries.length; index++) {
                entry = entries[index];
                if (entry instanceof Folder) {
                    removed += boltRemoveEmptyResourceFolders(entry, resourcesFolder, unusedFolder, context);
                }
            }
            if (normalizePath(folder.fsName) === normalizePath(resourcesFolder.fsName) ||
                normalizePath(folder.fsName) === normalizePath(unusedFolder.fsName)) {
                return removed;
            }
            try {
                entries = folder.getFiles();
                if (!entries.length && folder.remove()) {
                    removed++;
                    context.resourceFoldersRemoved = (context.resourceFoldersRemoved || 0) + 1;
                }
            } catch (ignoreRemoveEmptyResourceFolder) {}
            return removed;
        }

    function boltFootageExpressionSafety(existingIndex) {
        var result = {protectedNames:{}, dynamicFootageReference:false, expressions:0};
        if (!app.project) { return result; }
        var entries = existingIndex || boltBuildExpressionIndex(), index, expression, literalPattern, match, remainder;
        for (index = 0; index < entries.length; index++) {
            expression = safeString(entries[index].expression);
            if (!/footage\s*\(/i.test(expression)) { continue; }
            result.expressions++;
            literalPattern = /footage\s*\(\s*(["'])([^"']+)\1\s*\)/ig;
            remainder = expression;
            while ((match = literalPattern.exec(expression)) !== null) {
                result.protectedNames[match[2].toLowerCase()] = true;
                remainder = remainder.replace(match[0], "");
                if (match[0].length === 0) { literalPattern.lastIndex++; }
            }
            // A computed footage(nameVariable) call cannot be resolved safely.
            // In that case Bolt protects every unused item instead of guessing.
            if (/footage\s*\(/i.test(remainder)) { result.dynamicFootageReference = true; }
        }
        return result;
    }

    function analyzeUnusedProjectFootage() {
        var report = {removable:[], protectedItems:[], dynamicExpression:false, expressionCount:0};
        var sharedIndex = boltBuildExpressionIndex();
        var safety = boltFootageExpressionSafety(sharedIndex), index, item, file, protectedByExpression;
        report.dynamicExpression = safety.dynamicFootageReference;
        report.expressionCount = safety.expressions;
        if (!app.project) { return report; }
        for (index = app.project.numItems; index >= 1; index--) {
            item = app.project.item(index);
            if (!boltIsFootageItem(item) || footageUseCount(item) > 0) { continue; }
            file = boltGetFootageFile(item);
            // Only imported file-based footage is removed. Solids, placeholders,
            // compositions and source files on disk are deliberately protected.
            if (!file || !file.exists) { continue; }
            protectedByExpression = report.dynamicExpression || !!safety.protectedNames[safeString(item.name).toLowerCase()];
            if (protectedByExpression) { report.protectedItems.push(item); }
            else { report.removable.push(item); }
        }
        return report;
    }

    function confirmItemizedAction(titleText, summaryText, itemLines, confirmText, warningText) {
        var dialog = new Window("dialog", brandTitle(titleText));
        dialog.orientation = "column";
        dialog.alignChildren = ["fill", "top"];
        dialog.spacing = 8;
        dialog.margins = 14;
        var summary = dialog.add("statictext", undefined, summaryText, {multiline:true});
        summary.preferredSize = [520, 44];
        if (warningText && warningText.length) {
            var warning = dialog.add("statictext", undefined, warningText, {multiline:true});
            warning.preferredSize = [520, 38];
            styleStatusLabel(warning);
        }
        var list = dialog.add("listbox", undefined, itemLines || [], {multiselect:false});
        list.preferredSize = [520, 220];
        list.minimumSize = [320, 120];
        var buttons = dialog.add("group");
        buttons.orientation = "row";
        buttons.alignment = ["right", "top"];
        var cancelButton = buttons.add("button", undefined, "Cancel", {name:"cancel"});
        cancelButton.helpTip = "Cancel without changing the project.";
        var okButton = buttons.add("button", undefined, confirmText || "Continue", {name:"ok"});
        okButton.helpTip = "Run only the itemized changes shown above.";
        dialog.center();
        return dialog.show() === 1;
    }

    function removeUnusedProjectItems(context) {
        if (!context.removeUnusedItems) { return; }
        var items = context.unusedItemsToRemove || [], index, item;
        for (index = 0; index < items.length; index++) {
            item = items[index];
            try {
                item.remove();
                context.removedUnused++;
            } catch (error) {
                context.warnings.push("Could not remove unused Project item " + item.name + ": " + error.message);
            }
        }
    }

    function footageUseCount(item) {
        try {
            return item.usedIn ? item.usedIn.length : 0;
        } catch (ignore) {
            return 0;
        }
    }

    function compUseCount(item) {
        try {
            return item.usedIn ? item.usedIn.length : 0;
        } catch (ignore) {
            return 0;
        }
    }

    function boltMarkFootageDependency(item, usage) {
            if (!boltIsFootageItem(item)) { return; }
            try { usage.itemIds[String(item.id)] = true; } catch (ignoreDependencyID) {}
            var file = null;
            file = boltGetFootageFile(item);
            if (file) { usage.sourcePaths[sourceKey(file)] = true; }
        }

    function boltBuildFootageDependencyMap(existingIndex) {
        var usage = {itemIds:{}, sourcePaths:{}, expressionNames:{}, dynamicExpression:false};
        var index, item, comp, layerIndex, layer, source, safety, nameKey;
        var sharedIndex = existingIndex || boltBuildExpressionIndex();

        // Read the actual layer sources instead of relying on a single signal.
        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            if (boltIsFootageItem(item) && footageUseCount(item) > 0) {
                boltMarkFootageDependency(item, usage);
            }
            if (!(item instanceof CompItem)) { continue; }
            comp = item;
            for (layerIndex = 1; layerIndex <= comp.numLayers; layerIndex++) {
                try { layer = comp.layer(layerIndex); source = layer ? layer.source : null; }
                catch (ignoreLayerSource) { source = null; }
                if (boltIsFootageItem(source)) { boltMarkFootageDependency(source, usage); }
            }
        }

        // footage("Name") expressions are dependencies even when usedIn is empty.
        safety = boltFootageExpressionSafety(sharedIndex);
        usage.dynamicExpression = !!safety.dynamicFootageReference;
        usage.expressionNames = safety.protectedNames || {};

        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            if (!boltIsFootageItem(item)) { continue; }
            nameKey = safeString(item.name).toLowerCase();
            if (usage.dynamicExpression || usage.expressionNames[nameKey]) {
                boltMarkFootageDependency(item, usage);
            }
        }
        return usage;
    }

    function boltFootageDependencyUsed(item, usage) {
        if (!boltIsFootageItem(item) || !usage) { return false; }
        try { if (usage.itemIds[String(item.id)]) { return true; } } catch (ignoreDependencyLookup) {}
        var file = null;
        file = boltGetFootageFile(item);
        return !!(file && usage.sourcePaths[sourceKey(file)]);
    }


    function boltIsLayeredDesignFile(file) {
        if (!file) { return false; }
        // Photoshop and Illustrator can both be imported as
        // Composition / Composition - Retain Layer Sizes. Multiple AE FootageItems
        // can therefore point to one physical document and must never be relinked
        // independently with FootageItem.replace().
        return /^(?:psd|psb|ai)$/i.test(getFileExtension(file));
    }

    function boltProjectItemKey(item) {
        try { return String(item.id); }
        catch (ignoreProjectItemKey) { return ""; }
    }


    function boltLayeredDesignGroupLooksRetained(group) {
        if (!group || !group.records || group.records.length < 2) {
            return false;
        }
    
        var names = {}, sizes = {}, itemIds = {}, index, record, item, key;
        for (index = 0; index < group.records.length; index++) {
            record = group.records[index];
            item = record.item;
            key = boltProjectItemKey(item);
            if (key.length) { itemIds[key] = true; }
            try { names[safeString(item.name).toLowerCase()] = true; }
            catch (ignoreLayeredName) {}
            try { sizes[String(item.width) + "x" + String(item.height)] = true; }
            catch (ignoreLayeredSize) {}
        }
    
        // Normal retained-layer imports normally expose distinct item names and/or
        // crop sizes. This is the fast, high-confidence path.
        if (countObjectKeys(names) > 1 || countObjectKeys(sizes) > 1) {
            return true;
        }
    
        // Duplicate layer names and equal-sized layers are valid in PSD/AI files.
        // If one composition references two or more different FootageItems from
        // this physical document, it is still a retained-layer design.
        var projectIndex, comp, layerIndex, source, seen, seenCount;
        if (app.project) {
            for (projectIndex = 1; projectIndex <= app.project.numItems; projectIndex++) {
                comp = app.project.item(projectIndex);
                if (!(comp instanceof CompItem)) { continue; }
                seen = {};
                seenCount = 0;
                for (layerIndex = 1; layerIndex <= comp.numLayers; layerIndex++) {
                    try { source = comp.layer(layerIndex).source; }
                    catch (ignoreLayeredGroupLayer) { source = null; }
                    key = boltProjectItemKey(source);
                    if (key.length && itemIds[key] && !seen[key]) {
                        seen[key] = true;
                        seenCount++;
                        if (seenCount >= 2) { return true; }
                    }
                }
            }
        }
        return false;
    }

    function boltBuildLayeredDesignGroups(records) {
        var map = {}, output = [], index, record, key, group;
    
        for (index = 0; index < records.length; index++) {
            record = records[index];
            if (!record.source || !boltIsLayeredDesignFile(record.source)) {
                continue;
            }
    
            key = record.sourceKey || sourceKey(record.source);
            if (!map[key]) {
                map[key] = {
                    key:key,
                    source:new File(record.source.fsName),
                    records:[]
                };
            }
            map[key].records.push(record);
        }
    
        for (key in map) {
            if (!map.hasOwnProperty(key)) { continue; }
            group = map[key];
            if (!boltLayeredDesignGroupLooksRetained(group)) { continue; }
            output.push(group);
            for (index = 0; index < group.records.length; index++) {
                group.records[index].layeredDesignKey = key;
            }
        }
        return output;
    }

    function boltCaptureProjectItemIDs() {
        var ids = {}, index, item, key;
        if (!app.project) { return ids; }
        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            key = boltProjectItemKey(item);
            if (key.length) { ids[key] = true; }
        }
        return ids;
    }

    function boltCollectCreatedProjectItems(beforeIDs) {
        var items = [], index, item, key;
        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            key = boltProjectItemKey(item);
            if (!key.length || !beforeIDs[key]) { items.push(item); }
        }
        return items;
    }


    function boltImportRetainedLayerDesign(file) {
        if (
            typeof ImportOptions === "undefined" ||
            typeof ImportAsType === "undefined" ||
            !app.project ||
            typeof app.project.importFile !== "function"
        ) {
            throw new Error("Retained-layer import is unavailable in this AE version.");
        }
    
        var before = boltCaptureProjectItemIDs();
        var options = new ImportOptions(file);
        var importType = null;
    
        try {
            if (
                typeof ImportAsType.COMP_CROPPED_LAYERS !== "undefined" &&
                options.canImportAs(ImportAsType.COMP_CROPPED_LAYERS)
            ) {
                importType = ImportAsType.COMP_CROPPED_LAYERS;
            }
        } catch (ignoreCroppedImportCheck) {}
    
        if (importType === null) {
            try {
                if (
                    typeof ImportAsType.COMP !== "undefined" &&
                    options.canImportAs(ImportAsType.COMP)
                ) {
                    importType = ImportAsType.COMP;
                }
            } catch (ignoreCompImportCheck) {}
        }
    
        if (importType === null) {
            throw new Error(
                "The layered design cannot be imported as an After Effects composition: " +
                file.name
            );
        }
    
        options.importAs = importType;
        var importedRoot = app.project.importFile(options);
        var created = boltCollectCreatedProjectItems(before);
        var footage = [], comps = [], index, item, itemFile;
    
        for (index = 0; index < created.length; index++) {
            item = created[index];
            if (item instanceof CompItem) { comps.push(item); }
            if (!boltIsFootageItem(item)) { continue; }
            itemFile = boltGetFootageFile(item);
            if (
                itemFile &&
                normalizePath(itemFile.fsName) === normalizePath(file.fsName)
            ) {
                footage.push(item);
            }
        }
    
        if (!footage.length) {
            throw new Error(
                "After Effects imported no retained layer sources from " + file.name + "."
            );
        }
    
        return {
            root:importedRoot,
            created:created,
            comps:comps,
            footage:footage
        };
    }

    function boltLayeredItemMatchScore(oldItem, newItem) {
        var score = 0;
        try {
            if (
                safeString(oldItem.name).toLowerCase() ===
                safeString(newItem.name).toLowerCase()
            ) { score += 1000; }
        } catch (ignoreLayeredMatchName) {}
    
        try {
            if (oldItem.width === newItem.width) { score += 160; }
            if (oldItem.height === newItem.height) { score += 160; }
            if (
                Math.abs(Number(oldItem.pixelAspect) - Number(newItem.pixelAspect)) <
                0.0001
            ) { score += 20; }
        } catch (ignoreLayeredMatchDimensions) {}
    
        return score;
    }


    function boltLayeredItemsCompatible(oldItem, newItem) {
        if (!oldItem || !newItem) { return false; }
        try {
            if (
                Math.abs(Number(oldItem.width) - Number(newItem.width)) > 0 ||
                Math.abs(Number(oldItem.height) - Number(newItem.height)) > 0
            ) { return false; }
        } catch (ignoreLayeredCompatSize) {}
    
        try {
            if (
                Math.abs(Number(oldItem.pixelAspect) - Number(newItem.pixelAspect)) >
                0.0001
            ) { return false; }
        } catch (ignoreLayeredCompatAspect) {}
        return true;
    }

    function boltLayeredItemSet(items) {
        var result = {}, index, key;
        for (index = 0; index < items.length; index++) {
            key = boltProjectItemKey(items[index]);
            if (key.length) { result[key] = true; }
        }
        return result;
    }

    function boltCompOrderedLayeredSources(comp, allowedSet) {
        var ordered = [], seen = {}, index, source, key;
        if (!(comp instanceof CompItem)) { return ordered; }
    
        for (index = 1; index <= comp.numLayers; index++) {
            try { source = comp.layer(index).source; }
            catch (ignoreOrderedSource) { source = null; }
            key = boltProjectItemKey(source);
            if (!key.length || !allowedSet[key] || seen[key]) { continue; }
            seen[key] = true;
            ordered.push(source);
        }
        return ordered;
    }

    function boltFindBestLayeredReferenceComp(items) {
        var allowed = boltLayeredItemSet(items);
        var best = null, bestCount = 0, projectIndex, comp, ordered;
    
        if (!app.project) { return null; }
        for (projectIndex = 1; projectIndex <= app.project.numItems; projectIndex++) {
            comp = app.project.item(projectIndex);
            if (!(comp instanceof CompItem)) { continue; }
            ordered = boltCompOrderedLayeredSources(comp, allowed);
            if (ordered.length > bestCount) {
                best = comp;
                bestCount = ordered.length;
            }
        }
        return bestCount >= 2 ? best : null;
    }

    function boltFindImportedLayeredComp(imported) {
        if (!imported) { return null; }
        if (imported.root instanceof CompItem) { return imported.root; }
    
        var allowed = boltLayeredItemSet(imported.footage || []);
        var best = null, bestCount = 0, index, comp, ordered;
        var comps = imported.comps || [];
    
        for (index = 0; index < comps.length; index++) {
            comp = comps[index];
            ordered = boltCompOrderedLayeredSources(comp, allowed);
            if (ordered.length > bestCount) {
                best = comp;
                bestCount = ordered.length;
            }
        }
        return best;
    }

    function boltMapLayeredDesignByCompositionOrder(records, imported) {
        var oldItems = [], index, oldComp, newComp, oldOrder, newOrder;
        var oldAllowed, newAllowed, recordById = {}, pairs = [], key, record;
    
        for (index = 0; index < records.length; index++) {
            oldItems.push(records[index].item);
            key = boltProjectItemKey(records[index].item);
            if (key.length) { recordById[key] = records[index]; }
        }
    
        oldComp = boltFindBestLayeredReferenceComp(oldItems);
        newComp = boltFindImportedLayeredComp(imported);
        if (!oldComp || !newComp) { return null; }
    
        oldAllowed = boltLayeredItemSet(oldItems);
        newAllowed = boltLayeredItemSet(imported.footage || []);
        oldOrder = boltCompOrderedLayeredSources(oldComp, oldAllowed);
        newOrder = boltCompOrderedLayeredSources(newComp, newAllowed);
    
        if (
            oldOrder.length !== records.length ||
            newOrder.length !== records.length ||
            oldOrder.length !== newOrder.length
        ) {
            return null;
        }
    
        for (index = 0; index < oldOrder.length; index++) {
            key = boltProjectItemKey(oldOrder[index]);
            record = recordById[key];
            if (
                !record ||
                !boltLayeredItemsCompatible(oldOrder[index], newOrder[index])
            ) {
                return null;
            }
            pairs.push({
                record:record,
                oldItem:oldOrder[index],
                newItem:newOrder[index],
                oldName:safeString(oldOrder[index].name),
                oldParent:oldOrder[index].parentFolder,
                oldLabel:(function(item){try{return item.label;}catch(e){return 0;}})(oldOrder[index]),
                oldComment:(function(item){try{return safeString(item.comment);}catch(e){return "";}})(oldOrder[index]),
                matchMode:"composition-order"
            });
        }
        return pairs;
    }

    function boltCaptureLayeredSourceReferences(pairs) {
        var oldById = {}, pairByOldId = {}, index, key;
        for (index = 0; index < pairs.length; index++) {
            key = boltProjectItemKey(pairs[index].oldItem);
            if (key.length) {
                oldById[key] = true;
                pairByOldId[key] = pairs[index];
            }
        }
    
        var refs = [], projectIndex, comp, layerIndex, layer, source, sourceKeyValue;
        for (projectIndex = 1; projectIndex <= app.project.numItems; projectIndex++) {
            comp = app.project.item(projectIndex);
            if (!(comp instanceof CompItem)) { continue; }
            for (layerIndex = 1; layerIndex <= comp.numLayers; layerIndex++) {
                try {
                    layer = comp.layer(layerIndex);
                    source = layer ? layer.source : null;
                } catch (ignoreLayeredRefRead) {
                    source = null;
                }
                sourceKeyValue = boltProjectItemKey(source);
                if (sourceKeyValue.length && oldById[sourceKeyValue]) {
                    refs.push({
                        comp:comp,
                        layerIndex:layerIndex,
                        oldItem:source,
                        newItem:pairByOldId[sourceKeyValue].newItem
                    });
                }
            }
        }
        return refs;
    }

    function boltVerifyLayeredMigration(pairs, references, target) {
        var index, pair, file, ref, layer, source;
    
        for (index = 0; index < pairs.length; index++) {
            pair = pairs[index];
            if (!boltLayeredItemsCompatible(pair.oldItem, pair.newItem)) {
                throw new Error(
                    "Layer dimensions changed while moving '" + pair.oldName + "'."
                );
            }
            file = boltGetFootageFile(pair.newItem);
            if (
                !file ||
                !file.exists ||
                normalizePath(file.fsName) !== normalizePath(target.fsName)
            ) {
                throw new Error(
                    "The replacement layer '" + pair.oldName +
                    "' is not linked to the Resources copy."
                );
            }
        }
    
        for (index = 0; index < references.length; index++) {
            ref = references[index];
            if (!projectContainsItem(ref.comp) || ref.layerIndex > ref.comp.numLayers) {
                throw new Error("A composition changed during layered-file migration.");
            }
            try {
                layer = ref.comp.layer(ref.layerIndex);
                source = layer ? layer.source : null;
            } catch (ignoreLayeredVerifyRef) {
                source = null;
            }
            if (source !== ref.newItem) {
                throw new Error(
                    "A composition layer did not keep its correct retained-layer source."
                );
            }
        }
        return true;
    }


    function boltMapLayeredDesignItems(records, imported) {
        var newItems = imported && imported.footage ? imported.footage : [];
        if (newItems.length < records.length) { return null; }
    
        // Best path: use the original imported design comp and the newly imported
        // retained-layer comp. Layer order survives even when layer names repeat.
        var orderedPairs = boltMapLayeredDesignByCompositionOrder(records, imported);
        if (orderedPairs && orderedPairs.length === records.length) {
            return orderedPairs;
        }
    
        // Fallback only when every match is unambiguous. Bolt deliberately refuses
        // to guess between equal-name/equal-size candidates because a wrong match
        // produces a visually broken AE project.
        var pairs = [], used = {}, index, candidateIndex;
        var record, scored, score, best, second, entry;
    
        for (index = 0; index < records.length; index++) {
            record = records[index];
            scored = [];
    
            for (candidateIndex = 0; candidateIndex < newItems.length; candidateIndex++) {
                if (used[candidateIndex]) { continue; }
                score = boltLayeredItemMatchScore(
                    record.item,
                    newItems[candidateIndex]
                );
                scored.push({
                    index:candidateIndex,
                    score:score,
                    item:newItems[candidateIndex]
                });
            }
    
            scored.sort(function(a, b) { return b.score - a.score; });
            best = scored.length ? scored[0] : null;
            second = scored.length > 1 ? scored[1] : null;
    
            if (!best || best.score < 320) { return null; }
            if (second && second.score === best.score) { return null; }
            if (!boltLayeredItemsCompatible(record.item, best.item)) { return null; }
    
            used[best.index] = true;
            entry = {
                record:record,
                oldItem:record.item,
                newItem:best.item,
                oldName:safeString(record.item.name),
                oldParent:record.item.parentFolder,
                oldLabel:(function(){try{return record.item.label;}catch(e){return 0;}})(),
                oldComment:(function(){try{return safeString(record.item.comment);}catch(e){return "";}})(),
                matchMode:"unique-signature"
            };
            pairs.push(entry);
        }
        return pairs;
    }

    function boltCopyFootageInterpretation(oldItem, newItem) {
        var attributes = [
            "alphaMode",
            "invertAlpha",
            "premulColor",
            "fieldSeparationType",
            "removePulldown",
            "conformFrameRate"
        ];
        var index, value;
        for (index = 0; index < attributes.length; index++) {
            try {
                value = oldItem.mainSource[attributes[index]];
                newItem.mainSource[attributes[index]] = value;
            } catch (ignoreInterpretationAttribute) {}
        }
    }

    function boltTransferItemProxy(oldItem, newItem) {
        var proxyFile = boltGetProxyFile(oldItem);
        if (!proxyFile || !proxyFile.exists) { return; }
    
        var useProxy = false;
        try { useProxy = oldItem.useProxy === true; }
        catch (ignoreOldProxyState) {}
    
        try {
            if (
                boltIsProxySequence(oldItem) &&
                typeof newItem.setProxyWithSequence === "function"
            ) {
                newItem.setProxyWithSequence(proxyFile, false);
            } else if (typeof newItem.setProxy === "function") {
                newItem.setProxy(proxyFile);
            }
            try { newItem.useProxy = useProxy; }
            catch (ignoreNewProxyState) {}
        } catch (ignoreLayeredProxyTransfer) {}
    }

    function boltReplaceProjectLayerSources(oldItem, newItem) {
        var replaced = 0, itemIndex, comp, layerIndex, layer, source;
        for (itemIndex = 1; itemIndex <= app.project.numItems; itemIndex++) {
            comp = app.project.item(itemIndex);
            if (!(comp instanceof CompItem)) { continue; }
            for (layerIndex = 1; layerIndex <= comp.numLayers; layerIndex++) {
                try {
                    layer = comp.layer(layerIndex);
                    source = layer ? layer.source : null;
                    if (source === oldItem) {
                        layer.replaceSource(newItem, false);
                        replaced++;
                    }
                } catch (ignoreLayeredSourceReplace) {}
            }
        }
        return replaced;
    }

    function boltCleanupImportedDesignItems(created, keepItems) {
        var keep = {}, index, item, key, pass;
        for (index = 0; index < keepItems.length; index++) {
            key = boltProjectItemKey(keepItems[index]);
            if (key.length) { keep[key] = true; }
        }
    
        for (pass = 0; pass < 4; pass++) {
            for (index = created.length - 1; index >= 0; index--) {
                item = created[index];
                key = boltProjectItemKey(item);
                if (key.length && keep[key]) { continue; }
                if (!projectContainsItem(item)) { continue; }
                try {
                    if (item instanceof FolderItem && item.numItems > 0) { continue; }
                    if (!(item instanceof FolderItem) && compUseCount(item) > 0) { continue; }
                    item.remove();
                } catch (ignoreImportedDesignCleanup) {}
            }
        }
    }


    function boltRollbackLayeredDesignPairs(pairs) {
        var index, pair;
        for (index = pairs.length - 1; index >= 0; index--) {
            pair = pairs[index];
            try { boltReplaceProjectLayerSources(pair.newItem, pair.oldItem); }
            catch (ignoreLayeredRollbackSource) {}
            try { pair.oldItem.name = pair.oldName; }
            catch (ignoreLayeredRollbackName) {}
            try {
                if (pair.newItem && projectContainsItem(pair.newItem)) {
                    pair.newItem.name = "__BOLT_ROLLBACK__" + boltProjectItemKey(pair.newItem);
                }
            } catch (ignoreLayeredRollbackNewName) {}
        }
    }


    function boltMigrateLayeredDesignGroup(group, target, context) {
        var imported = null, pairs = null, references = [], index, pair, oldKey;
        context.layeredDesignMigrationActive = true;
    
        try {
            imported = boltImportRetainedLayerDesign(target);
            pairs = boltMapLayeredDesignItems(group.records, imported);
            if (!pairs || pairs.length !== group.records.length) {
                throw new Error(
                    "The retained layers are ambiguous. Bolt refused to guess their mapping."
                );
            }
    
            references = boltCaptureLayeredSourceReferences(pairs);
    
            // Validate the complete mapping before touching the live project.
            for (index = 0; index < pairs.length; index++) {
                pair = pairs[index];
                if (!boltLayeredItemsCompatible(pair.oldItem, pair.newItem)) {
                    throw new Error(
                        "Layer signature mismatch for '" + pair.oldName + "'."
                    );
                }
            }
    
            // Rename the old items temporarily so footage("Layer Name") expressions
            // resolve to the replacement item as soon as the new item receives the
            // original Project-panel name.
            for (index = 0; index < pairs.length; index++) {
                pair = pairs[index];
                try {
                    pair.oldItem.name =
                        "__BOLT_OLD_LAYERED__" +
                        boltProjectItemKey(pair.oldItem) +
                        "__" + pair.oldName;
                } catch (ignoreOldLayeredRename) {}
            }
    
            for (index = 0; index < pairs.length; index++) {
                pair = pairs[index];
                try { pair.newItem.name = pair.oldName; }
                catch (ignoreNewLayeredName) {}
                try { pair.newItem.parentFolder = pair.oldParent; }
                catch (ignoreNewLayeredParent) {}
                try { pair.newItem.label = pair.oldLabel; }
                catch (ignoreNewLayeredLabel) {}
                try { pair.newItem.comment = pair.oldComment; }
                catch (ignoreNewLayeredComment) {}
                boltCopyFootageInterpretation(pair.oldItem, pair.newItem);
                boltTransferItemProxy(pair.oldItem, pair.newItem);
                boltReplaceProjectLayerSources(pair.oldItem, pair.newItem);
            }
    
            // This is the key safety gate. Old source items are not removed until
            // every composition-layer reference and every new retained source has
            // been verified against the Resources copy.
            boltVerifyLayeredMigration(pairs, references, target);
    
            for (index = 0; index < pairs.length; index++) {
                pair = pairs[index];
                if (footageUseCount(pair.oldItem) > 0) {
                    throw new Error(
                        "A retained layer still has composition references: " +
                        pair.oldName
                    );
                }
            }
    
            for (index = 0; index < pairs.length; index++) {
                pair = pairs[index];
    
                // Removal failure is not allowed to damage a working migration.
                // The zero-use old item can safely remain under a private name.
                try {
                    pair.oldItem.remove();
                } catch (oldLayeredRemoveError) {
                    try {
                        pair.oldItem.name =
                            "__BOLT_UNUSED_LAYERED__" +
                            boltProjectItemKey(pair.oldItem);
                        pair.oldItem.comment =
                            "Bolt retained-layer migration backup. Zero composition uses.";
                    } catch (ignoreOldLayeredBackupMeta) {}
                    context.warnings.push(
                        "Old zero-use layered item could not be removed: " +
                        pair.oldName
                    );
                }
    
                pair.record.item = pair.newItem;
                pair.record.source = new File(target.fsName);
                pair.record.sourceKey = sourceKey(target);
                pair.record.sequence = false;
                pair.record.sequenceCount = 0;
                pair.record.layeredMigrated = true;
                pair.record.layeredProtected = false;
            }
    
            var retainedItems = [];
            for (index = 0; index < pairs.length; index++) {
                retainedItems.push(pairs[index].newItem);
            }
            boltCleanupImportedDesignItems(imported.created, retainedItems);
    
            context.layeredDesignMigrated =
                (context.layeredDesignMigrated || 0) + pairs.length;
            oldKey = group.key + "|used";
            context.sourceMap[oldKey] = target;
            return true;
        } catch (layeredMigrationError) {
            if (pairs) { boltRollbackLayeredDesignPairs(pairs); }
            if (imported) {
                boltCleanupImportedDesignItems(imported.created, []);
            }
            context.layeredDesignProtected =
                (context.layeredDesignProtected || 0) + group.records.length;
            context.warnings.push(
                "Layered PSD/AI preserved without destructive relinking: " +
                layeredMigrationError.message
            );
            return false;
        } finally {
            context.layeredDesignMigrationActive = false;
        }
    }

    function boltCopyLayeredDesignSource(source, resourcesFolder, context) {
        var targetFolder = ensureFolder(resourcesFolder);
        if (boltFileIsDirectlyIn(source, targetFolder)) {
            boltIndexResourceFile(context, source);
            return source;
        }
    
        var duplicate = boltFindResourceDuplicate(context, source, targetFolder);
        if (duplicate) {
            context.deduplicated++;
            return duplicate;
        }
    
        var target = new File(targetFolder.fsName + "/" + source.name);
        if (target.exists) {
            if (boltFilesEqualExact(source, target)) {
                context.deduplicated++;
                boltIndexResourceFile(context, target);
                return target;
            }
            target = uniqueFile(targetFolder, source.name);
        }
    
        // Copy first. The original is removed only after the retained-layer
        // migration has succeeded and every old source has been replaced safely.
        copyFileChecked(source, target);
        context.copied++;
        context.copiedFiles.push(target.fsName);
        boltIndexResourceFile(context, target);
        return target;
    }


    function boltCollectLayeredDesignGroup(group, resourcesFolder, context) {
        var source = group.source;
        var kind = source ? getFileExtension(source).toUpperCase() : "PSD/AI";
        if (!source || !source.exists) {
            context.missing.push(
                "Layered " + kind + " | " + (source ? source.fsName : "Unknown file")
            );
            return false;
        }
    
        var target = boltCopyLayeredDesignSource(
            source,
            resourcesFolder,
            context
        );
    
        if (normalizePath(source.fsName) === normalizePath(target.fsName)) {
            var alreadyIndex;
            for (alreadyIndex = 0; alreadyIndex < group.records.length; alreadyIndex++) {
                group.records[alreadyIndex].layeredMigrated = true;
                group.records[alreadyIndex].layeredProtected = false;
            }
            context.alreadyOrganized += group.records.length;
            return true;
        }
    
        if (!boltMigrateLayeredDesignGroup(group, target, context)) {
            // Absolute safety fallback: keep the live AE layer sources linked to
            // their original document. The Resources copy remains as a backup, but
            // Bolt will not call FootageItem.replace() on retained PSD/AI layers.
            var protectIndex;
            for (protectIndex = 0; protectIndex < group.records.length; protectIndex++) {
                group.records[protectIndex].layeredProtected = true;
                group.records[protectIndex].layeredBackup = new File(target.fsName);
            }
            if (!context.protectedLayeredPaths) { context.protectedLayeredPaths = {}; }
            context.protectedLayeredPaths[normalizePath(source.fsName)] = true;
            context.warnings.push(
                "Layered " + kind + " kept on its original live link to prevent layer damage. " +
                "A backup copy was saved in Resources: " + target.name
            );
            return true;
        }
    
        if (
            context.workspaceRoot &&
            isPathInside(source.fsName, context.workspaceRoot.fsName) &&
            !isPathInside(source.fsName, resourcesFolder.fsName)
        ) {
            if (boltRemoveFileReliable(source)) {
                context.diskMoves.push({from:source.fsName, to:target.fsName});
            } else {
                context.warnings.push(
                    "The migrated " + kind + " is working from Resources, but the old copy " +
                    "could not be removed: " + source.fsName
                );
            }
        }
        return true;
    }

    function boltBuildLayeredMissingGroups(records) {
        var pseudo = [], index, record, groups;
        for (index = 0; index < records.length; index++) {
            record = records[index];
            if (record.proxy || !boltIsLayeredDesignFile(record.missing)) {
                continue;
            }
            pseudo.push({
                item:record.item,
                source:new File(record.missing.fsName),
                sourceKey:sourceKey(record.missing),
                missingRecord:record
            });
        }
    
        groups = boltBuildLayeredDesignGroups(pseudo);
        for (index = 0; index < groups.length; index++) {
            var recordIndex;
            for (recordIndex = 0; recordIndex < groups[index].records.length; recordIndex++) {
                groups[index].records[recordIndex].missingRecord.layeredMissingGroup = groups[index];
            }
        }
        return groups;
    }

    function boltBuildCollectionRecords(dependencyUsage) {
        var records = [];
        var index, item, file, key, used, sequenceCount;
    
        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            if (!boltIsFootageItem(item)) { continue; }
    
            file = boltGetFootageFile(item) || boltGetMissingFootageFile(item);
            if (!file) { continue; }
    
            key = sourceKey(file);
            used = boltFootageDependencyUsed(item, dependencyUsage);
            sequenceCount = 0;
    
            if (file.exists && isSequenceFootage(item)) {
                try {
                    sequenceCount = detectSequenceFiles(file).length;
                } catch (ignoreSequenceCount) {}
            }
    
            records.push({
                item:item,
                source:new File(file.fsName),
                sourceKey:key,
                used:used,
                // Every imported file-backed Project item belongs to Resources.
                // Resources/Unused is reserved for loose disk files that are not
                // represented by a Project item.
                unused:false,
                sequence:isSequenceFootage(item),
                sequenceCount:sequenceCount
            });
        }
    
        return records;
    }


    function boltSequenceLocationValid(record, currentFile) {
        if (!record || !record.sequence || !currentFile || !currentFile.exists) { return !record || !record.sequence; }
        if (!record.sequenceCount || record.sequenceCount < 2) { return true; }
        try { return detectSequenceFiles(currentFile).length >= record.sequenceCount; }
        catch (ignoreVerifySequence) { return false; }
    }



    function boltRecordIsCollected(record, resourcesFolder) {
        var currentFile = boltGetFootageFile(record.item);
    
        if (record && record.layeredProtected) {
            return !!(
                currentFile &&
                currentFile.exists &&
                record.layeredBackup &&
                record.layeredBackup.exists
            );
        }
    
        return !!(
            currentFile &&
            currentFile.exists &&
            boltFileIsDirectlyIn(currentFile, resourcesFolder) &&
            boltSequenceLocationValid(record, currentFile)
        );
    }

    function boltReconcileCollectionRecords(
    records,
    resourcesFolder,
    context,
    maxPasses
) {
    var pass, index, record, currentFile, source, mapKey, mapped;
    var failed = [], passed = 0;
    maxPasses = Math.max(1, Number(maxPasses) || 2);

    for (pass = 0; pass < maxPasses; pass++) {
        failed = [];
        passed = 0;

        for (index = 0; index < records.length; index++) {
            record = records[index];

            if (boltRecordIsCollected(record, resourcesFolder)) {
                passed++;
                continue;
            }

            mapKey = record.sourceKey + "|used";
            mapped = context.sourceMap[mapKey] || null;
            currentFile = boltGetFootageFile(record.item);
            source = null;

            if (mapped && mapped.exists) {
                try {
                    boltRelinkFootage(
                        record.item,
                        mapped,
                        context,
                        record.sequence
                    );
                } catch (ignoreMappedReconcile) {}
            }

            if (!boltRecordIsCollected(record, resourcesFolder)) {
                currentFile = boltGetFootageFile(record.item);
                if (currentFile && currentFile.exists) {
                    source = new File(currentFile.fsName);
                } else if (record.source && record.source.exists) {
                    source = new File(record.source.fsName);
                }

                if (source && source.exists) {
                    try {
                        collectFootage(
                            record.item,
                            resourcesFolder,
                            context,
                            false,
                            source
                        );
                    } catch (reconcileError) {
                        context.warnings.push(
                            record.item.name +
                            ": final collection retry failed: " +
                            reconcileError.message
                        );
                    }
                }
            }

            if (boltRecordIsCollected(record, resourcesFolder)) {
                passed++;
            } else {
                currentFile = boltGetFootageFile(record.item);
                failed.push(
                    record.item.name +
                    " | " +
                    (currentFile
                        ? currentFile.fsName
                        : record.source.fsName)
                );
            }
        }

        if (!failed.length) { break; }
    }

    context.collectionRecords = records.length;
    context.collectionVerified = passed;
    context.collectionFailed = failed;
    return failed;
}


    function boltProtectImportedResourcePaths(
    collectionRecords,
    proxyRecords
) {
    var protectedPaths = {}, index, current, files, fileIndex, record;

    function protect(file, sequenceMode) {
        if (!file || !file.exists) { return; }
        protectedPaths[normalizePath(file.fsName)] = true;
        if (!sequenceMode) { return; }
        try {
            files = detectSequenceFiles(file);
            for (fileIndex = 0; fileIndex < files.length; fileIndex++) {
                protectedPaths[normalizePath(files[fileIndex].fsName)] = true;
            }
        } catch (ignoreProtectedSequenceFiles) {}
    }

    for (index = 0; index < collectionRecords.length; index++) {
        record = collectionRecords[index];
        current = boltGetFootageFile(record.item);
        protect(current, record.sequence);

        // A protected layered PSD/AI keeps its live original link intentionally.
        // Its Resources copy is a safety backup and must not be swept into
        // Resources/Unused during the same organize pass.
        if (record.layeredProtected && record.layeredBackup) {
            protect(record.layeredBackup, false);
        }
    }
    for (index = 0; index < proxyRecords.length; index++) {
        current = boltGetProxyFile(proxyRecords[index].item);
        protect(current, proxyRecords[index].sequence);
    }
    return protectedPaths;
}

    function boltArchiveLooseResourceFiles(
    resourcesFolder,
    collectionRecords,
    proxyRecords,
    context
) {
    var protectedPaths = boltProtectImportedResourcePaths(
        collectionRecords,
        proxyRecords
    );
    var unusedFolder = ensureFolder(
        new Folder(resourcesFolder.fsName + "/Unused")
    );
    var files = boltListFilesRecursive(resourcesFolder, [], true);
    var index, file, key;

    for (index = 0; index < files.length; index++) {
        file = files[index];
        key = normalizePath(file.fsName);
        if (protectedPaths[key]) { continue; }

        try {
            boltMoveFileWithUndo(
                file,
                new File(unusedFolder.fsName + "/" + file.name),
                context
            );
            context.archivedUnused++;
        } catch (archiveLooseError) {
            context.warnings.push(
                "Could not place loose resource " +
                file.name +
                " in Resources/Unused: " +
                archiveLooseError.message
            );
        }
    }
}

    function boltPushUniqueText(list, textValue) {
        if (!list) { return; }
        var text = safeString(textValue);
        var index;
        for (index = 0; index < list.length; index++) {
            if (safeString(list[index]) === text) { return; }
        }
        list.push(text);
    }

    function boltCollectionRecordAvailable(record, context) {
        if (!record) { return false; }
        var current = null, mapped = null;
        try { current = boltGetFootageFile(record.item); } catch (ignoreAvailableCurrent) {}
        if (current && current.exists) { return true; }
        if (record.source && record.source.exists) { return true; }
        try { mapped = context.sourceMap[record.sourceKey + "|used"]; } catch (ignoreAvailableMap) { mapped = null; }
        return !!(mapped && mapped.exists);
    }

    function boltProxyRecordAvailable(record, context) {
        if (!record) { return false; }
        var current = null, mapped = null;
        try { current = boltGetProxyFile(record.item); } catch (ignoreAvailableProxyCurrent) {}
        if (current && current.exists) { return true; }
        if (record.source && record.source.exists) { return true; }
        try { mapped = context.proxySourceMap["proxy|" + record.sourceKey]; } catch (ignoreAvailableProxyMap) { mapped = null; }
        return !!(mapped && mapped.exists);
    }

    function boltRequireCompleteCollection(
        collectionRecords,
        proxyRecords,
        folders,
        context
    ) {
        var availableCollection = [], missingCollection = [];
        var availableProxy = [], missingProxy = [];
        var index, record, missingPath;

        // Missing/offline media is not an organizer failure. Bolt organizes every
        // available dependency, preserves the offline Project item, writes it to
        // the report, and keeps going. Only a real copy/relink failure for an
        // available source can stop the operation.
        for (index = 0; index < collectionRecords.length; index++) {
            record = collectionRecords[index];
            if (boltCollectionRecordAvailable(record, context)) {
                availableCollection.push(record);
            } else {
                missingCollection.push(record);
                missingPath = record.source ? record.source.fsName : "Unknown path";
                boltPushUniqueText(context.missing, record.item.name + " | " + missingPath);
            }
        }

        for (index = 0; index < proxyRecords.length; index++) {
            record = proxyRecords[index];
            if (boltProxyRecordAvailable(record, context)) {
                availableProxy.push(record);
            } else {
                missingProxy.push(record);
                missingPath = record.source ? record.source.fsName : "Unknown proxy path";
                boltPushUniqueText(context.missing, record.item.name + " proxy | " + missingPath);
            }
        }

        context.skippedMissingCollection = missingCollection.length;
        context.skippedMissingProxy = missingProxy.length;
        context.collectionRecordsTotal = collectionRecords.length;
        context.proxyRecordsTotal = proxyRecords.length;

        boltReconcileCollectionRecords(
            availableCollection,
            folders.resources,
            context,
            2
        );
        boltVerifyProxyRecords(
            availableProxy,
            folders.resources,
            context,
            true
        );

        if (context.collectionFailed.length || context.proxyFailed.length) {
            throw new Error(
                "Collection verification failed for " +
                context.collectionFailed.length +
                " available Project file(s) and " +
                context.proxyFailed.length +
                " available proxy file(s). Missing/offline files were skipped safely."
            );
        }
    }

    function boltVerifyCollectionRecords(records, resourcesFolder, context, retry) {
        if (retry) {
            return boltReconcileCollectionRecords(
                records,
                resourcesFolder,
                context,
                2
            );
        }
    
        var index, record, currentFile, passed = 0, failed = [];
        for (index = 0; index < records.length; index++) {
            record = records[index];
            currentFile = boltGetFootageFile(record.item);
            if (boltRecordIsCollected(record, resourcesFolder)) {
                passed++;
            } else {
                failed.push(
                    record.item.name +
                    " | " +
                    (currentFile
                        ? currentFile.fsName
                        : record.source.fsName)
                );
            }
        }
        context.collectionRecords = records.length;
        context.collectionVerified = passed;
        context.collectionFailed = failed;
        return failed;
    }

    function countObjectKeys(object) {
        var count = 0;
        var key;
        for (key in object) {
            if (object.hasOwnProperty(key)) {
                count++;
            }
        }
        return count;
    }

    function scanCompFontsAndEffects(comp, fontMap, effectMap, scanEffects) {
        var layerIndex;
        for (layerIndex = 1; layerIndex <= comp.numLayers; layerIndex++) {
            var layer = comp.layer(layerIndex);
            try {
                var textProps = layer.property("ADBE Text Properties");
                if (textProps) {
                    var sourceText = textProps.property("ADBE Text Document");
                    if (sourceText) {
                        var textDocument = sourceText.value;
                        if (textDocument && textDocument.font) {
                            fontMap[textDocument.font] = true;
                        }
                    }
                }
            } catch (ignoreFont) {}
            if (scanEffects) {
                try {
                    var effects = layer.property("ADBE Effect Parade");
                    if (effects) {
                        var effectIndex;
                        for (effectIndex = 1; effectIndex <= effects.numProperties; effectIndex++) {
                            var effect = effects.property(effectIndex);
                            var effectName = effect.matchName || effect.name;
                            if (effectName) {
                                effectMap[effectName] = true;
                            }
                        }
                    }
                } catch (ignoreEffect) {}
            }
        }
    }

    function analyzeProject() {
            if (!app.project) { throw new Error("No After Effects project is open."); }
            var result = {comps:0, mainComps:0, dependencies:0, missing:0, unused:0, sequences:0, proxies:0, fonts:0, effects:0};
            var fontMap = {}, effectMap = {}, scanEffects = false, index, item, uses;
    
            for (index = 1; index <= app.project.numItems; index++) {
                item = app.project.item(index);
                if (item instanceof CompItem) {
                    result.comps++;
                    if (compUseCount(item) === 0) { result.mainComps++; }
                    scanCompFontsAndEffects(item, fontMap, effectMap, scanEffects);
                } else if (boltIsFootageItem(item)) {
                    uses = footageUseCount(item);
                    if (uses > 0) {
                        result.dependencies++;
                        if (isSequenceFootage(item)) { result.sequences++; }
                    } else {
                        result.unused++;
                    }
                    if (getMissingFootagePath(item).length) { result.missing++; }
                }
                if (boltGetProxyFile(item) || boltGetMissingProxyFile(item)) { result.proxies++; }
            }
    
            result.fonts = countObjectKeys(fontMap);
            result.effects = countObjectKeys(effectMap);
            setStatus(
                result.comps + " comps • " + result.dependencies + " used • " +
                result.missing + " missing • " + result.unused + " unused • " +
                result.sequences + " sequences • " + result.proxies + " proxies • " +
                result.fonts + " fonts",
                result.missing ? "warning" : "ok"
            );
            return result;
        }


    function boltBuildProxyRecords() {
        var records = [], index, item, source, sequenceCount, previousUseProxy;
        if (!app.project) { return records; }

        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            if (!boltIsAVItemWithProxy(item)) { continue; }
            source = boltGetProxyFile(item) || boltGetMissingProxyFile(item);
            if (!source) { continue; }

            sequenceCount = 0;
            if (source.exists && boltIsProxySequence(item)) {
                try { sequenceCount = detectSequenceFiles(source).length; } catch (ignoreProxySequenceCount) {}
            }
            try { previousUseProxy = item.useProxy === true; } catch (ignoreProxyUseState) { previousUseProxy = false; }

            records.push({
                item:item,
                source:new File(source.fsName),
                sourceKey:sourceKey(source),
                sequence:boltIsProxySequence(item),
                sequenceCount:sequenceCount,
                useProxy:previousUseProxy
            });
        }
        return records;
    }

    function boltRelinkProxy(record, target, context) {
        var item = record.item;
        if (record.sequence && typeof item.setProxyWithSequence === "function") {
            item.setProxyWithSequence(target, false);
        } else if (typeof item.setProxy === "function") {
            item.setProxy(target);
        } else {
            throw new Error("This item cannot accept a file proxy.");
        }
        try { item.useProxy = record.useProxy; } catch (ignoreRestoreProxyUse) {}
        context.proxiesRelinked++;
    }

    function boltCollectProxyRecord(record, resourcesFolder, context) {
        var source = record.source;
        var key = "proxy|" + record.sourceKey;
        var mapped = context.proxySourceMap[key] || null;

        if (mapped && mapped.exists) {
            boltRelinkProxy(record, mapped, context);
            return;
        }
        if (!source || !source.exists) {
            context.missing.push(record.item.name + " proxy | " + (source ? source.fsName : "Unknown path"));
            return;
        }

        var targetFolder = ensureFolder(resourcesFolder), target;
        if (record.sequence) {
            target = boltCollectSequenceFiles(source, record.item.name + "_Proxy", targetFolder, context);
            if (!target) { target = boltPlaceResourceFile(source, targetFolder, context); }
        } else {
            target = boltPlaceResourceFile(source, targetFolder, context);
        }

        boltRelinkProxy(record, target, context);
        context.proxySourceMap[key] = target;
    }

    function boltVerifyProxyRecords(records, resourcesFolder, context, retry) {
        var index, record, currentFile, mapped, passed = 0, failed = [];
        for (index = 0; index < records.length; index++) {
            record = records[index];
            currentFile = boltGetProxyFile(record.item);

            if (
                currentFile && currentFile.exists &&
                boltFileIsDirectlyIn(currentFile, resourcesFolder) &&
                boltSequenceLocationValid(record, currentFile)
            ) {
                passed++;
                continue;
            }

            if (retry) {
                mapped = context.proxySourceMap["proxy|" + record.sourceKey] || null;
                try {
                    if (mapped && mapped.exists) {
                        boltRelinkProxy(record, mapped, context);
                    } else if (record.source && record.source.exists) {
                        boltCollectProxyRecord(record, resourcesFolder, context);
                    }
                } catch (proxyRetryError) {
                    context.warnings.push(record.item.name + ": proxy verification retry failed: " + proxyRetryError.message);
                }
                currentFile = boltGetProxyFile(record.item);
            }

            if (
                currentFile && currentFile.exists &&
                boltFileIsDirectlyIn(currentFile, resourcesFolder) &&
                boltSequenceLocationValid(record, currentFile)
            ) {
                passed++;
            } else {
                failed.push(record.item.name + " proxy | " + (currentFile ? currentFile.fsName : record.source.fsName));
            }
        }

        context.proxyRecords = records.length;
        context.proxyVerified = passed;
        context.proxyFailed = failed;
        return failed;
    }

    function copyProxyForItem(item, resourcesFolder, context, unused) {
            // Compatibility wrapper used by older internal paths. The current
            // organizer collects proxies through stable proxy records.
            var source = boltGetProxyFile(item) || boltGetMissingProxyFile(item);
            if (!source) { return; }
            var previousUse = false;
            try { previousUse = item.useProxy === true; } catch (ignoreProxyState) {}
            boltCollectProxyRecord({
                item:item,
                source:new File(source.fsName),
                sourceKey:sourceKey(source),
                sequence:boltIsProxySequence(item),
                sequenceCount:source.exists && boltIsProxySequence(item) ? detectSequenceFiles(source).length : 0,
                useProxy:previousUse
            }, resourcesFolder, context);
        }

    function updateRenderQueueLocations(renderFolder, context) {
            ensureFolder(renderFolder);
            var used = {}, itemIndex, outputIndex, rqItem, module, current, target, confirmed;
            for (itemIndex = 1; itemIndex <= app.project.renderQueue.numItems; itemIndex++) {
                rqItem = app.project.renderQueue.item(itemIndex);
                try {
                    if (typeof RQItemStatus !== "undefined" && rqItem.status === RQItemStatus.RENDERING) {
                        context.warnings.push("Render Queue item " + itemIndex + " is rendering; its output path was not changed.");
                        continue;
                    }
                } catch (ignoreQueueStatus) {}
    
                for (outputIndex = 1; outputIndex <= rqItem.numOutputModules; outputIndex++) {
                    try {
                        module = rqItem.outputModule(outputIndex);
                        current = module.file;
                        if (!current) { continue; }
                        if (isPathInside(current.fsName, renderFolder.fsName)) {
                            used[normalizePath(current.fsName)] = true;
                            used[renderOutputCollisionKey(current)] = true;
                            continue;
                        }
                        target = uniqueRenderFile(renderFolder, current.name, used);
                        module = boltSetOutputFileVerified(rqItem, outputIndex, target);
                        confirmed = module.file;
                        used[normalizePath(confirmed.fsName)] = true;
                        used[renderOutputCollisionKey(confirmed)] = true;
                        context.renderPathsUpdated++;
                    } catch (error) {
                        context.warnings.push("Render Queue item " + itemIndex + ", output " + outputIndex + ": " + error.message);
                    }
                }
            }
        }

    var BOLT_CORE_PROJECT_FOLDERS = ["01_Comps", "02_Images", "03_Video", "04_Audio", "05_Other"];

    function projectItemIsFolder(item) {
        return item instanceof FolderItem;
    }

    function findTopLevelProjectFolder(name) {
        if (!app.project) { return null; }
        var index, item;
        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            if (item instanceof FolderItem && item.parentFolder === app.project.rootFolder && item.name === name) {
                return item;
            }
        }
        return null;
    }

    function findChildProjectFolder(parentFolder, name) {
        if (!parentFolder) { return null; }
        var index, item;
        try {
            for (index = 1; index <= parentFolder.numItems; index++) {
                item = parentFolder.item(index);
                if (item instanceof FolderItem && item.name === name) { return item; }
            }
        } catch (ignoreChildFolderScan) {}
        return null;
    }

    function ensureTopLevelProjectFolder(name) {
        var folder = findTopLevelProjectFolder(name);
        if (!folder) {
            folder = app.project.items.addFolder(name);
            folder.parentFolder = app.project.rootFolder;
        }
        return folder;
    }

    function ensureChildProjectFolder(parentFolder, name) {
        var folder = findChildProjectFolder(parentFolder, name);
        if (!folder) {
            folder = app.project.items.addFolder(name);
            folder.parentFolder = parentFolder;
        }
        return folder;
    }

    function ensureCoreProjectFolders() {
        var output = {}, index, name;
        for (index = 0; index < BOLT_CORE_PROJECT_FOLDERS.length; index++) {
            name = BOLT_CORE_PROJECT_FOLDERS[index];
            output[name] = ensureTopLevelProjectFolder(name);
        }
        return output;
    }

    function isCoreTopLevelFolder(item) {
        return item instanceof FolderItem && item.parentFolder === app.project.rootFolder &&
            arrayIndexOf(BOLT_CORE_PROJECT_FOLDERS, item.name) >= 0 &&
            findTopLevelProjectFolder(item.name) === item;
    }

    function projectFolderCategory(item) {
        if (item instanceof CompItem) { return "01_Comps"; }
        if (boltIsFootageItem(item)) {
            var file = boltGetFootageFile(item);
            if (file) {
                var category = categoryForFile(file);
                if (category === "Images") { return "02_Images"; }
                if (category === "Video") { return "03_Video"; }
                if (category === "Audio") { return "04_Audio"; }
            }
            return "05_Other";
        }
        return "05_Other";
    }

    function resolveHeroComp() {
        if (state.lockedHeroComp && isItemValid(state.lockedHeroComp) && projectContainsItem(state.lockedHeroComp)) {
            return state.lockedHeroComp;
        }
        var detected = detectMainComp();
        if (detected) { return detected; }
        if (app.project && app.project.activeItem instanceof CompItem) {
            return app.project.activeItem;
        }
        return null;
    }

    function lockHeroComp() {
        var comp = selectedCompFromProject();
        if (!comp && app.project && app.project.activeItem instanceof CompItem) {
            comp = app.project.activeItem;
        }
        if (!comp) { throw new Error("Select or open the main hero composition first."); }
        state.lockedHeroComp = comp;
        updateHeroLabel();
        setStatus("Hero comp locked: " + comp.name, "ok");
        return comp;
    }

    function updateHeroLabel() {
            if (!state.ui || !state.ui.heroLabel) { return; }
            var comp = resolveHeroComp();
            state.ui.heroLabel.text = comp ? comp.name : "Automatic";
            state.ui.heroLabel.helpTip = comp
                ? ("Detected main composition: " + comp.name)
                : "No composition could be detected.";
        }

    function isNamedSceneComp(comp) {
        if (!(comp instanceof CompItem)) { return false; }
        return /^(?:scene|shot|sequence|seq|part|chapter|segment)(?:[\s_\-]*\d+|\b)/i.test(trim(comp.name));
    }

    function isSceneLevelComp(comp, heroComp) {
        if (!(comp instanceof CompItem)) { return false; }
        if (heroComp && comp === heroComp) { return true; }
        return isNamedSceneComp(comp);
    }

    function isBoltLayerExportComp(comp) {
        if (!(comp instanceof CompItem)) { return false; }
        if (/^BOLT_EXPORT__/i.test(comp.name)) { return true; }
        try { return /Bolt isolated layer export/i.test(safeString(comp.comment)); }
        catch (ignoreExportComment) { return false; }
    }

    function organizerFolderForCategory(category, cache) {
        if (!cache[category]) { cache[category] = ensureTopLevelProjectFolder(category); }
        return cache[category];
    }

    function removeEmptyNonCoreProjectFolders(context) {
        var changed = true, index, item, removed = 0;
        while (changed) {
            changed = false;
            for (index = app.project.numItems; index >= 1; index--) {
                item = app.project.item(index);
                if (!(item instanceof FolderItem) || isCoreTopLevelFolder(item)) { continue; }
                try {
                    if (item.numItems === 0) {
                        item.remove();
                        removed++;
                        changed = true;
                    }
                } catch (ignoreEmptyFolderRemove) {}
            }
        }
        context.emptyFoldersRemoved = (context.emptyFoldersRemoved || 0) + removed;
    }

    // Global UI refresher. Cleanup/organize routines live outside buildUI(), so
    // they must never call a buildUI-local function directly.
    function boltRefreshProjectStructureUI() {
        if (!state.ui) { return; }
        var list = state.ui.projectStructureList;
        var status = state.ui.projectStructureStatus;
        if (!list || !status) { return; }

        try { list.removeAll(); } catch (ignoreStructureClear) { return; }
        var names = ["01_Comps", "02_Images", "03_Video", "04_Audio", "05_Other"];
        var index, folder, count, hero = 0, scenes = 0, item;
        for (index = 0; index < names.length; index++) {
            folder = findTopLevelProjectFolder(names[index]);
            count = 0;
            try { count = folder ? folder.numItems : 0; } catch (ignoreFolderCount) { count = 0; }
            try { list.add("item", names[index] + "    " + count); } catch (ignoreStructureAdd) {}
        }
        if (app.project) {
            try {
                for (index = 1; index <= app.project.numItems; index++) {
                    item = app.project.item(index);
                    if (item instanceof CompItem && item.parentFolder === app.project.rootFolder) {
                        if (isNamedSceneComp(item)) { scenes++; }
                        else if (item === resolveHeroComp()) { hero = 1; }
                    }
                }
            } catch (ignoreRootSummary) {}
        }
        try {
            status.text = (hero ? "Hero ready" : "Hero automatic") +
                "  •  " + scenes + " scene comp(s) at root";
        } catch (ignoreStructureStatus) {}
    }

    function organizeProjectPanel(heroComp, context) {
        if (!app.project || !app.project.items || typeof app.project.items.addFolder !== "function") {
            context.warnings.push("Project-panel folder organization is unavailable in this AE version.");
            return;
        }

        var folders = ensureCoreProjectFolders();
        var exportFolder = null;
        var leafItems = [];
        var index, item, current, destination, category;

        // Snapshot every non-folder item first. This allows Bolt to flatten old,
        // nested and duplicate folder structures without mutating during scan.
        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            if (!projectItemIsFolder(item)) { leafItems.push(item); }
        }

        for (index = 0; index < leafItems.length; index++) {
            current = leafItems[index];
            try {
                if (current instanceof CompItem && isSceneLevelComp(current, heroComp)) {
                    if (current.parentFolder !== app.project.rootFolder) {
                        current.parentFolder = app.project.rootFolder;
                        context.projectItemsMoved++;
                    }
                    context.sceneCompsAtRoot++;
                    if (heroComp && current === heroComp) { context.heroCompName = current.name; }
                    continue;
                }

                if (isBoltLayerExportComp(current)) {
                    if (!exportFolder) { exportFolder = ensureChildProjectFolder(folders["01_Comps"], "BOLT Layer Exports"); }
                    destination = exportFolder;
                } else {
                    category = projectFolderCategory(current);
                    destination = organizerFolderForCategory(category, folders);
                }

                if (destination && current.parentFolder !== destination) {
                    current.parentFolder = destination;
                    context.projectItemsMoved++;
                }
            } catch (error) {
                context.warnings.push("Could not organize " + current.name + ": " + error.message);
            }
        }

        // Old 99_Unused, root-level BOLT Layer Exports, duplicate core folders,
        // and any other emptied containers are removed. The fixed five folders
        // are always retained, even when temporarily empty.
        removeEmptyNonCoreProjectFolders(context);
    }

    function boltWriteCollectionReport(
    context,
    folders,
    collectionRecords,
    proxyRecords
) {
    var reportFile = new File(
        folders.project.fsName + "/Bolt Organize Report.txt"
    );

    var hasIssues = !!(
        context.collectionFailed.length ||
        context.proxyFailed.length ||
        context.missing.length ||
        context.autoRelinkUnresolved.length ||
        context.workspaceRootExtras.length ||
        context.warnings.length
    );

    // A successful organization leaves no Bolt-generated folder or report.
    if (!hasIssues) {
        try {
            if (reportFile.exists) { boltRemoveFileReliable(reportFile); }
        } catch (ignoreOldOrganizeReport) {}
        context.collectionReportPath = "";
        return null;
    }

    var lines = [
        "BOLT " + VERSION + " ORGANIZE REPORT",
        "Build: " + BUILD_ID,
        "Workspace: " + folders.root.fsName,
        "Project: " + context.projectTargetPath,
        "Resources: " + folders.resources.fsName,
        "Render: " + folders.render.fsName,
        "",
        "Project files verified: " +
            context.collectionVerified + "/" + context.collectionRecords,
        "Missing Project files skipped: " +
            (context.skippedMissingCollection || 0),
        "Proxies verified: " +
            context.proxyVerified + "/" + context.proxyRecords,
        "Missing proxies skipped: " +
            (context.skippedMissingProxy || 0),
        "Layered PSD/AI migrated: " +
            context.layeredDesignMigrated,
        "Layered PSD/AI protected in place: " +
            context.layeredDesignProtected,
        "Missing files found: " +
            (context.autoRelinked + context.autoProxyRelinked),
        "Missing files unresolved: " +
            context.autoRelinkUnresolved.length,
        "Workspace root clean: " +
            (context.workspaceVerified ? "YES" : "NO"),
        "Render Queue paths updated: " +
            context.renderPathsUpdated,
        ""
    ];

    var index;
    if (context.collectionFailed.length) {
        lines.push("PROJECT FILES NOT COLLECTED");
        for (index = 0; index < context.collectionFailed.length; index++) {
            lines.push(context.collectionFailed[index]);
        }
        lines.push("");
    }
    if (context.proxyFailed.length) {
        lines.push("PROXIES NOT COLLECTED");
        for (index = 0; index < context.proxyFailed.length; index++) {
            lines.push(context.proxyFailed[index]);
        }
        lines.push("");
    }
    if (context.autoRelinkUnresolved.length) {
        lines.push("MISSING FILES NOT FOUND");
        for (index = 0; index < context.autoRelinkUnresolved.length; index++) {
            lines.push(context.autoRelinkUnresolved[index]);
        }
        lines.push("");
    }
    if (context.workspaceRootExtras.length) {
        lines.push("WORKSPACE ROOT REVIEW");
        for (index = 0; index < context.workspaceRootExtras.length; index++) {
            lines.push(context.workspaceRootExtras[index]);
        }
        lines.push("");
    }
    if (context.missing.length) {
        lines.push("MISSING SOURCES");
        for (index = 0; index < context.missing.length; index++) {
            lines.push(context.missing[index]);
        }
        lines.push("");
    }
    if (context.warnings.length) {
        lines.push("WARNINGS");
        for (index = 0; index < context.warnings.length; index++) {
            lines.push(context.warnings[index]);
        }
    }

    try {
        reportFile.encoding = "UTF-8";
        if (!reportFile.open("w")) {
            throw new Error("Could not open report file.");
        }
        reportFile.write(lines.join("\r\n"));
        reportFile.close();
        context.collectionReportPath = reportFile.fsName;
        return reportFile;
    } catch (reportError) {
        try { reportFile.close(); } catch (ignoreCloseReport) {}
        context.collectionReportPath = "";
        return null;
    }
}


    function boltIsProjectFile(file) {
        var extension = getFileExtension(file);
        return /^(aep|aepx|aet)$/i.test(extension);
    }

    function boltIsRenderFolderName(name) {
        return /^(?:render|renders|output|outputs|export|exports|delivery|deliveries|preview|previews)$/i.test(
            trim(name)
        );
    }

    function boltIsAutoSaveFolderName(name) {
        return /after\s*effects.*auto[\s_\-]*save|auto[\s_\-]*save/i.test(
            safeString(name)
        );
    }

    function boltCoreWorkspaceFolder(folder, folders) {
        if (!(folder instanceof Folder)) { return false; }
        var path = normalizePath(folder.fsName);
        return (
            path === normalizePath(folders.project.fsName) ||
            path === normalizePath(folders.render.fsName) ||
            path === normalizePath(folders.resources.fsName)
        );
    }

    function boltCollectFolderFiles(folder, output) {
        if (!folder || !folder.exists) { return output; }
        var entries = [], index, entry;
        try { entries = folder.getFiles(); } catch (ignoreLooseFolderRead) {
            return output;
        }
    
        for (index = 0; index < entries.length; index++) {
            entry = entries[index];
            if (entry instanceof Folder) {
                boltCollectFolderFiles(entry, output);
            } else if (entry instanceof File) {
                output.push(entry);
            }
        }
        return output;
    }

    function boltRemoveEmptyFolderTree(folder) {
        if (!folder || !folder.exists) { return true; }
        var entries = [], index, entry;
        try { entries = folder.getFiles(); } catch (ignoreEmptyTreeRead) {
            return false;
        }
    
        for (index = 0; index < entries.length; index++) {
            entry = entries[index];
            if (entry instanceof Folder) {
                boltRemoveEmptyFolderTree(entry);
            }
        }
    
        try {
            entries = folder.getFiles();
            if (!entries.length) { return folder.remove(); }
        } catch (ignoreEmptyTreeRemove) {}
        return false;
    }

    function boltLooseDestination(file, sourceFolder, folders, referenced) {
        var path = normalizePath(file.fsName);
    
        // Referenced layered PSD/AI sources that Bolt intentionally protected must
        // remain exactly where AE currently resolves them. Moving them on disk
        // without a verified retained-layer migration would break the project.
        if (referenced[path] && boltIsLayeredDesignFile(file)) {
            return null;
        }
    
        if (boltIsProjectFile(file)) {
            if (sourceFolder && boltIsAutoSaveFolderName(sourceFolder.name)) {
                return ensureFolder(
                    new Folder(folders.project.fsName + "/Adobe After Effects Auto-Save")
                );
            }
            return folders.project;
        }
    
        if (referenced[path]) {
            // A still-referenced loose file means the earlier collection pass did
            // not finish. Preserve it rather than move it without relinking.
            return null;
        }
    
        if (sourceFolder && boltIsRenderFolderName(sourceFolder.name)) {
            return folders.render;
        }
    
        return ensureFolder(new Folder(folders.resources.fsName + "/Unused"));
    }

    function boltMoveLooseFile(file, destination, context) {
        if (!file || !file.exists || !destination) { return null; }
        ensureFolder(destination);
    
        var target = new File(destination.fsName + "/" + file.name);
        if (target.exists) {
            if (boltFilesEqualExact(file, target)) {
                if (boltRemoveFileReliable(file)) {
                    context.diskMoves.push({from:file.fsName, to:target.fsName});
                }
                return target;
            }
            target = uniqueFile(destination, file.name);
        }
    
        target = boltMoveFileWithUndo(file, target, context);
        context.workspaceFilesMoved =
            (context.workspaceFilesMoved || 0) + 1;
        return target;
    }

    function boltNormalizeWorkspaceDisk(root, folders, context) {
        var referenced = boltReferencedResourcePaths();
        var entries = [], index, entry, files, fileIndex, destination;
        var coreNames = {project:true, render:true, resources:true};
    
        ensureFolder(folders.project);
        ensureFolder(folders.render);
        ensureFolder(folders.resources);
        ensureFolder(new Folder(folders.resources.fsName + "/Unused"));
    
        try { entries = root.getFiles(); } catch (workspaceReadError) {
            context.warnings.push(
                "Workspace root could not be scanned: " +
                workspaceReadError.message
            );
            return;
        }
    
        for (index = 0; index < entries.length; index++) {
            entry = entries[index];
    
            if (entry instanceof Folder) {
                if (boltCoreWorkspaceFolder(entry, folders)) { continue; }
    
                files = boltCollectFolderFiles(entry, []);
                for (fileIndex = 0; fileIndex < files.length; fileIndex++) {
                    destination = boltLooseDestination(
                        files[fileIndex],
                        entry,
                        folders,
                        referenced
                    );
                    if (!destination) {
                        context.warnings.push(
                            "Referenced file stayed in place because collection was not verified: " +
                            files[fileIndex].fsName
                        );
                        continue;
                    }
                    try {
                        boltMoveLooseFile(
                            files[fileIndex],
                            destination,
                            context
                        );
                    } catch (looseMoveError) {
                        context.warnings.push(
                            "Could not organize " +
                            files[fileIndex].fsName +
                            ": " +
                            looseMoveError.message
                        );
                    }
                }
                boltRemoveEmptyFolderTree(entry);
            } else if (entry instanceof File) {
                destination = boltLooseDestination(
                    entry,
                    null,
                    folders,
                    referenced
                );
                if (!destination) {
                    context.warnings.push(
                        "Referenced file stayed in place because collection was not verified: " +
                        entry.fsName
                    );
                    continue;
                }
                try {
                    boltMoveLooseFile(entry, destination, context);
                } catch (rootFileError) {
                    context.warnings.push(
                        "Could not organize " +
                        entry.fsName +
                        ": " +
                        rootFileError.message
                    );
                }
            }
        }
    
        // Flatten any legacy category folders left inside Resources.
        entries = [];
        try { entries = folders.resources.getFiles(); } catch (ignoreResourcesRead) {}
        for (index = 0; index < entries.length; index++) {
            entry = entries[index];
            if (!(entry instanceof Folder)) { continue; }
            if (entry.name.toLowerCase() === "unused") { continue; }
    
            files = boltCollectFolderFiles(entry, []);
            for (fileIndex = 0; fileIndex < files.length; fileIndex++) {
                if (referenced[normalizePath(files[fileIndex].fsName)]) {
                    context.warnings.push(
                        "Referenced resource stayed in its legacy folder because relinking was not verified: " +
                        files[fileIndex].fsName
                    );
                    continue;
                }
    
                destination = ensureFolder(
                    new Folder(folders.resources.fsName + "/Unused")
                );
    
                try {
                    boltMoveLooseFile(
                        files[fileIndex],
                        destination,
                        context
                    );
                } catch (resourceFlattenError) {
                    context.warnings.push(
                        "Could not flatten " +
                        files[fileIndex].fsName +
                        ": " +
                        resourceFlattenError.message
                    );
                }
            }
            boltRemoveEmptyFolderTree(entry);
        }
    
        context.workspaceRootExtras = [];
        try { entries = root.getFiles(); } catch (ignoreWorkspaceVerifyRead) {
            entries = [];
        }
    
        for (index = 0; index < entries.length; index++) {
            entry = entries[index];
            if (
                entry instanceof Folder &&
                coreNames[entry.name.toLowerCase()]
            ) {
                continue;
            }
            context.workspaceRootExtras.push(entry.fsName);
        }
        context.workspaceVerified =
            context.workspaceRootExtras.length === 0;
    }

    function boltArchiveOriginalProjectFile(
    originalProjectFile,
    projectTarget,
    projectFolder,
    context
) {
    if (
        !originalProjectFile ||
        !originalProjectFile.exists ||
        normalizePath(originalProjectFile.fsName) ===
            normalizePath(projectTarget.fsName)
    ) {
        return;
    }

    try {
        var target = new File(
            projectFolder.fsName + "/" + originalProjectFile.name
        );

        if (
            target.exists &&
            normalizePath(target.fsName) !==
                normalizePath(projectTarget.fsName)
        ) {
            if (boltFilesEqualExact(originalProjectFile, target)) {
                boltRemoveFileReliable(originalProjectFile);
                return;
            }
            target = uniqueFile(projectFolder, originalProjectFile.name);
        } else if (
            normalizePath(target.fsName) ===
            normalizePath(projectTarget.fsName)
        ) {
            target = uniqueFile(
                projectFolder,
                splitFileName(originalProjectFile.name).stem +
                    "_original" +
                    splitFileName(originalProjectFile.name).extension
            );
        }

        boltMoveFileWithUndo(originalProjectFile, target, context);
    } catch (archiveProjectError) {
        context.warnings.push(
            "Original AEP could not be placed in Project: " +
            archiveProjectError.message
        );
    }
}

    function organizeProject() {
        if (!app.project) {
            throw new Error("No After Effects project is open.");
        }
    
        analyzeProject();
    
        var originalProjectFile = app.project.file
            ? new File(app.project.file.fsName)
            : null;
    
        var root = chooseWorkspaceRoot();
        if (!root) {
            setStatus("Collection cancelled.", "warning");
            return;
        }
    
        ensureFolder(root);
        var folders = getWorkspaceFolders(root);
        ensureFolder(new Folder(folders.resources.fsName + "/Unused"));
    
        var heroComp = resolveHeroComp();
        var baseName = getProjectBaseName();
    
        if (!app.project.file) {
            var entered = prompt(
                "Enter the project name:",
                baseName,
                SCRIPT_NAME
            );
            if (entered === null) { return; }
            baseName = sanitizeName(entered);
        }
    
        var projectTarget =
            app.project.file &&
            isPathInside(app.project.file.fsName, folders.project.fsName)
                ? app.project.file
                : nextVersionFile(
                    folders.project,
                    baseName,
                    ".aep",
                    1,
                    2
                );
    
        setProgress(3, "Creating project workspace");
        app.project.save(projectTarget);
    
        var context = {
            sourceMap:{},
            proxySourceMap:{},
            resourceIndex:boltBuildResourceIndex(folders.resources),
            resourcesFolder:folders.resources,
            workspaceRoot:root,
            projectFolder:folders.project,
            renderFolder:folders.render,
            copied:0,
            relinked:0,
            sequences:0,
            alreadyOrganized:0,
            proxiesRelinked:0,
            removedUnused:0,
            removedFolders:0,
            renderPathsUpdated:0,
            projectItemsMoved:0,
            emptyFoldersRemoved:0,
            sceneCompsAtRoot:0,
            heroCompName:heroComp ? heroComp.name : "",
            skippedUnused:0,
            missing:[],
            warnings:[],
            useSubfolders:false,
            collectMedia:true,
            organizeResources:true,
            archiveUnused:true,
            removeUnusedItems:false,
            unusedItemsToRemove:[],
            expressionProtectedUnused:0,
            projectTargetPath:projectTarget.fsName,
            collectionReportPath:"",
            deduplicated:0,
            archivedDuplicates:0,
            duplicateSourceFiles:{},
            archivedUnused:0,
            resourceFoldersRemoved:0,
            diskMoves:[],
            copiedFiles:[],
            collectionRecords:0,
            collectionVerified:0,
            collectionFailed:[],
            proxyRecords:0,
            proxyVerified:0,
            proxyFailed:[],
            autoRelinkMissing:0,
            autoRelinked:0,
            autoProxyRelinked:0,
            autoRelinkUnresolved:[],
            workspaceFilesMoved:0,
            workspaceVerified:false,
            workspaceRootExtras:[],
            layeredDesignItemIds:{},
            layeredDesignMigrationActive:false,
            layeredDesignMigrated:0,
            layeredDesignProtected:0,
            protectedLayeredPaths:{}
        };
    
        setProgress(6, "Checking missing project files");
        boltAutoRelinkMissingFiles(root, context, false);
    
        // The original loose AEP is archived after AE is safely working from the
        // new Project copy.
        boltArchiveOriginalProjectFile(
            originalProjectFile,
            projectTarget,
            folders.project,
            context
        );
    
        var dependencyUsage = boltBuildFootageDependencyMap();
        var collectionRecords = boltBuildCollectionRecords(dependencyUsage);
        var layeredDesignGroups = boltBuildLayeredDesignGroups(collectionRecords);
        var proxyRecords = [];
        var index, record, layeredIndex;
    
        context.layeredDesignItemIds = {};
        for (layeredIndex = 0; layeredIndex < layeredDesignGroups.length; layeredIndex++) {
            for (index = 0; index < layeredDesignGroups[layeredIndex].records.length; index++) {
                context.layeredDesignItemIds[
                    boltProjectItemKey(layeredDesignGroups[layeredIndex].records[index].item)
                ] = true;
            }
        }
    
        context.usedDependencies = 0;
        for (index = 0; index < collectionRecords.length; index++) {
            if (collectionRecords[index].used) {
                context.usedDependencies++;
            }
        }
    
        app.beginUndoGroup("Bolt Collect and Organize");
        try {
            setProgress(14, "Protecting retained-layer PSD / AI files");
    
            for (layeredIndex = 0; layeredIndex < layeredDesignGroups.length; layeredIndex++) {
                boltCollectLayeredDesignGroup(
                    layeredDesignGroups[layeredIndex],
                    folders.resources,
                    context
                );
            }
    
            setProgress(20, "Collecting all Project files");
            for (index = 0; index < collectionRecords.length; index++) {
                record = collectionRecords[index];
                if (record.layeredDesignKey) { continue; }
    
                collectFootage(
                    record.item,
                    folders.resources,
                    context,
                    false,
                    record.source
                );
    
                if ((index + 1) % 8 === 0) {
                    setProgress(
                        20 +
                        Math.round(
                            ((index + 1) /
                                Math.max(1, collectionRecords.length)) *
                            26
                        ),
                        "Collecting " +
                            (index + 1) +
                            "/" +
                            collectionRecords.length
                    );
                }
            }
    
            // Build proxy records after layered PSD migration, because the old
            // retained-layer FootageItems may have been replaced by new items.
            proxyRecords = boltBuildProxyRecords();
    
            setProgress(48, "Collecting Project proxies");
            for (index = 0; index < proxyRecords.length; index++) {
                boltCollectProxyRecord(
                    proxyRecords[index],
                    folders.resources,
                    context
                );
            }
    
            boltRequireCompleteCollection(
                collectionRecords,
                proxyRecords,
                folders,
                context
            );
            archiveExactDuplicateSources(context);
    
            setProgress(62, "Organizing Project panel");
            organizeProjectPanel(heroComp, context);
    
            setProgress(72, "Separating loose unused files");
            boltArchiveLooseResourceFiles(
                folders.resources,
                collectionRecords,
                proxyRecords,
                context
            );
    
            setProgress(80, "Cleaning project workspace");
            boltNormalizeWorkspaceDisk(
                root,
                folders,
                context
            );
    
            var unusedResourcesFolder = ensureFolder(
                new Folder(folders.resources.fsName + "/Unused")
            );
            boltRemoveEmptyResourceFolders(
                folders.resources,
                folders.resources,
                unusedResourcesFolder,
                context
            );
    
            setProgress(88, "Verifying collected files");
            boltRequireCompleteCollection(
                collectionRecords,
                proxyRecords,
                folders,
                context
            );
    
            setProgress(92, "Final workspace verification");
            boltNormalizeWorkspaceDisk(root, folders, context);
            boltRequireCompleteCollection(
                collectionRecords,
                proxyRecords,
                folders,
                context
            );
    
            setProgress(96, "Repairing Render Queue paths");
            updateRenderQueueLocations(
                folders.render,
                context
            );
        } catch (organizeError) {
            context.warnings.push(
                "ORGANIZE STOPPED: " +
                organizeError.message
            );
    
            try {
                boltWriteCollectionReport(
                    context,
                    folders,
                    collectionRecords,
                    proxyRecords
                );
            } catch (ignoreFailureReport) {}
    
            throw organizeError;
        } finally {
            app.endUndoGroup();
        }
    
        app.project.save(projectTarget);
        boltWriteCollectionReport(
            context,
            folders,
            collectionRecords,
            proxyRecords
        );
    
        updateAutomaticPaths();
        updateHeroLabel();
        setProgress(100, "Organization complete");
    
        var failedCount =
            context.collectionFailed.length +
            context.proxyFailed.length +
            context.missing.length +
            context.autoRelinkUnresolved.length +
            context.workspaceRootExtras.length;
    
        setStatus(
            "Verified " +
            context.collectionVerified +
            "/" +
            context.collectionRecords +
            " files • proxies " +
            context.proxyVerified +
            "/" +
            context.proxyRecords +
            " • found " +
            (context.autoRelinked + context.autoProxyRelinked) +
            " missing • layered " +
            context.layeredDesignMigrated +
            " • moved " +
            context.workspaceFilesMoved +
            " loose • skipped " +
            ((context.skippedMissingCollection || 0) + (context.skippedMissingProxy || 0)) +
            " offline • queue " +
            context.renderPathsUpdated +
            (context.workspaceVerified
                ? " • root clean"
                : " • root review") +
            (failedCount ? " • review " + failedCount : ""),
            failedCount || context.warnings.length
                ? "warning"
                : "ok"
        );
    }


    function getMissingFootagePath(item) {
            var missing = boltGetMissingFootageFile(item);
            return missing ? safeString(missing.fsName) : "";
        }

    function scanFilesRecursive(folder, depth, maxDepth, result, nameMap) {
        if (!folder || !folder.exists || depth > maxDepth) {
            return;
        }
        var entries;
        try {
            entries = folder.getFiles();
        } catch (error) {
            return;
        }
        var index;
        for (index = 0; index < entries.length; index++) {
            var entry = entries[index];
            if (entry instanceof Folder) {
                if (entry.name.charAt(0) !== ".") {
                    scanFilesRecursive(entry, depth + 1, maxDepth, result, nameMap);
                }
            } else if (entry instanceof File) {
                result.push(entry);
                var key = entry.name.toLowerCase();
                if (!nameMap[key]) {
                    nameMap[key] = [];
                }
                nameMap[key].push(entry);
            }
        }
    }

    function pathParts(pathValue) {
        return normalizePath(pathValue).split("/");
    }

    function candidateScore(candidate, missingPath) {
        var candidateParts = pathParts(candidate.parent.fsName);
        var missingParts = pathParts(new File(missingPath).parent.fsName);
        var score = 0;
        var i = candidateParts.length - 1;
        var j = missingParts.length - 1;
        while (i >= 0 && j >= 0 && candidateParts[i] === missingParts[j]) {
            score += 10;
            i--;
            j--;
        }
        if (normalizePath(candidate.fsName) === normalizePath(missingPath)) {
            score += 1000;
        }
        return score;
    }

    function chooseBestCandidate(candidates, missingPath) {
        if (!candidates || !candidates.length) {
            return {file:null, ambiguous:false, score:0, tied:[]};
        }
        if (candidates.length === 1) {
            return {file:candidates[0], ambiguous:false, score:candidateScore(candidates[0], missingPath), tied:[candidates[0]]};
        }
        var best = candidates[0];
        var bestScore = candidateScore(best, missingPath);
        var tied = [best];
        var index;
        for (index = 1; index < candidates.length; index++) {
            var score = candidateScore(candidates[index], missingPath);
            if (score > bestScore) {
                best = candidates[index];
                bestScore = score;
                tied = [candidates[index]];
            } else if (score === bestScore) {
                tied.push(candidates[index]);
            }
        }
        return {file:tied.length === 1 ? best : null, ambiguous:tied.length > 1, score:bestScore, tied:tied};
    }


    function boltCollectMissingRelinkRecords() {
        var records = [], index, item, missing, previousUseProxy;
    
        if (!app.project) { return records; }
    
        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
    
            if (boltIsFootageItem(item)) {
                missing = boltGetMissingFootageFile(item);
                if (missing) {
                    records.push({
                        item:item,
                        proxy:false,
                        missing:new File(missing.fsName),
                        name:new File(missing.fsName).name,
                        sequence:isSequenceFootage(item)
                    });
                }
            }
    
            if (boltIsAVItemWithProxy(item)) {
                missing = boltGetMissingProxyFile(item);
                if (missing) {
                    try {
                        previousUseProxy = item.useProxy === true;
                    } catch (ignoreMissingProxyUse) {
                        previousUseProxy = false;
                    }
    
                    records.push({
                        item:item,
                        proxy:true,
                        missing:new File(missing.fsName),
                        name:new File(missing.fsName).name,
                        sequence:boltIsProxySequence(item),
                        useProxy:previousUseProxy
                    });
                }
            }
        }
        return records;
    }

    function boltAddRelinkCandidate(nameMap, file) {
        if (!file || !file.exists) { return; }
        var key = file.name.toLowerCase();
        if (!nameMap[key]) { nameMap[key] = []; }
    
        var index;
        for (index = 0; index < nameMap[key].length; index++) {
            if (
                normalizePath(nameMap[key][index].fsName) ===
                normalizePath(file.fsName)
            ) {
                return;
            }
        }
        nameMap[key].push(file);
    }

    function boltScanRelinkFolder(
    folder,
    depth,
    maxDepth,
    wantedNames,
    nameMap
) {
    if (!folder || !folder.exists || depth > maxDepth) { return; }

    var entries = [], index, entry, key;
    try { entries = folder.getFiles(); } catch (ignoreRelinkFolderRead) {
        return;
    }

    for (index = 0; index < entries.length; index++) {
        entry = entries[index];

        if (entry instanceof Folder) {
            if (entry.name.charAt(0) === ".") { continue; }
            boltScanRelinkFolder(
                entry,
                depth + 1,
                maxDepth,
                wantedNames,
                nameMap
            );
        } else if (entry instanceof File) {
            key = entry.name.toLowerCase();
            if (wantedNames[key]) {
                boltAddRelinkCandidate(nameMap, entry);
            }
        }
    }
}

    function boltWriteUtf8Lines(file, lines) {
        try {
            file.encoding = "UTF-8";
            if (!file.open("w")) { return false; }
            file.write("\uFEFF" + lines.join("\r\n"));
            file.close();
            return true;
        } catch (writeLinesError) {
            try { file.close(); } catch (ignoreWriteLinesClose) {}
            return false;
        }
    }

    function boltPowerShellFullComputerMatches(
    records,
    workspaceRoot,
    nameMap,
    context
) {
    if (
        !records.length ||
        $.os.toLowerCase().indexOf("windows") === -1
    ) {
        return;
    }

    var uniqueNames = {}, names = [], index, name, key;
    for (index = 0; index < records.length; index++) {
        name = trim(records[index].name);
        key = name.toLowerCase();
        if (!name.length || uniqueNames[key]) { continue; }
        uniqueNames[key] = true;
        names.push(name);
    }
    if (!names.length) { return; }

    var stamp = timestampText() + "_" +
        Math.floor(Math.random() * 100000);
    var namesFile = new File(
        Folder.temp.fsName + "/bolt_relink_names_" + stamp + ".txt"
    );
    var outputFile = new File(
        Folder.temp.fsName + "/bolt_relink_results_" + stamp + ".txt"
    );
    var scriptFile = new File(
        Folder.temp.fsName + "/bolt_relink_scan_" + stamp + ".ps1"
    );

    if (!boltWriteUtf8Lines(namesFile, names)) {
        context.warnings.push(
            "Could not create the missing-file search list."
        );
        return;
    }

    var script = "";
    script += "$ErrorActionPreference='SilentlyContinue'\r\n";
    script += "$namesFile=" + psSingleQuote(namesFile.fsName) + "\r\n";
    script += "$outFile=" + psSingleQuote(outputFile.fsName) + "\r\n";
    script += "$workspace=" +
        psSingleQuote(workspaceRoot ? workspaceRoot.fsName : "") +
        "\r\n";
    script += "$enc=New-Object System.Text.UTF8Encoding($false)\r\n";
    script += "$names=@(Get-Content -LiteralPath $namesFile | ForEach-Object {$_.Trim()} | Where-Object {$_})\r\n";
    script += "$roots=New-Object System.Collections.Generic.List[string]\r\n";
    script += "$seenRoots=New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)\r\n";
    script += "function Add-Root([string]$p){if([string]::IsNullOrWhiteSpace($p)){return};try{$resolved=(Resolve-Path -LiteralPath $p -ErrorAction Stop).Path;if($seenRoots.Add($resolved)){[void]$roots.Add($resolved)}}catch{}}\r\n";
    script += "Add-Root $workspace\r\n";
    script += "Add-Root $env:USERPROFILE\r\n";
    script += "$systemDrive=[System.IO.Path]::GetPathRoot($env:SystemRoot).TrimEnd('\\')\r\n";
    script += "try{$disks=Get-CimInstance Win32_LogicalDisk | Where-Object {$_.DriveType -eq 2 -or $_.DriveType -eq 3}}catch{$disks=@()}\r\n";
    script += "if(-not $disks -or $disks.Count -eq 0){try{$disks=Get-PSDrive -PSProvider FileSystem | ForEach-Object {[pscustomobject]@{DeviceID=$_.Root.TrimEnd('\\');DriveType=3}}}catch{$disks=@()}}\r\n";
    script += "$skipSystem=@('Windows','Program Files','Program Files (x86)','ProgramData','$Recycle.Bin','System Volume Information','Recovery','PerfLogs')\r\n";
    script += "foreach($disk in $disks){$root=$disk.DeviceID+'\\';if($disk.DeviceID -ieq $systemDrive){Add-Root ($disk.DeviceID+'\\Users');try{foreach($dir in (Get-ChildItem -LiteralPath $root -Directory -Force -ErrorAction SilentlyContinue)){if($skipSystem -notcontains $dir.Name){Add-Root $dir.FullName}}}catch{}}else{Add-Root $root}}\r\n";
    script += "$results=New-Object System.Collections.Generic.List[string]\r\n";
    script += "$seen=New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)\r\n";
    script += "foreach($root in $roots){foreach($name in $names){$count=0;try{$matches=Get-ChildItem -LiteralPath $root -Filter $name -File -Recurse -Force -ErrorAction SilentlyContinue;foreach($match in $matches){$line=$name+\"`t\"+$match.FullName;if($seen.Add($line)){[void]$results.Add($line);$count++;if($count -ge 120){break}}}}catch{}}}\r\n";
    script += "try{[System.IO.File]::WriteAllLines($outFile,$results,$enc)}catch{}\r\n";

    try {
        scriptFile.encoding = "UTF-8";
        if (!scriptFile.open("w")) {
            throw new Error("Could not create the computer scan script.");
        }
        scriptFile.write("\uFEFF" + script);
        scriptFile.close();

        var ps = windowsPowerShellExecutable();
        var command = '"' + ps +
            '" -NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "' +
            scriptFile.fsName + '"';

        system.callSystem(command);
    } catch (scanError) {
        try { scriptFile.close(); } catch (ignoreScanScriptClose) {}
        context.warnings.push(
            "Computer relink scan failed: " + scanError.message
        );
    }

    var output = readUtf8TextFile(outputFile).replace(/\r/g, "\n");
    var lines = output.split(/\n+/), line, tab, candidate;

    for (index = 0; index < lines.length; index++) {
        line = trim(lines[index]);
        if (!line.length) { continue; }
        tab = line.indexOf("\t");
        if (tab < 1) { continue; }

        candidate = new File(line.substring(tab + 1));
        if (candidate.exists) {
            boltAddRelinkCandidate(nameMap, candidate);
        }
    }

    try { if (namesFile.exists) { namesFile.remove(); } } catch (ignoreNamesRemove) {}
    try { if (outputFile.exists) { outputFile.remove(); } } catch (ignoreResultsRemove) {}
    try { if (scriptFile.exists) { scriptFile.remove(); } } catch (ignoreScriptRemove) {}
}

    function boltAutomaticCandidateScore(
    candidate,
    missingPath,
    workspaceRoot
) {
    var score = candidateScore(candidate, missingPath);

    if (
        workspaceRoot &&
        isPathInside(candidate.fsName, workspaceRoot.fsName)
    ) {
        score += 500;
    }

    if (/\/resources(?:\/|$)/i.test(normalizePath(candidate.fsName))) {
        score += 120;
    }

    try {
        var missingDrive = safeString(
            new File(missingPath).fsName
        ).substring(0, 2).toLowerCase();
        var candidateDrive = safeString(
            candidate.fsName
        ).substring(0, 2).toLowerCase();

        if (
            missingDrive.length === 2 &&
            missingDrive === candidateDrive
        ) {
            score += 25;
        }
    } catch (ignoreDriveScore) {}

    return score;
}

    function boltChooseAutomaticRelinkCandidate(
    candidates,
    missingPath,
    workspaceRoot
) {
    if (!candidates || !candidates.length) { return null; }

    var best = null, bestScore = -999999;
    var index, candidate, score, bestPath, candidatePath;

    for (index = 0; index < candidates.length; index++) {
        candidate = candidates[index];
        if (!candidate || !candidate.exists) { continue; }

        score = boltAutomaticCandidateScore(
            candidate,
            missingPath,
            workspaceRoot
        );

        if (!best || score > bestScore) {
            best = candidate;
            bestScore = score;
            continue;
        }

        if (score === bestScore) {
            bestPath = normalizePath(best.fsName);
            candidatePath = normalizePath(candidate.fsName);

            if (
                candidatePath.length < bestPath.length ||
                (
                    candidatePath.length === bestPath.length &&
                    candidatePath < bestPath
                )
            ) {
                best = candidate;
            }
        }
    }
    return best;
}

    function boltApplyRelinkRecord(record, selected, context) {
        if (record.proxy) {
            if (
                record.sequence &&
                typeof record.item.setProxyWithSequence === "function"
            ) {
                record.item.setProxyWithSequence(selected, false);
            } else if (typeof record.item.setProxy === "function") {
                record.item.setProxy(selected);
            } else {
                throw new Error("The proxy cannot be replaced.");
            }
    
            try {
                record.item.useProxy = record.useProxy;
            } catch (ignoreAutoProxyState) {}
            context.autoProxyRelinked++;
        } else {
            if (record.sequence) {
                record.item.replaceWithSequence(selected, false);
            } else {
                record.item.replace(selected);
            }
            context.autoRelinked++;
        }
    }

    function boltAutoRelinkMissingFiles(workspaceRoot, context, allowFullComputerScan) {
        var records = boltCollectMissingRelinkRecords();
        context.autoRelinkMissing = records.length;
        if (!records.length) { return; }
    
        var layeredMissingGroups = boltBuildLayeredMissingGroups(records);
        var wantedNames = {}, nameMap = {};
        var index, key, candidate, record, group, groupIndex, memberIndex;
        var processedLayeredGroups = {};
    
        for (index = 0; index < records.length; index++) {
            key = records[index].name.toLowerCase();
            if (key.length) { wantedNames[key] = true; }
        }
    
        // Search the current workspace immediately, then search user data and
        // every local/removable drive only for the exact missing filenames.
        setProgress(7, "Searching workspace for missing files");
        boltScanRelinkFolder(
            workspaceRoot,
            0,
            50,
            wantedNames,
            nameMap
        );
    
        var extraPath = state.ui && state.ui.relinkPath
            ? trim(state.ui.relinkPath.text)
            : "";
        var extraRoot = extraPath.length
            ? new Folder(extraPath)
            : null;
        var extraDepth = state.ui && state.ui.relinkDepth
            ? clampNumber(state.ui.relinkDepth.text, 1, 50, 10)
            : 10;
    
        if (
            extraRoot &&
            extraRoot.exists &&
            (
                !workspaceRoot ||
                normalizePath(extraRoot.fsName) !==
                    normalizePath(workspaceRoot.fsName)
            )
        ) {
            boltScanRelinkFolder(
                extraRoot,
                0,
                extraDepth,
                wantedNames,
                nameMap
            );
        }
    
        var unresolved = [];
        for (index = 0; index < records.length; index++) {
            key = records[index].name.toLowerCase();
            if (!nameMap[key] || !nameMap[key].length) {
                unresolved.push(records[index]);
            }
        }
    
        // Organize stays responsive when footage is missing. It only searches
        // the workspace and the configured relink folder. The slower full-computer
        // scan is reserved for the explicit RELINK command.
        if (unresolved.length && allowFullComputerScan === true) {
            setProgress(
                9,
                "Searching computer for " +
                unresolved.length +
                " missing file(s)"
            );
            boltPowerShellFullComputerMatches(
                unresolved,
                workspaceRoot,
                nameMap,
                context
            );
        } else if (unresolved.length) {
            setProgress(
                9,
                unresolved.length + " missing file(s) will be skipped"
            );
        }
    
        app.beginUndoGroup("Bolt Relink Missing Files");
        try {
            for (index = 0; index < records.length; index++) {
                record = records[index];
    
                if (record.layeredMissingGroup) {
                    group = record.layeredMissingGroup;
                    if (processedLayeredGroups[group.key]) { continue; }
                    processedLayeredGroups[group.key] = true;
    
                    key = record.name.toLowerCase();
                    candidate = boltChooseAutomaticRelinkCandidate(
                        nameMap[key] || [],
                        record.missing.fsName,
                        workspaceRoot
                    );
    
                    if (!candidate) {
                        for (memberIndex = 0; memberIndex < group.records.length; memberIndex++) {
                            context.autoRelinkUnresolved.push(
                                group.records[memberIndex].item.name +
                                " | " +
                                group.records[memberIndex].source.fsName
                            );
                        }
                        continue;
                    }
    
                    if (boltMigrateLayeredDesignGroup(group, candidate, context)) {
                        context.autoRelinked += group.records.length;
                    } else {
                        for (memberIndex = 0; memberIndex < group.records.length; memberIndex++) {
                            context.autoRelinkUnresolved.push(
                                group.records[memberIndex].item.name +
                                " | retained-layer PSD relink was preserved"
                            );
                        }
                    }
                    continue;
                }
    
                key = record.name.toLowerCase();
                candidate = boltChooseAutomaticRelinkCandidate(
                    nameMap[key] || [],
                    record.missing.fsName,
                    workspaceRoot
                );
    
                if (!candidate) {
                    context.autoRelinkUnresolved.push(
                        record.item.name +
                        " | " +
                        record.missing.fsName
                    );
                    continue;
                }
    
                try {
                    boltApplyRelinkRecord(record, candidate, context);
                } catch (autoRelinkError) {
                    context.autoRelinkUnresolved.push(
                        record.item.name +
                        " | " +
                        autoRelinkError.message
                    );
                }
            }
        } finally {
            app.endUndoGroup();
        }
    }

    function relinkMissingFiles() {
        if (!app.project) {
            throw new Error("No After Effects project is open.");
        }
    
        var root = getWorkspaceRoot();
        if (!root) {
            var searchPath = state.ui
                ? trim(state.ui.relinkPath.text)
                : "";
            root = searchPath.length
                ? new Folder(searchPath)
                : Folder.selectDialog(
                    "Choose the project folder before searching the computer."
                );
        }
    
        if (!root || !root.exists) {
            throw new Error("Choose a valid project folder.");
        }
    
        var context = {
            warnings:[],
            autoRelinkMissing:0,
            autoRelinked:0,
            autoProxyRelinked:0,
            autoRelinkUnresolved:[],
            sourceMap:{},
            layeredDesignItemIds:{},
            layeredDesignMigrationActive:false,
            layeredDesignMigrated:0,
            layeredDesignProtected:0
        };
    
        setProgress(4, "Checking missing project files");
        boltAutoRelinkMissingFiles(root, context, true);
        setProgress(100, "Relink complete");
    
        if (!context.autoRelinkMissing) {
            setStatus("No missing project files.", "ok");
            return;
        }
    
        setStatus(
            context.autoRelinkMissing +
            " missing • " +
            (context.autoRelinked + context.autoProxyRelinked) +
            " relinked • " +
            context.autoRelinkUnresolved.length +
            " unresolved",
            context.autoRelinkUnresolved.length ||
            context.warnings.length
                ? "warning"
                : "ok"
        );
    
        if (
            state.ui &&
            state.ui.statusLabel &&
            context.autoRelinkUnresolved.length
        ) {
            state.ui.statusLabel.helpTip =
                "Unresolved:\n\n" +
                context.autoRelinkUnresolved.join("\n");
        }
    }

    function isItemValid(item) {
        if (!item) { return false; }
        try { return item.id > 0; } catch (ignoreValid) { return false; }
    }

    function projectContainsItem(target) {
        if (!target || !app.project) {
            return false;
        }
        var index;
        for (index = 1; index <= app.project.numItems; index++) {
            if (app.project.item(index) === target) {
                return true;
            }
        }
        return false;
    }

    function selectedCompFromProject() {
        var selected = app.project ? app.project.selection : [];
        var index;
        for (index = 0; index < selected.length; index++) {
            if (selected[index] instanceof CompItem) {
                return selected[index];
            }
        }
        return null;
    }

    function boltCompLayerStats(comp) {
            var result = {nested:0, scenes:0, footage:0, text:0, enabled:0};
            var index, layer, source;
            if (!(comp instanceof CompItem)) { return result; }
            for (index = 1; index <= comp.numLayers; index++) {
                try {
                    layer = comp.layer(index);
                    if (layer.enabled !== false) { result.enabled++; }
                    source = layer.source;
                    if (source instanceof CompItem) {
                        result.nested++;
                        if (isNamedSceneComp(source)) { result.scenes++; }
                    } else if (boltIsFootageItem(source)) {
                        result.footage++;
                    }
                    if (layer.property("ADBE Text Properties")) { result.text++; }
                } catch (ignoreCompLayerStats) {}
            }
            return result;
        }

    function boltMainCompScore(comp, activeComp, selectedComp) {
        if (!(comp instanceof CompItem) || isBoltLayerExportComp(comp)) { return -999999; }

        var name = safeString(comp.name);
        var lower = name.toLowerCase();
        var useCount = compUseCount(comp);
        var duration = Math.max(0, Number(comp.duration) || 0);
        var layerCount = Math.max(0, Number(comp.numLayers) || 0);
        var stats = boltCompLayerStats(comp);
        var score = 0;

        try { if (comp.parentFolder === app.project.rootFolder) { score += 75; } } catch (ignoreMainRoot) {}
        score += useCount === 0 ? 190 : Math.max(-120, 45 - useCount * 35);
        score += Math.min(150, duration * 2.2);
        score += Math.min(90, layerCount * 1.6);
        score += Math.min(90, stats.nested * 14);
        score += Math.min(220, stats.scenes * 48);
        score += Math.min(35, stats.text * 2);
        score += Math.min(35, stats.footage * 1.5);

        try {
            var pixels = Math.max(1, Number(comp.width) * Number(comp.height));
            if (pixels >= 1920 * 1080) { score += 28; }
            else if (pixels >= 1280 * 720) { score += 18; }
        } catch (ignoreMainPixels) {}

        if (/(?:^|[ _#\-])(main|master|hero|final|output|render|edit|film|ovc|full|delivery)(?:$|[ _\-])/i.test(name)) { score += 245; }
        if (/^#/.test(name)) { score += 22; }
        if (/(?:^|[ _\-])v\d+(?:$|[ _\-])/i.test(name)) { score += 16; }
        if (/(?:^|[ _\-])comp(?:osition)?[ _\-]*1(?:$|[ _\-])/i.test(name)) { score += 18; }

        if (isNamedSceneComp(comp)) { score -= 390; }
        if (/(?:^|[ _\-])(scene|shot|sequence|seq|part|chapter|segment)[ _\-]*\d+/i.test(name)) { score -= 220; }
        if (/(?:^|[ _\-])(precomp|pre-comp|preview|test|temp|old|backup|copy)(?:$|[ _\-])/i.test(name)) { score -= 105; }
        if (/^BOLT_/i.test(name)) { score -= 500; }

        if (selectedComp === comp && !isNamedSceneComp(comp)) { score += 95; }
        if (activeComp === comp && !isNamedSceneComp(comp)) { score += 55; }

        return score;
    }

    function detectMainComp() {
        if (!app.project) { return null; }

        var activeComp = app.project.activeItem instanceof CompItem ? app.project.activeItem : null;
        var selectedComp = selectedCompFromProject();
        var best = null;
        var bestScore = -999999;
        var index, item, score;

        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            if (!(item instanceof CompItem)) { continue; }
            score = boltMainCompScore(item, activeComp, selectedComp);
            if (score > bestScore) {
                bestScore = score;
                best = item;
            }
        }

        if (best) { return best; }
        if (selectedComp) { return selectedComp; }
        return activeComp;
    }

    function resolveAvailableComp(preferLocked) {
            if (!app.project) { return null; }
    
            if (preferLocked && state.lockedRenderComp && isItemValid(state.lockedRenderComp) && projectContainsItem(state.lockedRenderComp)) {
                return state.lockedRenderComp;
            }
    
            var selected = selectedCompFromProject();
            var active = app.project.activeItem instanceof CompItem ? app.project.activeItem : null;
    
            // The Use button intentionally follows the user's current selection/viewer.
            if (!preferLocked) {
                if (selected) { return selected; }
                if (active) { return active; }
            }
    
            // Automatic mode uses the project-wide main-comp score, so an open Scene 6
            // does not replace the actual master composition.
            return detectMainComp() || selected || active;
        }

    function getDuplicateSourceComp() {
        var comp = selectedCompFromProject();
        if (!comp && app.project && app.project.activeItem instanceof CompItem) {
            comp = app.project.activeItem;
        }
        if (!comp) {
            throw new Error("Select or open the composition to duplicate.");
        }
        return comp;
    }

    function projectItemNameExists(name, ignoredItem) {
        var index;
        for (index = 1; index <= app.project.numItems; index++) {
            var item = app.project.item(index);
            if (item !== ignoredItem && item.name === name) {
                return true;
            }
        }
        return false;
    }

    function parseCompNumbering(name) {
        var text = safeString(name);
        var versionMatch = text.match(/^(.*?)([_\- ]v)(\d+)$/i);
        if (versionMatch) {
            return {
                prefix: versionMatch[1] + versionMatch[2],
                number: parseInt(versionMatch[3], 10),
                digits: versionMatch[3].length,
                style: "version"
            };
        }
        var plainMatch = text.match(/^(.*?)(\d+)$/);
        if (plainMatch) {
            return {
                prefix: plainMatch[1],
                number: parseInt(plainMatch[2], 10),
                digits: plainMatch[2].length,
                style: "plain"
            };
        }
        return { prefix: text + "_v", number: 0, digits: 1, style: "version" };
    }

    function nextDuplicateNames(compName, copies) {
        var plan = parseCompNumbering(compName);
        var output = [];
        var number = plan.number + 1;
        while (output.length < copies) {
            var candidate = plan.prefix + padNumber(number, plan.digits);
            if (!projectItemNameExists(candidate, null)) {
                output.push(candidate);
            }
            number++;
        }
        return output;
    }

    function updateDuplicatePreview() {
        if (!state.ui || !state.ui.copyPreview) {
            return;
        }
        var comp = null;
        try { comp = getDuplicateSourceComp(); } catch (ignore) {}
        if (!comp) {
            state.ui.copySource.text = "Comp: none selected";
            state.ui.copyPreview.text = "Select or open a comp.";
            return;
        }
        var copies = Math.round(clampNumber(state.ui.copyCount.text, 1, 999, 1));
        var names = nextDuplicateNames(comp.name, copies);
        state.ui.copySource.text = "Comp: " + comp.name;
        state.ui.copyPreview.text = names.length > 1
            ? "Creates " + names[0] + " to " + names[names.length - 1]
            : "Creates " + names[0];
    }

    function duplicateSelectedComp() {
        if (!app.project) {
            throw new Error("No After Effects project is open.");
        }
        var comp = getDuplicateSourceComp();
        var copies = Math.round(clampNumber(state.ui.copyCount.text, 1, 999, 1));
        var names = nextDuplicateNames(comp.name, copies);
        var duplicates = [];
        app.beginUndoGroup("Duplicate Selected Comp");
        try {
            var index;
            for (index = 0; index < names.length; index++) {
                var duplicate = comp.duplicate();
                duplicate.parentFolder = comp.parentFolder;
                duplicate.name = names[index];
                duplicates.push(duplicate);
            }
            var selection = app.project.selection;
            for (index = 0; index < selection.length; index++) {
                try { selection[index].selected = false; } catch (ignore) {}
            }
            for (index = 0; index < duplicates.length; index++) {
                duplicates[index].selected = true;
            }
        } finally {
            app.endUndoGroup();
        }
        updateDuplicatePreview();
        setStatus(
            duplicates.length + " comp" + (duplicates.length === 1 ? "" : "s") +
            " created • " + names[0] + (names.length > 1 ? " to " + names[names.length - 1] : ""),
            "ok"
        );
    }

    function getRenderTemplateData(comp) {
        var data = { output: [], render: [] };
        if (!comp || !app.project || !app.project.renderQueue) {
            return data;
        }
        var rqItem = null;
        try {
            rqItem = app.project.renderQueue.items.add(comp);
            var outputSource = rqItem.outputModule(1).templates;
            var index;
            for (index = 0; index < outputSource.length; index++) {
                data.output.push(outputSource[index]);
            }
            var renderSource = rqItem.templates;
            for (index = 0; index < renderSource.length; index++) {
                data.render.push(renderSource[index]);
            }
        } catch (error) {
            log("Template scan warning: " + error.message);
        } finally {
            try {
                if (rqItem) {
                    rqItem.remove();
                }
            } catch (ignoreRemove) {}
        }
        return data;
    }

    function dropdownSelectByText(dropdown, text) {
        if (!dropdown || !dropdown.items.length) {
            return false;
        }
        var target = safeString(text).toLowerCase();
        var index;
        for (index = 0; index < dropdown.items.length; index++) {
            if (dropdown.items[index].text.toLowerCase() === target) {
                if (dropdown._boltSelect) {
                    dropdown._boltSelect(index, false);
                } else {
                    dropdown.selection = dropdown.items[index];
                }
                return true;
            }
        }
        return false;
    }

    function populateOutputTemplatesFromData(templates) {
        state.outputTemplates = templates || [];
        var dropdown = state.ui.outputTemplate;
        dropdown.removeAll();
        var index;
        for (index = 0; index < state.outputTemplates.length; index++) {
            dropdown.add("item", state.outputTemplates[index]);
        }
        if (dropdown.items.length) {
            var preferred = loadSetting("last_output_template", "");
            if (!dropdownSelectByText(dropdown, preferred)) {
                var chosen = 0;
                for (index = 0; index < dropdown.items.length; index++) {
                    if (/h\.?264|lossless/i.test(dropdown.items[index].text)) {
                        chosen = index;
                        break;
                    }
                }
                dropdown.selection = dropdown.items[chosen];
            }
        }
    }

    function selectedFormatText() {
        if (state.ui && state.ui.renderFormat && state.ui.renderFormat.selection) {
            state.renderFormatValue = state.ui.renderFormat.selection.text;
        }
        return state.renderFormatValue || "MP4 / H.264";
    }

    function selectedRenderQualityProfile() {
            var text = state.renderQualityValue || "15 Mbps";
            if (state.ui && state.ui.renderQuality && state.ui.renderQuality.selection) {
                text = state.ui.renderQuality.selection.text;
            }
    
            var bitrate = 15;
            if (/^5\b/.test(text) || text === "Compact") { bitrate = 5; }
            else if (/^40\b/.test(text) || text === "High") { bitrate = 40; }
    
            state.renderQualityValue = bitrate + " Mbps";
            return {
                name: state.renderQualityValue,
                bitrate: bitrate,
                description: bitrate + " Mbps H.264"
            };
        }

    function templateBitrateMbps(templateName) {
        var text = safeString(templateName);
        var match = text.match(/(?:^|[^0-9])([0-9]+(?:\.[0-9]+)?)\s*(?:mbps|mb\/s|mbit(?:\/s)?)/i);
        return match ? parseFloat(match[1]) : 0;
    }

    function isH264Template(templateName) {
        return /h\.?264|avc|mp4/i.test(safeString(templateName));
    }

    function findH264TemplateForBitrate(bitrate) {
        var target = Number(bitrate) || 0;
        var bestName = "";
        var bestScore = -1;
        var index, name, parsed, score;
        for (index = 0; index < state.outputTemplates.length; index++) {
            name = state.outputTemplates[index];
            if (!isH264Template(name)) { continue; }
            parsed = templateBitrateMbps(name);
            if (!parsed || Math.abs(parsed - target) > 0.05) { continue; }
            score = 1;
            if (/match\s*render/i.test(name)) { score += 3; }
            if (/h\.?264/i.test(name)) { score += 2; }
            if (score > bestScore) {
                bestScore = score;
                bestName = name;
            }
        }
        return bestName;
    }

    function setChoiceEnabled(control, enabled) {
        if (!control) { return; }
        try { control.enabled = enabled; } catch (ignoreChoiceEnabled) {}
        if (control.buttons) {
            var index;
            for (index = 0; index < control.buttons.length; index++) {
                try { control.buttons[index].enabled = enabled; } catch (ignoreChoiceButtonEnabled) {}
            }
        }
    }

    function setRenderAdvancedVisible(visible) {
        state.renderAdvancedVisible = !!visible;
        if (!state.ui || !state.ui.renderAdvancedPanel) { return; }
        try {
            state.ui.renderAdvancedPanel.visible = state.renderAdvancedVisible;
            state.ui.renderAdvancedPanel.maximumSize.height = state.renderAdvancedVisible ? 10000 : 0;
            state.ui.renderAdvancedButton.text = state.renderAdvancedVisible ? "Hide Templates" : "Templates";
            if (state.ui.applyResponsiveLayout) { state.ui.applyResponsiveLayout(); }
            else { state.ui.panel.layout.layout(true); state.ui.panel.layout.resize(); refreshScrollAreas(); }
        } catch (ignoreAdvancedLayout) {}
    }

    function inferExtension(formatText, templateName) {
        var combined = (safeString(formatText) + " " + safeString(templateName)).toLowerCase();
        if (combined.indexOf("mp4") !== -1 || combined.indexOf("h.264") !== -1 || combined.indexOf("h264") !== -1) {
            return ".mp4";
        }
        if (combined.indexOf("mp3") !== -1) {
            return ".mp3";
        }
        if (combined.indexOf("wav") !== -1 || combined.indexOf("wave") !== -1) {
            return ".wav";
        }
        if (combined.indexOf("aiff") !== -1 || combined.indexOf("aif") !== -1) {
            return ".aif";
        }
        if (combined.indexOf("png") !== -1) {
            return ".png";
        }
        if (combined.indexOf("jpeg") !== -1 || combined.indexOf("jpg") !== -1) {
            return ".jpg";
        }
        if (combined.indexOf("mov") !== -1 || combined.indexOf("quicktime") !== -1 || combined.indexOf("prores") !== -1) {
            return ".mov";
        }
        return ".mov";
    }

    function findTemplateForFormat(formatText) {
        if (!state.outputTemplates.length) {
            return "";
        }
        var profile = selectedRenderQualityProfile();
        if (/mp4|h\.?264/i.test(formatText) && profile.bitrate > 0) {
            return findH264TemplateForBitrate(profile.bitrate);
        }
        var regex = null;
        if (/wav/i.test(formatText)) {
            regex = /wave|wav/i;
        } else if (/mp3/i.test(formatText)) {
            regex = /mp3/i;
        } else if (/mp4/i.test(formatText)) {
            regex = /h\.?264|mp4/i;
        } else if (/mov|quicktime/i.test(formatText)) {
            regex = /quicktime|prores|animation|lossless/i;
        } else if (/png/i.test(formatText)) {
            regex = /png/i;
        } else if (/jpeg|jpg/i.test(formatText)) {
            regex = /jpeg|jpg/i;
        }
        var index;
        var selectedTemplate = state.ui.outputTemplate.selection ? state.ui.outputTemplate.selection.text : "";
        if (regex && selectedTemplate.length && regex.test(selectedTemplate)) {
            return selectedTemplate;
        }
        if (regex) {
            for (index = 0; index < state.outputTemplates.length; index++) {
                if (regex.test(state.outputTemplates[index])) {
                    return state.outputTemplates[index];
                }
            }
        }
        if (/mp3|mp4|h\.?264/i.test(formatText)) { return ""; }
        return state.ui && state.ui.outputTemplate && state.ui.outputTemplate.selection
            ? state.ui.outputTemplate.selection.text
            : state.outputTemplates[0];
    }

    function selectBestRenderSettingsTemplate() {
        if (!state.ui || !state.ui.renderSettings || !state.ui.renderSettings.items.length) { return ""; }
        var control = state.ui.renderSettings;
        var index;
        for (index = 0; index < control.items.length; index++) {
            if (/best\s*settings|best/i.test(control.items[index].text)) {
                if (control._boltSelect) { control._boltSelect(index, false); }
                else { control.selection = control.items[index]; }
                return control.items[index].text;
            }
        }
        return control.selection ? control.selection.text : "";
    }

    function updateRenderRecipeSummary() {
        if (!state.ui || !state.ui.renderRecipeSummary) { return; }
        var formatText = selectedFormatText();
        var profile = selectedRenderQualityProfile();
        var outputName = state.ui.outputTemplate && state.ui.outputTemplate.selection ? state.ui.outputTemplate.selection.text : "";
        var renderName = state.ui.renderSettings && state.ui.renderSettings.selection ? state.ui.renderSettings.selection.text : "";
        var summary;
        if (/mp4|h\.?264/i.test(formatText) && profile.bitrate > 0) {
            var matched = findH264TemplateForBitrate(profile.bitrate);
            summary = matched
                ? "Best quality  •  H.264  •  " + profile.bitrate + " Mbps  •  exact AE preset"
                : "Missing H.264 " + profile.bitrate + " Mbps preset  •  refresh templates or use Custom";
        } else {
            summary = (renderName || "AE Render Settings") + "  •  " + (outputName || "Choose Output Module");
        }
        state.ui.renderRecipeSummary.text = summary;
        state.ui.renderRecipeSummary.helpTip = outputName.length
            ? "Queue contract: " + (renderName || "selected Render Settings") + " + " + outputName
            : "Choose or refresh installed After Effects templates.";
    }

    function syncRenderRecipeControls() {
        if (!state.ui || state.renderSyncBusy) { return; }
        state.renderSyncBusy = true;
        try {
            var formatText = selectedFormatText();
            var profile = selectedRenderQualityProfile();
            var isH264 = /mp4|h\.?264/i.test(formatText);
            var templateName = "";
            setChoiceEnabled(state.ui.renderQuality, isH264);
            if (isH264 && profile.bitrate > 0) {
                templateName = findH264TemplateForBitrate(profile.bitrate);
                if (templateName) { dropdownSelectByText(state.ui.outputTemplate, templateName); }
                selectBestRenderSettingsTemplate();
                if (state.ui.outputTemplate) { state.ui.outputTemplate.enabled = false; }
                if (state.ui.renderSettings) { state.ui.renderSettings.enabled = false; }
            } else {
                if (state.ui.outputTemplate) { state.ui.outputTemplate.enabled = true; }
                if (state.ui.renderSettings) { state.ui.renderSettings.enabled = true; }
                templateName = findTemplateForFormat(formatText);
                if (templateName) { dropdownSelectByText(state.ui.outputTemplate, templateName); }
            }
            updateRenderRecipeSummary();
        } finally {
            state.renderSyncBusy = false;
        }
    }

    function lockRenderComp() {
        var comp = resolveAvailableComp(false);
        if (!comp) {
            throw new Error("Select, open, or create a main composition first.");
        }
        state.lockedRenderComp = comp;
        refreshRenderDetails(true);
        setStatus("Render comp locked: " + comp.name, "ok");
        return comp;
    }

    function getRenderComp() {
        var comp = resolveAvailableComp(true);
        if (!comp) {
            throw new Error("No selected, active, or main composition could be found.");
        }
        return comp;
    }

    function renderBaseName(comp) {
        var entered = trim(state.ui.renderName.text);
        return sanitizeName(entered.length ? entered : comp.name);
    }

    function buildRenderFileFromBase(baseName, outputFolder, formatText, templateName) {
        var base = sanitizeName(baseName);
        var extension = inferExtension(formatText, templateName);
        var useVersion = state.ui.renderUseVersion.value;
        var start = Math.round(clampNumber(state.ui.renderVersionStart.text, 0, 999999, 1));
        var digits = Math.round(clampNumber(state.ui.renderVersionDigits.text, 1, 6, 2));
        var reservedPaths = renderQueueReservedPaths();
        if (useVersion) {
            return nextRenderVersionFile(outputFolder, base, extension, start, digits, reservedPaths);
        }
        return uniqueRenderFile(outputFolder, base + extension, reservedPaths);
    }

    function buildRenderFile(comp, outputFolder, formatText, templateName) {
        return buildRenderFileFromBase(renderBaseName(comp), outputFolder, formatText, templateName);
    }

    function estimateOutputSize(comp) {
        var formatText = selectedFormatText();
        var profile = selectedRenderQualityProfile();
        var videoMbps = 0;
        var audioKbps = 0;
        if (/mp4|h\.?264/i.test(formatText)) {
            videoMbps = profile.bitrate;
            if (!videoMbps && state.ui && state.ui.outputTemplate && state.ui.outputTemplate.selection) {
                videoMbps = templateBitrateMbps(state.ui.outputTemplate.selection.text);
            }
            audioKbps = 320;
        } else if (/mp3/i.test(formatText)) {
            audioKbps = 320;
        } else if (/wav/i.test(formatText)) {
            audioKbps = 1536;
        }
        if (!videoMbps && !audioKbps) { return null; }
        var duration = state.ui.renderWorkArea.value ? comp.workAreaDuration : comp.duration;
        var megabytes = ((videoMbps * 1000 + audioKbps) * duration) / 8 / 1000;
        return megabytes * 1024 * 1024;
    }

    function refreshRenderDetails(forceTemplates) {
        var layerTargetMode = selectedRenderTargetText() === "Selected Layers";
        var comp = layerTargetMode && app.project && app.project.activeItem instanceof CompItem
            ? app.project.activeItem
            : resolveAvailableComp(true);
        if (!comp) {
            if (state.ui) {
                state.ui.renderCompName.text = "Comp: none";
                state.ui.compDetails.text = "Select/open a comp, or keep one top-level main comp.";
            }
            return;
        }
        if (!trim(state.ui.renderName.text).length || state.ui.renderName.text === state.ui.renderName._lastAutoName) {
            state.ui.renderName.text = comp.name;
            state.ui.renderName._lastAutoName = comp.name;
        }
        var duration = state.ui.renderWorkArea.value ? comp.workAreaDuration : comp.duration;
        var frames = Math.round(duration / comp.frameDuration);
        var estimated = estimateOutputSize(comp);
        state.ui.renderCompName.text = layerTargetMode
            ? "Layers in: " + comp.name
            : "Comp: " + comp.name + (state.lockedRenderComp === comp ? "  [locked]" : "");
        state.ui.compDetails.text =
            comp.width + "×" + comp.height + " • " + comp.frameRate.toFixed(2) + " fps • " +
            secondsText(duration) + " • " + frames + " frames" + (estimated === null ? "" : " • est. " + fileSizeText(estimated));
        if (forceTemplates || state.templateCompId !== comp.id) {
            var templateData = getRenderTemplateData(comp);
            populateOutputTemplatesFromData(templateData.output);
            populateRenderSettingsFromData(templateData.render);
            state.templateCompId = comp.id;
            syncRenderRecipeControls();
        }
        updateRenderRecipeSummary();
        if (selectedRenderTargetText() === "Selected Layers" && app.project.activeItem instanceof CompItem) {
            var layerSelection = selectedExportLayers(app.project.activeItem);
            state.ui.compDetails.text = app.project.activeItem.width + "×" + app.project.activeItem.height + " • " + app.project.activeItem.frameRate.toFixed(2) + " fps • " + layerSelection.layers.length + " selected exportable layer(s)";
        }
        updateLayerRenderPreview();
        if (state.ui.progressLabel) {
            state.ui.progressLabel.text = "Ready";
        }
    }

    function saveCurrentFrameThumbnail(comp, outputFile, preferredTime, formatText) {
        if (!state.ui.saveThumbnail.value || /mp3|wav|aiff|audio/i.test(safeString(formatText))) {
            return null;
        }
        var parts = splitFileName(outputFile.name);
        var thumbnail = new File(outputFile.parent.fsName + "/" + parts.stem + "_thumbnail.png");
        try {
            var firstFrame = preferredTime;
            if (firstFrame === undefined || firstFrame === null) {
                firstFrame = state.ui.renderWorkArea.value ? comp.workAreaStart : 0;
            }
            var created=saveSnapshotReliable(comp,thumbnail,firstFrame);
            if(created){return created;}
        } catch (error) {
            log("Thumbnail warning: " + error.message);
        }
        setStatus("Render prepared • thumbnail could not be created", "warning");
        return null;
    }

    function renderRangeForContract(comp, contract) {
        var start = 0;
        var duration = Number(comp.duration) || 0;
        if (contract && contract.expectedStart !== undefined && contract.expectedDuration !== undefined) {
            start = Number(contract.expectedStart) || 0;
            duration = Number(contract.expectedDuration) || 0;
        } else if (contract && contract.useWorkArea) {
            start = Number(comp.workAreaStart) || 0;
            duration = Number(comp.workAreaDuration) || 0;
        }
        var frame = Math.max(0.001, Number(comp.frameDuration) || 0.04);
        start = Math.max(0, Math.min(Math.max(0, Number(comp.duration) - frame), start));
        duration = Math.max(frame, Math.min(Number(comp.duration) - start, duration));
        return {start:start, duration:duration, end:start + duration};
    }

    function applyRenderSettings(rqItem, comp, contract) {
        try {
            if (contract.renderTemplateName.length) {
                rqItem.applyTemplate(contract.renderTemplateName);
            }
        } catch (error) {
            throw new Error("After Effects could not apply Render Settings '" + contract.renderTemplateName + "'.\n" + error.message);
        }
        try {
            if (contract.forceBestQuality) {
                rqItem.setSetting("Quality", "Best");
            }
        } catch (error) {
            try { rqItem.setSettings({"Quality":"Best"}); }
            catch (qualityError) {
                throw new Error("After Effects did not accept Best render quality.\n" + qualityError.message);
            }
        }
        try {
            var range = renderRangeForContract(comp, contract);
            rqItem.timeSpanStart = range.start;
            rqItem.timeSpanDuration = range.duration;
        } catch (error) {
            throw new Error("After Effects could not set the requested render range.\n" + error.message);
        }
        try {
            if (typeof rqItem.queueItemNotify !== "undefined") {
                rqItem.queueItemNotify = state.ui.notificationSound.value;
            }
        } catch (ignoreNotify) {}
        rqItem.render = true;
    }

    function createRenderQueueItem(comp, outputFile, contract) {
        var rqItem = app.project.renderQueue.items.add(comp);
        try {
            applyRenderSettings(rqItem, comp, contract);
            var module = rqItem.outputModule(1);
            try {
                module.applyTemplate(contract.outputTemplateName);
            } catch (error) {
                throw new Error("After Effects could not apply Output Module '" + contract.outputTemplateName + "'.\n" + error.message);
            }
            module = rqItem.outputModule(1);
            module.file = outputFile;
            var verification = verifyRenderQueueItem(rqItem, outputFile, contract);
            return {item:rqItem, verification:verification};
        } catch (error) {
            try { rqItem.remove(); } catch (ignoreFailedQueueRemove) {}
            throw error;
        }
    }

    function ensureRenderOutputFolder() {
        var path = trim(state.ui.renderPath.text);
        var folder;
        if (path.length) {
            folder = new Folder(path);
        } else {
            var root = getWorkspaceRoot();
            folder = root ? new Folder(root.fsName + "/Render") : Folder.selectDialog("Choose the render output folder.");
        }
        if (!folder) {
            return null;
        }
        ensureFolder(folder);
        state.ui.renderPath.text = folder.fsName;
        return folder;
    }

    function withOnlyQueueItem(targetItem, callback) {
        var states = [];
        var index;
        for (index = 1; index <= app.project.renderQueue.numItems; index++) {
            var item = app.project.renderQueue.item(index);
            var previous = false;
            try {
                previous = item.render;
            } catch (ignoreRead) {}
            states.push({ item: item, render: previous });
            if (item !== targetItem && previous) {
                try {
                    item.render = false;
                } catch (ignoreDisable) {}
            }
        }
        try {
            targetItem.render = true;
            return callback();
        } finally {
            for (index = 0; index < states.length; index++) {
                if (states[index].item !== targetItem) {
                    try {
                        states[index].item.render = states[index].render;
                    } catch (ignoreRestore) {}
                }
            }
        }
    }

    function resolveRenderContract() {
        var formatText = selectedFormatText();
        var profile = selectedRenderQualityProfile();
        var isH264 = /mp4|h\.?264/i.test(formatText);
        var renderTemplateName = state.ui.renderSettings && state.ui.renderSettings.selection
            ? state.ui.renderSettings.selection.text
            : "";
        var outputTemplateName;
        if (isH264 && profile.bitrate > 0) {
            outputTemplateName = findH264TemplateForBitrate(profile.bitrate);
            if (!outputTemplateName.length) {
                throw new Error(
                    "The exact After Effects H.264 " + profile.bitrate + " Mbps Output Module is not installed.\n\n" +
                    "Click Refresh Templates, or choose Custom and select an installed Output Module."
                );
            }
            renderTemplateName = selectBestRenderSettingsTemplate() || renderTemplateName;
        } else {
            outputTemplateName = state.ui.outputTemplate && state.ui.outputTemplate.selection
                ? state.ui.outputTemplate.selection.text
                : findTemplateForFormat(formatText);
        }
        if (!renderTemplateName.length) {
            throw new Error("Choose an installed After Effects Render Settings template.");
        }
        if (!outputTemplateName.length) {
            throw new Error("Choose an installed After Effects Output Module template for " + formatText + ".");
        }
        return {
            formatText: formatText,
            qualityName: profile.name,
            expectedBitrate: isH264 ? profile.bitrate : 0,
            forceBestQuality: isH264 && profile.bitrate > 0,
            requireFormatEvidence: !/output module template/i.test(formatText),
            requireQualityEvidence: isH264 && profile.bitrate > 0,
            requireBitrateEvidence: isH264 && profile.bitrate > 0,
            useWorkArea:!!(state.ui && state.ui.renderWorkArea && state.ui.renderWorkArea.value),
            renderTemplateName: renderTemplateName,
            outputTemplateName: outputTemplateName
        };
    }

    function getSettingsSafe(target) {
        try {
            if (typeof GetSettingsFormat !== "undefined") {
                return target.getSettings(GetSettingsFormat.STRING);
            }
        } catch (ignoreSettingsRead) {}
        return null;
    }

    function settingValue(settings, keyName) {
        if (!settings || typeof settings !== "object") { return ""; }
        var key, nested;
        for (key in settings) {
            if (!settings.hasOwnProperty(key)) { continue; }
            if (safeString(key).toLowerCase() === safeString(keyName).toLowerCase()) {
                if (settings[key] !== null && typeof settings[key] !== "object") { return safeString(settings[key]); }
            }
        }
        for (key in settings) {
            if (!settings.hasOwnProperty(key) || !settings[key] || typeof settings[key] !== "object") { continue; }
            nested = settingValue(settings[key], keyName);
            if (nested.length) { return nested; }
        }
        return "";
    }

    function collectBitrateCandidates(settings, path, output) {
        if (!settings || typeof settings !== "object") { return; }
        var key, value, fullKey;
        for (key in settings) {
            if (!settings.hasOwnProperty(key)) { continue; }
            value = settings[key];
            fullKey = path.length ? path + " / " + key : key;
            if (value && typeof value === "object") {
                collectBitrateCandidates(value, fullKey, output);
            } else if (/bit.?rate/i.test(fullKey)) {
                output.push({key:fullKey, value:safeString(value)});
            }
        }
    }

    function bitrateCandidateMbps(candidate) {
        var text = safeString(candidate.value);
        var match = text.match(/([0-9]+(?:\.[0-9]+)?)/);
        if (!match) { return 0; }
        var number = parseFloat(match[1]);
        var combined = safeString(candidate.key) + " " + text;
        if (/kbps|kbit/i.test(combined)) { return number / 1000; }
        if (/(?:^|[^mk])bps|bit\/s/i.test(combined) && !/mbps|mbit/i.test(combined)) { return number / 1000000; }
        if (!/mbps|mbit/i.test(combined) && number > 1000) { return number / 1000; }
        return number;
    }

    function primaryVideoBitrate(settings, expectedBitrate) {
        var candidates = [];
        collectBitrateCandidates(settings, "", candidates);
        var best = null;
        var bestScore = 999;
        var index, candidate, value, score, key;
        for (index = 0; index < candidates.length; index++) {
            candidate = candidates[index];
            value = bitrateCandidateMbps(candidate);
            if (!value) { continue; }
            key = candidate.key.toLowerCase();
            if (/audio/.test(key)) { continue; }
            if (expectedBitrate && Math.abs(value - expectedBitrate) <= 0.1 && !/max(?:imum)?/.test(key)) {
                return {value:value, key:candidate.key, authoritative:true};
            }
            score = 10;
            if (/target|average|video/.test(key)) { score -= 5; }
            if (/max(?:imum)?/.test(key)) { score += 8; }
            if (score < bestScore) {
                bestScore = score;
                best = {value:value, key:candidate.key, authoritative:!/max(?:imum)?/.test(key)};
            }
        }
        return best;
    }

    function actualFormatMatches(formatText, actualFormat) {
        if (/output module template/i.test(formatText)) { return true; }
        if (!actualFormat.length) { return false; }
        if (/mp4|h\.?264/i.test(formatText)) { return /h\.?264|avc|mp4/i.test(actualFormat); }
        if (/mov|quicktime/i.test(formatText)) { return /quicktime|mov/i.test(actualFormat); }
        if (/wav/i.test(formatText)) { return /wave|wav/i.test(actualFormat); }
        if (/mp3/i.test(formatText)) { return /mp3/i.test(actualFormat); }
        if (/png/i.test(formatText)) { return /png/i.test(actualFormat); }
        if (/jpeg|jpg/i.test(formatText)) { return /jpeg|jpg/i.test(actualFormat); }
        return true;
    }

    function verifyRenderQueueItem(rqItem, outputFile, contract) {
        var module = rqItem.outputModule(1);
        var moduleSettings = getSettingsSafe(module);
        var queueSettings = getSettingsSafe(rqItem);
        var actualFormat = settingValue(moduleSettings, "Format");
        var actualQuality = settingValue(queueSettings, "Quality");
        var bitrate = primaryVideoBitrate(moduleSettings, contract.expectedBitrate);
        if (contract.requireFormatEvidence && !actualFormat.length) {
            throw new Error(
                "Render verification stopped safely.\nAfter Effects did not expose the accepted output format, so Bolt cannot prove that '" +
                contract.formatText + "' was applied. The new queue item was removed."
            );
        }
        if (!actualFormatMatches(contract.formatText, actualFormat)) {
            throw new Error(
                "Render verification failed.\nRequested: " + contract.formatText +
                "\nAfter Effects accepted: " + (actualFormat || "unknown format")
            );
        }
        if (contract.requireQualityEvidence && !actualQuality.length) {
            throw new Error(
                "Render verification stopped safely.\nAfter Effects did not expose Render Quality, so Bolt cannot prove that Best quality was accepted. The new queue item was removed."
            );
        }
        if (contract.forceBestQuality && !/best/i.test(actualQuality)) {
            throw new Error(
                "Render verification failed.\nRequested quality: Best\nAfter Effects accepted: " + actualQuality
            );
        }
        if (contract.requireBitrateEvidence && (!bitrate || !bitrate.authoritative)) {
            throw new Error(
                "Render verification stopped safely.\nAfter Effects did not expose an authoritative video bitrate, so Bolt cannot prove that the " +
                contract.expectedBitrate + " Mbps preset was accepted. The new queue item was removed."
            );
        }
        if (contract.expectedBitrate > 0 && Math.abs(bitrate.value - contract.expectedBitrate) > 0.15) {
            throw new Error(
                "Render verification failed.\nRequested bitrate: " + contract.expectedBitrate +
                " Mbps\nAfter Effects accepted: " + bitrate.value.toFixed(2) + " Mbps"
            );
        }
        var comp = null, expectedStart = 0, expectedDuration = 0, actualStart = 0, actualDuration = 0, tolerance = 0.0001;
        try {
            comp = rqItem.comp;
            var verifiedRange = renderRangeForContract(comp, contract);
            expectedStart = verifiedRange.start;
            expectedDuration = verifiedRange.duration;
            actualStart = Number(rqItem.timeSpanStart);
            actualDuration = Number(rqItem.timeSpanDuration);
            tolerance = Math.max(0.0001, Number(comp.frameDuration || 0) * 0.25);
        } catch (rangeReadError) {
            throw new Error("Render verification stopped safely because After Effects did not expose the queued time range. The new queue item was removed.");
        }
        if (isNaN(actualStart) || isNaN(actualDuration) ||
            Math.abs(actualStart - expectedStart) > tolerance || Math.abs(actualDuration - expectedDuration) > tolerance) {
            throw new Error(
                "Render verification failed.\nRequested range: " + expectedStart.toFixed(3) + "s + " + expectedDuration.toFixed(3) +
                "s\nAfter Effects accepted: " + actualStart.toFixed(3) + "s + " + actualDuration.toFixed(3) + "s"
            );
        }
        try {
            if (!module.file) {
                throw new Error("Render verification failed because After Effects did not keep an output path.");
            }
            if (/sequence/i.test(contract.formatText)) {
                if (normalizePath(module.file.parent.fsName) !== normalizePath(outputFile.parent.fsName)) {
                    throw new Error("Render verification failed because After Effects changed the output folder.");
                }
            } else if (normalizePath(module.file.fsName) !== normalizePath(outputFile.fsName)) {
                throw new Error("Render verification failed because After Effects changed the output path.");
            }
        } catch (pathError) {
            if (pathError && pathError.message) { throw pathError; }
        }
        var verifiedBitrate = contract.expectedBitrate > 0
            ? Math.round(bitrate.value * 100) / 100
            : (bitrate ? Math.round(bitrate.value * 100) / 100 : 0);
        var formatLabel = actualFormat || ("Template: " + contract.outputTemplateName);
        var qualityLabel = actualQuality || ("Template: " + contract.renderTemplateName);
        return {
            format: formatLabel,
            bitrate: verifiedBitrate,
            quality: qualityLabel,
            summary: formatLabel + (verifiedBitrate ? " • " + verifiedBitrate + " Mbps" : "") + " • " + qualityLabel + " • range verified"
        };
    }

    function selectedRenderTargetText() {
            state.renderTargetValue = "Composition";
            return "Composition";
        }

    function selectedLayerRangeText() {
            state.layerRangeValue = "Layer In / Out";
            return "Layer In / Out";
        }

    function layerCanExport(layer) {
        if (!layer) { return false; }
        try {
            if (layer.matchName === "ADBE Camera Layer" || layer.matchName === "ADBE Light Layer") { return false; }
        } catch (ignoreLayerType) {}
        try { if (layer.hasVideo || layer.hasAudio) { return true; } } catch (ignoreMediaFlags) {}
        try { if (layer.property("ADBE Text Properties") || layer.property("ADBE Root Vectors Group")) { return true; } } catch (ignoreRenderableProps) {}
        return false;
    }

    function selectedExportLayers(comp) {
        var source = comp && comp.selectedLayers ? comp.selectedLayers : [];
        var output = [], skipped = [], index;
        for (index = 0; index < source.length; index++) {
            if (layerCanExport(source[index])) { output.push(source[index]); }
            else { skipped.push(source[index]); }
        }
        return {layers:output, skipped:skipped};
    }

    function layerMarkerRange(layer, comp) {
        var marker = null, first = null, last = null, explicitStart = null, explicitEnd = null;
        var index, time, comment;
        try { marker = layer.property("ADBE Marker"); } catch (ignoreMarkerGroup) { marker = null; }
        if (!marker || marker.numKeys < 1) { return null; }
        for (index = 1; index <= marker.numKeys; index++) {
            try {
                time = Number(marker.keyTime(index));
                comment = safeString(marker.keyValue(index).comment).toLowerCase();
                if (first === null || time < first) { first = time; }
                if (last === null || time > last) { last = time; }
                if (explicitStart === null && /(^|[^a-z])(in|start|begin)([^a-z]|$)/i.test(comment)) { explicitStart = time; }
                if (/(^|[^a-z])(out|end|stop)([^a-z]|$)/i.test(comment)) { explicitEnd = time; }
            } catch (ignoreMarkerRead) {}
        }
        var layerStart = Math.max(0, Number(layer.inPoint) || 0);
        var layerEnd = Math.min(Number(comp.duration) || 0, Number(layer.outPoint) || 0);
        var start = explicitStart !== null ? explicitStart : first;
        var end = explicitEnd !== null ? explicitEnd : last;
        if (start === null) { return null; }
        if (end === null || end <= start) { end = layerEnd; }
        start = Math.max(layerStart, start);
        end = Math.min(layerEnd, end);
        if (end <= start) { return null; }
        return {start:start, end:end, source:(explicitStart !== null || explicitEnd !== null) ? "named markers" : "first/last markers"};
    }

    function getLayerExportRange(layer, comp, modeText) {
        var frame = Math.max(0.001, Number(comp.frameDuration) || 0.04);
        var compDuration = Math.max(frame, Number(comp.duration) || frame);
        var start = Math.max(0, Math.min(compDuration - frame, Number(layer.inPoint) || 0));
        var end = Math.max(start + frame, Math.min(compDuration, Number(layer.outPoint) || compDuration));
        var source = "layer in/out";
        var fallback = false;
        if (modeText === "Layer Markers") {
            var markerRange = layerMarkerRange(layer, comp);
            if (markerRange) {
                start = markerRange.start;
                end = markerRange.end;
                source = markerRange.source;
            } else {
                fallback = true;
                source = "layer in/out (no valid markers)";
            }
        } else if (modeText === "Comp Work Area") {
            start = Math.max(0, Math.min(compDuration - frame, Number(comp.workAreaStart) || 0));
            end = Math.min(compDuration, start + Math.max(frame, Number(comp.workAreaDuration) || frame));
            source = "comp work area";
        }
        var duration = Math.max(frame, end - start);
        return {start:start, end:start + duration, duration:duration, source:source, fallback:fallback};
    }

    function layerRenderFileBase(comp, layer) {
        var entered = trim(state.ui.renderName.text);
        var prefix = sanitizeName(entered.length ? entered : comp.name);
        return prefix + "__L" + padNumber(layer.index, 2) + "_" + sanitizeName(layer.name);
    }

    function ensureLayerRenderHelperFolder() {
        var compsFolder = ensureTopLevelProjectFolder("01_Comps");
        var folder = ensureChildProjectFolder(compsFolder, "BOLT Layer Exports");
        var legacy = findTopLevelProjectFolder("BOLT Layer Exports"), item;
        if (legacy && legacy !== folder) {
            try {
                while (legacy.numItems > 0) {
                    item = legacy.item(1);
                    item.parentFolder = folder;
                }
                legacy.remove();
            } catch (ignoreLegacyExportMigration) {}
        }
        return folder;
    }

    function helperCompName(comp, layer) {
        var base = "BOLT_EXPORT__" + sanitizeName(comp.name) + "__L" + padNumber(layer.index, 2) + "_" + sanitizeName(layer.name);
        var candidate = base, count = 2;
        while (projectItemNameExists(candidate, null)) { candidate = base + "_" + count; count++; }
        return candidate;
    }

    function helperTrackMatteIndex(helperComp, targetLayer) {
        try {
            if (targetLayer.trackMatteLayer) { return targetLayer.trackMatteLayer.index; }
        } catch (ignoreModernTrackMatte) {}
        try {
            if (typeof TrackMatteType !== "undefined" && targetLayer.trackMatteType !== TrackMatteType.NO_TRACK_MATTE && targetLayer.index > 1) {
                return targetLayer.index - 1;
            }
        } catch (ignoreLegacyTrackMatte) {}
        return 0;
    }

    function createLayerRenderHelper(comp, sourceLayer, range) {
        var helper = comp.duplicate();
        helper.name = helperCompName(comp, sourceLayer);
        helper.parentFolder = ensureLayerRenderHelperFolder();
        try { helper.comment = "Bolt isolated layer export • source comp: " + comp.name + " • source layer: " + sourceLayer.name; } catch (ignoreHelperComment) {}
        try { helper.workAreaStart = range.start; helper.workAreaDuration = range.duration; } catch (ignoreHelperWorkArea) {}
        try { helper.hideShyLayers = false; } catch (ignoreHelperShy) {}
        var target = helper.layer(sourceLayer.index);
        if (!target) { try { helper.remove(); } catch (ignoreBrokenHelperRemove) {} throw new Error("Could not locate the duplicated target layer: " + sourceLayer.name); }
        var matteIndex = helperTrackMatteIndex(helper, target);
        var index, current, keepVideo, keepAudio;
        for (index = 1; index <= helper.numLayers; index++) {
            current = helper.layer(index);
            keepVideo = index === sourceLayer.index || index === matteIndex;
            keepAudio = index === sourceLayer.index;
            try {
                if (current.matchName === "ADBE Camera Layer" || current.matchName === "ADBE Light Layer" || current.adjustmentLayer === true) {
                    keepVideo = true;
                }
            } catch (ignoreDependencyType) {}
            try { current.solo = false; } catch (ignoreSolo) {}
            try { current.enabled = !!keepVideo; } catch (ignoreVideoSwitch) {}
            try { current.audioEnabled = !!keepAudio; } catch (ignoreAudioSwitch) {}
        }
        try { target.enabled = true; } catch (ignoreTargetVideo) {}
        try { if (target.hasAudio) { target.audioEnabled = true; } } catch (ignoreTargetAudio) {}
        return helper;
    }

    function cloneRenderContractWithRange(contract, range, labelText) {
        return {
            formatText:contract.formatText,
            qualityName:contract.qualityName,
            expectedBitrate:contract.expectedBitrate,
            forceBestQuality:contract.forceBestQuality,
            requireFormatEvidence:contract.requireFormatEvidence,
            requireQualityEvidence:contract.requireQualityEvidence,
            requireBitrateEvidence:contract.requireBitrateEvidence,
            useWorkArea:false,
            expectedStart:range.start,
            expectedDuration:range.duration,
            rangeLabel:labelText || range.source,
            renderTemplateName:contract.renderTemplateName,
            outputTemplateName:contract.outputTemplateName
        };
    }

    function updateLayerRenderPreview() {
            // Selected-layer rendering is intentionally not part of Bolt 14.8.
        }

    function cleanupLayerRenderHelpers() {
            setStatus("Selected-layer rendering is not included in this Bolt build.", "warning");
        }

    function prepareSelectedLayerRenders(mode) {
            throw new Error("Selected-layer rendering was removed. Render the composition instead.");
        }


    function simpleTemplateForFormat(comp, formatText, bitrate) {
            var data = getRenderTemplateData(comp);
            state.outputTemplates = data.output || [];
    
            var exact = "";
            var index, name;
            if (/h\.?264|mp4/i.test(formatText)) {
                exact = findH264TemplateForBitrate(bitrate);
                if (exact.length) { return exact; }
                for (index = 0; index < state.outputTemplates.length; index++) {
                    name = state.outputTemplates[index];
                    if (/h\.?264|avc|mp4/i.test(name)) { return name; }
                }
                return "";
            }
    
            var expression = null;
            if (/quicktime|mov/i.test(formatText)) { expression = /quicktime|prores|animation|lossless/i; }
            else if (/png/i.test(formatText)) { expression = /png/i; }
            else if (/wav|wave/i.test(formatText)) { expression = /wav|wave|audio only/i; }
    
            if (expression) {
                for (index = 0; index < state.outputTemplates.length; index++) {
                    name = state.outputTemplates[index];
                    if (expression.test(name)) { return name; }
                }
            }
            return "";
        }


    function bestRenderSettingsTemplate(rqItem) {
            var templates = [], index, name;
            try { templates = rqItem.templates || []; } catch (ignoreRenderTemplates) { templates = []; }
            for (index = 0; index < templates.length; index++) {
                name = safeString(templates[index]);
                if (/^best settings$/i.test(name)) { return name; }
            }
            return templates.length ? safeString(templates[0]) : "";
        }

    function outputModuleExtension(outputModule, formatText, templateName) {
            var inferred = templateName && templateName.length ? inferExtension(formatText, templateName) : "";
            if (/h\.?264|mp4/i.test(formatText) && /h\.?264|avc|mp4/i.test(templateName)) { return ".mp4"; }
            if (/png/i.test(formatText) && /png/i.test(templateName)) { return ".png"; }
            if (/wav|wave/i.test(formatText) && /wav|wave|audio/i.test(templateName)) { return ".wav"; }
            if (/quicktime|mov/i.test(formatText) && /quicktime|prores|animation/i.test(templateName)) { return ".mov"; }
            if (inferred && inferred !== ".mov") { return inferred; }
    
            var file = null, extension = "";
            try { file = outputModule.file; } catch (ignoreOutputFile) { file = null; }
            if (file) { extension = getFileExtension(file); }
            return extension.length ? "." + extension : (inferred || ".mov");
        }


    function boltSetOutputFileVerified(rqItem, outputIndex, outputFile) {
        var module = rqItem.outputModule(outputIndex);
        module.file = outputFile;
        module = rqItem.outputModule(outputIndex);
        var confirmed = null;
        try { confirmed = module.file; } catch (ignoreConfirmedOutput) { confirmed = null; }
        if (!confirmed || normalizePath(confirmed.fsName) !== normalizePath(outputFile.fsName)) {
            throw new Error("After Effects did not accept the Render Queue output path:\n" + outputFile.fsName);
        }
        return module;
    }

    function addSimpleRenderDestination(sendToAME) {
            if (!app.project) { throw new Error("No After Effects project is open."); }
            if (!app.project.renderQueue) { throw new Error("The After Effects Render Queue is unavailable."); }
    
            var comp = getRenderComp();
            if (!(comp instanceof CompItem)) { throw new Error("Choose or open a composition to render."); }
            var outputFolder = ensureRenderOutputFolder();
            if (!outputFolder) { return null; }
            ensureFolder(outputFolder);
    
            var formatText = selectedFormatText();
            var quality = selectedRenderQualityProfile();
            var templateName = simpleTemplateForFormat(comp, formatText, quality.bitrate);
            var rqItem = null, outputModule = null, appliedTemplate = "", renderTemplate = "", outputFile = null;
    
            app.beginUndoGroup(sendToAME ? "Bolt Add to Media Encoder" : "Bolt Add to Render Queue");
            try {
                rqItem = app.project.renderQueue.items.add(comp);
                renderTemplate = bestRenderSettingsTemplate(rqItem);
                if (renderTemplate.length && typeof rqItem.applyTemplate === "function") {
                    try { rqItem.applyTemplate(renderTemplate); } catch (renderSettingsApplyError) {
                        setStatus("Render Settings '" + renderTemplate + "' could not be applied — using default.", "warning");
                    }
                }
    
                outputModule = rqItem.outputModule(1);
                if (templateName.length) {
                    try {
                        outputModule.applyTemplate(templateName);
                        outputModule = rqItem.outputModule(1);
                        appliedTemplate = templateName;
                    } catch (outputTemplateApplyError) {
                        appliedTemplate = "";
                        outputModule = rqItem.outputModule(1);
                        setStatus("Output Module '" + templateName + "' could not be applied — using current module.", "warning");
                    }
                }
    
                var extension = outputModuleExtension(outputModule, formatText, appliedTemplate);
                outputFile = uniqueRenderFile(outputFolder, renderBaseName(comp) + extension, renderQueueReservedPaths());
                outputModule = boltSetOutputFileVerified(rqItem, 1, outputFile);
                rqItem.render = true;
    
                if (sendToAME) {
                    if (typeof app.project.renderQueue.queueInAME !== "function") {
                        throw new Error("Adobe Media Encoder queueing is unavailable in this After Effects version.");
                    }
                    if (app.project.renderQueue.canQueueInAME !== true) {
                        throw new Error("Adobe Media Encoder is not ready to receive this queue item.");
                    }
                    withOnlyQueueItem(rqItem, function () { app.project.renderQueue.queueInAME(false); });
                    setStatus("Added to AME • " + comp.name, "ok");
                } else {
                    app.project.renderQueue.showWindow(true);
                    setStatus(
                        "Added to Render Queue • " + comp.name +
                        (appliedTemplate.length ? " • " + appliedTemplate : " • current output module"),
                        appliedTemplate.length || /auto/i.test(formatText) ? "ok" : "warning"
                    );
                }
    
                if (state.ui && state.ui.renderVerification) {
                    state.ui.renderVerification.text = sendToAME ? "Added to Adobe Media Encoder." : "Added to After Effects Render Queue.";
                    state.ui.renderVerification.helpTip = outputFile.fsName +
                        (appliedTemplate.length ? "\nTemplate: " + appliedTemplate : "\nUsing the current Output Module.");
                }
                return rqItem;
            } catch (error) {
                if (rqItem) { try { rqItem.remove(); } catch (ignoreQueueCleanup) {} }
                throw error;
            } finally {
                app.endUndoGroup();
            }
        }

    function prepareRender(mode) {
        if (!app.project) {
            throw new Error("No After Effects project is open.");
        }
        var comp = getRenderComp();
        var outputFolder = ensureRenderOutputFolder();
        if (!outputFolder) {
            return null;
        }
        if (state.templateCompId !== comp.id || !state.outputTemplates.length) {
            refreshRenderDetails(true);
        }
        syncRenderRecipeControls();
        var contract = resolveRenderContract();
        var outputFile = buildRenderFile(comp, outputFolder, contract.formatText, contract.outputTemplateName);

        setProgress(10, "Preparing " + comp.name);
        var created = createRenderQueueItem(comp, outputFile, contract);
        var rqItem = created.item;
        saveSetting("last_output_template", contract.outputTemplateName);
        saveSetting("last_render_quality_v0140", contract.qualityName);
        saveCurrentFrameThumbnail(comp, outputFile, renderRangeForContract(comp, contract).start, contract.formatText);
        setProgress(60, "Verified: " + created.verification.summary);
        if (state.ui && state.ui.renderVerification) {
            state.ui.renderVerification.text = "Verified in AE  •  " + created.verification.summary;
            state.ui.renderVerification.helpTip =
                "Applied Render Settings: " + contract.renderTemplateName +
                "\nApplied Output Module: " + contract.outputTemplateName +
                "\nOutput: " + outputFile.fsName;
        }

        if (mode === "queue") {
            app.project.renderQueue.showWindow(true);
            setProgress(100, "Added to After Effects Render Queue");
            setStatus("Verified and queued • " + created.verification.summary + " • " + outputFile.name, "ok");
            return rqItem;
        }

        return rqItem;
    }

    function saveSetting(key, value) {
        try {
            app.settings.saveSetting(SETTINGS_SECTION, key, safeString(value));
        } catch (ignore) {}
    }

    function loadSetting(key, fallback) {
        try {
            if (app.settings.haveSetting(SETTINGS_SECTION, key)) {
                return app.settings.getSetting(SETTINGS_SECTION, key);
            }
        } catch (ignore) {}
        return fallback;
    }


    function brandTitle(section) {
        return "Bolt v" + VERSION + (section ? " • " + section : "");
    }

    function arrayIndexOf(items, value) {
        var i;
        for (i = 0; i < items.length; i++) {
            if (items[i] === value) { return i; }
        }
        return -1;
    }

    function textPresetCategory(name) {
        var n = safeString(name).toLowerCase();
        if (n.indexOf("typewriter") >= 0) { return "Typewriter"; }
        if (n.indexOf("tracking") >= 0) { return "Tracking"; }
        if (n.indexOf("blur") >= 0 || n.indexOf("neon") >= 0) { return "Blur & Glow"; }
        if (n.indexOf("slide") >= 0 || n.indexOf("wipe") >= 0 || n.indexOf("left") >= 0 || n.indexOf("right") >= 0 || n.indexOf("rise") >= 0 || n.indexOf("drop") >= 0 || n.indexOf("up") >= 0 || n.indexOf("down") >= 0) { return "Move"; }
        if (n.indexOf("pop") >= 0 || n.indexOf("zoom") >= 0 || n.indexOf("scale") >= 0 || n.indexOf("stretch") >= 0 || n.indexOf("compress") >= 0 || n.indexOf("punch") >= 0) { return "Scale"; }
        if (n.indexOf("rotate") >= 0 || n.indexOf("spin") >= 0 || n.indexOf("flip") >= 0 || n.indexOf("skew") >= 0) { return "Rotate & Skew"; }
        if (n.indexOf("glitch") >= 0 || n.indexOf("flicker") >= 0 || n.indexOf("tech") >= 0 || n.indexOf("kinetic") >= 0) { return "Kinetic"; }
        if (n.indexOf("luxury") >= 0 || n.indexOf("editorial") >= 0 || n.indexOf("corporate") >= 0 || n.indexOf("cinematic") >= 0 || n.indexOf("social") >= 0) { return "Editorial"; }
        return "Fade & Clean";
    }

    function textPresetMatchesFilter(name, filterName) {
        var category = textPresetCategory(name);
        if (!filterName || filterName === "All") { return true; }
        if (filterName === "Fade") { return category === "Fade & Clean"; }
        if (filterName === "Move") { return category === "Move"; }
        if (filterName === "Scale") { return category === "Scale"; }
        if (filterName === "Type") { return category === "Tracking" || category === "Typewriter"; }
        if (filterName === "Motion") { return category === "Rotate & Skew" || category === "Kinetic"; }
        if (filterName === "Style") { return category === "Blur & Glow" || category === "Editorial"; }
        return true;
    }

    function filteredTextPresetIndices() {
        var filterName = state.textCategoryFilter || "All";
        var query = state.ui && state.ui.textSearch ? trim(state.ui.textSearch.text).toLowerCase() : "";
        var output = [], i, name;
        for (i = 0; i < TEXT_PRESETS.length; i++) {
            name = TEXT_PRESETS[i].name;
            if (!textPresetMatchesFilter(name, filterName)) { continue; }
            if (query.length && name.toLowerCase().indexOf(query) < 0) { continue; }
            output.push(i);
        }
        return output;
    }

    function populateRenderSettingsFromData(templates) {
        var dropdown = state.ui.renderSettings;
        dropdown.removeAll();
        var index;
        for (index = 0; index < templates.length; index++) {
            dropdown.add("item", templates[index]);
        }
        if (dropdown.items.length) {
            var selected = 0;
            for (index = 0; index < dropdown.items.length; index++) {
                if (/best settings/i.test(dropdown.items[index].text)) {
                    selected = index;
                    break;
                }
            }
            dropdown.selection = dropdown.items[selected];
        }
    }

    function addPathRow(parent, initialText, browseTitle) {
            var row = parent.add("group");
            row.orientation = "row";
            row.alignChildren = ["left", "center"];
            row.alignment = ["fill", "top"];
            row.spacing = 3;
            row.margins = 0;
            row.minimumSize.width = 0;
            row.maximumSize.width = 10000;
    
            var field = row.add("edittext", undefined, initialText || "");
            field.alignment = ["fill", "center"];
            field._boltResponsiveFill = true;
            field.minimumSize = [0, 20];
            field.maximumSize.width = 10000;
            field.preferredSize.height = 20;
            field.characters = 8;
            field.helpTip = field.text;
    
            var browse = row.add("button", undefined, "…");
            browse.alignment = ["left", "center"];
            browse.preferredSize = [26, 20];
            browse.minimumSize = [26, 20];
            browse.maximumSize = [26, 20];
            browse.helpTip = browseTitle || "Choose a folder.";
    
            function refreshPathTip() {
                field.helpTip = trim(field.text).length ? field.text : "No folder selected.";
            }
    
            field.onChanging = refreshPathTip;
            field.onChange = refreshPathTip;
    
            browse.onClick = function () {
                var folder = Folder.selectDialog(browseTitle || "Choose folder");
                if (folder) {
                    field.text = folder.fsName;
                    refreshPathTip();
                }
            };
    
            return { row: row, field: field, button: browse };
        }

    
    function styleStatusLabel(label) {
        try {
            label.graphics.foregroundColor = label.graphics.newPen(
                label.graphics.PenType.SOLID_COLOR,
                [0.68, 0.70, 0.73],
                1
            );
        } catch (ignore) {}
    }


    function hexToRgb01(hex) {
        var clean = safeString(hex).replace(/[^0-9a-f]/gi, "");
        if (clean.length === 3) { clean = clean.charAt(0)+clean.charAt(0)+clean.charAt(1)+clean.charAt(1)+clean.charAt(2)+clean.charAt(2); }
        if (clean.length !== 6) { return [1,1,1]; }
        return [parseInt(clean.substr(0,2),16)/255, parseInt(clean.substr(2,2),16)/255, parseInt(clean.substr(4,2),16)/255];
    }

    function selectedTextLayersOrThrow(comp) {
        var source = selectedLayersOrThrow(comp);
        var output = [], i;
        for (i=0; i<source.length; i++) {
            try { if (source[i].property("ADBE Text Properties")) { output.push(source[i]); } } catch (ignoreText) {}
        }
        if (!output.length) { throw new Error("Select at least one text layer."); }
        return output;
    }

    function applyPremiumFontPreset() {
        var comp = activeCompOrThrow(), layers = selectedTextLayersOrThrow(comp);
        if (!state.ui.fontPreset || !state.ui.fontPreset.selection) { throw new Error("Choose a font style."); }
        var preset = PREMIUM_FONT_PRESETS[state.ui.fontPreset.selection.index], applied = 0, substituted = 0;
        var i, fontIndex, source, doc, verified, candidate;
        app.beginUndoGroup("Bolt Premium Font");
        try {
            for (i = 0; i < layers.length; i++) {
                try {
                    source = layers[i].property("ADBE Text Properties").property("ADBE Text Document");
                    verified = false;
                    for (fontIndex = 0; fontIndex < preset.fonts.length; fontIndex++) {
                        candidate = preset.fonts[fontIndex];
                        doc = source.value;
                        doc.font = candidate;
                        doc.tracking = preset.tracking;
                        try { doc.fauxBold = preset.fauxBold; } catch (ignoreFauxBold) {}
                        source.setValue(doc);
                        try {
                            verified = safeString(source.value.font).toLowerCase() === safeString(candidate).toLowerCase();
                        } catch (ignoreFontVerify) { verified = true; }
                        if (verified) { break; }
                    }
                    if (!verified) { substituted++; }
                    applied++;
                } catch (fontError) { substituted++; }
            }
        } finally { app.endUndoGroup(); }
        if (!applied) { throw new Error("The selected text layers could not be updated."); }
        setStatus(preset.name + " applied to " + applied + " text layer(s)" + (substituted ? " • " + substituted + " font fallback(s)" : ""), substituted ? "warning" : "ok");
    }

    function boltRemoveTextStyleEffects(layer) {
        var effects = layer.property("ADBE Effect Parade"), i;
        if (!effects) { return; }
        for (i = effects.numProperties; i >= 1; i--) {
            try { if (safeString(effects.property(i).name).indexOf("BOLT TEXT •") === 0) { effects.property(i).remove(); } } catch (ignoreRemoveTextStyle) {}
        }
    }

    function boltAddDropShadow(layer, opacity, distance, softness) {
        var fx = addEffectSafe(layer, "ADBE Drop Shadow", "BOLT TEXT • Shadow");
        if (!fx) { return false; }
        safeSetEffectProperty(fx, 1, ["Shadow Color", "Color"], [0,0,0]);
        safeSetEffectProperty(fx, 2, ["Opacity"], opacity);
        safeSetEffectProperty(fx, 4, ["Distance"], distance);
        safeSetEffectProperty(fx, 5, ["Softness"], softness);
        return true;
    }

    function boltAddBevel(layer, thickness, intensity) {
        var fx = addEffectSafe(layer, "ADBE Bevel Alpha", "BOLT TEXT • Bevel");
        if (!fx) { return false; }
        safeSetEffectProperty(fx, 1, ["Edge Thickness", "Thickness"], thickness);
        safeSetEffectProperty(fx, 4, ["Light Intensity", "Intensity"], intensity);
        return true;
    }

    function boltAddFill(layer, color) {
        var fx = addEffectSafe(layer, "ADBE Fill", "BOLT TEXT • Fill");
        if (!fx) { return false; }
        safeSetEffectProperty(fx, 1, ["Color"], color);
        return true;
    }

    function applyTextVisualPreset() {
        var comp = activeCompOrThrow(), layers = selectedTextLayersOrThrow(comp);
        if (!state.ui.textVisualPreset || !state.ui.textVisualPreset.selection) { throw new Error("Choose a text effect."); }
        var name = state.ui.textVisualPreset.selection.text, i, layer, applied = 0;
        app.beginUndoGroup("Bolt Text Style " + name);
        try {
            for (i = 0; i < layers.length; i++) {
                layer = layers[i];
                boltRemoveTextStyleEffects(layer);
                if (name === "Premium Shadow") {
                    if (boltAddDropShadow(layer, 55, 12, 24)) { applied++; }
                } else if (name === "3D Lift") {
                    if (boltAddBevel(layer, 5, 0.75)) { applied++; }
                    boltAddDropShadow(layer, 62, 18, 28);
                } else if (name === "Gold Title") {
                    boltAddFill(layer, [0.83,0.62,0.18]);
                    boltAddBevel(layer, 4, 0.9);
                    boltAddDropShadow(layer, 58, 13, 22);
                    applied++;
                } else if (name === "Glass Title") {
                    boltAddFill(layer, [0.88,0.94,1.0]);
                    boltAddBevel(layer, 3, 0.65);
                    var glow = addEffectSafe(layer, "ADBE Glo2", "BOLT TEXT • Glass Glow");
                    if (glow) { safeSetEffectProperty(glow, 3, ["Glow Radius", "Radius"], 18); safeSetEffectProperty(glow, 4, ["Glow Intensity", "Intensity"], 0.45); }
                    applied++;
                } else {
                    boltAddFill(layer, [0.55,0.9,1.0]);
                    var neon = addEffectSafe(layer, "ADBE Glo2", "BOLT TEXT • Neon Glow");
                    if (neon) { safeSetEffectProperty(neon, 3, ["Glow Radius", "Radius"], 42); safeSetEffectProperty(neon, 4, ["Glow Intensity", "Intensity"], 1.2); }
                    boltAddDropShadow(layer, 45, 8, 18);
                    applied++;
                }
            }
        } finally { app.endUndoGroup(); }
        setStatus(name + " applied to " + applied + " text layer(s)", applied ? "ok" : "warning");
    }

    // ---------------- MARKER-DRIVEN ANIMATION CONTROLLER ----------------
    var BOLT_ANIM_EXPRESSION_TAG = "// BOLT MARKER ANIMATION";
    var BOLT_ANIM_EFFECT_PREFIX = "BOLT • ";

    function boltFindNamedEffect(layer, effectName) {
        var effects = layer.property("ADBE Effect Parade"), i;
        if (!effects) { return null; }
        for (i = 1; i <= effects.numProperties; i++) {
            if (effects.property(i).name === effectName) { return effects.property(i); }
        }
        return null;
    }

    function boltEnsureSlider(layer, name, value) {
        var effect = boltFindNamedEffect(layer, name);
        if (!effect) {
            effect = addEffectSafe(layer, "ADBE Slider Control", name);
        }
        if (!effect) { throw new Error("Could not create " + name + " control."); }
        try { effect.property(1).setValue(value); } catch (ignoreSliderValue) {}
        return effect;
    }

    function boltRemoveMarkerByComment(markerProp, comment) {
        var i, removed = 0;
        if (!markerProp) { return 0; }
        for (i = markerProp.numKeys; i >= 1; i--) {
            try {
                if (markerProp.keyValue(i).comment === comment) { markerProp.removeKey(i); removed++; }
            } catch (ignoreMarkerRemove) {}
        }
        return removed;
    }

    function boltSetAnimationMarker(layer, comment, markerTime) {
        var markers = layer.property("ADBE Marker");
        if (!markers) { return; }
        boltRemoveMarkerByComment(markers, comment);
        var mv = new MarkerValue(comment);
        try { mv.label = comment === "BOLT IN" ? 9 : 2; } catch (ignoreMarkerLabel) {}
        markers.setValueAtTime(markerTime, mv);
    }

    function boltMarkerProgressExpression() {
        return BOLT_ANIM_EXPRESSION_TAG + "\n" +
            'var d=Math.max(1,effect("BOLT • Duration (frames)")("Slider"))*thisComp.frameDuration;\n' +
            'var mode=Math.round(effect("BOLT • Mode 1-IN 2-OUT 3-BOTH")("Slider"));\n' +
            'var e=clamp(effect("BOLT • Ease")("Slider")/100,0,1);\n' +
            'function markerTime(label,fallback){for(var i=1;i<=marker.numKeys;i++){if(marker.key(i).comment===label){return marker.key(i).time;}}return fallback;}\n' +
            'function shaped(t,a,b,x,y){var q=clamp((t-a)/Math.max(thisComp.frameDuration,b-a),0,1);var smooth=q*q*(3-2*q);q=linear(e,0,1,q,smooth);return linear(q,0,1,x,y);}\n' +
            'var ti=markerTime("BOLT IN",inPoint);\n' +
            'var to=markerTime("BOLT OUT",outPoint);\n' +
            'var pin=shaped(time,ti,ti+d,0,100);\n' +
            'var pout=shaped(time,to-d,to,100,0);\n' +
            'mode===1?pin:(mode===2?pout:Math.min(pin,pout));';
    }

    function boltAnimationAmountExpression(dimension) {
        var base = BOLT_ANIM_EXPRESSION_TAG + "\n" +
            'var p=clamp(effect("BOLT • Progress")("Slider")/100,0,1);\n';
        if (dimension === "opacity") {
            return base + 'value*(effect("BOLT • Opacity")("Slider")/100)*p;';
        }
        if (dimension === "position") {
            return base + 'var dx=effect("BOLT • X")("Slider")*(1-p);var dy=effect("BOLT • Y")("Slider")*(1-p);var o=value.length>2?[dx,dy,0]:[dx,dy];value+o;';
        }
        if (dimension === "positionX") {
            return base + 'value+effect("BOLT • X")("Slider")*(1-p);';
        }
        if (dimension === "positionY") {
            return base + 'value+effect("BOLT • Y")("Slider")*(1-p);';
        }
        if (dimension === "scale") {
            return base + 'var sx=linear(p,0,1,effect("BOLT • Start Scale X")("Slider")/100,1);var sy=linear(p,0,1,effect("BOLT • Start Scale Y")("Slider")/100,1);value.length>2?[value[0]*sx,value[1]*sy,value[2]]:[value[0]*sx,value[1]*sy];';
        }
        if (dimension === "rotation") {
            return base + 'value+effect("BOLT • Rotation")("Slider")*(1-p);';
        }
        if (dimension === "blur") {
            return base + 'effect("BOLT • Blur")("Slider")*(1-p);';
        }
        return base + 'value;';
    }

    var BOLT_MARKER_TEXT_PREFIX = "BOLT • Marker Text • ";

    function boltRemoveMarkerTextAnimators(layer) {
        var textGroup = null, animators = null, i, removed = 0;
        try { textGroup = layer.property("ADBE Text Properties"); } catch (ignoreTextGroup) {}
        try { animators = textGroup ? textGroup.property("ADBE Text Animators") : null; } catch (ignoreAnimators) {}
        if (!animators) { return 0; }
        for (i = animators.numProperties; i >= 1; i--) {
            try {
                if (safeString(animators.property(i).name).indexOf(BOLT_MARKER_TEXT_PREFIX) === 0) {
                    animators.property(i).remove();
                    removed++;
                }
            } catch (ignoreRemoveMarkerText) {}
        }
        return removed;
    }

    function boltAddMarkerTextProperty(textGroup, animatorIndex, matchName, value, expressionText) {
        try {
            var animators = textGroup.property("ADBE Text Animators");
            var animator = animators.property(animatorIndex);
            var properties = animator.property("ADBE Text Animator Properties");
            if (properties.canAddProperty && !properties.canAddProperty(matchName)) { return false; }
            var property = properties.addProperty(matchName);
            var propertyIndex = property.propertyIndex;
            animators = textGroup.property("ADBE Text Animators");
            animator = animators.property(animatorIndex);
            properties = animator.property("ADBE Text Animator Properties");
            property = properties.property(propertyIndex);
            property.setValue(value);
            if (expressionText && boltCanOwnExpression(property)) { property.expression = expressionText; }
            return true;
        } catch (ignoreMarkerTextProperty) {}
        return false;
    }

    function boltMarkerTextValueExpression(kind) {
        var base = BOLT_ANIM_EXPRESSION_TAG + "\n";
        if (kind === "position") { return base + '[effect("BOLT • X")("Slider"),effect("BOLT • Y")("Slider"),0];'; }
        if (kind === "scale") { return base + '[effect("BOLT • Start Scale X")("Slider"),effect("BOLT • Start Scale Y")("Slider"),100];'; }
        if (kind === "rotation") { return base + 'effect("BOLT • Rotation")("Slider");'; }
        if (kind === "skew") { return base + 'effect("BOLT • Skew")("Slider");'; }
        if (kind === "tracking") { return base + 'effect("BOLT • Tracking")("Slider");'; }
        if (kind === "blur") { return base + 'var b=effect("BOLT • Blur")("Slider");[b,b];'; }
        if (kind === "opacity") { return base + '100-effect("BOLT • Opacity")("Slider");'; }
        return "";
    }

    function boltBuildMarkerTextAnimator(layer, preset) {
        var textGroup = null, animators = null, animator = null, animatorIndex = 0, added = 0;
        try { textGroup = layer.property("ADBE Text Properties"); } catch (ignoreTextProperties) {}
        if (!textGroup) { return false; }
        try {
            boltRemoveMarkerTextAnimators(layer);
            animators = textGroup.property("ADBE Text Animators");
            animator = animators.addProperty("ADBE Text Animator");
            animatorIndex = animator.propertyIndex;
            animator = textGroup.property("ADBE Text Animators").property(animatorIndex);
            animator.name = BOLT_MARKER_TEXT_PREFIX + preset.name;

            if (preset.x || preset.y) {
                if (boltAddMarkerTextProperty(textGroup, animatorIndex, "ADBE Text Position 3D", [preset.x || 0, preset.y || 0, 0], boltMarkerTextValueExpression("position"))) { added++; }
            }
            if (preset.sx !== 100 || preset.sy !== 100) {
                if (boltAddMarkerTextProperty(textGroup, animatorIndex, "ADBE Text Scale 3D", [preset.sx, preset.sy, 100], boltMarkerTextValueExpression("scale"))) { added++; }
            }
            if (preset.rot) {
                if (boltAddMarkerTextProperty(textGroup, animatorIndex, "ADBE Text Rotation", preset.rot, boltMarkerTextValueExpression("rotation"))) { added++; }
            }
            if (preset.skew) {
                if (boltAddMarkerTextProperty(textGroup, animatorIndex, "ADBE Text Skew", preset.skew, boltMarkerTextValueExpression("skew"))) { added++; }
            }
            if (preset.tracking) {
                if (boltAddMarkerTextProperty(textGroup, animatorIndex, "ADBE Text Tracking Amount", preset.tracking, boltMarkerTextValueExpression("tracking"))) { added++; }
            }
            if (preset.blur) {
                if (boltAddMarkerTextProperty(textGroup, animatorIndex, "ADBE Text Blur", [preset.blur, preset.blur], boltMarkerTextValueExpression("blur"))) { added++; }
            }
            if (boltAddMarkerTextProperty(textGroup, animatorIndex, "ADBE Text Opacity", 0, boltMarkerTextValueExpression("opacity"))) { added++; }

            animators = textGroup.property("ADBE Text Animators");
            animator = animators.property(animatorIndex);
            var selectors = animator.property("ADBE Text Selectors");
            var selector = selectors.addProperty("ADBE Text Selector");
            var selectorIndex = selector.propertyIndex;
            animator = textGroup.property("ADBE Text Animators").property(animatorIndex);
            selector = animator.property("ADBE Text Selectors").property(selectorIndex);
            var start = selector.property("ADBE Text Percent Start");
            var end = selector.property("ADBE Text Percent End");
            var revealExpression = BOLT_ANIM_EXPRESSION_TAG + "\n" +
                'clamp(effect("BOLT • Progress")("Slider"),0,100);';
            if (preset.reverse) {
                start.setValue(0);
                if (boltCanOwnExpression(end)) { end.expression = BOLT_ANIM_EXPRESSION_TAG + "\n" + '100-clamp(effect("BOLT • Progress")("Slider"),0,100);'; }
            } else {
                end.setValue(100);
                if (boltCanOwnExpression(start)) { start.expression = revealExpression; }
            }
            var advanced = selector.property("ADBE Text Range Advanced");
            if (advanced) {
                try {
                    var based = advanced.property("ADBE Text Range Type2");
                    if (based) { based.setValue(1); }
                    var smoothness = advanced.property("ADBE Text Selector Smoothness");
                    if (smoothness) { smoothness.setValue(/^Typewriter|^Flicker/i.test(preset.name) ? 0 : 100); }
                    var easeHigh = advanced.property("ADBE Text Levels Max Ease");
                    var easeLow = advanced.property("ADBE Text Levels Min Ease");
                    if (easeHigh) { easeHigh.setValue(Math.min(100, preset.ease || 75)); }
                    if (easeLow) { easeLow.setValue(-Math.min(100, preset.ease || 75)); }
                } catch (ignoreMarkerTextAdvanced) {}
            }
            return added > 0;
        } catch (markerTextError) {
            try {
                animators = textGroup.property("ADBE Text Animators");
                animator = animatorIndex ? animators.property(animatorIndex) : null;
                if (animator) { animator.remove(); }
            } catch (ignoreRemoveBrokenMarkerText) {}
        }
        return false;
    }

    function boltClearOwnedTransformExpressions(layer) {
        var tr = null, properties = [], i, property, changed = 0;
        try { tr = layer.property("ADBE Transform Group"); } catch (ignoreClearTransformGroup) {}
        if (!tr) { return 0; }
        properties = [tr.property("ADBE Opacity"), tr.property("ADBE Position"), tr.property("ADBE Position_0"),
            tr.property("ADBE Position_1"), tr.property("ADBE Scale"), tr.property("ADBE Rotate Z")];
        for (i = 0; i < properties.length; i++) {
            property = properties[i];
            try {
                if (property && property.expression.indexOf(BOLT_ANIM_EXPRESSION_TAG) === 0) {
                    property.expression = "";
                    changed++;
                }
            } catch (ignoreClearOwnedTransform) {}
        }
        return changed;
    }

    function boltCanOwnExpression(prop) {
        if (!prop) { return false; }
        try {
            if (!prop.canSetExpression) { return false; }
            if (!prop.expressionEnabled || !trim(prop.expression).length) { return true; }
            return prop.expression.indexOf(BOLT_ANIM_EXPRESSION_TAG) === 0;
        } catch (ignoreExpressionCheck) { return false; }
    }

    function applyMarkerAnimationByIndex(presetIndex) {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        var index = parseInt(presetIndex, 10);
        if (isNaN(index) || index < 0 || index >= TEXT_PRESETS.length) { throw new Error("Choose a valid animation preset."); }
        var preset = TEXT_PRESETS[index];
        var frames = Math.round(clampNumber(state.ui.textDuration.text, 2, 300, 18));
        var modeText = state.textModeValue || "IN";
        var mode = modeText === "OUT" ? 2 : (modeText === "BOTH" ? 3 : 1);
        var applied = 0, skipped = 0, partial = 0, i;
        state.textSelectedIndex = index;
        app.beginUndoGroup("Bolt Marker Animation");
        try {
            for (i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var tr = layer.property("ADBE Transform Group");
                if (!tr) { skipped++; continue; }
                var textGroup = null;
                try { textGroup = layer.property("ADBE Text Properties"); } catch (ignoreMarkerTextGroup) {}
                var isTextLayer = !!textGroup;

                var opacity = tr.property("ADBE Opacity");
                var position = tr.property("ADBE Position");
                var scale = tr.property("ADBE Scale");
                var rotation = tr.property("ADBE Rotate Z");
                var positionSeparated = false, posX = null, posY = null;
                try { positionSeparated = !!(position && position.dimensionsSeparated); } catch (ignoreSeparatedCheck) {}
                if (positionSeparated) {
                    try { posX = tr.property("ADBE Position_0"); } catch (ignorePosX) {}
                    try { posY = tr.property("ADBE Position_1"); } catch (ignorePosY) {}
                }

                var canOpacity = boltCanOwnExpression(opacity);
                var canScale = boltCanOwnExpression(scale);
                var canRotation = boltCanOwnExpression(rotation);
                var canPosition = positionSeparated ? (boltCanOwnExpression(posX) || boltCanOwnExpression(posY)) : boltCanOwnExpression(position);
                var writableCount = (canOpacity ? 1 : 0) + (canPosition ? 1 : 0) + (canScale ? 1 : 0) + (canRotation ? 1 : 0);
                if (!isTextLayer && !writableCount) { skipped++; continue; }
                if (!isTextLayer && writableCount < 4) { partial++; }

                var progressEffect = boltEnsureSlider(layer, "BOLT • Progress", 0);
                var progressProp = progressEffect.property(1);
                if (!boltCanOwnExpression(progressProp)) { skipped++; continue; }
                progressProp.expression = boltMarkerProgressExpression();
                boltEnsureSlider(layer, "BOLT • Mode 1-IN 2-OUT 3-BOTH", mode);
                boltEnsureSlider(layer, "BOLT • Duration (frames)", frames);
                boltEnsureSlider(layer, "BOLT • Ease", preset.ease || 75);
                boltEnsureSlider(layer, "BOLT • Opacity", 100);
                boltEnsureSlider(layer, "BOLT • X", preset.x || 0);
                boltEnsureSlider(layer, "BOLT • Y", preset.y || 0);
                boltEnsureSlider(layer, "BOLT • Start Scale X", preset.sx === undefined ? 100 : preset.sx);
                boltEnsureSlider(layer, "BOLT • Start Scale Y", preset.sy === undefined ? 100 : preset.sy);
                boltEnsureSlider(layer, "BOLT • Rotation", preset.rot || 0);
                boltEnsureSlider(layer, "BOLT • Blur", preset.blur || 0);
                boltEnsureSlider(layer, "BOLT • Tracking", preset.tracking || 0);
                boltEnsureSlider(layer, "BOLT • Skew", preset.skew || 0);
                var legacyScale = boltFindNamedEffect(layer, "BOLT • Start Scale");
                if (legacyScale) { try { legacyScale.remove(); } catch (ignoreLegacyScaleRemove) {} }

                var frameDuration = Math.max(0.001, comp.frameDuration);
                var duration = frames * frameDuration;
                var markerProp = layer.property("ADBE Marker");
                if (mode === 1) {
                    boltRemoveMarkerByComment(markerProp, "BOLT OUT");
                    boltSetAnimationMarker(layer, "BOLT IN", Math.max(layer.inPoint, Math.min(comp.time, layer.outPoint - duration)));
                } else if (mode === 2) {
                    boltRemoveMarkerByComment(markerProp, "BOLT IN");
                    boltSetAnimationMarker(layer, "BOLT OUT", Math.min(layer.outPoint, Math.max(comp.time, layer.inPoint + duration)));
                } else {
                    boltSetAnimationMarker(layer, "BOLT IN", layer.inPoint);
                    boltSetAnimationMarker(layer, "BOLT OUT", layer.outPoint);
                }

                if (isTextLayer && boltBuildMarkerTextAnimator(layer, preset)) {
                    boltClearOwnedTransformExpressions(layer);
                    var oldLayerBlur = boltFindNamedEffect(layer, "BOLT • Motion Blur");
                    if (oldLayerBlur) { try { oldLayerBlur.remove(); } catch (ignoreRemoveOldLayerBlur) {} }
                    applied++;
                    continue;
                }
                if (!writableCount) { skipped++; continue; }
                if (isTextLayer && writableCount < 4) { partial++; }

                if (canOpacity) { opacity.expression = boltAnimationAmountExpression("opacity"); }
                if (positionSeparated) {
                    if (boltCanOwnExpression(posX)) { posX.expression = boltAnimationAmountExpression("positionX"); }
                    if (boltCanOwnExpression(posY)) { posY.expression = boltAnimationAmountExpression("positionY"); }
                } else if (canPosition) {
                    position.expression = boltAnimationAmountExpression("position");
                }
                if (canScale) { scale.expression = boltAnimationAmountExpression("scale"); }
                if (canRotation) { rotation.expression = boltAnimationAmountExpression("rotation"); }

                var blurFx = boltFindNamedEffect(layer, "BOLT • Motion Blur");
                if (!blurFx && (preset.blur || 0) > 0) { blurFx = addEffectSafe(layer, "ADBE Gaussian Blur 2", "BOLT • Motion Blur"); }
                if (blurFx) {
                    var blurProp = effectPropertyByIndexOrName(blurFx, 1, ["Blurriness"]);
                    if (blurProp && boltCanOwnExpression(blurProp)) { blurProp.expression = boltAnimationAmountExpression("blur"); }
                    try { var repeat = effectPropertyByIndexOrName(blurFx, 3, ["Repeat Edge Pixels"]); if (repeat) { repeat.setValue(true); } } catch (ignoreRepeatEdges) {}
                }
                applied++;
            }
        } finally { app.endUndoGroup(); }
        if (!applied) { throw new Error("No compatible layers were updated. Bolt safely preserves existing custom transform expressions."); }
        setStatus(preset.name + " applied to " + applied + " layer(s)" + (partial ? " • " + partial + " partially protected" : "") + (skipped ? " • " + skipped + " skipped" : ""), (partial || skipped) ? "warning" : "ok");
    }

    function removeBoltMarkerAnimation() {
        var comp = activeCompOrThrow(), layers = selectedLayersOrThrow(comp), removed = 0, i, j;
        app.beginUndoGroup("Remove Bolt Marker Animation");
        try {
            for (i = 0; i < layers.length; i++) {
                var layer = layers[i], tr = layer.property("ADBE Transform Group"), props = [], p, effects, changed = false;
                if (tr) {
                    props = [tr.property("ADBE Opacity"), tr.property("ADBE Position"), tr.property("ADBE Position_0"), tr.property("ADBE Position_1"), tr.property("ADBE Scale"), tr.property("ADBE Rotate Z")];
                }
                for (j = 0; j < props.length; j++) {
                    p = props[j];
                    try {
                        if (p && p.expression.indexOf(BOLT_ANIM_EXPRESSION_TAG) === 0) { p.expression = ""; changed = true; }
                    } catch (ignoreRemoveExpr) {}
                }
                if (boltRemoveMarkerByComment(layer.property("ADBE Marker"), "BOLT IN")) { changed = true; }
                if (boltRemoveMarkerByComment(layer.property("ADBE Marker"), "BOLT OUT")) { changed = true; }
                if (boltRemoveMarkerTextAnimators(layer)) { changed = true; }
                effects = layer.property("ADBE Effect Parade");
                if (effects) {
                    for (j = effects.numProperties; j >= 1; j--) {
                        try {
                            var fx = effects.property(j);
                            if (fx.name.indexOf(BOLT_ANIM_EFFECT_PREFIX) === 0) { fx.remove(); changed = true; }
                        } catch (ignoreRemoveFx) {}
                    }
                }
                if (changed) { removed++; }
            }
        } finally { app.endUndoGroup(); }
        setStatus(removed ? ("Removed Bolt marker animation from " + removed + " layer(s)") : "No Bolt marker animation found on the selected layers", removed ? "ok" : "warning");
    }

    function getAnchorTarget(layer, compTime, xFactor, yFactor) {
        var rect;
        try { rect = layer.sourceRectAtTime(compTime, false); }
        catch (ignoreRect) { rect = {left:0, top:0, width:layer.width || 0, height:layer.height || 0}; }
        return [rect.left + rect.width * xFactor, rect.top + rect.height * yFactor];
    }

    function rotate2DVector(delta, degrees) {
        var r = degrees * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
        return [delta[0]*c - delta[1]*s, delta[0]*s + delta[1]*c];
    }

    function _rot3X(a, p) { var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
    function _rot3Y(a, p) { var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
    function _rot3Z(a, p) { var r = a * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }

    function rotate3DVector(v, orientation, rx, ry, rz) {
        var out = [v[0], v[1], v[2] || 0];
        out = _rot3X(orientation[0] || 0, out); out = _rot3Y(orientation[1] || 0, out); out = _rot3Z(orientation[2] || 0, out);
        out = _rot3X(rx || 0, out); out = _rot3Y(ry || 0, out); out = _rot3Z(rz || 0, out);
        return out;
    }

    function setPositionPreservingDimensions(position, value, time) {
        try {
            if (!position || position.expressionEnabled) { return false; }
            if (position.dimensionsSeparated) {
                var parent = position.parentProperty;
                var x = parent.property("ADBE Position_0"), y = parent.property("ADBE Position_1"), z = parent.property("ADBE Position_2");
                if (!x || !y || x.expressionEnabled || y.expressionEnabled || (z && value.length > 2 && z.expressionEnabled)) { return false; }
                var oldX = x.valueAtTime(time, false), oldY = y.valueAtTime(time, false), oldZ = z && value.length > 2 ? z.valueAtTime(time, false) : null;
                try {
                    if (x.numKeys) { x.setValueAtTime(time,value[0]); } else { x.setValue(value[0]); }
                    if (y.numKeys) { y.setValueAtTime(time,value[1]); } else { y.setValue(value[1]); }
                    if (z && value.length>2) { if (z.numKeys) { z.setValueAtTime(time,value[2]); } else { z.setValue(value[2]); } }
                } catch (separatedError) {
                    try { if (x.numKeys) { x.setValueAtTime(time,oldX); } else { x.setValue(oldX); } } catch (ignoreRestoreX) {}
                    try { if (y.numKeys) { y.setValueAtTime(time,oldY); } else { y.setValue(oldY); } } catch (ignoreRestoreY) {}
                    try { if (z && oldZ !== null) { if (z.numKeys) { z.setValueAtTime(time,oldZ); } else { z.setValue(oldZ); } } } catch (ignoreRestoreZ) {}
                    return false;
                }
                return true;
            }
        } catch (ignoreSeparated) {}
        try {
            if (position.numKeys) { position.setValueAtTime(time, value); } else { position.setValue(value); }
            return true;
        } catch (ignorePositionWrite) {}
        return false;
    }

    function adjustAnchorSelected(xFactor, yFactor) {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        var changed = 0, skipped = 0, i;
        app.beginUndoGroup("Bolt Anchor Point");
        try {
            for (i=0; i<layers.length; i++) {
                var layer=layers[i], tr=layer.property("ADBE Transform Group");
                var anchor=tr?tr.property("ADBE Anchor Point"):null, position=tr?tr.property("ADBE Position"):null, scale=tr?tr.property("ADBE Scale"):null;
                if (!anchor || !position || layer.locked || anchor.expressionEnabled || position.expressionEnabled) { skipped++; continue; }
                var oldA=anchor.valueAtTime(comp.time,false), new2=getAnchorTarget(layer,comp.time,xFactor,yFactor);
                var newA=oldA.length>2?[new2[0],new2[1],oldA[2]]:new2;
                var delta=[newA[0]-oldA[0],newA[1]-oldA[1],(newA.length>2?newA[2]-oldA[2]:0)];
                var sc=scale?scale.valueAtTime(comp.time,false):[100,100,100];
                delta=[delta[0]*(sc[0]===undefined?100:sc[0])/100,delta[1]*(sc[1]===undefined?100:sc[1])/100,delta[2]*(sc[2]===undefined?100:sc[2])/100];
                var transformed;
                if (layer.threeDLayer) {
                    var orient=tr.property("ADBE Orientation"), rx=tr.property("ADBE Rotate X"), ry=tr.property("ADBE Rotate Y"), rz=tr.property("ADBE Rotate Z");
                    transformed=rotate3DVector(delta,orient?orient.value:[0,0,0],rx?rx.value:0,ry?ry.value:0,rz?rz.value:0);
                } else {
                    var rot=tr.property("ADBE Rotate Z"); transformed=rotate2DVector(delta,rot?rot.valueAtTime(comp.time,false):0); transformed=[transformed[0],transformed[1]];
                }
                var pos=position.valueAtTime(comp.time,false), next=[];
                next[0]=pos[0]+transformed[0]; next[1]=pos[1]+transformed[1]; if (pos.length>2) { next[2]=pos[2]+(transformed[2]||0); }
                if (anchor.numKeys) { anchor.setValueAtTime(comp.time,newA); } else { anchor.setValue(newA); }
                if (!setPositionPreservingDimensions(position,next,comp.time)) {
                    try { if (anchor.numKeys) { anchor.setValueAtTime(comp.time,oldA); } else { anchor.setValue(oldA); } } catch (ignoreAnchorRestore) {}
                    skipped++;
                    continue;
                }
                changed++;
            }
        } finally { app.endUndoGroup(); }
        setStatus("Anchor adjusted on " + changed + " layer(s)" + (skipped?" • "+skipped+" skipped":""), skipped?"warning":"ok");
    }

    function applyCurvePreset() {
        var comp=activeCompOrThrow(), layers=selectedLayersOrThrow(comp);
        if (!state.ui.curvePreset.selection) { throw new Error("Choose a curve preset."); }
        var preset=CURVE_PRESETS[state.ui.curvePreset.selection.index], changed=0, i,j,k;
        app.beginUndoGroup("Bolt Curve Preset");
        try {
            for(i=0;i<layers.length;i++) {
                var props=layers[i].selectedProperties;
                for(j=0;j<props.length;j++) {
                    var prop=props[j]; if (!(prop instanceof Property) || prop.numKeys<1) { continue; }
                    for(k=1;k<=prop.numKeys;k++) {
                        if (!prop.keySelected(k)) { continue; }
                        try {
                            if (preset.type==="linear") { prop.setInterpolationTypeAtKey(k,KeyframeInterpolationType.LINEAR,KeyframeInterpolationType.LINEAR); }
                            else if (preset.type==="hold") { prop.setInterpolationTypeAtKey(k,KeyframeInterpolationType.HOLD,KeyframeInterpolationType.HOLD); }
                            else {
                                if (!boltSetTemporalEase(prop, k, preset["in"], preset["out"])) { continue; }
                            }
                            changed++;
                        } catch(ignoreCurve) {}
                    }
                }
            }
        } finally { app.endUndoGroup(); }
        setStatus(changed?preset.name+" applied to "+changed+" keyframe(s)":"Select keyframes first",changed?"ok":"warning");
    }

    function boltMotionValueIsNumeric(value) {
        if (typeof value === "number") { return true; }
        if (!(value instanceof Array) || !value.length) { return false; }
        var i;
        for (i = 0; i < value.length; i++) {
            if (typeof value[i] !== "number" || isNaN(value[i])) { return false; }
        }
        return true;
    }

    function boltMotionAddFactor(target, delta, factor, clampColor) {
        if (typeof target === "number") { return target + delta * factor; }
        var output = [], i, value;
        for (i = 0; i < target.length; i++) {
            value = target[i] + delta[i] * factor;
            if (clampColor) { value = Math.max(0, Math.min(1, value)); }
            output.push(value);
        }
        return output;
    }

    function boltMotionDelta(previous, target) {
        if (typeof target === "number") { return target - previous; }
        var output = [], i;
        for (i = 0; i < target.length; i++) { output.push(target[i] - previous[i]); }
        return output;
    }

    function boltMotionHasUsefulDelta(delta) {
        if (typeof delta === "number") { return Math.abs(delta) > 0.000001; }
        var i;
        for (i = 0; i < delta.length; i++) { if (Math.abs(delta[i]) > 0.000001) { return true; } }
        return false;
    }

    function boltSelectedKeySnapshots(prop) {
        var output = [], keyIndex, selected = [], i, nextTime;
        try { selected = prop.selectedKeys || []; } catch (ignoreSelectedKeys) { selected = []; }
        for (i = 0; i < selected.length; i++) {
            keyIndex = selected[i];
            if (keyIndex <= 1 || keyIndex > prop.numKeys) { continue; }
            nextTime = keyIndex < prop.numKeys ? prop.keyTime(keyIndex + 1) : null;
            output.push({
                time: prop.keyTime(keyIndex),
                previousTime: prop.keyTime(keyIndex - 1),
                previousValue: prop.keyValue(keyIndex - 1),
                targetValue: prop.keyValue(keyIndex),
                nextTime: nextTime
            });
        }
        output.sort(function(a,b){ return b.time - a.time; });
        return output;
    }

    function boltTemporalEaseDimensions(prop, keyIndex) {
        try {
            if (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL ||
                prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {
                return 1;
            }
        } catch (ignoreSpatialEaseType) {}
        try {
            var sample = prop.keyValue(keyIndex);
            return sample instanceof Array ? sample.length : 1;
        } catch (ignoreEaseSample) {}
        return 1;
    }

    function boltSetTemporalEase(prop, keyIndex, incomingInfluence, outgoingInfluence) {
        try {
            var dimensions = boltTemporalEaseDimensions(prop, keyIndex);
            var incoming = [], outgoing = [], d;
            for (d = 0; d < dimensions; d++) {
                incoming.push(new KeyframeEase(0, clampNumber(incomingInfluence, 0.1, 100, 75)));
                outgoing.push(new KeyframeEase(0, clampNumber(outgoingInfluence, 0.1, 100, 75)));
            }
            prop.setInterpolationTypeAtKey(keyIndex, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            prop.setTemporalEaseAtKey(keyIndex, incoming, outgoing);
            return true;
        } catch (ignoreTemporalEase) {}
        return false;
    }

    function boltApplySelectedMotionEase(prop, keyIndex, influence) {
        return boltSetTemporalEase(prop, keyIndex, influence, influence);
    }

    function boltSetGeneratedKeyEase(prop, time, influence) {
        try {
            var index = prop.nearestKeyIndex(time);
            if (Math.abs(prop.keyTime(index) - time) > 0.0001) { return; }
            boltApplySelectedMotionEase(prop, index, influence);
            try { prop.setSelectedAtKey(index, false); } catch (ignoreDeselectGenerated) {}
        } catch (ignoreGeneratedEase) {}
    }

    function applySmartBounce() {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        var mode = state.ui.bounceMode.selection ? state.ui.bounceMode.selection.text : "Bounce";
        var frames = Math.round(clampNumber(state.ui.bounceDuration.text, 3, 60, 12));
        var strength = clampNumber(state.ui.bounceStrength.text, 1, 100, 18) / 100;
        var factors;
        if (mode === "Elastic") { factors = [1.00, -0.72, 0.48, -0.28, 0.14, 0]; }
        else if (mode === "Overshoot") { factors = [1.00, 0]; }
        else { factors = [1.00, -0.48, 0.22, -0.08, 0]; }

        var appliedKeys = 0, skipped = 0, i, j, s, prop, props, snapshots, snapshot;
        app.beginUndoGroup("Bolt Selected Keyframe " + mode);
        try {
            for (i = 0; i < layers.length; i++) {
                props = layers[i].selectedProperties;
                for (j = 0; j < props.length; j++) {
                    prop = props[j];
                    if (!(prop instanceof Property) || prop.numKeys < 2 || prop.expressionEnabled) { continue; }
                    snapshots = boltSelectedKeySnapshots(prop);
                    if (!snapshots.length) { continue; }
                    for (s = 0; s < snapshots.length; s++) {
                        snapshot = snapshots[s];
                        if (!boltMotionValueIsNumeric(snapshot.previousValue) || !boltMotionValueIsNumeric(snapshot.targetValue)) { skipped++; continue; }
                        var delta = boltMotionDelta(snapshot.previousValue, snapshot.targetValue);
                        if (!boltMotionHasUsefulDelta(delta)) { skipped++; continue; }
                        var requestedDuration = frames * comp.frameDuration;
                        var availableDuration;
                        if (snapshot.nextTime === null) {
                            availableDuration = Math.max(0, Math.min(comp.duration, layers[i].outPoint) - snapshot.time);
                        } else {
                            availableDuration = Math.max(0, snapshot.nextTime - snapshot.time - comp.frameDuration);
                        }
                        var duration = Math.min(requestedDuration, availableDuration);
                        if (duration < comp.frameDuration * factors.length) { skipped++; continue; }
                        var clampColor = false;
                        try { clampColor = prop.propertyValueType === PropertyValueType.COLOR; } catch (ignoreColorType) {}
                        var f, keyTime, value;
                        for (f = 0; f < factors.length; f++) {
                            keyTime = snapshot.time + duration * ((f + 1) / factors.length);
                            value = boltMotionAddFactor(snapshot.targetValue, delta, factors[f] * strength, clampColor);
                            prop.setValueAtTime(keyTime, value);
                            boltSetGeneratedKeyEase(prop, keyTime, mode === "Elastic" ? 68 : 82);
                        }
                        try {
                            var targetIndex = prop.nearestKeyIndex(snapshot.time);
                            boltApplySelectedMotionEase(prop, targetIndex, mode === "Elastic" ? 68 : 82);
                            prop.setSelectedAtKey(targetIndex, true);
                        } catch (ignoreTargetEase) {}
                        appliedKeys++;
                    }
                    snapshots.length = 0;
                }
            }
        } finally { app.endUndoGroup(); }
        setStatus(appliedKeys ? mode + " applied to " + appliedKeys + " selected keyframe(s)" + (skipped ? " • " + skipped + " skipped" : "") : "Select animated property keyframes with a previous key", appliedKeys ? (skipped ? "warning" : "ok") : "warning");
    }

    function addEffectSafe(layer, matchName, displayName) {
        var effects = null, fx = null, fallback = "";
        try { effects = layer.property("ADBE Effect Parade"); } catch (ignoreEffectGroup) {}
        if (!effects) { return null; }
        try { fx = effects.addProperty(matchName); } catch (ignoreMatchName) {}
        if (!fx) {
            if (matchName === "ADBE Glo2") { fallback = "Glow"; }
            else if (matchName === "CS Vignette") { fallback = "CC Vignette"; }
            else if (matchName === "ADBE Ramp") { fallback = "Gradient Ramp"; }
            else if (matchName === "ADBE Slider Control") { fallback = "Slider Control"; }
            else if (matchName === "ADBE Color Control") { fallback = "Color Control"; }
            else if (matchName === "ADBE Drop Shadow") { fallback = "Drop Shadow"; }
            else if (matchName === "ADBE Bevel Alpha") { fallback = "Bevel Alpha"; }
            else if (matchName === "ADBE Fill") { fallback = "Fill"; }
            if (fallback.length) { try { fx = effects.addProperty(fallback); } catch (ignoreDisplayName) {} }
        }
        if (fx && displayName) { try { fx.name = displayName; } catch (ignoreFxName) {} }
        return fx;
    }

    function effectPropertyByIndexOrName(effect, index, names) {
        var prop = null, i;
        try { prop = effect.property(index); } catch (ignoreEffectIndex) {}
        if (prop) { return prop; }
        if (!(names instanceof Array)) { names = [names]; }
        for (i = 0; i < names.length; i++) {
            try { prop = effect.property(names[i]); } catch (ignoreEffectName) { prop = null; }
            if (prop) { return prop; }
        }
        return null;
    }

    function safeSetEffectProperty(effect, index, names, value) {
        var prop = effectPropertyByIndexOrName(effect, index, names);
        if (!prop || prop.expressionEnabled) { return false; }
        try { prop.setValue(value); return true; } catch (ignoreEffectValue) {}
        return false;
    }

    function safeSetEffectIndex(effect, index, value) {
        return safeSetEffectProperty(effect, index, [], value);
    }

    function boltRemoveEffectsByName(layer, pattern) {
        var effects = null, i, removed = 0, name;
        try { effects = layer.property("ADBE Effect Parade"); } catch (ignoreRemoveEffectsGroup) {}
        if (!effects) { return 0; }
        for (i = effects.numProperties; i >= 1; i--) {
            try {
                name = safeString(effects.property(i).name);
                if (pattern.test(name)) {
                    effects.property(i).remove();
                    removed++;
                }
            } catch (ignoreRemoveOwnedEffect) {}
        }
        return removed;
    }

    function selectedGlowPreset() {
        var index = 0;
        if (state.ui && state.ui.glowPreset && state.ui.glowPreset.selection) { index = state.ui.glowPreset.selection.index; }
        return GLOW_PRESETS[index] || GLOW_PRESETS[0];
    }

    function applyDeepGlow() {
        var comp = activeCompOrThrow(), layers = selectedLayersOrThrow(comp);
        var size = clampNumber(state.ui.glowSize.text, 2, 500, 55);
        var intensity = clampNumber(state.ui.glowIntensity.text, 0.1, 10, 1.2);
        var preset = selectedGlowPreset(), applied = 0, skipped = 0, effectsAdded = 0, i, j;
        app.beginUndoGroup("Bolt Glow");
        try {
            for (i = 0; i < layers.length; i++) {
                var layer = layers[i], effectGroup = null, layerPasses = 0, alphaBased = false;
                try { effectGroup = layer.property("ADBE Effect Parade"); } catch (ignoreLayerEffects) {}
                if (!effectGroup) { skipped++; continue; }
                boltRemoveEffectsByName(layer, /^Bolt v[\d.]+ • Glow \d+$/);
                try { alphaBased = !!layer.property("ADBE Text Properties") || !!layer.property("ADBE Root Vectors Group"); } catch (ignoreAlphaType) {}
                for (j = 0; j < preset.passes.length; j++) {
                    var spec = preset.passes[j];
                    var fx = addEffectSafe(layer, "ADBE Glo2", "Bolt v" + VERSION + " • Glow " + (j + 1));
                    if (!fx) { continue; }
                    try { fx.enabled = true; } catch (ignoreGlowEnable) {}
                    safeSetEffectProperty(fx, 1, ["Glow Based On"], alphaBased ? 2 : 1);
                    safeSetEffectProperty(fx, 2, ["Glow Threshold", "Threshold"], spec[0]);
                    safeSetEffectProperty(fx, 3, ["Glow Radius", "Radius"], Math.max(1, size * spec[1]));
                    safeSetEffectProperty(fx, 4, ["Glow Intensity", "Intensity"], Math.max(0.05, intensity * spec[2]));
                    layerPasses++;
                    effectsAdded++;
                }
                if (layerPasses > 0) { applied++; } else { skipped++; }
            }
        } finally { app.endUndoGroup(); }
        if (!applied) {
            throw new Error("Glow could not be added. Select a text, shape, image, solid or video layer that accepts effects.");
        }
        setStatus(preset.name + " Glow applied to " + applied + " layer(s) • " + effectsAdded + " native Glow effects" + (skipped ? " • " + skipped + " skipped" : ""), skipped ? "warning" : "ok");
    }

    function applyVignette() {
        var comp=activeCompOrThrow(), amount=clampNumber(state.ui.vignetteAmount.text,1,100,35);
        app.beginUndoGroup("Bolt Vignette");
        try {
            var layer=null, i, created=false;
            for(i=1;i<=comp.numLayers;i++){if(comp.layer(i).name==="BOLT_VIGNETTE"){layer=comp.layer(i);break;}}
            if(!layer){layer=comp.layers.addSolid([1,1,1],"BOLT_VIGNETTE",comp.width,comp.height,comp.pixelAspect,comp.duration);created=true;}
            try{layer.locked=false;}catch(ignoreUnlockVignette){}
            layer.adjustmentLayer=true; layer.startTime=0; layer.inPoint=0; layer.outPoint=comp.duration;
            var fx=boltFindNamedEffect(layer,"Bolt Vignette");
            if(!fx){fx=addEffectSafe(layer,"CS Vignette","Bolt Vignette");}
            if(!fx){if(created){layer.remove();}throw new Error("CC Vignette is unavailable in this After Effects installation.");}
            safeSetEffectIndex(fx,1,-amount); safeSetEffectIndex(fx,2,60); safeSetEffectIndex(fx,3,25);
            try{layer.locked=true;}catch(ignoreLockVignette){}
        } finally { app.endUndoGroup(); }
        setStatus("Vignette updated", "ok");
    }

    function layerPixelSize(layer, comp) {
        var w=comp.width,h=comp.height;
        try { if(layer.width){w=layer.width;} if(layer.height){h=layer.height;} } catch(ignoreLayerSize){}
        return [w,h];
    }

    function applyGradientPreset() {
        var comp=activeCompOrThrow();
        if(!state.ui.gradientPreset.selection){throw new Error("Choose a gradient preset.");}
        var preset=GRADIENT_PRESETS[state.ui.gradientPreset.selection.index], layers=comp.selectedLayers, targets=[], i, applied=0;
        app.beginUndoGroup("Bolt Gradient");
        try {
            if(layers && layers.length){for(i=0;i<layers.length;i++){targets.push(layers[i]);}}
            else {var solid=comp.layers.addSolid([1,1,1],"Gradient • "+preset.name,comp.width,comp.height,comp.pixelAspect,comp.duration);targets.push(solid);}
            for(i=0;i<targets.length;i++) {
                boltRemoveEffectsByName(targets[i], /^Bolt Gradient • /);
                var fx=addEffectSafe(targets[i],"ADBE Ramp","Bolt Gradient • "+preset.name); if(!fx){continue;}
                var s=layerPixelSize(targets[i],comp), start=[0,s[1]/2], end=[s[0],s[1]/2];
                if(preset.dir==="vertical"){start=[s[0]/2,0];end=[s[0]/2,s[1]];} else if(preset.dir==="diag"){start=[0,0];end=[s[0],s[1]];}
                safeSetEffectIndex(fx,1,start); safeSetEffectIndex(fx,2,hexToRgb01(preset.a)); safeSetEffectIndex(fx,3,end); safeSetEffectIndex(fx,4,hexToRgb01(preset.b)); safeSetEffectIndex(fx,7,0); applied++;
            }
        } finally { app.endUndoGroup(); }
        setStatus(preset.name+" gradient applied to "+applied+" layer(s)",applied?"ok":"warning");
    }

    function applyColorRecursive(group,color) {
        var changed=0,i,p;
        if(!group||!group.numProperties){return 0;}
        for(i=1;i<=group.numProperties;i++){
            p=group.property(i);
            try {
                if(p.matchName==="ADBE Vector Fill Color" || p.matchName==="ADBE Vector Stroke Color") { if(!p.expressionEnabled){p.setValue(color);changed++;} }
                else if(p.numProperties){changed+=applyColorRecursive(p,color);}
            } catch(ignoreColorProp){}
        }
        return changed;
    }

    function applyPaletteColor(colorHex) {
        var comp=activeCompOrThrow(), layers=selectedLayersOrThrow(comp), color=hexToRgb01(colorHex), changed=0,i;
        app.beginUndoGroup("Bolt Palette Color");
        try {
            for(i=0;i<layers.length;i++){
                var textProps=layers[i].property("ADBE Text Properties");
                if(textProps){try{var source=textProps.property("ADBE Text Document"),doc=source.value;doc.applyFill=true;doc.fillColor=color;source.setValue(doc);changed++;}catch(ignoreTextColor){}}
                changed+=applyColorRecursive(layers[i],color);
            }
        } finally { app.endUndoGroup(); }
        setStatus(colorHex+" applied to "+changed+" property/layer item(s)",changed?"ok":"warning");
    }

    function createPaletteControls() {
        var comp=activeCompOrThrow(); if(!state.ui.palettePreset.selection){throw new Error("Choose a palette.");}
        var palette=COLOR_PALETTES[state.ui.palettePreset.selection.index], i;
        app.beginUndoGroup("Bolt Palette Controls");
        try {
            var layer=comp.layers.addNull(); layer.name="BOLT_PALETTE • "+palette.name; layer.guideLayer=true;
            var effects=layer.property("ADBE Effect Parade");
            for(i=0;i<palette.colors.length;i++){
                var fx=effects.addProperty("ADBE Color Control"), idx=fx.propertyIndex; effects.property(idx).name="Color "+(i+1)+" • "+palette.colors[i];
                effects.property(idx).property("ADBE Color Control-0001").setValue(hexToRgb01(palette.colors[i]));
            }
        } finally { app.endUndoGroup(); }
        setStatus(palette.name+" palette controls created", "ok");
    }

    function updatePaletteButtons() {
        if(!state.ui||!state.ui.palettePreset||!state.ui.palettePreset.selection){return;}
        var palette=COLOR_PALETTES[state.ui.palettePreset.selection.index], i;
        for(i=0;i<state.ui.paletteButtons.length;i++){
            state.ui.paletteButtons[i].text=palette.colors[i];
            state.ui.paletteButtons[i].helpTip="Apply "+palette.colors[i]+" to selected text/shape fills";
        }
    }

    function timestampText() {
        var d=new Date(); function p(v){return v<10?"0"+v:String(v);} return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+"_"+p(d.getHours())+p(d.getMinutes())+p(d.getSeconds());
    }

    function findProjectFolderByName(name) {
        var i; for(i=1;i<=app.project.numItems;i++){var item=app.project.item(i);if(item instanceof FolderItem && item.name===name){return item;}} return null;
    }


    function projectPanelFolderForFile(file) {
        var category=categoryForFile(file), name="05_Other";
        if(category==="Images"){name="02_Images";} else if(category==="Video"){name="03_Video";} else if(category==="Audio"){name="04_Audio";}
        return findProjectFolderByName(name);
    }

    function waitForCreatedFile(file, timeoutMs) {
        var started=(new Date()).getTime(), probe, previousLength=-1, stableCount=0;
        while(((new Date()).getTime()-started)<timeoutMs){
            probe=new File(file.fsName);
            try {
                if(probe.exists && probe.length>0){
                    if(probe.length===previousLength){stableCount++;}else{stableCount=0;previousLength=probe.length;}
                    if(stableCount>=1){return probe;}
                }
            } catch(ignoreProbe) {}
            $.sleep(180);
        }
        probe=new File(file.fsName);
        try { return probe.exists && probe.length>0 ? probe : null; } catch(ignoreFinalProbe) { return null; }
    }

    function safeSnapshotTime(comp, preferredTime) {
        var frame=Math.max(0.001,Number(comp.frameDuration)||0.04);
        var requested = preferredTime === undefined || preferredTime === null ? comp.time : preferredTime;
        var time=Math.max(0,Number(requested)||0);
        var maximum=Math.max(0,(Number(comp.duration)||0)-frame);
        if(frame>0){time=Math.round(time/frame)*frame;}
        if(time>maximum){time=maximum;}
        if(time<0){time=0;}
        return time;
    }

    function removeFileQuietly(file) {
        try { if(file && file.exists){file.remove();} } catch(ignoreRemoveFile) {}
    }

    function snapshotPngFromFolder(folder, preferredStem) {
        if(!folder || !folder.exists){return null;}
        var stem=safeString(preferredStem).toLowerCase();
        var files=folder.getFiles(function(entry){
            if(!(entry instanceof File)){return false;}
            var name=entry.name.toLowerCase();
            return /\.png$/i.test(name) && (!stem.length || name.indexOf(stem)===0);
        });
        if(!files.length){
            files=folder.getFiles(function(entry){return entry instanceof File && /\.png$/i.test(entry.name);});
        }
        if(!files.length){return null;}
        files.sort(function(a,b){
            var am=0,bm=0;
            try{am=a.modified.getTime();}catch(ignoreAM){}
            try{bm=b.modified.getTime();}catch(ignoreBM){}
            return bm-am;
        });
        return files[0];
    }

    function snapshotViaRenderQueue(comp, destination, frameTime, errors) {
        var queue=app.project && app.project.renderQueue ? app.project.renderQueue : null;
        if(!queue){errors.push("Render Queue is unavailable.");return null;}
        var tempFolder=new Folder(Folder.temp.fsName+"/Bolt_Snapshot_"+timestampText()+"_"+Math.floor(Math.random()*100000));
        var rqItem=null, outputModule=null, pngTemplate="", rendered=null, result=null, i;
        try {
            ensureFolder(tempFolder);
            rqItem=queue.items.add(comp);
            try { rqItem.timeSpanStart=frameTime; } catch(ignoreSpanStart) {}
            try { rqItem.timeSpanDuration=Math.max(Number(comp.frameDuration)||0.04,0.001); } catch(ignoreSpanDuration) {}
            outputModule=rqItem.outputModule(1);
            var templates=outputModule.templates;
            for(i=0;i<templates.length;i++){
                if(/png/i.test(templates[i])){pngTemplate=templates[i];break;}
            }
            if(!pngTemplate){
                errors.push("No PNG Output Module template is installed for the Render Queue fallback.");
                return null;
            }
            outputModule.applyTemplate(pngTemplate);
            outputModule=rqItem.outputModule(1);
            outputModule.file=new File(tempFolder.fsName+"/Bolt_Frame.png");
            withOnlyQueueItem(rqItem,function(){queue.render();});
            rendered=snapshotPngFromFolder(tempFolder,"bolt_frame");
            if(!rendered){errors.push("Render Queue fallback completed without producing a PNG.");return null;}
            removeFileQuietly(destination);
            if(!rendered.copy(destination.fsName)){
                errors.push("Rendered snapshot could not be copied to Resources.");
                return null;
            }
            result=waitForCreatedFile(destination,5000);
            return result;
        } catch(renderError) {
            errors.push("Render Queue fallback: "+(renderError && renderError.message ? renderError.message : safeString(renderError)));
            return null;
        } finally {
            try { if(rqItem){rqItem.remove();} } catch(ignoreRemoveRQ) {}
            try {
                if(tempFolder && tempFolder.exists){
                    var leftovers=tempFolder.getFiles(), j;
                    for(j=0;j<leftovers.length;j++){try{leftovers[j].remove();}catch(ignoreLeftover){}}
                    tempFolder.remove();
                }
            } catch(ignoreTempFolderCleanup) {}
        }
    }

    function saveSnapshotReliable(comp, destination, preferredTime) {
        var errors=[], frameTime=safeSnapshotTime(comp,preferredTime), saved=null, temporary=null;
        state.lastSnapshotError="";
        try { ensureFolder(destination.parent); } catch(folderError) { errors.push("Resources folder: "+folderError.message); }
        removeFileQuietly(destination);
        try { comp.openInViewer(); } catch(openError) { errors.push("Open comp viewer: "+openError.message); }

        if(typeof comp.saveFrameToPng==="function"){
            try {
                comp.saveFrameToPng(frameTime,destination);
                saved=waitForCreatedFile(destination,20000);
                if(saved){return saved;}
                errors.push("Direct PNG export returned no file.");
            } catch(directError) {
                errors.push("Direct PNG export: "+(directError && directError.message ? directError.message : safeString(directError)));
            }

            temporary=new File(Folder.temp.fsName+"/Bolt_Frame_"+timestampText()+"_"+Math.floor(Math.random()*100000)+".png");
            removeFileQuietly(temporary);
            try {
                comp.saveFrameToPng(frameTime,temporary);
                saved=waitForCreatedFile(temporary,20000);
                if(saved){
                    removeFileQuietly(destination);
                    if(saved.copy(destination.fsName)){
                        removeFileQuietly(saved);
                        saved=waitForCreatedFile(destination,5000);
                        if(saved){return saved;}
                    }
                    errors.push("Temporary PNG was created but could not be copied to Resources.");
                } else {
                    errors.push("Temporary PNG export returned no file.");
                }
            } catch(tempError) {
                errors.push("Temporary PNG export: "+(tempError && tempError.message ? tempError.message : safeString(tempError)));
            }
            removeFileQuietly(temporary);
        } else {
            errors.push("saveFrameToPng is unavailable in this After Effects build.");
        }

        saved=snapshotViaRenderQueue(comp,destination,frameTime,errors);
        if(saved){return saved;}
        state.lastSnapshotError=errors.join(" | ");
        return null;
    }

    function captureSnapshot() {
        var comp=activeCompOrThrow(), root=chooseWorkspaceRoot();
        if(!root){return;}
        ensureFolder(root);
        var folders=getWorkspaceFolders(root), base=sanitizeName(comp.name);
        if(base.length>70){base=base.substring(0,70);}
        var file=uniqueFile(folders.resources,base+"_snapshot_"+timestampText()+".png");
        setStatus("Creating snapshot from "+comp.name+"...","ok");
        var created=saveSnapshotReliable(comp,file);
        if(!created){
            throw new Error("Snapshot was not created."+(state.lastSnapshotError?"\n\n"+state.lastSnapshotError:"")+"\n\nConfirm Edit > Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network.");
        }
        var imported;
        try {
            imported=app.project.importFile(new ImportOptions(created));
        } catch(importError) {
            throw new Error("Snapshot was saved, but AE could not import it: "+importError.message+"\n"+created.fsName);
        }
        var imagesFolder=findProjectFolderByName("02_Images");
        if(imagesFolder){try{imported.parentFolder=imagesFolder;}catch(ignoreSnapshotFolder){}}
        try { imported.selected=true; } catch(ignoreSelectSnapshot) {}
        setStatus("Snapshot saved and imported: "+created.name,"ok");
    }

    function readUtf8TextFile(file) {
        if(!file || !file.exists){return "";}
        var text="";
        try { file.encoding="UTF-8"; if(file.open("r")){text=file.read();file.close();} } catch(ignoreReadText){try{file.close();}catch(ignoreCloseText){}}
        return text;
    }

    function psSingleQuote(text) {
        return "'"+safeString(text).replace(/'/g,"''")+"'";
    }

    var _cachedPowerShellPath = null;
    function windowsPowerShellExecutable() {
        if (_cachedPowerShellPath !== null) { return _cachedPowerShellPath; }
        var root = "";
        try { root = $.getenv("SystemRoot") || $.getenv("WINDIR") || ""; } catch (ignoreEnv) {}
        if (root.length) {
            var full = new File(root + "/System32/WindowsPowerShell/v1.0/powershell.exe");
            if (full.exists) { _cachedPowerShellPath = full.fsName; return _cachedPowerShellPath; }
        }
        _cachedPowerShellPath = "powershell.exe";
        return _cachedPowerShellPath;
    }

    function windowsClipboardPaths(resourcesFolder) {
        var stamp=timestampText()+"_"+Math.floor(Math.random()*100000);
        var outputFile=new File(Folder.temp.fsName+"/bolt_clipboard_"+stamp+".txt");
        var errorFile=new File(Folder.temp.fsName+"/bolt_clipboard_"+stamp+".err.txt");
        var scriptFile=new File(Folder.temp.fsName+"/bolt_clipboard_"+stamp+".ps1");
        var imageFile=uniqueFile(resourcesFolder,"Clipboard_Image_"+stamp+".png");
        var script="";
        state.lastClipboardError="";
        script += "$ErrorActionPreference='SilentlyContinue'\r\n";
        script += "$out="+psSingleQuote(outputFile.fsName)+"\r\n";
        script += "$errOut="+psSingleQuote(errorFile.fsName)+"\r\n";
        script += "$imgOut="+psSingleQuote(imageFile.fsName)+"\r\n";
        script += "$enc=New-Object System.Text.UTF8Encoding($false)\r\n";
        script += "$items=New-Object System.Collections.Generic.List[string]\r\n";
        script += "$errors=New-Object System.Collections.Generic.List[string]\r\n";
        script += "try{Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop}catch{[void]$errors.Add('Windows.Forms: '+$_.Exception.Message)}\r\n";
        script += "function Add-BoltPath([string]$p){if([string]::IsNullOrWhiteSpace($p)){return};try{$resolved=(Resolve-Path -LiteralPath $p -ErrorAction Stop).Path;if(-not $items.Contains($resolved)){[void]$items.Add($resolved)}}catch{}}\r\n";
        script += "for($attempt=0;$attempt -lt 15 -and $items.Count -eq 0;$attempt++){\r\n";
        script += " try{if([System.Windows.Forms.Clipboard]::ContainsFileDropList()){foreach($p in [System.Windows.Forms.Clipboard]::GetFileDropList()){Add-BoltPath ([string]$p)}}}catch{[void]$errors.Add('FileDrop: '+$_.Exception.Message)}\r\n";
        script += " if($items.Count -eq 0){try{$data=[System.Windows.Forms.Clipboard]::GetDataObject();if($data -and $data.GetDataPresent([System.Windows.Forms.DataFormats]::FileDrop)){foreach($p in $data.GetData([System.Windows.Forms.DataFormats]::FileDrop)){Add-BoltPath ([string]$p)}}}catch{[void]$errors.Add('DataObject: '+$_.Exception.Message)}}\r\n";
        script += " if($items.Count -eq 0){try{if(Get-Command Get-Clipboard -ErrorAction SilentlyContinue){$drop=Get-Clipboard -Format FileDropList -ErrorAction SilentlyContinue;foreach($p in $drop){Add-BoltPath ([string]$p)}}}catch{}}\r\n";
        script += " if($items.Count -eq 0){try{if([System.Windows.Forms.Clipboard]::ContainsImage()){try{Add-Type -AssemblyName System.Drawing -ErrorAction SilentlyContinue}catch{};$bmp=[System.Windows.Forms.Clipboard]::GetImage();if($bmp){$bmp.Save($imgOut,[System.Drawing.Imaging.ImageFormat]::Png);$bmp.Dispose();Add-BoltPath $imgOut}}}catch{[void]$errors.Add('Image: '+$_.Exception.Message)}}\r\n";
        script += " if($items.Count -eq 0){try{if([System.Windows.Forms.Clipboard]::ContainsText()){$txt=[System.Windows.Forms.Clipboard]::GetText();foreach($line in ($txt -split '[\\r\\n]+')){$p=$line.Trim().Trim([char]34);if($p -match '^file:/'){try{$p=([Uri]$p).LocalPath}catch{}};Add-BoltPath $p}}}catch{[void]$errors.Add('Text: '+$_.Exception.Message)}}\r\n";
        script += " if($items.Count -eq 0){Start-Sleep -Milliseconds 120}\r\n";
        script += "}\r\n";
        script += "try{[System.IO.File]::WriteAllLines($out,$items,$enc)}catch{}\r\n";
        script += "try{[System.IO.File]::WriteAllLines($errOut,$errors,$enc)}catch{}\r\n";
        try {
            scriptFile.encoding="UTF-8";
            if(!scriptFile.open("w")){state.lastClipboardError="Could not create the temporary clipboard reader.";return [];}
            scriptFile.write("\uFEFF"+script);scriptFile.close();
            var ps=windowsPowerShellExecutable();
            var command='"'+ps+'" -NoLogo -NoProfile -NonInteractive -STA -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+scriptFile.fsName+'"';
            system.callSystem(command);
            if(!outputFile.exists){
                system.callSystem('cmd.exe /d /s /c ""'+ps+'" -NoLogo -NoProfile -NonInteractive -STA -WindowStyle Hidden -ExecutionPolicy Bypass -File "'+scriptFile.fsName+'""');
            }
        } catch(powerShellError) {
            state.lastClipboardError="PowerShell clipboard reader: "+(powerShellError.message||safeString(powerShellError));
            try{scriptFile.close();}catch(ignoreClosePowerShell){}
        }
        var output=readUtf8TextFile(outputFile);
        var diagnostic=readUtf8TextFile(errorFile);
        try{if(scriptFile.exists){scriptFile.remove();}}catch(ignoreScriptRemove){}
        try{if(outputFile.exists){outputFile.remove();}}catch(ignoreOutputRemove){}
        try{if(errorFile.exists){errorFile.remove();}}catch(ignoreErrorRemove){}
        output=safeString(output).replace(/\r/g,"\n");
        var raw=output.split(/\n+/),paths=[],i,line;
        for(i=0;i<raw.length;i++){
            line=trim(raw[i]);
            if(line.length && (new File(line)).exists && arrayIndexOf(paths,line)<0){paths.push(line);}
        }
        if(!paths.length && diagnostic.length){state.lastClipboardError=trim(diagnostic.replace(/\r?\n/g," | "));}
        if(!paths.length && !state.lastClipboardError.length){state.lastClipboardError="Windows did not expose a file-drop list or bitmap from the clipboard.";}
        return paths;
    }

    function clipboardPaths(resourcesFolder) {
        var output="",isWin=$.os.toLowerCase().indexOf("windows")!==-1;
        if(isWin){return windowsClipboardPaths(resourcesFolder);}
        state.lastClipboardError="";
        try { output=system.callSystem("osascript -e 'try' -e 'set theFiles to the clipboard as alias list' -e 'set outText to \"\"' -e 'repeat with f in theFiles' -e 'set outText to outText & POSIX path of f & linefeed' -e 'end repeat' -e 'return outText' -e 'on error' -e 'try' -e 'return POSIX path of (the clipboard as alias)' -e 'on error' -e 'return the clipboard as text' -e 'end try' -e 'end try'"); } catch(clipboardError) { state.lastClipboardError=clipboardError.message||safeString(clipboardError); }
        output=safeString(output).replace(/\r/g,"\n");
        var raw=output.split(/\n+/),paths=[],i,line;
        for(i=0;i<raw.length;i++){
            line=trim(raw[i]).replace(/^\"|\"$/g,"").replace(/^file:\/\/\/?/i,"");
            try{line=decodeURI(line);}catch(ignoreDecodeURI){}
            if(line.length && (new File(line)).exists && arrayIndexOf(paths,line)<0){paths.push(line);}
        }
        if(!paths.length && !state.lastClipboardError.length){state.lastClipboardError="Finder did not expose copied file paths or image data.";}
        return paths;
    }

    function copyFileReliable(source, target, timeoutMs) {
            timeoutMs = Math.max(1000, Number(timeoutMs) || boltCopyTimeoutMs(source));
    
            try {
                if (source.copy(target.fsName) && boltWaitForCopyComplete(source, target, timeoutMs)) {
                    return true;
                }
            } catch (ignoreNativeCopy) {}
    
            if ($.os.toLowerCase().indexOf("windows") !== -1) {
                try {
                    var ps = windowsPowerShellExecutable();
                    var command = '"' + ps + '" -NoLogo -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command "$ErrorActionPreference=\'Stop\'; Copy-Item -LiteralPath ' +
                        psSingleQuote(source.fsName).replace(/"/g, '\"') +
                        ' -Destination ' + psSingleQuote(target.fsName).replace(/"/g, '\"') +
                        ' -Force"';
                    system.callSystem(command);
                    if (boltWaitForCopyComplete(source, target, timeoutMs)) { return true; }
                } catch (ignorePowerShellCopy) {}
            } else {
                try {
                    system.callSystem(
                        "/bin/cp -f " + shellSingleQuote(source.fsName) + " " + shellSingleQuote(target.fsName)
                    );
                    if (boltWaitForCopyComplete(source, target, timeoutMs)) { return true; }
                } catch (ignoreShellCopy) {}
            }
            return false;
        }

    function smartImportOptions(file) {
        var options=new ImportOptions(file);
        var ext=splitFileName(file.name).extension.toLowerCase().replace(/^\./,"");
        try {
            if((ext==="ai"||ext==="eps"||ext==="psd") && typeof ImportAsType!=="undefined" && options.canImportAs(ImportAsType.FOOTAGE)){
                options.importAs=ImportAsType.FOOTAGE;
            }
        } catch(ignoreImportType) {}
        return options;
    }

    function importClipboardTarget(target) {
        var firstError="";
        try { return app.project.importFile(smartImportOptions(target)); }
        catch(errorA){firstError=errorA.message||safeString(errorA);}
        try { return app.project.importFile(new ImportOptions(target)); }
        catch(errorB){throw new Error(firstError+" / fallback: "+(errorB.message||safeString(errorB)));}
    }

    function pasteFilesToProject() {
        var root=chooseWorkspaceRoot();
        if(!root){return;}
        ensureFolder(root);
        var folders=getWorkspaceFolders(root),paths=clipboardPaths(folders.resources),imported=0,errors=[],i;
        if(!paths.length){
            throw new Error("Clipboard has no usable file or bitmap for Bolt Paste."+(state.lastClipboardError?"\n\n"+state.lastClipboardError:"")+"\n\nSupported: copied media/design files and copied image pixels. For Illustrator, PSD or EPS, copy the saved file itself from Explorer/Finder.");
        }
        setStatus("Reading "+paths.length+" clipboard item(s)...","ok");
        app.beginUndoGroup("Bolt Paste Clipboard");
        try {
            for(i=0;i<paths.length;i++){
                var source=new File(paths[i]);
                if(!source.exists){errors.push("Missing: "+paths[i]);continue;}
                var alreadyInside=isPathInside(source.fsName,folders.resources.fsName);
                var target=alreadyInside?source:uniqueFile(folders.resources,source.name);
                if(!alreadyInside && !copyFileReliable(source,target)){errors.push("Could not copy to Resources: "+source.name);continue;}
                try {
                    var item=importClipboardTarget(target);
                    var projectFolder=projectPanelFolderForFile(target);
                    if(projectFolder){try{item.parentFolder=projectFolder;}catch(ignoreParentFolder){}}
                    try{item.selected=true;}catch(ignoreSelectItem){}
                    imported++;
                } catch(importError) {
                    errors.push(target.name+": "+(importError.message||safeString(importError)));
                }
            }
        } finally {app.endUndoGroup();}
        if(!imported){throw new Error("Clipboard files were copied, but After Effects could not import them.\n\n"+errors.join("\n"));}
        setStatus(imported+" clipboard file(s) copied to Resources and imported"+(errors.length?" • "+errors.length+" failed":""),errors.length?"warning":"ok");
    }

    function purgeBoltCaches() {
        if(!confirm("Purge After Effects memory, disk, undo and snapshot caches?\n\nThis cannot be undone.")){return;}
        var ok=false;
        try { if(typeof PurgeTarget!=="undefined" && PurgeTarget.ALL_CACHES!==undefined){app.purge(PurgeTarget.ALL_CACHES);ok=true;} } catch(ignoreAllPurge){}
        try { if(!ok && typeof PurgeTarget!=="undefined" && PurgeTarget.ALL_MEMORY_CACHES!==undefined){app.purge(PurgeTarget.ALL_MEMORY_CACHES);ok=true;} } catch(ignoreMemoryPurge){}
        try { if(typeof PurgeTarget!=="undefined" && PurgeTarget.UNDO_CACHES!==undefined){app.purge(PurgeTarget.UNDO_CACHES);} } catch(ignoreUndoPurge){}
        try { if(typeof PurgeTarget!=="undefined" && PurgeTarget.SNAPSHOT_CACHES!==undefined){app.purge(PurgeTarget.SNAPSHOT_CACHES);} } catch(ignoreSnapshotPurge){}
        if(!ok){throw new Error("Cache purge is unavailable in this After Effects version.");}
        setStatus("After Effects caches purged", "ok");
    }


    // ---------------- PROFESSIONAL SMART LAYER CLEANUP ----------------
    var BOLT_LAYER_LABELS = {
        LOGO:2, TEXT:3, HEADLINE:3, SUBTEXT:3, CTA:3, PRICE:3, BG:4, ADJ:5,
        CTRL:6, NULL:6, MATTE:7, PRECOMP:8, SCENE:8, MUSIC:9, SFX:10, VO:11,
        IMAGE:12, VIDEO:13, PRODUCT:12, CHARACTER:12, ICON:12,
        OVERLAY:14, TRANSITION:14, OUTRO:15, INTRO:15,
        REFERENCE:16, GUIDE:16, THUMBNAIL:16,
        CAMERA:1, LIGHT:1, SHAPE:1, UNKNOWN:1
    };
    var BOLT_GENERIC_LAYER_RE = /^(?:layer\s*\d*|shape\s*layer\s*\d*|text\s*layer\s*\d*|adjustment\s*layer\s*\d*|null\s*\d*|solid\s*\d*|comp\s*\d*|pre-?comp\s*\d*|audio\s*\d*|image\s*\d*|video\s*\d*)$/i;
    var BOLT_LAYER_TAG = "[BOLT NEST]";
    var BOLT_MARKER_PREFIX = "[BOLT]";
    var BOLT_TIMELINE_GUIDE_TAG = "[BOLT TIMELINE GUIDE]";

    function boltLayerSafeGet(fn, fallback) {
        try { var value = fn(); return value === undefined || value === null ? fallback : value; }
        catch (ignore) { return fallback; }
    }

    function boltLayerLower(value) { return trim(value).toLowerCase(); }
    function boltLayerContains(text, words) {
        var source = boltLayerLower(text), i;
        for (i = 0; i < words.length; i++) { if (source.indexOf(words[i]) !== -1) { return true; } }
        return false;
    }
    function boltLayerIsText(layer) { return !!boltLayerSafeGet(function(){return layer.property("ADBE Text Properties");}, null); }
    function boltLayerIsShape(layer) { return !!boltLayerSafeGet(function(){return layer.property("ADBE Root Vectors Group");}, null); }
    function boltLayerText(layer) {
        return boltLayerSafeGet(function(){return layer.property("ADBE Text Properties").property("ADBE Text Document").value.text;}, "");
    }
    function boltLayerSourceName(layer) { return boltLayerSafeGet(function(){return layer.source ? layer.source.name : "";}, ""); }
    function boltLayerFileName(layer) { return boltLayerSafeGet(function(){return layer.source && layer.source.file ? layer.source.file.name : "";}, ""); }
    function boltLayerExtension(layer) {
        var match = (boltLayerFileName(layer) || boltLayerSourceName(layer)).match(/\.([A-Za-z0-9]+)$/);
        return match ? match[1].toLowerCase() : "";
    }
    function boltLayerMarkerText(layer) {
        return boltLayerSafeGet(function(){
            var marker = layer.property("ADBE Marker"), parts=[], i;
            for (i=1;i<=marker.numKeys;i++){parts.push(marker.keyValue(i).comment);}
            return parts.join(" ");
        }, "");
    }
    function boltLayerEvidence(layer) {
        return [layer.name, boltLayerSourceName(layer), boltLayerFileName(layer), boltLayerText(layer), boltLayerMarkerText(layer), boltLayerSafeGet(function(){return layer.comment;},"")].join(" ").replace(/\s+/g," ");
    }
    function boltLayerHasEffects(layer) { return boltLayerSafeGet(function(){return layer.property("ADBE Effect Parade").numProperties>0;},false); }
    function boltLayerIsMatte(layer) {
        return boltLayerSafeGet(function(){return layer.isTrackMatte===true;},false) || boltLayerContains(boltLayerEvidence(layer),["matte","alpha source","luma source"]);
    }
    function boltLayerIsReference(layer) {
        return boltLayerSafeGet(function(){return layer.guideLayer===true;},false) || boltLayerContains(boltLayerEvidence(layer),["reference","guide","safe area","safe zone","grid","notes","do not render"]);
    }
    function boltLayerIsAudioOnly(layer) {
        return boltLayerSafeGet(function(){return layer.hasAudio===true && layer.hasVideo!==true;},false);
    }
    function boltLayerPosition(layer) {
        return boltLayerSafeGet(function(){var p=layer.property("ADBE Transform Group").property("ADBE Position").value;return [Number(p[0]||0),Number(p[1]||0)];},[0,0]);
    }
    function boltLayerDimensions(layer) {
        return boltLayerSafeGet(function(){
            if(layer.source){return {width:Number(layer.source.width||0),height:Number(layer.source.height||0)};}
            var rect=layer.sourceRectAtTime(layer.containingComp.time,false);return {width:Number(rect.width||0),height:Number(rect.height||0)};
        },{width:0,height:0});
    }
    function boltIsTimelineGuide(layer) {
        return boltLayerSafeGet(function(){return safeString(layer.comment).indexOf(BOLT_TIMELINE_GUIDE_TAG)>=0;},false) || /^GUIDE_BoltTimeline(?:_|$)/i.test(trim(layer.name));
    }

    function boltLayerFrameDuration(comp) {
        return Math.max(0.001, Number(comp && comp.frameDuration) || 0.04);
    }
    function boltLayerDurationFrames(layer, comp) {
        return Math.max(0, (Number(layer.outPoint) - Number(layer.inPoint)) / boltLayerFrameDuration(comp));
    }
    function boltLayerIsStillImage(layer) {
        return boltLayerSafeGet(function(){
            return boltIsFootageItem(layer.source) &&
                layer.source.mainSource &&
                layer.source.mainSource.isStill === true;
        }, false);
    }
    function boltLayerIsOneFrameThumbnail(layer, comp, evidenceText) {
        if (!boltLayerIsStillImage(layer)) { return false; }
        var frame = boltLayerFrameDuration(comp);
        var duration = Math.max(0, Number(layer.outPoint) - Number(layer.inPoint));
        var nearStart = Math.abs(Number(layer.inPoint)) <= frame * 1.25;
        var nearTop = Number(layer.index) <= Math.min(2, Number(comp.numLayers) || 1);
        var evidence = boltLayerLower(evidenceText === undefined ? boltLayerEvidence(layer) : evidenceText);
        var named = /(?:thumbnail|thumb|snapshot|poster|cover|preview|first[ _-]?frame|still[ _-]?frame)/i.test(evidence);
        var size = boltLayerDimensions(layer);
        var nearFullFrame = size.width >= Number(comp.width || 0) * 0.72 && size.height >= Number(comp.height || 0) * 0.72;
        return duration <= frame * 1.6 && nearStart && (named || (nearTop && nearFullFrame));
    }
    function boltLayerLooksLikeScene(layer, evidenceText) {
        return /(?:^|[ _-])(?:scene|shot|sequence|segment|page|pan[ _-]?short)(?:[ _-]*\d+|\b)/i.test(evidenceText===undefined?boltLayerEvidence(layer):evidenceText);
    }
    function boltLayerLooksLikeTransition(layer, evidenceText) {
        return /(?:transition|fade[ _-]?to[ _-]?black|dip[ _-]?to[ _-]?black|wipe|flash|glitch[ _-]?cut|light[ _-]?leak[ _-]?transition)/i.test(evidenceText===undefined?boltLayerEvidence(layer):evidenceText);
    }
    function boltDetectLayerCategory(layer, comp) {
        var evidence=boltLayerEvidence(layer), textValue=boltLayerText(layer), ext=boltLayerExtension(layer), dims=null;
        var result={category:"UNKNOWN",confidence:35,reason:"No strong role signal"};
        function choose(category, confidence, reason){if(confidence>result.confidence){result={category:category,confidence:confidence,reason:reason};}}
        function dimensions(){if(!dims){dims=boltLayerDimensions(layer);}return dims;}

        if(boltIsTimelineGuide(layer)){choose("GUIDE",100,"Bolt timeline guide");}
        if(boltLayerIsOneFrameThumbnail(layer,comp,evidence)){choose("THUMBNAIL",100,"One-frame project thumbnail");}
        if(boltLayerSafeGet(function(){return layer.matchName==="ADBE Camera Layer";},false)){choose("CAMERA",100,"Camera layer");}
        if(boltLayerSafeGet(function(){return layer.matchName==="ADBE Light Layer";},false)){choose("LIGHT",100,"Light layer");}
        if(boltLayerSafeGet(function(){return layer.adjustmentLayer===true;},false)){choose("ADJ",100,"Adjustment layer");}
        if(boltLayerSafeGet(function(){return layer.nullLayer===true;},false)){choose(boltLayerHasEffects(layer)?"CTRL":"NULL",boltLayerHasEffects(layer)?96:90,"Null/controller");}
        if(boltLayerIsReference(layer)){choose(boltLayerSafeGet(function(){return layer.guideLayer;},false)?"GUIDE":"REFERENCE",97,"Guide/reference");}
        if(boltLayerIsMatte(layer)){choose("MATTE",95,"Track matte");}
        if(boltLayerIsAudioOnly(layer) || /^(mp3|wav|aif|aiff|m4a|aac|flac|ogg)$/.test(ext)){
            if(boltLayerContains(evidence,["voice over","voiceover","narration","dialogue"," vo ","vo_","_vo"])){choose("VO",96,"Voice-over audio");}
            else if(boltLayerContains(evidence,["sfx","sound effect","whoosh","swoosh","hit","impact","click","pop","riser","ambience","transition"])){choose("SFX",95,"Sound effect");}
            else {choose("MUSIC",78,"Audio layer");}
        }
        if(boltLayerContains(evidence,["logo","brandmark","wordmark","logomark"])){choose("LOGO",98,"Logo keyword");}
        if(boltLayerContains(evidence,["outro","end card","endcard","end screen","closing","end slate"])){choose("OUTRO",98,"Outro keyword");}
        if(boltLayerContains(evidence,["intro","opening","opener","title card"])){choose("INTRO",96,"Intro keyword");}
        if(boltLayerLooksLikeTransition(layer,evidence) && !boltLayerIsAudioOnly(layer)){choose("TRANSITION",96,"Transition keyword");}
        if(boltLayerLooksLikeScene(layer,evidence) && !boltLayerIsAudioOnly(layer)){choose("SCENE",95,"Scene/shot keyword");}
        if(boltLayerContains(evidence,["background"," bg ","bg_","_bg","backdrop","wallpaper"])){choose("BG",94,"Background keyword");}
        if(boltLayerContains(evidence,["overlay","light leak","grain","noise","dust","flare","texture"])){choose("OVERLAY",91,"Overlay keyword");}
        if(boltLayerContains(evidence,["product","packshot","pack shot","hero product"])){choose("PRODUCT",91,"Product keyword");}
        if(boltLayerContains(evidence,["character","person","model","talent","actor","actress"])){choose("CHARACTER",84,"Character keyword");}
        if(boltLayerContains(evidence,["icon","pictogram","symbol"])){choose("ICON",90,"Icon keyword");}
        if(boltLayerIsText(layer)){
            var normalized=trim(textValue).replace(/\s+/g," ");
            if(boltLayerContains(normalized,["call now","book now","shop now","learn more","contact us","order now","apply now","get started"])){choose("CTA",96,"Call-to-action text");}
            else if(/[$€£¥৳₹]|\b(?:bdt|usd|eur|gbp|tk|taka)\b/i.test(normalized)){choose("PRICE",93,"Price text");}
            else if(boltLayerContains(evidence,["subtitle","sub title","subtext","body copy","description","caption"])){choose("SUBTEXT",92,"Subtitle/body copy");}
            else if(boltLayerContains(evidence,["headline","heading","title","head copy"])){choose("HEADLINE",94,"Headline keyword");}
            else if(normalized.length>0 && normalized.length<=65 && boltLayerPosition(layer)[1]<comp.height*0.58){choose("HEADLINE",78,"Short upper text");}
            else {choose("TEXT",82,"Text layer");}
        }
        if(boltLayerIsShape(layer)){choose("SHAPE",76,"Shape layer");}
        if(boltLayerSafeGet(function(){return layer.source instanceof CompItem;},false) && result.confidence<88){choose("PRECOMP",87,"Nested composition");}
        if(/^(png|jpg|jpeg|webp|tif|tiff|psd|ai|eps|svg|bmp|gif)$/.test(ext)){choose("IMAGE",73,"Still image");}
        if(/^(mp4|mov|mxf|avi|mkv|webm|mts|m2ts|r3d|braw)$/.test(ext)){choose("VIDEO",76,"Video footage");}
        if(result.category!=="THUMBNAIL"){
            var size=dimensions();
            if(size.width>=comp.width*0.88 && size.height>=comp.height*0.88){
                var pos=boltLayerPosition(layer);
                if(Math.abs(pos[0]-comp.width/2)<=comp.width*0.2 && Math.abs(pos[1]-comp.height/2)<=comp.height*0.2 && /^(IMAGE|VIDEO|SHAPE|UNKNOWN)$/.test(result.category)){choose("BG",79,"Full-frame visual");}
            }
        }
        result.evidence=evidence;
        return result;
    }

    function boltLayerWords(value) {
        var cleaned=trim(value).replace(/\.[^\.]+$/," ").replace(/[_\-\.]+/g," ").replace(/[^A-Za-z0-9\u0980-\u09FF ]+/g," ").replace(/\s+/g," ");
        var parts=cleaned.split(" "), output=[], i, part, low;
        for(i=0;i<parts.length;i++){
            part=trim(parts[i]); if(!part){continue;} low=part.toLowerCase();
            if(/^(?:final|latest|new|copy|edit|edited|export|render|layer|footage|untitled)$/.test(low)||/^v\d+$/i.test(part)){continue;}
            if(/^[A-Z0-9]{2,6}$/.test(part)||/^[\u0980-\u09FF]+$/.test(part)){output.push(part);}else{output.push(part.charAt(0).toUpperCase()+part.substr(1).toLowerCase());}
            if(output.length>=6){break;}
        }
        return output.join(" ");
    }
    function boltLayerDescription(layer, category) {
        var text=boltLayerText(layer), source=boltLayerFileName(layer)||boltLayerSourceName(layer), own=layer.name, value="";
        if(category==="THUMBNAIL"){return "Thumbnail";}
        if(/^(HEADLINE|SUBTEXT|CTA|PRICE|TEXT)$/.test(category)){value=boltLayerWords(text.substr(0,56));}
        if(!value){value=boltLayerWords(source);}
        if(!value || BOLT_GENERIC_LAYER_RE.test(own)){value=boltLayerWords(own);}
        if(!value){
            if(category==="BG"){value="Main";}else if(category==="MUSIC"){value="Main Track";}else if(category==="SFX"){value="Sound";}else if(category==="VO"){value="Main";}else if(category==="CTRL"||category==="ADJ"){value="Master";}else if(category==="LOGO"){value="Brand";}else if(category==="OUTRO"){value="End Card";}else if(category==="INTRO"){value="Opener";}else if(category==="SCENE"){value="";}else if(category==="TRANSITION"){value="";}else{value="Element";}
        }
        return value.substr(0,44);
    }
    function boltLayerFormatName(category, description, style, sequence) {
        var readable=trim(description).replace(/\s+/g," ");
        var compact=readable.replace(/\s+/g,"_");
        if(category==="THUMBNAIL"){
            if(style==="Studio"){return "00_GUIDE_Thumbnail";}
            if(style==="Bracket"){return "[GUIDE] Thumbnail";}
            return "GUIDE_Thumbnail";
        }
        if(category==="SCENE"){
            var sceneBase="SCENE_"+padNumber(sequence,2);
            return compact.length?sceneBase+"_"+compact:sceneBase;
        }
        if(category==="TRANSITION"){
            var transitionBase="TRANSITION_"+padNumber(sequence,2);
            return compact.length?transitionBase+"_"+compact:transitionBase;
        }
        if(style==="Studio"){return padNumber(sequence,2)+"_"+category+(compact.length?"_"+compact:"");}
        if(style==="Bracket"){return "["+category+"] "+(readable||"Element");}
        return category+(compact.length?"_"+compact:"");
    }
    function boltLayerUniqueName(comp,base,current,reserved){var candidate=base,n=1,key;while(true){key=boltLayerLower(candidate);if(!reserved[key]){var used=false,i;for(i=1;i<=comp.numLayers;i++){if(comp.layer(i)!==current&&boltLayerLower(comp.layer(i).name)===key){used=true;break;}}if(!used){reserved[key]=true;return candidate;}}n++;candidate=base+"_"+(n<10?"0":"")+n;}}
    function boltLayerNameIsMessy(layer, duplicate) {
        var name=trim(layer.name), source=boltLayerFileName(layer)||boltLayerSourceName(layer);
        if(!name.length||BOLT_GENERIC_LAYER_RE.test(name)||duplicate){return true;}
        if(name.length>58||/_{3,}|-{3,}/.test(name)){return true;}
        if(/\.(?:png|jpg|jpeg|psd|ai|eps|mov|mp4|wav|mp3|aif|m4a)$/i.test(name)){return true;}
        if(/(?:^|[_\-\s])(?:final|latest|new|copy|edited|export|render)(?:[_\-\s]?\d*)$/i.test(name)){return true;}
        if(source && boltLayerLower(name)===boltLayerLower(source)){return true;}
        return false;
    }
    function boltRecordIsVisualSegment(record) {
        return /^(SCENE|PRECOMP|VIDEO|IMAGE|BG|PRODUCT|CHARACTER)$/.test(record.category) &&
            !record.protectedLayer && record.durationFrames>2;
    }
    function boltContextCleanDescription(value, category) {
        var output=boltLayerWords(value);
        if(category==="SCENE"){
            output=trim(output.replace(/\b(?:Scene|Shot|Sequence|Segment|Page|Pan Short|Pre Comp|Precomp|Render)\b/ig," ").replace(/\b\d+\b/g," ").replace(/\s+/g," "));
        }else if(category==="TRANSITION"){
            output=trim(output.replace(/\b(?:Transition|Trans|Swoosh|Whoosh)\b/ig," ").replace(/\b\d+\b/g," ").replace(/\s+/g," "));
        }
        return output.substr(0,32);
    }
    function boltRefineLayerContexts(records, comp) {
        var frame=boltLayerFrameDuration(comp), duration=Math.max(frame,Number(comp.duration)||frame),visuals=[],scenes=[],i,j,r,center,previous,next,bestDistance,boundary,distance;
        for(i=0;i<records.length;i++){
            r=records[i];
            if(r.category==="THUMBNAIL"){r.contextRename=true;r.contextRole="Thumbnail";continue;}
            if(boltRecordIsVisualSegment(r)){visuals.push(r);}
        }
        visuals.sort(function(a,b){return a.inPoint===b.inPoint?a.layerIndex-b.layerIndex:a.inPoint-b.inPoint;});
        for(i=0;i<visuals.length;i++){
            r=visuals[i];
            if(r.category==="SCENE"){scenes.push(r);continue;}
            var spansMost=r.durationFrames*frame>=duration*0.9;
            var explicit=boltLayerLooksLikeScene(r.layer,r.evidence);
            var likelySegment=visuals.length>=2 && !spansMost && r.durationFrames>=8 &&
                !/^(LOGO|OUTRO|INTRO|THUMBNAIL|TRANSITION|OVERLAY|BG)$/.test(r.category);
            if(explicit||likelySegment){
                r.category="SCENE";
                r.confidence=Math.max(r.confidence,explicit?95:84);
                r.reason=explicit?"Scene/shot context":"Sequential full-frame visual segment";
                r.contextRename=explicit||BOLT_GENERIC_LAYER_RE.test(trim(r.oldName))||/^(?:pre-?comp|render|pan short|scene|shot)(?:\s*\d*)?$/i.test(trim(r.oldName));
                scenes.push(r);
            }
        }
        scenes.sort(function(a,b){return a.inPoint===b.inPoint?a.layerIndex-b.layerIndex:a.inPoint-b.inPoint;});
        for(i=0;i<scenes.length;i++){scenes[i].sceneOrder=i+1;}
        for(i=0;i<records.length;i++){
            r=records[i];
            if(r.category==="THUMBNAIL"){continue;}
            center=(r.inPoint+r.outPoint)*0.5;previous=null;next=null;
            for(j=0;j<scenes.length;j++){
                if(scenes[j]===r){continue;}
                if(scenes[j].inPoint<=center){previous=scenes[j];}
                if(!next&&scenes[j].inPoint>center){next=scenes[j];}
            }
            if(r.category==="TRANSITION"){
                r.contextRename=true;
            }else if(!boltLayerIsAudioOnly(r.layer) && !/^(SCENE|OUTRO|INTRO|LOGO|BG|THUMBNAIL)$/.test(r.category) &&
                r.durationFrames<=Math.max(90,3/frame) && previous && next){
                boundary=(previous.outPoint+next.inPoint)*0.5;
                if(Math.abs(center-boundary)<=frame*12 || (r.inPoint<=previous.outPoint+frame*4 && r.outPoint>=next.inPoint-frame*4)){
                    r.category="TRANSITION";r.confidence=Math.max(r.confidence,84);r.reason="Visual between adjacent scenes";r.contextRename=true;
                }
            }
            if(r.category==="SFX"&&scenes.length>=2&&r.durationFrames<=Math.max(150,5/frame)){
                bestDistance=null;
                for(j=0;j<scenes.length-1;j++){
                    boundary=(scenes[j].outPoint+scenes[j+1].inPoint)*0.5;
                    distance=Math.abs(center-boundary);
                    if(bestDistance===null||distance<bestDistance){bestDistance=distance;}
                }
                if(bestDistance!==null&&bestDistance<=frame*18){r.contextRole="Transition";r.reason="Transition SFX near scene cut";r.contextRename=r.messy||/swoosh|whoosh|transition/i.test(r.oldName);}
            }
            r.previousScene=previous;r.nextScene=next;
        }
        var transitions=[],transitionSfx=[];
        for(i=0;i<records.length;i++){
            if(records[i].category==="TRANSITION"){transitions.push(records[i]);}
            else if(records[i].category==="SFX"&&records[i].contextRole==="Transition"){transitionSfx.push(records[i]);}
        }
        transitions.sort(function(a,b){return a.inPoint===b.inPoint?a.layerIndex-b.layerIndex:a.inPoint-b.inPoint;});
        transitionSfx.sort(function(a,b){return a.inPoint===b.inPoint?a.layerIndex-b.layerIndex:a.inPoint-b.inPoint;});
        for(i=0;i<transitions.length;i++){transitions[i].transitionOrder=i+1;}
        for(i=0;i<transitionSfx.length;i++){transitionSfx[i].transitionSfxOrder=i+1;}
    }
    function boltContextualDescription(record) {
        if(record.category==="THUMBNAIL"){return "Thumbnail";}
        var source=boltLayerFileName(record.layer)||boltLayerSourceName(record.layer), own=record.oldName;
        if(record.category==="SCENE"){
            return boltContextCleanDescription(source||own,"SCENE")||boltContextCleanDescription(own,"SCENE");
        }
        if(record.category==="TRANSITION"){
            return boltContextCleanDescription(own||source,"TRANSITION")||boltContextCleanDescription(source,"TRANSITION");
        }
        if(record.category==="SFX"&&record.contextRole==="Transition"){return "Transition";}
        return boltLayerDescription(record.layer,record.category);
    }
    function boltContextualName(record, options, sequence) {
        if(record.category==="SCENE"){sequence=record.sceneOrder||sequence;}
        else if(record.category==="TRANSITION"){sequence=record.transitionOrder||sequence;}
        else if(record.category==="SFX"&&record.contextRole==="Transition"){
            return "SFX_Transition_"+padNumber(record.transitionSfxOrder||sequence,2);
        }
        return boltLayerFormatName(record.category,boltContextualDescription(record),options.namingStyle,sequence);
    }
    function boltShouldRename(record, options) {
        if(options.renamePolicy==="Off"||record.protectedLayer){return false;}
        if(options.renamePolicy==="Full"){return true;}
        if(options.renamePolicy==="Safe"){return record.generic||record.duplicate||record.category==="THUMBNAIL";}
        return record.contextRename||record.messy||record.generic||record.duplicate;
    }

    function boltCollectNestedComps(comp,output,seen){
        if(!comp){return;} var key=boltLayerSafeGet(function(){return "id:"+comp.id;},"name:"+comp.name),i,source;
        if(seen[key]){return;}seen[key]=true;output.push(comp);
        for(i=1;i<=comp.numLayers;i++){source=boltLayerSafeGet(function(){return comp.layer(i).source;},null);if(source instanceof CompItem){boltCollectNestedComps(source,output,seen);}}
    }

    function boltResolveLayerScope(scope) {
        var output = [], selected, i, hero, item;
        if (scope === "Active Comp") {
            if (app.project.activeItem instanceof CompItem) {
                output.push(app.project.activeItem);
            }
        } else if (scope === "Selected Comps") {
            selected = app.project.selection || [];
            for (i = 0; i < selected.length; i++) {
                if (selected[i] instanceof CompItem) { output.push(selected[i]); }
            }
        } else if (scope === "Hero + Nested") {
            hero = resolveHeroComp();
            if (hero) { boltCollectNestedComps(hero, output, {}); }
        } else if (scope === "All Comps") {
            for (i = 1; i <= app.project.numItems; i++) {
                item = app.project.item(i);
                if (item instanceof CompItem) { output.push(item); }
            }
        }
        return output;
    }

    function boltGetChildProperty(node, index) {
        return boltLayerSafeGet(function () { return node.property(index); }, null);
    }

    function boltWalkLayerProperties(node, callback, groupCallback) {
        if (!node) { return; }
        var count = boltLayerSafeGet(function () { return node.numProperties; }, 0), i, child;
        if (count === 0) { callback(node); return; }
        if (groupCallback) { groupCallback(node); }
        for (i = 1; i <= count; i++) {
            child = boltGetChildProperty(node, i);
            if (child) { boltWalkLayerProperties(child, callback, groupCallback); }
        }
    }
    function boltBuildExpressionIndex(){
        var entries=[],i,l,comp,layer;
        for(i=1;i<=app.project.numItems;i++){
            comp=app.project.item(i);if(!(comp instanceof CompItem)){continue;}
            for(l=1;l<=comp.numLayers;l++){layer=comp.layer(l);boltWalkLayerProperties(layer,function(prop){var exp=boltLayerSafeGet(function(){return prop.expression;},"");if(exp){entries.push({comp:comp,property:prop,expression:exp});}});}
        }
        return entries;
    }
    function boltEscapeRegex(value){return safeString(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
    function boltCountLayerReferences(comp,name,entries){
        var escaped=boltEscapeRegex(name), compEsc=boltEscapeRegex(comp.name);
        var explicitRef=new RegExp("comp\\s*\\(\\s*[\\\"']"+compEsc+"[\\\"']\\s*\\)\\s*\\.\\s*layer\\s*\\(\\s*[\\\"']"+escaped+"[\\\"']\\s*\\)");
        var localRef=new RegExp("(?:thisComp\\s*\\.\\s*)?layer\\s*\\(\\s*[\\\"']"+escaped+"[\\\"']\\s*\\)");
        var count=0,i,exp;
        for(i=0;i<entries.length;i++){
            exp=entries[i].expression!==undefined?entries[i].expression:boltLayerSafeGet(function(){return entries[i].property.expression;},"");
            if(exp.indexOf(name)<0){continue;}
            if(explicitRef.test(exp)||(entries[i].comp===comp&&localRef.test(exp))){count++;}
        }
        return count;
    }
    function boltRepairLayerReferences(comp,oldName,newName,entries,changeLog){
        var oldEsc=boltEscapeRegex(oldName),compEsc=boltEscapeRegex(comp.name);
        var safeNew=safeString(newName).replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\$/g,"$$$$");
        var safeComp=safeString(comp.name).replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\$/g,"$$$$");
        var explicitRef=new RegExp("comp\\s*\\(\\s*[\\\"']"+compEsc+"[\\\"']\\s*\\)\\s*\\.\\s*layer\\s*\\(\\s*[\\\"']"+oldEsc+"[\\\"']\\s*\\)","g");
        var localRef=new RegExp("((?:thisComp\\s*\\.\\s*)?layer)\\s*\\(\\s*[\\\"']"+oldEsc+"[\\\"']\\s*\\)","g");
        var repaired=0,i,exp,changed;
        for(i=0;i<entries.length;i++){
            exp=entries[i].expression!==undefined?entries[i].expression:boltLayerSafeGet(function(){return entries[i].property.expression;},"");
            if(exp.indexOf(oldName)<0){continue;}
            changed=exp.replace(explicitRef,'comp("'+safeComp+'").layer("'+safeNew+'")');
            if(entries[i].comp===comp){changed=changed.replace(localRef,'$1("'+safeNew+'")');}
            if(changed!==exp){try{entries[i].property.expression=changed;entries[i].expression=changed;if(changeLog){changeLog.push({property:entries[i].property,oldExpression:exp,newExpression:changed});}repaired++;}catch(ignoreRepair){}}
        }
        return repaired;
    }
    function boltLayerUsedAsParent(layer,comp){var i;for(i=1;i<=comp.numLayers;i++){if(boltLayerSafeGet(function(){return comp.layer(i).parent===layer;},false)){return true;}}return false;}

    function boltCompTrimBounds(comp, options) {
        var start=0,end=Number(comp.duration)||0;
        if(options.useWorkArea){start=Math.max(0,Number(comp.workAreaStart)||0);end=Math.min(end,start+Math.max(0,Number(comp.workAreaDuration)||0));}
        if(end<=start){start=0;end=Number(comp.duration)||0;}
        return {start:start,end:end};
    }
    function boltSnapFrame(value,frame,ceilValue){
        if(!frame||frame<=0){return value;}
        return (ceilValue?Math.ceil(value/frame):Math.floor(value/frame))*frame;
    }
    function boltLayerKeyRange(layer) {
        var first=null,last=null;
        boltWalkLayerProperties(layer,function(prop){
            var match=boltLayerSafeGet(function(){return prop.matchName;},"");
            if(match==="ADBE Marker"){return;}
            var count=boltLayerSafeGet(function(){return prop.numKeys;},0);
            if(count>0){
                var a=boltLayerSafeGet(function(){return prop.keyTime(1);},null);
                var b=boltLayerSafeGet(function(){return prop.keyTime(count);},null);
                if(a!==null&&(first===null||a<first)){first=a;}
                if(b!==null&&(last===null||b>last)){last=b;}
            }
        });
        return first===null?null:{start:first,end:last};
    }
    function boltOpacityRange(layer, comp, bounds) {
        var opacity=boltLayerSafeGet(function(){return layer.property("ADBE Transform Group").property("ADBE Opacity");},null);
        if(!opacity||boltLayerSafeGet(function(){return opacity.numKeys;},0)<2){return null;}
        var frame=Math.max(0.001,Number(comp.frameDuration)||0.04), startValue=100,endValue=100,firstPositive=false,lastPositive=false,i,value;
        try{startValue=Number(opacity.valueAtTime(Math.max(bounds.start,layer.inPoint),false));}catch(ignoreStartOpacity){}
        try{endValue=Number(opacity.valueAtTime(Math.max(bounds.start,Math.min(bounds.end-frame,layer.outPoint-frame)),false));}catch(ignoreEndOpacity){}
        for(i=1;i<=opacity.numKeys;i++){value=Number(opacity.keyValue(i));if(value>0.5){firstPositive=true;break;}}
        for(i=opacity.numKeys;i>=1;i--){value=Number(opacity.keyValue(i));if(value>0.5){lastPositive=true;break;}}
        if(!firstPositive||!lastPositive){return null;}
        return {
            start:startValue<=0.5?opacity.keyTime(1):null,
            end:endValue<=0.5?opacity.keyTime(opacity.numKeys)+frame:null
        };
    }
    function boltSourceBoundRange(layer, start, end) {
        var source=boltLayerSafeGet(function(){return layer.source;},null);
        if(!source){return {start:start,end:end};}
        var isStill=boltLayerSafeGet(function(){return boltIsFootageItem(source)&&source.mainSource&&source.mainSource.isStill===true;},false);
        var remapped=boltLayerSafeGet(function(){return layer.timeRemapEnabled===true;},false);
        var stretch=Number(boltLayerSafeGet(function(){return layer.stretch;},100));
        var duration=Number(boltLayerSafeGet(function(){return source.duration;},0));
        var sourceStart=Number(boltLayerSafeGet(function(){return layer.startTime;},start));
        if(!isStill&&!remapped&&stretch>0&&duration>0&&isFinite(duration)){
            start=Math.max(start,sourceStart);
            end=Math.min(end,sourceStart+duration*(stretch/100));
        }
        return {start:start,end:end};
    }
    function boltTrimPlanIsSafe(layer, comp, category, plan, options) {
        if (!plan || !plan.changed || category === "THUMBNAIL") { return true; }
        if (boltLayerSafeGet(function(){return layer.timeRemapEnabled===true;},false)) { return false; }
        if (boltLayerSafeGet(function(){return layer.parent!==null;},false)) { return false; }
        if (boltLayerUsedAsParent(layer,comp) || boltLayerIsMatte(layer)) { return false; }
        if (options.mode === "Conservative") {
            if (/^(ADJ|CTRL|NULL|CAMERA|LIGHT|GUIDE|REFERENCE|MATTE)$/.test(category)) { return false; }
        }
        var frame=Math.max(0.001,Number(comp.frameDuration)||0.04), keyRange=boltLayerKeyRange(layer), marker=null, i, t;
        if(keyRange){
            if(plan.start>keyRange.start+frame*0.25 || plan.end<keyRange.end-frame*0.25){return false;}
        }
        marker=boltLayerSafeGet(function(){return layer.property("ADBE Marker");},null);
        if(marker){
            for(i=1;i<=marker.numKeys;i++){
                t=boltLayerSafeGet(function(){return marker.keyTime(i);},null);
                if(t!==null && (t<plan.start-frame*0.25 || t>plan.end+frame*0.25)){return false;}
            }
        }
        return true;
    }

    function boltComputeTrimPlan(layer, comp, category, options) {
        var policy=options.trimPolicy,bounds=boltCompTrimBounds(comp,options),frame=boltLayerFrameDuration(comp);
        var currentStart=Number(layer.inPoint)||0,currentEnd=Number(layer.outPoint)||0,start=Math.max(currentStart,bounds.start),end=Math.min(currentEnd,bounds.end),reason="Comp bounds";
        var fullSpan=/^(BG|ADJ|CTRL|NULL|CAMERA|LIGHT|GUIDE|REFERENCE)$/.test(category);
        if(policy==="Off"){return {start:currentStart,end:currentEnd,changed:false,reason:"Off"};}
        if(category==="THUMBNAIL"){
            start=Math.max(0,boltSnapFrame(currentStart,frame,false));
            end=Math.min(Number(comp.duration)||currentEnd,start+frame);
            if(end<=start){start=currentStart;end=currentEnd;}
            return {start:start,end:end,changed:Math.abs(start-currentStart)>frame*0.25||Math.abs(end-currentEnd)>frame*0.25,reason:"Exact one-frame thumbnail"};
        }
        if(fullSpan){
            return {start:currentStart,end:currentEnd,changed:false,reason:"Protected technical layer"};
        }else{
            var sourceRange=boltSourceBoundRange(layer,start,end);start=sourceRange.start;end=sourceRange.end;reason="Source and comp bounds";
            if(policy==="Visual"||policy==="Exact Animation"){
                var handles=Math.max(0,Number(options.trimHandles)||0)*frame;
                var opacityRange=boltOpacityRange(layer,comp,bounds);
                if(opacityRange){
                    if(opacityRange.start!==null){start=Math.max(start,opacityRange.start-handles);}
                    if(opacityRange.end!==null){end=Math.min(end,opacityRange.end+handles);}
                    reason="Visible opacity range";
                }
                if(policy==="Exact Animation"&&/^(TEXT|HEADLINE|SUBTEXT|CTA|PRICE|LOGO|SHAPE|ICON|PRODUCT|CHARACTER|OVERLAY|INTRO|OUTRO|TRANSITION)$/.test(category)){
                    var keyRange=boltLayerKeyRange(layer);
                    if(keyRange&&keyRange.end>=keyRange.start){
                        var exactStart=Math.max(bounds.start,keyRange.start-handles),exactEnd=Math.min(bounds.end,keyRange.end+handles+frame);
                        if(exactEnd>exactStart+frame){start=Math.max(start,exactStart);end=Math.min(end,exactEnd);reason="Exact animation range";}
                    }
                }
            }
        }
        start=Math.max(bounds.start,boltSnapFrame(start,frame,false));
        end=Math.min(bounds.end,boltSnapFrame(end,frame,true));
        if(end<=start+frame*0.5){start=currentStart;end=currentEnd;reason="Protected minimum duration";}
        var changed=Math.abs(start-currentStart)>frame*0.25||Math.abs(end-currentEnd)>frame*0.25;
        return {start:start,end:end,changed:changed,reason:reason};
    }

    function boltCloneMarkerValue(value) {
        if(typeof MarkerValue==="undefined"){return null;}
        var copy=new MarkerValue(boltLayerSafeGet(function(){return value.comment;},""));
        try{copy.chapter=value.chapter;}catch(ignoreChapter){}
        try{copy.url=value.url;}catch(ignoreUrl){}
        try{copy.frameTarget=value.frameTarget;}catch(ignoreFrameTarget){}
        try{copy.cuePointName=value.cuePointName;}catch(ignoreCueName){}
        try{copy.eventCuePoint=value.eventCuePoint;}catch(ignoreEventCue){}
        try{copy.duration=value.duration;}catch(ignoreMarkerDuration){}
        try{copy.protectedRegion=value.protectedRegion;}catch(ignoreProtectedRegion){}
        try{copy.label=value.label;}catch(ignoreMarkerLabel){}
        try{copy.setParameters(value.getParameters());}catch(ignoreMarkerParams){}
        return copy;
    }
    function boltFindMarkerKeyAtTime(marker,time,tolerance) {
        var i;if(!marker||!marker.numKeys){return 0;}
        for(i=1;i<=marker.numKeys;i++){if(Math.abs(marker.keyTime(i)-time)<=tolerance){return i;}}
        return 0;
    }
    function boltSetManagedMarker(layer,time,comment,snapshot) {
        var marker=boltLayerSafeGet(function(){return layer.property("ADBE Marker");},null);
        if(!marker||typeof MarkerValue==="undefined"){return false;}
        var frame=Math.max(0.001,Number(layer.containingComp.frameDuration)||0.04);
        time=Math.max(Number(layer.inPoint)||0,Math.min(Number(layer.outPoint)||0,time));
        var key=boltFindMarkerKeyAtTime(marker,time,frame*0.2),existing,updated,oldComment;
        try{
            if(key){
                existing=marker.keyValue(key);oldComment=safeString(existing.comment);
                if(oldComment.indexOf(comment)>=0){return false;}
                updated=boltCloneMarkerValue(existing);if(!updated){return false;}
                snapshot.markerEdits.push({time:marker.keyTime(key),value:boltCloneMarkerValue(existing)});
                updated.comment=oldComment.length?oldComment+" | "+comment:comment;
                marker.setValueAtTime(marker.keyTime(key),updated);
            }else{
                marker.setValueAtTime(time,new MarkerValue(comment));
                snapshot.markerAdds.push({time:time});
            }
            return true;
        }catch(ignoreManagedMarker){return false;}
    }
    function boltRestoreManagedMarkers(layer,snapshot) {
        var marker=boltLayerSafeGet(function(){return layer.property("ADBE Marker");},null),i,key,value,frame;
        if(!marker){return;}
        frame=Math.max(0.001,Number(layer.containingComp.frameDuration)||0.04);
        for(i=snapshot.markerEdits.length-1;i>=0;i--){try{marker.setValueAtTime(snapshot.markerEdits[i].time,snapshot.markerEdits[i].value);}catch(ignoreRestoreEdit){}}
        for(i=snapshot.markerAdds.length-1;i>=0;i--){
            key=boltFindMarkerKeyAtTime(marker,snapshot.markerAdds[i].time,frame*0.2);
            if(key){value=boltLayerSafeGet(function(){return marker.keyValue(key);},null);if(value&&safeString(value.comment).indexOf(BOLT_MARKER_PREFIX)>=0){try{marker.removeKey(key);}catch(ignoreRemoveManagedMarker){}}}
        }
    }
    function boltRoleComment(category,confidence,reason) {
        return BOLT_LAYER_TAG+" "+category+" • "+confidence+"% • "+reason;
    }
    function boltUpdateLayerComment(layer,category,confidence,reason) {
        var current=safeString(boltLayerSafeGet(function(){return layer.comment;},""));
        current=trim(current.replace(/\s*\[BOLT NEST\][^\r\n]*/g,""));
        layer.comment=trim(current+(current?" ":"")+boltRoleComment(category,confidence,reason));
    }
    function boltLayerSnapshot(layer) {
        return {
            kind:"layer",comp:layer.containingComp,layerId:boltLayerSafeGet(function(){return layer.id;},0),layerIndex:layer.index,
            oldName:layer.name,newName:layer.name,oldLabel:boltLayerSafeGet(function(){return layer.label;},0),
            oldLocked:boltLayerSafeGet(function(){return layer.locked;},false),oldShy:boltLayerSafeGet(function(){return layer.shy;},false),
            oldComment:boltLayerSafeGet(function(){return layer.comment;},""),oldGuide:boltLayerSafeGet(function(){return layer.guideLayer;},false),
            oldInPoint:boltLayerSafeGet(function(){return layer.inPoint;},0),oldOutPoint:boltLayerSafeGet(function(){return layer.outPoint;},0),
            created:false,markerAdds:[],markerEdits:[]
        };
    }
    function boltEnsureCompSnapshot(comp,changes,seen) {
        var key=boltLayerSafeGet(function(){return "id:"+comp.id;},"name:"+comp.name);
        if(seen[key]){return;}seen[key]=true;
        changes.push({kind:"comp",comp:comp,oldHideShyLayers:boltLayerSafeGet(function(){return comp.hideShyLayers;},false)});
    }
    function boltFindTimelineGuide(comp) {
        var i,layer;for(i=1;i<=comp.numLayers;i++){layer=comp.layer(i);if(boltIsTimelineGuide(layer)){return layer;}}return null;
    }
    function boltCreateTimelineGuide(comp,records,options,changes,compSeen) {
        var guide=boltFindTimelineGuide(comp),created=false,snapshot,bounds=boltCompTrimBounds(comp,options),frame=boltLayerFrameDuration(comp),i,r,layer,roleTimes={},markers=0,sceneRecords=[],transitionRecords=[];
        if(!guide){guide=comp.layers.addNull();created=true;guide.name="GUIDE_BoltTimeline";try{guide.moveToBeginning();}catch(ignoreGuideMove){}}
        snapshot=boltLayerSnapshot(guide);snapshot.created=created;changes.push(snapshot);
        try{guide.locked=false;}catch(ignoreGuideUnlock){}
        try{guide.comment=BOLT_TIMELINE_GUIDE_TAG+" Context-aware cleanup map";}catch(ignoreGuideComment){}
        try{guide.guideLayer=true;}catch(ignoreGuideFlag){}
        try{guide.shy=true;}catch(ignoreGuideShy){}
        try{guide.label=BOLT_LAYER_LABELS.GUIDE;}catch(ignoreGuideLabel){}
        try{guide.inPoint=bounds.start;guide.outPoint=bounds.end;}catch(ignoreGuideTrim){}
        boltEnsureCompSnapshot(comp,changes,compSeen);try{comp.hideShyLayers=true;}catch(ignoreHideGuide){}
        if(boltSetManagedMarker(guide,bounds.start,BOLT_MARKER_PREFIX+" START • "+comp.name,snapshot)){markers++;}
        for(i=0;i<records.length;i++){
            r=records[i];if(r.comp!==comp||r.protectedLayer){continue;}layer=smartLayerFindSnapshotLayer(r);if(!layer){continue;}
            if(/^(INTRO|HEADLINE|CTA|OUTRO)$/.test(r.category)){
                if(roleTimes[r.category]===undefined||layer.inPoint<roleTimes[r.category]){roleTimes[r.category]=layer.inPoint;}
            }
            if(r.category==="SCENE"){sceneRecords.push(r);}
            else if(r.category==="TRANSITION"){transitionRecords.push(r);}
        }
        sceneRecords.sort(function(a,b){return a.inPoint-b.inPoint;});
        transitionRecords.sort(function(a,b){return a.inPoint-b.inPoint;});
        if(roleTimes.INTRO!==undefined&&boltSetManagedMarker(guide,roleTimes.INTRO,BOLT_MARKER_PREFIX+" INTRO",snapshot)){markers++;}
        if(roleTimes.HEADLINE!==undefined&&boltSetManagedMarker(guide,roleTimes.HEADLINE,BOLT_MARKER_PREFIX+" HEADLINE",snapshot)){markers++;}
        for(i=0;i<sceneRecords.length&&i<40;i++){
            if(boltSetManagedMarker(guide,sceneRecords[i].inPoint,BOLT_MARKER_PREFIX+" SCENE "+padNumber(sceneRecords[i].sceneOrder||i+1,2),snapshot)){markers++;}
        }
        for(i=0;i<transitionRecords.length&&i<24;i++){
            if(boltSetManagedMarker(guide,transitionRecords[i].inPoint,BOLT_MARKER_PREFIX+" TRANSITION "+padNumber(transitionRecords[i].transitionOrder||i+1,2),snapshot)){markers++;}
        }
        if(roleTimes.CTA!==undefined&&boltSetManagedMarker(guide,roleTimes.CTA,BOLT_MARKER_PREFIX+" CTA",snapshot)){markers++;}
        if(roleTimes.OUTRO!==undefined&&boltSetManagedMarker(guide,roleTimes.OUTRO,BOLT_MARKER_PREFIX+" OUTRO",snapshot)){markers++;}
        if(boltSetManagedMarker(guide,Math.max(bounds.start,bounds.end-frame),BOLT_MARKER_PREFIX+" END",snapshot)){markers++;}
        try{guide.locked=true;}catch(ignoreGuideLock){}
        return {created:created?1:0,updated:created?0:1,markers:markers};
    }

    function readSmartLayerOptions() {
        var ui = state.ui;
        var profile = ui.layerProfile && ui.layerProfile.selection
            ? ui.layerProfile.selection.text
            : "Safe";
        var safe = profile === "Safe" || profile === "Safe Clean";
        var deep = !safe;
        return {
            profile:safe ? "Safe" : "Deep",
            scope:ui.layerScope && ui.layerScope.selection
                ? ui.layerScope.selection.text
                : "Active Comp",
            mode:safe ? "Conservative" : "Balanced",
            namingStyle:"Compact",
            renamePolicy:"Safe",
            labels:true,
            comments:false,
            shyTechnical:deep,
            lockBackgrounds:false,
            fixExpressions:true,
            trimPolicy:deep ? "Safe Source" : "Off",
            trimHandles:0,
            useWorkArea:false,
            roleMarkers:false,
            boundaryMarkers:false,
            timelineGuide:false,
            convertReferences:deep,
            protectThumbnails:deep
        };
    }
    function smartLayerThreshold(mode){return mode==="Conservative"?90:70;}
    function smartLayerAnalyze(silent){
        if(!app.project){throw new Error("Open an After Effects project first.");}
        var options=readSmartLayerOptions(),comps=boltResolveLayerScope(options.scope);if(!comps.length){throw new Error("No compositions found for the selected scope.");}
        var records=[],audit={comps:comps.length,layers:0,generic:0,duplicates:0,missing:0,unclassified:0,renames:0,trims:0,guides:0,markers:0,protectedCount:0,thumbnails:0,scenes:0,transitions:0,score:100},i,l,comp,layer,names,key,detect,reserved,messy,trimPlan,categoryCounts,sequence,duplicate,protectedLayer,record,compRecords,ordered,j,base;
        for(i=0;i<comps.length;i++){
            comp=comps[i];names={};reserved={};categoryCounts={};compRecords=[];
            for(l=1;l<=comp.numLayers;l++){names[boltLayerLower(comp.layer(l).name)]=(names[boltLayerLower(comp.layer(l).name)]||0)+1;}
            for(l=1;l<=comp.numLayers;l++){
                layer=comp.layer(l);audit.layers++;key=boltLayerLower(layer.name);duplicate=names[key]>1;protectedLayer=boltIsTimelineGuide(layer);
                if(BOLT_GENERIC_LAYER_RE.test(trim(layer.name))){audit.generic++;}if(duplicate){audit.duplicates++;}
                if(boltLayerSafeGet(function(){return boltIsFootageItem(layer.source)&&getMissingFootagePath(layer.source).length>0;},false)){audit.missing++;}
                detect=boltDetectLayerCategory(layer,comp);if(detect.category==="UNKNOWN"||detect.confidence<50){audit.unclassified++;}
                messy=boltLayerNameIsMessy(layer,duplicate);
                record={comp:comp,layer:layer,layerId:boltLayerSafeGet(function(){return layer.id;},0),layerIndex:l,oldName:layer.name,newName:layer.name,category:detect.category,confidence:detect.confidence,reason:detect.reason,duplicate:duplicate,generic:BOLT_GENERIC_LAYER_RE.test(trim(layer.name)),messy:messy,refs:0,trimPlan:null,protectedLayer:protectedLayer,contextRename:false,contextRole:"",evidence:detect.evidence||"",inPoint:Number(layer.inPoint)||0,outPoint:Number(layer.outPoint)||0,durationFrames:boltLayerDurationFrames(layer,comp)};
                compRecords.push(record);
            }
            boltRefineLayerContexts(compRecords,comp);
            for(j=0;j<compRecords.length;j++){
                if(compRecords[j].category==="THUMBNAIL"){audit.thumbnails++;}
                else if(compRecords[j].category==="SCENE"){audit.scenes++;}
                else if(compRecords[j].category==="TRANSITION"){audit.transitions++;}
            }
            ordered=compRecords.slice(0);
            ordered.sort(function(a,b){return a.inPoint===b.inPoint?a.layerIndex-b.layerIndex:a.inPoint-b.inPoint;});
            for(j=0;j<ordered.length;j++){
                record=ordered[j];
                categoryCounts[record.category]=(categoryCounts[record.category]||0)+1;sequence=categoryCounts[record.category];
                base=boltContextualName(record,options,sequence);
                record.newName=boltLayerUniqueName(comp,base,record.layer,reserved);
                trimPlan=record.protectedLayer?{start:record.layer.inPoint,end:record.layer.outPoint,changed:false,reason:"Protected guide"}:boltComputeTrimPlan(record.layer,comp,record.category,options);
                if(trimPlan.changed&&!boltTrimPlanIsSafe(record.layer,comp,record.category,trimPlan,options)){
                    trimPlan={start:record.layer.inPoint,end:record.layer.outPoint,changed:false,reason:"Protected animation, parenting, matte or marker timing"};
                }
                record.trimPlan=trimPlan;
                record.renameCandidate=boltShouldRename(record,options);
                if(record.renameCandidate){audit.renames++;}if(trimPlan.changed){audit.trims++;}
                if(options.convertReferences&&/^(REFERENCE|GUIDE|THUMBNAIL)$/.test(record.category)&&!boltLayerSafeGet(function(){return record.layer.guideLayer;},false)){audit.guides++;}
                if(options.roleMarkers&&!record.protectedLayer&&record.category!=="THUMBNAIL"){audit.markers++;}
                if(record.protectedLayer){audit.protectedCount++;}
            }
            for(j=0;j<compRecords.length;j++){records.push(compRecords[j]);}
        }
        var total=Math.max(1,audit.layers),penalty=0;penalty+=Math.min(24,audit.generic/total*48);penalty+=Math.min(12,audit.duplicates/total*38);penalty+=Math.min(20,audit.missing*6);penalty+=Math.min(8,audit.unclassified/total*18);penalty+=Math.min(14,audit.trims/total*24);audit.score=Math.max(0,Math.round(100-penalty));
        state.layerAnalysis={records:records,audit:audit,options:options,expressionEntries:[],previewLines:[]};updateSmartLayerSummary();
        populateSmartLayerPreview(state.layerAnalysis);
        if(!silent){setStatus("Layer audit: "+audit.comps+" comps • "+audit.scenes+" scenes • "+audit.transitions+" transitions • "+audit.thumbnails+" thumbnail • "+audit.renames+" contextual renames • "+audit.trims+" trims",audit.missing?"warning":"ok");}
        return state.layerAnalysis;
    }
    function smartLayerPreviewLines(analysis){
        if(!analysis){return [];}
        var options=analysis.options,threshold=smartLayerThreshold(options.mode),lines=[],i,r,actions,currentLabel;
        for(i=0;i<analysis.records.length;i++){
            r=analysis.records[i];actions=[];
            if(r.renameCandidate&&r.confidence>=threshold&&r.oldName!==r.newName&&!(r.duplicate&&r.refs>0)){
                actions.push("rename to " + r.newName);
            }
            if(r.trimPlan&&r.trimPlan.changed&&(r.confidence>=threshold||options.trimPolicy==="Safe Source")){
                actions.push("trim " + Number(r.trimPlan.start).toFixed(3) + "-" + Number(r.trimPlan.end).toFixed(3) + "s");
            }
            if(options.convertReferences&&r.confidence>=threshold&&/^(REFERENCE|GUIDE|THUMBNAIL)$/.test(r.category)&&!boltLayerSafeGet(function(){return r.layer.guideLayer;},false)){
                actions.push("guide layer");
            }
            currentLabel=boltLayerSafeGet(function(){return r.layer.label;},0);
            if(options.labels&&r.confidence>=threshold&&currentLabel!==(BOLT_LAYER_LABELS[r.category]||1)){actions.push("label");}
            if(options.protectThumbnails&&r.category==="THUMBNAIL"){actions.push("shy + lock");}
            else if(options.shyTechnical&&r.confidence>=threshold&&/^(CTRL|NULL|MATTE|REFERENCE|GUIDE)$/.test(r.category)){actions.push("shy");}
            if(actions.length){lines.push(r.comp.name+" > #"+r.layerIndex+" "+r.oldName+"  |  "+actions.join(", "));}
        }
        if(options.timelineGuide){lines.push("All scoped comps  |  create or update Bolt timeline guide");}
        analysis.previewLines=lines;
        return lines;
    }
    function populateSmartLayerPreview(analysis){
        var lines=smartLayerPreviewLines(analysis),list=state.ui&&state.ui.layerPreview?state.ui.layerPreview:null,i;
        if(list){
            list.removeAll();
            if(lines.length){for(i=0;i<lines.length;i++){list.add("item",lines[i]);}}
            else{list.add("item","No changes are proposed for this scope.");}
        }
        if(state.ui&&state.ui.layerApplyButton){state.ui.layerApplyButton.enabled=lines.length>0;}
        return lines;
    }
    function updateSmartLayerSummary(){
        if(!state.ui||!state.ui.layerSummary){return;}var a=state.layerAnalysis?state.layerAnalysis.audit:null;
        state.ui.layerSummary.text=a?(a.comps+" comps • "+a.layers+" layers • "+a.scenes+" scenes • "+a.transitions+" transitions • "+a.thumbnails+" thumbnail • "+a.renames+" rename • "+a.trims+" trim • score "+a.score+"/100"):"Scan to preview the cleanup.";
    }
    function smartLayerFindSnapshotLayer(change){
        var comp=change.comp,i,layer;if(!comp||!projectContainsItem(comp)){return null;}
        if(change.layerId){for(i=1;i<=comp.numLayers;i++){layer=comp.layer(i);if(boltLayerSafeGet(function(){return layer.id;},0)===change.layerId){return layer;}}}
        if(change.layerIndex>=1&&change.layerIndex<=comp.numLayers){layer=comp.layer(change.layerIndex);if(!change.oldName||layer.name===change.oldName||layer.name===change.newName){return layer;}}
        for(i=1;i<=comp.numLayers;i++){layer=comp.layer(i);if(layer.name===change.oldName||layer.name===change.newName){return layer;}}
        return null;
    }
    function smartLayerAnalysisIsCurrent(analysis){
        if(!analysis||!analysis.records){return false;}
        var i,r,layer,tolerance;
        for(i=0;i<analysis.records.length;i++){
            r=analysis.records[i];layer=smartLayerFindSnapshotLayer(r);
            if(!layer||layer.name!==r.oldName){return false;}
            tolerance=Math.max(0.0001,Number(r.comp&&r.comp.frameDuration)||0.04)*0.25;
            if(Math.abs(Number(layer.inPoint)-r.inPoint)>tolerance||Math.abs(Number(layer.outPoint)-r.outPoint)>tolerance){return false;}
        }
        return true;
    }
    function applySmartLayerManagement(skipConfirmation){
        var analysis=state.layerAnalysis||smartLayerAnalyze(true),options,threshold,changes=[],expressionChanges=[],compSeen={},renamed=0,labelled=0,repaired=0,trimmed=0,markers=0,guides=0,guideMaps=0,skipped=0,i,r,layer,snapshot,modified,roleAllowed,oldLocked,guideResult,comp,renameCount=0,previewLines;
        if(!smartLayerAnalysisIsCurrent(analysis)){
            state.layerAnalysis=null;
            if(state.ui&&state.ui.layerApplyButton){state.ui.layerApplyButton.enabled=false;}
            throw new Error("The project changed after the layer scan. Scan again to build a current itemized plan.");
        }
        options=analysis.options;threshold=smartLayerThreshold(options.mode);
        for(i=0;i<analysis.records.length;i++){if(analysis.records[i].renameCandidate&&analysis.records[i].confidence>=threshold){renameCount++;}}
        if(options.fixExpressions&&renameCount>0){
            setStatus("Indexing expressions for safe renaming...","ok");
            analysis.expressionEntries=boltBuildExpressionIndex();
            for(i=0;i<analysis.records.length;i++){
                r=analysis.records[i];
                if(r.renameCandidate&&r.confidence>=threshold){r.refs=boltCountLayerReferences(r.comp,r.oldName,analysis.expressionEntries);}
            }
        }
        previewLines=populateSmartLayerPreview(analysis);
        if(!previewLines.length){throw new Error("The layer scan found no safe changes to apply.");}
        if(!skipConfirmation && !confirmItemizedAction(
            "Clean Layers",
            "Review the exact layer changes. Bolt will not delete any layer or precomp.",
            previewLines,
            "Apply " + previewLines.length + " change(s)",
            "Safe only renames and labels. Deep can also trim safe source bounds and protect confidently detected technical or thumbnail layers."
        )){return;}
        app.beginUndoGroup("Bolt Clean Layers");
        try{
            for(i=analysis.records.length-1;i>=0;i--){
                r=analysis.records[i];layer=smartLayerFindSnapshotLayer(r);if(!layer){skipped++;continue;}
                roleAllowed=r.confidence>=threshold;modified=false;snapshot=boltLayerSnapshot(layer);oldLocked=snapshot.oldLocked;
                try{layer.locked=false;}catch(ignoreUnlock){}
                if(r.renameCandidate&&roleAllowed&&layer.name!==r.newName){
                    if(r.duplicate&&r.refs>0){skipped++;}
                    else{if(options.fixExpressions&&r.refs>0){repaired+=boltRepairLayerReferences(r.comp,layer.name,r.newName,analysis.expressionEntries,expressionChanges);}layer.name=r.newName;snapshot.newName=layer.name;renamed++;modified=true;}
                }
                if(r.trimPlan.changed&&(roleAllowed||options.trimPolicy==="Safe Source")){
                    try{layer.inPoint=r.trimPlan.start;layer.outPoint=r.trimPlan.end;trimmed++;modified=true;}catch(ignoreTrimApply){skipped++;}
                }
                if(options.convertReferences&&roleAllowed&&/^(REFERENCE|GUIDE|THUMBNAIL)$/.test(r.category)&&!boltLayerSafeGet(function(){return layer.guideLayer;},false)){
                    try{layer.guideLayer=true;guides++;modified=true;}catch(ignoreGuideApply){}
                }
                if(options.roleMarkers&&roleAllowed&&!r.protectedLayer&&r.category!=="THUMBNAIL"){
                    if(boltSetManagedMarker(layer,layer.inPoint,BOLT_MARKER_PREFIX+" ROLE • "+r.category+" • "+r.reason,snapshot)){markers++;modified=true;}
                    if(options.boundaryMarkers&&boltSetManagedMarker(layer,Math.max(layer.inPoint,layer.outPoint-Math.max(0.001,r.comp.frameDuration)),BOLT_MARKER_PREFIX+" OUT • "+r.category,snapshot)){markers++;modified=true;}
                }
                if(options.labels&&roleAllowed&&(boltLayerSafeGet(function(){return layer.label;},0)!==(BOLT_LAYER_LABELS[r.category]||1))){layer.label=BOLT_LAYER_LABELS[r.category]||1;labelled++;modified=true;}
                if(options.comments&&roleAllowed){boltUpdateLayerComment(layer,r.category,r.confidence,r.reason);modified=true;}
                if((options.protectThumbnails&&r.category==="THUMBNAIL")||(options.shyTechnical&&roleAllowed&&/^(CTRL|NULL|MATTE|REFERENCE|GUIDE)$/.test(r.category))){
                    if(!boltLayerSafeGet(function(){return layer.shy;},false)){layer.shy=true;modified=true;}
                    boltEnsureCompSnapshot(r.comp,changes,compSeen);try{r.comp.hideShyLayers=true;}catch(ignoreHideShy){}
                }
                if((options.protectThumbnails&&r.category==="THUMBNAIL")||(options.lockBackgrounds&&roleAllowed&&/^(BG|REFERENCE|GUIDE)$/.test(r.category))){try{layer.locked=true;modified=true;}catch(ignoreLockBackground){}}
                else{try{layer.locked=oldLocked;}catch(ignoreRestoreOriginalLock){}}
                if(modified){changes.push(snapshot);}
            }
            if(options.timelineGuide){
                var scopeComps=boltResolveLayerScope(options.scope);
                for(i=0;i<scopeComps.length;i++){comp=scopeComps[i];guideResult=boltCreateTimelineGuide(comp,analysis.records,options,changes,compSeen);guideMaps+=guideResult.created+guideResult.updated;markers+=guideResult.markers;}
            }
        }finally{app.endUndoGroup();}
        state.layerChanges=changes;state.layerExpressionEntries=expressionChanges;state.layerAnalysis=null;
        if(state.ui&&state.ui.layerRestoreButton){state.ui.layerRestoreButton.enabled=changes.length>0||expressionChanges.length>0;}
        if(state.ui&&state.ui.layerSummary){state.ui.layerSummary.text=renamed+" renamed • "+labelled+" labelled • "+trimmed+" exact trims • "+guides+" guides";}
        setStatus("Clean Layers: "+renamed+" renamed • "+labelled+" labelled • "+trimmed+" trimmed • "+markers+" markers • "+guides+" guide layers • "+guideMaps+" timeline maps"+(repaired?" • "+repaired+" expressions repaired":"")+(skipped?" • "+skipped+" protected/skipped":""),skipped?"warning":"ok");
    }
    function restoreSmartLayerManagement(){
        if(!state.layerChanges.length&&!state.layerExpressionEntries.length){throw new Error("No Clean Layers changes are available to restore in this session.");}
        if(!confirm("Restore the last Bolt layer cleanup?\n\nNames, timing, labels, guide status, markers, locks, shy state, comments and repaired expressions will be restored.")){return;}
        var restored=0,skipped=0,i,c,layer,expressionChange;
        app.beginUndoGroup("Restore Bolt Clean Layers");
        try{
            for(i=state.layerChanges.length-1;i>=0;i--){
                c=state.layerChanges[i];
                if(c.kind==="comp"){try{c.comp.hideShyLayers=c.oldHideShyLayers;restored++;}catch(ignoreRestoreComp){skipped++;}continue;}
                if(c.created){layer=smartLayerFindSnapshotLayer(c);if(layer){try{layer.remove();restored++;}catch(ignoreRemoveCreatedGuide){skipped++;}}else{skipped++;}continue;}
                layer=smartLayerFindSnapshotLayer(c);if(!layer){skipped++;continue;}
                try{layer.locked=false;}catch(ignoreRestoreUnlock){}
                try{layer.inPoint=c.oldInPoint;layer.outPoint=c.oldOutPoint;}catch(ignoreRestoreTiming){}
                try{layer.name=c.oldName;}catch(ignoreRestoreName){}
                try{layer.label=c.oldLabel;}catch(ignoreRestoreLabel){}
                try{layer.guideLayer=c.oldGuide;}catch(ignoreRestoreGuide){}
                try{layer.shy=c.oldShy;}catch(ignoreRestoreShy){}
                try{layer.comment=c.oldComment;}catch(ignoreRestoreComment){}
                boltRestoreManagedMarkers(layer,c);
                try{layer.locked=c.oldLocked;}catch(ignoreRestoreLock){}
                restored++;
            }
            for(i=state.layerExpressionEntries.length-1;i>=0;i--){expressionChange=state.layerExpressionEntries[i];try{expressionChange.property.expression=expressionChange.oldExpression;}catch(ignoreRestoreExpression){skipped++;}}
        }finally{app.endUndoGroup();}
        state.layerChanges=[];state.layerExpressionEntries=[];state.layerAnalysis=null;
        if(state.ui&&state.ui.layerRestoreButton){state.ui.layerRestoreButton.enabled=false;}
        if(state.ui&&state.ui.layerApplyButton){state.ui.layerApplyButton.enabled=false;}
        if(state.ui&&state.ui.layerPreview){state.ui.layerPreview.removeAll();state.ui.layerPreview.add("item","Last layer cleanup restored. Click Scan for a new plan.");}
        if(state.ui&&state.ui.layerSummary){state.ui.layerSummary.text="Last cleanup restored • "+restored+" item(s)";}
        setStatus("Restored "+restored+" cleanup item(s)"+(skipped?" • "+skipped+" unavailable":""),skipped?"warning":"ok");
    }

    function boltCompHasDynamicLayerExpression(comp, expressionEntries) {
        var index, entry, expression, scrubbed, targetName, escapedTarget;
        targetName = safeString(comp ? comp.name : "");
        escapedTarget = boltEscapeRegex(targetName);

        for (index = 0; index < expressionEntries.length; index++) {
            entry = expressionEntries[index];
            expression = safeString(entry.expression);
            if (!/\blayer\s*\(/i.test(expression)) { continue; }

            // Dynamic comp(...) + layer(...) references cannot be resolved to one
            // target composition with certainty. In that case preserve every
            // candidate layer rather than risk deleting an external dependency.
            if (/\bcomp\s*\(\s*[^"'\s][^)]*\)\s*\.\s*layer\s*\(/i.test(expression)) {
                return true;
            }

            if (entry.comp === comp) {
                scrubbed = expression.replace(/(?:thisComp\s*\.\s*)?layer\s*\(\s*(["'])[^"']+\1\s*\)/ig, "");
                if (/\blayer\s*\(/i.test(scrubbed)) { return true; }
            }

            // Also protect a comp when another composition addresses one of its
            // layers by index/computed value, e.g. comp("Main").layer(3).
            if (targetName.length) {
                var externalPattern = new RegExp(
                    "comp\\s*\\(\\s*([\\\"'])" + escapedTarget + "\\1\\s*\\)\\s*\\.\\s*layer\\s*\\(",
                    "i"
                );
                if (externalPattern.test(expression)) {
                    scrubbed = expression.replace(
                        new RegExp(
                            "comp\\s*\\(\\s*([\\\"'])" + escapedTarget + "\\1\\s*\\)\\s*\\.\\s*layer\\s*\\(\\s*([\\\"'])[^\\\"']+\\2\\s*\\)",
                            "ig"
                        ),
                        ""
                    );
                    if (externalPattern.test(scrubbed)) { return true; }
                }
            }
        }
        return false;
    }

    function boltLayerHasAnimationOrExpression(layer) {
        var found = false;
        boltWalkLayerProperties(layer, function (prop) {
            if (found) { return; }
            try {
                if (prop.numKeys && prop.numKeys > 0) { found = true; return; }
            } catch (ignoreLayerKeys) {}
            try {
                if (prop.canSetExpression && trim(prop.expression).length) { found = true; }
            } catch (ignoreLayerExpression) {}
        });
        return found;
    }

    function boltLayerHasMarkers(layer) {
        try {
            var marker = layer.property(AE_PROP_MARKER);
            return !!(marker && marker.numKeys > 0);
        } catch (ignoreMarkerCheck) { return false; }
    }

    function boltLayerHasMasks(layer) {
        try {
            var masks = layer.property("ADBE Mask Parade");
            return !!(masks && masks.numProperties > 0);
        } catch (ignoreMaskCheck) { return false; }
    }

    function boltLayerReferencedByLayerControl(targetLayer, comp) {
        if (!targetLayer || !comp) { return false; }
        var targetIndex = Number(targetLayer.index) || 0;
        var layerIndex, layer, referenced = false;

        for (layerIndex = 1; layerIndex <= comp.numLayers && !referenced; layerIndex++) {
            layer = comp.layer(layerIndex);
            if (layer === targetLayer) { continue; }
            boltWalkLayerProperties(layer, function (prop) {
                if (referenced) { return; }
                try {
                    if (
                        typeof PropertyValueType !== "undefined" &&
                        prop.propertyValueType === PropertyValueType.LAYER_INDEX &&
                        Number(prop.value) === targetIndex
                    ) {
                        referenced = true;
                    }
                } catch (ignoreLayerControlRead) {}
            });
        }
        return referenced;
    }

    function boltLayerIsProvablyUnused(layer, comp, expressionEntries, dynamicLayerRefs) {
        if (!layer || !comp) { return false; }
        if (dynamicLayerRefs) { return false; }
        if (boltIsTimelineGuide(layer)) { return false; }
        if (boltLayerSafeGet(function(){return layer.locked===true;},false)) { return false; }
        if (boltLayerSafeGet(function(){return layer.parent!==null;},false)) { return false; }
        if (boltLayerUsedAsParent(layer, comp)) { return false; }
        if (boltLayerIsMatte(layer)) { return false; }
        if (boltLayerHasMarkers(layer) || boltLayerHasMasks(layer)) { return false; }
        if (boltLayerHasEffects(layer)) { return false; }
        if (boltLayerHasAnimationOrExpression(layer)) { return false; }
        if (boltCountLayerReferences(comp, layer.name, expressionEntries) > 0) { return false; }
        if (boltLayerReferencedByLayerControl(layer, comp)) { return false; }
        if (boltLayerSafeGet(function(){return layer.guideLayer===true;},false)) { return false; }
        if (boltLayerSafeGet(function(){return layer.adjustmentLayer===true;},false)) { return false; }
        if (boltLayerSafeGet(function(){return layer.matchName==="ADBE Camera Layer" || layer.matchName==="ADBE Light Layer";},false)) { return false; }

        // Empty text layers are safe only when Source Text itself is empty and static.
        if (boltLayerIsText(layer)) {
            var sourceText = boltLayerSafeGet(function(){
                return layer.property(AE_PROP_TEXT).property("ADBE Text Document");
            }, null);
            if (!sourceText) { return false; }
            try { if (sourceText.numKeys > 0 || trim(sourceText.expression).length) { return false; } } catch (ignoreTextAnim) {}
            return trim(boltLayerText(layer)).length === 0;
        }

        // Empty shape layers with no vector contents, effects, masks or animation.
        if (boltLayerIsShape(layer)) {
            var vectors = boltLayerSafeGet(function(){return layer.property("ADBE Root Vectors Group");}, null);
            return !!(vectors && vectors.numProperties === 0);
        }

        // Only generic, completely inert nulls are auto-removed. Named controllers
        // are intentionally preserved even when Bolt cannot see a reference.
        if (boltLayerSafeGet(function(){return layer.nullLayer===true;},false)) {
            if (!BOLT_GENERIC_LAYER_RE.test(trim(layer.name)) && !/^null(?:\s*object)?\s*\d*$/i.test(trim(layer.name))) {
                return false;
            }
            return true;
        }

        return false;
    }

    function boltCollectSafeUnusedLayers(expressionEntries) {
        var output = [], compIndex, comp, layerIndex, dynamicRefs;
        if (!app.project) { return output; }
        for (compIndex = 1; compIndex <= app.project.numItems; compIndex++) {
            comp = app.project.item(compIndex);
            if (!(comp instanceof CompItem)) { continue; }
            dynamicRefs = boltCompHasDynamicLayerExpression(comp, expressionEntries);
            for (layerIndex = comp.numLayers; layerIndex >= 1; layerIndex--) {
                if (boltLayerIsProvablyUnused(comp.layer(layerIndex), comp, expressionEntries, dynamicRefs)) {
                    output.push({comp:comp, layer:comp.layer(layerIndex), name:comp.layer(layerIndex).name});
                }
            }
        }
        return output;
    }

    function boltSmartLabelAllLayers() {
        var labelled = 0, skipped = 0, compIndex, comp, layerIndex, layer, detect, wanted;
        if (!app.project) { return {labelled:0, skipped:0}; }
        for (compIndex = 1; compIndex <= app.project.numItems; compIndex++) {
            comp = app.project.item(compIndex);
            if (!(comp instanceof CompItem)) { continue; }
            for (layerIndex = 1; layerIndex <= comp.numLayers; layerIndex++) {
                layer = comp.layer(layerIndex);
                detect = boltDetectLayerCategory(layer, comp);
                if (!detect || detect.category === "UNKNOWN" || detect.confidence < 80) {
                    skipped++;
                    continue;
                }
                wanted = BOLT_LAYER_LABELS[detect.category] || 1;
                try {
                    if (layer.label !== wanted) {
                        layer.label = wanted;
                        labelled++;
                    }
                } catch (ignoreSmartLabel) { skipped++; }
            }
        }
        return {labelled:labelled, skipped:skipped};
    }

    function boltFootageSignature(item) {
        if (!boltIsFootageItem(item)) { return ""; }
        var file = boltGetFootageFile(item);
        if (!file || !file.exists || boltIsLayeredDesignFile(file) || isSequenceFootage(item)) { return ""; }
        var proxy = boltGetProxyFile(item);
        var source = null;
        try { source = item.mainSource; } catch (ignoreMainSource) { source = null; }
        var parts = [normalizePath(file.fsName)];
        function add(value) { parts.push(safeString(value)); }
        function addItemProperty(name) {
            try { add(item[name]); } catch (ignoreItemProperty) { add(""); }
        }
        addItemProperty("width");
        addItemProperty("height");
        addItemProperty("pixelAspect");
        addItemProperty("duration");
        addItemProperty("frameRate");
        if (source) {
            var attrs = ["isStill","alphaMode","invertAlpha","fieldSeparationType","highQualityFieldSeparation","removePulldown","conformFrameRate","displayFrameRate","loop","nativeFrameRate"];
            var index;
            for (index = 0; index < attrs.length; index++) {
                try { add(source[attrs[index]]); } catch (ignoreSourceAttr) { add(""); }
            }
            try { add(source.premulColor ? source.premulColor.join(",") : ""); } catch (ignorePremul) { add(""); }
        }
        try { add(item.useProxy === true ? "proxy-on" : "proxy-off"); } catch (ignoreUseProxy) { add("proxy-off"); }
        add(proxy && proxy.exists ? normalizePath(proxy.fsName) : "");
        return parts.join("|");
    }

    function boltReplaceFootageItemUses(oldItem, newItem) {
        var replaced = 0, compIndex, comp, layerIndex, layer, wasLocked;
        for (compIndex = 1; compIndex <= app.project.numItems; compIndex++) {
            comp = app.project.item(compIndex);
            if (!(comp instanceof CompItem)) { continue; }
            for (layerIndex = 1; layerIndex <= comp.numLayers; layerIndex++) {
                layer = comp.layer(layerIndex);
                try {
                    if (layer.source !== oldItem) { continue; }
                    wasLocked = layer.locked === true;
                    if (wasLocked) { layer.locked = false; }
                    layer.replaceSource(newItem, false);
                    if (wasLocked) { layer.locked = true; }
                    replaced++;
                } catch (replaceError) {
                    try { if (wasLocked) { layer.locked = true; } } catch (ignoreRelock) {}
                    throw replaceError;
                }
            }
        }
        return replaced;
    }

    function boltRemoveDuplicateProjectFootage(expressionEntries) {
        var safety = boltFootageExpressionSafety(expressionEntries);
        var groups = {}, index, item, signature, key, group, canonical, candidate;
        var removed = 0, replaced = 0, protectedCount = 0, usage, bestUsage, memberIndex;
        if (!app.project || safety.dynamicFootageReference) {
            return {removed:0, replaced:0, protectedCount:safety.dynamicFootageReference ? 1 : 0};
        }

        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            signature = boltFootageSignature(item);
            if (!signature) { continue; }
            if (!groups[signature]) { groups[signature] = []; }
            groups[signature].push(item);
        }

        for (key in groups) {
            if (!groups.hasOwnProperty(key)) { continue; }
            group = groups[key];
            if (group.length < 2) { continue; }

            // If any duplicate name is an explicit footage("Name") dependency,
            // preserve the whole group instead of rewriting semantics by guess.
            var protectedGroup = false;
            for (memberIndex = 0; memberIndex < group.length; memberIndex++) {
                if (safety.protectedNames[safeString(group[memberIndex].name).toLowerCase()]) {
                    protectedGroup = true;
                    break;
                }
            }
            if (protectedGroup) {
                protectedCount += group.length;
                continue;
            }

            canonical = group[0];
            bestUsage = footageUseCount(canonical);
            for (memberIndex = 1; memberIndex < group.length; memberIndex++) {
                usage = footageUseCount(group[memberIndex]);
                if (usage > bestUsage) {
                    canonical = group[memberIndex];
                    bestUsage = usage;
                }
            }

            for (memberIndex = 0; memberIndex < group.length; memberIndex++) {
                candidate = group[memberIndex];
                if (candidate === canonical || !projectContainsItem(candidate)) { continue; }
                try {
                    replaced += boltReplaceFootageItemUses(candidate, canonical);
                    if (footageUseCount(candidate) === 0) {
                        candidate.remove();
                        removed++;
                    } else {
                        protectedCount++;
                    }
                } catch (duplicateError) {
                    protectedCount++;
                }
            }
        }
        return {removed:removed, replaced:replaced, protectedCount:protectedCount};
    }

    function boltRemoveUnusedProjectFootageSafe() {
        var report = analyzeUnusedProjectFootage();
        var removed = 0, protectedCount = report.protectedItems.length, index, item;
        for (index = 0; index < report.removable.length; index++) {
            item = report.removable[index];
            if (!projectContainsItem(item)) { continue; }
            try {
                item.remove();
                removed++;
            } catch (ignoreUnusedRemove) { protectedCount++; }
        }
        return {removed:removed, protectedCount:protectedCount, dynamicExpression:report.dynamicExpression};
    }

    function runMinimalProjectClean() {
        if (!app.project) { throw new Error("Open an After Effects project first."); }

        // Build the safety index before changing any layers/items.
        setStatus("Clean: checking references...", "ok");
        var expressionEntries = boltBuildExpressionIndex();
        var safeLayers = boltCollectSafeUnusedLayers(expressionEntries);
        var unusedPreview = analyzeUnusedProjectFootage();
        var duplicatePreviewCount = 0, previewGroups = {}, projectIndex, projectItem, sig;
        for (projectIndex = 1; projectIndex <= app.project.numItems; projectIndex++) {
            projectItem = app.project.item(projectIndex);
            sig = boltFootageSignature(projectItem);
            if (!sig) { continue; }
            previewGroups[sig] = (previewGroups[sig] || 0) + 1;
        }
        for (sig in previewGroups) {
            if (previewGroups.hasOwnProperty(sig) && previewGroups[sig] > 1) {
                duplicatePreviewCount += previewGroups[sig] - 1;
            }
        }

        var summary = [];
        summary.push("Smart-label layers by role (no rename or trim)");
        summary.push("Safe empty/unreferenced layers: " + safeLayers.length);
        summary.push("Duplicate imported Project items: up to " + duplicatePreviewCount);
        summary.push("Unused imported Project items: " + unusedPreview.removable.length);
        summary.push("Source files on disk: NEVER deleted");
        summary.push("Missing/offline media: preserved");

        if (!confirm(
            "BOLT 17.1 SAFE CLEAN\n\n" + summary.join("\n") +
            "\n\nAll changes are grouped into one After Effects Undo step. Continue?"
        )) {
            setStatus("Clean cancelled.", "warning");
            return;
        }

        var labelResult = {labelled:0, skipped:0};
        var duplicateResult = {removed:0, replaced:0, protectedCount:0};
        var unusedResult = {removed:0, protectedCount:0, dynamicExpression:false};
        var removedLayers = 0, protectedLayers = 0, emptyContext = {emptyFoldersRemoved:0, warnings:[]};
        var warnings = [], index, entry;

        app.beginUndoGroup("Bolt 17.1 Safe Clean Project");
        try {
            setStatus("Clean: smart-labeling layers...", "ok");
            labelResult = boltSmartLabelAllLayers();

            setStatus("Clean: removing provably unused layers...", "ok");
            // Remove from bottom to top per comp. Candidate records hold live layer
            // objects, so source/index changes elsewhere do not affect this pass.
            for (index = 0; index < safeLayers.length; index++) {
                entry = safeLayers[index];
                try {
                    if (entry.layer && entry.comp && projectContainsItem(entry.comp)) {
                        entry.layer.remove();
                        removedLayers++;
                    }
                } catch (unusedLayerError) {
                    protectedLayers++;
                    warnings.push(entry.comp.name + " / " + entry.name + ": " + unusedLayerError.message);
                }
            }

            setStatus("Clean: consolidating duplicate Project footage...", "ok");
            duplicateResult = boltRemoveDuplicateProjectFootage(expressionEntries);

            setStatus("Clean: removing unused Project footage...", "ok");
            unusedResult = boltRemoveUnusedProjectFootageSafe();

            removeEmptyNonCoreProjectFolders(emptyContext);
        } finally {
            app.endUndoGroup();
        }

        try { app.project.save(); } catch (saveError) { warnings.push("Project save: " + saveError.message); }

        boltRefreshProjectStructureUI();
        updateHeroLabel();
        state.layerAnalysis = null;
        try { updateSmartLayerSummary(); } catch (ignoreLayerSummary) {}

        var reviewCount = warnings.length + duplicateResult.protectedCount +
            unusedResult.protectedCount + protectedLayers;
        var message =
            "Clean complete • " + labelResult.labelled + " labelled" +
            " • " + removedLayers + " empty layer(s) removed" +
            " • " + duplicateResult.removed + " duplicate Project item(s) removed" +
            " • " + unusedResult.removed + " unused Project item(s) removed" +
            " • " + (emptyContext.emptyFoldersRemoved || 0) + " empty folder(s) removed" +
            (reviewCount ? " • " + reviewCount + " protected/review" : "");
        setStatus(message, reviewCount ? "warning" : "ok");

        if (state.ui && state.ui.statusLabel) {
            state.ui.statusLabel.helpTip = message +
                "\n\nNo source file was deleted from disk." +
                (warnings.length ? "\n\nWarnings:\n" + warnings.join("\n") : "");
        }
    }

    function boltOpenExternalURL(url) {
        var target = trim(url);
        if (!/^https?:\/\//i.test(target)) {
            throw new Error("Invalid update URL.");
        }

        var osName = safeString($.os).toLowerCase();
        if (osName.indexOf("windows") !== -1) {
            // Use the Windows shell so the user's default browser handles GitHub.
            system.callSystem('cmd.exe /d /s /c start "" "' + target + '"');
            return;
        }

        if (osName.indexOf("mac") !== -1) {
            system.callSystem("/usr/bin/open " + shellSingleQuote(target));
            return;
        }

        // Fallback for any other host OS.
        system.callSystem("xdg-open " + shellSingleQuote(target) + " >/dev/null 2>&1 &");
    }

    function showInfoDialog() {
        var dialog = new Window("dialog", brandTitle("Info"));
        dialog.orientation = "column";
        dialog.alignChildren = ["fill", "top"];
        dialog.spacing = 8;
        dialog.margins = 14;
        dialog.preferredSize.width = 340;

        var title = dialog.add("statictext", undefined, "BOLT " + VERSION);
        try { title.graphics.font = ScriptUI.newFont(title.graphics.font.name, "BOLD", 16); } catch (ignoreInfoTitleFont) {}

        var byline = dialog.add("statictext", undefined, "Developed by " + DEVELOPER_NAME + "\n" + DEVELOPER_ROLE, {multiline:true});
        byline.alignment = ["fill", "top"];

        dialog.add("panel");

        var summary = dialog.add("statictext", undefined,
            "Project organization, motion, styling, render and utility tools for After Effects.",
            {multiline:true});
        summary.alignment = ["fill", "top"];
        summary.preferredSize.height = 36;

        dialog.add("statictext", undefined, "Build: " + BUILD_ID);
        var updateLine = dialog.add("statictext", undefined, "github.com/tasnimul-rsd/BOLT");
        updateLine.helpTip = BOLT_UPDATE_URL;

        var infoButtons = dialog.add("group");
        infoButtons.orientation = "row";
        infoButtons.alignChildren = ["center", "center"];
        infoButtons.alignment = ["center", "top"];
        infoButtons.spacing = 8;

        var checkUpdateButton = infoButtons.add("button", undefined, "Check Update");
        checkUpdateButton.helpTip = "Open the official Bolt GitHub page.";
        checkUpdateButton.onClick = function () {
            try {
                boltOpenExternalURL(BOLT_UPDATE_URL);
                setStatus("Opened Bolt update page.", "ok");
            } catch (updateError) {
                alert(
                    "Could not open the Bolt GitHub page.\n\n" +
                    BOLT_UPDATE_URL +
                    "\n\n" +
                    (updateError && updateError.message ? updateError.message : safeString(updateError)),
                    brandTitle("Update"),
                    true
                );
            }
        };

        infoButtons.add("button", undefined, "Close", { name: "ok" });
        dialog.center();
        dialog.show();
    }

    function boltWheelDelta(event) {
            var value = 0;
            try { if (event.deltaY !== undefined) { value = Number(event.deltaY); } } catch (ignoreDeltaY) {}
            if (!value) { try { if (event.wheelDeltaY !== undefined) { value = -Number(event.wheelDeltaY); } } catch (ignoreWheelDeltaY) {} }
            if (!value) { try { if (event.wheelDelta !== undefined) { value = -Number(event.wheelDelta); } } catch (ignoreWheelDelta) {} }
            if (!value) { try { if (event.delta !== undefined) { value = Number(event.delta); } } catch (ignoreDelta) {} }
            if (!value) { try { if (event.detail !== undefined) { value = Number(event.detail); } } catch (ignoreDetail) {} }
            return isFinite(value) ? value : 0;
        }

    function createScrollableContent(tab) {
            tab.orientation = "row";
            tab.alignChildren = ["fill", "fill"];
            tab.alignment = ["fill", "fill"];
            tab.spacing = 2;
            tab.margins = 0;
            tab.minimumSize = [0, 0];
            tab.maximumSize = [10000, 10000];
    
            var viewport = tab.add("group");
            viewport.orientation = "stack";
            viewport.alignChildren = ["left", "top"];
            viewport.alignment = ["fill", "fill"];
            viewport.spacing = 0;
            viewport.margins = 0;
            viewport.minimumSize = [0, 0];
            viewport.maximumSize = [10000, 10000];
    
            var content = viewport.add("group");
            content.orientation = "column";
            content.alignChildren = ["fill", "top"];
            content.alignment = ["left", "top"];
            content.spacing = 4;
            content.margins = [3, 3, 3, 7];
            content.minimumSize = [0, 0];
            content.maximumSize = [10000, 10000];
    
            var scrollbar = tab.add("scrollbar", undefined, 0, 0, 100);
            scrollbar.alignment = ["right", "fill"];
            scrollbar.preferredSize.width = 9;
            scrollbar.minimumSize.width = 9;
            scrollbar.maximumSize.width = 9;
            scrollbar.visible = false;
            scrollbar.enabled = false;
            try { scrollbar.stepdelta = 44; scrollbar.jumpdelta = 160; } catch (ignoreScrollDelta) {}
    
            var area = {
                tab: tab,
                viewport: viewport,
                content: content,
                scrollbar: scrollbar,
                contentWidth: 1,
                contentHeight: 1,
                viewHeight: 1,
                lastWheelTime: 0,
                lastWheelDirection: 0,
                lastWheelStamp: "",
                lastWheelEvent: null
            };
    
            tab._boltScrollArea = area;
            viewport._boltScrollArea = area;
            content._boltScrollArea = area;
    
            function updateLocation() {
                var maximum = Math.max(0, Number(scrollbar.maxvalue) || 0);
                var value = Math.max(0, Math.min(maximum, Number(scrollbar.value) || 0));
                var y = -Math.round(value);
                var width = Math.max(1, Number(area.contentWidth) || Number(viewport.size.width) || 1);
                var height = Math.max(1, Number(area.contentHeight) || Number(content.size.height) || 1);
    
                try { scrollbar.value = value; } catch (ignoreScrollValue) {}
                try { content.location = [0, y]; } catch (ignoreLocationArray) {}
                try { content.location.x = 0; content.location.y = y; } catch (ignoreLocationPoint) {}
                try { content.bounds = [0, y, width, y + height]; } catch (ignoreContentBounds) {}
                try { viewport.update(); } catch (ignoreViewportUpdate) {}
                try { tab.update(); } catch (ignoreTabUpdate) {}
            }
    
            function scrollTo(value) {
                if (!scrollbar.enabled) { return; }
                scrollbar.value = Math.max(0, Math.min(Number(scrollbar.maxvalue) || 0, Number(value) || 0));
                updateLocation();
            }
    
            function scrollBy(amount) {
                scrollTo(Number(scrollbar.value || 0) + Number(amount || 0));
            }
    
            function nativeWheelTarget(target) {
                var type = "";
                while (target && target !== tab) {
                    try { type = safeString(target.type).toLowerCase(); } catch (ignoreType) { type = ""; }
                    if (type === "listbox" || type === "dropdownlist" || type === "slider" || type === "scrollbar") {
                        return true;
                    }
                    try { target = target.parent; } catch (ignoreParent) { target = null; }
                }
                return false;
            }
    
            function wheelHandler(event) {
                var target = null;
                try { target = event.target; } catch (ignoreWheelTarget) {}
                if (nativeWheelTarget(target)) { return; }
    
                var delta = boltWheelDelta(event);
                if (!delta) { return; }
                if (!scrollbar.enabled) {
                    try { refreshScrollAreas(); } catch (ignoreWheelRefresh) {}
                    if (!scrollbar.enabled) { return; }
                }
    
                var direction = delta > 0 ? 1 : -1;
                var now = new Date().getTime();
                var stamp = "";
                try {
                    if (event.timeStamp !== undefined && event.timeStamp !== null) {
                        stamp = safeString(event.timeStamp.valueOf ? event.timeStamp.valueOf() : event.timeStamp);
                    }
                } catch (ignoreWheelStamp) {}
    
                if (area.lastWheelEvent === event) { return; }
                if (stamp.length && stamp === area.lastWheelStamp) { return; }
                if (!stamp.length && now - area.lastWheelTime < 6 && direction === area.lastWheelDirection) { return; }
    
                area.lastWheelEvent = event;
                area.lastWheelStamp = stamp;
                area.lastWheelTime = now;
                area.lastWheelDirection = direction;
                state.activeScrollArea = area;
    
                var amount = 48;
                var magnitude = Math.abs(delta);
                if (magnitude > 3 && magnitude < 240) { amount = Math.max(36, Math.min(84, Math.round(magnitude * 0.55))); }
                scrollBy(direction * amount);
    
                try { event.preventDefault(); } catch (ignoreWheelPrevent) {}
                try { event.stopPropagation(); } catch (ignoreWheelStop) {}
            }
    
            function activateArea() {
                state.activeScrollArea = area;
            }
    
            function keyHandler(event) {
                if (!scrollbar.enabled) { return; }
                var key = "";
                try { key = safeString(event.keyName || event.keyIdentifier || event.key); } catch (ignoreKey) {}
    
                if (key === "PageDown") { scrollBy(Math.max(80, area.viewHeight * 0.8)); }
                else if (key === "PageUp") { scrollBy(-Math.max(80, area.viewHeight * 0.8)); }
                else if (key === "Down" || key === "ArrowDown") { scrollBy(36); }
                else if (key === "Up" || key === "ArrowUp") { scrollBy(-36); }
                else if (key === "Home") { scrollTo(0); }
                else if (key === "End") { scrollTo(scrollbar.maxvalue); }
                else { return; }
    
                try { event.preventDefault(); } catch (ignoreKeyPrevent) {}
                try { event.stopPropagation(); } catch (ignoreKeyStop) {}
            }
    
            function bindNode(node) {
                if (!node) { return; }
    
                if (!node._boltPageWheelBound) {
                    node._boltPageWheelBound = true;
                    try { node.addEventListener("mouseover", activateArea, true); } catch (ignoreMouseOverCapture) {}
                    try { node.addEventListener("mouseover", activateArea, false); } catch (ignoreMouseOverBubble) {}
                    try { node.addEventListener("mousewheel", wheelHandler, true); } catch (ignoreMouseWheelCapture) {}
                    try { node.addEventListener("mousewheel", wheelHandler, false); } catch (ignoreMouseWheelBubble) {}
                    try { node.addEventListener("wheel", wheelHandler, true); } catch (ignoreWheelCapture) {}
                    try { node.addEventListener("wheel", wheelHandler, false); } catch (ignoreWheelBubble) {}
                    try { node.addEventListener("DOMMouseScroll", wheelHandler, true); } catch (ignoreDomWheelCapture) {}
                    try { node.addEventListener("DOMMouseScroll", wheelHandler, false); } catch (ignoreDomWheelBubble) {}
                }
    
                var index;
                try {
                    for (index = 0; node.children && index < node.children.length; index++) {
                        bindNode(node.children[index]);
                    }
                } catch (ignoreBindChildren) {}
            }
    
            area.bindEvents = function () {
                bindNode(tab);
            };
            area.update = updateLocation;
            area.scrollTo = scrollTo;
            area.scrollBy = scrollBy;
            area.handleWheel = wheelHandler;
    
            scrollbar.onChanging = updateLocation;
            scrollbar.onChange = updateLocation;
            try { tab.addEventListener("keydown", keyHandler, true); } catch (ignoreTabKeysCapture) {}
            try { tab.addEventListener("keydown", keyHandler, false); } catch (ignoreTabKeysBubble) {}
    
            area.bindEvents();
            state.scrollAreas.push(area);
            return content;
        }

    function boltNaturalColumnHeight(group) {
            function visible(node) {
                try { return node.visible !== false && Number(node.maximumSize.height) !== 0; }
                catch (ignoreVisible) { return true; }
            }
    
            function margins(node) {
                var result = [0, 0, 0, 0];
                try {
                    if (node.margins instanceof Array) {
                        if (node.margins.length >= 4) {
                            result = [Number(node.margins[0]) || 0, Number(node.margins[1]) || 0, Number(node.margins[2]) || 0, Number(node.margins[3]) || 0];
                        } else if (node.margins.length === 2) {
                            result = [Number(node.margins[0]) || 0, Number(node.margins[1]) || 0, Number(node.margins[0]) || 0, Number(node.margins[1]) || 0];
                        }
                    } else {
                        var amount = Number(node.margins) || 0;
                        result = [amount, amount, amount, amount];
                    }
                } catch (ignoreMargins) {}
                return result;
            }
    
            function measuredHeight(node) {
                if (!node || !visible(node)) { return 0; }
    
                var own = 0, preferred = 0, minimum = 0;
                try { own = Number(node.size.height) || 0; } catch (ignoreOwn) {}
                try { preferred = Number(node.preferredSize.height) || 0; } catch (ignorePreferred) {}
                try { minimum = Number(node.minimumSize.height) || 0; } catch (ignoreMinimum) {}
    
                if (!node.children || !node.children.length) {
                    return Math.max(own, preferred, minimum, 1);
                }
    
                var box = margins(node);
                var spacing = 0;
                try { spacing = Number(node.spacing) || 0; } catch (ignoreSpacing) {}
                var orientation = "column";
                try { orientation = safeString(node.orientation || "column"); } catch (ignoreOrientation) {}
    
                var index, child, count = 0, total = 0, maximum = 0;
                for (index = 0; index < node.children.length; index++) {
                    child = node.children[index];
                    if (!visible(child)) { continue; }
                    var childHeight = measuredHeight(child);
                    count++;
                    if (orientation === "column") { total += childHeight; }
                    else if (childHeight > maximum) { maximum = childHeight; }
                }
    
                var natural = orientation === "column"
                    ? box[1] + box[3] + total + Math.max(0, count - 1) * spacing
                    : box[1] + box[3] + maximum;
    
                return Math.max(own, preferred, minimum, natural, 1);
            }
    
            if (!group) { return 1; }
            var bottom = measuredHeight(group);
            var index, child, childY, childHeight, candidate;
    
            try {
                for (index = 0; group.children && index < group.children.length; index++) {
                    child = group.children[index];
                    if (!visible(child)) { continue; }
                    childY = 0;
                    try { childY = Number(child.location.y) || Number(child.location[1]) || 0; } catch (ignoreChildY) {}
                    childHeight = measuredHeight(child);
                    candidate = childY + childHeight;
                    if (candidate > bottom) { bottom = candidate; }
                }
            } catch (ignoreChildren) {}
    
            var groupMargins = margins(group);
            return Math.max(1, Math.ceil(bottom + groupMargins[3] + 2));
        }

    function refreshScrollAreas() {
            var index, area, tabWidth, tabHeight, scrollWidth, gap, viewWidth, viewHeight;
            var contentHeight, maxScroll, childIndex, child, contentMargins, childWidth;
    
            for (index = 0; index < state.scrollAreas.length; index++) {
                area = state.scrollAreas[index];
                try {
                    if (!area || !area.tab || area.tab.visible === false) { continue; }
                    if (area.bindEvents) { area.bindEvents(); }
    
                    tabWidth = 0;
                    tabHeight = 0;
                    try { tabWidth = Number(area.tab.size.width) || 0; } catch (ignoreTabWidth) {}
                    try { tabHeight = Number(area.tab.size.height) || 0; } catch (ignoreTabHeight) {}
                    if (!tabWidth) { try { tabWidth = Number(area.tab.parent.size.width) || 0; } catch (ignoreParentWidth) {} }
                    if (!tabHeight) { try { tabHeight = Number(area.tab.parent.size.height) || 0; } catch (ignoreParentHeight) {} }
                    if ((!tabWidth || !tabHeight) && state.ui && state.ui.panel) {
                        try { tabWidth = tabWidth || Math.max(180, Number(state.ui.panel.size.width) - 8); } catch (ignorePanelWidth) {}
                        try { tabHeight = tabHeight || Math.max(120, Number(state.ui.panel.size.height) - 58); } catch (ignorePanelHeight) {}
                    }
    
                    scrollWidth = 9;
                    gap = 2;
                    viewWidth = Math.max(120, Math.floor(tabWidth - scrollWidth - gap));
                    viewHeight = Math.max(50, Math.floor(tabHeight));
    
                    try {
                        area.viewport.bounds = [0, 0, viewWidth, viewHeight];
                        area.viewport.minimumSize = [viewWidth, viewHeight];
                        area.viewport.maximumSize = [viewWidth, viewHeight];
                        area.viewport.preferredSize = [viewWidth, viewHeight];
                        area.viewport.size = [viewWidth, viewHeight];
    
                        area.scrollbar.bounds = [viewWidth + gap, 0, viewWidth + gap + scrollWidth, viewHeight];
                        area.scrollbar.minimumSize = [scrollWidth, viewHeight];
                        area.scrollbar.maximumSize = [scrollWidth, viewHeight];
                        area.scrollbar.preferredSize = [scrollWidth, viewHeight];
                        area.scrollbar.size = [scrollWidth, viewHeight];
                    } catch (ignoreViewportBounds) {}
    
                    contentMargins = 6;
                    try {
                        if (area.content.margins instanceof Array && area.content.margins.length >= 4) {
                            contentMargins = Number(area.content.margins[0] || 0) + Number(area.content.margins[2] || 0);
                        }
                    } catch (ignoreContentMargins) {}
    
                    childWidth = Math.max(80, viewWidth - contentMargins);
                    try {
                        area.content.minimumSize = [viewWidth, 0];
                        area.content.maximumSize = [viewWidth, 10000];
                        area.content.preferredSize = [viewWidth, 1];
                        area.content.size = [viewWidth, 1];
                        area.content.location = [0, 0];
                    } catch (ignoreReleaseContentSize) {}
    
                    for (childIndex = 0; area.content.children && childIndex < area.content.children.length; childIndex++) {
                        child = area.content.children[childIndex];
                        try {
                            if (child.visible === false) { continue; }
                            child.alignment = ["fill", "top"];
                            child.minimumSize.width = 0;
                            child.maximumSize.width = childWidth;
                            child.preferredSize.width = childWidth;
                        } catch (ignoreChildWidth) {}
                    }
    
                    try { area.content.layout.layout(true); } catch (ignoreContentLayout) {}
                    contentHeight = Math.max(viewHeight, boltNaturalColumnHeight(area.content));
    
                    area.contentWidth = viewWidth;
                    area.contentHeight = contentHeight;
                    area.viewHeight = viewHeight;
    
                    try {
                        area.content.minimumSize = [viewWidth, contentHeight];
                        area.content.maximumSize = [viewWidth, contentHeight];
                        area.content.preferredSize = [viewWidth, contentHeight];
                        area.content.size = [viewWidth, contentHeight];
                    } catch (ignoreContentSize) {}
    
                    maxScroll = Math.max(0, contentHeight - viewHeight);
                    area.scrollbar.minvalue = 0;
                    area.scrollbar.maxvalue = maxScroll;
                    area.scrollbar.enabled = maxScroll > 1;
                    area.scrollbar.visible = maxScroll > 1;
    
                    if (!area.scrollbar.enabled) { area.scrollbar.value = 0; }
                    else if (area.scrollbar.value > maxScroll) { area.scrollbar.value = maxScroll; }
                    else if (area.scrollbar.value < 0) { area.scrollbar.value = 0; }
    
                    if (area.update) { area.update(); }
                } catch (scrollError) {
                    try { $.writeln("Bolt scroll warning: " + scrollError.message); } catch (ignoreScrollLog) {}
                }
            }
    
            if (state.ui && state.ui.panel && !state.ui.panel._boltPageWheelRouterBound) {
                state.ui.panel._boltPageWheelRouterBound = true;
                var routeWheel = function (event) {
                    var area = state.activeScrollArea;
                    if (!area || !area.tab || area.tab.visible === false || !area.handleWheel) { return; }
                    area.handleWheel(event);
                };
                try { state.ui.panel.addEventListener("mousewheel", routeWheel, true); } catch (ignorePanelWheelCapture) {}
                try { state.ui.panel.addEventListener("wheel", routeWheel, true); } catch (ignorePanelModernWheelCapture) {}
                try { state.ui.panel.addEventListener("DOMMouseScroll", routeWheel, true); } catch (ignorePanelDomWheelCapture) {}
            }
        }

    function boltStripIconText(value) {
        return trim(safeString(value).replace(/^[^A-Za-z0-9\u0980-\u09FF]+\s*/, ""));
    }

    function applyDefaultHelpTips(root) {
        function sectionName(node) {
            var parent = node, type = "", textValue = "";
            while (parent) {
                try { type = parent.type || ""; textValue = trim(parent.text || ""); } catch (ignoreSectionRead) { type = ""; textValue = ""; }
                if (type === "panel" && textValue.length) { return textValue; }
                try { parent = parent.parent; } catch (ignoreSectionParent) { parent = null; }
            }
            return "this workspace";
        }
        function visit(node) {
            if (!node) { return; }
            var i, label = "", type = "";
            try { type = node.type || ""; } catch (ignoreType) {}
            try { label = boltStripIconText(node.text || ""); } catch (ignoreLabel) {}
            try {
                if (!trim(node.helpTip || "").length) {
                    if (type === "button") { node.helpTip = label ? (label + " in " + sectionName(node) + ".") : ("Use this " + sectionName(node) + " action."); }
                    else if (type === "checkbox") { node.helpTip = label ? ("Control '" + label + "' for " + sectionName(node) + ".") : ("Toggle this " + sectionName(node) + " option."); }
                    else if (type === "edittext") { node.helpTip = "Enter the value used by " + sectionName(node) + "."; }
                    else if (type === "slider") { node.helpTip = "Drag to adjust this value."; }
                    else if (type === "listbox") { node.helpTip = "Select an item. Use the mouse wheel to scroll."; }
                    else if (type === "dropdownlist") { node.helpTip = "Choose an option."; }
                    else if (type === "tab") { node.helpTip = label ? (label + " tools.") : "Open this tool section."; }
                }
            } catch (ignoreHelpTip) {}
            try { for (i = 0; node.children && i < node.children.length; i++) { visit(node.children[i]); } } catch (ignoreChildren) {}
        }
        visit(root);
    }

    function activeCompOrThrow() {
        if (app.project && app.project.activeItem instanceof CompItem) { return app.project.activeItem; }
        throw new Error("Open a composition first.");
    }

    function selectedLayersOrThrow(comp) {
        var layers = comp.selectedLayers;
        if (!layers || !layers.length) { throw new Error("Select at least one layer."); }
        return layers;
    }


    function boltMatrixIdentity() {
        return [1, 0, 0, 1, 0, 0];
    }

    function boltMatrixMultiply(left, right) {
        return [
            left[0] * right[0] + left[2] * right[1],
            left[1] * right[0] + left[3] * right[1],
            left[0] * right[2] + left[2] * right[3],
            left[1] * right[2] + left[3] * right[3],
            left[0] * right[4] + left[2] * right[5] + left[4],
            left[1] * right[4] + left[3] * right[5] + left[5]
        ];
    }

    function boltMatrixTranslate(x, y) {
        return [1, 0, 0, 1, Number(x) || 0, Number(y) || 0];
    }

    function boltMatrixScale(x, y) {
        return [Number(x) || 0, 0, 0, Number(y) || 0, 0, 0];
    }

    function boltMatrixRotate(degrees) {
        var radians = (Number(degrees) || 0) * Math.PI / 180;
        var cosine = Math.cos(radians), sine = Math.sin(radians);
        return [cosine, sine, -sine, cosine, 0, 0];
    }

    function boltMatrixApply(matrix, point) {
        return [
            matrix[0] * point[0] + matrix[2] * point[1] + matrix[4],
            matrix[1] * point[0] + matrix[3] * point[1] + matrix[5]
        ];
    }

    function boltTransformValue(transform, matchName, time, fallback) {
        var property = null, value = fallback;
        try { property = transform ? transform.property(matchName) : null; } catch (ignoreTransformProperty) { property = null; }
        if (!property) { return fallback; }
        try { value = property.valueAtTime(time, false); }
        catch (ignoreTransformValueAtTime) {
            try { value = property.value; } catch (ignoreTransformValue) { value = fallback; }
        }
        return value === undefined || value === null ? fallback : value;
    }

    function boltPositionValueAtTime(transform, time) {
        var position = null, x, y, z, value;
        try { position = transform ? transform.property("ADBE Position") : null; } catch (ignorePositionProperty) { position = null; }
        if (!position) { return [0, 0]; }
        try {
            if (position.dimensionsSeparated) {
                x = transform.property("ADBE Position_0");
                y = transform.property("ADBE Position_1");
                z = transform.property("ADBE Position_2");
                value = [
                    x ? x.valueAtTime(time, false) : 0,
                    y ? y.valueAtTime(time, false) : 0
                ];
                if (z) { value.push(z.valueAtTime(time, false)); }
                return value;
            }
        } catch (ignoreSeparatedPositionRead) {}
        return boltTransformValue(transform, "ADBE Position", time, [0, 0]);
    }

    function boltLayerHasUnsupported2DTransform(layer, time) {
        var current = layer, guard = 0, transform, skew;
        while (current && guard < 64) {
            guard++;
            try { if (current.threeDLayer) { return true; } } catch (ignoreThreeDLayer) {}
            try {
                transform = current.property("ADBE Transform Group");
                skew = transform ? transform.property("ADBE Skew") : null;
                if (skew && Math.abs(Number(skew.valueAtTime(time, false)) || 0) > 0.0001) { return true; }
            } catch (ignoreSkewRead) {}
            try { current = current.parent; } catch (ignoreParentRead) { current = null; }
        }
        return guard >= 64;
    }

    function boltLayerLocalMatrix(layer, time) {
        var transform = layer ? layer.property("ADBE Transform Group") : null;
        if (!transform) { return null; }
        var position = boltPositionValueAtTime(transform, time);
        var anchor = boltTransformValue(transform, "ADBE Anchor Point", time, [0, 0]);
        var scale = boltTransformValue(transform, "ADBE Scale", time, [100, 100]);
        var rotation = boltTransformValue(transform, "ADBE Rotate Z", time, 0);
        var matrix = boltMatrixTranslate(position[0], position[1]);
        matrix = boltMatrixMultiply(matrix, boltMatrixRotate(rotation));
        matrix = boltMatrixMultiply(matrix, boltMatrixScale((scale[0] || 0) / 100, (scale[1] || 0) / 100));
        matrix = boltMatrixMultiply(matrix, boltMatrixTranslate(-(anchor[0] || 0), -(anchor[1] || 0)));
        return matrix;
    }

    function boltLayerToCompMatrix(layer, time) {
        var chain = [], current = layer, guard = 0, matrix = boltMatrixIdentity(), index, local;
        while (current && guard < 64) {
            chain.push(current);
            guard++;
            try { current = current.parent; } catch (ignoreParentChain) { current = null; }
        }
        if (guard >= 64) { return null; }
        for (index = chain.length - 1; index >= 0; index--) {
            local = boltLayerLocalMatrix(chain[index], time);
            if (!local) { return null; }
            matrix = boltMatrixMultiply(matrix, local);
        }
        return matrix;
    }

    function boltLayerSourceBounds(layer, time) {
        var rect = null, width = 0, height = 0;
        try { rect = layer.sourceRectAtTime(time, false); } catch (ignoreSourceRect) { rect = null; }
        if (rect && isFinite(Number(rect.width)) && isFinite(Number(rect.height))) {
            return {
                left:Number(rect.left) || 0,
                top:Number(rect.top) || 0,
                right:(Number(rect.left) || 0) + (Number(rect.width) || 0),
                bottom:(Number(rect.top) || 0) + (Number(rect.height) || 0)
            };
        }
        try { width = Number(layer.width) || 0; } catch (ignoreLayerWidth) { width = 0; }
        try { height = Number(layer.height) || 0; } catch (ignoreLayerHeight) { height = 0; }
        if (width <= 0 || height <= 0) { return null; }
        return {left:0, top:0, right:width, bottom:height};
    }

    function boltLayerVisualBounds(layer, time) {
        if (!layer || boltLayerHasUnsupported2DTransform(layer, time)) { return null; }
        var sourceBounds = boltLayerSourceBounds(layer, time);
        var matrix = boltLayerToCompMatrix(layer, time);
        if (!sourceBounds || !matrix) { return null; }
        var points = [
            boltMatrixApply(matrix, [sourceBounds.left, sourceBounds.top]),
            boltMatrixApply(matrix, [sourceBounds.right, sourceBounds.top]),
            boltMatrixApply(matrix, [sourceBounds.right, sourceBounds.bottom]),
            boltMatrixApply(matrix, [sourceBounds.left, sourceBounds.bottom])
        ];
        var left = points[0][0], right = points[0][0], top = points[0][1], bottom = points[0][1], index;
        for (index = 1; index < points.length; index++) {
            left = Math.min(left, points[index][0]);
            right = Math.max(right, points[index][0]);
            top = Math.min(top, points[index][1]);
            bottom = Math.max(bottom, points[index][1]);
        }
        return {
            left:left,
            right:right,
            top:top,
            bottom:bottom,
            width:right - left,
            height:bottom - top,
            centerX:(left + right) / 2,
            centerY:(top + bottom) / 2
        };
    }

    function boltSelectedAncestor(layer, selectedLayers) {
        var parent = null, guard = 0, index;
        try { parent = layer.parent; } catch (ignoreSelectedParent) { parent = null; }
        while (parent && guard < 64) {
            for (index = 0; index < selectedLayers.length; index++) {
                if (selectedLayers[index] === parent) { return true; }
            }
            guard++;
            try { parent = parent.parent; } catch (ignoreSelectedParentChain) { parent = null; }
        }
        return false;
    }

    function boltAlignmentRecords(comp, selectedLayers) {
        var records = [], skipped = 0, index, layer, bounds;
        for (index = 0; index < selectedLayers.length; index++) {
            layer = selectedLayers[index];
            if (!layer || layer.locked || boltSelectedAncestor(layer, selectedLayers)) { skipped++; continue; }
            bounds = boltLayerVisualBounds(layer, comp.time);
            if (!bounds) { skipped++; continue; }
            records.push({layer:layer, bounds:bounds});
        }
        return {records:records, skipped:skipped};
    }

    function boltBoundsUnion(records) {
        var bounds, index, source;
        if (!records || !records.length) { return null; }
        source = records[0].bounds;
        bounds = {left:source.left, right:source.right, top:source.top, bottom:source.bottom};
        for (index = 1; index < records.length; index++) {
            source = records[index].bounds;
            bounds.left = Math.min(bounds.left, source.left);
            bounds.right = Math.max(bounds.right, source.right);
            bounds.top = Math.min(bounds.top, source.top);
            bounds.bottom = Math.max(bounds.bottom, source.bottom);
        }
        bounds.width = bounds.right - bounds.left;
        bounds.height = bounds.bottom - bounds.top;
        bounds.centerX = (bounds.left + bounds.right) / 2;
        bounds.centerY = (bounds.top + bounds.bottom) / 2;
        return bounds;
    }

    function boltTopLayerRecord(records) {
        var result = records[0], index;
        for (index = 1; index < records.length; index++) {
            if (Number(records[index].layer.index) < Number(result.layer.index)) { result = records[index]; }
        }
        return result;
    }

    function boltParentLinearMatrix(layer, time) {
        var parent = null;
        try { parent = layer.parent; } catch (ignoreAlignmentParent) { parent = null; }
        if (!parent) { return boltMatrixIdentity(); }
        return boltLayerToCompMatrix(parent, time);
    }

    function boltCompDeltaToPositionDelta(layer, deltaX, deltaY, time) {
        var matrix = boltParentLinearMatrix(layer, time);
        if (!matrix) { return null; }
        var determinant = matrix[0] * matrix[3] - matrix[1] * matrix[2];
        if (Math.abs(determinant) < 0.0000001) { return null; }
        return [
            (matrix[3] * deltaX - matrix[2] * deltaY) / determinant,
            (-matrix[1] * deltaX + matrix[0] * deltaY) / determinant
        ];
    }

    function boltMoveLayerByCompDelta(layer, deltaX, deltaY, time) {
        if (Math.abs(deltaX) < 0.0001 && Math.abs(deltaY) < 0.0001) { return true; }
        var transform = null, position = null, current, localDelta, next;
        try { transform = layer.property("ADBE Transform Group"); } catch (ignoreAlignmentTransform) { transform = null; }
        try { position = transform ? transform.property("ADBE Position") : null; } catch (ignoreAlignmentPosition) { position = null; }
        if (!position || position.expressionEnabled) { return false; }
        localDelta = boltCompDeltaToPositionDelta(layer, deltaX, deltaY, time);
        if (!localDelta) { return false; }
        current = boltPositionValueAtTime(transform, time);
        next = current.length > 2
            ? [current[0] + localDelta[0], current[1] + localDelta[1], current[2]]
            : [current[0] + localDelta[0], current[1] + localDelta[1]];
        return setPositionPreservingDimensions(position, next, time);
    }

    function boltAlignmentTarget(comp, records, targetMode) {
        var reference;
        if (targetMode === "Selection") {
            return {bounds:boltBoundsUnion(records), reference:null};
        }
        if (targetMode === "Top Layer") {
            reference = boltTopLayerRecord(records);
            return {bounds:reference.bounds, reference:reference.layer};
        }
        return {
            bounds:{
                left:0,
                top:0,
                right:comp.width,
                bottom:comp.height,
                width:comp.width,
                height:comp.height,
                centerX:comp.width / 2,
                centerY:comp.height / 2
            },
            reference:null
        };
    }

    function boltAlignmentDelta(mode, bounds, target) {
        if (mode === "left") { return [target.left - bounds.left, 0]; }
        if (mode === "hcenter") { return [target.centerX - bounds.centerX, 0]; }
        if (mode === "right") { return [target.right - bounds.right, 0]; }
        if (mode === "top") { return [0, target.top - bounds.top]; }
        if (mode === "vcenter") { return [0, target.centerY - bounds.centerY]; }
        if (mode === "bottom") { return [0, target.bottom - bounds.bottom]; }
        return [0, 0];
    }

    function boltAlignSelected(mode, targetMode) {
        var comp = activeCompOrThrow();
        var selected = selectedLayersOrThrow(comp);
        var prepared = boltAlignmentRecords(comp, selected);
        var records = prepared.records;
        if (!records.length) { throw new Error("Select unlocked 2D layers without skew or selected parent-child chains."); }
        if (targetMode === "Selection" && records.length < 2) { throw new Error("Select at least two compatible layers for Selection alignment."); }
        if (targetMode === "Top Layer" && records.length < 2) { throw new Error("Select at least two compatible layers. The topmost selected layer is the reference."); }
        var targetInfo = boltAlignmentTarget(comp, records, targetMode);
        if (!targetInfo.bounds) { throw new Error("Could not calculate the alignment target."); }
        var changed = 0, skipped = prepared.skipped, index, record, delta;
        app.beginUndoGroup("Bolt Align Layers");
        try {
            for (index = 0; index < records.length; index++) {
                record = records[index];
                if (targetInfo.reference && record.layer === targetInfo.reference) { continue; }
                delta = boltAlignmentDelta(mode, record.bounds, targetInfo.bounds);
                if (boltMoveLayerByCompDelta(record.layer, delta[0], delta[1], comp.time)) { changed++; }
                else { skipped++; }
            }
        } finally { app.endUndoGroup(); }
        setStatus("Aligned " + changed + " layer(s) to " + targetMode + (skipped ? " • " + skipped + " skipped" : ""), skipped ? "warning" : "ok");
    }

    function boltDistributeSelected(mode) {
        var comp = activeCompOrThrow();
        var selected = selectedLayersOrThrow(comp);
        var prepared = boltAlignmentRecords(comp, selected);
        var records = prepared.records;
        if (records.length < 3) { throw new Error("Select at least three compatible 2D layers to distribute."); }
        var horizontal = mode === "centerX" || mode === "gapX";
        records.sort(function (left, right) {
            var a = horizontal ? left.bounds.centerX : left.bounds.centerY;
            var b = horizontal ? right.bounds.centerX : right.bounds.centerY;
            if (a === b) { return Number(left.layer.index) - Number(right.layer.index); }
            return a - b;
        });
        var moves = [], index, first = records[0], last = records[records.length - 1];
        if (mode === "centerX" || mode === "centerY") {
            var firstCenter = horizontal ? first.bounds.centerX : first.bounds.centerY;
            var lastCenter = horizontal ? last.bounds.centerX : last.bounds.centerY;
            var step = (lastCenter - firstCenter) / (records.length - 1);
            for (index = 1; index < records.length - 1; index++) {
                var currentCenter = horizontal ? records[index].bounds.centerX : records[index].bounds.centerY;
                var desiredCenter = firstCenter + step * index;
                moves.push({record:records[index], dx:horizontal ? desiredCenter - currentCenter : 0, dy:horizontal ? 0 : desiredCenter - currentCenter});
            }
        } else {
            var totalSize = 0;
            for (index = 0; index < records.length; index++) {
                totalSize += horizontal ? records[index].bounds.width : records[index].bounds.height;
            }
            var spanStart = horizontal ? first.bounds.left : first.bounds.top;
            var spanEnd = horizontal ? last.bounds.right : last.bounds.bottom;
            var gap = ((spanEnd - spanStart) - totalSize) / (records.length - 1);
            var cursor = spanStart + (horizontal ? first.bounds.width : first.bounds.height) + gap;
            for (index = 1; index < records.length - 1; index++) {
                var currentStart = horizontal ? records[index].bounds.left : records[index].bounds.top;
                moves.push({record:records[index], dx:horizontal ? cursor - currentStart : 0, dy:horizontal ? 0 : cursor - currentStart});
                cursor += (horizontal ? records[index].bounds.width : records[index].bounds.height) + gap;
            }
        }
        var changed = 0, skipped = prepared.skipped;
        app.beginUndoGroup("Bolt Distribute Layers");
        try {
            for (index = 0; index < moves.length; index++) {
                if (boltMoveLayerByCompDelta(moves[index].record.layer, moves[index].dx, moves[index].dy, comp.time)) { changed++; }
                else { skipped++; }
            }
        } finally { app.endUndoGroup(); }
        setStatus("Distributed " + records.length + " layer(s)" + (skipped ? " • " + skipped + " skipped" : ""), skipped ? "warning" : "ok");
    }


    function centerLayersInComp() {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        var changed = 0, skipped = 0;
        app.beginUndoGroup("Bolt Center Layers");
        try {
            var i;
            for (i = 0; i < layers.length; i++) {
                var pos = layers[i].property("ADBE Transform Group").property("ADBE Position");
                if (!pos || layers[i].locked || pos.expressionEnabled || layers[i].parent) { skipped++; continue; }
                try {
                    var value = pos.valueAtTime(comp.time, false);
                    if (pos.dimensionsSeparated) {
                        var transform = pos.parentProperty;
                        var x = transform.property("ADBE Position_0");
                        var y = transform.property("ADBE Position_1");
                        if (!x || !y || x.expressionEnabled || y.expressionEnabled) { skipped++; continue; }
                        if (x.numKeys) { x.setValueAtTime(comp.time, comp.width / 2); } else { x.setValue(comp.width / 2); }
                        if (y.numKeys) { y.setValueAtTime(comp.time, comp.height / 2); } else { y.setValue(comp.height / 2); }
                    } else {
                        var centered = value.length > 2 ? [comp.width / 2, comp.height / 2, value[2]] : [comp.width / 2, comp.height / 2];
                        if (pos.numKeys) { pos.setValueAtTime(comp.time, centered); } else { pos.setValue(centered); }
                    }
                    changed++;
                } catch (ignoreCenterLayer) { skipped++; }
            }
        } finally { app.endUndoGroup(); }
        setStatus("Centered " + changed + " layer(s)" + (skipped ? " • " + skipped + " parented/protected" : ""), skipped ? "warning" : "ok");
    }

    function createQuickLayer(kind) {
        var comp = activeCompOrThrow();
        app.beginUndoGroup("Bolt Create " + kind);
        try {
            var layer;
            if (kind === "Null") { layer = comp.layers.addNull(); layer.name = "CTRL_NULL"; }
            else if (kind === "Solid") { layer = comp.layers.addSolid([0.18,0.18,0.18], "Solid", comp.width, comp.height, comp.pixelAspect, comp.duration); }
            else if (kind === "Adjustment") { layer = comp.layers.addSolid([1,1,1], "Adjustment Layer", comp.width, comp.height, comp.pixelAspect, comp.duration); layer.adjustmentLayer = true; }
            if (layer) { layer.startTime = 0; layer.inPoint = 0; layer.outPoint = comp.duration; }
        } finally { app.endUndoGroup(); }
        setStatus(kind + " created", "ok");
    }

    function precomposeSelected() {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        var indices = [], i;
        for (i = 0; i < layers.length; i++) { indices.push(layers[i].index); }
        indices.sort(function(a,b){return a-b;});
        var name = prompt("Pre-comp name:", "Precomp 01", SCRIPT_NAME);
        if (name === null) { return; }
        app.beginUndoGroup("Bolt Pre-compose");
        try { comp.layers.precompose(indices, sanitizeName(name), true); }
        finally { app.endUndoGroup(); }
        setStatus("Pre-composed " + layers.length + " layer(s)", "ok");
    }

    function trimSelected(which) {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        var changed = 0, skipped = 0;
        app.beginUndoGroup("Bolt Trim Layers");
        try {
            var i;
            for (i=0;i<layers.length;i++) {
                if (layers[i].locked) { skipped++; continue; }
                try {
                    if (which === "in") { layers[i].inPoint = Math.min(comp.time, layers[i].outPoint - comp.frameDuration); }
                    else { layers[i].outPoint = Math.max(comp.time, layers[i].inPoint + comp.frameDuration); }
                    changed++;
                } catch (ignoreTrimLayer) { skipped++; }
            }
        } finally { app.endUndoGroup(); }
        setStatus("Trimmed " + changed + " layer(s)" + (skipped ? " • " + skipped + " protected" : ""), skipped ? "warning" : "ok");
    }

    function addFade(which) {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        var frames = Math.max(1, parseInt(state.ui.quickFrames.text,10) || 10);
        var duration = frames * comp.frameDuration;
        var applied = 0, skipped = 0;
        app.beginUndoGroup("Bolt Quick Fade");
        try {
            var i;
            for (i=0;i<layers.length;i++) {
                var opacity = layers[i].property("ADBE Transform Group").property("ADBE Opacity");
                if (!opacity || layers[i].locked || opacity.expressionEnabled) { skipped++; continue; }
                try {
                    var layerStart = Number(layers[i].inPoint), layerEnd = Number(layers[i].outPoint);
                    var layerDuration = Math.max(comp.frameDuration, layerEnd - layerStart);
                    var fadeLength = which === "both"
                        ? Math.min(duration, layerDuration / 2)
                        : Math.min(duration, layerDuration);
                    var fadeInEnd = Math.min(layerEnd, layerStart + fadeLength);
                    var fadeOutStart = Math.max(layerStart, layerEnd - fadeLength);
                    if (which === "in" || which === "both") {
                        opacity.setValueAtTime(layerStart, 0);
                        opacity.setValueAtTime(fadeInEnd, 100);
                        boltSetGeneratedKeyEase(opacity, layerStart, 70);
                        boltSetGeneratedKeyEase(opacity, fadeInEnd, 70);
                    }
                    if (which === "out" || which === "both") {
                        opacity.setValueAtTime(fadeOutStart, 100);
                        opacity.setValueAtTime(layerEnd, 0);
                        boltSetGeneratedKeyEase(opacity, fadeOutStart, 70);
                        boltSetGeneratedKeyEase(opacity, layerEnd, 70);
                    }
                    applied++;
                } catch (ignoreFadeLayer) { skipped++; }
            }
        } finally { app.endUndoGroup(); }
        setStatus("Fade " + which + " applied to " + applied + " layer(s)" + (skipped ? " • " + skipped + " protected" : ""), skipped ? "warning" : "ok");
    }

    function easyEaseSelected() {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        var changed = 0;
        app.beginUndoGroup("Bolt Easy Ease");
        try {
            var i,j,k;
            for(i=0;i<layers.length;i++) {
                var props = layers[i].selectedProperties;
                for(j=0;j<props.length;j++) {
                    var prop=props[j];
                    if (!(prop instanceof Property) || prop.numKeys < 1) { continue; }
                    for(k=1;k<=prop.numKeys;k++) {
                        if (!prop.keySelected(k)) { continue; }
                        if (boltSetTemporalEase(prop, k, 75, 75)) { changed++; }
                    }
                }
            }
        } finally { app.endUndoGroup(); }
        setStatus(changed ? "Easy Ease applied to " + changed + " keyframe(s)" : "Select keyframes first", changed ? "ok" : "warning");
    }


    function textPresetSummary(preset) {
        if (!preset) { return "Choose a preset."; }
        var parts = [];
        if (preset.x || preset.y) { parts.push("Move " + preset.x + ", " + preset.y); }
        if (preset.sx !== 100 || preset.sy !== 100) { parts.push("Scale " + preset.sx + "% × " + preset.sy + "%"); }
        if (preset.rot) { parts.push("Rotate " + preset.rot + "°"); }
        if (preset.skew) { parts.push("Skew " + preset.skew + "°"); }
        if (preset.tracking) { parts.push("Tracking " + preset.tracking); }
        if (preset.blur) { parts.push("Blur " + preset.blur); }
        parts.push("Ease " + preset.ease);
        return textPresetCategory(preset.name) + "  •  " + parts.join("  •  ");
    }

    function updateTextCategoryButtons() {
        if (!state.ui || !state.ui.textCategoryButtons) { return; }
        var buttons = state.ui.textCategoryButtons, i, active;
        for (i = 0; i < buttons.length; i++) {
            active = buttons[i]._boltFilter === (state.textCategoryFilter || "All");
            buttons[i].text = (active ? "> " : "") + buttons[i]._boltLabel;
        }
    }

    function updateTextModeButtons() {
        if (!state.ui || !state.ui.textModeButtons) { return; }
        var buttons = state.ui.textModeButtons, i, active;
        for (i = 0; i < buttons.length; i++) {
            active = buttons[i]._boltMode === (state.textModeValue || "IN");
            buttons[i].text = (active ? "> " : "") + buttons[i]._boltMode;
        }
    }

    function syncTextPresetSelectionFromList() {
        if (!state.ui || !state.ui.textPresetList) { return; }
        var list = state.ui.textPresetList;
        if (list.selection && list.selection._boltPresetIndex >= 0) {
            state.textSelectedIndex = list.selection._boltPresetIndex;
        } else if (state.textFiltered.length) {
            state.textSelectedIndex = state.textFiltered[0];
        } else {
            state.textSelectedIndex = -1;
        }
        updateTextPresetDetails();
    }

    function refreshTextPresetBrowser() {
        if (!state.ui || !state.ui.textPresetList) { return; }
        var list = state.ui.textPresetList, i, presetIndex, preset, item, selectIndex = -1;
        state.textFiltered = filteredTextPresetIndices();
        if (!state.textFiltered.length) { state.textSelectedIndex = -1; }
        else if (arrayIndexOf(state.textFiltered, state.textSelectedIndex) < 0) { state.textSelectedIndex = state.textFiltered[0]; }
        try { list.removeAll(); } catch (ignoreListClear) {}
        for (i = 0; i < state.textFiltered.length; i++) {
            presetIndex = state.textFiltered[i];
            preset = TEXT_PRESETS[presetIndex];
            item = list.add("item", preset.name + "  |  " + textPresetCategory(preset.name).replace(" & Clean", "").replace(" & Glow", ""));
            item._boltPresetIndex = presetIndex;
            if (presetIndex === state.textSelectedIndex) { selectIndex = i; }
        }
        if (selectIndex < 0 && state.textFiltered.length) { selectIndex = 0; state.textSelectedIndex = state.textFiltered[0]; }
        if (selectIndex >= 0 && list.items.length > selectIndex) { list.selection = list.items[selectIndex]; }
        else { list.selection = null; }
        if (state.ui.textPresetCount) { state.ui.textPresetCount.text = state.textFiltered.length + " presets"; }
        updateTextCategoryButtons();
        updateTextModeButtons();
        updateTextPresetDetails();
    }

    function updateTextPresetDetails() {
        var index = state.textSelectedIndex;
        var preset = index >= 0 && index < TEXT_PRESETS.length ? TEXT_PRESETS[index] : null;
        if (state.ui && state.ui.textSelectedName) { state.ui.textSelectedName.text = preset ? preset.name : "No preset selected"; }
        if (state.ui && state.ui.textDescription) { state.ui.textDescription.text = preset ? textPresetSummary(preset) : "Try another category or search term."; }
        if (state.ui && state.ui.textPreviewButton) { state.ui.textPreviewButton.enabled = !!preset; }
        if (state.ui && state.ui.textApplyButton) { state.ui.textApplyButton.enabled = !!preset; }
        if (state.ui && state.ui.textPresetList && preset) {
            var list = state.ui.textPresetList, i;
            for (i = 0; i < list.items.length; i++) {
                if (list.items[i]._boltPresetIndex === index) { list.selection = list.items[i]; break; }
            }
        }
    }

    function previewTextPresetByIndex(index) {
        var preset = TEXT_PRESETS[index];
        if (!preset) { throw new Error("Choose a text preset first."); }
        var win = new Window("dialog", brandTitle("Preview"));
        win.orientation = "column"; win.alignChildren = ["fill", "top"]; win.spacing = 8; win.margins = 12;
        var stage = win.add("panel", undefined, preset.name);
        stage.preferredSize = [360, 150]; stage.orientation = "stack"; stage.alignChildren = ["center", "center"];
        var label = stage.add("statictext", undefined, "BOLT");
        try { label.graphics.font = ScriptUI.newFont(label.graphics.font.name, "BOLD", 34); } catch (ignorePreviewFont) {}
        var note = win.add("statictext", undefined, textPresetSummary(preset), {multiline:true}); note.maximumSize.height = 42;
        var buttons = win.add("group"); buttons.alignment = ["center", "top"];
        var replay = buttons.add("button", undefined, "Replay");
        buttons.add("button", undefined, "Close", {name:"ok"});
        function play() {
            var frames = 24, f, p, startX = preset.x * 0.35, startY = preset.y * 0.35;
            for (f = 0; f <= frames; f++) {
                p = f / frames;
                var ease = 1 - Math.pow(1 - p, 3);
                try {
                    label.location = [Math.round(startX * (1 - ease)), Math.round(startY * (1 - ease))];
                    var sc = ((preset.sx + preset.sy) / 2) / 100;
                    var size = Math.max(12, Math.round(34 * (sc + (1 - sc) * ease)));
                    label.graphics.font = ScriptUI.newFont(label.graphics.font.name, "BOLD", size);
                    var shade = Math.min(1, 0.25 + 0.75 * ease);
                    label.graphics.foregroundColor = label.graphics.newPen(label.graphics.PenType.SOLID_COLOR, [shade, shade, shade], 1);
                    win.update();
                } catch (ignorePreviewFrame) {}
                $.sleep(18);
            }
        }
        replay.onClick = play;
        win.onShow = play;
        win.center(); win.show();
    }


var BOLT_ACTION_EXPRESSION_TAG = "// BOLT ACTION\\n";
    var BOLT_ACTION_HELPER_TAG = "BOLT_ACTION_HELPER:";

    function boltIsTextLayer(layer) {
        try { return !!(layer && layer.property("ADBE Text Properties")); }
        catch (ignoreTextLayerCheck) { return false; }
    }

    function boltActionTime(comp, layer) {
        var time = Number(comp.time) || 0;
        try { time = Math.max(Number(layer.inPoint) || 0, time); } catch (ignoreActionIn) {}
        try { time = Math.min(Math.max(0, Number(layer.outPoint) - comp.frameDuration), time); } catch (ignoreActionOut) {}
        return time;
    }

    function boltActionEase(prop, times, influence) {
        var index;
        for (index = 0; index < times.length; index++) {
            boltSetGeneratedKeyEase(prop, times[index], influence || 75);
        }
    }

    function boltScaleBy(value, factor) {
        var output = [], index;
        for (index = 0; index < value.length; index++) { output[index] = value[index] * factor; }
        return output;
    }

    function boltOffsetPosition(value, x, y) {
        var output = value instanceof Array ? value.slice(0) : [value, 0];
        output[0] = (Number(output[0]) || 0) + x;
        output[1] = (Number(output[1]) || 0) + y;
        return output;
    }

    function boltSelectedKeyframesExist(layers) {
        var layerIndex, propertyIndex, property, keys;
        for (layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            try {
                var properties = layers[layerIndex].selectedProperties || [];
                for (propertyIndex = 0; propertyIndex < properties.length; propertyIndex++) {
                    property = properties[propertyIndex];
                    if (!(property instanceof Property)) { continue; }
                    keys = property.selectedKeys || [];
                    if (keys.length) { return true; }
                }
            } catch (ignoreSelectedKeyScan) {}
        }
        return false;
    }

    function boltApplyScaleAction(kind) {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        var frames = kind === "Spring" ? [0, 6, 11, 16, 22] : (kind === "Pop" ? [0, 7, 12] : [0, 5, 9, 14]);
        var factors = kind === "Spring" ? [0.82, 1.16, 0.94, 1.04, 1] : (kind === "Pop" ? [0.05, 1.13, 1] : [0.88, 1.09, 0.97, 1]);
        var changed = 0, skipped = 0, layerIndex, frameIndex;

        app.beginUndoGroup("Bolt " + kind);
        try {
            for (layerIndex = 0; layerIndex < layers.length; layerIndex++) {
                var layer = layers[layerIndex];
                var transform = null, scale = null;
                try { transform = layer.property("ADBE Transform Group"); } catch (ignoreActionTransform) {}
                try { scale = transform ? transform.property("ADBE Scale") : null; } catch (ignoreActionScale) {}
                if (!scale || layer.locked || scale.expressionEnabled) { skipped++; continue; }

                var start = boltActionTime(comp, layer);
                var base = scale.valueAtTime(start, false);
                var times = [];
                for (frameIndex = 0; frameIndex < frames.length; frameIndex++) {
                    var keyTime = start + frames[frameIndex] * comp.frameDuration;
                    times.push(keyTime);
                    scale.setValueAtTime(keyTime, boltScaleBy(base, factors[frameIndex]));
                }
                boltActionEase(scale, times, kind === "Spring" ? 68 : 82);
                changed++;
            }
        } finally { app.endUndoGroup(); }

        if (!changed) { throw new Error("Select unlocked layers without a Scale expression."); }
        setStatus(kind + " applied to " + changed + " layer(s)" + (skipped ? " • " + skipped + " skipped" : ""), skipped ? "warning" : "ok");
    }

    function boltRunBounceAction(kind) {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        if (boltSelectedKeyframesExist(layers) && state.ui && state.ui.bounceMode) {
            state.ui.bounceMode._boltSelectByText(kind === "Spring" ? "Elastic" : "Bounce", false);
            state.ui.bounceDuration.text = kind === "Spring" ? "18" : "12";
            state.ui.bounceStrength.text = kind === "Spring" ? "24" : "18";
            applySmartBounce();
            return;
        }
        boltApplyScaleAction(kind);
    }

    function boltApplyOpacityAction(kind) {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        var changed = 0, skipped = 0, layerIndex, frameIndex;

        app.beginUndoGroup("Bolt " + kind);
        try {
            for (layerIndex = 0; layerIndex < layers.length; layerIndex++) {
                var layer = layers[layerIndex];
                var opacity = null;
                try { opacity = layer.property("ADBE Transform Group").property("ADBE Opacity"); } catch (ignoreOpacityAction) {}
                if (!opacity || layer.locked || opacity.expressionEnabled) { skipped++; continue; }

                var start = boltActionTime(comp, layer);
                var base = opacity.valueAtTime(start, false);
                var frameValues = kind === "Blink" ? [[0, base], [2, 0], [4, base], [6, 0], [8, base]] : [[0, 0], [12, base]];
                var times = [];
                for (frameIndex = 0; frameIndex < frameValues.length; frameIndex++) {
                    var keyTime = start + frameValues[frameIndex][0] * comp.frameDuration;
                    times.push(keyTime);
                    opacity.setValueAtTime(keyTime, frameValues[frameIndex][1]);
                }
                boltActionEase(opacity, times, 80);
                changed++;
            }
        } finally { app.endUndoGroup(); }

        if (!changed) { throw new Error("Select unlocked layers without an Opacity expression."); }
        setStatus(kind + " applied to " + changed + " layer(s)" + (skipped ? " • " + skipped + " skipped" : ""), skipped ? "warning" : "ok");
    }

    function boltSetPositionKey(prop, time, value) {
        try { prop.setValueAtTime(time, value); return true; }
        catch (ignoreActionPositionKey) { return false; }
    }

    function boltApplyPositionAction(kind) {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        var changed = 0, skipped = 0, layerIndex, frameIndex;

        app.beginUndoGroup("Bolt " + kind);
        try {
            for (layerIndex = 0; layerIndex < layers.length; layerIndex++) {
                var layer = layers[layerIndex];
                var transform = null, position = null, opacity = null;
                try { transform = layer.property("ADBE Transform Group"); } catch (ignorePositionTransform) {}
                try { position = transform ? transform.property("ADBE Position") : null; } catch (ignorePositionProp) {}
                try { opacity = transform ? transform.property("ADBE Opacity") : null; } catch (ignorePositionOpacity) {}
                if (!position || layer.locked || position.expressionEnabled) { skipped++; continue; }

                var start = boltActionTime(comp, layer);
                var base = position.valueAtTime(start, false);
                var frameOffsets = kind === "Glitch" ? [[0,0,0],[1,18,-4],[2,-14,5],[3,9,-3],[4,-5,2],[6,0,0]] : [[0,-70,18],[14,0,0]];
                var times = [];
                for (frameIndex = 0; frameIndex < frameOffsets.length; frameIndex++) {
                    var keyTime = start + frameOffsets[frameIndex][0] * comp.frameDuration;
                    times.push(keyTime);
                    boltSetPositionKey(position, keyTime, boltOffsetPosition(base, frameOffsets[frameIndex][1], frameOffsets[frameIndex][2]));
                }
                boltActionEase(position, times, kind === "Glitch" ? 55 : 82);

                if (opacity && !opacity.expressionEnabled) {
                    var originalOpacity = opacity.valueAtTime(start, false);
                    if (kind === "Slide") {
                        opacity.setValueAtTime(start, 0);
                        opacity.setValueAtTime(start + 14 * comp.frameDuration, originalOpacity);
                        boltActionEase(opacity, [start, start + 14 * comp.frameDuration], 82);
                    } else {
                        opacity.setValueAtTime(start, originalOpacity);
                        opacity.setValueAtTime(start + 2 * comp.frameDuration, 35);
                        opacity.setValueAtTime(start + 4 * comp.frameDuration, originalOpacity);
                    }
                }
                changed++;
            }
        } finally { app.endUndoGroup(); }

        if (!changed) { throw new Error("Select unlocked layers without a Position expression."); }
        setStatus(kind + " applied to " + changed + " layer(s)" + (skipped ? " • " + skipped + " skipped" : ""), skipped ? "warning" : "ok");
    }

    function boltExpressionString(value) {
        return safeString(value)
            .replace(/\\/g, "\\\\")
            .replace(/\"/g, "\\\"")
            .replace(/\r/g, "\\r")
            .replace(/\n/g, "\\n");
    }

    function boltTextLayersOrThrow(comp) {
        var selected = selectedLayersOrThrow(comp);
        var output = [], index;
        for (index = 0; index < selected.length; index++) {
            if (boltIsTextLayer(selected[index])) { output.push(selected[index]); }
        }
        if (!output.length) { throw new Error("Select at least one text layer."); }
        return output;
    }

    function boltCanReplaceActionExpression(prop) {
        try {
            if (!prop || !prop.canSetExpression) { return false; }
            if (!prop.expressionEnabled || !trim(prop.expression).length) { return true; }
            return prop.expression.indexOf(BOLT_ACTION_EXPRESSION_TAG) === 0;
        } catch (ignoreActionExpression) { return false; }
    }

    function boltApplyTypewriter() {
        var comp = activeCompOrThrow();
        var layers = boltTextLayersOrThrow(comp);
        var changed = 0, skipped = 0, index;
        app.beginUndoGroup("Bolt Typewriter");
        try {
            for (index = 0; index < layers.length; index++) {
                var layer = layers[index];
                var sourceText = layer.property("ADBE Text Properties").property("ADBE Text Document");
                if (!boltCanReplaceActionExpression(sourceText)) { skipped++; continue; }
                var start = boltActionTime(comp, layer);
                sourceText.expression = BOLT_ACTION_EXPRESSION_TAG +
                    "var s=(value && value.text!==undefined)?value.text:value.toString();\\n" +
                    "var start=" + start.toFixed(6) + ";\\n" +
                    "var frames=Math.max(12,Math.min(90,s.length*1.6));\\n" +
                    "var dur=frames*thisComp.frameDuration;\\n" +
                    "var p=Math.max(0,Math.min(1,(time-start)/dur));\\n" +
                    "var n=Math.floor(s.length*p);\\n" +
                    "var cursor=(time>=start && (n<s.length || time<start+dur+1.2) && Math.floor((time-start)*4)%2===0)?'|':'';\\n" +
                    "s.substr(0,n)+cursor;";
                changed++;
            }
        } finally { app.endUndoGroup(); }
        if (!changed) { throw new Error("The selected text layers already contain custom Source Text expressions."); }
        setStatus("Typewriter applied to " + changed + " text layer(s)" + (skipped ? " • " + skipped + " protected" : ""), skipped ? "warning" : "ok");
    }

    function boltApplyCounter() {
        var comp = activeCompOrThrow();
        var layers = boltTextLayersOrThrow(comp);
        var changed = 0, skipped = 0, index;
        app.beginUndoGroup("Bolt Counter");
        try {
            for (index = 0; index < layers.length; index++) {
                var layer = layers[index];
                var sourceText = layer.property("ADBE Text Properties").property("ADBE Text Document");
                if (!boltCanReplaceActionExpression(sourceText)) { skipped++; continue; }
                var text = safeString(sourceText.value.text);
                var match = text.match(/^([^\-\d]*)(-?\d[\d,]*(?:\.\d+)?)(.*)$/);
                if (!match) { skipped++; continue; }
                var targetText = match[2].replace(/,/g, "");
                var target = Number(targetText);
                if (!isFinite(target)) { skipped++; continue; }
                var decimalMatch = targetText.match(/\.(\d+)/);
                var decimals = decimalMatch ? decimalMatch[1].length : 0;
                var start = boltActionTime(comp, layer);
                sourceText.expression = BOLT_ACTION_EXPRESSION_TAG +
                    "var start=" + start.toFixed(6) + ";\\n" +
                    "var dur=Math.max(12,Math.min(48,Math.abs(" + target + ")/8+16))*thisComp.frameDuration;\\n" +
                    "var p=Math.max(0,Math.min(1,(time-start)/dur));\\n" +
                    "p=1-Math.pow(1-p,3);\\n" +
                    "var n=" + target + "*p;\\n" +
                    "var s=" + (decimals ? ("n.toFixed(" + decimals + ")") : "Math.round(n).toString()") + ";\\n" +
                    "var a=s.split('.'); var sign=''; if(a[0].charAt(0)=='-'){sign='-';a[0]=a[0].substr(1);}\\n" +
                    "a[0]=a[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g,',');\\n" +
                    "\"" + boltExpressionString(match[1]) + "\"+sign+a.join('.')+\"" + boltExpressionString(match[3]) + "\";";
                changed++;
            }
        } finally { app.endUndoGroup(); }
        if (!changed) { throw new Error("Select text containing a number and no protected Source Text expression."); }
        setStatus("Counter applied to " + changed + " text layer(s)" + (skipped ? " • " + skipped + " skipped" : ""), skipped ? "warning" : "ok");
    }

    function boltTextFillColor(layer) {
        try {
            var document = layer.property("ADBE Text Properties").property("ADBE Text Document").value;
            if (document.applyFill && document.fillColor) { return document.fillColor; }
        } catch (ignoreTextFillColor) {}
        return [1, 1, 1];
    }

    function boltRemoveTextHelper(comp, textLayer, kind) {
        var token = BOLT_ACTION_HELPER_TAG + textLayer.id + ":" + kind;
        var index, layer;
        for (index = comp.numLayers; index >= 1; index--) {
            layer = comp.layer(index);
            try {
                if (safeString(layer.comment) === token) { layer.remove(); }
            } catch (ignoreHelperRemove) {}
        }
    }

    function boltCreateTextHelper(kind) {
        var comp = activeCompOrThrow();
        var layers = boltTextLayersOrThrow(comp);
        var created = 0, skipped = 0, index;
        app.beginUndoGroup("Bolt " + kind);
        try {
            for (index = 0; index < layers.length; index++) {
                var textLayer = layers[index];
                if (textLayer.locked) { skipped++; continue; }
                boltRemoveTextHelper(comp, textLayer, kind);

                var helper = comp.layers.addShape();
                helper.name = "BOLT • " + kind + " • " + textLayer.name;
                helper.comment = BOLT_ACTION_HELPER_TAG + textLayer.id + ":" + kind;
                helper.inPoint = textLayer.inPoint;
                helper.outPoint = textLayer.outPoint;
                helper.label = textLayer.label;
                helper.parent = textLayer;

                var transform = helper.property("ADBE Transform Group");
                transform.property("ADBE Anchor Point").setValue([0, 0]);
                transform.property("ADBE Position").setValue([0, 0]);
                transform.property("ADBE Scale").setValue([100, 100]);
                transform.property("ADBE Rotate Z").setValue(0);

                var root = helper.property("ADBE Root Vectors Group");
                var group = root.addProperty("ADBE Vector Group");
                group.name = kind;
                var vectors = group.property("ADBE Vectors Group");
                var rectangle = vectors.addProperty("ADBE Vector Shape - Rect");
                var size = rectangle.property("ADBE Vector Rect Size");
                var position = rectangle.property("ADBE Vector Rect Position");
                var fill = vectors.addProperty("ADBE Vector Graphic - Fill");
                var fillColor = fill.property("ADBE Vector Fill Color");
                var fillOpacity = fill.property("ADBE Vector Fill Opacity");

                if (kind === "Underline") {
                    size.expression = BOLT_ACTION_EXPRESSION_TAG + "var r=parent.sourceRectAtTime(time,false); [Math.max(8,r.width),Math.max(2,r.height*0.055)];";
                    position.expression = BOLT_ACTION_EXPRESSION_TAG + "var r=parent.sourceRectAtTime(time,false); [r.left+r.width/2,r.top+r.height+Math.max(2,r.height*0.08)];";
                    fillColor.setValue(boltTextFillColor(textLayer));
                    fillOpacity.setValue(100);
                } else {
                    size.expression = BOLT_ACTION_EXPRESSION_TAG + "var r=parent.sourceRectAtTime(time,false); [Math.max(12,r.width+20),Math.max(8,r.height+10)];";
                    position.expression = BOLT_ACTION_EXPRESSION_TAG + "var r=parent.sourceRectAtTime(time,false); [r.left+r.width/2,r.top+r.height/2];";
                    fillColor.setValue([1, 0.72, 0.12]);
                    fillOpacity.setValue(82);
                }

                var groupTransform = group.property("ADBE Vector Transform Group");
                var groupScale = groupTransform.property("ADBE Vector Scale");
                var start = boltActionTime(comp, textLayer);
                groupScale.setValueAtTime(start, [0, 100]);
                groupScale.setValueAtTime(start + 12 * comp.frameDuration, [100, 100]);
                boltActionEase(groupScale, [start, start + 12 * comp.frameDuration], 82);

                try { helper.moveAfter(textLayer); } catch (ignoreHelperOrder) {}
                created++;
            }
        } finally { app.endUndoGroup(); }
        if (!created) { throw new Error("Select unlocked text layers."); }
        setStatus(kind + " created for " + created + " text layer(s)" + (skipped ? " • " + skipped + " skipped" : ""), skipped ? "warning" : "ok");
    }

    function boltClearTextActions() {
        var comp = activeCompOrThrow();
        var layers = boltTextLayersOrThrow(comp);
        var cleared = 0, index, helperIndex, layer, sourceText, prefix;
        app.beginUndoGroup("Bolt Clear Text Actions");
        try {
            for (index = 0; index < layers.length; index++) {
                layer = layers[index];
                try {
                    sourceText = layer.property("ADBE Text Properties").property("ADBE Text Document");
                    if (sourceText.expression.indexOf(BOLT_ACTION_EXPRESSION_TAG) === 0) {
                        sourceText.expression = "";
                        cleared++;
                    }
                } catch (ignoreClearTextExpression) {}
                prefix = BOLT_ACTION_HELPER_TAG + layer.id + ":";
                for (helperIndex = comp.numLayers; helperIndex >= 1; helperIndex--) {
                    try {
                        if (safeString(comp.layer(helperIndex).comment).indexOf(prefix) === 0) {
                            comp.layer(helperIndex).remove();
                            cleared++;
                        }
                    } catch (ignoreClearHelper) {}
                }
            }
        } finally { app.endUndoGroup(); }
        setStatus(cleared ? ("Cleared " + cleared + " generated text item(s)") : "No generated text items found", cleared ? "ok" : "warning");
    }

    function buildUI(thisObject) {
        var panel = thisObject instanceof Panel ? thisObject : new Window("palette", brandTitle(), undefined, {resizeable:true});
        panel.orientation = "column";
        panel.alignChildren = ["fill", "fill"];
        panel.spacing = 2;
        panel.margins = 2;
        // Stable native ScriptUI layout. No recursive scaling and no forced
        // 500 px child tree. Controls use fill alignment inside the real dock.
        var COMPACT_PANEL_WIDTH = 400;
        var COMPACT_PANEL_HEIGHT = 545;
        panel.minimumSize = [320, 420];
        panel.preferredSize = [COMPACT_PANEL_WIDTH, COMPACT_PANEL_HEIGHT];
        panel.maximumSize = [10000, 10000];

        var responsiveBusy = false;
        var responsiveRows = [];
        var responsiveSegments = [];

    function setFixedSize(control, width, height) {
                try {
                    control.preferredSize = [width, height];
                    control.minimumSize = [width, height];
                    control.maximumSize = [width, height];
                    control.alignment = ["left", "center"];
                } catch (ignoreSize) {}
                return control;
            }
        function setHeight(control, height) {
            try {
                control.preferredSize.height = height;
                control.minimumSize.height = height;
                control.maximumSize.height = height;
            } catch (ignoreHeight) {}
            return control;
        }
        function bold(control, size) {
            try { control.graphics.font = ScriptUI.newFont(control.graphics.font.name, "BOLD", size || control.graphics.font.size); } catch (ignoreBold) {}
            return control;
        }
        function setTextColor(control, rgb) {
            try {
                control.graphics.foregroundColor = control.graphics.newPen(
                    control.graphics.PenType.SOLID_COLOR,
                    rgb,
                    1
                );
            } catch (ignoreTextColor) {}
            return control;
        }
        
        function makePanel(parent, titleText) {
            var p = parent.add("panel", undefined, "");
            p.orientation = "column";
            p.alignChildren = ["fill", "top"];
            p.alignment = ["fill", "top"];
            p.spacing = 2;
            p.margins = [3, 2, 3, 3];
            p.minimumSize = [0, 0];
            p.maximumSize = [10000, 10000];

            var headerRow = p.add("group");
            headerRow.orientation = "row";
            headerRow.alignChildren = ["left", "center"];
            headerRow.alignment = ["fill", "top"];
            headerRow.spacing = 4;
            headerRow.margins = 0;

            var headerLabel = headerRow.add("statictext", undefined, safeString(titleText).toUpperCase());
            bold(headerLabel, 9);
            setTextColor(headerLabel, [0.72, 0.74, 0.77]);

            var rule = headerRow.add("panel");
            rule.alignment = ["fill", "center"];
            rule.minimumSize.height = 1;
            rule.maximumSize.height = 1;
            p._boltHeader = headerLabel;
            return p;
        }

    function makeRow(parent, spacing) {
                var row = parent.add("group");
                row.orientation = "row";
                row.alignChildren = ["left", "center"];
                row.alignment = ["fill", "top"];
                row.spacing = spacing === undefined ? 3 : spacing;
                row.margins = 0;
                row.minimumSize = [0, 0];
                row.maximumSize = [10000, 10000];
                return row;
            }

    function registerResponsiveRow(row, breakpoint) {
                row._boltBreakpoint = Math.max(180, Number(breakpoint) || 320);
                row._boltWideSpacing = Number(row.spacing) || 3;
                row._boltCompact = false;
                responsiveRows.push(row);
                return row;
            }

    function updateResponsiveRows(contentWidth) {
                var index, row, compact, childIndex, child, typeName;
    
                for (index = 0; index < responsiveRows.length; index++) {
                    row = responsiveRows[index];
                    if (!row || row.visible === false) { continue; }
    
                    compact = contentWidth < row._boltBreakpoint;
                    if (row._boltCompact === compact) { continue; }
                    row._boltCompact = compact;
    
                    row.orientation = compact ? "column" : "row";
                    row.alignChildren = compact ? ["left", "top"] : ["left", "center"];
                    row.spacing = compact ? 2 : row._boltWideSpacing;
    
                    try {
                        for (childIndex = 0; childIndex < row.children.length; childIndex++) {
                            child = row.children[childIndex];
                            typeName = safeString(child.type).toLowerCase();
    
                            if (
                                typeName === "edittext" ||
                                typeName === "dropdownlist" ||
                                typeName === "slider" ||
                                child._boltResponsiveFill === true
                            ) {
                                child.alignment = compact ? ["fill", "top"] : ["fill", "center"];
                                child.minimumSize.width = 0;
                                child.maximumSize.width = 10000;
                            } else if (typeName === "button") {
                                child.alignment = compact ? ["left", "top"] : ["left", "center"];
                            }
                        }
                    } catch (ignoreResponsiveChildren) {}
    
                    try { row.layout.layout(true); } catch (ignoreResponsiveRowLayout) {}
                }
            }

    function compactField(parent, textValue, chars, width) {
                var field = parent.add("edittext", undefined, textValue);
                field.characters = chars || 5;
                setHeight(field, 20);
                if (width) {
                    field.preferredSize.width = width;
                    field.minimumSize.width = width;
                    field.maximumSize.width = width;
                    field.alignment = ["left", "center"];
                }
                return field;
            }
        function compactDropdown(parent, items, selectedIndex, width, fill) {
            var list = parent.add("dropdownlist", undefined, items || []);
            setHeight(list, 20);
            if (fill) {
                list.alignment = ["fill", "center"];
                list.minimumSize.width = 0;
                list.maximumSize.width = 10000;
                list._boltResponsiveFill = true;
            } else {
                var targetWidth = width || 150;
                list.preferredSize.width = targetWidth;
                list.minimumSize.width = Math.min(56, targetWidth);
                list.maximumSize.width = targetWidth;
                list.alignment = ["left", "center"];
            }
            list._boltSelect = function(index, fireEvent) {
                if (!list.items.length) { return; }
                index = Math.max(0, Math.min(list.items.length - 1, index));
                list.selection = list.items[index];
                if (fireEvent && list.onChange) { list.onChange(); }
            };
            list._boltSelectByText = function(textValue, fireEvent) {
                var index;
                for (index = 0; index < list.items.length; index++) {
                    if (list.items[index].text === textValue) {
                        list._boltSelect(index, fireEvent);
                        return true;
                    }
                }
                return false;
            };
            if (list.items.length) { list._boltSelect(selectedIndex || 0, false); }
            list.helpTip = "Choose an option.";
            return list;
        }
        function choiceDropdown(parent, items, selectedIndex, width, fill) {
            var list = parent.add("dropdownlist", undefined, items || []);
            setHeight(list, 20);
            if (fill) {
                list.alignment = ["fill", "center"];
                list.minimumSize.width = 0;
                list.maximumSize.width = 10000;
                list._boltResponsiveFill = true;
            } else {
                var choiceWidth = width || 150;
                list.preferredSize.width = choiceWidth;
                list.minimumSize.width = Math.min(56, choiceWidth);
                list.maximumSize.width = choiceWidth;
                list.alignment = ["left", "center"];
            }
            list._boltSelect = function(index, fireEvent) {
                if (!list.items.length) { return; }
                index = Math.max(0, Math.min(list.items.length - 1, index));
                list.selection = list.items[index];
                if (fireEvent && list.onChange) { list.onChange(); }
            };
            list._boltSelectByText = function(textValue, fireEvent) {
                var index;
                for (index = 0; index < list.items.length; index++) {
                    if (list.items[index].text === textValue) {
                        list._boltSelect(index, fireEvent);
                        return true;
                    }
                }
                return false;
            };
            list._boltSelect(selectedIndex || 0, false);
            return list;
        }

    function compactButton(parent, textValue, width) {
                var button = parent.add("button", undefined, textValue);
                var measuredWidth = width;
    
                if (!measuredWidth) {
                    measuredWidth = Math.max(
                        34,
                        Math.min(108, Math.round(20 + safeString(textValue).length * 6.1))
                    );
                }
    
                setHeight(button, 20);
                button.preferredSize.width = measuredWidth;
                button.minimumSize.width = measuredWidth;
                button.maximumSize.width = measuredWidth;
                button.alignment = ["left", "center"];
                return button;
            }
        function primaryButton(parent, textValue, width) {
            var button = compactButton(parent, textValue, width);
            bold(button, 9);
            return button;
        }
        function segmentedControl(parent, items, selectedIndex, columns, labels) {
            var host = parent.add("group");
            host.orientation = "column";
            host.alignChildren = ["fill", "top"];
            host.alignment = ["fill", "top"];
            host.spacing = 3;
            host.margins = 0;
            var control = {items:[], buttons:[], rows:[], selection:null, onChange:null, host:host, enabled:true};
            var count = items.length;
            var perRow = Math.max(1, columns || count);
            var row = null;
            var index;
            control._boltSelect = function (choiceIndex, fireEvent) {
                if (choiceIndex < 0 || choiceIndex >= control.items.length) { return; }
                control.selection = control.items[choiceIndex];
                var buttonIndex;
                for (buttonIndex = 0; buttonIndex < control.buttons.length; buttonIndex++) {
                    control.buttons[buttonIndex].text =
                        (buttonIndex === choiceIndex ? "> " : "") + control.buttons[buttonIndex]._boltLabel;
                }
                if (fireEvent && control.onChange) { control.onChange(); }
            };
            control._boltSelectByText = function (textValue, fireEvent) {
                var searchIndex;
                for (searchIndex = 0; searchIndex < control.items.length; searchIndex++) {
                    if (control.items[searchIndex].text === textValue) {
                        control._boltSelect(searchIndex, fireEvent);
                        return true;
                    }
                }
                return false;
            };
            for (index = 0; index < count; index++) {
                if (index % perRow === 0) {
                    row = host.add("group");
                    row.orientation = "row";
                    row.alignChildren = ["fill", "center"];
                    row.alignment = ["fill", "top"];
                    row.spacing = 3;
                    row.margins = 0;
                    control.rows.push(row);
                }
                var item = {text:items[index], index:index};
                control.items.push(item);
                var labelText = labels && labels[index] ? labels[index] : items[index];
                var button = compactButton(row, labelText);
                button.alignment = ["fill", "center"];
                button._boltChoiceIndex = index;
                button._boltLabel = labelText;
                button.helpTip = "Select " + items[index] + ".";
                button.onClick = function () { control._boltSelect(this._boltChoiceIndex, true); };
                control.buttons.push(button);
            }
            control._boltSetCompact = function (compact) {
                // Fixed layout: segmented controls always stay on one authored row.
            };
            control._boltSelect(Math.max(0, Math.min(count - 1, selectedIndex || 0)), false);
            responsiveSegments.push(control);
            return control;
        }
        function setSectionVisible(section, visible) {
            if (!section) { return; }
            section.visible = !!visible;
            section.enabled = !!visible;
            try { section.maximumSize.height = visible ? 10000 : 0; } catch (ignoreSectionMaximum) {}
            try { section.minimumSize.height = 0; } catch (ignoreSectionMinimum) {}
        }
        function miniSlider(parent, labelText, minValue, maxValue, initialValue, decimals, suffixText) {
            var row = makeRow(parent, 4);
            var label = row.add("statictext", undefined, labelText);
            label.preferredSize.width = 44;
            var slider = row.add("slider", undefined, initialValue, minValue, maxValue);
            slider.alignment = ["fill", "center"];
            var initialText = decimals ? Number(initialValue).toFixed(decimals) : String(Math.round(initialValue));
            var field = compactField(row, initialText, decimals ? 6 : 4, decimals ? 50 : 42);
            if (suffixText) {
                var suffix = row.add("statictext", undefined, suffixText);
                suffix.preferredSize.width = 20;
            }
            function syncFromSlider() {
                field.text = decimals ? Number(slider.value).toFixed(decimals) : String(Math.round(slider.value));
            }
            function syncFromField() {
                slider.value = clampNumber(field.text, minValue, maxValue, initialValue);
                syncFromSlider();
            }
            slider.onChanging = syncFromSlider;
            slider.onChange = syncFromSlider;
            field.onChange = syncFromField;
            return {row:row, slider:slider, field:field};
        }
        // Compact native After Effects header.
        var header = panel.add("group");
        header.orientation = "row";
        header.alignChildren = ["left", "center"];
        header.alignment = ["fill", "top"];
        header.spacing = 3;
        header.margins = [3, 0, 2, 0];
        setHeight(header, 20);

        // Version/name is already visible in the native After Effects panel tab.
        // Keep this internal header clean and reserve it for utility controls only.
        var headerSpacer = header.add("statictext", undefined, "");
        headerSpacer.alignment = ["fill", "center"];
        var clockLabel = header.add("statictext", undefined, "No active comp");
        clockLabel.helpTip = "Active composition and current frame.";
        clockLabel.visible = false;
        setTextColor(clockLabel, [0.62, 0.65, 0.70]);
        var infoButton = setFixedSize(header.add("button", undefined, "i"), 22, 20);
        infoButton.helpTip = "About Bolt";

        // Single-line native workspace navigation.
        var workspaceShell = panel.add("group");
        workspaceShell.orientation = "column";
        workspaceShell.alignChildren = ["fill", "fill"];
        workspaceShell.alignment = ["fill", "fill"];
        workspaceShell.spacing = 3;
        workspaceShell.margins = 0;
        workspaceShell.minimumSize = [0, 0];
        workspaceShell.maximumSize = [10000, 10000];

        var navRail = workspaceShell.add("group");
        navRail.orientation = "row";
        navRail.alignChildren = ["fill", "center"];
        navRail.alignment = ["fill", "top"];
        navRail.spacing = 0;
        navRail.margins = 0;
        setHeight(navRail, 22);

        // The six main workspaces are the only navigation level.
        var navRow = navRail.add("group");
        navRow.orientation = "row";
        navRow.alignChildren = ["fill", "center"];
        navRow.alignment = ["fill", "top"];
        navRow.spacing = 2;
        navRow.margins = 0;
        setHeight(navRow, 22);

        var pageStack = workspaceShell.add("group");
        pageStack.orientation = "stack";
        pageStack.alignChildren = ["fill", "fill"];
        pageStack.alignment = ["fill", "fill"];
        pageStack.spacing = 0;
        pageStack.margins = 0;
        pageStack.minimumSize = [0, 0];
        pageStack.maximumSize = [10000, 10000];

        var pages = {};
        var navButtons = {};
        var navLabels = {};
        var navUnderlines = {};
        var navOrder = ["Project", "Comp", "Motion", "Style", "Queue", "Tools"];
        var navMeta = {
            "Project": {label:"Project", subtitle:"Project — collect and organize"},
            "Comp": {label:"Comps", subtitle:"Comps — duplicate and relink"},
            "Motion": {label:"Motion", subtitle:"Motion — selected-keyframe tools"},
            "Style": {label:"Style", subtitle:"Style — typography, color and finishing"},
            "Queue": {label:"Render", subtitle:"Render — composition queue and Media Encoder"},
            "Tools": {label:"Tools", subtitle:"Tools — anchor, layers and utilities"}
        };

        function drawNavUnderline(line) {
            line.onDraw = function () {
                var g = this.graphics;
                try {
                    var w = Math.max(1, Number(this.size.width) || 1);
                    var h = Math.max(1, Number(this.size.height) || 1);
                    g.rectPath(0, 0, w, h);
                    g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, [0.64, 0.66, 0.70, 1]));
                } catch (ignoreLineDraw) {}
            };
        }

        function bindNavItem(item, label, handler) {
            function clickHandler(event) {
                try { handler(); } catch (navigationError) { showError(navigationError); }
                try { event.preventDefault(); } catch (ignoreNavPrevent) {}
                try { event.stopPropagation(); } catch (ignoreNavStop) {}
            }
            try { item.addEventListener("mousedown", clickHandler); } catch (ignoreItemMouse) {}
            try { label.addEventListener("mousedown", clickHandler); } catch (ignoreLabelMouse) {}
            item._boltBind = function (newHandler) { handler = newHandler; };
        }

        var navIndex;
        for (navIndex = 0; navIndex < navOrder.length; navIndex++) {
            var navName = navOrder[navIndex];
            var navItem = navRow.add("group");
            navItem.orientation = "column";
            navItem.alignChildren = ["fill", "top"];
            navItem.alignment = ["fill", "top"];
            navItem.spacing = 0;
            navItem.margins = 0;
            navItem.minimumSize = [0, 22];
            navItem.maximumSize = [10000, 22];

            var navLabel = navItem.add("statictext", undefined, navMeta[navName].label.toUpperCase());
            navLabel.justify = "center";
            navLabel.alignment = ["fill", "top"];
            navLabel.helpTip = navMeta[navName].subtitle;
            setHeight(navLabel, 19);
            bold(navLabel, 8);

            var navUnderline = navItem.add("panel");
            navUnderline.alignment = ["fill", "top"];
            navUnderline.minimumSize.height = 2;
            navUnderline.maximumSize.height = 2;
            navUnderline.preferredSize.height = 2;
            navUnderline.visible = false;
            drawNavUnderline(navUnderline);

            bindNavItem(navItem, navLabel, function () {});
            navButtons[navName] = navItem;
            navLabels[navName] = navLabel;
            navUnderlines[navName] = navUnderline;
        }

        function addPage(name) {
            var page = pageStack.add("group");
            page.orientation = "column";
            page.alignChildren = ["fill", "fill"];
            page.alignment = ["fill", "fill"];
            page.spacing = 0;
            page.margins = 0;
            page.minimumSize = [0, 0];
            page.maximumSize = [10000, 10000];
            page.visible = false;
            page.helpTip = navMeta[name].subtitle;
            pages[name] = page;
            return page;
        }

        var organizeTab = addPage("Project");
        var duplicateTab = addPage("Comp");
        var motionTab = addPage("Motion");
        var styleTab = addPage("Style");
        var renderTab = addPage("Queue");
        var toolsTab = addPage("Tools");
        var activePageName = "Project";

    function updateNavigationState(panelWidth) {
                var index, name, item, label, underline, active;
                var labels = {
                    Project:"PROJECT",
                    Comp:"COMPS",
                    Motion:"MOTION",
                    Style:"STYLE",
                    Queue:"RENDER",
                    Tools:"TOOLS"
                };
    
                var measuredWidth = Number(panelWidth) || 0;
                try {
                    if (navRow && Number(navRow.size.width) > 0) {
                        measuredWidth = Number(navRow.size.width);
                    }
                } catch (ignoreNavMeasurement) {}
    
                measuredWidth = Math.max(300, measuredWidth || COMPACT_PANEL_WIDTH);
                var navSpacing = 0;
                try { navSpacing = Math.max(0, Number(navRow.spacing) || 0); } catch (ignoreNavSpacing) {}
                var usableNavWidth = Math.max(264, measuredWidth - navSpacing * Math.max(0, navOrder.length - 1));
                var tabWidth = Math.max(44, Math.floor(usableNavWidth / navOrder.length));
                var fontSize = measuredWidth < 370 ? 6 : 7;
    
                for (index = 0; index < navOrder.length; index++) {
                    name = navOrder[index];
                    item = navButtons[name];
                    label = navLabels[name];
                    underline = navUnderlines[name];
                    active = name === activePageName;
    
                    label.text = labels[name];
                    underline.visible = active;
    
                    try {
                        label.graphics.font = ScriptUI.newFont(
                            label.graphics.font.name,
                            active ? "BOLD" : "REGULAR",
                            fontSize
                        );
                        label.graphics.foregroundColor = label.graphics.newPen(
                            label.graphics.PenType.SOLID_COLOR,
                            active ? [0.94, 0.95, 0.97] : [0.65, 0.67, 0.70],
                            1
                        );
                    } catch (ignoreNavStyle) {}
    
                    try {
                        item.minimumSize = [tabWidth, 22];
                        item.preferredSize = [tabWidth, 22];
                        item.maximumSize = [tabWidth, 22];
                    } catch (ignoreNavSize) {}
                }
            }
        // PROJECT — compact control deck. The working engine is unchanged; only
        // the top workspace UI is reorganized for a cleaner narrow-dock hierarchy.
        var organizeBody = createScrollableContent(organizeTab);

        var projectControlPanel = organizeBody.add("panel", undefined, "");
        projectControlPanel.orientation = "column";
        projectControlPanel.alignChildren = ["fill", "top"];
        projectControlPanel.alignment = ["fill", "top"];
        projectControlPanel.spacing = 5;
        projectControlPanel.margins = [5, 5, 5, 6];
        projectControlPanel.minimumSize = [0, 0];
        projectControlPanel.maximumSize = [10000, 10000];

        var projectPrimaryRow = makeRow(projectControlPanel, 4);
        var analyzeButton = primaryButton(projectPrimaryRow, "Analyze", 72);
        var organizeButton = compactButton(projectPrimaryRow, "Organize", 72);
        var cleanProjectButton = compactButton(projectPrimaryRow, "Clean", 54);
        analyzeButton.helpTip = "Smart Analyze: detect the workspace and hero composition, refresh Project Structure, and report project health without moving files.";
        organizeButton.helpTip = "Create the project-name workspace, collect and relink every available imported file and proxy, skip unresolved missing media without stopping, move loose files into Resources/Unused, organize the Project panel, and repair Render Queue paths.";
        cleanProjectButton.helpTip = "Safe Clean: smart-label layers, remove only provably empty/unreferenced layers, consolidate safe duplicate imported footage in the Project panel, remove unused imported Project items, and remove empty folders. Source files on disk and missing media are never deleted.";

        var workspaceTitle = projectControlPanel.add("statictext", undefined, "WORKSPACE");
        workspaceTitle.alignment = ["left", "top"];
        bold(workspaceTitle, 8);
        setTextColor(workspaceTitle, [0.68, 0.70, 0.73]);

        var workspaceRow = addPathRow(projectControlPanel, "", "Choose workspace folder");
        workspaceRow.button.text = "...";
        workspaceRow.button.preferredSize.width = 26;
        workspaceRow.button.minimumSize.width = 26;
        workspaceRow.button.maximumSize.width = 26;
        var autoWorkspace = compactButton(workspaceRow.row, "Auto", 40);
        autoWorkspace.helpTip = "Automatically detect the workspace from the current project.";

        var heroTitle = projectControlPanel.add("statictext", undefined, "HERO COMPOSITION");
        heroTitle.alignment = ["left", "top"];
        bold(heroTitle, 8);
        setTextColor(heroTitle, [0.68, 0.70, 0.73]);

        var heroRow = makeRow(projectControlPanel, 4);
        var heroLabel = heroRow.add("statictext", undefined, "Automatic");
        heroLabel.alignment = ["fill", "center"];
        heroLabel.minimumSize.width = 0;
        heroLabel.maximumSize.width = 10000;
        var setHeroButton = compactButton(heroRow, "Use", 40);
        var clearHeroButton = compactButton(heroRow, "Find", 40);
        setHeroButton.helpTip = "Use the selected/open composition as the main hero composition.";
        clearHeroButton.helpTip = "Find the most likely main composition across the project.";

        var projectQuickDivider = projectControlPanel.add("panel");
        projectQuickDivider.alignment = ["fill", "top"];
        projectQuickDivider.minimumSize.height = 1;
        projectQuickDivider.preferredSize.height = 1;
        projectQuickDivider.maximumSize.height = 1;

        var projectQuickToolsRow = makeRow(projectControlPanel, 4);
        var projectSnapshotButton = compactButton(projectQuickToolsRow, "Snapshot", 66);
        var projectPasteButton = compactButton(projectQuickToolsRow, "Paste", 50);
        var projectPurgeButton = compactButton(projectQuickToolsRow, "Purge", 50);
        projectSnapshotButton.helpTip = "Save the current comp frame as PNG in Resources and import it.";
        projectPasteButton.helpTip = "Paste copied files or image pixels into Resources and the Project panel.";
        projectPurgeButton.helpTip = "Purge After Effects memory, disk, undo and snapshot caches after confirmation.";

        var projectUtilityRow = makeRow(projectControlPanel, 3);
        var projectPlanButton = compactButton(projectUtilityRow, "Change Plan");
        var projectAdvancedButton = compactButton(projectUtilityRow, "Options");
        projectUtilityRow.visible = false;
        projectUtilityRow.maximumSize.height = 0;
        projectPlanButton.helpTip = "Show or hide the exact change plan.";
        projectAdvancedButton.helpTip = "Show or hide collection and cleanup options.";

        var structureLine = projectControlPanel.add("statictext", undefined, "ROOT  Hero + Scenes   •   01 Comps   02 Images   03 Video   04 Audio   05 Other");
        structureLine.alignment = ["fill", "top"];
        structureLine.preferredSize.width = 1;
        structureLine.minimumSize.width = 0;
        structureLine.helpTip = "Bolt always keeps the hero and clearly named Scene/Shot/Sequence comps at root. Everything else goes into the fixed five folders.";
        try { structureLine.graphics.foregroundColor = structureLine.graphics.newPen(structureLine.graphics.PenType.SOLID_COLOR, [0.53,0.57,0.64], 1); } catch (ignoreStructureColor) {}
        structureLine.visible = false;
        structureLine.maximumSize.height = 0;

        var projectStructurePanel = makePanel(organizeBody, "Project Structure");
        var projectStructureList = projectStructurePanel.add("listbox", undefined, [], {multiselect:false});
        projectStructureList.alignment = ["fill", "top"];
        setHeight(projectStructureList, 92);
        projectStructureList.minimumSize.height = 78;
        projectStructureList.maximumSize.height = 96;
        projectStructureList.helpTip = "Live item counts for Bolt's fixed five Project folders.";
        var projectStructureStatus = projectStructurePanel.add("statictext", undefined, "Hero and named scenes stay at root.");
        projectStructureStatus.alignment = ["fill", "top"];
        setTextColor(projectStructureStatus, [0.68, 0.70, 0.73]);

        var projectPlanPanel = makePanel(organizeBody, "Change Plan");
        var projectPreview = projectPlanPanel.add("listbox", undefined, ["Click Analyze to build an exact cleanup plan."], {multiselect:false});
        projectPreview.alignment = ["fill", "top"];
        setHeight(projectPreview, 88);
        projectPreview.minimumSize.height = 68;
        projectPreview.maximumSize.height = 138;
        projectPreview.helpTip = "Exact actions Bolt will perform before Organize.";
        projectPlanPanel.visible = false;
        projectPlanPanel.maximumSize.height = 0;

        var projectAdvancedHost = organizeBody.add("group");
        projectAdvancedHost.orientation = "column";
        projectAdvancedHost.alignChildren = ["fill", "top"];
        projectAdvancedHost.alignment = ["fill", "top"];
        projectAdvancedHost.spacing = 3;
        projectAdvancedHost.margins = 0;
        projectAdvancedHost.visible = false;
        projectAdvancedHost.maximumSize.height = 0;

        var optionsPanel = makePanel(projectAdvancedHost, "Advanced Project Options");
        var opt1 = makeRow(optionsPanel, 6);
        var collectMedia = opt1.add("checkbox", undefined, "Collect"); collectMedia.value = true; collectMedia.enabled = false;
        collectMedia.helpTip = "Copy external media into Resources and relink. Original source files remain untouched.";
        var organizeResources = opt1.add("checkbox", undefined, "Arrange files"); organizeResources.value = true; organizeResources.enabled = false;
        organizeResources.helpTip = "Keep used files directly in Resources without media-category folders.";
        var opt2 = makeRow(optionsPanel, 6);
        var archiveUnusedResources = opt2.add("checkbox", undefined, "Unused folder"); archiveUnusedResources.value = true; archiveUnusedResources.enabled = false;
        archiveUnusedResources.helpTip = "Move unreferenced files inside Resources to Resources/Unused. Nothing is deleted.";
        var organizeProjectPanelOption = opt2.add("checkbox", undefined, "Sort Project"); organizeProjectPanelOption.value = true; organizeProjectPanelOption.enabled = false;
        organizeProjectPanelOption.helpTip = "Apply the fixed five-folder Project-panel structure.";
        var opt3 = makeRow(optionsPanel, 6);
        var removeUnusedItems = opt3.add("checkbox", undefined, "Remove unused items");
        removeUnusedItems.value = false; removeUnusedItems.enabled = false;
        removeUnusedItems.helpTip = "After an expression-safety scan and itemized confirmation, remove unused file-based Project items only. Source files stay on disk.";
        var moveRenderOutputs = opt3.add("checkbox", undefined, "Queue paths"); moveRenderOutputs.value = true; moveRenderOutputs.enabled = false;
        moveRenderOutputs.helpTip = "Point existing Render Queue outputs to the workspace Render folder.";
        var keepScenesAtRoot = optionsPanel.add("checkbox", undefined, "Hero and named scenes stay at root");
        keepScenesAtRoot.value = true;
        keepScenesAtRoot.enabled = false;
        keepScenesAtRoot.helpTip = "Fixed Bolt 14 behavior. This is intentionally not optional.";

        // Layer management stays available, but no longer crowds the main Project view.
        var smartLayersPanel = makePanel(projectAdvancedHost, "Layer Cleanup");
        var layerScopeRow = makeRow(smartLayersPanel, 3);
        layerScopeRow.add("statictext", undefined, "Scope");
        var layerScope = segmentedControl(layerScopeRow, ["Active Comp", "Selected Comps", "Hero + Nested", "All Comps"], 0, 4, ["Active", "Selected", "Nested", "All"]);
        var layerProfileRow = makeRow(smartLayersPanel, 3);
        layerProfileRow.add("statictext", undefined, "Mode");
        var layerProfile = segmentedControl(layerProfileRow, ["Safe", "Deep"], 0, 2, ["Safe", "Deep"]);
        var layerProfileHint = smartLayersPanel.add("statictext", undefined, "Names, timing, labels and technical cleanup. No automatic layer deletion.");
        layerProfileHint.alignment = ["fill", "top"];
        layerProfileHint.preferredSize.width = 1;
        layerProfileHint.minimumSize.width = 0;
        layerProfileHint.maximumSize.height = 22;
        var layerActions = makeRow(smartLayersPanel, 3);
        var layerAnalyzeButton = compactButton(layerActions, "Scan", 58);
        var layerApplyButton = primaryButton(layerActions, "Clean", 62);
        var layerRestoreButton = compactButton(layerActions, "Undo", 52);
        layerApplyButton.enabled = false;
        layerRestoreButton.enabled = false;
        var layerSummary = smartLayersPanel.add("statictext", undefined, "Scan to preview cleanup.", {multiline:true});
        layerSummary.alignment = ["fill", "top"];
        layerSummary.preferredSize.width = 1;
        layerSummary.minimumSize.width = 0;
        layerSummary.maximumSize.height = 32;
        styleStatusLabel(layerSummary);
        var layerPreview = smartLayersPanel.add("listbox", undefined, ["No layer scan yet."], {multiselect:false});
        layerPreview.alignment = ["fill", "top"];
        setHeight(layerPreview, 96);
        layerPreview.minimumSize.height = 76;
        layerPreview.maximumSize.height = 150;
        // COMP
        var duplicateBody = createScrollableContent(duplicateTab);
        var copyPanel = makePanel(duplicateBody, "True Comp Duplicate");
        var copySource = copyPanel.add("statictext", undefined, "Comp: none selected");
        var copyRow = makeRow(copyPanel, 4);
        copyRow.alignChildren = ["left", "center"];
        var copyLabel = copyRow.add("statictext", undefined, "Copies");
        copyLabel.preferredSize.width = 42;
        var copyMinus = compactButton(copyRow, "−", 30);
        var copyCount = compactField(copyRow, "1", 4, 54);
        var copyPlus = compactButton(copyRow, "+", 30);
        var refreshCopy = compactButton(copyRow, "↻", 30);
        var duplicateButton = primaryButton(copyRow, "Duplicate", 64);
        refreshCopy.helpTip = "Refresh the selected source comp and preview the next versioned duplicate names.";
        duplicateButton.helpTip = "Duplicate only the selected/source composition using the previewed sequential names.";
        var copyPreview = copyPanel.add("statictext", undefined, "Select or open a comp."); copyPreview.alignment = ["fill", "top"]; copyPreview.preferredSize.width = 1; copyPreview.minimumSize.width = 0; styleStatusLabel(copyPreview);

        var relinkPanel = makePanel(duplicateBody, "Relink");
        var relinkRow = addPathRow(relinkPanel, "", "Choose a folder to search for missing files");
        var relinkControls = makeRow(relinkPanel, 5);
        relinkControls.alignChildren = ["left", "center"];
        var relinkDepthLabel = relinkControls.add("statictext", undefined, "Depth");
        relinkDepthLabel.preferredSize.width = 42;
        var relinkDepth = compactField(relinkControls, "10", 4, 48);
        var relinkButton = primaryButton(relinkControls, "Relink", 58);
        relinkButton.helpTip = "Search the workspace, the optional folder above, user folders, and all local drives for exact missing filenames, then relink the best path match.";

        // MOTION
        var motionBody = createScrollableContent(motionTab);
        var motionSplit = motionBody.add("group");
        motionSplit.orientation = "column";
        motionSplit.alignChildren = ["fill", "top"];
        motionSplit.alignment = ["fill", "top"];
        motionSplit.spacing = 6;
        motionSplit.margins = 0;
        var motionKeysTab = motionSplit;
        var motionMarkersTab = motionSplit;

        var motionToolsPanel = makePanel(motionKeysTab, "Motion");
        motionToolsPanel.spacing = 4;
        var motionActionRow1 = makeRow(motionToolsPanel, 4);
        var bounceActionButton = primaryButton(motionActionRow1, "Bounce", 64);
        var springActionButton = compactButton(motionActionRow1, "Spring", 64);
        var popActionButton = compactButton(motionActionRow1, "Pop", 52);
        var motionActionRow2 = makeRow(motionToolsPanel, 4);
        var slideActionButton = compactButton(motionActionRow2, "Slide", 56);
        var blinkActionButton = compactButton(motionActionRow2, "Blink", 56);
        var glitchActionButton = compactButton(motionActionRow2, "Glitch", 60);
        bounceActionButton.helpTip = "Use selected keyframes when available; otherwise create a compact layer bounce.";
        springActionButton.helpTip = "Use selected keyframes when available; otherwise create a spring scale animation.";
        popActionButton.helpTip = "Create a quick scale pop on selected layers.";
        slideActionButton.helpTip = "Create a short slide-and-fade entrance on selected layers.";
        blinkActionButton.helpTip = "Create a short opacity blink on selected layers.";
        glitchActionButton.helpTip = "Create a short position-and-opacity glitch on selected layers.";

        var textActionPanel = makePanel(motionKeysTab, "Text");
        textActionPanel.spacing = 4;
        var textActionRow1 = makeRow(textActionPanel, 4);
        var typewriterActionButton = primaryButton(textActionRow1, "Typewriter", 76);
        var counterActionButton = compactButton(textActionRow1, "Counter", 64);
        var textActionRow2 = makeRow(textActionPanel, 4);
        var underlineActionButton = compactButton(textActionRow2, "Underline", 72);
        var highlightActionButton = compactButton(textActionRow2, "Highlight", 70);
        var clearTextActionButton = compactButton(textActionRow2, "Clear", 48);
        typewriterActionButton.helpTip = "Reveal selected text with a blinking cursor from the current time.";
        counterActionButton.helpTip = "Animate the number already written in selected text from zero to its final value.";
        underlineActionButton.helpTip = "Create an animated underline that follows the selected text bounds.";
        highlightActionButton.helpTip = "Create an animated highlight that follows the selected text bounds.";
        clearTextActionButton.helpTip = "Remove generated Typewriter, Counter, Underline and Highlight items from selected text layers.";

        // Hidden compatibility controls retained for the selected-keyframe backend.
        var motionCompatPanel = makePanel(motionKeysTab, "Compatibility");
        motionCompatPanel.visible = false;
        motionCompatPanel.maximumSize.height = 0;
        var smartTop = makeRow(motionCompatPanel, 0);
        var bounceMode = choiceDropdown(smartTop, ["Bounce", "Elastic", "Overshoot"], 0, 1, false);
        var bounceButton = primaryButton(smartTop, "Apply", 1);
        var bounceDurationControl = miniSlider(motionCompatPanel, "Frames", 3, 60, 12, 0, "fr");
        var bounceStrengthControl = miniSlider(motionCompatPanel, "Power", 1, 100, 18, 0, "%");
        var curveRow = makeRow(motionCompatPanel, 0);
        var curvePreset = compactDropdown(curveRow, [], 0, 1, false);
        var curveButton = compactButton(curveRow, "Apply", 1);

        var textPanel = makePanel(motionMarkersTab, "Text Animation");
        textPanel.visible = false;
        textPanel.maximumSize.height = 0;
        textPanel.spacing = 4;
        var textModeRow = makeRow(textPanel, 4);
        textModeRow.add("statictext", undefined, "Timing");
        var textModeButtons = [], textModeNames = ["IN", "BOTH", "OUT"], textModeIndex;
        for (textModeIndex = 0; textModeIndex < textModeNames.length; textModeIndex++) {
            var textModeButton = compactButton(textModeRow, textModeNames[textModeIndex], textModeNames[textModeIndex] === "BOTH" ? 58 : 48);
            textModeButton._boltMode = textModeNames[textModeIndex];
            textModeButtons.push(textModeButton);
        }
        var textModeSpacer = textModeRow.add("statictext", undefined, "");
        textModeSpacer.alignment = ["fill", "center"];
        var textPresetCount = textModeRow.add("statictext", undefined, "0 presets");
        textPresetCount.preferredSize.width = 62;
        var textTop = makeRow(textPanel, 4);
        var textSearch = textTop.add("edittext", undefined, "");
        textSearch.alignment = ["fill", "center"];
        textSearch.helpTip = "Search marker animation presets by name.";
        var textClearButton = compactButton(textTop, "Clear", 46);
        textClearButton.helpTip = "Clear preset search.";
        var textCategoryButtons = [];
        var textFilterNames = ["All", "Fade", "Move", "Scale", "Type", "Motion", "Style"];
        var textFilterRow = makeRow(textPanel, 3);
        var textFilterRows = [textFilterRow];
        var textFilterIndex;
        for (textFilterIndex = 0; textFilterIndex < textFilterNames.length; textFilterIndex++) {
            if (textFilterIndex === 4) {
                textFilterRow = makeRow(textPanel, 3);
                textFilterRows.push(textFilterRow);
            }
            var textFilterButton = compactButton(textFilterRow, textFilterNames[textFilterIndex]);
            textFilterButton._boltFilter = textFilterNames[textFilterIndex];
            textFilterButton._boltLabel = textFilterNames[textFilterIndex];
            textFilterButton.helpTip = "Show " + textFilterNames[textFilterIndex] + " animation presets.";
            textCategoryButtons.push(textFilterButton);
        }
        var textPresetList = textPanel.add("listbox", undefined, [], {multiselect:false});
        textPresetList.alignment = ["fill", "top"];
        textPresetList.minimumSize.height = 108;
        textPresetList.preferredSize.height = 150;
        textPresetList.maximumSize.height = 250;
        var textSelectedRow = makeRow(textPanel, 6);
        var textSelectedName = textSelectedRow.add("statictext", undefined, "No preset selected");
        bold(textSelectedName, 11);
        textSelectedName.alignment = ["fill", "center"];
        var textPreviewButton = compactButton(textSelectedRow, "Preview", 62);
        textPreviewButton.helpTip = "Temporarily preview the chosen text animation on the selected text layer.";
        var textDescription = textPanel.add("statictext", undefined, "Choose a preset.", {multiline:true});
        textDescription.alignment = ["fill", "top"];
        textDescription.preferredSize.width = 1;
        textDescription.minimumSize.width = 0;
        textDescription.alignment = ["fill", "top"];
        textDescription.maximumSize.height = 28;
        var textDurationControl = miniSlider(textPanel, "Duration", 2, 90, 18, 0, "fr");
        var textActions = makeRow(textPanel, 5);
        var textApplyButton = primaryButton(textActions, "Apply");
        var removeTextButton = compactButton(textActions, "Remove");
        textApplyButton.helpTip = "Create the selected editable marker-driven text animation on selected text layers.";
        removeTextButton.helpTip = "Remove only Bolt-owned marker text animation controls and expressions from selected text layers.";

        // STYLE
        var styleBody = createScrollableContent(styleTab);
        var styleSplit = styleBody.add("group");
        styleSplit.orientation = "column";
        styleSplit.alignChildren = ["fill", "top"];
        styleSplit.alignment = ["fill", "top"];
        styleSplit.spacing = 6;

        var typographyPanel = makePanel(styleSplit, "Typography");
        var fontRow = makeRow(typographyPanel, 4);
        fontRow.add("statictext", undefined, "Font");
        var fontPreset = compactDropdown(fontRow, ["Modern Sans", "Luxury Serif", "Editorial", "Bold Display", "Clean Corporate"], 0, 170, true);
        setHeight(fontPreset, 20);
        var fontApplyButton = primaryButton(fontRow, "Apply", 44);
        fontApplyButton.helpTip = "Apply the selected premium typography preset to selected text layers, using safe installed-font fallbacks.";
        var textVisualRow = makeRow(typographyPanel, 4);
        textVisualRow.add("statictext", undefined, "Effect");
        var textVisualPreset = compactDropdown(textVisualRow, TEXT_VISUAL_PRESETS, 0, 170, true);
        setHeight(textVisualPreset, 20);
        var textVisualApplyButton = primaryButton(textVisualRow, "Apply", 44);
        textVisualApplyButton.helpTip = "Apply the selected text visual treatment to selected text layers after replacing only prior Bolt text-style effects.";

        var colorPanel = makePanel(styleSplit, "Color");
        var gradientRow = makeRow(colorPanel);
        gradientRow.add("statictext", undefined, "Gradient");
        var gradientPreset = compactDropdown(gradientRow, [], 0, 150, true);
        setHeight(gradientPreset, 20);
        var gradientButton = compactButton(gradientRow, "Apply", 44);
        gradientButton.helpTip = "Apply the selected two-color gradient to selected layers, or create a full-comp gradient layer if nothing is selected.";
        var paletteTop = makeRow(colorPanel);
        paletteTop.add("statictext", undefined, "Palette");
        var palettePreset = compactDropdown(paletteTop, [], 0, 150, true);
        setHeight(palettePreset, 20);
        var paletteControlsButton = compactButton(paletteTop, "Create", 62);
        paletteControlsButton.visible = false;
        paletteControlsButton.maximumSize.width = 0;
        paletteControlsButton.helpTip = "Create reusable color controls for the selected palette in the active composition.";
        var paletteSwatches = makeRow(colorPanel, 4);
        var paletteButtons = [], pb;
        for (pb = 0; pb < 5; pb++) {
            var sw = compactButton(paletteSwatches, "#FFFFFF", 58);
            sw.preferredSize.height = 20;
            sw.minimumSize.width = 40;
            sw.maximumSize.width = 10000;
            paletteButtons.push(sw);
        }

        var finishPanel = makePanel(styleSplit, "Finishing");
        var vignetteControl = miniSlider(finishPanel, "Vignette", 1, 100, 35, 0, "%");
        var vignetteAction = makeRow(finishPanel);
        var vignetteButton = compactButton(vignetteAction, "Vignette", 62);
        vignetteButton.helpTip = "Create or replace Bolt's adjustable vignette layer using the selected amount.";
        var glowRow = makeRow(finishPanel);
        glowRow.add("statictext", undefined, "Glow");
        var glowPreset = compactDropdown(glowRow, ["Deep", "Soft", "Neon", "Cinematic", "Hot"], 0, 130, true);
        setHeight(glowPreset, 20);
        var glowButton = primaryButton(glowRow, "Apply", 44);
        glowButton.helpTip = "Apply the selected multi-pass Bolt glow to selected layers without stacking duplicate Bolt glow effects.";
        var glowSizeControl = miniSlider(finishPanel, "Size", 2, 250, 55, 0, "px");
        var glowIntensityControl = miniSlider(finishPanel, "Power", 0.1, 5, 1.2, 1, "");

        // RENDER — compact composition-only workflow.
        var renderBody = createScrollableContent(renderTab);
        renderBody.spacing = 3;

        var queueComp = makePanel(renderBody, "Target");
        var compRow = makeRow(queueComp, 3);
        var renderCompName = compRow.add("statictext", undefined, "Comp: none");
        renderCompName.alignment = ["fill", "center"];
        renderCompName.minimumSize.width = 0;
        renderCompName.maximumSize.width = 10000;
        renderCompName._boltResponsiveFill = true;
        var useSelectedComp = compactButton(compRow, "Use", 34);
        var autoCompButton = compactButton(compRow, "Find", 40);
        useSelectedComp.helpTip = "Use the selected or active composition.";
        autoCompButton.helpTip = "Find the most likely main composition across the project.";

        var compDetails = queueComp.add("statictext", undefined, "");
        compDetails.visible = false;
        compDetails.maximumSize.height = 0;

        var recipePanel = makePanel(renderBody, "Format");
        var formatRow = makeRow(recipePanel, 3);
        var formatTitle = formatRow.add("statictext", undefined, "Format");
        formatTitle.preferredSize.width = 42;
        var renderFormat = choiceDropdown(
            formatRow,
            ["Auto", "H.264", "QuickTime", "PNG", "WAV"],
            1,
            110,
            true
        );
        renderFormat.helpTip = "Auto uses the current Output Module. Other choices use the closest installed matching template.";

        var qualityTitleRow = makeRow(recipePanel, 3);
        var qualityTitle = qualityTitleRow.add("statictext", undefined, "Bitrate");
        qualityTitle.preferredSize.width = 42;
        var renderQuality = choiceDropdown(
            qualityTitleRow,
            ["5 Mbps", "15 Mbps", "40 Mbps"],
            1,
            92,
            false
        );
        renderQuality.helpTip = "Simple H.264 target bitrate. Requires a matching installed H.264 Output Module template.";

        var qualityHint = qualityTitleRow.add("statictext", undefined, "H.264");
        qualityHint.alignment = ["left", "center"];
        var renderRecipeSummary = recipePanel.add("statictext", undefined, "");
        renderRecipeSummary.visible = false;
        renderRecipeSummary.maximumSize.height = 0;

        var outputPanel = makePanel(renderBody, "Output");
        var renderPathRow = addPathRow(outputPanel, "", "Choose render output folder");
        renderPathRow.button.preferredSize.width = 26;
        var renderAutoPath = compactButton(renderPathRow.row, "Auto", 36);
        renderAutoPath.helpTip = "Use the current Bolt workspace Render folder.";

        var nameRow = makeRow(outputPanel, 3);
        var renderNameLabel = nameRow.add("statictext", undefined, "Name");
        renderNameLabel.preferredSize.width = 42;
        var renderName = nameRow.add("edittext", undefined, "");
        renderName.alignment = ["fill", "center"];
        renderName.minimumSize.width = 0;
        renderName._boltResponsiveFill = true;
        setHeight(renderName, 20);

        var queueActionPanel = makePanel(renderBody, "Add To");
        var queueReadyRow = makeRow(queueActionPanel, 4);
        var addQueueButton = primaryButton(queueReadyRow, "Render Queue", 96);
        var ameQueueButton = compactButton(queueReadyRow, "AME", 42);
        addQueueButton.helpTip = "Add the selected or active composition to the After Effects Render Queue.";
        ameQueueButton.helpTip = "Add only the new queue item to Adobe Media Encoder.";

        var renderVerification = queueActionPanel.add("statictext", undefined, "");
        renderVerification.visible = false;
        renderVerification.maximumSize.height = 0;
        var progressRow = makeRow(queueActionPanel, 0);
        progressRow.visible = false;
        progressRow.maximumSize.height = 0;
        var progressBar = progressRow.add("progressbar", undefined, 0, 100);
        var progressLabel = progressRow.add("statictext", undefined, "Ready");

        // Hidden compatibility controls for older backend helpers. They are never
        // shown and cannot change the composition-only Render workflow.
        var renderCompat = renderBody.add("group");
        renderCompat.orientation = "column";
        renderCompat.visible = false;
        renderCompat.maximumSize.height = 0;

        var renderTargetRow = makeRow(renderCompat, 0);
        var renderTarget = choiceDropdown(renderTargetRow, ["Composition"], 0, 1, false);

        var layerBatchPanel = makePanel(renderCompat, "Selected Layers");
        var layerRangeRow = makeRow(layerBatchPanel, 0);
        var layerRange = choiceDropdown(layerRangeRow, ["Layer In / Out"], 0, 1, false);
        var layerPreviewHeader = makeRow(layerBatchPanel, 0);
        var layerRenderSummary = layerPreviewHeader.add("statictext", undefined, "");
        var layerPreviewToggleButton = compactButton(layerPreviewHeader, "Preview", 1);
        var refreshLayerRenderButton = compactButton(layerPreviewHeader, "Refresh", 1);
        var cleanupLayerHelpersButton = compactButton(layerPreviewHeader, "Clean", 1);
        var layerRenderPreview = layerBatchPanel.add("listbox", undefined, []);
        var layerPreviewExpanded = false;

        var templateActionRow = makeRow(renderCompat, 0);
        var refreshTemplatesButton = compactButton(templateActionRow, "Refresh", 1);
        var renderAdvancedButton = compactButton(templateActionRow, "Templates", 1);

        var renderAdvancedPanel = makePanel(renderCompat, "Templates");
        var outputLabel = renderAdvancedPanel.add("statictext", undefined, "");
        var outputTemplate = compactDropdown(renderAdvancedPanel, [], 0, 1, false);
        var settingsLabel = renderAdvancedPanel.add("statictext", undefined, "");
        var renderSettings = compactDropdown(renderAdvancedPanel, [], 0, 1, false);

        var versionRow = makeRow(renderCompat, 0);
        var renderUseVersion = versionRow.add("checkbox", undefined, "Auto version");
        renderUseVersion.value = false;
        var renderVersionStart = compactField(versionRow, "1", 2, 1);
        var renderVersionDigits = compactField(versionRow, "2", 2, 1);

        var renderOptionRow = makeRow(renderCompat, 0);
        var renderWorkArea = renderOptionRow.add("checkbox", undefined, "Work area");
        renderWorkArea.value = false;
        var saveThumbnail = renderOptionRow.add("checkbox", undefined, "Thumbnail");
        saveThumbnail.value = false;
        var notificationSound = renderOptionRow.add("checkbox", undefined, "Notify");
        notificationSound.value = false;

        // TOOLS
        var toolsBody = createScrollableContent(toolsTab);

        var anchorPanel = makePanel(toolsBody, "Anchor Point");
        anchorPanel.alignChildren = ["left", "top"];
        var anchorButtons = [], ay, ax;
        var anchorLabels = [["↖","↑","↗"],["←","●","→"],["↙","↓","↘"]];
        var anchorTips = [["Top Left","Top Center","Top Right"],["Middle Left","Center","Middle Right"],["Bottom Left","Bottom Center","Bottom Right"]];
        for (ay = 0; ay < 3; ay++) {
            var ar = anchorPanel.add("group"); ar.orientation = "row"; ar.spacing = 4;
            for (ax = 0; ax < 3; ax++) {
                var ab = ar.add("button", undefined, anchorLabels[ay][ax]);
                ab.preferredSize = [30, 22];
                ab.minimumSize = [30, 22];
                ab.maximumSize = [30, 22];
                ab.alignment = ["left", "center"];
                ab.helpTip = "Move anchor to " + anchorTips[ay][ax] + " without moving the layer";
                ab._boltX = ax / 2;
                ab._boltY = ay / 2;
                anchorButtons.push(ab);
            }
        }


        var alignPanel = makePanel(toolsBody, "Align");
        var alignTargetRow = makeRow(alignPanel, 4);
        var alignTargetLabel = alignTargetRow.add("statictext", undefined, "To");
        alignTargetLabel.preferredSize.width = 22;
        var alignTarget = compactDropdown(alignTargetRow, ["Comp", "Selection", "Top Layer"], 0, 108, false);
        alignTarget.helpTip = "Align visual layer bounds to the composition, the selected-layer bounds, or the topmost selected layer.";

        var alignRow = makeRow(alignPanel, 3);
        var alignLeftBtn = compactButton(alignRow, "L", 30);
        var alignHCenterBtn = compactButton(alignRow, "HC", 34);
        var alignRightBtn = compactButton(alignRow, "R", 30);
        var alignTopBtn = compactButton(alignRow, "T", 30);
        var alignVCenterBtn = compactButton(alignRow, "VC", 34);
        var alignBottomBtn = compactButton(alignRow, "B", 30);
        alignLeftBtn.helpTip = "Align visual left edges.";
        alignHCenterBtn.helpTip = "Align visual horizontal centers.";
        alignRightBtn.helpTip = "Align visual right edges.";
        alignTopBtn.helpTip = "Align visual top edges.";
        alignVCenterBtn.helpTip = "Align visual vertical centers.";
        alignBottomBtn.helpTip = "Align visual bottom edges.";

        var distributeRow = makeRow(alignPanel, 3);
        var distributeXBtn = compactButton(distributeRow, "DX", 40);
        var distributeYBtn = compactButton(distributeRow, "DY", 40);
        var distributeGapXBtn = compactButton(distributeRow, "GX", 40);
        var distributeGapYBtn = compactButton(distributeRow, "GY", 40);
        distributeXBtn.helpTip = "Distribute horizontal centers evenly. First and last layers stay fixed.";
        distributeYBtn.helpTip = "Distribute vertical centers evenly. First and last layers stay fixed.";
        distributeGapXBtn.helpTip = "Create equal horizontal gaps. First and last layers stay fixed.";
        distributeGapYBtn.helpTip = "Create equal vertical gaps. First and last layers stay fixed.";

        var layerPanel = makePanel(toolsBody, "Layer Tools");
        var layerRow1 = makeRow(layerPanel, 4);
        var centerLayerBtn = compactButton(layerRow1, "Center");
        var nullBtn = compactButton(layerRow1, "Null");
        var layerRow2 = makeRow(layerPanel, 4);
        var solidBtn = compactButton(layerRow2, "Solid");
        var adjustmentBtn = compactButton(layerRow2, "Adjustment");
        centerLayerBtn.helpTip = "Center selected layers in the active comp while preserving separated Position dimensions.";
        nullBtn.helpTip = "Create a centered null layer at the current time.";
        solidBtn.helpTip = "Create a full-comp solid layer using After Effects' color picker.";
        adjustmentBtn.helpTip = "Create a full-comp adjustment layer at the current time.";
        var layerRow3 = makeRow(layerPanel, 4);
        var precompBtn = compactButton(layerRow3, "Precomp");
        var easeBtn = compactButton(layerRow3, "Easy Ease");
        var layerRow4 = makeRow(layerPanel, 4);
        var trimInBtn = compactButton(layerRow4, "Trim In");
        var trimOutBtn = compactButton(layerRow4, "Trim Out");
        precompBtn.helpTip = "Precompose selected layers into a named composition without changing unselected layers.";
        trimInBtn.helpTip = "Trim selected unlocked layers' in-points to the current time without creating zero-length layers.";
        trimOutBtn.helpTip = "Trim selected unlocked layers' out-points to the current time without creating zero-length layers.";
        easeBtn.helpTip = "Apply smooth temporal ease only to selected keyframes on selected properties.";
        var fadeControl = miniSlider(layerPanel, "Fade", 1, 60, 10, 0, "fr");
        var fadeRow = makeRow(layerPanel);
        var fadeInBtn = compactButton(fadeRow, "Fade In");
        var fadeOutBtn = compactButton(fadeRow, "Fade Out");
        var fadeBothBtn = compactButton(fadeRow, "Both");
        fadeInBtn.helpTip = "Add an opacity fade-in using the selected frame length, clamped to each layer's duration.";
        fadeOutBtn.helpTip = "Add an opacity fade-out using the selected frame length, clamped to each layer's duration.";
        fadeBothBtn.helpTip = "Add balanced fade-in and fade-out keys. Short layers use a centered 0-100-0 fade instead of losing the fade-in.";

        var utilityPanel = makePanel(toolsBody, "Utility");
        var utilityRow1 = makeRow(utilityPanel, 4);
        var snapshotButton = compactButton(utilityRow1, "Snapshot");
        var pasteButton = primaryButton(utilityRow1, "Paste");
        var purgeButton = compactButton(utilityRow1, "Purge");
        centerLayerBtn.alignment = ["fill", "center"];
        nullBtn.alignment = ["fill", "center"];
        solidBtn.alignment = ["fill", "center"];
        adjustmentBtn.alignment = ["fill", "center"];
        precompBtn.alignment = ["fill", "center"];
        easeBtn.alignment = ["fill", "center"];
        trimInBtn.alignment = ["fill", "center"];
        trimOutBtn.alignment = ["fill", "center"];
        fadeInBtn.alignment = ["fill", "center"];
        fadeOutBtn.alignment = ["fill", "center"];
        fadeBothBtn.alignment = ["fill", "center"];
        snapshotButton.alignment = ["fill", "center"];
        pasteButton.alignment = ["fill", "center"];
        purgeButton.alignment = ["fill", "center"];
        snapshotButton.helpTip = "Save the current comp frame as PNG in Resources and import it.";
        pasteButton.helpTip = "Copy saved files or image pixels, then paste them into Resources and the Project panel.";
        purgeButton.helpTip = "Purge After Effects memory, disk, undo and snapshot caches after confirmation.";

        // Flat workspaces: the main tabs above are the only navigation level.
        // Every related section remains in its workspace and scrolls naturally.
        setSectionVisible(copyPanel, true);
        setSectionVisible(relinkPanel, true);
        setSectionVisible(motionToolsPanel, true);
        setSectionVisible(textPanel, false);
        setSectionVisible(typographyPanel, true);
        setSectionVisible(colorPanel, true);
        setSectionVisible(finishPanel, true);
        setSectionVisible(anchorPanel, true);
        setSectionVisible(layerPanel, true);
        setSectionVisible(utilityPanel, false);
        setSectionVisible(queueComp, true);
        setSectionVisible(recipePanel, true);
        setSectionVisible(outputPanel, true);
        setSectionVisible(queueActionPanel, true);
        setSectionVisible(renderAdvancedPanel, false);
        setSectionVisible(layerBatchPanel, false);

        // Registered rows reflow only below their own safe-width breakpoint.
        // This uses native ScriptUI layout rather than recursive scaling.
        registerResponsiveRow(projectPrimaryRow, 235);
        registerResponsiveRow(projectQuickToolsRow, 220);
        registerResponsiveRow(projectUtilityRow, 180);
        registerResponsiveRow(workspaceRow.row, 235);
        registerResponsiveRow(heroRow, 235);
        registerResponsiveRow(motionActionRow1, 250);
        registerResponsiveRow(motionActionRow2, 250);
        registerResponsiveRow(textActionRow1, 220);
        registerResponsiveRow(textActionRow2, 270);
        registerResponsiveRow(opt1, 360);
        registerResponsiveRow(opt2, 360);
        registerResponsiveRow(opt3, 390);
        registerResponsiveRow(layerScopeRow, 250);
        registerResponsiveRow(layerProfileRow, 220);
        registerResponsiveRow(layerActions, 230);
        registerResponsiveRow(copyRow, 280);
        registerResponsiveRow(relinkRow.row, 200);
        registerResponsiveRow(relinkControls, 260);
        registerResponsiveRow(smartTop, 250);
        registerResponsiveRow(curveRow, 220);
        registerResponsiveRow(textModeRow, 265);
        registerResponsiveRow(textTop, 160);
        for (textFilterIndex = 0; textFilterIndex < textFilterRows.length; textFilterIndex++) {
            registerResponsiveRow(textFilterRows[textFilterIndex], 230);
        }
        registerResponsiveRow(textSelectedRow, 220);
        registerResponsiveRow(textActions, 170);
        registerResponsiveRow(fontRow, 240);
        registerResponsiveRow(textVisualRow, 240);
        registerResponsiveRow(gradientRow, 240);
        registerResponsiveRow(paletteTop, 240);
        registerResponsiveRow(paletteSwatches, 265);
        registerResponsiveRow(vignetteAction, 180);
        registerResponsiveRow(glowRow, 240);
        registerResponsiveRow(compRow, 250);
        registerResponsiveRow(renderTargetRow, 210);
        registerResponsiveRow(layerRangeRow, 210);
        registerResponsiveRow(layerPreviewHeader, 250);
        registerResponsiveRow(formatRow, 230);
        registerResponsiveRow(qualityTitleRow, 260);
        registerResponsiveRow(templateActionRow, 220);
        registerResponsiveRow(renderPathRow.row, 340);
        registerResponsiveRow(nameRow, 160);
        registerResponsiveRow(versionRow, 360);
        registerResponsiveRow(renderOptionRow, 320);
        registerResponsiveRow(progressRow, 170);
        registerResponsiveRow(alignTargetRow, 180);
        registerResponsiveRow(layerRow1, 170);
        registerResponsiveRow(layerRow2, 170);
        registerResponsiveRow(layerRow3, 170);
        registerResponsiveRow(layerRow4, 170);
        registerResponsiveRow(fadeRow, 220);
        registerResponsiveRow(utilityRow1, 240);

        // Footer
        var statusRow = panel.add("group");
        statusRow.orientation = "row";
        statusRow.alignChildren = ["fill", "center"];
        statusRow.alignment = ["fill", "bottom"];
        statusRow.margins = [3, 1, 3, 0];
        setHeight(statusRow, 20);
        var statusLabel = statusRow.add("statictext", undefined, "Ready");
        statusLabel.alignment = ["fill", "center"];
        statusLabel.helpTip = "Ready";
        styleStatusLabel(statusLabel);

        state.ui = {
            panel:panel,
            clockLabel:clockLabel,
            projectStructureList:projectStructureList,projectStructureStatus:projectStructureStatus,
            workspacePath:workspaceRow.field,heroLabel:heroLabel,collectMedia:collectMedia,organizeResources:organizeResources,archiveUnusedResources:archiveUnusedResources,removeUnusedItems:removeUnusedItems,cleanProjectButton:cleanProjectButton,moveRenderOutputs:moveRenderOutputs,organizeProjectPanel:organizeProjectPanelOption,keepScenesAtRoot:keepScenesAtRoot,projectPreview:projectPreview,
            layerScope:layerScope,layerProfile:layerProfile,layerSummary:layerSummary,layerPreview:layerPreview,layerApplyButton:layerApplyButton,layerRestoreButton:layerRestoreButton,
            relinkPath:relinkRow.field,relinkDepth:relinkDepth,copyCount:copyCount,copySource:copySource,copyPreview:copyPreview,
            renderCompName:renderCompName,compDetails:compDetails,renderPath:renderPathRow.field,renderName:renderName,renderUseVersion:renderUseVersion,renderVersionStart:renderVersionStart,renderVersionDigits:renderVersionDigits,
            renderTarget:renderTarget,layerRange:layerRange,layerBatchPanel:layerBatchPanel,layerRenderPreview:layerRenderPreview,layerRenderSummary:layerRenderSummary,
            renderFormat:renderFormat,renderQuality:renderQuality,renderRecipeSummary:renderRecipeSummary,outputTemplate:outputTemplate,renderSettings:renderSettings,renderAdvancedButton:renderAdvancedButton,renderAdvancedPanel:renderAdvancedPanel,renderVerification:renderVerification,renderWorkArea:renderWorkArea,saveThumbnail:saveThumbnail,notificationSound:notificationSound,addQueueButton:addQueueButton,ameQueueButton:ameQueueButton,
            progressLabel:progressLabel,progressBar:progressBar,statusLabel:statusLabel,quickFrames:fadeControl.field,
            textModeButtons:textModeButtons,textDuration:textDurationControl.field,textCategoryButtons:textCategoryButtons,textSearch:textSearch,textPresetList:textPresetList,textPresetCount:textPresetCount,textDescription:textDescription,textSelectedName:textSelectedName,textPreviewButton:textPreviewButton,textApplyButton:textApplyButton,
            bounceMode:bounceMode,bounceDuration:bounceDurationControl.field,bounceStrength:bounceStrengthControl.field,curvePreset:curvePreset,
            gradientPreset:gradientPreset,palettePreset:palettePreset,paletteButtons:paletteButtons,vignetteAmount:vignetteControl.field,glowPreset:glowPreset,glowSize:glowSizeControl.field,glowIntensity:glowIntensityControl.field,
            fontPreset:fontPreset,textVisualPreset:textVisualPreset
        };

        var pageBodies = {
            Project: organizeBody,
            Comp: duplicateBody,
            Motion: motionBody,
            Style: styleBody,
            Queue: renderBody,
            Tools: toolsBody
        };

        function refreshProjectStructureList() {
            boltRefreshProjectStructureUI();
        }

        function markProjectPlanStale() {
            projectPreview.removeAll();
            projectPreview.add("item", "Options changed. Click Analyze to refresh the plan.");
        }

        function updateProjectActionPreview(projectAudit) {
            projectPreview.removeAll();
            var lineCount = 0, unusedReport, index;
            function addPlan(textValue) { projectPreview.add("item", textValue); lineCount++; }
            addPlan("PROJECT  |  Save the active AEP inside Project");
            addPlan("FILES  |  Collect and relink every imported file and proxy directly into Resources");
            addPlan("LOOSE  |  Move unimported loose files into Resources/Unused");
            addPlan("ROOT  |  Keep only Project, Render and Resources at the workspace root");
            addPlan("PANEL  |  Keep hero + named scenes at root; sort other Project items into the five core folders");
            addPlan("QUEUE  |  Redirect existing queued outputs to Render");
            projectPreview.helpTip = lineCount + " planned line(s). External sources are copied; workspace files move only after verification.";
        }

        function controlWidth(control, fallback) {
            var value = 0;
            try { value = Number(control.size.width) || 0; } catch (ignoreControlWidth) {}
            if (!value) { try { value = Number(control.preferredSize.width) || 0; } catch (ignorePreferredWidth) {} }
            return value > 0 ? value : fallback;
        }

        function controlHeight(control, fallback) {
            var value = 0;
            try { value = Number(control.size.height) || 0; } catch (ignoreControlHeight) {}
            if (!value) { try { value = Number(control.preferredSize.height) || 0; } catch (ignorePreferredHeight) {} }
            return value > 0 ? value : fallback;
        }


        function showPage(name) {
            if (!pages[name]) { name = "Project"; }
            var index, pageName;
            activePageName = name;
            for (index = 0; index < navOrder.length; index++) {
                pageName = navOrder[index];
                pages[pageName].visible = pageName === name;
                pages[pageName].enabled = pageName === name;
            }
            pages[name].visible = true;
            pages[name].enabled = true;
            pageBodies[name].visible = true;
            pageBodies[name].enabled = true;
            updateNavigationState(controlWidth(panel, 460));
            saveSetting("last_page_v0149_final", name);
            if (name === "Queue") { refreshRenderDetails(false); }
            else if (name === "Comp") { updateDuplicatePreview(); }
            else if (name === "Project") { updateHeroLabel(); updateSmartLayerSummary(); refreshProjectStructureList(); }
            updateClockLabel();
            if (statusLabel) {
                statusLabel.text = "Ready";
                statusLabel.helpTip = "Ready";
                setTextColor(statusLabel, [0.68, 0.70, 0.73]);
            }
            try { applyResponsiveLayout(); } catch (ignorePageLayout) {}
        }
        state.ui.showPage = showPage;

    function applyResponsiveLayout() {
                if (responsiveBusy) { return; }
                responsiveBusy = true;
    
                try {
                    var panelWidth = Math.max(300, controlWidth(panel, COMPACT_PANEL_WIDTH));
                    var contentWidth = Math.max(280, panelWidth - 20);
    
                    pageStack.visible = true;
                    pageStack.enabled = true;
                    pages[activePageName].visible = true;
                    pages[activePageName].enabled = true;
                    pageBodies[activePageName].visible = true;
                    pageBodies[activePageName].enabled = true;
    
                    updateResponsiveRows(contentWidth);
                    updateNavigationState(panelWidth - 4);
                    clockLabel.visible = false;
    
                    motionSplit.orientation = "column";
                    styleSplit.orientation = "column";
                    motionSplit.alignChildren = ["fill", "top"];
                    styleSplit.alignChildren = ["fill", "top"];
    
                    analyzeButton.text = "Analyze";
                    organizeButton.text = "Organize";
                    addQueueButton.text = "Render Queue";
                    ameQueueButton.text = "AME";
    
                    structureLine.visible = false;
                    qualityHint.visible = /h\.?264/i.test(selectedFormatText());
                    progressLabel.visible = false;
                    compDetails.visible = false;
                    compDetails.maximumSize.height = 0;
                    renderRecipeSummary.visible = false;
                    renderRecipeSummary.maximumSize.height = 0;
                    renderVerification.visible = false;
                    renderVerification.maximumSize.height = 0;
    
                    projectPlanPanel.visible = false;
                    projectPlanPanel.maximumSize.height = 0;
                    projectAdvancedHost.visible = false;
                    projectAdvancedHost.maximumSize.height = 0;
                    renderAdvancedPanel.visible = false;
                    renderAdvancedPanel.maximumSize.height = 0;
                    layerBatchPanel.visible = false;
                    layerBatchPanel.maximumSize.height = 0;
    
                    try {
                        panel.layout.layout(true);
                        panel.layout.resize();
                        workspaceShell.layout.layout(true);
                        pageStack.layout.layout(true);
                        pages[activePageName].layout.layout(true);
                        pageBodies[activePageName].layout.layout(true);
                    } catch (ignoreNativeLayout) {}
    
                    var actualWidth = contentWidth;
                    updateResponsiveRows(actualWidth);
    
                    try {
                        panel.layout.layout(true);
                        panel.layout.resize();
                    } catch (ignoreSecondNativeLayout) {}
    
                    refreshScrollAreas();
                } finally {
                    responsiveBusy = false;
                }
            }
        state.ui.applyResponsiveLayout = applyResponsiveLayout;
        state.ui.refreshScrollAreas = refreshScrollAreas;

        var layerProfileBusy = false;
        function invalidateLayerAudit() {
            state.layerAnalysis = null;
            if (state.ui && state.ui.layerPreview) {
                state.ui.layerPreview.removeAll();
                state.ui.layerPreview.add("item", "Options changed. Click Scan to refresh exact layer changes.");
            }
            if (state.ui && state.ui.layerApplyButton) { state.ui.layerApplyButton.enabled = false; }
            updateSmartLayerSummary();
        }
        function refreshLayerControls() {
            var profileName = layerProfile.selection ? layerProfile.selection.text : "Deep";
            if (profileName === "Safe") {
                layerProfileHint.text = "Safe: high-confidence names and labels only.";
                layerApplyButton.text = "Safe Clean";
            } else {
                layerProfileHint.text = "Contextual names, safe trims and technical-layer cleanup.";
                layerApplyButton.text = "Deep";
            }
            try { smartLayersPanel.layout.layout(true); } catch (ignoreLayerControlLayout) {}
            refreshScrollAreas();
        }
        function applyLayerProfile(profileName) {
            if (profileName === "Safe Clean") { profileName = "Safe"; }
            if (profileName !== "Deep") { profileName = "Safe"; }
            layerProfileBusy = true;
            try {
                dropdownSelectByText(layerProfile, profileName);
                saveSetting("layer_profile_v0149", profileName);
                invalidateLayerAudit();
            } finally { layerProfileBusy = false; }
            refreshLayerControls();
        }

    function refreshRenderTargetMode() {
                state.renderTargetValue = "Composition";
                try { renderTarget._boltSelect(0, false); } catch (ignoreTargetSelect) {}
                layerBatchPanel.visible = false;
                layerBatchPanel.maximumSize.height = 0;
                renderWorkArea.enabled = false;
                useSelectedComp.enabled = true;
                autoCompButton.enabled = true;
                addQueueButton.text = "Render Queue";
                ameQueueButton.text = "AME";
                refreshRenderDetails(false);
            }

        (function () {
            var index;
            for (index = 0; index < navOrder.length; index++) {
                (function (pageName) {
                    navButtons[pageName]._boltBind(function () { showPage(pageName); });
                }(navOrder[index]));
            }
        }());
        infoButton.onClick = showInfoDialog;
        autoWorkspace.onClick = updateAutomaticPaths;
        setHeroButton.onClick = function () { try { lockHeroComp(); } catch (error) { showError(error); } };
        clearHeroButton.onClick = function () {
            state.lockedHeroComp = null;
            var detectedHero = resolveHeroComp();
            updateHeroLabel();
            setStatus(detectedHero ? ("Main composition found: " + detectedHero.name) : "No main composition found", detectedHero ? "ok" : "warning");
        };
        analyzeButton.onClick = function () {
            try {
                // Analyze is the non-destructive one-click project setup check.
                // It refreshes Bolt's inferred workspace and hero composition,
                // but never creates folders, moves media or changes the project.
                updateAutomaticPaths();

                var detectedHero = detectMainComp();
                state.lockedHeroComp = detectedHero || null;
                updateHeroLabel();

                var projectAudit = analyzeProject();
                updateProjectActionPreview(projectAudit);
                refreshProjectStructureList();

                projectPlanPanel.visible = false;
                projectPlanPanel.maximumSize.height = 0;
                projectPlanButton.text = "Change Plan";

                var detectedRoot = getWorkspaceRoot();
                var contextParts = [];
                if (detectedRoot) { contextParts.push("workspace detected"); }
                if (detectedHero) { contextParts.push("hero: " + detectedHero.name); }
                contextParts.push(projectAudit.comps + " comps");
                contextParts.push(projectAudit.missing + " missing");

                setStatus(
                    "Analyze complete • " + contextParts.join(" • "),
                    projectAudit.missing ? "warning" : "ok"
                );
                applyResponsiveLayout();
            } catch (error) { showError(error); }
        };
        organizeButton.onClick = function () { try { organizeProject(); markProjectPlanStale(); refreshProjectStructureList(); } catch (error) { showError(error); } };
        cleanProjectButton.onClick = function () { try { runMinimalProjectClean(); } catch (error) { showError(error); } };
        projectPlanButton.onClick = function () {
            var show = !projectPlanPanel.visible;
            projectPlanPanel.visible = show;
            projectPlanPanel.maximumSize.height = show ? 10000 : 0;
            projectPlanButton.text = show ? "Hide Plan" : "Change Plan";
            try { applyResponsiveLayout(); } catch (ignorePlanLayout) {}
        };
        projectAdvancedButton.onClick = function () {
            var show = !projectAdvancedHost.visible;
            projectAdvancedHost.visible = show;
            projectAdvancedHost.maximumSize.height = show ? 10000 : 0;
            projectAdvancedButton.text = show ? "Hide Options" : "Options";
            try { applyResponsiveLayout(); } catch (ignoreAdvancedProjectLayout) {}
        };
        collectMedia.onClick = function () { saveSetting("collect_media_v0140_minimal", collectMedia.value ? "true" : "false"); markProjectPlanStale(); };
        organizeResources.onClick = function () { saveSetting("organize_resources_v0140_minimal", organizeResources.value ? "true" : "false"); markProjectPlanStale(); };
        archiveUnusedResources.onClick = function () { saveSetting("archive_unused_resources_v0140_minimal", archiveUnusedResources.value ? "true" : "false"); markProjectPlanStale(); };
        organizeProjectPanelOption.onClick = markProjectPlanStale;
        moveRenderOutputs.onClick = function () { saveSetting("move_render_outputs_v0140_minimal", moveRenderOutputs.value ? "true" : "false"); markProjectPlanStale(); };
        removeUnusedItems.onClick = function () { saveSetting("remove_unused_items_v0140_minimal", removeUnusedItems.value ? "true" : "false"); markProjectPlanStale(); };
        keepScenesAtRoot.onClick = function () { keepScenesAtRoot.value = true; };
        layerAnalyzeButton.onClick = function () { try { smartLayerAnalyze(false); } catch (error) { showError(error); } };
        layerApplyButton.onClick = function () { try { applySmartLayerManagement(); } catch (error) { showError(error); } };
        layerRestoreButton.onClick = function () { try { restoreSmartLayerManagement(); } catch (error) { showError(error); } };
        layerProfile.onChange = function () {
            if (layerProfileBusy || !layerProfile.selection) { return; }
            applyLayerProfile(layerProfile.selection.text);
        };
        layerScope.onChange = function () { invalidateLayerAudit(); };
        relinkButton.onClick = function () { try { relinkMissingFiles(); } catch (error) { showError(error); } };
        copyMinus.onClick = function () {
            copyCount.text = String(Math.max(1, Math.round(clampNumber(copyCount.text, 1, 999, 1)) - 1));
            updateDuplicatePreview();
        };
        copyPlus.onClick = function () {
            copyCount.text = String(Math.min(999, Math.round(clampNumber(copyCount.text, 1, 999, 1)) + 1));
            updateDuplicatePreview();
        };
        refreshCopy.onClick = updateDuplicatePreview;
        copyCount.onChange = updateDuplicatePreview;
        duplicateButton.onClick = function () { try { duplicateSelectedComp(); } catch (error) { showError(error); } };
        useSelectedComp.onClick = function () { try { lockRenderComp(); } catch (error) { showError(error); } };
        autoCompButton.onClick = function () {
            state.lockedRenderComp = null;
            try {
                refreshRenderDetails(false);
                var detectedRenderComp = resolveAvailableComp(true);
                setStatus(detectedRenderComp ? ("Render target found: " + detectedRenderComp.name) : "No render composition found", detectedRenderComp ? "ok" : "warning");
            } catch (error) { showError(error); }
        };
        renderTarget.onChange = function () {
            state.renderTargetValue = "Composition";
        };
        layerRange.onChange = function () {
            if (!layerRange.selection) { return; }
            state.layerRangeValue = layerRange.selection.text;
            saveSetting("last_layer_range_v0140", state.layerRangeValue);
            renderVerification.text = "Layer range changed • refresh or queue to verify exact durations.";
            updateLayerRenderPreview();
        };
        layerPreviewToggleButton.onClick = function () {
            layerPreviewExpanded = !layerPreviewExpanded;
            layerRenderPreview.visible = layerPreviewExpanded;
            layerRenderPreview.maximumSize.height = layerPreviewExpanded ? 110 : 0;
            layerPreviewToggleButton.text = layerPreviewExpanded ? "Hide" : "Preview";
            try { applyResponsiveLayout(); } catch (ignoreLayerPreviewLayout) {}
        };
        refreshLayerRenderButton.onClick = function () { try { updateLayerRenderPreview(); setStatus("Selected layer export preview refreshed", "ok"); } catch (error) { showError(error); } };
        cleanupLayerHelpersButton.onClick = function () { try { cleanupLayerRenderHelpers(); updateLayerRenderPreview(); } catch (error) { showError(error); } };
        renderAutoPath.onClick = updateAutomaticPaths;
        refreshTemplatesButton.onClick = function () { try { refreshRenderDetails(true); syncRenderRecipeControls(); setStatus("After Effects templates refreshed", "ok"); } catch (error) { showError(error); } };
        renderWorkArea.onClick = function () { refreshRenderDetails(false); };
        renderFormat.onChange = function () {
            if (!renderFormat.selection) { return; }
            state.renderFormatValue = renderFormat.selection.text;
            saveSetting("last_render_format_v0140", state.renderFormatValue);
            renderQuality.enabled = /h\.?264/i.test(state.renderFormatValue);
            qualityHint.visible = renderQuality.enabled;
            try { applyResponsiveLayout(); } catch (ignoreFormatLayout) {}
        };
        renderQuality.onChange = function () {
            if (!renderQuality.selection) { return; }
            state.renderQualityValue = renderQuality.selection.text;
            saveSetting("last_render_quality_v0140", state.renderQualityValue);
        };
        renderAdvancedButton.onClick = function () { setRenderAdvancedVisible(!state.renderAdvancedVisible); };
        outputTemplate.onChange = function () {
            if (state.renderSyncBusy) { return; }
            if (outputTemplate.selection) { saveSetting("last_output_template", outputTemplate.selection.text); }
            renderVerification.text = "Template changed • run verification before queueing.";
            updateRenderRecipeSummary();
        };
        renderSettings.onChange = function () {
            if (state.renderSyncBusy) { return; }
            renderVerification.text = "Template changed • run verification before queueing.";
            updateRenderRecipeSummary();
        };
        addQueueButton.onClick = function () {
            try { addSimpleRenderDestination(false); }
            catch (error) {
                renderVerification.text = "Could not add to Render Queue.";
                renderVerification.helpTip = error && error.message ? error.message : safeString(error);
                showError(error);
            }
        };
        ameQueueButton.onClick = function () {
            try { addSimpleRenderDestination(true); }
            catch (error) {
                renderVerification.text = "Could not add to Adobe Media Encoder.";
                renderVerification.helpTip = error && error.message ? error.message : safeString(error);
                showError(error);
            }
        };

        (function () {
            var i;
            for (i = 0; i < textCategoryButtons.length; i++) {
                textCategoryButtons[i].onClick = function () {
                    state.textCategoryFilter = this._boltFilter;
                    refreshTextPresetBrowser();
                };
            }
            for (i = 0; i < textModeButtons.length; i++) {
                textModeButtons[i].onClick = function () {
                    state.textModeValue = this._boltMode;
                    updateTextModeButtons();
                };
            }
        }());
        textSearch.onChanging = function () { refreshTextPresetBrowser(); };
        textClearButton.onClick = function () { textSearch.text = ""; refreshTextPresetBrowser(); };
        textPresetList.onChange = function () { syncTextPresetSelectionFromList(); };
        textPresetList.onDoubleClick = function () { syncTextPresetSelectionFromList(); try { applyMarkerAnimationByIndex(state.textSelectedIndex); } catch (error) { showError(error); } };
        textPreviewButton.onClick = function () { try { previewTextPresetByIndex(state.textSelectedIndex); } catch (error) { showError(error); } };
        textApplyButton.onClick = function () { try { applyMarkerAnimationByIndex(state.textSelectedIndex); } catch (error) { showError(error); } };
        removeTextButton.onClick = function () { try { removeBoltMarkerAnimation(); } catch (error) { showError(error); } };
        bounceActionButton.onClick = function () { try { boltRunBounceAction("Bounce"); } catch (error) { showError(error); } };
        springActionButton.onClick = function () { try { boltRunBounceAction("Spring"); } catch (error) { showError(error); } };
        popActionButton.onClick = function () { try { boltApplyScaleAction("Pop"); } catch (error) { showError(error); } };
        slideActionButton.onClick = function () { try { boltApplyPositionAction("Slide"); } catch (error) { showError(error); } };
        blinkActionButton.onClick = function () { try { boltApplyOpacityAction("Blink"); } catch (error) { showError(error); } };
        glitchActionButton.onClick = function () { try { boltApplyPositionAction("Glitch"); } catch (error) { showError(error); } };
        typewriterActionButton.onClick = function () { try { boltApplyTypewriter(); } catch (error) { showError(error); } };
        counterActionButton.onClick = function () { try { boltApplyCounter(); } catch (error) { showError(error); } };
        underlineActionButton.onClick = function () { try { boltCreateTextHelper("Underline"); } catch (error) { showError(error); } };
        highlightActionButton.onClick = function () { try { boltCreateTextHelper("Highlight"); } catch (error) { showError(error); } };
        clearTextActionButton.onClick = function () { try { boltClearTextActions(); } catch (error) { showError(error); } };
        bounceButton.onClick = function () { try { applySmartBounce(); } catch (error) { showError(error); } };
        curveButton.onClick = function () { try { applyCurvePreset(); } catch (error) { showError(error); } };
        gradientButton.onClick = function () { try { applyGradientPreset(); } catch (error) { showError(error); } };
        palettePreset.onChange = function () { updatePaletteButtons(); };
        paletteControlsButton.onClick = function () { try { createPaletteControls(); } catch (error) { showError(error); } };
        (function () {
            var i;
            for (i = 0; i < paletteButtons.length; i++) {
                (function (index) {
                    paletteButtons[index].onClick = function () {
                        try { var p = COLOR_PALETTES[palettePreset.selection.index]; applyPaletteColor(p.colors[index]); }
                        catch (error) { showError(error); }
                    };
                }(i));
            }
        }());
        vignetteButton.onClick = function () { try { applyVignette(); } catch (error) { showError(error); } };
        glowButton.onClick = function () { try { applyDeepGlow(); } catch (error) { showError(error); } };
        fontApplyButton.onClick = function () { try { applyPremiumFontPreset(); } catch (error) { showError(error); } };
        textVisualApplyButton.onClick = function () { try { applyTextVisualPreset(); } catch (error) { showError(error); } };
        (function () {
            var i;
            for (i = 0; i < anchorButtons.length; i++) {
                anchorButtons[i].onClick = function () { try { adjustAnchorSelected(this._boltX, this._boltY); } catch (error) { showError(error); } };
            }
        }());

        function selectedAlignTarget() {
            return alignTarget.selection ? alignTarget.selection.text : "Comp";
        }
        alignLeftBtn.onClick = function () { try { boltAlignSelected("left", selectedAlignTarget()); } catch (error) { showError(error); } };
        alignHCenterBtn.onClick = function () { try { boltAlignSelected("hcenter", selectedAlignTarget()); } catch (error) { showError(error); } };
        alignRightBtn.onClick = function () { try { boltAlignSelected("right", selectedAlignTarget()); } catch (error) { showError(error); } };
        alignTopBtn.onClick = function () { try { boltAlignSelected("top", selectedAlignTarget()); } catch (error) { showError(error); } };
        alignVCenterBtn.onClick = function () { try { boltAlignSelected("vcenter", selectedAlignTarget()); } catch (error) { showError(error); } };
        alignBottomBtn.onClick = function () { try { boltAlignSelected("bottom", selectedAlignTarget()); } catch (error) { showError(error); } };
        distributeXBtn.onClick = function () { try { boltDistributeSelected("centerX"); } catch (error) { showError(error); } };
        distributeYBtn.onClick = function () { try { boltDistributeSelected("centerY"); } catch (error) { showError(error); } };
        distributeGapXBtn.onClick = function () { try { boltDistributeSelected("gapX"); } catch (error) { showError(error); } };
        distributeGapYBtn.onClick = function () { try { boltDistributeSelected("gapY"); } catch (error) { showError(error); } };

        centerLayerBtn.onClick = function () { try { centerLayersInComp(); } catch (error) { showError(error); } };
        nullBtn.onClick = function () { try { createQuickLayer("Null"); } catch (error) { showError(error); } };
        solidBtn.onClick = function () { try { createQuickLayer("Solid"); } catch (error) { showError(error); } };
        adjustmentBtn.onClick = function () { try { createQuickLayer("Adjustment"); } catch (error) { showError(error); } };
        precompBtn.onClick = function () { try { precomposeSelected(); } catch (error) { showError(error); } };
        trimInBtn.onClick = function () { try { trimSelected("in"); } catch (error) { showError(error); } };
        trimOutBtn.onClick = function () { try { trimSelected("out"); } catch (error) { showError(error); } };
        easeBtn.onClick = function () { try { easyEaseSelected(); } catch (error) { showError(error); } };
        fadeInBtn.onClick = function () { try { addFade("in"); } catch (error) { showError(error); } };
        fadeOutBtn.onClick = function () { try { addFade("out"); } catch (error) { showError(error); } };
        fadeBothBtn.onClick = function () { try { addFade("both"); } catch (error) { showError(error); } };
        projectSnapshotButton.onClick = function () { try { captureSnapshot(); } catch (error) { showError(error); } };
        projectPasteButton.onClick = function () { try { pasteFilesToProject(); } catch (error) { showError(error); } };
        projectPurgeButton.onClick = function () { try { purgeBoltCaches(); } catch (error) { showError(error); } };

        // Hidden Tools duplicates are kept wired for backward UI compatibility.
        snapshotButton.onClick = function () { try { captureSnapshot(); } catch (error) { showError(error); } };
        pasteButton.onClick = function () { try { pasteFilesToProject(); } catch (error) { showError(error); } };
        purgeButton.onClick = function () { try { purgeBoltCaches(); } catch (error) { showError(error); } };


        function resizeBoltPanel() {
            try {
                this.layout.resize();
                applyResponsiveLayout();
            } catch (ignoreResize) {}
        }
        panel.onResizing = resizeBoltPanel;
        panel.onResize = resizeBoltPanel;

        var i;
        for (i = 0; i < CURVE_PRESETS.length; i++) { curvePreset.add("item", CURVE_PRESETS[i].name); }
        curvePreset.selection = curvePreset.items[2];
        for (i = 0; i < GRADIENT_PRESETS.length; i++) { gradientPreset.add("item", GRADIENT_PRESETS[i].name); }
        gradientPreset.selection = gradientPreset.items[0];
        for (i = 0; i < COLOR_PALETTES.length; i++) { palettePreset.add("item", COLOR_PALETTES[i].name); }
        palettePreset.selection = palettePreset.items[0];

        var savedLayerProfile = loadSetting(
            "layer_profile_v0149",
            loadSetting("layer_profile_v0109", "Safe")
        );
        if (savedLayerProfile === "Safe Clean") { savedLayerProfile = "Safe"; }
        if (savedLayerProfile !== "Deep") { savedLayerProfile = "Safe"; }
        applyLayerProfile(savedLayerProfile);
        var savedRenderFormat = loadSetting("last_render_format_v0140", "H.264");
        if (/mp4|h\.?264/i.test(savedRenderFormat)) { savedRenderFormat = "H.264"; }
        else if (/mov|quicktime/i.test(savedRenderFormat)) { savedRenderFormat = "QuickTime"; }
        else if (/png/i.test(savedRenderFormat)) { savedRenderFormat = "PNG"; }
        else if (/wav|wave/i.test(savedRenderFormat)) { savedRenderFormat = "WAV"; }
        else if (!/^auto$/i.test(savedRenderFormat)) { savedRenderFormat = "H.264"; }
        if (!renderFormat._boltSelectByText(savedRenderFormat, false)) { renderFormat._boltSelect(1, false); }

        var savedRenderQuality = loadSetting("last_render_quality_v0140", "15 Mbps");
        if (savedRenderQuality === "Compact") { savedRenderQuality = "5 Mbps"; }
        else if (savedRenderQuality === "Balanced") { savedRenderQuality = "15 Mbps"; }
        else if (savedRenderQuality === "High") { savedRenderQuality = "40 Mbps"; }
        if (!renderQuality._boltSelectByText(savedRenderQuality, false)) { renderQuality._boltSelect(1, false); }

        renderTarget._boltSelect(0, false);
        layerRange._boltSelect(0, false);
        state.renderFormatValue = renderFormat.selection.text;
        state.renderQualityValue = renderQuality.selection.text;
        state.renderTargetValue = "Composition";
        state.layerRangeValue = "Layer In / Out";
        renderQuality.enabled = /h\.?264/i.test(state.renderFormatValue);
        qualityHint.visible = renderQuality.enabled;
        updatePaletteButtons();
        updateAutomaticPaths();
        updateDuplicatePreview();
        updateHeroLabel();
        refreshProjectStructureList();
        refreshRenderTargetMode();
        updateClockLabel();
        var lastPage = loadSetting("last_page_v0149_final", loadSetting("last_page_v01471", loadSetting("last_page_v0147", "Project")));
        if (!pages[lastPage]) { lastPage = "Project"; }
        showPage(lastPage);
        panel.layout.layout(true);
        applyResponsiveLayout();
        refreshScrollAreas();
        applyDefaultHelpTips(panel);
        return panel;
    }

    var interfacePanel = buildUI(thisObj);
    if (interfacePanel instanceof Window) {
        interfacePanel.center();
        interfacePanel.show();
    }
})(this);
