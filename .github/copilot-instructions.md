# Lost Days of Spring – instructions for AI assistants

A 2D pixel-art platformer / metroidvania in **vanilla JavaScript (ES modules) + HTML5 Canvas**, bundled with Vite.
Colin La Mehr wakes up on a strange planet and pieces his story together through artifacts he finds.
Read this file first; see `README.md` for the public description.

## 1. About the developer (read before answering)

- Jakub is a **senior frontend developer** (mostly Angular/TypeScript). He knows JavaScript well, but **not** game development and not other languages.
- This is his **first game**, and the project is also a **learning exercise**. Recommend popular, proven solutions for this type of game and explain _why_ they are used.
- When explaining game-dev concepts, use web/Angular analogies (e.g. controller ≈ service, `drawEntity` registry ≈ a token-to-provider map, game loop ≈ a render cycle that you drive yourself).
- He writes in **Polish**. Reply in Polish unless asked otherwise. **Code, comments, identifiers, commit messages and this file are always in English.**
- The repo is also a public portfolio piece: keep the code clean and architecture-conscious.

## 2. How we work (most important rules)

1. **Smallest possible steps.** Change the smallest part of the code, then stop so the developer can run it in the browser, review it and approve. Even one feature (e.g. a new jump) is split into several small steps. Never deliver a big-bang change.
2. **Simplest code that works.** Plain, self-explanatory, readable code. Prefer clear names over comments. Comment only what is not obvious, briefly. No clever abstractions, no speculative generality.
3. **Discuss first when asked "what do you think?".** Questions like "co sądzisz / co rekomendujesz" want an opinion with a recommendation and trade-offs, not an implementation. Implement when he says "działaj", "zaimplementuj", "start implementation", "zrób …".
4. **Teach design patterns.** When you use or suggest a design pattern (Factory, Strategy, Facade, Observer, Memento, Dependency Injection, State, Registry, higher-order function, …), say so explicitly and add a short reminder/mini-tutorial (what it is, why here, tiny example). Mention where it already exists in the project when relevant.
5. **Match existing conventions** (section 6) instead of introducing new ones. If a convention should change, propose it first.
6. **No automated tests at this stage** – a conscious decision. He tests manually in the browser after every iteration. Do not add a test framework or test files unless he asks.
7. Do not do unrelated refactors or "while I'm here" cleanups. Do not commit unless asked.
8. Before finishing a change run `npm run lint` and `npm run format` (see section 3).

## 3. Commands and tooling

| Command                | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `npm run dev`          | Vite dev server                                            |
| `npm run editor`       | Vite dev server + opens the level editor (`editor.html`)   |
| `npm run build`        | Production build to `dist/` (`base: /lost-days-of-spring/`) |
| `npm run lint`         | ESLint (flat config, `eslint.config.js`)                   |
| `npm run lint:fix`     | ESLint with autofix                                        |
| `npm run format`       | Prettier on `src/**/*.js`, root `*.js`, `*.css`, `*.html`  |
| `npm run bust-cache`   | Appends a version to `style.css` in `index.html`           |

- Prettier: 4 spaces, double quotes, semicolons, `printWidth: 100`, `trailingComma: es5`, LF. `.editorconfig` matches.
- ESLint rules to respect: `eqeqeq`, `curly: all` (always braces), `no-var`, `prefer-const`, `no-console` (warn), unused vars must start with `_`.
- No private `#` methods/fields – the project does not use them. Constants are plain class fields or module constants.
- Deployment: GitHub Actions (`.github/workflows/deploy.yml`) builds on push to `main` and publishes to GitHub Pages.
- Dev URL params (parsed in `index.html`): `?debug=true`, `?level=2` or `?level=bonus001`, `?initialHp=N`. Debug overlay toggles with Backspace.
- `.gitignore` covers `node_modules/`, `dist/`, `.vscode/`, logs, OS files. Do not commit build output.

## 4. Game state (what already exists)

