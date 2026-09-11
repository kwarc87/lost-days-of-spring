import { GameFactory } from "../factories/GameFactory.js";
import { rectsCollide } from "../utils/collision.js";

export class TeleportController {
    constructor() {
        this.teleports = [];
    }

    setTeleports(teleports) {
        this.teleports = teleports ?? [];
    }

    getTeleports() {
        return this.teleports;
    }

    // 1:1 port of the old extractTeleportItems, but returns data instead of
    // mutating the caller's foreground/platform arrays directly.
    extractItems() {
        const foreground = [];
        const platforms = [];
        for (const t of this.teleports) {
            t.originItem = GameFactory.teleport({ x: t.x, y: t.y });
            t.targetItem = GameFactory.teleport({
                x: t.targetX,
                y: t.targetY,
            });
            t.playerEnteredAt = null;
            t.frozenAt = null;
            t.justTeleported = false;
            foreground.push(t.originItem, t.targetItem);
            if (t.platform) {
                platforms.push(t.platform);
            }
            if (t.targetPlatform) {
                platforms.push(t.targetPlatform);
            }
        }
        return { foreground, platforms };
    }

    update(now, player) {
        player.isInTeleport = false;
        for (const t of this.teleports) {
            const targetZone = { x: t.targetX, y: t.targetY, w: t.w, h: t.h };
            const inOrigin = rectsCollide(player, t);
            const inTarget = rectsCollide(player, targetZone);

            if (!inOrigin && !inTarget) {
                t.originItem.cordX = 64;
                t.targetItem.cordX = 64;
                t.playerEnteredAt = null;
                t.justTeleported = false;
                // this condition is for enemy recoil
                if (t.frozenAt !== null) {
                    t.frozenAt = null;
                    player.frozenForTeleport = false;
                }
                continue;
            }

            player.isInTeleport = true;
            (inOrigin ? t.originItem : t.targetItem).cordX = 96;

            if (
                t.playerEnteredAt === null &&
                !t.justTeleported &&
                t.frozenAt === null
            ) {
                t.playerEnteredAt = now;
                t.enteredOrigin = inOrigin;
            }

            if (
                t.playerEnteredAt !== null &&
                now - t.playerEnteredAt >= t.delay
            ) {
                t.frozenAt = now;
                t.playerEnteredAt = null;
                player.vx = 0;
                player.vy = 0;
                player.carryVx = 0;
                player.carryVxInitial = 0;
                player.frozenForTeleport = true;
            }

            if (t.frozenAt !== null && now - t.frozenAt >= t.frozenDelay) {
                const [dx, dy] = t.enteredOrigin
                    ? [t.targetX, t.targetY]
                    : [t.x, t.y];
                player.x = dx + t.w / 2 - player.w / 2;
                player.y = dy + t.h - player.h;
                player.vx = 0;
                player.vy = 0;
                player.frozenForTeleport = false;
                t.originItem.cordX = 64;
                t.targetItem.cordX = 64;
                t.frozenAt = null;
                t.justTeleported = true;
            }
        }
    }

    // Shifts internally-tracked timestamps forward by the pause duration so
    // teleport state timing stays correct across a pause/resume cycle.
    adjustForPause(pauseDuration) {
        for (const t of this.teleports) {
            if (t.playerEnteredAt) {
                t.playerEnteredAt += pauseDuration;
            }
            if (t.frozenAt) {
                t.frozenAt += pauseDuration;
            }
        }
    }
}
