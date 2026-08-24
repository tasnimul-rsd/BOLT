#target aftereffects
#targetengine "bolt_15_8_centered_ui_r4"

/*
Bolt v15.8 Production
Production-focused After Effects ScriptUI panel for project analysis/organization,
safe cleanup, comp duplication/relinking, selected-keyframe motion/text actions, style tools,
native Render Queue/AME output, alignment, and compact utilities.
Uses a minimal centered 15.1-style interface, compact finishing controls with native AE Effect Controls tuning,
five-minute same-file autosave, ID/name-based comp references, fast indexed main-comp detection, verified used/unused Resources collection,
layered PSD/AI-safe handling, and no hidden experimental UI.
Developed by Tasnimul Hasan Malik, Designer & Animator.
*/

(function BoltPanel(thisObj) {
    var VERSION = "15.8";
    var BUILD_ID = "15.8-centered-ui-r4";
    var SCRIPT_NAME = "Bolt";
    var SETTINGS_SECTION = "Bolt";
    var DEVELOPER_NAME = "Tasnimul Hasan Malik";
    var DEVELOPER_ROLE = "Designer & Animator";

    // Bolt 15 safety defaults. Keep risky behavior opt-in.
    var BOLT_ALLOW_RETAINED_LAYER_MIGRATION = false;
    var BOLT_CONFIRM_FULL_COMPUTER_SEARCH = true;
    var BOLT_LOG_LIMIT = 120000;
    // Keep native ScriptUI content compact and centered inside wider AE docks.
    var BOLT_CONTENT_MAX_WIDTH = 340;
    var BOLT_CASE_INSENSITIVE_PATHS = false;
    try { BOLT_CASE_INSENSITIVE_PATHS = $.os.toLowerCase().indexOf("windows") !== -1; }
    catch (ignoreOSDetection) {}

    var state = {
        ui: null,
        outputTemplates: [],
        // v15 stores IDs/names instead of relying on live AE object references.
        // Live ProjectItem references can go stale after save/import/remove/relink and throw "Object is invalid".
        lockedRenderCompId: "",
        lockedRenderCompName: "",
        lockedRenderProjectToken: "",
        lockedHeroCompId: "",
        lockedHeroCompName: "",
        lockedHeroProjectToken: "",
        scrollAreas: [],
        activeScrollArea: null,
        renderFormatValue: "H.264",
        renderQualityValue: "15 Mbps",
        layerAnalysis: null,
        lastSnapshotError: "",
        lastClipboardError: ""
    };

    var GRADIENT_PRESETS = [{"name":"Aurora","a":"#6A5CFF","b":"#00E5C8","dir":"diag"},{"name":"Sunset","a":"#FF4D6D","b":"#FFB703","dir":"diag"},{"name":"Ocean","a":"#0061FF","b":"#60EFFF","dir":"vertical"},{"name":"Royal","a":"#2F2F7F","b":"#7B4FA0","dir":"diag"},{"name":"Midnight","a":"#0B1020","b":"#334155","dir":"vertical"},{"name":"Cyber","a":"#7C3AED","b":"#22D3EE","dir":"horizontal"},{"name":"Mango","a":"#FF7A18","b":"#FFD200","dir":"horizontal"},{"name":"Rose","a":"#FB7185","b":"#C084FC","dir":"diag"},{"name":"Forest","a":"#064E3B","b":"#34D399","dir":"vertical"},{"name":"Ice","a":"#E0F2FE","b":"#818CF8","dir":"diag"},{"name":"Mono","a":"#111827","b":"#E5E7EB","dir":"horizontal"},{"name":"Bolt","a":"#2F2F7F","b":"#00B8FF","dir":"diag"}];
    var COLOR_PALETTES = [{"name":"Bolt Brand","colors":["#2F2F7F","#7B4FA0","#00B8FF","#F5F7FF","#111827"]},{"name":"Modern Tech","colors":["#111827","#2563EB","#06B6D4","#A78BFA","#F8FAFC"]},{"name":"Luxury","colors":["#12100E","#6B4F2A","#D4AF37","#F3E9D2","#FFFFFF"]},{"name":"Neon","colors":["#0A0A0F","#7C3AED","#00E5FF","#FF2D95","#F8FF00"]},{"name":"Warm Editorial","colors":["#3B2314","#B45309","#F59E0B","#FED7AA","#FFF7ED"]},{"name":"Fresh","colors":["#064E3B","#10B981","#A7F3D0","#F0FDFA","#0F172A"]},{"name":"Soft Pastel","colors":["#C4B5FD","#FBCFE8","#BAE6FD","#FEF3C7","#F8FAFC"]},{"name":"Bold Social","colors":["#EF4444","#F97316","#FACC15","#22C55E","#3B82F6"]},{"name":"Cinema","colors":["#020617","#172554","#7C2D12","#B45309","#FDE68A"]},{"name":"Corporate","colors":["#0F172A","#1D4ED8","#64748B","#CBD5E1","#FFFFFF"]},{"name":"Beauty","colors":["#4C1D3D","#BE185D","#F9A8D4","#FCE7F3","#FFF1F2"]},{"name":"Earth","colors":["#292524","#57534E","#A16207","#D6D3D1","#FAFAF9"]}];

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
        var text = safeString(pathValue).replace(/\\/g, "/");
        // Preserve filesystem roots ("/" and "C:/") while trimming redundant
        // trailing separators elsewhere. Empty paths must stay empty.
        if (text.length > 1) { text = text.replace(/\/+$/, ""); }
        if (/^[A-Za-z]:$/.test(text)) { text += "/"; }
        if (BOLT_CASE_INSENSITIVE_PATHS) { text = text.toLowerCase(); }
        return text;
    }

    function isPathInside(childPath, parentPath) {
        var child = normalizePath(childPath);
        var parent = normalizePath(parentPath);
        if (!child.length || !parent.length) { return false; }
        if (parent === "/") { return child.charAt(0) === "/"; }
        var prefix = parent.charAt(parent.length - 1) === "/" ? parent : parent + "/";
        return child === parent || child.indexOf(prefix) === 0;
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

    function setStatus(message, kind) {
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
        if (text !== undefined) { setStatus(text, "ok"); }
        try { if (state.ui) { state.ui.panel.update(); } } catch (ignoreProgressUpdate) {}
    }

    function showError(error) {
        var message = error && error.message ? error.message : safeString(error);
        var logMessage = message;
        try {
            if (error && error.line) { message += "  •  line " + error.line; }
            if (error && error.fileName) { logMessage += " | file " + error.fileName; }
            if (error && error.line) { logMessage += " | line " + error.line; }
            if (error && error.stack) { logMessage += " | stack " + safeString(error.stack).replace(/\r?\n/g, " <- "); }
        } catch (ignoreErrorDetails) {}
        try { boltWriteLog("ERROR", logMessage); } catch (ignoreErrorLog) {}
        setStatus(message, "error");
        alert(message + "\n\nA log was written to: " + boltLogFile().fsName, brandTitle("Error"), true);
    }

    function boltLogFile() {
        var root = null;
        try { root = Folder.userData || Folder.temp; } catch (ignoreUserData) { root = Folder.temp; }
        var folder = new Folder(root.fsName + "/Bolt");
        try { if (!folder.exists) { folder.create(); } } catch (ignoreLogFolder) { folder = Folder.temp; }
        return new File(folder.fsName + "/Bolt_15_Error_Log.txt");
    }

    function boltWriteLog(level, message) {
        var file = boltLogFile();
        var existing = "";
        try {
            file.encoding = "UTF-8";
            if (file.exists && file.length < BOLT_LOG_LIMIT && file.open("r")) {
                existing = file.read();
                file.close();
            }
        } catch (ignoreReadLog) { try { file.close(); } catch (ignoreCloseReadLog) {} }
        var nowText = "";
        try { nowText = (new Date()).toString(); } catch (ignoreDate) { nowText = "Unknown time"; }
        var projectName = "No project";
        try { projectName = app.project && app.project.file ? app.project.file.fsName : "Unsaved project"; } catch (ignoreProjectName) {}
        var aeVersion = "unknown";
        try { aeVersion = safeString(app.version || "unknown"); } catch (ignoreAEVersion) {}
        var entry = "[" + nowText + "] " + level + "  " + safeString(message).replace(/\r?\n/g, " | ") +
            "\r\nBuild: " + BUILD_ID + " | AE: " + aeVersion +
            "\r\nProject: " + projectName + "\r\n\r\n";
        try {
            file.encoding = "UTF-8";
            if (file.open("w")) { file.write(existing + entry); file.close(); }
        } catch (ignoreWriteLog) { try { file.close(); } catch (ignoreCloseWriteLog) {} }
    }

    function boltAeObjectLooksValid(item) {
        if (!item) { return false; }
        try { var _boltNameProbe = item.name; return _boltNameProbe !== undefined; }
        catch (ignoreInvalidObjectProbe) { return false; }
    }

    function boltIsCompItem(item) {
        try { return !!(item && item instanceof CompItem && boltAeObjectLooksValid(item)); }
        catch (ignoreCompItemProbe) { return false; }
    }

    function boltIsFolderItem(item) {
        try { return !!(item && item instanceof FolderItem && boltAeObjectLooksValid(item)); }
        catch (ignoreFolderItemProbe) { return false; }
    }

    function boltProjectItemId(item) {
        try { if (!boltAeObjectLooksValid(item)) { return ""; } return String(item.id); }
        catch (ignoreProjectItemId) { return ""; }
    }

    function boltProjectItemName(item, fallback) {
        try { if (!boltAeObjectLooksValid(item)) { return fallback || ""; } return safeString(item.name); }
        catch (ignoreProjectItemName) { return fallback || ""; }
    }

    function boltFindProjectItemById(id) {
        if (!app.project || !id) { return null; }
        var numericId = parseInt(id, 10), direct = null;
        try {
            if (!isNaN(numericId) && typeof app.project.itemByID === "function") {
                direct = app.project.itemByID(numericId);
                if (boltAeObjectLooksValid(direct) && boltProjectItemId(direct) === String(id)) { return direct; }
            }
        } catch (ignoreDirectItemLookup) {}
        var index, item, count = app.project.numItems;
        for (index = 1; index <= count; index++) {
            try {
                item = app.project.item(index);
                if (boltProjectItemId(item) === String(id)) { return item; }
            } catch (ignoreFindById) {}
        }
        return null;
    }

    function boltFindCompByName(name) {
        if (!app.project || !name) { return null; }
        var index, item;
        for (index = 1; index <= app.project.numItems; index++) {
            try {
                item = app.project.item(index);
                if (boltIsCompItem(item) && item.name === name) { return item; }
            } catch (ignoreFindCompByName) {}
        }
        return null;
    }

    function boltCurrentProjectToken() {
        if (!app.project) { return ""; }
        try {
            if (app.project.file) { return normalizePath(app.project.file.fsName); }
        } catch (ignoreProjectTokenFile) {}
        // Unsaved projects have no stable file identity. Stored locks are still
        // useful inside the current session, but are cleared as soon as the
        // project receives a real file path.
        return "__unsaved__";
    }

    function boltStoreCompReference(kind, comp) {
        if (!boltIsCompItem(comp)) { return null; }
        var projectToken = boltCurrentProjectToken();
        if (kind === "hero") {
            state.lockedHeroCompId = boltProjectItemId(comp);
            state.lockedHeroCompName = boltProjectItemName(comp, "");
            state.lockedHeroProjectToken = projectToken;
        } else if (kind === "render") {
            state.lockedRenderCompId = boltProjectItemId(comp);
            state.lockedRenderCompName = boltProjectItemName(comp, "");
            state.lockedRenderProjectToken = projectToken;
        }
        return comp;
    }

    function boltClearCompReference(kind) {
        if (kind === "hero") {
            state.lockedHeroCompId = "";
            state.lockedHeroCompName = "";
            state.lockedHeroProjectToken = "";
        } else if (kind === "render") {
            state.lockedRenderCompId = "";
            state.lockedRenderCompName = "";
            state.lockedRenderProjectToken = "";
        }
    }

    function boltResolveStoredComp(kind) {
        var id = kind === "hero" ? state.lockedHeroCompId : state.lockedRenderCompId;
        var name = kind === "hero" ? state.lockedHeroCompName : state.lockedRenderCompName;
        var storedProject = kind === "hero" ? state.lockedHeroProjectToken : state.lockedRenderProjectToken;
        var currentProject = boltCurrentProjectToken();

        if (storedProject && currentProject && storedProject !== currentProject) {
            boltClearCompReference(kind);
            return null;
        }

        var byId = boltFindProjectItemById(id);
        if (boltIsCompItem(byId)) { return boltStoreCompReference(kind, byId); }
        var byName = boltFindCompByName(name);
        if (boltIsCompItem(byName)) { return boltStoreCompReference(kind, byName); }
        boltClearCompReference(kind);
        return null;
    }

    function boltClearInvalidObjectRefs() {
        try {
            if (state.layerAnalysis && state.layerAnalysis.records) {
                var kept = [], i, record;
                for (i = 0; i < state.layerAnalysis.records.length; i++) {
                    record = state.layerAnalysis.records[i];
                    if (record && projectContainsItem(record.comp)) { kept.push(record); }
                }
                state.layerAnalysis.records = kept;
            }
        } catch (ignoreLayerAnalysisClear) { state.layerAnalysis = null; }
    }

    function getProjectBaseName() {
        if (app.project && app.project.file) {
            return sanitizeName(stripVersionSuffix(stripProjectExtension(app.project.file.name)));
        }
        return "Untitled_Project";
    }

function boltFolderNameKey(folder) {
    try { return safeString(folder ? folder.name : "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }
    catch (ignoreFolderNameKey) { return ""; }
}

function boltFolderHasChild(folder, childName) {
    if (!folder || !childName) { return false; }
    try { return new Folder(folder.fsName + "/" + childName).exists; }
    catch (ignoreFolderChildProbe) { return false; }
}

function boltProjectIdentityKey() {
    var name = "";
    try {
        name = app.project && app.project.file
            ? stripVersionSuffix(stripProjectExtension(app.project.file.name))
            : getProjectBaseName();
    } catch (ignoreProjectIdentityName) { name = getProjectBaseName(); }
    name = safeString(name).toLowerCase();
    name = name.replace(/(?:^|[ _\-])(auto[ _\-]*save|autosave|backup|copy)(?:$|[ _\-])/ig, " ");
    name = name.replace(/(?:^|[ _\-])v(?:er(?:sion)?)?[ _\-]*\d+(?:$|[ _\-])/ig, " ");
    return name.replace(/[^a-z0-9]+/g, "");
}

function boltWorkspaceCandidateScore(folder, projectFile, directParent, depth) {
    if (!folder || !projectFile) { return -999999; }
    var score = 180 - (Math.max(0, depth) * 55);
    var folderKey = boltFolderNameKey(folder);
    var baseKey = boltProjectIdentityKey();
    var parentKey = boltFolderNameKey(directParent);
    var projectDir = null;

    try {
        if (normalizePath(folder.fsName) === normalizePath(directParent.fsName)) { score += 95; }
    } catch (ignoreDirectParentScore) {}

    if (boltFolderHasChild(folder, "Project")) { score += 130; }
    if (boltFolderHasChild(folder, "Resources")) { score += 105; }
    if (boltFolderHasChild(folder, "Render")) { score += 70; }

    try {
        projectDir = new Folder(folder.fsName + "/Project");
        if (projectDir.exists && isPathInside(projectFile.fsName, projectDir.fsName)) { score += 430; }
    } catch (ignoreProjectChildContainment) {}

    if (baseKey.length > 3 && folderKey.length > 3) {
        if (baseKey === folderKey) { score += 300; }
        else if (baseKey.indexOf(folderKey) >= 0 || folderKey.indexOf(baseKey) >= 0) { score += 145; }
    }

    // A folder literally called Project/AE is usually the AEP container, not
    // the workspace root. Prefer its parent when that parent contains it.
    if (/^(project|ae|aep|aftereffects|aftereffect|source|src)$/.test(folderKey)) { score -= 260; }
    if (/^(project|ae|aep|aftereffects|aftereffect)$/.test(parentKey)) {
        try {
            if (directParent.parent && normalizePath(folder.fsName) === normalizePath(directParent.parent.fsName)) { score += 360; }
        } catch (ignoreProjectParentBonus) {}
    }

    return score;
}

function getWorkspaceRoot() {
    if (!app.project || !app.project.file) { return null; }

    var projectFile = new File(app.project.file.fsName);
    var directParent = projectFile.parent;
    if (!directParent) { return null; }

    // Score the AEP folder and a few ancestors. This handles all common layouts:
    //   /Job/Project/file.aep      -> /Job
    //   /Job/file.aep              -> /Job
    //   /Job/AE/file.aep           -> /Job (when AE is just the AEP container)
    //   /Job/{Project,Resources}   -> /Job
    var best = directParent;
    var bestScore = -999999;
    var bestDepth = 0;
    var current = directParent;
    var depth = 0;
    // Three levels cover normal Job/Project/AEP and Job/AE/Project/AEP layouts
    // without letting a broad client/drive folder win by accident.
    while (current && depth < 3) {
        var score = boltWorkspaceCandidateScore(current, projectFile, directParent, depth);
        if (score > bestScore) {
            bestScore = score;
            best = current;
            bestDepth = depth;
        }
        try {
            if (!current.parent || normalizePath(current.parent.fsName) === normalizePath(current.fsName)) { break; }
            current = current.parent;
        } catch (ignoreWorkspaceAncestor) { break; }
        depth++;
    }

    // Never auto-select a distant ambiguous ancestor. If the scorer climbs more
    // than one level and that folder does not already look like this job, fall
    // back to the AEP container's parent (or the AEP folder itself).
    if (bestDepth > 1 && !boltWorkspaceLooksDedicated(best, projectFile)) {
        var parentKey = boltFolderNameKey(directParent);
        if (/^(project|ae|aep|aftereffects|aftereffect|source|src)$/.test(parentKey)) {
            try {
                if (directParent.parent) {
                    var parentFolder = directParent.parent;
                    var parentFolderKey = boltFolderNameKey(parentFolder);
                    // Handle Job/AE/Project/file.aep without climbing beyond the
                    // immediate chain of known AE container folders.
                    if (/^(project|ae|aep|aftereffects|aftereffect|source|src)$/.test(parentFolderKey) && parentFolder.parent) {
                        return parentFolder.parent;
                    }
                    return parentFolder;
                }
            } catch (ignoreSafeWorkspaceParent) {}
        }
        return directParent;
    }
    return best;
}

function boltWorkspaceLooksDedicated(rootFolder, projectFile) {
    if (!rootFolder) { return false; }
    var rootKey = boltFolderNameKey(rootFolder);
    var projectKey = boltProjectIdentityKey();
    var hasProject = boltFolderHasChild(rootFolder, "Project");
    var hasResources = boltFolderHasChild(rootFolder, "Resources");
    var hasRender = boltFolderHasChild(rootFolder, "Render");

    // Strongest signal: the workspace folder is named after the project/edit.
    if (projectKey.length > 3 && rootKey.length > 3) {
        if (projectKey === rootKey) { return true; }
        if (projectKey.indexOf(rootKey) >= 0 || rootKey.indexOf(projectKey) >= 0) { return true; }
    }

    // Existing Bolt-style workspace structure is also safe to normalize.
    if ((hasProject && hasResources) || (hasProject && hasRender) || (hasResources && hasRender)) {
        return true;
    }

    // A manually chosen/project-file parent can be shared (for example a
    // generic "Video" folder containing several jobs). In that case Bolt still
    // collects imported media into Resources, but it must not sweep unrelated
    // sibling folders into Unused.
    return false;
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

function boltRefreshSmartProjectContext(reason, forceMainDetection) {
    var output = {root:null, hero:null, projectFile:null, reason:safeString(reason)};
    if (!app.project) { return output; }

    boltClearInvalidObjectRefs();
    try { output.projectFile = app.project.file ? new File(app.project.file.fsName) : null; } catch (ignoreSmartProjectFile) {}
    try { output.root = getWorkspaceRoot(); } catch (ignoreSmartWorkspace) { output.root = null; }

    try {
        output.hero = detectMainComp();
        if (output.hero && forceMainDetection !== false) {
            boltStoreCompReference("hero", output.hero);
        }
    } catch (ignoreSmartHero) { output.hero = null; }

    if (state.ui) {
        try {
            if (output.root && state.ui.workspacePath) { state.ui.workspacePath.text = output.root.fsName; }
            if (output.root && state.ui.relinkPath) { state.ui.relinkPath.text = new Folder(output.root.fsName + "/Resources").fsName; }
            if (output.root && state.ui.renderPath) { state.ui.renderPath.text = new Folder(output.root.fsName + "/Render").fsName; }
        } catch (ignoreSmartUIPaths) {}
        try { updateHeroLabel(); } catch (ignoreSmartHeroLabel) {}
    }

    try {
        log("Smart context [" + safeString(reason) + "]: root=" +
            (output.root ? output.root.fsName : "none") + " | main=" +
            (output.hero ? boltProjectItemName(output.hero, "none") : "none"));
    } catch (ignoreSmartContextLog) {}
    return output;
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
            if (boltIsCompItem(item)) { return true; }
        } catch (ignoreProxyCompCheck) {}
        return boltIsFootageItem(item);
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

    function boltResourceIndexKey(file) {
        var size = boltFileSizeKey(file);
        if (!size || !file) { return ""; }
        // Index duplicates by size + file name. Comparing every same-sized file
        // byte-for-byte is expensive on large video/image projects and can also
        // collapse intentionally different asset names. Same-name candidates are
        // the only safe automatic dedupe target; final reuse still requires an
        // exact byte comparison.
        var nameKey = safeString(file.name);
        if (BOLT_CASE_INSENSITIVE_PATHS) { nameKey = nameKey.toLowerCase(); }
        return size + "|" + nameKey;
    }

    function boltBuildResourceIndex(resourcesFolder) {
        var files = boltListFilesRecursive(resourcesFolder, [], false), index = {}, i, key;
        for (i = 0; i < files.length; i++) {
            key = boltResourceIndexKey(files[i]);
            if (!key) { continue; }
            if (!index[key]) { index[key] = []; }
            index[key].push(files[i]);
        }
        return index;
    }

    function boltIndexResourceFile(context, file) {
        var key = boltResourceIndexKey(file);
        if (!key) { return; }
        if (!context.resourceIndex[key]) { context.resourceIndex[key] = []; }
        context.resourceIndex[key].push(file);
    }

function boltFindResourceDuplicate(context, source, targetFolder) {
        var key = boltResourceIndexKey(source), items, i, candidate;
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
    if (!source || !source.exists) { throw new Error("Source file is missing."); }
    ensureFolder(targetFolder);

    // Already exactly where it belongs.
    if (boltFileIsDirectlyIn(source, targetFolder)) {
        boltIndexResourceFile(context, source);
        return source;
    }

    var duplicate = boltFindResourceDuplicate(context, source, targetFolder);
    if (duplicate && normalizePath(duplicate.fsName) !== normalizePath(source.fsName)) {
        context.deduplicated++;
        if (context.workspaceRoot && isPathInside(source.fsName, context.workspaceRoot.fsName)) {
            context.duplicateSourceFiles[normalizePath(source.fsName)] = source;
        }
        return duplicate;
    }

    var target = new File(targetFolder.fsName + "/" + source.name);
    if (target.exists) {
        if (boltFilesEqualExact(target, source)) {
            context.deduplicated++;
            boltIndexResourceFile(context, target);
            if (context.workspaceRoot && isPathInside(source.fsName, context.workspaceRoot.fsName)) {
                context.duplicateSourceFiles[normalizePath(source.fsName)] = source;
            }
            return target;
        }
        target = uniqueFile(targetFolder, source.name);
    }

    // Important safety rule: copy first, relink second, clean the old duplicate only
    // after the complete collection has been verified. This avoids broken FootageItems
    // when item.replace()/setProxy() rejects a source for any reason.
    copyFileChecked(source, target);
    context.copied++;
    context.copiedFiles.push(target.fsName);
    boltIndexResourceFile(context, target);

    if (context.workspaceRoot && isPathInside(source.fsName, context.workspaceRoot.fsName)) {
        context.duplicateSourceFiles[normalizePath(source.fsName)] = source;
    }
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

    var firstTarget = null, target, sourceFrame;
    for (index = 0; index < sequenceFiles.length; index++) {
        sourceFrame = sequenceFiles[index];
        target = new File(targetFolder.fsName + "/" + prefix + sourceFrame.name);

        if (normalizePath(target.fsName) === normalizePath(sourceFrame.fsName)) {
            boltIndexResourceFile(context, sourceFrame);
            target = sourceFrame;
        } else if (target.exists && boltFilesEqualExact(target, sourceFrame)) {
            context.deduplicated++;
            boltIndexResourceFile(context, target);
            if (context.workspaceRoot && isPathInside(sourceFrame.fsName, context.workspaceRoot.fsName)) {
                context.duplicateSourceFiles[normalizePath(sourceFrame.fsName)] = sourceFrame;
            }
        } else {
            if (target.exists) { target = uniqueFile(targetFolder, prefix + sourceFrame.name); }
            copyFileChecked(sourceFrame, target);
            context.copied++;
            context.copiedFiles.push(target.fsName);
            boltIndexResourceFile(context, target);
            if (context.workspaceRoot && isPathInside(sourceFrame.fsName, context.workspaceRoot.fsName)) {
                context.duplicateSourceFiles[normalizePath(sourceFrame.fsName)] = sourceFrame;
            }
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

    function boltFootageExpressionSafety() {
        var result = {protectedNames:{}, dynamicFootageReference:false, expressions:0};
        if (!app.project) { return result; }
        var entries = boltBuildExpressionIndex(), index, expression, literalPattern, match, remainder;
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

    function boltBuildFootageDependencyMap() {
        var usage = {itemIds:{}, sourcePaths:{}, expressionNames:{}, dynamicExpression:false};
        var index, item, comp, layerIndex, layer, source, safety, nameKey;

        // Read the actual layer sources instead of relying on a single signal.
        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            if (boltIsFootageItem(item) && footageUseCount(item) > 0) {
                boltMarkFootageDependency(item, usage);
            }
            if (!boltIsCompItem(item)) { continue; }
            comp = item;
            for (layerIndex = 1; layerIndex <= comp.numLayers; layerIndex++) {
                try { layer = comp.layer(layerIndex); source = layer ? layer.source : null; }
                catch (ignoreLayerSource) { source = null; }
                if (boltIsFootageItem(source)) { boltMarkFootageDependency(source, usage); }
            }
        }

        // footage("Name") expressions are dependencies even when usedIn is empty.
        safety = boltFootageExpressionSafety();
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
            if (!boltIsCompItem(comp)) { continue; }
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

function boltNormalizeLayeredDesignUsage(groups) {
    var groupIndex, recordIndex, group, sharedUsed;
    if (!groups) { return; }

    for (groupIndex = 0; groupIndex < groups.length; groupIndex++) {
        group = groups[groupIndex];
        sharedUsed = false;

        // One physical PSD/PSB/AI backs every retained-layer FootageItem.
        // If ANY member is required, the physical document is required. This
        // prevents one orphan layer-item from classifying the shared document
        // as unused while another layer is still part of the edit.
        for (recordIndex = 0; recordIndex < group.records.length; recordIndex++) {
            if (group.records[recordIndex].used || group.records[recordIndex].itemUsed) {
                sharedUsed = true;
                break;
            }
        }

        group.sharedUsed = sharedUsed;
        for (recordIndex = 0; recordIndex < group.records.length; recordIndex++) {
            group.records[recordIndex].used = sharedUsed;
            group.records[recordIndex].unused = !sharedUsed;
            group.records[recordIndex].layeredSharedUsed = sharedUsed;
        }
    }
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
        if (boltIsCompItem(item)) { comps.push(item); }
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
    if (!boltIsCompItem(comp)) { return ordered; }

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
        if (!boltIsCompItem(comp)) { continue; }
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
    if (boltIsCompItem(imported.root)) { return imported.root; }

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
        if (!boltIsCompItem(comp)) { continue; }
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
        if (!boltIsCompItem(comp)) { continue; }
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

    if (
        !BOLT_ALLOW_RETAINED_LAYER_MIGRATION &&
        normalizePath(source.fsName) !== normalizePath(target.fsName)
    ) {
        var protectedCopyVerified = false;
        try { protectedCopyVerified = boltFilesEqualExact(source, target); }
        catch (ignoreProtectedCopyVerify) { protectedCopyVerified = false; }
        if (!protectedCopyVerified) {
            throw new Error(
                "Layered " + kind + " safety copy could not be verified byte-for-byte: " +
                target.fsName
            );
        }

        var protectIndex;
        for (protectIndex = 0; protectIndex < group.records.length; protectIndex++) {
            group.records[protectIndex].layeredProtected = true;
            group.records[protectIndex].layeredBackup = new File(target.fsName);
            group.records[protectIndex].layeredBackupVerified = true;
        }
        if (!context.protectedLayeredPaths) { context.protectedLayeredPaths = {}; }
        context.protectedLayeredPaths[normalizePath(source.fsName)] = true;
        context.layeredDesignProtected =
            (context.layeredDesignProtected || 0) + group.records.length;
        context.warnings.push(
            "Layered " + kind + " kept on original live link. Backup copy saved in Resources: " + target.name
        );
        return true;
    }

    if (normalizePath(source.fsName) === normalizePath(target.fsName)) {
        var alreadyIndex;
        for (alreadyIndex = 0; alreadyIndex < group.records.length; alreadyIndex++) {
            group.records[alreadyIndex].layeredMigrated = true;
            group.records[alreadyIndex].layeredProtected = false;
            // Physical placement is resolved at the shared layered-document level.
            // Do not force an individual unused layer-item to move the shared PSD/AI.
            group.records[alreadyIndex].layeredPhysicalResolved = true;
        }
        context.alreadyOrganized += group.records.length;
        return true;
    }

    if (!boltMigrateLayeredDesignGroup(group, target, context)) {
        // Absolute safety fallback: keep the live AE layer sources linked to
        // their original document. The Resources copy remains as a backup, but
        // Bolt will not call FootageItem.replace() on retained PSD/AI layers.
        var fallbackCopyVerified = false;
        try { fallbackCopyVerified = boltFilesEqualExact(source, target); }
        catch (ignoreFallbackCopyVerify) { fallbackCopyVerified = false; }
        var protectIndex;
        for (protectIndex = 0; protectIndex < group.records.length; protectIndex++) {
            group.records[protectIndex].layeredProtected = true;
            group.records[protectIndex].layeredBackup = new File(target.fsName);
            group.records[protectIndex].layeredBackupVerified = fallbackCopyVerified;
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
    var records = [], sourceUsage = {};
    var index, item, file, key, itemUsed, sequenceCount, record;

    if (!app.project) { return records; }

    // Snapshot first. Do not mutate disk or Project items while deciding used/unused.
    for (index = 1; index <= app.project.numItems; index++) {
        item = app.project.item(index);
        if (!boltIsFootageItem(item)) { continue; }

        file = boltGetFootageFile(item) || boltGetMissingFootageFile(item);
        if (!file) { continue; }

        key = sourceKey(file);
        itemUsed = boltFootageDependencyUsed(item, dependencyUsage);
        if (itemUsed) { sourceUsage[key] = true; }
        else if (sourceUsage[key] !== true) { sourceUsage[key] = false; }

        sequenceCount = 0;
        if (file.exists && isSequenceFootage(item)) {
            try { sequenceCount = detectSequenceFiles(file).length; }
            catch (ignoreSequenceCount) { sequenceCount = 0; }
        }

        records.push({
            item:item,
            source:new File(file.fsName),
            sourceKey:key,
            itemUsed:itemUsed,
            used:false,
            unused:false,
            sequence:isSequenceFootage(item),
            sequenceCount:sequenceCount
        });
    }

    // A shared physical source gets one destination. "Used wins" is the safe rule.
    // An unused duplicate Project item is still allowed to point to Resources when
    // another comp uses that same physical file.
    for (index = 0; index < records.length; index++) {
        record = records[index];
        record.used = sourceUsage[record.sourceKey] === true;
        record.unused = !record.used;
    }
    return records;
}


    function boltSequenceLocationValid(record, currentFile) {
        if (!record || !record.sequence || !currentFile || !currentFile.exists) { return !record || !record.sequence; }
        if (!record.sequenceCount || record.sequenceCount < 2) { return true; }
        try { return detectSequenceFiles(currentFile).length >= record.sequenceCount; }
        catch (ignoreVerifySequence) { return false; }
    }
function boltLayeredBackupIsVerified(record, resourcesFolder, currentFile) {
    if (!record || !record.layeredBackup || !record.layeredBackup.exists || !resourcesFolder) {
        return false;
    }

    var backup = new File(record.layeredBackup.fsName);
    var unusedFolder = new Folder(resourcesFolder.fsName + "/Unused");
    var backupInResources = isPathInside(backup.fsName, resourcesFolder.fsName);
    var backupInUnused = unusedFolder.exists && isPathInside(backup.fsName, unusedFolder.fsName);
    if (!backupInResources || backupInUnused) { return false; }

    // Exact comparison can be expensive for a large PSD. A collection record
    // is short-lived, so cache the successful byte check for the rest of this
    // Organize pass instead of comparing the same shared document dozens of times.
    if (record.layeredBackupVerified === true) { return true; }

    if (currentFile && currentFile.exists) {
        try {
            record.layeredBackupVerified = boltFilesEqualExact(currentFile, backup);
            return record.layeredBackupVerified === true;
        } catch (ignoreLayeredBackupExactCheck) {
            record.layeredBackupVerified = false;
            return false;
        }
    }
    return false;
}

function boltRecordIsCollected(record, resourcesFolder) {
    var currentFile = boltGetFootageFile(record ? record.item : null);

    if (!resourcesFolder) { return false; }

    // IMPORTANT: protected retained-layer PSD/PSB/AI records must be checked
    // BEFORE the generic layered-document location rule. The live AE link may
    // intentionally remain in Resources/Unused (or its original location)
    // while a verified byte-identical safety copy lives in main Resources.
    // The old order caused valid layered documents to fail verification.
    if (record && record.layeredProtected) {
        return !!(
            currentFile &&
            currentFile.exists &&
            boltLayeredBackupIsVerified(record, resourcesFolder, currentFile)
        );
    }

    // Retained-layer PSD/PSB/AI imports are one physical document shared by
    // many AE FootageItems. When they are actually migrated, the shared live
    // document belongs in main Resources rather than Resources/Unused.
    if (
        record &&
        record.layeredDesignKey &&
        currentFile &&
        currentFile.exists &&
        isPathInside(currentFile.fsName, resourcesFolder.fsName)
    ) {
        var layeredUnusedFolder = new Folder(resourcesFolder.fsName + "/Unused");
        var layeredInUnused = layeredUnusedFolder.exists &&
            isPathInside(currentFile.fsName, layeredUnusedFolder.fsName);
        return !!(!layeredInUnused && boltSequenceLocationValid(record, currentFile));
    }

    if (!currentFile || !currentFile.exists) { return false; }

    var unusedFolder = new Folder(resourcesFolder.fsName + "/Unused");
    var inResources = isPathInside(currentFile.fsName, resourcesFolder.fsName);
    var inUnused = unusedFolder.exists && isPathInside(currentFile.fsName, unusedFolder.fsName);
    var correctZone = record && record.unused ? inUnused : (inResources && !inUnused);

    return !!(correctZone && boltSequenceLocationValid(record, currentFile));
}

function boltRecoverLayeredBackup(record, resourcesFolder, context) {
    if (!record || !record.layeredDesignKey || !resourcesFolder) { return false; }

    var currentFile = boltGetFootageFile(record.item);
    if (!currentFile || !currentFile.exists) { return false; }

    if (!context.layeredRecoveryMap) { context.layeredRecoveryMap = {}; }
    var liveKey = sourceKey(currentFile);
    var existing = context.layeredRecoveryMap[liveKey] || null;

    if (existing && existing.exists) {
        record.layeredProtected = true;
        record.layeredBackup = new File(existing.fsName);
        return boltLayeredBackupIsVerified(record, resourcesFolder, currentFile);
    }

    // Reuse an already verified main-Resources copy when possible.
    var duplicate = boltFindResourceDuplicate(context, currentFile, resourcesFolder);
    var backup = duplicate;
    if (!backup) {
        try {
            backup = boltPlaceResourceFile(currentFile, resourcesFolder, context);
        } catch (layeredRecoveryCopyError) {
            context.warnings.push(
                record.item.name + ": layered design safety copy failed: " +
                layeredRecoveryCopyError.message
            );
            return false;
        }
    }

    if (!backup || !backup.exists) { return false; }
    context.layeredRecoveryMap[liveKey] = new File(backup.fsName);
    record.layeredProtected = true;
    record.layeredBackup = new File(backup.fsName);
    if (!context.protectedLayeredPaths) { context.protectedLayeredPaths = {}; }
    context.protectedLayeredPaths[normalizePath(currentFile.fsName)] = true;
    var verified = boltLayeredBackupIsVerified(record, resourcesFolder, currentFile);
    record.layeredBackupVerified = verified;
    return verified;
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

            // Never repair a retained-layer PSD/PSB/AI by calling
            // FootageItem.replace() on individual layer-items. If the live
            // shared document is still valid, recover/verify one safety copy in
            // main Resources and keep the live retained-layer mapping untouched.
            if (record.layeredDesignKey) {
                if (boltRecoverLayeredBackup(record, resourcesFolder, context)) {
                    passed++;
                    continue;
                }

                currentFile = boltGetFootageFile(record.item);
                failed.push(
                    record.item.name + " | layered design could not be safely verified | " +
                    (currentFile ? currentFile.fsName : record.source.fsName)
                );
                continue;
            }

            mapKey = record.sourceKey + (record.unused ? "|unused" : "|used");
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
                            !!record.unused,
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
function boltRequireCompleteCollection(collectionRecords, proxyRecords, folders, context) {
    boltReconcileCollectionRecords(collectionRecords, folders.resources, context, 3);
    boltVerifyProxyRecords(proxyRecords, folders.resources, context, true);

    if (context.collectionFailed.length || context.proxyFailed.length) {
        var details = [], i, limit = 8;
        for (i = 0; i < context.collectionFailed.length && details.length < limit; i++) {
            details.push(context.collectionFailed[i]);
        }
        for (i = 0; i < context.proxyFailed.length && details.length < limit; i++) {
            details.push(context.proxyFailed[i]);
        }
        throw new Error(
            "Organize stopped safely because Bolt could not verify " +
            context.collectionFailed.length + " media item(s) and " +
            context.proxyFailed.length + " proxy item(s) after collection/relink." +
            (details.length ? "\n\nFirst unresolved item(s):\n" + details.join("\n") : "") +
            "\n\nThe original referenced files were not deleted before this verification step."
        );
    }
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

function analyzeProject() {
        if (!app.project) { throw new Error("No After Effects project is open."); }
        var smartContext = boltRefreshSmartProjectContext("Analyze", true);
        var result = {comps:0, mainComps:0, dependencies:0, missing:0, unused:0, sequences:0, proxies:0};
        result.workspaceRoot = smartContext.root;
        result.heroComp = smartContext.hero;
        result.mainCompName = smartContext.hero ? boltProjectItemName(smartContext.hero, "") : "";
        var index, item, uses;

        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            if (boltIsCompItem(item)) {
                result.comps++;
                if (compUseCount(item) === 0) { result.mainComps++; }
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

        setStatus(
            result.comps + " comps • " + result.dependencies + " used→Resources • " +
            result.unused + " unused→Resources/Unused • " + result.missing + " missing • " +
            result.sequences + " sequences • " + result.proxies + " proxies",
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
    var unusedFolder = new Folder(resourcesFolder.fsName + "/Unused");

    function proxyLocationValid(file, rec) {
        if (!file || !file.exists) { return false; }
        if (!isPathInside(file.fsName, resourcesFolder.fsName)) { return false; }
        if (unusedFolder.exists && isPathInside(file.fsName, unusedFolder.fsName)) { return false; }
        return boltSequenceLocationValid(rec, file);
    }

    for (index = 0; index < records.length; index++) {
        record = records[index];
        currentFile = boltGetProxyFile(record.item);
        if (proxyLocationValid(currentFile, record)) { passed++; continue; }

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

        if (proxyLocationValid(currentFile, record)) { passed++; }
        else {
            failed.push(record.item.name + " proxy | " + (currentFile ? currentFile.fsName : record.source.fsName));
        }
    }

    context.proxyRecords = records.length;
    context.proxyVerified = passed;
    context.proxyFailed = failed;
    return failed;
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
        if (boltIsCompItem(item)) { return "01_Comps"; }
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
        boltClearInvalidObjectRefs();
        var stored = boltResolveStoredComp("hero");
        if (stored) { return stored; }
        var detected = detectMainComp();
        if (detected) { return boltStoreCompReference("hero", detected); }
        if (app.project && boltIsCompItem(app.project.activeItem)) {
            return boltStoreCompReference("hero", app.project.activeItem);
        }
        return null;
    }

    function lockHeroComp() {
        var comp = selectedCompFromProject();
        if (!comp && app.project && boltIsCompItem(app.project.activeItem)) {
            comp = app.project.activeItem;
        }
        if (!boltIsCompItem(comp)) { throw new Error("Select or open the main hero composition first."); }
        boltStoreCompReference("hero", comp);
        updateHeroLabel();
        setStatus("Hero comp locked: " + boltProjectItemName(comp, "Selected comp"), "ok");
        return comp;
    }

function updateHeroLabel() {
        if (!state.ui || !state.ui.heroLabel) { return; }
        var comp = resolveHeroComp();
        var name = comp ? boltProjectItemName(comp, state.lockedHeroCompName || "Hero") : "";
        state.ui.heroLabel.text = comp ? "Main comp  •  " + name : "Main comp  •  none";
        state.ui.heroLabel.helpTip = comp
            ? ("Main composition: " + name)
            : "No composition could be detected.";
    }

    function isNamedSceneComp(comp) {
        if (!boltIsCompItem(comp)) { return false; }
        return /^(?:scene|shot|sequence|seq|part|chapter|segment)(?:[\s_\-]*\d+|\b)/i.test(trim(boltProjectItemName(comp, "")));
    }

    function isSceneLevelComp(comp, heroComp) {
        if (!boltIsCompItem(comp)) { return false; }
        if (heroComp && comp === heroComp) { return true; }
        return isNamedSceneComp(comp);
    }

    function isBoltLayerExportComp(comp) {
        if (!boltIsCompItem(comp)) { return false; }
        if (/^BOLT_EXPORT__/i.test(boltProjectItemName(comp, ""))) { return true; }
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
                if (boltIsCompItem(current) && isSceneLevelComp(current, heroComp)) {
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
        "Proxies verified: " +
            context.proxyVerified + "/" + context.proxyRecords,
        "Layered PSD/AI migrated: " +
            context.layeredDesignMigrated,
        "Layered PSD/AI protected in place: " +
            context.layeredDesignProtected,
        "Missing files found: " +
            (context.autoRelinked + context.autoProxyRelinked),
        "Missing files unresolved: " +
            context.autoRelinkUnresolved.length,
        "Workspace root: " +
            (context.workspaceSweepSkipped ? "PRESERVED (shared/ambiguous)" : (context.workspaceVerified ? "CLEAN" : "REVIEW")),
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
        trim(safeString(name))
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

function boltProjectBackupArchiveFolder(folders) {
    return ensureFolder(new Folder(folders.resources.fsName + "/Unused/Project_Backups"));
}

function boltConsolidateProjectFiles(folders, context) {
    if (!folders || !folders.project || !folders.resources || !app.project || !app.project.file) { return; }
    var activePath = normalizePath(app.project.file.fsName);
    var archiveFolder = boltProjectBackupArchiveFolder(folders);
    var files = [];
    var index, file;

    // "Project" is intentionally a one-working-file folder. Scan recursively so
    // old version folders and AE Auto-Save subfolders cannot leave extra AEP/AEPX
    // files behind. Nothing is deleted: extras are moved to Resources/Unused/
    // Project_Backups, preserving recovery while keeping Project clean.
    try { files = boltCollectFolderFiles(folders.project, []); }
    catch (readProjectFolderError) {
        context.warnings.push("Project folder could not be consolidated: " + readProjectFolderError.message);
        return;
    }

    for (index = 0; index < files.length; index++) {
        file = files[index];
        if (!boltIsProjectFile(file) || normalizePath(file.fsName) === activePath) { continue; }
        try {
            boltMoveLooseFile(file, archiveFolder, context);
        } catch (archiveExtraProjectError) {
            context.warnings.push("Could not archive extra project file " + file.name + ": " + archiveExtraProjectError.message);
        }
    }

    // Remove empty nested folders left behind by archived versions/auto-saves,
    // but never remove the Project folder itself.
    var entries = [];
    try { entries = folders.project.getFiles(); } catch (ignoreProjectSubfolderRead) { entries = []; }
    for (index = 0; index < entries.length; index++) {
        if (entries[index] instanceof Folder) { boltRemoveEmptyFolderTree(entries[index]); }
    }
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
        try {
            if (app.project && app.project.file && normalizePath(file.fsName) === normalizePath(app.project.file.fsName)) {
                return folders.project;
            }
        } catch (ignoreActiveProjectPath) {}
        return boltProjectBackupArchiveFolder(folders);
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

    var allowRootSweep = context.workspaceDedicated !== false;
    if (allowRootSweep) {
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
    } else {
        context.workspaceSweepSkipped = true;
        if (!context.workspaceSweepWarningAdded) {
            context.workspaceSweepWarningAdded = true;
            context.warnings.push(
                "Workspace root looks shared or ambiguous. Bolt collected project media safely but did not move unrelated root files/folders."
            );
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
    if (allowRootSweep) {
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
        context.workspaceVerified = context.workspaceRootExtras.length === 0;
    } else {
        context.workspaceVerified = false;
    }
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
        var archiveFolder = context && context.resourcesFolder
            ? ensureFolder(new Folder(context.resourcesFolder.fsName + "/Unused/Project_Backups"))
            : projectFolder;
        var target = new File(
            archiveFolder.fsName + "/" + originalProjectFile.name
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
            target = uniqueFile(archiveFolder, originalProjectFile.name);
        } else if (
            normalizePath(target.fsName) ===
            normalizePath(projectTarget.fsName)
        ) {
            target = uniqueFile(
                archiveFolder,
                splitFileName(originalProjectFile.name).stem +
                    "_original" +
                    splitFileName(originalProjectFile.name).extension
            );
        }

        boltMoveFileWithUndo(originalProjectFile, target, context);
    } catch (archiveProjectError) {
        context.warnings.push(
            "Old project file could not be archived to Resources/Unused: " +
            archiveProjectError.message
        );
    }
}

function organizeProject() {
    if (!app.project) {
        throw new Error("No After Effects project is open.");
    }

    // Save the current AEP in place before any organize/package changes, then
    // re-detect the workspace and main comp from the actual current project.
    boltSaveProjectSameFile("Organize");
    var organizeAudit = analyzeProject();

    var originalProjectFile = app.project.file
        ? new File(app.project.file.fsName)
        : null;

    var root = organizeAudit.workspaceRoot || chooseWorkspaceRoot();
    if (!root) {
        setStatus("Collection cancelled.", "warning");
        return;
    }

    ensureFolder(root);
    // Decide whether the detected root is a dedicated job folder BEFORE Bolt
    // creates its own core folders. If it looks shared/ambiguous, create one
    // project-named workspace inside it instead of touching unrelated siblings.
    var workspaceDedicated = boltWorkspaceLooksDedicated(root, originalProjectFile);
    var workspaceAutoNested = false;
    if (!workspaceDedicated) {
        var dedicatedRoot = new Folder(root.fsName + "/" + getProjectBaseName());
        if (normalizePath(dedicatedRoot.fsName) !== normalizePath(root.fsName)) {
            root = ensureFolder(dedicatedRoot);
            workspaceDedicated = true;
            workspaceAutoNested = true;
        }
    }
    var folders = getWorkspaceFolders(root);
    ensureFolder(new Folder(folders.resources.fsName + "/Unused"));

    var heroComp = organizeAudit.heroComp || detectMainComp() || resolveHeroComp();
    if (heroComp) { boltStoreCompReference("hero", heroComp); }
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

    var projectExtension = ".aep";
    try {
        var currentProjectExtension = splitFileName(app.project.file ? app.project.file.name : "").extension.toLowerCase();
        if (currentProjectExtension === ".aepx") { projectExtension = ".aepx"; }
    } catch (ignoreProjectExtension) {}

    var projectTarget =
        app.project.file &&
        isPathInside(app.project.file.fsName, folders.project.fsName)
            ? app.project.file
            : nextVersionFile(
                folders.project,
                baseName,
                projectExtension,
                1,
                2
            );

    setProgress(3, "Creating project workspace");
    app.project.save(projectTarget);
    // Save As changes the project identity token. Refresh the main-comp lock now
    // so later UI refreshes do not discard it as a stale reference.
    if (heroComp) { boltStoreCompReference("hero", heroComp); }

    var context = {
        sourceMap:{},
        proxySourceMap:{},
        resourceIndex:boltBuildResourceIndex(folders.resources),
        resourcesFolder:folders.resources,
        workspaceRoot:root,
        workspaceDedicated:workspaceDedicated,
        workspaceAutoNested:workspaceAutoNested,
        workspaceSweepSkipped:false,

        copied:0,
        relinked:0,
        sequences:0,
        alreadyOrganized:0,
        proxiesRelinked:0,

        renderPathsUpdated:0,
        projectItemsMoved:0,
        projectItemsRenamed:0,
        projectItemsLabelled:0,
        emptyFoldersRemoved:0,
        sceneCompsAtRoot:0,
        heroCompName:heroComp ? heroComp.name : "",

        missing:[],
        warnings:[],

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
        protectedLayeredPaths:{},
        layeredRecoveryMap:{}
    };

    setProgress(6, "Checking missing project files");
    boltAutoRelinkMissingFiles(root, context);

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
    boltNormalizeLayeredDesignUsage(layeredDesignGroups);
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
                !!record.unused,
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

        // Apply the same conservative project-name/label cleanup used by Smart Clean.
        // Only generic/copy-style names are changed, and expression-referenced names are protected.
        var organizeNameContext = {
            renamedItems:0, movedItems:0, labelledItems:0, skippedNames:0,
            emptyFoldersRemoved:0, warnings:[]
        };
        var organizeExpressionEntries = boltBuildExpressionIndexSafe(organizeNameContext);
        boltCleanProjectPanelSafe(organizeNameContext, organizeExpressionEntries);
        context.projectItemsRenamed = organizeNameContext.renamedItems;
        context.projectItemsLabelled = organizeNameContext.labelledItems;
        context.projectItemsMoved += organizeNameContext.movedItems;
        context.emptyFoldersRemoved += organizeNameContext.emptyFoldersRemoved;
        if (organizeNameContext.warnings.length) {
            for (index = 0; index < organizeNameContext.warnings.length; index++) {
                context.warnings.push(organizeNameContext.warnings[index]);
            }
        }

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

        setProgress(90, "Verifying collected files");
        boltRequireCompleteCollection(
            collectionRecords,
            proxyRecords,
            folders,
            context
        );

        // The workspace was normalized once after collection and is not mutated
        // again before project-file consolidation. A second full disk sweep and
        // third collection pass only duplicated work on large projects.
        setProgress(95, "Keeping one active project file");
        boltConsolidateProjectFiles(folders, context);

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
        " • names " + context.projectItemsRenamed +
        " • moved " +
        context.workspaceFilesMoved +
        " loose • queue " +
        context.renderPathsUpdated +
        (context.workspaceSweepSkipped
            ? " • shared root preserved"
            : (context.workspaceVerified ? " • root clean" : " • root review")) +
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

function boltShouldSearchFullComputer(count) {
    if (!BOLT_CONFIRM_FULL_COMPUTER_SEARCH) { return true; }
    try {
        return confirm(
            "Bolt found " + count + " missing file(s) that were not inside the workspace.\n\n" +
            "Search the full computer now? This can take time on large drives.\n\n" +
            "Cancel keeps the project safe and lists them as unresolved.",
            true,
            brandTitle("Full Computer Search")
        );
    } catch (ignoreFullSearchConfirm) {
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

function boltAutoRelinkMissingFiles(workspaceRoot, context) {
    var records = boltCollectMissingRelinkRecords();
    context.autoRelinkMissing = records.length;
    if (!records.length) { return; }

    boltBuildLayeredMissingGroups(records);
    var wantedNames = {}, nameMap = {};
    var index, key, candidate, record, group, memberIndex;
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

    if (unresolved.length) {
        if (boltShouldSearchFullComputer(unresolved.length)) {
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
        } else {
            context.fullComputerSearchSkipped = true;
        }
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

                if (!BOLT_ALLOW_RETAINED_LAYER_MIGRATION) {
                    for (memberIndex = 0; memberIndex < group.records.length; memberIndex++) {
                        context.autoRelinkUnresolved.push(
                            group.records[memberIndex].item.name +
                            " | retained-layer PSD relink skipped for safety"
                        );
                    }
                } else if (boltMigrateLayeredDesignGroup(group, candidate, context)) {
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
    boltAutoRelinkMissingFiles(root, context);
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

    function projectContainsItem(target) {
        if (!target || !app.project || !boltAeObjectLooksValid(target)) {
            return false;
        }
        var targetId = boltProjectItemId(target);
        var direct = null;
        try {
            if (targetId.length && typeof app.project.itemByID === "function") {
                direct = app.project.itemByID(parseInt(targetId, 10));
                if (direct && boltAeObjectLooksValid(direct) && boltProjectItemId(direct) === targetId) {
                    return true;
                }
            }
        } catch (ignoreDirectContainsLookup) {}
        var index, item;
        for (index = 1; index <= app.project.numItems; index++) {
            try {
                item = app.project.item(index);
                if (item === target) { return true; }
                if (targetId.length && boltProjectItemId(item) === targetId) { return true; }
            } catch (ignoreProjectContainsProbe) {}
        }
        return false;
    }

    function selectedCompFromProject() {
        var selected = app.project ? app.project.selection : [];
        var index;
        for (index = 0; index < selected.length; index++) {
            if (boltIsCompItem(selected[index])) {
                return selected[index];
            }
        }
        return null;
    }

function boltCompLayerStats(comp) {
        var result = {nested:0, scenes:0, footage:0, text:0, enabled:0};
        var index, layer, source;
        if (!boltIsCompItem(comp)) { return result; }
        for (index = 1; index <= comp.numLayers; index++) {
            try {
                layer = comp.layer(index);
                if (layer.enabled !== false) { result.enabled++; }
                source = layer.source;
                if (boltIsCompItem(source)) {
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

    function boltCompNameKey(comp) {
        return safeString(boltProjectItemName(comp, "")).toLowerCase().replace(/[^a-z0-9]+/g, "");
    }


    function boltMainCompScore(comp, activeComp, selectedComp, topLevelNonSceneCount, projectKey, queuedCompIds) {
        if (!boltIsCompItem(comp) || isBoltLayerExportComp(comp)) { return -999999; }

        var name = safeString(comp.name);
        var compKey = boltCompNameKey(comp);
        var useCount = compUseCount(comp);
        var duration = Math.max(0, Number(comp.duration) || 0);
        var layerCount = Math.max(0, Number(comp.numLayers) || 0);
        var stats = boltCompLayerStats(comp);
        var sceneNamed = isNamedSceneComp(comp);
        var score = 0;

        // Top-level comps are much more likely to be master/edit comps.
        score += useCount === 0 ? 320 : Math.max(-180, 40 - useCount * 48);
        if (useCount === 0 && !sceneNamed && topLevelNonSceneCount === 1) { score += 360; }

        // A project filename such as "mk elec_reel 1_v01.aep" matching a comp
        // called "mk elec_reel 1" is one of the strongest signals available.
        if (projectKey && compKey) {
            if (projectKey === compKey) { score += 650; }
            else if (projectKey.length > 4 && compKey.length > 4 &&
                    (projectKey.indexOf(compKey) >= 0 || compKey.indexOf(projectKey) >= 0)) { score += 280; }
        }

        // Master edits commonly contain many scene/precomp children.
        score += Math.min(150, stats.nested * 18);
        score += Math.min(340, stats.scenes * 70);
        if (stats.scenes >= 2) { score += 150; }
        score += Math.min(65, stats.footage * 2.2);
        score += Math.min(55, stats.text * 2.0);
        score += Math.min(80, duration * 1.4);
        score += Math.min(55, layerCount * 1.1);

        try { if (comp.parentFolder === app.project.rootFolder) { score += 45; } } catch (ignoreMainRoot) {}
        if (queuedCompIds[boltProjectItemId(comp)]) { score += 210; }

        if (/(?:^|[ _#\-])(main|master|hero|final|output|render|edit|film|ovc|full|delivery)(?:$|[ _\-])/i.test(name)) { score += 285; }
        if (/(?:^|[ _\-])v\d+(?:$|[ _\-])/i.test(name)) { score += 20; }

        // Scene/shot/precomp names must not beat the actual edit just because
        // the user currently has Scene 6 open in the viewer.
        if (sceneNamed) { score -= 900; }
        if (/(?:^|[ _\-])(scene|shot|sequence|seq|part|chapter|segment)[ _\-]*\d+/i.test(name)) { score -= 420; }
        if (/(?:^|[ _\-])(precomp|pre-comp|preview|test|temp|old|backup|copy)(?:$|[ _\-])/i.test(name)) { score -= 260; }
        if (/^BOLT_/i.test(name)) { score -= 900; }

        // Current selection/viewer is only a tie-breaker, never the main signal.
        if (selectedComp === comp && !sceneNamed) { score += 35; }
        if (activeComp === comp && !sceneNamed) { score += 20; }
        return score;
    }

    function detectMainComp() {
        if (!app.project) { return null; }

        var activeComp = boltIsCompItem(app.project.activeItem) ? app.project.activeItem : null;
        var selectedComp = selectedCompFromProject();
        var best = null, bestScore = -999999;
        var index, item, score, compId, queueItem;
        var topLevelNonSceneCount = 0;
        var projectKey = boltProjectIdentityKey();
        var itemCount = app.project.numItems;
        var comps = [];
        var queuedCompIds = {};

        for (index = 1; index <= itemCount; index++) {
            item = app.project.item(index);
            if (!boltIsCompItem(item)) { continue; }
            comps.push(item);
            if (compUseCount(item) === 0 && !isNamedSceneComp(item) && !isBoltLayerExportComp(item)) {
                topLevelNonSceneCount++;
            }
        }

        try {
            for (index = 1; index <= app.project.renderQueue.numItems; index++) {
                queueItem = app.project.renderQueue.item(index);
                compId = boltProjectItemId(queueItem ? queueItem.comp : null);
                if (compId.length) { queuedCompIds[compId] = true; }
            }
        } catch (ignoreRenderQueueIndex) {}

        for (index = 0; index < comps.length; index++) {
            item = comps[index];
            score = boltMainCompScore(item, activeComp, selectedComp, topLevelNonSceneCount, projectKey, queuedCompIds);
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
        boltClearInvalidObjectRefs();

        if (preferLocked) {
            var stored = boltResolveStoredComp("render");
            if (stored) { return stored; }
        }

        var selected = selectedCompFromProject();
        var active = boltIsCompItem(app.project.activeItem) ? app.project.activeItem : null;

        // The Use button intentionally follows the user's current selection/viewer.
        if (!preferLocked) {
            if (selected) { return selected; }
            if (active) { return active; }
        }

        // Automatic mode uses the project-wide main-comp score, so an open Scene 6
        // does not replace the actual master composition. Cache the resolved target
        // by ID/name so tab switching does not rescan every composition repeatedly.
        var automatic = detectMainComp() || selected || active;
        return automatic ? boltStoreCompReference("render", automatic) : null;
    }

    function getDuplicateSourceComp() {
        var comp = selectedCompFromProject();
        if (!comp && app.project && boltIsCompItem(app.project.activeItem)) {
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
    function lockRenderComp() {
        var comp = resolveAvailableComp(false);
        if (!boltIsCompItem(comp)) {
            throw new Error("Select, open, or create a main composition first.");
        }
        boltStoreCompReference("render", comp);
        refreshRenderDetails(true);
        setStatus("Render comp locked: " + boltProjectItemName(comp, "Selected comp"), "ok");
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
    function refreshRenderDetails() {
        if (!state.ui) { return; }
        var comp = resolveAvailableComp(true);
        if (!boltIsCompItem(comp)) {
            state.ui.renderCompName.text = "Comp: none";
            return;
        }
        var compName = boltProjectItemName(comp, "Selected comp");
        if (!trim(state.ui.renderName.text).length || state.ui.renderName.text === state.ui.renderName._lastAutoName) {
            state.ui.renderName.text = compName;
            state.ui.renderName._lastAutoName = compName;
        }
        var lockedId = boltProjectItemId(comp);
        var isLocked = state.lockedRenderCompId.length && lockedId === state.lockedRenderCompId;
        state.ui.renderCompName.text = "Comp: " + compName + (isLocked ? "  [locked]" : "");
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
        if (!boltIsCompItem(comp)) { throw new Error("Choose or open a composition to render."); }
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
                try { rqItem.applyTemplate(renderTemplate); } catch (ignoreRenderTemplateApply) {}
            }

            outputModule = rqItem.outputModule(1);
            if (templateName.length) {
                try {
                    outputModule.applyTemplate(templateName);
                    outputModule = rqItem.outputModule(1);
                    appliedTemplate = templateName;
                } catch (ignoreTemplateApply) {
                    appliedTemplate = "";
                    outputModule = rqItem.outputModule(1);
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
            return rqItem;
        } catch (error) {
            if (rqItem) { try { rqItem.remove(); } catch (ignoreQueueCleanup) {} }
            throw error;
        } finally {
            app.endUndoGroup();
        }
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

    // ---------------- MOTION AND ACTION HELPERS ----------------

    function boltFindNamedEffect(layer, effectName) {
        var effects = layer.property("ADBE Effect Parade"), i;
        if (!effects) { return null; }
        for (i = 1; i <= effects.numProperties; i++) {
            if (effects.property(i).name === effectName) { return effects.property(i); }
        }
        return null;
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

    function rotate3DVector(v, orientation, rx, ry, rz) {
        function rotX(a,p){var r=a*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return [p[0],p[1]*c-p[2]*s,p[1]*s+p[2]*c];}
        function rotY(a,p){var r=a*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return [p[0]*c+p[2]*s,p[1],-p[0]*s+p[2]*c];}
        function rotZ(a,p){var r=a*Math.PI/180,c=Math.cos(r),s=Math.sin(r);return [p[0]*c-p[1]*s,p[0]*s+p[1]*c,p[2]];}
        var out = [v[0],v[1],v[2] || 0];
        out = rotX(orientation[0] || 0, out); out = rotY(orientation[1] || 0, out); out = rotZ(orientation[2] || 0, out);
        out = rotX(rx || 0, out); out = rotY(ry || 0, out); out = rotZ(rz || 0, out);
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

    function boltFocusEffectControls(comp, layer) {
        if (!comp || !layer) { return; }
        var selected = [], index;
        try {
            selected = comp.selectedLayers || [];
            for (index = 0; index < selected.length; index++) {
                try { selected[index].selected = false; } catch (ignoreDeselectEffectLayer) {}
            }
            layer.selected = true;
        } catch (ignoreEffectLayerSelection) {}
        try { comp.openInViewer(); } catch (ignoreEffectViewer) {}
        // Effect Controls is a native AE panel. Opening it is best-effort only;
        // layer selection is sufficient when the panel is already visible.
        try {
            var commandId = app.findMenuCommandId("Effect Controls");
            if (commandId && commandId > 0) { app.executeCommand(commandId); }
        } catch (ignoreEffectControlsCommand) {}
    }

    function applyDeepGlow() {
        var comp = activeCompOrThrow(), layers = selectedLayersOrThrow(comp);
        // Detailed Glow tuning belongs in native AE Effect Controls, not Bolt.
        // These baselines preserve the previous default visual result.
        var size = 55;
        var intensity = 1.2;
        var preset = selectedGlowPreset(), applied = 0, skipped = 0, effectsAdded = 0, i, j;
        var focusLayer = null;
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
                if (layerPasses > 0) {
                    applied++;
                    if (!focusLayer) { focusLayer = layer; }
                } else { skipped++; }
            }
        } finally { app.endUndoGroup(); }
        if (!applied) {
            throw new Error("Glow could not be added. Select a text, shape, image, solid or video layer that accepts effects.");
        }
        boltFocusEffectControls(comp, focusLayer);
        setStatus(preset.name + " Glow applied • adjust in Effect Controls" + (skipped ? " • " + skipped + " skipped" : ""), skipped ? "warning" : "ok");
    }

    function applyVignette() {
        var comp = activeCompOrThrow(), amount = 35;
        var layer = null, i, created = false;
        app.beginUndoGroup("Bolt Vignette");
        try {
            for (i = 1; i <= comp.numLayers; i++) {
                if (comp.layer(i).name === "BOLT_VIGNETTE") { layer = comp.layer(i); break; }
            }
            if (!layer) {
                layer = comp.layers.addSolid([1,1,1], "BOLT_VIGNETTE", comp.width, comp.height, comp.pixelAspect, comp.duration);
                created = true;
            }
            try { layer.locked = false; } catch (ignoreUnlockVignette) {}
            layer.adjustmentLayer = true;
            layer.startTime = 0;
            layer.inPoint = 0;
            layer.outPoint = comp.duration;
            var fx = boltFindNamedEffect(layer, "Bolt Vignette");
            if (!fx) { fx = addEffectSafe(layer, "CS Vignette", "Bolt Vignette"); }
            if (!fx) {
                if (created) { layer.remove(); }
                throw new Error("CC Vignette is unavailable in this After Effects installation.");
            }
            safeSetEffectIndex(fx, 1, -amount);
            safeSetEffectIndex(fx, 2, 60);
            safeSetEffectIndex(fx, 3, 25);
        } finally { app.endUndoGroup(); }
        // Keep the adjustment layer editable and take the user directly to its native controls.
        boltFocusEffectControls(comp, layer);
        setStatus("Vignette applied • adjust in Effect Controls", "ok");
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

    function windowsPowerShellExecutable() {
        var root="";
        try { root=$.getenv("SystemRoot")||$.getenv("WINDIR")||""; } catch(ignoreEnv) {}
        if(root.length){
            var full=new File(root+"/System32/WindowsPowerShell/v1.0/powershell.exe");
            if(full.exists){return full.fsName;}
        }
        return "powershell.exe";
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
        if(boltLayerSafeGet(function(){return boltIsCompItem(layer.source);},false) && result.confidence<88){choose("PRECOMP",87,"Nested composition");}
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
    function boltLayerUniqueName(base, currentName, reserved, occupied) {
        var candidate = base, suffix = 1, key, currentKey = boltLayerLower(currentName);
        while (true) {
            key = boltLayerLower(candidate);
            var occupiedByOther = (occupied[key] || 0) - (key === currentKey ? 1 : 0);
            if (!reserved[key] && occupiedByOther <= 0) {
                reserved[key] = true;
                return candidate;
            }
            suffix++;
            candidate = base + "_" + (suffix < 10 ? "0" : "") + suffix;
        }
    }
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
        for(i=1;i<=comp.numLayers;i++){source=boltLayerSafeGet(function(){return comp.layer(i).source;},null);if(boltIsCompItem(source)){boltCollectNestedComps(source,output,seen);}}
    }

function boltResolveLayerScope(scope) {
    var output = [], selected, i, hero, item;
    if (scope === "Active Comp") {
        if (boltIsCompItem(app.project.activeItem)) {
            output.push(app.project.activeItem);
        }
    } else if (scope === "Selected Comps") {
        selected = app.project.selection || [];
        for (i = 0; i < selected.length; i++) {
            if (boltIsCompItem(selected[i])) { output.push(selected[i]); }
        }
    } else if (scope === "Hero + Nested") {
        hero = resolveHeroComp();
        if (hero) { boltCollectNestedComps(hero, output, {}); }
    } else if (scope === "All Comps") {
        for (i = 1; i <= app.project.numItems; i++) {
            item = app.project.item(i);
            if (boltIsCompItem(item)) { output.push(item); }
        }
    }
    return output;
}

    function boltWalkLayerProperties(node,callback){
        if(!node){return;} var count=boltLayerSafeGet(function(){return node.numProperties;},0),i,child;
        if(count===0){callback(node);return;}
        for(i=1;i<=count;i++){child=boltLayerSafeGet(function(){return node.property(i);},null);if(child){boltWalkLayerProperties(child,callback);}}
    }
    function boltBuildExpressionIndex(){
        var entries=[],i,l,comp,layer;
        for(i=1;i<=app.project.numItems;i++){
            comp=app.project.item(i);if(!boltIsCompItem(comp)){continue;}
            for(l=1;l<=comp.numLayers;l++){layer=comp.layer(l);boltWalkLayerProperties(layer,function(prop){var exp=boltLayerSafeGet(function(){return prop.expression;},"");if(exp){entries.push({comp:comp,property:prop,expression:exp});}});}
        }
        return entries;
    }
    function boltEscapeRegex(value){return safeString(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
    function boltExpressionHasDynamicCall(expression, callName) {
        var text = safeString(expression);
        if (!text.length) { return false; }
        var literal = new RegExp(
            callName + "\\s*\\(\\s*([\"'])[^\"']+\\1\\s*\\)",
            "ig"
        );
        text = text.replace(literal, "");
        return new RegExp(callName + "\\s*\\(", "i").test(text);
    }

    function boltProjectNamesHaveDynamicReferences(entries) {
        if (!entries) { return true; }
        var index, expression;
        for (index = 0; index < entries.length; index++) {
            expression = safeString(entries[index].expression);
            if (
                boltExpressionHasDynamicCall(expression, "comp") ||
                boltExpressionHasDynamicCall(expression, "footage")
            ) {
                return true;
            }
        }
        return false;
    }

    function boltCompHasDynamicLayerReferences(comp, entries) {
        if (!entries) { return true; }
        var index, expression;
        for (index = 0; index < entries.length; index++) {
            if (entries[index].comp !== comp) { continue; }
            expression = safeString(entries[index].expression);
            if (boltExpressionHasDynamicCall(expression, "layer")) { return true; }
        }
        return false;
    }

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
function readSmartLayerOptions() {
    // Fixed production policy: whole-project, conservative naming only.
    return { scope:"All Comps", namingStyle:"Compact", renamePolicy:"Safe" };
}
    function smartLayerAnalyze(silent){
        if(!app.project){throw new Error("Open an After Effects project first.");}
        var options=readSmartLayerOptions();
        var comps=boltResolveLayerScope(options.scope);
        if(!comps.length){throw new Error("No compositions found for Smart Clean.");}

        var records=[];
        var audit={comps:comps.length,layers:0,renames:0};
        var i,l,j,comp,layer,names,key,detect,duplicate,record,compRecords,ordered,categoryCounts,sequence,base,reserved;

        // Production Smart Clean only needs role detection, safe naming and labels.
        // Do not calculate trim plans, markers, guide conversion or other legacy
        // cleanup data that the visible Smart Clean action never applies.
        for(i=0;i<comps.length;i++){
            comp=comps[i];
            names={};
            reserved={};
            categoryCounts={};
            compRecords=[];

            for(l=1;l<=comp.numLayers;l++){
                layer=comp.layer(l);
                key=boltLayerLower(layer.name);
                names[key]=(names[key]||0)+1;
            }

            for(l=1;l<=comp.numLayers;l++){
                layer=comp.layer(l);
                audit.layers++;
                key=boltLayerLower(layer.name);
                duplicate=names[key]>1;
                detect=boltDetectLayerCategory(layer,comp);
                record={
                    comp:comp,
                    layer:layer,
                    layerId:boltLayerSafeGet(function(){return layer.id;},0),
                    layerIndex:l,
                    oldName:layer.name,
                    newName:layer.name,
                    category:detect.category,
                    confidence:detect.confidence,
                    reason:detect.reason,
                    duplicate:duplicate,
                    generic:BOLT_GENERIC_LAYER_RE.test(trim(layer.name)),
                    messy:boltLayerNameIsMessy(layer,duplicate),
                    refs:0,
                    protectedLayer:boltIsTimelineGuide(layer),
                    contextRename:false,
                    contextRole:"",
                    evidence:detect.evidence||"",
                    inPoint:Number(layer.inPoint)||0,
                    outPoint:Number(layer.outPoint)||0,
                    durationFrames:Math.max(
                        0,
                        ((Number(layer.outPoint)||0) - (Number(layer.inPoint)||0)) /
                            boltLayerFrameDuration(comp)
                    )
                };
                compRecords.push(record);
            }

            boltRefineLayerContexts(compRecords,comp);
            ordered=compRecords.slice(0);
            ordered.sort(function(a,b){
                return a.inPoint===b.inPoint ? a.layerIndex-b.layerIndex : a.inPoint-b.inPoint;
            });

            for(j=0;j<ordered.length;j++){
                record=ordered[j];
                categoryCounts[record.category]=(categoryCounts[record.category]||0)+1;
                sequence=categoryCounts[record.category];
                base=boltContextualName(record,options,sequence);
                record.newName=boltLayerUniqueName(base,record.oldName,reserved,names);
                record.renameCandidate=boltShouldRename(record,options);
                if(record.renameCandidate){audit.renames++;}
            }

            for(j=0;j<compRecords.length;j++){records.push(compRecords[j]);}
        }

        state.layerAnalysis={records:records,audit:audit,options:options};
        if(!silent){setStatus("Layer audit: "+audit.comps+" comps • "+audit.layers+" layers","ok");}
        return state.layerAnalysis;
    }
    function smartLayerFindSnapshotLayer(change){
        var comp=change.comp,i,layer;if(!comp||!projectContainsItem(comp)){return null;}
        if(change.layerId){for(i=1;i<=comp.numLayers;i++){layer=comp.layer(i);if(boltLayerSafeGet(function(){return layer.id;},0)===change.layerId){return layer;}}}
        if(change.layerIndex>=1&&change.layerIndex<=comp.numLayers){layer=comp.layer(change.layerIndex);if(!change.oldName||layer.name===change.oldName||layer.name===change.newName){return layer;}}
        for(i=1;i<=comp.numLayers;i++){layer=comp.layer(i);if(layer.name===change.oldName||layer.name===change.newName){return layer;}}
        return null;
    }
function boltProjectCleanRefreshStructure() {
        var list = state.ui && state.ui.projectStructureList ? state.ui.projectStructureList : null;
        var status = state.ui && state.ui.projectStructureStatus ? state.ui.projectStructureStatus : null;
        if (!app.project || !list) { return; }
        try {
            list.removeAll();
            var names = ["01_Comps", "02_Images", "03_Video", "04_Audio", "05_Other"];
            var index, folder, count, hero = 0, scenes = 0, item;
            var heroComp = resolveHeroComp();
            for (index = 0; index < names.length; index++) {
                folder = findTopLevelProjectFolder(names[index]);
                count = 0;
                try { count = folder ? folder.numItems : 0; } catch (ignoreCount) { count = 0; }
                list.add("item", names[index] + "    " + count + " item" + (count === 1 ? "" : "s"));
            }
            if (status) {
                for (index = 1; index <= app.project.numItems; index++) {
                    try {
                        item = app.project.item(index);
                        if (boltIsCompItem(item) && item.parentFolder === app.project.rootFolder) {
                            if (isNamedSceneComp(item)) { scenes++; }
                            else if (item === heroComp) { hero = 1; }
                        }
                    } catch (ignoreRootItem) {}
                }
                status.text = (hero ? "Hero ready" : "Hero automatic") + "  •  " + scenes + " scene comp(s) at root";
            }
        } catch (ignoreRefreshProjectStructure) {}
    }

    function boltProjectCleanLabelForItem(item, heroComp) {
        var file, category;
        try {
            if (boltIsFolderItem(item)) {
                if (isCoreTopLevelFolder(item)) { return 2; }
                return 1;
            }
        } catch (ignoreFolderLabel) {}
        if (boltIsCompItem(item)) {
            if (heroComp && item === heroComp) { return 4; }
            if (isNamedSceneComp(item)) { return 11; }
            if (isBoltLayerExportComp(item)) { return 8; }
            return 5;
        }
        if (boltIsFootageItem(item)) {
            file = boltGetFootageFile(item) || boltGetMissingFootageFile(item);
            if (file) {
                category = categoryForFile(file);
                if (category === "Images") { return 13; }
                if (category === "Video") { return 10; }
                if (category === "Audio") { return 9; }
            }
            return 16;
        }
        return 1;
    }

    function boltSetProjectItemLabelSafe(item, labelIndex) {
        if (!item) { return false; }
        try {
            if (item.label !== labelIndex) {
                item.label = labelIndex;
                return true;
            }
        } catch (ignoreLabelProjectItem) {}
        return false;
    }

    function boltCleanNameText(name) {
        var text = sanitizeName(name);
        text = text.replace(/\s+/g, " ");
        text = text.replace(/\s*copy\s*\d*$/i, "");
        text = text.replace(/\s*\/\s*/g, " _ ");
        text = trim(text);
        return text.length ? text : "Untitled";
    }

    function boltProjectItemNameIsGeneric(name) {
        var n = trim(name);
        return /^(?:comp|composition|precomp|pre-comp|folder|solid|footage|audio|video|image|placeholder|layer|shape|text|group|item)\s*\d*$/i.test(n) ||
            /^untitled(?:\s*\d*)?$/i.test(n) ||
            /^null\s*\d*$/i.test(n);
    }

    function boltProjectNameHasUnsafeReference(name, expressionEntries) {
        if (!name || !expressionEntries || !expressionEntries.length) { return false; }
        var escaped = boltEscapeRegex(name);
        var quoted = new RegExp("[\\\"']" + escaped + "[\\\"']");
        var index, exp;
        for (index = 0; index < expressionEntries.length; index++) {
            exp = safeString(expressionEntries[index].expression);
            if (exp.indexOf(name) >= 0 && quoted.test(exp)) { return true; }
        }
        return false;
    }

    function boltUniqueProjectItemName(baseName, ignoredItem) {
        var base = boltCleanNameText(baseName);
        var candidate = base;
        var count = 2;
        while (projectItemNameExists(candidate, ignoredItem)) {
            candidate = base + " " + count;
            count++;
        }
        return candidate;
    }

    function boltSuggestedProjectItemName(item) {
        var oldName = boltCleanNameText(item ? item.name : "Untitled");
        var file = null, parts, stem;
        if (!item) { return oldName; }
        try { file = boltGetFootageFile(item) || boltGetMissingFootageFile(item); } catch (ignoreFootageNameSource) { file = null; }
        if (file) {
            parts = splitFileName(file.name);
            stem = boltCleanNameText(parts.stem || file.name);
            // File-backed items get file-based names only when the current name is clearly generic.
            if (boltProjectItemNameIsGeneric(oldName)) { return stem; }
        }
        if (/\s+copy\s*\d*$/i.test(item.name)) { return oldName; }
        if (boltProjectItemNameIsGeneric(oldName)) {
            var numberMatch = oldName.match(/(\d+)\s*$/);
            var suffixNumber = numberMatch ? parseInt(numberMatch[1], 10) : 0;
            if (boltIsCompItem(item)) { return suffixNumber ? ("Comp " + padNumber(suffixNumber, 2)) : "Comp"; }
            if (boltIsFootageItem(item)) { return suffixNumber ? ("Footage " + padNumber(suffixNumber, 2)) : "Footage"; }
        }
        return oldName;
    }

    function boltRenameProjectItemSafely(item, expressionEntries, context) {
        var oldName, proposed, finalName;
        if (!item || boltIsFolderItem(item)) { return false; }
        try { oldName = item.name; } catch (ignoreOldProjectName) { return false; }
        proposed = boltSuggestedProjectItemName(item);
        if (!proposed || proposed === oldName) { return false; }
        if (!boltProjectItemNameIsGeneric(oldName) && !/\s+copy\s*\d*$/i.test(oldName)) { return false; }
        if (boltProjectNameHasUnsafeReference(oldName, expressionEntries)) {
            context.skippedNames++;
            return false;
        }
        finalName = boltUniqueProjectItemName(proposed, item);
        try {
            item.name = finalName;
            context.renamedItems++;
            return true;
        } catch (renameProjectItemError) {
            context.warnings.push("Could not rename " + oldName + ": " + renameProjectItemError.message);
        }
        return false;
    }

    function boltBuildExpressionIndexSafe(context) {
        try { return boltBuildExpressionIndex(); }
        catch (expressionIndexError) {
            if (context && context.warnings) {
                context.warnings.push(
                    "Names were preserved because expression references could not be indexed safely: " +
                    expressionIndexError.message
                );
            }
            return null;
        }
    }

    function boltProjectCleanDestination(item, coreFolders, heroComp) {
        var category, file;
        if (!item || boltIsFolderItem(item)) { return null; }
        if (boltIsCompItem(item)) {
            if (heroComp && item === heroComp) { return app.project.rootFolder; }
            if (isNamedSceneComp(item)) { return app.project.rootFolder; }
            return coreFolders["01_Comps"];
        }
        if (boltIsFootageItem(item)) {
            file = boltGetFootageFile(item) || boltGetMissingFootageFile(item);
            if (file) {
                category = categoryForFile(file);
                if (category === "Images") { return coreFolders["02_Images"]; }
                if (category === "Video") { return coreFolders["03_Video"]; }
                if (category === "Audio") { return coreFolders["04_Audio"]; }
            }
            return coreFolders["05_Other"];
        }
        return coreFolders["05_Other"];
    }

    function boltCleanProjectPanelSafe(context, expressionEntries) {
        var coreFolders = ensureCoreProjectFolders();
        var heroComp = resolveHeroComp();
        var leafItems = [];
        var index, item, destination;

        if (expressionEntries === undefined) {
            expressionEntries = boltBuildExpressionIndexSafe(context);
        }
        var allowProjectRenames = expressionEntries !== null && !boltProjectNamesHaveDynamicReferences(expressionEntries);
        if (expressionEntries !== null && !allowProjectRenames && context && context.warnings) {
            context.warnings.push(
                "Project-item names were preserved because dynamic comp()/footage() expression lookups were detected."
            );
        }

        for (index = 1; index <= app.project.numItems; index++) {
            try {
                item = app.project.item(index);
                if (!boltIsFolderItem(item)) { leafItems.push(item); }
            } catch (ignoreLeafSnapshot) {}
        }

        for (index = 0; index < leafItems.length; index++) {
            item = leafItems[index];
            try {
                if (boltSetProjectItemLabelSafe(item, boltProjectCleanLabelForItem(item, heroComp))) { context.labelledItems++; }
                if (allowProjectRenames) {
                    boltRenameProjectItemSafely(item, expressionEntries, context);
                }
                destination = boltProjectCleanDestination(item, coreFolders, heroComp);
                if (destination && item.parentFolder !== destination) {
                    item.parentFolder = destination;
                    context.movedItems++;
                }
            } catch (projectItemCleanError) {
                context.warnings.push("Project item cleanup skipped: " + projectItemCleanError.message);
            }
        }

        for (index = 0; index < BOLT_CORE_PROJECT_FOLDERS.length; index++) {
            item = coreFolders[BOLT_CORE_PROJECT_FOLDERS[index]];
            if (boltSetProjectItemLabelSafe(item, boltProjectCleanLabelForItem(item, heroComp))) { context.labelledItems++; }
        }

        removeEmptyNonCoreProjectFolders(context);
        return context;
    }

    function boltCleanCompLayersSafe(context, expressionEntries) {
        var analysis = null;
        var threshold = 90;
        var dynamicLayerComps = {};
        var i, r, layer, oldLocked, labelValue, roleAllowed, compKey, canRenameLayer;

        try { analysis = smartLayerAnalyze(true); }
        catch (scanError) {
            context.warnings.push("Layer scan skipped: " + scanError.message);
            state.layerAnalysis = null;
            return context;
        }

        if (expressionEntries === undefined) {
            expressionEntries = boltBuildExpressionIndexSafe(context);
        }

        for (i = 0; i < analysis.records.length; i++) {
            r = analysis.records[i];
            layer = smartLayerFindSnapshotLayer(r);
            if (!layer) { context.skippedLayers++; continue; }
            roleAllowed = r.confidence >= threshold;
            if (!roleAllowed) { continue; }

            compKey = boltProjectItemKey(r.comp) || boltProjectItemName(r.comp, "comp");
            if (dynamicLayerComps[compKey] === undefined) {
                dynamicLayerComps[compKey] = expressionEntries === null
                    ? true
                    : boltCompHasDynamicLayerReferences(r.comp, expressionEntries);
            }
            canRenameLayer = expressionEntries !== null && !dynamicLayerComps[compKey];

            oldLocked = boltLayerSafeGet(function(){ return layer.locked; }, false);
            try {
                try { layer.locked = false; } catch (ignoreUnlockForClean) {}

                labelValue = BOLT_LAYER_LABELS[r.category] || 1;
                try {
                    if (layer.label !== labelValue) {
                        layer.label = labelValue;
                        context.labelledLayers++;
                    }
                } catch (ignoreLayerLabelClean) {}

                // Rename only when expression references were indexed successfully.
                // If that scan fails, labels still apply but names are preserved.
                if (
                    canRenameLayer &&
                    r.renameCandidate &&
                    r.oldName !== r.newName &&
                    (r.generic || r.duplicate || r.category === "THUMBNAIL")
                ) {
                    r.refs = boltCountLayerReferences(r.comp, r.oldName, expressionEntries);
                    if (r.refs > 0) {
                        context.skippedNames++;
                    } else {
                        try {
                            layer.name = r.newName;
                            context.renamedLayers++;
                        } catch (ignoreLayerRenameClean) {
                            context.skippedLayers++;
                        }
                    }
                } else if (!canRenameLayer && r.renameCandidate && r.oldName !== r.newName) {
                    context.skippedNames++;
                }
            } catch (layerCleanError) {
                context.skippedLayers++;
                context.warnings.push("Layer cleanup skipped for " + r.oldName + ": " + layerCleanError.message);
            } finally {
                try { layer.locked = oldLocked; } catch (ignoreRestoreCleanLock) {}
            }
        }
        return context;
    }

    
    // ---------------- BOLT 15.8 SMART CLEAN ----------------
    // Production safety rule: Smart Clean may shorten a comp only when every
    // real content layer is already inside the proposed end. Audio/music,
    // moving media, precomps and ordinary content layers are hard boundaries.
    // Automatic layer-range edits are limited to clearly identified support
    // layers. Smart Clean never changes a content layer's in-point.

    function boltSmartCleanIsCameraOrLight(layer) {
        if (!layer) { return false; }
        try { if (typeof CameraLayer !== "undefined" && layer instanceof CameraLayer) { return true; } }
        catch (ignoreSmartCamera) {}
        try { if (typeof LightLayer !== "undefined" && layer instanceof LightLayer) { return true; } }
        catch (ignoreSmartLight) {}
        return false;
    }

    function boltSmartCleanLayerIsStructural(layer) {
        if (!layer) { return true; }
        try { if (layer.nullLayer === true) { return true; } } catch (ignoreSmartNull) {}
        try { if (layer.guideLayer === true) { return true; } } catch (ignoreSmartGuide) {}
        try { if (layer.adjustmentLayer === true) { return true; } } catch (ignoreSmartAdjustment) {}
        if (boltSmartCleanIsCameraOrLight(layer)) { return true; }
        return false;
    }

    function boltSmartCleanLayerHasAnyAudio(layer) {
        if (!layer) { return false; }
        // Protect audio even when temporarily muted/disabled. Muting a music
        // layer must never make Smart Clean treat its tail as disposable.
        try { if (layer.hasAudio === true) { return true; } } catch (ignoreSmartAnyAudio) {}
        try { if (isAudioExtension(boltLayerExtension(layer))) { return true; } } catch (ignoreSmartAudioExt) {}
        return false;
    }

    function boltSmartCleanLayerHasLiveAudio(layer) {
        try { return !!(layer && layer.hasAudio === true && layer.audioEnabled !== false); }
        catch (ignoreSmartAudio) { return false; }
    }

    function boltSmartCleanLayerIsMovingMedia(layer) {
        if (!layer) { return false; }
        var ext = "";
        try { ext = boltLayerExtension(layer); } catch (ignoreSmartMovingExt) { ext = ""; }
        if (isVideoExtension(ext) || isAudioExtension(ext)) { return true; }
        try {
            if (boltIsFootageItem(layer.source) && layer.source.mainSource && layer.source.mainSource.isStill === false) {
                return true;
            }
        } catch (ignoreSmartMovingSource) {}
        return false;
    }

    function boltSmartCleanLayerIsNestedComp(layer) {
        try { return !!(layer && boltIsCompItem(layer.source)); }
        catch (ignoreSmartNestedComp) { return false; }
    }

    function boltSmartCleanLayerEnabled(layer) {
        try { return layer && layer.enabled !== false; }
        catch (ignoreSmartEnabled) { return true; }
    }

    function boltSmartCleanLayerLooksLikeSupport(layer, comp) {
        if (!layer || !comp) { return false; }
        var duration = Math.max(comp.frameDuration || 0.04, Number(comp.duration) || 0);
        var span = 0, evidence = "";
        try { span = Math.max(0, Number(layer.outPoint) - Number(layer.inPoint)); } catch (ignoreSmartSpan) {}
        if (span < duration * 0.82) { return false; }
        try { evidence = boltLayerEvidence(layer); } catch (ignoreSmartEvidence) { evidence = safeString(layer.name); }
        return /(?:^|\b)(?:bg|background|backdrop|vignette|grade|grading|color grade|colour grade|grain|texture|overlay|adjustment|controller|control|ctrl|guide|safe area|safe zone)(?:\b|$)/i.test(evidence);
    }

    function boltSmartCleanLayerIsTimingProtected(layer, comp) {
        if (!layer) { return true; }
        if (boltSmartCleanLayerHasAnyAudio(layer)) { return true; }
        if (boltSmartCleanLayerIsMovingMedia(layer)) { return true; }
        if (boltSmartCleanLayerIsNestedComp(layer)) { return true; }
        try { if (layer.timeRemapEnabled === true) { return true; } } catch (ignoreSmartProtectedRemap) {}
        try {
            var stretch = Number(layer.stretch);
            if (isFinite(stretch) && Math.abs(stretch - 100) > 0.001) { return true; }
        } catch (ignoreSmartProtectedStretch) {}
        // Any ordinary visible layer that is not explicitly recognized as a
        // support/background layer is real content and therefore a hard bound.
        if (!boltSmartCleanLayerIsStructural(layer) && !boltSmartCleanLayerLooksLikeSupport(layer, comp)) {
            return true;
        }
        return false;
    }

    function boltSmartCleanLayerCountsForRange(layer, comp, primaryOnly) {
        if (!layer || !comp) { return false; }
        // Audio is a hard boundary regardless of mute/visibility state.
        if (boltSmartCleanLayerHasAnyAudio(layer)) { return true; }
        if (!boltSmartCleanLayerEnabled(layer)) {
            // Disabled moving media/precomps are still protected because users
            // often disable them temporarily while editing.
            return boltSmartCleanLayerIsMovingMedia(layer) || boltSmartCleanLayerIsNestedComp(layer);
        }
        if (boltSmartCleanIsCameraOrLight(layer)) { return false; }
        if (primaryOnly && boltSmartCleanLayerLooksLikeSupport(layer, comp)) { return false; }
        if (boltSmartCleanLayerIsStructural(layer)) { return false; }
        return true;
    }

    function boltSmartCleanCompMarkerRange(comp, range) {
        var marker = null, index, time;
        try { marker = comp.markerProperty; } catch (ignoreSmartCompMarkers) { marker = null; }
        if (!marker || !marker.numKeys || !range || !range.valid) { return range; }
        for (index = 1; index <= marker.numKeys; index++) {
            try {
                time = Number(marker.keyTime(index));
                if (!isFinite(time)) { continue; }
                range.start = Math.min(range.start, Math.max(0, time));
                range.end = Math.max(range.end, Math.min(comp.duration, time + comp.frameDuration));
            } catch (ignoreSmartMarkerTime) {}
        }
        return range;
    }

    function boltSmartCleanCompRange(comp) {
        var duration = Math.max(Number(comp.frameDuration) || 0.04, Number(comp.duration) || 0);
        var frame = Math.max(0.001, Number(comp.frameDuration) || 0.04);
        var primaryStart = 1e20, primaryEnd = -1;
        var fallbackStart = 1e20, fallbackEnd = -1;
        var index, layer, inPoint, outPoint;

        for (index = 1; index <= comp.numLayers; index++) {
            try { layer = comp.layer(index); } catch (ignoreSmartRangeLayer) { layer = null; }
            if (!layer) { continue; }
            try {
                inPoint = Math.max(0, Math.min(duration, Number(layer.inPoint) || 0));
                outPoint = Math.max(0, Math.min(duration, Number(layer.outPoint) || 0));
            } catch (ignoreSmartLayerRange) { continue; }
            if (outPoint <= inPoint + frame * 0.05) { continue; }

            if (boltSmartCleanLayerCountsForRange(layer, comp, false)) {
                fallbackStart = Math.min(fallbackStart, inPoint);
                fallbackEnd = Math.max(fallbackEnd, outPoint);
            }
            if (boltSmartCleanLayerCountsForRange(layer, comp, true)) {
                primaryStart = Math.min(primaryStart, inPoint);
                primaryEnd = Math.max(primaryEnd, outPoint);
            }
        }

        var validPrimary = primaryEnd >= 0 && primaryStart < 1e19;
        var validFallback = fallbackEnd >= 0 && fallbackStart < 1e19;
        if (!validPrimary && !validFallback) {
            return {valid:false, start:0, end:duration, duration:duration, frame:frame};
        }

        var start = validPrimary ? primaryStart : fallbackStart;
        var end = validPrimary ? primaryEnd : fallbackEnd;
        var result = {valid:true, start:start, end:end, duration:duration, frame:frame};
        boltSmartCleanCompMarkerRange(comp, result);
        result.start = Math.max(0, Math.min(duration - frame, result.start));
        result.end = Math.max(result.start + frame, Math.min(duration, result.end));
        return result;
    }

    function boltSmartCleanCompDurationSensitive(comp, expressionEntries) {
        if (!comp || !expressionEntries) { return expressionEntries === null; }
        var namePattern = new RegExp(
            "comp\\s*\\(\\s*([\\\"'])" + boltEscapeRegex(comp.name) + "\\1\\s*\\)\\s*\\.\\s*duration",
            "i"
        );
        var index, entry, expression, parents = {};
        try {
            var usedIn = comp.usedIn || [], parentIndex;
            for (parentIndex = 0; parentIndex < usedIn.length; parentIndex++) {
                parents[boltProjectItemKey(usedIn[parentIndex])] = true;
            }
        } catch (ignoreSmartDurationParents) {}

        for (index = 0; index < expressionEntries.length; index++) {
            entry = expressionEntries[index];
            expression = safeString(entry.expression);
            if (!expression.length) { continue; }
            if (entry.comp === comp && /\bthisComp\s*\.\s*duration\b/i.test(expression)) { return true; }
            if (namePattern.test(expression)) { return true; }
            if (parents[boltProjectItemKey(entry.comp)] && /\bsource\s*\.\s*duration\b/i.test(expression)) { return true; }
        }
        return false;
    }

    function boltSmartCleanParentLayers(comp) {
        var output = [], parents = [], p, parent, layerIndex, layer, source;
        try { parents = comp.usedIn || []; } catch (ignoreSmartUsedIn) { parents = []; }
        for (p = 0; p < parents.length; p++) {
            parent = parents[p];
            if (!boltIsCompItem(parent)) { continue; }
            for (layerIndex = 1; layerIndex <= parent.numLayers; layerIndex++) {
                try {
                    layer = parent.layer(layerIndex);
                    source = layer ? layer.source : null;
                } catch (ignoreSmartParentLayer) { layer = null; source = null; }
                if (layer && source === comp) { output.push({parent:parent, layer:layer}); }
            }
        }
        return output;
    }

    function boltSmartCleanParentUsageSafe(comp, newDuration) {
        var refs = boltSmartCleanParentLayers(comp);
        var oldDuration = Number(comp.duration) || 0;
        var frame = Math.max(0.001, Number(comp.frameDuration) || 0.04);
        var index, layer, stretch, startTime, outPoint, expectedOldEnd, sourceEnd;
        for (index = 0; index < refs.length; index++) {
            layer = refs[index].layer;
            try { if (layer.timeRemapEnabled === true) { return false; } } catch (ignoreSmartTimeRemap) {}
            try { stretch = Number(layer.stretch); } catch (ignoreSmartStretch) { stretch = 100; }
            // Non-100%, reverse and stretched parent layers are protected. The
            // cleaner does not try to infer source-time mapping from them.
            if (!isFinite(stretch) || Math.abs(stretch - 100) > 0.001) { return false; }
            try { startTime = Number(layer.startTime) || 0; } catch (ignoreSmartStartTime) { startTime = 0; }
            try { outPoint = Number(layer.outPoint) || 0; } catch (ignoreSmartParentOut) { return false; }
            sourceEnd = outPoint - startTime;
            if (sourceEnd <= newDuration + frame) { continue; }
            expectedOldEnd = startTime + oldDuration;
            if (Math.abs(outPoint - expectedOldEnd) <= frame * 2.0) {
                try { if (layer.locked) { return false; } } catch (ignoreSmartParentLocked) {}
                continue;
            }
            return false;
        }
        return true;
    }

    function boltSmartCleanCompHasProtectedTail(comp, candidate) {
        var frame = Math.max(0.001, Number(comp.frameDuration) || 0.04);
        var index, layer, outPoint;
        for (index = 1; index <= comp.numLayers; index++) {
            try { layer = comp.layer(index); } catch (ignoreSmartTailLayer) { layer = null; }
            if (!layer) { continue; }
            try { outPoint = Number(layer.outPoint) || 0; } catch (ignoreSmartTailOut) { outPoint = 0; }
            if (outPoint <= candidate + frame * 0.05) { continue; }
            if (boltSmartCleanLayerIsTimingProtected(layer, comp)) { return true; }
        }
        return false;
    }

    function boltSmartCleanClampLayers(comp, targetDuration, context) {
        var frame = Math.max(0.001, Number(comp.frameDuration) || 0.04);
        var index, layer, inPoint, outPoint, safeSupport;
        for (index = 1; index <= comp.numLayers; index++) {
            try { layer = comp.layer(index); } catch (ignoreSmartClampLayer) { layer = null; }
            if (!layer) { continue; }

            // Never alter content/audio/video/precomp ranges. In particular,
            // Smart Clean never changes any layer in-point automatically.
            if (boltSmartCleanLayerIsTimingProtected(layer, comp)) {
                context.timelineLayersSkipped++;
                continue;
            }
            try { if (layer.locked) { context.timelineLayersSkipped++; continue; } } catch (ignoreSmartClampLocked) {}

            safeSupport = boltSmartCleanLayerLooksLikeSupport(layer, comp);
            try {
                if (layer.adjustmentLayer === true || layer.guideLayer === true || layer.nullLayer === true) { safeSupport = true; }
            } catch (ignoreSmartSupportType) {}
            if (!safeSupport) { context.timelineLayersSkipped++; continue; }

            try {
                inPoint = Number(layer.inPoint) || 0;
                outPoint = Number(layer.outPoint) || 0;
                if (outPoint > targetDuration + frame * 0.05 && inPoint < targetDuration - frame * 0.05) {
                    layer.outPoint = Math.max(inPoint + frame, targetDuration);
                    context.timelineLayersTrimmed++;
                }
            } catch (ignoreSmartClampRange) { context.timelineLayersSkipped++; }
        }
    }

    function boltSmartCleanSetWorkArea(comp, range, targetDuration, context) {
        if (!range || !range.valid) { return; }
        var frame = Math.max(0.001, Number(comp.frameDuration) || 0.04);
        var start = Math.max(0, Math.min(targetDuration - frame, range.start));
        var end = Math.max(start + frame, Math.min(targetDuration, range.end));
        var duration = Math.max(frame, end - start);
        try {
            var changed = Math.abs(Number(comp.workAreaStart) - start) > frame * 0.05 ||
                Math.abs(Number(comp.workAreaDuration) - duration) > frame * 0.05;
            comp.workAreaStart = start;
            comp.workAreaDuration = duration;
            if (changed) { context.workAreasUpdated++; }
        } catch (ignoreSmartWorkArea) {}
    }

    function boltSmartCleanCompDepth(comp, memo, visiting) {
        var key = boltProjectItemKey(comp), depth = 0, parents = [], index, parentDepth;
        if (memo[key] !== undefined) { return memo[key]; }
        if (visiting[key]) { return 0; }
        visiting[key] = true;
        try { parents = comp.usedIn || []; } catch (ignoreSmartDepthUsedIn) { parents = []; }
        for (index = 0; index < parents.length; index++) {
            if (!boltIsCompItem(parents[index])) { continue; }
            parentDepth = 1 + boltSmartCleanCompDepth(parents[index], memo, visiting);
            if (parentDepth > depth) { depth = parentDepth; }
        }
        delete visiting[key];
        memo[key] = depth;
        return depth;
    }

    function boltSmartCleanTimeline(context, expressionEntries) {
        var comps = [], index, item, memo = {}, visiting = {};
        if (!app.project) { return context; }
        for (index = 1; index <= app.project.numItems; index++) {
            item = app.project.item(index);
            if (boltIsCompItem(item) && !isBoltLayerExportComp(item)) { comps.push(item); }
        }
        comps.sort(function(a, b) {
            return boltSmartCleanCompDepth(b, memo, visiting) - boltSmartCleanCompDepth(a, memo, visiting);
        });

        for (index = 0; index < comps.length; index++) {
            var comp = comps[index];
            var oldDuration = Number(comp.duration) || 0;
            var frame = Math.max(0.001, Number(comp.frameDuration) || 0.04);
            var range = boltSmartCleanCompRange(comp);
            if (!range.valid || oldDuration <= frame) { continue; }

            var candidate = Math.max(frame, Math.min(oldDuration, range.end));
            var canTrim = candidate < oldDuration - frame * 0.5;
            if (canTrim && boltSmartCleanCompHasProtectedTail(comp, candidate)) {
                canTrim = false;
                context.durationProtected++;
            }
            if (canTrim && boltSmartCleanCompDurationSensitive(comp, expressionEntries)) {
                canTrim = false;
                context.durationProtected++;
            }
            if (canTrim && !boltSmartCleanParentUsageSafe(comp, candidate)) {
                canTrim = false;
                context.durationProtected++;
            }

            var targetDuration = canTrim ? candidate : oldDuration;
            // Only clear tails of clearly recognized support layers. Content
            // layers, audio/music and precomps keep their original ranges.
            boltSmartCleanClampLayers(comp, targetDuration, context);

            if (canTrim) {
                try {
                    comp.duration = targetDuration;
                    context.compsTrimmed++;
                    context.secondsTrimmed += Math.max(0, oldDuration - targetDuration);
                } catch (smartDurationError) {
                    context.warnings.push("Could not trim comp '" + comp.name + "': " + smartDurationError.message);
                    targetDuration = oldDuration;
                }
            }

            boltSmartCleanSetWorkArea(comp, range, targetDuration, context);
            context.compsScanned++;
        }
        return context;
    }

    function runSmartProjectClean() {
        if (!app.project) { throw new Error("Open an After Effects project first."); }
        boltClearInvalidObjectRefs();
        boltRefreshSmartProjectContext("Smart Clean", true);

        var context = {
            renamedItems:0, movedItems:0, labelledItems:0,
            labelledLayers:0, renamedLayers:0, skippedLayers:0, skippedNames:0,
            emptyFoldersRemoved:0, warnings:[],
            compsScanned:0, compsTrimmed:0, durationProtected:0,
            timelineLayersTrimmed:0, timelineLayersSkipped:0,
            parentLayersTrimmed:0, workAreasUpdated:0, secondsTrimmed:0
        };
        var expressionEntries = boltBuildExpressionIndexSafe(context);

        app.beginUndoGroup("Bolt Smart Clean");
        try {
            boltCleanProjectPanelSafe(context, expressionEntries);
            boltCleanCompLayersSafe(context, expressionEntries);
            boltSmartCleanTimeline(context, expressionEntries);
        } finally {
            app.endUndoGroup();
            state.layerAnalysis = null;
            boltProjectCleanRefreshStructure();
            updateHeroLabel();
        }

        try {
            if (app.project.file) { app.project.save(); }
        } catch (smartCleanSaveError) {
            context.warnings.push("Project save after Smart Clean failed: " + smartCleanSaveError.message);
        }

        var summary =
            "Smart Clean • " + context.compsTrimmed + " comp(s) trimmed • " +
            context.timelineLayersTrimmed + " safe support tail(s) • " +
            context.workAreasUpdated + " work area(s) • " +
            (Math.round(context.secondsTrimmed * 10) / 10) + "s removed" +
            (context.durationProtected ? " • " + context.durationProtected + " protected comp(s)" : "") +
            (context.warnings.length ? " • " + context.warnings.length + " warning(s)" : "");
        setStatus(summary, context.warnings.length ? "warning" : "ok");
        if (state.ui && state.ui.statusLabel) {
            state.ui.statusLabel.helpTip = summary +
                "\n\nSafety: Smart Clean never changes content/audio/video/precomp in-points or out-points. Only clearly identified support-layer tails may be shortened. Audio/music is always a hard comp-duration boundary, even when muted." +
                (context.warnings.length ? "\n\nWarnings:\n" + context.warnings.join("\n") : "");
        }
        return context;
    }

    function showInfoDialog() {
        var dialog = new Window("dialog", "Bolt " + VERSION + " • Updates");
        dialog.orientation = "column";
        dialog.alignChildren = ["fill", "top"];
        dialog.spacing = 7;
        dialog.margins = 14;
        dialog.preferredSize.width = 360;

        var title = dialog.add("statictext", undefined, "BOLT " + VERSION);
        try { title.graphics.font = ScriptUI.newFont(title.graphics.font.name, "BOLD", 15); } catch (ignoreInfoTitleFont) {}

        var developer = dialog.add("statictext", undefined,
            "Developed by — " + DEVELOPER_NAME + "\r\n" + DEVELOPER_ROLE,
            { multiline: true });
        try { developer.graphics.foregroundColor = developer.graphics.newPen(developer.graphics.PenType.SOLID_COLOR, [0.76,0.78,0.82], 1); } catch (ignoreDeveloperInfoColor) {}

        dialog.add("panel");
        dialog.add("statictext", undefined,
            "Minimal production update\r\n\r\n" +
            "• Centered responsive tab content\r\n" +
            "• True Comp Duplicator restored in Project\r\n" +
            "• Compact Finishing controls\r\n" +
            "• Glow/Vignette tuning moved to AE Effect Controls\r\n" +
            "• Safe Smart Clean timing protections retained\r\n" +
            "• Organize and layered PSD/AI safeguards retained",
            { multiline: true });

        var build = dialog.add("statictext", undefined, "Build: " + BUILD_ID);
        try { build.graphics.foregroundColor = build.graphics.newPen(build.graphics.PenType.SOLID_COLOR, [0.62,0.64,0.67], 1); } catch (ignoreInfoBuildColor) {}
        var closeButton = dialog.add("button", undefined, "Close", { name: "ok" });
        closeButton.alignment = ["center", "top"];
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
        content.spacing = 5;
        content.margins = [3, 3, 3, 6];
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
            contentX: 0,
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
            var x = Math.max(0, Number(area.contentX) || 0);
            try { content.location = [x, y]; } catch (ignoreLocationArray) {}
            try { content.location.x = x; content.location.y = y; } catch (ignoreLocationPoint) {}
            try { content.bounds = [x, y, x + width, y + height]; } catch (ignoreContentBounds) {}
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
        area._boltEventsBoundComplete = true;
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


function boltFitButtonRows(root, availableWidth) {
        if (!root) { return; }
        var i, child, buttons, controls, spacing, usable, each, typeName;
        try {
            if (safeString(root.orientation).toLowerCase() === "row" && root.children && root.children.length > 1) {
                buttons = [];
                controls = 0;
                for (i = 0; i < root.children.length; i++) {
                    child = root.children[i];
                    if (!child || child.visible === false) { continue; }
                    typeName = safeString(child.type).toLowerCase();
                    if (typeName === "button") { buttons.push(child); }
                    else if (typeName === "statictext" || typeName === "panel") { controls++; }
                    else { controls += 10; }
                }
                // Only normalize pure action rows. Mixed input/path rows retain
                // their authored widths so fields remain usable.
                if (buttons.length >= 2 && controls === 0) {
                    spacing = Number(root.spacing) || 0;
                    usable = Math.max(80, Number(availableWidth) || 80) - spacing * (buttons.length - 1);
                    each = Math.max(34, Math.floor(usable / buttons.length));
                    for (i = 0; i < buttons.length; i++) {
                        try {
                            buttons[i].alignment = ["fill", "center"];
                            buttons[i].minimumSize.width = 0;
                            buttons[i].preferredSize.width = each;
                            buttons[i].maximumSize.width = 10000;
                        } catch (ignoreFitButton) {}
                    }
                }
            }
        } catch (ignoreFitRow) {}
        try {
            for (i = 0; root.children && i < root.children.length; i++) {
                boltFitButtonRows(root.children[i], availableWidth);
            }
        } catch (ignoreFitChildren) {}
    }

function boltClampDockContainers(root, maxWidth) {
        if (!root) { return; }
        var i, child, typeName;
        try {
            typeName = safeString(root.type).toLowerCase();
            if (typeName === "group" || typeName === "panel") {
                root.minimumSize.width = 0;
                if (maxWidth > 0) { root.maximumSize.width = maxWidth; }
                if (root.alignment && safeString(root.alignment[0]).toLowerCase() === "fill") {
                    root.preferredSize.width = maxWidth;
                }
            }
        } catch (ignoreDockContainer) {}

        try {
            for (i = 0; root.children && i < root.children.length; i++) {
                child = root.children[i];
                if (!child || child.visible === false) { continue; }
                boltClampDockContainers(child, maxWidth);
            }
        } catch (ignoreDockChildren) {}
    }

function refreshScrollAreas() {
        var index, area, tabWidth, tabHeight, scrollWidth, gap, viewWidth, viewHeight;
        var contentHeight, maxScroll, childIndex, child, contentMargins, childWidth;
        var panelInnerWidth, parentWidth, stackWidth;

        for (index = 0; index < state.scrollAreas.length; index++) {
            area = state.scrollAreas[index];
            try {
                if (!area || !area.tab || area.tab.visible === false) { continue; }
                if (area.bindEvents && !area._boltEventsBoundComplete) {
                    area.bindEvents();
                    area._boltEventsBoundComplete = true;
                }

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

                // ScriptUI can report a page's NATURAL width instead of the width
                // actually available in the AE dock. Clamp every scroll viewport to
                // the narrowest real parent/panel measurement. This is the key fix
                // for controls disappearing behind Preview/Align/other AE panels.
                panelInnerWidth = 0;
                parentWidth = 0;
                stackWidth = 0;
                try {
                    if (state.ui && state.ui.panel) {
                        panelInnerWidth = Math.max(160, Number(state.ui.panel.size.width) - 28);
                    }
                } catch (ignorePanelInnerWidth) {}
                try {
                    if (area.tab.parent) { parentWidth = Number(area.tab.parent.size.width) || 0; }
                } catch (ignoreScrollParentWidth) {}
                try {
                    if (state.ui && state.ui.pageStack) { stackWidth = Number(state.ui.pageStack.size.width) || 0; }
                } catch (ignoreScrollStackWidth) {}

                if (panelInnerWidth > 0 && (!tabWidth || tabWidth > panelInnerWidth)) { tabWidth = panelInnerWidth; }
                if (parentWidth > 0 && parentWidth >= 180 && tabWidth > parentWidth) { tabWidth = parentWidth; }
                if (stackWidth > 0 && stackWidth >= 180 && tabWidth > stackWidth) { tabWidth = stackWidth; }
                tabWidth = Math.max(180, tabWidth || panelInnerWidth || 300);

                scrollWidth = 9;
                gap = 2;
                viewWidth = Math.max(100, Math.floor(tabWidth - scrollWidth - gap - 8));
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

                var centeredContentWidth = Math.max(120, Math.min(viewWidth, BOLT_CONTENT_MAX_WIDTH));
                var centeredContentX = Math.max(0, Math.floor((tabWidth - centeredContentWidth) / 2));
                centeredContentX = Math.min(centeredContentX, Math.max(0, viewWidth - centeredContentWidth));
                childWidth = Math.max(72, centeredContentWidth - contentMargins - 6);

                // Reflow against the actual centered content width. Narrow docks still
                // use the full viewport; wider docks keep equal left/right breathing room.
                try { updateResponsiveRows(childWidth); } catch (ignoreViewportResponsiveRows) {}
                try {
                    area.content.minimumSize = [centeredContentWidth, 0];
                    area.content.maximumSize = [centeredContentWidth, 10000];
                    area.content.preferredSize = [centeredContentWidth, 1];
                    area.content.size = [centeredContentWidth, 1];
                    area.content.location = [centeredContentX, 0];
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

                boltClampDockContainers(area.content, childWidth);
                boltFitButtonRows(area.content, childWidth);
                try { area.content.layout.layout(true); } catch (ignoreContentLayout) {}
                contentHeight = Math.max(viewHeight, boltNaturalColumnHeight(area.content));

                area.contentWidth = centeredContentWidth;
                area.contentHeight = contentHeight;
                area.contentX = centeredContentX;
                area.viewHeight = viewHeight;

                try {
                    area.content.minimumSize = [centeredContentWidth, contentHeight];
                    area.content.maximumSize = [centeredContentWidth, contentHeight];
                    area.content.preferredSize = [centeredContentWidth, contentHeight];
                    area.content.size = [centeredContentWidth, contentHeight];
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
        if (app.project && boltIsCompItem(app.project.activeItem)) { return app.project.activeItem; }
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

    function boltSetGeneratedKeyEase(prop, time, influence) {
        try {
            var index = prop.nearestKeyIndex(time);
            if (Math.abs(prop.keyTime(index) - time) > 0.0001) { return; }
            boltSetTemporalEase(prop, index, influence, influence);
            try { prop.setSelectedAtKey(index, false); } catch (ignoreDeselectGenerated) {}
        } catch (ignoreGeneratedEase) {}
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
                previousValue: prop.keyValue(keyIndex - 1),
                targetValue: prop.keyValue(keyIndex),
                nextTime: nextTime
            });
        }
        output.sort(function(a,b){ return b.time - a.time; });
        return output;
    }

    function boltApplySelectedMotionEase(prop, keyIndex, influence) {
        return boltSetTemporalEase(prop, keyIndex, influence, influence);
    }

function boltSelectedKeyframesExist(layers) {
    // Only report a selected-keyframe bounce path when a selected key can
    // actually use the previous key as its incoming motion. The old test
    // returned true for key #1, then applySmartBounce had nothing to edit.
    var layerIndex, propertyIndex, property, keys, keyIndex;
    for (layerIndex = 0; layerIndex < layers.length; layerIndex++) {
        try {
            var properties = layers[layerIndex].selectedProperties || [];
            for (propertyIndex = 0; propertyIndex < properties.length; propertyIndex++) {
                property = properties[propertyIndex];
                if (!(property instanceof Property) || property.expressionEnabled || property.numKeys < 2) { continue; }
                keys = property.selectedKeys || [];
                for (keyIndex = 0; keyIndex < keys.length; keyIndex++) {
                    if (keys[keyIndex] > 1 && keys[keyIndex] <= property.numKeys) { return true; }
                }
            }
        } catch (ignoreSelectedKeyScan) {}
    }
    return false;
}

    function applySmartBounce(mode, frameCount, strengthPercent) {
        var comp = activeCompOrThrow();
        var layers = selectedLayersOrThrow(comp);
        mode = mode || "Bounce";
        var frames = Math.round(clampNumber(frameCount, 3, 60, 12));
        var strength = clampNumber(strengthPercent, 1, 100, 18) / 100;
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
    function boltActionMaxEnd(comp, layer) {
        var end = comp.duration;
        try { end = Math.min(end, Number(layer.outPoint)); } catch (ignoreActionLayerEnd) {}
        return Math.max(0, end - Math.max(0.0001, comp.frameDuration * 0.05));
    }

    function boltActionScaledTime(comp, layer, start, sourceFrame, sourceLastFrame) {
        var maxEnd = boltActionMaxEnd(comp, layer);
        var requestedEnd = start + sourceLastFrame * comp.frameDuration;
        if (requestedEnd <= maxEnd || sourceLastFrame <= 0) {
            return Math.min(maxEnd, start + sourceFrame * comp.frameDuration);
        }
        var available = Math.max(comp.frameDuration, maxEnd - start);
        return Math.min(maxEnd, start + available * (sourceFrame / sourceLastFrame));
    }

    function boltSetSeparatedPositionAtTime(transform, time, value) {
        var leader = null, x = null, y = null, z = null, separated = false;
        try { leader = transform ? transform.property("ADBE Position") : null; } catch (ignorePositionLeader) {}
        if (!leader) { return false; }
        try { separated = !!leader.dimensionsSeparated; } catch (ignoreSeparatedPosition) {}
        if (!separated) {
            if (leader.expressionEnabled) { return false; }
            try { leader.setValueAtTime(time, value); return true; } catch (ignoreLeaderPositionKey) { return false; }
        }
        try { x = transform.property("ADBE Position_0"); } catch (ignoreActionPosX) {}
        try { y = transform.property("ADBE Position_1"); } catch (ignoreActionPosY) {}
        try { z = transform.property("ADBE Position_2"); } catch (ignoreActionPosZ) {}
        if (!x || !y || x.expressionEnabled || y.expressionEnabled || (z && value.length > 2 && z.expressionEnabled)) { return false; }
        try {
            x.setValueAtTime(time, value[0]);
            y.setValueAtTime(time, value[1]);
            if (z && value.length > 2) { z.setValueAtTime(time, value[2]); }
            return true;
        } catch (ignoreSeparatedPositionKey) { return false; }
    }

    function boltReadPositionAtTime(transform, time) {
        var leader = null, separated = false, x = null, y = null, z = null;
        try { leader = transform ? transform.property("ADBE Position") : null; } catch (ignoreReadPositionLeader) {}
        if (!leader) { return null; }
        try { separated = !!leader.dimensionsSeparated; } catch (ignoreReadSeparated) {}
        if (!separated) {
            try { return leader.valueAtTime(time, false); } catch (ignoreReadLeaderPosition) { return null; }
        }
        try { x = transform.property("ADBE Position_0"); y = transform.property("ADBE Position_1"); z = transform.property("ADBE Position_2"); } catch (ignoreReadSeparatedProps) {}
        if (!x || !y) { return null; }
        try {
            var result = [x.valueAtTime(time, false), y.valueAtTime(time, false)];
            if (z) { result.push(z.valueAtTime(time, false)); }
            return result;
        } catch (ignoreReadSeparatedValues) { return null; }
    }


function boltApplyScaleAction(kind) {
    var comp = activeCompOrThrow();
    var layers = selectedLayersOrThrow(comp);
    var frames = kind === "Spring" ? [0, 6, 11, 16, 22] : (kind === "Pop" ? [0, 7, 12] : [0, 5, 9, 14]);
    var factors = kind === "Spring" ? [0.82, 1.16, 0.94, 1.04, 1] : (kind === "Pop" ? [0.05, 1.13, 1] : [0.88, 1.09, 0.97, 1]);
    var changed = 0, skipped = 0, layerIndex, frameIndex, successful;

    app.beginUndoGroup("Bolt " + kind);
    try {
        for (layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            var layer = layers[layerIndex], transform = null, scale = null;
            try { transform = layer.property("ADBE Transform Group"); } catch (ignoreActionTransform) {}
            try { scale = transform ? transform.property("ADBE Scale") : null; } catch (ignoreActionScale) {}
            if (!scale || layer.locked || scale.expressionEnabled) { skipped++; continue; }

            var start = boltActionTime(comp, layer);
            var maxEnd = boltActionMaxEnd(comp, layer);
            if (maxEnd - start < comp.frameDuration) { skipped++; continue; }
            var base = scale.valueAtTime(start, false);
            var times = [];
            successful = 0;
            for (frameIndex = 0; frameIndex < frames.length; frameIndex++) {
                var keyTime = boltActionScaledTime(comp, layer, start, frames[frameIndex], frames[frames.length - 1]);
                // avoid duplicate times on very short layers
                if (times.length && Math.abs(times[times.length - 1] - keyTime) < comp.frameDuration * 0.25) { continue; }
                try {
                    scale.setValueAtTime(keyTime, boltScaleBy(base, factors[frameIndex]));
                    times.push(keyTime);
                    successful++;
                } catch (ignoreScaleActionKey) {}
            }
            if (successful >= 2) {
                boltActionEase(scale, times, kind === "Spring" ? 68 : 82);
                changed++;
            } else { skipped++; }
        }
    } finally { app.endUndoGroup(); }

    if (!changed) { throw new Error("Select an unlocked visible layer with writable Scale and enough timeline duration."); }
    setStatus(kind + " applied to " + changed + " layer(s)" + (skipped ? " • " + skipped + " skipped" : ""), skipped ? "warning" : "ok");
}


function boltRunBounceAction(kind) {
    var comp = activeCompOrThrow();
    var layers = selectedLayersOrThrow(comp);
    // Use the selected-keyframe editor only when it has a valid target key
    // with a previous key. Otherwise fall back to a reliable layer action.
    if (boltSelectedKeyframesExist(layers)) {
        applySmartBounce(
            kind === "Spring" ? "Elastic" : "Bounce",
            kind === "Spring" ? 18 : 12,
            kind === "Spring" ? 24 : 18
        );
        return;
    }
    boltApplyScaleAction(kind);
}


function boltApplyOpacityAction(kind) {
    var comp = activeCompOrThrow();
    var layers = selectedLayersOrThrow(comp);
    var changed = 0, skipped = 0, layerIndex, frameIndex, successful;

    app.beginUndoGroup("Bolt " + kind);
    try {
        for (layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            var layer = layers[layerIndex], opacity = null;
            try { opacity = layer.property("ADBE Transform Group").property("ADBE Opacity"); } catch (ignoreOpacityAction) {}
            if (!opacity || layer.locked || opacity.expressionEnabled) { skipped++; continue; }

            var start = boltActionTime(comp, layer);
            var maxEnd = boltActionMaxEnd(comp, layer);
            if (maxEnd - start < comp.frameDuration) { skipped++; continue; }
            var base = opacity.valueAtTime(start, false);
            var frameValues = kind === "Blink" ? [[0, base], [2, 0], [4, base], [6, 0], [8, base]] : [[0, 0], [12, base]];
            var times = [];
            successful = 0;
            for (frameIndex = 0; frameIndex < frameValues.length; frameIndex++) {
                var keyTime = boltActionScaledTime(comp, layer, start, frameValues[frameIndex][0], frameValues[frameValues.length - 1][0]);
                if (times.length && Math.abs(times[times.length - 1] - keyTime) < comp.frameDuration * 0.25) { continue; }
                try {
                    opacity.setValueAtTime(keyTime, frameValues[frameIndex][1]);
                    times.push(keyTime);
                    successful++;
                } catch (ignoreOpacityActionKey) {}
            }
            if (successful >= 2) {
                boltActionEase(opacity, times, 80);
                changed++;
            } else { skipped++; }
        }
    } finally { app.endUndoGroup(); }

    if (!changed) { throw new Error("Select an unlocked layer with writable Opacity and enough timeline duration."); }
    setStatus(kind + " applied to " + changed + " layer(s)" + (skipped ? " • " + skipped + " skipped" : ""), skipped ? "warning" : "ok");
}
function boltApplyPositionAction(kind) {
    var comp = activeCompOrThrow();
    var layers = selectedLayersOrThrow(comp);
    var changed = 0, skipped = 0, layerIndex, frameIndex, successful;

    app.beginUndoGroup("Bolt " + kind);
    try {
        for (layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            var layer = layers[layerIndex], transform = null, position = null, opacity = null;
            try { transform = layer.property("ADBE Transform Group"); } catch (ignorePositionTransform) {}
            try { position = transform ? transform.property("ADBE Position") : null; } catch (ignorePositionProp) {}
            try { opacity = transform ? transform.property("ADBE Opacity") : null; } catch (ignorePositionOpacity) {}
            if (!position || layer.locked) { skipped++; continue; }
            var separated = false;
            try { separated = !!position.dimensionsSeparated; } catch (ignoreActionSeparatedCheck) {}
            if (!separated && position.expressionEnabled) { skipped++; continue; }

            var start = boltActionTime(comp, layer);
            var maxEnd = boltActionMaxEnd(comp, layer);
            if (maxEnd - start < comp.frameDuration) { skipped++; continue; }
            var base = boltReadPositionAtTime(transform, start);
            if (!base) { skipped++; continue; }
            var frameOffsets = kind === "Glitch" ? [[0,0,0],[1,18,-4],[2,-14,5],[3,9,-3],[4,-5,2],[6,0,0]] : [[0,-70,18],[14,0,0]];
            var times = [];
            successful = 0;
            for (frameIndex = 0; frameIndex < frameOffsets.length; frameIndex++) {
                var keyTime = boltActionScaledTime(comp, layer, start, frameOffsets[frameIndex][0], frameOffsets[frameOffsets.length - 1][0]);
                if (times.length && Math.abs(times[times.length - 1] - keyTime) < comp.frameDuration * 0.25) { continue; }
                if (boltSetSeparatedPositionAtTime(transform, keyTime, boltOffsetPosition(base, frameOffsets[frameIndex][1], frameOffsets[frameIndex][2]))) {
                    times.push(keyTime);
                    successful++;
                }
            }
            if (successful < 2) { skipped++; continue; }

            if (!separated) { boltActionEase(position, times, kind === "Glitch" ? 55 : 82); }
            else {
                try {
                    var px = transform.property("ADBE Position_0"), py = transform.property("ADBE Position_1"), pz = transform.property("ADBE Position_2");
                    if (px) { boltActionEase(px, times, kind === "Glitch" ? 55 : 82); }
                    if (py) { boltActionEase(py, times, kind === "Glitch" ? 55 : 82); }
                    if (pz) { boltActionEase(pz, times, kind === "Glitch" ? 55 : 82); }
                } catch (ignoreSeparatedEase) {}
            }

            if (opacity && !opacity.expressionEnabled) {
                var originalOpacity = opacity.valueAtTime(start, false);
                var endTime = times[times.length - 1];
                try {
                    if (kind === "Slide") {
                        opacity.setValueAtTime(start, 0);
                        opacity.setValueAtTime(endTime, originalOpacity);
                        boltActionEase(opacity, [start, endTime], 82);
                    } else {
                        var midTime = start + (endTime - start) * 0.5;
                        opacity.setValueAtTime(start, originalOpacity);
                        opacity.setValueAtTime(midTime, 35);
                        opacity.setValueAtTime(endTime, originalOpacity);
                    }
                } catch (ignoreActionOpacityKeys) {}
            }
            changed++;
        }
    } finally { app.endUndoGroup(); }

    if (!changed) { throw new Error("Select an unlocked layer with writable Position and enough timeline duration."); }
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


    // Project persistence utilities.
    function boltSaveProjectSameFile(reason) {
        if (!app.project) { return null; }

        // Bolt 15.6 never creates timestamped project copies. If the project has
        // never been saved, AE is allowed to ask once for the initial file path.
        if (!app.project.file) {
            app.project.save();
            if (!app.project.file) {
                log("Same-file save skipped (" + safeString(reason) + "): project is still unsaved.");
                return null;
            }
        } else {
            app.project.save();
        }

        var current = new File(app.project.file.fsName);
        log("Same-file save [" + safeString(reason) + "]: " + current.fsName);
        return current;
    }

    function boltStartFiveMinuteAutoSave() {
        // Keep one task per Bolt engine and make the save operation globally
        // throttled through AE settings. Target engines have separate $.global
        // objects, so an older Bolt panel can still have its own scheduled task;
        // the shared timestamp prevents those tasks from saving the project twice.
        // Project.save() writes the active AEP/AEPX in place and is skipped while
        // the Render Queue is actively rendering.
        try {
            var oldTaskIds = [
                $.global.BOLT_15_5_AUTOSAVE_TASK_ID,
                $.global.BOLT_15_6_AUTOSAVE_TASK_ID
            ];
            var seenTaskIds = {}, taskIndex, oldTaskId;
            for (taskIndex = 0; taskIndex < oldTaskIds.length; taskIndex++) {
                oldTaskId = parseInt(oldTaskIds[taskIndex], 10) || 0;
                if (!oldTaskId || seenTaskIds[oldTaskId]) { continue; }
                seenTaskIds[oldTaskId] = true;
                try { app.cancelTask(oldTaskId); } catch (ignoreCancelOldAutoSave) {}
            }

            $.global.BOLT_15_5_AUTOSAVE_TASK_ID = null;
            $.global.BOLT_15_6_AUTOSAVE_TASK_ID = app.scheduleTask(
                "try { var n=(new Date()).getTime(),l=0; if(app.settings.haveSetting('Bolt','autosave_last_ms')){l=parseInt(app.settings.getSetting('Bolt','autosave_last_ms'),10)||0;} if((n-l)>=270000 && app.project && app.project.file && !(app.project.renderQueue && app.project.renderQueue.rendering)){app.project.save();app.settings.saveSetting('Bolt','autosave_last_ms',String(n));} } catch(e) {}",
                300000,
                true
            );
        } catch (autoSaveScheduleError) {
            log("Could not start five-minute autosave: " + autoSaveScheduleError.message);
        }
    }
    // Compact native ScriptUI.
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
        header.margins = [3, 1, 2, 1];
        setHeight(header, 22);

        var title = header.add("statictext", undefined, "BOLT " + VERSION);
        bold(title, 10);
        var versionLabel = header.add("statictext", undefined, "");
        versionLabel.visible = false;
        setTextColor(versionLabel, [0.76, 0.78, 0.82]);
        var headerSpacer = header.add("statictext", undefined, "");
        headerSpacer.alignment = ["fill", "center"];
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
        var navOrder = ["Project", "Motion", "Queue", "Tools"];
        var navMeta = {
            "Project": {label:"Project", subtitle:"Project — collect and organize"},
            "Comp": {label:"Comps", subtitle:"Comps — duplicate and relink"},
            "Motion": {label:"Create", subtitle:"Create — motion, text, typography, color and finishing"},
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
                Motion:"CREATE",
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
        // PROJECT — fixed, minimal production structure.
        var organizeBody = createScrollableContent(organizeTab);

        var projectQuick = organizeBody.add("group");
        projectQuick.orientation = "column";
        projectQuick.alignChildren = ["fill", "top"];
        projectQuick.alignment = ["fill", "top"];
        projectQuick.spacing = 3;
        projectQuick.margins = 0;
        var projectPrimaryRow = makeRow(projectQuick, 3);
        var analyzeButton = compactButton(projectPrimaryRow, "Analyze", 54);
        var organizeButton = primaryButton(projectPrimaryRow, "Organize", 62);
        var cleanProjectButton = compactButton(projectPrimaryRow, "Smart Clean", 82);
        analyzeButton.helpTip = "Preview the project structure before running Organize. This does not change the project.";
        organizeButton.helpTip = "Full collect/package workflow. Copies/relinks imported files to Resources and prepares Render folders. Use Analyze first. For timeline/project cleanup without media collection, use Smart Clean.";
        cleanProjectButton.helpTip = "Smart Clean safely organizes names/labels, removes empty Project folders, trims only clearly identified support-layer tails, protects audio/video/precomps and content-layer timing, and sets comp work areas. It never deletes layers or relinks/moves media.";

        var workspacePanel = makePanel(organizeBody, "Workspace");
        var workspaceRow = addPathRow(workspacePanel, "", "Choose workspace folder");
        workspaceRow.button.text = "…";
        workspaceRow.button.preferredSize.width = 26;
        var autoWorkspace = compactButton(workspaceRow.row, "Auto", 36);
        autoWorkspace.helpTip = "Automatically use the current project workspace.";
        var heroRow = makeRow(workspacePanel, 3);
        var heroLabel = heroRow.add("statictext", undefined, "Hero  •  automatic");
        heroLabel.alignment = ["fill", "center"];
        var setHeroButton = compactButton(heroRow, "Use", 40);
        var clearHeroButton = compactButton(heroRow, "Find", 40);
        setHeroButton.helpTip = "Use the selected/open composition as the main hero composition.";
        clearHeroButton.helpTip = "Find the most likely main composition across the project.";
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

        // TRUE COMP DUPLICATOR — restored to the visible Project tab.
        // Keep it separate from Analyze / Organize / Smart Clean so duplicating a
        // comp is an explicit creative action and never part of project cleanup.
        var copyPanel = makePanel(organizeBody, "True Comp Duplicator");
        var copySource = copyPanel.add("statictext", undefined, "Comp: none selected");
        copySource.alignment = ["fill", "top"];
        copySource.minimumSize.width = 0;
        copySource.helpTip = "Selected Project-panel comp, or the currently open composition when no Project comp is selected.";

        var copyRow = makeRow(copyPanel, 4);
        copyRow.alignChildren = ["left", "center"];
        var copyLabel = copyRow.add("statictext", undefined, "Copies");
        copyLabel.preferredSize.width = 40;
        var copyMinus = compactButton(copyRow, "−", 28);
        var copyCount = compactField(copyRow, "1", 4, 44);
        var copyPlus = compactButton(copyRow, "+", 28);
        var refreshCopy = compactButton(copyRow, "↻", 28);
        var duplicateButton = primaryButton(copyRow, "Duplicate", 72);
        refreshCopy.helpTip = "Refresh the source comp and preview the next sequential duplicate name(s).";
        duplicateButton.helpTip = "Create true After Effects comp duplicate(s), preserving the source comp contents and placing the copies beside the original in the same Project folder.";

        var copyPreview = copyPanel.add("statictext", undefined, "Select or open a comp.");
        copyPreview.alignment = ["fill", "top"];
        copyPreview.preferredSize.width = 1;
        copyPreview.minimumSize.width = 0;
        styleStatusLabel(copyPreview);
        registerResponsiveRow(copyRow, 255);

        // Legacy hidden Comp page retained only for the existing Relink utility.
        // The duplicator itself now lives in Project, where it is directly usable.
        var duplicateBody = createScrollableContent(duplicateTab);
        var relinkPanel = makePanel(duplicateBody, "Relink");
        var relinkRow = addPathRow(relinkPanel, "", "Choose a folder to search for missing files");
        var relinkControls = makeRow(relinkPanel, 5);
        relinkControls.alignChildren = ["left", "center"];
        var relinkDepthLabel = relinkControls.add("statictext", undefined, "Depth");
        relinkDepthLabel.preferredSize.width = 42;
        var relinkDepth = compactField(relinkControls, "10", 4, 48);
        var relinkButton = primaryButton(relinkControls, "Relink", 58);
        relinkButton.helpTip = "Search the workspace, the optional folder above, user folders, and all local drives for exact missing filenames, then relink the best path match.";

        // CREATE — motion + text
        var motionBody = createScrollableContent(motionTab);
        var motionSplit = motionBody.add("group");
        motionSplit.orientation = "column";
        motionSplit.alignChildren = ["fill", "top"];
        motionSplit.alignment = ["fill", "top"];
        motionSplit.spacing = 6;
        motionSplit.margins = 0;
        var motionKeysTab = motionSplit;

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

        // CREATE — typography + color + finishing
        var styleBody = motionBody; // 15.8: typography/color/finishing live inside CREATE
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
        var vignetteAction = makeRow(finishPanel, 4);
        vignetteAction.add("statictext", undefined, "Vignette");
        var vignetteButton = primaryButton(vignetteAction, "Apply", 52);
        vignetteButton.helpTip = "Create/update the Bolt vignette, then tune it in native After Effects Effect Controls.";
        var glowRow = makeRow(finishPanel, 4);
        glowRow.add("statictext", undefined, "Glow");
        var glowPreset = compactDropdown(glowRow, ["Deep", "Soft", "Neon", "Cinematic", "Hot"], 0, 130, true);
        setHeight(glowPreset, 20);
        var glowButton = primaryButton(glowRow, "Apply", 52);
        glowButton.helpTip = "Apply the selected Glow preset, then fine-tune its native Glow effects in Effect Controls.";

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
        setSectionVisible(typographyPanel, true);
        setSectionVisible(colorPanel, true);
        setSectionVisible(finishPanel, true);
        setSectionVisible(anchorPanel, true);
        setSectionVisible(layerPanel, true);
        setSectionVisible(utilityPanel, true);
        setSectionVisible(queueComp, true);
        setSectionVisible(recipePanel, true);
        setSectionVisible(outputPanel, true);
        setSectionVisible(queueActionPanel, true);

        // Registered rows reflow only below their own safe-width breakpoint.
        // This uses native ScriptUI layout rather than recursive scaling.
        registerResponsiveRow(projectPrimaryRow, 310);

        registerResponsiveRow(workspaceRow.row, 340);
        registerResponsiveRow(heroRow, 300);
        registerResponsiveRow(motionActionRow1, 250);
        registerResponsiveRow(motionActionRow2, 250);
        registerResponsiveRow(textActionRow1, 220);
        registerResponsiveRow(textActionRow2, 270);

        registerResponsiveRow(copyRow, 280);
        registerResponsiveRow(relinkRow.row, 200);
        registerResponsiveRow(relinkControls, 260);

        registerResponsiveRow(fontRow, 240);
        registerResponsiveRow(textVisualRow, 240);
        registerResponsiveRow(gradientRow, 240);
        registerResponsiveRow(paletteTop, 240);
        registerResponsiveRow(paletteSwatches, 265);
        registerResponsiveRow(vignetteAction, 150);
        registerResponsiveRow(glowRow, 240);
        registerResponsiveRow(compRow, 250);

        registerResponsiveRow(formatRow, 230);
        registerResponsiveRow(qualityTitleRow, 260);

        registerResponsiveRow(renderPathRow.row, 340);
        registerResponsiveRow(nameRow, 160);

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
            pageStack:pageStack,
            workspacePath:workspaceRow.field,heroLabel:heroLabel,cleanProjectButton:cleanProjectButton,projectStructureList:projectStructureList,projectStructureStatus:projectStructureStatus,
            relinkPath:relinkRow.field,relinkDepth:relinkDepth,copyCount:copyCount,copySource:copySource,copyPreview:copyPreview,
            renderCompName:renderCompName,renderPath:renderPathRow.field,renderName:renderName,
            renderFormat:renderFormat,renderQuality:renderQuality,addQueueButton:addQueueButton,ameQueueButton:ameQueueButton,
            statusLabel:statusLabel,quickFrames:fadeControl.field,
            gradientPreset:gradientPreset,palettePreset:palettePreset,paletteButtons:paletteButtons,glowPreset:glowPreset,
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
            if (!projectStructureList) { return; }
            projectStructureList.removeAll();
            var names = ["01_Comps", "02_Images", "03_Video", "04_Audio", "05_Other"];
            var index, folder, count, hero = 0, scenes = 0, item;
            var heroComp = resolveHeroComp();
            for (index = 0; index < names.length; index++) {
                folder = findTopLevelProjectFolder(names[index]);
                count = 0;
                try { count = folder ? folder.numItems : 0; } catch (ignoreFolderCount) { count = 0; }
                projectStructureList.add("item", names[index] + "    " + count + " item" + (count === 1 ? "" : "s"));
            }
            if (app.project) {
                try {
                    for (index = 1; index <= app.project.numItems; index++) {
                        item = app.project.item(index);
                        if (boltIsCompItem(item) && item.parentFolder === app.project.rootFolder) {
                            if (isNamedSceneComp(item)) { scenes++; }
                            else if (item === heroComp) { hero = 1; }
                        }
                    }
                } catch (ignoreRootSummary) {}
            }
            projectStructureStatus.text = (hero ? "Hero ready" : "Hero automatic") + "  •  " + scenes + " scene comp(s) at root";
        }

        function controlWidth(control, fallback) {
            var value = 0;
            try { value = Number(control.size.width) || 0; } catch (ignoreControlWidth) {}
            if (!value) { try { value = Number(control.preferredSize.width) || 0; } catch (ignorePreferredWidth) {} }
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
            else if (name === "Project") { updateHeroLabel(); refreshProjectStructureList(); updateDuplicatePreview(); }
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

                motionSplit.orientation = "column";
                styleSplit.orientation = "column";
                motionSplit.alignChildren = ["fill", "top"];
                styleSplit.alignChildren = ["fill", "top"];

                analyzeButton.text = "Analyze";
                organizeButton.text = "Organize";
                addQueueButton.text = "Render Queue";
                ameQueueButton.text = "AME";

                qualityHint.visible = /h\.?264/i.test(selectedFormatText());


                try {
                    panel.layout.layout(true);
                    panel.layout.resize();
                    workspaceShell.layout.layout(true);
                    pageStack.layout.layout(true);
                    pages[activePageName].layout.layout(true);
                    pageBodies[activePageName].layout.layout(true);
                } catch (ignoreNativeLayout) {}

                // contentWidth is already the measured dock width used above;
                // the old code immediately repeated the same responsive pass and
                // a second full panel layout, which added tab/resize lag.
                refreshScrollAreas();
            } finally {
                responsiveBusy = false;
            }
        }
        state.ui.applyResponsiveLayout = applyResponsiveLayout;
        state.ui.refreshScrollAreas = refreshScrollAreas;

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
            boltClearCompReference("hero");
            var detectedHero = resolveHeroComp();
            updateHeroLabel();
            setStatus(detectedHero ? ("Main composition found: " + boltProjectItemName(detectedHero, "Main comp")) : "No main composition found", detectedHero ? "ok" : "warning");
        };
        analyzeButton.onClick = function () {
            try {
                var projectAudit = analyzeProject();
                updateHeroLabel();
                refreshProjectStructureList();
                setStatus(
                    "Analyzed • Main: " + (projectAudit.mainCompName || "auto") +
                    (projectAudit.workspaceRoot ? " • workspace detected" : ""),
                    projectAudit.missing ? "warning" : "ok"
                );
            } catch (error) { showError(error); }
        };
        organizeButton.onClick = function () { try { organizeProject(); refreshProjectStructureList(); } catch (error) { showError(error); } };
        cleanProjectButton.onClick = function () { try { runSmartProjectClean(); } catch (error) { showError(error); } };
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
            boltClearCompReference("render");
            try {
                refreshRenderDetails(false);
                var detectedRenderComp = resolveAvailableComp(true);
                setStatus(detectedRenderComp ? ("Render target found: " + boltProjectItemName(detectedRenderComp, "Render comp")) : "No render composition found", detectedRenderComp ? "ok" : "warning");
            } catch (error) { showError(error); }
        };
        renderAutoPath.onClick = updateAutomaticPaths;
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
        addQueueButton.onClick = function () { try { addSimpleRenderDestination(false); } catch (error) { showError(error); } };
        ameQueueButton.onClick = function () { try { addSimpleRenderDestination(true); } catch (error) { showError(error); } };

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
        gradientButton.onClick = function () { try { applyGradientPreset(); } catch (error) { showError(error); } };
        palettePreset.onChange = function () { updatePaletteButtons(); };
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
        snapshotButton.onClick = function () { try { captureSnapshot(); } catch (error) { showError(error); } };
        pasteButton.onClick = function () { try { pasteFilesToProject(); } catch (error) { showError(error); } };
        purgeButton.onClick = function () { try { purgeBoltCaches(); } catch (error) { showError(error); } };


        function resizeBoltPanelLight() {
            // During a live drag, let ScriptUI resize natively. Rebuilding every
            // responsive row on every mouse movement is unnecessarily expensive.
            try { this.layout.resize(); } catch (ignoreLiveResize) {}
        }
        function resizeBoltPanelFinal() {
            try {
                this.layout.resize();
                applyResponsiveLayout();
            } catch (ignoreResize) {}
        }
        panel.onResizing = resizeBoltPanelLight;
        panel.onResize = resizeBoltPanelFinal;

        var i;

        for (i = 0; i < GRADIENT_PRESETS.length; i++) { gradientPreset.add("item", GRADIENT_PRESETS[i].name); }
        gradientPreset.selection = gradientPreset.items[0];
        for (i = 0; i < COLOR_PALETTES.length; i++) { palettePreset.add("item", COLOR_PALETTES[i].name); }
        palettePreset.selection = palettePreset.items[0];

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

        state.renderFormatValue = renderFormat.selection.text;
        state.renderQualityValue = renderQuality.selection.text;
        renderQuality.enabled = /h\.?264/i.test(state.renderFormatValue);
        qualityHint.visible = renderQuality.enabled;
        updatePaletteButtons();
        updateAutomaticPaths();
        updateDuplicatePreview();
        updateHeroLabel();
        refreshProjectStructureList();
        var lastPage = loadSetting("last_page_v0149_final", loadSetting("last_page_v01471", loadSetting("last_page_v0147", "Project")));
        if (!pages[lastPage] || arrayIndexOf(navOrder, lastPage) < 0) { lastPage = "Project"; }
        showPage(lastPage);
        panel.layout.layout(true);
        applyResponsiveLayout();
        refreshScrollAreas();
        applyDefaultHelpTips(panel);
        return panel;
    }

    var interfacePanel = null;
    try {
        interfacePanel = buildUI(thisObj);
        boltStartFiveMinuteAutoSave();
        if (interfacePanel instanceof Window) {
            interfacePanel.center();
            interfacePanel.show();
        }
    } catch (startupError) {
        showError(startupError);
    }
})(this);
