# Wortcraft

A medieval 2D puzzle-platformer, rebuilt from the Linenmere codebase and asset set.

## Premise

You play as a witch's apprentice. A patient lies sick or wounded at the
witch's cottage, and the cure is the real historical Nine Herbs Charm salve
— so you're sent out to gather all nine herbs needed to make it. This first
release is a single level containing a string of puzzles along that
journey, framed as the opening chapter of a longer story — built to be
expanded later with more levels/puzzles as the apprentice takes on bigger
jobs.

## Core Loop

1. **Explore** a 2D level on foot (run/jump platforming).
2. **Collect** ingredients found throughout the level, often gated behind a
   small platforming or environmental puzzle.
3. **Conjure** — type any noun to summon a useful thing (Scribblenauts-style
   free-text summoning: a curated lexicon of everyday objects plus a
   procedural fallback so unknown words still spawn something rough).
   Conjuring costs ink and is limited to a few live objects at once, so it
   solves traversal problems without replacing herb lore.
4. **Combine** the nine herbs into salves via fixed folklore recipes
   (herb effects stay grounded, not free-text).
5. **Use** the resulting salve to solve the next obstacle or puzzle, opening
   up new areas of the level.

This keeps the "combine things to solve problems" spirit of Scribblenauts,
with full type-to-conjure for everyday objects alongside the fixed Nine
Herbs recipe book — free summoning for traversal, fixed lore for the cure.

## Scope for v1

- **One level**, structured as ~10 discrete puzzle beats within it.
- Beats should escalate gently in difficulty and introduce one new
  ingredient/spell/obstacle type at a time.
- Level/puzzle data should be structured (not hardcoded) so more levels or
  puzzles can be appended later without reworking the engine.

## Ingredients & Spells

Drawn from the real **Nine Herbs Charm** (Old English *Nigon Wyrta Galdor*),
a 10th-century charm recorded in the *Lacnunga* manuscript. Each herb's
in-game effect is grounded in its actual folkloric use, not invented.
The finale puzzle requires all nine gathered at once to complete the real
charm's salve — the historical recipe combined all nine into one remedy.

| Herb | Historical lore | In-game effect |
|---|---|---|
| Mugwort | "Mother of herbs"; protective, warded travelers against evil spirits and harm | Warding smoke — dispels a lurking spirit/creature blocking the path |
| Plantain | "Waybread" — grows on trodden paths, tough and resilient, used to heal cuts/tears | Mending poultice — repairs a frayed rope bridge or heals a hurt animal blocking the way |
| Betony | Protected against nightmares, fearful visions, and evil spirits; planted in churchyards | Ward against nightmares — dispels a frightening illusion/apparition obstacle |
| Chamomile | Planted near doors/windows to ward bad luck; burned to banish malevolent spirits | Soothing charm — calms an agitated animal (bees, dog, horse) so you can pass |
| Nettle | Stinging leaves symbolically tied to protection and defense | Stinging ward — creates a barrier that deters a pest or small threat |
| Crab apple | Part of the charm's antidote salve, mixed with apple juice | Antidote (combine with Chervil) — neutralizes a poison/blight blocking progress |
| Chervil | Part of the charm's antidote salve alongside crab apple | Antidote (combine with Crab apple) — same as above; teaches the combine-two-ingredients mechanic early |
| Fennel | Used to repel flies and pests; symbol of strength | Pest-clearing charm — disperses a swarm of insects blocking a path |
| Lamb's cress (watercress) | Grows near water/streams | Purifying charm — clears tainted water blocking a stream crossing. *(In-world lore for this game: apprentices are taught that lamb's cress only grows where water still runs pure, so a patch of it always marks the cleanest source nearby — a nice bit of invented flavor text since the herb's real folklore is thin.)* |

**Finale puzzle:** gather all nine, combine them into the actual historical
Nine Herbs Charm salve, and use it to cure the patient waiting back at the
cottage
— a nice narrative payoff that doubles as the real charm's original purpose
(a wound/poison remedy).

## Puzzle Sequence & Settings (v1, 10 beats)

Settings for this first release: **witch's cottage** (start/end), **meadow**,
**forest**, **stream**. The village is saved for a future expansion, not v1.
Puzzle *type* changes every beat (no back-to-back repeats) so the level
doesn't feel like the same puzzle re-skinned nine times, and difficulty
ramps noticeably but not punishingly — each new mechanic gets introduced on
its own before being combined with an earlier one.

