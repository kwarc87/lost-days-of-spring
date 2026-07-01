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
            DISK002: {
                lines: [
                    { text: '"Lost Days Of Spring"' },
                    {
                        text: "\u00a9 Game created by Jimmy and Colin La Mehr (1997)",
                    },
                ],
            },
            CASSETTE001: {
                lines: [
                    { text: "My First Awesome Mixtape!" },
                    { text: "Radiohead, Pearl Jam, The Smashing Pumpkins..." },
                ],
            },
            CASSETTE002: {
                lines: [{ text: "The Offspring - Americana" }],
                displayTime: 3000,
            },
            CASSETTE003: {
                lines: [{ text: "Bad Religion - Stranger Than Fiction" }],
                displayTime: 3000,
            },
            CASSETTE004: {
                lines: [{ text: '"Jimmy and Colin\'s Nightly Freak Show"' }],
                displayTime: 3000,
            },
            EIGHTBALL: {
                lines: [
                    { text: "The black 8-ball. Jimmy's friends" },
                    {
                        text: "loved watching me lose with style.",
                    },
                ],
                displayTime: 5000,
            },
            LIGHTER: {
                lines: [
                    { text: "Never liked smoking, but some people" },
                    { text: "called me a lighter thief." },
                ],
                displayTime: 5000,
            },
            BASKETBALL: {
                lines: [
                    { text: "A basketball. Having the poster of an NBA" },
                    {
                        text: " player made you at least 20% cooler.",
                    },
                ],
                displayTime: 6000,
            },
            HOUSEKEY: {
                lines: [
                    { text: "A house key." },
                    {
                        text: "How many times have I lost it...",
                    },
                ],
                displayTime: 5000,
            },
            CDROM: {
                lines: [
                    { text: "One of my first CD games was" },
                    {
                        text: "Phantasmagoria. I'm still traumatized.",
                    },
                ],
                displayTime: 5000,
            },
            VINYL001: {
                lines: [
                    { text: "Dad loved these. Funny how" },
                    { text: "they're cool again. King Crimson's first album" },
                    { text: "was basically a soundtrack to our lives." },
                ],
                displayTime: 8000,
            },
            KEYBOARD: {
                lines: [
                    { text: "Not as cool as a guitar..." },
                    { text: "But if you could play the intro" },
                    { text: "to Karma Police, you were somebody." },
                ],
            },
            PINGPONG: {
                lines: [
                    { text: "Table tennis." },
                    {
                        text: "I was actually pretty good at this.",
                    },
                ],
                displayTime: 5000,
            },
            BINOCULARS: {
                lines: [
                    { text: "Binoculars. I could spend hours" },
                    {
                        text: "just looking out the window.",
                    },
                ],
                displayTime: 5000,
            },
            DICE001: {
                lines: [
                    { text: "A die. Some adventures" },
                    { text: "began with a single roll." },
                ],
            },
            HOCKEYSTICK: {
                lines: [
                    { text: "Hockey never really clicked for me." },
                    {
                        text: "Jimmy's best friend couldn't get enough of it.",
                    },
                ],
                displayTime: 5000,
            },
            HEADPHONES001: {
                lines: [
                    { text: "Headphones. Could there be anything" },
                    {
                        text: "more essential for a music nerd like me?",
                    },
                ],
                displayTime: 5000,
            },
            WATCH001: {
                lines: [
                    { text: "My first real watch." },
                    {
                        text: "The second hand was a tiny spider.",
                    },
                ],
                displayTime: 5000,
            },
            TOILETPAPER: {
                lines: [{ text: "Only teenagers know a hundred uses for it." }],
                displayTime: 5000,
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
                displayTime: 5000,
            },
            BONE: {
                lines: [
                    { text: "Cheetos. The one and only." },
                    {
                        text: "Every adventure needed him.",
                    },
                ],
            },
            FOOTBALL: {
                lines: [{ text: "Nobody scored more goals than Jimmy." }],
                displayTime: 5000,
            },
            CARD001: {
                lines: [
                    { text: "Jimmy could bluff with a straight face." },
                    {
                        text: "I gave myself away every time.",
                    },
                ],
                displayTime: 5000,
            },
            CARD002: {
                lines: [{ text: "Four of a Kind." }],
                displayTime: 3000,
            },
            CARD003: { lines: [{ text: "Full House." }], displayTime: 3000 },
            CARD004: { lines: [{ text: "Straight." }], displayTime: 3000 },
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
                lines: [{ text: "...ash and embers?" }, { text: "- J." }],
                offsetY: -5,
            },
            PILL001: {
                lines: [{ text: "I wish I had noticed sooner." }],
            },
            PILL002: {
                lines: [{ text: "Could I have done anything?" }],
            },
            MAGNIFIER: {
                lines: [
                    { text: 'The initials "C.L.M." burned ' },
                    { text: "into a tree at the local park." },
                ],
            },
            FLYER: {
                lines: [
                    {
                        text: "My first job was handing out flyers for Happy Tomato Pizza.",
                    },
                ],
                displayTime: 5000,
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
                displayTime: 5000,
            },
            BATTERY: {
                lines: [
                    { text: "I had a whole army of these before" },
                    { text: "I learned dead batteries could be toxic." },
                ],
            },
            WALKIE_TALKIE: {
                lines: [{ text: "- ROGER THAT" }],
                displayTime: 3000,
            },
            TOOTHBRUSH: {
                lines: [{ text: "Hygiene comes first." }],
                displayTime: 3000,
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
                displayTime: 5000,
            },
            STYLUS_PHONE: {
                lines: [
                    { text: "It had a stylus..." },
                    { text: "...and a whopping 128 MB of storage." },
                ],
                displayTime: 5000,
            },
            SUNGLASSES: {
                lines: [{ text: "Things are getting serious." }],
                displayTime: 5000,
            },
            BOOK001: {
                lines: [
                    {
                        text: "I must have read The Lord of the Rings a dozen times.",
                    },
                ],
            },
            BOOK002: {
                lines: [
                    {
                        text: '"How to Survive High School Without Being a Loser."',
                    },
                ],
                displayTime: 5000,
            },
            CASH: {
                lines: [
                    { text: "Twelve bucks and fifty cents." },
                    { text: "My weekly allowance from Dad." },
                ],
            },
            BUTTON: {
                lines: [{ text: 'I had a friend everyone called "Button."' }],
                displayTime: 5000,
            },
            TV001: {
                lines: [{ text: "'90s cartoons were the best." }],
                displayTime: 5000,
            },
            RED_PAINT: {
                lines: [{ text: "Red." }],
                displayTime: 3000,
            },
            GREEN_PAINT: {
                lines: [{ text: "Green." }],
                displayTime: 3000,
            },
            BLUE_PAINT: {
                lines: [{ text: "Blue." }],
                displayTime: 3000,
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
                    { text: "Jimmy's camera. For a while, Jimmy took" },
                    { text: "pictures of absolutely everything." },
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
                    { text: "My amazing prize for the best horror story" },
                    {
                        text: "in fifth grade. And, of course, the principal's",
                    },
                    { text: "handshake." },
                ],
            },
            RED_VINYL: {
                lines: [{ text: "TA DA TA RA RA RA RAAA RA RA RA RAAAAAAA" }],
                displayTime: 5000,
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
                displayTime: 5000,
            },
            TSHIRT_WITH_SKULL: {
                lines: [
                    { text: "A T-shirt with a skull." },
                    { text: "My favorite one." },
                ],
                displayTime: 5000,
            },
            KITTIE: {
                lines: [{ text: "Meowwww." }],
                displayTime: 3000,
            },
            GLASSES_3D: {
                lines: [{ text: "Dinosaurs looked amazing in 3D." }],
                displayTime: 5000,
            },
            POCKET_KNIFE: {
                lines: [{ text: "The ultimate teenage gadget." }],
                displayTime: 5000,
            },
            BASEBALL_CAP: {
                lines: [{ text: "Just my favorite baseball cap." }],
                displayTime: 5000,
            },
            BANDAGE: {
                lines: [
                    { text: "The ultimate cure" },
                    { text: "for playground battle wounds." },
                ],
                displayTime: 5000,
            },
            MICROPHONE: {
                lines: [{ text: "Mic check. One, two... one, two..." }],
                displayTime: 5000,
            },
            RED_GUITAR: {
                lines: [{ text: "We definitely need more distortion!" }],
                displayTime: 5000,
            },
            PC: {
                lines: [
                    { text: "A 386 processor, 4 MB of RAM, and VGA graphics" },
                    { text: "were all you needed to have a great time." },
                ],
            },
            LIFE_PRESERVER: {
                lines: [{ text: "Does anyone need help?" }],
                displayTime: 5000,
            },
            COMPASS: {
                lines: [
                    { text: "An old compass." },
                    { text: "It supposedly belonged to my grandpa." },
                ],
                displayTime: 5000,
            },
            FIZZY_DRINK: {
                lines: [
                    { text: "A fizzy drink." },
                    { text: "I practically lived on this stuff." },
                ],
                displayTime: 5000,
            },
            TEDDY_BEAR: {
                lines: [
                    { text: "Mr. Grumpy!" },
                    { text: "It's a little embarrassing," },
                    { text: "but I still miss him." },
                ],
            },
            WRENCH: {
                lines: [{ text: "This was exactly what my old bike needed." }],
                displayTime: 5000,
            },
            FIRE_EXTINGUISHER: {
                lines: [
                    { text: "Things got really dangerous" },
                    { text: "when Mr. Green's lab caught fire" },
                ],
            },
            RAINY_BOOTS: {
                lines: [{ text: "The official footwear of rainy days." }],
                displayTime: 5000,
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
                displayTime: 5000,
            },
            SUITCASE: {
                lines: [{ text: "Dad's stylish suitcase." }],
                displayTime: 5000,
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
                    { text: "Teenage feet should probably" },
                    { text: "come with a warning label." },
                ],
            },
            BASEBALL: {
                lines: [{ text: "Jimmy was a great pitcher." }],
                displayTime: 5000,
            },
            SNEAKERS: {
                lines: [
                    {
                        text: "Sneakers. Grunge never really took over our school",
                    },
                    { text: "but it definitely had its crowd." },
                ],
            },
            BARBELL: {
                lines: [
                    { text: "There was this guy everyone called Big Mike." },
                    {
                        text: "He practically lived at the gym. I preferred to keep my distance.",
                    },
                ],
            },
            NEWSPAPER: {
                lines: [
                    { text: "A local paper wrote about Jimmy and me after" },
                    {
                        text: "we won the state high school game development competition.",
                    },
                    { text: '"Lost Days of Spring" We really did spend' },
                    {
                        text: "the whole spring making that platformer. Totally worth it.",
                    },
                ],
                displayTime: 9000,
            },
            KITE: {
                lines: [
                    { text: "A kite. It belonged to the neighborhood kids." },
                    { text: "Dad finally got it off the roof months later." },
                ],
            },
            PELICAN: {
                lines: [
                    { text: "That cheap plastic thing stood" },
                    { text: "in Mrs. Brown's garden for decades." },
                ],
            },
            PAPER_PLANE: {
                lines: [
                    { text: "None of mine ever landed in a storm drain." },
                    {
                        text: "As far as I know, there were no creepy clowns around.",
                    },
                ],
            },
            ENVELOPE: {
                lines: [
                    { text: "I spent years waiting for" },
                    { text: "my invitation to magic school." },
                ],
            },
            SANTA_HAT: {
                lines: [
                    { text: "I'll never forget how Jimmy" },
                    { text: "ruined Christmas for me in first grade" },
                    { text: "by telling me Santa wasn't real." },
                ],
            },
            MAGNET: {
                lines: [
                    { text: '"Science Beach"' },
                    { text: "We thought it was hilarious." },
                ],
                displayTime: 5000,
            },
            DRAWING_PIN: {
                lines: [{ text: "I don't recommend sitting on it." }],
                displayTime: 5000,
            },
            TRIANGLE: {
                lines: [
                    { text: "Ah, Mrs. Pines' music classes..." },
                    { text: "and the thrill of singing" },
                    {
                        text: "Twinkle, Twinkle, Little Star for the 154th time.",
                    },
                ],
            },
            BAG: {
                lines: [{ text: "Just my school backpack" }],
                displayTime: 5000,
            },
            GIFT: {
                lines: [
                    {
                        text: "My twelfth birthday gift from Jimmy - a skateboard.",
                    },
                    { text: "I rode it for years." },
                ],
            },
            CALCULATOR: {
                lines: [
                    { text: "Did you know there used to be" },
                    {
                        text: "calculators you could play Snake on?",
                    },
                ],
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
