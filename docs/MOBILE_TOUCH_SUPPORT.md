# Mobile / Touch Support — Findings & Action Plan

> **Status: ✅ IMPLEMENTED.** Touch support was built (P0+P1+P2) — the plan below is now history.
> See the ⚑⚑⚑⚑⚑⚑ box at the top of `docs/HANDOFF.md` for exactly what shipped. Summary of what
> was actually done vs. this plan:
> - **Input:** virtual joystick (`src/ui/TouchControls.js`) for movement; **tap-anywhere** advances
>   dialogue / reveal / letter / end; the **floating "tap to open / tap to <verb>" prompt is the
>   interact trigger** — we tried a dedicated corner action button, then removed it per the user.
>   Album/lightbox got on-screen close + prev/next buttons; album toggle is tappable.
> - **Detection:** mounts only on a coarse pointer / first touch, so desktop is visually unchanged.
> - **Layout:** iOS viewport fixed via `100svh` + `visualViewport` sync (`main.js`); adaptive zoom;
>   responsive fixes for title/dialogue/album/letter/end/HUD; anti-skip tap guards.
> - **Not needed / skipped from the plan below:** the lily cursor stays auto-disabled on touch
>   (no on-touch cursor); no dynamic/tap-to-move joystick (fixed joystick chosen).
>
> The original audit + plan is preserved below for reference.

## TL;DR verdict
The game is **not playable on an iPad or phone as-is**. Rendering and scaling are done well
(correct viewport meta, `Scale.RESIZE`, responsive CSS) — **the problem is input, not layout.**
A touch user can use the **title screen** and the **mute** button, but the moment `WorldScene`
loads they are stuck: there's no way to move (WASD only), advance dialogue / trigger encounters
(SPACE/ENTER only), open the album (TAB only), complete verb prompts, or dismiss the
memory/letter/end screens. Great on a laptop; unplayable on a tablet/phone.

**Decision gate:** if the gift will be opened on a **laptop/desktop**, no work is needed. Only
build the below if it needs to run on her **phone/iPad**.

---

## Audit by area (WORKS / PARTIAL / BROKEN on touch)

| # | Area | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 1 | **Player movement** | BROKEN | `WorldScene.js` `addKeys("W,A,S,D")` (~:314); read in `update()` (~:1490-1493) | WASD only. No joystick / tap / drag. Cannot move at all. |
| 2 | **Advance / interact** (dialogue, encounter trigger, intro, end) | BROKEN | encounter trigger `WorldScene.js` `JustDown(this.spaceKey)` (~:1525); `DialogueManager.js` keydown Space/Enter (~:47-50); end screen (~:1314-1331) | No tap alternative anywhere for advancing text or firing encounters. |
| 3 | **Verbs** (`awaitVerb`, e.g. "take the cup") | BROKEN | `WorldScene.js` `awaitVerb` polls `this.spaceKey` (~:995-1005); prompt suffix "· SPACE" | Keyboard-only. |
| 4 | **Album / TAB + lightbox** | BROKEN | open = TAB only `MemoryAlbum.js` `_wire` (~:157-158); HUD `album (tab)` div `index.html:29` has **no** click handler; lightbox prev/next = Arrow keys (~:163-164) | Thumbnails themselves are tappable (`item.addEventListener("click")` ~:76) but the album can't be opened, and photos can't be browsed. Lightbox closes by bg-tap only. |
| 5 | **Title screen** | WORKS | "press any key" also `this.input.once("pointerdown", ...)` `TitleScene.js` (~:183); Continue/New Game `c.on("pointerdown", ...)` (~:221), `setInteractive` (~:207) | The one genuinely touch-aware screen. Hover glow won't show on touch (cosmetic only). |
| 6 | **Mute (M)** | WORKS | `#mute-toggle` has `addEventListener("click", ...)` `AudioManager.js` (~:67); `cursor:pointer` `ui.css` (~:319) | Tappable. |
| 6b | Other keys: ESC (close), ← → (browse), backtick (debug) | BROKEN / N/A | see table above; debug is dev-only | ESC has partial tap-close only for lightbox bg. |
| 7 | **Layout / viewport** | PARTIAL | `<meta name="viewport" ...>` `index.html:5`; `Scale.RESIZE` + `innerWidth/Height` `main.js` (~:34-41); adaptive camera zoom `_applyZoom` clamps 1.2–4.5 (~:721-724); responsive CSS (dialogue `min(720px,90vw)`, album 2-col <640px, letter stacks <720px) | Renders at a sensible size; no overflow. **But every on-screen hint tells touch users to press keys that don't exist** (see #P2). Dialogue box is large on small landscape phones (not broken). |
| 8 | **Hover-dependent UI** | PARTIAL | `.album-item:hover`, `#end-frame .ef-photo:hover`, title button `pointerover/out`, `.debug-btn:hover` | All hover is **cosmetic**; no functionality is gated behind it. Taps still fire the underlying `click`/`pointerdown`. |

