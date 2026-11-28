import { LEVELS } from "../levels/levelsConfig.js";
import { GameFactory } from "../factories/GameFactory.js";
import { PHYSICS } from "../config/physics.js";
import { KEYS_MAP } from "../config/keysMap.js";
import { LevelLoader } from "../services/LevelLoader.js";
import { CameraController } from "../systems/CameraController.js";
import { CheckpointManager } from "../systems/CheckpointManager.js";
import { ExitController } from "../systems/ExitController.js";
import { TeleportController } from "../systems/TeleportController.js";
import { HiddenWallController } from "../systems/HiddenWallController.js";
import { HackPanelController } from "../systems/HackPanelController.js";
import { WaterController } from "../systems/WaterController.js";
import { TemporaryPlatformController } from "../systems/TemporaryPlatformController.js";
import { CombatController } from "../systems/CombatController.js";
import { ElevatorController } from "../systems/ElevatorController.js";
import { EnemyController } from "../systems/EnemyController.js";
import { CollectibleController } from "../systems/CollectibleController.js";
import { MessageController } from "../systems/MessageController.js";
import { PlayerPhysicsController } from "../systems/PlayerPhysicsController.js";
import { EditorSceneRenderer } from "./EditorSceneRenderer.js";
import { EditorPanel } from "./EditorPanel.js";
import { EditorToggle } from "./EditorToggle.js";
import { EDITOR_OBJECT_KINDS } from "./editorObjectKinds.js";
import { findFirstFreeId, findIdAfterHighest } from "./levelEntryBuilder.js";

// Served by the dev-server plugin in level-editor-plugin.js (dev only).
const ADD_ENTRY_ENDPOINT = "/__level-editor/add-entry";
const UNDO_ENDPOINT = "/__level-editor/undo";

const HIDDEN_WALLS_TOGGLE_KEY = "KeyH";

// Each id group lists the loaded objects whose ids a new object must not collide with
// (the `id.group` of a kind in editorObjectKinds.js).
const ID_GROUPS = {
    // Everything that ends up in the platform/solid lists
    solids: (editor) => [
        editor.platforms,
        editor.elevatorController.getElevators(),
        editor.hiddenWallController.getHiddenWalls(),
        editor.temporaryPlatformController.getTemporaryPlatforms(),
    ],
    coins: (editor) => [editor.collectibleController.getCoins()],
    splinters: (editor) => [editor.collectibleController.getSplinters()],
    hearts: (editor) => [editor.collectibleController.getHearts()],
    spikes: (editor) => [editor.combatController.getSpikes()],
    artifacts: (editor) => [editor.collectibleController.getArtifacts()],
    hackPanels: (editor) => [editor.hackPanelController.getHackPanels()],
    enemies: (editor) => [editor.enemyController.getEnemies()],
    checkpoints: (editor) => [editor.checkpointManager.checkpoints],
};

// Throws with the server's error message when the request fails.
async function postToEditorServer(endpoint, body) {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
    }
}

// Keyboard shortcuts are ignored inside form fields (Ctrl+Z and Backspace edit the text there).
function isTypingInForm(e) {
    return Boolean(e.target.closest?.("input, select, textarea"));
}

// Level editor orchestrator: loads a level with the game's own LevelLoader (no update/physics),
// lets the user pan with the left mouse button and add objects with the right one.
// It also acts as the "state facade" for drawEntity(), like the game instance does.
export class LevelEditor {
    constructor(canvasId, levelId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.levelId = levelId;
        this.panel = new EditorPanel(document.getElementById("editor-panel"));
        this.status = document.getElementById("editor-status");
        this.undoButton = document.getElementById("editor-undo");

        // Debug off = preview: the level looks like in the game (no ids, hitboxes or grid).
        this.debugToggle = new EditorToggle({
            button: document.getElementById("editor-debug"),
            urlParam: "debug",
            key: KEYS_MAP.debugToggle,
            onLabel: "Debug: on",
            offLabel: "Debug: off (preview)",
        });
        // Hidden walls cover the secret rooms; hiding them lets you see and edit what is inside.
        this.hiddenWallsToggle = new EditorToggle({
            button: document.getElementById("editor-hidden-walls"),
            urlParam: "hiddenWalls",
            key: HIDDEN_WALLS_TOGGLE_KEY,
            onLabel: "Hidden walls: shown",
            offLabel: "Hidden walls: hidden",
        });
        this.toggles = [this.debugToggle, this.hiddenWallsToggle];

        // Read by drawEntity()
        this.mapView = false;

        this.cameraController = new CameraController(this.canvas.width, this.canvas.height);
        const playerPhysicsController = new PlayerPhysicsController(PHYSICS);
        this.elevatorController = new ElevatorController();
        this.enemyController = new EnemyController(playerPhysicsController);
        this.collectibleController = new CollectibleController();
        this.combatController = new CombatController();
        this.messageController = new MessageController();
        this.exitController = new ExitController();
        this.teleportController = new TeleportController(playerPhysicsController);
        this.hiddenWallController = new HiddenWallController();
        this.temporaryPlatformController = new TemporaryPlatformController();
        this.hackPanelController = new HackPanelController(this.temporaryPlatformController);
        this.waterController = new WaterController();
        // Never loads the saved game, so collected items and killed enemies are still shown.
        this.checkpointManager = new CheckpointManager();

        this.drag = null; // { startClientX, startClientY, startCameraX, startCameraY }
        this.hoveredTile = null;
        this.selectedTile = null;

        this.loop = this.loop.bind(this);
    }

