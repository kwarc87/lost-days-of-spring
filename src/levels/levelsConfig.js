import { LEVEL_001 } from "./level001.js";
import { LEVEL_002 } from "./level002.js";

// prettier-ignore
export const LEVELS = {
    1: () => structuredClone(LEVEL_002),
    2: () => structuredClone(LEVEL_001),
};