**Already touch-friendly, keep in mind:**
- Custom lily cursor auto-disables on first touch (`CursorTrail.js` ~:76-80, `pointerType === "touch"`).
- Album thumbnails + end-frame photos already use `click` (work as taps).

---

## Full list of keyboard controls and their touch status

| Control | Key | Source (approx) | Touch equivalent today |
|---|---|---|---|
| Move | W/A/S/D | `WorldScene.js:~1490` | **None — BROKEN** |
| Interact / open encounter | SPACE | `WorldScene.js:~1525` | **None — BROKEN** |
| Advance dialogue | SPACE / ENTER | `DialogueManager.js:~48` | **None — BROKEN** |
| Verb prompt | SPACE | `WorldScene.js:~1000` | **None — BROKEN** |
| Memory-reveal dismiss | SPACE / ENTER | `MemoryAlbum.js:~55` | **None — BROKEN** |
| Open/close album | TAB | `MemoryAlbum.js:~158` | **None — BROKEN** (HUD div not clickable) |
| Close album / lightbox | ESC | `MemoryAlbum.js:~159-162` | Partial (lightbox bg-tap only) |
| Lightbox browse | ← / → | `MemoryAlbum.js:~163-164` | **None — BROKEN** |
| Letter close | SPACE/ENTER/ESC | `LetterUI.js:~19` | **None — BROKEN** |
| End screen return | SPACE/ENTER | `WorldScene.js:~1315` | **None — BROKEN** |
| Mute | M | `AudioManager.js:~68` | **YES — WORKS** |
| Debug tools | backtick | `DebugMode.js:~26` | N/A (dev-only) |

---

## Action plan (prioritized)

### P0 — Blockers (game is unplayable on touch without these)
1. **Touch movement.** Add a virtual joystick (or drag/tap-to-move) that feeds the same `ix/iy`
   into the existing movement loop in `WorldScene.update()` (~:1489-1509). A left-thumb on-screen
   stick is the most reliable for a top-down walker. Keep WASD working in parallel.
2. **Tap-to-advance / tap-to-interact.** A screen tap (and/or a large on-screen "A"/action button)
   should resolve the SAME promises/paths as SPACE/ENTER in:
   - `DialogueManager.show` (~:34-50)
   - encounter trigger in `WorldScene.update()` (~:1523-1525)
   - `awaitVerb` (~:995-1005)
   - `MemoryAlbum._revealOne` (~:49-61)
   - `LetterUI.open` (~:18-27)
   - `WorldScene.endScreen` (~:1314-1331)
   - Consider a single shared "confirm" helper so all six share one tap handler.

### P1 — Core UI reachability
3. **Make the "album (tab)" HUD button tappable** — add a `click` listener in `MemoryAlbum._wire`
   (~:156) that toggles `#album` (mirrors the TAB behavior).
4. **On-screen album/lightbox controls** — a tappable **✕ close** for `#album`, and **‹ ›**
   buttons wired to `_lightNav(±1)` (~:95-99), since arrow keys don't exist on touch.

### P2 — Polish / correctness
5. **Device-aware instructional copy.** All hints currently say "press SPACE", "W A S D", "tab",
   etc. Detect touch (or show both) and update:
   - `index.html` hints: `:29` (album), `:32`, `:41`, `:50`, `:58`, `:65`, `:76`
   - Intro line in `WorldScene.js` (~:967): "Explore with the W A S D keys… TAB key"
6. **Verify tap target sizes** for a finger (mute toggle, album/lightbox buttons ≥ ~44px).
   Confirm the custom cursor stays disabled on touch (already handled).

### Suggested implementation notes
- **Detect touch** once (e.g. `pointerType === "touch"` on first pointer event, or
  `matchMedia("(pointer: coarse)")`) and only mount the on-screen controls then, so desktop is
  visually unchanged.
- **Do not remove keyboard controls** — add touch alongside, so both work (nice for a laptop with
  a touchscreen).
- The movement loop and every SPACE handler are already centralized, so touch can be layered in
  without disturbing existing logic.
- Retest a **full start→finish run on an actual iPad/phone** (Safari + Chrome) once P0+P1 land —
  the audit was static; only a device run confirms feel (joystick size, tap zones, dialogue box
  height in landscape).

### Rough scope
- P0: the bulk of the effort (new virtual-joystick + shared tap-confirm plumbing).
- P1: small, localized DOM/handler additions.
- P2: copy + sizing tweaks.

---

## Bottom line
Rendering is fine; **input is the whole job.** P0 makes it *playable*; P0+P1 make it *comfortable*;
P2 makes it *polished*. If the gift is opened on a laptop, none of this is required.
