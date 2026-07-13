import { FINAL_PHOTO } from "../data/encounters.js";

// LetterUI — the finale letter on warm paper, with photo embedded at the bottom.
// The letter TEXT is the user's real words (placeholder for now).
export class LetterUI {
  constructor() {
    this.el = document.getElementById("letter");
    this.body = document.getElementById("letter-body");
    this.photo = document.getElementById("letter-photo");
  }

  open() {
    return new Promise((resolve) => {
      this.body.innerHTML = LETTER_HTML;
      this.photo.src = FINAL_PHOTO.src; // present-day photo (also counted as the final memory)
      this.el.classList.remove("hidden");
      // fade handled by CSS animation
      const onKey = (e) => {
        if (e.code === "Space" || e.code === "Enter" || e.code === "Escape") {
          e.preventDefault();
          window.removeEventListener("keydown", onKey);
          this.el.classList.add("hidden");
          resolve();
        }
      };
      // small delay so she doesn't skip instantly
      setTimeout(() => window.addEventListener("keydown", onKey), 1200);
    });
  }
}

// The real letter (letter.p1–p5 + sign-off). Each <p> = one paragraph; the final photo
// (FINAL_PHOTO, caption "Isa y Ayush") is embedded at the bottom by open().
const LETTER_HTML = `
<p>Isa,</p>
<p>I love you more than I could ever put into words.</p>
<p>You're bright, kind, cool, funny, comforting, talented, brave, strong, steady, supportive,
ambitious, organized, insanely cute and unbelievably gorgeous. Your smile lights up my world,
your gaze makes my heart skip a beat, your presence leaves me downright speechless. I can't go
through an entire day without rediscovering your effortless beauty and brilliance.</p>
<p>I can't wait to spend forever with you. I can only hope that I get to spend my life making
you as happy as you make me. Your love has given me a sense of purpose, transforming and
changing me in ways that I never thought possible. I promise to stand with you through every
trial, to support your every dream, and to love you with every breath that I take.</p>
<p>Every single moment with you is something I just want to hold onto forever. You are my
anchor, my confidante, my home, my eternal love, my everything. Te amo.</p>
<p style="text-align:right">— Ayush</p>
`;
