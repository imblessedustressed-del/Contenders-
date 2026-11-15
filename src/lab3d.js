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
function l3triTex(ctx,img,s0,s1,s2,d0,d1,d2){ctx.save();ctx.beginPath();ctx.moveTo(d0[0],d0[1]);ctx.lineTo(d1[0],d1[1]);ctx.lineTo(d2[0],d2[1]);ctx.closePath();ctx.clip();
  const den=(s0[0]*(s2[1]-s1[1])-s1[0]*s2[1]+s2[0]*s1[1]+(s1[0]-s2[0])*s0[1]);if(!den){ctx.restore();return}
  const a=-(s0[1]*(d2[0]-d1[0])-s1[1]*d2[0]+s2[1]*d1[0]+(s1[1]-s2[1])*d0[0])/den,b=(s1[1]*d2[1]+s0[1]*(d1[1]-d2[1])-s2[1]*d1[1]+(s2[1]-s1[1])*d0[1])/den,
    c=(s0[0]*(d2[0]-d1[0])-s1[0]*d2[0]+s2[0]*d1[0]+(s1[0]-s2[0])*d0[0])/den,d=-(s1[0]*d2[1]+s0[0]*(d1[1]-d2[1])-s2[0]*d1[1]+(s2[0]-s1[0])*d0[1])/den,
    e=(s0[0]*(s2[1]*d1[0]-s1[1]*d2[0])+s0[1]*(s1[0]*d2[0]-s2[0]*d1[0])+(s2[0]*s1[1]-s1[0]*s2[1])*d0[0])/den,f=(s0[0]*(s2[1]*d1[1]-s1[1]*d2[1])+s0[1]*(s1[0]*d2[1]-s2[0]*d1[1])+(s2[0]*s1[1]-s1[0]*s2[1])*d0[1])/den;
  ctx.transform(a,b,c,d,e,f);ctx.drawImage(img,0,0);ctx.restore()}
/* a fighter (or the referee) as low-poly parts, posed from the classic arena's 2D pose */
function l3body(F,o){const{p,x0,dirX,Lz,at,col}=o,ref=!!o.ref;
  const bob=Math.sin(at*6.3+p.seed)*3*(1-p.fall)*(p.cel?0:1),lean=p.lean*14+p.hug*16+p.lunge*10-p.snap*10+p.tired*7-p.bodyHit*6,crouch=p.bodyHit*14+p.tired*6;
  const hip=[0,-112+bob*.5+crouch*.5],sh=[[14+lean,-186+bob+crouch],[-12+lean*.8,-189+bob+crouch]],head=[10+lean*1.15-p.snap*16,-214+bob+crouch+p.tired*4+p.bodyHit*8];
  const fk=[26+p.lunge*8,-56],bk=[-26,-54],ff=[34+p.lunge*22,0],bf=[-38,0];
  const guardR=[30+lean,-200+bob+crouch+p.guardDrop],guardL=[46+lean,-206+bob+crouch+p.guardDrop],hR=p.rear||guardR,hL=p.lead||guardL;
  const armR=labIK(sh[1],hR,36,34,p.rearUp),armL=labIK(sh[0],hL,36,34,p.leadUp);
  const fall=p.fall||0,th=-fall*1.42,cs=Math.cos(th),sn=Math.sin(th),wob=Math.sin(at*13)*(p.wob||0)*8;
  const W=(q,z)=>{let x=q[0],y=q[1]+fall*6;const xr=x*cs-y*sn,yr=x*sn+y*cs;x=xr-fall*20;return[x0+wob+dirX*x,-yr,z]};
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
  else{l3box(F,l3add(ch,[dirX*12,-2,0]),[3,4,8],[20,20,20])}
  l3prism(F,nk,W([head[0]-2,head[1]+8],0),7,7,col.skinD,5);
  // head: skin with hair on top, little dark eyes facing forward
  const hc=W(head,0),hairTop=col.hair;l3ball(F,hc,14,17,13.5,n=>n[1]>.45?hairTop:col.skin,undefined,7,5);
  if(!(p.fall>.6||p.wob>.5)&&((at*.8+p.seed)%3.7)>.09){[-5,5].forEach(z=>l3box(F,l3add(hc,[dirX*12.6,1,z]),[2,3,3],[18,10,8]))}
  // arms and gloves (rear first so painter order is right)
  [[sh[1],armR,-1,pe('rear')],[sh[0],armL,1,pe('lead')]].forEach(([S,arm,s,e])=>{const zs=sideZ(s*19),zh=zs*(1-e*.85)+(e?0:sideZ(s*-4)),zm=(zs+zh)/2;
    const A=W(S,zs),E=W(arm[0],zm),Hh=W(arm[1],zh);l3prism(F,A,E,9.5,8,col.armU,6);l3prism(F,E,Hh,8,7,col.arm,6);
    if(ref){l3ball(F,Hh,6,6,6,()=>col.skin,undefined,5,4)}else{l3ball(F,l3add(Hh,[dirX*3,0,0]),14,13,12,()=>col.glove,undefined,7,5);l3prism(F,l3add(Hh,[-dirX*6,0,0]),l3add(Hh,[-dirX*11,0,0]),8,8,col.cuff,6)}});
  return{head:hc,chest:ch,hip:hp}}
