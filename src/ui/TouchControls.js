// TouchControls — makes the game playable on a phone / iPad.
//
// The whole game is otherwise desktop/keyboard-only (WASD move, SPACE/ENTER
// advance & interact, TAB album, ESC close, ← → browse). Rendering already scales
// fine on touch; the ONLY thing missing is input. This module layers touch input
// ON TOP of the existing keyboard controls without disturbing them, so both work
// (nice for touchscreen laptops too).
//
// It is a DOM overlay (like CursorTrail / PeekKirby / Wayfinder) so it lives in
// real screen pixels above the Phaser canvas + all HTML overlays, and is immune to
// the world camera zoom/scroll.
//
// What it provides:
//   • a fixed bottom-LEFT virtual joystick → getMove() = {x,y} in [-1..1], read by
//     WorldScene.update() alongside WASD.
//   • tap-based "confirm", with TWO channels on purpose:
//       - onConfirm(cb): event-style, fired by a tap anywhere on a full-screen
//         overlay (dialogue / reveal / letter / end). Mirrors "a SPACE/ENTER keydown
//         happened". Returns an unsubscribe fn.
//       - armConfirm() + consumeConfirm(): poll one-shot. WorldScene makes the
//         floating "tap to open / tap to <verb>" prompt tappable and calls armConfirm()
//         on that tap; its update loop then consumeConfirm()s it. A stray tap on the
//         world never fires an encounter — only tapping the prompt does.
//
// Everything only mounts once a genuine touch is detected (or a coarse pointer is
// the primary input), so desktop is visually unchanged.

const DEADZONE = 0.18;     // fraction of the stick radius ignored (prevents drift)
const STICK_RADIUS = 56;   // px, how far the knob travels from the base center

export class TouchControls {
  constructor() {
    this.active = false;         // true once touch controls are mounted
    this._move = { x: 0, y: 0 }; // current normalized joystick vector
    this._confirmSubs = new Set();
    this._confirmPending = false; // one-shot flag for consumeConfirm()
    this._stickId = null;         // active pointerId owning the joystick
    this._layer = null;
    this._built = false;
    this._onGlobalPointerDown = this._onGlobalPointerDown.bind(this);
  }

  init() {
    // Coarse pointer (phone/tablet) → mount immediately. Otherwise wait for the
    // first genuine touch event before mounting, so a plain desktop never sees the
    // overlay but a touchscreen laptop still gets it the moment a finger is used.
    const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (coarse) {
      this._enable();
    } else {
      window.addEventListener("pointerdown", this._onGlobalPointerDown, { passive: true });
    }
  }

  _onGlobalPointerDown(e) {
    if (e.pointerType === "touch") {
      window.removeEventListener("pointerdown", this._onGlobalPointerDown);
      this._enable();
    }
  }

  _enable() {
    if (this.active) return;
    this.active = true;
    document.body.classList.add("touch-mode");
    this._build();
    this._applyTouchCopy();
  }

  // Swap keyboard-centric on-screen hints for touch equivalents. These are static DOM
  // strings in index.html; the intro line (spoken via dialogue) is branched in
  // WorldScene against `touch.active`. Guarded so a missing element is a no-op.
  _applyTouchCopy() {
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    set("album-toggle", "album");
    set("dialogue-hint", "tap");
    set("memory-hint", "tap to keep walking");
    set("album-hint", "tap a photo · ✕ to close");
    set("lightbox-hint", "‹ › to browse · ✕ to close");
    set("letter-hint", "tap to close");
    const sub = document.querySelector(".the-end-sub");
    if (sub) sub.textContent = "tap to return";
  }

  // ---- public API ----------------------------------------------------------

  // Current joystick vector, {x,y} each in [-1..1]. {0,0} when the stick is idle.
  getMove() { return this._move; }

  // Subscribe to "confirm" (a tap on the action button OR a tap anywhere that isn't
  // on a control). Returns an unsubscribe function. Use for screens that otherwise
  // wait on a SPACE/ENTER keydown (dialogue, memory reveal, letter, end screen).
  onConfirm(cb) {
    this._confirmSubs.add(cb);
    return () => this._confirmSubs.delete(cb);
  }

  // Arm the poll one-shot (called when the floating prompt is tapped).
  armConfirm() { this._confirmPending = true; }

