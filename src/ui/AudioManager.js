// AudioManager — music per zone + SFX. Fails silent if files are missing (placeholders).
// Real files go in /public/assets/audio/. Browser autoplay requires a user gesture:
// call unlock() on the first key/click (done in main/title).
export class AudioManager {
  constructor() {
    this.muted = false;
    this.current = null;
    this.currentKey = null;
    this.unlocked = false;
    this.musicVolume = 0.5;   // normal music level (the crossfade/duck targets are relative to this)
    this.ducked = false;      // true while an encounter is playing (music lowered under dialogue)
    this.duckFactor = 0.7;    // music dips to 70% while ducked (gentle, not a big drop)
    // BASE-relative paths (import.meta.env.BASE_URL = "./" per vite.config) so audio loads on
    // GitHub Pages project subpaths, not just a root site.
    const B = import.meta.env.BASE_URL;
    // ONE SONG PER ENCOUNTER (a mixtape): tracks are keyed by encounter reveal order ("01".."11";
    // 11 encounters, `trips` gets ONE song). Each encounter swaps to its song at the start; it
    // keeps playing through the walk until the next encounter swaps it (crossfaded). `title` plays
    // on the title screen AND the opening walk (spawn → 1st memory). Files keep the user's original
    // descriptive names (in public/assets/audio/). Missing files stay silent.
    const A = (name) => `${B}assets/audio/${name}.mp3`;
    this.tracks = {
      title: A("e0_whereismyhusband"), // title screen + opening walk
      "01":  A("e2_laciruela"),        // pond
      "02":  A("e3_unmillon"),         // usual
      "03":  A("e4_howiget"),          // insurance
      "04":  A("e5_burningblue"),      // firstDate
      "05":  A("e6_diewithasmile"),    // falling
      "06":  A("e7_loveistheway"),     // iloveyou
      "07":  A("e9_riskitall"),        // family
      "08":  A("e8_stuckwithu"),       // trips
      "09":  A("e10_housetour"),       // graduation
      "10":  A("e11_wonderingwhy"),    // notices
      "11":  A("e12_stupidsong"),      // finale
    };
    // "Now playing" labels per track key: { title, artist }. Shown below the mute toggle when a
    // song starts. EDIT these to the real song titles + artists. (title screen key = "title".)
    this.trackMeta = {
      title: { title: "Where Is My Husband!", artist: "Raye" },
      "01":  { title: "La Ciruela",           artist: "Nico Play" },
      "02":  { title: "Un Millón",            artist: "The Marías" },
      "03":  { title: "How I Get",            artist: "Laufey" },
      "04":  { title: "Burning Blue",         artist: "Mariah the Scientist" },
      "05":  { title: "Die With a Smile",     artist: "Lady Gaga" },
      "06":  { title: "Love Is the Way",      artist: "Three Sacred Souls" },
      "07":  { title: "Risk It All",          artist: "Bruno Mars" },
      "08":  { title: "Stuck With U",         artist: "Ariana Grande" },
      "09":  { title: "House Tour",           artist: "Sabrina Carpenter" },
      "10":  { title: "Wondering Why",        artist: "The Red Clay Strays" },
      "11":  { title: "Stupid Song",          artist: "Olivia Rodrigo" },
    };
    this.sfxSrc = {
      warm: `${B}assets/audio/sfx/warm.mp3`,
      chime: `${B}assets/audio/sfx/chime.mp3`,
      fireworks: `${B}assets/audio/sfx/fireworks.mp3`,
      cheer: `${B}assets/audio/sfx/cheer.mp3`,
      letter: `${B}assets/audio/sfx/letter.mp3`,
      memory: `${B}assets/audio/sfx/memory.mp3`,
    };
    this._loadMute();
    this._wireMuteButton();
  }

  unlock() { this.unlocked = true; if (this.currentKey && !this.current) this.playMusic(this.currentKey); }

  // Target volume the current track should sit at right now (accounts for ducking).
  _targetVol() { return this.musicVolume * (this.ducked ? this.duckFactor : 1); }

  // Switch zone/track with a proper CROSSFADE: the new track fades up while the old fades down
  // simultaneously (same-length ramps), so transitions are smooth instead of abrupt cuts.
  playMusic(key) {
    this.currentKey = key;
    if (!this.unlocked || this.muted) return;
    if (this.current && this.current._key === key) return;
    const src = this.tracks[key];
    if (!src) return;
    const outgoing = this.current;
    const a = new Audio(src);
    a._key = key; a.loop = true; a.volume = 0;
    a.play().then(() => {
      // Crossfade: ramp `a` up to target while ramping `outgoing` down to 0 over the same window.
      this._crossfade(outgoing, a, this._targetVol());
      this._updateNowPlaying(key);
    }).catch(() => {}); // silent if the file is missing
    this.current = a;
  }

