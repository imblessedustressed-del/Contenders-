/* ================= WeBL FIGHT PLAN LANGUAGE ================= */
const PLAN_STYLES=['inside','clinch','feint','counter','ring','ropes','outside','allout'];
const OPP_STATES={strong:0,tired:1,exhausted:2,weak:2,hurt:2};
function tokenize(src){
  const toks=[];let i=0;
  while(i<src.length){
    const c=src[i];
    if(/\s/.test(c)){i++;continue}
    if(c==='"'){let j=i+1;while(j<src.length&&src[j]!=='"')j++;toks.push({t:'str',v:src.slice(i+1,j)});i=j+1;continue}
    let m;
    if((m=/^(\d+(?:\.\d+)?)([hbcoHBCO])?(?![a-zA-Z_])/.exec(src.slice(i)))){toks.push({t:'num',v:+m[1],tg:m[2]?m[2].toUpperCase():null});i+=m[0].length;continue}
    if((m=/^[a-zA-Z_][a-zA-Z_0-9]*/.exec(src.slice(i)))){toks.push({t:'id',v:m[0].toLowerCase()});i+=m[0].length;continue}
    if((m=/^(>=|<=|<>|!=|==|[<>=+\-*\/()!;])/.exec(src.slice(i)))){toks.push({t:'op',v:m[0]});i+=m[0].length;continue}
    throw new Error(`I don't understand "${c}"`);
  }
  return toks;
}
/* Parse one statement's tokens. Returns {round, cond, action} */
function parseStatement(toks){
  let p=0;const peek=()=>toks[p],next=()=>toks[p++];
  const expect=(t,v)=>{const k=next();if(!k||k.t!==t||(v!==undefined&&k.v!==v))throw new Error(`expected ${v||t}`);return k};
  let round=null;
  if(peek()&&peek().t==='num'&&toks[p+1]&&toks[p+1].t==='op'&&toks[p+1].v===')'){round=next().v;next()}
  let cond=null;
  if(peek()&&peek().t==='id'&&peek().v==='if'){next();cond=parseOr();expect('id','then')}
  const action=parseAction();
  if(p<toks.length)throw new Error(`extra words after the tactic`);
  return{round,cond,action};
  function parseAction(){
    const k=peek();if(!k)throw new Error('missing tactic');
    if(k.t==='id'){
      if(k.v==='towel'){next();return{towel:true}}
      if(['taunt','sneer','say','gloat','tko'].includes(k.v)){next();const s=expect('str');return{msg:k.v,text:s.v}}
      throw new Error(`unknown command "${k.v}"`);
    }
    const a=expect('num');expect('op','/');const pw=expect('num');let dirty=false;
    if(peek()&&peek().t==='op'&&peek().v==='!'){next();dirty=true}
    expect('op','/');const d=expect('num');
    let style='none';
    if(peek()&&peek().t==='op'&&peek().v==='('){next();const s=expect('id');if(!PLAN_STYLES.includes(s.v))throw new Error(`unknown style "${s.v}"`);style=s.v;expect('op',')')}
    const tg={H:'Head',B:'Body',C:'Cut',O:'Opp'}[a.tg]||'Opp';
    if(a.v+pw.v+d.v>20)throw new Error(`${a.v}/${pw.v}/${d.v} uses more than 20 energy points`);
    return{agg:a.v,pow:pw.v,def:d.v,tgt:tg,style,dirty};
  }
  function parseOr(){let l=parseAnd();while(peek()&&peek().t==='id'&&peek().v==='or'){next();const r=parseAnd();const L=l;l=c=>L(c)||r(c)}return l}
  function parseAnd(){let l=parseNot();while(peek()&&peek().t==='id'&&peek().v==='and'){next();const r=parseNot();const L=l;l=c=>L(c)&&r(c)}return l}
  function parseNot(){if(peek()&&peek().t==='id'&&peek().v==='not'){next();const e=parseNot();return c=>!e(c)}return parseCmp()}
  function parseCmp(){
    const l=parseSum();const k=peek();
    if(k&&k.t==='id'&&k.v==='is'){next();
      if(peek()&&peek().t==='id'&&peek().v==='true'){next();return c=>!!l(c)}
      if(peek()&&peek().t==='id'&&peek().v==='not'){next();const r=parseSum();return c=>l(c)!==r(c)}
      const r=parseSum();return c=>l(c)===r(c)}
    if(k&&k.t==='op'&&['>','<','=','>=','<=','<>','!=','=='].includes(k.v)){next();const r=parseSum();
      const f={'>':(a,b)=>a>b,'<':(a,b)=>a<b,'=':(a,b)=>a===b,'==':(a,b)=>a===b,'>=':(a,b)=>a>=b,'<=':(a,b)=>a<=b,'<>':(a,b)=>a!==b,'!=':(a,b)=>a!==b}[k.v];
      return c=>f(l(c),r(c))}
    return c=>!!l(c);
  }
  function parseSum(){let l=parseProd();while(peek()&&peek().t==='op'&&(peek().v==='+'||peek().v==='-')){const o=next().v,r=parseProd(),L=l;l=o==='+'?c=>L(c)+r(c):c=>L(c)-r(c)}return l}
  function parseProd(){let l=parseUnary();while(peek()&&peek().t==='op'&&(peek().v==='*'||peek().v==='/')){const o=next().v,r=parseUnary(),L=l;l=o==='*'?c=>L(c)*r(c):c=>L(c)/(r(c)||1)}return l}
  function parseUnary(){if(peek()&&peek().t==='op'&&peek().v==='-'){next();const e=parseUnary();return c=>-e(c)}return parseAtom()}
  function parseAtom(){
    const k=next();if(!k)throw new Error('incomplete condition');
    if(k.t==='num')return()=>k.v;
    if(k.t==='op'&&k.v==='('){const e=parseOr();expect('op',')');return e}
    if(k.t==='id'){
      if(k.v in OPP_STATES)return()=>OPP_STATES[k.v];
      if(k.v==='true')return()=>true;if(k.v==='false')return()=>false;
      const alias={opp:'opponent'}[k.v]||k.v;
      const known=['endurance','endurance_percent','score','round','roundswon','roundslost','decision_won','decision_lost','opponent','mycuts','hiscuts','mystuns','hisstuns','myknockdowns','hisknockdowns','warnings','opptiring'];
      if(!known.includes(alias))throw new Error(`unknown word "${k.v}"`);
      return c=>c[alias];
    }
    throw new Error(`unexpected "${k.v}"`);
  }
}
/* Split a whole plan into statements. Returns {stmts, errors:[{line,text,msg}]} */
function parsePlan(src){
  const stmts=[],errors=[];
  const lines=(src||'').split(/\r?\n/);
  /* join into statements: break on ';', on a new "N)" or "if" at line start, or on a line that starts a fresh tactic */
  let buf='',bufLine=0;const pieces=[];
  const flush=()=>{if(buf.trim())pieces.push({text:buf.trim(),line:bufLine});buf=''};
  lines.forEach((raw,li)=>{
    const ln=raw.replace(/#.*$/,'');
    if(!ln.trim())return;
    const starts=/^\s*(\d+\s*\)|if\b|\d+[hbcoHBCO]?\s*\/)/i.test(ln);
    if(starts&&buf.trim()&&!/\b(and|or|not|then|if)\s*$/i.test(buf.trim())&&!/[+\-*(<>=]\s*$/.test(buf.trim()))flush();
    if(!buf.trim())bufLine=li+1;
    ln.split(';').forEach((part,k,arr)=>{buf+=' '+part;if(k<arr.length-1)flush()});
  });
  flush();
  let cur=1;
  for(const pc of pieces){
    try{const toks=tokenize(pc.text);if(!toks.length)continue;const s=parseStatement(toks);if(s.round!==null)cur=s.round;s.from=cur;s.text=pc.text;s.idx=stmts.length;stmts.push(s)}
    catch(e){errors.push({line:pc.line,text:pc.text,msg:e.message})}
  }
  return{stmts,errors};
}
/* Choose this round's instructions. Last true line wins; numbered blocks sorted by round. */
function choosePlan(parsed,ctx){
  const list=parsed.stmts.filter(s=>s.from<=ctx.round).sort((a,b)=>a.from-b.from||a.idx-b.idx);
  let tactic=null,towel=false;const msgs={};
  for(const s of list){
    let ok=true;if(s.cond){try{ok=!!s.cond(ctx)}catch(e){ok=false}}
    if(!ok)continue;
    if(s.action.towel)towel=true;else if(s.action.msg)msgs[s.action.msg]=s.action.text;else tactic=s.action;
  }
  return{tactic:tactic||{agg:6,pow:6,def:8,tgt:'Opp',style:'none',dirty:false},towel,msgs};
}
