# Wortcraft — Technical Spec

Companion to `design-doc.md`. This document is implementation-facing: screen
flow, UI requirements, data schemas, and the asset list — written so opencode
can build against it directly rather than inferring structure from prose.

---

## 1. App / Screen Flow

```
Landing Page (marketing, outside the game build)
        │
        ▼
  Title Screen ── Settings
        │
   New Game ──► Character Creation ──┐
        │                             │
   Continue                          │
        │                             │
        ▼                             ▼
   World Map ─────────────────────────┘
   (level select)              │
        │                      │
        ▼                      ▼
      Level                Field Book
   (gameplay)             (viewable from
        │                  Title Screen,
   ┌────┼────┐             World Map, or
   ▼    ▼    ▼             the in-level
 Pause Dialogue Puzzle     pause menu)
  Menu  /Story  Overlay
        │
        ▼
  Level Complete ──► back to World Map
```

- **Title Screen**: New Game / Continue / Field Book / Settings. Minimal —
  this is a small game, no need for a heavy front-end.
- **Character Creation**: shown once, on New Game only. Very simple —
  name, hairstyle, and clothing color (see §1.1). Confirm proceeds straight
  to the World Map.
- **World Map**: shows level nodes. In v1 there's only one node (the single
  10-puzzle level), but build the screen to take an array of level entries
  from the start so adding a second level later is just data, not new UI
  code. Locked/unlocked state per node. Reuses the cottage-exterior art
  direction for now rather than a separate visual style — revisit once
  there are enough levels for the map itself to need distinct treatment.
