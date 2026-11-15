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
const L3GFX_NAMES={'16bit':'Graphics: 16-Bit','3d':'Graphics: 3D',classic:'Graphics: Classic'};
/* 16-bit mode (owner, Nov 14, 2026: a Super Nintendo era boxing look): the 2D arena drawn at 320x180 in three layers,
   colors cut to a small palette with a light ordered dither, fighters' edges hardened and outlined in near-black,
   a tighter camera so the fighters are big sprites, then blown up with hard pixels. Original art, nothing copied. */
let L16=null;
function l16post(cv,outline){const c=cv.getContext('2d'),id=c.getImageData(0,0,L3W,L3H),d=id.data,B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],w=L3W,h=L3H;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const q=(y*w+x)*4;if(outline||d[q+3]){const b=(B[(y&3)*4+(x&3)]-7.5)*(outline==null?1.3:2);for(let j=0;j<3;j++){d[q+j]=Math.max(0,Math.min(255,Math.round((d[q+j]+b)/36)*36))}}
    if(outline!=null)d[q+3]=d[q+3]>100?255:0}
  if(outline){const a=new Uint8Array(w*h);for(let i=0;i<w*h;i++)a[i]=d[i*4+3];
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(a[i])continue;if((x>0&&a[i-1])||(x<w-1&&a[i+1])||(y>0&&a[i-w])||(y<h-1&&a[i+w])){const q=i*4;d[q]=18;d[q+1]=12;d[q+2]=16;d[q+3]=255}}}
  c.putImageData(id,0,0)}
function lab16(g,sceneDraw){if(!L16)L16=[0,1,2,3].map(()=>{const c=document.createElement('canvas');c.width=L3W;c.height=L3H;return c});
  const[bg,fig,fx,out]=L16,cs=[bg,fig,fx].map(c=>{const x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,L3W,L3H);x.setTransform(L3W/960,0,0,L3H/540,0,0);return x});
  sceneDraw(cs[0],cs[1],cs[2],1.22);
  l16post(bg);l16post(fig,true);l16post(fx,false);
  const o=out.getContext('2d');o.clearRect(0,0,L3W,L3H);o.drawImage(bg,0,0);o.drawImage(fig,0,0);o.drawImage(fx,0,0);
  g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=false;g.drawImage(out,0,0,L3W,L3H,0,0,960,540);g.imageSmoothingEnabled=true}
function l3nextGfx(){const o=['3d','16bit','classic'];return o[(o.indexOf(l3gfx())+1)%3]}
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
    l3prism(F,H,K,13.5,10.5,lc,8);l3prism(F,K,l3add(Fp,[0,40,0]),10.5,9,lc,8);
    // high boxing boots with a white top band
    l3prism(F,l3add(Fp,[0,42,0]),l3add(Fp,[0,6,0]),9.5,9,col.boot||col.sock,8);l3prism(F,l3add(Fp,[0,44,0]),l3add(Fp,[0,38,0]),10,10,[240,240,240],8);
    const toe=W([ft[0]+13,ft[1]-3],z),heel=W([ft[0]-8,ft[1]-3],z);l3prism(F,heel,toe,9,8,col.boot||col.shoe,8)});
  // trunks / pants and torso
  const hp=W(hip,0),wb=W([hip[0]+lean*.3,hip[1]-14],0),tr=W([hip[0]+2,hip[1]+26],0),ch=W([lean*.9,-176+bob+crouch],0),nk=W([head[0]-3,head[1]+18],0);
  l3slab(F,tr,wb,26,19,25,18,col.trunk);l3slab(F,l3add(wb,[0,-1,0]),l3add(wb,[0,6,0]),26.5,19.5,26.5,19.5,col.band);
  l3slab(F,wb,ch,23,16,30,15,col.torso);if(!ref){l3slab(F,l3add(ch,[0,-12,0]),l3add(ch,[0,3,0]),27,15,29,14.5,col.chest)}
  else{l3box(F,l3add(l3add(ch,l3mul(fwd,12)),[0,-2,0]),[3,4,8],col.tie||[20,20,20])}
  l3prism(F,nk,W([head[0]-2,head[1]+8],0),7,7,col.skinD,5);
  // head: skin with hair on top, little dark eyes facing forward
  const hc=W(head,0),hairTop=col.hair;l3ball(F,hc,15,18,14.5,n=>n[1]>.45?hairTop:col.skin,undefined,10,7);
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
    const A=W(S,zs),E=W(arm[0],zm),Hh=W(arm[1],zh);l3ball(F,A,14,13,13,()=>col.armU,undefined,8,5);l3prism(F,A,E,12,9.5,col.armU,8);if(!ref)l3ball(F,l3mul(l3add(A,E),.5),11,10.5,10.5,()=>col.armU,undefined,8,5);l3prism(F,E,Hh,9.5,8,col.arm,8);
    if(ref){l3ball(F,Hh,6,6,6,()=>col.skin,undefined,5,4)}else{const gc=l3add(Hh,l3mul(fwd,3));l3ball(F,gc,17,16,15,()=>col.glove,undefined,9,6);l3ball(F,l3add(l3add(gc,[0,5,0]),[0,0,sideZ(s*-9)]),5,7,5,()=>col.glove,undefined,5,3);l3prism(F,l3add(Hh,l3mul(fwd,-7)),l3add(Hh,l3mul(fwd,-14)),10,10,col.cuff,8)}});
  return{head:hc,chest:ch,hip:hp}}
function l3col(c,ref,extra){const sk=l3rgb(c.sk),skD=l3rgb(c.skD),base={skinHex:c.sk,skinDHex:c.skD,...(extra||{})};
  return ref?{skin:sk,skinD:skD,hair:[110,110,110],torso:[235,235,235],chest:[235,235,235],armU:[235,235,235],arm:sk,trunk:[25,25,25],band:[25,25,25],leg:[30,30,30],legD:[22,22,22],sock:[20,20,20],shoe:[15,15,15],glove:sk,cuff:sk,...base}
  :{boot:l3rgb(c.tr),skin:sk,skinD:skD,hair:l3rgb(c.hr),torso:sk,chest:sk,armU:sk,arm:sk,trunk:l3rgb(c.tr),band:l3rgb(c.st),leg:sk,legD:skD,sock:[238,238,238],shoe:l3rgb(c.sh==='#f2f2f2'?'#e8e8e8':'#1b1b1b'),glove:l3rgb(c.gl),cuff:[245,245,245],...base}}
