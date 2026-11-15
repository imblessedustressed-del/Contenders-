/* --- Simbot 3D arena (owner, Nov 14, 2026: "give me some PlayStation 1 graphics... hit me full power"):
   a tiny software 3D renderer in the style of a late-'90s console: low-poly flat-shaded models drawn at 320x180,
   scaled up with hard pixels, vertices snapped to whole pixels (the wobble), fog, affine (warped) textures,
   billboard crowd. Drives off the same poses and play-by-play as the classic arena. Visual only. --- */
const L3W=320,L3H=180;
let L3C=null;
const l3sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],l3add=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],l3mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const l3cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],l3dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const l3norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
const l3rgb=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const L3LIGHT=l3norm([-.35,.9,-.45]),L3RIM=l3norm([.2,.25,1]),L3FOG=[10,9,20];
function l3gfx(){try{return localStorage.getItem('contenders_simbot_gfx')||'3d'}catch(e){return'3d'}}
function l3setGfx(v){try{localStorage.setItem('contenders_simbot_gfx',v)}catch(e){}}
/* textures (drawn once) */
const L3TEX={};
function l3tex(name,w,h,draw){if(!L3TEX[name]){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);L3TEX[name]=c}return L3TEX[name]}
/* low-res face textures (32x32, like the old consoles): normal, blink/hurt, knocked out, shouting */
function l3face(sk,skD,v){return l3tex('face'+sk+v,32,32,(t)=>{t.fillStyle=sk;t.fillRect(0,0,32,32);t.fillStyle=skD;t.fillRect(0,0,32,3);t.fillRect(0,29,32,3);
  t.fillStyle='#1a0d06';t.fillRect(5,9,9,2);t.fillRect(18,9,9,2);
  if(v==='x'){t.fillStyle='#111';[[7,13],[20,13]].forEach(([x,y])=>{t.fillRect(x,y,1,1);t.fillRect(x+1,y+1,1,1);t.fillRect(x+2,y+2,1,1);t.fillRect(x+2,y,1,1);t.fillRect(x,y+2,1,1)})}
  else if(v==='c'){t.fillStyle='#1a0d06';t.fillRect(6,14,6,1);t.fillRect(20,14,6,1)}
  else{t.fillStyle='#f4f4f4';t.fillRect(6,12,6,4);t.fillRect(20,12,6,4);t.fillStyle='#2a1a10';t.fillRect(9,12,3,4);t.fillRect(20,12,3,4);t.fillStyle='#000';t.fillRect(10,13,1,2);t.fillRect(21,13,1,2)}
  t.fillStyle=skD;t.fillRect(14,15,4,7);t.fillRect(12,21,8,2);
  t.fillStyle='#5a1a14';if(v==='o'||v==='x'){t.fillRect(11,24,10,4);t.fillStyle='#fff';t.fillRect(12,24,8,1)}else t.fillRect(10,25,12,2)})}
function l3matTex(){return l3tex('mat',256,256,(t,w,h)=>{t.fillStyle='#e6e8ec';t.fillRect(0,0,w,h);const r=LAB_RNG(5);
  for(let k=0;k<1400;k++){const v=200+Math.floor(r()*40);t.fillStyle=`rgb(${v},${v+2},${v+6})`;t.fillRect(r()*w|0,r()*h|0,2,2)}
  for(let k=0;k<14;k++){t.fillStyle=`rgba(120,90,70,${.05+r()*.08})`;t.beginPath();t.ellipse(r()*w,r()*h,6+r()*18,4+r()*10,r()*3,0,7);t.fill()}
  t.strokeStyle='rgba(170,14,32,.45)';t.lineWidth=5;t.beginPath();t.arc(w/2,h/2,74,0,7);t.stroke();t.fillStyle='rgba(170,14,32,.14)';t.fill();
  t.font="italic 900 34px Impact, 'Arial Black', sans-serif";t.textAlign='center';t.fillStyle='rgba(150,10,28,.62)';t.fillText('CONTENDERS',w/2,h/2+12);
  t.font="900 13px Verdana, sans-serif";t.fillStyle='rgba(20,40,110,.45)';t.fillText('BOXING LEAGUE',w/2,h/2+34);
  t.font="italic 900 16px Impact, sans-serif";t.fillStyle='rgba(20,40,110,.35)';[[40,40],[216,40],[40,224],[216,224]].forEach(([x,y])=>t.fillText('SIMBOT',x,y))})}
function l3apronTex(k){return l3tex('apron'+k,256,32,(t,w,h)=>{const g2=t.createLinearGradient(0,0,0,h);g2.addColorStop(0,'#1d3c8f');g2.addColorStop(1,'#0c1a44');t.fillStyle=g2;t.fillRect(0,0,w,h);
  t.fillStyle='#d4af37';t.fillRect(0,0,w,2);t.font="italic 900 18px Impact, 'Arial Black', sans-serif";t.textAlign='center';t.fillStyle=k%2?'#ffffff':'#ffd23f';t.fillText(['CONTENDERS BOXING LEAGUE','SIMBOT  ★  FIGHT NIGHT','KO CLUB  ★  CONTENDERS','WATCH IT IN SIMBOT VIEW'][k%4],w/2,23)})}
