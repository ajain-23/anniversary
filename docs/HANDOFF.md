# Handoff: "A Dream Come True" — anniversary game for Isa

## What this is
A 2D pixel web game (anniversary gift). Isa wakes in a dream with amnesia; walks a path
through 5 zones; each encounter returns a memory + a real photo; the guide who walks with
her is secretly her boyfriend (revealed at the end via the letter). Built to deploy to
GitHub Pages.

## READ THESE FIRST (source of truth)
1. `docs/DESIGN.md` — the complete design doc: world/zones, all 12 encounters (locked
   dialogue), finale, motifs, tone, art/tileset, and interface. Organized by topic.
2. `HOW_TO_RUN.md` — how to run + exactly where the user's real content (photos, letter,
   names, audio) gets dropped in.
3. `ARTIST_BRIEF.md` — the tilemap contractor spec. NOTE: the tilemap has been DELIVERED AND
   WIRED IN (see "★ DONE" below); this brief is now only reference for the object-marker naming
   conventions. Its 64×64 size is out of date — the delivered map is 60×86.
   (The artist's original source folder `src/assets/ajain map/` was deleted after the map was
   copied into `public/assets/map/`; that folder + its notes.txt no longer exist.)

## Tech stack & environment
- **Phaser 4 + Vite**, vanilla JS. Node installed via **nvm** — every new shell must run:
  `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"` before any `npm` command.
- Run: `cd ~/isa-game && npm run dev`. Build: `npm run build`.
  **Verify a clean `npm run build` after every change** — caught issues early throughout.
- **Architecture is data-driven and must stay that way:** the engine is generic; all content
  lives as step-arrays in `src/data/encounters.js`. Adding/editing encounters = editing data,
  not engine code. Step types are documented at the top of that file and handled in
  `src/engine/EventRunner.js`.

