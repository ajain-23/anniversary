# Contractor Brief — Tilemap for "A Dream Come True"

**Job:** Build the complete 5-zone game world as a single **Tiled** map (`.tmj`) using the
**LimeZu "Modern Exteriors"** tileset. This is a small pixel-art web game (a personal
anniversary gift). The map is one continuous vertical world the player walks up through — a
full day, from early morning at the bottom to the next dawn at the top.

**Style note (important):** The tiles are semi-realistic urban pixel art. Build a believable,
cozy real-world town. Warmth comes from layout, props, and the game's own lighting; your job
is a clean, readable, lived-in space.

---

## ★ OVERALL FEEL — read this first (applies to EVERY zone)

**The whole game must feel beautiful, warm, and cozy — at ALL times. NO zone should ever look
grey, washed-out, drab, or dim.** Even the evening and night zones are gorgeous: they use
warm/cool color and lots of little lights, never a flat grey or dark wash.

- Paint with **saturated, warm, inviting colors** everywhere. Lots of warm wood, brick, soft
  greens, golden accents, flowers, glowing windows. Think "the most charming, cozy street you
  could imagine," in every zone.
- **Every zone must contain warm light sources** — porch lamps, string lights, lanterns, lit
  shop windows — even the quiet opening one. (These get `light` markers; the engine makes them
  glow, which is how night stays snug instead of dark.) Be generous with them.
- The game shifts the *color temperature* by time of day (warm early morning → bright
  afternoon → golden evening → warm lamplit night → soft dawn). It does NOT desaturate or grey
  anything. So you never paint anything grey — you just make sure each zone has the props/lights
  that let the engine's warm lighting shine.
- Litmus test: a still frame of ANY zone, on its own, should look like a cozy, pretty place
  someone would want to live. If a spot looks bleak or empty, add warmth (a lamp, a planter,
  a bench, a lit window, a flower bed).

---

## 1. Deliverables (what you hand back)

1. **`world.tmj`** — one Tiled map, JSON format (`.tmj`), containing ALL 5 zones stacked
   vertically in a single map (NOT 5 separate files).
2. **The tileset file(s)** you used (the Modern Exteriors PNG(s) + any `.tsx` Tiled tileset
   definitions), embedded or referenced so the map opens cleanly on another machine.
3. A short **`NOTES.txt`**: which tileset version you used, anything you improvised (e.g. how
   you wove the park → bayfront → train station together, or dressed the graduation stage), and
   any spots you were unsure about.