/* geometry builders: faces {v:[...], c:[r,g,b], pc:part center (for outward normals), n?:fixed normal, emis?, alpha?, layer} */
function l3prism(F,A,B,ra,rb,col,n,layer){n=n||6;const d=l3norm(l3sub(B,A)),up=Math.abs(d[1])>.9?[1,0,0]:[0,1,0],u=l3norm(l3cross(d,up)),v=l3cross(u,d),pc=l3mul(l3add(A,B),.5);
  const ring=(P,r)=>{const o=[];for(let k=0;k<n;k++){const a=k/n*Math.PI*2+.4,c=Math.cos(a)*r,s=Math.sin(a)*r;o.push([P[0]+u[0]*c+v[0]*s,P[1]+u[1]*c+v[1]*s,P[2]+u[2]*c+v[2]*s])}return o};
  const R1=ring(A,ra),R2=ring(B,rb);for(let k=0;k<n;k++){const k2=(k+1)%n;F.push({v:[R1[k],R1[k2],R2[k2],R2[k]],c:col,pc,layer})}
  F.push({v:R1,c:col,pc,layer});F.push({v:R2,c:col,pc,layer})}
function l3slab(F,A,B,wa,da,wb,db,col,layer){const d=l3norm(l3sub(B,A)),w=[0,0,1],dep=l3norm(l3cross(w,d)),pc=l3mul(l3add(A,B),.5);
  const q=(P,W,D)=>[l3add(l3add(P,l3mul(w,W)),l3mul(dep,D)),l3add(l3add(P,l3mul(w,-W)),l3mul(dep,D)),l3add(l3add(P,l3mul(w,-W)),l3mul(dep,-D)),l3add(l3add(P,l3mul(w,W)),l3mul(dep,-D))];
  const a=q(A,wa,da),b=q(B,wb,db);for(let k=0;k<4;k++){const k2=(k+1)%4;F.push({v:[a[k],a[k2],b[k2],b[k]],c:col,pc,layer})}F.push({v:a,c:col,pc,layer});F.push({v:b,c:col,pc,layer})}
function l3box(F,c,s,col,layer,emis){const[x,y,z]=c,[w,h,d]=[s[0]/2,s[1]/2,s[2]/2];
  const V=(i,j,k)=>[x+i*w,y+j*h,z+k*d];
  [[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1],[1,0,0]],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1],[-1,0,0]],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1],[0,1,0]],
   [[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1],[0,-1,0]],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]]]
   .forEach(q=>F.push({v:q.slice(0,4).map(a=>V(...a)),n:q[4],c:col,layer,emis}))}
function l3ball(F,c,rx,ry,rz,colFn,layer,seg,rings){seg=seg||7;rings=rings||5;
  const P=(i,j)=>{const th=j/rings*Math.PI,ph=i/seg*Math.PI*2;return[c[0]+Math.sin(th)*Math.cos(ph)*rx,c[1]+Math.cos(th)*ry,c[2]+Math.sin(th)*Math.sin(ph)*rz]};
  for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const v=[P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)],m=l3mul(l3add(l3add(v[0],v[1]),l3add(v[2],v[3])),.25);
    F.push({v:j===0?[v[0],v[2],v[3]]:j===rings-1?[v[0],v[1],v[2]]:v,c:colFn(l3norm(l3sub(m,c))),pc:c,layer})}}
/* affine texture mapping of one triangle (the authentic warp): src triangle in the image, dst triangle on screen */
function l3triTex(ctx,img,s0,s1,s2,d0,d1,d2){ctx.save();
  // clip a slightly fattened triangle so neighbouring textured triangles meet without hairline gaps
  const mx=(d0[0]+d1[0]+d2[0])/3,my=(d0[1]+d1[1]+d2[1])/3,fat=q=>{const dx=q[0]-mx,dy=q[1]-my,l=Math.hypot(dx,dy)||1;return[q[0]+dx/l*.9,q[1]+dy/l*.9]},e0=fat(d0),e1=fat(d1),e2=fat(d2);
  ctx.beginPath();ctx.moveTo(e0[0],e0[1]);ctx.lineTo(e1[0],e1[1]);ctx.lineTo(e2[0],e2[1]);ctx.closePath();ctx.clip();
  const den=(s0[0]*(s2[1]-s1[1])-s1[0]*s2[1]+s2[0]*s1[1]+(s1[0]-s2[0])*s0[1]);if(!den){ctx.restore();return}
  const a=-(s0[1]*(d2[0]-d1[0])-s1[1]*d2[0]+s2[1]*d1[0]+(s1[1]-s2[1])*d0[0])/den,b=(s1[1]*d2[1]+s0[1]*(d1[1]-d2[1])-s2[1]*d1[1]+(s2[1]-s1[1])*d0[1])/den,
    c=(s0[0]*(d2[0]-d1[0])-s1[0]*d2[0]+s2[0]*d1[0]+(s1[0]-s2[0])*d0[0])/den,d=-(s1[0]*d2[1]+s0[0]*(d1[1]-d2[1])-s2[0]*d1[1]+(s2[0]-s1[0])*d0[1])/den,
    e=(s0[0]*(s2[1]*d1[0]-s1[1]*d2[0])+s0[1]*(s1[0]*d2[0]-s2[0]*d1[0])+(s2[0]*s1[1]-s1[0]*s2[1])*d0[0])/den,f=(s0[0]*(s2[1]*d1[1]-s1[1]*d2[1])+s0[1]*(s1[0]*d2[1]-s2[0]*d1[1])+(s2[0]*s1[1]-s1[0]*s2[1])*d0[1])/den;
  ctx.transform(a,b,c,d,e,f);ctx.drawImage(img,0,0);ctx.restore()}
