import { TOTAL_MEMORIES } from "../data/encounters.js";

// MemoryAlbum — full-screen photo reveal(s) + browsable gallery + always-visible counter.
export class MemoryAlbum {
  constructor() {
    this.reveal = document.getElementById("memory-reveal");
    this.photo = document.getElementById("memory-photo");
    this.caption = document.getElementById("memory-caption");
    this.album = document.getElementById("album");
    this.grid = document.getElementById("album-grid");
    this.emptyNote = document.getElementById("album-empty-note");
    this.counter = document.getElementById("counter");
    this.lightbox = document.getElementById("lightbox");
    this.lightboxImg = document.getElementById("lightbox-img");
    this.lightboxCap = document.getElementById("lightbox-cap");
    this.collected = []; // [{src, caption}]
    this._load();
    this._wire();
    this._renderGrid();
    this._updateCounter();
  }

  _load() {
    try { const r = localStorage.getItem("rememberme_album"); if (r) this.collected = JSON.parse(r); } catch {}
  }
  _save() { try { localStorage.setItem("rememberme_album", JSON.stringify(this.collected)); } catch {} }

  // Wipe collected memories (New Game). The album is a single long-lived instance shared across
  // playthroughs, so New Game MUST clear the in-memory `collected` too — not just localStorage —
  // or a New Game started without a page reload shows every memory already unlocked.
  reset() {
    this.collected = [];
    try { localStorage.removeItem("rememberme_album"); } catch {}
    this._renderGrid();
    this._updateCounter();
  }

  // reveal one or more photos in sequence; resolves after last is dismissed.
  // `silent` adds the photo(s) to the album + counter WITHOUT a full-screen reveal
  // (used for the finale letter's photo, which the letter already displays).
  async revealMemory({ photos, silent }) {
    for (const p of photos) {
      if (!silent) await this._revealOne(p);
      if (!this.collected.find((m) => m.src === p.src)) { this.collected.push(p); this._save(); }
    }
    this._renderGrid(); this._updateCounter();
  }