- Level 1 is **complete** (~30–60 min to finish) with a story outline. Level 2 is an **old temporary level** – do not treat it as a reference.
- Core mechanics are complete and tuned (all physics parameters were chosen and playtested – do not "improve" numbers without being asked): acceleration/deceleration, coyote time, jump buffer, variable jump height, crouch, knockback, terrain types (solid, ice, one-direction, cracks, bouncy/booster), elevators, teleports, hidden walls, spikes, cannons.
- Combat: shooting with a simple weapon upgrade system, simple patrolling enemies (slime, evil eye), hit cooldown/invulnerability, death animation, game over with auto-restart.
- Collectibles: coins, splinters, artifacts (story text), hearts, weapon upgrades. A level exit requires collecting at least half of coins, splinters and artifacts.
- UI/flow: title screen, pause menu, artifact gallery, minimap/map view, HUD, message/dialogue panels, level-complete and game-over screens, fullscreen mode, stats panel.
- Persistence: checkpoints saved to `localStorage` (upgrades, collected items, killed enemies, discovered map, death count, play time).
- Target: smooth **60 FPS in all popular browsers**.

### Planned direction

- The character grows level by level and gains new abilities, e.g. multiple jump / jetpack with a **cooldown that shrinks with each ability level**.
- More levels (replace temporary level 2), more story content, more enemy types.
- A possible future migration to TypeScript (see `README.md`) – keep code type-friendly (explicit data shapes, no magic dynamic property tricks).

## 5. Architecture overview

```
index.html                 entry: preloads images/fonts, creates LostDaysOfSpring, loadLevel(), start()
src/core/LostDaysOfSpring.js   game "orchestrator": owns state, fixed-timestep loop, input mode dispatch
src/config/                keysMap.js (key bindings), physics.js (gravity etc.)
src/factories/GameFactory.js   data factories for ALL game objects + colors/sizes (SCALE, GRID)
src/levels/                level001.js, level002.js (story levels), bonus001.js (bonus/playground levels), levelsConfig.js (id -> structuredClone, STORY_LEVEL_IDS order)
src/systems/               *Controller / *Manager classes – one logical subsystem each
src/renderers/             stateless draw objects + SceneRenderer + EntityRenderPipeline
src/services/              LevelLoader, CheckpointStorage (localStorage), MapDiscovery
src/utils/                 collision.js, imgCache.js, levelStats.js, patrol.js
src/messages.js            all story/tutorial/dialogue texts
public/                    textures, fonts, img (served as-is; referenced as "textures/...")
```

### Game loop and time

- `loop(now)` uses `requestAnimationFrame` and a **fixed timestep** accumulator (`fixedDt = 1/60`, `maxFrameTime = 0.25`). `update()` runs 0..n times per frame, then one `draw()`.
- There are **two clocks**: wall clock (`performance.now()`/RAF `now`, used for loop timing and fade-in) and `simulatedTime` (advanced by `fixedDt` per update step, passed as `now` to all gameplay code). Never mix them. All gameplay timers (cooldowns, animations, delays) use the simulation `now`.
- **Pause-safe timers:** pause menu, map view and gallery "freeze" time via `PauseController`. Any controller that stores timestamps must implement `adjustForPause(pauseDuration)` and be registered in the `pausables` passed to `PauseController.resumeAll`. When you add a new stored timestamp on the player, add it to `PauseController.adjustPlayerTimers`.
- Update order in `update()` matters (input → physics → elevators → move X → move Y → enemies/damage → projectiles → collectibles → checkpoints → teleports → messages → camera). Keep it when adding steps.

### Coordinates and scaling

- Internal canvas is **1920×1080**; it is scaled with CSS by `DisplayController` (1920/1440/960/480 wide). Sprites are authored on a 16 px tile.
- `GameFactory.SCALE = 4`, `GameFactory.GRID = 64` (16 px × 4). **Scale is always 4.** World sizes should be multiples of SCALE/GRID.
- `GameFactory.grid.*` factories take **tile units** (multiplied by GRID); plain `GameFactory.*` factories take pixels.
- Camera position is pixel-snapped (`snapStep` from `DisplayController`) to avoid shimmering sub-pixel artifacts. Keep drawing on integer pixels; avoid blur (pixel-art look).

### Subsystem pattern (controllers)

Each logical subsystem lives in its own module under `src/systems/` (Camera, Checkpoint, Message, Teleport, Enemy, Elevator, Collectible, Combat, Pause, Input, Display, …). Typical shape:

