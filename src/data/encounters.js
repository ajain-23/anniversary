// ===========================================================================
// encounters.js  —  ALL game content as DATA (v3: SCRIPT rewrite applied).
// Interaction model: walk UP to an encounter -> "press SPACE" prompt -> it plays.
// (Triggering handled by WorldScene: near + SPACE, not bounding-box auto.)
//
// STEP TYPES (see EventRunner.js):
//   { say, who, name? } | { memory:{photos:[{src,caption}], id} } | { verb, label }
//   { fireworks } | { confetti } | { gradWalk } | { cutscene } | { endCutscene }
//   { gate } | { letter } | { end } | { music } | { sfx } | { wait }
//
// ORDER (drives STORY_ORDER + the walk): pasta -> pond -> usual -> insurance (g2) ->
//   firstDate -> falling -> iloveyou (g3) -> trips -> family -> graduation -> notices (g4)
//   -> finale. `squirrel` was REMOVED; `pasta` is now the first, on-path, no-photo opener.
// ===========================================================================

// Real photos are named by REVEAL order: 01.jpg = first memory shown, 12.jpg = the finale photo.
// P(n) takes that reveal-order number, zero-padded. Paths are BASE-relative (import.meta.env.
// BASE_URL, "./" per vite.config) so they load on GitHub Pages project subpaths, not just root.
const BASE = import.meta.env.BASE_URL; // "./" (see vite.config.js base)
const P = (n) => `${BASE}assets/photos/${String(n).padStart(2, "0")}.jpg`;
// The present-day finale photo (12th/last), shown embedded in the letter AND counted as the final memory.
export const FINAL_PHOTO = { src: P(12), caption: "Isa y Ayush" };

