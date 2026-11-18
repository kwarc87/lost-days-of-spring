import { LEVEL_001 } from "./level001.js";
import { LEVEL_002 } from "./level002.js";
import { LEVEL_003 } from "./level003.js";

// prettier-ignore
export const LEVELS = {
    1: () => structuredClone(LEVEL_001),
    2: () => structuredClone(LEVEL_002),
    3: () => structuredClone(LEVEL_003),
};