- Constructor receives its dependencies (**constructor-based Dependency Injection**), e.g. `new EnemyController(playerPhysicsController)`.
- `setX(data)` / `getX()` to load and read level data (called by `LevelLoader`).
- `update(now, { player, solids, onPlayerHit, … })` – other systems and cross-cutting reactions are passed as **explicit arguments or callbacks**, so controllers do not depend on the game instance (e.g. `CameraController` is pure math and testable in isolation).
- `adjustForPause(pauseDuration)` if it stores timestamps.
- Wrapper methods in `LostDaysOfSpring` (e.g. `updateEnemies(now)`) exist to **assemble arguments/callbacks**. Do not add pure pass-through forwarding methods that add nothing.
- **State mutation rule:** a controller may freely mutate state it owns. Player physics state (`x, y, vx, vy, airborne, …`) must be changed through `PlayerPhysicsController` methods (`stopMovement`, `warpTo`, `setPosition`, `applyKnockback`, `recordPreviousPosition`, …), not by scattered direct assignments from other controllers.
- Level data is plain data produced by factories; levels are registered in `levelsConfig.js` as `() => structuredClone(LEVEL_xxx)` so every load starts fresh.

### Rendering

- `SceneRenderer.draw(ctx, game, now)` defines the whole-frame draw order (background → parallax → exits → platforms → items → collectibles → enemies → player → foreground → UI/HUD).
- `EntityRenderPipeline.js` holds the `ENTITY_RENDERERS` table: `{ draw, mapDraw, cull }` per entity type. `drawEntity()` handles map view and camera culling in one place. **To render a new entity type: add a renderer with `draw(ctx, obj, opts)` and register it in this table.**
- All renderers share one signature `draw(ctx, obj, opts)` with `opts = { debug, now, camera, player, type }`. Renderers are **stateless object literals** (not classes); module-level caches (offscreen canvases) are fine.
- Entity-specific map-view renderers (`Map*Renderer`) are interchangeable **Strategies** with the same `draw` interface.
- Colors, sizes and per-type defaults belong in `GameFactory`, not hard-coded in renderers (add new colors to the factory if needed). Physics constants go to `src/config/physics.js`, key bindings to `src/config/keysMap.js`, story texts to `src/messages.js`.

### Level editor (dev only)

- Separate sub-app: `editor.html?level=N` (`npm run editor`), code in `src/editor/`. Not part of the production build (Vite builds only `index.html`).
- Loads the level with the game's `LevelLoader` (no update/physics) and draws it in debug mode + grid via `EditorSceneRenderer`, which mirrors the world part of `SceneRenderer` – **keep both draw orders in sync** when adding an entity type.
- Mouse: left drag pans the map (camera kept in `camX`/`camY` URL params), right click on a tile opens the panel to add one of the kinds from the `EDITOR_OBJECT_KINDS` table (`editorObjectKinds.js`).
- Saving: the editor POSTs plain data `{ level, kind, factoryName, props }` to the dev-server plugin `level-editor-plugin.js`. The plugin validates it against `EDITOR_OBJECT_KINDS` (loaded with `server.ssrLoadModule`, so client and server share one table), builds the `GameFactory...({ ... }),` line itself (`buildEntryLine`) and inserts it before the closing `    ],` of the section in `src/levels/levelXXX.js`; Vite then reloads the page. It relies on the hand-formatted layout (section at 4 spaces, entries at 8) – keep level files in that shape.
- Security: never accept source code from the client. Endpoints only accept loopback connections, `Content-Type: application/json` and a localhost `Origin` equal to `Host` (blocks LAN access and CSRF from other websites); prop values must be finite numbers, strings or booleans.
- Undo (button / Ctrl+Z): the plugin keeps a per-level stack of added lines in dev-server memory (cleared on server restart) and removes the last one by exact line match, so manual edits elsewhere survive.
- New ids = first free id across platforms/elevators/hidden walls/temporary platforms, starting at 1 (platforms), 2001 (hidden walls), 3001 (temporary platforms).
- The editor's `ASSETS`/`FONTS` lists in `editor.html` must match those in `index.html`.

### Collision

- Axis-aligned rectangles only (`rectsCollide` in `utils/collision.js`) – sufficient for now.
- Player movement resolves **X first, then Y** (using `prevX/prevY`), against `solids` (elevators first, then platforms). Enemy collision uses the same axis-separated approach during the hit cooldown.

