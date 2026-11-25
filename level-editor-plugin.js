import fs from "node:fs";
import path from "node:path";

// Dev-only Vite plugin used by the level editor (editor.html). The browser cannot write
// files, so the editor POSTs the new object as plain data here; this plugin validates it,
// builds one line of level code and inserts it at the end of the right section of
// src/levels/levelXXX.js. It also keeps the undo history.
//
// Security: only requests from the editor page on this computer are accepted (see
// assertTrustedRequest), and the client never sends code – only values that are
// checked against EDITOR_OBJECT_KINDS, so nothing executable can end up in a level file.

const ADD_ENTRY_ENDPOINT = "/__level-editor/add-entry";
const UNDO_ENDPOINT = "/__level-editor/undo";

// The same modules the editor uses, loaded through Vite so they always match the client.
const OBJECT_KINDS_MODULE = "/src/editor/editorObjectKinds.js";
const ENTRY_BUILDER_MODULE = "/src/editor/levelEntryBuilder.js";

const LOOPBACK_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

// Level files are hand-formatted (prettier-ignore): every nesting level is indented with
// 4 more spaces, e.g. "    collectibles: {", "        coins: [", "            ...entries".
const INDENT_STEP = "    ";

function getLevelFilePath(root, level) {
    if (!Number.isInteger(level) || level < 1) {
        throw new Error(`Invalid level: ${level}`);
    }
    const filePath = path.join(root, "src", "levels", `level${String(level).padStart(3, "0")}.js`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Level file not found: ${filePath}`);
    }
    return filePath;
}

function stripLineComment(line) {
    return line.replace(/\/\/.*$/, "").trimEnd();
}

// Makes sure the last entry before the closing bracket ends with a comma.
function ensureTrailingComma(lines, sectionStart, sectionEnd) {
    for (let i = sectionEnd - 1; i > sectionStart; i--) {
        const code = stripLineComment(lines[i]);
        if (code.trim() === "") {
            continue;
        }
        if (!code.endsWith(",")) {
            lines[i] = code + "," + lines[i].slice(code.length);
        }
        return;
    }
}

// Splits the source into lines and finds the lines that open and close the section.
// A nested section path like "collectibles.coins" is found step by step: "collectibles: {"
// first, then "coins: [" inside it, one indent step deeper.
function findSection(source, sectionPath) {
    const eol = source.includes("\r\n") ? "\r\n" : "\n";
    const lines = source.split(eol);
    const names = sectionPath.split(".");
    let sectionStart = -1;
    let indent = "";
    names.forEach((name, depth) => {
        indent += INDENT_STEP;
        const opening = depth === names.length - 1 ? "\\[" : "\\{";
        const startPattern = new RegExp(`^${indent}${name}\\s*:\\s*${opening}\\s*$`);
        sectionStart = lines.findIndex(
            (line, index) => index > sectionStart && startPattern.test(line)
        );
        if (sectionStart === -1) {
            throw new Error(`Section "${sectionPath}" not found in the level file`);
        }
    });
    const endPattern = new RegExp(`^${indent}\\]`);
    const sectionEnd = lines.findIndex(
        (line, index) => index > sectionStart && endPattern.test(line)
    );
    if (sectionEnd === -1) {
        throw new Error(`End of section "${sectionPath}" not found in the level file`);
    }
    return { eol, lines, sectionStart, sectionEnd, entryIndent: indent + INDENT_STEP };
}

export function insertEntryIntoSection(source, section, entryLine) {
    const { eol, lines, sectionStart, sectionEnd, entryIndent } = findSection(source, section);
    ensureTrailingComma(lines, sectionStart, sectionEnd);
    lines.splice(sectionEnd, 0, entryIndent + entryLine);
    return lines.join(eol);
}

// Removes the last occurrence of the entry in the section (new entries are appended at the end).
export function removeEntryFromSection(source, section, entryLine) {
    const { eol, lines, sectionStart, sectionEnd } = findSection(source, section);
    for (let i = sectionEnd - 1; i > sectionStart; i--) {
        if (lines[i].trim() === entryLine.trim()) {
            lines.splice(i, 1);
            return lines.join(eol);
        }
    }
    throw new Error(`Entry not found in "${section}" (edited by hand?): ${entryLine}`);
}

class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Blocks other computers (e.g. when the server runs with --host) and other websites open
// in the browser (CSRF): a cross-site page cannot send a JSON POST without a CORS preflight,
// and the browser always sends the real Origin header.
function assertTrustedRequest(req) {
    if (!LOOPBACK_ADDRESSES.has(req.socket.remoteAddress)) {
        throw new HttpError(403, "Only requests from this computer are allowed");
    }
    if (!req.headers["content-type"]?.startsWith("application/json")) {
        throw new HttpError(415, "Content-Type must be application/json");
    }
    const host = req.headers.host;
    const origin = URL.canParse(req.headers.origin) ? new URL(req.headers.origin) : null;
    if (!origin || origin.host !== host || !LOOPBACK_HOSTNAMES.has(origin.hostname)) {
        throw new HttpError(403, "Requests are only allowed from the editor page on localhost");
    }
}

function isAllowedValue(value) {
    if (Array.isArray(value)) {
        return value.every((item) => typeof item === "number" && Number.isFinite(item));
    }
    return (
        typeof value === "string" ||
        typeof value === "boolean" ||
        (typeof value === "number" && Number.isFinite(value))
    );
}

// Accepts only a known kind/factory and the kind's own field names with plain values.
function validateEntryRequest(kinds, { kind: kindKey, factoryName, props }) {
    if (typeof kindKey !== "string" || !Object.hasOwn(kinds, kindKey)) {
        throw new Error(`Unknown object kind: ${kindKey}`);
    }
    const kind = kinds[kindKey];
    if (!kind.factoryNames.includes(factoryName)) {
        throw new Error(`Unknown factory "${factoryName}" for ${kindKey}`);
    }
    if (typeof props !== "object" || props === null || Array.isArray(props)) {
        throw new Error("props must be an object");
    }
    const fieldNames = kind.fields.map((field) => field.name);
    const allowedNames = new Set(kind.id === null ? fieldNames : [kind.id.field, ...fieldNames]);
    for (const [name, value] of Object.entries(props)) {
        if (!allowedNames.has(name)) {
            throw new Error(`Field "${name}" is not allowed for ${kindKey}`);
        }
        if (!isAllowedValue(value)) {
            throw new Error(`Field "${name}" must be a number, string, boolean or list of numbers`);
        }
    }
    return kind;
}

function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
        });
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
        req.on("error", reject);
    });
}

function sendJson(res, statusCode, data) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}

// Registers a POST endpoint; `handle(request)` gets the parsed JSON body and returns
// (a promise of) the response data.
function usePostEndpoint(server, endpoint, handle) {
    server.middlewares.use(endpoint, (req, res) => {
        if (req.method !== "POST") {
            sendJson(res, 405, { error: "Use POST" });
            return;
        }
        try {
            assertTrustedRequest(req);
        } catch (error) {
            sendJson(res, error.statusCode, { error: error.message });
            return;
        }
        readJsonBody(req)
            .then((request) => handle(request))
            .then((data) => sendJson(res, 200, data))
            .catch((error) => sendJson(res, 400, { error: error.message }));
    });
}

function updateFile(filePath, update) {
    const source = fs.readFileSync(filePath, "utf8");
    fs.writeFileSync(filePath, update(source), "utf8");
}

export function levelEditorPlugin() {
    // Undo history per level file: what was added, not file snapshots (Command pattern),
    // so manual edits made in the meantime survive an undo. Lives only in dev-server memory,
    // so a server restart clears it.
    const undoStacks = new Map(); // filePath -> [{ section, entryLine }]

    const getUndoStack = (filePath) => {
        if (!undoStacks.has(filePath)) {
            undoStacks.set(filePath, []);
        }
        return undoStacks.get(filePath);
    };

    return {
        name: "ldos-level-editor",
        apply: "serve",
        configureServer(server) {
            usePostEndpoint(server, ADD_ENTRY_ENDPOINT, async (request) => {
                const { EDITOR_OBJECT_KINDS } = await server.ssrLoadModule(OBJECT_KINDS_MODULE);
                const { buildEntryLine } = await server.ssrLoadModule(ENTRY_BUILDER_MODULE);
                const kind = validateEntryRequest(EDITOR_OBJECT_KINDS, request);
                const { section } = kind;
                const entryLine = buildEntryLine(kind, request.factoryName, request.props);
                const filePath = getLevelFilePath(server.config.root, request.level);
                updateFile(filePath, (source) =>
                    insertEntryIntoSection(source, section, entryLine)
                );
                getUndoStack(filePath).push({ section, entryLine });
                return { ok: true };
            });

            usePostEndpoint(server, UNDO_ENDPOINT, (request) => {
                const filePath = getLevelFilePath(server.config.root, request.level);
                const lastEntry = getUndoStack(filePath).pop();
                if (!lastEntry) {
                    throw new Error("Nothing to undo");
                }
                const { section, entryLine } = lastEntry;
                updateFile(filePath, (source) =>
                    removeEntryFromSection(source, section, entryLine)
                );
                return { ok: true, removed: entryLine };
            });
        },
    };
}