function l3col(c,ref){const sk=l3rgb(c.sk),skD=l3rgb(c.skD);
  return ref?{skin:sk,skinD:skD,hair:[110,110,110],torso:[235,235,235],chest:[235,235,235],armU:[235,235,235],arm:sk,trunk:[25,25,25],band:[25,25,25],leg:[30,30,30],legD:[22,22,22],sock:[20,20,20],shoe:[15,15,15],glove:sk,cuff:sk}
  :{skin:sk,skinD:skD,hair:l3rgb(c.hr),torso:sk,chest:sk,armU:sk,arm:sk,trunk:l3rgb(c.tr),band:l3rgb(c.st),leg:sk,legD:skD,sock:[238,238,238],shoe:l3rgb(c.sh==='#f2f2f2'?'#e8e8e8':'#1b1b1b'),glove:l3rgb(c.gl),cuff:[245,245,245]}}
/* the crowd: billboards on three banks of seats */
const L3CROWD=(()=>{const r=LAB_RNG(31),out=[],shirts=['#7a2a2a','#2a3f7a','#2f5d3a','#6b5a2a','#555','#5a2f6b','#8a6d3b','#1f4f5f','#a33','#ddd','#c8b040'],skins=['#e8b98a','#c68e5d','#8d5524','#5c3a1e','#f1c9a5','#a8703f'];
  for(let row=0;row<9;row++){const y=30+row*34,z=520+row*62;for(let x=-980;x<=980;x+=30+r()*10)out.push({p:[x,y,z],sh:l3rgb(shirts[Math.floor(r()*shirts.length)]),sk:l3rgb(skins[Math.floor(r()*skins.length)]),f:r(),sign:row>1&&r()<.03})
    for(const s of[-1,1])for(let zz=-420;zz<=470;zz+=30+r()*10)out.push({p:[s*(560+row*62),y,zz],sh:l3rgb(shirts[Math.floor(r()*shirts.length)]),sk:l3rgb(skins[Math.floor(r()*skins.length)]),f:r(),sign:false})}
  return out})();
