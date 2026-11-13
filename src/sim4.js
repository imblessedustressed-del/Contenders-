/* ================= SIM ENGINE (round-based, WeBL-style math) ================= */
const rand=Math.random;
const pick=a=>a[Math.floor(rand()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function gauss(){let u=0,v=0;while(!u)u=rand();while(!v)v=rand();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function lastName(n){const p=(n||'').trim().split(/\s+/);return p[p.length-1]||'Fighter'}
const fmt=s=>`${Math.floor(s/60)}:${String(Math.round(s)%60).padStart(2,'0')}`;
const escS=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const an=w=>(/^[aeiou]/i.test(w)?'an ':'a ')+w;
const PW=['hook','uppercut','roundhouse','overhand right','left hook','short uppercut','sweeping right'];
const RT=['straight right','cross','right hand','straight right'];
const TGT_H=['jaw','face','eye','nose','temple','head','chin'];
const TGT_B=['stomach','ribs','solar plexus','body','midsection','kidney'];
const NUMS=['ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN'];
const INJ_LOCS=[['cut','above right eye',1],['cut','above left eye',1],['cut','below right eye',1],['cut','below left eye',1],['swell','right eye',2],['swell','left eye',2],['nose','nose',1],['jaw','jaw',1]];
const CUTRES={1:1.5,2:1,3:.5};
const K_RATING=12;
/* Simulator update 2 (owner-approved Nov 12, 2026): balanced so every style has a chance (engine tests: each type wins about 36-45%
   against the others, the rest draws); heavyweights capped at 6'9" and 280 lb ("Tyson Fury rule"); WeBL's heavyweight edges replaced. */
const BAL={counterDiv:6,counterStr:0,counterAgg:.8,counterFloor:.5,alloutGive:2,alloutTake:2.75,kpMul:3.75,wtPct:10,giantPer10:.5,smallMan:false,ringBase:1.75,ringFat:.4,clinchBase:1.75,clinchAggLoss:.12,insideBase:1};

function newSev(){const r=rand();return r<2/3?1:r<8/9?2:r<26/27?3:4}
function promote(l){if(l>=3)return 4;if(l===2)return rand()<2/3?3:4;const r=rand();return r<2/3?2:r<8/9?3:4}
function injEnd(i){if(i.type==='cut')return i.lvl;if(i.type==='nose')return i.lvl>=2?i.lvl:0;if(i.type==='jaw')return i.lvl>=4?10:0;return 0}
function injText(i){
  if(i.type==='cut')return`${['','a minor cut','a cut','a serious cut','a gash'][i.lvl]} ${i.loc.startsWith('below')?'under his '+i.loc.slice(6):'over his '+i.loc.replace(/^above /,'')}`;
  if(i.type==='swell')return['',`swelling around his ${i.loc}`,`his ${i.loc} swelling badly`,`his ${i.loc} badly swollen`,`his ${i.loc} swollen shut`][i.lvl];
  if(i.type==='nose')return['','a bloody nose','a fractured nose','a fractured nose','a broken nose'][i.lvl];
  return['','a bloody lip','a bloody mouth','a broken tooth','a broken jaw'][i.lvl];
}
function prep(F,c){
  let str=F.str,kp=F.kp;const cap=Math.floor(str/3);if(kp>cap){str+=kp-cap;kp=cap}
  let parsed;try{parsed=parsePlan(typeof F.plan==='string'?F.plan:'6/6/8')}catch(e){parsed={stmts:[],errors:[]}}
  const pm=F.primeMul||1;
  return{F,c,n:escS(lastName(F.name)),str:str*pm,kp,spd:F.spd*pm,agl:F.agl*pm,chn:F.chn,cnd:F.cnd,hgt:F.hgt,cutres:F.cut,E0:10*F.cnd,E:10*F.cnd*(F.endMul||1),inj:[],fw:F.fightW||0,
    parsed,perc:0,won:0,lost:0,stuns:0,kds:0,warn:0,endFrac:1,ipDmg:0,
    fights:(F.rec||[0,0,0]).slice(0,3).reduce((a,b)=>a+b,0),
    giant:BAL.giantPer10&&(F.divLim||0)>=200&&(F.minW||0)>200?((F.minW-200)/10)*BAL.giantPer10:0};
}
const oppState=f=>f>=2/3?0:f>=1/3?1:2;
function ctxFor(S,i,r){const x=S[i],y=S[1-i];
  const cuts=z=>z.inj.reduce((a,j)=>a+j.lvl,0);
  return{endurance:Math.round(x.E),endurance_percent:Math.round(100*x.E/x.E0),score:x.perc,round:r,roundswon:x.won,roundslost:x.lost,
    decision_won:x.won>=7,decision_lost:x.lost>=7,opponent:oppState(y.endFrac),mycuts:cuts(x),hiscuts:cuts(y),mystuns:x.stuns,hisstuns:y.stuns,
    myknockdowns:x.kds,hisknockdowns:y.kds,warnings:x.warn,opptiring:y.E/y.E0<.5};
}

function simulate(FA,FB,rounds){
  const S=[prep(FA,'red'),prep(FB,'blue')];
  const out={rounds:[],result:null,S};
  /* weight advantage: heavier man gets +1 STR per 5% (fractions kept), nothing above 300 lb */
  if(S[0].fw&&S[1].fw){const w0=Math.min(300,S[0].fw),w1=Math.min(300,S[1].fw),h=w0>=w1?0:1,lo=Math.min(w0,w1);if(lo>0&&w0!==w1)S[h].str+=(Math.abs(w0-w1)/lo*100)/BAL.wtPct}
  /* heavyweight small-man edge (owner rule, Nov 9, 2026): the shorter man gets +0.5 SPD per inch, the lighter man +1 AGL per 5% (300 lb cap) */
  if(BAL.smallMan&&(FA.divLim||0)>=1000){const hd=S[0].hgt-S[1].hgt;if(hd)S[hd>0?1:0].spd+=Math.abs(hd)*.5;
    if(S[0].fw&&S[1].fw){const w0=Math.min(300,S[0].fw),w1=Math.min(300,S[1].fw),lo=Math.min(w0,w1);if(lo>0&&w0!==w1)S[w0<w1?0:1].agl+=(Math.abs(w0-w1)/lo*100)/5}}
  /* Bare Knuckles region (both fighters BK): 25 rounds, 5% recovery, no doctor, eyes shut = forced clinch, decided by knockdowns then stuns */
  const BK=!!(FA.bk&&FB.bk);out.bk=BK;S.forEach(x=>x.ded=0);
  const run=[0,0];
  for(let r=1;r<=rounds&&!out.result;r++){
    const CH=S.map((x,i)=>choosePlan(x.parsed,ctxFor(S,i,r)));
    const P=CH.map(c=>({...c.tactic}));
    const forced=[0,1].map(i=>BK&&S[i].inj.filter(z=>z.type==='swell'&&z.lvl>=4).length>=2);
    forced.forEach((f,i)=>{if(f)P[i].style='clinch'});
    const R={n:r,lines:[],cards:[],post:[],pre:[]};
    S.forEach((x,i)=>{x.msgs=CH[i].msgs});
    /* towel */
    let ended=null;
    for(let i=0;i<2&&!ended;i++)if(CH[i].towel&&S[i].E/S[i].E0<.5){ended={type:'TKO',w:1-i,why:`${S[i].n}'s corner threw in the towel`,t:0,towel:true}}
    /* --- energy points and styles (AGG penalties use opponent's AGG before penalty) --- */
    const eff=P.map(p=>({...p,dmgMul:1,recvMul:1,fat:0,rest:Math.max(0,20-p.agg-p.pow-p.def),notes:[]}));
    const base=S.map(x=>({str:x.str,spd:x.spd,agl:x.agl}));
    const A=base.map(b=>({...b}));
    for(let i=0;i<2;i++){const j=1-i,me=P[i],op=P[j],e=eff[i],o=eff[j],b=base[i],ob=base[j],a=A[i],oa=A[j];
      switch(me.style){
        case'inside':a.str+=BAL.insideBase+Math.max(0,b.str-ob.str)/2;o.dmgMul*=1.1;e.notes.push('His STR is increased by fighting inside.');break;
        case'clinch':{a.agl+=BAL.clinchBase+(b.str>ob.str?(b.str-ob.str)/2:0);const lost=Math.min(e.agg,BAL.clinchAggLoss*op.agg);e.agg-=lost;e.rest+=lost;e.notes.push('His AGG is reduced by clinching.');break}
        case'feint':a.spd+=1+Math.max(0,b.spd-ob.spd)/2;e.fat+=1;e.notes.push('His SPD is increased by feinting.');break;
        case'counter':{a.str+=BAL.counterStr;const adv=(b.spd+S[i].hgt)-(ob.spd+S[j].hgt),q=BAL.counterDiv;
          if(adv>0){a.agl+=adv/q;oa.agl=Math.max(ob.agl*BAL.counterFloor,oa.agl-adv/q)}else if(adv<0){oa.agl+=-adv/q;a.agl=Math.max(b.agl*BAL.counterFloor,a.agl-(-adv)/q);e.notes.push('His counter-punching backfires!')}
          e.agg*=BAL.counterAgg;e.notes.push('His AGG is reduced by counter-punching.');break}
        case'ring':a.agl+=BAL.ringBase+Math.max(0,b.agl-ob.agl)/2;e.fat+=BAL.ringFat;e.notes.push('His AGL is increased by using the ring.');break;
        case'ropes':if(b.agl>ob.agl&&ob.agl>8)oa.agl=Math.max(8,oa.agl-(2/3)*(b.agl-ob.agl));a.agl-=1;e.notes.push('He is laying on the ropes.');break;
        case'outside':a.agl+=.5;a.spd+=.5;e.pow*=.85;e.notes.push('His POW is reduced by fighting outside.');break;
        case'allout':e.dmgMul*=BAL.alloutGive;o.dmgMul*=BAL.alloutTake;e.notes.push('He is punching all out!');break;
      }
    }
    /* dirty fighting */
    for(let i=0;i<2&&!ended;i++){const e=eff[i];if(!e.dirty)continue;
      e.dmgMul*=1.1;
      if(rand()<.5){S[i].warn++;e.dmgMul*=1.05/1.1;R.pre.push(`<p>The referee warns ${S[i].n} for fighting dirty.</p>`);
        if(S[i].warn>=2){e.deduct=(e.deduct||0)+1;R.pre.push(`<p class="r">${S[i].n} has a point deducted!</p>`)}
        if(rand()<.05*Math.pow(2,S[i].warn-1)){ended={type:'DQ',w:1-i,why:`${S[i].n} was disqualified for fouling`,t:30+rand()*140,dq:true}}}
    }
    for(let i=0;i<2;i++)if(!eff[i].dirty&&rand()<.01){S[i].warn++;R.pre.push(`<p>The referee warns ${S[i].n} for an accidental low blow.</p>`)}
    const A2=A.map(a=>({...a}));
    const hd=S[0].hgt-S[1].hgt;
    if(hd!==0){const t=hd>0?0:1,bonus=Math.abs(hd)*(P[t].style==='outside'?.75:.5);A2[t].spd+=bonus;A2[t].agl+=bonus}
    A2.forEach((a,i)=>{const x=S[i];a.pen={spd:0,agl:0,fat:0};
      for(const j of x.inj){
        if(j.type==='cut'&&/eye/.test(j.loc))a.pen.spd+=.5*j.lvl;
        if(j.type==='cut'&&j.lvl===3)a.pen.agl+=.5;if(j.type==='cut'&&j.lvl===4)a.pen.agl+=1;
        if(j.type==='swell'&&j.lvl>=2){a.pen.spd+=.5*j.lvl;a.pen.agl+=.5*j.lvl}
        if(j.type==='nose')a.pen.fat+=1;
      }
      const N=eff[i].agg+.5*eff[i].pow,imm=Math.max(0,N-x.cnd);a.imm=imm;
      const f=clamp((x.E-imm)/x.E0,.05,1);a.f=f;
      a.str=Math.max(1,a.str*f);a.spd=Math.max(1,a.spd*f-a.pen.spd);a.agl=Math.max(1,a.agl*f-a.pen.agl);
    });
    A.splice(0,2,...A2);
    R.plans=S.map((x,i)=>planLine(x,P[i]));
    R.mgr=S.map((x,i)=>`${forced[i]?'Both eyes are swollen shut, so he can only clinch. ':''}${x.n} has ${x.E.toFixed(1)} endurance points remaining.<br>Tactics: aggressiveness = ${eff[i].agg.toFixed(1)}, power = ${eff[i].pow.toFixed(1)}, defense = ${eff[i].def.toFixed(1)}, resting ${eff[i].rest.toFixed(1)}${P[i].tgt!=='Opp'?`, target ${P[i].tgt.toLowerCase()}`:''}${P[i].dirty?', fighting dirty':''}${eff[i].notes.length?'<br>'+eff[i].notes.join(' '):''}`);
    R.say=S.map(x=>x.msgs.say||'');
    if(ended&&(ended.towel)){R.lines=[{t:0,html:`<p class="r b">${escS(ended.why)}!!</p>`}];R.st=[0,1].map(()=>({pt:0,pl:0,rt:0,rl:0,jt:0,jl:0,kd:0,stun:0}));out.result={...ended,round:r};R.cond=S.map(x=>condText(x));out.rounds.push(R);break}
    const luck=[0,1].map(()=>.8+.4*(rand()+rand())/2);
    const thrMul=[1,1],lkMul=[1,1];
    const calc=()=>[0,1].map(i=>{
      const j=1-i,e=eff[i],a=A[i],o=A[j],od=Math.max(1,eff[j].def);
      const agg=Math.max(1,e.agg*thrMul[i]),pow=Math.max(1,e.pow),lk=luck[i]*lkMul[i];
      const off=Math.sqrt(agg*a.spd)*pow*e.dmgMul*lk;
      const raw=a.str*off/(od*o.agl);
      const tE={Head:.8,Body:1.2,Cut:.9,Opp:1}[e.tgt],tS={Head:1.2,Body:.8,Cut:.9,Opp:1}[e.tgt];
      const sDef=Math.max(1,o.agl+(S[j].chn-10)*(o.f||1));
      const stun=(a.str+BAL.kpMul*S[i].kp)*off/(od*sDef)*tS;
      return{base:raw/lk/e.dmgMul,end:raw*tE,stun,ratio:stun/S[j].chn,agg,lk};
    });
    let D=calc();
    const stunsOf=ratio=>ratio>=2.5?99:ratio>=2.4?4:ratio>=2.25?3:ratio>=2?2:ratio>=1.5?1:0;
    let st=D.map(d=>stunsOf(d.ratio));
    if(st[0]||st[1]){const hurt=D[0].ratio>D[1].ratio?1:0;thrMul[hurt]=.75;lkMul[hurt]=.75;D=calc();st=D.map(d=>stunsOf(d.ratio))}
    /* --- punches --- */
    const PU=[0,1].map(i=>{
      const j=1-i,e=eff[i],a=A[i],o=A[j];
      const thrown=Math.max(3,Math.round(9*D[i].agg*(.9+.2*rand())));
      const k=S[0].F.k||K_RATING,denom=x=>x*x/(x*x+k*Math.sqrt(k*o.agl));
      let mult=15/(Math.max(1,eff[i].def)+Math.max(1,eff[j].def));
      const adj=pc=>{let p=pc*mult;const lk=D[i].lk;p=lk<1?p*lk:p+(1-p)*(lk-1);p*=({Head:.8,Body:.8,Cut:.9,Opp:1}[e.tgt]);return clamp(p,.02,.95)};
      const pP=adj(denom(a.spd)),pJ=adj(denom(a.spd*1.5));
      const pt=Math.min(thrown,Math.max(0,Math.round(3*e.pow+gauss())));const rt=Math.min(thrown-pt,Math.max(0,Math.round(3*e.pow+gauss())));const jt=thrown-pt-rt;
      const land=(n,p)=>clamp(Math.round(n*p+gauss()*Math.sqrt(n*p*(1-p))),0,n);
      return{pt,pl:land(pt,pP),rt,rl:land(rt,pP),jt,jl:land(jt,pJ)};
    });
    /* --- endurance damage, injuries, fatigue --- */
    const injNews=[[],[]];
    for(let i=0;i<2;i++){const j=1-i,X=S[i],Y=S[j],e=eff[i];
      Y.E-=D[i].end;Y.ipDmg+=D[i].base;
      let p=Math.pow(D[i].base,2)/10/100*(1+.005*Y.fights);
      p*=e.tgt==='Head'||e.tgt==='Cut'?1.5:e.tgt==='Body'?.25:1;p*=CUTRES[Y.cutres]||1;p=Math.min(.5,p);
      for(const ex of Y.inj.slice()){
        if(rand()<p*(e.tgt==='Cut'?1.5:1)){
          if(rand()<.5){const old=ex.lvl;ex.lvl=ex.type==='swell'?Math.min(old<3?old+1:(rand()<.25?4:3),4):promote(old)}
          const ed=injEnd(ex);Y.E-=ed;ex.dmg+=ed;injNews[j].push({inj:ex,agg:true});
          if(ex.type==='jaw'&&ex.lvl>=4&&ex.wasBroken&&!ended)ended={type:'TKO',w:i,why:'his jaw is broken',t:120+rand()*60};
          if(ex.type==='jaw'&&ex.lvl>=4)ex.wasBroken=true;
        }
      }
      let guard=0;
      while(rand()<p&&guard++<6){
        const tot=INJ_LOCS.reduce((s,l)=>s+l[2],0);let q=rand()*tot,L=INJ_LOCS[0];for(const l of INJ_LOCS){q-=l[2];if(q<=0){L=l;break}}
        const ex=Y.inj.find(z=>z.type===L[0]&&z.loc===L[1]);
        if(ex){if(rand()<.5)ex.lvl=ex.type==='swell'?Math.min(ex.lvl+1,4):promote(ex.lvl);const ed=injEnd(ex);Y.E-=ed;ex.dmg+=ed;injNews[j].push({inj:ex,agg:true})}
        else{const z={type:L[0],loc:L[1],lvl:L[0]==='swell'?1:newSev(),dmg:0};const ed=injEnd(z);Y.E-=ed;z.dmg=ed;if(z.type==='jaw'&&z.lvl>=4)z.wasBroken=true;Y.inj.push(z);injNews[j].push({inj:z,agg:false})}
      }
    }
    for(let i=0;i<2;i++){const X=S[i],e=eff[i];
      const fat=e.agg+.5*e.pow+e.fat+A[i].pen.fat+X.giant;X.E-=Math.max(0,fat-X.cnd/2)}
    /* --- stoppages --- */
    const ko=[0,1].filter(i=>st[i]>=99);
    if(!ended&&ko.length){const w=ko.length===2?(D[0].ratio>=D[1].ratio?0:1):ko[0];const rr=D[w].ratio/2.5;ended={type:'KO',w,why:'counted out',t:clamp(180*rand()/rr,8,178)}}
    const kd=st.map(s=>s>=99?0:Math.floor(s/2)),sl=st.map(s=>s>=99?0:s%2);
    if(!ended){for(let i=0;i<2;i++){if(st[i]-st[1-i]>=6||kd[i]-kd[1-i]>=3)ended={type:'TKO',w:i,why:'the referee stopped it',t:60+rand()*115}}}
    if(!ended){const z=[0,1].filter(i=>S[i].E<=0);if(z.length){const lo=z.length===2?(S[0].E<S[1].E?0:1):z[0];ended={type:'TKO',w:1-lo,why:`${S[lo].n} was too exhausted to continue`,t:90+rand()*85}}}
    /* --- play-by-play --- */
    S[0].stuns+=st[1]>=99?0:st[1];S[1].stuns+=st[0]>=99?0:st[0];S[0].kds+=kd[1];S[1].kds+=kd[0];
    R.lines=pbp(S,PU,eff,st,kd,injNews,ended);
    R.st=PU.map((p,i)=>({...p,kd:kd[i],stun:sl[i]}));
    if(ended){out.result={...ended,round:r}}
    else{
      /* judging */
      R.cards=[0,1,2].map(()=>scoreRound(st,kd,sl,PU,D));
      for(let i=0;i<2;i++){if(P[i].style==='clinch'&&P[i].def>10&&rand()<Math.pow(P[i].def-10,2)/100){R.cards.forEach(c=>c[i]--);S[i].ded++;R.post.push(`<p class="r">${S[i].n} is penalized a point for refusing to break the clinch.</p>`)}
        if(eff[i].deduct){R.cards.forEach(c=>c[i]-=eff[i].deduct);S[i].ded+=eff[i].deduct}}
      for(let i=0;i<2;i++){const jv=R.cards[Math.floor(rand()*3)];S[i].perc+=jv[i]-jv[1-i];
        if(R.cards.every(c=>c[i]>c[1-i]))S[i].won++;if(R.cards.every(c=>c[i]<c[1-i]))S[i].lost++}
      const k=R.cards.map(c=>c.join('-'));const mode=k.find(x=>k.filter(y=>y===x).length>1)||k[0];
      R.cc=mode.split('-').map(Number);run[0]+=R.cc[0];run[1]+=R.cc[1];R.run=[...run];
      if(r<rounds&&!BK){
        for(let i=0;i<2&&!ended;i++){const x=S[i];
          const bad=x.inj.find(z=>(z.lvl>=3&&z.dmg>=7)||(z.lvl>=4&&z.dmg>=6));
          const shut=x.inj.filter(z=>z.type==='swell'&&z.lvl>=4).length>=2;
          if(bad||shut){ended={type:'TKO',w:1-i,why:'the ringside doctor stopped it',t:180};R.post.push(`<p class="r b">The ringside doctor examines ${x.n} and stops the fight because of ${shut?'his eyes being swollen shut':injText(bad)}!!</p>`)}
        }
        if(ended)out.result={...ended,round:r};
      }
    }
    R.cond=S.map(x=>condText(x));
    /* recovery */
    S.forEach((x,i)=>{x.endFrac=x.E/x.E0;const lost=x.E0-x.E;x.E=Math.min(x.E0,x.E+(BK?.05:.1)*lost+.02*eff[i].rest*lost)});
    out.rounds.push(R);
  }
  const tot=[0,1,2].map(j=>out.rounds.reduce((s,R)=>R.cards.length?[s[0]+R.cards[j][0],s[1]+R.cards[j][1]]:s,[0,0]));
  out.totals=tot;
  if(!out.result&&BK){
    /* knockdowns each man scored (a point deducted from his opponent counts as one), then stuns */
    const kd=[0,1].map(i=>S[1-i].kds+S[1-i].ded),sn=[0,1].map(i=>S[1-i].stuns);out.bkScore={kd,stuns:sn};
    const type=kd[0]!==kd[1]?'Knockdown Decision':sn[0]!==sn[1]?'Stun Decision':'Draw';
    out.result={type,w:type==='Draw'?null:kd[0]!==kd[1]?(kd[0]>kd[1]?0:1):(sn[0]>sn[1]?0:1),round:rounds,t:180,decision:true};
  }
  if(!out.result){
    let wa=0,wb=0,dr=0;tot.forEach(t=>t[0]>t[1]?wa++:t[1]>t[0]?wb++:dr++);
    let type;
    if(wa===3||wb===3)type='Unanimous Decision';
    else if((wa===2&&wb===1)||(wb===2&&wa===1))type='Split Decision';
    else if((wa===2||wb===2)&&dr===1)type='Majority Decision';
    else if(dr>=2)type='Majority Draw';else type='Split Draw';
    out.result={type,w:type.includes('Draw')?null:wa>wb?0:1,round:rounds,t:180,decision:true};
  }
  out.final=S.map(x=>condText(x,true));
  out.ip=S.map((x,i)=>out.result.type==='KO'&&out.result.w===1-i?10:Math.max(0,Math.round(x.ipDmg-5*x.chn)));
  return out;
}
function scoreRound(st,kd,sl,PU,D){
  let w;
  if(st[0]!==st[1])w=st[0]>st[1]?0:1;
  else{
    const sc=PU.map(p=>(p.pl*2+p.rl*1.5+p.jl)*(1+gauss()*.08));
    if(Math.abs(sc[0]-sc[1])/Math.max(1,sc[0],sc[1])<.05){sc[0]*=1+.01*(D[0].end+D[0].stun)/2;sc[1]*=1+.01*(D[1].end+D[1].stun)/2}
    if(Math.abs(sc[0]-sc[1])<.1)return[10,10];
    w=sc[0]>sc[1]?0:1;
  }
  const l=1-w,lw=PU[w].pl+PU[w].rl+PU[w].jl,ll=PU[l].pl+PU[l].rl+PU[l].jl;
  /* st[i] = stuns inflicted by fighter i */
  let wH=2*kd[w]+sl[w],lH=2*kd[l]+sl[l];
  if(lw>=4*Math.max(1,ll))wH++;if(ll>=4*Math.max(1,lw))lH++;
  const extra=Math.floor(Math.max(0,wH-lH)/2);
  const c=[0,0];c[w]=10;c[l]=Math.max(7,9-extra);return c;
}
function planLine(x,p){
  const st={inside:'is fighting inside (inside)',counter:pick(['is counter-punching (counter-punching)','waits for his opponent to make the first move (counter-punching)']),clinch:'is clinching a lot (clinching)',
    ring:'is moving around the ring (ring)',feint:'is feinting a lot (feinting)',ropes:'is laying on the ropes (ropes)',outside:'is boxing from the outside (outside)',allout:'is punching all out (all-out)'}[p.style]
    ||(p.agg>=9?'is very aggressive':p.def>=12?'is fighting defensively':p.pow>=9?'is loading up on power punches':'is boxing carefully');
  const tg={Head:" and he's head hunting",Body:' and goes to the body',Cut:' and goes after the cut',Opp:''}[p.tgt];
  return`${x.n} ${st}${tg}.${p.dirty?' He is fighting dirty!':''}`;
}
function pbp(S,PU,eff,st,kd,injNews,ended){
  const evs=[],end=ended?ended.t:180;
  const at=()=>Math.floor(rand()*end);
  for(let i=0;i<2;i++){const X=S[i],Y=S[1-i],p=PU[i],e=eff[i],o=eff[1-i];
    const tg=()=>e.tgt==='Body'||(e.tgt==='Opp'&&rand()<.35)?pick(TGT_B):pick(TGT_H);
    for(let k=0;k<p.pl;k++){const pd=`${pick(PW)} to the ${tg()}`;evs.push({t:at(),html:rand()<.25?`<b>${X.n} hammers ${Y.n} with a nasty ${pd}!</b>`:pick([`<b>${X.n} lands ${an(pd)}.</b>`,`<b>${X.n} connects with ${an(pd)}.</b>`,`<b>${X.n} scores with ${an(pd)}.</b>`])})}
    for(let k=0;k<p.rl;k++){const pd=`${pick(RT)} to the ${tg()}`;evs.push({t:at(),html:pick([`<b>${X.n} lands ${an(pd)}.</b>`,`<b>${X.n} gets through with ${an(pd)}.</b>`])+(rand()<.3?` ${Y.n} walks through it.`+(Y.msgs&&Y.msgs.sneer?` ${Y.n} sneers, "${escS(Y.msgs.sneer)}"`:''):'')})}
    for(let k=0;k<p.jl;k++)if(rand()<.3)evs.push({t:at(),html:pick([`<b>${X.n} snaps a jab into ${Y.n}'s face.</b>`,`<b>${X.n} pops ${Y.n} with a stiff jab.</b>`,`<b>${X.n} lands a sharp jab.</b>`])});
    const miss=(p.pt-p.pl)+(p.rt-p.rl);
    for(let k=0;k<miss;k++)if(rand()<.3){const pd=`${pick(rand()<.5?PW:RT)} to the ${tg()}`;
      if(o.style==='clinch'&&rand()<.5)evs.push({t:at(),html:pick([`${X.n} tries to attack, but ${Y.n} ties him up until the referee separates them.`,`${X.n} throws ${an(pd)}, but ${Y.n} grabs on until the referee breaks them up.`])});
      else if(o.style==='counter'&&rand()<.4){const cd=`${pick(RT)} to the ${pick(TGT_H)}`;evs.push({t:at(),html:`${X.n} throws ${an(pd)} but <b>${Y.n} slips it and fires back with ${an(cd)}.</b>`})}
      else evs.push({t:at(),html:pick([`${X.n} throws ${an(pd)}, but ${Y.n} slips it.`,`${X.n} reaches with ${an(pd)}, but it falls short.`,`${X.n} tries ${an(pd)}, but it's blocked.`,`${X.n} swings ${an(pd)} and misses badly.`,`${X.n} launches ${an(pd)}, but there's nothing on it.`])})}
    for(const n of injNews[1-i]){evs.push({t:at(),html:`<span class="r">${n.agg?`The damage gets worse: ${Y.n} now has ${injText(n.inj)}!`:`${Y.n} now has ${injText(n.inj)}!`}</span>`})}
    /* stuns suffered by Y come from X's damage: st[1-i] */
    const sY=st[i];
    if(sY>0&&sY<99){
      for(let k=0;k<kd[i];k++){const n=3+Math.floor(rand()*6);evs.push({t:at(),html:`<p class="r b">${X.n} lands a tremendous ${pick(PW)} to the head and ${Y.n} goes down!!</p>${NUMS.slice(0,n).map(w=>`<p class="r">${w}!</p>`).join('')}<p>${Y.n} is back on his feet at ${n}.</p>${X.msgs&&X.msgs.taunt?`<p>${X.n} taunts, "${escS(X.msgs.taunt)}"</p>`:''}`})}
      if(sY%2)evs.push({t:at(),html:`<b>${X.n} wallops ${Y.n} with a big ${pick(PW)} to the ${pick(TGT_H)}!! The crowd is on its feet!!</b> <span class="r">${Y.n} ${pick(['staggers into the ropes!!','is wobbled!!','is badly hurt!!'])}</span>`});
    }
  }
  evs.sort((a,b)=>a.t-b.t);
  if(ended){const W=S[ended.w],L=S[1-ended.w];
    if(ended.type==='KO')evs.push({t:ended.t,html:`<p class="r b">${W.n} lands a tremendous ${pick(['right','left hook','uppercut','overhand right'])} blow to the head and ${L.n} collapses!!</p>${NUMS.map(w=>`<p class="r">${w}!</p>`).join('')}<p class="r b">He's out!!!</p>${W.msgs&&W.msgs.gloat?`<p>${W.n} gloats, "${escS(W.msgs.gloat)}"</p>`:''}`});
    else if(ended.why==='the referee stopped it')evs.push({t:ended.t,html:`<p class="r b">${L.n} is taking a beating and the referee steps in to stop it!!</p>${W.msgs&&W.msgs.tko?`<p>${W.n}: "${escS(W.msgs.tko)}"</p>`:''}`});
    else if(ended.dq)evs.push({t:ended.t,html:`<p class="r b">The referee has seen enough fouling. ${L.n} is disqualified!!</p>`});
    else if(/exhausted/.test(ended.why))evs.push({t:ended.t,html:`<p class="r b">${L.n} can barely lift his arms. He's too exhausted to go on and the referee waves it off!!</p>`});
    else evs.push({t:ended.t,html:`<p class="r b">The referee stops the fight! ${escS(ended.why)}.</p>`});
  }
  /* idle gaps */
  const lines=[];let last=0;
  for(const e of evs){const gap=e.t-last;for(let g=8;g<gap;g+=10)lines.push({t:last+g,html:null});lines.push(e);last=e.t}
  if(!ended)for(let g=last+8;g<180;g+=10)lines.push({t:g,html:null});
  return lines;
}
function condText(x,after){
  const f=x.E/x.E0,parts=[];
  /* between-round corner report: endurance left = share of STR/SPD/AGL left */
  if(!after)parts.push(f>.8?"is fresh and doesn't need a breather.":f>.6?'stays on his feet in the corner while his trainer towels him off.':f>.4?'takes a swig of water and drops onto his stool.':f>.25?'is clearly running on fumes.':'slumps on his stool while his corner works to keep him going.');
  const inj=x.inj.filter(i=>i.lvl>0).map(injText);
  if(inj.length)parts.push('He has '+inj.join(', ')+'.');
  return parts.join(' ');
}
