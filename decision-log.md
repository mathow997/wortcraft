# Wortcraft — Decision Log

A chronological record of the decisions made while planning this game, for
reference alongside `design-doc.md` and `tech-spec.md`.

1. **Concept pivot.** Starting point: reuse assets from the existing
   "Linenmere" project, but turn it into a medieval-themed 2D puzzle/
   platformer inspired by Scribblenauts' combine-to-solve design, scrapping
   Linenmere's spinning/fibre-production content. New storyline: a witch's
   apprentice gathering herbs and ingredients for spells. Originally scoped
   as 10 levels.

2. **Scope revised.** Ten separate levels replaced with one level containing
   ~10 puzzles, framed as a beginner story arc that can be expanded with
   more levels/puzzles later.

3. **Camera/engine problem identified.** The existing Linenmere codebase was
   built in 3D and later styled to look 2D, causing ongoing camera issues.
   Decision: rebuild from scratch as properly 2D rather than patch the 3D
   setup.

4. **Visual direction updated.** Drop the toy-theater facade/DOORS framing
   now that the game is fully 2D. Keep Linenmere's embroidery/Bayeux-
   Tapestry medieval look, and add a paper-cutout treatment on top (layered
   parallax sheets, offset shadow layers, torn edges, no perspective).

5. **Engine choice finalized.** Canvas2D or a DOM/CSS-layer setup, dropping
   Three.js entirely — simpler collision math, and parallax paper layers
   don't need 3D.

6. **Physics approach chosen.** A Verlet-integration rope for bridges and
   similar wiggly objects (Scribblenauts-style), rather than a full physics
   engine — sufficient for weight-responsive wiggle without the overhead of
   Matter.js/Planck.js.

7. **Design doc drafted**, covering premise, core loop, scope, visual
   direction, engine approach, and a step-by-step build order for opencode
   (design doc → strip old codebase → data-driven level format → vertical
   slice → batch-generate remaining puzzles → story last).

8. **Folklore research conducted.** Grounded the magic system in real early
   medieval Western European folk magic rather than invented fantasy magic:
   "low magic" charms/herb-lore/amulets as everyday village practice; real
   surviving texts (the *Lacnunga*, *Bald's Leechbook*, *Old English
   Herbarium*); the **cunning woman / wise woman** as a genuine, broadly
   accepted village role — magic wasn't criminalized until the early modern
   period, which fit the requirement that magic not be illegal or evil in
   this world.

