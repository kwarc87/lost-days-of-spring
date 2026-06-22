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
        ENEMIES_TEXT: (count, total) => `Enemies: ${count} / ${total}`,
        SPLINTERS_TEXT: (count, total) =>
            `Splinters: ${count} / ${total}  \u2756 hidden`,
        COUNTDOWN_TEXT: (remaining) => `Restart in ${remaining}s  \u2013  ESC`,
        TIME_TEXT: (formatted) => `Time: ${formatted}`,
    },

    // ── Game Over ─────────────────────────────────────────────────────────────
    GAME_OVER: {
        TITLE: "YOU'VE LOST",
        TITLE_COLOR: "#a0c4ff",
        SUBTITLE: "But the journey continues,",
        SUBTITLE2: "try again, traveler.",
        SUBTITLE_COLOR: "#c8d6e5",
        DEATHS_TEXT: (count) => `Deaths: ${count}`,
        DEATHS_COLOR: "#e85454",
    },

    // ── Level Complete ────────────────────────────────────────────────────────
    LEVEL_COMPLETE: {
        TITLE: "LEVEL COMPLETE!",
        TITLE_COLOR: "#f5c542",
        RESTART_HINT: { text: "ESC \u2013 restart level", color: "#7a8a99" },
        DEATHS_TEXT: (count) => `Deaths: ${count}`,
        DEATHS_COLOR: "#e85454",
    },

    // ── Pause ─────────────────────────────────────────────────────────────────
    PAUSE: {
        TITLE: { text: "PAUSED", color: "#f5c542" },
        RESUME: { text: "Resume", color: "#ffffff" },
        RESTART: { text: "Restart", color: "#ffffff" },
    },
    CHECKPOINT: [{ text: "CHECKPOINT", color: "#f5c542" }],
    WEAPON_UPGRADED: [{ text: "Weapon has been upgraded", color: "#ffffff" }],

    // ── Level 1 ───────────────────────────────────────────────────────────────
    LEVEL_1: {
        WELCOME: [
            { text: "Source data loaded.", color: "#fff" },
            { text: " " },
            { text: "Assets analyzed.", color: "#fff" },
            { text: "Memories reconstructed.", color: "#fff" },
            { text: "Player profile created.", color: "#fff" },
            { text: " " },
            { text: "World created successfully.", color: "#fff" },
            { text: " " },
            { text: "1 unresolved item detected.", color: "#f5c542" },
            { text: " " },
            { text: "Ready.", color: "#fff" },
        ],
        INTRO: {
            title: {
                text: "Lost Days Of Spring v1.0",
                color: "#ffffff",
            },
            lines: [
                {
                    text: "Find the exit and collect the appropriate amount of ",
                    color: "#ffffff",
                },
                {
                    segments: [
                        { text: "coins", color: "#f5c542" },
                        { text: " and ", color: "#ffffff" },
                        { text: "splinters", color: "#5ce8d0" },
                        { text: ". Go ahead Colin!", color: "#ffffff" },
                    ],
                },
            ],
        },
        WALK_HINT: [
            {
                segments: [
                    {
                        text: "To move forward / backward use ",
                        color: "#fff",
                    },
                ],
            },
            {
                segments: [
                    { text: "ARROW RIGHT", color: "#f5c542" },
                    { text: " / ", color: "#fff" },
                    { text: "ARROW LEFT", color: "#f5c542" },
                ],
            },
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
        PAUSE_HINT: [
            {
                segments: [
                    { text: "To pause the game press ", color: "#fff" },
                    { text: "p ", color: "#f5c542" },
                    { text: "or ", color: "#fff" },
                    { text: "ESC", color: "#f5c542" },
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
        MINI_MAP_HINT: [
            {
                segments: [
                    {
                        text: "Press ",
                        color: "#fff",
                    },
                    { text: "m ", color: "#f5c542" },
                    {
                        text: "to display the minimap and track yout progress",
                        color: "#fff",
                    },
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