  // Update the "now playing" HUD line to the given track key (or hide it if unknown/none).
  // Hidden while muted. Shows "♪ Title · Artist" (artist omitted if blank).
  _updateNowPlaying(key) {
    const el = document.getElementById("now-playing");
    if (!el) return;
    const meta = key && this.trackMeta[key];
    if (!meta || this.muted) { el.classList.add("hidden"); return; }
    const artist = meta.artist
      ? ` · <span class="np-artist">${meta.artist}</span>` : "";
    // Animated equalizer (playing indicator) + song · artist.
    el.innerHTML =
      `<span class="np-eq"><i></i><i></i><i></i></span>` +
      `<span class="np-text">${meta.title}${artist}</span>`;
    el.classList.remove("hidden");
  }

  // Duck the music under an encounter's dialogue/reveal, then restore afterward. Called by the
  // EventRunner around each encounter so words + reveals have room to land.
  duck() { if (this.ducked) return; this.ducked = true; this._rampCurrent(this._targetVol()); }
  unduck() { if (!this.ducked) return; this.ducked = false; this._rampCurrent(this._targetVol()); }

  sfx(name) {
    if (this.muted || !this.unlocked) return;
    const src = this.sfxSrc[name];
    if (!src) return;
    const a = new Audio(src); a.volume = 0.6;
    a.play().catch(() => {});
  }

  // Ramp the CURRENT track toward `target` (used by duck/unduck). ~500ms.
  _rampCurrent(target) {
    const a = this.current; if (!a) return;
    if (this._rampTimer) clearInterval(this._rampTimer);
    const step = (target - a.volume) / 10;
    this._rampTimer = setInterval(() => {
      a.volume = Math.max(0, Math.min(1, a.volume + step));
      if (Math.abs(a.volume - target) < 0.03) { a.volume = Math.max(0, Math.min(1, target)); clearInterval(this._rampTimer); this._rampTimer = null; }
    }, 50);
  }

  // Simultaneous crossfade: fade `incoming` up to `target` and `outgoing` down to 0 together.
  // ~1.8s so song-to-song swaps (per memory) blend silkily rather than smash-cut.
  _crossfade(outgoing, incoming, target = this.musicVolume, ms = 1800) {
    const steps = Math.max(1, Math.round(ms / 60));
    let i = 0;
    const startOut = outgoing ? outgoing.volume : 0;
    const t = setInterval(() => {
      i++;
      const p = i / steps;
      if (incoming) incoming.volume = Math.min(1, target * p);
      if (outgoing) outgoing.volume = Math.max(0, startOut * (1 - p));
      if (i >= steps) {
        if (outgoing) { outgoing.pause(); }
        if (incoming) incoming.volume = Math.min(1, target);
        clearInterval(t);
      }
    }, 60);
  }

  toggleMute() {
    this.muted = !this.muted;
    this._saveMute();
    if (this.muted) {
      if (this._rampTimer) { clearInterval(this._rampTimer); this._rampTimer = null; }
      this.current?.pause();        // instant; keeps currentTime so unmute resumes in place
      this._updateNowPlaying(null); // hide the label while muted
    } else if (this.current && this.current._key === this.currentKey) {
      this.current.volume = this._targetVol();
      this.current.play().catch(() => {});  // resume the SAME track (no restart)
      this._updateNowPlaying(this.currentKey);
    } else if (this.currentKey) {
      this.playMusic(this.currentKey);       // track changed while muted → start the new one
    }
    this._updateBtn();
  }
  _loadMute() { try { this.muted = localStorage.getItem("rm_muted") === "1"; } catch {} }
  _saveMute() { try { localStorage.setItem("rm_muted", this.muted ? "1" : "0"); } catch {} }
  _wireMuteButton() {
    const btn = document.getElementById("mute-toggle");
    if (btn) { btn.addEventListener("click", () => this.toggleMute()); this._updateBtn(); }
    window.addEventListener("keydown", (e) => { if (e.code === "KeyM") this.toggleMute(); });
  }
  _updateBtn() { const btn = document.getElementById("mute-toggle"); if (btn) btn.textContent = this.muted ? "♪ off (m)" : "♪ on (m)"; }
}
