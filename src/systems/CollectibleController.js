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

    // Checks player collision against every collectible type and applies pickup effects.
    update(now, { player, onArtifactMessage, onWeaponMessage }) {
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
                player.weapon = u?.weapon ?? player.weapon;
                if (u.message) {
                    onWeaponMessage(u.message, now);
                }
            }
        }

        for (const h of this.hearts) {
            if (!h.collected && rectsCollide(player, h) && player.life < player.maxLife) {
                h.collected = true;
                player.life++;
            }
        }
    }
}
