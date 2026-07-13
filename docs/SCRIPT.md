# A Dream Come True — Full Dialogue Script (editable)

This is the complete spoken script, generated from `src/data/encounters.js` \+ `src/ui/LetterUI.js` (the source of truth). **Edit freely here, then hand it back and I'll update the game.**

## How to use this doc

- Rewrite the text after each **voice tag**. Keep the voice tag \+ the line **ID** (e.g. `usual.3`) so I can map your edits back precisely. If you change who says a line, just change the voice tag.  
- **Voices** (locked, keep the color meaning):  
  - **GUIDE** \= him (pink text in-game)  
  - **NPC** \= a person she meets (white). NPCs also have a `name:` label shown in-game — it's noted like `NPC (café)`.  
  - **MEMORY** \= her own recovered memory speaking (gold italic)  
- **`[ ... ]` markers are NOT dialogue** — they're the non-spoken steps (verbs, photo reveals, effects, gates, music, sfx) shown only for context/ordering. You can ignore them, but don't delete them if you want the beats to stay in the same order. If you want to move/add/remove a beat, just say so in a note.  
- `\n` inside a line \= a line break within the same dialogue box (the text wraps to a second line in the same box). Write it however's clearest; I'll re-encode.  
- Photo **captions** are editable too — they show under each memory photo. Marked `[PHOTO … → caption: "…"]`.  
- **Verb button labels ARE editable** — the quoted text in `[VERB: shoo — "brave it..."]` is the button/prompt she clicks (e.g. "take the cup"). Rewrite the quoted part; leave the verb keyword (the bit before the dash, e.g. `shoo`) alone — that's the internal action id.  
- **Encounter ORDER is editable** — see the "Encounter Order" section below. Reorder that list to change the intended walk order (drives the wayfinding arrow \+ story progression).

---

## Intro / Starting Text  (the very opening, before the walk)

Plays on a black screen at the start of a new game, then fades to the world.

**Fade-in phrases** (each shown alone, centered, \~1.3s each, dim serif):

- `intro.phrase1`: Había una vez…  
- `intro.phrase2`: ...there was a really special girl. One might say the brightest, funniest, prettiest girl there ever was.   
- `intro.phrase3`: Exactly one year ago, she accepted a totally ordinary boy as her officially-approved biggest fan. He still can’t believe his luck.   
- `intro.phrase4`: This is their story.

**Opening guide lines** (spoken by GUIDE once the world fades in):

- **GUIDE** `intro.1`: There you are. Take your time. You've been asleep a long while.  
- **GUIDE** `intro.2`: You don't remember anything right now. That's alright – that’s what this journey is for.  
- **GUIDE** `intro.3`: Go on. Explore with the W A S D keys. The small golden arrow will help guide you to your memories. Every memory you collect will be added to your album (top left), which you can check anytime with the TAB key.  
- `[GATE opens: g1]`

**First secret-Kirby peek line** (GUIDE, spoken the first time the peeking Kirby appears at a screen edge; silent every time after):

- **GUIDE** `peek.1`: Hm? ...Don't mind the bola. It’s just your super secret super admirer.

---

## E1 — Pasta  ·  id: `pasta`  ·  zone: meadow  · no photo

- **NPC (stall)** `pasta.1`: Care for some fresh pasta? It’s Ayusho’s special recipe, straight from Italy\!  
- **GUIDE** `pasta.2`: No thanks. Growing up, you had enough pasta for three lifetimes. You are starting to feel a bit hungry, though…

---

## E2 — The Pond  ·  id: `pond`  ·  zone: meadow  ·  PHOTO 3  ·  (cutscene overlay)

- `[VERB: lookIn — "look at your reflection"]`  
- `[CUTSCENE begins: water-blue overlay, her sprite reflected]`  
- **MEMORY** `pond.1`: ...that's me?\! Am I crazy, or am I actually just that cute?  
- **GUIDE** `pond.2`: No, you’re not crazy. You are absolutely stunning. Crazy face card AND body tea. Put some respect where it’s due\!  
- `[PHOTO 3 → caption: "the cutest girl to ever live"]`  
- **GUIDE** `pond.3`: If you can believe it, behind that beauty is an incredible person. The love of someone’s life. Keep exploring and you’ll see. There's so much more of you up ahead.  
- `[CUTSCENE ends]`

---

## E3 — The Usual  ·  id: `usual`  ·  zone: meadow  ·  PHOTO 1

- **NPC (café)** `usual.1`: Hot vanilla latte with almond milk for Isa\!  
- `[VERB: take — "take the cup"]`  
- `[SFX: warm]`  
- **MEMORY** `usual.2`: ...vanilla. almond milk. hot — always hot, even if it’s 80 degrees outside.  
- **MEMORY** `usual.3`: ...Isa. My name is Isa.  
- **GUIDE** `usual.4`: There she is. Isa...it’s such a gorgeous name. Suits you perfectly. Your last name could use a few more letters, though. Four letters, to be exact.  
- `[PHOTO 1 → caption: "just a girl and her lunch (?!)"]`  
- **GUIDE** `usual.6`: Matcha sounds good too…can you believe some people don’t like matcha? What is wrong with them??

