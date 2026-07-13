import Phaser from "phaser";
import { ENCOUNTERS } from "../data/encounters.js";
import { EventRunner } from "../engine/EventRunner.js";
import { ZONE_PROFILES } from "../data/map.js";
import { parseTiledMap, TILE_PX } from "../engine/MapLoader.js";
import { Wayfinder } from "../ui/Wayfinder.js";

// The delivered map is 16px tiles; we render at native size and get the "2x" look via camera
// zoom (see create()). TILE is the on-map tile size in px used by all cell<->pixel math.
const TILE = TILE_PX; // 16
// Adaptive camera zoom target: how many map tiles wide the view should show,
// regardless of window size. Lower = more zoomed in. (Old fixed zoom 1.7 showed
// ~24 wide on the 640px canvas; ~22 reads a touch closer/cozier.)
const TARGET_TILES_WIDE = 18;
const MIN_ZOOM = 1.2;
const MAX_ZOOM = 4.5;
// Player collision body is a square of half-extent PLAYER_HALF px (so ~10px
// wide). Small enough to fit through 1-tile (16px) gaps like the g1 crosswalk,
// big enough that the whole body is tested for smooth, snag-free movement.
const PLAYER_HALF = 5;
// On-screen height (px) of the Snoopy player sprite. Kept close to ~1.5 tiles so
// she reads as a character on the 16px-tile world without dwarfing it.
const SNOOPY_H = 24;
// snoopy.png is an irregular sheet. The Snoopy walk cycle = 12 frames whose EXACT
// content boxes are measured below (x,y,w,h) so no neighbor pixels bleed in and
// nothing is clipped. Directions (confirmed from the art):
//   DOWN 0-3, LEFT 4-5, RIGHT 6-7, UP 8-11. Each direction is drawn (NO flipping).
const SNOOPY_FRAMES = [
  { x: 5,   y: 162, w: 39, h: 61 }, // 0 down
  { x: 48,  y: 162, w: 39, h: 61 }, // 1 down
  { x: 91,  y: 162, w: 40, h: 61 }, // 2 down
  { x: 134, y: 162, w: 40, h: 61 }, // 3 down
  { x: 178, y: 162, w: 42, h: 61 }, // 4 left
  { x: 223, y: 162, w: 43, h: 61 }, // 5 left
  { x: 270, y: 162, w: 42, h: 61 }, // 6 right
  { x: 315, y: 162, w: 42, h: 61 }, // 7 right
  { x: 361, y: 162, w: 40, h: 61 }, // 8 up
  { x: 407, y: 162, w: 40, h: 61 }, // 9 up
  { x: 450, y: 162, w: 40, h: 61 }, // 10 up
  { x: 494, y: 162, w: 39, h: 61 }, // 11 up
];
const SNOOPY_FRAME_H = 61; // common frame height used for scaling

// Graduation walk (E10): snoopygradwalk.png is a 1280x1280 sheet = 5x5 grid of 256px cells,
// a RIGHT-facing grad-Snoopy walk cycle (25 frames). She slowly walks the stage left→right,
// then stands as the static snoopygrad sprite at center. The real player + the marker stay
// hidden through the whole encounter and are restored on completion (markComplete).
const GRADWALK_CELL = 256;         // px per frame in the sheet
const GRADWALK_COLS = 5, GRADWALK_ROWS = 5;
const GRADWALK_H = 40;             // on-screen height (a set-piece; a bit taller than the player)
const GRADWALK_FROM = { x: 13, y: 21 };
const GRADWALK_TO = { x: 19, y: 21 };
const GRAD_STAND_POS = { x: 16, y: 21 }; // where the static snoopygrad stands after the walk
const GRADWALK_MS = 5200;          // total slow-walk duration
const GRADWALK_CONFETTI_MS = 700;  // confetti burst cadence during the walk
const GRAD_CONFETTI_DY = 40;       // confetti fires this many px BELOW the walker
const GRAD_END_BEAT_MS = 1100;     // pause (grad-Snoopy stands) after the walk before continuing

// Animated confetti burst (confetti.png): 4096x4096 = 8x8 grid of 512px cells (64 frames,
// play-once). Replaces the old particle confetti.
const CONFETTI_CELL = 512;
const CONFETTI_FRAMES = 64;
const CONFETTI_H = 64;             // on-screen height of one burst

// ---- Ambient NPCs (LimeZu Modern-Exteriors NPC pack, public/assets/sprites/npc/) ----
// Each NPC_N.png is a 128x208 (8 col x 13 row) 16px sheet:
//   row 0 = "IDLE"/"WALK" labels (skipped). cols 0-3 = IDLE (4 frames), cols 4-7 = WALK.
//   The 12 sprite rows are THREE skin tones (light / tan / dark), 4 rows each, in the
//   direction order DOWN, UP, RIGHT, LEFT. So band t occupies rows (1 + t*4 .. 4 + t*4).
const NPC_SHEETS = 15;                 // NPC_1..NPC_15
const NPC_TONES = 3;                   // light / tan / dark per sheet
const NPC_DIRS = ["down", "left", "up", "right"]; // row order within a tone band (rows 1-4 per tone)
const NPC_TILE = 16;                   // native cell size in the sheet
// On-screen sprite height. The NPC art fills its full 16px cell, whereas Snoopy's ~57px body is
// drawn at ~22px visible, so matching pixel heights makes NPCs LOOK as big as her. Keep NPCs
// clearly smaller than Snoopy: ~18px visible (~80% of her body height).
const NPC_H = 18;
// Ambient NPC placements. `pos` in TILE coords (must be walkable). A `path` (list of tile
// coords) makes the NPC patrol those waypoints; without it the NPC idles facing `dir`.
// Sheet/tone are 0-based indices into the pack; picked for variety across the zones.
// Placements are spatially SPREAD (one per grid cell across each zone, snapped to a margin-clear
// open tile) so NPCs don't cluster on a few strips. ~58% patrol (walk short verified-clear
// segments); the rest idle facing a set direction. Sheet/tone varied for visual mix.
const AMBIENT_NPCS = [
  // Meadow / quiet street (y~55-77)
  { sheet:  0, tone: 2, pos: { x: 7, y: 72 }, path: [{ x: 7, y: 72 }, { x: 1, y: 72 }] },
  { sheet:  1, tone: 2, pos: { x: 22, y: 72 }, path: [{ x: 22, y: 72 }, { x: 15, y: 72 }] },
  { sheet:  2, tone: 2, pos: { x: 37, y: 72 }, path: [{ x: 37, y: 72 }, { x: 37, y: 65 }] },
  { sheet:  3, tone: 2, pos: { x: 52, y: 72 }, path: [{ x: 52, y: 72 }, { x: 45, y: 72 }] },
  { sheet:  4, tone: 2, pos: { x: 11, y: 76 }, path: [{ x: 11, y: 76 }, { x: 14, y: 76 }] },
  { sheet:  5, tone: 0, pos: { x: 38, y: 77 }, dir: "left" },
  { sheet:  6, tone: 2, pos: { x: 3, y: 62 }, dir: "up" },
  { sheet:  7, tone: 2, pos: { x: 26, y: 55 }, path: [{ x: 26, y: 55 }, { x: 32, y: 55 }] },
  { sheet:  8, tone: 1, pos: { x: 39, y: 61 }, dir: "right" },
  { sheet:  9, tone: 2, pos: { x: 53, y: 61 }, dir: "left" },
  { sheet: 10, tone: 1, pos: { x: 26, y: 60 }, path: [{ x: 26, y: 60 }, { x: 26, y: 64 }] },
  // Park (y~34-47)
  { sheet: 11, tone: 2, pos: { x: 7, y: 36 }, path: [{ x: 7, y: 36 }, { x: 14, y: 36 }] },
  { sheet: 12, tone: 2, pos: { x: 22, y: 36 }, path: [{ x: 22, y: 36 }, { x: 15, y: 36 }] },
  { sheet: 13, tone: 2, pos: { x: 51, y: 35 }, path: [{ x: 51, y: 35 }, { x: 58, y: 35 }] },
  { sheet: 14, tone: 0, pos: { x: 8, y: 44 }, dir: "up" },
  { sheet:  0, tone: 1, pos: { x: 34, y: 41 }, path: [{ x: 34, y: 41 }, { x: 34, y: 46 }] },
  { sheet:  1, tone: 1, pos: { x: 22, y: 47 }, dir: "left" },
  // City (y~17-28)
  { sheet:  2, tone: 1, pos: { x: 10, y: 17 }, dir: "down" },
  { sheet:  3, tone: 1, pos: { x: 37, y: 20 }, dir: "left" },
  { sheet:  4, tone: 2, pos: { x: 53, y: 19 }, path: [{ x: 53, y: 19 }, { x: 53, y: 26 }] },
  { sheet:  5, tone: 1, pos: { x: 5, y: 27 }, path: [{ x: 5, y: 27 }, { x: 1, y: 27 }] },
  { sheet:  6, tone: 1, pos: { x: 35, y: 27 }, dir: "up" },
  { sheet:  7, tone: 0, pos: { x: 52, y: 25 }, path: [{ x: 52, y: 25 }, { x: 58, y: 25 }] },
  { sheet:  8, tone: 1, pos: { x: 21, y: 28 }, dir: "up" },
];
// Positive/non-negative emote bubbles (public/assets/sprites/npc/Emotes/). Each sheet is
// 64x16 = 4 frames of a pop-in that ends on the full icon. Shown above an NPC when Snoopy walks
// near. (Negative ones — Angry/Evil/Sad/HeartBreak/Interrogation — are intentionally excluded.)
const EMOTES = [
  { key: "emote_happy",       file: "Happy_emote_16x16.png" },
  { key: "emote_heart",       file: "Heart_emote_16x16.png" },
  { key: "emote_star",        file: "Star_emote_16x16.png" },
  { key: "emote_surprised",   file: "Surprised_emote_16x16.png" },
  { key: "emote_exclamation", file: "Exclamation_emote_16x16.png" },
];
const EMOTE_DIR = "assets/sprites/npc/Emotes/";
const EMOTE_NEAR_TILES = 2;      // Snoopy within this many tiles → the NPC reacts
const EMOTE_COOLDOWN_MS = 6000;  // per-NPC minimum gap between reactions

