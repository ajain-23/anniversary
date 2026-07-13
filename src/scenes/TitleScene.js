import Phaser from "phaser";

export class TitleScene extends Phaser.Scene {
  constructor() { super("title"); }
  init(data) { this.deps = data; }

  preload() {
    if (!this.textures.exists("title_heart")) this.load.image("title_heart", "assets/sprites/heart.png");
  }

  create() {
    this.cameras.main.setBackgroundColor("#14101f");
    this._makeParticleTextures();
    this._layout();
    // Reflow when the window (and thus the RESIZE canvas) changes size.
    this.scale.on("resize", this._layout, this);
    this.events.once("shutdown", () => this.scale.off("resize", this._layout, this));
    this.events.once("destroy", () => this.scale.off("resize", this._layout, this));

    // Web fonts (VT323/Quicksand) load async via the <link> in index.html. Phaser
    // Canvas text renders once and does NOT auto-reflow when fonts arrive, so the
    // first paint can fall back to a system font. Re-layout after fonts are ready.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (this.scene.isActive()) this._layout(); });
    }
  }

  // Generate the small soft "dust/star" dot texture once (a radial-gradient blob).
  _makeParticleTextures() {
    if (this.textures.exists("title_dust")) return;
    const S = 16, r = S / 2;
    const c = this.textures.createCanvas("title_dust", S, S);
    const ctx = c.getContext();
    const g = ctx.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,246,224,0.8)");
    g.addColorStop(1, "rgba(255,246,224,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    c.refresh();
  }

  // Warm gradient + vignette background, drifting dust/stars, and occasional floating hearts.
  // Rebuilt on every _layout() (which clears children), so it always fits the current size.
  _makeAtmosphere(width, height, s) {
    // 1) Radial gradient bg (deep purple center → warm-dark edge) drawn to a canvas texture.
    const key = "title_bg";
    if (this.textures.exists(key)) this.textures.remove(key);
    const bg = this.textures.createCanvas(key, width, height);
    const ctx = bg.getContext();
    const grad = ctx.createRadialGradient(
      width / 2, height * 0.42, 0,
      width / 2, height * 0.42, Math.max(width, height) * 0.75);
    grad.addColorStop(0, "#2a1f3a");   // warm plum glow at center
    grad.addColorStop(0.55, "#1a1428");
    grad.addColorStop(1, "#0c0912");   // dark edges (vignette)
    ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);
    bg.refresh();
    this.add.image(0, 0, key).setOrigin(0, 0).setDepth(-10);

    // 2) Drifting dust/stars: slow upward float + a twinkle (alpha ramps 0 → up → 0 over life,
    //    via an array of interpolated stops across the particle lifespan).
    this.add.particles(0, 0, "title_dust", {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      lifespan: 9000,
      speedY: { min: -14, max: -4 },
      speedX: { min: -6, max: 6 },
      scale: { min: 0.12 * s, max: 0.5 * s },
      alpha: { values: [0, 0.9, 0.9, 0], interpolation: "linear" },
      quantity: 1, frequency: 240,
    }).setDepth(-9);

    // 3) Occasional hearts drifting up from the bottom, fading in then out.
    this.add.particles(0, 0, "title_heart", {
      x: { min: width * 0.1, max: width * 0.9 },
      y: height + 20,
      lifespan: 7000,
      speedY: { min: -50, max: -26 },
      speedX: { min: -14, max: 14 },
      scale: { start: 0.05 * s, end: 0.03 * s },
      alpha: { values: [0, 0.5, 0.5, 0], interpolation: "linear" },
      rotate: { min: -12, max: 12 },
      quantity: 1, frequency: 1600,
    }).setDepth(-8);

    // 4) Occasional shooting star: a bright dot streaks diagonally with a fading trail.
    // Self-managed timer, re-created each _layout(); cleared on rebuild + shutdown.
    this._starTimer?.remove();
    const scheduleStar = () => {
      this._starTimer = this.time.delayedCall(4000 + Math.random() * 9000, () => {
        this._shootStar(width, height, s);
        scheduleStar();
      });
    };
    scheduleStar();
    this.events.once("shutdown", () => this._starTimer?.remove());
  }

  // One shooting star: a glowing head + trail that ARCS across the upper sky (a gentle parabola —
  // rises a touch, then curves down) rather than a straight diagonal. Slow + graceful.
  _shootStar(width, height, s) {
    if (!this.scene.isActive()) return;
    const fromLeft = Math.random() < 0.5;
    const x0 = fromLeft ? -40 : width + 40;
    const x1 = fromLeft ? width + 40 : -40;
    const yStart = height * (0.10 + Math.random() * 0.22);
    const yEnd = yStart + height * (0.14 + Math.random() * 0.10); // ends lower than it started
    const arc = height * (0.10 + Math.random() * 0.06);           // how high the arc bows upward
    const dur = 2000 + Math.random() * 900;                       // slower, graceful

    const head = this.add.image(x0, yStart, "title_dust").setScale(0.9 * s).setDepth(-7).setAlpha(0);
    const trail = this.add.particles(0, 0, "title_dust", {
      follow: head, lifespan: 650, quantity: 1, frequency: 14,
      scale: { start: 0.7 * s, end: 0 }, alpha: { start: 0.8, end: 0 }, speed: 0,
    }).setDepth(-7);

    this.tweens.add({ targets: head, alpha: 1, duration: 220 });
    // Drive a 0→1 progress value; position follows a parabolic arc. x is linear; y interpolates
    // start→end and subtracts a sine "bow" so the path curves up then settles down.
    const prog = { t: 0 };
    this.tweens.add({
      targets: prog, t: 1, duration: dur, ease: "Sine.inOut",
      onUpdate: () => {
        const t = prog.t;
        head.x = x0 + (x1 - x0) * t;
        head.y = yStart + (yEnd - yStart) * t - Math.sin(t * Math.PI) * arc;
      },
      onComplete: () => {
        trail.stop();
        this.tweens.add({ targets: head, alpha: 0, duration: 200, onComplete: () => head.destroy() });
        this.time.delayedCall(700, () => trail.destroy());
      },
    });
  }

  // (Re)builds all title elements for the current canvas size. Safe to call on
  // every resize / after fonts load: it clears prior objects first.
  _layout() {
    const { width, height } = this.scale;
    this.children.removeAll();

    // Scale menu text (and atmosphere) with window height so it fills a consistent share of the
    // screen. Base ~900px tall; clamped so it never gets absurd.
    const s = Phaser.Math.Clamp(height / 900, 0.85, 2.2);
    const px = (n) => Math.round(n * s) + "px";

    this._makeAtmosphere(width, height, s);

    // Title: fades + rises in, with a gently breathing gold glow.
    const title = this.add.text(width / 2, height / 2 - 110 * s, "A Dream Come True", {
      fontFamily: "VT323, monospace", fontSize: px(120), color: "#ffd98a",
    }).setOrigin(0.5).setShadow(0, 0, "#ffb84d", 14 * s);
    const sub = this.add.text(width / 2, height / 2 - 14 * s, "Isa & Ayush — est. July 23, 2025", {
      fontFamily: "Caveat, cursive", fontSize: px(46), color: "#ff9ecb",
    }).setOrigin(0.5);
    // Entrance: fade + rise (only the first build; skip on resize reflows so it isn't jarring).
    if (!this._entered) {
      this._entered = true;
      for (const [obj, dy, delay] of [[title, 24 * s, 0], [sub, 16 * s, 250]]) {
        obj.setAlpha(0); obj.y += dy;
        this.tweens.add({ targets: obj, alpha: 1, y: obj.y - dy, duration: 1100, delay, ease: "Sine.out" });
      }
    }
    // Breathing glow on the title (animate the shadow blur via a proxy value).
    const glow = { b: 14 * s };
    this.tweens.add({
      targets: glow, b: 30 * s, duration: 2000, yoyo: true, repeat: -1, ease: "Sine.inOut",
      onUpdate: () => title.setShadow(0, 0, "#ffb84d", glow.b),
    });

    const hasSave = (JSON.parse(localStorage.getItem("rm_completed") || "[]")).length > 0;

    if (!hasSave) {
      // FIRST PLAY: simple "press any key" (nice + clean)
      const prompt = this.add.text(width / 2, height - 90 * s, "press any key to begin", {
        fontFamily: "Quicksand, sans-serif", fontSize: px(22), color: "#f3eee7",
      }).setOrigin(0.5).setAlpha(0.6);
      this.tweens.add({ targets: prompt, alpha: 0.15, duration: 1100, yoyo: true, repeat: -1 });
      // once() guards against double-binding across repeated _layout() calls.
      this.input.keyboard.removeAllListeners("keydown");
      this.input.removeAllListeners("pointerdown");
      this.input.keyboard.once("keydown", () => this._start());
      this.input.once("pointerdown", () => this._start());
      return;
    }

    // RETURNING PLAYER: Continue / New Game buttons — rounded panel + hover glow + pop.
    const mkBtn = (y, label, cb) => {
      const bw = 260 * s, bh = 58 * s, rad = 14 * s;
      const c = this.add.container(width / 2, y);

      const panel = this.add.graphics();
      const drawPanel = (fill, alpha, stroke) => {
        panel.clear();
        panel.fillStyle(fill, alpha);
        panel.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, rad);
        panel.lineStyle(Math.max(1, 2 * s), stroke, 0.9);
        panel.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, rad);
      };
      drawPanel(0x2a2440, 0.85, 0x4a3f6b);

      const txt = this.add.text(0, 0, label, {
        fontFamily: "Quicksand, sans-serif", fontSize: px(26), color: "#f3eee7",
      }).setOrigin(0.5);

      c.add([panel, txt]);
      c.setSize(bw, bh).setInteractive({ useHandCursor: true });

      const enter = () => {
        drawPanel(0x3a3157, 0.95, 0xffd98a);
        txt.setColor("#ffd98a");
        this.tweens.add({ targets: c, scale: 1.05, duration: 140, ease: "Back.out" });
      };
      const leave = () => {
        drawPanel(0x2a2440, 0.85, 0x4a3f6b);
        txt.setColor("#f3eee7");
        this.tweens.add({ targets: c, scale: 1, duration: 140 });
      };
      c.on("pointerover", enter);
      c.on("pointerout", leave);
      c.on("pointerdown", () => { this.tweens.add({ targets: c, scale: 0.97, duration: 80, yoyo: true, onComplete: cb }); });
      return c;
    };
    let y = height / 2 + 70 * s;
    mkBtn(y, "Continue", () => this._start()); y += 80 * s;
    mkBtn(y, "New Game", () => this._confirmReset());
    this.confirmText = this.add.text(width / 2, height - 50 * s, "", {
      fontFamily: "Quicksand, sans-serif", fontSize: px(18), color: "#ff9ecb",
    }).setOrigin(0.5);
  }

  _confirmReset() {
    if (this._armed) { this._reset(); this._start(); return; }
    this.confirmText.setText("Start over? This clears all memories. Click New Game again to confirm.");
    this._armed = true;
    this.time.delayedCall(4000, () => { this._armed = false; this.confirmText.setText(""); });
  }

  _reset() {
    // wipe game state; keep mute preference
    localStorage.removeItem("rm_completed");
    localStorage.removeItem("rm_gates");
    // The album is a single long-lived instance shared across playthroughs — clearing only
    // localStorage isn't enough; its in-memory `collected` must be wiped too, or a New Game
    // (without a page reload) shows every memory already unlocked. reset() does both + re-renders.
    this.deps.album?.reset();
  }

  _start() {
    this.deps.audio?.unlock();
    this.deps.audio?.playMusic("title");
    this.scene.start("world", this.deps);
  }
}
