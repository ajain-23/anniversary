# Audio — what to add

The audio **engine is fully wired.** Just drop files in with the exact names below and they play.
**Missing files stay silent (no errors)** — so you can add them in any order, a few at a time.
After adding: `git add -A && git commit -m "Add audio" && git push` → the site redeploys.

## Where files go
- Songs → `public/assets/audio/`
- SFX  → `public/assets/audio/sfx/`
- Format: **`.mp3`** (tell me if yours are wav/ogg/m4a and I'll adjust).

## How the music works (mixtape model)
- **One song per encounter** (11 encounters — `trips` reveals 2 photos but gets ONE song).
- A song swaps in when its memory starts (under the dialogue duck), then **keeps playing through
  the walk** until the next memory swaps it. Swaps are **crossfaded (~1.8s)** so they're smooth,
  not abrupt — and they happen while dialogue is quiet, so you never hear a hard cut.
- **`title`** plays on the title screen AND the opening walk (spawn → first memory).
- Music sits at 50% and **auto-ducks to 40%** during each memory so words/reveals land.

## Songs — 12 files (`title` + 01–11)  → `public/assets/audio/`
- [ ] `title.mp3` — title screen + opening walk · *"wondering why"*
- [ ] `01.mp3` — **pond** (who she is)
- [ ] `02.mp3` — **usual** (coffee / name returns)
- [ ] `03.mp3` — **insurance** (sweet treats)
- [ ] `04.mp3` — **firstDate**
- [ ] `05.mp3` — **falling** (fireworks)
- [ ] `06.mp3` — **iloveyou**
- [ ] `07.mp3` — **family**
- [ ] `08.mp3` — **trips** (San Diego + Mexico City — one song)
- [ ] `09.mp3` — **graduation**
- [ ] `10.mp3` — **notices**
- [ ] `11.mp3` — **finale** (swells in at the reveal, carries the letter)

## SFX — 6 files  → `public/assets/audio/sfx/`
- [ ] `warm.mp3` — coffee cup / her name returns (soft warm chime)
- [ ] `memory.mp3` — **every photo reveal** (gentle twinkle/shutter)
- [ ] `chime.mp3` — the "I love you" beat (also reused when a gate opens)
- [ ] `fireworks.mp3` — the fireworks moment
- [ ] `cheer.mp3` — graduation (crowd cheer)
- [ ] `letter.mp3` — finale letter opening (soft paper/unfold)

## Skip (defined but never triggered — don't source)
- `squirrel.mp3` (encounter removed).

## Tips
- Songs **loop** — a clean loop point helps, but since they swap every memory, seamless looping
  matters less than for the old zone beds.
- SFX should be short (<1–2s) so they don't step on dialogue.
- Levels are tunable in `src/ui/AudioManager.js`: `musicVolume` (0.5), `duckFactor` (0.4),
  SFX volume (0.6), crossfade length (1800ms). Tell me if anything's off.
