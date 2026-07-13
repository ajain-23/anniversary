// AudioManager — music per zone + SFX. Fails silent if files are missing (placeholders).
// Real files go in /public/assets/audio/. Browser autoplay requires a user gesture:
// call unlock() on the first key/click (done in main/title).
export class AudioManager {
  constructor() {
    this.muted = false;
    this.current = null;
    this.currentKey = null;
    this.unlocked = false;
    // BASE-relative paths (import.meta.env.BASE_URL = "./" per vite.config) so audio loads on
    // GitHub Pages project subpaths, not just a root site.
    const B = import.meta.env.BASE_URL;
    this.tracks = {
      title:  `${B}assets/audio/title.mp3`,    // "wondering why" (user provides)
      meadow: `${B}assets/audio/meadow.mp3`,   // Laufey-flavored
      shore:  `${B}assets/audio/shore.mp3`,    // The Marías-flavored
      city:   `${B}assets/audio/city.mp3`,     // Bad Bunny / Sabrina-flavored
      finale: `${B}assets/audio/finale.mp3`,   // "stupid"
    };
    this.sfxSrc = {
      warm: `${B}assets/audio/sfx/warm.mp3`,
      chime: `${B}assets/audio/sfx/chime.mp3`,
      squirrel: `${B}assets/audio/sfx/squirrel.mp3`,
      fireworks: `${B}assets/audio/sfx/fireworks.mp3`,
      cheer: `${B}assets/audio/sfx/cheer.mp3`,
      letter: `${B}assets/audio/sfx/letter.mp3`,
      memory: `${B}assets/audio/sfx/memory.mp3`,
    };
    this._loadMute();
    this._wireMuteButton();
  }

  unlock() { this.unlocked = true; if (this.currentKey && !this.current) this.playMusic(this.currentKey); }

  playMusic(key) {
    this.currentKey = key;
    if (!this.unlocked || this.muted) return;
    if (this.current && this.current._key === key) return;
    this._fadeOutCurrent();
    const src = this.tracks[key];
    if (!src) return;
    const a = new Audio(src);
    a._key = key; a.loop = true; a.volume = 0;
    a.play().then(() => this._fadeIn(a)).catch(() => {}); // silent if missing
    this.current = a;
  }

  sfx(name) {
    if (this.muted || !this.unlocked) return;
    const src = this.sfxSrc[name];
    if (!src) return;
    const a = new Audio(src); a.volume = 0.6;
    a.play().catch(() => {});
  }

  _fadeIn(a, target = 0.5) {
    let v = 0; const t = setInterval(() => { v += 0.05; a.volume = Math.min(target, v); if (v >= target) clearInterval(t); }, 60);
  }
  _fadeOutCurrent() {
    const a = this.current; if (!a) return;
    let v = a.volume; const t = setInterval(() => { v -= 0.08; a.volume = Math.max(0, v); if (v <= 0) { a.pause(); clearInterval(t); } }, 60);
    this.current = null;
  }

  toggleMute() { this.muted = !this.muted; this._saveMute(); if (this.muted) this._fadeOutCurrent(); else if (this.currentKey) this.playMusic(this.currentKey); this._updateBtn(); }
  _loadMute() { try { this.muted = localStorage.getItem("rm_muted") === "1"; } catch {} }
  _saveMute() { try { localStorage.setItem("rm_muted", this.muted ? "1" : "0"); } catch {} }
  _wireMuteButton() {
    const btn = document.getElementById("mute-toggle");
    if (btn) { btn.addEventListener("click", () => this.toggleMute()); this._updateBtn(); }
    window.addEventListener("keydown", (e) => { if (e.code === "KeyM") this.toggleMute(); });
  }
  _updateBtn() { const btn = document.getElementById("mute-toggle"); if (btn) btn.textContent = this.muted ? "♪ off (m)" : "♪ on (m)"; }
}