  // Poll-style one-shot: true exactly once after armConfirm(), then resets. Used by
  // WorldScene's poll-based verb prompt + encounter trigger (armed only by tapping
  // the prompt, so a stray world tap can't fire an encounter).
  consumeConfirm() {
    if (this._confirmPending) { this._confirmPending = false; return true; }
    return false;
  }

  // ---- internals -----------------------------------------------------------

  // Notify the confirm subscribers (the currently-shown overlay's advance/dismiss).
  // Fired by tap-anywhere; does NOT arm the poll one-shot (that's armConfirm(), tied
  // to tapping the prompt) so a stray world tap can't fire an encounter.
  _fireConfirm() {
    for (const cb of [...this._confirmSubs]) { try { cb(); } catch {} }
  }

  _build() {
    if (this._built) return;
    this._built = true;

    const layer = document.createElement("div");
    layer.id = "touch-layer";
    this._layer = layer;

    // --- Joystick (bottom-left) ---
    const stick = document.createElement("div");
    stick.id = "touch-stick";
    const base = document.createElement("div");
    base.id = "touch-stick-base";
    const knob = document.createElement("div");
    knob.id = "touch-stick-knob";
    stick.appendChild(base);
    stick.appendChild(knob);
    layer.appendChild(stick);
    this._stick = stick; this._knob = knob;

    document.body.appendChild(layer);

    this._wireJoystick();
    this._wireTapAnywhere();
  }

  _wireJoystick() {
    const stick = this._stick;
    // Center of the stick base, recomputed on each touch-down (it's fixed, but
    // reading it live keeps it correct across resizes / orientation changes).
    let cx = 0, cy = 0;

    const setKnob = (dx, dy) => {
      this._knob.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
    };
    const reset = () => {
      this._move = { x: 0, y: 0 };
      this._stickId = null;
      setKnob(0, 0);
      stick.classList.remove("active");
    };

    const onDown = (e) => {
      if (this._stickId !== null) return;
      this._stickId = e.pointerId;
      const r = stick.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      stick.classList.add("active");
      stick.setPointerCapture?.(e.pointerId);
      onMove(e);
    };
    const onMove = (e) => {
      if (e.pointerId !== this._stickId) return;
      let dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const max = STICK_RADIUS;
      // Clamp knob travel to the ring; normalize the reported vector by the ring.
      const clamped = Math.min(dist, max);
      const ang = Math.atan2(dy, dx);
      const kx = Math.cos(ang) * clamped, ky = Math.sin(ang) * clamped;
      setKnob(kx, ky);
      let nx = kx / max, ny = ky / max;
      if (Math.hypot(nx, ny) < DEADZONE) { nx = 0; ny = 0; }
      this._move = { x: nx, y: ny };
    };
    const onUp = (e) => {
      if (e.pointerId !== this._stickId) return;
      reset();
    };

    stick.addEventListener("pointerdown", onDown, { passive: true });
    // Listen for move/up on the window so a finger sliding off the base still tracks.
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
  }

  // Tap anywhere = notify confirm subscribers (only the currently-shown screen has
  // one), UNLESS the tap lands on a control that manages its own taps (joystick,
  // action button, album/lightbox + their buttons, HUD, mute). This lets a tap
  // ANYWHERE — including the bare world above the dialogue box — advance the current
  // dialogue/reveal/letter/end, while a world tap with no screen up is harmless (no
  // subscriber) and never fires an encounter (that's the action button's job).
  _wireTapAnywhere() {
    document.addEventListener("pointerdown", (e) => {
      if (!this.active || e.pointerType !== "touch") return;
      if (this._isControlTarget(e.target)) return;
      this._fireConfirm();
    }, { passive: true });
  }

  // True if the pointer target is (inside) an element that manages its own taps, so
  // tap-anywhere should ignore it. #verb-prompt is excluded because it arms the poll
  // one-shot (armConfirm) itself — tap-anywhere must not ALSO notify subscribers.
  _isControlTarget(el) {
    if (!el || !el.closest) return false;
    return !!el.closest(
      "#touch-stick, #verb-prompt, #album, #lightbox, .touch-ui-btn, " +
      "#hud-left, #mute-toggle, #end-frame"
    );
  }
}
