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
    showForm(kind, { id, x, y }, onSave, onCancel) {
        const form = document.createElement("form");
        const factorySelect = createSelect(kind.factoryNames, false);
        form.append(createRow("factory", factorySelect));

        if (id !== null) {
            const idOutput = document.createElement("output");
            idOutput.textContent = String(id);
            form.append(createRow("id", idOutput));
        }

        const prefilled = { x, y };
        const inputs = kind.fields.map((field) => {
            const input = createInput(field, prefilled[field.name] ?? field.defaultValue);
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
            const props = id === null ? {} : { id };
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
    input.type = field.input;
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
    return field.input === "number" ? Number(input.value) : input.value;
}