// Graduation stands: NPCs standing in the seating block from (13,26) to (19,28) INCLUSIVE,
// excluding the walkway column x=16. Present from world creation (not spawned on trigger),
// all facing DOWN toward the stage.
const GRAD_STANDS = { x0: 13, x1: 19, y0: 26, y1: 28, skipX: 16 };
// Max perpendicular auto-nudge (px) applied when an axis is blocked, so the
// player rounds corners / threads narrow gaps smoothly instead of snagging.
const CORNER_NUDGE = 4;
// Secret-Kirby peek cadence: a recurring timer peeks every PEEK_INTERVAL_MS.
// Visual sizing lives in ui/PeekKirby.js.
const PEEK_INTERVAL_MS = 15000;
// Tileset image keys must match the tileset NAMES inside world.tmj.
const TS_MODERN = "Modern_Exteriors_Complete_Tileset";
const TS_VEHICLES = "10_Vehicles_16x16";

// Ambient tint: ONE constant gentle warm wash over the whole game, the whole time. No phased
// / per-zone / dawn lighting — just a fixed warm overlay. Low alpha so it never darkens the
// art. (The overlay is also faded out on the end screen.)
const AMBIENT_TINT = { tint: 0xffe8c0, alpha: 0.12 };

// Fireworks sprite sheets for E7 (public/assets/sprites/fireworks/). Wide horizontal strips;
// frame sizes were measured per-sheet (all divide the sheet width with zero remainder — see the
// boundary-detection pass). key = the Phaser texture key; each explosion sheet is a color/style
// variant played on detonation, and each rocket sheet is the rising-trail launch anim.
// EXPLOSIONS are randomized per shot; ROCKETS pick a matching-or-random color.
const FW_DIR = "assets/sprites/fireworks/";
const FIREWORK_EXPLOSIONS = [
  { key: "fw_def_blue",    file: "Explosion_Default_Blue-sheet.png",    fw: 93, fh: 100, frames: 62 },
  { key: "fw_def_green",   file: "Explosion_Default_Green-sheet.png",   fw: 99, fh: 99,  frames: 61 },
  { key: "fw_def_orange",  file: "Explosion_Default_Orange-sheet.png",  fw: 93, fh: 92,  frames: 62 },
  { key: "fw_cry_blue",    file: "Explosion_Crystals_Blue-sheet.png",   fw: 88, fh: 86,  frames: 82 },
  { key: "fw_cry_green",   file: "Explosion_Crystals_Green-sheet.png",  fw: 83, fh: 84,  frames: 81 },
  { key: "fw_cry_orange",  file: "Explosion_Crystals_Orange-sheet.png", fw: 72, fh: 68,  frames: 80 },
  { key: "fw_cry_white",   file: "Explosion_Crystals_White-sheet.png",  fw: 82, fh: 85,  frames: 83 },
  { key: "fw_long_blue",   file: "Explosion_Long_Blue-sheet.png",       fw: 80, fh: 93,  frames: 57 },
  { key: "fw_long_green",  file: "Explosion_Long_Green-sheet.png",      fw: 83, fh: 86,  frames: 54 },
  { key: "fw_long_orange", file: "Explosion_Long_Orange-sheet.png",     fw: 92, fh: 94,  frames: 57 },
];
const FIREWORK_ROCKETS = [
  { key: "fw_rocket_blue",   file: "Rocket_Blue.png-sheet.png", fw: 70, fh: 52, frames: 5 },
  { key: "fw_rocket_orange", file: "Rocket_Orange-sheet.png",   fw: 70, fh: 51, frames: 4 },
];
// Firework timing/placement tuning (E7). Slower + lower than the first pass.
const FW_EXPLODE_MS = 1300;  // total play time per explosion (also drives the anim frameRate)
const FW_RISE_MS = 1000;     // rocket travel time (higher = slower rise)
const FW_RISE_DIST = 52;     // px the rocket climbs before detonating (lower = bursts lower)
const FW_SHOT_GAP = 480;     // ms between launches
const FW_ROCKET_FPS = 8;     // rocket trail anim speed (lower = slower)
// Burst placement in TILE coords (from the tile HUD). One BLOCK is the tuned 37→47 stagger
// pattern (FW_BLOCK_STAGGER = fractions across a FW_BLOCK_TILES-wide block). That exact block
// is REPEATED rightward — 37-47, 47-57, ... — until it would exceed the world's right edge
// (this.mapW - 1 - FW_X_RIGHT_MARGIN_TILES). So wider screens simply see more repeats of the
// same pattern/spacing. FW_Y_TILE is the base apex row.
const FW_X_MIN_TILE = 37;
const FW_BLOCK_TILES = 10;         // block width (37→47)
const FW_BLOCK_STAGGER = [0.15, 0.75, 0.4, 0.95, 0.6]; // tuned in-block left/right order
const FW_X_RIGHT_MARGIN_TILES = 1; // keep bursts just inside the world's right edge
const FW_Y_TILE = 43;
const FW_MAX_SHOTS = 40;           // safety cap

// Per-encounter marker visual tweaks (see _makeMarkers). The artist put encounter markers on
// the "stand here to trigger" tile (in FRONT of the object). These nudge only the SPRITE so it
// sits centered on/under its associated world object; the TRIGGER position (encPos) is
// unchanged, so encounters still fire from where the player walks up.
//   dx,dy : pixel offset for the sprite (relative to its tile center).
//   onObject: if true, the marker sits ON a solid object — its own tile is NOT force-blocked.
//   walkOn : if true, UNBLOCK the marker tile so the player can walk onto it (e.g. the stage).
const MARKER_TWEAKS = {
  pond:       { dx: -8,  dy: 2 },   // center under the fountain (fountain center = tile seam)
  firstDate:  { dx: -20, dy: -8 },  // under the ice-cream shop door (door is on the left)
  iloveyou:   { dx: -14, dy: -10 }, // under the train-platform bench
  trips:      { dx: -20, dy: -14 }, // under a hotel door (right double-door)
  family:     { dx: 2,   dy: -10 }, // under the top-right tree
  // ON the stage; she can walk onto it. `stairs` places a drawn wooden-steps prop butting the
  // stage's front face at the given tile (top-center of the sprite meets the stage edge).
  graduation: { dx: -16, dy: -64, walkOn: true, stairs: { x: 16, y: 23 } },
  notices:    { dx: -16, dy: -4 },  // onto the flower cart beside it
  finale:     { dy: -7 },           // nudge Kirby up 7px so his foot clears the lamp post below him
};

// Explicit encounter POSITION overrides (in TILE coords, from the live tile HUD). These
// override the map's `encounter:*` object position for BOTH the trigger proximity AND the
// marker sprite (which then sits centered on the tile unless MARKER_TWEAKS also nudges it).
const ENC_POS_OVERRIDES = {
  falling: { x: 35, y: 45 }, // bayfront fireworks — placed via HUD
};

// Pond-reflection (pond cutscene) size: fraction of the visible SCREEN height the reflected
// Snoopy should occupy. Tune this if it reads too big/small. (The math in _makeReflection
// divides by camera zoom so this is a true on-screen fraction.)
const REFLECTION_SCREEN_FRAC = 0.72;

// Intended STORY ORDER of the encounters (the walk, bottom→top). Drives the Wayfinder arrow:
// it points at the first not-yet-completed encounter in this order. `pasta` is now the on-path
// opener (first). `squirrel` was removed. `finale` is last (Kirby at Home).
const STORY_ORDER = [
  "pasta", "pond", "usual", "insurance",          // meadow (g2 after insurance)
  "firstDate", "falling", "iloveyou",             // park   (g3 after iloveyou)
  "family", "trips", "graduation", "notices",     // city   (g4 after notices)
  "finale",                                       // home
];

export class WorldScene extends Phaser.Scene {
  constructor() { super("world"); }

  init(data) {
    this.dialogue = data.dialogue; this.album = data.album;
    this.letter = data.letter; this.audio = data.audio;
    this.peek = data.peek;
  }

  preload() {
    // The delivered artist map + its two tilesets (copied into public/assets/map/).
    this.load.tilemapTiledJSON("world", "assets/map/world.tmj");
    this.load.image(TS_MODERN, "assets/map/tilesets/Modern_Exteriors_Complete_Tileset.png");
    this.load.image(TS_VEHICLES, "assets/map/tilesets/10_Vehicles_16x16.png");
    // Cute envelope sprite used as the encounter marker.
    this.load.image("marker_letter", "assets/sprites/letter.png");
    // Isa = Snoopy: the walk-cycle sheet (snoopy.png). Loaded as a plain image;
    // its 12 walk frames are carved out + turned into 4-dir anims in create()
    // (_makeSnoopyFrames). Also reused for the E11 crowd.
    this.load.image("snoopy", "assets/sprites/snoopy.png");
    // Full-body Kirby standing at Home = the finale marker (kirby.png, dedicated
    // sprite — barely-padded 514x412; FINALE_W below is tuned against its opaque
    // bbox). The ambient/edge peek uses the heart-topped secretkirby.png (whose
    // flat bottom hugs a screen edge) — see ui/PeekKirby.js, a DOM overlay.
    this.load.image("marker_kirby", "assets/sprites/kirby.png");
    // Graduation walk cycle (E10): 5x5 grid of 256px cells, right-facing grad-Snoopy.
    this.load.spritesheet("snoopygradwalk", "assets/sprites/snoopygradwalk.png",
      { frameWidth: GRADWALK_CELL, frameHeight: GRADWALK_CELL });
    // Static cap-and-gown Snoopy (stands center after the walk).
    this.load.image("snoopygrad", "assets/sprites/snoopygrad.png");
    // Animated confetti burst (8x8 grid of 512px cells).
    this.load.spritesheet("confetti", "assets/sprites/confetti.png",
      { frameWidth: CONFETTI_CELL, frameHeight: CONFETTI_CELL });
    // Ambient NPC sheets (LimeZu). Loaded as plain images; frames are carved + turned into
    // idle/walk 4-dir anims per skin tone in create() (_makeNpcFrames).
    for (let i = 1; i <= NPC_SHEETS; i++) this.load.image(`npc${i}`, `assets/sprites/npc/NPC_${i}.png`);
    // Positive emote bubbles (4-frame 16x16 pop-ins) shown when Snoopy nears an NPC.
    for (const e of EMOTES) this.load.spritesheet(e.key, EMOTE_DIR + e.file, { frameWidth: 16, frameHeight: 16 });
    // Pond-reflection cutscene: three front-facing Snoopy poses. Their white background can't be
    // keyed out (it shares Snoopy's own white pixels), so startCutscene()/_makeReflection() render
    // them with a soft circular vignette mask + MULTIPLY blend to read as a reflection in water.
    for (const n of [1, 2, 3]) this.load.image(`snoopy_ft${n}`, `assets/sprites/snoopy_ft${n}.png`);
    // Animated fountain: 2x3-tile (32x48) frames, 8 frames across a 256x48 sheet.
    this.load.spritesheet("fountain", "assets/map/tilesets/animated/Fountain_16x16.png",
      { frameWidth: 32, frameHeight: 48 });
    // Fireworks (E7): rocket-trail + explosion sprite sheets. Per-sheet frame sizes (measured).
    for (const s of [...FIREWORK_EXPLOSIONS, ...FIREWORK_ROCKETS]) {
      this.load.spritesheet(s.key, FW_DIR + s.file, { frameWidth: s.fw, frameHeight: s.fh });
    }
  }