---

## E4 — Insurance  ·  id: `insurance`  ·  zone: meadow  ·  PHOTO 2

- **NPC (bakery)** `insurance.1`: Pastries, cookies, frozen yogurt, get it all here\!  
- `[VERB: take — "take a treat"]`  
- **MEMORY** `insurance.2`: I do love some original tart frozen yogurt. And anything else with sugar as the primary ingredient.   
- **GUIDE** `insurance.3`: You've got a weakness. Someone figured it out early: if he ever needed a *yes* out of you... he'd just show up with a sweet treat. Even better if it was homemade. Shameless bribery.  
- **GUIDE** `insurance.4`: Who knows how things would have gone if he hadn’t brought those chocolate chip cookies, that fateful day one year ago. The best insurance ever.  
- `[PHOTO 2 → caption: "butter, sugar, and love"]`  
- **GUIDE** `insurance.5`: Nothing beats seeing you enjoy yourself. Eat up\! We’ve got lots more exploring to do.  
- `[GATE opens: g2]`

---

## E5 — Where It Started  ·  id: `firstDate`  ·  zone: park  ·  PHOTO 4

- **NPC (gelato)** `firstDate.1`: One cup of lemon gelato and one cup of strawberry gelato, coming right up\!  
- `[VERB: take — "take the gelato"]`  
- **GUIDE** `firstDate.2`: ...The first date. Someone was *so* nervous. The moment you walked into his life that warm June evening, his jaw was on the floor.  
- **MEMORY** `firstDate.3`: Melting ice cream, a long walk in the park, his knees turning fully towards me 30 minutes in. Nothing’s changed since – you’ll always be the center of his orbit.  
- **GUIDE** `firstDate.4`: He was doing everything in his power to keep himself composed. How do you keep your cool when you’re next to the prettiest girl on Earth?  
- `[PHOTO 4 → caption: "the first date — june 28, 2025"]`  
- **GUIDE** `firstDate.5`: This is where it started, Isa. Thank you for always showing up, then and now.

---

## E6 — Falling  ·  id: `falling`  ·  zone: park  ·  PHOTO 5  ·  (fireworks)

- **GUIDE** `falling.1`: Fourth of July. Your second date. Picnic and fireworks. He was so smitten, he could hardly eat, hardly even think. The fireworks in his heart were louder than the ones in the sky.  
- `[VERB: watch — "watch the sky"]`  
- `[FIREWORKS] [SFX: fireworks]`  
- **MEMORY** `falling.2`: Yeah, he was a little strange. He randomly sent me a picture of his burrito bowl…  
- **GUIDE** `falling.3`: A few weeks later, against all odds, first kiss. His heart rate shot through the roof. He had no idea what he was doing. But you saved him. And a few weeks after that, you made it official.  
- **MEMORY** `falling.4`: He still is a little strange. But… I think I’ll keep him.  
- `[PHOTO 5 → caption: "fireworks into forever – july 23, 2025"]`  
- **GUIDE** `falling.5`: He was terrified of how much he already felt for you. But you made it feel like the most natural thing in the world. You made him feel safe and at home. You always do.

---

## E7 — Five Words  ·  id: `iloveyou`  ·  zone: park  ·  PHOTO 6

- **GUIDE** `iloveyou.1`: Fast forward to December, at the Milpitas BART. Cold enough to see your breath. He had this sure feeling in his chest — it had been there for way too long — but he was too afraid to express it out loud.  
- **GUIDE** `iloveyou.2`: So you said it first. You always were braver than him.  
- `[VERB: sayIt — "say the words"]`  
- `[SFX: chime]`  
- **MEMORY** `iloveyou.3`: ...'I love you.' I said it. I didn't plan to — it just felt true, so I said it. and I remember the look on his face.  
- **GUIDE** `iloveyou.4`: He froze. Then he said it back like he'd been holding his breath since summer. ...I don't think he's ever been that relieved — or that lucky. You went first. You're the reason he ever found the words at all.  
- `[PHOTO 6 → caption: "three little words – december 5, 2025"]`  
- **GUIDE** `iloveyou.5`: That was the day it stopped being *new* and started being *real*.\n...Come on. There's more.  
- `[GATE opens: g3]`

---

## E8 — The Far Places  ·  id: `trips`  ·  zone: city  ·  PHOTOS 7 & 8

- **GUIDE** `trips.1`: Despite busy schedules, you made time to travel. Scared you’d get sick of each other, instead coming home closer than ever.  
- `[VERB: take — "gather the trips"]`  
- **MEMORY** `trips.2`: San Diego...the drive down. windows down, terrible singing, his hand on my leg and my hand on his. Three days that felt like a first sneak peek into an amazing future.  
- **GUIDE** `trips.3`: And a few months later, Mexico City. Four days. He tried his best with Spanish. Valiant effort. He’s still got a lot to learn. But there is no better inspiration than you.  
- **MEMORY** `trips.4`: ...I laughed so much. Wherever we went, that was home, as long as we were there together.  
- `[PHOTO 7 → caption: "on the road..."]`  
- `[PHOTO 8 → caption: "...and in the air"]`  
- **GUIDE** `trips.5`: The best trips he’s ever been on. He can’t wait to follow you everywhere and anywhere.