export const ENCOUNTERS = {

  // ===== MORNING MEADOW ===== (order: pasta -> pond -> usual -> insurance[g2])

  // E1 — PASTA (flavor opener, on-path, no photo, no gate)
  pasta: {
    id: "pasta", zone: "meadow", once: true,
    steps: [
      { say: "Care for some fresh pasta? It's Ayusho's special recipe, straight from Italy!", who: "npc", name: "stall" },
      { say: "No thanks. Growing up, you had enough pasta for three lifetimes. You are starting to feel a bit hungry, though...", who: "guide" },
    ],
  },

  // E2 — THE POND (who she is)  PHOTO 3 — cutscene overlay
  pond: {
    id: "pond", zone: "meadow", once: true,
    steps: [
      { music: "01" },
      { verb: "lookIn", label: "gaze into the water" },
      { cutscene: { bg: "#3a6b8c", sprite: "isa" } },
      { say: "...that's me?! Am I crazy, or am I actually just that cute?", who: "memory" },
      { say: "No, you're not crazy. You are absolutely stunning. Crazy face card AND body tea!", who: "guide" },
      { memory: { id: "pond", photos: [{ src: P(1), caption: "the prettiest girl to ever live" }] } },
      { say: "If you can believe it, behind that beauty is an incredible person. The love of someone's life. Keep exploring and you'll see. There's so much more up ahead.", who: "guide" },
      { endCutscene: true },
    ],
  },

  // E3 — THE USUAL (coffee, morning, name returns)  PHOTO 1
  usual: {
    id: "usual", zone: "meadow", once: true,
    steps: [
      { music: "02" },
      { say: "Hot vanilla latte with almond milk for Isa!", who: "npc", name: "café" },
      { verb: "take", label: "sip the coffee" },
      { sfx: "warm" },
      { say: "...vanilla. almond milk. hot — always hot, even if it's 80 degrees outside.", who: "memory" },
      { say: "...Isa. My name is Isa.", who: "memory" },
      { say: "There she is. Isa...it's such a gorgeous name. Suits you perfectly. Your last name could use a few more letters, though. Four letters, to be exact.", who: "guide" },
      { memory: { id: "usual", photos: [{ src: P(2), caption: "just a girl and her lunch (?!)" }] } },
      { say: "Matcha sounds good too...can you believe some people don't like matcha? What is wrong with them??", who: "guide" },
    ],
  },

  // E4 — INSURANCE (sweet treats + cookies "he")  PHOTO 2 — opens g2 (end of meadow)
  insurance: {
    id: "insurance", zone: "meadow", once: true,
    steps: [
      { music: "03" },
      { say: "Pastries, cookies, original tart frozen yogurt, get it all here!", who: "npc", name: "bakery" },
      { verb: "take", label: "grab a sweet treat" },
      { say: "I do love some chocolate chip cookies. But not too much salt on them, please! I love sugar...", who: "memory" },
      { say: "You've got a weakness. He figured it out early: if he ever needed a *yes* out of you... he'd just show up with a sweet treat. Even better if it was homemade. Shameless bribery.", who: "guide" },
      { say: "Who knows how things would have gone if he hadn't brought those chocolate chip cookies, that fateful day one year ago. The best insurance ever.", who: "guide" },
      { memory: { id: "insurance", photos: [{ src: P(3), caption: "butter, sugar, and love" }] } },
      { say: "Nothing beats sharing a sweet treat with you. Eat up! We've got lots more exploring to do.", who: "guide" },
      { gate: "g2" },
    ],
  },

  // ===== THE PARK AT DUSK ===== (string lights, no beach)

  // E5 — WHERE IT STARTED (first date, gelato + park)  PHOTO 4
  firstDate: {
    id: "firstDate", zone: "park", once: true,
    steps: [
      { music: "04" },
      { say: "One cup of lemon gelato and one cup of strawberry gelato, coming right up!", who: "npc", name: "gelato" },
      { verb: "take", label: "take the gelato" },
      { say: "...The first date. He was *so* nervous. The moment you walked into his life that warm June evening, his jaw was on the floor.", who: "guide" },
      { say: "Melting ice cream, a long walk in the park, his knees turning fully towards me 30 minutes in.", who: "memory" },
      { say: "Nothing's changed since – you'll always be the center of his orbit.", who: "guide" },
      { say: "He was doing everything in his power to keep himself composed. How do you keep your cool when you're next to the prettiest girl on Earth?", who: "guide" },
      { memory: { id: "firstDate", photos: [{ src: P(4), caption: "the first date" }] } },
      { say: "This is where it started, Isa. Thank you for always showing up, then and now.", who: "guide" },
    ],
  },

  // E6 — FALLING (fireworks/kiss/official)  PHOTO 5
  falling: {
    id: "falling", zone: "park", once: true,
    steps: [
      { music: "05" },
      { say: "Fourth of July. Your second date. Picnic and fireworks. He was so smitten, he could hardly eat, hardly even think. The fireworks in his heart were louder than the ones in the sky.", who: "guide" },
      { verb: "watch", label: "watch the sky" },
      { fireworks: true },  // boom SFX now plays inside fireworks() on the first detonation (in sync)
      { say: "Yeah, he was a little strange. One time, he randomly sent me a picture of his burrito bowl...", who: "memory" },
      { say: "A few weeks later, against all odds, first kiss. His heart rate shot through the roof. He had no idea what he was doing. But you saved him. And a few weeks after that, you made it official.", who: "guide" },
      { say: "He still is a little strange. But... I think I'll keep him.", who: "memory" },
      { memory: { id: "falling", photos: [{ src: P(5), caption: "fireworks into forever" }] } },
      { say: "He was terrified of how much he already felt for you. But you made it feel like the most natural thing in the world. You made him feel safe and at home. You always do.", who: "guide" },
    ],
  },

  // E7 — FIVE WORDS (she said "I love you" first)  PHOTO 6 — opens g3 (end of park)
  iloveyou: {
    id: "iloveyou", zone: "park", once: true,
    steps: [
      { music: "06" },
      { say: "Fast forward to December, at the Milpitas BART. Cold enough to see your breath. He had this sure feeling in his chest — it had been there for way too long — but he was too afraid to express it out loud.", who: "guide" },
      { say: "So you said it first. You always were braver than him.", who: "guide" },
      { verb: "sayIt", label: "say the words" },
      { sfx: "chime" },
      { say: "...'I love you.' I said it. I didn't plan to — it just felt true, so I said it. and I remember the look on his face.", who: "memory" },
      { say: "He froze. Then he said it back like he'd been holding his breath since summer. ...I don't think he's ever been that relieved — or that lucky. You went first. You're the reason he ever found the words at all.", who: "guide" },
      { memory: { id: "iloveyou", photos: [{ src: P(6), caption: "three little words" }] } },
      { say: "That was the day it stopped being *new* and started being *real*.\n...Come on. There's more.", who: "guide" },
      { gate: "g3" },
    ],
  },

  // ===== LANTERN CITY (night) =====

  // E8 — EVERYONE SHE HOLDS (family)  PHOTO 9 — crowd
  // (Walked before trips: entering the city via g3, family sits right by the gate exit.)
  family: {
    id: "family", zone: "city", once: true,
    steps: [
      { music: "07" },
      { say: "This memory isn't just about one particular moment. It's about who you are in every moment, and who you bring with you.", who: "guide" },
      { verb: "visitAll", label: "see what we see" },
      { say: "You are an inspiration to so many, family and friends. You are the first to do so much. And you always make sure you won't be the last.", who: "guide" },
      { say: "And you've made room for one more. You brought him into your family, and pulled him closer to his own. Your love is multiplied many times over.", who: "guide" },
      { memory: { id: "family", photos: [{ src: P(7), caption: "the ones you carry" }] } },
      { say: "Whatever you become, wherever you go, you are their pride. He knows how lucky he is to be on that list.", who: "guide" },
    ],
  },

  // E9 — THE FAR PLACES (trips)  PHOTOS 7 & 8
  trips: {
    id: "trips", zone: "city", once: true,
    steps: [
      { music: "08" },
      { say: "Despite busy schedules, you made time to travel. Scared you'd get sick of each other, instead coming home closer than ever.", who: "guide" },
      { verb: "take", label: "go on an adventure" },
      { say: "San Diego...the drive down. windows down, terrible singing, his hand on my leg and my hand on top. Three days that felt like a first sneak peek into an amazing future.", who: "memory" },
      { say: "And a few months later, Mexico City. Four days. He tried his best with Spanish. Valiant effort. He's still got a lot to learn. But there is no better inspiration than you.", who: "guide" },
      { say: "...I laughed so much. Wherever we went, that was home, as long as we were there together.", who: "memory" },
      { memory: { id: "trips", photos: [
        { src: P(8), caption: "on the road..." },
        { src: P(9), caption: "...and in the air" },
      ] } },
      { say: "The best trips he's ever been on. He can't wait to follow you everywhere and anywhere.", who: "guide" },
    ],
  },

  // E10 — WHAT YOU BUILT (graduation)  PHOTO 10 — set-piece
  graduation: {
    id: "graduation", zone: "city", once: true,
    steps: [
      { music: "09" },
      { say: "This one's all you. Look how far you've come.", who: "guide" },
      { verb: "wearCap", label: "walk the stage" },
      { sfx: "cheer" }, { gradWalk: true },
      { say: "...I did it. Berkeley. Pre-med. All those nights, and I did it anyway. Time and time again, I have proven any doubters wrong. Never bet against me!", who: "memory" },
      { say: "First in your family. You didn't just follow a path. You *made* one!", who: "guide" },
      { say: "It's not over yet. Studying for med school, applying, getting in, doing well, doing residency...there's a long road ahead.", who: "memory" },
      { say: "Of course. That's what makes you brave. You know what you want, and chase it even if it's hard.", who: "guide" },
      { memory: { id: "graduation", photos: [{ src: P(10), caption: "isa the scientist" }] } },
      { say: "And whatever comes next, you won't do it alone. I'll be standing right next to you.", who: "guide" },
    ],
  },

  // E11 — THE ONE WHO NOTICES  PHOTO 11 — emotional core — opens g4 (end of city)
  notices: {
    id: "notices", zone: "city", once: true,
    steps: [
      { music: "10" },
      { say: "...You always notice everything and everyone, Isa. I hope today makes you feel as seen as you make him feel.", who: "guide" },
      { verb: "open", label: "look closer" },
      { say: "Whenever he has felt like an inconvenience, whenever he worries about anything, you never let that sit. Every time, you fill the gap.", who: "guide" },
      { say: "He has never, in his whole life, felt as loved as you make him feel. For exactly who he is. You have seen him fully, flaws and all, and chosen him anyway.", who: "guide" },
      { memory: { id: "notices", photos: [{ src: P(11), caption: "the one who notices" }] } },
      { say: "You give him that kind of love every day. This little journey is just one part of him trying to give that love back to you, tenfold.", who: "guide" },
      { gate: "g4" },
    ],
  },

  // ===== HOME / FINALE =====
  // Kirby is a SPECIAL marker at Home: unlike the 12 encounters, the finale is REPLAYABLE
  // (no `once`) so Isa can revisit the reveal + letter any time. Kirby also never bobs, never
  // fades on completion, and stands on the ground (see WorldScene._makeMarkers + markComplete).
  // The `memory` step is safely de-duplicated by MemoryAlbum.revealMemory (by photo `src`),
  // so replays don't inflate the counter.
  //
  // Trimmed per SCRIPT rewrite: finale.1 (guide) -> finale.2 (memory) -> finale.3 (guide) ->
  // {music:"11"} (the finale song swells in at the reveal) -> letter -> {memory finale, silent}
  // -> end.
  finale: {
    id: "finale", zone: "home", finale: true,
    steps: [
      { say: "This is the last one, Isa. You found all the others.", who: "guide" },
      { say: "He's so *gol mol*, isn't he. My Mocoso!", who: "memory" },
      { say: "That's me! I love you so, so much. I have one more thing for you.", who: "guide" },
      { music: "11" },  // the finale song swells in at the reveal (kept mid-encounter, not at top)
      { letter: true },
      // The letter shows FINAL_PHOTO embedded; silently register it as the last memory so the
      // album + counter stay 1:1 with photos (no separate full-screen reveal).
      { memory: { id: "finale", photos: [FINAL_PHOTO], silent: true } },
      { end: true },
    ],
  },
};

// Memories are 1:1 with PHOTOS (the album stores one entry per revealed photo). Derive the
// total by counting every photo across all encounters, so the counter (collected/TOTAL) is
// always 1:1 with the album — e.g. `trips` reveals 2 photos and counts as 2.
export const TOTAL_MEMORIES = Object.values(ENCOUNTERS)
  .flatMap((e) => e.steps)
  .filter((s) => s.memory)
  .reduce((n, s) => n + s.memory.photos.length, 0);