> ## ⚑ SESSION UPDATE — read this first (supersedes older notes below)
> Since the sections below were written, prior sessions changed a lot. The bullets below are
> still ~80% accurate for structure; where they conflict with this box, THIS BOX WINS.
>
> > ### ⚑⚑⚑⚑ NEWEST SESSION (supersedes everything below, incl. the "apply the SCRIPT rewrite" box)
> > **The SCRIPT rewrite is DONE + a full ambient-NPC system was added.** Current state:
> > - **SCRIPT rewrite APPLIED** (see `docs/SCRIPT_REWRITE_HANDOFF.md`, now marked applied):
> >   new order, `squirrel` removed, `pasta` first (on-path, no gate), gates on
> >   insurance/iloveyou/notices, 4-phrase intro (length-scaled hold ~2–6s, widened intro text
> >   box in `ui.css`), new verbs/captions, real letter (`LetterUI.js`, sign-off "— Ayush"),
> >   trimmed finale (kept `{music:"finale"}`), `FINAL_PHOTO.caption = "Isa y Ayush"`.
> > - **family/trips ORDER SWAPPED** to `family → trips` (spatial: entering the city via g3,
> >   family sits by the gate exit). `STORY_ORDER` + the `encounters.js` block order reflect this.
> > - **"SPACE to look" prompt → "SPACE to open".**
> > - **Pond reflection cutscene** = real Snoopy poses (`snoopy_ft1/2/3.png`) baked into a soft
> >   circular porthole (`_bakeReflectionTexture`/`_makeReflection`). Do NOT color-key those PNGs.
> > - **Ambient NPCs (LimeZu pack `public/assets/sprites/npc/`):** 15 sheets, each 128×208
> >   (8×13, 16px): row0 = IDLE/WALK labels; cols 0-3 idle, 4-7 walk; 12 sprite rows = **3 skin
> >   tones × 4 dirs in order DOWN, LEFT, UP, RIGHT** (`NPC_DIRS`). `_makeNpcFrames` carves them
> >   into `npcN_t{tone}_{dir}_{idle|walk}` anims. `_makeNpc` = foot-anchored container (origin
> >   0.5,1, dropped TILE/2 so feet hit the ground; `NPC_H=18`, kept smaller than Snoopy).
> >   - **24 ambient NPCs** in `AMBIENT_NPCS`, spatially SPREAD across zones, ~58% patrol
> >     (`_patrolNpc`, short verified-clear segments) / 42% idle. Placements snapped to walkable
> >     tiles (`_nearestWalkableTile`/`_tileWalkable`).
> >   - **NPCs are SOLID:** `this.npcBlocked` tile set is rebuilt every frame
> >     (`_updateNpcCollision`) from live NPC positions and checked in `_boxBlocked` — so patrol
> >     blocks track the walker. (Collision only stops the player ENTERING an NPC tile; brief
> >     overlap if an NPC steps onto her is expected/harmless.)
> >   - **Positive emote bubbles** when Snoopy comes within `EMOTE_NEAR_TILES` (2) of an ambient
> >     NPC: random of Happy/Heart/Star/Surprised/Exclamation (negatives excluded), pop-in anim
> >     just above the head, ~1.5s hold + fade, per-NPC `EMOTE_COOLDOWN_MS` (6s). Bubble scale =
> >     0.75× body. See `_npcEmote`/`_updateNpcEmotes`. Emote sheets = `npc/Emotes/*_16x16.png`.
> >   - **Graduation stands crowd (`_spawnGraduationStands`):** always-present idle NPCs on the
> >     EXACT authored seat tiles `(13,26)→(19,28)` inclusive minus walkway col x=16 (EXEMPT from
> >     the walkable check — they stand in the seating block). Facing down toward the stage.
> > - **DONE this session per the user: marker placement + the "family crowd"** are considered
> >   complete (the NPC pack / stands / ambient NPCs cover the crowd need). Squirrel sprite TODO
> >   is moot.
> >
> > **STILL OPEN (real content + a little wiring):**
> > 1. **12 real photos** — still `placeholder1–11.svg` + `placeholder_final.svg` in
> >    `public/assets/photos/`. Swap in (same names or update `encounters.js` paths/captions).
> > 2. **Audio** — there is NO `public/assets/audio/` dir yet; game is silent. Add title
> >    ("wondering why"), zone tracks (meadow/park/city), finale ("stupid"), + SFX. Missing files
> >    fail silently. Keys/filenames in `src/ui/AudioManager.js`.
> > 3. **Cap-and-gown Snoopy** — `snoopygrad.png` exists but is UNWIRED; `capSwap()` still pops a
> >    cap prop onto normal Snoopy. Candidate: swap the player sprite during E10 graduation.
> > 4. Full 5-zone MANUAL start→finish playthrough (user spot-tests; a clean run still pending).
> >
> > **Env/workflow:** `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"` before npm; verify a
> > clean `npm run build`. Do NOT `pkill` vite (hangs the shell). The user verifies visually and
> > dislikes headless-verify attempts — do NOT run puppeteer harnesses unless asked.
> >
> > ### 🚨 (HISTORICAL) apply the SCRIPT rewrite — NOW DONE, see the box above
> > The user rewrote `docs/SCRIPT.md` — dialogue AND structure. This was the top task; it has
> > been implemented (see the NEWEST-SESSION box). Kept for context; `SCRIPT_REWRITE_HANDOFF.md`
> > is the spec and is marked applied.
> >
> > **All docs now live in `docs/`** (this repo was reorganized: `DESIGN.md`, `HANDOFF.md`,
> > `HOW_TO_RUN.md`, `ARTIST_BRIEF.md`, `SCRIPT.md`, `SCRIPT_REWRITE_HANDOFF.md`). Bare filenames
> > in these docs refer to siblings in `docs/`.
>
> > ### ⚑⚑⚑ MOST RECENT SESSION additions (fireworks / wayfinder / debug / feel)
> > - **Real fireworks (E7 `falling`):** sprite-based rocket→explosion, replacing the old particle
> >   burst. Sheets in `public/assets/sprites/fireworks/` (10 explosions + 2 rockets); frame sizes
> >   measured into `FIREWORK_EXPLOSIONS`/`FIREWORK_ROCKETS` in `WorldScene.js`. The tuned 37→47
> >   stagger BLOCK repeats rightward to the world edge (wider screens = more). Dialogue advances
> >   after the FIRST block (5 bursts); extra blocks keep firing in the background. Tunables:
> >   `FW_*` consts (block stagger, timing, anchor). Burst anchor row `FW_Y_TILE=43`.
> > - **Wayfinder arrow (`src/ui/Wayfinder.js`):** gentle gold edge-of-screen arrow pointing to the
> >   next `STORY_ORDER` encounter; hides when the target is on-screen / during dialogue / when all
> >   done. Driven by `WorldScene._updateWayfinder()`. NOTE: `STORY_ORDER` must be updated as part
> >   of the SCRIPT rewrite (squirrel out, pasta first, pond earlier).
> > - **Debug mode (`src/ui/DebugMode.js`), toggle with backtick `` ` ``:** OFF by default. Bottom-left
> >   tile HUD (tile/px/blocked under cursor). Bottom-right panel: walk-speed slider + a button per
> >   encounter that TELEPORTS the player there and replays it (`WorldScene.replay(id)` +
> >   `_teleportToEncounter`). This is the placement/testing workflow — real dev tooling, safe to keep.
> > - **Walk speed = 85 px/s** (was 160) — `this.speed` in `WorldScene.create()`; retune via the
> >   debug slider.
> > - **End screen timing:** "the end" now fades in WITH the sprites + photo frame (removed the
> >   2.6s delay); input guard trimmed to 1.5s.
> > - **`ENC_POS_OVERRIDES`** table added in `WorldScene.js` for HUD-driven encounter placement
> >   (currently only `falling: {x:35,y:45}`). The temporary `?end` preview hook was removed.
>
> > ### ⚑⚑ LATEST SESSION (newest — supersedes everything below, incl. the older bullets in this box)
> > - **Finale marker is now real Kirby art:** `public/assets/sprites/kirby.png` (full-body,
> >   front-facing, raw 514×412, opaque bbox ~438×392, near-zero padding). Loaded as
> >   `marker_kirby` in `WorldScene.preload()`. (The old placeholder `secretkirby.png` — the
> >   heart-topped head — is STILL used for the edge-peek in `PeekKirby.js`; its flat bottom
> >   hugs a screen edge, so we intentionally did NOT switch the peek.)
> > - **Kirby is a SPECIAL marker** (unlike the 12 envelope encounters). In `_makeMarkers`:
> >   sized to match Snoopy (`kirbyScale = SNOOPY_H * KIRBY_HEIGHT_RATIO / KIRBY_OPAQUE_H`,
> >   ratio `0.8` = 20% smaller than Snoopy, `KIRBY_OPAQUE_H = 392`); origin `(0.5, 1)` so his
> >   FEET sit on the tile center (stands on the ground, not floating); NO bob tween; NEVER
> >   fades on completion (skipped in both `_makeMarkers` initial paint AND `markComplete`);
> >   ALWAYS blocks his tile + the tile above (`dispTy-1`, his torso) so Isa can't walk through
> >   him — even after completion. `MARKER_TWEAKS.finale = { dy: -7 }` nudges him up off a lamp
> >   post he overlapped.
> > - **Finale is REPLAYABLE:** `encounters.js` finale no longer has `once` (kept `finale:true`).
> >   The `update()` proximity check only skips completed `once` encounters, so Kirby stays
> >   triggerable forever. `markComplete("finale")` early-returns (no fade, no unblock). Replays
> >   don't inflate the counter — `MemoryAlbum.revealMemory` de-dupes by photo `src`.
> > - **End screen sprites (real art):** `index.html` `.end-pair` is now **Kirby (left) +
> >   Snoopy (right)** with a pulsing **heart** (`heart.png`) inline beside the "the end" text
> >   (`.the-end-line` / `.end-heart` in `ui.css`). Snoopy = a single idle-DOWN frame carved
> >   from `snoopy.png` via CSS `background-position`/`-size` (must match `SNOOPY_FRAMES[0]`
> >   `{x:5,y:162,w:39,h:61}`); Kirby = whole `kirby.png`. Sizes: Snoopy 90px tall, Kirby 75.7px
> >   (0.8×), heart 34px, "the end" 40px — all in `ui.css` under `/* Wordless end */`.
> > - **End screen MEMORY FRAME (new):** all 12 collected photos are spread EVENLY around the
> >   whole window perimeter (corners included) framing the center. Built at runtime by
> >   `MemoryAlbum.renderEndFrame()` (perimeter-point math on an inset rect: `INSET_X=0.085`,
> >   `INSET_Y=0.10`), injected into `#end-frame` (added to `index.html`). Photos are ~150px
> >   (`clamp(96px,11vw,150px)`), scrapbook-tilted, and **clickable → open the shared album
> >   lightbox** (`_openLightbox(i)`; index maps 1:1 to `collected`; ←/→/ESC reused). `#end-frame`
> >   is click-through except the photos. `WorldScene.endScreen()` calls `renderEndFrame()`,
> >   guards SPACE/ENTER while the lightbox is open, and clears `#end-frame` on exit.
> > - **Sprite inventory now:** `kirby.png` (finale marker + end screen), `heart.png` (end
> >   screen), `snoopy.png` (player + end-screen idle frame), `secretkirby.png` (edge-peek only),
> >   `snoopygrad.png` (cap-and-gown Snoopy holding calla lilies — STILL UNUSED; a strong
> >   candidate for the E11 graduation look), `letter.png` (envelope markers), `lily.png`/`leaf.png`
> >   (cursor/trail).
> > - **Remaining sprite TODO:** family Snoopys (crowd), cap-and-gown Snoopy for graduation
> >   (snoopygrad.png exists but isn't wired — currently just pops a cap prop). Player Snoopy +
> >   Kirby are DONE. (The squirrel sprite TODO is MOOT — the squirrel encounter is being removed
> >   in the SCRIPT rewrite. Family NPCs no longer need name labels either — see the rewrite.)
>
> The older bullets in this box (still mostly valid for structure):
> - **Player is now Snoopy with a 4-dir WALK CYCLE** from `public/assets/sprites/snoopy.png`
>   (an irregular multi-sprite sheet). `_makeSnoopyFrames()` carves 12 walk frames using their
>   EXACT measured boxes (`SNOOPY_FRAMES` const) — DOWN 0-3, LEFT 4-5, RIGHT 6-7, UP 8-11 (each
>   direction is DRAWN; NO flipping) — and registers anims `snoopy_down/left/right/up`.
>   `_makeSnoopy()` = container(shadow + sprite); `_faceSnoopy(container, dir, moving)` picks the
>   facing anim + plays walk or idles on the facing's first frame. (snoopy.png also has a Flying-Ace
>   walk cycle + Woodstock/doghouse frames, unused — available for NPCs/easter eggs.)
> - **Custom cursor:** global lily cursor + falling-leaf trail (`src/ui/CursorTrail.js`),
>   wired in `main.js`. Sprites in `public/assets/sprites/` (`lily.png`, `leaf.png`). The
>   lily is also the **favicon** (`index.html`).
> - **Secret-Kirby peek** (`src/ui/PeekKirby.js`, DOM overlay): every 15s (`PEEK_INTERVAL_MS`)
>   he peeks partway in from a random screen edge, rotated so his FLAT side (art's bottom)
>   kisses that edge; first peek carries the guide's "…don't mind that" line, rest silent.
>   This REPLACED the old pink-circle "creature" dart/appear/turn/reveal system (fully removed,
>   incl. the `{creature:...}` step type).
> - **Finale = Kirby is the final marker.** No more scripted appear/turn/reveal; walk up to the
>   Kirby marker at Home + SPACE runs the finale dialogue + letter. Marker uses `marker_kirby`.
>   (SUPERSEDED by the LATEST-SESSION box above: `marker_kirby` = real `kirby.png`, sized to
>   match Snoopy, ground-anchored, non-bobbing, non-fading, solid, replayable.)
> - **Display = full window (`Scale.RESIZE`)**, no letterbox. **Adaptive camera zoom** targets
>   `TARGET_TILES_WIDE` (=18) tiles across, recomputed on resize (`_applyZoom`).
> - **Collision was rewritten (pixel-accurate):** the player is an AABB (`PLAYER_HALF`) tested
>   against the map's **pixel** collision rects (`mapData.colRects`) + a small dynamic tile set
>   (`this.blocked`) for gates/markers/fountain, with a corner-nudge assist (`CORNER_NUDGE`) and
>   a `this.unblocked` carve-override (used by the graduation `walkOn`). The old
>   "round-collision-outward-to-whole-tiles" approach is gone (it caused invisible walls).
> - **Markers:** solidity is on the marker's DISPLAY tile (where the envelope is drawn), and a
>   COMPLETED marker is unblocked (walk-through). Finale marker excepted (kirby sprite).
> - **SOFT gates (no collision):** gates no longer block physically. `_softGateBlock()` (update)
>   eases the player back if she tries to cross a not-yet-open gate line, and `_promptGate()`
>   shows a guide nudge to finish the zone. Opening (each zone's last encounter's `{gate}` step)
>   chimes + lets her pass. (Was: ugly gray blocks → invisible collision → now soft.)
> - **FOUC fix:** critical inline CSS in `index.html` hides `#game-root` until `main.js` adds
>   `.ready` (fade-in) once the game boots.
> - **Deleted:** the old `tiled/` hand-authoring placeholder, `src/assets/` (incl. the old
>   `ajain map/` source + legacy Sprout Lands packs), stray root `_*.cjs` harnesses, and the
>   13 stale `trigger:{x,y}` fields in `encounters.js`.
> - **Lighting = a single CONSTANT ambient warm tint** (`AMBIENT_TINT` in WorldScene) the whole
>   game. All phased/per-zone/dawn lighting is GONE — no `dawnOverlay`, `manualDawn`,
>   `setDawnManual`, `{dawn}` step, or `light` marker parsing. The overlay is only faded out on
>   the end screen. (The growth-motif / lily-bloom idea is also fully dropped.)
> - **Still TODO (biggest):** per-encounter/finale real content (photos/letter/names/audio) and
>   nicer sprites (squirrel/family/cap-gown still placeholder — Snoopy player AND Kirby are now
>   done; see the LATEST-SESSION box for the Kirby + end-screen art work).

## Key files
- `src/data/encounters.js` — all 12 encounters + finale as data (step-arrays only; positions
  come from the map). Step types documented at the top + handled in `EventRunner.js`.
- `src/engine/MapLoader.js` — **parses the delivered `world.tmj`** into engine data
  (`parseTiledMap`). Owns all tmj-reading + delivery-quirk handling. Exports `TILE_PX`.
  Returns `colRects` (PIXEL collision rects) + a tile `blocked` set (for gate-span math).
- `src/data/map.js` — TINY: exports only `ZONE_PROFILES` ({key:{bg,music}}) for camera bg +
  per-zone music. The old procedural world was DELETED when the tilemap was wired in.
- `src/scenes/WorldScene.js` — movement (AABB collision), triggers, effects, intro, gates,
  lighting overlay, adaptive zoom, Snoopy player, Kirby-peek trigger. See constants at top.
- `src/scenes/TitleScene.js` — title (press-any-key first play; Continue/New Game after).
  Re-layouts on resize + on `document.fonts.ready` (fixes a canvas-text font FOUC).
- `src/ui/` — DialogueManager, MemoryAlbum, LetterUI, AudioManager, **CursorTrail** (lily
  cursor + leaf trail), **PeekKirby** (secret-Kirby edge peek). All wired in `main.js`.
- `src/ui/ui.css`, `index.html` — DOM overlays (dialogue, photos, letter, HUD, cursor, peek).
- **`public/assets/map/`** — the tilemap + tilesets the game loads (`world.tmj`, two
  `tilesets/*.png`, `tilesets/animated/Fountain_16x16.png`). Bundled into `dist/`.
- **`public/assets/sprites/`** — `snoopy.png` (player + end-screen idle frame), `kirby.png`
  (finale marker + end screen), `heart.png` (end screen), `secretkirby.png` (edge-peek only),
  `letter.png` (encounter markers), `lily.png` + `leaf.png` (cursor/trail), `snoopygrad.png`
  (cap-and-gown Snoopy — unused, candidate for E11).

## Current state (working, builds clean)
Full game is playable end-to-end on the **real delivered tilemap** (60×86 LimeZu Modern
Exteriors world), full-window (RESIZE) with adaptive zoom. Everything structural works:
eyes-open intro, walk-up-and-SPACE encounters, all 12 encounters, gates, memory album,
finale (Kirby marker → dialogue → letter), end→title, save/reset, pixel-accurate collision,
lily cursor+trail, secret-Kirby edge peeks. **Player is Snoopy with a 4-dir walk-cycle
animation** (from `snoopy.png`). Encounter markers =
envelope sprite; finale marker = real Kirby sprite (`kirby.png`). End screen shows Kirby +
Snoopy + heart framed by the 12 collected photos (clickable → album lightbox). Remaining
art/content: the user's real content (photos/letter/names/audio) and more sprites
(squirrel/family/cap-gown still placeholder — Kirby + player Snoopy done).

## ★ DONE: the delivered tilemap is wired in
The #1 task is complete. WorldScene renders `public/assets/map/world.tmj` (the delivered map)
and reads its object/collision/zone layers; the old procedural 40×60 world in `map.js` was
retired. Verified
via clean `npm run build` + headless runtime checks (spawn, collision, all 5 gate openings,
13 encounters, 0 errors) + screenshots of all 5 zones.

### How the map wiring works now (for future edits)
- **`src/engine/MapLoader.js`** (`parseTiledMap`) reads the tmj into plain engine data, all in
  16px TILE coords: `{ W, H, start, encounters{id:{x,y}}, gates[{id,y,x:[lo,hi]}],
  lights[], anim[], blocked:Set("x,y"), zoneRects[{key,yMin,yMax,...}] }`.
- **`WorldScene.preload()`** loads `assets/map/world.tmj` (key "world") + both tileset PNGs
  (image keys MUST equal the tileset NAMES in the tmj: `Modern_Exteriors_Complete_Tileset`,
  `10_Vehicles_16x16`) + `assets/letter.png` (envelope marker).
- **`WorldScene._buildMap()`** renders tile layers `ground(0)/path(1)/walls(2)/decor(3)` below
  the player and `overhead(25)` above; seeds `this.blocked` from `mapData.blocked`; builds
  `this.encPos{id:{x,y}}` (encounter POSITIONS come from the map; step-data stays in
  `encounters.js`).
- **Collision** = `mapData.blocked`, built from the 186 collision RECTANGLES (fractional sizes
  rounded OUTWARD so partial cells are blocked). Player collision probe radius `r=5` px.
- **Gates**: `mapData.gates` (from `gate:*` markers). SOFT gates — no wall/collision. If the
  player tries to cross a gate line before it's open, `_softGateBlock()` (called in update)
  eases her back just below the line and the guide nudges her to finish the zone first
  (`_promptGate`, throttled). Opening a gate (`openGate`, via each zone's last encounter's
  `{gate}` step) plays a chime + lets her pass. `g3` has TWO markers sharing id "g3" → opening
  g3 clears both. (History: gates were once ugly gray collision blocks → invisible collision →
  now soft narrative gates.)
  `this.gateSprites[id]` is an ARRAY of entries. Openers unchanged (g1 in intro; g2/g3/g4 via
  `{gate:"gN"}` steps).
- **TILE = 16** (native). The "2×" look comes from **camera zoom 1.7** (`create()`), tuned to
  read a full zone without cramming (started 3.4→2.0→1.7).

### Encounter markers (`_makeMarkers`)
- Each encounter shows a bobbing **envelope-with-heart** sprite (`marker_letter` =
  `public/assets/letter.png`), depth 26 (above overhead + player). Size ~28px (`MARKER_W`).
- **Each marker's own tile is SOLID** (`this.blocked.add(...)`) so the player can't walk over
  the envelope. Triggering still works from any adjacent tile (verified: every marker has 3+
  walkable neighbors, so blocking never makes an encounter unreachable).
- **Positions come from the map's `encounter:*` markers**, which the artist placed on the
  "stand here to trigger" tile — i.e. usually IN FRONT of the associated building/cart/statue.
- **`MARKER_TWEAKS` (top of WorldScene.js)** nudges individual marker SPRITES to sit centered
  on/under their object. The "SPACE to look" PROXIMITY now follows the marker's visible tile
  (`this.markerTile[id]`, computed from the tweak offset in `_makeMarkers`), so the prompt
  appears where the envelope is seen (not the raw `encPos`). `#verb-prompt` itself is a fixed
  center-screen banner (CSS), not a floating label. Per-id `{dx,dy}` pixel offsets;   `walkOn:true` carves a
  walkable column so the player can step ONTO the object (used for `graduation` → the stage).
  `stairs:{x,y}` places a drawn wooden-steps PROP (`stage_stairs` texture, generated in
  `_makeStairsTexture` with colors sampled from the stage tiles) butting the stage's front face,
  so it reads as steps up onto the graduation stage.
  Tuned so far: pond (under fountain), firstDate (under shop door), falling (park-side walkway),
  iloveyou (on bench), trips (under hotel door), family (under tree), notices (on flower cart),
  graduation (on stage + walkable). `usual` and others still on their as-authored tile — tweak
  via the same table if the user flags more. Re-verify triggering after any change.

### Animated fountain (`_makeAnimatedProps`)
- The artist placed a STATIC fountain in decor/overhead + an `anim_fountain` marker on it.
  `Fountain_16x16.png` (in `public/assets/map/tilesets/animated/`) is a 2×3-tile (32×48) sprite
  over 8 frames. `_makeAnimatedProps()` plays it (`fountain_run`, 8fps loop), HIDES the static
  fountain tiles underneath (decor+overhead) so nothing double-draws, and blocks the basin.
- Generalizes to multiple fountains if the artist ever adds more `anim_fountain*` markers.

### Delivery quirks — all handled in MapLoader
- `gate:g3` two markers → both kept under id "g3".
- `anim_fountain ` trailing space → trimmed on read. **DONE:** an animated fountain now renders
  over the static art (see "Animated fountain" below). `anim_*` markers are parsed into
  `mapData.anim`; `_makeAnimatedProps()` handles `anim_fountain*`.
- `zones` human names → mapped to engine keys by story order (bottom→top by Y):
  `threshold/meadow/park/city/home`.
- `start` at tile (4,83) → player spawns there.
- The tmj has an empty image layer (`Camada de Imagens 1`, refs a nonexistent `reference.jpg`,
  `visible:false`) → image layers are skipped entirely.

### Known follow-ups / things to reassess when playing
- **Marker centering (mostly done).** Markers are bigger + solid; the 8 the user flagged are
  re-centered via `MARKER_TWEAKS` (see "Encounter markers"). If the user flags more, add a
  `{dx,dy}` (and `walkOn` if it should be steppable) and re-verify triggering.
- **g1 is a 1-tile-wide gap** (the artist's crosswalk). Passable when aligned but tight; user
  chose to leave it and reassess after a manual playthrough. To ease: widen g1's blocking span
  or shrink the collision probe.
- `encounters.js` still has stale `trigger:{x,y}` coords — now UNUSED (positions come from the
  map). Harmless; can be deleted later.
- The full 5-zone MANUAL playthrough by the user is still pending (automated + screenshot
  verification passed).

## The OTHER remaining art job: character sprites (separate, not started)
Custom **Snoopy (Isa), Kirby (him), squirrel, family Snoopys, cap-and-gown Snoopy**. The
cartoon cast on semi-realistic Modern-Exteriors tiles is an intentional contrast (she's a
storybook figure in a dream of real places). Player is currently a placeholder shape.

Zones (final, per delivered map): QUIET STREET (early morning, wakes OUTSIDE) → NEIGHBORHOOD
(afternoon; café/bakery/restaurant/fountain, squirrel at the top) → PARK & BAYFRONT (evening;
real park + gelato shop, bayfront w/ boats + fireworks, train station for "I love you") →
DOWNTOWN (night; hotel/trips, courtyard/family, graduation stage + crowd, landmark corner for
his note) → HOME (dawn/sunrise, full circle). Art feel: warm/cozy/beautiful everywhere, never
grey — see DESIGN.md "World & zones".

## User's content still to provide (placeholders in place)
- 11 encounter photos (placeholder1–11; trips uses #7+#8) + 1 final photo (placeholder_final)
  → `public/assets/photos/`. TOTAL = **12 memories** — the counter (`memories: N/12`) is now
  1:1 with photos. `TOTAL_MEMORIES` is DERIVED from photo count in encounters.js (not hardcoded).
  The final photo is `FINAL_PHOTO` in encounters.js: shown embedded in the letter AND added to
  the album as a SILENT memory (no full-screen reveal) via the finale's `{memory:{...,silent:true}}`.
- The **letter** (real words) → `src/ui/LetterUI.js` (uses `FINAL_PHOTO.src`)
- Mom's & Sister's real names → E10 ("family") in `encounters.js`
- Audio: title song "wondering why" (needs exact artist/title), zone tracks, "stupid" for
  finale → `public/assets/audio/` (real songs OK; keep repo **private / URL unlisted**)

## Conventions / gotchas learned the hard way
- **Three text voices:** pink = guide (him), white = NPC, gold-italic = her recovered memory.
  Keep these.
- **Tone rule:** warm/sincere; humor is seasoning earned by specificity; tenderness stated
  plainly (no purple prose); one clean feeling per encounter.
- **SPACE carryover bug pattern:** the press that advances a dialogue line can bleed into the
  next verb/action. Verbs require release-then-fresh-press; dialogue has a 250ms guard. Watch
  for this if adding new input.
- **Encounters trigger by walk-up + visible "SPACE to look" prompt** (not auto bounding-box).
  Proximity = within 1 tile of the encounter's map position (`this.encPos[id]`). Each
  interactable is marked by a bobbing envelope-with-heart sprite (`marker_letter`, depth 26 so
  it stays above the overhead layer); completed ones fade to alpha 0.25.
- **Cast concept:** everyone she loves is a Snoopy variant (labeled with real name); *he* is
  the only non-Snoopy (Kirby) — that contrast is intentional/meaningful.
- **Lighting:** a single CONSTANT ambient warm tint over the whole map, the whole game — one
  overlay rect (`AMBIENT_TINT = {tint:0xffe8c0, alpha:0.12}` in WorldScene, `this.ambientOverlay`).
  There is NO phased / per-zone / dawn lighting: `dawnOverlay`, `manualDawn`, `setDawnManual`,
  the `{dawn}` step, and `light`-marker parsing were all removed (per the user — do not
  reintroduce). The overlay is only faded out on the end screen. `_updateZoneVisuals` just
  picks background color + music per zone (from `ZONE_PROFILES` + `mapData.zoneRects`).
- **Gates:** g1 opens during the intro; g2/g3/g4 open via `{gate:"gN"}` steps at the end of
  the pond / "I love you" / caretaking encounters. Every gate must have an opener or the
  player gets blocked.
- Work **encounter-by-encounter with the user**; they have strong, specific opinions and want
  to approve choices. Ask before large changes.
- Killing vite dev servers via pkill/kill tends to hang the shell tool — not a real error;
  just start fresh servers on new ports.

## User's working style
Feedback comes as **specific, playtest-driven bug lists**. This has worked very well: build,
have them play, they return a numbered list, you triage (real bug vs. asset-pending vs.
design change) and fix. Confirm design changes with them before implementing.

## Suggested next steps
(The SCRIPT rewrite, ambient NPCs, marker placement, and the family crowd are DONE — see the
NEWEST-SESSION box at the top.)
1. **User's real content (biggest remaining):** the **12 photos** (`public/assets/photos/`,
   still placeholders) + **audio** (no `public/assets/audio/` dir yet — game is silent; keys in
   `src/ui/AudioManager.js`). Letter + family lines are already in the code.
2. **Wire `snoopygrad.png`** (cap-and-gown Snoopy) into E10 `capSwap()` — currently just pops a
   cap prop onto normal Snoopy.
3. Full 5-zone MANUAL start→finish playthrough (user spot-tests; a clean run still pending).
4. Continue the playtest → triage → fix loop (the user's preferred workflow).

NOTE: the deferred per-zone lighting pass and the growth/lily motif were explicitly DROPPED —
do not reintroduce them.

## Verification note
The user verifies visually and dislikes headless-verify attempts — do NOT run puppeteer
harnesses unless explicitly asked. Just keep `npm run build` clean after changes. (A headless
pattern exists if ever needed: seed `localStorage` `rm_completed`/`rm_gates`, force-start the
world via `window.__GAME__.scene.getScene("title").deps`, read state off the "world" scene.)
