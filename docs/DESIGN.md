# A Dream Come True — Design

An anniversary game for Isa (Isabella Gonzalez), 1 year. A warm 2D pixel-art web game (gift).

## Premise
Isa wakes as Snoopy in a soft dream with no memory. A gentle pink presence (secretly her
boyfriend) walks with her. She follows a path up through 5 zones; each encounter returns a
memory + a real photo. Walking the path = waking up; remembering = coming back to herself.
At Home the guide is revealed as him, and he gives her a letter. Dreamy, tender, whimsical;
never scary or sad. Target end-feeling: loved, proud, warm and fuzzy.

He'll be present in person the first time, but she must be able to replay solo. Deploys to
GitHub Pages; keep repo private / URL unlisted (real songs used).

---

## Source material (content truth)

### Her
- Isa / Isabella Gonzalez. Green eyes.
- Family-centered: extremely close to mom and younger sister; fierce about the people she
  loves. She's the center who holds everyone together and brought him closer to his own family.
- First in her family to graduate a 4-year university. Pre-med, UC Berkeley, graduated May
  2026; med school ahead (proud, a little nervous about the future).
- Determined and driven against doubt; strong moral compass. Thoughtful and perceptive —
  notices everything, including his insecurities (vegetarian "inconvenience," his Spanish, his
  self-image), and quietly fills the gap. Makes him feel loved for exactly who he is.
- Fierce, opinionated, stylish, passionate, supportive.

### Comforts / tastes
- Coffee: hot vanilla latte with almond milk (always hot, even in summer). Also matcha (he
  dislikes matcha).
- Music: Ariana Grande, Laufey, The Marías, Bad Bunny, Sabrina Carpenter, Olivia Rodrigo
  (*stupid* to include).
- Reads: cheesy romance + murder mysteries with a female protagonist (reads less now).
- Calla lilies. Loves green + nature colors. Pomegranates. Snoopy (→ Isa = Snoopy, him = Kirby).
- Sweet treats; running joke: home-baked cookies as "insurance" to get a yes.
- Jokingly scared of squirrels (Berkeley).
- Eats poorly on busy days (just yogurt / brown-sugar oatmeal / eggs). Dislikes pasta (family
  owns an Italian restaurant, burned out).

