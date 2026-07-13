# Handoff: apply the SCRIPT.md rewrite to the game

> ## ✅ APPLIED (done). This spec has been fully implemented — kept for reference.
> Everything below was applied: new order, squirrel removed, pasta first, gate g2 → insurance,
> 4-phrase intro, verbs/captions, real letter, trimmed finale (kept `{music:"finale"}`),
> `STORY_ORDER` updated, `FINAL_PHOTO.caption = "Isa y Ayush"`.
> **One later change beyond this spec:** `trips` and `family` were SWAPPED to `family → trips`
> (spatial — family sits by the city gate exit), so the city order is family → trips →
> graduation → notices. Also the marker prompt reads **"SPACE to open"**. See the NEWEST-SESSION
> box in `docs/HANDOFF.md` for full current state (incl. the ambient-NPC system added the same
> session).

**(HISTORICAL — the original task brief.)** The user rewrote `docs/SCRIPT.md` (dialogue AND
structure). Job: apply that rewrite to the code. This doc is the implementation spec — it lists
every change, the user's decisions, and the gotchas. **`docs/SCRIPT.md` is the source of truth
for the actual text; this doc tells you what STRUCTURAL work was needed and how.**

---

## 0. Decisions already made with the user (don't re-litigate)

- **squirrel encounter → REMOVE ENTIRELY** (encounter data + its map marker/position + drop the
  "squirrel sprite" TODO). It's gone from the new order.
- **pasta → promoted to the FIRST encounter, ON-PATH, NO GATE** (flavor opener, no photo). It was
  previously an off-path `egg: true` easter egg. Remove `egg`, put it first in order; it does NOT
  gate progress.
- **Meadow gate flow:** only **g2**, opening after **`insurance`** (end of meadow). `pond` NO
  LONGER opens a gate (it used to open g2). g1 still opens at the end of the intro; g3 after
  `iloveyou`; g4 after `notices` (unchanged).
- **family (E9): remove the Mom & Sister NPC lines** (`family.2`, `family.3`). Keep the
  `visitAll` verb + the single MEMORY line + guide lines. (Impact: the E10 family-Snoopy crowd
  sprites no longer need name labels.)
- **Finale: use the user's trimmed lines BUT still swap music.** Keep a `{ music: "finale" }`
  step even though the user's script dropped the explicit `[MUSIC]` marker. Trimmed finale =
  finale.1 (guide) → finale.2 (memory) → finale.3 (guide) → `{music:"finale"}` → letter →
  `{memory finale, silent}` → end.
- **Tone:** the rewrite intentionally shifts the GUIDE to a playful/affectionate boyfriend voice
  (hype, jokes, Spanish). Apply as written — do NOT "correct" it back to the old wistful tone.

---

## 1. NEW ENCOUNTER ORDER (this is the big structural change)

Old order: usual → insurance → squirrel → pond → firstDate → falling → iloveyou → trips →
family → graduation → notices → finale.

**NEW order (from SCRIPT.md):**

| # | id | zone | photo | gate after | notes |
|---|-----|------|-------|-----------|-------|
| 1 | `pasta` | meadow | none | — | was off-path egg; now first, on-path, no photo, no gate |
| 2 | `pond` | meadow | 3 | — | moved earlier; **no longer opens a gate** |
| 3 | `usual` | meadow | 1 | — | |
| 4 | `insurance` | meadow | 2 | **g2** | end of meadow → opens Park |
| 5 | `firstDate` | park | 4 | — | |
| 6 | `falling` | park | 5 | — | fireworks |
| 7 | `iloveyou` | park | 6 | **g3** | end of park → opens City |
| 8 | `trips` | city | 7 & 8 | — | |
| 9 | `family` | city | 9 | — | |
| 10 | `graduation` | city | 10 | — | set-piece |
| 11 | `notices` | city | 11 | **g4** | end of city → opens Home |
| 12 | `finale` | home | 12 (final) | — | reveal → letter → end |

`squirrel` is REMOVED. `pasta` is IN.

### What this order drives (update ALL of these):
1. **`STORY_ORDER`** in `src/scenes/WorldScene.js` — the wayfinder + progression order. Replace
   the array with the new order above (drop `squirrel`, add `pasta` first, move `pond`).
2. **Gate `{gate:...}` steps** move in `encounters.js`:
   - REMOVE `{gate:"g2"}` from `pond`'s steps.
   - ADD `{gate:"g2"}` as the last step of `insurance`.
   - (g3 stays on `iloveyou`, g4 stays on `notices`.)
