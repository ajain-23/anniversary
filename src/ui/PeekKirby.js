// PeekKirby — the "secret Kirby" that peeks partway in from a random screen edge,
// holds, then ducks back out. Implemented as a DOM overlay (not a Phaser sprite)
// so it's in real SCREEN pixels and immune to the world camera's zoom/scroll —
// a camera-fixed Phaser sprite is still scaled by camera zoom, which put it in
// the wrong place. The sprite art has one FLAT side (its bottom), so we rotate it
// to face whichever edge it peeks from.

const SRC = "assets/sprites/secretkirby.png";
const SIZE = 120;      // on-screen box size (px). Forced square so 90° rotations line up.
const PEEK_IN = 0.82;  // fraction of the sprite that poked past the edge is VISIBLE
const SLIDE_MS = 520;
const OUT_MS = 380;

export class PeekKirby {
  constructor() {
    this.el = null;
    this.busy = false;
  }

  init() {
    if (this.el) return;
    const el = document.createElement("img");
    el.id = "peek-kirby";
    el.src = SRC;
    el.alt = "";
    el.draggable = false;
    // Square box + centered transform-origin so the 4 rotations stay symmetric.
    el.style.width = SIZE + "px";
    el.style.height = SIZE + "px";
    el.style.objectFit = "contain";
    el.style.transformOrigin = "center center";
    document.body.appendChild(el);
    this.el = el;
  }

  isBusy() { return this.busy; }

  // Compute the geometry for a peek from `side` (random if null): the hidden +
  // shown CENTER points, the rotation, and a `place(center)` helper. Shared by the
  // auto-retract peek() and the hold/retract pair.
  _placement(side) {
    const el = this.el;
    const vw = window.innerWidth, vh = window.innerHeight;
    const half = SIZE / 2;
    const inn = SIZE * PEEK_IN; // how far the sprite's near edge pokes past the edge

    if (side == null) side = Math.floor(Math.random() * 4);
    const alongX = Math.round(vw * (0.15 + Math.random() * 0.7));
    const alongY = Math.round(vh * (0.15 + Math.random() * 0.7));

    // Position by CENTER (transform-origin is center). Rotate so the FLAT side
    // (the art's bottom) faces the chosen edge; CSS rotation is clockwise.
    let rot, hidden, shown;
    if (side === 0) {            // BOTTOM edge, peek UP
      rot = 0;   hidden = [alongX, vh + half];      shown = [alongX, vh + half - inn];
    } else if (side === 1) {     // TOP edge, peek DOWN
      rot = 180; hidden = [alongX, -half];          shown = [alongX, -half + inn];
    } else if (side === 2) {     // LEFT edge, peek RIGHT
      rot = 90;  hidden = [-half, alongY];          shown = [-half + inn, alongY];
    } else {                     // RIGHT edge, peek LEFT
      rot = -90; hidden = [vw + half, alongY];      shown = [vw + half - inn, alongY];
    }

    // translate() moves the top-left; convert center -> top-left (subtract half).
    const place = (c) => {
      el.style.transform = `translate(${c[0] - half}px, ${c[1] - half}px) rotate(${rot}deg)`;
    };
    return { hidden, shown, place };
  }

  // Peek from a random edge, hold briefly, auto-retract. Returns a Promise that
  // resolves once he's ducked back out. `side` can be forced (0=bottom,1=top,
  // 2=left,3=right); default random.
  peek(side = null) {
    if (this.busy || !this.el) return Promise.resolve();
    this.busy = true;
    const el = this.el;
    const { hidden, shown, place } = this._placement(side);

    // Reset to hidden instantly, then slide in.
    el.style.transition = "none";
    place(hidden);
    el.style.opacity = "1";
    el.style.visibility = "visible";
    void el.offsetWidth; // reflow so the next transition runs

    return new Promise((resolve) => {
      el.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(0.2,0.9,0.3,1.3)`;
      place(shown);
      const hold = 700 + Math.random() * 500;
      setTimeout(() => {
        el.style.transition = `transform ${OUT_MS}ms ease-in`;
        place(hidden);
        setTimeout(() => {
          el.style.visibility = "hidden";
          this.busy = false;
          resolve();
        }, OUT_MS);
      }, SLIDE_MS + hold);
    });
  }

  // Peek in and STAY (no auto-retract) so a line can be read alongside him. Resolves
  // once he's fully slid in. Call retract() to slide him back out. Used for the first
  // (line-carrying) peek so she doesn't miss him.
  peekAndHold(side = null) {
    if (this.busy || !this.el) return Promise.resolve();
    this.busy = true;
    const el = this.el;
    const { hidden, shown, place } = this._placement(side);
    this._heldHidden = hidden; this._heldPlace = place; // remembered for retract()

    el.style.transition = "none";
    place(hidden);
    el.style.opacity = "1";
    el.style.visibility = "visible";
    void el.offsetWidth;

    return new Promise((resolve) => {
      el.style.transition = `transform ${SLIDE_MS}ms cubic-bezier(0.2,0.9,0.3,1.3)`;
      place(shown);
      setTimeout(resolve, SLIDE_MS);
    });
  }

  // Slide a held Kirby back out. Resolves once he's gone. No-op if not held.
  retract() {
    const el = this.el;
    if (!el || !this._heldPlace) { this.busy = false; return Promise.resolve(); }
    const place = this._heldPlace, hidden = this._heldHidden;
    return new Promise((resolve) => {
      el.style.transition = `transform ${OUT_MS}ms ease-in`;
      place(hidden);
      setTimeout(() => {
        el.style.visibility = "hidden";
        this._heldPlace = null; this._heldHidden = null;
        this.busy = false;
        resolve();
      }, OUT_MS);
    });
  }
}
