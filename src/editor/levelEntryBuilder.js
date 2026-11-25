// Turns validated form values into one line of level source code, e.g.
// GameFactory.grid.solid({ id: 16, x: 10, y: 120, w: 3, h: 1, layout: "metal" }),
// buildEntryLine runs on the dev server (level-editor-plugin.js), findFirstFreeId in the editor.

export function findFirstFreeId(usedIds, firstId) {
    let id = firstId;
    while (usedIds.has(id)) {
        id++;
    }
    return id;
}

function formatValue(value) {
    return typeof value === "string" ? JSON.stringify(value) : String(value);
}

export function buildEntryLine(kind, factoryName, props) {
    const args = Object.entries(props)
        .map(([key, value]) => `${key}: ${formatValue(value)}`)
        .join(", ");
    // Some factories (e.g. grass, wallSharpLeftCol) return an array that must be spread.
    const returnsArray = Array.isArray(kind.factoryOwner[factoryName](props));
    const spread = returnsArray ? "..." : "";
    return `${spread}${kind.factoryPath}.${factoryName}({ ${args} }),`;
}
