// DialogueManager — drives the HTML dialogue box with typewriter + 3 voices.
export class DialogueManager {
  constructor() {
    this.box = document.getElementById("dialogue");
    this.speakerEl = document.getElementById("dialogue-speaker");
    this.textEl = document.getElementById("dialogue-text");
    this.typing = false;
    this._full = "";
    this._timer = null;
  }

  // returns a Promise that resolves when the player advances past this line
  show(text, who = "npc", name = "") {
    return new Promise((resolve) => {
      this.box.className = ""; // reset
      this.box.classList.add(`speaker-${who}`);
      this.speakerEl.textContent = name || (who === "guide" ? "" : "");
      this.box.classList.remove("hidden");

      this._full = text;
      this.textEl.textContent = "";
      this.typing = true;
      const shownAt = performance.now();
      let finishedAt = 0; // when the typewriter completed (0 while still typing)
      let i = 0;
      clearInterval(this._timer);
      this._timer = setInterval(() => {
        this.textEl.textContent = this._full.slice(0, ++i);
        if (i >= this._full.length) {
          clearInterval(this._timer);
          this.typing = false;
          finishedAt = performance.now();
        }
      }, 22);

      let unsubTouch = null;
      const cleanup = () => {
        window.removeEventListener("keydown", onKey);
        if (unsubTouch) unsubTouch();
      };
      const advance = () => {
        // ignore presses in the first 250ms (prevents carryover skips)
        if (performance.now() - shownAt < 250) return;
        if (this.typing) {
          // first press: finish typing instantly, and stamp the finish time so the
          // NEXT (advancing) tap can't fire in the same rushed burst.
          clearInterval(this._timer);
          this.textEl.textContent = this._full;
          this.typing = false;
          finishedAt = performance.now();
          return;
        }
        // Require a short beat after the text is fully shown before advancing, so a
        // quick "finish typing" tap doesn't immediately skip the line too.
        if (performance.now() - finishedAt < 300) return;
        cleanup();
        resolve();
      };
      const onKey = (e) => {
        if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); advance(); }
      };
      window.addEventListener("keydown", onKey);
      // Touch: a tap (action button or tap-anywhere) advances just like SPACE.
      if (this.touch) unsubTouch = this.touch.onConfirm(advance);
    });
  }

  hide() { this.box.classList.add("hidden"); }
}