---

## E9 — Everyone She Holds  ·  id: `family`  ·  zone: city  ·  PHOTO 9  ·  (crowd)

- **GUIDE** `family.1`: This memory isn’t just about one particular moment. It’s about who you are in every moment, and who you bring with you.  
- `[VERB: visitAll — "see yourself"]`  
- **MEMORY** `family.4`: My mom. My sister. My cousins. My aunts. Family is everything to me.  
- **GUIDE** `family.5`: And you made room. You brought him into all of it. You even pulled him closer to his *own* family. He is a better son and brother himself now, because of you. Your love is multiplied many times over.  
- `[PHOTO 9 → caption: "everyone you hold"]`  
- **GUIDE** `family.6`: Whatever you become, wherever you go, you carry them all with you. And they carry you. He knows how lucky he is to be on that list.

---

## E10 — What You Built  ·  id: `graduation`  ·  zone: city  ·  PHOTO 10  ·  (set-piece)

- **GUIDE** `graduation.1`: This one's all you. Look how far you’ve come.  
- `[VERB: wearCap — "walk the stage"]`  
- `[CAP SWAP] [CROWD: cheer] [CONFETTI] [SFX: cheer]`  
- **MEMORY** `graduation.2`: ...I did it. A scientist. Berkeley. Pre-med. All those nights, and I did it anyway. Time and time again, I have proven any doubters wrong. Never bet against me\!  
- **GUIDE** `graduation.3`: First in your family. You didn't just follow a path. You *made* one\!  
- **MEMORY** `graduation.4`: It’s not over yet. Studying for med school, applying, getting in, doing well, doing residency…there’s a long road ahead.  
- **GUIDE** `graduation.5`: Of course. That's what makes you brave. You know what you want, and chase it even if it’s hard.   
- `[PHOTO 10 → caption: "what you built"]`  
- **GUIDE** `graduation.6`: And whatever comes next, you won't do it alone. I’ll be standing right next to you.

---

## E11 — The One Who Notices  ·  id: `notices`  ·  zone: city  ·  PHOTO 11  ·  (emotional core)

- **GUIDE** `notices.1`: ...You always notice everything and everyone, Isa. I hope today makes you feel as seen as you make him feel.  
- `[VERB: open — "open the note"]`  
- **GUIDE** `notices.2`: Whenever he has felt like an inconvenience – for his vegetarianism, for his bad Spanish, for the days he doesn’t feel like much to look at, for so many things – you never let that sit. Every time, you fill the gap.  
- **GUIDE** `notices.4`: He has never, in his whole life, felt as loved as you make him feel. For exactly who he is. Flaws and all. Do you know what that *is*, to a person? To be seen fully, and kept anyway?  
- `[PHOTO 11 → caption: "the one who notices"]`  
- **GUIDE** `notices.5`: You gave him that. Every day. And he's spent this little journey trying to give a little of it back to you.\n...There's one memory left, Isa. Just past that light. I think you know who it is…  
- `[GATE opens: g4]`

---

## Finale (E12)  ·  id: `finale`  ·  zone: home  ·  (reveal → letter → end)

- **GUIDE** `finale.1`: This is the last one, Isa. You found all the others.  
- **MEMORY** `finale.2`: He’s so *gol mol*, isn’t he. My Mocoso\!  
- **GUIDE** `finale.3`: That’s me\! I love you so, so much. I have one more thing for you.  
- `[LETTER opens — see below]`  
- `[PHOTO 12 (final) → caption: "Isa y Ayush"  (shown in the letter + silently added to the album)]`  
- `[END screen]`

---

## The Letter  (finale, full-screen on aged paper)

**USER TODO:** Replace with the real letter. It's shown as HTML paragraphs; each bullet below is one `<p>` paragraph. The final photo (caption "us — now") is embedded at the bottom automatically. Sign-off name TBD (first name / Mocoso / Gol Mol).

- `letter.p1`: My Isa,  
- `letter.p2`: I love you more than I could ever put into words.  
- `letter.p3`: You're bright, kind, cool, funny, comforting, talented, brave, strong, steady, supportive, ambitious, organized, insanely cute and unbelievably gorgeous. Your smile lights up my world, your gaze makes my heart skip a beat, your presence leaves me downright speechless. I can't go through an entire day without rediscovering your effortless beauty and brilliance.   
- `letter.p4`: I can’t wait to spend forever with you. I can only hope that I get to spend my life making you as happy as you make me. Your love has given me a sense of purpose, transforming and changing me in ways that I never thought possible. I promise to stand with you through every trial, to support your every dream, and to love you with every breath that I take.  
- `letter.p5`: Every single moment with you is something I just want to hold onto forever. You are my anchor, my confidante, my home, my eternal love, my everything. Te amo.  
- `letter.sign` (right-aligned): — Ayush