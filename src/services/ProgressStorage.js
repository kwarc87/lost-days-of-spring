const PROGRESS_KEY = "ldos_progress";
const PROGRESS_VERSION = 1;

function createEmptyProgress() {
    return { version: PROGRESS_VERSION, currentLevelId: 1, loadout: null, completedLevels: {} };
}

// Story progress that outlives a single level (unlike the checkpoint memento):
// which level the player continues from and the result of every completed level.
export const ProgressStorage = {
    // Always returns a valid progress object (empty one when nothing usable is saved).
    load() {
        try {
            const raw = localStorage.getItem(PROGRESS_KEY);
            if (!raw) {
                return createEmptyProgress();
            }
            const data = JSON.parse(raw);
            return data?.version === PROGRESS_VERSION ? data : createEmptyProgress();
        } catch {
            return createEmptyProgress();
        }
    },

    save(progress) {
        try {
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
        } catch {
            // localStorage unavailable (e.g. private browsing) — fail silently
        }
    },

    clear() {
        try {
            localStorage.removeItem(PROGRESS_KEY);
        } catch {
            // localStorage unavailable — fail silently
        }
    },
};