  create() {
    this.inputLocked = false;
    this.completed = new Set(JSON.parse(localStorage.getItem("rm_completed") || "[]"));
    this.openGates = new Set(JSON.parse(localStorage.getItem("rm_gates") || "[]"));
    this.runner = new EventRunner(this, this.dialogue, this.album, this.letter, this.audio);
    this.activeEncounter = null;

    // Parse the delivered map into engine data (spawn, encounters, gates, lights,
    // zones, collision). All coords are in 16px tiles.
    this.mapData = parseTiledMap(this.cache.tilemap.get("world").data);
    this.mapW = this.mapData.W;
    this.mapH = this.mapData.H;

    this._makeTextures();
    this._buildMap();      // renders the real Tiled layers + seeds collision
    this._makeAnimatedProps(); // animated fountain(s) over the static fountain art
    this._makeGates();
    this._makeMarkers();

    // Ambient tint: one constant warm wash across the whole map, the whole game — no phased,
    // per-zone, or dawn lighting. A single fixed overlay; faded out only on the end screen.
    this.ambientOverlay = this.add.rectangle(0, 0, this.mapW * TILE, this.mapH * TILE, AMBIENT_TINT.tint)
      .setOrigin(0, 0).setDepth(40).setAlpha(AMBIENT_TINT.alpha);

    this._makeSnoopyFrames();   // carve Band-1 walk frames + register 4-dir anims
    this._makeFireworkAnims();  // register rocket + explosion anims (E7)
    const start = this.mapData.start || { x: 4, y: 83 };
    this.player = this._makeSnoopy(start.x * TILE + TILE / 2, start.y * TILE + TILE / 2);
    this.player.setDepth(20);
    this.player.lastDir = { x: 0, y: -1 };

    // Ambient life: scattered idle/wandering NPCs + the always-present graduation-stands crowd.
    this._spawnAmbientNpcs();
    this._spawnGraduationStands();

    this.keys = this.input.keyboard.addKeys("W,A,S,D");
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.speed = 85; // px/s (~5.3 tiles/s) — tuned via the debug speed slider for a calm stroll

    // Order matters: bounds + zoom FIRST, then start following, then snap-center —
    // so the camera is locked onto the player on the very first rendered frame and
    // doesn't visibly ease in from the map corner on load/Continue. The 0.12 lerp
    // then only smooths subsequent movement.
    this.cameras.main.setBounds(0, 0, this.mapW * TILE, this.mapH * TILE);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setRoundPixels(true);
    this._applyZoom();
    // Snap the camera onto the player on the first update (after Scale.RESIZE has
    // settled the camera size/zoom) so it doesn't ease in from the map corner on
    // load/Continue. The 0.12 lerp above still smooths movement afterward.
    this.cameras.main.centerOn(this.player.x, this.player.y);
    this._cameraSnapped = false;
    // Recompute on window/canvas resize.
    this.scale.on("resize", this._applyZoom, this);
    this.events.once("shutdown", () => this.scale.off("resize", this._applyZoom, this));
    this.events.once("destroy", () => this.scale.off("resize", this._applyZoom, this));

    this._updateZoneVisuals(true);

    this.introRunning = false;
    // Secret-Kirby peek motif: a recurring timer fires the peek. The very first
    // peek carries the guide's "what was that" line; the rest are silent.
    this.firstPeekDone = this.completed.has("intro");
    this.peeking = false;
    this.time.addEvent({ delay: PEEK_INTERVAL_MS, loop: true, callback: () => {
      if (this.peeking || this.runner.running || this.introRunning) return;
      this._ambientPeek();
    } });

    if (!this.completed.has("intro")) {
      const black = document.getElementById("intro-black");
      if (black) { black.style.opacity = "1"; black.classList.remove("hidden"); }
      this.setInputLocked(true);
      this.introRunning = true;
      this._playIntro();
    }

    // Wayfinder arrow: points to the next story-order encounter so she's never lost.
    this.wayfinder = new Wayfinder();
    this.wayfinder.init();
    this.events.once("shutdown", () => this.wayfinder?.hide());
  }

  // The first not-yet-completed encounter in STORY_ORDER (its tile pos), or null if all done.
  _wayTarget() {
    for (const id of STORY_ORDER) {
      if (this.completed.has(id)) continue;
      const pos = this.markerTile?.[id] || this.encPos?.[id];
      if (pos) return pos;
    }
    return null;
  }

  // Tick the wayfinder each frame: hide during dialogue/intro or when nothing's left; else
  // convert the target tile → screen coords and let the arrow park at the edge pointing at it.
  _updateWayfinder() {
    const wf = this.wayfinder;
    if (!wf) return;
    if (this.runner.running || this.introRunning || this.inputLocked) { wf.hide(); return; }
    const pos = this._wayTarget();
    if (!pos) { wf.hide(); return; }
    const cam = this.cameras.main;
    // world px (tile center) → screen px (account for scroll + zoom).
    const worldX = pos.x * TILE + TILE / 2, worldY = pos.y * TILE + TILE / 2;
    const sx = (worldX - cam.worldView.x) * cam.zoom;
    const sy = (worldY - cam.worldView.y) * cam.zoom;
    wf.pointTo(sx, sy);
  }

  // Replay an encounter on demand (used by DebugMode): TELEPORT the player to a walkable tile
  // beside the encounter, then play it. Returns false if it couldn't run.
  replay(id) {
    const e = ENCOUNTERS[id];
    if (!e) { console.warn(`[debug] no encounter "${id}"`); return false; }
    if (this.runner.running) { console.warn("[debug] an encounter is already running"); return false; }
    this._teleportToEncounter(id);
    this.runner.play(e);
    return true;
  }

