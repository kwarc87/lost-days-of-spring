import { rectsCollide } from "../utils/collision.js";

// Owns collectible definitions/state (coins, splinters, artifacts, hearts,
// weapon upgrades) plus the player-pickup collision resolution.
export class CollectibleController {
    constructor() {
        this.coins = [];
        this.splinters = [];
        this.artifacts = [];
        this.hearts = [];
        this.weaponUpgrades = [];
    }

    setCollectibles(collectibles) {
        this.coins = collectibles?.coins ?? [];
        this.splinters = collectibles?.splinters ?? [];
        this.artifacts = collectibles?.artifacts ?? [];
        this.hearts = collectibles?.hearts ?? [];
        this.weaponUpgrades = collectibles?.weaponUpgrades ?? [];
    }

    getCoins() {
        return this.coins;
    }

    getSplinters() {
        return this.splinters;
    }

    getArtifacts() {
        return this.artifacts;
    }

    getHearts() {
        return this.hearts;
    }

    getWeaponUpgrades() {
        return this.weaponUpgrades;
    }

    // Marks collectibles already collected in a restored checkpoint memento.
    restoreCollected({
        collectedCoinIds,
        collectedSplinterIds,
        collectedArtifactIds,
        collectedHeartIds,
        collectedWeaponUpgradeIds,
    }) {
        if (collectedCoinIds) {
            for (const c of this.coins) {
                if (collectedCoinIds.has(c.id)) {
                    c.collected = true;
                }
            }
        }

        if (collectedSplinterIds) {
            for (const s of this.splinters) {
                if (collectedSplinterIds.has(s.id)) {
                    s.collected = true;
                }
            }
        }

        if (collectedArtifactIds) {
            for (const a of this.artifacts) {
                if (collectedArtifactIds.has(a.id)) {
                    a.collected = true;
                }
            }
        }

        if (collectedHeartIds) {
            for (const h of this.hearts) {
                if (collectedHeartIds.has(h.id)) {
                    h.collected = true;
                }
            }
        }

        if (collectedWeaponUpgradeIds) {
            for (const u of this.weaponUpgrades) {
                if (collectedWeaponUpgradeIds.has(u.id)) {
                    u.collected = true;
                }
            }
        }
    }

    // Checks player collision against every collectible type and applies pickup effects.
    update(
        now,
        { player, onArtifactMessage, onWeaponMessage, onWeaponPickup, onHeartPickup, canHeal }
    ) {
        for (const c of this.coins) {
            if (!c.collected && rectsCollide(player, c)) {
                c.collected = true;
                player.coinsCount++;
            }
        }

        for (const s of this.splinters) {
            if (!s.collected && rectsCollide(player, s)) {
                s.collected = true;
                player.splintersCount++;
            }
        }

        for (const a of this.artifacts) {
            if (!a.collected && rectsCollide(player, a)) {
                a.collected = true;
                player.artifactsCount++;
                if (a.message) {
                    onArtifactMessage(a.message, a, now);
                }
            }
        }

        for (const u of this.weaponUpgrades) {
            if (!u.collected && rectsCollide(player, u)) {
                u.collected = true;
                onWeaponPickup(u?.weapon);
                if (u.message) {
                    onWeaponMessage(u.message, now);
                }
            }
        }

        for (const h of this.hearts) {
            if (!h.collected && rectsCollide(player, h) && canHeal()) {
                h.collected = true;
                onHeartPickup();
            }
        }
    }
}
