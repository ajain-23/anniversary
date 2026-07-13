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

  // Point toward a target at SCREEN coords (sx, sy). If the target is already comfortably on
  // screen, hide instead. Called every frame by the world scene with the current target.
  pointTo(sx, sy) {
    if (!this.el) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const cx = vw / 2, cy = vh / 2;

    // On screen (with margin)? Then no arrow needed — she can see it.
    if (sx > ONSCREEN_MARGIN && sx < vw - ONSCREEN_MARGIN &&
        sy > ONSCREEN_MARGIN && sy < vh - ONSCREEN_MARGIN) {
      this.hide();
      return;
    }

    // Direction from center to target.
    const dx = sx - cx, dy = sy - cy;
    const angle = Math.atan2(dy, dx); // radians; 0 = pointing right

    // Park the arrow on the viewport edge (inset), along that direction. Clamp to the inner
    // rectangle so it rides the border toward the target.
    const halfW = cx - EDGE_INSET, halfH = cy - EDGE_INSET;
    // scale the unit direction out to the edge rectangle
    const scale = Math.min(
      halfW / Math.max(Math.abs(Math.cos(angle)), 1e-4),
      halfH / Math.max(Math.abs(Math.sin(angle)), 1e-4)
    );
    const px = cx + Math.cos(angle) * scale;
    const py = cy + Math.sin(angle) * scale;

    // SVG points UP by default (0,-1). Rotate so its tip follows `angle` (add 90°).
    const deg = (angle * 180) / Math.PI + 90;
    this.el.style.transform =
      `translate(${px - SIZE / 2}px, ${py - SIZE / 2}px) rotate(${deg}deg)`;
    if (!this.visible) { this.visible = true; this.el.style.opacity = "1"; }
  }
}
