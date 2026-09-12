import { CheckpointStorage } from "../services/CheckpointStorage.js";
import { rectsCollide } from "../utils/collision.js";

// Owns checkpoint definitions and the respawn memento, plus persistence via
// CheckpointStorage. Callers pass the game collections/context explicitly —
// no dependency on the game instance itself.
export class CheckpointManager {
    constructor() {
        this.checkpoints = [];
        this.checkpointRespawn = null;
    }

    setCheckpoints(checkpoints) {
        this.checkpoints = checkpoints ?? [];
    }

    getRespawn() {
        return this.checkpointRespawn;
    }

    clear() {
        this.checkpointRespawn = null;
        CheckpointStorage.clear();
    }

    // Applies a saved checkpoint from localStorage for this level, if any.
    // Returns true when a save was found and applied.
    loadSaved(levelId) {
        if (this.checkpointRespawn !== null) {
            return false;
        }
        const saved = CheckpointStorage.load();
        if (saved?.levelId === levelId) {
            this.checkpointRespawn = saved;
            return true;
        }
        return false;
    }

    // Extracts decorative layers/messages/platforms embedded in checkpoint defs.
    // Returns data instead of mutating the caller's collections directly.
    extractItems() {
        const back = [];
        const front = [];
        const messages = [];
        const platforms = [];
        for (const cp of this.checkpoints) {
            if (cp.back) {
                back.push(cp.back);
            }
            if (cp.front) {
                front.push(cp.front);
            }
            if (cp.message) {
                messages.push(cp.message);
            }
            if (cp.platform) {
                platforms.push(cp.platform);
            }
        }
        return { back, front, messages, platforms };
    }

    // Interprets the respawn memento and delegates entity restoration to each
    // owning controller instead of mutating their entities directly.
    restoreProgress({
        collectibleController,
        enemyController,
        elevatorController,
        messageController,
        mapDiscovery,
    }) {
        const cr = this.checkpointRespawn;
        if (!cr) {
            return;
        }

        mapDiscovery?.restore(cr.mapDiscoverySnapshot);
        collectibleController.restoreCollected(cr);
        enemyController.restoreAliveState(cr.aliveEnemyIds);
        elevatorController.restoreTriggered(cr.triggeredElevatorIds);
        messageController.restoreShown(cr.shownMessageIds);

        if (cr.reachedIds) {
            for (const cp of this.checkpoints) {
                if (cr.reachedIds.has(cp.id)) {
                    cp.reached = true;
                }
            }
        }
    }

    snapshot(
        now,
        {
            currentLevelId,
            player,
            coins,
            splinters,
            artifacts,
            hearts,
            weaponUpgrades,
            enemies,
            elevators,
            messages,
            mapDiscovery,
            levelStartAt,
            totalPausedTime,
            accumulatedPlayTime,
            deathCount,
        }
    ) {
        this.checkpointRespawn = {
            ...this.checkpointRespawn,
            levelId: currentLevelId,
            mapDiscoverySnapshot: mapDiscovery?.snapshot() ?? null,
            coinsCount: player.coinsCount,
            splintersCount: player.splintersCount,
            artifactsCount: player.artifactsCount,
            weapon: player.weapon,
            collectedCoinIds: new Set(coins.filter((c) => c.collected).map((c) => c.id)),
            collectedSplinterIds: new Set(splinters.filter((s) => s.collected).map((s) => s.id)),
            collectedArtifactIds: new Set(artifacts.filter((a) => a.collected).map((a) => a.id)),
            collectedHeartIds: new Set(hearts.filter((h) => h.collected).map((h) => h.id)),
            collectedWeaponUpgradeIds: new Set(
                weaponUpgrades.filter((u) => u.collected).map((u) => u.id)
            ),
            aliveEnemyIds: new Set(enemies.filter((e) => !e.dead && !e.dying).map((e) => e.id)),
            triggeredElevatorIds: new Set(elevators.filter((e) => e.triggered).map((e) => e.id)),
            shownMessageIds: new Set([
                ...(this.checkpointRespawn?.shownMessageIds ?? []),
                ...messages.filter((m) => m.shown).map((m) => m.id),
            ]),
            playTimeMs: now - levelStartAt - totalPausedTime + accumulatedPlayTime,
            deathCount,
        };
        CheckpointStorage.save(this.checkpointRespawn);
    }

    // Marks any newly-reached checkpoints and snapshots state for each hit,
    // matching the original one-snapshot-per-hit behaviour.
    checkForNewlyReached(now, player, context) {
        for (const cp of this.checkpoints) {
            if (cp.reached || !rectsCollide(player, cp)) {
                continue;
            }
            cp.reached = true;
            this.checkpointRespawn = {
                ...this.checkpointRespawn,
                x: cp.x,
                y: cp.y,
                reachedIds: new Set([...(this.checkpointRespawn?.reachedIds ?? []), cp.id]),
                shownMessageIds: new Set([
                    ...(this.checkpointRespawn?.shownMessageIds ?? []),
                    ...(cp.message ? [cp.message.id] : []),
                ]),
            };
            this.snapshot(now, context);
        }
    }
}