function lab3D(g,o){const{at,realAt,P,X,tl,f,res,stopBeat,kdNow,big,zoom,inReplay,intro,fin,cur}=o,L=labState(),W=960,H=540,cx=W/2,S=1.12;
  if(!L3C){L3C=document.createElement('canvas');L3C.width=L3W;L3C.height=L3H}const c=L3C.getContext('2d');c.imageSmoothingEnabled=false;
  const Xw=X.map(x=>(x-cx)/S),mid=(Xw[0]+Xw[1])/2;
  // camera: slow orbit, swoop in during the intro, low and close for the replay, shake on big shots
  const k=intro?Math.min(1,at/(LAB_INTRO-.2)):1,ease=1-(1-k)*(1-k);
  let yaw=Math.sin(realAt*.07)*.38+(1-ease)*1.1,dist=700+(1-ease)*420,hgt=235+(1-ease)*260,tx=mid*.6;
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
  l3box(F,[0,mat/2-6,0],[2*R+40,mat,2*R+40],[18,32,74],1);
  F.push({v:[[-R-20,mat+.5,-R-20],[R+20,mat+.5,-R-20],[R+20,mat+.5,R+20],[-R-20,mat+.5,R+20]],n:[0,1,0],c:[214,220,228],layer:1});
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
  // fighters and referee (moved up onto the mat)
  const lift=v=>[v[0],v[1]+mat,v[2]];const hits=[];
  [0,1].forEach(i=>{const before=F.length,b=l3body(F,{p:P[i],x0:Xw[i],dirX:i?-1:1,Lz:i?1:-1,at,col:l3col(LAB_SKIN[i])});for(let q=before;q<F.length;q++){F[q].v=F[q].v.map(lift);if(F[q].pc)F[q].pc=lift(F[q].pc);F[q].layer=2}
    hits[i]={head:lift(b.head),chest:lift(b.chest),hip:lift(b.hip)}});
  {const kdF=kdNow?1-kdNow.a:null,stopX=stopBeat&&at>=stopBeat.at&&!res.decision?Xw[1-res.w]+(res.w?-70:70):null,rx=kdNow?Xw[kdF]+(kdF?60:-60):stopX!=null?stopX:mid+Math.sin(at*.37)*90;
    const count=!!kdNow||(stopBeat&&at>=stopBeat.at&&res.type==='KO'),rp={seed:5,lean:0,hug:0,lunge:0,snap:0,tired:0,bodyHit:0,guardDrop:30,fall:0,wob:0,cel:0,
      rear:count?[24,-200+Math.abs(Math.sin(at*5.5))*-60]:[18,-130],lead:[22,-135],rearUp:!!count};
    const before=F.length;l3body(F,{p:rp,x0:rx,dirX:rx<mid?1:-1,Lz:-1,at,col:l3col({sk:'#d9a066',skD:'#a8714a'},true),ref:true});
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
    out.push({pv,z,col,layer:fc.layer||0})}
  out.sort((a,b)=>a.layer-b.layer||b.z-a.z);
  let crowdDone=false;
  const crowd=()=>{crowdDone=true;const fl=tl.beats.some(b=>['kd','ko','st'].includes(b.k)&&at>=b.at&&at-b.at<1.3)||fin;
    const cs=L3CROWD.map(q=>{const jump=fl?Math.abs(Math.sin(realAt*10+q.f*20))*7:Math.sin(realAt*2+q.f*9)*1.5;const pp=proj([q.p[0],q.p[1]+18+jump,q.p[2]]);return pp?{q,pp}:null}).filter(Boolean).sort((a,b)=>b.pp[2]-a.pp[2]);
    cs.forEach(({q,pp})=>{const sc=foc/pp[2],fog=Math.max(0,Math.min(.8,(pp[2]-900)/1500)),mix=(cc,s)=>`rgb(${cc.map((x,j)=>Math.round(x*s*(1-fog)+L3FOG[j]*fog)).join(',')})`;
      const bw=Math.max(1,Math.round(22*sc)),bh=Math.max(1,Math.round(22*sc)),hd=Math.max(1,Math.round(11*sc));
      c.fillStyle=mix(q.sh,.75);c.fillRect(pp[0]-bw/2|0,pp[1]-bh/2|0,bw,bh);c.fillStyle=mix(q.sk,.85);c.fillRect(pp[0]-hd/2|0,pp[1]-bh/2-hd|0,hd,hd);
      if(q.sign){c.fillStyle=mix([250,250,240],1);c.fillRect(pp[0]-bw|0,pp[1]-bh/2-hd*2.6|0,bw*2,hd*1.4)}
      if(fl&&q.f<.04&&Math.sin(realAt*30+q.f*99)>.7){c.fillStyle='#fff';c.fillRect(pp[0]|0,pp[1]-bh|0,2,2)}})};
  const poly=fc=>{c.fillStyle=`rgb(${fc.col.join(',')})`;c.strokeStyle=c.fillStyle;c.lineWidth=.6;c.beginPath();c.moveTo(fc.pv[0][0],fc.pv[0][1]);for(let q=1;q<fc.pv.length;q++)c.lineTo(fc.pv[q][0],fc.pv[q][1]);c.closePath();c.fill();c.stroke()};
  for(const fc of out){if(fc.layer>1)break;if(!crowdDone&&fc.layer>0)crowd();poly(fc)}
  if(!crowdDone)crowd();
  // warped (affine) textures: the mat logo goes down before the fighters, the scoreboard face after
  const logo=l3tex('logo',256,64,(t,w,h)=>{t.font="italic 900 46px Impact, 'Arial Black', sans-serif";t.textAlign='center';t.fillStyle='rgba(170,14,32,.55)';t.fillText('CONTENDERS',w/2,48)});
  const quad=(img,pts)=>{const pp=pts.map(proj);if(pp.some(q=>!q))return;const iw=img.width,ih=img.height;l3triTex(c,img,[0,0],[iw,0],[iw,ih],pp[0],pp[1],pp[2]);l3triTex(c,img,[0,0],[iw,ih],[0,ih],pp[0],pp[2],pp[3])};
  quad(logo,[[-190,mat+1,60],[190,mat+1,60],[190,mat+1,-60],[-190,mat+1,-60]]);
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