/* the crowd: billboards on three banks of seats */
const L3CROWD=(()=>{const r=LAB_RNG(31),out=[],shirts=['#7a2a2a','#2a3f7a','#2f5d3a','#6b5a2a','#555','#5a2f6b','#8a6d3b','#1f4f5f','#a33','#ddd','#c8b040'],skins=['#e8b98a','#c68e5d','#8d5524','#5c3a1e','#f1c9a5','#a8703f'];
  for(let row=0;row<10;row++){const y=30+row*34,z=500+row*58;for(let x=-1000;x<=1000;x+=24+r()*6)out.push({p:[x,y,z],sh:l3rgb(shirts[Math.floor(r()*shirts.length)]),sk:l3rgb(skins[Math.floor(r()*skins.length)]),f:r(),sign:row>1&&r()<.025})
    for(const s of[-1,1])for(let zz=-440;zz<=480;zz+=24+r()*6)out.push({p:[s*(520+row*58),y,zz],sh:l3rgb(shirts[Math.floor(r()*shirts.length)]),sk:l3rgb(skins[Math.floor(r()*skins.length)]),f:r(),sign:false})}
  return out})();
function lab3D(g,o){const{at,realAt,P,X,tl,f,res,stopBeat,kdNow,big,zoom,inReplay,intro,fin,cur}=o,L=labState(),W=960,H=540,cx=W/2,S=1.12;
  if(!L3C){L3C=document.createElement('canvas');L3C.width=L3W;L3C.height=L3H}const c=L3C.getContext('2d');c.imageSmoothingEnabled=false;
  const Xw=intro?[-200,200]:X.map(x=>(x-cx)/S),mid=(Xw[0]+Xw[1])/2;
  // camera: slow orbit, swoop in during the intro, low and close for the replay, shake on big shots
  const k=intro?Math.min(1,at/(LAB_INTRO-.2)):1,ease=1-(1-k)*(1-k);
  const CAMS=[[.4,325,180],[-.4,325,180],[.22,370,200],[.6,320,172],[-.25,385,210]],between0=!intro&&!fin&&cur&&at>=cur.end-.05,cam=between0?[.1,760,340]:CAMS[((cur?cur.n:1)-1)%CAMS.length];
  let yaw=cam[0]+Math.sin(realAt*.07)*.12+(1-ease)*1.1,dist=cam[1]+(1-ease)*520,hgt=cam[2]+(1-ease)*300,tx=mid;
  if(inReplay){const lo=res.w==null?0:1-res.w;tx=Xw[lo]*.6+mid*.4;dist=420;hgt=160;yaw=-.55+Math.sin(realAt*.4)*.12}
  if(fin&&!inReplay){yaw+=Math.min(1,(at-(tl.beats[tl.beats.length-1].at))*.15)*.25}
  dist/=zoom;
  const T=[tx,intro?170:198,0];let C=[tx+Math.sin(yaw)*dist,hgt,-Math.cos(yaw)*dist];
  if(big&&!inReplay)C=l3add(C,[(Math.random()-.5)*14,(Math.random()-.5)*10,0]);
  const fw=l3norm(l3sub(T,C)),rt=l3norm(l3cross([0,1,0],fw)),up=l3cross(fw,rt),foc=L3H*1.32;
  const proj=v=>{const d=l3sub(v,C),z=l3dot(d,fw);if(z<20)return null;return[Math.round(L3W/2+l3dot(d,rt)*foc/z),Math.round(L3H/2-l3dot(d,up)*foc/z),z]};
  const R=300,mat=48;let lamps=[],hits=[];
  /* WebGL path (owner, Nov 14: "way more realistic"): smooth-shaded sculpted fighters on the graphics card; the software renderer below is the fallback */
  const glr=labGLScene(g,{C,T,P,Xw,mid,at,realAt,intro,fin,res,stopBeat,kdNow,tl,cur,mat,R,dist,tx});
  if(glr){lamps=glr.lamps;hits=glr.hits}else{
  const F=[];
  // arena floor and the dark bowl
  c.fillStyle='rgb(10,9,20)';c.fillRect(0,0,L3W,L3H);
  const bowl=c.createLinearGradient(0,0,0,L3H);bowl.addColorStop(0,'#05050b');bowl.addColorStop(1,'#141020');c.fillStyle=bowl;c.fillRect(0,0,L3W,L3H);
  F.push({v:[[-1400,-60,-1400],[1400,-60,-1400],[1400,-60,1600],[-1400,-60,1600]],n:[0,1,0],c:[24,22,30],layer:0});
  // seating banks (stepped)
  for(let row=0;row<10;row++){const y=row*34,z=480+row*58;F.push({v:[[-1000,y,z],[1000,y,z],[1000,y,z+58],[-1000,y,z+58]],n:[0,1,0],c:row%2?[34,30,44]:[40,36,52],layer:0});
    F.push({v:[[-1000,y-34,z],[1000,y-34,z],[1000,y,z],[-1000,y,z]],n:[0,0,-1],c:[22,20,30],layer:0});
    for(const s of[-1,1]){const xx=s*(500+row*58);F.push({v:[[xx,y,-460],[xx,y,500],[xx+s*58,y,500],[xx+s*58,y,-460]],n:[0,1,0],c:row%2?[34,30,44]:[40,36,52],layer:0})}}
  // lighting rig with lamps
  l3box(F,[0,560,60],[900,10,10],[50,52,60],0);l3box(F,[0,560,-60],[900,10,10],[50,52,60],0);
  lamps=[];[-360,-180,0,180,360].forEach(x=>[-60,60].forEach(z=>{l3box(F,[x,548,z],[22,16,22],[255,246,214],0,true);lamps.push([x,540,z])}));
  // ring: apron skirt, mat, logo, posts, pads, ropes

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
  const lift=v=>[v[0],v[1]+mat,v[2]];hits=[];
  [0,1].forEach(i=>{const before=F.length,b=l3body(F,{cam:C,p:P[i],x0:Xw[i],dirX:i?-1:1,Lz:i?1:-1,at,col:l3col(LAB_SKIN[i],false,{flat:i===1})});for(let q=before;q<F.length;q++){F[q].v=F[q].v.map(lift);if(F[q].pc)F[q].pc=lift(F[q].pc);F[q].layer=2}
    hits[i]={head:lift(b.head),chest:lift(b.chest),hip:lift(b.hip)}});
  {const kdF=kdNow?1-kdNow.a:null,stopX=stopBeat&&at>=stopBeat.at&&!res.decision?Xw[1-res.w]+(res.w?-70:70):null,rx=kdNow?Xw[kdF]+(kdF?60:-60):stopX!=null?stopX:mid-(C[0]-tx)/Math.max(1,dist)*150+Math.sin(at*.37)*40; // the referee works the far side, away from the camera
    const count=!!kdNow||(stopBeat&&at>=stopBeat.at&&res.type==='KO'),rp={seed:5,lean:0,hug:0,lunge:0,snap:0,tired:0,bodyHit:0,guardDrop:30,fall:0,wob:0,cel:0,
      rear:count?[24,-200+Math.abs(Math.sin(at*5.5))*-60]:[18,-130],lead:[22,-135],rearUp:!!count};
    shadow(rx,200,36,22);const before=F.length;l3body(F,{cam:C,zoff:200,p:rp,x0:rx,dirX:rx<mid?1:-1,Lz:-1,at,col:l3col({sk:'#d9a066',skD:'#a8714a'},true),ref:true});
    for(let q=before;q<F.length;q++){F[q].v=F[q].v.map(v=>[v[0],v[1]+mat,v[2]+200]);if(F[q].pc)F[q].pc=[F[q].pc[0],F[q].pc[1]+mat,F[q].pc[2]+200];F[q].layer=2}}
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
      c.fillStyle=mix([40,70,170],.8);c.fillRect(pp[0]-bw*.7|0,pp[1]-bh*.9|0,Math.max(1,bw*1.4|0),Math.max(1,bh*1.5|0));
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
  for(let y=0;y<L3H;y++)for(let x=0;x<L3W;x++){const q=(y*L3W+x)*4,b=(BAY[(y&3)*4+(x&3)]-7.5)*.9;for(let j=0;j<3;j++)dd[q+j]=Math.max(0,Math.min(255,dd[q+j]+b))&0xF8}
  c.putImageData(id,0,0);
  g.imageSmoothingEnabled=false;g.drawImage(L3C,0,0,L3W,L3H,0,0,W,H);g.imageSmoothingEnabled=true;}
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

/* 3D-mode HUD (original design in the style of late-'90s console boxing): long health bars across the top in each corner's color,
   a thin yellow punch-stamina bar under each (full at the bell, drains as he throws, refills between rounds), and a framed
   digital clock in the middle with the round count. */
function labHud32(g,o){const{P,at,cur,res,tl,names,W,cx}=o,rounds=(labState().bout&&labState().bout.rounds)||12;
  const thrown=i=>tl.beats.filter(b=>b.round===cur.n&&b.a===i&&b.at<=at&&['p','r','j','m','c','st','kd'].includes(b.k)).length;
  const bar=(i)=>{const p=P[i],e=Math.max(0,Math.min(1,p.en)),left=i===0,x0=left?24:cx+58,w0=W/2-82,col=left?['#ff5a5a','#b0101e']:['#5aa0ff','#1d3fb0'];
    g.save();g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x0-4,14,w0+8,34);
    // frame
    const fr=g.createLinearGradient(0,16,0,40);fr.addColorStop(0,'#f2f2f2');fr.addColorStop(1,'#8a8f99');g.fillStyle=fr;g.fillRect(x0-2,16,w0+4,20);
    g.fillStyle='#111';g.fillRect(x0,18,w0,16);
    const w=w0*e,bx=left?x0+w0-w:x0,gr=g.createLinearGradient(0,18,0,34);gr.addColorStop(0,col[0]);gr.addColorStop(.5,col[1]);gr.addColorStop(1,col[0]);g.fillStyle=gr;g.fillRect(bx,18,w,16);
    g.fillStyle='rgba(255,255,255,.35)';g.fillRect(bx,18,w,4);if(p.hitAt>0&&at-p.hitAt<.2){g.fillStyle='rgba(255,255,255,.7)';g.fillRect(x0,18,w0,16)}
    // stamina
    const between=at>=cur.end-.05,sta=between?1:Math.max(.08,1-thrown(i)*.035),sw=w0*.92*sta,sx=left?x0+w0*.08+w0*.92-sw:x0;
    g.fillStyle='#222';g.fillRect(left?x0+w0*.08:x0,38,w0*.92,7);g.fillStyle='#ffd400';g.fillRect(sx,38,sw,7);g.fillStyle='rgba(255,255,255,.4)';g.fillRect(sx,38,sw,2);
    // name
    g.font="italic 900 15px Impact, 'Arial Black', sans-serif";g.textAlign=left?'left':'right';g.fillStyle='#000';const nm=(names[i]||'').toUpperCase().slice(0,22);
    g.fillText(nm,(left?x0:x0+w0)+1,63);g.fillStyle=left?'#ffb3b3':'#b9d3ff';g.fillText(nm,left?x0:x0+w0,62);g.restore()};
  bar(0);bar(1);
  // center clock
  const clockT=Math.max(0,Math.min(1,(at-cur.start)/(cur.end-cur.start)))*(cur.last&&!res.decision?cur.clockEnd:180),sec=Math.max(0,180-Math.floor(clockT));
  g.save();const mt=g.createLinearGradient(0,6,0,86);mt.addColorStop(0,'#e9edf2');mt.addColorStop(.5,'#7b828e');mt.addColorStop(1,'#dfe3e8');g.fillStyle=mt;
  g.beginPath();g.moveTo(cx-56,6);g.lineTo(cx+56,6);g.lineTo(cx+50,74);g.lineTo(cx+20,86);g.lineTo(cx-20,86);g.lineTo(cx-50,74);g.closePath();g.fill();
  g.fillStyle='#0b0d10';g.fillRect(cx-46,13,92,58);g.fillStyle='#1a2a12';g.fillRect(cx-42,16,84,52);
  g.font="bold 15px 'Courier New', monospace";g.textAlign='center';g.fillStyle='#b8ff4a';g.fillText(`R ${String(cur.n).padStart(2,'0')}/${String(rounds).padStart(2,'0')}`,cx,33);
  g.font="bold 28px 'Courier New', monospace";g.fillStyle='#d6ff7a';g.fillText(`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`,cx,62);
  g.fillStyle='rgba(184,255,74,.12)';g.fillRect(cx-42,16,84,26);g.fillStyle='#c8102e';g.font="italic 900 9px Verdana, sans-serif";g.fillText('CONTENDERS',cx,82);g.restore()}

