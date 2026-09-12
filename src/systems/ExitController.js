import { rectsCollide } from "../utils/collision.js";

// Owns level exit definitions and the player-at-exit collision state.
export class ExitController {
    constructor() {
        this.exits = [];
        this.playerAtExit = false;
    }

    setExits(exits) {
        this.exits = exits ?? [];
        this.playerAtExit = false;
    }

    getExits() {
        return this.exits;
    }

    hitbox(exit) {
        const m = exit.triggerMargin;
        return {
            x: exit.x - m,
            y: exit.y - m,
            w: exit.dw + m * 2,
            h: exit.dh + m,
        };
    }

    findActiveExit(player) {
        return this.exits.find((exit) => rectsCollide(player, this.hitbox(exit))) ?? null;
    }

    update(player) {
        this.playerAtExit = this.exits.some((exit) => rectsCollide(player, this.hitbox(exit)));
    }
}
