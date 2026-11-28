import { LEVEL_001 } from "./level001.js";
import { LEVEL_002 } from "./level002.js";
import { LEVEL_BONUS_001 } from "./bonus001.js";

// Story levels use numeric ids, bonus levels (playgrounds) use string ids like "bonus001".
// The id matches the file name: level001.js -> 1, bonus001.js -> "bonus001".
// prettier-ignore
export const LEVELS = {
    1: () => structuredClone(LEVEL_001),
    2: () => structuredClone(LEVEL_002),
    bonus001: () => structuredClone(LEVEL_BONUS_001),
};

// Story levels in play order. Bonus levels are not part of the story chain.
// TEMPORARY: only level 1 is playable in story mode, the next levels are unfinished.
// Restore to [1, 2] when level 2 is ready (it is still reachable via ?level=2).
export const STORY_LEVEL_IDS = [1];

// Returns null after the last story level and for bonus levels.
export function getNextStoryLevelId(levelId) {
    const index = STORY_LEVEL_IDS.indexOf(levelId);
    return index === -1 ? null : (STORY_LEVEL_IDS[index + 1] ?? null);
}

// Turns a URL param ("2", "bonus001") into a level id (2, "bonus001"), or null if unknown.
export function resolveLevelId(param) {
    const id = /^\d+$/.test(param ?? "") ? Number(param) : param;
    return Object.hasOwn(LEVELS, id) ? id : null;
}