1. **Witch's Cottage garden** — Mugwort. Tutorial beat: basic run/jump,
   then dispel a small shadow-creature blocking the garden gate with
   warding smoke. Easy — teaches movement + first spell use.
2. **Meadow** — Chamomile. Calm a startled goat blocking a footbridge
   (timing/positioning puzzle, no platforming challenge). Easy.
3. **Meadow, further out** — Fennel. Time a crossing through a drifting
   insect swarm over tall grass (obstacle-timing, light platforming).
   Easy-Medium — first beat combining a spell with movement timing.
4. **Forest edge** — Betony. Dispel a shifting will-o'-wisp-style illusion
   that's hiding the real path in dim light (a light/vision puzzle rather
   than movement). Medium — first puzzle that isn't primarily physical.
5. **Deeper forest** — Plantain. Repair a frayed rope bridge (showcases the
   Verlet rope mechanic) to cross a ravine. Medium-Hard — first real
   platforming/physics challenge.
6. **Deep forest** — Nettle. Place a stinging-nettle barrier to redirect a
   boar blocking a narrow path, combined with the rope-bridge skill from
   beat 5 to reach it. Hard — first puzzle requiring an earlier mechanic
   again, not just the newest one.
7. **Streamside** — Lamb's cress. Cross via stepping stones and clear
   tainted water blocking the flow, opening a path downstream. Medium —
   introduces water as a new hazard/medium, deliberately eases off after
   beat 6's difficulty spike.
8. **Stream, higher ground** — Crab apple. Found up a tricky platforming
   route above the water. Medium-Hard.
9. **Old stones near the stream** — Chervil, guarded by a jump sequence.
   Combine on the spot with Crab apple into the Antidote to clear a
   blighted patch blocking the way back to the cottage. Hard — first
   on-the-fly combine-two-ingredients puzzle.
10. **Back at the Witch's Cottage** — Finale: combine all nine gathered
    herbs into the real Nine Herbs Charm salve and use it to cure the
    patient waiting at the cottage. Hardest beat — draws on inventory
    management and spell use built up over the whole level.

## Visual Direction

- Keep Linenmere's embroidery / Bayeux-Tapestry medieval look: flat color,
  bold indigo-ish outlines, limited palette, deliberately wonky-but-crisp
  linework.
- **Drop** the toy-theater facade/DOORS framing — no longer needed now that
  the game is fully 2D.
- **Add** a paper-cutout treatment on top of the embroidery style:
  - Layered parallax as literal flat "paper sheets" (background/midground/
    foreground), scrolling at different speeds.
  - Subtle offset shadow behind each sprite layer (duplicate sprite, offset
    a few px, lower opacity) to sell a cutout sitting above the page.
  - Mildly irregular/torn edges on shapes rather than clean digital outlines.
  - No perspective — everything flat-on to camera, true 2D.

## Engine / Technical Approach

- **Rebuild from scratch, not reuse the old 3D-flattened-to-2D setup** — the
  old camera was a 3D scene styled to look 2D, which caused ongoing camera
  issues.
- Move to **Canvas2D or a DOM/CSS-layer setup** (dropping Three.js) —
  simpler collision math, and parallax paper layers are trivial without 3D.
- Camera: simple 2D follow-rig, clamped to level bounds, dead-zone around
  the player, no perspective distortion.
- World and collision entirely in 2D x/y coordinates.

### Physics: rope/bridge wiggle

- Use a **Verlet integration rope** for bridges and similar wiggly objects:
  a chain of point masses connected by distance constraints, solved each
  frame; anchor the end points, let the middle sag/respond to the player's
  weight.
- No full physics engine needed for v1 — Verlet rope is enough for the
  "wiggles when you walk on it" Scribblenauts-style feel.
- Revisit a lightweight physics library (Matter.js/Planck.js) only if later
  puzzles need object-to-object collision or stacking.

## Assets

- Reuse Linenmere's existing photo-flat PNG assets and embroidery palette
  where possible, restyled with the paper-cutout treatment above.
- Scrap all flax/spinning/fibre-production content and family-farm NPCs —
  not part of this game's story.