/* ===== WebGL arena (owner, Nov 14, 2026: "way more realistic"): smooth-shaded, sculpted fighters drawn on the graphics card.
   Original fighters and ring art (no characters, logos or art from any real game). Falls back to the software renderer when
   WebGL isn't available. Bodies are built every frame from the same poses as the other arenas, so the fight looks identical. ===== */
let LGL=null;
const glV=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
function glMesh(){return{p:[],n:[],c:[],t:[]}}
function glTri(M,a,b,c,na,nb,nc,col,ua,ub,uc){M.p.push(...a,...b,...c);M.n.push(...na,...nb,...nc);for(let i=0;i<3;i++)M.c.push(col[0]/255,col[1]/255,col[2]/255,col[3]==null?.15:col[3]);
  M.t.push(...(ua||[0,0]),...(ub||[0,0]),...(uc||[0,0]))}
function glQuad(M,a,b,c,d,na,nb,nc,nd,col,uv){glTri(M,a,b,c,na,nb,nc,col,uv&&uv[0],uv&&uv[1],uv&&uv[2]);glTri(M,a,c,d,na,nc,nd,col,uv&&uv[0],uv&&uv[2],uv&&uv[3])}
/* rings of points around a path: each section {c (center), u, v (unit axes), ru, rv (radii), front (extra depth on +v side)} */
function glLoft(M,S,col,seg,capA,capB){seg=seg||14;const R=S.map(s=>{const pts=[],nrm=[];for(let k=0;k<=seg;k++){const a=k/seg*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),rv=s.rv*(sa>0&&s.front?s.front:1);
    pts.push(l3add(s.c,l3add(l3mul(s.u,ca*s.ru),l3mul(s.v,sa*rv))));nrm.push(l3norm(l3add(l3mul(s.u,ca/s.ru),l3mul(s.v,sa/rv))))}return{pts,nrm,col:s.col||col}});
  for(let i=0;i<R.length-1;i++){const A=R[i],B=R[i+1];for(let k=0;k<seg;k++)glQuad(M,A.pts[k],A.pts[k+1],B.pts[k+1],B.pts[k],A.nrm[k],A.nrm[k+1],B.nrm[k+1],B.nrm[k],A.col)}
  const cap=(r,s,flip)=>{const n=l3norm(l3cross(s.u,s.v)),nn=flip?l3mul(n,-1):n;for(let k=0;k<seg;k++)flip?glTri(M,s.c,r.pts[k],r.pts[k+1],nn,nn,nn,r.col):glTri(M,s.c,r.pts[k+1],r.pts[k],nn,nn,nn,r.col)};
  if(capA)cap(R[0],S[0],true);if(capB)cap(R[R.length-1],S[S.length-1],false)}
