/* ---------- Simbot AI (owner, Nov 15, 2026: "an AI simbot for times no one is in the chat... lure the person in... make a fighter and plan so he can watch a fight"; "free") ----------
   A free, rule-based host. Everything it says is built in this page from our own rules; nothing is sent anywhere.
   Its messages live only on this device ("Only you can see this"), like a Discord app's replies.
   "Fight me" = a real Simbot Challenge (simbot-match action vsbot) against a starter fighter Simbot picks. */
const AI_BOT='Simbot (AI)';
let AI={msgs:[],greeted:false},aiPre=null,aiWatchT=null;
const aiRand=a=>a[Math.floor(Math.random()*a.length)];
const aiSeen=()=>{try{return!!localStorage.getItem('contenders_ai_seen')}catch(e){return true}};
const aiMarkSeen=()=>{try{localStorage.setItem('contenders_ai_seen','1')}catch(e){}};
const aiWho=()=>ME&&managers[ME]?managers[ME].gym:(labNick()||'');
function aiChipsHTML(chips){return chips&&chips.length?`<div class="aiChips">${chips.map(([l,a])=>a.startsWith('go:')?`<a class="aiChip" data-go="${esc(a.slice(3))}">${l}</a>`:`<button class="aiChip" data-ai="${esc(a)}">${l}</button>`).join('')}</div>`:''}
/* a message card (used under the fight and on challenge pages) */
function aiCard(html,chips){return`<div class="aiCard"><div class="dcAv aiAv">🤖</div><div class="aiBody"><div><span class="aiName">Simbot AI</span><span class="dcTag">BOT</span></div><div class="aiText">${html}</div>${aiChipsHTML(chips)}</div></div>`}
/* Simbot AI's own pop-up window (the Discord-style Simbot Chat is left exactly as it is; owner, Nov 15: "the discord chat part is perfect don't change") */
function aiItemHTML(x){if(x.me)return`<div class="aiMe"><span>${esc(x.text)}</span></div>`;
  return`<div class="aiMsg"><div class="dcAv aiAv">🤖</div><div class="aiBody"><div class="aiText">${x.html}</div>${aiChipsHTML(x.chips)}</div></div>`}
function aiSay(html,chips,noShow){chips=aiWithNext(chips,noShow);AI.typing=false;aiIdle();AI.msgs.push({t:Date.now()+AI.msgs.length,ai:1,html,chips});AI.msgs=AI.msgs.slice(-40);aiPaint();if(!AI.open&&$('#aiFab')){AI.unread=(AI.unread||0)+1;aiFabDot()}}
function aiPaint(){const el=$('#aiLog');if(!el)return;el.innerHTML=AI.msgs.map(aiItemHTML).join('')+(AI.typing?'<div class="aiMsg"><div class="dcAv aiAv">🤖</div><div class="aiBody"><div class="aiText aiDots"><i></i><i></i><i></i></div></div></div>':'');el.scrollTop=el.scrollHeight}
function aiFabDot(){const d=$('#aiFabN');if(d){d.hidden=!AI.unread;d.textContent=AI.unread||''}}
const AI_MAIN=[['🥊 Fight me','fightme'],['👀 Show me a fight','show'],['🗺️ Show me around','tour'],['📋 How do fight plans work?','plans'],['🏆 What\'s the league?','league']];

/* ---- greeting ---- */
function aiGreet(){if(AI.greeted||!$('#aiLog'))return;AI.greeted=true;const first=!aiSeen();aiMarkSeen();
  const alone=!dcPrev||dcPrev.size===0,n=aiWho();
  if(ME)aiSay(`What's up, <b>${esc(n)}</b>! 👊 Need a sparring partner, a plan idea, or a hand with anything? Just ask.`,[['🥊 Fight me','fightme'],['🧠 Plan tips','tips'],['🤝 Challenge a friend','challenge'],['❓ Ask me anything','help']]);
  else if(first)aiSay(`👋 Hey, welcome to <b>Contenders</b>! I'm <b>Simbot AI</b>, the house fighter around here.<br><br>Here's the deal: you don't throw the punches, you're the <b>manager</b>. You build a boxer, write his <b>fight plan</b>, and the fight plays out on its own. Best plan wins. 🧠🥊<br><br>${alone?"It's just you and me in here right now, so ":''}want to see how it works?`,AI_MAIN);
  else aiSay(`Welcome back${n?', <b>'+esc(n)+'</b>':''}! 🔔 Ready for another round?`,[...AI_MAIN.slice(0,2),['✍️ Sign up free','go:register'],['❓ Ask me anything','help']]);
}
/* floating button: the chat is low on the page, so the welcome pops out here first */
function aiFabHTML(){return`<div id="aiFab"><div class="aiWin" id="aiWin" hidden><div class="aiHead"><div class="dcAv aiAv">🤖</div><div><b>Simbot AI</b> <span class="dcTag">BOT</span><div class="aiSub"><span class="aiOn"></span> Online · only you see this chat</div></div><button class="aiX" data-ai="close" title="Close">✕</button></div>
  <div class="aiLog" id="aiLog"></div><div class="aiSay"><input id="aiIn" maxlength="200" placeholder="Ask me anything..." autocomplete="off"><button data-ai="send">➤</button></div></div>
  <div class="aiBub" id="aiBub" hidden><a class="aiBubX" data-ai="bubx">✕</a><span id="aiBubT" data-ai="fab"></span></div><button class="aiFabBtn" data-ai="fab" title="Ask Simbot AI">🤖<span class="aiFabN" id="aiFabN" hidden></span></button></div>`}
function aiMount(){const fab=$('#aiFab');if(!fab||fab.dataset.on)return;fab.dataset.on='1';
  fab.addEventListener('click',e=>{const a=e.target.closest('[data-ai]');if(a){e.stopPropagation();aiAct(a.dataset.ai,a)}});
  const i=$('#aiIn');i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();aiSendBox()}});
  if(AI.open){$('#aiWin').hidden=false;fab.classList.add('open');aiPaint()}aiFabDot();aiFabStart()}
function aiSendBox(){const i=$('#aiIn');if(!i)return;const v=i.value;i.value='';aiAsk(v)}
function aiFabBubble(show,text){const b=$('#aiBub');if(!b)return;if(!show){b.hidden=true;return}$('#aiBubT').innerHTML=text;b.hidden=false}
function aiFabStart(){if(ME)return;setTimeout(()=>{if(!$('#aiFab')||AI.bubbled)return;AI.bubbled=true;
  aiFabBubble(true,aiSeen()&&AI.greeted&&AI.msgs.length>1?'👋 Need a hand? I\'m right here.':'👋 <b>New here?</b> Tap me and I\'ll show you how it works. Or fight me, if you think you\'re ready 😏')},2500)}
