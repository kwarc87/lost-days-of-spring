// ─── Single source of truth for all UI messages ──────────────────────────────

export function formatPlayTime(ms) {
    const totalSec = Math.floor(Math.max(0, ms) / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const MESSAGES = {
    // ── Exit ─────────────────────────────────────────────────────────────────
    EXIT: {
        READY: [
            { text: "You are ready to move on.", color: "#3d9f97" },
            { text: "To exit level press Enter", color: "#ffffff" },
        ],
        NOT_ENOUGH_COINS: {
            text: "You didn't get enough coins",
            color: "#f5c542",
        },
        NOT_ENOUGH_SPLINTERS: {
            text: "You didn't get enough splinters",
            color: "#5ce8d0",
        },
        COMPLETION_REQUIRED: {
            text: "to complete the level.",
            color: "#ffffff",
        },
    },

    // ── Stats screen shared texts & colors ────────────────────────────────────
    STATS: {
        COINS_COLOR: "#f5c542",
        ENEMIES_COLOR: "#e85454",
        SPLINTERS_COLOR: "#5ce8d0",
        COUNTDOWN_COLOR: "#7a8a99",
        TIME_COLOR: "#a0c4ff",
        COINS_TEXT: (count, total) => `Coins: ${count} / ${total}`,
        ENEMIES_TEXT: (count, total) => `Enemies defeated: ${count} / ${total}`,
        SPLINTERS_TEXT: (count, total) =>
            `Splinters: ${count} / ${total}  \u2756 hidden`,
        COUNTDOWN_TEXT: (remaining) => `Restart in ${remaining}s  \u2013  ESC`,
        TIME_TEXT: (formatted) => `Time: ${formatted}`,
    },

    // ── Game Over ─────────────────────────────────────────────────────────────
    GAME_OVER: {
        TITLE: "GAME OVER",
        TITLE_COLOR: "#e8334a",
    },

    // ── Level Complete ────────────────────────────────────────────────────────
    LEVEL_COMPLETE: {
        TITLE: "LEVEL COMPLETE!",
        TITLE_COLOR: "#f5c542",
        RESTART_HINT: { text: "ESC \u2013 restart level", color: "#7a8a99" },
    },

    // ── Pause ─────────────────────────────────────────────────────────────────
    PAUSE: {
        TITLE: { text: "PAUSED", color: "#f5c542" },
        RESUME: { text: "P \u2013 resume", color: "#7a8a99" },
    },

    // ── Level 1 ───────────────────────────────────────────────────────────────
    LEVEL_1: {
        INTRO: [
            { text: "Find the exit and collect", color: "#ffffff" },
            { text: "the appropriate amount of", color: "#ffffff" },
            {
                segments: [
                    { text: "coins", color: "#f5c542" },
                    { text: " and ", color: "#ffffff" },
                    { text: "splinters", color: "#5ce8d0" },
                    { text: ".", color: "#ffffff" },
                ],
            },
            { text: "Go, traveler!", color: "#ffffff" },
        ],
        JUMP_HINT: [
            {
                segments: [
                    { text: "To jump press ", color: "#fff" },
                    { text: "z ", color: "#f5c542" },
                    { text: "or ", color: "#fff" },
                    { text: "space", color: "#f5c542" },
                ],
            },
        ],
        SHOOT_HINT: [
            {
                segments: [
                    { text: "To shoot press ", color: "#fff" },
                    { text: "x ", color: "#f5c542" },
                    { text: "or ", color: "#fff" },
                    { text: "ALT", color: "#f5c542" },
                ],
            },
        ],
        CROUCH_HINT: [
            {
                segments: [
                    { text: "To crouch press ", color: "#fff" },
                    { text: "c ", color: "#f5c542" },
                    { text: "or ", color: "#fff" },
                    { text: "Arrow DOWN", color: "#f5c542" },
                ],
            },
        ],
        PAUSE_HINT: [
            {
                segments: [
                    { text: "To pause the game press ", color: "#fff" },
                    { text: "p", color: "#f5c542" },
                ],
            },
        ],
        MINI_MAP_HINT: [
            {
                text: "If you are really lost and don't know what",
                color: "#fff",
            },
            {
                segments: [
                    {
                        text: "to do, you can press ",
                        color: "#fff",
                    },
                    { text: "m ", color: "#f5c542" },
                    { text: "to display the minimap", color: "#fff" },
                ],
            },
        ],
    },
};

export function getExitLevelLines(hasEnoughCoins, hasEnoughSplinters) {
    if (hasEnoughCoins && hasEnoughSplinters) {
        return MESSAGES.EXIT.READY;
    }
    const lines = [];
    if (!hasEnoughCoins) {
        lines.push(MESSAGES.EXIT.NOT_ENOUGH_COINS);
    }
    if (!hasEnoughSplinters) {
        lines.push(MESSAGES.EXIT.NOT_ENOUGH_SPLINTERS);
    }
    lines.push(MESSAGES.EXIT.COMPLETION_REQUIRED);
    return lines;
}