function glFrame(d){const up=Math.abs(d[1])>.9?[1,0,0]:[0,1,0],u=l3norm(l3cross(d,up)),v=l3cross(u,d);return[u,v]}
/* a limb from A to B; prof(t) gives the radius (muscle bulges live here) */
function glTube(M,A,B,prof,col,segL,seg){const d=l3norm(l3sub(B,A)),[u,v]=glFrame(d);segL=segL||6;const S=[];for(let i=0;i<=segL;i++){const t=i/segL,r=prof(t);S.push({c:glV(A,B,t),u,v,ru:r,rv:r})}glLoft(M,S,col,seg||12,true,true)}
/* an ellipsoid with three (orthogonal) axis vectors */
function glEll(M,c,ax,ay,az,col,seg,rings,colFn){seg=seg||12;rings=rings||8;const a2=[ax,ay,az].map(a=>l3dot(a,a));
  const P=(i,j)=>{const th=j/rings*Math.PI,ph=i/seg*Math.PI*2,x=Math.sin(th)*Math.cos(ph),y=Math.cos(th),z=Math.sin(th)*Math.sin(ph);
    return{p:l3add(c,l3add(l3add(l3mul(ax,x),l3mul(ay,y)),l3mul(az,z))),n:l3norm(l3add(l3add(l3mul(ax,x/a2[0]),l3mul(ay,y/a2[1])),l3mul(az,z/a2[2]))),y}};
  for(let j=0;j<rings;j++)for(let i=0;i<seg;i++){const a=P(i,j),b=P(i+1,j),d=P(i,j+1),e=P(i+1,j+1),cl=colFn?colFn((a.y+e.y)/2,i/seg):col;if(!cl)continue;glQuad(M,a.p,b.p,e.p,d.p,a.n,b.n,e.n,d.n,cl)}}
function glBox(M,c,s,col,uvFn){const[x,y,z]=c,[w,h,d]=[s[0]/2,s[1]/2,s[2]/2],V=(i,j,k)=>[x+i*w,y+j*h,z+k*d];
  [[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1],[1,0,0]],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1],[-1,0,0]],[[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1],[0,1,0]],
   [[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1],[0,-1,0]],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],[0,0,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1],[0,0,-1]]]
   .forEach((q,fi)=>{const n=q[4];glQuad(M,V(...q[0]),V(...q[1]),V(...q[2]),V(...q[3]),n,n,n,n,col,uvFn&&uvFn(fi))})}
