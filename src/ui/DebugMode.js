// DebugMode — a single gated home for all dev tools. OFF by default.
//
// Toggle with the backtick key ( ` ). When ON it shows:
//   • Tile HUD  — the world TILE + pixel under the cursor, and whether it's blocked
//                 (for placing markers/props by eye; coords match the game's tile space).
//   • Replay panel — a button per encounter id; click to replay it without walking there
//                 (also callable from the console via __GAME__.scene.getScene("world").replay(id)).
//
// Reads live state off window.__GAME__ so it stays decoupled from the scenes. Nothing here
// affects normal play unless debug mode is toggled on.
const TILE = 16;

export class DebugMode {
  constructor(game) {
    this.game = game;
    this.on = false;
    this.root = null;
    this.hud = null;
    this.panel = null;
    this._builtPanelFor = null; // remembers which id-set the panel was built for
  }

  init() {
    // Toggle key. Backquote/Backtick. Ignore when typing in an input (none in-game, but safe).
    window.addEventListener("keydown", (e) => {
      if (e.code === "Backquote") {
        const t = e.target;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
        e.preventDefault();
        this.toggle();
      }
    });
    // Cursor → tile HUD (only updates when visible).
    window.addEventListener("pointermove", (e) => this._onPointerMove(e), { passive: true });
  }

  toggle() { this.on ? this.disable() : this.enable(); }

  enable() {
    this.on = true;
    this._ensureUI();
    this.root.style.display = "block";
    this._buildPanel();
  }

  disable() {
    this.on = false;
    if (this.root) this.root.style.display = "none";
  }

  // ---- UI construction (lazy) ----
  _ensureUI() {
    if (this.root) return;
    const root = document.createElement("div");
    root.id = "debug-root";
    // z-index 9000: above all game UI (max ~70) but BELOW the custom cursor layer (9999)
    // so the lily cursor always draws on top of the debug overlay.
    root.style.cssText = "position:fixed;inset:0;z-index:9000;pointer-events:none;" +
      "font:12px/1.4 ui-monospace,monospace;color:#fff;";

    // Tile HUD (bottom-left).
    const hud = document.createElement("div");
    hud.id = "debug-hud";
    hud.style.cssText =
      "position:absolute;left:8px;bottom:8px;background:rgba(10,8,16,.82);" +
      "padding:6px 9px;border-radius:8px;white-space:pre;letter-spacing:.5px;";
    hud.textContent = "tile: —";

    // Replay panel (bottom-right, mirroring the tile HUD at bottom-left).
    const panel = document.createElement("div");
    panel.id = "debug-panel";
    panel.style.cssText =
      "position:absolute;right:8px;bottom:8px;max-width:190px;background:rgba(10,8,16,.86);" +
      "padding:8px 10px;border-radius:10px;pointer-events:auto;";

    root.appendChild(hud);
    root.appendChild(panel);
    (document.body || document.documentElement).appendChild(root);
    this.root = root; this.hud = hud; this.panel = panel;
  }

  _world() {
    const w = this.game.scene.getScene("world");
    return (w && w.scene.isActive("world")) ? w : null;
  }

  _buildPanel() {
    const w = this._world();
    if (!w || !w.encounterIds) {
      this.panel.innerHTML =
        `<div style="opacity:.7;margin-bottom:6px">DEBUG (\` to close )</div>` +
        `<div style="opacity:.6">start a game to enable replay</div>`;
      this._builtPanelFor = null;
      return;
    }
    const ids = w.encounterIds();
    const sig = ids.join(",");
    if (this._builtPanelFor === sig) return; // already built for this set
    this._builtPanelFor = sig;

    this.panel.innerHTML = `<div style="opacity:.7;margin-bottom:6px">DEBUG (\` to close)</div>`;

    // --- Walk speed slider (drives world.speed live; px/s) ---
    const speedWrap = document.createElement("div");
    speedWrap.style.cssText = "margin-bottom:8px;";
    const cur = Math.round(w.speed ?? 160);
    const label = document.createElement("div");
    label.style.cssText = "opacity:.8;margin-bottom:3px;";
    label.textContent = `walk speed: ${cur}`;
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "60"; slider.max = "220"; slider.step = "5"; slider.value = String(cur);
    slider.style.cssText = "width:100%;pointer-events:auto;cursor:pointer;";
    slider.addEventListener("input", () => {
      const world = this._world();
      const v = Number(slider.value);
      if (world) world.speed = v;
      label.textContent = `walk speed: ${v}`;
    });
    speedWrap.appendChild(label);
    speedWrap.appendChild(slider);
    this.panel.appendChild(speedWrap);

    // --- Encounter replay buttons ---
    const replayLabel = document.createElement("div");
    replayLabel.style.cssText = "opacity:.7;margin-bottom:4px;";
    replayLabel.textContent = "replay:";
    this.panel.appendChild(replayLabel);
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:4px;";
    for (const id of ids) {
      const b = document.createElement("button");
      b.textContent = id;
      b.className = "debug-btn";
      b.addEventListener("click", () => {
        const world = this._world();
        if (world && world.replay) world.replay(id);
      });
      wrap.appendChild(b);
    }
    this.panel.appendChild(wrap);
  }

  _onPointerMove(e) {
    if (!this.on || !this.hud) return;
    const w = this._world();
    if (!w || !w.cameras || !w.cameras.main) { this.hud.textContent = "tile: — (world not active)"; return; }
    // If a game started after the panel was built empty, (re)build it.
    if (this._builtPanelFor === null) this._buildPanel();
    const cam = w.cameras.main;
    const wx = cam.worldView.x + e.clientX / cam.zoom;
    const wy = cam.worldView.y + e.clientY / cam.zoom;
    const tx = Math.floor(wx / TILE);
    const ty = Math.floor(wy / TILE);
    let extra = "";
    if (w._isBlocked) {
      try { extra = w._isBlocked(wx, wy) ? "  [BLOCKED]" : "  [walkable]"; } catch {}
    }
    this.hud.textContent = `tile: ${tx},${ty}${extra}\npx:   ${Math.round(wx)},${Math.round(wy)}`;
  }
}
