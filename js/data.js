// Wortcraft data — mirrors data/*.json (canonical per tech-spec §3).
// Kept embedded so the game runs from file:// with zero build step.
// Canonical JSON files live in data/ for future Vite/TS upgrade.
window.WORT = {
levels:[
 {id:"level_01",title:"The Potting Shed",beat:"level_01",blurb:"Mugwort · dusty jars, high shelves",unlockedByDefault:true,settings:["cottage_garden"],puzzles:["puzzle_01"],introDialogue:"dialogue_level01_intro",outroDialogue:"dialogue_level01_outro"},
 {id:"level_02",title:"The Startled Goat",beat:"level_02",blurb:"Chamomile · calm the bridge-keeper",unlockedByDefault:true,settings:["meadow"],puzzles:["puzzle_02"],introDialogue:"dialogue_b2_intro",outroDialogue:"dialogue_b2_outro"},
 {id:"level_03",title:"The Swarm Field",beat:"level_03",blurb:"Fennel · time the swarms or scatter them",unlockedByDefault:true,settings:["meadow"],puzzles:["puzzle_03"],introDialogue:"dialogue_b3_intro",outroDialogue:"dialogue_b3_outro"},
 {id:"level_04",title:"The Will-o'-wisp",beat:"level_04",blurb:"Betony · burn the glamour",unlockedByDefault:true,settings:["forest"],puzzles:["puzzle_04"],introDialogue:"dialogue_b4_intro",outroDialogue:"dialogue_b4_outro"}
],
puzzles:[
  {id:"puzzle_01",setting:"cottage_garden",type:"tutorial_movement",requiredHerb:"mugwort",difficulty:1,introducesMechanic:"move_jump_use",reusesMechanic:null,onComplete:{grantsHerb:"mugwort"}},
  {id:"puzzle_02",setting:"meadow",type:"calm_creature",requiredHerb:"chamomile",difficulty:1,introducesMechanic:"calm",reusesMechanic:null,onComplete:{grantsHerb:"chamomile"}},
  {id:"puzzle_03",setting:"meadow",type:"obstacle_timing",requiredHerb:"fennel",difficulty:2,introducesMechanic:"timing",reusesMechanic:null,onComplete:{grantsHerb:"fennel"}},
  {id:"puzzle_04",setting:"forest_edge",type:"light_vision",requiredHerb:"betony",difficulty:2,introducesMechanic:"vision",reusesMechanic:null,onComplete:{grantsHerb:"betony"}},
  {id:"puzzle_05",setting:"forest_deep",type:"physics_bridge_repair",requiredHerb:"plantain",difficulty:3,introducesMechanic:"verlet_rope",reusesMechanic:null,onComplete:{grantsHerb:"plantain"}},
  {id:"puzzle_06",setting:"forest_deep",type:"barrier_placement",requiredHerb:"nettle",difficulty:3,introducesMechanic:"barrier",reusesMechanic:"verlet_rope",onComplete:{grantsHerb:"nettle"}},
  {id:"puzzle_07",setting:"stream",type:"water_crossing",requiredHerb:"lambs_cress",difficulty:2,introducesMechanic:"water",reusesMechanic:null,onComplete:{grantsHerb:"lambs_cress"}},
  {id:"puzzle_08",setting:"stream",type:"platforming_challenge",requiredHerb:"crab_apple",difficulty:3,introducesMechanic:"climb",reusesMechanic:null,onComplete:{grantsHerb:"crab_apple"}},
  {id:"puzzle_09",setting:"stream",type:"combine_onsite",requiredHerb:"chervil",difficulty:3,introducesMechanic:"combine",reusesMechanic:null,onComplete:{grantsHerb:"chervil"}},
  {id:"puzzle_10",setting:"cottage_interior",type:"finale_combine",requiredHerb:null,difficulty:4,introducesMechanic:"finale",reusesMechanic:"combine",onComplete:{}}
],
herbs:[
  {id:"mugwort",displayName:"Mugwort",icon:"🌿",foundIn:"puzzle_01",effectType:"dispel_creature",combinesWith:[],fieldBookEntry:"fieldbook_mugwort",isHistorical:true},
  {id:"chamomile",displayName:"Chamomile",icon:"🌼",foundIn:"puzzle_02",effectType:"calm",combinesWith:[],fieldBookEntry:"fieldbook_chamomile",isHistorical:true},
  {id:"fennel",displayName:"Fennel",icon:"🌱",foundIn:"puzzle_03",effectType:"clear_swarm",combinesWith:[],fieldBookEntry:"fieldbook_fennel",isHistorical:true},
  {id:"betony",displayName:"Betony",icon:"💜",foundIn:"puzzle_04",effectType:"dispel_illusion",combinesWith:[],fieldBookEntry:"fieldbook_betony",isHistorical:true},
  {id:"plantain",displayName:"Plantain",icon:"🍃",foundIn:"puzzle_05",effectType:"mend",combinesWith:[],fieldBookEntry:"fieldbook_plantain",isHistorical:true},
  {id:"nettle",displayName:"Nettle",icon:"🌵",foundIn:"puzzle_06",effectType:"barrier",combinesWith:[],fieldBookEntry:"fieldbook_nettle",isHistorical:true},
  {id:"lambs_cress",displayName:"Lamb's cress",icon:"💧",foundIn:"puzzle_07",effectType:"purify_water",combinesWith:[],fieldBookEntry:"fieldbook_lambs_cress",isHistorical:false},
  {id:"crab_apple",displayName:"Crab apple",icon:"🍏",foundIn:"puzzle_08",effectType:"antidote_part",combinesWith:["chervil"],fieldBookEntry:"fieldbook_crab_apple",isHistorical:true},
  {id:"chervil",displayName:"Chervil",icon:"☘️",foundIn:"puzzle_09",effectType:"antidote_part",combinesWith:["crab_apple"],fieldBookEntry:"fieldbook_chervil",isHistorical:true}
],
fieldbook:[
  {id:"fieldbook_mugwort",herbId:"mugwort",unlockedBy:"puzzle_01",isHistorical:true,text:"Known as the 'mother of herbs' — carried by travellers for centuries as protection against harm on the road."},
  {id:"fieldbook_chamomile",herbId:"chamomile",unlockedBy:"puzzle_02",isHistorical:true,text:"Hung by doors and windows against ill luck; burned to drive off unkind spirits."},
  {id:"fieldbook_fennel",herbId:"fennel",unlockedBy:"puzzle_03",isHistorical:true,text:"Hung in doorways to drive away flies and pests; a symbol of strength."},
  {id:"fieldbook_betony",herbId:"betony",unlockedBy:"puzzle_04",isHistorical:true,text:"Planted in churchyards against fearful visions and nightmares."},
  {id:"fieldbook_plantain",herbId:"plantain",unlockedBy:"puzzle_05",isHistorical:true,text:"Waybread — thrives on trodden paths; laid on cuts to close them."},
  {id:"fieldbook_nettle",herbId:"nettle",unlockedBy:"puzzle_06",isHistorical:true,text:"Sting turned outward: a ward that keeps small threats at bay."},
  {id:"fieldbook_lambs_cress",herbId:"lambs_cress",unlockedBy:"puzzle_07",isHistorical:false,text:"Apprentice lore: lamb's cress only roots where water still runs pure — find the patch, find the clean source."},
  {id:"fieldbook_crab_apple",herbId:"crab_apple",unlockedBy:"puzzle_08",isHistorical:true,text:"Pressed for juice into the Nine Herbs antidote salve."},
  {id:"fieldbook_chervil",herbId:"chervil",unlockedBy:"puzzle_09",isHistorical:true,text:"Stirred with crab apple in the antidote; teaches the two-herb combine."}
],
spells:[
  {id:"warding_smoke",inputs:["mugwort"],effect:"dispel_creature",triggerPuzzle:"puzzle_04"},
  {id:"antidote",inputs:["crab_apple","chervil"],effect:"neutralize_blight",triggerPuzzle:"puzzle_09"},
  {id:"nine_herbs_charm",inputs:["mugwort","plantain","betony","chamomile","nettle","crab_apple","chervil","fennel","lambs_cress"],effect:"cure_patient",triggerPuzzle:"puzzle_10"}
],
npcs:[
  {id:"shadow_gate",displayName:"Lurking shadow",appearsIn:"puzzle_04",behavior:"blocks_until_dispelled",calmedBy:"mugwort"},
  {id:"goat_bridge",displayName:"Startled Goat",appearsIn:"puzzle_02",behavior:"blocks_until_calmed",calmedBy:"chamomile"}
],
dialogues:{
  dialogue_level01_intro:{id:"dialogue_level01_intro",speaker:"witch",lines:["Mugwort first. The potting shed keeps its jars on three high shelves — higher than any apprentice can jump, and the herb moves shelf to shelf.","An inch of dust on every jar, and bare hands will only smear it. Conjure a cloth, wipe them clean to read the labels.","Need to get up there? Type it (T) — a ladder, perhaps. Mind the ink: fifty conjurings a trip."]},
  dialogue_beat1_pickup:{id:"dialogue_beat1_pickup",speaker:"apprentice",lines:["Mugwort. Mother of herbs.","One herb for the charm. Now walk it home — east, through the door."]},
  dialogue_level01_outro:{id:"dialogue_level01_outro",speaker:"witch",lines:["One herb found, eight to go.","The charm is patient. The patient is not — back out there soon."]},
  dialogue_b2_intro:{id:"dialogue_b2_intro",speaker:"witch",lines:["Chamomile next. A startled goat holds the footbridge — nothing crosses while it stamps.","Chamomile hangs by the doors of the wise against ill luck. Find some. Soothe the beast."]},
  dialogue_b2_pickup:{id:"dialogue_b2_pickup",speaker:"apprentice",lines:["Chamomile. Small flowers, soft hands.","Easy, now. Easy."]},
  dialogue_b2_outro:{id:"dialogue_b2_outro",speaker:"witch",lines:["Two herbs. The goat will dine out on this story for years.","East. The tall grass hums — mind it."]},
  dialogue_b3_intro:{id:"dialogue_b3_intro",speaker:"witch",lines:["Fennel grows past the swarm field. They guard the tall grass jealously.","Time their drifting, or burn fennel to scatter them. Fennel fears no pest."]},
  dialogue_b3_pickup:{id:"dialogue_b3_pickup",speaker:"apprentice",lines:["Fennel. Smell that — strength itself.","Now, through or around them."]},
  dialogue_b3_outro:{id:"dialogue_b3_outro",speaker:"witch",lines:["Three herbs. The field will buzz about you.","The forest edge lies ahead, and something there wears a borrowed shape."]},
  dialogue_b4_intro:{id:"dialogue_b4_intro",speaker:"witch",lines:["Betony. It waits past the forest edge, where a will-o'-wisp paints false paths.","Trust nothing that shimmers. Burn betony, and walk the real stone."]},
  dialogue_b4_pickup:{id:"dialogue_b4_pickup",speaker:"apprentice",lines:["Betony. Against nightmares and false faces.","Now show me what you really are."]},
  dialogue_b4_outro:{id:"dialogue_b4_outro",speaker:"witch",lines:["Four herbs. The charm takes shape.","Rest. The deep forest — and plantain — will ask harder things of you."]}
},
names:["Aldith","Wulfric","Godgifu","Leofric","Edith","Cuthbert","Osric","Winifred","Beorn","Mildryth","Cenric","Aelfgyva","Dunstan","Hilda","Eadric","Sigeburg"],
hairstyles:["hair_01","hair_02","hair_03","hair_04"],
colors:["#b3552e","#d9a441","#8a9a5b","#2e3a68","#3d7038","#6a4a26"]
};
