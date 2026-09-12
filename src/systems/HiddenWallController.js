import { rectsCollide } from "../utils/collision.js";

// Owns hidden wall definitions and their player-entered (fade-out) collision state.
export class HiddenWallController {
    constructor() {
        this.hiddenWalls = [];
    }

    setHiddenWalls(hiddenWalls) {
        this.hiddenWalls = hiddenWalls ?? [];
    }

    getHiddenWalls() {
        return this.hiddenWalls;
    }

    update(player) {
        for (const wall of this.hiddenWalls) {
            wall.entered = rectsCollide(player, wall);
        }
    }
}
