// Wortcraft procedural art — detailed paper-cutout scenery in the strict Linenmere 22.
// Static decor is pre-rendered once to an offscreen canvas (3200x900, world y -360..540)
// and blitted per frame. World coords throughout: buildDecor translates (0,360) once.
window.Art = (() => {
const INK='#2e3a68';
const C={terra:'#b3552e',must:'#d9a441',sage:'#8a9a5b',linen:'#e8dcc0',skin:'#d9b48f',
  bark:'#6a4a26',water:'#3f7d9c',leaf:'#5f8448',moss:'#3d7038',clay:'#8a6a42',ash:'#9a9a92',
  night:'#1f2a4a',honey:'#e8c96a',cream:'#f5efdd',parch:'#cfc4a8',rust:'#7a4a1a',tan:'#b09a6a',
  herb1:'#c9a44a',herb2:'#8a7a4a',herb3:'#6f8a3a'};
const LAYOUT={ jarSpots:[{x:1050,y:262},{x:1350,y:122},{x:1610,y:-58}], exit:{x:3050,y:364,w:70,h:120} };

function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

function sh(g,x,y,w,h){ g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(x+4,y+5,w,h); }
function box(g,x,y,w,h,fill,shadow=true){
  if(shadow) sh(g,x,y,w,h);
  g.fillStyle=fill; g.fillRect(x,y,w,h);
  g.strokeStyle=INK; g.lineWidth=3; g.strokeRect(x,y,w,h);
}
function dash(g,x0,y0,x1,y1,color=INK){
  g.strokeStyle=color; g.lineWidth=1.5; g.setLineDash([5,4]);
  g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke(); g.setLineDash([]);
}
function beam(g,x,y,w,h){
  box(g,x,y,w,h,C.bark,false);
  dash(g,x+4,y+h/2,x+w-4,y+h/2,C.clay);
}
// jars / bottles / pots in 5 silhouette variants, ~30px tall
function jar(g,x,y,kind,fill,seal){
  g.fillStyle='rgba(0,0,0,.2)'; g.fillRect(x+2,y+3,30,36);
  g.fillStyle=fill; g.strokeStyle=INK; g.lineWidth=2.5;
  g.beginPath();
  if(kind===0){ g.rect(x+3,y+6,24,28); }                    // squat jar
  else if(kind===1){ g.rect(x+6,y,18,34); }                 // tall jar
  else if(kind===2){ g.moveTo(x+8,y+34); g.lineTo(x+8,y+12); g.lineTo(x+12,y+12); g.lineTo(x+12,y); g.lineTo(x+18,y); g.lineTo(x+18,y+12); g.lineTo(x+22,y+12); g.lineTo(x+22,y+34); g.closePath(); } // bottle
  else if(kind===3){ g.moveTo(x+4,y+10); g.lineTo(x+26,y+10); g.lineTo(x+22,y+34); g.lineTo(x+8,y+34); g.closePath(); } // pot
  else { g.moveTo(x+15,y); g.lineTo(x+27,y+34); g.lineTo(x+3,y+34); g.closePath(); } // flask
  g.fill(); g.stroke();
  g.fillStyle=seal; g.fillRect(x+6,y+2,18,6);               // wax seal / lid
  g.strokeStyle=INK; g.lineWidth=2; g.strokeRect(x+6,y+2,18,6);
}
function bookStack(g,x,y,n,rng){
  const cols=[C.terra,C.moss,C.water,C.rust];
  for(let i=0;i<n;i++){
    const w=34+Math.floor(rng()*14), c=cols[Math.floor(rng()*cols.length)];
    box(g,x,y-i*11,w,10,c,false);
    dash(g,x+4,y-i*11+5,x+w-4,y-i*11+5,C.linen);
  }
}
function candle(g,x,y,h){
  g.fillStyle=C.cream; g.fillRect(x,y-h,8,h);
  g.strokeStyle=INK; g.lineWidth=2; g.strokeRect(x,y-h,8,h);
  g.fillStyle=C.must; g.beginPath(); g.moveTo(x-2,y-h); g.lineTo(x+4,y-h-10); g.lineTo(x+10,y-h); g.closePath(); g.fill();
  g.fillStyle=C.honey; g.beginPath(); g.moveTo(x+1,y-h-1); g.lineTo(x+4,y-h-7); g.lineTo(x+7,y-h-1); g.closePath(); g.fill();
}
function bundle(g,x,y,c1){ // hanging herb bundle
  g.strokeStyle=INK; g.lineWidth=2;
  g.beginPath(); g.moveTo(x,y-26); g.lineTo(x,y); g.stroke();
  const leaves=[[0,2],[-7,8],[7,9],[-4,16],[5,17],[0,24]];
  g.fillStyle=c1;
  for(const [dx,dy] of leaves){
    g.beginPath(); g.moveTo(x+dx,y+dy-7); g.lineTo(x+dx+5,y+dy); g.lineTo(x+dx,y+dy+7); g.lineTo(x+dx-5,y+dy); g.closePath(); g.fill();
    g.strokeStyle=INK; g.lineWidth=1.5; g.stroke();
  }
  g.fillStyle=C.rust; g.fillRect(x-4,y-4,8,6); // tie
}
function shelfRow(g,x,y,w,rng,n){
  box(g,x,y,w,10,C.clay);                                   // board
  box(g,x+8,y+10,10,22,C.bark,false); box(g,x+w-18,y+10,10,22,C.bark,false); // brackets
  const fills=[C.leaf,C.moss,C.herb1,C.herb2,C.herb3,C.must,C.terra,C.water,C.parch];
  let cx=x+8;
  for(let i=0;i<n && cx<x+w-36;i++){
    const r=rng();
    if(r<0.72){ jar(g,cx,y-36,Math.floor(rng()*5),fills[Math.floor(rng()*fills.length)],fills[Math.floor(rng()*fills.length)]); cx+=34; }
    else if(r<0.86){ bookStack(g,cx,y-2,2+Math.floor(rng()*2),rng); cx+=52; }
    else { candle(g,cx+8,y,16+Math.floor(rng()*10)); cx+=30; }
  }
}
function cloud(g,x,y,s){
  g.fillStyle=C.cream;
  g.beginPath(); g.ellipse(x,y,34*s,14*s,0,0,7); g.ellipse(x-24*s,y+6*s,20*s,10*s,0,0,7); g.ellipse(x+26*s,y+6*s,22*s,11*s,0,0,7); g.fill();
  g.strokeStyle=INK; g.lineWidth=2.5;
  g.beginPath(); g.ellipse(x,y,34*s,14*s,0,Math.PI,0); g.stroke();
}
function bird(g,x,y,s){
  g.strokeStyle=INK; g.lineWidth=2;
  g.beginPath(); g.moveTo(x-8*s,y); g.quadraticCurveTo(x-3*s,y-6*s,x,y); g.quadraticCurveTo(x+3*s,y-6*s,x+8*s,y); g.stroke();
}
function shroom(g,x,y,s,cap){ // mushroom
  g.fillStyle=C.cream; g.fillRect(x-3*s,y-10*s,6*s,10*s);
  g.fillStyle=cap;
  g.beginPath(); g.moveTo(x-10*s,y-8*s); g.quadraticCurveTo(x,y-24*s,x+10*s,y-8*s); g.closePath(); g.fill();
  g.strokeStyle=INK; g.lineWidth=2; g.stroke();
}
function bush(g,x,y,w,h){
  g.fillStyle=C.leaf; g.beginPath(); g.ellipse(x,y,w,h,0,0,7); g.fill();
  g.strokeStyle=INK; g.lineWidth=2.5; g.stroke();
  dash(g,x-w+8,y-2,x+w-8,y-2,C.moss);
}
function tree(g,x,baseY,s){ // round-canopy tree: trunk + 4 canopy blobs
  box(g,x-7*s,baseY-70*s,14*s,70*s,C.bark,false);
  const blobs=[[0,-86,30],[-24,-64,22],[24,-66,24],[0,-48,26]];
  blobs.forEach(([dx,dy,r],i)=>{
    g.fillStyle=[C.leaf,C.moss,C.sage,C.leaf][i%4];
    g.beginPath(); g.arc(x+dx*s,baseY+dy*s,r*s,0,7); g.fill();
    g.strokeStyle=INK; g.lineWidth=2.5; g.stroke();
  });
  dash(g,x-20*s,baseY-66*s,x+20*s,baseY-66*s,C.moss);
}
function pine(g,x,baseY,s){ // tall pine: trunk + 3 skirt tiers
  box(g,x-6*s,baseY-50*s,12*s,50*s,C.bark,false);
  const tiers=[[-34,52],[ -27,40],[-19,30]];
  tiers.forEach(([hw,hh],i)=>{
    const ty=baseY-50*s-(2-i)*34*s; // widest tier lowest
    g.fillStyle=[C.moss,C.leaf,C.sage][i%3];
    g.beginPath(); g.moveTo(x-hw*s,ty); g.lineTo(x,ty-hh*s); g.lineTo(x+hw*s,ty); g.closePath();
    g.fill(); g.strokeStyle=INK; g.lineWidth=2.5; g.stroke();
  });
  dash(g,x-14*s,baseY-70*s,x+14*s,baseY-70*s,C.moss);
}
// themed decor for beats 2-4: 2600xH world-space canvas (y Y0..Y0+H)
function buildBeatDecor(theme,opts,H,Y0){
  opts=opts||{}; H=H||540; Y0=Y0||0;
  const W2=2600;
  const cv=document.createElement('canvas'); cv.width=W2; cv.height=H;
  const g=cv.getContext('2d');
  g.translate(0,-Y0);
  const rng=mulberry32(theme==='forest'?21:(theme==='tallgrass'?13:5));
  if(theme==='forest'){
    g.fillStyle=C.moss; g.fillRect(0,Y0,W2,484-Y0);          // deep green gloom
    for(let i=0;i<20;i++){ dash(g,rng()*W2,rng()*440,rng()*W2,rng()*440,C.leaf); }
    pine(g,200,484,1.4); pine(g,1650,484,1.6); pine(g,2200,484,1.2); pine(g,2450,484,1.5); pine(g,950,484,1.1);
    tree(g,500,484,1.1); tree(g,1950,484,1);
    for(let i=0;i<12;i++){ // hanging moss
      const x=100+rng()*2400;
      g.strokeStyle=C.sage; g.lineWidth=2;
      g.beginPath(); g.moveTo(x,60+rng()*120); g.lineTo(x,140+rng()*160); g.stroke();
    }
    for(let i=0;i<10;i++) shroom(g,150+rng()*2300,470+rng()*10,0.8+rng()*0.8,rng()<0.5?C.terra:C.must);
    for(let i=0;i<24;i++){ g.fillStyle=C.honey; g.fillRect(rng()*W2,rng()*440,3,3); } // fireflies
    // stone circle
    [[2060,60],[2100,78],[2140,64],[2170,52],[2030,50]].forEach(([x,h])=>box(g,x,484-h,26,h,C.ash,false));
    g.fillStyle=C.parch; g.beginPath(); g.ellipse(2100,480,40,8,0,0,7); g.fill();
    g.strokeStyle=INK; g.lineWidth=2; g.stroke();
    // owl on a branch
    beam(g,2350,300,120,12);
    g.fillStyle=C.night; g.beginPath(); g.ellipse(2400,284,12,16,0,0,7); g.fill();
    g.beginPath(); g.arc(2400,272,9,0,7); g.fill();
    g.fillStyle=C.honey; g.beginPath(); g.arc(2396,271,2.5,0,7); g.arc(2404,271,2.5,0,7); g.fill();
    box(g,0,484,W2,56,C.clay,false);                        // soil
    // chasm under the ghost path
    g.fillStyle=C.night; g.fillRect(600,360,800,180);
    g.strokeStyle=C.moss; g.lineWidth=3;
    for(let i=0;i<12;i++){ const x=610+i*66; g.beginPath(); g.moveTo(x,484); g.quadraticCurveTo(x+8,520,x-4,548); g.stroke(); }
    g.fillStyle='rgba(232,220,192,.12)'; g.fillRect(600,430,800,34);
    return cv;
  }
  // meadow + tallgrass: open sky country
  g.fillStyle=C.cream; g.fillRect(0,Y0,W2,300-Y0);
  g.fillStyle=C.honey; g.beginPath(); g.arc(2200,80,26,0,7); g.fill();
  g.strokeStyle=INK; g.lineWidth=3; g.beginPath(); g.arc(2200,80,26,0,7); g.stroke();
  cloud(g,300,90,1); cloud(g,1200,70,1.2); cloud(g,2000,120,0.9);
  bird(g,500,120,1); bird(g,1500,90,1.1); bird(g,2300,150,0.9);
  for(let i=0;i<11;i++){
    const cx=i*260-40, rx=150+((i*67)%60), top=240+((i*41)%70);
    g.fillStyle=i%2?C.sage:C.leaf;
    g.beginPath(); g.ellipse(cx,470,rx,470-top,0,0,7); g.fill();
    g.strokeStyle=INK; g.lineWidth=3; g.stroke();
  }
  box(g,0,484,W2,56,C.clay,false);
  dash(g,0,500,W2,500,C.bark);
  g.fillStyle=C.sage; g.fillRect(0,458,W2,26);
  const tall=theme==='tallgrass';
  const tufts=tall?90:44;
  for(let i=0;i<tufts;i++){
    const x=rng()*W2, y=436+rng()*24, h=tall?14+rng()*16:9;
    g.strokeStyle=tall?C.herb2:C.moss; g.lineWidth=2;
    g.beginPath(); g.moveTo(x,y); g.lineTo(x-3,y-h); g.moveTo(x,y); g.lineTo(x+3,y-h-1); g.stroke();
    const r=rng();
    if(tall && r<0.3){ g.fillStyle=C.herb1; g.beginPath(); g.arc(x,y-h-3,3,0,7); g.fill(); } // seed heads
    else if(r<(tall?0.2:0.35)){ g.fillStyle=rng()<0.5?C.must:C.terra; g.beginPath(); g.arc(x+7,y-6,4,0,7); g.fill(); g.strokeStyle=INK; g.lineWidth=1.5; g.stroke(); }
  }
  tree(g,350,458,1); tree(g,2250,458,1.1);
  bush(g,700,446,34,16); bush(g,1750,448,42,18);
  for(let i=0;i<6;i++){
    const x=200+rng()*2200, y=466+rng()*10;
    g.fillStyle=C.ash; g.beginPath(); g.ellipse(x,y,10+rng()*8,6,0,0,7); g.fill();
    g.strokeStyle=INK; g.lineWidth=2; g.stroke();
  }
  if(opts.water){ // stream gap under the bridge    const wx=opts.water.x, ww=opts.water.w;
    g.fillStyle=C.night; g.fillRect(wx,440,ww,100);
    g.fillStyle=C.water; g.fillRect(wx,492,ww,32);
    dash(g,wx+10,502,wx+ww-10,502,C.cream); dash(g,wx+20,514,wx+ww-30,514,C.cream);
    g.fillStyle='rgba(232,220,192,.14)'; g.fillRect(wx,470,ww,22);
    [wx+8,wx+ww-8].forEach(rx=>{
      for(let i=0;i<5;i++){
        g.strokeStyle=C.moss; g.lineWidth=2.5;
        g.beginPath(); g.moveTo(rx+(i-2)*6,484); g.lineTo(rx+(i-2)*9,440); g.stroke();
      }
    });
  }
  // goat paddock east of the bridge: rails, hay bale, milk pail, dragonflies
  if(theme==='meadow'){
    for(let x=1450;x<=1620;x+=42){ box(g,x,400,12,64,C.bark,false); }
    box(g,1440,408,190,8,C.clay,false);
    g.fillStyle=C.herb1; g.beginPath(); g.arc(1560,448,20,0,7); g.fill();
    g.strokeStyle=INK; g.lineWidth=2.5; g.stroke();
    dash(g,1542,448,1578,448,C.bark); dash(g,1544,438,1576,438,C.bark);
    box(g,1500,458,20,22,C.ash,false);
    [[1200,420],[1250,398],[1300,424]].forEach(([x,y])=>{
      g.strokeStyle=INK; g.lineWidth=2;
      g.beginPath(); g.moveTo(x-8,y-3); g.lineTo(x+8,y-3); g.stroke();
      g.fillStyle=C.water; g.fillRect(x-1,y-4,2,12);
    });
    [[600,300],[900,240],[1900,260]].forEach(([x,y])=>{ // meadow butterflies
      g.fillStyle=C.must; g.strokeStyle=INK; g.lineWidth=1.5;
      g.beginPath(); g.moveTo(x,y); g.lineTo(x-9,y-7); g.lineTo(x-7,y+4); g.closePath(); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(x,y); g.lineTo(x+9,y-7); g.lineTo(x+7,y+4); g.closePath(); g.fill(); g.stroke();
    });
  }
  if(tall){ // tallgrass dusk: warm low light, cattails, fallen log, fireflies
    g.fillStyle='rgba(217,164,65,.10)'; g.fillRect(0,Y0,W2,540-Y0);
    [[500],[1400],[2300]].forEach(([x])=>{
      for(let i=0;i<4;i++){
        const cx=x+i*14;
        g.strokeStyle=C.moss; g.lineWidth=3;
        g.beginPath(); g.moveTo(cx,470); g.lineTo(cx,410); g.stroke();
        g.fillStyle=C.bark; g.fillRect(cx-4,388,8,24);
        g.strokeStyle=INK; g.lineWidth=1.5; g.strokeRect(cx-4,388,8,24);
      }
    });
    box(g,1660,452,180,22,C.bark); // fallen log
    g.strokeStyle=INK; g.lineWidth=2;
    g.beginPath(); g.ellipse(1660,463,8,11,0,0,7); g.stroke();
    shroom(g,1710,452,1,C.terra); shroom(g,1780,452,0.9,C.must);
    for(let i=0;i<10;i++){ g.fillStyle=C.honey; g.fillRect(200+rng()*2200,60+rng()*300,3,3); }
    bird(g,1300,60,1.8);
  }
  return cv;
}

function buildDecor(){
  const cv=document.createElement('canvas'); cv.width=3200; cv.height=900;
  const g=cv.getContext('2d');
  g.translate(0,360); // draw in world coords (y -360..540)
  const rng=mulberry32(7);
  // sky (exterior zones; shed wall paints over its stretch)
  g.fillStyle=C.cream; g.fillRect(0,-360,3200,660);
  g.fillStyle=C.honey; g.beginPath(); g.arc(2820,-160,26,0,7); g.fill();
  g.strokeStyle=INK; g.lineWidth=3; g.beginPath(); g.arc(2820,-160,26,0,7); g.stroke();
  cloud(g,250,-220,1); cloud(g,2100,-240,1.2); cloud(g,2600,-180,0.9); cloud(g,120,-80,0.7);
  bird(g,150,-100,1); bird(g,400,-160,1.2); bird(g,2200,-120,1); bird(g,2500,-200,1.1); bird(g,2900,-140,0.9);
  for(let i=0;i<14;i++){ // rolling paper hills, bases tucked behind the ground
    const cx=i*260-40, rx=150+((i*67)%60), top=240+((i*41)%70);
    g.fillStyle=i%2?C.sage:C.leaf;
    g.beginPath(); g.ellipse(cx,470,rx,470-top,0,0,7); g.fill();
    g.strokeStyle=INK; g.lineWidth=3; g.stroke();
    dash(g,cx-rx+30,top+40,cx+rx-30,top+40,i%2?C.leaf:C.sage);
  }
  // soil base full width
  box(g,0,484,3200,56,C.clay,false);
  dash(g,0,500,3200,500,C.bark);
  // ---- garden 0-600: fence, tufts, flowers, mushrooms, watering can, seedlings ----
  g.fillStyle=C.sage; g.fillRect(0,458,600,26);
  tree(g,140,458,0.9); tree(g,545,458,1);
  for(let x=30;x<580;x+=46){ box(g,x,392,12,72,C.bark,false); }
  box(g,20,400,560,8,C.clay,false); box(g,20,428,560,8,C.clay,false);
  for(let i=0;i<26;i++){
    const x=10+rng()*580, y=440+rng()*20;
    g.strokeStyle=C.moss; g.lineWidth=2;
    g.beginPath(); g.moveTo(x,y); g.lineTo(x-3,y-9); g.moveTo(x,y); g.lineTo(x+3,y-10); g.stroke();
    if(rng()<0.4){ g.fillStyle=C.must; g.beginPath(); g.arc(x+8,y-6,4,0,7); g.fill(); g.strokeStyle=INK; g.lineWidth=1.5; g.stroke(); }
  }
  shroom(g,430,476,1.4,C.terra); shroom(g,452,478,1,C.rust); shroom(g,470,476,1.2,C.terra); // fairy ring
  box(g,500,440,34,26,C.ash,false);                          // watering can body
  g.strokeStyle=INK; g.lineWidth=3;
  g.beginPath(); g.moveTo(500,446); g.lineTo(478,434); g.stroke(); // spout
  g.beginPath(); g.arc(534,453,12,-1.2,1.2); g.stroke();     // handle
  for(let r=0;r<3;r++) for(let i=0;i<5;i++){                 // seedling rows
    const x=150+i*52+r*10, y=452+r*8;
    g.strokeStyle=C.leaf; g.lineWidth=2;
    g.beginPath(); g.moveTo(x,y); g.lineTo(x,y-8); g.moveTo(x,y-6); g.lineTo(x-4,y-10); g.moveTo(x,y-6); g.lineTo(x+4,y-10); g.stroke();
  }
  [[200,350],[450,300]].forEach(([x,y])=>{                   // butterflies
    g.fillStyle=C.must;
    g.beginPath(); g.moveTo(x,y); g.lineTo(x-9,y-7); g.lineTo(x-7,y+4); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x,y); g.lineTo(x+9,y-7); g.lineTo(x+7,y+4); g.closePath(); g.fill(); g.stroke();
  });
  // ---- shed doorway frame at x600 (walk in) ----
  beam(g,592,300,16,184); beam(g,592,284,120,16);
  // ---- SHED INTERIOR 600-1600 (tall) ----
  g.fillStyle=C.linen; g.fillRect(600,-360,1000,844);        // daub wall
  for(let x=700;x<1600;x+=200) beam(g,x,-360,18,844);        // timber uprights
  beam(g,600,-180,1000,14); beam(g,600,40,1000,18); beam(g,600,240,1000,14); // rails
  for(let x=620;x<1600;x+=40){ dash(g,x,-160,x+22,-20,C.parch); dash(g,x,60,x+22,220,C.parch); } // wattle bands
  // floorboards
  for(let r=0;r<3;r++) for(let x=600;x<1600;x+=130){
    g.fillStyle=r%2?C.clay:C.bark; g.fillRect(x,488+r*16,128,15);
    g.strokeStyle=INK; g.lineWidth=1.5; g.strokeRect(x,488+r*16,128,15);
  }
  // main window + light shaft (moved clear of the jar platforms)
  box(g,1140,110,120,110,C.water);
  g.fillStyle=C.honey; g.beginPath(); g.arc(1210,150,20,0,7); g.fill();
  box(g,1192,110,10,110,C.bark,false); box(g,1140,156,120,10,C.bark,false);
  box(g,1132,220,136,12,C.clay);
  g.fillStyle='rgba(232,220,192,.20)';
  g.beginPath(); g.moveTo(1150,232); g.lineTo(1260,232); g.lineTo(1310,484); g.lineTo(1200,484); g.closePath(); g.fill();
  for(let i=0;i<6;i++){ g.fillStyle=C.honey; g.fillRect(1210+((i*53)%80),260+((i*37)%180),3,3); } // dust motes
  // high window
  box(g,1400,-220,90,80,C.water);
  box(g,1440,-220,8,80,C.bark,false); box(g,1400,-184,90,8,C.bark,false);
  box(g,1392,-140,106,10,C.clay);
  // wall shelves heavy with jars (backdrop rows, clear of gameplay platforms)
  shelfRow(g,640,150,300,rng,8);
  shelfRow(g,640,210,240,rng,6);
  shelfRow(g,640,-60,300,rng,8);
  shelfRow(g,640,-140,240,rng,6);
  shelfRow(g,1240,-120,300,rng,8);
  shelfRow(g,1290,300,270,rng,7);
  // charm chalkboard
  box(g,960,120,110,84,C.night);
  g.fillStyle=C.cream; g.font='11px Georgia';
  g.fillText('THE CHARM',968,138);
  g.fillText('mugwort ?',968,156);
  for(let i=0;i<9;i++){ g.fillRect(968+(i%5)*18,168+Math.floor(i/5)*16,3,10); }
  // gameplay jar platforms: brackets beneath each (boards drawn by gameplay)
  [[980,300,180],[1280,160,180],[1560,-20,140]].forEach(([x,y,w])=>{
    box(g,x+10,y+18,12,34,C.bark,false); box(g,x+w-22,y+18,12,34,C.bark,false);
  });
  // hanging sign (moved clear of jar platform 1)
  g.strokeStyle=INK; g.lineWidth=2;
  g.beginPath(); g.moveTo(1240,240); g.lineTo(1240,252); g.moveTo(1300,240); g.lineTo(1300,252); g.stroke();
  box(g,1210,250,120,26,C.cream);
  g.fillStyle=INK; g.font='13px Georgia'; g.fillText('POTTING SHED',1218,268);
  // hanging bundles from both rails
  [800,950,1250,1450,1560].forEach((x,i)=>bundle(g,x,66,[C.leaf,C.moss,C.sage,C.herb2,C.herb3][i%5]));
  [750,1100,1500].forEach((x,i)=>bundle(g,x,-140,[C.sage,C.herb3,C.leaf][i%3]));
  // hanging pots from the low rail
  [880,1520].forEach(x=>{
    g.strokeStyle=INK; g.lineWidth=2;
    g.beginPath(); g.moveTo(x,58); g.lineTo(x,96); g.stroke();
    g.fillStyle=C.clay;
    g.beginPath(); g.moveTo(x-14,96); g.lineTo(x+14,96); g.lineTo(x+10,124); g.lineTo(x-10,124); g.closePath(); g.fill(); g.stroke();
  });
  // shelf above the workbench
  shelfRow(g,1360,340,190,rng,5);
  // workbench + tools
  box(g,1360,408,190,16,C.bark);                             // top
  box(g,1370,424,14,60,C.bark,false); box(g,1526,424,14,60,C.bark,false);
  g.fillStyle=C.ash;                                         // mortar
  g.beginPath(); g.moveTo(1390,408); g.lineTo(1430,408); g.lineTo(1422,388); g.lineTo(1398,388); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle=INK; g.lineWidth=3;
  g.beginPath(); g.moveTo(1412,390); g.lineTo(1426,372); g.stroke(); // pestle
  bookStack(g,1450,408,3,rng);
  candle(g,1500,408,26);
  jar(g,1330,372,2,C.water,C.cream);
  // stool by the bench + garlic braid under the shelf
  box(g,1292,440,44,10,C.bark);
  box(g,1296,450,8,34,C.clay,false); box(g,1324,450,8,34,C.clay,false);
  g.strokeStyle=INK; g.lineWidth=2;
  g.beginPath(); g.moveTo(700,240); g.lineTo(700,292); g.stroke();
  [[-8,262],[8,268],[-6,280],[7,286],[0,298]].forEach(([dx,y])=>{
    g.fillStyle=C.cream; g.beginPath(); g.ellipse(700+dx,y,7,9,0,0,7); g.fill();
    g.strokeStyle=INK; g.lineWidth=1.5; g.stroke();
  });
  // barrel, sack, bucket
  box(g,1568,420,52,64,C.clay);
  dash(g,1570,436,1618,436,C.bark); dash(g,1570,452,1618,452,C.bark); dash(g,1570,468,1618,468,C.bark);
  g.fillStyle=C.parch; g.beginPath(); g.ellipse(682,458,24,26,0,0,7); g.fill();
  g.strokeStyle=INK; g.lineWidth=2.5; g.stroke();
  g.fillStyle=C.rust; g.fillRect(676,428,12,8);
  g.fillStyle=C.clay;
  g.beginPath(); g.moveTo(664,452); g.lineTo(690,452); g.lineTo(686,484); g.lineTo(668,484); g.closePath(); g.fill(); g.stroke();
  // mouse hole + mouse
  g.fillStyle=C.night; g.beginPath(); g.arc(726,484,13,Math.PI,0); g.fill();
  g.fillStyle=C.ash; g.beginPath(); g.ellipse(726,480,7,5,0,0,7); g.fill();
  g.beginPath(); g.arc(721,476,3,0,7); g.arc(731,476,3,0,7); g.fill();
  g.strokeStyle=INK; g.lineWidth=1.5;
  g.beginPath(); g.moveTo(733,481); g.quadraticCurveTo(744,484,748,476); g.stroke();
  // wall torches
  [[950,100],[1550,200]].forEach(([x,y])=>{
    box(g,x-4,y,10,26,C.bark,false);
    g.fillStyle=C.must; g.beginPath(); g.moveTo(x-8,y); g.lineTo(x+1,y-16); g.lineTo(x+10,y); g.closePath(); g.fill();
    g.fillStyle='rgba(232,201,106,.22)'; g.beginPath(); g.arc(x+1,y-8,30,0,7); g.fill();
  });
  // rug + sleeping cat
  box(g,1060,452,150,26,C.terra,false);
  g.strokeStyle=C.must; g.lineWidth=2; g.setLineDash([6,4]); g.strokeRect(1066,456,138,18); g.setLineDash([]);
  g.fillStyle=C.night;
  g.beginPath(); g.ellipse(1135,462,26,10,0,0,7); g.fill();
  g.beginPath(); g.arc(1112,456,9,0,7); g.fill();            // head
  g.beginPath(); g.moveTo(1106,449); g.lineTo(1108,442); g.lineTo(1112,448); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(1114,448); g.lineTo(1118,442); g.lineTo(1119,449); g.closePath(); g.fill();
  // broom in the corner + web
  g.strokeStyle=C.bark; g.lineWidth=5;
  g.beginPath(); g.moveTo(622,470); g.lineTo(648,360); g.stroke();
  for(let i=0;i<6;i++) dash(g,648,360+i*4,668,362+i*7,C.must);
  g.strokeStyle=C.ash; g.lineWidth=1.5;
  for(let i=1;i<5;i++){ g.beginPath(); g.arc(1600,-360,i*16,0,Math.PI/2); g.stroke(); }
  g.strokeStyle=C.ash; g.lineWidth=1.5;
  for(let i=1;i<4;i++){ g.beginPath(); g.arc(1600,240,i*14,Math.PI,Math.PI*1.5); g.stroke(); }
  // ---- ravine 1600-1860: dark chasm, roots, skull, glowshrooms ----
  g.fillStyle=C.night; g.fillRect(1600,300,260,240);
  g.fillStyle=C.bark;
  for(let i=0;i<7;i++){ const x=1604+i*36; g.fillRect(x,484,10,30+((i*37)%50)); }
  g.strokeStyle=C.moss; g.lineWidth=3;
  for(let i=0;i<5;i++){ const x=1610+i*50; g.beginPath(); g.moveTo(x,484); g.quadraticCurveTo(x+8,520,x-4,548); g.stroke(); }
  g.fillStyle='rgba(232,220,192,.14)'; g.fillRect(1600,420,260,40);
  g.fillStyle=C.cream; g.beginPath(); g.arc(1592,470,8,0,7); g.fill(); // skull on the edge
  g.strokeStyle=INK; g.lineWidth=2; g.stroke();
  g.fillStyle=INK; g.fillRect(1588,466,4,4); g.fillRect(1594,466,4,4);
  [[1660,520],[1760,536],[1810,505]].forEach(([x,y])=>{     // glowshrooms
    g.fillStyle='rgba(232,201,106,.20)'; g.beginPath(); g.arc(x,y-6,16,0,7); g.fill();
    shroom(g,x,y,0.9,C.honey);
  });
  // ---- home stretch: grass, fence, flowers, stones, bushes ----
  g.fillStyle=C.sage; g.fillRect(1860,458,1340,26);
  tree(g,1975,458,1); tree(g,2620,458,1.1); tree(g,2880,458,0.9);
  for(let x=1900;x<3030;x+=180){ box(g,x,400,12,60,C.bark,false); }
  box(g,1890,408,1150,8,C.clay,false); box(g,1890,432,1150,8,C.clay,false);
  for(let i=0;i<40;i++){
    const x=1870+rng()*1250, y=436+rng()*24;
    g.strokeStyle=C.moss; g.lineWidth=2;
    g.beginPath(); g.moveTo(x,y); g.lineTo(x-3,y-9); g.moveTo(x,y); g.lineTo(x+3,y-10); g.stroke();
    if(rng()<0.35){ g.fillStyle=rng()<0.5?C.must:C.terra; g.beginPath(); g.arc(x+7,y-6,4,0,7); g.fill(); g.strokeStyle=INK; g.lineWidth=1.5; g.stroke(); }
  }
  for(let i=0;i<8;i++){ // stones
    const x=1950+rng()*1100, y=466+rng()*10;
    g.fillStyle=C.ash; g.beginPath(); g.ellipse(x,y,10+rng()*8,6,0,0,7); g.fill();
    g.strokeStyle=INK; g.lineWidth=2; g.stroke();
  }
  bush(g,1920,446,34,16); bush(g,2400,448,42,18); bush(g,2700,446,30,14); bush(g,3180,448,36,16);
  // well
  box(g,2040,428,90,56,C.ash);
  dash(g,2042,446,2128,446,C.parch);
  beam(g,2046,368,10,64); beam(g,2114,368,10,64);
  box(g,2036,352,104,16,C.terra);
  g.strokeStyle=INK; g.lineWidth=2;
  g.beginPath(); g.moveTo(2085,368); g.lineTo(2085,410); g.stroke();
  box(g,2075,410,20,16,C.bark,false);
  // clothesline
  beam(g,2300,380,10,104); beam(g,2500,380,10,104);
  dash(g,2300,384,2510,384,INK);
  [[2330,C.linen],[2400,C.must],[2470,C.sage]].forEach(([x,c])=>{
    g.fillStyle=c; g.fillRect(x,384,26,34);
    g.strokeStyle=INK; g.lineWidth=2; g.strokeRect(x,384,26,34);
    dash(g,x+4,390,x+4,412,C.parch);
  });
  // path stones to the door
  for(let i=0;i<6;i++){
    const x=2890+i*30;
    g.fillStyle=C.parch; g.beginPath(); g.ellipse(x,494,14,6,0,0,7); g.fill();
    g.strokeStyle=INK; g.lineWidth=2; g.stroke();
  }
  // ---- exit: cottage door assembly ----
  const E=LAYOUT.exit;
  g.fillStyle=C.sage; g.fillRect(E.x-90,180,260,304);        // front wall patch
  g.strokeStyle=INK; g.lineWidth=3; g.strokeRect(E.x-90,180,260,304);
  g.fillStyle=C.must; g.fillRect(E.x-100,150,280,40);        // thatch lip
  g.strokeStyle=INK; g.lineWidth=3; g.strokeRect(E.x-100,150,280,40);
  for(let x=E.x-96;x<E.x+176;x+=18) dash(g,x,154,x+8,186,C.terra);
  // window boxes with flowers flanking the door
  [[E.x-84],[E.x+70]].forEach(([x])=>{
    box(g,x,300,64,20,C.bark);
    for(let i=0;i<3;i++){
      g.strokeStyle=C.moss; g.lineWidth=2;
      g.beginPath(); g.moveTo(x+12+i*18,300); g.lineTo(x+12+i*18,286); g.stroke();
      g.fillStyle=i%2?C.terra:C.must; g.beginPath(); g.arc(x+12+i*18,282,5,0,7); g.fill();
      g.strokeStyle=INK; g.lineWidth=1.5; g.stroke();
    }
  });
  box(g,E.x-16,E.y-6,E.w+32,E.h+12,C.ash);                   // stone surround
  box(g,E.x,E.y,E.w,E.h,C.bark,false);                       // door
  dash(g,E.x+8,E.y+8,E.x+8,E.y+E.h-8,C.clay);
  dash(g,E.x+E.w-8,E.y+8,E.x+E.w-8,E.y+E.h-8,C.clay);
  box(g,E.x+10,E.y+E.h/2-14,E.w-20,12,C.clay,false);         // brace
  for(let i=0;i<8;i++){                                      // herb wreath on the door
    const a=i/8*Math.PI*2, wx=E.x+E.w/2+Math.cos(a)*15, wy=E.y+34+Math.sin(a)*15;
    g.fillStyle=i%2?C.leaf:C.moss;
    g.beginPath(); g.moveTo(wx,wy-5); g.lineTo(wx+4,wy); g.lineTo(wx,wy+5); g.lineTo(wx-4,wy); g.closePath(); g.fill();
    g.strokeStyle=INK; g.lineWidth=1; g.stroke();
  }
  g.fillStyle=C.terra; g.fillRect(E.x+E.w/2-4,E.y+52,8,6);   // wreath bow
  g.fillStyle=C.must; g.beginPath(); g.arc(E.x+E.w-16,E.y+E.h/2+24,7,0,7); g.fill();
  g.strokeStyle=INK; g.lineWidth=2.5; g.stroke();            // ring handle
  box(g,E.x-4,E.y+E.h,E.w+8,14,C.parch,false);               // step
  beam(g,E.x+E.w+44,E.y+20,12,120);                          // lantern post
  box(g,E.x+E.w+30,E.y-2,40,34,C.night);                     // lantern
  g.fillStyle=C.honey; g.fillRect(E.x+E.w+42,E.y+6,16,18);
  g.fillStyle='rgba(232,201,106,.25)'; g.beginPath(); g.arc(E.x+E.w+50,E.y+15,44,0,7); g.fill();
  return cv;
}

// conjured objects drawn as proper little things, not bare boxes
function drawSummon(g,s,glyph){
  const {x,y,w,h,word,c}=s;
  sh(g,x,y,w,h);
  const W=f=>{g.fillStyle=f;}, O=(lw=2.5)=>{g.strokeStyle=INK;g.lineWidth=lw;};
  const nail=(nx,ny)=>{ g.fillStyle=INK; g.fillRect(nx-1.5,ny-1.5,3,3); };
  const label=()=>{ g.fillStyle=INK; g.font='11px Georgia'; g.fillText(word+(glyph?' '+glyph:''),x+2,y-7); };
  const cx=x+w/2;
  if(word==='ladder'){
    W(C.bark); g.fillRect(x,y,7,h); g.fillRect(x+w-7,y,7,h);
    O(); g.strokeRect(x,y,7,h); g.strokeRect(x+w-7,y,7,h);
    W(C.clay);
    for(let ry=y+10;ry<y+h-4;ry+=18){ g.fillRect(x+7,ry,w-14,6); O(2); g.strokeRect(x+7,ry,w-14,6); }
  } else if(word==='pole'){
    const rows=Math.max(1,Math.floor(h/14));
    for(let i=0;i<rows;i++){ W(i%2?C.clay:C.bark); g.fillRect(x,y+i*14,w,Math.min(14,h-i*14)); }
    O(); g.strokeRect(x,y,w,h);
    W(C.must); g.beginPath(); g.arc(cx,y-2,6,0,7); g.fill(); O(2); g.stroke();
  } else if(word==='plank'||word==='bridge'||word==='beam'){
    W(C.clay); g.fillRect(x,y,w,h); O(); g.strokeRect(x,y,w,h);
    W(C.bark); g.fillRect(x,y,6,h); g.fillRect(x+w-6,y,6,h);
    dash(g,x+10,y+h/2,x+w-10,y+h/2,C.bark);
    nail(x+12,y+h/2); nail(x+w-12,y+h/2);
  } else if(word==='crate'||word==='box'||word==='chest'||word==='block'){
    W(c); g.fillRect(x,y,w,h); O(); g.strokeRect(x,y,w,h);
    O(2); g.strokeRect(x+5,y+5,w-10,h-10);
    g.beginPath(); g.moveTo(x+6,y+6); g.lineTo(x+w-6,y+h-6); g.stroke();
    nail(x+10,y+10); nail(x+w-10,y+10); nail(x+10,y+h-10); nail(x+w-10,y+h-10);
    if(word==='chest'){ W(C.bark); g.fillRect(x,y,w,9); O(2); g.strokeRect(x,y,w,9);
      W(C.must); g.fillRect(cx-4,y+h/2-4,8,8); O(2); g.strokeRect(cx-4,y+h/2-4,8,8); }
  } else if(word==='step'||word==='stairs'){
    for(let i=0;i<3;i++){
      const sw=w/3, sh2=h*(i+1)/3;
      W(i%2?C.parch:c); g.fillRect(x+i*sw,y+h-sh2,sw,sh2); O(2); g.strokeRect(x+i*sw,y+h-sh2,sw,sh2);
    }
    O(); g.strokeRect(x,y,w,h);
  } else if(word==='stone'||word==='rock'||word==='boulder'){
    W(c); g.beginPath();
    g.moveTo(x+4,y+h*0.35); g.lineTo(x+w*0.3,y+2); g.lineTo(x+w-6,y+h*0.3);
    g.lineTo(x+w-3,y+h-4); g.lineTo(x+w*0.4,y+h-2); g.lineTo(x+2,y+h*0.7); g.closePath();
    g.fill(); O(); g.stroke();
    dash(g,x+w*0.3,y+8,x+w*0.45,y+h-8,C.ash);
  } else if(word==='table'){
    W(C.bark); g.fillRect(x,y,w,10); O(); g.strokeRect(x,y,w,10);
    W(C.clay); g.fillRect(x+4,y+10,8,h-10); g.fillRect(x+w-12,y+10,8,h-10); O(2);
    g.strokeRect(x+4,y+10,8,h-10); g.strokeRect(x+w-12,y+10,8,h-10);
    dash(g,x+6,y+h-8,x+w-6,y+h-8,C.bark);
  } else if(word==='barrel'){
    W(c); g.beginPath();
    g.moveTo(x+6,y); g.quadraticCurveTo(x-4,y+h/2,x+6,y+h);
    g.lineTo(x+w-6,y+h); g.quadraticCurveTo(x+w+4,y+h/2,x+w-6,y); g.closePath();
    g.fill(); O(); g.stroke();
    g.fillStyle=INK; g.fillRect(x+1,y+h*0.2,w-2,4); g.fillRect(x-1,y+h/2-2,w+2,4); g.fillRect(x+1,y+h*0.75,w-2,4);
    W(C.rust); g.beginPath(); g.arc(cx,y+h*0.42,3,0,7); g.fill();
  } else if(word==='ball'){
    const r=Math.min(w,h)/2;
    W(c); g.beginPath(); g.arc(cx,y+h/2,r,0,7); g.fill(); O(); g.stroke();
    g.beginPath(); g.arc(cx,y+h/2,r-6,0.6,2.6); g.stroke();
    W(C.cream); g.beginPath(); g.arc(cx-6,y+h/2-7,3,0,7); g.fill();
  } else if(word==='cushion'){
    W(c); g.fillRect(x,y,w,h); O(); g.strokeRect(x,y,w,h);
    O(1.5); g.setLineDash([4,3]); g.strokeRect(x+5,y+5,w-10,h-10); g.setLineDash([]);
    [[10,10],[w-10,10],[10,h-10],[w-10,h-10]].forEach(([dx,dy])=>{ W(C.rust); g.beginPath(); g.arc(x+dx,y+dy,2.5,0,7); g.fill(); });
  } else if(word==='balloon'){
    W(c); g.beginPath(); g.ellipse(cx,y+h/2-8,w/2,h/2-8,0,0,7); g.fill(); O(); g.stroke();
    W(C.cream); g.beginPath(); g.ellipse(cx-6,y+h/2-16,5,10,-0.3,0,7); g.fill();
    W(C.rust);
    g.beginPath(); g.moveTo(cx-4,y+h-14); g.lineTo(cx+4,y+h-14); g.lineTo(cx,y+h-8); g.closePath(); g.fill(); O(2); g.stroke();
    O(2); g.beginPath(); g.moveTo(cx,y+h-8); g.lineTo(cx,y+h); g.stroke();
  } else if(word==='cloud'){
    W(C.cream);
    g.beginPath(); g.arc(cx-18,y+h-14,12,0,7); g.arc(cx,y+h-20,16,0,7); g.arc(cx+18,y+h-14,12,0,7); g.fill(); O(2); g.stroke();
  } else if(word==='anvil'){
    W(C.night);
    g.fillRect(x+6,y+h-12,w-12,12);
    g.beginPath(); g.moveTo(x+w*0.35,y+h-12); g.lineTo(x+w*0.65,y+h-12); g.lineTo(x+w*0.55,y+14); g.lineTo(x+w*0.45,y+14); g.closePath(); g.fill();
    g.fillRect(x,y, w,14);
    g.beginPath(); g.moveTo(x+w,y+2); g.lineTo(x+w+12,y+7); g.lineTo(x+w,y+12); g.closePath(); g.fill();
    O(); g.strokeRect(x+6,y+h-12,w-12,12); g.strokeRect(x,y,w,14);
    W(C.ash); g.fillRect(x+8,y+4,8,6);
  } else if(word==='door'){
    W(C.bark);
    for(let i=0;i<3;i++){ g.fillRect(x+i*(w/3),y,w/3,h); }
    O(); g.strokeRect(x,y,w,h);
    O(2); g.beginPath(); g.moveTo(x+4,y+4); g.lineTo(x+w-4,y+h-4); g.moveTo(x+4,y+h-4); g.lineTo(x+w-4,y+4); g.stroke();
    W(C.must); g.beginPath(); g.arc(x+w-10,y+h/2,5,0,7); g.fill(); O(2); g.stroke();
  } else if(word==='shield'){
    W(c); g.beginPath();
    g.moveTo(x+3,y); g.lineTo(x+w-3,y); g.lineTo(x+w-3,y+h*0.5);
    g.quadraticCurveTo(x+w-3,y+h*0.85,cx,y+h-2); g.quadraticCurveTo(x+3,y+h*0.85,x+3,y+h*0.5); g.closePath();
    g.fill(); O(); g.stroke();
    W(C.must); g.beginPath(); g.arc(cx,y+h*0.42,7,0,7); g.fill(); O(2); g.stroke();
  } else if(word==='boat'){
    W(C.bark); g.beginPath();
    g.moveTo(x,y); g.lineTo(x+w,y); g.lineTo(x+w-12,y+h); g.lineTo(x+12,y+h); g.closePath();
    g.fill(); O(); g.stroke();
    W(C.clay); g.fillRect(x+8,y+4,w-16,7); O(2); g.strokeRect(x+8,y+4,w-16,7);
    dash(g,x+16,y+14,x+16,y+h-4,C.clay); dash(g,x+w-16,y+14,x+w-16,y+h-4,C.clay);
  } else if(word==='wall'){
    W(C.parch); g.fillRect(x,y,w,h); O(); g.strokeRect(x,y,w,h);
    W(C.bark); g.fillRect(x,y,6,h); g.fillRect(x+w-6,y,6,h);
    for(let ry=y+8;ry<y+h-4;ry+=10) dash(g,x+8,ry,x+w-8,ry+4,ry%20?C.clay:C.bark);
  } else if(word==='torch'){
    W(C.bark); g.fillRect(cx-4,y+8,8,h-8); O(); g.strokeRect(cx-4,y+8,8,h-8);
    W(C.clay); g.fillRect(cx-7,y+4,14,8); O(2); g.strokeRect(cx-7,y+4,14,8);
    W(C.must); g.beginPath(); g.moveTo(cx-7,y+4); g.lineTo(cx,y-12); g.lineTo(cx+7,y+4); g.closePath(); g.fill();
    W(C.honey); g.beginPath(); g.moveTo(cx-3,y+3); g.lineTo(cx,y-6); g.lineTo(cx+3,y+3); g.closePath(); g.fill();
  } else if(word==='lantern'){
    W(C.night); g.fillRect(x,y+6,w,h-6); O(); g.strokeRect(x,y+6,w,h-6);
    W(C.honey); g.fillRect(x+6,y+12,w-12,h-18);
    W(C.bark); g.fillRect(x-2,y,w+4,8); O(2); g.strokeRect(x-2,y,w+4,8);
    g.fillStyle='rgba(232,201,106,.25)'; g.beginPath(); g.arc(cx,y+h/2,26,0,7); g.fill();
    dash(g,cx,y-8,cx,y-2,INK);
  } else if(word==='stool'){
    W(C.bark); g.fillRect(x,y,w,9); O(); g.strokeRect(x,y,w,9);
    W(C.clay); g.fillRect(x+4,y+9,7,h-9); g.fillRect(x+w-11,y+9,7,h-9); O(2);
    g.strokeRect(x+4,y+9,7,h-9); g.strokeRect(x+w-11,y+9,7,h-9);
    dash(g,x+6,y+h-8,x+w-6,y+h-8,C.bark);
  } else if(word==='bucket'){
    W(C.ash); g.beginPath();
    g.moveTo(x+3,y); g.lineTo(x+w-3,y); g.lineTo(x+w-7,y+h); g.lineTo(x+7,y+h); g.closePath();
    g.fill(); O(); g.stroke();
    g.fillStyle=INK; g.fillRect(x+2,y+h*0.35,w-4,3); g.fillRect(x+3,y+h*0.65,w-6,3);
    O(2); g.beginPath(); g.arc(cx,y+2,w/2-4,Math.PI,0); g.stroke();
  } else if(word==='basket'){
    W(c); g.beginPath();
    g.moveTo(x+2,y); g.lineTo(x+w-2,y); g.lineTo(x+w-8,y+h); g.lineTo(x+8,y+h); g.closePath();
    g.fill(); O(); g.stroke();
    for(let ry=y+8;ry<y+h-2;ry+=8) dash(g,x+5,ry,x+w-5,ry,C.bark);
    W(C.bark); g.fillRect(x,y-4,w,7); O(2); g.strokeRect(x,y-4,w,7);
  } else if(word==='sack'){
    W(c); g.beginPath();
    g.moveTo(cx-8,y+12); g.quadraticCurveTo(x,y+h/2,x+6,y+h-2);
    g.lineTo(x+w-6,y+h-2); g.quadraticCurveTo(x+w,y+h/2,cx+8,y+12); g.closePath();
    g.fill(); O(); g.stroke();
    W(C.rust); g.fillRect(cx-9,y+6,18,7); O(2); g.strokeRect(cx-9,y+6,18,7);
    dash(g,cx-10,y+24,cx+10,y+40,C.parch);
  } else if(word==='bell'){
    W(c); g.beginPath();
    g.moveTo(x+4,y+h); g.quadraticCurveTo(x+4,y+8,cx,y+8); g.quadraticCurveTo(x+w-4,y+8,x+w-4,y+h); g.closePath();
    g.fill(); O(); g.stroke();
    O(2); g.beginPath(); g.moveTo(x+4,y+h-8); g.lineTo(x+w-4,y+h-8); g.stroke();
    W(C.rust); g.beginPath(); g.arc(cx,y+h-3,4,0,7); g.fill();
    O(2); g.beginPath(); g.arc(cx,y,4,Math.PI,0); g.stroke();
  } else if(word==='drum'){
    W(c); g.fillRect(x+3,y+6,w-6,h-6); O(); g.strokeRect(x+3,y+6,w-6,h-6);
    W(C.cream); g.fillRect(x,y,w,9); O(2); g.strokeRect(x,y,w,9);
    W(C.bark); g.fillRect(x,y+h-9,w,9); O(2); g.strokeRect(x,y+h-9,w,9);
    O(1.5); g.beginPath();
    for(let i=0;i<=4;i++){ const lx=x+4+i*(w-8)/4; g.moveTo(lx,y+9); g.lineTo(x+w-4-(i*(w-8)/4),y+h-9); }
    g.stroke();
  } else if(word==='banner'){
    W(C.bark); g.fillRect(x,y,6,h); O(); g.strokeRect(x,y,6,h);
    W(C.must); g.beginPath(); g.arc(x+3,y-2,5,0,7); g.fill(); O(2); g.stroke();
    W(c); g.beginPath();
    g.moveTo(x+6,y+2); g.lineTo(x+w,y+2); g.lineTo(x+w,y+h-12); g.lineTo(x+w-5,y+h-6);
    g.lineTo(x+w-10,y+h-12); g.lineTo(x+6,y+h-12); g.closePath(); g.fill(); O(); g.stroke();
    W(C.must); g.beginPath(); g.arc(x+6+(w-6)/2,y+22,6,0,7); g.fill();
  } else if(word==='book'){
    W(c); g.fillRect(x,y,w,h); O(); g.strokeRect(x,y,w,h);
    W(C.cream); g.fillRect(x+w-7,y+3,5,h-6);
    dash(g,x+4,y+h/2,x+w-10,y+h/2,C.parch);
    W(C.must); g.fillRect(x,y+h/2-6,5,12);
  } else if(word==='candle'){
    W(C.cream); g.fillRect(cx-4,y+8,8,h-8); O(2); g.strokeRect(cx-4,y+8,8,h-8);
    W(C.must); g.beginPath(); g.moveTo(cx-5,y+8); g.lineTo(cx,y-6); g.lineTo(cx+5,y+8); g.closePath(); g.fill();
    W(C.honey); g.beginPath(); g.moveTo(cx-2,y+7); g.lineTo(cx,y); g.lineTo(cx+2,y+7); g.closePath(); g.fill();
  } else if(word==='staff'){
    W(C.bark); g.fillRect(cx-3,y,w-6,h); O(); g.strokeRect(cx-3,y,w-6,h);
    dash(g,cx-3,y+10,cx+3,y+30,C.clay); dash(g,cx-3,y+50,cx+3,y+70,C.clay);
    W(C.must); g.beginPath(); g.arc(cx,y-2,6,0,7); g.fill(); O(2); g.stroke();
  } else if(word==='wheel'){
    W(c); g.beginPath(); g.arc(cx,y+h/2,Math.min(w,h)/2-1,0,7); g.fill(); O(); g.stroke();
    O(2);
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; g.beginPath(); g.moveTo(cx,y+h/2); g.lineTo(cx+Math.cos(a)*20,y+h/2+Math.sin(a)*20); g.stroke(); }
    W(C.rust); g.beginPath(); g.arc(cx,y+h/2,5,0,7); g.fill(); O(2); g.stroke();
  } else { // wild fallback parcel + any other noun: crate build with its tint
    W(c); g.fillRect(x,y,w,h); O(); g.strokeRect(x,y,w,h);
    O(2); g.strokeRect(x+5,y+5,w-10,h-10);
    g.beginPath(); g.moveTo(x+6,y+6); g.lineTo(x+w-6,y+h-6); g.stroke();
    g.fillStyle=INK; g.font='bold 14px Georgia'; g.fillText('?',cx-5,y+h-8);
  }
  label();
}

