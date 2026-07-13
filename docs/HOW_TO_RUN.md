# A Dream Come True — how to run & where to put your content

## Run it
    export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"   # load node (once per terminal)
    cd ~/isa-game
    npm run dev
Open the printed URL. Title screen -> press any key -> play.

Controls: WASD move · SPACE/ENTER advance & interact · TAB album · click a photo to
enlarge (← → to browse) · M mute · ESC close.

Progress saves automatically (localStorage). To replay from scratch, clear the site's
storage in your browser, or run this in the browser console:
    localStorage.clear()

## The full game is built (with placeholders)
- Title + dedication ("A Dream Come True" / "for Isa")
- Continuous 5-zone world (Threshold -> Meadow -> Shore -> City -> Home) on the delivered
  60x86 tilemap; secret Kirby peeks in from screen edges; constant warm ambient tint
- All 12 encounters with dialogue, verbs, photo reveals, soft (dialogue-nudge) gates
- Effects: fireworks, confetti, cap-swap, pond cutscene, animated fountain
- Memory counter (X/12, 1:1 with photos) + browsable album gallery
- Finale: reveal -> your letter -> wordless sunrise end
- Audio hooks (music per zone + SFX) with mute — silent until you add files

## WHERE TO PUT YOUR REAL CONTENT (swap these in — no code needed)

### Photos  ->  public/assets/photos/
Replace these placeholder files (keep the same names, or use .jpg/.png and update the
paths in src/data/encounters.js):
  placeholder1.svg  = E3 coffee / "the usual"
  placeholder2.svg  = E4 sweet treats
  placeholder3.svg  = E5 "who you are"
  placeholder4.svg  = E6 first date
  placeholder5.svg  = E7 falling (fireworks/summer)
  placeholder6.svg  = E8 first "I love you" (winter/tender)
  placeholder7.svg  = E9 San Diego
  placeholder8.svg  = E9 Mexico City
  placeholder9.svg  = E10 family
  placeholder10.svg = E11 graduation
  placeholder11.svg = E12 "the one who notices" (realest us)
  placeholder_final.svg = the letter photo (us, now)
Captions live in src/data/encounters.js (edit the `caption` fields).

### The letter + names  ->  now written in docs/SCRIPT.md (pending code apply)
The real letter and the family lines are already written in `docs/SCRIPT.md` and will be applied
to `src/ui/LetterUI.js` (letter) and `src/data/encounters.js` (family) as part of the SCRIPT
rewrite — see `docs/SCRIPT_REWRITE_HANDOFF.md`. (Note: the family NPC name-labels were removed in
the rewrite, so no separate "Mom/Sister names" drop-in is needed.)

### Music/SFX  ->  public/assets/audio/  and  public/assets/audio/sfx/
See filenames in src/ui/AudioManager.js:
  title.mp3 ("wondering why"), meadow.mp3, shore.mp3, city.mp3, finale.mp3 ("stupid")
  sfx/warm.mp3, chime.mp3, squirrel.mp3, fireworks.mp3, cheer.mp3, letter.mp3, memory.mp3
Missing files fail silently (no crash), so add what you have.

### Real art (tiles + sprites)  ->  tiles DONE, sprites PARTIAL
The world renders the **delivered artist tilemap** (LimeZu "Modern Exteriors", 60×86, 16px).
- Map + tilesets the game loads: `public/assets/map/world.tmj` + `public/assets/map/tilesets/*.png`.
- Wiring: `src/engine/MapLoader.js` parses the tmj; `src/scenes/WorldScene.js`
  `preload()`/`create()` render it and read its object/collision/zone layers.
- Sprites live in `public/assets/sprites/`. Swap a file (same name) to reskin.
  - **Snoopy (Isa)** = the player — WIRED IN with a 4-direction WALK CYCLE. `snoopy.png` is
    a multi-sprite sheet; 12 walk frames are carved by exact box (`SNOOPY_FRAMES` in
    WorldScene.js) into anims `snoopy_down` (0-3), `snoopy_left` (4-5), `snoopy_right` (6-7),
    `snoopy_up` (8-11) — each direction drawn, NO flipping — via `_makeSnoopyFrames()`.
    (snoopy.png also has a Flying-Ace walk cycle + Woodstock frames, unused/available. The older
    `snoopy.png` cap-and-gown grad sheet is unused but kept — a candidate for the E11 grad look.)
  - **Kirby** = `kirby.png` (full-body) is the finale marker + end screen. `secretkirby.png`
    (heart-topped head) is the edge-peek only. Both DONE.
  - **Ambient NPCs** = the LimeZu NPC pack in `public/assets/sprites/npc/` (15 sheets `NPC_1..15`,
    128×208 each = 8×13 @16px; 3 skin tones × 4 dirs DOWN/LEFT/UP/RIGHT; cols 0-3 idle, 4-7 walk).
    WIRED IN: 24 idle/walking NPCs spread through the world (with positive emote bubbles when
    Snoopy passes, from `npc/Emotes/`), plus the always-present graduation-stands crowd. NPCs are
    solid (collision). Placements/behavior live in `AMBIENT_NPCS` + the `_makeNpc*`/`_spawn*`
    helpers in `WorldScene.js`. This covers the old "family crowd" TODO.
  - STILL TODO (sprites): **cap-and-gown Snoopy** for graduation (`snoopygrad.png` exists but
    isn't wired — `capSwap()` currently just pops a cap prop onto normal Snoopy). (Squirrel
    sprite is moot — that encounter was removed.)
  - Encounter **markers** = envelope sprite (`letter.png`); skin per-encounter later if desired.
  - Cursor = lily (`lily.png`) + leaf trail (`leaf.png`) — done.
  - **Animated fountain** — DONE (`tilesets/animated/Fountain_16x16.png`).
  - **Lighting** = a single constant warm ambient tint (no phased/per-zone/dawn lighting —
    that idea, and the growth/lily motif, were dropped; don't reintroduce).

## Build / deploy
    npm run build      # -> dist/
    npm run preview    # preview production build
Deploy dist/ to GitHub Pages (keep repo PRIVATE / URL unlisted per the music plan).