/* one fighter (or the referee / announcer), sculpted from the pose */
function glBody(M,o){const{p,x0,dirX,Lz,at,K}=o,ref=!!o.ref,z0=o.z0||0,y0=o.y0||0,fx=o.fx!=null?o.fx:dirX,fz=o.fz||0,sx=o.sx||0,sz=o.sz!=null?o.sz:1;
  const bob=Math.sin(at*6.3+p.seed)*3*(1-p.fall)*(p.cel?0:1),lean=p.lean*14+p.hug*16+p.lunge*10-p.snap*10+p.tired*7-p.bodyHit*6,crouch=p.bodyHit*14+p.tired*6;
  const hip=[0,-112+bob*.5+crouch*.5],sh=[[14+lean,-186+bob+crouch],[-12+lean*.8,-189+bob+crouch]],head=[10+lean*1.15-p.snap*16,-214+bob+crouch+p.tired*4+p.bodyHit*8];
  const fk=[26+p.lunge*8,-56],bk=[-26,-54],ff=[34+p.lunge*22,0],bf=[-38,0];
  const guardR=[30+lean,-200+bob+crouch+p.guardDrop],guardL=[46+lean,-206+bob+crouch+p.guardDrop],hR=p.rear||guardR,hL=p.lead||guardL;
  const armR=labIK(sh[1],hR,36,34,p.rearUp),armL=labIK(sh[0],hL,36,34,p.leadUp);
  const fall=p.fall||0,th=-fall*1.42,cs=Math.cos(th),sn=Math.sin(th),wob=Math.sin(at*13)*(p.wob||0)*8;
  const W=(q,z)=>{let x=q[0],y=q[1]+fall*6;const xr=x*cs-y*sn,yr=x*sn+y*cs;x=xr-fall*20;return[x0+wob+fx*x+sx*z,y0-yr,z0+fz*x+sz*z]};
  const O=W([0,0],0),FW=l3norm(l3sub(W([1,0],0),O)),UP=l3norm(l3sub(W([0,-1],0),O)),SD=l3norm(l3sub(W([0,0],1),O));
  const pe=h=>p.punch&&p.punch.hand===h?p.punch.e:0,side=s=>Lz*s;
  const sec=(c,ru,rv,front,col)=>({c,u:SD,v:FW,ru,rv,front,col});
  // legs: thighs (inside the shorts), knees, calves, laced boots
  [[bk,bf,-1],[fk,ff,1]].forEach(([k,ft,s])=>{const z=side(s*11),H=W([hip[0]+s*5,hip[1]+6],z),Kn=W(k,z),Fp=W(ft,z),An=l3add(Fp,l3mul(UP,10));
    glTube(M,H,Kn,t=>14.5-3.5*t+2.5*Math.sin(Math.PI*Math.min(1,t*1.4)),K.skin,6,12);glEll(M,Kn,l3mul(SD,10),l3mul(UP,10),l3mul(FW,10.5),K.skin,10,6);
    glTube(M,Kn,An,t=>10-3*t+2.2*Math.sin(Math.PI*Math.min(1,t*1.8)),K.skin,6,12);
    const bt=l3add(Fp,l3mul(UP,48));glTube(M,bt,l3add(Fp,l3mul(UP,5)),t=>10.2-1.2*t,K.boot,4,12);glTube(M,l3add(bt,l3mul(UP,2)),l3add(bt,l3mul(UP,-6)),()=>10.8,K.bootBand,1,12);
    for(let l=0;l<5;l++){const lc=l3add(l3add(Fp,l3mul(UP,12+l*7.5)),l3mul(FW,9.6));glBox(M,lc,[3,1.4,3].map((v,i)=>v),K.lace)}
    glEll(M,l3add(l3add(Fp,l3mul(FW,6)),l3mul(UP,4)),l3mul(FW,16),l3mul(UP,6.5),l3mul(SD,8),K.boot,12,6,(y)=>y<-.55?K.sole:K.boot)});
  // shorts: a loft around the pelvis plus two short legs, waistband on top
  const HP=W(hip,0);{const S=[];[[-30,27,19],[-14,28.5,20],[2,27.5,19.5],[12,25.5,17.5],[19,25.8,17.8]].forEach(([dy,w,d],i)=>S.push(sec(l3add(HP,l3mul(UP,dy)),w,d,0,i>=3?K.band:K.trunk)));glLoft(M,S,K.trunk,16,true,false);
    [[-1],[1]].forEach(([s])=>{const z=side(s*11),H=W([hip[0]+s*5,hip[1]+6],z),Kn=W(s>0?fk:bk,z),e=glV(H,Kn,.42);glTube(M,l3add(H,l3mul(UP,4)),e,t=>17.2-1.5*t,K.trunk,2,14)});
}
  // torso: hips -> waist -> chest -> shoulders, a V-taper with pecs and lats
  const CH=W([lean*.9,-176+bob+crouch],0),NK=W([head[0]-3,head[1]+18],0);
  {const S=[];const prof=[[0,24.5,16.5,1],[.18,22.5,15.5,1.02],[.38,24,15.5,1.04],[.58,29,16.5,1.12],[.76,32.5,17,1.16],[.9,31,14.5,1.06],[1,15,11,1]];
    prof.forEach(([t,w,d,fr])=>{const c=t<.6?glV(l3add(HP,l3mul(UP,14)),CH,t/.6):glV(CH,NK,(t-.6)/.4);S.push(sec(c,w*(ref?.95:1),d*(ref?1.05:1),ref?1.04:fr,ref?K.shirt:K.skin))});glLoft(M,S,K.skin,18,false,true)}
  if(!ref){// abs: three soft rows of bumps on the stomach
    for(let r=0;r<3;r++)for(const s of[-1,1]){const c=l3add(l3add(glV(l3add(HP,l3mul(UP,16)),CH,.25+r*.18),l3mul(FW,14.2)),l3mul(SD,s*5));glEll(M,c,l3mul(SD,4.6),l3mul(UP,4.2),l3mul(FW,2.2),K.skin,8,5)}}
  else{glBox(M,l3add(l3add(NK,l3mul(FW,11)),l3mul(UP,-6)),[8,4,8],K.tie)}
  // neck, head, jaw, nose, ears, hair, eyes
  const HC=W(head,0);glTube(M,NK,l3add(HC,l3mul(UP,-6)),()=>8.6,K.skin,2,12);
  glEll(M,HC,l3mul(FW,15.5),l3mul(UP,18),l3mul(SD,14.2),K.skin,16,10);
  glEll(M,l3add(l3add(HC,l3mul(FW,5)),l3mul(UP,-9)),l3mul(FW,11),l3mul(UP,8.5),l3mul(SD,11.5),K.skin,12,6);
  glEll(M,l3add(l3add(HC,l3mul(FW,15.6)),l3mul(UP,-1.5)),l3mul(FW,3.8),l3mul(UP,5.5),l3mul(SD,3.2),K.skin,8,5);
  for(const s of[-1,1])glEll(M,l3add(HC,l3mul(SD,s*14)),l3mul(FW,3.5),l3mul(UP,5.5),l3mul(SD,2.4),K.skin,8,5);
  const ko=p.fall>.6||p.wob>.5,blink=((at*.8+p.seed)%3.7)<.09;
  for(const s of[-1,1]){const e=l3add(l3add(l3add(HC,l3mul(FW,13.2)),l3mul(UP,3)),l3mul(SD,s*5.6));
    if(ko||blink)glEll(M,e,l3mul(FW,1.2),l3mul(UP,.8),l3mul(SD,3),[40,22,14],6,4);else{glEll(M,e,l3mul(FW,1.8),l3mul(UP,2.2),l3mul(SD,3),[245,245,240,.6],8,5);glEll(M,l3add(e,l3mul(FW,1.4)),l3mul(FW,.8),l3mul(UP,1.4),l3mul(SD,1.4),[25,15,10,.6],6,4)}
    glBox(M,l3add(l3add(l3add(HC,l3mul(FW,13.6)),l3mul(UP,7.5)),l3mul(SD,s*5.8)),[2,1.6,2].map(v=>v),K.hair)}
  glEll(M,l3add(l3add(HC,l3mul(FW,4.5)),l3mul(UP,-12.5)),l3mul(FW,1.5),l3mul(UP,1.2),l3mul(SD,5),[90,30,30],8,4);
  if(K.hairStyle==='flat'){glBox(M,l3add(HC,l3mul(UP,15)),[22,14,22],K.hair)}
  else if(K.hairStyle==='bald'){}else glEll(M,l3add(l3add(HC,l3mul(UP,4.5)),l3mul(FW,-2.5)),l3mul(FW,15.2),l3mul(UP,15.2),l3mul(SD,15),K.hair,14,8,(y)=>y<-.05?null:K.hair);
  // arms: deltoid, biceps, forearm, glove with thumb and cuff
  const hands=[];
  [[sh[1],armR,-1,pe('rear')],[sh[0],armL,1,pe('lead')]].forEach(([S0,arm,s,e])=>{const zs=side(s*20),zh=zs*(1-e*.85)+(e?0:side(s*-4)),zm=(zs+zh)/2;
    const A=W(S0,zs),E=W(arm[0],zm),Hh=W(arm[1],zh);glEll(M,A,l3mul(FW,13),l3mul(UP,12),l3mul(SD,12.5),ref?K.shirt:K.skin,12,8);
    glTube(M,A,E,t=>(ref&&t<.5?12.5:11.5)-2.2*t+(ref?0:2.4*Math.sin(Math.PI*Math.max(0,Math.min(1,(t-.25)/.6)))),ref?K.shirt:K.skin,6,12);glEll(M,E,l3mul(FW,8.6),l3mul(UP,8.6),l3mul(SD,8.6),K.skin,10,6);
    glTube(M,E,Hh,t=>9.6-2*t+1.4*Math.sin(Math.PI*Math.min(1,t*1.6)),K.skin,6,12);
    if(ref){glEll(M,Hh,l3mul(FW,6),l3mul(UP,6),l3mul(SD,6),K.skin,8,6)}else{const d=l3norm(l3sub(Hh,E)),[u,v]=glFrame(d),gc=l3add(Hh,l3mul(d,6));
      glEll(M,gc,l3mul(d,17),l3mul(u,15),l3mul(v,14),K.glove,16,10);glEll(M,l3add(l3add(gc,l3mul(u,side(s)*-10)),l3mul(d,2)),l3mul(d,7),l3mul(u,4.5),l3mul(v,5.5),K.glove,10,6);
      glTube(M,l3add(Hh,l3mul(d,-4)),l3add(Hh,l3mul(d,-14)),()=>10.6,K.cuff,2,14);glTube(M,l3add(Hh,l3mul(d,-8.5)),l3add(Hh,l3mul(d,-10.5)),()=>11,K.glove,1,14)}
    hands.push(Hh)});
  return{head:HC,chest:CH,hip:HP}}