  // Place the player on a walkable tile adjacent to the encounter's marker (mirrors the
  // walk-up model). Falls back to the marker tile itself, then the raw encPos.
  _teleportToEncounter(id) {
    const target = (this.markerTile && this.markerTile[id]) || (this.encPos && this.encPos[id]);
    if (!target) return;
    const center = (tx, ty) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });
    // Prefer standing just below the marker (south), then the other neighbors, then on it.
    const candidates = [
      { x: target.x, y: target.y + 1 },
      { x: target.x, y: target.y - 1 },
      { x: target.x - 1, y: target.y },
      { x: target.x + 1, y: target.y },
      { x: target.x, y: target.y },
    ];
    let spot = center(target.x, target.y);
    for (const c of candidates) {
      const p = center(c.x, c.y);
      if (!this._isBlocked(p.x, p.y)) { spot = p; break; }
    }
    this.player.x = spot.x;
    this.player.y = spot.y;
    if (this.player.lastDir) this.player.lastDir = { x: 0, y: -1 }; // face up toward the marker
    this.cameras.main.centerOn(spot.x, spot.y);
  }

  // List of encounter ids (for the debug panel).
  encounterIds() { return Object.keys(ENCOUNTERS); }

  // ---------- textures ----------
  // World tiles come from the delivered Tiled map. Only the graduation stairs prop texture is
  // generated here now (the old drawn "cap" prop was retired with the animated-confetti /
  // grad-walk rework).
  _makeTextures() {
    this._makeStairsTexture();
  }

  // Wooden steps prop for the graduation stage. Palette sampled from the stage tiles so it
  // matches (wood #D5935E/#CA8854/#A85F46, metal frame #3A3A50/#8B8BAB). Drawn as 3 treads
  // descending toward the viewer (top tread butts the stage front face; bottom meets ground).
  _makeStairsTexture() {
    const W = 44, H = 24;
    const g = this.add.graphics();
    const WOOD_HI = 0xd5935e, WOOD = 0xca8854, WOOD_LO = 0xa85f46, SHADOW = 0x7e6151;
    const FRAME = 0x3a3a50, FRAME_HI = 0x8b8bab;
    const treads = 3;
    const th = 8;            // tread height in px
    const inset = 5;         // each higher tread is narrower (perspective) per side
    for (let i = 0; i < treads; i++) {
      // i=0 is the TOP (back) tread against the stage; i increases toward the viewer (front)
      const y = i * th;
      const x0 = inset * (treads - 1 - i);
      const w = W - 2 * x0;
      // tread top (lighter as it comes forward)
      g.fillStyle(i === 0 ? WOOD_LO : i === 1 ? WOOD : WOOD_HI, 1);
      g.fillRect(x0, y, w, th - 2);
      // plank line
      g.fillStyle(WOOD, 1); g.fillRect(x0, y + 2, w, 1);
      // front lip shadow (the step edge)
      g.fillStyle(SHADOW, 1); g.fillRect(x0, y + th - 2, w, 2);
      // metal frame sides on every tread's edges (echo the stage truss frame)
      g.fillStyle(FRAME, 1);
      g.fillRect(x0, y, 2, th); g.fillRect(x0 + w - 2, y, 2, th);
      g.fillStyle(FRAME_HI, 1);
      g.fillRect(x0, y, 2, 2); g.fillRect(x0 + w - 2, y, 2, 2);
    }
    g.generateTexture("stage_stairs", W, H); g.destroy();
  }

  // Carve the 12 walk frames out of the snoopy sheet and build 4-dir walk
  // animations. Frame layout in the band: DOWN 0-3, RIGHT 4-7, UP 8-11. LEFT is
  // RIGHT played flipped (handled at play time via flipX). Idempotent.
  _makeSnoopyFrames() {
    if (this._snoopyReady) return;
    const tex = this.textures.get("snoopy");
    SNOOPY_FRAMES.forEach((f, i) => tex.add(`w${i}`, 0, f.x, f.y, f.w, f.h));
    const anim = (key, idxs, fps = 6) => this.anims.create({
      key, frameRate: fps, repeat: -1,
      frames: idxs.map((n) => ({ key: "snoopy", frame: `w${n}` })),
    });
    // Directions are each drawn in the sheet — no flipping.
    anim("snoopy_down", [0, 1, 2, 3], 8);
    anim("snoopy_left", [4, 5], 6);
    anim("snoopy_right", [6, 7], 6);
    anim("snoopy_up", [8, 9, 10, 11], 8);
    // First frame of each facing, for idle poses.
    this._snoopyIdle = { down: "w0", left: "w4", right: "w6", up: "w8" };
    this._snoopyReady = true;
  }

  // Isa = Snoopy. A container (so cap-swap / scale tweens / crowd reuse still work)
  // holding a soft ground shadow + the snoopy walk sprite. `_body` = the sprite;
  // drive its facing/anim with _faceSnoopy().
  _makeSnoopy(x, y) {
    const c = this.add.container(x, y);
    const shadow = this.add.ellipse(0, 10, 16, 6, 0x000000, 0.22);
    const s = SNOOPY_H / SNOOPY_FRAME_H;
    // Start on a STILL idle frame (facing down); the walk anim only plays while
    // moving (see _faceSnoopy). Previously this played the loop immediately, so
    // Snoopy "walked in place" at spawn.
    const body = this.add.sprite(0, 0, "snoopy", "w0").setOrigin(0.5, 0.6).setScale(s);
    c.add([shadow, body]); c._body = body;
    c._facing = "down"; c._moving = false;
    return c;
  }

  // Face + animate a Snoopy container per movement. `dir` = {x,y} (player.lastDir);
  // `moving` toggles walk vs. idle (idle = first frame of the current facing).
  // Each direction has its own drawn frames (no flipping).
  _faceSnoopy(container, dir, moving) {
    const spr = container && container._body;
    if (!spr || !dir) return;
    let facing;
    if (Math.abs(dir.x) >= Math.abs(dir.y)) facing = dir.x < 0 ? "left" : "right";
    else facing = dir.y < 0 ? "up" : "down";
    const anim = `snoopy_${facing}`;
    if (moving) {
      if (spr.anims.currentAnim?.key !== anim || !spr.anims.isPlaying) spr.play(anim);
    } else {
      spr.anims.stop();
      spr.setFrame(this._snoopyIdle[facing]);
    }
    container._facing = facing;
  }

  // ---------- ambient NPCs ----------
  // Carve every NPC sheet into idle+walk frames per (tone, direction) and register anims.
  // Frame/anim keys: sheet texture "npcN"; subframe "t{tone}_{dir}_{idle|walk}{f}";
  // anims "npcN_t{tone}_{dir}_idle" and "..._walk".
  _makeNpcFrames() {
    if (this._npcReady) return;
    for (let i = 1; i <= NPC_SHEETS; i++) {
      const key = `npc${i}`;
      const tex = this.textures.get(key);
      if (!tex || tex.key === "__MISSING") continue;
      for (let t = 0; t < NPC_TONES; t++) {
        NPC_DIRS.forEach((dir, d) => {
          const row = 1 + t * NPC_DIRS.length + d;   // +1 skips the label row
          const y = row * NPC_TILE;
          // IDLE = cols 0-3, WALK = cols 4-7.
          const idleFrames = [], walkFrames = [];
          for (let f = 0; f < 4; f++) {
            const in_ = `t${t}_${dir}_idle${f}`;
            const wn = `t${t}_${dir}_walk${f}`;
            tex.add(in_, 0, f * NPC_TILE, y, NPC_TILE, NPC_TILE);
            tex.add(wn, 0, (4 + f) * NPC_TILE, y, NPC_TILE, NPC_TILE);
            idleFrames.push({ key, frame: in_ });
            walkFrames.push({ key, frame: wn });
          }
          this.anims.create({ key: `${key}_t${t}_${dir}_idle`, frameRate: 4, repeat: -1, frames: idleFrames });
          this.anims.create({ key: `${key}_t${t}_${dir}_walk`, frameRate: 8, repeat: -1, frames: walkFrames });
        });
      }
    }
    // Emote pop-in anims (play ONCE, hold last frame). Registered here so they're ready before
    // any NPC reacts.
    for (const e of EMOTES) {
      if (this.anims.exists(`${e.key}_pop`)) continue;
      this.anims.create({
        key: `${e.key}_pop`, frameRate: 10, repeat: 0,
        frames: this.anims.generateFrameNumbers(e.key, { start: 0, end: 3 }),
      });
    }
    this._npcReady = true;
  }

  // Pop a positive emote bubble above an NPC container (once, then fade). Rate-limited per NPC
  // via c._emoteAt so passing by doesn't spam.
  _npcEmote(c) {
    const now = this.time.now;
    if (c._emote || (c._emoteAt && now - c._emoteAt < EMOTE_COOLDOWN_MS)) return;
    c._emoteAt = now;
    const pick = EMOTES[Math.floor(Math.random() * EMOTES.length)].key;
    // Sit the bubble JUST above the head. Head top ≈ container.y - NPC_H*0.55 (feet at +TILE/2,
    // origin bottom). Place the emote a few px above that so there's no big gap.
    const headTop = -(NPC_H * 0.55);
    const yStart = headTop - 6;
    const bubble = this.add.sprite(0, yStart, pick).setScale((NPC_H / NPC_TILE) * 0.75).setDepth(30).setAlpha(0);
    c.add(bubble); c._emote = bubble;
    this.tweens.add({ targets: bubble, alpha: 1, y: yStart - 4, duration: 220, ease: "Back.out" });
    bubble.play(`${pick}_pop`);
    this.time.delayedCall(1500, () => {
      if (!bubble.active) return;
      this.tweens.add({
        targets: bubble, alpha: 0, y: yStart - 10, duration: 400,
        onComplete: () => { bubble.destroy(); if (c._emote === bubble) c._emote = null; },
      });
    });
  }

  // Each frame: if Snoopy is within EMOTE_NEAR_TILES of any ambient NPC, that NPC reacts.
  _updateNpcEmotes() {
    if (!this._npcs || !this.player) return;
    const near = EMOTE_NEAR_TILES * TILE;
    for (const c of this._npcs) {
      if (!c.active) continue;
      const dx = c.x - this.player.x, dy = c.y - this.player.y;
      if (dx * dx + dy * dy <= near * near) this._npcEmote(c);
    }
  }

  // A single NPC container (shadow + sprite). sheet is 0-based (0 => "npc1"). Starts idle
  // facing `dir`. Reuses the same look/scale conventions as the Snoopy player.
  _makeNpc(x, y, sheet = 0, tone = 0, dir = "down") {
    const key = `npc${sheet + 1}`;
    const c = this.add.container(x, y);
    // The NPC art fills its full 16px cell (feet at the very bottom). Anchor the sprite by its
    // FEET (origin 0.5,1) and drop it TILE/2 below the container center so the feet rest on the
    // tile's ground line instead of hovering at tile-center. Shadow sits at the feet.
    const feetY = TILE / 2;
    const shadow = this.add.ellipse(0, feetY, 12, 5, 0x000000, 0.20);
    const s = NPC_H / NPC_TILE;
    const body = this.add.sprite(0, feetY, key).setOrigin(0.5, 1).setScale(s);
    body.play(`${key}_t${tone}_${dir}_idle`);
    c.add([shadow, body]);
    c._body = body; c._key = key; c._tone = tone; c._facing = dir;
    return c;
  }

  // Point an NPC container in `dir`, playing walk or idle for its sheet+tone.
  _faceNpc(c, dir, moving) {
    const spr = c && c._body; if (!spr) return;
    const anim = `${c._key}_t${c._tone}_${dir}_${moving ? "walk" : "idle"}`;
    if (spr.anims.currentAnim?.key !== anim) spr.play(anim);
    c._facing = dir;
  }

  // True if the CENTER of tile (tx,ty) is walkable (not wall/furniture/gate/marker/OOB).
  _tileWalkable(tx, ty) {
    return !this._isBlocked(tx * TILE + TILE / 2, ty * TILE + TILE / 2);
  }

  // Return {x,y} of the nearest walkable tile to (tx,ty) within `radius` rings (spiral search),
  // or null if none found. Used so hand-authored NPC positions never end up inside a wall.
  _nearestWalkableTile(tx, ty, radius = 3) {
    if (this._tileWalkable(tx, ty)) return { x: tx, y: ty };
    for (let r = 1; r <= radius; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; // ring only
          const nx = tx + dx, ny = ty + dy;
          if (this._tileWalkable(nx, ny)) return { x: nx, y: ny };
        }
      }
    }
    return null;
  }

  // Spawn the scattered ambient NPCs (idle + simple patrols) for a bit of life. Every placement
  // (and patrol waypoint) is snapped to the nearest walkable tile; unreachable specs are skipped.
  _spawnAmbientNpcs() {
    this._makeNpcFrames();
    this._npcs = [];
    for (const spec of AMBIENT_NPCS) {
      const at = this._nearestWalkableTile(spec.pos.x, spec.pos.y);
      if (!at) continue; // nowhere valid nearby — skip rather than plant it in a wall
      const c = this._makeNpc(
        at.x * TILE + TILE / 2, at.y * TILE + TILE / 2,
        spec.sheet, spec.tone, spec.dir || "down",
      ).setDepth(19);
      this._npcs.push(c);
      // Only patrol waypoints that are actually walkable; if fewer than 2 remain, it idles.
      if (spec.path && spec.path.length > 1) {
        const path = spec.path.filter((t) => this._tileWalkable(t.x, t.y));
        if (path.length > 1) this._patrolNpc(c, path);
      }
    }
  }

  // Walk an NPC back and forth along `path` (tile waypoints) with correct facing. Pure
  // tweens (no collision) — waypoints are authored on walkable ground.
  _patrolNpc(c, path) {
    const pts = path.map((t) => ({ x: t.x * TILE + TILE / 2, y: t.y * TILE + TILE / 2 }));
    const speed = 28; // px/s — a slow amble
    let i = 0, forward = true;
    const step = () => {
      if (!c.active) return;
      const from = pts[i];
      const ni = forward ? i + 1 : i - 1;
      const to = pts[ni];
      const dx = to.x - from.x, dy = to.y - from.y;
      const dir = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
      this._faceNpc(c, dir, true);
      const dur = (Math.hypot(dx, dy) / speed) * 1000;
      this.tweens.add({
        targets: c, x: to.x, y: to.y, duration: dur, ease: "Linear",
        onComplete: () => {
          i = ni;
          if (i >= pts.length - 1) forward = false;
          else if (i <= 0) forward = true;
          this._faceNpc(c, dir, false);            // pause + idle at the waypoint
          this.time.delayedCall(600 + Math.random() * 900, step);
        },
      });
    };
    this.time.delayedCall(Math.random() * 1200, step);
  }

  // Fill the graduation stands with a static, always-present crowd (facing the stage/down).
  // Tiles GRAD_STANDS.x0..x1 × y0..y1 inclusive, minus the walkway column skipX.
  _spawnGraduationStands() {
    this._makeNpcFrames();
    this._gradStands = this._gradStands || [];
    const g = GRAD_STANDS;
    let n = 0;
    for (let ty = g.y0; ty <= g.y1; ty++) {
      for (let tx = g.x0; tx <= g.x1; tx++) {
        if (tx === g.skipX) continue;
        // NOTE: grad-stands are placed on the EXACT authored tiles, exempt from the walkable
        // check — they're standing in the seating block (which may be non-walkable prop tiles).
        // Deterministic spread of sheets/tones so the crowd looks varied but stable per seat.
        const sheet = (tx * 3 + ty * 7 + n) % NPC_SHEETS;
        const tone = (tx + ty + n) % NPC_TONES;
        const c = this._makeNpc(tx * TILE + TILE / 2, ty * TILE + TILE / 2, sheet, tone, "down")
          .setDepth(19);
        this._gradStands.push(c);
        n++;
      }
    }
  }

  // Sets camera zoom so the view shows ~TARGET_TILES_WIDE tiles across the
  // current canvas width (clamped). Called on create + on every resize.
  _applyZoom() {
    const w = this.scale.width || this.cameras.main.width;
    const zoom = w / (TARGET_TILES_WIDE * TILE);
    this.cameras.main.setZoom(Phaser.Math.Clamp(zoom, MIN_ZOOM, MAX_ZOOM));
  }

  // ---------- map ----------
  _buildMap() {
    // Render the delivered Tiled map. Ground/path/walls/decor draw below the player;
    // overhead draws above so roofs/canopies occlude her.
    const map = this.make.tilemap({ key: "world" });
    const tsModern = map.addTilesetImage(TS_MODERN, TS_MODERN);
    const tsVehicles = map.addTilesetImage(TS_VEHICLES, TS_VEHICLES);
    const tilesets = [tsModern, tsVehicles].filter(Boolean);
    this.tilemap = map;

    const depths = { ground: 0, path: 1, walls: 2, decor: 3, overhead: 25 };
    this.mapLayers = {};
    for (const [name, depth] of Object.entries(depths)) {
      const layer = map.createLayer(name, tilesets, 0, 0);
      if (layer) { layer.setDepth(depth); this.mapLayers[name] = layer; }
    }

    // Collision has TWO sources:
    //  1. this.colRects — the map's collision rects in PIXEL space. Static
    //     furniture/walls are tested pixel-accurately (no tile rounding), so
    //     footprints match the art.
    //  2. this.blocked — a TILE set for DYNAMIC, per-tile blocking only: gates,
    //     encounter markers, the fountain basin, walkOn carving. It starts empty
    //     (the static furniture lives in colRects) and is mutated at runtime.
    this.colRects = this.mapData.colRects || [];
    this.blocked = new Set();
    // Tiles explicitly carved WALKABLE, overriding BOTH colRects and blocked.
    // Used by walkOn markers (e.g. stepping onto the graduation stage) so a
    // runtime carve can punch through the static pixel-rect collision too.
    this.unblocked = new Set();

    // (Glow pools at `light` markers were removed in favor of uniform lighting; the markers
    // remain in the map data for a future lighting pass.)

    // Encounter POSITIONS now come from the map (encounters.js keeps the step-data only).
    // encPos: id -> {x,y} in tiles, used by markers and proximity triggers.
    this.encPos = {};
    for (const id in this.mapData.encounters) this.encPos[id] = this.mapData.encounters[id];
    // Apply explicit tile-coord overrides (from the tile HUD) over the map positions.
    for (const id in ENC_POS_OVERRIDES) this.encPos[id] = ENC_POS_OVERRIDES[id];
  }

  // Animated fountain(s): the artist placed a STATIC fountain in decor/overhead and dropped an
  // `anim_fountain` marker on it. The fountain sheet is a 2x3-tile (32x48) sprite over 8 frames.
  // We hide the static fountain tiles and draw a looping animated sprite aligned over them.
  _makeAnimatedProps() {
    const fountains = (this.mapData.anim || []).filter((a) => a.name.startsWith("anim_fountain"));
    if (!fountains.length) return;

    if (!this.anims.exists("fountain_run")) {
      this.anims.create({
        key: "fountain_run",
        frames: this.anims.generateFrameNumbers("fountain", { start: 0, end: 7 }),
        frameRate: 8, repeat: -1,
      });
    }

    for (const f of fountains) {
      // Marker sits on the fountain's bottom-right tile. The static art is a 2-wide x 3-tall
      // block occupying tiles (x-1..x, y-2..y). Draw the 32x48 sprite with bottom-center origin
      // at the block's bottom-center seam, so it lines up exactly with where the art was.
      const bx = f.x * TILE;          // seam between the two fountain columns (block center x)
      const by = (f.y + 1) * TILE;    // bottom edge of the marker tile (block bottom)
      const spr = this.add.sprite(bx, by, "fountain").setOrigin(0.5, 1).setDepth(4);
      spr.play("fountain_run");

      // Hide the static fountain tiles underneath (decor + overhead) so nothing double-draws.
      for (let ty = f.y - 2; ty <= f.y; ty++) {
        for (let tx = f.x - 1; tx <= f.x; tx++) {
          this.mapLayers.decor?.removeTileAt(tx, ty);
          this.mapLayers.overhead?.removeTileAt(tx, ty);
        }
      }
      // The fountain is solid — block its basin footprint so she can't walk through it.
      for (let ty = f.y - 1; ty <= f.y; ty++) {
        for (let tx = f.x - 1; tx <= f.x; tx++) this.blocked.add(`${tx},${ty}`);
      }
    }
  }

  _makeGates() {
    // Gates come from the map's gate:* markers. g3 has TWO markers (two openings zone3->4);
    // both share id "g3", so opening g3 clears both. SOFT gates: no wall/collision — instead,
    // if the player tries to walk PAST a not-yet-open gate line, _softGateBlock() eases her
    // back and the guide nudges her to finish the zone first (see update()). gateSprites
    // entries are kept (empty) so openGate()/save-restore logic stay unchanged.
    this.gateSprites = {};
    this.mapData.gates.forEach((g) => {
      (this.gateSprites[g.id] ||= []).push({ sprites: [], def: g });
    });
    this._gatePromptAt = -1e6; // throttle for the "finish the zone" nudge (allow first immediately)
  }

  // Soft gate: keep the player from crossing to the far (upper, lower-Y) side of a
  // closed gate. Gates are horizontal runs at row g.y spanning x[0..1]; she always
  // approaches from below (higher Y) heading up. If her body crosses the gate line
  // within the span while it's closed, clamp her just below it and nudge her.
  _softGateBlock() {
    const p = this.player; if (!p) return;
    const px = p.x, halfY = PLAYER_HALF;
    for (const g of this.mapData.gates) {
      if (this.openGates.has(g.id)) continue;
      const line = g.y * TILE + TILE;              // bottom edge of the gate row (px)
      const x0 = g.x[0] * TILE, x1 = (g.x[1] + 1) * TILE;
      if (px < x0 || px >= x1) continue;           // not within this gate's opening
      if (p.y - halfY < line) {                    // her top crossed above the gate line
        p.y = line + halfY;                        // ease back to just below the gate
        this._promptGate();
      }
    }
  }

  _promptGate() {
    const now = this.time.now;
    if (this.runner.running || now - this._gatePromptAt < 3500) return;
    this._gatePromptAt = now;
    this.dialogue.show("There's more here to remember first, Isa. Stay with me a little longer — then we'll go on.", "guide")
      .then(() => this.dialogue.hide());
  }

  _makeMarkers() {
    // Each encounter is marked by a cute envelope sprite that gently bobs. Positions come
    // from the map's encounter:* markers. Completed encounters fade their envelope. Each
    // marker's own tile is made solid so the player can't walk over the envelope (triggering
    // still works from any adjacent tile — every marker has walkable neighbors).
    const MARKER_W = 28; // on-map display width in px (~1.75 tiles); scale from the real texture
    const letterTex = this.textures.get("marker_letter").getSourceImage();
    const letterScale = letterTex && letterTex.width ? MARKER_W / letterTex.width : 0.05;
    // Finale marker = Kirby himself, shown full-body — sized as a peer character
    // (a bit smaller than Snoopy so he reads as round/cute rather than looming).
    // Scale is derived from Snoopy's on-map height (SNOOPY_H = 24 px) and kirby.png's
    // opaque bbox (~438x392 inside a raw 514x412 sheet — almost no transparent padding).
    // KIRBY_HEIGHT_RATIO = fraction of Snoopy's visible height (0.8 = 20% smaller).
    const KIRBY_OPAQUE_H = 392;
    const KIRBY_HEIGHT_RATIO = 0.8;
    const kirbyScale = (SNOOPY_H * KIRBY_HEIGHT_RATIO) / KIRBY_OPAQUE_H;

    this.markers = {};
    // markerTile[id] = the tile the marker visually sits on (after MARKER_TWEAKS offsets).
    // update() uses this for the "SPACE to look" proximity so the prompt matches the marker.
    this.markerTile = {};
    for (const key in ENCOUNTERS) {
      const e = ENCOUNTERS[key];
      const pos = this.encPos[e.id];
      if (!pos) continue;
      const tweak = MARKER_TWEAKS[e.id] || {};
      const isFinale = e.id === "finale";
      const texKey = isFinale ? "marker_kirby" : "marker_letter";
      const scale = isFinale ? kirbyScale : letterScale;
      const cx = pos.x * TILE + TILE / 2 + (tweak.dx || 0);
      const cy = pos.y * TILE + TILE / 2 + (tweak.dy || 0);

      // Depth 26 keeps the marker ABOVE the map's overhead layer (25) and the player (20),
      // so it never slips behind tree canopies / awnings / roofs.
      // Envelope markers hover at tile-center (origin 0.5,0.5) and gently bob so they read
      // as "collectible." The FINALE Kirby is a CHARACTER standing on the ground — anchor
      // his feet (origin 0.5,1) to the tile center so he stands on the tile the author
      // placed him on, and skip the bob so he feels present, not "pick me up."
      const origin = isFinale ? [0.5, 1] : [0.5, 0.5];
      const m = this.add.image(cx, cy, texKey).setOrigin(origin[0], origin[1]).setScale(scale).setDepth(26);
      if (!isFinale) {
        // gentle idle bob so it feels alive
        this.tweens.add({ targets: m, y: cy - 2, duration: 900, yoyo: true, repeat: -1, ease: "Sine.inOut" });
      }

      // Solidity: normally make the marker's tile solid (walk UP to it, not onto it). But if the
      // marker is repositioned ONTO an object (onObject) leave collision to that object, and if
      // walkOn, carve a walkable path to where the marker now sits (e.g. onto the stage): unblock
      // the marker's display tile + the ring of tiles between it and the trigger tile below.
      const dispTx = Math.floor(cx / TILE), dispTy = Math.floor(cy / TILE);
      this.markerTile[e.id] = { x: dispTx, y: dispTy };
      if (tweak.walkOn) {
        // Carve WALKABLE (overrides static colRects + blocked): the display tile
        // and a straight column from the trigger tile up to it.
        this.blocked.delete(`${pos.x},${pos.y}`);
        this.unblocked.add(`${pos.x},${pos.y}`);
        const loY = Math.min(dispTy, pos.y), hiY = Math.max(dispTy, pos.y);
        for (let ty = loY; ty <= hiY; ty++) {
          this.blocked.delete(`${dispTx},${ty}`);
          this.unblocked.add(`${dispTx},${ty}`);
        }
        // Visual step up: a drawn wooden-steps prop butting the stage's front face. Its TOP
        // meets the bottom of the front-face tile (stairs.y is that front-face row), centered
        // on the aisle column. Depth 4 = above ground/decor, below the player.
        if (tweak.stairs) {
          const sx = tweak.stairs.x * TILE + TILE / 2;
          // Butt the stairs' TOP into the lower part of the front-face row so it meets the
          // stage's metal lip with no cobblestone gap.
          const sy = tweak.stairs.y * TILE + 4;
          this.add.image(sx, sy, "stage_stairs").setOrigin(0.5, 0).setDepth(4);
        }
      } else if (!tweak.onObject && (isFinale || !this.completed.has(e.id))) {
        // Block the tile where the sprite is actually drawn (its display tile), not
        // the raw trigger tile — otherwise, for markers with a sprite offset, the
        // solid tile sits away from the visible art and you'd walk right through it.
        // Envelope markers: only block while pending (completed → walk-through, see
        // markComplete). Finale Kirby: ALWAYS block (feet + torso tile) — he's a
        // person standing there, replayable; Isa should never walk through him.
        this.blocked.add(`${dispTx},${dispTy}`);
        if (isFinale) {
          // Kirby stands feet-anchored at tile center → his body also occupies
          // the tile above. Block it too so his torso/face aren't walkable.
          this.blocked.add(`${dispTx},${dispTy - 1}`);
        }
      }

      // Finale Kirby never fades on completion — he's a permanent presence at Home
      // (and replayable). Envelope markers dim to signal "already seen."
      if (!isFinale && this.completed.has(e.id)) m.setAlpha(0.25);
      this.markers[e.id] = m;
    }
  }

  // ---------- intro (eyes open) ----------
  async _playIntro() {
    this.setInputLocked(true);
    this.introRunning = true;
    const black = document.getElementById("intro-black");
    const txt = document.getElementById("intro-text");
    // Four fade-in phrases (intro.phrase1-4). Hold time scales with length (~38ms/char) so the
    // long middle phrases get ~6s while the short first/last land near the 2s floor.
    const phrases = [
      "Había una vez…",
      "...there was a really special girl. One might say the brightest, funniest, prettiest girl there ever was.",
      "Exactly one year ago, she accepted a totally ordinary boy as her officially-approved biggest fan. He still can't believe his luck.",
      "This is their story.",
    ];
    for (const p of phrases) {
      txt.textContent = p;
      await wait(Math.max(2000, Math.min(6000, p.length * 38)));
    }
    txt.textContent = "";
    black.style.transition = "opacity 2.2s ease";
    black.style.opacity = "0";
    await wait(2300);
    black.classList.add("hidden"); black.style.opacity = "1"; black.style.transition = "";

    this.audio?.playMusic("meadow");
    await this.dialogue.show("There you are. Take your time. You've been asleep a long while.", "guide");
    await this.dialogue.show("You don't remember anything right now. That's alright – that's what this journey is for.", "guide");
    await this.dialogue.show("Go on. Explore with the W A S D keys. The small golden arrow will help guide you to your memories. Every memory you collect will be added to your album (top left), which you can check anytime with the TAB key.", "guide");
    this.dialogue.hide();
    // The first secret-Kirby showing is the first timer peek (carries the line).

    await this.openGate("g1");
    this.markComplete("intro");
    this.introRunning = false;
    this.setInputLocked(false);
  }

  // ---------- secret Kirby peek ----------
  // Peek from a random edge. The FIRST peek carries the guide's intro line (to
  // introduce the motif); subsequent peeks are silent.
  _ambientPeek() {
    if (!this.peek || this.peek.isBusy()) return;
    this.peeking = true;
    const firstTime = !this.firstPeekDone;
    this.firstPeekDone = true;
    this.peek.peek().then(async () => {
      if (firstTime) {
        await this.dialogue.show("Hm? ...Don't mind the bola. It's just your super secret super admirer.", "guide");
        this.dialogue.hide();
      }
      this.peeking = false;
    });
  }

  // ---------- verbs ----------
  awaitVerb(verb, label) {
    return new Promise((resolve) => {
      this._showPrompt(label ? `${label}  ·  SPACE` : "SPACE");
      let released = false;
      const check = () => {
        if (!released) { if (this.spaceKey.isUp) released = true; return; }
        if (this.spaceKey.isDown) { this._hidePrompt(); this.events.off("update", check); resolve(); }
      };
      this.events.on("update", check);
    });
  }
  _showPrompt(t) { const p = document.getElementById("verb-prompt"); if (p) { p.textContent = t; p.classList.remove("hidden"); } }
  _hidePrompt() { const p = document.getElementById("verb-prompt"); if (p) p.classList.add("hidden"); }

  // ---------- effects ----------

  // Register the E7 firework anims once (rocket trails + explosions). Explosion sheets have
  // many frames; we time each to a fixed total duration so styles read consistently.
  _makeFireworkAnims() {
    for (const s of FIREWORK_EXPLOSIONS) {
      if (this.anims.exists(s.key)) continue;
      this.anims.create({
        key: s.key,
        frames: this.anims.generateFrameNumbers(s.key, { start: 0, end: s.frames - 1 }),
        frameRate: Math.round((s.frames / FW_EXPLODE_MS) * 1000),
        repeat: 0,
      });
    }
    for (const s of FIREWORK_ROCKETS) {
      if (this.anims.exists(s.key)) continue;
      this.anims.create({
        key: s.key,
        frames: this.anims.generateFrameNumbers(s.key, { start: 0, end: s.frames - 1 }),
        frameRate: FW_ROCKET_FPS,
        repeat: -1, // loops during the rise; destroyed on arrival
      });
    }
  }

  // E7 fireworks: rockets rise into a random explosion at their apex. The tuned 37→47 stagger
  // BLOCK is repeated rightward (37-47, 47-57, ...) until it would pass the world's right edge,
  // so wider screens see more repeats of the same pattern/spacing.
  fireworks() {
    return new Promise((resolve) => {
      const xMaxTile = this.mapW - 1 - FW_X_RIGHT_MARGIN_TILES;
      const baseY = FW_Y_TILE * TILE + TILE / 2;

      // Build the shell X positions (in px) by tiling the block pattern across the span.
      const shellsX = [];
      for (let blockStart = FW_X_MIN_TILE;
           blockStart + FW_BLOCK_TILES <= xMaxTile + 0.001 && shellsX.length < FW_MAX_SHOTS;
           blockStart += FW_BLOCK_TILES) {
        for (const frac of FW_BLOCK_STAGGER) {
          const tile = blockStart + frac * FW_BLOCK_TILES;
          shellsX.push(tile * TILE + TILE / 2);
        }
      }
      // Guarantee at least one block even if the world is narrow.
      if (shellsX.length === 0) {
        for (const frac of FW_BLOCK_STAGGER) {
          shellsX.push((FW_X_MIN_TILE + frac * FW_BLOCK_TILES) * TILE + TILE / 2);
        }
      }
      const shots = shellsX.length;

      // Keep the whole show within ~FW_MAX_SHOW_MS by tightening the gap when there are many
      // shells (wide screens) — otherwise many shots at the full gap would drag on too long.
      const FW_MAX_SHOW_MS = 4200;
      const gap = Math.min(FW_SHOT_GAP, FW_MAX_SHOW_MS / Math.max(1, shots));

      for (let i = 0; i < shots; i++) {
        this.time.delayedCall(i * gap, () => {
          // Apex X: this shell's tiled-block position (+ small jitter).
          const bx = shellsX[i] + (Math.random() - 0.5) * 12;
          const by = baseY + (Math.random() - 0.5) * 24;
          const rocket = Phaser.Utils.Array.GetRandom(FIREWORK_ROCKETS);
          const boom = Phaser.Utils.Array.GetRandom(FIREWORK_EXPLOSIONS);

          // Rocket rises FW_RISE_DIST px up to the apex.
          const r = this.add.sprite(bx, by + FW_RISE_DIST, rocket.key).setDepth(40).setScale(0.7);
          r.play(rocket.key);
          this.tweens.add({
            targets: r, y: by, duration: FW_RISE_MS, ease: "Quad.out",
            onComplete: () => {
              r.destroy();
              // Detonate: random explosion, scaled to read ~90-120px on-map.
              const e = this.add.sprite(bx, by, boom.key).setDepth(41)
                .setScale(1.15).setBlendMode(Phaser.BlendModes.ADD);
              e.play(boom.key);
              e.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => e.destroy());
            },
          });
        });
      }

      // Resolve after the FIRST BLOCK (the tuned 5 bursts) has launched, risen, and exploded —
      // so the dialogue can advance without waiting for the extra repeated blocks that wider
      // screens add. Those remaining shells keep firing on their own timers in the background.
      const firstBlockShots = Math.min(FW_BLOCK_STAGGER.length, shots);
      const resolveAfter = (firstBlockShots - 1) * gap + FW_RISE_MS + FW_EXPLODE_MS + 150;
      this.time.delayedCall(resolveAfter, resolve);
    });
  }

  confetti() {
    this._confettiAt(this.player.x, this.player.y - 40);
  }

  // An animated confetti burst at world (x,y): plays the 64-frame confetti sheet once, then
  // destroys itself.
  _confettiAt(x, y) {
    if (!this.anims.exists("confetti_burst")) {
      this.anims.create({
        key: "confetti_burst", frameRate: 30, repeat: 0,
        frames: this.anims.generateFrameNumbers("confetti", { start: 0, end: CONFETTI_FRAMES - 1 }),
      });
    }
    const scale = CONFETTI_H / CONFETTI_CELL;
    // The burst originates low and shoots up: anchor near the bottom of the sprite.
    const spr = this.add.sprite(x, y, "confetti").setOrigin(0.5, 0.85).setScale(scale).setDepth(40);
    spr.play("confetti_burst");
    spr.once("animationcomplete", () => spr.destroy());
    return spr;
  }

  // E10 graduation set-piece: a slow cap-and-gown walk across the stage (left→right) with
  // bursts of animated confetti, ending with the static grad-Snoopy standing at center. The
  // real player + the graduation marker are HIDDEN here and stay hidden for the rest of the
  // encounter; they're restored in markComplete("graduation") once the encounter fully ends.
  gradWalk() {
    return new Promise((resolve) => {
      // Register the walk anim once (25 frames across the 5x5 sheet).
      if (!this.anims.exists("gradwalk")) {
        this.anims.create({
          key: "gradwalk", frameRate: 10, repeat: -1,
          frames: this.anims.generateFrameNumbers("snoopygradwalk",
            { start: 0, end: GRADWALK_COLS * GRADWALK_ROWS - 1 }),
        });
      }
      const fromX = GRADWALK_FROM.x * TILE + TILE / 2;
      const toX = GRADWALK_TO.x * TILE + TILE / 2;
      const y = GRADWALK_FROM.y * TILE + TILE / 2;
      const standX = GRAD_STAND_POS.x * TILE + TILE / 2;
      const standY = GRAD_STAND_POS.y * TILE + TILE / 2;

      // Hide the real player + the graduation encounter marker (restored in markComplete).
      const marker = this.markers?.graduation;
      this.player.setVisible(false);
      marker?.setVisible(false);
      this._gradHidPlayer = true; // markComplete uses this to restore

      // The walking grad-Snoopy. Sheet is RIGHT-facing already (no flip). Feet-anchored.
      const scale = GRADWALK_H / GRADWALK_CELL;
      const grad = this.add.sprite(fromX, y, "snoopygradwalk")
        .setOrigin(0.5, 0.9).setScale(scale).setDepth(21);
      grad.play("gradwalk");

      // Confetti bursts just below the walker, following her across the stage.
      const burst = () => { if (grad.active) this._confettiAt(grad.x, grad.y + GRAD_CONFETTI_DY); };
      burst();
      const confettiTimer = this.time.addEvent({
        delay: GRADWALK_CONFETTI_MS, loop: true, callback: burst,
      });

      this.tweens.add({
        targets: grad, x: toX, duration: GRADWALK_MS, ease: "Linear",
        onComplete: () => {
          confettiTimer.remove();
          grad.destroy();
          // Static cap-and-gown Snoopy stands center (stays until the encounter ends). Scale by
          // the static PNG's height to match the walker's on-screen size.
          const statScale = GRADWALK_H / 500; // snoopygrad.png is 500x500
          this._gradStatic = this.add.image(standX, standY, "snoopygrad")
            .setOrigin(0.5, 0.9).setScale(statScale).setDepth(21);
          this._confettiAt(standX, standY + GRAD_CONFETTI_DY); // one celebratory burst on arrival
          // Take a beat — let her stand center a moment before the encounter continues. Use a
          // plain timer (not the scene clock) so the pause is guaranteed regardless of scene
          // time scale / pause state.
          wait(GRAD_END_BEAT_MS).then(resolve);
        },
      });
    });
  }

  startCutscene({ bg, sprite }) {
    return new Promise((resolve) => {
      const cam = this.cameras.main;
      this.cutsceneEls = [];
      const rect = this.add.rectangle(cam.width / 2, cam.height / 2, cam.width, cam.height, Phaser.Display.Color.HexStringToColor(bg).color)
        .setDepth(45).setAlpha(0).setScrollFactor(0).setOrigin(0.5).setScale(3);
      this.cutsceneEls.push(rect);
      let spr = null;
      if (sprite === "isa") spr = this._makeReflection(cam);
      this.tweens.add({ targets: rect, alpha: 1, duration: 700, onComplete: () => { spr ? this.tweens.add({ targets: spr, alpha: 1, duration: 900, onComplete: resolve }) : resolve(); } });
    });
  }

  // Her reflection in the pond. The snoopy_ft1-3 art has a solid WHITE background that shares
  // the exact same pure-white pixels as Snoopy's own body (his outline has gaps), so it can't be
  // color-keyed or flood-filled cleanly. Instead we render it as a "reflection in water":
  //   1) each pose is pre-baked into a soft-edged CIRCULAR variant (_bakeReflectionTexture) —
  //      centered on a padded white field that feathers to transparent toward the rim (a
  //      porthole), so the square box never shows a hard edge; and
  //   2) NORMAL blend keeps Snoopy crisp; the white inside the circle reads as a bright
  //      reflection on the water.
  // Shimmer cross-fades the three poses.
  _makeReflection(cam) {
    const frames = ["snoopy_ft1", "snoopy_ft2", "snoopy_ft3"];
    // Pre-feathered padded variants (baked once). Scale is based on the BAKED texture height so
    // REFLECTION_SCREEN_FRAC controls the whole porthole (Snoopy + white halo).
    const rframes = frames.map((f) => this._bakeReflectionTexture(f));
    const tex0 = this.textures.get(rframes[0]).getSourceImage();
    // The overlay is drawn through the WORLD camera (zoom ~1.7). The existing cutscene bg rect
    // compensates for the zoom with setScale(3); a scrollFactor-0 sprite here is likewise
    // magnified by the zoom on screen. So divide the intended world height by zoom to hit the
    // desired ON-SCREEN size. REFLECTION_SCREEN_FRAC = fraction of the visible screen height the
    // porthole should occupy — the one knob to tune if it reads too big/small.
    const zoom = cam.zoom || 1;
    const targetH = (cam.height * REFLECTION_SCREEN_FRAC) / zoom;
    const scale = targetH / tex0.height;
    const cx = cam.width / 2, cy = cam.height / 2;
    // NORMAL blend (not MULTIPLY): the feathered circular alpha already hides the square box, and
    // MULTIPLY was washing his linework/shading into the blue. Normal keeps him crisp; the white
    // inside the circle reads as a bright reflection on the water.
    const spr = this.add.image(cx, cy, rframes[0])
      .setDepth(46).setAlpha(0).setScrollFactor(0).setScale(scale);
    this.cutsceneEls.push(spr);

    frames.length = 0; // (swap the shimmer to iterate the feathered variants)
    frames.push(...rframes);

    // Shimmer: every ~1100ms fade out, swap to the next pose, fade back in. Gentle so it reads
    // as rippling water, not a flip-book.
    let i = 0;
    const cycle = () => {
      if (!spr.active) return;
      this.tweens.add({
        targets: spr, alpha: 0.78, duration: 500, ease: "Sine.inOut", yoyo: true,
        onYoyo: () => { i = (i + 1) % frames.length; spr.setTexture(frames[i]); },
      });
    };
    this.reflectTween = this.time.addEvent({ delay: 1100, loop: true, callback: cycle });
    return spr;
  }

  // Bake a soft-edged circular variant of a source texture (once, cached). The source is drawn
  // CENTERED on a larger canvas with a WHITE margin around it (PAD), so the feather has white
  // space to fade through instead of clipping Snoopy's edges abruptly. Then a radial alpha
  // gradient (destination-in) fades the whole thing out toward the circular rim. Returns the
  // cached texture key. Renderer-safe (no Phaser masks — Phaser 4 dropped bitmap masks and
  // geometry masks are Canvas-only/hard).
  _bakeReflectionTexture(srcKey) {
    const key = `${srcKey}_reflect`;
    if (this.textures.exists(key)) return key;
    const src = this.textures.get(srcKey).getSourceImage();
    const sw = src.width, sh = src.height;
    // Padding = 35% of the sprite's larger side on each edge, so there's a generous white halo
    // around him for the feather to work through.
    const pad = Math.round(Math.max(sw, sh) * 0.35);
    const w = sw + pad * 2, h = sh + pad * 2;
    const canvasTex = this.textures.createCanvas(key, w, h);
    const ctx = canvasTex.getContext();
    // 1) fill the whole canvas white (matches the sprite's own white bg → seamless halo).
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    // 2) the sprite, centered in the padded field.
    ctx.drawImage(src, pad, pad, sw, sh);
    // 3) feather: keep pixels only where this radial gradient is opaque (destination-in). Fully
    //    opaque out to 62% of the radius (covers Snoopy + some white halo), then fade to 0 at rim.
    ctx.globalCompositeOperation = "destination-in";
    const R = Math.min(w, h) / 2;
    const g = ctx.createRadialGradient(w / 2, h / 2, R * 0.62, w / 2, h / 2, R);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    canvasTex.refresh();
    return key;
  }

  endCutscene() {
    return new Promise((resolve) => {
      this.reflectTween?.remove(); this.reflectTween = null;
      if (!this.cutsceneEls) return resolve();
      this.tweens.add({ targets: this.cutsceneEls, alpha: 0, duration: 700, onComplete: () => { this.cutsceneEls.forEach((e) => e.destroy()); this.cutsceneEls = null; resolve(); } });
    });
  }

  openGate(id) {
    return new Promise((resolve) => {
      const entries = this.gateSprites[id]; if (!entries || !entries.length) return resolve();
      const allSprites = [];
      for (const g of entries) {
        for (let x = g.def.x[0]; x <= g.def.x[1]; x++) this.blocked.delete(`${x},${g.def.y}`);
        allSprites.push(...g.sprites);
      }
      this.openGates.add(id); this._saveGates(); this.audio?.sfx("chime");
      // Gates are invisible now (no sprites); just unblock + chime, then resolve.
      // (Guard kept in case sprites are ever reintroduced.)
      if (allSprites.length) {
        this.tweens.add({ targets: allSprites, alpha: 0, duration: 900, onComplete: () => { allSprites.forEach((s) => s.setVisible(false)); resolve(); } });
      } else {
        this.time.delayedCall(400, resolve);
      }
    });
  }

  endScreen() {
    return new Promise((resolve) => {
      const el = document.getElementById("end-screen");
      const theEnd = document.getElementById("the-end");
      // Frame the center with the collected memory photos (spread around the perimeter).
      // They're clickable → open the shared album lightbox.
      this.album?.renderEndFrame?.();
      if (el) el.classList.remove("hidden");
      // Reveal the sprites, photos, AND "the end" together (they share the same fade-in).
      if (theEnd) theEnd.classList.remove("hidden");
      this.tweens.add({ targets: this.ambientOverlay, alpha: 0, duration: 1500 });
      const go = (e) => {
        if (e.code === "Space" || e.code === "Enter") {
          // If a memory photo is open in the lightbox, SPACE/ENTER shouldn't leave the
          // end screen — let the user browse first (ESC / click-bg closes the lightbox).
          const lb = document.getElementById("lightbox");
          if (lb && !lb.classList.contains("hidden")) return;
          window.removeEventListener("keydown", go);
          el && el.classList.add("hidden"); theEnd && theEnd.classList.add("hidden");
          const frame = document.getElementById("end-frame");
          if (frame) frame.innerHTML = "";
          this.scene.start("title", { dialogue: this.dialogue, album: this.album, letter: this.letter, audio: this.audio });
          resolve();
        }
      };
      // Small guard so a SPACE press carried over from the finale dialogue doesn't instantly
      // dismiss the end screen. (Was 3.2s to outlast the delayed "the end"; now everything
      // shows at once, so a shorter guard is enough.)
      setTimeout(() => window.addEventListener("keydown", go), 1500);
    });
  }

  // ---------- zones ----------

  // Which zone key contains a given tile-Y, from the map's zone rects (bottom->top).
  _zoneKeyAt(tileY) {
    for (const z of this.mapData.zoneRects) if (tileY >= z.yMin && tileY < z.yMax) return z.key;
    // clamp to nearest end
    const rects = this.mapData.zoneRects;
    return tileY < rects[rects.length - 1].yMin ? rects[rects.length - 1].key : rects[0].key;
  }

  // Zone drives ONLY background color + music (the ambient tint is constant game-wide,
  // set once at create() — no per-zone or phased lighting).
  _updateZoneVisuals(force) {
    const py = this.player ? this.player.y : (this.mapH - 2) * TILE;
    const key = this._zoneKeyAt(Math.floor(py / TILE));
    if (force || key !== this._lastZone) {
      this._lastZone = key;
      const prof = ZONE_PROFILES[key];
      if (prof) {
        this.cameras.main.setBackgroundColor(prof.bg);
        if (prof.music) this.audio?.playMusic(prof.music);
      }
    }
  }

  // ---------- state ----------
  setInputLocked(v) { this.inputLocked = v; }
  markComplete(id) {
    this.completed.add(id);
    try { localStorage.setItem("rm_completed", JSON.stringify([...this.completed])); } catch {}
    // Graduation set-piece cleanup: the walk hid the real player + marker and left a static
    // grad-Snoopy standing center. Now that the encounter is fully over, remove the static
    // sprite and bring the real player back (the marker restores via the normal path below,
    // then fades to its completed alpha).
    if (id === "graduation") {
      this._gradStatic?.destroy(); this._gradStatic = null;
      if (this._gradHidPlayer) { this.player.setVisible(true); this._gradHidPlayer = false; }
      this.markers.graduation?.setVisible(true);
    }
    // Finale Kirby is a special encounter: no fade (he's a permanent presence at Home) and
    // no unblocking (he still blocks his tile so the "walk up + SPACE" model works on replay).
    if (id === "finale") return;
    if (this.markers[id]) this.markers[id].setAlpha(0.2);
    // A completed marker should no longer collide — unblock the tile that
    // _makeMarkers made solid for it (its DISPLAY tile). walkOn/onObject markers
    // never blocked their own tile, so deleting a missing entry is a harmless no-op.
    const t = this.markerTile && this.markerTile[id];
    if (t) this.blocked.delete(`${t.x},${t.y}`);
  }
  _saveGates() { try { localStorage.setItem("rm_gates", JSON.stringify([...this.openGates])); } catch {} }

  _isBlocked(px, py) {
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= this.mapW || ty >= this.mapH) return true;
    if (this.unblocked.has(`${tx},${ty}`)) return false; // carved walkable
    if (this.blocked.has(`${tx},${ty}`)) return true;
    // Also test the pixel-space collision rects (static furniture/walls).
    for (const r of this.colRects) {
      if (px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h) return true;
    }
    return false;
  }

  // AABB collision test: does the player's body box (centered at cx,cy, half-size
  // PLAYER_HALF) overlap anything solid? Tests BOTH the static PIXEL collision
  // rects (furniture/walls, pixel-accurate) and the dynamic tile set (gates/
  // markers/fountain). Tiles in `unblocked` are treated as walkable regardless.
  _boxBlocked(cx, cy) {
    const h = PLAYER_HALF;
    const left = cx - h, right = cx + h, top = cy - h, bottom = cy + h;
    // 1) Pixel-accurate AABB-vs-rect against the static furniture/walls. Skip a
    //    rect if the box's overlap with it lies entirely on carved (unblocked)
    //    tiles — lets walkOn carves punch through static collision (e.g. stage).
    for (const r of this.colRects) {
      if (!(right > r.x && left < r.x + r.w && bottom > r.y && top < r.y + r.h)) continue;
      if (this.unblocked.size && this._overlapAllUnblocked(left, top, right, bottom, r)) continue;
      return true;
    }
    // 2) Dynamic per-tile blocking (gates/markers/fountain/out-of-bounds).
    const x0 = Math.floor(left / TILE), x1 = Math.floor(right / TILE);
    const y0 = Math.floor(top / TILE), y1 = Math.floor(bottom / TILE);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (tx < 0 || ty < 0 || tx >= this.mapW || ty >= this.mapH) return true;
        if (this.unblocked.has(`${tx},${ty}`)) continue;
        if (this.blocked.has(`${tx},${ty}`)) return true;
        // NPCs are solid (their current tile blocks the player). Patrols update this set each
        // frame (_updateNpcCollision) so the block follows the walking NPC.
        if (this.npcBlocked && this.npcBlocked.has(`${tx},${ty}`)) return true;
      }
    }
    return false;
  }

  // Rebuild the NPC collision tile set from every NPC's live position (ambient + grad stands).
  // Called each frame so a patrolling NPC's solid tile tracks it.
  _updateNpcCollision() {
    if (!this.npcBlocked) this.npcBlocked = new Set();
    else this.npcBlocked.clear();
    const add = (list) => {
      if (!list) return;
      for (const c of list) {
        if (!c.active) continue;
        this.npcBlocked.add(`${Math.floor(c.x / TILE)},${Math.floor(c.y / TILE)}`);
      }
    };
    add(this._npcs);
    add(this._gradStands);
  }

  // True if every tile the box∩rect overlap touches is carved walkable.
  _overlapAllUnblocked(left, top, right, bottom, r) {
    const ox0 = Math.max(left, r.x), oy0 = Math.max(top, r.y);
    const ox1 = Math.min(right, r.x + r.w), oy1 = Math.min(bottom, r.y + r.h);
    const tx0 = Math.floor(ox0 / TILE), tx1 = Math.floor((ox1 - 0.001) / TILE);
    const ty0 = Math.floor(oy0 / TILE), ty1 = Math.floor((oy1 - 0.001) / TILE);
    for (let ty = ty0; ty <= ty1; ty++)
      for (let tx = tx0; tx <= tx1; tx++)
        if (!this.unblocked.has(`${tx},${ty}`)) return false;
    return true;
  }

  // Move the player along one axis by `d` px. If directly blocked, attempt a
  // small perpendicular "nudge" (up to CORNER_NUDGE px) so the player can round
  // a corner or thread a narrow gap rather than snagging on an invisible edge.
  _moveAxis(axis, d) {
    const p = this.player;
    if (axis === "x") {
      if (!this._boxBlocked(p.x + d, p.y)) { p.x += d; return; }
      for (let n = 1; n <= CORNER_NUDGE; n++) {
        if (!this._boxBlocked(p.x + d, p.y - n)) { p.y -= n; p.x += d; return; }
        if (!this._boxBlocked(p.x + d, p.y + n)) { p.y += n; p.x += d; return; }
      }
    } else {
      if (!this._boxBlocked(p.x, p.y + d)) { p.y += d; return; }
      for (let n = 1; n <= CORNER_NUDGE; n++) {
        if (!this._boxBlocked(p.x - n, p.y + d)) { p.x -= n; p.y += d; return; }
        if (!this._boxBlocked(p.x + n, p.y + d)) { p.x += n; p.y += d; return; }
      }
    }
  }

  update(_, dt) {
    if (this.player) this._updateZoneVisuals(false);
    // One-shot: lock the camera onto the player on the first update, after RESIZE
    // has settled the camera size/zoom — prevents the ease-in pan on load/Continue.
    if (this.player && !this._cameraSnapped) {
      this.cameras.main.centerOn(this.player.x, this.player.y);
      this._cameraSnapped = true;
    }
    // Keep the NPC collision tiles fresh (patrols move) BEFORE resolving player movement.
    this._updateNpcCollision();
    if (this.inputLocked || !this.player) return;
    const step = (this.speed * dt) / 1000;
    let ix = 0, iy = 0;
    if (this.keys.A.isDown) ix -= 1;
    if (this.keys.D.isDown) ix += 1;
    if (this.keys.W.isDown) iy -= 1;
    if (this.keys.S.isDown) iy += 1;
    if (ix && iy) { const inv = 1 / Math.sqrt(2); ix *= inv; iy *= inv; }
    const dx = ix * step, dy = iy * step;
    if (dx || dy) {
      this.player.lastDir = { x: Math.sign(dx), y: Math.sign(dy) };
      this._faceSnoopy(this.player, this.player.lastDir, true);   // walk
    } else if (this.player._moving) {
      this._faceSnoopy(this.player, this.player.lastDir, false);  // idle
    }
    this.player._moving = !!(dx || dy);
    // Per-axis AABB collision with a "corner nudge" assist. Each axis moves only
    // if the player's body box wouldn't overlap a blocked tile. If an axis is
    // blocked, we try nudging a few px along the OTHER axis so the player slips
    // past a protruding corner / threads a tight gap instead of dead-stopping on
    // an "invisible" edge. This is what makes narrow crosswalk gaps feel smooth.
    if (dx) this._moveAxis("x", dx);
    if (dy) this._moveAxis("y", dy);
    this._softGateBlock();   // soft story gates (nudge back if a gate isn't open yet)

    const tx = Math.floor(this.player.x / TILE), ty = Math.floor(this.player.y / TILE);
    let near = null;
    for (const key in ENCOUNTERS) {
      const e = ENCOUNTERS[key];
      // Proximity is measured against the marker's VISIBLE tile (after MARKER_TWEAKS), so the
      // "SPACE to look" prompt appears when the player is next to the envelope she sees.
      const pos = this.markerTile[e.id] || this.encPos[e.id];
      if (!pos || (e.once && this.completed.has(e.id))) continue;
      if (Math.abs(pos.x - tx) <= 1 && Math.abs(pos.y - ty) <= 1) { near = e; break; }
    }
    this.activeEncounter = near;
    if (near && !this.runner.running) {
      this._showPrompt("SPACE to open");
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) { this._hidePrompt(); this.runner.play(near); }
    } else if (!this.runner.running) {
      this._hidePrompt();
    }

    this._updateWayfinder();
    this._updateNpcEmotes();
  }
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