    // Read by drawEntity()
    get showDebug() {
        return this.debugToggle.isOn;
    }

    loadLevel() {
        const levelData = LEVELS[this.levelId]();
        const loaded = LevelLoader.load(levelData, {
            elevatorController: this.elevatorController,
            enemyController: this.enemyController,
            collectibleController: this.collectibleController,
            combatController: this.combatController,
            messageController: this.messageController,
            exitController: this.exitController,
            teleportController: this.teleportController,
            hiddenWallController: this.hiddenWallController,
            hackPanelController: this.hackPanelController,
            temporaryPlatformController: this.temporaryPlatformController,
            waterController: this.waterController,
            checkpointManager: this.checkpointManager,
        });
        this.worldSize = loaded.worldSize;
        this.platforms = loaded.platforms;
        this.foregroundItems = loaded.foregroundItems;
        this.backgroundItems = loaded.backgroundItems;
        this.preBackgroundItems = loaded.preBackgroundItems;
        this.parallaxItems = loaded.parallaxItems;
        this.background = loaded.background;

        // Drawn at the level start position as a reference point
        this.player = GameFactory.player({ weapon: GameFactory.weapon() });
        Object.assign(
            this.player,
            GameFactory.playerRespawn({
                player: this.player,
                checkpoint: null,
                levelData,
                posture: "standing",
                baseMaxLife: GameFactory.DEFAULT_MAX_LIFE,
            })
        );
    }

    start() {
        this.loadLevel();
        this.restoreCameraFromUrl();
        this.attachMouse();
        this.attachKeyboard();
        this.undoButton.addEventListener("click", () => this.undoLastEntry());
        this.updateStatus();
        window.requestAnimationFrame(this.loop);
    }

    loop(now) {
        EditorSceneRenderer.draw(this.ctx, this, now);
        window.requestAnimationFrame(this.loop);
    }

    // ====== CAMERA ======