- **Level**: the actual 2D puzzle-platformer gameplay.
- **Field Book**: a browsable reference of herbs discovered so far (see §3.3
  and §3.4) — real folklore for grounded herbs, invented in-world lore where
  noted (e.g. lamb's cress). Accessible without needing to be mid-level.
- **Pause Menu** (in-level): Resume / Field Book / Restart Level / Settings /
  Quit to World Map.

### 1.1 Character Creation screen

Kept deliberately minimal — three choices, no stat/skill implications:

| Element | Behavior |
|---|---|
| **Name field** | Free-text entry, used in dialogue where the apprentice is addressed. |
| **Randomize button** | Fills the name field with a random pick from a medieval first-name list (see §3.6). Not gender-locked — the same pool is offered regardless of any other choice, since names of any gender should be available. |
| **Hairstyle picker** | A handful of preset options (start with ~4), cycled via arrows or thumbnail select. |
| **Clothing color picker** | A small swatch palette (start with ~6 colors) consistent with the game's limited embroidery palette — implemented as a tint/recolor layer on the base apprentice sprite rather than separate art per color, to avoid needing full redraws per option. |
| **Confirm button** | Locks in the choices and proceeds to the World Map. |

## 2. In-Level UI

| Element | Behavior |
|---|---|
| **Inventory bar** | Persistent strip showing herbs currently held/collected this level. Icon per herb, greyed out until picked up. |
| **Recipe/Combine prompt** | Appears contextually near a combinable obstacle (e.g. the blighted patch at beat 9) once the apprentice is holding the required ingredient(s). Player confirms to trigger the combine + effect. Herb recipes are fixed folklore, so this stays a simple "press to use" prompt rather than a full crafting UI. |
| **Summon bar** | Free-text type-to-conjure (Scribblenauts-style): `T` opens the bar, typing a noun + Enter spawns the object near the player, `Esc` closes. Ink-limited (50 per run in beat 1) with no live cap — `X` banishes the nearest conjured thing for a 1-ink refund (tune ink down per-level for difficulty). Curated lexicon (~20 everyday objects: ladder, bridge, plank, stone…) plus a procedural fallback so unknown words still spawn a rough parcel. |
| **Active spell indicator** | Small icon showing which spell effect is currently available/equipped, if a herb can be used more than once (e.g. Nettle's ward being placeable in more than one spot). |
| **Dialogue box** | Bottom-anchored text box for story beats (witch, patient, ambient apprentice thoughts). Simple advance-on-tap/click, no branching needed for v1. |
| **Puzzle-specific overlays** | Only beat 4 (Betony/illusion) and beat 9 (Crab apple + Chervil combine) need bespoke overlay UI beyond the standard prompt — flag these as custom work, not reusable components. |
| **Pause button** | Always accessible, opens Pause Menu. |

## 3. Data Schemas

Keep all of the below as data files (JSON), not hardcoded in level logic —
this is what makes "add level 2 later" cheap.

### 3.1 Level schema

```json
{
  "id": "level_01",
  "title": "The Nine Herbs",
  "beat": "level_01",
  "blurb": "Mugwort · dusty jars, high shelves",
  "unlockedByDefault": true,
  "settings": ["cottage_garden", "meadow", "forest", "stream", "cottage_interior"],
  "puzzles": ["puzzle_01", "puzzle_02", "... puzzle_10"],
  "introDialogue": "dialogue_level01_intro",
  "outroDialogue": "dialogue_level01_outro"
}
```

`beat` selects the chapter's builder + hooks in the shared engine;
`blurb` is the one-line map teaser.

### 3.2 Puzzle/beat schema

```json
{
  "id": "puzzle_05",
  "setting": "forest_deep",
  "type": "physics_bridge_repair",
  "requiredHerb": "plantain",
  "difficulty": 3,
  "introducesMechanic": "verlet_rope",
  "reusesMechanic": null,
  "onComplete": { "grantsHerb": "plantain" }
}
```

`type` should be an enum covering the ten beat types already designed:
`tutorial_movement`, `calm_creature`, `obstacle_timing`, `light_vision`,
`physics_bridge_repair`, `barrier_placement` (reuses `physics_bridge_repair`),
`water_crossing`, `platforming_challenge`, `combine_onsite`, `finale_combine`.

### 3.3 Herb / ingredient schema

```json
{
  "id": "mugwort",
  "displayName": "Mugwort",
  "foundIn": "puzzle_01",
  "effectType": "dispel_creature",
  "combinesWith": [],
  "fieldBookEntry": "fieldbook_mugwort",
  "isHistorical": true
}
```

`combinesWith` is empty for single-use herbs, and lists the paired id for
Crab apple / Chervil. `isHistorical: false` flags lamb's cress so the field
book can present its entry as in-world lore rather than real folklore (see
§3.4).

### 3.4 Field book entry schema

```json
{
  "id": "fieldbook_mugwort",
  "herbId": "mugwort",
  "unlockedBy": "puzzle_01",
  "isHistorical": true,
  "text": "Known as the 'mother of herbs' — carried by travellers for centuries as protection against harm on the road."
}
```

For lamb's cress: `"isHistorical": false`, with text framed as the
apprentice's own training/lore rather than a historical citation (matches
the "clean water" flavor text already drafted in the design doc).

### 3.5 Spell/recipe schema

```json
{
  "id": "antidote",
  "inputs": ["crab_apple", "chervil"],
  "effect": "neutralize_blight",
  "triggerPuzzle": "puzzle_09"
}
```

Finale recipe (`id: "nine_herbs_charm"`) takes all nine herb ids as inputs.

### 3.6 Character customization schema

```json
{
  "name": "Aldith",
  "hairstyleId": "hair_02",
  "clothingColor": "#7a2e3a"
}
```

Saved once at Character Creation and referenced wherever the apprentice is
rendered or addressed by name in dialogue.

**Medieval name list (for Randomize):** a single flat pool, not split by
gender, so any name can come up regardless of other choices. Draw from
genuinely period first names rather than invented fantasy ones — e.g.
Aldith, Wulfric, Godgifu, Leofric, Edith, Cuthbert, Æthelflæd, Osric,
Winifred, Beorn, Mildryth, Cenric (mix of masculine, feminine, and
unisex-attested Old English names). Expand the list freely — this is meant
to be a long flat array in the data file, not a hardcoded short set.

### 3.7 NPC / creature schema

```json
{
  "id": "goat_bridge",
  "displayName": "Startled Goat",
  "appearsIn": "puzzle_02",
  "behavior": "blocks_until_calmed",
  "calmedBy": "chamomile"
}
```

Covers: goat (beat 2), insect swarm (beat 3 — may not need full NPC
treatment, could be a hazard object instead), will-o'-wisp illusion (beat
4), boar (beat 6), the patient (cottage, story object rather than gameplay
NPC).

### 3.8 Dialogue schema

