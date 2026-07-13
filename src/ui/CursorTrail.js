// CursorTrail — a global custom cursor (calla lily) with a falling-leaf trail.
//
// Pure DOM overlay so it sits above EVERYTHING (Phaser canvas + all HTML UI
// overlays: dialogue, album, letter, end screen) uniformly, regardless of which
// scene is active. The native cursor is hidden via CSS (see ui.css); this draws
// the lily where the pointer is and drips small leaves that fade + fall as the
// pointer moves.
//
// Assets (in public/assets/sprites/): lily.png (cursor), leaf.png (trail, drawn
// smaller). Pointer-events:none on the whole layer so it never eats clicks.

const LILY_SRC = "assets/sprites/lily.png";
const LEAF_SRC = "assets/sprites/leaf.png";

const CURSOR_SIZE = 30; // px, on-screen size of the lily cursor
const LEAF_SIZE = 15; // px, leaves are the "smaller" sprite
const SPAWN_MIN_DIST = 14; // px of pointer travel between leaf spawns
const LEAF_LIFETIME = 900; // ms for a leaf to fade + fall
const LEAF_FALL = 34; // px a leaf drifts down over its life
const POOL_SIZE = 24; // reused leaf elements (cheap, no churn)

export class CursorTrail {
  constructor() {
    this.enabled = false;
    this.layer = null;
    this.cursorEl = null;
    this.leaves = [];
    this.poolIdx = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.lastSpawnX = 0;
    this.lastSpawnY = 0;
    this.hasMoved = false;
    this._onMove = this._onMove.bind(this);
    this._onLeave = this._onLeave.bind(this);
    this._onEnter = this._onEnter.bind(this);
    this._onDown = this._onDown.bind(this);
  }

  init() {
    if (this.layer) return;

    const layer = document.createElement("div");
    layer.id = "cursor-layer";
    this.layer = layer;

    const cursor = document.createElement("img");
    cursor.id = "cursor-lily";
    cursor.src = LILY_SRC;
    cursor.alt = "";
    cursor.draggable = false;
    cursor.style.width = CURSOR_SIZE + "px";
    cursor.style.height = CURSOR_SIZE + "px";
    this.cursorEl = cursor;
    layer.appendChild(cursor);

    // Pre-build a small pool of leaf elements we recycle.
    for (let i = 0; i < POOL_SIZE; i++) {
      const leaf = document.createElement("img");
      leaf.className = "cursor-leaf";
      leaf.src = LEAF_SRC;
      leaf.alt = "";
      leaf.draggable = false;
      leaf.style.width = LEAF_SIZE + "px";
      leaf.style.height = LEAF_SIZE + "px";
      layer.appendChild(leaf);
      this.leaves.push(leaf);
    }

    document.body.appendChild(layer);

    // Enable for mouse users. We enable by default (covers desktops, incl.
    // hybrid touch-laptops that misreport as coarse) but bail out the moment we
    // see a genuine touch interaction, since a floating lily is just noise there.
    this.enable();
    window.addEventListener(
      "pointerdown",
      (e) => { if (e.pointerType === "touch") this.disable(); },
      { passive: true }
    );
  }

  enable() {
    if (this.enabled) return;
    this.enabled = true;
    document.body.classList.add("lily-cursor");
    window.addEventListener("pointermove", this._onMove, { passive: true });
    window.addEventListener("pointerdown", this._onDown, { passive: true });
    document.addEventListener("mouseleave", this._onLeave);
    document.addEventListener("mouseenter", this._onEnter);
  }

  disable() {
    if (!this.enabled) return;
    this.enabled = false;
    document.body.classList.remove("lily-cursor");
    window.removeEventListener("pointermove", this._onMove);
    window.removeEventListener("pointerdown", this._onDown);
    document.removeEventListener("mouseleave", this._onLeave);
    document.removeEventListener("mouseenter", this._onEnter);
    if (this.layer) this.layer.style.opacity = "0";
  }

  _onEnter() {
    if (this.layer) this.layer.style.opacity = "1";
  }

  _onLeave() {
    if (this.layer) this.layer.style.opacity = "0";
  }

  _onMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    this.lastX = x;
    this.lastY = y;

    if (!this.hasMoved) {
      // First real movement: place cursor + prime spawn point without a burst.
      this.hasMoved = true;
      this.lastSpawnX = x;
      this.lastSpawnY = y;
      if (this.layer) this.layer.style.opacity = "1";
    }

    // Move the lily (offset so the flower head sits at the tip, not centered).
    this.cursorEl.style.transform =
      `translate(${x - CURSOR_SIZE * 0.28}px, ${y - CURSOR_SIZE * 0.28}px)`;

    // Spawn a leaf once the pointer has traveled far enough.
    const dx = x - this.lastSpawnX;
    const dy = y - this.lastSpawnY;
    if (dx * dx + dy * dy >= SPAWN_MIN_DIST * SPAWN_MIN_DIST) {
      this.lastSpawnX = x;
      this.lastSpawnY = y;
      this._spawnLeaf(x, y);
    }
  }

  _onDown() {
    // A little flourish on click: drop a couple of leaves where you clicked.
    if (!this.enabled) return;
    this._spawnLeaf(this.lastX, this.lastY);
    this._spawnLeaf(this.lastX, this.lastY);
  }

  _spawnLeaf(x, y) {
    const leaf = this.leaves[this.poolIdx];
    this.poolIdx = (this.poolIdx + 1) % this.leaves.length;

    // Randomize a touch so the trail feels organic, not a rigid line.
    const jx = (Math.random() - 0.5) * 10;
    const jy = (Math.random() - 0.5) * 10;
    const rot = (Math.random() - 0.5) * 120;
    const drift = (Math.random() - 0.5) * 24; // horizontal sway as it falls
    const startX = x + jx - LEAF_SIZE / 2;
    const startY = y + jy - LEAF_SIZE / 2;

    // Reset (kill any in-flight animation) then start a fresh fall+fade.
    leaf.style.transition = "none";
    leaf.style.opacity = "0.95";
    leaf.style.transform = `translate(${startX}px, ${startY}px) rotate(${rot}deg) scale(1)`;

    // Force reflow so the transition below actually runs from the reset state.
    void leaf.offsetWidth;

    leaf.style.transition =
      `transform ${LEAF_LIFETIME}ms cubic-bezier(0.33, 0, 0.4, 1), ` +
      `opacity ${LEAF_LIFETIME}ms ease-in`;
    leaf.style.opacity = "0";
    leaf.style.transform =
      `translate(${startX + drift}px, ${startY + LEAF_FALL}px) ` +
      `rotate(${rot + (Math.random() - 0.5) * 80}deg) scale(0.7)`;
  }
}