### Them (this year)
- Met on Bumble. First date June 21, 2025, Walnut Creek — gelato + walk + park.
- 2nd date July 4 (fireworks). First kiss July 15. Official July 23.
- First "I love you" Dec 5 — **she said it first** (she's the brave one; he overthinks). This
  matters: it's called back at the finale.
- Trips: San Diego (3 days, drove); Mexico City (4 days, flew).
- Pet names she calls him: Mocoso (allergies), Gol Mol (Hindi, "round").
- "She is the love of my life."

---

## Tone (north star for every line)
- Warm, sincere, lightly playful. Not joke-a-minute, not weepy.
- Humor = seasoning (~2–3 beats total), earned by specificity (Mocoso, matcha, cookies). A
  joke should make her feel SEEN.
- Tenderness stated plainly; simplest lines hit hardest; no purple prose.
- Rule of one: each encounter delivers ONE clean feeling. Range comes from the sequence.
- The emotional core is the beat where SHE takes care of HIM (E12) — the gut-punch.

### Three text voices (locked)
- **PINK** = the guide (him).
- **WHITE** = the NPCs she meets.
- **GOLD ITALIC** = her own recovered memory speaking from inside.

---

## World & zones

One continuous world, walked bottom → top (ascending "into the light" toward Home). The
world is a dream of real-world places (stylized urban), not literal locations. Compact:
~10–15 min playthrough, each zone ~1 screen-ish, no filler.

**Art feel — beautiful, warm, cozy everywhere; no zone is ever grey, washed-out, or dim.**
The "coming alive as she remembers" arc is meant to be expressed by growing warmth and light —
NOT by draining color. Time of day is done with color *temperature* + warm glow pools, never
desaturation. Even pre-dawn and night are gorgeous and snug.

> **AS-BUILT (current):** lighting is a single UNIFORM warm wash across the whole map — the
> per-zone color grading + glow pools described here are DEFERRED (a future lighting pass).
> The old **calla-lily / blooming path motif was REMOVED** (see Motifs); its slot is open for a
> replacement growth-motif later. Zone rects still drive per-zone **music** + background color.

Zones, bottom → top:
1. **The Quiet Street** (pre-dawn) — small, enclosed, intimate suburban street; she wakes
   OUTSIDE. Warm blue-hour / lavender light, a glowing porch lamp. Wake + tutorial + squirrel.
2. **The Morning Neighborhood** (morning) — golden, green sidewalks + cozy storefronts: café,
   bakery, food stall, park fountain. Coffee, treats, pasta egg, pond.
3. **The Park at Dusk** (dusk) — magical warm evening; city park/gardens with string lights.
   Gelato cart, fireworks plaza, quiet lamplit spot. First date, falling, first "I love you".
4. **Downtown at Night** (night) — a warm lamplit downtown: streetlamps, lanterns, lit
   windows, plaza, courtyard, a graduation stage. Deep but drenched in warm light, never dark.
   Trips, family, graduation, his note.
5. **Home** (sunrise) — small, warm, intimate house/apartment exterior with porch, garden,
   glowing windows. The finale + letter.

---

## Cast
Everyone she loves is a **Snoopy** variant, labeled with the real person's name — her whole
world is made of her; she's the connective tissue.
- Isa = classic Snoopy (player).
- Mom = Snoopy + apron/glasses. Sister = smaller/younger Snoopy. Friends = Snoopys with tiny
  accessories.
- Cap-and-gown Snoopy = E11 costume swap.
- **Him = Kirby — the only non-Snoopy.** Meaning: the one who isn't her is the one she chose,
  who came from outside and became home. Lean into this.

---

## Motifs
Converging at Home:
1. **~~Calla lilies (physical)~~ — REMOVED.** Originally the path was lined with calla lilies
   that bloomed as nearby memories were collected (a trail of bloom growing behind her). This
   whole system was cut; the map still has `lily` marker positions reserved, but nothing renders
   there yet. **TBD: a replacement physical growth-motif may go in this slot later.**
2. **Warmth/light growing (ambient + soft gate)** — collecting a memory advances the warmth
   and clears the next stretch. This is the soft gate. *(As-built: the ambient warmth-growth is
   deferred with the lighting pass; the gate progression itself works.)*
3. **The fleeing pink creature (emotional)** — Kirby/him; runs whenever she turns, until the
   finale, when it stays.

Convergence at Home = full sunrise + the creature that finally stays = him.

(Pomegranate is not a motif — just one of her small comforts; an easter-egg beat in E4.)

---

## The guide
A small pink presence = Kirby = secretly him. Never named or clearly seen until the finale.
- Always near her, never in front; speaks from the screen edge (pink text). A little pink
  creature scurries off the instant she turns toward it.
- NPCs give memory-photos; the guide gives reactions, intimacy, and **narrates her back to
  herself** — tells her what she can't see about her own strength and impact. That's the
  finale payoff: "the one who saw you most clearly was me."
- Voice = unmistakably him: warm, dry, self-deprecating (bad Spanish, allergies, self-image),
  deeply attentive, earnest underneath. Teases lovingly. Inside jokes seeded early so the
  reveal feels inevitable in hindsight.
- Stays unnamed throughout; near the end slips one tell (a pet name / a line only he'd say).

**Warmth ladder** (climbs as memories are collected):
1. Dry & gentle (Threshold/early Meadow) — helpful, funny, distant.
2. Knowing (Meadow) — reveals it knows her too well.
3. Tender (Park) — drops deflection.
4. Undisguised (late City) — nearly gives itself away.
5. You (Home) — the reveal.

---

## Map, path & gates

One continuous scrolling world (not separate screens); camera follows her bottom → top; light
temperature and warmth shift continuously as she ascends. A mostly-guided path she follows,
with small room to wander off-path for easter eggs — she can't get lost.

Encounter placement along the path (a couple sit as small detours off it):
- **Quiet Street:** wake (center) → squirrel (tree blocks the way; arc around) → Gate 1.
- **Neighborhood:** coffee → treats → pond → Gate 2. (Bakery/pasta as small detours.)
- **Park:** gelato/first date → fireworks/falling → "I love you" → Gate 3.
- **Downtown:** trips → family → graduation (top; she climbs a set of stairs ONTO the stage) →
  his note → Gate 4.
- **Home:** creature/Kirby + letter only. Intimate, no distraction.

**Gates** = a narrows that opens when the memory before it is earned. Gate 1 opens during the
intro (tutorial). Gates 2/3/4 open at the end of the pond / "I love you" / his-note encounters.
*(As-built: the gate progression is fixed; the "warmth advances / lilies bloom" flourish that
used to accompany it was removed with the lily/lighting systems.)*

---

## Buildability (standing constraint for all encounters)
Every encounter is built ONLY from these proven blocks: dialogue (3 voices), photo reveal,
pink-creature dart, walk-to-a-spot / trigger, plus the cutscene-overlay and a few one-off
effects (fireworks, confetti, cap-swap). Anything beyond these must be flagged and given a
cheaper equivalent. *(The `lily bloom` and `warmth/light shift` blocks were removed.)*

**Activity rule:** every encounter has a small, unfailable "verb" so she participates, not
just reads. Tiers: T0 approach, T1 simple interact (one button), T2 micro-task (few seconds),
T3 little set-piece (reserve for peaks). Most beats are T1/T2; activity never delays the
emotional payload more than a few seconds.

**Interaction model:** walk UP to an encounter → a bobbing marker (as-built: an
envelope-with-heart sprite, centered on/near its associated object) + a "SPACE to look" prompt
→ SPACE to start. Proximity is measured against the marker's visible tile; markers are solid
(she can't walk over them). No bounding-box auto-triggers.

---

## Encounters

Photos: mix of the exact event photo where available and a thematically-fitting one where not.
There are 11 encounter memory-photos (E1/E2 have none; E9/trips has TWO) **plus the final
letter photo, which now also counts as a memory** → **12 memories total, 1:1 with photos**. The
counter reads `memories: X/12` and `TOTAL_MEMORIES` is DERIVED from the photo count in
`encounters.js` (not hardcoded), so it stays 1:1 automatically.

### E1 — Waking  [Quiet Street, no photo]
Wake with no memory; learn WASD; meet the guide (rung 1).
- Intro: black → gold-italic "...where..." → fade up into a warm, hazy blue-hour dawn, she's
  asleep (Snoopy). Guide (pink, off-edge, faint glow) opens gentle, humor by line ~3:
  - "There you are. Take your time. You've been asleep a long while."
  - "You don't remember anything right now. Not your name, not mine, not why it's all so hazy.
    That's alright. That's what the walk is for."
  - "Go on. Left foot, right foot — the usual miracle. (WASD. I'll wait.)"
- First pink-creature dart + vanish: "Hm? Don't mind that. Just... something that wants to see
  you get home." *(The original "first steps → a calla lily blooms" beat was removed with the
  lily system; a replacement first-spark-of-life beat is TBD.)*
- Guide calls her "you," never her name yet. Gate 1 opens freely (tutorial).

### E2 — The Squirrel  [Quiet Street → Neighborhood, no photo, gag]
First personality memory (comedic): some things survive amnesia = she's still her.
- Rounds a tree → squirrel dead-center, staring. Her gold-italic instinct fires: "...no. no
  no no. not that. anything but that."
- Guide (delighted): "Oh, this is going to be good. You don't remember your childhood, but
  *this* fear? Fully intact."
- Verb: walk a wide ARC around it (it comically tracks her); it scurries up the tree = relief.
- Button: "You've been terrified of those since Berkeley — some brave, brilliant scientist,
  undone by a rodent. ...I love that about you, honestly. Even now, you're completely,
  perfectly *you*." (first "I love that about you" — primes the thesis)
- Surviving → morning opens in full warm color. Easter egg: tiny Berkeley blue/gold scrap
  nearby. *(The original "burst of lilies" was removed with the lily system.)*

### E3 — The Usual  [Neighborhood, PHOTO 1, name returns, album intro]
First cozy comfort + her NAME returns.
- Barista-Snoopy (white): "The usual? Course it's the usual. Hot vanilla latte, almond milk.
  You've never once surprised me."
- Verb (T1): SPACE to take the cup; it warms → triggers the memory.
- Gold-italic: "...vanilla. almond milk. hot — always hot, even in summer. this is mine. this
  is what I like." → "...Isa. My name is Isa."
- Guide (rung 2): "There she is. Isa. ...I wondered when you'd get that one back. Suits you.
  Always has."
- Album intro (guide): "That's one. A piece of you, back where it belongs. There's an album in
  your head now — it'll fill as you go."
- Button (matcha jab; "again" = first fingerprint of shared history): "Some people'd order a
  matcha instead, if you can believe that. ...No — we're not doing the matcha argument again.
  Not today."
- Photo saves to the album (UI introduced here).

### E4 — Insurance  [Neighborhood, PHOTO 2, sweet treats + cookies]
Love of sweet treats + the "cookies as insurance" joke that quietly points at him.
- Bakery stall (cookies, pastries, froyo, a pomegranate) (white): "Sweet tooth's still
  intact, huh? Good. Some things a person shouldn't lose."
- Verb (T1): SPACE to take a treat.
- Gold-italic: "...oh. cookies. warm ones. and froyo. and — is that a pomegranate? yes. all
  of it. yes."
- Guide (rung 2, the "he" breadcrumb): "You've got a weakness. Someone figured it out early:
  if he ever needed a *yes* out of you... he'd just show up with warm cookies. Homemade.
  Shameless bribery."
- Guide (quieter): "...Not that it always worked. But you always let him think it did. That's
  the kind of person you are."
- Button: "Anyway. Eat up. You've earned it, and honestly, I've never once seen you turn it
  down."

### E5 — The Pond / Who She Is  [Neighborhood end, PHOTO 3, first beat purely about her]
Her determination/drive — the inner fire that survives amnesia; reader/dreamer as texture.
- Verb (T1): approach the fountain/still water → SPACE to look in → cutscene overlay: a
  water-blue full-screen scene, her Snoopy sprite fades in on the surface as a static image
  (same tech as photo reveal). Fades back after. *(As-built: the neighborhood fountain is an
  animated sprite over the map's static fountain art.)*
- Gold-italic: "...that's me. that's who I am. someone who doesn't stop."
- Guide (rung 2→3, narrates her back): "You don't stop. You never have. People doubted you.
  You out-worked every one of them — and you did it carrying everyone you love on your back."
- Gold-italic: "...I remember this. the wanting. the not-giving-up. even when it's hard.
  especially when it's hard."
- Guide (texture): "You read, when you let yourself. Ridiculous romances and murder mysteries
  where the woman always solves it. ...Of course she does. You'd have it no other way."
- Button (thesis planted): "You keep meeting pieces of yourself out here. I hope you're
  starting to see what I've always seen. ...Keep going. There's so much more of you up ahead."
- Gate 2 opens. (Cutscene-overlay system built here; reused at the finale.)

### E6 — Where It Started  [Park entry, PHOTO 4, first "us" memory]
First date (June 21, 2025, Walnut Creek). Tonal pivot from "who am I?" to "who has been with
me?" Guide → rung 3.
- Gelato-cart Snoopy (white): "First one's always gelato, isn't it? Little cups. A warm
  evening. Somebody nervous, trying to be smooth about it."
- Verb (T2): take a gelato cup; a second cup's spot is empty = "he was already here."
- Guide (rung 3): "...The other cup's already gone. Someone got here first. He was early —
  way too early. Sat in that park rehearsing what to say and forgot all of it the second you
  showed up."
- Gold-italic: "...a park. june. the light going gold. gelato melting because we talked too
  long. I didn't want to leave. I remember I didn't want to leave."
- Guide: "Neither did he. He walked you the long way just to make it last. First of a lot of
  long ways."
- Button: "This is where it started, Isa. Everything after this... you're about to remember
  all of it. Take your time. It's a good part."
- Guide now uses her name freely and openly narrates "he" (still faceless).

### E7 — The Long Way / Falling  [Park mid, PHOTO 5, summer firsts compressed]
Falling: July 4 fireworks (2nd date) → July 15 first kiss → July 23 official.
- Guide (rung 3): "Fourth of July. Your second date. He swears the fireworks were the plan.
  They weren't — he just got lucky, and took the credit anyway."
- Verb (T2): fireworks hang unlit; SPACE to watch → they bloom to life (light set-piece).
- Gold-italic: "...fireworks. his hand near mine, both of us pretending not to notice. and
  then — later — July. the first time he kissed me. I remember being sure. I remember being so
  sure."
- Guide: "Two weeks later, first kiss. He'd overthought it for days — you just... leaned in.
  Saved him. And by the twenty-third you'd made it official. He told everyone. *Everyone.*
  His mom, his sister, a barista who did not ask."
- Gold-italic: "...it happened so fast. and it felt like the safest thing I'd ever done."
- Button: "You fell like it was easy. It wasn't easy for him — he was terrified of how much he
  already felt. But you made it feel like the most natural thing in the world. You always do."

### E8 — Five Words / First "I love you"  [Park end, PHOTO 6, first big peak]
First "I love you" (Dec 5). **She said it first.** Turning point: became real, not just giddy.
- Guide (top rung 3): "December. Cold enough to see your breath. He'd felt it for a long time
  — way too long — and he was too scared to say it. Of course he was."
- Guide (softer): "So you said it first. You always were braver than him."
- Verb (T2): three dim words "I love you" hover over the water; move to them / SPACE → they
  ignite one by one + mirror on the water = she says it.
- Gold-italic: "...'I love you.' I said it. I didn't plan to — it just felt true, so I said
  it. and I remember the look on his face."
- Guide (edge of rung 4): "He froze. Then he said it back like he'd been holding his breath
  since summer. ...I don't think he's ever been that relieved — or that lucky. You went first.
  You're the reason he ever found the words at all."
- Button: "That was the day it stopped being new and started being *real*. Everything past
  here isn't the falling. It's the staying. ...Come on. There's more."
- Gate 3 opens (into Downtown / night).

### E9 — The Far Places / Trips  [Downtown entry, PHOTOS 7 & 8]
The trips: San Diego (drove) + Mexico City (flew). Lighter/energetic to open the City.
- Guide (rung 4): "Ah — the far places. You two got restless. You always do. Sitting still
  was never really your thing, or his."
- Verb (T2): collect two trip markers (SD + CDMX), SPACE at each.
- Gold-italic (SD): "...the drive down. windows down, terrible singing, his hand on the
  gearshift and mine on top of it. three days that felt like a whole life."
- Guide (CDMX; light Spanish/caretaking touch, full version saved for E12): "Then you got
  braver — a plane. Mexico City. Four days. He tried his Spanish. Valiant effort. You covered
  for him every time, like it was nothing. Like you always do."
- Gold-italic: "...I laughed so much my face hurt. wherever we went, that was home, as long as
  he was there."
- Two-photo reveal (SD then CDMX).
- Button: "You're braver in the world when you're together. Both of you. ...He'd follow you
  anywhere. He nearly has."

### E10 — Everyone She Holds / Family  [Downtown mid, PHOTO 9, crowd beat]
Family: closeness to mom + younger sister; she's the center; she brought him into both families.
- Cast (crowd of Snoopys, named with real names): Mom (apron/glasses), Sister (smaller),
  +1–2 more. **USER TODO: Mom's name = ____ ; Sister's name = ____**
- Guide (rung 4): "Now — the ones you'd walk through fire for. You've always been the center
  of them, Isa. The one who holds everyone together, even when no one's holding you."
- Verb (T2): visit each family Snoopy (SPACE); each gives one line; all visited = memory.
- Mom (white): "There she is. My daughter. First to do so many things — and still calls me
  every week. Still checks I've eaten."
- Sister (white): "You're the reason I think I can do hard things. I watched you do them first."
- Gold-italic: "...my mom. my sister. my whole heart is these people. I'd do anything for
  them. I have."
- Guide (the turn): "And you made room. You brought him into all of it — Sunday calls, the
  whole loud table. You even pulled him closer to his *own* family. He talks about his little
  sister differently now, because of you. You don't just love people. You make them love each
  other better."
- Button: "Whatever you become, wherever you go — you carry all of them with you. And they
  carry you. ...He knows how lucky he is to be on that list."

### E11 — What You Built / Achievements  [Downtown top, PHOTO 10, grand pride peak]
Her achievements: first-in-family 4-yr grad, pre-med Berkeley, grad May 2026, med school
ahead. The "about her" payoff. Mostly pride, light touch on future nerves.
- Setting: highest plaza, a stage with a graduation cap; she climbs a set of stairs ONTO the
  stage (as-built: the map's stage platform + a drawn wooden-steps prop at its front).
- Verb (T3, simple): walk up + SPACE to put on the cap → her sprite swaps to cap-and-gown
  Snoopy + crowd of Snoopys lights up + bounces (cheer) + confetti burst + memory + photo.
  Effect steps: `wearCap`, `crowd:"cheer"`, `confetti`. (Minimum: podium + cap + SPACE +
  particle confetti. Stretch: bouncing Snoopy crowd + cap-toss tween.)
- Guide (rung 4, full pride): "This one isn't about him. This one's all you. Look how far up
  we've come."
- Gold-italic: "...I did it. first in my family. Berkeley. pre-med. all those nights, all that
  doubt — mine and everyone else's — and I did it anyway."
- Guide: "First in your family. You didn't follow a path. You *made* one. For your sister. For
  everyone who comes after you. Nobody handed you a single piece of this."
- Gold-italic (light nerves): "...and it's not over. med school. the not-knowing. I'm proud.
  but a little scared of what's next."
- Guide (quieter): "Of course. That's what makes you brave — you do it scared. You always
  have. And whatever comes next, you won't do it alone."
- Button: "Say it with me, true as it is: *I did that.* ...Now come on, Doctor. Almost home."

### E12 — The One Who Notices  [Downtown end, PHOTO 11, emotional core / gut-punch]
How she loves him. Her perceptiveness; seeing his insecurities and filling the gaps. Last beat
before Home; the guide is barely holding together.
- Verb (T2, reversal): a small pink/Kirby object on the path; SPACE to pick up + open his
  note. For the first time the memory is his view of her AND triggers her memory of loving him.
- Guide (rung 4, hesitant): "...This last one's different, Isa. The others were pieces of you.
  This one's a piece of how you're *seen*."
- Guide (3rd person cracking): "You notice everything. Everyone. When he felt like an
  inconvenience — the vegetarian thing, the bad Spanish, the days he didn't feel like much to
  look at — you *saw* it. Before he said a word. And you quietly filled the gap. Every time."
- Gold-italic (her memory of loving him): "...I remember taking care of him. not because I had
  to. because I wanted to. when he's unsure, I want to be the sure thing. I love him exactly
  as he is. every part."
- Guide (openly unsteady): "He has never once, in his whole life, felt as loved as you make
  him feel. For exactly who he is. Flaws and all. ...Do you know what that *is*, to a person?
  To be seen like that, and kept anyway?"
- Button (almost says it, hands into finale): "You gave him that. Every day. And he's spent
  this whole walk trying to give a little of it back to you. ...There's one memory left, Isa.
  Just past that light. I think you know who it is. ...Go on. I'll be right here. I've always
  been right here."
- Gate 4 opens → into full sunrise.

---

## Finale  [Home]
One ending, no branching; works identically whether he's present or she replays alone.

Setup: she steps through the Home gate into full sunrise (the peak of a journey that was warm
the whole way). Center: the little pink creature, standing STILL — for the first time it does
not flee.

Reveal sequence:
- Approach — guide (rung 5, now close): "This is the last one, Isa. You found all the others.
  I knew you would."
- Gold-italic: "...it's not running. the little pink one. it's been with me this whole time.
  since I opened my eyes." → "...he was very *gol mol*, wasn't he. round. warm. impossible not
  to love." (Gol Mol breadcrumb pays off the round pink Kirby.)
- Creature turns to face her — guide (act dropping): "I wasn't a voice in your head. I was
  never really a voice at all. I'm the memory you were always walking toward. The one who's
  been right here — the whole way."
- Reveal = Kirby (name label appears; the only non-Snoopy). Guide: "It's me, Isa. It's me."
- Gold-italic: "...you. of course it's you. how did I ever forget you? you're the one I
  remember last because you're the one I could never lose." → "...Mocoso. that's what I call
  you. because of your allergies. I remember. I remember all of it."
- Callback to E8: him: "You said it first, once. On a cold night in December. You were braver
  than me — you always are. So let me say it back, the way I've been trying to say it this
  whole walk:"

The letter (the true ending): she collects a small pink/Kirby envelope → SPACE to open →
full-screen handwritten note on warm/aged paper (handwriting font, optional wax seal),
scrollable, with the most recent "us" photo embedded at the bottom. Content = his real words.
That embedded photo is **also silently added to the album as the 12th/final memory** (no
separate reveal), so the counter finishes at 12/12. **USER TODO: write the real letter.**
Sign-off name TBD (first name / Mocoso / Gol Mol).

After: a wordless full-sunrise end screen (Snoopy + Kirby together, music resolving), the
browsable memory album, and replay available. Then return to title.

---

## Audio
Real commercial songs are OK (repo private / URL unlisted; prefer short clips). Start audio on
the title "press any key" (browser autoplay gesture). Loop per zone, crossfade at gates, duck
under key dialogue/finale. Volume/mute in UI.

- Title theme = "wondering why". **USER TODO: exact artist + title.**
- Finale / reveal + letter = "stupid" (Olivia Rodrigo).
- E11 graduation = triumphant swell for the cap-on moment.
- Zone music (artist-flavored): Neighborhood = Laufey; Park = The Marías; Downtown = Bad Bunny
  / Sabrina Carpenter. Threshold = near-silent/ambient, sound swells in as warmth grows.
- SFX (safe/free/original): memory-collected chime, dialogue typewriter blip, pink-creature
  shimmer, gate swell, confetti/cheer, letter unfold. *(The lily-bloom chime was removed.)*
- **USER TODO: provide audio files, or approve sourcing royalty-free SFX.**

---

## Easter eggs (seasoning; discoverable, never block progress)
Anchored in encounters: squirrel (E2), matcha "argument" (E3), cookies-as-insurance (E4),
pomegranate (E4 stall), Berkeley blue/gold wink (near E2), his Spanish / she covers (E9 light,
E12 full).

Placed:
- **Mocoso** (allergies) — only at the finale reveal.
- **Gol Mol** (round) — a gold-italic breadcrumb at the finale approach, before the round pink
  Kirby appears.
- **Pasta-hatred** — a stall offers pasta; she/guide refuse: "Absolutely not. You've had
  enough pasta for three lifetimes. Restaurant kid. Keep walking."
- **Yogurt / oatmeal / eggs (non-meals)** — a gentle teasing-but-caring line near E3/E4.

(Cut: FaceTime/long-distance; generic Snoopy gags.)

---

## Interface & feel
- **Title:** "A Dream Come True" + dedication "for Isa". Dim, warm, mysterious backdrop
  (pre-dawn sky). "press any key to begin" starts the title theme.
  Needs a New Game button that resets ALL state (encounters, memories, album, gates); mute
  preference persists; confirm before wipe.
- **Dialogue box:** 3 voices, typewriter, SPACE/ENTER advance.
- **Memory album:** always-visible counter "memories: X/12" (1:1 with photos; the final letter
  photo counts); TAB opens a browsable gallery (click a photo full-size, ← → to browse); ESC
  closes.
- **Letter UI (most polish):** full-screen warm/aged paper + handwriting font + his text +
  photo embedded at bottom + optional wax seal; scrolls; slow fade-in + "paper unfold" SFX;
  "stupid" plays under it.
- **End screen:** wordless — Snoopy + Kirby in full-sunrise Home, music resolving, album +
  replay available.
- **Controls (non-gamer friendly):** WASD move, SPACE/ENTER advance/interact, TAB album, ESC
  close, M mute. On-screen hints fade out once she's got it. Save/resume via localStorage.
- **Feel:** no screen shake; soft everything (cozy, not action); gentle camera ease; ambient
  particles (dust motes in light, fireflies in the park); warmth/light gradient shifts as she
  ascends (the big ambient payoff).

---

## Art & tileset

Principle: we do NOT create world art — we arrange a professional pack. Its only job is to be
cohesive and cozy enough not to distract; the photos, words, reveal, and warm lighting carry
the feeling.

- **Tileset: LimeZu "Modern Exteriors" only** — one semi-realistic urban pack that covers all
  five real-world zones (street, neighborhood, park, downtown, home) in a single style. (A
  cozy farm pack was ruled out because it can't do the dusk park or night downtown — the
  emotional peaks. Optional same-artist "Modern Interiors" props only if a single item is
  missing.)
- Tiles 16×16. **As-built: the delivered map is 60×86**, rendered at native 16px with camera
  zoom ~1.7 (the earlier "64×64, 2×" figures are superseded).
- The cartoon cast (Snoopy/Kirby) against semi-realistic tiles is an intentional contrast: she
  is the storybook figure in a dream of real places.
- **One-off static images (AI ok):** title backdrop, Home/finale backdrop. Do NOT use AI for
  walkable tiles.

### Lighting (in-engine)
> **AS-BUILT:** lighting is a single UNIFORM warm wash game-wide (no per-zone grading, no glow
> pools). The below is the DEFERRED target — the map's `light` markers + zone rects are parsed
> and ready to drive it when the pass happens.
- Per-zone warm/cool **color grading** that cross-fades by player Y — never a grey/black
  dimming veil. Every zone stays saturated and cozy; night reads "warm lamplit."
- Warm additive **glow pools** at each artist `light` marker (lamps, lanterns, windows,
  string lights); they grow as the world cools toward night so lamps drench the scene. Gentle
  flicker. Generous in the park/downtown.
- Growing warmth (and a TBD replacement growth-motif) to carry the "coming alive" arc.

### Sprites needed (separate job from the tilemap)
Isa = Snoopy (4-dir walk); Him = Kirby (4-dir or front); Squirrel; Family Snoopys with small
details (Mom apron/glasses, Sister smaller, +1–2 friends), reused as the E11 bouncing crowd;
Cap-and-gown Snoopy (min 1 front-facing, nicer 4-dir).

### Map build (contractor) — DELIVERED & WIRED IN
The contractor delivered the full 5-zone world as a single 60×86 `.tmj` (ground / path / walls /
decor / overhead + collision layers, plus object layers with named markers for encounters,
gates, lilies, lights, start, and zones). See **ARTIST_BRIEF.md** for the original spec. **The
engine now renders this map and reads its object/collision/zone layers** (via
`src/engine/MapLoader.js`); the existing systems (dialogue, memory album, finale, save/reset)
are intact. `lily` markers are present but IGNORED (lily system removed — slot reserved).

Note: `src/data/map.js` is now trimmed to just `ZONE_PROFILES` (per-zone bg color + music);
the old 40×60 procedural placeholder was retired. Encounter/gate/start POSITIONS come from the
map's object layer (encounters.js keeps only the step-data). See HANDOFF.md for the as-built
wiring details.

---

## Tech
- Phaser 4 + Vite, vanilla JS. Node via nvm (`. ~/.nvm/nvm.sh`). Run `npm run dev`, build
  `npm run build`. See HOW_TO_RUN.md.
- Data-driven: the engine is generic; all content lives as step-arrays in
  `src/data/encounters.js`. Adding/editing encounters = editing data, not engine code.

---

## User action items
- [ ] Buy + download LimeZu "Modern Exteriors"; verify it covers café/bakery/storefronts,
      park (fountain, benches, string lights, carts), downtown (lamps, plaza), and house
      exteriors. Verify its license allows personal-use web deploy.
- [ ] Hand the contractor: the tileset PNG(s), ARTIST_BRIEF.md, and this DESIGN.md.
- [ ] Gather the 12 photos (11 encounter + 1 final).
- [ ] Write the real letter (finale).
- [ ] Mom's + Sister's real names (E10).
- [ ] Audio: exact title song "wondering why", zone tracks, "stupid" for finale, or approve
      royalty-free SFX.