/* a fighter (or the referee) as low-poly parts, posed from the classic arena's 2D pose */
function l3body(F,o){const{p,x0,dirX,Lz,at,col}=o,ref=!!o.ref,z0=o.z0||0,fx=o.fx!=null?o.fx:dirX,fz=o.fz||0,sx=o.sx||0,sz=o.sz!=null?o.sz:1,fwd=[fx,0,fz];
  const bob=Math.sin(at*6.3+p.seed)*3*(1-p.fall)*(p.cel?0:1),lean=p.lean*14+p.hug*16+p.lunge*10-p.snap*10+p.tired*7-p.bodyHit*6,crouch=p.bodyHit*14+p.tired*6;
  const hip=[0,-112+bob*.5+crouch*.5],sh=[[14+lean,-186+bob+crouch],[-12+lean*.8,-189+bob+crouch]],head=[10+lean*1.15-p.snap*16,-214+bob+crouch+p.tired*4+p.bodyHit*8];
  const fk=[26+p.lunge*8,-56],bk=[-26,-54],ff=[34+p.lunge*22,0],bf=[-38,0];
  const guardR=[30+lean,-200+bob+crouch+p.guardDrop],guardL=[46+lean,-206+bob+crouch+p.guardDrop],hR=p.rear||guardR,hL=p.lead||guardL;
  const armR=labIK(sh[1],hR,36,34,p.rearUp),armL=labIK(sh[0],hL,36,34,p.leadUp);
  const fall=p.fall||0,th=-fall*1.42,cs=Math.cos(th),sn=Math.sin(th),wob=Math.sin(at*13)*(p.wob||0)*8;
  const W=(q,z)=>{let x=q[0],y=q[1]+fall*6;const xr=x*cs-y*sn,yr=x*sn+y*cs;x=xr-fall*20;return[x0+wob+fx*x+sx*z,-yr,z0+fz*x+sz*z]};
  const pe=h=>p.punch&&p.punch.hand===h?p.punch.e:0;
  const sideZ=s=>Lz*s;
  // legs and shoes
  [[bk,bf,-1,col.legD],[fk,ff,1,col.leg]].forEach(([k,ft,s,lc])=>{const z=sideZ(s*11),H=W([hip[0]+s*6,hip[1]],z),K=W(k,z),Fp=W(ft,z);
    l3prism(F,H,K,11,9,lc,6);l3prism(F,K,l3add(Fp,[0,12,0]),9,7,lc,6);l3prism(F,l3add(Fp,[0,18,0]),l3add(Fp,[0,9,0]),8,8,col.sock,6);
    const toe=W([ft[0]+12,ft[1]-3],z),heel=W([ft[0]-8,ft[1]-3],z);l3prism(F,heel,toe,8,7,col.shoe,6)});
  // trunks / pants and torso
  const hp=W(hip,0),wb=W([hip[0]+lean*.3,hip[1]-14],0),tr=W([hip[0]+2,hip[1]+26],0),ch=W([lean*.9,-176+bob+crouch],0),nk=W([head[0]-3,head[1]+18],0);
  l3slab(F,tr,wb,23,17,22,16,col.trunk);l3slab(F,l3add(wb,[0,-1,0]),l3add(wb,[0,5,0]),23.5,17.5,23.5,17.5,col.band);
  l3slab(F,wb,ch,20,14,25,13,col.torso);if(!ref){l3slab(F,l3add(ch,[0,-10,0]),l3add(ch,[0,2,0]),22,12.5,24,12,col.chest)}
  else{l3box(F,l3add(l3add(ch,l3mul(fwd,12)),[0,-2,0]),[3,4,8],col.tie||[20,20,20])}
  l3prism(F,nk,W([head[0]-2,head[1]+8],0),7,7,col.skinD,5);
  // head: skin with hair on top, little dark eyes facing forward
  const hc=W(head,0),hairTop=col.hair;l3ball(F,hc,14,17,13.5,n=>n[1]>.45?hairTop:col.skin,undefined,8,6);
  if(col.flat){const tp=W([head[0]-2,head[1]-20],0);l3slab(F,l3add(tp,[0,-4,0]),l3add(tp,[0,7,0]),12,12,12.5,12.5,hairTop)}
  // the face is a little warped texture, the way the old games did it
  {const hx=head[0]+14.8,hy=head[1],fv=p.fall>.6||(p.wob>.5&&Math.floor(at*3)%2)?'x':p.cel||p.snap>.45?'o':(p.wob>.2||((at*.8+p.seed)%3.7)<.09)?'c':'n';
    let fq=[W([hx,hy-13],-10),W([hx,hy-13],10),W([hx,hy+13],10),W([hx,hy+13],-10)];
    // like the old games, the head turns a little toward the camera so you can see the face
    if(o.cam&&fall<.3){const tc=l3norm([o.cam[0]-hc[0],0,o.cam[2]-(hc[2]+(o.zoff||0))]),n=l3norm(l3add(fwd,l3mul(tc,.75))),upv=[0,1,0],sd=l3norm(l3cross(upv,n)),ctr=l3add(hc,l3mul(n,14.6));
      fq=[l3add(l3add(ctr,l3mul(upv,13)),l3mul(sd,-10)),l3add(l3add(ctr,l3mul(upv,13)),l3mul(sd,10)),l3add(l3add(ctr,l3mul(upv,-13)),l3mul(sd,10)),l3add(l3add(ctr,l3mul(upv,-13)),l3mul(sd,-10))]}
    F.push({v:fq,uv:[[0,0],[32,0],[32,32],[0,32]],tex:l3face(col.skinHex,col.skinDHex,fv),c:[255,255,255],pc:hc})}
  // arms and gloves (rear first so painter order is right)
  [[sh[1],armR,-1,pe('rear')],[sh[0],armL,1,pe('lead')]].forEach(([S,arm,s,e])=>{const zs=sideZ(s*19),zh=zs*(1-e*.85)+(e?0:sideZ(s*-4)),zm=(zs+zh)/2;
    const A=W(S,zs),E=W(arm[0],zm),Hh=W(arm[1],zh);l3ball(F,A,11.5,11,11,()=>col.armU,undefined,6,4);l3prism(F,A,E,10,8,col.armU,6);if(!ref)l3ball(F,l3mul(l3add(A,E),.5),9,9,9,()=>col.armU,undefined,6,4);l3prism(F,E,Hh,8,6.5,col.arm,6);
    if(ref){l3ball(F,Hh,6,6,6,()=>col.skin,undefined,5,4)}else{const gc=l3add(Hh,l3mul(fwd,3));l3ball(F,gc,14,13,12,()=>col.glove,undefined,7,5);l3ball(F,l3add(l3add(gc,[0,5,0]),[0,0,sideZ(s*-9)]),5,7,5,()=>col.glove,undefined,5,3);l3prism(F,l3add(Hh,l3mul(fwd,-6)),l3add(Hh,l3mul(fwd,-12)),8.5,8.5,col.cuff,6)}});
  return{head:hc,chest:ch,hip:hp}}
