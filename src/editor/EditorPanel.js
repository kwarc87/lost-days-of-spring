// Form fields prefilled from the clicked tile, and which tile axis each one takes.
const TILE_PROP_AXIS = { x: "x", y: "y", startX: "x", startY: "y", targetX: "x", targetY: "y" };

// Right-side DOM panel: first a menu with object kinds, then a small properties form.
// Knows nothing about the level or saving – it only reports what the user picked/entered.
export class EditorPanel {
    constructor(element) {
        this.element = element;
    }

    hide() {
        this.element.hidden = true;
        this.element.replaceChildren();
    }

    show(title, ...children) {
        const heading = document.createElement("h2");
        heading.textContent = title;
        this.element.replaceChildren(heading, ...children);
        this.element.hidden = false;
    }

    showKindMenu(tile, kinds, onPick, onCancel) {
        const buttons = Object.entries(kinds).map(([kindKey, kind]) =>
            createButton(kind.label, () => onPick(kindKey))
        );
        this.show(
            `Add at x: ${tile.x}, y: ${tile.y}`,
            ...buttons,
            createButton("Cancel", onCancel)
        );
    }

    // onSave receives { factoryName, props } where props holds only the filled-in fields.
    showForm(kindKey, kind, { id, x, y }, onSave, onCancel) {
        const remembered = loadRememberedForm(kindKey);
        const form = document.createElement("form");
        const factorySelect = createSelect(kind.factoryNames, false);
        restoreControlValue(factorySelect, remembered.factoryName);
        form.append(createRow("factory", factorySelect));

        if (id !== null) {
            const idOutput = document.createElement("output");
            idOutput.textContent = String(id);
            form.append(createRow(kind.id.field, idOutput));
        }

        const tile = { x, y };
        const prefilled = {};
        for (const field of kind.fields) {
            if (field.name in TILE_PROP_AXIS) {
                prefilled[field.name] = tile[TILE_PROP_AXIS[field.name]];
            }
        }
        const inputs = kind.fields.map((field) => {
            const input = createInput(field, prefilled[field.name] ?? field.defaultValue);
            if (!(field.name in prefilled)) {
                restoreControlValue(input, remembered.fields[field.name]);
            }
            form.append(createRow(field.name, input));
            return { field, input };
        });

        const saveButton = document.createElement("button");
        saveButton.type = "submit";
        saveButton.textContent = "Save";
        form.append(saveButton, createButton("Cancel", onCancel));

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            saveButton.disabled = true;
            saveRememberedForm(kindKey, factorySelect, inputs, prefilled);
            const props = id === null ? {} : { [kind.id.field]: id };
            for (const { field, input } of inputs) {
                const value = readInputValue(field, input);
                if (value !== null) {
                    props[field.name] = value;
                }
            }
            onSave({ factoryName: factorySelect.value, props }).finally(() => {
                saveButton.disabled = false;
            });
        });

        this.show(kind.label, form);
    }
}

function createButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
}

function createRow(label, control) {
    const row = document.createElement("label");
    const name = document.createElement("span");
    name.textContent = label;
    row.append(name, control);
    return row;
}

// withEmptyOption: adds a "(default)" choice that leaves the factory default in place.
function createSelect(options, withEmptyOption) {
    const select = document.createElement("select");
    const values = withEmptyOption ? ["", ...options] : options;
    for (const value of values) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value === "" ? "(default)" : value;
        select.append(option);
    }
    return select;
}

function createInput(field, initialValue) {
    if (field.input === "select") {
        return createSelect(field.options, true);
    }
    const input = document.createElement("input");
    if (field.input === "checkbox") {
        input.type = "checkbox";
        return input;
    }
    input.type = field.input === "numberList" ? "text" : field.input;
    if (field.input === "number") {
        input.step = "any";
    }
    input.value = initialValue ?? "";
    return input;
}

// Returns null for an empty field so it is left out of the saved entry.
function readInputValue(field, input) {
    if (field.input === "checkbox") {
        return input.checked ? true : null;
    }
    if (input.value === "") {
        return null;
    }
    if (field.input === "numberList") {
        return input.value.split(",").map(Number);
    }
    return field.input === "number" ? Number(input.value) : input.value;
}

// The editor page reloads after every save (Vite HMR), so the last used form values per kind
// are kept in localStorage. Position (x, y) is never remembered – it comes from the clicked tile.
const REMEMBERED_FORMS_KEY = "ldos_editor_forms";

function loadAllRememberedForms() {
    try {
        return JSON.parse(localStorage.getItem(REMEMBERED_FORMS_KEY)) ?? {};
    } catch {
        return {};
    }
}

function loadRememberedForm(kindKey) {
    const saved = loadAllRememberedForms()[kindKey];
    return { factoryName: saved?.factoryName, fields: saved?.fields ?? {} };
}

function saveRememberedForm(kindKey, factorySelect, inputs, prefilled) {
    const fields = {};
    for (const { field, input } of inputs) {
        if (!(field.name in prefilled)) {
            fields[field.name] = field.input === "checkbox" ? input.checked : input.value;
        }
    }
    const all = loadAllRememberedForms();
    all[kindKey] = { factoryName: factorySelect.value, fields };
    localStorage.setItem(REMEMBERED_FORMS_KEY, JSON.stringify(all));
}

// Ignores values that no longer exist (e.g. a select option removed from the kinds table).
function restoreControlValue(control, value) {
    if (value === undefined) {
        return;
    }
    if (control.type === "checkbox") {
        control.checked = value === true;
        return;
    }
    if (
        control.tagName === "SELECT" &&
        !Array.from(control.options).some((o) => o.value === value)
    ) {
        return;
    }
    control.value = value;
}