function aiOpen(){aiFabBubble(false);const w=$('#aiWin');if(!w)return;if(AI.open&&!w.hidden){return aiClose()}AI.open=true;w.hidden=false;$('#aiFab').classList.add('open');AI.unread=0;aiFabDot();
  if(!AI.greeted)aiGreet();else aiPaint();if(matchMedia('(min-width:761px)').matches)setTimeout(()=>{const i=$('#aiIn');i&&i.focus({preventScroll:true})},50)}
function aiClose(){AI.open=false;const w=$('#aiWin');if(w)w.hidden=true;const f=$('#aiFab');if(f)f.classList.remove('open')}

/* ---- actions (chip buttons) ---- */
async function aiAct(a,btn){try{return await aiAct0(a,btn)}catch(e){console.error('Simbot AI',e);AI.showing=false;document.querySelectorAll('.aiChip[data-ai=show]').forEach(c=>c.disabled=false);
  aiSay(`Oops, I tripped over my own feet there. 🤕 (${esc(String(e&&e.message||e).slice(0,140))}) Try again?`,[[ '🔁 Try again',a]])}}
async function aiAct0(a,btn){
  if(a==='fab')return aiOpen();
  if(a==='bubx')return aiFabBubble(false);
  if(a==='close')return aiClose();
  if(a==='send')return aiSendBox();
  if(a==='fightme'){aiUser('Fight me');return aiSay(`Oh, you want some? 😤 Pick your fighter. Every one comes with a fight plan that has a note on every line, so you'll see exactly what he does. I'll pick mine, and I'm not telling you which.`,[...STARTERS.map(x=>[`${x.em} ${esc(x.nm)}`,'pick:'+x.id]),['🎲 Surprise me','pick:?']])}
  if(a.startsWith('pick:')){let id=a.slice(5);if(id==='?')id=aiRand(STARTERS).id;const st=starterOf(id);if(!st)return;if(btn)btn.disabled=true;aiUser(st.nm);return aiFightMe(id)}
  if(a==='show'){if(AI.showing)return; /* one at a time: a second tap is ignored */
    document.querySelectorAll('.aiChip[data-ai=show]').forEach(c=>c.disabled=true);aiUser('Show me a fight');if(!AI.open)aiOpen();return aiShow()}
  if(a.startsWith('point:')){const[,k,c]=a.split(':');return aiPointDiag(k,c)}
  if(a.startsWith('fix:')){const[,k,c]=a.split(':');if(btn)btn.disabled=true;return aiFix(k,c)}
  if(a==='tour'){aiUser('Show me around');return aiTour(0)}
  if(a.startsWith('tour:')){return aiTour(+a.slice(5))}
  if(a==='spotx'){aiSpotOff();if(!AI.open)aiOpen();if(!AI.lessonPending)aiSay(aiRand(['Got it? 👍 Ask me anything about it, or keep going.','Nice. Little by little, that\'s how you learn this game. 🧠']));AI.lessonPending=false;return}
  if(a.startsWith('tourspot:')){const L=AI_LESSONS[+a.slice(9)];AI.lessonPending=true;aiSpot(L.spot,L.a()[0].replace(/^📘 /,''),[]);setTimeout(()=>{AI.lessonPending=false},500);return}
  if(a==='askq'){aiSay('Sure! Type it below. Anything about fighters, plans, fights or the league. 👇');setTimeout(()=>{const i=$('#aiIn');i&&i.focus()},100);return}
  if(a.startsWith('lesson:')){const n=+a.slice(7);return aiLesson(n)}
  if(a==='again'){aiSpotOff();if($('#labAi'))$('#labAi').innerHTML='';return labFight()}
  const r=AI_TOPICS[a];if(r){aiUser(r.q);const x=r.a();aiSay(x[0],x[1])}}
function aiUser(text){aiIdle();AI.msgs.push({t:Date.now(),me:1,text})}

/* "Show me a fight" = the showcase (owner, Nov 15, 2026: "a 12 round KO, some excitement beforehand... showcase the simulation"):
   a puncher vs a random opponent, 12 rounds, hype from Simbot, a 3-2-1, then the most exciting of up to 400 normal simulations:
   a real KO late (rounds 6-11), best with knockdowns before it. */
const AI_PUNCHERS=['KP Slugger','Slugger','Flasher','Closer','Agile Slugger','Body Snatcher'];
const AI_HYPE=["These two have been calling each other out all week. 😤","The crowd is on its feet before the first bell. 🔥","Somebody's walking out of here on his shield tonight. ⚔️","Bad blood. Big punches. Twelve rounds scheduled. 🩸"];
function aiShowScore(g){const r=g.result;if(!r||r.decision||r.w==null)return 0;
  const kds=g.rounds.slice(0,-1).reduce((s,R)=>s+(R.st?(R.st[0].kd||0)+(R.st[1].kd||0):0),0);
  return(r.type==='KO'?50:15)+(r.round>=6&&r.round<=11?30:r.round>=4?12:0)+Math.min(kds,2)*10}
function aiShow(){const L=labState(),red=starterOf(aiRand(AI_PUNCHERS)),blue=aiRand(STARTERS.filter(x=>x.id!==red.id));
  labApplyStarter(L.A,red.id,L.level);labApplyStarter(L.B,blue.id,L.level);L.A.name=red.nm.replace(/^The /,'Kid ');L.B.name=blue.nm.replace(/^The /,'Big ');
  L.rounds='12';L.div='';labRefresh('A');labRefresh('B');const bar=$('#labBar');if(bar)bar.innerHTML=labBarHTML();
  const tape=F=>{const h=HT(F);return`${Math.floor(h/12)}'${h%12}", ${natWeight(F)} lb`};
  const og=aiRand(['WBC','WBA','WBO']),T={org:og,orgs:[og],champ:Math.random()<.5?0:1};AI.title=T;const ch=T.champ?L.B:L.A;
  AI.showing=true;aiFabBubble(false);
  aiSay(`🔔🔔 <b>LADIES AND GENTLEMEN... IT'S MAIN EVENT TIME!</b> 🔔🔔<br><br>Twelve rounds for the <b>🏆 ${T.org} WORLD CHAMPIONSHIP!</b><br><br>🔴 In the red corner, ${tape(L.A)}: <b>${esc(L.A.name)}</b>${T.champ===0?' 👑 <b>the CHAMPION</b>':', the challenger'}! ${esc(red.line)}<br>🔵 In the blue corner, ${tape(L.B)}: <b>${esc(L.B.name)}</b>${T.champ===1?' 👑 <b>the CHAMPION</b>':', the challenger'}! ${esc(blue.line)}<br><br>${esc(ch.name)} brings the belt to the ring. Somebody walks out with it. `+`${aiRand(AI_HYPE)} Turn your sound on 🔊 and watch for the knockdowns. I'll be back when it's over to tell you exactly why the winner won.`,[],true);
  AI.lastShowAt=Date.now();const best=labBestAsync(aiShowScore,400,100);
  setTimeout(()=>{if(!AI.showing)return;aiSay('3... 2... 1... 🔔 <b>LET\'S GET IT ON!</b>',[],true)},1400);
  setTimeout(async()=>{const f=await best;if(!AI.showing||!$('#lab'))return;aiClose();aiSpotOff();labFight(f?{fight:f,title:T}:{title:T})},2600)}

