// Owns raw key state and query helpers. Game-mode dispatch (title screen,
// pause menu, gallery, etc.) and key-to-behaviour interpretation stay in
// LostDaysOfSpring, which calls into this controller for bookkeeping only.
export class InputController {
    constructor(keysMap) {
        this.keysMap = keysMap;
        this.keys = {};
        this.jumpJustPressed = false;
        this.preventDefaultKeys = new Set([
            ...Object.values(keysMap),
            "ControlLeft",
            "ControlRight",
        ]);
    }

    isDown(action) {
        return !!this.keys[this.keysMap[action]];
    }

    consumeJumpBuffer() {
        const pressed = this.jumpJustPressed;
        this.jumpJustPressed = false;
        return pressed;
    }

    markKeyDown(code) {
        this.keys[code] = true;
    }

    markKeyUp(code) {
        this.keys[code] = false;
    }

    markJumpJustPressed() {
        this.jumpJustPressed = true;
    }

    clear() {
        this.keys = {};
    }

    shouldPreventDefault(code) {
        return this.preventDefaultKeys.has(code);
    }

    // Owns the raw DOM listener wiring; callbacks receive only game-mode dispatch.
    attach({ onKeyDown, onKeyUp, onBlur } = {}) {
        this.blurHandler = () => onBlur?.();
        this.keydownHandler = (e) => {
            e.stopPropagation();
            if (this.shouldPreventDefault(e.code)) {
                e.preventDefault();
            }
            onKeyDown?.(e);
        };
        this.keyupHandler = (e) => {
            e.stopPropagation();
            onKeyUp?.(e);
        };
        window.addEventListener("blur", this.blurHandler);
        window.addEventListener("keydown", this.keydownHandler);
        window.addEventListener("keyup", this.keyupHandler);
    }

    detach() {
        window.removeEventListener("blur", this.blurHandler);
        window.removeEventListener("keydown", this.keydownHandler);
        window.removeEventListener("keyup", this.keyupHandler);
    }
}