function l3col(c,ref,extra){const sk=l3rgb(c.sk),skD=l3rgb(c.skD),base={skinHex:c.sk,skinDHex:c.skD,...(extra||{})};
  return ref?{skin:sk,skinD:skD,hair:[110,110,110],torso:[235,235,235],chest:[235,235,235],armU:[235,235,235],arm:sk,trunk:[25,25,25],band:[25,25,25],leg:[30,30,30],legD:[22,22,22],sock:[20,20,20],shoe:[15,15,15],glove:sk,cuff:sk,...base}
  :{skin:sk,skinD:skD,hair:l3rgb(c.hr),torso:sk,chest:sk,armU:sk,arm:sk,trunk:l3rgb(c.tr),band:l3rgb(c.st),leg:sk,legD:skD,sock:[238,238,238],shoe:l3rgb(c.sh==='#f2f2f2'?'#e8e8e8':'#1b1b1b'),glove:l3rgb(c.gl),cuff:[245,245,245],...base}}
/* the crowd: billboards on three banks of seats */
const L3CROWD=(()=>{const r=LAB_RNG(31),out=[],shirts=['#7a2a2a','#2a3f7a','#2f5d3a','#6b5a2a','#555','#5a2f6b','#8a6d3b','#1f4f5f','#a33','#ddd','#c8b040'],skins=['#e8b98a','#c68e5d','#8d5524','#5c3a1e','#f1c9a5','#a8703f'];
  for(let row=0;row<9;row++){const y=30+row*34,z=520+row*62;for(let x=-980;x<=980;x+=30+r()*10)out.push({p:[x,y,z],sh:l3rgb(shirts[Math.floor(r()*shirts.length)]),sk:l3rgb(skins[Math.floor(r()*skins.length)]),f:r(),sign:row>1&&r()<.03})
    for(const s of[-1,1])for(let zz=-420;zz<=470;zz+=30+r()*10)out.push({p:[s*(560+row*62),y,zz],sh:l3rgb(shirts[Math.floor(r()*shirts.length)]),sk:l3rgb(skins[Math.floor(r()*skins.length)]),f:r(),sign:false})}
  return out})();
