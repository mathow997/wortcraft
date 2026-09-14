// Minimal 2D engine: fixed-step loop, AABB platforms, follow camera w/ dead-zone + clamp, Verlet rope stub.
window.Engine = (() => {
  const GRAV = 2200;
  function makeInput(){
    const keys = {};
    addEventListener('keydown', e => {
      keys[e.code] = true;
      if(['Space','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', e => keys[e.code] = false);
    return keys;
  }
  function makeCamera(viewW, viewH){
    return { x:0, y:0, viewW, viewH,
      follow(px, py, bounds, dead=80){
        const cx = this.x + this.viewW/2, cy = this.y + this.viewH/2;
        if (px < cx - dead) this.x = px - this.viewW/2 - dead;
        if (px > cx + dead) this.x = px - this.viewW/2 + dead;
        if (py < cy - dead) this.y = py - this.viewH/2 - dead;
        if (py > cy + dead) this.y = py - this.viewH/2 + dead;
        this.x = Math.max(bounds.x, Math.min(bounds.x + bounds.w - this.viewW, this.x));
        this.y = Math.max(bounds.y, Math.min(bounds.y + bounds.h - this.viewH, this.y));
      }};
  }
  // Verlet rope for beat 5 (stub used later; kept here so physics API is stable)
  class Rope {
    constructor(x0,y0,x1,y1,segments=12,sag=20){
      this.points=[]; this.sticks=[];
      for(let i=0;i<=segments;i++){
        const t=i/segments;
        this.points.push({x:x0+(x1-x0)*t, y:y0+(y1-y0)*t+Math.sin(t*Math.PI)*sag, px:0, py:0, pinned:(i===0||i===segments)});
      }
      this.points.forEach(p=>{p.px=p.x;p.py=p.y;});
      for(let i=0;i<segments;i++){
        const a=this.points[i], b=this.points[i+1];
        this.sticks.push({a,b,len:Math.hypot(b.x-a.x,b.y-a.y)});
      }
    }
    step(){
      for(const p of this.points){
        if(p.pinned) continue;
        const vx=(p.x-p.px)*0.98, vy=(p.y-p.py)*0.98;
        p.px=p.x; p.py=p.y; p.x+=vx; p.y+=vy+0.5;
      }
      for(let k=0;k<3;k++) for(const s of this.sticks){
        const dx=s.b.x-s.a.x, dy=s.b.y-s.a.y, d=Math.hypot(dx,dy)||1, diff=(d-s.len)/d;
        if(!s.a.pinned){s.a.x+=dx*0.5*diff;s.a.y+=dy*0.5*diff;}
        if(!s.b.pinned){s.b.x-=dx*0.5*diff;s.b.y-=dy*0.5*diff;}
      }
    }
  }
  function physicsBody(x,y,w,h){ return {x,y,w,h,vx:0,vy:0,onGround:false}; }
  function moveAndCollide(b, solids, dt){
    b.vy += GRAV*dt;
    b.x += b.vx*dt;
    for(const s of solids){
      if(overlap(b,s)){ if(b.vx>0) b.x=s.x-b.w; else if(b.vx<0) b.x=s.x+s.w; b.vx=0; }
    }
    b.y += b.vy*dt; b.onGround=false;
    for(const s of solids){
      if(overlap(b,s)){ if(b.vy>0){b.y=s.y-b.h;b.vy=0;b.onGround=true;} else if(b.vy<0){b.y=s.y+s.h;b.vy=0;} }
    }
  }
  function overlap(a,b){ return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }
  // paper-cutout rect (Wortcraft ruling): torn silhouette + flat fill + indigo #2e3a68 outline + offset shadow.
  // Hybrid decision: Linenmere crisp outline kept, torn paper edge added as outer silhouette, shadow allowed.
  function paperRect(ctx,x,y,w,h,fill){
    ctx.fillStyle='rgba(0,0,0,.25)'; ctx.fillRect(x+4,y+5,w,h); // offset shadow layer
    // torn outer silhouette (deterministic jitter, linen tint)
    ctx.fillStyle='#f5efdd';
    ctx.beginPath();
    const j=(n)=>((n*37)%7)-3;
    ctx.moveTo(x-3+j(x),y-2+j(y));
    ctx.lineTo(x+w+3+j(w),y-3+j(h));
    ctx.lineTo(x+w+2+j(y),y+h+3+j(x));
    ctx.lineTo(x-2+j(h),y+h+2+j(w));
    ctx.closePath(); ctx.fill();
    ctx.fillStyle=fill; ctx.fillRect(x,y,w,h);
    ctx.strokeStyle='#2e3a68'; ctx.lineWidth=3; ctx.strokeRect(x,y,w,h);
  }
  return { makeInput, makeCamera, Rope, physicsBody, moveAndCollide, overlap, paperRect, GRAV };
})();
