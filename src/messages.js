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
        NOT_ENOUGH_ARTIFACTS: {
            text: "You didn't get enough artifacts",
            color: "#4772da",
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
        ARTIFACTS_COLOR: "#4772da",
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
                        { text: ", ", color: "#ffffff" },
                        { text: "splinters", color: "#5ce8d0" },
                        { text: " and ", color: "#ffffff" },
                        { text: "artifacts", color: "#4772da" },
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
        ARTIFACTS: {
            DISK001: {
                lines: [
                    { text: "A 1.44 MB floppy disk." },
                    {
                        text: "I remember the first time my brother brought it home.",
                    },
                    { text: "This is how computer games entered our lifes." },
                ],
            },
            CASSETTE001: {
                lines: [
                    { text: "My First Awesome Mixtape!" },
                    { text: "Radiohead, Pearl Jam, The Smashing Pumpkins..." },
                ],
            },
            EIGHTBALL: {
                lines: [
                    { text: "The black 8-ball." },
                    {
                        text: "Jimmy's friends loved watching me lose with style.",
                    },
                ],
            },
            LIGHTER: {
                lines: [
                    { text: "Never liked smoking, but some people" },
                    { text: "called me a lighter thief." },
                ],
            },
            BASKETBALL: {
                lines: [
                    { text: "A basketball." },
                    {
                        text: "Having the poster of the NBA player made you at least 20% cooler.",
                    },
                ],
            },
            HOUSEKEY: {
                lines: [
                    { text: "A house key." },
                    {
                        text: "How many times have I lost it...",
                    },
                ],
            },
            CDROM: {
                lines: [
                    { text: "One of my first CD games was Phantasmagoria." },
                    {
                        text: "I still have a trauma.",
                    },
                ],
            },
            VINYL001: {
                lines: [
                    { text: "Dad loved these. Funny how they're cool again." },
                    {
                        text: "King Crimson's debut was basically a soundtrack to our lives.",
                    },
                ],
            },
            KEYBOARD: {
                lines: [
                    { text: "Not as cool as a guitar..." },
                    {
                        text: "But if you could play the intro to Karma Police, you were somebody.",
                    },
                ],
            },
            PINGPONG: {
                lines: [
                    { text: "Table tennis." },
                    {
                        text: "I was actually pretty good at this.",
                    },
                ],
            },
            BINOCULARS: {
                lines: [
                    { text: "Binoculars." },
                    {
                        text: "I could spend hours just looking out the window.",
                    },
                ],
            },
            DICE001: {
                lines: [
                    { text: "A dice." },
                    { text: "Some adventures began with a single roll." },
                ],
            },
            HOCKEYSTICK: {
                lines: [
                    { text: "Hockey never really clicked for me." },
                    {
                        text: "Jimmy's best friend couldn't get enough of it.",
                    },
                ],
            },
            HEADPHONES001: {
                lines: [
                    { text: "Headphones. Could there be anything" },
                    {
                        text: "more essential for a music nerd like me?",
                    },
                ],
            },
            WATCH001: {
                lines: [
                    { text: "My first real watch." },
                    {
                        text: "The second hand was a tiny spider.",
                    },
                ],
            },
            TOILETPAPER: {
                lines: [{ text: "Only teenagers know a hundred uses for it." }],
            },
            GAMEBOY: {
                lines: [
                    {
                        text: "Dear Nintendo...",
                    },
                    {
                        text: "I'm so glad I grew up in your golden age.",
                    },
                ],
            },
            SCREWDRIVER: {
                lines: [
                    { text: "Dad had an amazing collection of screwdrivers." },
                ],
            },
            BONE: {
                lines: [
                    { text: "Cheetos." },
                    {
                        text: "The one and only. Every adventure needed him.",
                    },
                ],
            },
            FOOTBALL: {
                lines: [{ text: "Nobody scored more goals than Jimmy." }],
            },
            CARD001: {
                lines: [
                    { text: "Jimmy could bluff with a straight face." },
                    {
                        text: "I gave myself away every time.",
                    },
                ],
            },
            NOTE: {
                lines: [
                    { text: "Keep going, Colin." },
                    { text: "I believe in you." },
                    { text: "- J." },
                ],
                offsetY: -10,
            },
            PILL001: {
                lines: [{ text: "I wish I had noticed sooner." }],
            },
        },
    },
};

export function getExitLevelLines(
    hasEnoughCoins,
    hasEnoughSplinters,
    hasEnoughArtifacts,
) {
    if (hasEnoughCoins && hasEnoughSplinters && hasEnoughArtifacts) {
        return MESSAGES.EXIT.READY;
    }
    const lines = [];
    if (!hasEnoughCoins) {
        lines.push(MESSAGES.EXIT.NOT_ENOUGH_COINS);
    }
    if (!hasEnoughSplinters) {
        lines.push(MESSAGES.EXIT.NOT_ENOUGH_SPLINTERS);
    }
    if (!hasEnoughArtifacts) {
        lines.push(MESSAGES.EXIT.NOT_ENOUGH_ARTIFACTS);
    }
    lines.push(MESSAGES.EXIT.COMPLETION_REQUIRED);
    return lines;
}
