// Wortcraft procedural art — detailed paper-cutout scenery in the strict Linenmere 22.
// Static decor is pre-rendered once to an offscreen canvas (3200x540) and blitted per frame.
window.Art = (() => {
const INK='#2e3a68';
const C={terra:'#b3552e',must:'#d9a441',sage:'#8a9a5b',linen:'#e8dcc0',skin:'#d9b48f',
  bark:'#6a4a26',water:'#3f7d9c',leaf:'#5f8448',moss:'#3d7038',clay:'#8a6a42',ash:'#9a9a92',
  night:'#1f2a4a',honey:'#e8c96a',cream:'#f5efdd',parch:'#cfc4a8',rust:'#7a4a1a',tan:'#b09a6a',
  herb1:'#c9a44a',herb2:'#8a7a4a',herb3:'#6f8a3a'};
const LAYOUT={ shelf:{x:1000,y:280,w:220}, jarXs:[1032,1094,1156], jarY:242, exit:{x:3050,y:364,w:70,h:120} };

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

function buildDecor(){
  const cv=document.createElement('canvas'); cv.width=3200; cv.height=540;
  const g=cv.getContext('2d');
  const rng=mulberry32(7);
  // sky (exterior zones; shed wall paints over its stretch)
  g.fillStyle=C.cream; g.fillRect(0,0,3200,300);
  g.fillStyle=C.honey; g.beginPath(); g.arc(2820,70,26,0,7); g.fill();
  g.strokeStyle=INK; g.lineWidth=3; g.beginPath(); g.arc(2820,70,26,0,7); g.stroke();
  for(let i=0;i<12;i++){ // paper hills
    const hx=i*280+60, hw=200+((i*53)%80);
    g.fillStyle=i%2?C.sage:C.leaf;
    g.fillRect(hx,300-hw/3,hw,hw/3);
    g.strokeStyle=INK; g.lineWidth=3; g.strokeRect(hx,300-hw/3,hw,hw/3);
  }
  // soil base full width
  box(g,0,484,3200,56,C.clay,false);
  dash(g,0,500,3200,500,C.bark);
  // ---- garden 0-600: fence, tufts, flowers ----
  g.fillStyle=C.sage; g.fillRect(0,458,600,26);
  for(let x=30;x<580;x+=46){ box(g,x,392,12,72,C.bark,false); }
  box(g,20,400,560,8,C.clay,false); box(g,20,428,560,8,C.clay,false);
  for(let i=0;i<26;i++){
    const x=10+rng()*580, y=440+rng()*20;
    g.strokeStyle=C.moss; g.lineWidth=2;
    g.beginPath(); g.moveTo(x,y); g.lineTo(x-3,y-9); g.moveTo(x,y); g.lineTo(x+3,y-10); g.stroke();
    if(rng()<0.4){ g.fillStyle=C.must; g.beginPath(); g.arc(x+8,y-6,4,0,7); g.fill(); g.strokeStyle=INK; g.lineWidth=1.5; g.stroke(); }
  }
  // ---- shed doorway frame at x600 (walk in) ----
  beam(g,592,300,16,184); beam(g,592,284,120,16);
  // ---- SHED INTERIOR 600-1600 ----
  g.fillStyle=C.linen; g.fillRect(600,0,1000,484);          // daub wall
  for(let x=700;x<1600;x+=200) beam(g,x,0,18,484);          // timber uprights
  beam(g,600,40,1000,18); beam(g,600,240,1000,14);          // rails
  for(let x=620;x<1600;x+=40) dash(g,x,60,x+22,220,C.parch);// wattle
  // floorboards
  for(let r=0;r<3;r++) for(let x=600;x<1600;x+=130){
    g.fillStyle=r%2?C.clay:C.bark; g.fillRect(x,488+r*16,128,15);
    g.strokeStyle=INK; g.lineWidth=1.5; g.strokeRect(x,488+r*16,128,15);
  }
  // window + light shaft
  box(g,1330,110,120,110,C.water);
  g.fillStyle=C.honey; g.beginPath(); g.arc(1400,150,20,0,7); g.fill();
  box(g,1382,110,10,110,C.bark,false); box(g,1330,156,120,10,C.bark,false);
  box(g,1322,220,136,12,C.clay);
  g.fillStyle='rgba(232,220,192,.20)';
  g.beginPath(); g.moveTo(1340,232); g.lineTo(1450,232); g.lineTo(1500,484); g.lineTo(1390,484); g.closePath(); g.fill();
  // wall shelves heavy with jars (backdrop rows)
  shelfRow(g,640,150,300,rng,8);
  shelfRow(g,640,210,240,rng,6);
  shelfRow(g,1290,300,270,rng,7);
  // THE gameplay shelf: back panel + end jars (middle kept clear for the 3 dusty jars)
  const S=LAYOUT.shelf;
  g.fillStyle=C.parch; g.fillRect(S.x-14,S.y-64,S.w+28,64);
  g.strokeStyle=INK; g.lineWidth=3; g.strokeRect(S.x-14,S.y-64,S.w+28,64);
  jar(g,S.x-8,S.y-40,1,C.moss,C.rust); jar(g,S.x+S.w-24,S.y-40,0,C.herb1,C.terra);
  box(g,S.x-14,S.y,S.w+28,12,C.clay);
  box(g,S.x-6,S.y+12,12,40,C.bark,false); box(g,S.x+S.w-6,S.y+12,12,40,C.bark,false);
  candle(g,S.x+S.w+16,S.y,22);
  // hanging sign
  g.strokeStyle=INK; g.lineWidth=2;
  g.beginPath(); g.moveTo(1080,240); g.lineTo(1080,252); g.moveTo(1140,240); g.lineTo(1140,252); g.stroke();
  box(g,1050,250,120,26,C.cream);
  g.fillStyle=INK; g.font='13px Georgia'; g.fillText('POTTING SHED',1058,268);
  // hanging bundles from the rail
  [800,950,1250,1450,1560].forEach((x,i)=>bundle(g,x,66,[C.leaf,C.moss,C.sage,C.herb2,C.herb3][i%5]));
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
  for(let i=1;i<5;i++){ g.beginPath(); g.arc(1600,0,i*16,0,Math.PI/2); g.stroke(); }
  // ---- ravine 1600-1860: dark chasm, roots ----
  g.fillStyle=C.night; g.fillRect(1600,300,260,240);
  g.fillStyle=C.bark;
  for(let i=0;i<7;i++){ const x=1604+i*36; g.fillRect(x,484,10,30+((i*37)%50)); }
  g.strokeStyle=C.moss; g.lineWidth=3;
  for(let i=0;i<5;i++){ const x=1610+i*50; g.beginPath(); g.moveTo(x,484); g.quadraticCurveTo(x+8,520,x-4,548); g.stroke(); }
  g.fillStyle='rgba(232,220,192,.14)'; g.fillRect(1600,420,260,40);
  // ---- home stretch: grass, fence, flowers, stones ----
  g.fillStyle=C.sage; g.fillRect(1860,458,1340,26);
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
  // ---- exit: cottage door assembly ----
  const E=LAYOUT.exit;
  g.fillStyle=C.sage; g.fillRect(E.x-90,180,260,304);        // front wall patch
  g.strokeStyle=INK; g.lineWidth=3; g.strokeRect(E.x-90,180,260,304);
  g.fillStyle=C.must; g.fillRect(E.x-100,150,280,40);        // thatch lip
  g.strokeStyle=INK; g.lineWidth=3; g.strokeRect(E.x-100,150,280,40);
  for(let x=E.x-96;x<E.x+176;x+=18) dash(g,x,154,x+8,186,C.terra);
  box(g,E.x-16,E.y-6,E.w+32,E.h+12,C.ash);                   // stone surround
  box(g,E.x,E.y,E.w,E.h,C.bark,false);                       // door
  dash(g,E.x+8,E.y+8,E.x+8,E.y+E.h-8,C.clay);
  dash(g,E.x+E.w-8,E.y+8,E.x+E.w-8,E.y+E.h-8,C.clay);
  box(g,E.x+10,E.y+E.h/2-14,E.w-20,12,C.clay,false);         // brace
  g.fillStyle=C.must; g.beginPath(); g.arc(E.x+E.w-16,E.y+E.h/2+24,7,0,7); g.fill();
  g.strokeStyle=INK; g.lineWidth=2.5; g.stroke();            // ring handle
  box(g,E.x-4,E.y+E.h,E.w+8,14,C.parch,false);               // step
  beam(g,E.x+E.w+44,E.y+20,12,120);                          // lantern post
  box(g,E.x+E.w+30,E.y-2,40,34,C.night);                     // lantern
  g.fillStyle=C.honey; g.fillRect(E.x+E.w+42,E.y+6,16,18);
  g.fillStyle='rgba(232,201,106,.25)'; g.beginPath(); g.arc(E.x+E.w+50,E.y+15,44,0,7); g.fill();
  return cv;
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

return {buildDecor, drawApprentice, LAYOUT};
})();