function glKit(c,i){const rgb=h=>l3rgb(h),sk=rgb(c.sk);return{skin:[...sk,.28],boot:i?[29,64,175,.5]:[200,16,46,.5],bootBand:[245,245,245,.3],lace:[250,250,250,.2],sole:[240,240,240,.2],
  trunk:i?[22,52,170,.35]:[185,14,38,.35],band:i?[240,240,240,.4]:[235,190,40,.55],glove:i?[28,80,220,.85]:[214,22,38,.85],cuff:[245,245,245,.4],hair:i?[22,14,8,.1]:[48,28,14,.1],hairStyle:i?'flat':'cap'}}
function glRefKit(sk){const s=l3rgb(sk);return{skin:[...s,.2],shirt:[236,236,236,.1],trunk:[30,30,34,.1],band:[30,30,34,.1],boot:[18,18,20,.5],bootBand:[18,18,20,.5],lace:[18,18,20,.1],sole:[18,18,20,.1],tie:[20,20,24,.2],hair:[90,90,92,.1],hairStyle:'cap',glove:s,cuff:s}}
const GL_VS=`attribute vec3 aP;attribute vec3 aN;attribute vec4 aC;attribute vec2 aT;uniform mat4 uVP;varying vec3 vN;varying vec4 vC;varying vec3 vW;varying vec2 vT;
void main(){vN=aN;vC=aC;vW=aP;vT=aT;gl_Position=uVP*vec4(aP,1.0);}`;
const GL_FS=`precision mediump float;varying vec3 vN;varying vec4 vC;varying vec3 vW;varying vec2 vT;uniform sampler2D uTex;uniform float uUseTex;uniform vec3 uEye;uniform float uAlpha;uniform float uEmis;uniform float uFlash;
void main(){vec3 n=normalize(vN);vec3 V=normalize(uEye-vW);if(dot(n,V)<0.0&&uUseTex<0.5)n=-n;
vec3 L1=normalize(vec3(-0.35,0.9,-0.45));vec3 L2=normalize(vec3(0.7,0.35,0.45));vec3 base=vC.rgb;if(uUseTex>0.5)base*=texture2D(uTex,vT).rgb;
float d1=max(dot(n,L1),0.0),d2=max(dot(n,L2),0.0),rim=pow(1.0-max(dot(n,V),0.0),2.5);vec3 H=normalize(L1+V);float sp=pow(max(dot(n,H),0.0),28.0)*vC.a;
vec3 c=base*(0.30+0.78*d1+0.28*d2)+vec3(1.0,0.96,0.88)*sp*0.9+base*rim*0.45+vec3(uFlash);if(uEmis>0.5)c=base;
float fog=clamp((length(uEye-vW)-950.0)/1700.0,0.0,0.72);c=mix(c,vec3(0.04,0.035,0.08),fog);gl_FragColor=vec4(c,uAlpha);}`;
function glInit(){if(LGL!==null)return LGL;try{const cv=document.createElement('canvas');cv.width=960;cv.height=540;
    const gl=cv.getContext('webgl',{antialias:true,preserveDrawingBuffer:true,alpha:false});if(!gl)return LGL=false;
    const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(x));return x};
    const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,GL_VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,GL_FS));gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error('link');
    const loc={};['aP','aN','aC','aT'].forEach(a=>loc[a]=gl.getAttribLocation(pr,a));['uVP','uTex','uUseTex','uEye','uAlpha','uEmis','uFlash'].forEach(u=>loc[u]=gl.getUniformLocation(pr,u));
    const tex=img=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      const pot=x=>(x&(x-1))===0;if(pot(img.width)&&pot(img.height)){gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT)}
      else{gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)}return t};
    const buf=M=>{const b={n:M.p.length/3,bufs:[]};[['aP',M.p,3],['aN',M.n,3],['aC',M.c,4],['aT',M.t,2]].forEach(([a,d,k])=>{const x=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,x);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.STATIC_DRAW);b.bufs.push([a,x,k])});return b};
    // ---- static arena
    const R=300,mat=48,E=R+20;
    const mm=glMesh();for(let a=0;a<8;a++)for(let b=0;b<8;b++){const st=2*E/8,x1=-E+a*st,x2=x1+st,z1=-E+b*st,z2=z1+st,u=v=>v/(2*E);glQuad(mm,[x1,mat,z2],[x2,mat,z2],[x2,mat,z1],[x1,mat,z1],[0,1,0],[0,1,0],[0,1,0],[0,1,0],[255,255,255,.05],[[u(E-x1),u(E-z2)],[u(E-x2),u(E-z2)],[u(E-x2),u(E-z1)],[u(E-x1),u(E-z1)]])}
    const ap=[0,1,2,3].map(()=>glMesh());[[[-E,-E],[E,-E],[0,0,-1]],[[E,-E],[E,E],[1,0,0]],[[E,E],[-E,E],[0,0,1]],[[-E,E],[-E,-E],[-1,0,0]]].forEach(([A,B,n],k)=>glQuad(ap[k],[A[0],mat,A[1]],[B[0],mat,B[1]],[B[0],-8,B[1]],[A[0],-8,A[1]],n,n,n,n,[255,255,255,0],[[0,0],[1,0],[1,1],[0,1]]));
    const st=glMesh();glQuad(st,[-1600,-60,-1600],[-1600,-60,1800],[1600,-60,1800],[1600,-60,-1600],[0,1,0],[0,1,0],[0,1,0],[0,1,0],[26,24,32,0]);
    // corner posts, pads, ropes, steps, lighting rig, jumbotron
    const corners=[[-R,-R],[R,-R],[R,R],[-R,R]],pad=[[200,16,46,.3],[235,235,235,.3],[29,78,216,.3],[235,235,235,.3]];
    corners.forEach(([x,z],i)=>{glTube(st,[x,mat-4,z],[x,mat+160,z],()=>6.5,[175,178,186,.9],2,12);glTube(st,[x,mat+50,z],[x,mat+150,z],()=>13,pad[i],3,12)});
    const ropeC=[[240,240,240,.4],[200,16,46,.4],[240,240,240,.4],[29,78,216,.4]];
    for(let s=0;s<4;s++){const A=corners[s],B=corners[(s+1)%4];[0,1,2].forEach(r=>{const y=mat+66+r*36;glTube(st,[A[0],y,A[1]],[B[0],y,B[1]],()=>3.2,r===1?(s%2?ropeC[3]:ropeC[1]):ropeC[0],8,8)})}
    for(let k=-2;k<=2;k++)for(const z of[-70,70]){glBox(st,[k*190,560,z],[26,18,26],[255,246,214,0])}
    // stands: three banks of seats with a painted crowd
    const crowdT=l3tex('crowdGL',1024,512,(t,w,h)=>{t.fillStyle='#141a33';t.fillRect(0,0,w,h);const r=LAB_RNG(77),sh=['#b23a3a','#2f4fa8','#2f7d4a','#c7a33c','#6c6c6c','#7a3f8c','#d8d8d8','#a8642c','#1f6f7f','#c94f7c','#e2e2e2','#333'],sk=['#e8b98a','#c68e5d','#8d5524','#5c3a1e','#f1c9a5','#a8703f'];
      for(let row=0;row<8;row++){const y=h-row*64-6;for(let x=0;x<w;x+=32){const jx=x+4+r()*6;t.fillStyle='#2849a8';t.fillRect(jx-3,y-44,30,44);t.fillStyle='#1b2f6e';t.fillRect(jx-3,y-8,30,8);
        if(r()<.9){t.fillStyle=sh[Math.floor(r()*sh.length)];t.beginPath();t.roundRect(jx,y-34,24,30,6);t.fill();t.fillStyle=sk[Math.floor(r()*sk.length)];t.beginPath();t.arc(jx+12,y-42,8,0,7);t.fill();
          if(r()<.5){t.fillStyle=['#2a1a0e','#111','#6b4b2a','#d8c070'][Math.floor(r()*4)];t.beginPath();t.arc(jx+12,y-46,8,Math.PI,2*Math.PI);t.fill()}
          if(r()<.03){t.fillStyle='#fffbe6';t.fillRect(jx-6,y-70,36,16);t.fillStyle=r()<.5?'#c8102e':'#1d4ed8';t.font='bold 11px Impact,sans-serif';t.fillText(['KO!','#1','WAR!','10-9'][Math.floor(r()*4)],jx-2,y-58)}}}}});
    const cr=glMesh();const bank=(A,B,C2,D,rep)=>{const n=l3norm(l3cross(l3sub(B,A),l3sub(D,A)));glQuad(cr,A,B,C2,D,n,n,n,n,[255,255,255,0],[[0,1],[rep,1],[rep,0],[0,0]])};
    bank([-1300,-40,470],[1300,-40,470],[1300,560,1150],[-1300,560,1150],2.3);bank([-470,-40,-900],[-470,-40,900],[-1150,560,900],[-1150,560,-900],1.6);bank([470,-40,900],[470,-40,-900],[1150,560,-900],[1150,560,900],1.6);
    LGL={cv,gl,pr,loc,tex,buf,st:buf(st),mat:buf(mm),apron:ap.map(buf),crowd:buf(cr),tMat:tex(l3matTex()),tApron:[0,1,2,3].map(k=>tex(l3apronTex(k))),tCrowd:tex(crowdT),dyn:null};
    return LGL}catch(e){console.warn('3D arena: WebGL unavailable, using the software renderer',e);return LGL=false}}