Everything must open in a fresh copy of **Tiled** (https://www.mapeditor.org, free) with no
missing-tileset errors.

---

## 2. Hard technical specs (do not deviate — the engine depends on these)

| Spec | Value |
|------|-------|
| Editor | Tiled (free), save as **`.tmj`** (Tiled JSON) |
| Tile size | **16 × 16 px** (Modern Exteriors native). The game renders at 2× (looks 32px). |
| Map size | **64 wide × 64 tall** tiles (this is the max; you may use fewer rows but keep width 64). |
| Orientation | Orthogonal, top-down. |
| Tileset(s) | **LimeZu "Modern Exteriors" ONLY.** If a single prop is truly missing, the matching-style "Modern Interiors" props pack is acceptable (same artist, no seams). Do NOT mix in a different art style. |
| Layers | Exact names + order below. |
| Object layer | Exact marker names below (this is how the game finds encounters/gates/etc.). |

If any spec here conflicts with something you read elsewhere, **this file wins** — check with
the owner before changing tile size or map dimensions.

---

## 3. Layer structure (create these EXACT layer names, bottom → top)

Tile layers (paint order matters — later layers draw on top):

1. **`ground`** — base terrain EVERYWHERE, no gaps/holes: road, sidewalk, grass, plaza
   paving, water. Every cell must have a ground tile.
2. **`path`** — the walkable route / special flooring drawn on top of ground (e.g. a lighter
   sidewalk path, park trail, plaza tiles).
3. **`walls`** — solid structure: building walls, storefronts, fences, planters, fountain
   base, stage platform.
4. **`decor`** — props above the wall base but below the player: benches, carts, bushes,
   street lamps' posts, string-light poles, flowers, signs, trash cans, tables.
5. **`overhead`** — anything that should draw ABOVE the player for depth: roof tops, awnings,
   tree canopies, the tops of tall signs. (The game layers the player between `decor` and
   `overhead`.)

Special layers:

6. **`collision`** — INVISIBLE in game. Paint ANY tile onto every cell the player must NOT
   walk through: wall bases, water, fountain, furniture footprints, tree trunks, fences, the
   sides of the stage. Only *presence* matters (which tile you use is irrelevant). Leave the
   walkable path and encounter stand-spots CLEAR.
7. **`objects`** — an **object layer** (not tiles). Markers that tell the game where things
   are — see Section 5. This is the most important non-visual part; get the names exact.

---

## 4. The world: 5 zones, bottom → top

One continuous map. The player spawns at the **bottom** (early morning, sunrise) and walks
**up** through a full day to the **top** (dawn of the next day — a full circle). Think of it as
a single winding main street/path that threads upward, with each ~1/5 of the map height being a
different zone/time-of-day:

**early morning → afternoon → evening → night → dawn** (Zones 1 → 5).

The game applies the time-of-day color and lighting itself, so **paint everything at its bright,
fully-saturated daytime look** — do NOT pre-darken or grey the evening/night zones; the engine
warms/cools them at runtime. ("Bright daytime" means lush and colorful, NOT flat or dull — see
OVERALL FEEL.) Just make sure lamps, string lights, and windows exist as props so the engine can
light them.

Keep it **compact and dense** — no big empty stretches. A ~10–15 minute walk. Small, cozy,
lived-in. The winding path should gently guide the player upward and past each encounter
prop in order; a couple of side props can sit just off the path.

**Continuity matters.** This is ONE connected world, not five separate scenes — the player
walks the whole way without teleporting. Each zone must flow naturally into the next: the path
leaves one zone and arrives at the next in a way that makes physical sense (a street becomes a
park entrance; the park's edge leads to a train platform; the platform leads out into
downtown; downtown leads home). Where a zone has a distinct location (park, train station,
hotel, bayfront), make sure there's a sensible way IN and OUT along the path.

**You may enrich the world at your discretion.** Beyond the required encounter props, add
extra buildings, storefronts, background people, vehicles, street life, gardens, etc. to make
each zone feel like a full, living place — as long as it doesn't block the path or clutter an
encounter's stand-spot. These extras are purely decorative (no markers, no dialogue); they just
make the world believable. Lean into this so no zone feels empty.

### Zone 1 — THE QUIET STREET (bottom of map, early morning / sunrise)
Small, enclosed, still, intimate. A suburban residential street / a stoop or doorway where she
"wakes" OUTSIDE (no interiors — she is never inside a building). Narrow feel.
- **Feel: a beautiful early morning at sunrise — warm gold light, soft and fresh, a cozy porch
  lamp still glowing. NOT grey, bleak, or empty.** It's the calm OPENING, so keep it a little
  simpler and less busy than the other zones — but paint it just as warm and pretty. Include a
  lit porch/window + a lamp (put `light` markers on them) so it reads snug from the first frame.
- Contains: `start` spawn point.
- A narrows/gap at the top of this zone = `gate:g1` (the game "opens" it).

### Zone 2 — THE NEIGHBORHOOD (afternoon)
Sidewalks and small storefronts — the cozy heart of a walkable neighborhood, bright and busy
in warm afternoon light. Feel free to add extra shops, homes, and background life here.
- A **CAFÉ** (storefront + awning + a counter/window) → `encounter:usual`.
- A **BAKERY** (storefront or stall) → `encounter:insurance`.
- A **RESTAURANT** (storefront, off the main path) → `encounter:pasta`.
- A **fountain** with a little green around it → `encounter:pond`. (Also mark it
  `anim_fountain` — see Section 6.)
- Near the **TOP of this zone**, a **tree standing on the path** that the player must walk
  around → `encounter:squirrel`. Place it so it's the last beat before the zone exits into the
  park — a little natural gateway of greenery leading toward Zone 3.
- Flowers, benches, planters, a few trees. Warm and green.
- Top narrows = `gate:g2` (into the park).

### Zone 3 — THE PARK & BAYFRONT (evening)
The romantic middle — a **magical golden summer evening** sliding toward dusk. Warm and
glowing. This zone is three connected settings the path threads through in order: a real park,
then the waterfront edge of that park, then a small train station. **String lights** between
poles/trees are essential (they become glowing point-lights at runtime). Lush greenery, flower
beds, warm lamplight throughout. (Cozy-romantic, never dim.)

Layout, bottom → top (design the transitions so it reads as one continuous stroll):

1. **A REAL PARK** — an actual park that clearly reads as a park: winding path, lawns, big
   leafy trees, flower beds, park benches, maybe a bandstand/pond/lamp posts. At its edge, a
   **GELATO / ICE-CREAM SHOP** (a storefront — awning, window, maybe a couple of outdoor
   tables/benches) → `encounter:firstDate`. This should feel like a lovely place to grab a cone
   and sit on a date.

2. **THE BAYFRONT** — the park opens onto the **edge of a large body of water** (a bay). A
   waterfront promenade / railing along the shore, with **boats on the water**, maybe a small
   dock or pier, gulls, benches facing the water. An **open spot along the promenade facing the
   open water** → `encounter:falling` (fireworks burst in the sky OVER THE WATER at runtime —
   leave open sky/water above/beyond this spot; the reflection over the bay is the point). Weave
   the park and the water together naturally (the lawn meets a low sea-wall/railing, etc.) —
   artist's discretion on exactly how.

3. **A SMALL TRAIN STATION** — the promenade leads to a modest **train station: a platform with
   a train** (Modern Exteriors has train/station pieces). This is where `encounter:iloveyou`
   happens — a quiet, intimate spot on the platform (a bench under a lamp). **Continuity is
   important:** it must make sense how the player walks from the bayfront ONTO the platform, and
   how they leave the platform to reach downtown (Zone 4) — e.g. the platform's far end has
   steps/an exit up into the city. Don't strand the station; wire it into the path in and out.

- Lamp posts, string-light spans, garden beds, benches, waterfront railing.
- Top narrows = `gate:g3` (station exit → downtown).

### Zone 4 — DOWNTOWN AT NIGHT (night)
The liveliest, busiest zone — a **warm lamplit** downtown at night: streetlights, lanterns, a
plaza, and shopfronts with **glowing lit windows**. Think a cozy, festive city street at night —
deep and rich but DRENCHED in warm light, alive and inviting, NEVER dark/dreary. Ascending
toward the brightest point. Be very generous with `light` markers here (every lamp, lantern,
and lit window) — that warm glow keeps the night snug. Great zone to add extra background city
life (shops, signs, passersby, cars) at your discretion.

Layout, bottom → top:

- **A HOTEL** near the entrance of downtown — a proper hotel building (entrance, canopy/awning,
  luggage cart, lit lobby windows, maybe a doorman spot). The `encounter:trips` beat lives HERE:
  place the marker in front of / beside the hotel. (The memory is about traveling together, so
  a hotel is the anchor — it reads as "trips.") Leave room for a small marker area.

- **A COURTYARD / PLAZA** with open floor for ~4–5 people to stand → `encounter:family`. (Do
  NOT paint the people — they're sprites placed by the game. Just leave a clear courtyard.)

- **A GRADUATION STAGE at the highest point of this zone** → `encounter:graduation`. Modern
  Exteriors HAS a stage — use it. Dress it so it clearly reads as a **graduation**: a banner /
  bunting / balloons, chairs or a podium, a short set of steps she walks up onto. Leave a clear
  FLAT AREA in front of the stage for a **cheering crowd** — DO paint a crowd of people
  facing the stage here (Modern Exteriors has people/character tiles; fill the seating/standing
  area so it feels like a packed graduation ceremony). This is the visual peak — make it feel
  triumphant, "up here you've arrived."

- **A QUIET STREET CORNER near the top exit** → `encounter:notices`. Give this corner a
  **distinct landmark** so the player recognizes it as a special spot (artist's discretion — e.g.
  a lone lit phone booth, a mailbox, a memorial fountain, a clock, a flower stand, a bench under
  a single warm streetlamp). It should feel quiet and set-apart from the busy plaza — an
  intimate pause right before Home.

- Streetlamps, lanterns, lit shopfront windows, plaza paving.
- Top narrows = `gate:g4` (leads into Home).

### Zone 5 — HOME (top of map, dawn / sunrise — full circle)
Small, warm, intimate. A cozy **house or apartment exterior** with a **porch**, a little
**garden**, and **windows that will glow**. The day has come full circle back to dawn (she woke
at sunrise; she ends at the next one) — bathe it in warm sunrise gold. This is the ending — keep
it simple and uncluttered so the final moment can breathe.
- The house/porch = `encounter:finale`.
- **Do NOT place any `lily` markers here** (the blooming-lily trail stops before Home — see
  Section 5). A tidy static garden is fine.

---

## 5. Object markers (THE most important non-visual deliverable)

On the **`objects`** layer, add objects (the **Point** tool is easiest) and set each object's
**Name** exactly as listed. Case-sensitive. The text after a colon is an id the game reads —
type it exactly.

Place each encounter/gate marker **where the player should STAND to trigger it** — usually
just in front of / below the prop it belongs to, on a walkable (non-collision) cell.

### Required — one of each:
```
start                    ← spawn point                    (Zone 1)
encounter:usual          ← café                            (Zone 2)
encounter:insurance      ← bakery                          (Zone 2)
encounter:pasta          ← restaurant (side)               (Zone 2)
encounter:pond           ← fountain                        (Zone 2)
encounter:squirrel       ← the tree on the path, near TOP  (Zone 2, last beat)
encounter:firstDate      ← gelato / ice-cream shop         (Zone 3)
encounter:falling        ← bayfront promenade, facing water(Zone 3)
encounter:iloveyou       ← train station platform          (Zone 3)
encounter:trips          ← the hotel                       (Zone 4)
encounter:family         ← courtyard/plaza                 (Zone 4)
encounter:graduation     ← graduation stage, near TOP      (Zone 4)
encounter:notices        ← quiet street corner w/ landmark (Zone 4)
encounter:finale         ← house/porch                     (Zone 5)
gate:g1                  ← narrows, Zone 1 → 2
gate:g2                  ← narrows, Zone 2 → 3 (into the park)
gate:g3                  ← narrows, Zone 3 → 4 (station exit → downtown)
gate:g4                  ← narrows, Zone 4 → 5 (Home)
```

### Repeatable markers (place as many as make sense):
```
lily        ← a calla-lily spot beside the path. (See the important note below.)
light       ← a warm point-light source. (See note below.)
```

**`lily` — how the flower motif works (please read; this is central to the game):**
The main storyline motif is that **calla lilies line the entire walking path, and each one
BLOOMS as the player walks past it** — leaving a trail of blooming flowers behind her the whole
journey (it visualizes "she's coming back to life as she remembers"). The engine does the bloom
animation; **your job is just to mark WHERE the lilies are.**
- Drop a `lily` marker on the ground **right beside the path**, repeatedly, all the way ALONG
  the route — from Zone 1 up to (but NOT into) Zone 5 / Home.
- Space them fairly evenly, roughly every few tiles, so they read as a continuous ribbon of
  flowers following the path. Aim for **~20–40 markers** total across the four zones.
- Put them on walkable-adjacent cells beside the path (in the grass/verge), NOT on the path
  itself and NOT on collision cells. You don't need to paint flower tiles there — the engine
  draws the lily; the marker just says "a lily lives here."
- None in Home (Zone 5).

**`light` — warm glow sources:**
Place one on **every street lamp, string-light span, lantern, and glowing window.** The engine
spawns a warm glow at each that grows as evening/night falls — this is what makes the world feel
cozy after dark. Be generous in Zones 3 & 4 (evening/night); a few in Zones 1 & 2.

### Optional but helpful — zone rectangles:
```
zone:threshold  zone:meadow  zone:park  zone:city  zone:home
```
If you draw a **rectangle** object (not a point) covering each zone's vertical band and name
it as above, the game uses it to know exactly where each zone's lighting/music applies. If you
skip these, the game falls back to horizontal Y-bands — so they're a nice-to-have, not
required. **Use these exact ids** (they're internal engine names — don't rename them even
though the zone themes changed): `threshold` = Quiet Street, `meadow` = Neighborhood, `park` =
Park & Bayfront, `city` = Downtown, `home` = Home.

---

## 6. Animated props (a few, optional-but-nice)

A handful of props read better animated. Deliver these as **separate PNG sprite sheets** plus
a matching **object marker** on the `objects` layer named `anim_<thing>` placed at the prop's
location. Do NOT use Tiled's built-in animated tiles (the engine animates from your sheets).

Priority order (do as many as time allows):
```
anim_fountain      ← the Zone 2 fountain (water loop)
anim_water         ← the Zone 3 bayfront water (gentle wave/shimmer loop). Nice-to-have; the
                     bay reads fine static too.
anim_stringlights  ← Zone 3 string lights (gentle twinkle) — OPTIONAL; the engine can also
                     just glow them via `light` markers, so only if easy.
```
For each sheet provide: the PNG, the **frame size** (e.g. 16×16 or 32×32), frame count, and
suggested **fps**. Put this in `NOTES.txt`. If animation is out of scope/budget, skip it —
place the static prop + a `light` marker and note it.

---

## 7. Collision rules (quick reference)

Paint on the `collision` layer (invisible) so the player is blocked by:
- All building walls, storefronts (incl. the café, bakery, hotel, train station), fences,
  railings, planters, benches, carts, tables, signs.
- The fountain (base + water).
- **The bay water** (block the whole water surface; leave the promenade/shore walkable) and the
  **waterfront railing / sea-wall**. Boats sit on the water (already blocked).
- **The train and the tracks** (block them; leave the platform itself walkable so she can stand
  on it). Keep a walkable route ONTO the platform and OFF it toward downtown.
- Tree trunks (NOT the canopy — canopy goes on `overhead` and is walk-under).
- The graduation-stage sides (leave the front approach + the on-stage spot walkable so she can
  climb up). The crowd tiles in front of the stage are blocking (she doesn't walk through them).
- The gate narrows should be walkable (the game controls opening/closing them) — do NOT paint
  collision across the gate cells.

Leave clear (walkable) the whole main path, every encounter stand-spot, the courtyard, the
promenade, and the platform.

---

## 8. Acceptance checklist (we'll verify against this)

- [ ] Single `world.tmj`, opens in fresh Tiled with no missing tilesets.
- [ ] 16×16 tiles, 64 wide, orthogonal, top-down.
- [ ] Layers present + named exactly: `ground`, `path`, `walls`, `decor`, `overhead`,
      `collision`, `objects`.
- [ ] `ground` fully covered (no holes anywhere).
- [ ] All 5 zones present, stacked bottom→top in order early morning → afternoon → evening →
      night → dawn; compact/dense; ONE continuous path with sensible zone-to-zone transitions.
- [ ] Painted at bright, fully-saturated daytime values (NOT pre-darkened, NOT desaturated).
- [ ] EVERY zone looks warm/cozy/beautiful on its own — none reads grey, drab, dim, or bleak
      (incl. the early-morning opening + the night zone). See ★ OVERALL FEEL.
- [ ] Zones are enriched with extra (non-encounter) buildings/people/life so none feels empty.
- [ ] Every zone has warm light sources with `light` markers on them.
- [ ] Every required object marker present with the EXACT name (Section 5), each on a
      walkable cell in front of its prop.
- [ ] `encounter:squirrel` is the LAST beat of Zone 2 (a tree on the path near the top).
- [ ] All 4 gates placed at the zone narrows; gate cells NOT collision-blocked.
- [ ] `lily` markers form a continuous ribbon beside the path, Zone 1 → Zone 4 (~20–40; none
      in Home). See the Section 5 note.
- [ ] `light` markers on every lamp/lantern/lit window (generous in Zones 3–4).
- [ ] `collision` blocks walls/water/railings/train/props; path, stand-spots, courtyard,
      promenade, and platform stay walkable.
- [ ] Present + readable: café, bakery, restaurant, fountain, squirrel tree; a REAL park + a
      gelato/ice-cream shop; a BAYFRONT with water + boats; a TRAIN STATION platform w/ train; a
      HOTEL; a courtyard; a GRADUATION stage WITH a painted cheering crowd; a landmark street
      corner; house/porch.
- [ ] The park→bayfront→station and station→downtown→home transitions make physical sense.
- [ ] Tileset file(s) + `NOTES.txt` included.

---

## 9. Questions

This brief is self-contained — everything you need is above. Questions on any prop, layout, or
a marker's exact spot: ask before guessing. A rough first pass to confirm layout/zones is
welcome before full detailing.
