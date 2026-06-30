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
                    { text: "This is how computer games entered our lives." },
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
                        text: "Having the poster of an NBA player made you at least 20% cooler.",
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
                        text: "I'm still traumatized.",
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
                    { text: "A die." },
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
            CARD002: { lines: [{ text: "Four of a Kind." }] },
            CARD003: { lines: [{ text: "Full House." }] },
            CARD004: { lines: [{ text: "Straight." }] },
            NOTE001: {
                lines: [
                    { text: "Keep going, Colin." },
                    { text: "I believe in you." },
                    { text: "- J." },
                ],
                offsetY: -10,
            },
            NOTE002: {
                lines: [
                    { text: "What remains of our restless youth..." },
                    { text: "- J." },
                ],
                offsetY: -10,
            },
            NOTE003: {
                lines: [{ text: "...ash and embers.?" }, { text: "- J." }],
                offsetY: -10,
            },
            PILL001: {
                lines: [{ text: "I wish I had noticed sooner." }],
            },
            PILL002: {
                lines: [{ text: "Could I have done anything?" }],
            },
            MAGNIFIER: {
                lines: [
                    {
                        text: 'The initials "C.L.M." burned into a tree at the local park.',
                    },
                ],
            },
            FLYER: {
                lines: [
                    {
                        text: "My first job was handing out flyers for Happy Tomato Pizza.",
                    },
                ],
            },
            TRAFFIC_CONE: {
                lines: [
                    {
                        text: "For some reason, the street with Happy Tomato Pizza",
                    },
                    { text: "was almost always under construction." },
                ],
            },

            CACTUS: {
                lines: [
                    {
                        text: "Mr. Prickles kept me company all through high school.",
                    },
                ],
            },
            BATTERY: {
                lines: [
                    { text: "I had a whole army of these before" },
                    { text: "I learned dead batteries could be toxic." },
                ],
            },
            WALKIE_TALKIE: {
                lines: [{ text: "- ROGER THAT" }],
            },
            TOOTHBRUSH: {
                lines: [{ text: "Hygiene comes first." }],
            },
            PALETTE: {
                lines: [
                    {
                        text: "My first love wanted to be a painter.",
                    },
                    {
                        text: "That's the only reason I know who Salvador Dalí was.",
                    },
                ],
            },
            THERMOMETER: {
                lines: [
                    {
                        text: "I remember the summer of '94 being incredibly hot.",
                    },
                ],
            },
            STYLUS_PHONE: {
                lines: [
                    { text: "It had a stylus..." },
                    { text: "...and a whopping 128 MB of storage." },
                ],
            },
            SUNGLASSES: {
                lines: [{ text: "Things are getting serious." }],
            },
            BOOK: {
                lines: [
                    {
                        text: "I must have read The Lord of the Rings a dozen times.",
                    },
                ],
            },
            CASH: {
                lines: [
                    { text: "Twelve bucks and fifty cents." },
                    { text: "My weekly allowance from Dad." },
                ],
            },
            BUTTON: {
                lines: [{ text: 'I had a friend everyone called "Button."' }],
            },
            TV001: {
                lines: [{ text: "'90s cartoons were the best." }],
            },
            RED_PAINT: {
                lines: [{ text: "Red." }],
            },
            GREEN_PAINT: {
                lines: [{ text: "Green." }],
            },
            BLUE_PAINT: {
                lines: [{ text: "Blue." }],
            },
            ID_CARD: {
                lines: [
                    { text: "Jimmy's fake driver's license." },
                    { text: "John Doe. Subtle as ever." },
                ],
            },
            LABORATORY_BLUE: {
                lines: [
                    { text: "Mr. Green's classes were the best." },
                    { text: "He let us poke around his lab after school." },
                ],
            },
            TOASTER: {
                lines: [
                    {
                        text: "Mom made the best mozzarella and chorizo toasties.",
                    },
                ],
            },
            FLASHLIGHT: {
                lines: [
                    { text: "A trusty flashlight." },
                    {
                        text: "Nighttime trips to the woods behind Joe's junkyard.",
                    },
                ],
            },
            CAMERA: {
                lines: [
                    { text: "Jimmy's camera." },
                    {
                        text: "For a while, Jimmy took pictures of absolutely everything.",
                    },
                ],
            },
            BRUSH: {
                lines: [
                    { text: "My parents let me paint our fence." },
                    {
                        text: "It was a solid 4/10.",
                    },
                ],
            },
            RIBBON: {
                lines: [
                    {
                        text: "My amazing prize for the best horror story in fifth grade.",
                    },
                    { text: "And, of course, the principal's handshake." },
                ],
            },
            RED_VINYL: {
                lines: [{ text: "TA DA TA RA RA RA RAAA RA RA RA RAAAAAAA" }],
            },
            PENDRIVE: {
                lines: [
                    { text: "A USB drive." },
                    { text: "My entire teenage life fit into 256 MB." },
                ],
            },
            LIGHTBULB: {
                lines: [
                    { text: '"Magic trapped inside a glass bulb"' },
                    { text: "five-year-old Colin used to say." },
                ],
            },
            DIAL: {
                lines: [{ text: "A dial could be an ancient artifact, too." }],
            },
            TSHIRT_WITH_SKULL: {
                lines: [
                    { text: "A T-shirt with a skull." },
                    { text: "My favorite one." },
                ],
            },
            KITTIE: {
                lines: [{ text: "Meowwww." }],
            },
            GLASSES_3D: {
                lines: [{ text: "Dinosaurs looked amazing in 3D." }],
            },
            POCKET_KNIFE: {
                lines: [{ text: "The ultimate teenage gadget." }],
            },
            BASEBALL_CAP: {
                lines: [
                    { text: "A baseball cap." },
                    { text: "I wore it backwards, of course." },
                ],
            },
            BANDAGE: {
                lines: [
                    { text: "The ultimate cure for playground battle wounds." },
                ],
            },
            MICROPHONE: {
                lines: [{ text: "Mic check. One, two... one, two..." }],
            },
            RED_GUITAR: {
                lines: [{ text: "We definitely need more distortion!" }],
            },
            PC: {
                lines: [
                    { text: "A 386 processor, 4 MB of RAM, and VGA graphics" },
                    { text: "were all you needed to have a great time." },
                ],
            },
            LIFE_PRESERVER: {
                lines: [{ text: "Does anyone need help?" }],
            },
            COMPASS: {
                lines: [
                    { text: "An old compass." },
                    { text: "It supposedly belonged to my grandpa." },
                ],
            },
            FIZZY_DRINK: {
                lines: [
                    { text: "A fizzy drink." },
                    { text: "I practically lived on this stuff." },
                ],
            },
            TEDDY_BEAR: {
                lines: [
                    { text: "Mr. Grumpy!" },
                    {
                        text: "It's a little embarrassing, but I still miss him.",
                    },
                ],
            },
            WRENCH: {
                lines: [{ text: "This was exactly what my old bike needed." }],
            },
            FIRE_EXTINGUISHER: {
                lines: [
                    { text: "Things got really dangerous" },
                    { text: "when Mr. Green's lab caught fire" },
                ],
            },
            RAINY_BOOTS: {
                lines: [{ text: "The official footwear of rainy days." }],
            },
            PAPER_CLIP: {
                lines: [
                    { text: "Jimmy's friend could open any" },
                    { text: "school locker with one of these." },
                ],
            },
            FLOWER: {
                lines: [
                    { text: "Mom was a complete flower fanatic." },
                    { text: "She definitely had a green thumb." },
                ],
            },
            CALENDAR: {
                lines: [
                    { text: "July and August rule." },
                    { text: "Obviously." },
                ],
            },
            SUITCASE: {
                lines: [{ text: "Dad's stylish suitcase." }],
            },
            PHOTOCOPIER: {
                lines: [
                    { text: "A photocopier in teachers' room." },
                    {
                        text: "According to legend, one student was once allowed to use it.",
                    },
                ],
            },
            SOCKS: {
                lines: [
                    {
                        text: "Teenage feet should probably come with a warning label.",
                    },
                ],
            },
            BASEBALL: {
                lines: [{ text: "Jimmy was a great pitcher." }],
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
