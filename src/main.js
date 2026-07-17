import Phaser from "phaser";
import "./ui/ui.css";
import { WorldScene } from "./scenes/WorldScene.js";
import { TitleScene } from "./scenes/TitleScene.js";
import { DialogueManager } from "./ui/DialogueManager.js";
import { MemoryAlbum } from "./ui/MemoryAlbum.js";
import { LetterUI } from "./ui/LetterUI.js";
import { AudioManager } from "./ui/AudioManager.js";
import { CursorTrail } from "./ui/CursorTrail.js";
import { PeekKirby } from "./ui/PeekKirby.js";
import { DebugMode } from "./ui/DebugMode.js";
import { TouchControls } from "./ui/TouchControls.js";

// Custom lily cursor + falling-leaf trail, global across all scenes/UI.
const cursorTrail = new CursorTrail();
cursorTrail.init();

// Secret-Kirby peek overlay (DOM, zoom-immune).
const peek = new PeekKirby();
peek.init();

// Touch controls (virtual joystick + action button + tap-to-confirm). Only mounts
// its overlay once a touch / coarse-pointer device is detected; desktop unchanged.
const touch = new TouchControls();
touch.init();

const dialogue = new DialogueManager();
const album = new MemoryAlbum();
const letter = new LetterUI();

// Wire touch-confirm into the DOM-overlay UIs (dialogue advance, memory reveal
// dismiss, letter close). WorldScene reads `touch` from deps for movement + the
// encounter trigger + verb prompt.
dialogue.touch = touch;
album.touch = touch;
letter.touch = touch;

const deps = {
  dialogue,
  album,
  letter,
  audio: new AudioManager(),
  peek,
  touch,
};

const config = {
  type: Phaser.AUTO,
  parent: "game-canvas",
  pixelArt: true,
  backgroundColor: "#0c0b12",
  scale: {
    // RESIZE: the canvas becomes the full size of its parent (the window), so
    // there's no letterboxing. Scenes read this.scale.width/height and reflow on
    // the "resize" event (see TitleScene._layout / WorldScene resize handler).
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [TitleScene, WorldScene],
};

const game = new Phaser.Game(config);
game.scene.start("title", deps);

// Reveal the app (fade in #game-root) only once the game has booted + rendered a
// frame, so the raw DOM-overlay HTML never flashes before CSS/JS are ready. See
// the critical inline CSS in index.html.
const markReady = () => {
  requestAnimationFrame(() => document.documentElement.classList.add("ready"));
};
game.isBooted ? markReady() : game.events.once("ready", markReady);

// Dev-only handle for tooling/screenshots (harmless in prod; no UI effect).
if (typeof window !== "undefined") window.__GAME__ = game;

// Debug mode (dev tools): OFF by default; toggle with the backtick key ( ` ).
// Provides the tile-under-cursor HUD + an encounter-replay panel. See src/ui/DebugMode.js.
const debug = new DebugMode(game);
debug.init();
