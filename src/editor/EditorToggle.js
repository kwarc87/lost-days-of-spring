// One on/off switch of the editor view: a toolbar button plus a keyboard shortcut (`key`,
// handled by LevelEditor). The state is kept in the URL like the camera position, so it
// survives the page reload after saving. Missing in the URL = on.
export class EditorToggle {
    constructor({ button, urlParam, key, onLabel, offLabel }) {
        this.button = button;
        this.urlParam = urlParam;
        this.key = key;
        this.onLabel = onLabel;
        this.offLabel = offLabel;
        this.isOn = new URLSearchParams(window.location.search).get(urlParam) !== "false";

        this.button.addEventListener("click", () => this.toggle());
        this.updateLabel();
    }

    toggle() {
        this.isOn = !this.isOn;
        const url = new URL(window.location.href);
        url.searchParams.set(this.urlParam, String(this.isOn));
        window.history.replaceState(null, "", url);
        this.updateLabel();
    }

    updateLabel() {
        this.button.textContent = this.isOn ? this.onLabel : this.offLabel;
    }
}