    // The camera position lives in the URL, so the view stays in place after a reload.
    restoreCameraFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const x = parseFloat(params.get("camX"));
        const y = parseFloat(params.get("camY"));
        if (Number.isFinite(x) && Number.isFinite(y)) {
            this.cameraController.camera.x = x;
            this.cameraController.camera.y = y;
            this.cameraController.clampCameraToWorld(this.worldSize);
        } else {
            this.cameraController.resetToPlayerStart(this.player, this.worldSize);
        }
    }

    saveCameraToUrl() {
        const url = new URL(window.location.href);
        url.searchParams.set("camX", String(this.cameraController.camera.x));
        url.searchParams.set("camY", String(this.cameraController.camera.y));
        window.history.replaceState(null, "", url);
    }

    // ====== KEYBOARD ======

    attachKeyboard() {
        window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    }

    handleKeyDown(e) {
        if (isTypingInForm(e)) {
            return;
        }
        if (e.ctrlKey && e.code === "KeyZ") {
            e.preventDefault();
            this.undoLastEntry();
            return;
        }
        // Without modifiers, so browser shortcuts like Ctrl+H still work
        const toggle = this.toggles.find((t) => t.key === e.code);
        if (toggle && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            toggle.toggle();
        }
    }

    // ====== MOUSE ======

    attachMouse() {
        this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
        window.addEventListener("mousemove", (e) => this.handleMouseMove(e));
        window.addEventListener("mouseup", (e) => this.handleMouseUp(e));
        this.canvas.addEventListener("contextmenu", (e) => this.handleContextMenu(e));
    }

    // The canvas is 1920x1080 internally but scaled with CSS, so mouse deltas need scaling.
    getCanvasScale() {
        const rect = this.canvas.getBoundingClientRect();
        return {
            rect,
            x: this.canvas.width / rect.width,
            y: this.canvas.height / rect.height,
        };
    }

    getTileUnderMouse(e) {
        const { rect, x: scaleX, y: scaleY } = this.getCanvasScale();
        const camera = this.cameraController.camera;
        const worldX = (e.clientX - rect.left) * scaleX + camera.x;
        const worldY = (e.clientY - rect.top) * scaleY + camera.y;
        return {
            x: Math.floor(worldX / GameFactory.GRID),
            y: Math.floor(worldY / GameFactory.GRID),
        };
    }

    handleMouseDown(e) {
        if (e.button !== 0) {
            return;
        }
        this.drag = {
            startClientX: e.clientX,
            startClientY: e.clientY,
            startCameraX: this.cameraController.camera.x,
            startCameraY: this.cameraController.camera.y,
        };
        this.canvas.classList.add("dragging");
    }

    handleMouseMove(e) {
        if (e.target === this.canvas) {
            this.hoveredTile = this.getTileUnderMouse(e);
            this.updateStatus();
        }
        if (!this.drag) {
            return;
        }
        const scale = this.getCanvasScale();
        const camera = this.cameraController.camera;
        camera.x = this.drag.startCameraX - (e.clientX - this.drag.startClientX) * scale.x;
        camera.y = this.drag.startCameraY - (e.clientY - this.drag.startClientY) * scale.y;
        this.cameraController.clampCameraToWorld(this.worldSize);
    }

    handleMouseUp(e) {
        if (e.button !== 0 || !this.drag) {
            return;
        }
        this.drag = null;
        this.canvas.classList.remove("dragging");
        this.saveCameraToUrl();
    }

    handleContextMenu(e) {
        e.preventDefault();
        this.selectedTile = this.getTileUnderMouse(e);
        this.panel.showKindMenu(
            this.selectedTile,
            EDITOR_OBJECT_KINDS,
            (kindKey) => this.openForm(kindKey),
            () => this.closePanel()
        );
    }

    updateStatus() {
        const tile = this.hoveredTile ? `x: ${this.hoveredTile.x}, y: ${this.hoveredTile.y}` : "-";
        this.status.textContent = `Level ${this.levelId} | tile ${tile} | LMB drag: move map | RMB: add object | Ctrl+Z: undo | ${KEYS_MAP.debugToggle}: debug | ${HIDDEN_WALLS_TOGGLE_KEY.replace("Key", "")}: hidden walls`;
    }

    // ====== ADDING OBJECTS ======

    closePanel() {
        this.selectedTile = null;
        this.panel.hide();
    }

    collectUsedIds(group) {
        const ids = new Set();
        for (const items of ID_GROUPS[group](this)) {
            for (const item of items) {
                ids.add(item.id);
            }
        }
        return ids;
    }

    getNewId(kind) {
        if (kind.id === null) {
            return null;
        }
        const usedIds = this.collectUsedIds(kind.id.group);
        const findId = kind.id.block ? findIdAfterHighest : findFirstFreeId;
        return findId(usedIds, kind.id.firstId);
    }

    openForm(kindKey) {
        const kind = EDITOR_OBJECT_KINDS[kindKey];
        this.panel.showForm(
            kindKey,
            kind,
            { id: this.getNewId(kind), x: this.selectedTile.x, y: this.selectedTile.y },
            ({ factoryName, props }) => this.saveEntry(kindKey, factoryName, props),
            () => this.closePanel()
        );
    }

    // Sends plain data only; the dev server validates it and builds the line of level code.
    async saveEntry(kindKey, factoryName, props) {
        try {
            await postToEditorServer(ADD_ENTRY_ENDPOINT, {
                level: this.levelId,
                kind: kindKey,
                factoryName,
                props,
            });
        } catch (error) {
            window.alert(`Saving failed: ${error.message}`);
            return;
        }
        // No manual reload: Vite sees the changed level file and reloads the page itself
        // (only then is the fresh module served). The camera position survives it via the URL.
        this.saveCameraToUrl();
    }

    // ====== UNDO ======

    // Removes the most recently added entry; Vite reloads the page like after saving.
    async undoLastEntry() {
        try {
            await postToEditorServer(UNDO_ENDPOINT, { level: this.levelId });
        } catch (error) {
            window.alert(`Undo failed: ${error.message}`);
        }
    }
}