```json
{
  "id": "dialogue_level01_intro",
  "speaker": "witch",
  "lines": ["The patient won't last the week without a cure.", "You know the charm. Nine herbs. Go."]
}
```

Simple linear line arrays are enough for v1 — no branching dialogue needed.

### 3.9 Conjure/lexicon entry schema

```json
{
  "word": "ladder",
  "w": 36,
  "h": 110,
  "fill": "#8a6a42",
  "behavior": "static"
}
```

Curated words live in data; unknown words fall back to a hashed parcel
(size/color derived from the word) so *anything* typed still appears.
`behavior` is one of `static` (platform), `float` (rises, carries rider),
`heavy` (falls under gravity, lands — and shoves slowly), `bouncy`
(trampolines the player), `climb` (scalable with W/S), `rope` (Verlet
strand — drapes under gravity, auto-anchors its top to surfaces above,
rideable). Every non-float summon obeys gravity: unsupported objects fall
and land, so pushing one off an edge drops it. Only resting (supported)
summons can be pushed — walk into one to shove it; floats drift instead.

Ropelike words (`rope`, `vine`, `chain` — heavier) spawn strands, not
solids. Loose ends show frayed; tied points show knots. Securing: a falling
strand auto-anchors its top to the nearest surface above (thrown over), or
drapes where it lands. Manual tying with `E` near a loose end: near another
loose end knots the two ropes into one longer strand; near a solid surface
ties off onto it (snapped to the surface). Riding: `E` grabs a strand, `W/S`
climbs along it, `A/D` pumps the swing, `Space` lets go with momentum, `E`
lets go and ties off if holding an end.

Carrying: `E` at a loose end with no tie in reach picks the end up instead —
it rides above the apprentice's head while walking (full movement kept,
ground friction trails the strand behind). `E` again ties it off or drops
it. Tie validation refuses spans the rope can't make: too far apart won't
reach, too close together would bunch into a stub.

## 4. Asset Manifest

Organize by category so opencode can generate/import in batches. All should
follow the paper-cutout-on-embroidery treatment from the design doc (flat
color, bold outline, torn edges, offset shadow layer).

### 4.1 Characters
- Apprentice (player) — idle, run, jump, use-item poses
- Apprentice hairstyle variants (~4, per §1.1) as swappable layer(s) on
  the base apprentice sprite
- Witch (cottage, dialogue only — no gameplay animation needed)
- Patient (cottage, static/bedridden — minimal animation)

### 4.2 Creatures
- Startled goat (idle, calmed — each a unique animation)
- Insect swarm (looping animation / particle-style sprite)
- Will-o'-wisp illusion (flicker/shift animation, unique dispel animation)
- Boar (idle, unique redirected/deterred animation)

Each creature gets its own bespoke calmed/deterred animation rather than a
shared generic pose — worth the extra asset work for how few creatures
there are.

### 4.3 Herb icons (x9, inventory + field book use)
Mugwort, Plantain, Betony, Chamomile, Nettle, Crab apple, Chervil, Fennel,
Lamb's cress — each needs a small inventory icon and a larger field-book
illustration.

### 4.4 Environment — parallax layer sets (per setting)
For each of the five settings (cottage garden, meadow, forest, stream,
cottage interior): background, midground, foreground paper-cutout layers,
plus setting-specific platform/obstacle sprites (bridge segments for the
Verlet rope, stepping stones, the blighted patch, the garden gate).

### 4.5 UI
- Character Creation screen elements: name field, randomize button,
  hairstyle picker, clothing color swatches
- Inventory bar frame + herb slot frames
- Dialogue box frame
- Combine prompt icon
- Pause menu frame
- World map node icons (locked/unlocked states)
- Field book cover + page frame

### 4.6 Effects
- Warding smoke (mugwort)
- Mending sparkle (plantain)
- Nightmare-dispel flash (betony)
- Soothing shimmer (chamomile)
- Sting barrier (nettle)
- Antidote glow (crab apple + chervil)
- Swarm-clear puff (fennel)
- Water-clear ripple (lamb's cress)
- Finale charm effect (all nine combined)

## 5. Open Implementation Questions

- Resolved: full free-text summon adopted (see §2 Summon bar, §3.9) —
  overrules the earlier fixed-recipes-only scope. Herb lore stays fixed;
  everyday-object conjuring is free-text. Flag new questions here as they
  come up during the build.