function lab3D(g,o){const{at,realAt,P,X,tl,f,res,stopBeat,kdNow,big,zoom,inReplay,intro,fin,cur}=o,L=labState(),W=960,H=540,cx=W/2,S=1.12;
  if(!L3C){L3C=document.createElement('canvas');L3C.width=L3W;L3C.height=L3H}const c=L3C.getContext('2d');c.imageSmoothingEnabled=false;
  const Xw=intro?[-200,200]:X.map(x=>(x-cx)/S),mid=(Xw[0]+Xw[1])/2;
  // camera: slow orbit, swoop in during the intro, low and close for the replay, shake on big shots
  const k=intro?Math.min(1,at/(LAB_INTRO-.2)):1,ease=1-(1-k)*(1-k);
  const CAMS=[[0,700,235],[.55,640,205],[-.75,640,300],[.3,520,150],[-.35,760,380]],between0=!intro&&!fin&&cur&&at>=cur.end-.05,cam=between0?[0,900,420]:CAMS[((cur?cur.n:1)-1)%CAMS.length];
  let yaw=cam[0]+Math.sin(realAt*.07)*.22+(1-ease)*1.1,dist=cam[1]+(1-ease)*420,hgt=cam[2]+(1-ease)*260,tx=mid*.6;
  if(inReplay){const lo=res.w==null?0:1-res.w;tx=Xw[lo]*.7;dist=600;hgt=210;yaw=-.5+Math.sin(realAt*.4)*.12}
  if(fin&&!inReplay){yaw+=Math.min(1,(at-(tl.beats[tl.beats.length-1].at))*.15)*.25}
  dist/=zoom;
  const T=[tx,150,0];let C=[tx+Math.sin(yaw)*dist,hgt,-Math.cos(yaw)*dist];
  if(big&&!inReplay)C=l3add(C,[(Math.random()-.5)*14,(Math.random()-.5)*10,0]);
  const fw=l3norm(l3sub(T,C)),rt=l3norm(l3cross([0,1,0],fw)),up=l3cross(fw,rt),foc=L3H*1.32;
  const proj=v=>{const d=l3sub(v,C),z=l3dot(d,fw);if(z<20)return null;return[Math.round(L3W/2+l3dot(d,rt)*foc/z),Math.round(L3H/2-l3dot(d,up)*foc/z),z]};
  const F=[];
  // arena floor and the dark bowl
  c.fillStyle='rgb(10,9,20)';c.fillRect(0,0,L3W,L3H);
  const bowl=c.createLinearGradient(0,0,0,L3H);bowl.addColorStop(0,'#05050b');bowl.addColorStop(1,'#141020');c.fillStyle=bowl;c.fillRect(0,0,L3W,L3H);
  F.push({v:[[-1400,-60,-1400],[1400,-60,-1400],[1400,-60,1600],[-1400,-60,1600]],n:[0,1,0],c:[24,22,30],layer:0});
  // seating banks (stepped)
  for(let row=0;row<9;row++){const y=row*34,z=500+row*62;F.push({v:[[-1000,y,z],[1000,y,z],[1000,y,z+62],[-1000,y,z+62]],n:[0,1,0],c:row%2?[34,30,44]:[40,36,52],layer:0});
    F.push({v:[[-1000,y-34,z],[1000,y-34,z],[1000,y,z],[-1000,y,z]],n:[0,0,-1],c:[22,20,30],layer:0});
    for(const s of[-1,1]){const xx=s*(540+row*62);F.push({v:[[xx,y,-440],[xx,y,500],[xx+s*62,y,500],[xx+s*62,y,-440]],n:[0,1,0],c:row%2?[34,30,44]:[40,36,52],layer:0})}}
  // lighting rig with lamps
  l3box(F,[0,560,60],[900,10,10],[50,52,60],0);l3box(F,[0,560,-60],[900,10,10],[50,52,60],0);
  const lamps=[];[-360,-180,0,180,360].forEach(x=>[-60,60].forEach(z=>{l3box(F,[x,548,z],[22,16,22],[255,246,214],0,true);lamps.push([x,540,z])}));
  // ring: apron skirt, mat, logo, posts, pads, ropes
  const R=300,mat=48;
  {const E=R+20,mt=l3matTex(),N=6,st=2*E/N;for(let a=0;a<N;a++)for(let b=0;b<N;b++){const x1=-E+a*st,x2=x1+st,z1=-E+b*st,z2=z1+st,u=v=>v/(2*E)*256;
      F.push({v:[[x1,mat,z2],[x2,mat,z2],[x2,mat,z1],[x1,mat,z1]],uv:[[u(x1+E),u(E-z2)],[u(x2+E),u(E-z2)],[u(x2+E),u(E-z1)],[u(x1+E),u(E-z1)]],tex:mt,n:[0,1,0],c:[255,255,255],layer:1})}
    [[[-E,-E],[E,-E],[0,0,-1]],[[E,-E],[E,E],[1,0,0]],[[E,E],[-E,E],[0,0,1]],[[-E,E],[-E,-E],[-1,0,0]]].forEach(([A,B,n],k)=>{const tx2=l3apronTex(k);for(let q=0;q<3;q++){const a=q/3,b=(q+1)/3,P1=[A[0]+(B[0]-A[0])*a,A[1]+(B[1]-A[1])*a],P2=[A[0]+(B[0]-A[0])*b,A[1]+(B[1]-A[1])*b];
      F.push({v:[[P1[0],mat,P1[1]],[P2[0],mat,P2[1]],[P2[0],-6,P2[1]],[P1[0],-6,P1[1]]],uv:[[a*256,0],[b*256,0],[b*256,32],[a*256,32]],tex:tx2,n,c:[255,255,255],layer:1})}})}
  // jumbotron over the ring
  const jb=[0,430,0];l3box(F,jb,[190,70,190],[30,32,40],2);[-70,70].forEach(x=>l3prism(F,[jb[0]+x,465,0],[jb[0]+x,555,0],2,2,[70,70,80],4,2));
  const corners=[[-R,-R],[R,-R],[R,R],[-R,R]],cornerCol=[[200,16,46],[230,230,230],[29,78,216],[230,230,230]];
  corners.forEach(([x,z],i)=>{l3prism(F,[x,mat,z],[x,mat+150,z],7,7,[170,170,180],6,2);[0,1,2].forEach(r=>l3box(F,[x,mat+62+r*36,z],[18,24,18],cornerCol[i],2))});
  const ropeCol=[[235,235,235],[200,16,46],[235,235,235]];
  for(let s=0;s<4;s++){const A=corners[s],B=corners[(s+1)%4];[0,1,2].forEach(r=>{const y=mat+64+r*36;for(let q=0;q<6;q++){const a=q/6,b=(q+1)/6;
    l3prism(F,[A[0]+(B[0]-A[0])*a,y,A[1]+(B[1]-A[1])*a],[A[0]+(B[0]-A[0])*b,y,A[1]+(B[1]-A[1])*b],2.6,2.6,ropeCol[r],4,2)}})}
  // corner stools between rounds
  const between=!intro&&!fin&&cur&&at>=cur.end-.05;
  if(between)[[-R+40,-R+40],[R-40,R-40]].forEach(([x,z])=>{l3box(F,[x,mat+30,z],[30,6,30],[60,40,20],2);[[-12,-12],[12,-12],[12,12],[-12,12]].forEach(([a,b])=>l3prism(F,[x+a,mat,z+b],[x+a,mat+28,z+b],2,2,[40,30,15],4,2))});
  const shadow=(x,z,rx,rz)=>{const v=[];for(let k=0;k<12;k++){const a=k/12*Math.PI*2;v.push([x+Math.cos(a)*rx,mat+.8,z+Math.sin(a)*rz])}F.push({v,n:[0,1,0],c:[0,0,0],alpha:.42,emis:true,layer:1.5})};
  [0,1].forEach(i=>{const fl=P[i].fall||0,dir=i?-1:1;shadow(Xw[i]-dir*fl*70,0,48+fl*70,30)});
  if(intro){const ann={seed:9,lean:0,hug:0,lunge:0,snap:0,tired:0,bodyHit:0,guardDrop:0,fall:0,wob:0,cel:0,rear:[8,-262+Math.sin(realAt*4)*6],lead:[16,-130],rearUp:true};
    shadow(0,-40,36,24);const before=F.length;const ab=l3body(F,{cam:C,p:ann,x0:0,z0:-40,fx:0,fz:-1,sx:1,sz:0,dirX:1,Lz:-1,at,ref:true,col:l3col({sk:'#c68e5d',skD:'#8d5524'},true,{torso:[22,22,26],armU:[22,22,26],chest:[240,240,240],trunk:[22,22,26],band:[22,22,26],leg:[22,22,26],legD:[18,18,22],tie:[200,16,46],hair:[30,20,12]})});
    for(let q=before;q<F.length;q++){F[q].v=F[q].v.map(v=>[v[0],v[1]+mat,v[2]]);if(F[q].pc)F[q].pc=[F[q].pc[0],F[q].pc[1]+mat,F[q].pc[2]];F[q].layer=2}}
  // fighters and referee (moved up onto the mat)
  const lift=v=>[v[0],v[1]+mat,v[2]];const hits=[];
  [0,1].forEach(i=>{const before=F.length,b=l3body(F,{cam:C,p:P[i],x0:Xw[i],dirX:i?-1:1,Lz:i?1:-1,at,col:l3col(LAB_SKIN[i],false,{flat:i===1})});for(let q=before;q<F.length;q++){F[q].v=F[q].v.map(lift);if(F[q].pc)F[q].pc=lift(F[q].pc);F[q].layer=2}
    hits[i]={head:lift(b.head),chest:lift(b.chest),hip:lift(b.hip)}});
  {const kdF=kdNow?1-kdNow.a:null,stopX=stopBeat&&at>=stopBeat.at&&!res.decision?Xw[1-res.w]+(res.w?-70:70):null,rx=kdNow?Xw[kdF]+(kdF?60:-60):stopX!=null?stopX:mid+Math.sin(at*.37)*90;
    const count=!!kdNow||(stopBeat&&at>=stopBeat.at&&res.type==='KO'),rp={seed:5,lean:0,hug:0,lunge:0,snap:0,tired:0,bodyHit:0,guardDrop:30,fall:0,wob:0,cel:0,
      rear:count?[24,-200+Math.abs(Math.sin(at*5.5))*-60]:[18,-130],lead:[22,-135],rearUp:!!count};
    shadow(rx,150,36,22);const before=F.length;l3body(F,{cam:C,zoff:150,p:rp,x0:rx,dirX:rx<mid?1:-1,Lz:-1,at,col:l3col({sk:'#d9a066',skD:'#a8714a'},true),ref:true});
    for(let q=before;q<F.length;q++){F[q].v=F[q].v.map(v=>[v[0],v[1]+mat,v[2]+150]);if(F[q].pc)F[q].pc=[F[q].pc[0],F[q].pc[1]+mat,F[q].pc[2]+150];F[q].layer=2}}
  // shade, cull, fog, sort and draw
  const out=[];
  for(const fc of F){const pv=fc.v.map(proj);if(pv.some(q=>!q))continue;
    let n=fc.n;const cen=l3mul(fc.v.reduce((a,b)=>l3add(a,b),[0,0,0]),1/fc.v.length);
    if(!n){n=l3norm(l3cross(l3sub(fc.v[1],fc.v[0]),l3sub(fc.v[2],fc.v[0])));if(fc.pc&&l3dot(n,l3sub(cen,fc.pc))<0)n=l3mul(n,-1)}
    if(l3dot(n,l3sub(cen,C))>0)continue;
    const z=pv.reduce((a,q)=>a+q[2],0)/pv.length;let col;
    if(fc.emis)col=fc.c;else{const s=.36+.6*Math.max(0,l3dot(n,L3LIGHT))+.22*Math.max(0,l3dot(n,L3RIM));col=fc.c.map(x=>Math.min(255,x*s))}
    const fog=Math.max(0,Math.min(.8,(z-900)/1500));col=col.map((x,j)=>Math.round(x*(1-fog)+L3FOG[j]*fog));
    out.push({pv,z,col,layer:fc.layer||0,tex:fc.tex,uv:fc.uv,alpha:fc.alpha,shade:fc.emis?1:Math.min(1.15,.36+.6*Math.max(0,l3dot(n,L3LIGHT))+.22*Math.max(0,l3dot(n,L3RIM))),fog})}
  out.sort((a,b)=>a.layer-b.layer||b.z-a.z);
  let crowdDone=false;
  const crowd=()=>{crowdDone=true;const fl=tl.beats.some(b=>['kd','ko','st'].includes(b.k)&&at>=b.at&&at-b.at<1.3)||fin;
    const cs=L3CROWD.map(q=>{const jump=fl?Math.abs(Math.sin(realAt*10+q.f*20))*7:Math.sin(realAt*2+q.f*9)*1.5;const pp=proj([q.p[0],q.p[1]+18+jump,q.p[2]]);return pp?{q,pp}:null}).filter(Boolean).sort((a,b)=>b.pp[2]-a.pp[2]);
    cs.forEach(({q,pp})=>{const sc=foc/pp[2],fog=Math.max(0,Math.min(.8,(pp[2]-900)/1500)),mix=(cc,s)=>`rgb(${cc.map((x,j)=>Math.round(x*s*(1-fog)+L3FOG[j]*fog)).join(',')})`;
      const bw=Math.max(1,Math.round(22*sc)),bh=Math.max(1,Math.round(22*sc)),hd=Math.max(1,Math.round(11*sc));
      c.fillStyle=mix(q.sh,.75);c.fillRect(pp[0]-bw/2|0,pp[1]-bh/2|0,bw,bh);c.fillStyle=mix(q.sk,.85);c.fillRect(pp[0]-hd/2|0,pp[1]-bh/2-hd|0,hd,hd);
      if(fl&&q.f>.45&&bw>1){c.fillStyle=mix(q.sk,.85);const ay=pp[1]-bh/2-hd*1.6|0;c.fillRect(pp[0]-bw/2-1|0,ay,1,Math.max(1,hd*1.4|0));c.fillRect(pp[0]+bw/2|0,ay,1,Math.max(1,hd*1.4|0))}
      if(q.sign){c.fillStyle=mix([250,250,240],1);c.fillRect(pp[0]-bw|0,pp[1]-bh/2-hd*2.6|0,bw*2,hd*1.4)}
      if(fl&&q.f<.04&&Math.sin(realAt*30+q.f*99)>.7){c.fillStyle='#fff';c.fillRect(pp[0]|0,pp[1]-bh|0,2,2)}})};
  const path=fc=>{c.beginPath();c.moveTo(fc.pv[0][0],fc.pv[0][1]);for(let q=1;q<fc.pv.length;q++)c.lineTo(fc.pv[q][0],fc.pv[q][1]);c.closePath()};
  const poly=fc=>{if(fc.tex){const p0=fc.pv,u=fc.uv;l3triTex(c,fc.tex,u[0],u[1],u[2],p0[0],p0[1],p0[2]);l3triTex(c,fc.tex,u[0],u[2],u[3],p0[0],p0[2],p0[3]);
      if(fc.shade<1){path(fc);c.fillStyle=`rgba(0,0,0,${(1-fc.shade)*.85})`;c.fill()}else if(fc.shade>1){path(fc);c.fillStyle=`rgba(255,240,210,${(fc.shade-1)})`;c.fill()}
      if(fc.fog>0){path(fc);c.fillStyle=`rgba(${L3FOG.join(',')},${fc.fog})`;c.fill()}return}
    if(fc.alpha){c.globalAlpha=fc.alpha;path(fc);c.fillStyle=`rgb(${fc.col.join(',')})`;c.fill();c.globalAlpha=1;return}
    c.fillStyle=`rgb(${fc.col.join(',')})`;c.strokeStyle=c.fillStyle;c.lineWidth=.6;path(fc);c.fill();c.stroke()};
  for(const fc of out){if(fc.layer>=2)break;if(!crowdDone&&fc.layer>0)crowd();poly(fc)}
  if(!crowdDone)crowd();
  // warped (affine) textures: the mat logo goes down before the fighters, the scoreboard face after
  const quad=(img,pts)=>{const pp=pts.map(proj);if(pp.some(q=>!q))return;const iw=img.width,ih=img.height;l3triTex(c,img,[0,0],[iw,0],[iw,ih],pp[0],pp[1],pp[2]);l3triTex(c,img,[0,0],[iw,ih],[0,ih],pp[0],pp[2],pp[3])};
  for(const fc of out)if(fc.layer===2)poly(fc);
  const prevR=tl.rounds[tl.rounds.indexOf(cur)-1],run=cur&&at>=cur.end-.05&&cur.R.run?cur.R.run:prevR&&prevR.R.run?prevR.R.run:[0,0];
  const jt=document.createElement('canvas');jt.width=96;jt.height=40;{const t=jt.getContext('2d');t.fillStyle='#000';t.fillRect(0,0,96,40);t.font="bold 11px 'Courier New', monospace";t.textAlign='center';t.fillStyle='#ffb000';t.fillText(intro?'TONIGHT':'ROUND '+(cur?cur.n:1),48,14);
    t.fillStyle='#ff5a5a';t.textAlign='left';t.fillText(String(run[0]),8,32);t.fillStyle='#7fb0ff';t.textAlign='right';t.fillText(String(run[1]),88,32);t.fillStyle='#fff';t.textAlign='center';t.fillText(intro?'VS':'-',48,32)}
  quad(jt,[[jb[0]-95,jb[1]+35,jb[2]-96],[jb[0]+95,jb[1]+35,jb[2]-96],[jb[0]+95,jb[1]-35,jb[2]-96],[jb[0]-95,jb[1]-35,jb[2]-96]]);

  // ordered-dither shimmer on the image, like the old consoles
  const id=c.getImageData(0,0,L3W,L3H),dd=id.data,BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  for(let y=0;y<L3H;y++)for(let x=0;x<L3W;x++){const q=(y*L3W+x)*4,b=(BAY[(y&3)*4+(x&3)]-7.5)*1.6;for(let j=0;j<3;j++)dd[q+j]=Math.max(0,Math.min(255,dd[q+j]+b))&0xF8}
  c.putImageData(id,0,0);
  g.imageSmoothingEnabled=false;g.drawImage(L3C,0,0,L3W,L3H,0,0,W,H);g.imageSmoothingEnabled=true;
  // lamp glare (full resolution, additive)
  g.save();g.globalCompositeOperation='lighter';lamps.forEach(l=>{const pp=proj(l);if(!pp)return;const sx=pp[0]*3,sy=pp[1]*3,r=Math.max(10,9000/pp[2]);const gr=g.createRadialGradient(sx,sy,1,sx,sy,r);gr.addColorStop(0,'rgba(255,245,220,.55)');gr.addColorStop(1,'rgba(255,245,220,0)');g.fillStyle=gr;g.beginPath();g.arc(sx,sy,r,0,7);g.fill()});g.restore();
  // follow spots: sweeping during the introductions, locked on the winner at the end
  {const spots=[];if(intro){[0,1].forEach(i=>spots.push([Xw[i]+Math.sin(realAt*1.7+i*2)*40,Math.cos(realAt*1.3+i)*40]));spots.push([Math.sin(realAt*.9)*30,-40])}
    else if(fin&&res.w!=null)spots.push([Xw[res.w],0]);
    if(spots.length){g.save();g.globalCompositeOperation='lighter';spots.forEach(([sx,sz],k)=>{const top=proj([sx*.3+(k-1)*160,545,sz*.3]),bot=proj([sx,mat+1,sz]),side=proj([sx+75,mat+1,sz]);if(!top||!bot||!side)return;
      const tx3=top[0]*3,ty3=top[1]*3,bx=bot[0]*3,by=bot[1]*3,w=Math.abs(side[0]-bot[0])*3+8;const gr=g.createLinearGradient(tx3,ty3,bx,by);gr.addColorStop(0,'rgba(255,250,225,.30)');gr.addColorStop(1,'rgba(255,250,225,.10)');
      g.fillStyle=gr;g.beginPath();g.moveTo(tx3-5,ty3);g.lineTo(tx3+5,ty3);g.lineTo(bx+w,by);g.lineTo(bx-w,by);g.closePath();g.fill();
      const pg2=g.createRadialGradient(bx,by,2,bx,by,w);pg2.addColorStop(0,'rgba(255,250,225,.35)');pg2.addColorStop(1,'rgba(255,250,225,0)');g.fillStyle=pg2;g.beginPath();g.ellipse(bx,by,w,w*.35,0,0,7);g.fill()});g.restore()}}
  // impact sparks, sweat and the flying mouthpiece, placed on the 3D bodies
  const P2=v=>{const pp=proj(v);return pp?[pp[0]*3,pp[1]*3,pp[2]]:null};
  tl.beats.forEach((b,bi)=>{const d=at-b.at;if(d<.14||d>.8||b.a==null||!['p','r','j','c','st','kd'].includes(b.k))return;const i=1-b.a;labPunchType(b);const low=b.low&&b.pt!=='jab';
    const pt=P2(low?hits[i].chest:hits[i].head);if(!pt)return;const sc=Math.min(1.6,700/pt[2]);
    if(d<.5){const sz=(b.k==='j'?.6:b.k==='r'?.85:1.25)*(1-d*1.2)*sc;g.save();g.translate(pt[0],pt[1]);g.rotate(d*3);g.scale(sz,sz);const gr=g.createRadialGradient(0,0,2,0,0,40);gr.addColorStop(0,'#fff');gr.addColorStop(.35,'#ffe066');gr.addColorStop(1,'rgba(255,120,0,0)');
      g.fillStyle=gr;g.beginPath();for(let q=0;q<18;q++){const r=q%2?12:40,a=q*Math.PI/9;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.restore()}
    if(!low&&['p','st','kd','c'].includes(b.k)&&d>.15){const rr=LAB_RNG(bi*7+3),dir=i?1:-1;for(let q=0;q<10;q++){const a=-.9+rr()*1.4,v=110+rr()*170,t2=d-.15;
      g.fillStyle=`rgba(210,235,255,${.85*(1-t2/.65)})`;g.fillRect(pt[0]+dir*Math.cos(a)*v*t2*sc|0,pt[1]+(Math.sin(a)*v*t2+260*t2*t2)*sc|0,3,3)}}});
  if(stopBeat&&res.type==='KO'&&at>=stopBeat.at&&at-stopBeat.at<1.4){const d=at-stopBeat.at,i=1-res.w,pt=P2(hits[i].head);if(pt){const dir=i?1:-1;
    g.save();g.translate(pt[0]+dir*(20+d*160),pt[1]-d*190+d*d*330);g.rotate(d*14);g.fillStyle='#f4f4f4';g.fillRect(-9,-4,18,8);g.fillStyle=i?'#1d4ed8':'#c8102e';g.fillRect(-9,-1,18,2);g.restore()}}
}