  _revealOne(p) {
    return new Promise((resolve) => {
      this.photo.src = p.src;
      this.caption.textContent = p.caption || "";
      this.reveal.classList.remove("hidden");
      const shownAt = performance.now();
      let unsubTouch = null;
      const dismiss = () => {
        // Small guard so the tap/press that finished dialogue doesn't instantly skip
        // the reveal (mirrors the dialogue 250ms carryover guard).
        if (performance.now() - shownAt < 250) return;
        window.removeEventListener("keydown", onKey);
        if (unsubTouch) unsubTouch();
        this.reveal.classList.add("hidden"); resolve();
      };
      const onKey = (e) => {
        if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); dismiss(); }
      };
      window.addEventListener("keydown", onKey);
      // Touch: a tap (action button or tap-anywhere) dismisses the reveal.
      if (this.touch) unsubTouch = this.touch.onConfirm(dismiss);
    });
  }

  _renderGrid() {
    this.grid.innerHTML = "";
    // Always render the FULL layout (one cell per memory slot). Collected slots show the
    // polaroid; uncollected slots show a dark "impression" placeholder in the same 4:3 shape,
    // so the empty and filled album share the same grid.
    for (let i = 0; i < TOTAL_MEMORIES; i++) {
      const m = this.collected[i];
      const item = document.createElement("div");
      item.style.setProperty("--r", `${(i % 2 ? 1 : -1) * (1 + (i % 3))}deg`);
      if (m) {
        item.className = "album-item";
        item.innerHTML = `<img src="${m.src}" alt=""><div class="cap"><span>${m.caption || ""}</span></div>`;
        item.addEventListener("click", () => this._openLightbox(i));
      } else {
        // Placeholder impression: no photo, no caption, not clickable.
        item.className = "album-item album-item-empty";
        item.innerHTML = `<div class="album-impression"></div>`;
      }
      this.grid.appendChild(item);
    }
    // "nothing yet" hint only while the album is completely empty.
    if (this.collected.length === 0 && this.emptyNote) this.emptyNote.classList.remove("hidden");
    else if (this.emptyNote) this.emptyNote.classList.add("hidden");
  }

  _openLightbox(i) {
    this._lightIndex = i;
    const m = this.collected[i];
    this.lightboxImg.src = m.src; this.lightboxCap.textContent = m.caption || "";
    this.lightbox.classList.remove("hidden");
  }
  _lightNav(dir) {
    if (this.lightbox.classList.contains("hidden")) return;
    this._lightIndex = (this._lightIndex + dir + this.collected.length) % this.collected.length;
    this._openLightbox(this._lightIndex);
  }

  _updateCounter() {
    if (this.counter) this.counter.textContent = `memories: ${this.collected.length}/${TOTAL_MEMORIES}`;
  }

  // Build the end-screen memory frame: the collected photos are spread EVENLY around the
  // whole rectangle perimeter (corners included), clockwise from top-left. Called by
  // WorldScene.endScreen(). Safe to call repeatedly.
  renderEndFrame() {
    const frame = document.getElementById("end-frame");
    if (!frame) return;
    frame.innerHTML = "";
    const photos = this.collected.slice(0, 12);
    const n = photos.length;
    if (n === 0) return;

    // The photos sit centered on a track inset INSET_X/INSET_Y (as fractions of the
    // frame) from the window edges. Each photo's center is placed at an equal arc-length
    // step around that rectangle's perimeter, so spacing is uniform on every side.
    const INSET_X = 0.085; // 8.5% in from left/right
    const INSET_Y = 0.10;  // 10% in from top/bottom
    const x0 = INSET_X, x1 = 1 - INSET_X, y0 = INSET_Y, y1 = 1 - INSET_Y;
    const w = x1 - x0, h = y1 - y0;
    const perim = 2 * (w + h);

    // Map an arc-length fraction t (0..1) clockwise from top-left corner → {x,y} in [0,1].
    const pointAt = (t) => {
      let d = t * perim; // distance travelled along the perimeter
      if (d <= w) return { x: x0 + d, y: y0 };            // top edge → right
      d -= w;
      if (d <= h) return { x: x1, y: y0 + d };            // right edge → down
      d -= h;
      if (d <= w) return { x: x1 - d, y: y1 };            // bottom edge → left
      d -= w;
      return { x: x0, y: y1 - d };                        // left edge → up
    };

    photos.forEach((p, i) => {
      const { x, y } = pointAt(i / n);
      const tile = document.createElement("div");
      tile.className = "ef-photo";
      tile.style.left = `${x * 100}%`;
      tile.style.top = `${y * 100}%`;
      // rotation is baked with the centering translate so it never drifts
      const deg = (i % 2 ? 1 : -1) * (2 + (i % 3));
      tile.style.setProperty("--r", `${deg}deg`);
      const img = document.createElement("img");
      img.src = p.src; img.alt = "";
      tile.appendChild(img);
      // Clickable like the album: open the same lightbox (index maps 1:1 to collected,
      // since these are collected.slice(0, 12) in order). ← → nav + ESC already work.
      tile.addEventListener("click", () => this._openLightbox(i));
      frame.appendChild(tile);
    });
  }

  _wire() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "Tab") { e.preventDefault(); this.album.classList.toggle("hidden"); }
      else if (e.code === "Escape") {
        if (!this.lightbox.classList.contains("hidden")) this.lightbox.classList.add("hidden");
        else this.album.classList.add("hidden");
      }
      else if (e.code === "ArrowRight") this._lightNav(1);
      else if (e.code === "ArrowLeft") this._lightNav(-1);
    });
    // click a gallery item -> lightbox; click lightbox bg -> close
    this.lightbox?.addEventListener("click", (e) => { if (e.target === this.lightbox) this.lightbox.classList.add("hidden"); });

    // --- Touch / click reachability (also nice on desktop) ---
    // The "album (tab)" HUD label opens the album (mirrors TAB).
    document.getElementById("album-toggle")?.addEventListener("click", () => this.album.classList.toggle("hidden"));
    // On-screen close for the album (no ESC/TAB on touch).
    document.getElementById("album-close")?.addEventListener("click", (e) => { e.stopPropagation(); this.album.classList.add("hidden"); });
    // On-screen lightbox controls: close + prev/next (arrow keys don't exist on touch).
    document.getElementById("lightbox-close")?.addEventListener("click", (e) => { e.stopPropagation(); this.lightbox.classList.add("hidden"); });
    document.getElementById("lightbox-prev")?.addEventListener("click", (e) => { e.stopPropagation(); this._lightNav(-1); });
    document.getElementById("lightbox-next")?.addEventListener("click", (e) => { e.stopPropagation(); this._lightNav(1); });
  }
}