3. **Photo count is unchanged (12 total)** — squirrel had no photo, pasta has no photo. So
   `TOTAL_MEMORIES` stays 12. Verify after edits.
4. **Marker POSITIONS** — see §4 (map/placement) below. This is the trickiest part.

---

## 2. TEXT CHANGES (apply verbatim from SCRIPT.md)

All spoken lines were rewritten. Map each `id.n` in SCRIPT.md to the matching `say` step in
`encounters.js`. Notes on line-count changes per encounter:

- **usual**: `usual.5` (the "album — TAB to look" tutorial line) was REMOVED. Order is
  usual.1 (npc) → verb → sfx → usual.2 (mem) → usual.3 (mem) → usual.4 (guide) → photo →
  usual.6 (guide). (The album/TAB tutorial now lives in the intro — see intro.3.)
- **insurance**: gains `{gate:"g2"}` at the end (see §1).
- **pond**: `pond.4` (the "you read romances/mysteries" line) was REMOVED. New: verb → cutscene →
  pond.1 (mem) → pond.2 (guide) → photo → pond.3 (guide) → endCutscene. NO gate now.
- **firstDate / falling / iloveyou / trips / graduation**: dialogue rewritten, same step shapes.
- **family**: REMOVED `family.2` (Mom NPC) and `family.3` (Sister NPC). New: family.1 (guide) →
  verb → family.4 (mem) → family.5 (guide) → photo → family.6 (guide).
- **notices**: REMOVED `notices.3` (a memory line). New: notices.1 (guide) → verb → notices.2
  (guide) → notices.4 (guide) → photo → notices.5 (guide).
- **finale**: heavily trimmed (see §0 finale decision). Re-add `{music:"finale"}`.

### Verb label changes (the quoted `[VERB: ...]` text):
- `pond` lookIn: "look into the pond" → **"look at your reflection"**
- `family` visitAll: "go to your people" → **"see yourself"**
- `graduation` wearCap: "put on the cap" → **"walk the stage"**
- (others unchanged: usual/insurance/firstDate take, falling watch, iloveyou sayIt, trips take,
  notices open. Double-check each against SCRIPT.md.)

### Photo captions (all editable — apply verbatim from SCRIPT.md):
- usual P1: "just a girl and her lunch (?!)"
- insurance P2: "butter, sugar, and love"
- pond P3: "the cutest girl to ever live"
- firstDate P4: "the first date — june 28, 2025"
- falling P5: "fireworks into forever – july 23, 2025"
- iloveyou P6: "three little words – december 5, 2025"
- trips P7/P8: "on the road..." / "...and in the air"
- family P9: "everyone you hold"
- graduation P10: "what you built"
- notices P11: "the one who notices"
- finale P12 (FINAL_PHOTO): "Isa y Ayush"  (update `FINAL_PHOTO.caption` in encounters.js)

### Formatting: nothing special to fix.
SCRIPT.md is clean — the earlier doc-glitches (stray backticks in the insurance caption, the
`intro.phrase3` colon-in-backticks, and the `\\n` double-backslashes in `iloveyou.5`/`notices.5`)
have all been corrected in the source. Just apply the `\n` line-breaks as written (single
backslash-n = one in-box line break, which `DialogueManager`/text already handles).

---

## 3. INTRO / STARTING TEXT (in `src/scenes/WorldScene.js` `_playIntro()`)

- **Fade-in phrases went 3 → 4.** Replace the `phrases` array with the 4 new lines
  (intro.phrase1–4 from SCRIPT.md: "Había una vez…" / "...there was a really special girl..." /
  "Exactly one year ago..." / "This is their story."). Consider they're longer now — the current
  code shows each for a fixed 1300ms; longer sentences may need more time. Suggest ~1800–2200ms
  for the long ones, or scale by length. Confirm feel with a build.
- **Opening guide lines** (intro.1–3) rewritten — apply verbatim. Note intro.3 now teaches BOTH
  the golden arrow (wayfinder) AND the album/TAB (the tutorial that used to be in `usual.5`).
- **First-peek line** (`peek.1`) rewritten → "Hm? ...Don't mind the bola. It's just your super
  secret super admirer." Update in `_ambientPeek()`.

---

## 4. MAP / MARKER PLACEMENT (do this carefully — use the debug tile HUD)