/* "Fight me": a real challenge vs Simbot's fighter, so other people can watch it live too */
async function aiFightMe(stId,retry){let nick=null;
  if(!ME){nick=labNick();if(!/^[A-Za-z0-9 _.'-]{3,20}$/.test(nick)||retry){nick='Rookie'+(1000+Math.floor(Math.random()*9000));try{localStorage.setItem('contenders_simbot_nick',nick)}catch(e){}
      document.querySelectorAll('#labNick,#sbcNick').forEach(i=>i.value=nick);if(!retry)aiSay(`I'll call you <b>${esc(nick)}</b> for now. Change it any time in the nickname box under the chat.`)}}
  const mine=aiRand(STARTERS.filter(x=>x.id!==stId)),F={name:'',nick:'The House Fighter',home:'The Simbot Gym',build:'normal'};
  labApplyStarter(F,mine.id,'title');F.name="Simbot's "+mine.nm.replace(/^The /,'');
  aiSay('Setting up the ring... 🔔',[],true);
  const r=await sbCall({action:'vsbot',level:'title',rounds:12,nick,bot:{name:F.name,nick:F.nick,home:F.home,build:F.build,str:F.str,kp:F.kp,spd:F.spd,agl:F.agl,chn:F.chn,cnd:F.cnd,hgt:F.hgt,cut:F.cut,plan:F.plan,planName:F.planName}});
  if(r.error){if(/nickname/i.test(r.error)&&!ME&&!retry)return aiFightMe(stId,true);return aiSay(`Hmm, the ring wasn't ready: ${esc(r.error)}`,[['Try again','pick:'+stId]])}
  sbcSaveSeat(r.id,'a',r.a);aiPre={id:r.id,st:stId};nav('sbch:'+r.id)}

/* ---- after a Simbot fight: why the winner won, and one thing to try ---- */
function aiFightNotes(f,N){const D=aiDiag(f);return[D.head,D.why]}
function aiDiag(f){const N=labState().names||['Red','Blue'];const r=f.result,R=f.rounds,last=R[R.length-1]||{},en=last.en||[1,1];
  const tot=[0,1].map(i=>R.reduce((s,x)=>{const q=x.st&&x.st[i];if(q){s.t+=(q.pt||0)+(q.rt||0)+(q.jt||0);s.l+=(q.pl||0)+(q.rl||0)+(q.jl||0)}return s},{t:0,l:0}));
  const pct=i=>tot[i].t?Math.round(100*tot[i].l/tot[i].t):0;
  if(r.w==null)return{k:'close',c:'A',head:`🤝 <b>A ${esc(r.type.toLowerCase())}!</b> Dead even.`,why:`Landed: ${esc(N[0])} ${tot[0].l} (${pct(0)}%), ${esc(N[1])} ${tot[1].l} (${pct(1)}%). Change one number in either plan and it won't be next time.`};
  const w=r.w,l=1-w,how=r.decision?`by ${esc(r.type.toLowerCase())}`:`by ${esc(r.type)} in round ${r.round}`;
  const head=`🏆 <b>${esc(N[w])} wins ${how}!</b> He landed ${tot[w].l} punches (${pct(w)}%) to ${tot[l].l} (${pct(l)}%).`;
  let why,k;
  if(en[l]<.2)k='gas',why=`<b>${esc(N[l])} ran out of gas</b> (${Math.round(en[l]*100)}% left at the end). Try lower numbers in his plan: when the three add up to less than 20, the rest is <b>rest</b>, and he gets his breath back.`;
  else if(!r.decision)k='caught',why=`<b>${esc(N[l])} got caught.</b> Give him more <b>DEFENSE</b> when he's tired, like a line at the bottom of his plan: <tt>if endurance_percent &lt; 40 then 4/4/12</tt>. Or more <b>CHIN</b> in his abilities.`;
  else if(pct(l)+8<pct(w))k='land',why=`<b>${esc(N[l])} couldn't land</b>: ${pct(l)}% vs ${pct(w)}%. His opponent was harder to hit. Try going to the body (<tt>7B/6/7</tt>) or working <tt>(inside)</tt>, or give him more <b>SPEED</b>.`;
  else if(tot[l].t<tot[w].t*.85)k='work',why=`<b>${esc(N[l])} got outworked.</b> The judges love the busier man. Raise his <b>AGGRESSION</b> (the first number) in the middle rounds.`;
  else k='close',why=`<b>Close one on the cards.</b> One number either way could flip it. Change something in the losing plan and run it again. That's the whole game. 😉`;
  return{k,c:l===0?'A':'B',head,why,loser:N[l]}}
const N2=(n,f)=>f.result.w==null?'nobody':n[f.result.w];
function aiWatchFight(){clearTimeout(aiWatchT);const box=$('#labAi');if(box)box.innerHTML='';
  const L=labState(),f=L.fight;if(!f)return;let n=0;
  const tick=()=>{if(!$('#labAi')||labState().fight!==f)return;if(labAnim&&labAnim.at<labAnim.tl.total-.3&&n++<900){aiWatchT=setTimeout(tick,1000);return}
    const[h,why]=aiFightNotes(f,L.names);AI.fights=(AI.fights||0)+1;
    const chips=[['🔁 Run it again','again'],['🥊 Now fight me','fightme']];if(!ME&&AI.fights>=2)chips.push(['🏆 Make it count: sign up free','go:register']);else chips.push(['📋 How plans work','plans']);
    const D=aiDiag(f),fx=D.k==='close'?[]:[['👉 Show me what went wrong','point:'+D.k+':'+D.c],['🔧 Fix it for me','fix:'+D.k+':'+D.c]];
    $('#labAi').innerHTML=aiCard(`${h}<br>${why}${!ME&&AI.fights===2?'<br><br>In the league, your fighter keeps his record, climbs the rankings and fights every week. It\'s free.':''}`,[...fx,...chips]);
    const mine=AI.showing;AI.showing=false;
    const TB=L.bout&&L.bout.title,belt=TB&&f.result.w!=null?(f.result.w===TB.champ?`<br>👑 <b>AND STILL ${TB.org} CHAMPION!</b> The belt stays home.`:`<br>👑 <b>AND NEW ${TB.org} CHAMPION!</b> We've got a new king. 🏆`):'';
    aiSay(`${mine?'That\'s the fight! ':''}${h}${belt}<br><br>${why}`,[...fx,['🔁 Run it again','again'],['🎲 New matchup','show'],...(!ME&&AI.fights>=2?[['🏆 Sign up free','go:register']]:[['🥊 Fight me','fightme']])]);
    if(mine&&!AI.open)aiOpen();else if(!AI.open)aiFabBubble(true,`🔔 Fight's over! Want to know why <b>${esc(N2(L.names,f))}</b> won? Tap me.`)};
  aiWatchT=setTimeout(tick,1500)}

/* ---- the challenge page vs Simbot ---- */
const AI_TALK_PRE=["I'm locked in and waiting. 😤","My fighter's warmed up. Yours?","Take your time. I've got all night. 🥱","I've seen your type before. 👀"];
function aiChallengeNote(r,s){if(!r||r.b_who!==AI_BOT||!s||s.s!=='a')return'';const st=aiPre&&aiPre.id===r.id?starterOf(aiPre.st):null;
  return aiCard(`${aiRand(AI_TALK_PRE)} ${st?`You've got <b>${esc(st.nm)}</b> loaded, plan included, with a note on every line.`:''} Change any number you want, or just hit <b>READY</b> below. I can't see your plan and you can't see mine. Anyone on the board can watch us live. 🍿`)}
function aiAfterChallenge(r,s,res){if(!r||r.b_who!==AI_BOT||!s)return'';const me=s.s==='a'?0:1;
  const t=res.w==null?aiRand(["A draw?! We go again. Hit Rematch. 😤","Even. I don't do even. Rematch."]):res.w===me?aiRand(["You got me. 😵 Lucky plan. Run it back?","OK, OK, you can fight. 👏 Bet you can't do it twice.","I let you have that one. (I didn't.) Rematch?"]):aiRand(["Too easy. 😎 Change a number and run it back.","Simbot wins again! 🤖🏆 Peek at the full report to see where it went wrong.","Better luck next time, champ. Tweak that plan and hit Rematch."]);
  const pitch=ME?'':`<br><br>Like that? That's what managing in <b>Contenders</b> feels like, except your fighter keeps his record, climbs the rankings and fights every week against other gyms. <b>Free</b>. Sign up and your first fighter is on a card within a day.`;
  return aiCard(t+pitch,ME?[['🥊 Back to Simbot','go:simbot']]:[['✍️ Sign up free','go:register'],['🥊 Back to Simbot','go:simbot']])}

/* ---- questions ---- */
const aiTT=s=>`<tt>${s}</tt>`;
const AI_TOPICS={
  plans:{q:'How do fight plans work?',a:()=>[`A fight plan is a list of lines. The basic line is three numbers: ${aiTT('AGGRESSION/POWER/DEFENSE')}, like ${aiTT('6/6/8')}.<br>• <b>Aggression</b> = how many punches he throws<br>• <b>Power</b> = how hard (it tires him)<br>• <b>Defense</b> = how hard he is to hit<br>They add up to <b>20 at most</b>. Whatever's left over, he rests and gets his breath back.<br><br>Then add conditions: ${aiTT('if opponent &lt;= tired then 9/8/3')} = "when he's tired, go get him". Every round your fighter reads the plan top to bottom and uses the <b>last line that's true</b>.`,[['🎨 Styles','styles'],['❓ Conditions','conds'],['💪 Abilities','abil'],['🥊 Try it: fight me','fightme']]]},
  styles:{q:'What are the styles?',a:()=>[`Put a style in brackets after the numbers, like ${aiTT('6/6/8 (inside)')}:<br>• <b>(inside)</b> work up close, more power<br>• <b>(clinch)</b> tie him up and smother his punches<br>• <b>(ring)</b> move and use the ring, harder to hit<br>• <b>(counter)</b> make him miss and make him pay<br>• <b>(outside)</b> box from range<br>• <b>(ropes)</b> lie on the ropes and let him punch himself out<br>• <b>(feint)</b> fake to open him up<br>• <b>(allout)</b> everything, now. Risky!<br>Add <b>H</b> or <b>B</b> after aggression to go head or body: ${aiTT('7B/6/7')}.`,[['❓ Conditions','conds'],['🧠 Plan tips','tips']]]},
  conds:{q:'What conditions can I use?',a:()=>[`A few favorites:<br>• ${aiTT('if opponent &lt;= tired then ...')} he's slowing down<br>• ${aiTT('if endurance_percent &lt; 40 then ...')} you're low on gas<br>• ${aiTT('if score &lt; 0 and round &gt;= 8 then ...')} you're behind late<br>• ${aiTT('if hisstuns &gt; 0 then ...')} you've hurt him<br>• ${aiTT('8) 7/7/6')} from round 8 on<br>Remember: the <b>last true line wins</b>, so put your emergency lines at the bottom. The full list is in <a data-go="help:conditions">Plan Conditions</a>.`,[['🧠 Plan tips','tips'],['🥊 Fight me','fightme']]]},
  abil:{q:'What do the abilities do?',a:()=>[`• <b>STR</b> strength: damage per punch<br>• <b>KP</b> knockout punch: stuns and knockdowns (needs 3 STR per point)<br>• <b>SPD</b> speed: lands punches<br>• <b>AGL</b> agility: avoids punches, great for movers and counterpunchers<br>• <b>CHN</b> chin: shrugs off stuns and knockouts<br>• <b>CND</b> conditioning: the gas tank<br>• <b>Height</b>: reach and weight. <b>Build</b>: heavier or lighter for his height<br>• <b>Cut</b> resistance 1-3<br>A new league fighter has <b>70 points</b> to spread. Simbot's title fighters have 110.`,[['🏗️ Which build?','build'],['📋 Fight plans','plans']]]},
  build:{q:'Which build should I make?',a:()=>[`No single best one, it's rock-paper-scissors:<br>• 🚜 <b>Pressure</b> (STR + CND): walks you down<br>• 🔭 <b>Counterpuncher</b> (AGL + SPD): makes you miss<br>• 🐙 <b>Clincher</b> (STR + CHN + CND): drowns you late<br>• 🕺 <b>Mover</b> (AGL + SPD + CND): sticks and moves<br>• 🎯 <b>Puncher</b> (STR + KP): one shot changes everything<br>Pick a style you like, then write a plan that fits it. Try each one in the starter cards at the top of Simbot.`,[['👀 Show me a fight','show'],['🥊 Fight me','fightme']]]},
  tips:{q:'Give me some plan tips',a:()=>[[aiRand([`💡 <b>Save something for late.</b> A fighter who throws 10/10/0 every round is gassed by round 5. Leave a few points for rest early.`,`💡 <b>Emergency line at the bottom:</b> ${aiTT('if endurance_percent &lt; 30 then 3/3/14')}. When he's spent, survive.`,`💡 <b>Finish him.</b> ${aiTT('if opponent &lt;= tired then 9/9/2')} near the bottom of the plan turns a tired opponent into a knockout.`,`💡 <b>Ahead on the cards?</b> ${aiTT('if score &gt;= 3 then 5/4/11 (ring)')} keeps you safe and banks the rounds.`,`💡 <b>Judges love work.</b> A busy fighter wins close rounds. Don't go under 5 aggression for long.`,`💡 <b>Body first.</b> ${aiTT('7B/6/7')} early drains his gas tank, then go upstairs later.`]),'Want another one?'].join('<br>'),[['💡 Another tip','tips'],['🥊 Test it: fight me','fightme']]]},
  league:{q:"What's the league?",a:()=>[`<b>Contenders</b> is a free online boxing league for managers. 🏆<br>• Your fighter gets a <b>real fight every week</b> on his division's fight night (cards run around 10:40 PM Central)<br>• Your first fighter starts in <b>Rookies</b> and debuts on the next card, usually within a day<br>• Win and he gains <b>rating</b> and <b>ability points</b> to train, earns purses and fans, and climbs the rankings<br>• After every fight the <b>Corner Coach</b> sends you tips from your own report<br>• There's also <b>Bare Knuckles</b>: 25 rounds, no gloves, no doctor<br>It's all free. No downloads.`,[['✍️ Sign up free','go:register'],['🤝 Challenge a friend','challenge'],['🥊 Fight me first','fightme']]]},
  signup:{q:'How do I sign up?',a:()=>[`Takes 30 seconds: pick a gym name, an email and a password. 🥊 Your first fighter goes in <b>Rookies</b>, you pick a starter plan, and he's on a fight card within a day. Free, forever.`,[['✍️ Sign up free','go:register']]]},
  challenge:{q:'How do I challenge someone?',a:()=>[`Scroll up to <b>🥊 Challenge Someone</b>, hit <b>Create a challenge</b>, and send the blue-corner link to a friend (or post it on the board so anyone can accept). You each build a fighter and plan in secret, hit READY, and everybody watching sees the fight start at the same moment, with a chat on the side. 🍿`,[['🥊 Or fight me right now','fightme']]]},
  ko:{q:'How do knockouts work?',a:()=>[`Big shots cause <b>stuns</b> and <b>knockdowns</b>. Stack enough and it's over. 💥<br>• <b>KO punch</b> and <b>strength</b> make your shots dangerous; <b>chin</b> keeps you standing<br>• A <b>tired</b> fighter has a weaker chin, so gas tanks matter<br>• The referee also steps in when a spent fighter stops fighting back, and the doctor can stop bad cuts<br>Want KOs? Pressure him till he's tired, then ${aiTT('if opponent &lt;= tired then 9/9/2')}.`,[['🎯 Show me a puncher','show'],['💪 Abilities','abil']]]},
  score:{q:'How is a fight scored?',a:()=>[`Three judges score every round, 10-9 to the man who did more, 10-8 or worse with knockdowns. ⚖️ If a card ends even, that judge gives it to the busier fighter. A league fight is <b>12 rounds</b>; Bare Knuckles goes <b>25</b> and the man with more knockdowns wins.`,[['🧠 Plan tips','tips']]]},
  gas:{q:'Why did my fighter get tired?',a:()=>[`Every punch costs gas, <b>power</b> most of all. The three numbers in a line can add up to 20; anything you leave off is <b>rest</b>. So ${aiTT('6/5/6')} rests 3 points a round, ${aiTT('8/8/4')} rests none. More <b>CND</b> (conditioning) = a bigger tank. A tired fighter lands less, gets hit more, and gets knocked out easier. 😮‍💨`,[['💡 A tip','tips']]]},
  free:{q:'Is it free?',a:()=>[`100% free. 🙌 Nothing to buy, nothing to download. It even installs like an app on your phone (button in the menu).`,[['✍️ Sign up free','go:register']]]},
  private:{q:'Can people see my plan?',a:()=>[`Nope. 🔒 Your plans are private: other managers never see them, not in challenges, not in league fights, and the league owner can't see them either. Fight reports show what happened, never the plan behind it. That's why scouting matters.`,[['🤝 Challenge a friend','challenge']]]},
  me:{q:'Who are you?',a:()=>[`I'm <b>Simbot AI</b> 🤖, the house fighter and helper in Simbot. I can explain the game, give plan tips, put on a fight for you, or fight you myself. I don't manage a league gym and I can't see anybody's plans. Ask away!`,[['🥊 Fight me','fightme'],['❓ What can I ask?','help']]]},
  help:{q:'What can I ask you?',a:()=>[`Anything about the game, for example:<br>• "how do fight plans work?" • "what does agility do?"<br>• "how do I get knockouts?" • "why did my fighter gas out?"<br>• "what's the league?" • "is it free?"<br>• "give me a tip" • "fight me" • "show me a fight"<br>This chat is just between you and me.`,AI_MAIN]},
  app:{q:'Is there an app?',a:()=>[`Yes! The site installs like an app: tap <b>Install the App</b> in the menu (on iPhone: Share, then Add to Home Screen). 📱`,[]]},
  webl:{q:'Is this like WeBL?',a:()=>[`It started as a tribute to the old Web Boxing League, the classic fight-plan boxing game. 🥊 Same idea, you're the manager and the plan does the fighting, but Contenders has its own rules now, plus Simbot, live challenges, Rookies and Bare Knuckles.`,[['🏆 The league','league']]]},
  bk:{q:'What is Bare Knuckles?',a:()=>[`Our hardcore region. 🩸 <b>25 rounds</b>, no gloves, no ringside doctor, slower recovery between rounds. Going the distance, the man with more knockdowns wins. You pick the region when you create a fighter, and it's permanent. In Simbot, pick <b>Bare Knuckles, 25 rounds</b> to try it.`,[['🏆 The league','league']]]},
  gyms:{q:'Who runs the other gyms?',a:()=>[`I only run Simbot, I don't manage any league gym. 🤷 Every gym keeps its plans secret, so the only way to find out what they're made of is to fight them.`,[['🏆 The league','league']]]},
};
const AI_INTENTS=[
  [/^(hi|hey|hello|yo|sup|what'?s up|howdy|hiya)\b/,()=>[aiRand([`Hey hey! 👋`,`Yo! 🥊`,`What's good! 👊`])+` What can I do for you?`,AI_MAIN]],
  [/\b(thanks|thank you|thx|ty|appreciate)\b/,()=>[aiRand([`Anytime, champ. 🥊`,`That's what I'm here for! 👊`,`You got it. Now go win something. 🏆`]),[['🥊 Fight me','fightme']]]],
  [/\b(bye|later|gtg|gotta go|see ya|cya)\b/,()=>[`Later! 👋 Come back and fight me sometime. I'll be here. I'm always here. 🤖`,[['✍️ Sign up free so your fighter keeps fighting','go:register']]]],
  [/\b(fight me|spar|play (with|against) (you|me)|vs you|challenge you|fight you|1v1)\b/,'fightme'],
  [/\b(show|watch|see|demo|example)\b.*\bfight\b|\bfight\b.*\b(show|demo)\b/,'show'],
  [/\b(who|what) are you\b|\bare you (a |an )?(bot|ai|real|human|robot)\b/,'me'],
  [/\b(other|those|these|their|the)\s+gyms?\b.*\b(bots?|ai|real|computer|fake|people|humans?)\b|\b(bots?|ai)\b.*\bgyms?\b/,'gyms'],
  [/\b(free|cost|price|pay|money|subscription)\b/,'free'],
  [/\b(sign ?up|register|join|account|create (a |my )?gym)\b/,'signup'],
  [/\b(app|install|download|phone|iphone|android)\b/,'app'],
  [/\b(webl|web boxing)\b/,'webl'],
  [/\b(bare ?knuckles?|bk)\b/,'bk'],
  [/\b(challenge|friend|invite|link|1 ?v ?1|lobby)\b/,'challenge'],
  [/\b(private|secret|see my plan|steal|copy)\b/,'private'],
  [/\b(ko|k\.o\.|knock ?outs?|knock ?downs?|stun|tko|stoppage|finish)\b/,'ko'],
  [/\b(gas|tired|stamina|endurance|rest|fatigue|exhausted|gassed|cnd|conditioning)\b/,'gas'],
  [/\b(score|scoring|judges?|decision|points?|draw|rounds?)\b/,'score'],
  [/\b(inside|clinch|ring|counter|outside|ropes|feint|all ?out|styles?|head|body)\b/,'styles'],
  [/\b(if|condition|conditions|opponent|endurance_percent|then)\b/,'conds'],
  [/\b(str|strength|kp|ko punch|spd|speed|agl|agility|chn|chin|abilit|stats?|height|reach|build|weight|cut)\b/,'abil'],
  [/\b(best|which|what) (build|fighter|type|style)|\b(beginner|start|first fighter|recommend)\b/,'build'],
  [/\b(tips?|advice|help me win|strategy|better|improve|how (do|can) i win)\b/,'tips'],
  [/\b(league|rank|rankings|title|belt|champion|record|rookie|weekly|fight night|schedule|corner coach|training)\b/,'league'],
  [/\b(plans?|aggression|power|defense|defence|numbers|how (does|do) (it|this|the game) work|how to play|what is this|what do i do)\b/,'plans'],
  [/\b(help|what can (i|you)|commands?)\b/,'help'],
];
function aiAnswer(text){const s=' '+String(text).toLowerCase().replace(/[’‘]/g,"'")+' ';
  for(const[re,v]of AI_INTENTS)if(re.test(s.trim())||re.test(s)){if(typeof v==='function')return{x:v()};if(v==='fightme'||v==='show')return{act:v};return{x:AI_TOPICS[v].a()}}
  return{x:[aiRand([`Hmm, you've got me on the ropes with that one. 🤔`,`That one's outside my weight class. 🤷`])+` I know the game inside out though: plans, abilities, knockouts, the league. Or ask the managers in the <a data-go="forums">forums</a>.`,[['❓ What can I ask?','help'],...AI_MAIN.slice(0,2)]]}}
async function aiAsk(text){text=String(text).trim();if(!text){aiSay('Yeah? What\'s up? 🤖',AI_MAIN);return}
  aiUser(text);const r=aiAnswer(text);AI.typing=true;aiPaint();
  setTimeout(()=>{if(r.act==='fightme'){AI.typing=false;AI.msgs.pop();return aiAct('fightme')}if(r.act==='show'){AI.typing=false;AI.msgs.pop();return aiAct('show')}aiSay(r.x[0],r.x[1])},500+Math.random()*400)}

/* ---- pointing at the page (owner, Nov 15, 2026: "circle what went wrong... this is how you play right here, move this move that") ----
   A pulsing ring around a part of the Simbot page plus a callout; the chat window steps aside while it's up. */
function aiSpotOff(){document.querySelectorAll('.aiRing,.aiCall').forEach(e=>e.remove());clearTimeout(AI.spotT)}
function aiSpot(targets,html,btns){aiSpotOff();const root=$('#lab');if(!root)return false;
  const els=(Array.isArray(targets)?targets:[targets]).map(t=>typeof t==='string'?$(t):t).filter(Boolean);if(!els.length)return false;
  aiClose();aiFabBubble(false);els[0].scrollIntoView({behavior:'smooth',block:'center'});
  const place=()=>{document.querySelectorAll('.aiRing,.aiCall').forEach(e=>e.remove());const rb=root.getBoundingClientRect();let top=1e9,bot=0;
    els.forEach(el=>{const r=el.getBoundingClientRect(),g=document.createElement('div');g.className='aiRing';
      Object.assign(g.style,{left:(r.left-rb.left-8)+'px',top:(r.top-rb.top-8)+'px',width:(r.width+16)+'px',height:(r.height+16)+'px'});root.appendChild(g);top=Math.min(top,r.top-rb.top);bot=Math.max(bot,r.bottom-rb.top)});
    const r0=els[0].getBoundingClientRect(),c=document.createElement('div');c.className='aiCall';
    c.innerHTML=`<div class="aiCallHd"><span class="aiCallBot">🤖</span> Simbot AI</div><div class="aiCallTx">${html}</div>${aiChipsHTML([...(btns||[]),['💬 Back to chat','spotx']])}`;
    root.appendChild(c);const w=Math.min(340,rb.width-16);c.style.width=w+'px';
    c.style.left=Math.max(8,Math.min(rb.width-w-8,r0.left-rb.left))+'px';c.style.top=(bot+18)+'px';
    c.addEventListener('click',e=>{const a=e.target.closest('[data-ai]');if(a){e.stopPropagation();aiAct(a.dataset.ai,a)}})};
  setTimeout(place,420);AI.spotPlace=place;return true}
addEventListener('resize',()=>{if($('.aiCall')&&AI.spotPlace)AI.spotPlace()});
const aiRow=(c,k)=>{const b=document.querySelector(`[data-lpm="${k}"][data-c="${c}"]`);return b&&b.closest('tr')};
const aiPlanBox=c=>document.querySelector(`.labPlan[data-c="${c}"]`);
const AI_STN={str:'Strength',kp:'KO Punch',spd:'Speed',agl:'Agility',chn:'Chin',cnd:'Conditioning'};
function aiPointDiag(k,c){const L=labState(),F=L[c],who=`<b>${esc(F.name)}</b> (${c==='A'?'red':'blue'} corner)`;
  const fix=[['🔧 Fix it for me','fix:'+k+':'+c]];
  if(k==='gas')return aiSpot([aiRow(c,'cnd'),aiPlanBox(c)],`${who} ran out of gas. Two ways to fix it:<br>1️⃣ <b>Conditioning</b> is his gas tank. Tap <b>+</b> to raise it (take the points from another ability with <b>−</b>).<br>2️⃣ In his <b>plan</b>, make a line's three numbers add up to <b>less than 20</b>. Whatever's left over is rest.`,fix);
  if(k==='caught')return aiSpot([aiRow(c,'chn'),aiPlanBox(c)],`${who} got knocked out.<br>1️⃣ <b>Chin</b> keeps him on his feet. Tap <b>+</b>.<br>2️⃣ At the <b>bottom of his plan</b>, add a safety line: <tt>if endurance_percent &lt; 40 then 4/4/12</tt>. When he's tired, he covers up. (The last true line wins, so the bottom is the boss.)`,fix);
  if(k==='land')return aiSpot([aiRow(c,'spd'),aiRow(c,'agl')],`${who} couldn't land his punches.<br><b>Speed</b> lands punches and <b>Agility</b> makes him hard to hit. Tap <b>+</b> on one of these and <b>−</b> on something he doesn't need.`,fix);
  if(k==='work')return aiSpot([aiPlanBox(c)],`${who} got outworked, and judges love the busier man.<br>In his <b>plan</b>, raise the <b>first number</b> (aggression) when he's behind. Add at the bottom: <tt>if score &lt; 0 and round &gt;= 4 then 8/6/6</tt>.`,fix);
  return aiSpot([aiPlanBox(c)],`It was close. Try changing one number in ${who}'s plan and run it again.`)}
/* move n points into stat `to` from the biggest other abilities, keeping the total and the KO Punch rule */
function aiMove(F,to,n){const max=labMaxS(),got=[];for(let i=0;i<n;i++){if(F[to]>=max)break;
    const don=['str','spd','agl','chn','cnd'].filter(k=>k!==to&&F[k]>(MINS[k]||1)+2&&!(k==='str'&&(F.kp||0)*3>F.str-1)).sort((a,b)=>F[b]-F[a])[0];if(!don)break;
    F[don]--;F[to]++;got.push(don)}
  const from={};got.forEach(k=>from[k]=(from[k]||0)+1);return{n:got.length,from}}
function aiAddLine(F,line,note){const p=String(F.plan||'').replace(/\s+$/,'');F.plan=p+'\n'+line+'   # Simbot AI: '+note;F.planName='Custom'}
function aiFix(k,c){const L=labState(),F=L[c];if(!F)return;let st=null,line=null,did=[];
  const mv=(to,n)=>{const r=aiMove(F,to,n);if(r.n)did.push(`<b>+${r.n} ${AI_STN[to]}</b> (from ${Object.entries(r.from).map(([x,v])=>v+' '+AI_STN[x]).join(', ')})`);st=to};
  if(k==='gas'){mv('cnd',3);line=['if endurance_percent < 50 then 5/4/8','rest when he is under half his gas']}
  else if(k==='caught'){mv('chn',3);line=['if endurance_percent < 40 then 4/4/12','cover up when he is tired']}
  else if(k==='land'){mv('spd',3)}
  else if(k==='work'){line=['if score < 0 and round >= 4 then 8/6/6','throw more when he is behind']}
  if(line){aiAddLine(F,line[0],line[1]);did.push(`a new line at the bottom of his plan: <tt>${esc(line[0])}</tt>`)}
  labRefresh(c);const tx=aiPlanBox(c);if(tx){tx.value=F.plan;tx.scrollTop=tx.scrollHeight}
  const els=[st&&aiRow(c,st),line&&aiPlanBox(c)].filter(Boolean);
  aiSpot(els.length?els:[`#labCard${c}`],`Done! I gave <b>${esc(F.name)}</b> ${did.join(' and ')||'a small tweak'}. 🔧<br>That's how you play: change something, then <b>run it again</b> and see if it worked.`,[['🔁 Run it again','again']]);
  aiSay(`🔧 Fixed up <b>${esc(F.name)}</b>: ${did.join(' and ')||'a small tweak'}. Hit <b>Run it again</b> and let's see if it works.`,[['🔁 Run it again','again'],['👉 Show me','point:'+k+':'+c]])}
/* guided tour of the Simbot page */
const AI_TOUR=[
  ['.sbStartGrid',`<b>Step 1: pick your fighters.</b> 🥊 Every starter has a style and a ready-made plan. Tap <b>Red corner</b> on one and <b>Blue corner</b> on another.`],
  ['#labCardA .labStats',`<b>Step 2: his abilities.</b> 💪 Strength, Speed, Chin... Tap <b>+</b> and <b>−</b> to move points around. He has to use every point (the total is right under this).`],
  ['#labCardA .labPlan',`<b>Step 3: the fight plan.</b> 🧠 This is the real game. Each line is <tt>AGGRESSION/POWER/DEFENSE</tt>, and every line has a note saying what it does. Change a number and see what happens.`],
  ['[data-lab=fight]',`<b>Step 4: FIGHT!</b> 🔔 Hit it and watch your plan go to work. When it's over I'll tell you why the winner won and what to change.`],
  ['#sbLobby',`<b>Step 5: real opponents.</b> 🤝 Challenge a friend or anyone on the board. Plans stay secret and everyone watches live.`],
  ['.dc',`<b>Step 6: the hangout.</b> 💬 Talk trash, share fights, find a challenge. That's it, you know how to play! Want to fight me?`]];
function aiTour(i){const st=AI_TOUR[i];if(!st){aiSpotOff();return aiOpen()}
  const next=i<AI_TOUR.length-1?[['Next ➜','tour:'+(i+1)]]:[['🥊 Fight me','fightme'],['👀 Show me a fight','show']];
  if(!aiSpot(st[0],st[1]+`<div class="aiStep">${i+1} / ${AI_TOUR.length}</div>`,next))aiTour(i+1)}

/* ---- Learn the game: short lessons, one idea at a time (owner, Nov 15, 2026: "give him information slowly but surely... understand the principles of the game") ---- */
const aiLs=()=>{try{return+localStorage.getItem('contenders_ai_lesson')||0}catch(e){return 0}};
const aiLsSet=n=>{try{localStorage.setItem('contenders_ai_lesson',String(Math.max(aiLs(),n)))}catch(e){}};
const AI_LESSONS=[
  {t:'You\'re the manager',a:()=>[`📘 <b>Lesson 1: you're the manager.</b><br>In Contenders you never press a punch button. You do two things: <b>build</b> a fighter and write his <b>fight plan</b>. Then the fight runs by itself, round by round, and the better plan usually wins.<br><br>Think of it like a corner man who gives orders before the bell. That's you. 🧢`]},
  {t:'Abilities',spot:'#labCardA .labStats',a:()=>[`📘 <b>Lesson 2: abilities.</b><br>Every fighter gets the same number of points to spread out. The big ones:<br>💪 <b>Strength</b> hits hard &nbsp; ⚡ <b>Speed</b> lands punches<br>🕺 <b>Agility</b> slips punches &nbsp; 🪨 <b>Chin</b> takes a punch<br>🫁 <b>Conditioning</b> is his gas tank<br>You can't max everything, so every build is a trade-off. Tap <b>Show me on the page</b> and I'll circle them.`]},
  {t:'The three numbers',spot:'#labCardA .labPlan',a:()=>[`📘 <b>Lesson 3: the three numbers.</b><br>A plan line looks like <tt>6/6/8</tt>: <b>aggression / power / defense</b>.<br>• High aggression = lots of punches<br>• High power = harder punches<br>• High defense = harder to hit<br>Every round, he fights the way the line tells him. Tap <b>Show me on the page</b> to see a real one. Each line has a note after the <tt>#</tt> telling you what it does.`]},
  {t:'Gas and rest',a:()=>[`📘 <b>Lesson 4: gas and rest.</b> 😮‍💨<br>The three numbers can add up to <b>20 at most</b>. Anything you don't use is <b>rest</b>, and rest refills his gas.<br>• <tt>8/8/4</tt> = 20, no rest. Great for a round, deadly for twelve.<br>• <tt>6/5/6</tt> = 17, so he rests 3 every round.<br>A tired fighter lands less, gets hit more and gets knocked out easier. <b>Pacing wins fights.</b>`]},
  {t:'If... then',a:()=>[`📘 <b>Lesson 5: if... then.</b> 🧠<br>Lines can start with a condition:<br><tt>if opponent &lt;= tired then 9/8/3</tt> = "when he's tired, go get him"<br><tt>if endurance_percent &lt; 40 then 4/4/12</tt> = "when I'm tired, cover up"<br>The big rule: every round he reads the plan <b>top to bottom</b> and uses the <b>last line that's true</b>. So your normal line goes at the top and your emergency lines at the bottom.`]},
  {t:'Styles',a:()=>[`📘 <b>Lesson 6: styles.</b> 🎨<br>Add a style in brackets: <tt>6/6/8 (inside)</tt>. A few to start with:<br>• <tt>(inside)</tt> brawl up close<br>• <tt>(ring)</tt> move and stay away<br>• <tt>(counter)</tt> wait, then punish<br>• <tt>(clinch)</tt> tie him up<br>And <tt>7B/6/7</tt> goes to the <b>body</b> (drains his gas), <tt>7H/6/7</tt> to the <b>head</b>. Styles beat each other like rock-paper-scissors.`]},
  {t:'Watch and learn',a:()=>[`📘 <b>Lesson 7: watch and learn.</b> 👀<br>The best way to get good: run a fight, see <b>why</b> the winner won, change <b>one thing</b>, run it again. After every fight I'll tell you what went wrong, and I can circle it on the page or fix it for you.<br>Let's try it right now:`,[['👀 Show me a fight','show']]]},
  {t:'Test yourself',a:()=>[`📘 <b>Lesson 8: test yourself.</b> 🥊<br>Fighting both corners yourself is practice. The real test is an opponent whose plan you <b>can't see</b>. You can fight me right now, or challenge a friend with a link. Everybody watching sees it live.`,[['🥊 Fight me','fightme'],['🤝 Challenge a friend','challenge']]]},
  {t:'The league',a:()=>[`📘 <b>Lesson 9: the league.</b> 🏆<br>Here's where it counts. Your fighter gets a <b>real fight every week</b>, keeps his record, earns points to train, climbs the rankings and earns purses. Your first fighter starts in <b>Rookies</b> against fighters at his level and debuts within a day. After every fight the Corner Coach sends you tips.<br><br>🎓 That's the whole course. You know how to play now! It's free:`,[['✍️ Sign up free','go:register']]]}];
function aiWithNext(chips,noShow){chips=chips||[];
  /* "Show me a fight" rides along on every answer (owner, Nov 15, 2026), except while he's picking a fighter or a fight is about to start */
  if(!noShow&&!chips.some(([,a])=>a==='show'||String(a).startsWith('pick:')))chips=[...chips,['👀 Show me a fight','show']];
  const n=aiLs();if(n>=AI_LESSONS.length||chips.some(([,a])=>String(a).startsWith('lesson:')))return chips;
  return[...chips,[n===0?'📘 Teach me the game (1 min lessons)':`📘 Next lesson: ${AI_LESSONS[n].t}`,'lesson:'+n]]}
function aiLesson(n){const L=AI_LESSONS[n];if(!L)return;aiUser(n===0?'Teach me the game':'Next lesson');aiLsSet(n+1);
  const[h,ch]=L.a(),more=[...(ch||[]),...(L.spot&&$(L.spot)?[['👉 Show me on the page','tourspot:'+n]]:[])];
  AI.typing=true;aiPaint();setTimeout(()=>{aiSay(h+(n<AI_LESSONS.length-1?`<div class="aiStep">Lesson ${n+1} of ${AI_LESSONS.length}</div>`:''),[...more,['❓ I have a question','askq']])},600)}
/* one gentle nudge after a long quiet spell (owner, Nov 15, 2026: "give it a while... the fight is still running and it asked two or three times... we don't annoy them"):
   never while a fight plays, a showcase is starting or something is circled; 3 minutes of no clicks, typing or scrolling on the page; at most once per visit */
const AI_IDLE_MS=180000;
function aiBusy(){return!!(labAnim&&!labAnim.stop&&labAnim.at<labAnim.tl.total)||AI.showing||!!$('.aiCall')||document.visibilityState!=='visible'}
function aiIdle(){clearTimeout(AI.idleT);if(AI.nudged)return;AI.idleT=setTimeout(function chk(){
    if(AI.nudged||!$('#aiWin'))return;if(!AI.open||aiBusy()||Date.now()-(AI.lastAct||0)<AI_IDLE_MS){AI.idleT=setTimeout(chk,15000);return}
    AI.nudged=1;const n=aiLs();
    aiSay(n<AI_LESSONS.length?`Whenever you're ready, the next lesson takes about 20 seconds. No rush. 🙂`:`Still here if you need me. Want to test what you learned? 🥊`,n<AI_LESSONS.length?[]:[['🥊 Fight me','fightme']])},AI_IDLE_MS)}
['click','keydown','scroll','touchstart'].forEach(ev=>addEventListener(ev,()=>{AI.lastAct=Date.now()},{passive:true,capture:true}));
