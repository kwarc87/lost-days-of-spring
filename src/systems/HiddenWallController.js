import { rectsCollide } from "../utils/collision.js";

// Owns hidden wall definitions and their player-entered (fade-out) collision state.
// Walls sharing a `group` reveal together when the player enters any of them.
export class HiddenWallController {
    constructor() {
        this.hiddenWalls = [];
        this.enteredGroups = new Set();
    }

    setHiddenWalls(hiddenWalls) {
        this.hiddenWalls = hiddenWalls ?? [];
    }

    getHiddenWalls() {
        return this.hiddenWalls;
    }

    update(player) {
        this.enteredGroups.clear();
        for (const wall of this.hiddenWalls) {
            wall.entered = rectsCollide(player, wall);
            if (wall.entered && wall.group) {
                this.enteredGroups.add(wall.group);
            }
        }
        for (const wall of this.hiddenWalls) {
            if (wall.group && this.enteredGroups.has(wall.group)) {
                wall.entered = true;
            }
        }
    }
}