### Checkpoints and persistence

- `CheckpointManager` keeps the respawn **memento** (snapshot of player stats, collected ids, alive enemies, triggered elevators, shown messages, discovered map, timing). `CheckpointStorage` serializes it to `localStorage` (key `ldos_checkpoint`; `Set`s stored as arrays).
- **Invariant:** every collectible/enemy/elevator/message/checkpoint **`id` must be unique and stable** within a level, because saved progress is keyed by ids. Never renumber ids of existing level content. Factory-generated platform ids start at 8001 (teleports) and 9001 (checkpoints) – do not collide with them.
- When adding new persistent state (e.g. unlocked abilities, ability levels), extend the snapshot (`buildCheckpointContext` / `CheckpointManager.snapshot`), `playerRespawnState`, and `CheckpointStorage` set fields consistently, and keep old saves from crashing (use defaults).

## 6. Conventions checklist

- Language: English for code, comments, commit messages. Prefer descriptive names (`updateDamageCooldown`, `canStandUp`), small functions, early returns.
- One class/module per logical subsystem; new gameplay system → new `src/systems/XController.js` and (if drawable) a renderer registered in `EntityRenderPipeline.js`.
- Prefer data-driven approaches (factories, config tables, registries) over `if/else` chains and magic numbers/indices.
- Use `const`, strict equality, braces everywhere (ESLint enforces it).
- Avoid allocations in per-frame code (no new arrays/objects/closures in hot loops when avoidable; reuse offscreen canvases; precompute where possible).
- Commit message style in history: `Lost Days Of Spring - Platformer game - <short description>`.

## 7. Performance rules (target: stable 60 FPS)

- **Never draw what the camera cannot see.** Culling already exists on several levels:
  - whole objects: `drawEntity` → `CameraController.isVisible(obj, margin)` (camera rect + margin `GRID * 5`; accounts for `repeatX/repeatY`), controlled per type by the `cull` flag;
  - large tiled objects (big platforms/walls): `cullRange()` in `PlatformRenderers.js` draws only the visible tile rows/columns;
  - off-screen elevators skip player/enemy interaction and use a cheaper movement path (`isVisibleInCamera` in `ElevatorController`).
    New renderable objects must go through `drawEntity` (and set `cull: true` unless they are parallax/player). Large repeated objects need per-tile culling.
- **Images are cached:** use `getImg(path)` from `utils/imgCache.js` – never `new Image()` in draw code. Add every new texture to the `ASSETS` list in `index.html` (and `editor.html`) so it is preloaded before the game starts (the loading screen waits for it). Fonts are preloaded the same way.
- Reuse offscreen canvases (see Player/Enemy/Collectible/Gallery renderers) for tinting/outlines instead of creating new ones per frame.
- Debug HUD updates at a fixed human-readable interval, not every frame; keep new debug output cheap.
- Check large level files before heavy iteration: `level001.js` (~3.6k lines) and `GameFactory.js` (~1.6k lines) – use `grep`/ranged views instead of reading them whole.

## 8. Notes for common tasks

- **New ability (jump/jetpack/etc.):** split into steps – (1) add state fields to `GameFactory.player()` + `playerRespawnState`; (2) add the logic in `PlayerPhysicsController` driven by `now` (cooldown uses simulation time, pause-safe); (3) input binding in `keysMap.js` + `InputController`; (4) renderer/animation; (5) persistence in the checkpoint; (6) pickup/upgrade collectible. Each step reviewed separately.
- **New enemy type:** factory in `GameFactory` (+ `grid` variant), renderer in `EnemyRenderers.js` using the shared `draw(ctx, obj, opts)` signature, patrol logic reuses `utils/patrol.js`.
- **New level:** data file in `src/levels/`, register in `levelsConfig.js`, texts in `messages.js`, keep ids unique/stable, then check the `index.html` `level` param handling.
- **New UI screen/state:** follow the existing mode dispatch (`InputRouter.currentMode()` + `inputHandlers` in the core) and keep rendering in a dedicated renderer.
- Explain any non-obvious canvas/game-dev concept briefly when you use it (e.g. `ctx.translate` camera transform, fixed timestep, axis-separated collision, sprite sheets, parallax).