// upgraded apprentice: robe + stitching, belt, satchel, boots, 4 hairstyles, facing
function drawApprentice(g,x,y,w,h,color,hair,facing,carry){
  sh(g,x,y,w,h);
  const cx=x+w/2;
  // boots
  g.fillStyle=C.night; g.fillRect(x+3,y+h-8,9,8); g.fillRect(x+w-12,y+h-8,9,8);
  // robe with torn hem
  g.fillStyle=color;
  g.beginPath(); g.moveTo(x,y+10); g.lineTo(x+w,y+10); g.lineTo(x+w,y+h-8);
  g.lineTo(x+w-6,y+h-12); g.lineTo(x+w-12,y+h-7); g.lineTo(x-0+12,y+h-12); g.lineTo(x+6,y+h-7); g.lineTo(x,y+h-8); g.closePath(); g.fill();
  g.strokeStyle=INK; g.lineWidth=2.5; g.stroke();
  dash(g,x+4,y+16,x+4,y+h-14,color===C.terra?C.rust:INK);
  // belt + buckle
  g.fillStyle=C.bark; g.fillRect(x,y+h-24,w,6);
  g.fillStyle=C.must; g.fillRect(cx-4,y+h-24,8,6);
  g.strokeStyle=INK; g.lineWidth=1.5; g.strokeRect(cx-4,y+h-24,8,6);
  // satchel + strap
  g.strokeStyle=C.rust; g.lineWidth=2.5;
  g.beginPath(); g.moveTo(x+4,y+12); g.lineTo(x+w-6,y+h-20); g.stroke();
  g.fillStyle=C.clay; g.fillRect(x+w-16,y+h-30,12,10);
  g.strokeStyle=INK; g.lineWidth=2; g.strokeRect(x+w-16,y+h-30,12,10);
  // head
  g.fillStyle=C.skin; g.fillRect(cx-8,y-4,16,13);
  g.strokeStyle=INK; g.lineWidth=2.5; g.strokeRect(cx-8,y-4,16,13);
  // hair variants 0..3
  g.fillStyle=C.bark;
  if(hair===0) g.fillRect(cx-9,y-8,18,6);
  else if(hair===1){ g.fillRect(cx-10,y-8,20,5); g.fillRect(cx-10,y-3,5,12); }
  else if(hair===2){ g.fillRect(cx-10,y-9,20,10); }
  else { g.fillRect(cx-9,y-8,18,5); g.fillRect(cx-3,y-20,6,13); }
  // eyes look toward facing
  g.fillStyle=INK;
  g.fillRect(cx-5+facing*2,y+1,2,3); g.fillRect(cx+3+facing*2,y+1,2,3);
  // arms: raised overhead when carrying rope
  g.strokeStyle=INK; g.lineWidth=3;
  g.beginPath();
  if(carry){ g.moveTo(cx,y+14); g.lineTo(cx+facing*4,y-8); }
  else { g.moveTo(cx,y+14); g.lineTo(cx+facing*10,y+24); }
  g.stroke();
}

return {buildDecor, buildBeatDecor, drawApprentice, drawSummon, LAYOUT};
})();