function glMat4(C,T,fovy,asp,near,far){const f=l3norm(l3sub(T,C)),r=l3norm(l3cross(f,[0,1,0])),u=l3cross(r,f);
  const V=[r[0],u[0],-f[0],0, r[1],u[1],-f[1],0, r[2],u[2],-f[2],0, -l3dot(r,C),-l3dot(u,C),l3dot(f,C),1];
  const t=1/Math.tan(fovy/2),P=[t/asp,0,0,0, 0,t,0,0, 0,0,(far+near)/(near-far),-1, 0,0,2*far*near/(near-far),0];
  const o=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=P[k*4+j]*V[i*4+k];o[i*4+j]=s}return o}
function labGLScene(g,o){const G=glInit();if(!G)return null;const{gl,loc}=G,{C,T,P,Xw,mid,at,realAt,intro,fin,res,stopBeat,kdNow,tl,cur,mat}=o;
  gl.viewport(0,0,960,540);gl.clearColor(.03,.03,.06,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.useProgram(G.pr);
  const VP=glMat4(C,T,2*Math.atan(.5/1.32),16/9,30,6000);gl.uniformMatrix4fv(loc.uVP,false,VP);gl.uniform3fv(loc.uEye,C);gl.uniform1f(loc.uAlpha,1);gl.uniform1f(loc.uFlash,0);gl.uniform1i(loc.uTex,0);
  const draw=(b,tex,emis)=>{b.bufs.forEach(([a,x,k])=>{gl.bindBuffer(gl.ARRAY_BUFFER,x);gl.enableVertexAttribArray(loc[a]);gl.vertexAttribPointer(loc[a],k,gl.FLOAT,false,0,0)});
    gl.uniform1f(loc.uUseTex,tex?1:0);gl.uniform1f(loc.uEmis,emis?1:0);if(tex){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex)}gl.drawArrays(gl.TRIANGLES,0,b.n)};
  draw(G.st,null,false);draw(G.mat,G.tMat,false);G.apron.forEach((b,k)=>draw(b,G.tApron[k],false));draw(G.crowd,G.tCrowd,true);
  // the people and their shadows
  const M=glMesh(),hits=[];
  [0,1].forEach(i=>{const b=glBody(M,{p:P[i],x0:Xw[i],y0:mat,dirX:i?-1:1,Lz:i?1:-1,at,K:glKit(LAB_SKIN[i],i)});hits[i]={head:b.head,chest:b.chest,hip:b.hip}});
  const kdF=kdNow?1-kdNow.a:null,stopX=stopBeat&&at>=stopBeat.at&&!res.decision?Xw[1-res.w]+(res.w?-70:70):null,tx=o.tx,dist=o.dist,rx=kdNow?Xw[kdF]+(kdF?60:-60):stopX!=null?stopX:mid-(C[0]-tx)/Math.max(1,dist)*150+Math.sin(at*.37)*40;
  const count=!!kdNow||(stopBeat&&at>=stopBeat.at&&res.type==='KO');
  glBody(M,{p:{seed:5,lean:0,hug:0,lunge:0,snap:0,tired:0,bodyHit:0,guardDrop:30,fall:0,wob:0,cel:0,rear:count?[24,-200+Math.abs(Math.sin(at*5.5))*-60]:[18,-130],lead:[22,-135],rearUp:!!count},x0:rx,y0:mat,z0:200,dirX:rx<mid?1:-1,Lz:-1,at,ref:true,K:glRefKit('#d9a066')});
  if(intro)glBody(M,{p:{seed:9,lean:0,hug:0,lunge:0,snap:0,tired:0,bodyHit:0,guardDrop:0,fall:0,wob:0,cel:0,rear:[8,-262+Math.sin(realAt*4)*6],lead:[16,-130],rearUp:true},x0:0,y0:mat,z0:-40,fx:0,fz:-1,sx:1,sz:0,dirX:1,Lz:-1,at,ref:true,K:{...glRefKit('#c68e5d'),shirt:[24,24,28,.2],trunk:[24,24,28,.1],band:[24,24,28,.1],tie:[200,16,46,.3],hair:[28,18,10,.1]}});
  const dyn=G.dyn||(G.dyn={bufs:['aP','aN','aC','aT'].map((a,i)=>[a,gl.createBuffer(),[3,3,4,2][i]])});
  [M.p,M.n,M.c,M.t].forEach((d,i)=>{gl.bindBuffer(gl.ARRAY_BUFFER,dyn.bufs[i][1]);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.DYNAMIC_DRAW)});dyn.n=M.p.length/3;
  draw(dyn,null,false);
  // soft shadows on the canvas
  {const S=glMesh(),disc=(x,z,rx,rz)=>{for(let k=0;k<20;k++){const a=k/20*Math.PI*2,b=(k+1)/20*Math.PI*2,n=[0,1,0];glTri(S,[x,mat+.6,z],[x+Math.cos(b)*rx,mat+.6,z+Math.sin(b)*rz],[x+Math.cos(a)*rx,mat+.6,z+Math.sin(a)*rz],n,n,n,[0,0,0,0])}};
    [0,1].forEach(i=>{const fl=P[i].fall||0,dir=i?-1:1;disc(Xw[i]-dir*fl*70,0,50+fl*70,30)});disc(rx,200,34,22);
    const sb=G.sh||(G.sh={bufs:['aP','aN','aC','aT'].map((a,i)=>[a,gl.createBuffer(),[3,3,4,2][i]])});[S.p,S.n,S.c,S.t].forEach((d,i)=>{gl.bindBuffer(gl.ARRAY_BUFFER,sb.bufs[i][1]);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.DYNAMIC_DRAW)});sb.n=S.p.length/3;
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.uniform1f(loc.uAlpha,.38);draw(sb,null,true);gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1f(loc.uAlpha,1)}
  g.setTransform(1,0,0,1,0,0);g.drawImage(G.cv,0,0,960,540);
  const lamps=[];for(let k=-2;k<=2;k++)for(const z of[-70,70])lamps.push([k*190,552,z]);
  return{hits,lamps}}