9. **Ingredient/spell table built** from the real **Nine Herbs Charm**
   (*Nigon Wyrta Galdor*, 10th century, from the Lacnunga): all nine herbs
   (mugwort, plantain, betony, chamomile, nettle, crab apple, chervil,
   fennel, lamb's cress) mapped to an in-game puzzle-solving effect based on
   each herb's actual folkloric use. Crab apple + chervil combine into an
   Antidote. The finale combines all nine into the historical salve.

10. **Puzzle sequence and settings fleshed out.** Ten beats spanning witch's
    cottage → meadow → forest → stream → back to cottage, with the puzzle
    *type* changing every beat (tutorial, calm-creature, obstacle-timing,
    light/vision, physics/rope-repair, barrier-placement, water-crossing,
    platforming, on-site combine, finale-combine) and a difficulty curve
    that ramps noticeably but eases briefly after its first spike. The
    village setting was deliberately deferred to a future expansion.

11. **Story framing resolved.** A patient is sick/wounded back at the
    cottage; the cure is the real Nine Herbs Charm salve, and the
    apprentice's errand is to gather all nine herbs to make it. This ties
    the finale directly to the charm's actual historical purpose.

12. **Lamb's cress given invented lore.** Its real historical folklore is
    thin, so it received made-up in-world apprentice lore (clearly flagged
    as non-historical, unlike the other eight) rather than a stretched
    historical claim.

13. **Title chosen: "Wortcraft."** Tagline: "A medieval puzzle-platformer
    about herbcraft, folklore, and the making of a cure."

14. **Landing page copy drafted** — tagline, short summary, longer summary,
    and a features list — written as though the fuller game already exists,
    deliberately not leading with "historically accurate" as a selling
    point (that's reserved for in-game flavor, e.g. the field book).

15. **Technical spec drafted** (`tech-spec.md`): full app/screen flow
    (landing page → title → world map → level/field book/pause), in-level
    UI requirements, seven JSON data schemas (level, puzzle, herb, field
    book entry, spell/recipe, NPC/creature, dialogue), and a categorized
    asset manifest (characters, creatures, herb icons, environment layers,
    UI, effects).

16. **Two open questions resolved via review:**
    - World Map reuses the cottage-exterior art direction for now, rather
      than getting its own distinct style.
    - Creature calm/deter states get unique animations each, rather than
      sharing a generic "settled" pose.

17. **Character Creation screen added.** A simple one-time screen after
    "New Game": name (free text), hairstyle picker (~4 options), clothing
    color (tint-layer swatches, ~6 options), and a Randomize button that
    draws from a single flat, ungendered pool of real medieval first names
    (e.g. Aldith, Wulfric, Godgifu, Leofric) rather than a gender-split list
    or invented fantasy names.

18. **Full free-text summon adopted.** Overruled the earlier fixed-recipes-only
    scope (design-doc Core Loop, tech-spec §2): typing any noun now conjures
    an object Scribblenauts-style — curated lexicon (~20 everyday objects)
    plus a procedural fallback so unknown words still spawn a rough parcel.
    Ink-limited (3 per run, max 3 live) so conjuring solves traversal without
    replacing herb lore. Herb effects and the Nine Herbs recipes stay fixed
    folklore.

19. **Summon behaviors implemented.** Conjured objects now have five
    behaviors: `static` platforms, `float` (balloon/cloud rise and carry a
    rider), `heavy` (anvil/boulder/barrel fall and land), `bouncy`
    (ball/cushion trampoline the player), `climb` (ladder/rope/pole scalable
    with W/S). Behavior glyphs (↑▼~≡) drawn on summoned objects.

20. **Pushable summons.** Walking into a grounded conjured object shoves it,
    so a ladder can be pushed into place under a ledge or a plank slid over
    thorns. Heavies shove slowly and re-fall if pushed off a ledge; floats
    can't be pushed (they drift).

21. **Ropelike behavior + tying.** `rope`/`vine`/`chain` conjure Verlet
    strands (chain is heavier/stiffer) instead of solids. A strand's top
    auto-anchors to the nearest surface above it, else it drapes where it
    lands. Loose ends can be tied with `E`: end-to-end knots two ropes into
    one longer strand (40-point cap); onto a surface ties off at that spot.
    Riding a strand: `E` grabs, `W/S` climbs, `A/D` pumps the swing, `Space`
    releases with momentum. Knots vs frayed ends drawn in-world; counts
    against the same 3-live-object cap.

23. **Beat 1 redesigned: find the herb.** Dropped the shadow-dispel (moved
    to a later beat). Now: 3200px trek, thorn bed, three dusty jars with
    shuffled labels on an unjumpable high shelf (wipe with `E` to read,
    wrong jars named and left), intended solution is a conjured ladder
    pushed into place — balloon/rope work too. Ravine islands, hill hops,
    checkpoint at the shed, and the exit door only counts with mugwort in
    hand. Jump-from-ladder added (Space works on ladders).

22. **Carryable ropes + tie validation.** Loose ends can be picked up (`E`)
    and carried overhead with full movement — ground friction makes the
    strand trail behind — then tied or dropped with `E`. Tie validation
    refuses impossible spans (too far to reach, or so close the rope would
    bunch into a stub). Ropes lengthened (~168px) so tied lines read
    properly. Grabbing the middle of a strand still rides it.

25. **Taller shed, split jars, cloth gate, unlabeled thorns.** Beat 1's jars
    now sit one per high platform across three heights (world is 900px tall
    with vertical camera), and the mugwort shuffles across all three every
    run — every jar must be reachable, none by jumping. Wiping needs a
    conjured cloth/rag/sponge/brush/duster (bare hands smear; equipped to
    inventory, costs ink, no live slot); ink raised to five. Thorns draw as
    bare spikes with no label. Creation-screen preview uses the same paper
    doll as in-game. Warding smoke + shadow data moved to puzzle_04.

24. **Detailed procedural art pass.** New `js/art.js` pre-renders the whole
    3200px level once to an offscreen canvas (strict 22-palette, indigo
    outlines, stitch dashes, offset shadows): garden with fence/flowers,
    potting-shed interior with daub-and-timber walls, window + light shaft,
    three backdrop shelves (~20 jars/books/candles), the gameplay shelf
    with back panel and end jars, hanging sign, five herb bundles,
    workbench with mortar/books/candle, rug with sleeping cat, broom,
    spider web, floorboards, dark ravine with roots and mist, and a
    detailed cottage door (thatch lip, lantern, step) at the exit. The
    apprentice is now a paper doll: robe with torn hem and stitching,
    belt, satchel, boots, all 4 creation hairstyles, facing eyes, and a
    raised arm while carrying rope.

26. **Scenery readability.** Placeholder rectangle hills replaced with
    overlapping mound ellipses tucked behind the ground line, round-canopy
    trees added to garden + home stretch, outdoor platforms get grass caps
    so they read as turf-topped rather than bare bars.

27. **Universal summon gravity + detailed sprites.** Magic-hover removed:
    every non-float summon falls when unsupported and lands, so shoving one
    off an edge drops it (only settled objects are pushable). All ~25
    lexicon words now draw as proper little things — ladders with rungs,
    braced crates, grained planks, faceted stones, stepped stairs, tables,
    hooped barrels, seamed balls, cushions, balloons with strings, clouds,
    anvils, doors, shields, boats, wattle walls — plus word labels; unknown
    words get a `?` parcel.

28. **Generous conjuring budget.** Ink 5→8 per run, live cap 3→6. Scarcity
    reserved as a later-level difficulty lever (per-level ink/live tuning),
    not a beat-1 constraint.

29. **No live cap; banish to clean up.** Live-object eviction removed —
    conjured things persist until banished. Ink is the only limit (50 per
    run for now). `X` removes the nearest conjured object/strand (never the
    one being ridden or carried) with a parchment puff and refunds 1 ink,
    so experimenting and retrying is free-ish. On-screen `X: banish` hint.

30. **Beats 2–4 ship as separate chapters.** One shared engine with a BEATS
    registry (per-chapter layout/ink/herb/dialogues/decor + update/E/draw
    hooks); pickups generalized (dust optional, free takes), NPCs
    (blocking goat), patrol swarms, ghost platforms, per-chapter dim light.
    Chapters: goat bridge + chamomile, swarm field + fennel, will-o'-wisp
    glamour + betony (reveal-to-solidify) — ink 50 every chapter for now;
    scarcity tuning comes later.

31. **Phase 1 systems: use-key, tools, consumables, medieval filter.**
    `U` uses the right thing on the nearby problem (hook.use per chapter);
    `E` takes/interacts. Handheld tools (cloth/music/broom via flute, pipe,
    horn, lute, harp, broom, cloth words) max 2 held, double-tap `E` sets
    the oldest down. Herbs are counted with per-plant yields; soothing,
    scattering, and revealing consume one. Music notes + burn fx added.
    Lexicon +13 medieval objects (torch, lantern, stool, bucket, basket,
    sack, bell, drum, banner, book, candle, staff, wheel) with sprites;
    ~40 modern words refused with "It's 1178 — what's a ___?" (no ink
    spent).
    Decor themes meadow/tallgrass/forest; chapters reunite into one journey
    later. Level schema gains `beat` + `blurb`.

32. **Phase 2: the goats get mean.** Unsoothed goats patrol set zones and
    charge the apprentice on their level — touch restarts the chapter.
    Second goat guards the exit path. Chamomile grows wild (not jars) on a
    high platform, 3 picks per plant; soothing burns one per goat, flute
    plays free. Meadow world taller (720px); paddock, hay bale, pail, and
    dragonflies added. Goats face travel direction.

33. **Phase 3: taller swarm + forest.** Swarm field and forest edge go
    720px tall. Fennel moves to an upper platform (4 picks; burning one per
    permanent scatter, broom waves off for ~6s). Ghost path raised
    (y240–300, ladder or balloon to reach the first stone); betony patch
    yields 3, reveal burns one. Fixed two jump gaps that exceeded max jump
    range on the swarm field.

34. **Phase 4: themes + detail.** Tallgrass reads as dusk meadow now (warm
    wash, cattails, fallen log, fireflies, hawk) vs. bright meadow
    (paddock, butterflies). Shed gains a charm chalkboard, stool, and
    garlic braid; forest a stone circle and a perched owl.

35. **Bugfix + usability + toys.** Ch2 blank load fixed (a comment had
    swallowed the stream const); error overlay + `?v=8` cache-busters added
    so failures show themselves. Fennel use radius 130→170, swarms give a
    0.8s flashing grace before driving you back. Ch3 thorns became swampy
    mud (slows wading, swallows loiterers) with matching decor. Tools now
    spawn as physical pushable objects (`E` takes, double-`E` sets back
    down as an object). New throwable grappling hook (`hook`/`grapple`/
    `grappling`) that anchors into surfaces and drops a swingable rope.

36. **Hook aiming.** Conjured hooks hover at hand; the mouse aims (upper
    hemisphere) with a dotted trajectory preview + landing ring, click or
    `Space` looses. Fixed speed, gravity-matched preview, 1.6s flight
    before it clatters down as an object.

37. **Locked vertical camera where it fits.** Chapters 2–4 play on one
    screen height, so vertical follow is locked off there — no more bobbing
    when hopping the high platforms above the swamp. Only the tall shed
    (ch.1) scrolls vertically.

38. **Hosting: GitHub Pages.** Free, updates deploy on every push to
    `main`, no build step (relative paths only, no backend). Verified
    Pages-ready; owner enables it once in repo settings.

39. **Push convention.** Push all major changes to
    https://github.com/mathow997/wortcraft (`main`) — every push
    redeploys the live build, so commit + push together rather than
    leaving finished work local.

40. **Summon record + quick-resummon.** Every attempted word is logged
    with its outcome (behavior / `fallback` / `rejected`) to a session
    log (pause menu, this run) and a persistent journal (`wort_journal`,
    cap 300, pause-menu copy button exports JSON + per-word report so
    frequent misses can be promoted into the lexicon). HUD quick slots
    re-conjure the last 3 successful words (click or `1/2/3`, same ink
    cost), cleared at the start of each level.

41. **Near-miss spell check.** Unknown summon words within Damerau distance
    1 (or 2 on long words) of a known word offer "Did you mean X?" with
    Yes / No-use-mine buttons — suggestion never forces, the typed word
    always stays available. Rejected modern words bypass it.

42. **First journal-driven lexicon growth.** Playtest journal (34 attempts)
    promoted six words to full entries with sprites: `bird` (float),
    `clarinet` (music tool — the goat solution players kept reaching for),
    `tree` (climb), `house` (static), `mop` (broom tool), `stick`
    (static). Typos (`flue`, `rop`, `hock`) now route through spell
    check; `fly`/`owl`/`window`/`building` stay fallback until they earn
    a second use.
