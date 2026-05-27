const CHECKPOINT_KEY = "ldos_checkpoint";

const SET_FIELDS = [
    "reachedIds",
    "shownMessageIds",
    "collectedCoinIds",
    "collectedSplinterIds",
    "collectedHeartIds",
    "collectedWeaponUpgradeIds",
    "aliveEnemyIds",
    "triggeredElevatorIds",
];

export const CheckpointStorage = {
    save(checkpointRespawn) {
        try {
            const data = { ...checkpointRespawn };
            for (const field of SET_FIELDS) {
                data[field] = [...(checkpointRespawn[field] ?? [])];
            }
            localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(data));
        } catch {
            // localStorage unavailable (e.g. private browsing) — fail silently
        }
    },

    load() {
        try {
            const raw = localStorage.getItem(CHECKPOINT_KEY);
            if (!raw) {
                return null;
            }
            const data = JSON.parse(raw);
            for (const field of SET_FIELDS) {
                data[field] = new Set(data[field] ?? []);
            }
            return data;
        } catch {
            return null;
        }
    },

    clear() {
        try {
            localStorage.removeItem(CHECKPOINT_KEY);
        } catch {
            // localStorage unavailable — fail silently
        }
    },
};
