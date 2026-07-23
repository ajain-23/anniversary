// Wayfinder — a gentle edge-of-screen arrow that points toward the next destination, so the
// semi-open world never leaves her lost. DOM overlay (screen pixels, zoom-immune) like the
// cursor / PeekKirby. The world scene tells it, each frame, the target's SCREEN position; the
// arrow parks at the screen edge on the line from center → target, rotated to point at it.
//
// It hides itself when the target is comfortably ON-SCREEN (she can see the marker), and the
// world scene also hides it during dialogue / when there's no target left.

const EDGE_INSET = 54;      // px from the screen edge the arrow sits
const ONSCREEN_MARGIN = 90; // if the target is within the viewport minus this margin, hide it
const SIZE = 34;            // arrow box size (px)

export class Wayfinder {
  constructor() {
    this.el = null;
    this.visible = false;
    // While the intro flourish is animating we suspend per-frame pointTo so the CSS
    // transition isn't stomped every tick. Cleared when the glide finishes.
    this.suspended = false;
  }

  init() {
    if (this.el) return;
    // Reuse a single #wayfinder element across scene restarts (each WorldScene makes a new
    // Wayfinder instance) so we never orphan / duplicate the DOM node.
    let el = document.getElementById("wayfinder");
    if (!el) {
      el = document.createElement("div");
      el.id = "wayfinder";
      el.innerHTML =
        `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 24 24" aria-hidden="true">` +
        `<path d="M12 3 L20 19 L12 15 L4 19 Z" fill="currentColor"/></svg>`;
      document.body.appendChild(el);
    }
    this.el = el;
    this.hide();
  }

  hide() {
    if (!this.el || !this.visible) { if (this.el) this.el.style.opacity = "0"; this.visible = false; return; }
    this.visible = false;
    this.el.style.opacity = "0";
  }

  // Compute the resting EDGE placement (top-left px + rotation deg) for a target at screen
  // coords (sx, sy). Shared by pointTo (per-frame) and the intro flourish (glide target).
  _edgePlacement(sx, sy) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const cx = vw / 2, cy = vh / 2;
    const dx = sx - cx, dy = sy - cy;
    const angle = Math.atan2(dy, dx); // radians; 0 = pointing right
    const halfW = cx - EDGE_INSET, halfH = cy - EDGE_INSET;
    const scale = Math.min(
      halfW / Math.max(Math.abs(Math.cos(angle)), 1e-4),
      halfH / Math.max(Math.abs(Math.sin(angle)), 1e-4)
    );
    const px = cx + Math.cos(angle) * scale;
    const py = cy + Math.sin(angle) * scale;
    // SVG points UP by default (0,-1). Rotate so its tip follows `angle` (add 90°).
    const deg = (angle * 180) / Math.PI + 90;
    return { left: px - SIZE / 2, top: py - SIZE / 2, deg, angle, cx, cy };
  }

  // Point toward a target at SCREEN coords (sx, sy). If the target is already comfortably on
  // screen, hide instead. Called every frame by the world scene with the current target.
  pointTo(sx, sy) {
    if (!this.el || this.suspended) return;
    const vw = window.innerWidth, vh = window.innerHeight;

    // On screen (with margin)? Then no arrow needed — she can see it.
    if (sx > ONSCREEN_MARGIN && sx < vw - ONSCREEN_MARGIN &&
        sy > ONSCREEN_MARGIN && sy < vh - ONSCREEN_MARGIN) {
      this.hide();
      return;
    }

    const { left, top, deg } = this._edgePlacement(sx, sy);
    this.el.style.transform = `translate(${left}px, ${top}px) rotate(${deg}deg)`;
    if (!this.visible) { this.visible = true; this.el.style.opacity = "1"; }
  }

  // One-time intro flourish: the arrow appears BIG at screen center (pointing toward the first
  // target), pulses for a beat to draw the eye, then smoothly glides out to its resting edge
  // position at normal size — "here's your guide, and it lives over here." Resolves when done,
  // after which normal per-frame pointTo resumes. Falls back gracefully if the target is
  // already on-screen (still does the center intro, then just hides).
  introFlourish(sx, sy) {
    return new Promise((resolve) => {
      if (!this.el) { resolve(); return; }
      this.suspended = true;
      const el = this.el;
      const { left, top, deg, cx, cy } = this._edgePlacement(sx, sy);

      // Start: centered, oversized, already rotated toward the target. No transform transition
      // yet (snap into place), fade in via the existing opacity transition.
      const CENTER_SCALE = 2.6;
      const centerLeft = cx - SIZE / 2, centerTop = cy - SIZE / 2;
      el.style.transition = "opacity .35s ease";
      el.style.transform =
        `translate(${centerLeft}px, ${centerTop}px) rotate(${deg}deg) scale(${CENTER_SCALE})`;
      this.visible = true;
      // Force a reflow so the starting transform is committed before we enable the glide.
      void el.offsetWidth;
      el.style.opacity = "1";
      el.classList.add("flourish"); // bigger pulse glow during the intro (see ui.css)

      const HOLD_MS = 750;   // attention beat at center
      const GLIDE_MS = 950;  // travel out to the edge

      setTimeout(() => {
        // Enable a one-off transform transition, then set the resting edge target + normal scale.
        el.style.transition = `transform ${GLIDE_MS}ms cubic-bezier(.34,.01,.24,1), opacity .35s ease`;
        el.style.transform = `translate(${left}px, ${top}px) rotate(${deg}deg) scale(1)`;
        setTimeout(() => {
          // Done: strip the transform transition so per-frame tracking stays instant again.
          el.classList.remove("flourish");
          el.style.transition = "opacity .35s ease";
          this.suspended = false;
          resolve();
        }, GLIDE_MS + 30);
      }, HOLD_MS);
    });
  }
}
