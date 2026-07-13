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

  // Peek from a random edge. Returns a Promise that resolves when he's ducked
  // back out. `side` can be forced (0=bottom,1=top,2=left,3=right); default random.
  peek(side = null) {
    if (this.busy || !this.el) return Promise.resolve();
    this.busy = true;
    const el = this.el;
    const vw = window.innerWidth, vh = window.innerHeight;
    const h = SIZE;
    const half = h / 2;
    const inn = h * PEEK_IN; // how far the sprite's near edge pokes past the screen edge

    if (side == null) side = Math.floor(Math.random() * 4);
    const alongX = Math.round(vw * (0.15 + Math.random() * 0.7));
    const alongY = Math.round(vh * (0.15 + Math.random() * 0.7));

    // Position by CENTER (transform-origin is center). Rotate so the FLAT side
    // (the art's bottom) faces the chosen edge; CSS rotation is clockwise.
    //   bottom edge -> flat down   ->   0deg
    //   top edge    -> flat up     -> 180deg
    //   left edge   -> flat left   ->  90deg (bottom rotated CW points left)
    //   right edge  -> flat right  -> -90deg
    let rot, hiddenC, shownC; // center points [x,y]
    if (side === 0) {            // BOTTOM edge, peek UP
      rot = 0;
      hiddenC = [alongX, vh + half];
      shownC = [alongX, vh + half - inn];
    } else if (side === 1) {     // TOP edge, peek DOWN
      rot = 180;
      hiddenC = [alongX, -half];
      shownC = [alongX, -half + inn];
    } else if (side === 2) {     // LEFT edge, peek RIGHT
      rot = 90;
      hiddenC = [-half, alongY];
      shownC = [-half + inn, alongY];
    } else {                     // RIGHT edge, peek LEFT
      rot = -90;
      hiddenC = [vw + half, alongY];
      shownC = [vw + half - inn, alongY];
    }

    // translate() moves the top-left; convert center -> top-left (subtract half).
    const place = (c) => {
      el.style.transform = `translate(${c[0] - half}px, ${c[1] - half}px) rotate(${rot}deg)`;
    };
    const hidden = hiddenC, shown = shownC;

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
}