The order change means marker positions likely need to move so the walk reads correctly
(pasta first, pond early, squirrel gone). Encounter positions come from the delivered Tiled map
(`encPos` from `mapData.encounters`), with per-id overrides in `ENC_POS_OVERRIDES` and sprite
nudges in `MARKER_TWEAKS` (both in WorldScene.js).

Steps:
1. **squirrel:** remove its marker. If it's a Tiled `encounter:squirrel` object you can't easily
   edit the .tmj — instead just deleting the `squirrel` encounter from `ENCOUNTERS` means no
   marker is drawn for it (the marker loop iterates ENCOUNTERS). Verify no stray reference.
2. **pasta:** it needs a real on-path position now (was an egg, may have no/last-priority
   position). Give it an `ENC_POS_OVERRIDES` tile near the meadow start, before pond. Use debug
   mode (press ` `` ` to toggle) → tile HUD to pick a walkable tile.
3. **pond moved earlier in ORDER** but its physical position may be fine where it is; what
   matters is the wayfinder points there 2nd. Confirm the walk from pasta→pond→usual→insurance
   flows spatially (no big backtracking). If it feels wrong, add `ENC_POS_OVERRIDES`.
4. `falling` already has an override at tile 35,45 (bayfront) + fireworks anchor — leave as-is.
5. After moving things, walk it (or headless-teleport via `replay(id)`) to confirm each marker
   is reachable and the wayfinder chain makes sense.

**Debug tools available (already built):** press the backtick key ( ` ) in-game to toggle debug
mode → tile HUD (bottom-left: tile/px/blocked under cursor) + replay panel (bottom-right: click
an encounter to teleport there and play it) + walk-speed slider.

---

## 5. THE LETTER (`src/ui/LetterUI.js`)

Replace `LETTER_PLACEHOLDER` with the real letter from SCRIPT.md (letter.p1–p5 + sign-off).
Each `letter.pN` = one `<p>`. Sign-off `letter.sign` is right-aligned "— Ayush".
The final photo (FINAL_PHOTO, caption "Isa y Ayush") is auto-embedded at the bottom.

---

## 6. THINGS FLAGGED TO THE USER — ALL RESOLVED (nothing to do; just context)

The user reviewed and resolved every flag; SCRIPT.md already reflects these. Apply the script
as written — do NOT "correct" any of the below:
- `falling.2` intentionally puts a joke ("he sent me a picture of his burrito bowl") on the
  fireworks/kiss beat. Keep it.
- `falling` caption fixed by the user → "fireworks into forever – july 23, 2025".
- insurance caption backticks: fixed in SCRIPT.md.
- `intro.phrase3` colon-in-backticks + `iloveyou.5`/`notices.5` double-backslash: fixed in
  SCRIPT.md.
- The mixed register (playful GUIDE + some wistful MEMORY lines) is intentional. Do not homogenize.

---

## 7. STILL-OPEN CONTENT (unchanged from before, not part of this rewrite)

- Real photos (12) still placeholders in `public/assets/photos/`.
- Audio still placeholder (finale music = "stupid" per DESIGN, but see the finale music decision;
  title/zone tracks TBD).
- Remaining sprites: family-Snoopy crowd (E9) — NOTE names no longer needed; cap-and-gown
  Snoopy for graduation (`snoopygrad.png` exists, unwired); squirrel sprite TODO is now MOOT
  (encounter removed). Player Snoopy + Kirby are done.

---

## 8. SUGGESTED IMPLEMENTATION ORDER (for the next session)

1. `encounters.js`: reorder object, remove `squirrel`, un-`egg` `pasta`, move `{gate:"g2"}`
   from pond→insurance, add `{music:"finale"}`, apply ALL rewritten `say` text + verb labels +
   captions, fix backticks/`\\n`, update `FINAL_PHOTO.caption`. Verify `TOTAL_MEMORIES` = 12.
2. `WorldScene.js`: update `STORY_ORDER`; update `_playIntro()` phrases (4) + guide lines +
   timing; update `_ambientPeek()` first-peek line; add `ENC_POS_OVERRIDES` for pasta (+ pond
   if needed); confirm squirrel has no dangling refs.
3. `LetterUI.js`: real letter.
4. Build clean; headless-verify (spawn → wayfinder points to pasta → teleport-replay each in new
   order → gates open at insurance/iloveyou/notices → finale → letter → end). Screenshot the
   meadow to check marker placement/backtracking.
5. Manual playthrough of the meadow at least, since order + placement changed most there.
