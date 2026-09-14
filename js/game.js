// Wortcraft screens + vertical slice beat 1 (puzzle_01 tutorial_movement).
(() => {
  const $ = s => document.querySelector(s);
  const screens = { title:$('#screen-title'), creation:$('#screen-creation'), map:$('#screen-map'), level:$('#screen-level'), fieldbook:$('#screen-fieldbook') };
  let returnTo = 'title';
  function show(name){ Object.values(screens).forEach(el=>el.classList.remove('active')); screens[name].classList.add('active'); }

  const store = {
    get char(){ try{return JSON.parse(localStorage.getItem('wort_char'));}catch{return null;} },
    set char(v){ localStorage.setItem('wort_char', JSON.stringify(v)); },
    get herbs(){ try{return JSON.parse(localStorage.getItem('wort_herbs'))||[];}catch{return[];} },
    addHerb(id){ const h=this.herbs; if(!h.includes(id)){h.push(id); localStorage.setItem('wort_herbs',JSON.stringify(h));} }
  };

  // ---- character creation ----
  let hairIdx = 0, colorIdx = 0;
  const sw = $('#cc-swatches');
  function drawPreview(){
    const c=$('#cc-preview'), x=c.getContext('2d');
    x.clearRect(0,0,96,96);
    x.fillStyle='rgba(0,0,0,.25)'; x.fillRect(30,25,36,44);
    x.fillStyle=WORT.colors[colorIdx]; x.fillRect(26,21,36,44); // robe tint layer (palette-mapped)
    x.strokeStyle='#2e3a68'; x.lineWidth=3; x.strokeRect(26,21,36,44);
    x.fillStyle='#d9b48f'; x.fillRect(34,8,20,18); // face (skin)
    x.fillStyle='#3a2a1a';
    const styles=[()=>x.fillRect(32,2,24,10),()=>{x.fillRect(28,2,32,8);x.fillRect(28,8,6,16);},()=>x.fillRect(30,0,28,14),()=>{x.fillRect(34,0,12,24);}];
    styles[hairIdx]();
    $('#cc-hair-label').textContent=`Hair ${hairIdx+1}/4`;
  }
  function buildSwatches(){
    sw.innerHTML='';
    WORT.colors.forEach((col,i)=>{ const d=document.createElement('div'); d.className='swatch'+(i===colorIdx?' sel':''); d.style.background=col;
      d.onclick=()=>{colorIdx=i;buildSwatches();drawPreview();}; sw.appendChild(d); });
  }
  $('#cc-hair-prev').onclick=()=>{hairIdx=(hairIdx+3)%4;drawPreview();};
  $('#cc-hair-next').onclick=()=>{hairIdx=(hairIdx+1)%4;drawPreview();};
  $('#cc-randomize').onclick=()=>{ $('#cc-name').value=WORT.names[Math.floor(Math.random()*WORT.names.length)]; };
  buildSwatches(); drawPreview();

  // ---- world map (array-driven) ----
  function buildMap(){
    const box=$('#map-nodes'); box.innerHTML='';
    WORT.levels.forEach(lv=>{
      const d=document.createElement('div'); d.className='map-node';
      d.innerHTML=`<b>${lv.title}</b><br><span class="muted">${lv.puzzles.length} puzzles · ${lv.settings.length} settings</span><br>`;
      const b=document.createElement('button'); b.textContent='Play — Beat 1 (vertical slice)'; b.onclick=()=>startLevel();
      d.appendChild(b); box.appendChild(d);
    });
  }

  // ---- field book ----
  function buildFieldbook(){
    const box=$('#fieldbook-list'); box.innerHTML='';
    const owned=store.herbs;
    WORT.fieldbook.forEach(e=>{
      const herb=WORT.herbs.find(h=>h.id===e.herbId);
      const locked=!owned.includes(e.herbId);
      const d=document.createElement('div'); d.className='map-node';
      d.innerHTML=`<b>${locked?'???':herb.displayName}</b> ${e.isHistorical?'':'<span class="muted">(apprentice lore)</span>'}<br><span>${locked?'Not yet found.':e.text}</span>`;
      box.appendChild(d);
    });
  }

  // ---- dialogue ----
  let dlgLines=[], dlgIdx=0, dlgDone=null;
  function playDialogue(id, done){
    const d=WORT.dialogues[id]; if(!d){done&&done();return;}
    dlgLines=[...d.lines]; dlgIdx=0; dlgDone=done||null;
    $('#dialogue').classList.remove('hidden'); showLine();
  }
  function showLine(){ $('#dialogue-text').textContent=(WORT.dialogues ? '' : '') + dlgLines[dlgIdx]; }
  $('#dialogue').onclick=()=>{ advanceDialogue(); keys['Space']=false; };
  function advanceDialogue(){
    dlgIdx++;
    keys['Space']=false;
    if(dlgIdx>=dlgLines.length){ $('#dialogue').classList.add('hidden'); const f=dlgDone; dlgDone=null; f&&f(); }
    else showLine();
  }
  function dialogueOpen(){ return !$('#dialogue').classList.contains('hidden'); }
  addEventListener('keydown', e=>{ if(e.code==='Space' && dialogueOpen()){ e.preventDefault(); advanceDialogue(); } });

  // ---- global buttons ----
  document.addEventListener('click', e=>{
    const a=e.target.closest('[data-action]'); if(!a) return;
    const act=a.dataset.action;
    if(act==='new-game') show('creation');
    if(act==='continue'){ if(store.char) {buildMap();show('map');} else show('creation'); }
    if(act==='confirm-creation'){
      const name=$('#cc-name').value.trim()||'Aldith';
      store.char={name,hairstyleId:WORT.hairstyles[hairIdx],clothingColor:WORT.colors[colorIdx]};
      buildMap(); show('map');
    }
    if(act==='fieldbook'){ returnTo=a.dataset.from==='map'?'map':(a.dataset.from==='pause'?'level':($('#screen-map').classList.contains('active')?'map':'title')); buildFieldbook(); Object.values(screens).forEach(el=>el.classList.remove('active')); screens.fieldbook.classList.add('active'); }
    if(act==='fieldbook-back'){ show(returnTo==='level'?'level':returnTo); if(returnTo==='level'){} }
    if(act==='to-title') show('title');
    if(act==='resume') $('#pause').classList.add('hidden');
    if(act==='restart') { $('#pause').classList.add('hidden'); startLevel(); }
    if(act==='quit-map'){ $('#pause').classList.add('hidden'); buildMap(); show('map'); stopLoop(); }
    if(act==='settings') $('#settings').classList.remove('hidden');
    if(act==='settings-close') $('#settings').classList.add('hidden');
  });
  $('#btn-pause').onclick=()=>$('#pause').classList.remove('hidden');

  // ---- LEVEL: beat 1 vertical slice (harder + summon demo) ----
  const canvas=$('#game'), ctx=canvas.getContext('2d');
  const WORLD={x:0,y:0,w:1920,h:540};
  const keys=Engine.makeInput();
  const cam=Engine.makeCamera(960,540);
  let player, solids, summons, ropes, liveOrder, herb, shadow, gateWall, exitArch, thorns, running=false, raf=0, hasMugwort=false, shadowGone=false, won=false, fx=[], ink=3, climbT=0;
  const grabbed={rope:null,idx:0,cd:0}; // rope rider state
  const carried={rope:null,end:'last'}; // carried loose end (pick up + move before tying)
  // Full free-text summon (user ruling over fixed-recipe docs): any noun conjures something.
  // v1 implementation: curated base + procedural fallback so unknown words still spawn.
  // behaviors: static | float (rises, carries rider) | heavy (falls, lands) | bouncy (trampoline) | climb (W/S to scale)
  const LEXICON={
    box:['#8a6a42',46,46,'static'], crate:['#8a6a42',52,52,'static'], chest:['#6a4a26',56,40,'static'],
    plank:['#6a4a26',110,16,'static'], bridge:['#6a4a26',150,16,'static'], beam:['#8a6a42',130,20,'static'],
    stone:['#9a9a92',60,30,'static'], rock:['#9a9a92',54,40,'static'], step:['#c9a44a',70,22,'static'],
    stairs:['#c9a44a',90,60,'static'], table:['#8a6a42',80,40,'static'], door:['#6a4a26',40,90,'static'],
    wall:['#8a7a4a',30,110,'static'], block:['#cfc4a8',50,50,'static'], boat:['#6a4a26',110,30,'static'],
    shield:['#2e3a68',40,50,'static'],
    ladder:['#8a6a42',36,110,'climb'], pole:['#6a4a26',16,110,'climb'],
    balloon:['#b3552e',44,58,'float'], cloud:['#f5efdd',90,36,'float'],
    anvil:['#1f2a4a',70,44,'heavy'], boulder:['#9a9a92',80,60,'heavy'], barrel:['#7a4a1a',44,60,'heavy'],
    ball:['#b3552e',36,36,'bouncy'], cushion:['#8a9a5b',56,24,'bouncy'] };
  const GLYPH={static:'',float:'↑',heavy:'▼',bouncy:'~',climb:'≡',rope:'➰'};
  // ropelike words simulate as Verlet strands (see rope system below), not solids
  const ROPE_WORDS={
    rope:{c:'#c9a44a',segs:12,len:14,g:1,damp:0.985},
    vine:{c:'#5f8448',segs:12,len:14,g:0.9,damp:0.98},
    chain:{c:'#9a9a92',segs:8,len:14,g:1.6,damp:0.99} };
  function specFor(word){
    if(ROPE_WORDS[word]) return {rope:true,word,...ROPE_WORDS[word]};
    if(LEXICON[word]){ const [c,w,h,b]=LEXICON[word]; return {w,h,c,b}; }
    // fallback: hash word -> sized parcel so *anything* typed appears (Scribblenauts feel, zero-backend)
    let hsh=0; for(const ch of word) hsh=(hsh*31+ch.charCodeAt(0))>>>0;
    const w=34+(hsh%60), hh=24+(hsh%50);
    const palette=['#8a6a42','#9a9a92','#c9a44a','#8a9a5b','#b3552e'];
    return {w,h:hh,c:palette[hsh%palette.length],b:'static',wild:true};
  }
  function stopLoop(){ running=false; cancelAnimationFrame(raf); }

  function startLevel(){
    show('level');
    $('#summon-bar').classList.add('hidden');
    player=Engine.physicsBody(60,420,28,44);
    solids=[
      {x:0,y:484,w:1920,h:56,id:'ground'},
      {x:220,y:404,w:110,h:18},   // harder: narrower, higher gaps
      {x:470,y:330,w:100,h:18},
      {x:700,y:400,w:90,h:18},
      {x:900,y:284,w:40,h:200,id:'gatewall'}, // blocking wall, removed on dispel
    ];
    summons=[];
    ropes=[]; liveOrder=[]; grabbed.rope=null; grabbed.cd=0; carried.rope=null; climbT=0;
    herb={x:498,y:292,w:28,h:28,taken:false}; // above 2nd platform — needs precise jump
    shadow={x:872,y:420,w:60,h:64};
    gateWall=true;
    exitArch={x:1200,y:364,w:70,h:120}; // visible EXIT goal
    thorns=[{x:760,y:468,w:100,h:16}]; // ground hazard before gate — use platforms or summon over it
    hasMugwort=false; shadowGone=false; won=false; fx=[]; ink=3; updateInk();
    buildInventory();
    playDialogue('dialogue_level01_intro');
    running=true; let last=performance.now();
    const loop=(t)=>{
      if(!running) return;
      const dt=Math.min(0.033,(t-last)/1000); last=t;
      update(dt); render();
      raf=requestAnimationFrame(loop);
    };
    cancelAnimationFrame(raf); raf=requestAnimationFrame(loop);
  }

  function buildInventory(){
    const inv=$('#inventory'); inv.innerHTML='';
    WORT.herbs.filter(h=>h.id==='mugwort').forEach(h=>{
      const d=document.createElement('div'); d.className='slot'+(hasMugwort?'':' locked'); d.textContent=h.icon; d.title=h.displayName;
      inv.appendChild(d);
    });
    $('#spell-indicator').textContent = hasMugwort ? '✨ warding smoke ready (E)' : '';
  }

  function near(a,b,pad=80){ return Math.abs((a.x+a.w/2)-(b.x+b.w/2))<pad && Math.abs((a.y)-(b.y))<130; }
  function updateInk(){ const el=$('#ink-count'); if(el) el.textContent=ink; }

  // summon input wiring (T / Enter / Esc)
  const summonInput=$('#summon-input');
  addEventListener('keydown', e=>{
    if(!screens.level.classList.contains('active')) return;
    if(e.code==='KeyT' && document.activeElement!==summonInput && !won){
      e.preventDefault(); $('#summon-bar').classList.remove('hidden'); summonInput.value=''; summonInput.focus();
    }
    if(e.code==='Escape' && document.activeElement===summonInput){ summonInput.blur(); $('#summon-bar').classList.add('hidden'); }
  });
  summonInput.addEventListener('keydown', e=>{
    e.stopPropagation();
    if(e.key==='Enter'){
      const word=summonInput.value.trim().toLowerCase();
      conjure(word);
      summonInput.value=''; summonInput.blur(); $('#summon-bar').classList.add('hidden');
    }
    if(e.key==='Escape'){ summonInput.blur(); $('#summon-bar').classList.add('hidden'); }
  });
  function evictOldest(){ // max 3 live conjurings across summons + ropes
    const k=liveOrder.shift();
    const out=(k==='r')?ropes.shift():summons.shift();
    if(out && grabbed.rope===out) grabbed.rope=null;
    if(out && carried.rope===out) carried.rope=null;
  }
  function conjure(word){
    if(ink<=0 || won) return;
    if(!word){ flashHint('Type a noun, e.g. ladder, rope, balloon, anvil, ball.'); return; }
    const spec=specFor(word);
    if(summons.length+ropes.length>=3) evictOldest();
    if(spec.rope){ spawnRope(word,spec); liveOrder.push('r'); }
    else {
      summons.push({x:player.x+player.w+20,y:player.y+player.h-spec.h,w:spec.w,h:spec.h,word,c:spec.c,b:spec.b,vy:0,resting:spec.b==='static'||spec.b==='climb'||spec.b==='bouncy',wild:spec.wild});
      liveOrder.push('s');
    }
    ink--; updateInk();
    if(spec.wild) flashHint(`"${word}" appears, roughly. The ink doesn't quite know it.`);
    else if(spec.rope) flashHint(`"${word}" falls — pick up a loose end (E) to carry it, E again to tie or drop.`);
    else if(spec.b!=='static') flashHint(`"${word}" conjured — ${{float:'it rises! Ride it ↑',heavy:'heavy! It drops ▼',bouncy:'bouncy! Jump on it ~',climb:'climb it with W/S ≡'}[spec.b]}`);
  }
  let hintTimer=null;
  function flashHint(msg){
    $('#spell-indicator').textContent=msg;
    clearTimeout(hintTimer);
    hintTimer=setTimeout(buildInventory,1800);
  }

  // ---- rope system: Verlet strands that drape, anchor, knot together, and carry the rider ----
  function spawnRope(word,spec){
    const sx=player.x+player.w+20, sy=player.y+6;
    const pts=[];
    for(let i=0;i<=spec.segs;i++) pts.push({x:sx,y:sy+i*spec.len,px:sx,py:sy+i*spec.len,pinned:false});
    ropes.push({word,c:spec.c,segs:spec.segs,segLen:spec.len,g:spec.g,damp:spec.damp,pts});
  }
  function ptInSolid(p,s,pad=2){ return p.x>s.x-pad && p.x<s.x+s.w+pad && p.y>s.y-pad && p.y<s.y+s.h+pad; }
  function closestOnRect(x,y,s){
    const cx=Math.max(s.x,Math.min(s.x+s.w,x)), cy=Math.max(s.y,Math.min(s.y+s.h,y));
    return {x:cx,y:cy,d:Math.hypot(x-cx,y-cy)};
  }
  function collideRopePoints(r,bodies){
    for(const p of r.pts){
      if(p.pinned) continue;
      for(const s of bodies){
        if(!ptInSolid(p,s,3)) continue;
        const dxl=p.x-(s.x-3), dxr=(s.x+s.w+3)-p.x, dyt=p.y-(s.y-3), dyb=(s.y+s.h+3)-p.y;
        const m=Math.min(dxl,dxr,dyt,dyb);
        if(m===dxl) p.x=s.x-3; else if(m===dxr) p.x=s.x+s.w+3;
        else if(m===dyt) p.y=s.y-3; else p.y=s.y+s.h+3;
        p.px=p.x; p.py=p.y;
      }
      p.x=Math.max(4,Math.min(1916,p.x));
    }
  }
  function anchorTop(r,bodies){
    const top=r.pts[0];
    if(top.pinned) return;
    // 1. surface directly above (thrown over a beam/platform) or overlapping a solid
    for(const s of bodies){
      if(ptInSolid(top,s,2)){ top.pinned=true; return; }
      if(top.x>s.x-8 && top.x<s.x+s.w+8){
        const gap=top.y-(s.y+s.h);
        if(gap>=-4 && gap<=42){ top.x=Math.max(s.x,Math.min(s.x+s.w,top.x)); top.y=s.y+s.h+2; top.px=top.x; top.py=top.y; top.pinned=true; return; }
      }
    }
    // 2. draped: settled onto a top surface below
    const sp=Math.hypot(top.x-top.px,top.y-top.py);
    if(sp<1.2){
      for(const s of bodies){
        if(top.x>s.x-4 && top.x<s.x+s.w+4){
          const gap=s.y-top.y;
          if(gap>=-2 && gap<=8){ top.y=s.y-2; top.px=top.x; top.py=top.y; top.pinned=true; return; }
        }
      }
    }
  }
  function stepRopes(dt){
    const bodies=allSolids();
    for(const r of ropes){
      const g=2200*r.g*dt*dt;
      const riding=grabbed.rope===r;
      for(let i=0;i<r.pts.length;i++){
        const p=r.pts[i];
        if(p.pinned) continue;
        let vx=(p.x-p.px)*r.damp, vy=(p.y-p.py)*r.damp;
        // ground friction so a dragged rope trails instead of sliding like ice
        let supported=false;
        for(const s of bodies){
          if(p.x>s.x-2 && p.x<s.x+s.w+2 && p.y<=s.y+2 && p.y>=s.y-6){ supported=true; break; }
        }
        if(supported) vx*=0.15;
        p.px=p.x; p.py=p.y;
        p.x+=vx; p.y+=vy+g+((riding && i>=grabbed.idx)?g*0.85:0);
        if(riding && i>=grabbed.idx && (keys['ArrowLeft']||keys['KeyA']||keys['ArrowRight']||keys['KeyD'])){
          p.x+=((keys['ArrowRight']||keys['KeyD'])?1:-1)*340*dt; // pump the swing
        }
      }
      for(let k=0;k<5;k++){
        for(let i=0;i<r.pts.length-1;i++){
          const a=r.pts[i], b=r.pts[i+1];
          let dx=b.x-a.x, dy=b.y-a.y;
          const d=Math.hypot(dx,dy)||0.001, diff=(d-r.segLen)/d;
          if(!a.pinned && !b.pinned){ dx*=0.5; dy*=0.5; a.x+=dx; a.y+=dy; b.x-=dx; b.y-=dy; }
          else if(a.pinned && !b.pinned){ b.x-=dx*diff; b.y-=dy*diff; }
          else if(!a.pinned && b.pinned){ a.x+=dx*diff; a.y+=dy*diff; }
        }
      }
      collideRopePoints(r,bodies);
      if(carried.rope!==r) anchorTop(r,bodies); // a carried rope stays in hand
    }
    if(carried.rope){
      if(!ropes.includes(carried.rope)) carried.rope=null;
      else { // held end rides above the apprentice's head
        const h=handPos(), p=carried.rope.pts[carried.end==='first'?0:carried.rope.pts.length-1];
        p.x=h.x; p.y=h.y; p.px=p.x; p.py=p.y;
      }
    }
    // rider follows the held point
    if(grabbed.rope){
      const pt=grabbed.rope.pts[grabbed.idx];
      player.x=pt.x-player.w/2; player.y=pt.y+2;
      player.vx=0; player.vy=0; player.onGround=false;
    }
  }
  function playerCenter(){ return {x:player.x+player.w/2,y:player.y+player.h/2}; }
  function handPos(){ return {x:player.x+player.w/2,y:player.y-6}; }
  function nearestRopePoint(c,maxD){
    let best=null;
    for(const r of ropes) for(let i=0;i<r.pts.length;i++){
      const p=r.pts[i], d=Math.hypot(p.x-c.x,p.y-c.y);
      if(d<maxD && (!best||d<best.d)) best={rope:r,idx:i,d};
    }
    return best;
  }
  function nearestLooseEnd(c,maxD){
    let best=null;
    for(const r of ropes){
      for(const [end,endIdx] of [['first',0],['last',r.pts.length-1]]){
        const p=r.pts[endIdx];
        if(p.pinned) continue;
        const d=Math.hypot(p.x-c.x,p.y-c.y);
        if(d<maxD && (!best||d<best.d)) best={rope:r,end,endIdx,d};
      }
    }
    return best;
  }
  function findTieTarget(self,endPt){
    // (a) another rope's loose end nearby -> knot together
    for(const r of ropes){
      if(r===self.rope) continue;
      for(const [end,endIdx] of [['first',0],['last',r.pts.length-1]]){
        const p=r.pts[endIdx];
        if(p.pinned) continue;
        if(Math.hypot(p.x-endPt.x,p.y-endPt.y)<=70) return {type:'rope',rope:r,end,endIdx};
      }
    }
    // (b) a solid surface nearby -> tie off (snapped onto the surface)
    let best=null;
    for(const s of allSolids()){
      const c=closestOnRect(endPt.x,endPt.y,s);
      if(c.d<=16 && (!best||c.d<best.d)) best={type:'solid',x:c.x,y:c.y,d:c.d};
    }
    return best;
  }
  function ropeLength(r){ return (r.pts.length-1)*r.segLen; }
  function doTie(e,t){
    const r=e.rope, p=r.pts[e.endIdx];
    if(t.type==='solid'){
      // refuse ties that bunch the rope into a stub or can't reach
      const L=ropeLength(r);
      for(const q of r.pts){
        if(q===p || !q.pinned) continue;
        const d=Math.hypot(p.x-q.x,p.y-q.y);
        if(d>L){ flashHint("Too far — the rope won't reach."); return; }
        if(d<L*0.35){ flashHint('Too close — no slack to spare. Tie it further off.'); return; }
      }
      p.x=t.x; p.y=t.y; p.px=p.x; p.py=p.y; p.pinned=true;
      if(carried.rope===r) carried.rope=null;
      flashHint(`"${r.word}" tied fast.`);
    } else mergeRopes(e.rope,e.end,t.rope,t.end);
  }
  function mergeRopes(A,aEnd,B,bEnd){
    const Alen=A.pts.length, Blen=B.pts.length;
    if(Alen+Blen>40){ flashHint('Too much rope to knot — the ink slips.'); return; }
    const Aseq=(aEnd==='last')?A.pts:[...A.pts].reverse();
    const Bseq=(bEnd==='first')?B.pts:[...B.pts].reverse();
    A.pts=Aseq.concat(Bseq);
    A.pts.forEach(p=>{p.px=p.x;p.py=p.y;});
    A.segLen=(A.segLen+B.segLen)/2;
    ropes.splice(ropes.indexOf(B),1);
    liveOrder.splice(liveOrder.indexOf('r'),1);
    if(grabbed.rope===B){ grabbed.rope=A; grabbed.idx=Alen+((bEnd==='first')?grabbed.idx:(Blen-1-grabbed.idx)); }
    else if(grabbed.rope===A && aEnd==='first'){ grabbed.idx=Alen-1-grabbed.idx; }
    if(carried.rope===A||carried.rope===B) carried.rope=null; // tied end was in hand — let go
    flashHint(`Knotted into one long ${A.word}.`);
  }
  function grabRope(r,idx){ grabbed.rope=r; grabbed.idx=idx; climbT=0; }
  function releaseRope(tie){
    const r=grabbed.rope; if(!r){ return; }
    const pt=r.pts[grabbed.idx];
    const dt=1/60;
    player.vx=Math.max(-550,Math.min(550,(pt.x-pt.px)/dt));
    player.vy=Math.max(-600,Math.min(600,(pt.y-pt.py)/dt));
    player.onGround=false;
    const wasEnd=(grabbed.idx===0||grabbed.idx===r.pts.length-1);
    grabbed.rope=null; grabbed.cd=0.3;
    if(tie && wasEnd){
      const ends=grabbed.idx===0?'first':'last';
      const t=findTieTarget({rope:r},pt);
      if(t) doTie({rope:r,end:ends,endIdx:grabbed.idx},t);
    }
  }
  function ropeInteract(){
    // loose ends are for carrying/tying; grab the middle of a strand to ride it
    const c=playerCenter();
    const e=nearestLooseEnd(c,64);
    if(e){
      const p=e.rope.pts[e.endIdx];
      const t=findTieTarget(e,p);
      if(t){ doTie(e,t); return; }
      carried.rope=e.rope; carried.end=e.end;
      flashHint(`Carrying the ${e.rope.word} — walk it over, E ties or drops.`);
      return;
    }
    const n=nearestRopePoint(c,48);
    if(n) grabRope(n.rope,n.idx);
  }
  function carryTieOrDrop(){
    const r=carried.rope; if(!r){ return; }
    const endIdx=carried.end==='first'?0:r.pts.length-1;
    const p=r.pts[endIdx];
    const t=findTieTarget({rope:r,end:carried.end,endIdx},p);
    if(t) doTie({rope:r,end:carried.end,endIdx},t);
    else { carried.rope=null; p.px=p.x; p.py=p.y; }
  }
  function updateRopeRider(dt){
    const r=grabbed.rope;
    climbT+=dt;
    if(climbT>0.12){
      if((keys['KeyW']||keys['ArrowUp'])&&grabbed.idx>0){ grabbed.idx--; climbT=0; }
      else if((keys['KeyS']||keys['ArrowDown'])&&grabbed.idx<r.pts.length-1){ grabbed.idx++; climbT=0; }
    }
  }

  function allSolids(){ return solids.concat(summons); }
  function standingOn(p,s){ return p.y+p.h<=s.y+9 && p.y+p.h>=s.y-9 && p.x+p.w>s.x+2 && p.x<s.x+s.w-2; }
  // pushing: walk into a grounded summon to shove it (ladder into place, plank over thorns).
  // Floats drift on their own; heavies shove slowly once landed.
  function pushable(s){
    if(s.b==='float') return false;
    if(s.b==='heavy') return s.resting;
    return true;
  }
  function tryPush(dx){
    if(!dx) return;
    for(const s of summons){
      if(!pushable(s)) continue;
      const touching = dx>0
        ? (player.x+player.w<=s.x+6 && player.x+player.w+Math.abs(dx)+3>=s.x && player.y+player.h>s.y+8 && player.y<s.y+s.h-4)
        : (player.x>=s.x+s.w-6 && player.x-Math.abs(dx)-3<=s.x+s.w && player.y+player.h>s.y+8 && player.y<s.y+s.h-4);
      if(!touching) continue;
      const step=dx*(s.b==='heavy'?0.45:1);
      const probe={x:s.x+step,y:s.y,w:s.w,h:s.h};
      let blocked=false;
      for(const o of solids.concat(summons.filter(q=>q!==s))){
        if(Engine.overlap(probe,o)){ blocked=true; break; }
      }
      if(!blocked) s.x+=step;
    }
  }

  function updateSummons(dt){
    stepRopes(dt);
    for(const s of summons){
      if(s.b==='float' && !s.resting){
        // rise slowly; stop on ceiling contact; carry rider
        const riding=standingOn(player,s);
        const ny=s.y-45*dt;
        s.y=ny;
        let blocked=s.y<40;
        if(!blocked) for(const o of solids.concat(summons.filter(q=>q!==s))){
          if(Engine.overlap(s,o)){ blocked=true; break; }
        }
        if(blocked){ s.y+=45*dt; s.resting=true; }
        else if(riding){ player.y=s.y-player.h; player.vy=Math.min(0,player.vy); }
          } else if(s.b==='heavy' && !s.resting){
        s.vy+=2200*dt;
        let ny=s.y+s.vy*dt, hit=false;
        const probe={x:s.x,y:ny,w:s.w,h:s.h};
        for(const o of solids.concat(summons.filter(q=>q!==s))){
          if(Engine.overlap(probe,o)){ hit=true; break; }
        }
        if(hit){ // land on top of whatever stopped it
          let top=Infinity;
          for(const o of solids.concat(summons.filter(q=>q!==s))){
            if(s.x+s.w>o.x && s.x<o.x+o.w && o.y>=s.y && o.y<top) top=o.y;
          }
          s.y=(top===Infinity?s.y:top-s.h); s.vy=0; s.resting=true;
          for(let i=0;i<8;i++) fx.push({x:s.x+Math.random()*s.w,y:s.y+s.h,vx:(Math.random()-.5)*120,vy:-Math.random()*120,life:.6});
        } else s.y=ny;
        if(s.y>2000){ s.resting=true; }
      }
    }
    // balloon-vs-sky cap: resting floats hover where stopped
    // heavies re-check support (a shove off a ledge sets them falling again)
    for(const s of summons){
      if(s.b!=='heavy' || !s.resting) continue;
      const probe={x:s.x+2,y:s.y+s.h,w:s.w-4,h:3};
      let supported=false;
      for(const o of solids.concat(summons.filter(q=>q!==s))){
        if(Engine.overlap(probe,o)){ supported=true; break; }
      }
      if(!supported){ s.resting=false; s.vy=0; }
    }
  }

  function update(dt){
    // freeze movement while dialogue open (fixes Space-jump conflict + stuck feeling)
    if(dialogueOpen()){ render(); return; }
    updateSummons(dt);
    if(grabbed.cd>0) grabbed.cd-=dt;
    if(grabbed.rope){
      // riding a rope: W/S climb, A/D pump the swing, Space let go, E let go + tie off
      $('#combine-prompt').classList.add('hidden');
      if(keys['Space']){ releaseRope(false); keys['Space']=false; }
      else if(keys['KeyE']){ releaseRope(true); keys['KeyE']=false; }
      else updateRopeRider(dt);
      cam.follow(player.x+player.w/2, player.y+player.h/2, WORLD);
    } else {
    // movement
    const speed=260;
    player.vx=0;
    if(keys['ArrowLeft']||keys['KeyA']) player.vx=-speed;
    if(keys['ArrowRight']||keys['KeyD']) player.vx=speed;
    if((keys['Space']||keys['ArrowUp']||keys['KeyW'])&&player.onGround) player.vy=-780;
    tryPush(player.vx*dt); // shove grounded summons before resolving player collision
    Engine.moveAndCollide(player,allSolids(),dt);
    // climb: scale ladder/rope/pole with W/S after physics
    const ladder=summons.find(s=>s.b==='climb' && Engine.overlap(player,{x:s.x-8,y:s.y-8,w:s.w+16,h:s.h+16}));
    if(ladder && (keys['KeyW']||keys['ArrowUp']||keys['KeyS']||keys['ArrowDown'])){
      player.y+=((keys['KeyS']||keys['ArrowDown'])?1:-1)*170*dt;
      player.vy=0;
    }
    // bouncy: landing on ball/cushion trampolines the player
    if(player.onGround){
      const tramp=summons.find(s=>s.b==='bouncy' && standingOn(player,s));
      if(tramp){ player.vy=-680; player.onGround=false;
        for(let i=0;i<10;i++) fx.push({x:player.x+Math.random()*player.w,y:player.y+player.h,vx:(Math.random()-.5)*160,vy:-Math.random()*160,life:.5});
      }
    }
    keys['Space']=false;
    cam.follow(player.x+player.w/2, player.y+player.h/2, WORLD);

    // thorns reset (challenge)
    for(const t of thorns){
      if(Engine.overlap(player,t)){ player.x=60;player.y=380;player.vx=player.vy=0; flashHint('Thorns! Use the platforms or conjure a plank (T).'); break; }
    }

    // pickup
    if(!herb.taken && Engine.overlap(player,herb)){
      herb.taken=true; hasMugwort=true; store.addHerb('mugwort'); buildInventory();
      playDialogue('dialogue_beat1_pickup');
    }
    // combine prompt
    const showPrompt = hasMugwort && !shadowGone && near(player,shadow);
    $('#combine-prompt').classList.toggle('hidden',!showPrompt);
    if(showPrompt) $('#combine-name').textContent='warding smoke';
    if(showPrompt && keys['KeyE']){
      shadowGone=true;
      gateWall=false;
      solids=solids.filter(s=>s.id!=='gatewall'); // open gate — wall fully gone
      for(let i=0;i<24;i++) fx.push({x:shadow.x+Math.random()*60,y:shadow.y+Math.random()*64,vx:(Math.random()-.5)*200,vy:-Math.random()*200,life:1});
      keys['KeyE']=false;
      flashHint('Gate open! Head right → through the stone arch.');
    }
    if(keys['KeyE'] && !showPrompt && grabbed.cd<=0){
      if(carried.rope) carryTieOrDrop(); else ropeInteract();
      keys['KeyE']=false;
    }
    } // end on-foot branch (rope rider handled above)
    fx.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.life-=dt;});
    fx=fx.filter(p=>p.life>0);
    // win: touch the visible exit arch (not an invisible x threshold)
    if(shadowGone && Engine.overlap(player,exitArch) && !won){
      won=true; stopLoop();
      playDialogue('dialogue_level01_outro',()=>{buildMap();show('map');});
    }
    // fall back
    if(player.y>700){ player.x=60;player.y=420;player.vx=player.vy=0; }
    // E consumed per-frame guard
    if(keys['KeyE'] && !showPrompt) keys['KeyE']=false;
  }

  function render(){
    ctx.clearRect(0,0,960,540);
    ctx.save(); ctx.translate(-cam.x,-cam.y);
    // parallax paper sheets (bg/mid/fg)
    Engine.paperRect(ctx,cam.x,cam.y-40,960,220,'#c9b98f');           // distant sheet
    for(let i=0;i<6;i++) Engine.paperRect(ctx,i*340+40,cam.y+60+((i%2)*20),180,120,'#b7a67e'); // hills
    solids.forEach(s=>Engine.paperRect(ctx,s.x,s.y,s.w,s.h,'#8a7a52')); // platforms/ground
    summons.forEach(s=>{ Engine.paperRect(ctx,s.x,s.y,s.w,s.h,s.c); ctx.fillStyle='#2e3a68'; ctx.font='12px Georgia'; ctx.fillText(s.word+(GLYPH[s.b]?' '+GLYPH[s.b]:''),s.x+6,s.y+16); });
    // ropes: paper strokes, knots where tied, frayed loose ends
    for(const r of ropes){
      ctx.lineJoin='round'; ctx.lineCap='round';
      ctx.strokeStyle='#2e3a68'; ctx.lineWidth=7;
      ctx.beginPath(); r.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke();
      ctx.strokeStyle=r.c; ctx.lineWidth=4;
      ctx.beginPath(); r.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke();
      r.pts.forEach(p=>{
        if(!p.pinned) return;
        ctx.fillStyle='#2e3a68'; ctx.beginPath(); ctx.arc(p.x,p.y,6,0,7); ctx.fill();
        ctx.fillStyle=r.c; ctx.beginPath(); ctx.arc(p.x,p.y,3,0,7); ctx.fill();
      });
      [r.pts[0],r.pts[r.pts.length-1]].forEach(p=>{
        if(p.pinned) return;
        ctx.strokeStyle=r.c; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-5,p.y+7); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+5,p.y+7); ctx.stroke();
      });
      const mid=r.pts[Math.floor(r.pts.length/2)];
      ctx.fillStyle='#2e3a68'; ctx.font='12px Georgia'; ctx.fillText(r.word+' ➰',mid.x+8,mid.y);
    }
    // E hint near rope (carry/tie a loose end, or grab hold to ride)
    if(!won){
      const c=playerCenter();
      let hx=null,label='';
      if(carried.rope){ const h=handPos(); hx=h; label='E: tie / drop'; }
      else if(!grabbed.rope){
        const e=nearestLooseEnd(c,64);
        if(e){ const p=e.rope.pts[e.endIdx]; hx=p; label=findTieTarget(e,p)?'E: tie':'E: carry'; }
        else { const n=nearestRopePoint(c,48); if(n){ hx=n.rope.pts[n.idx]; label='E: ride'; } }
      }
      if(hx){ ctx.fillStyle='#2e3a68'; ctx.font='bold 13px Georgia'; ctx.fillText(label,hx.x-20,hx.y-14); }
    }
    // thorns hazard
    thorns.forEach(t=>{ Engine.paperRect(ctx,t.x,t.y,t.w,t.h,'#3d7038'); ctx.fillStyle='#e8dcc0'; ctx.font='12px serif'; ctx.fillText('▲▲▲ thorns',t.x+8,t.y+13); });
    // gate wall vs open state
    if(gateWall){ Engine.paperRect(ctx,900,284,40,200,'#6a4a26'); ctx.fillStyle='#e8dcc0'; ctx.font='12px Georgia'; ctx.fillText('✦',906,300); }
    // visible exit arch
    Engine.paperRect(ctx,exitArch.x,exitArch.y,exitArch.w,exitArch.h,'#c9a44a');
    ctx.fillStyle='#2e3a68'; ctx.font='bold 14px Georgia'; ctx.fillText('EXIT →',exitArch.x-6,exitArch.y-10);
    ctx.fillStyle='#2e3a68'; ctx.fillRect(exitArch.x+12,exitArch.y+20,46,80); // dark doorway
    ctx.fillStyle='#e8c96a'; ctx.font='22px serif'; ctx.fillText('➔',exitArch.x+26,exitArch.y+68);
    if(!herb.taken){ ctx.font='24px serif'; ctx.fillText('🌿',herb.x,herb.y+24); }
    if(!shadowGone){
      Engine.paperRect(ctx,shadow.x,shadow.y,shadow.w,shadow.h,'#1f2a4a');
      ctx.fillStyle='#e8dcc0'; ctx.font='28px serif'; ctx.fillText('👁',shadow.x+14,shadow.y+42);
      ctx.fillStyle='#2e3a68'; ctx.font='12px Georgia'; ctx.fillText('smoke it (E) after mugwort',shadow.x-40,shadow.y-10);
    }
    // player w/ clothing tint + hair
    const ch=store.char||{clothingColor:'#b3552e'};
    Engine.paperRect(ctx,player.x,player.y,player.w,player.h,ch.clothingColor);
    ctx.fillStyle='#d9b48f'; ctx.fillRect(player.x+5,player.y-12,18,14);
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(player.x+4,player.y-16,20,8);
    fx.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle='#f4ebd4';ctx.fillRect(p.x,p.y,6,6);ctx.globalAlpha=1;});
    ctx.restore();
    // HUD text
    ctx.fillStyle='#2e3a68'; ctx.font='14px Georgia';
    ctx.fillText('A/D move+push · Space jump · E use/grab/tie · T conjure (rope➰ ladder≡ balloon↑ anvil▼ ball~) · EXIT →', 12, 20);
    const nm=(store.char&&store.char.name)||'Apprentice';
    ctx.fillText(nm, 12, 40);
  }

  buildMap();
})();
