"""Bare Knuckles bot fighters: one per division in each of the eight big bot gyms (b4-bb), 128 in all.
Three BK types rotate (Grinder: ropes and endurance; Clincher: short and strong; Flasher: one big shot), built
the way BK managers build (very heavy, AGL level with STR, SPD about STR/3, low chin, CND 14-16).
Writes bots/bots_bk.json: [{id, gym, fighters:[{key, ...gym_state fighter}]}]. Usage: python3 bots/gen_bk.py SEED taken-names.json"""
import json,random,sys,os
sys.path.insert(0,os.path.dirname(__file__))
src=open(os.path.join(os.path.dirname(__file__),'gen2.py')).read().split("import os")[0]
seed=int(sys.argv[1]) if len(sys.argv)>1 else 1225;taken_file=sys.argv[2] if len(sys.argv)>2 else None
sys.argv=[sys.argv[0]];exec(src);random.seed(seed)
G1=GYMS;exec(open(os.path.join(os.path.dirname(__file__),'gen2.py')).read().split("import os")[1].split("OFF=")[0].replace("if os.environ.get('SET')=='2': GYMS=GYMS2",""))
ALL=[(0xb4+i,g) for i,g in enumerate(G1)]+[(0xb8+i,g) for i,g in enumerate(GYMS2)]
taken=set(json.load(open(taken_file))) if taken_file else set()
def nm():
  while True:
    n=random.choice(FIRST)+' '+random.choice(LAST)
    if n not in taken: taken.add(n);return n
BKT=['Grinder','Clincher','Flasher']
PLANS={
 'Grinder':["# BK Grinder: win the endurance war, then open up","3B/9/8 (ropes)","if round >= 6 and opponent >= tired then 3B/10/7 (ropes)","if round >= 12 and opponent >= tired then 4B/10/6 (ropes)","if round >= 18 and opponent = exhausted then 4/11/5 (ropes)","if round = 25 then 4H/11/5 (ropes)","if endurance_percent < 35 then 2/4/14 (clinch)"],
 'Clincher':["# BK Clincher: lean on him for 25 rounds","4B/8/8 (clinch)","if opponent >= tired then 4B/9/7 (clinch)","if opponent = exhausted then 4B/10/6 (clinch)","if round >= 20 and opponent = exhausted then 5B/10/5 (clinch)","if round = 25 then 5H/10/5 (clinch)","if endurance_percent < 30 then 2/3/15 (clinch)"],
 'Flasher':["# BK Flasher: one big shot can end a long night","3/8/9","if round <= 2 then 4H/9/7","if hisstuns > 0 then 6H/10/4","if round >= 20 and opponent >= tired then 4H/10/6","if endurance_percent < 40 then 2/4/14 (clinch)"],
}
def build_stats(t,pool):
  # returns dict str,kp,spd,agl,chn,cnd summing to pool
  if t=='Grinder': cnd=random.choice([14,15,15]);chn=random.choice([8,9]);kp=0
  elif t=='Clincher': cnd=random.choice([15,16]);chn=random.choice([8,9]);kp=0
  else: cnd=random.choice([13,14]);kp=random.choice([3,4]);chn=random.choice([8,9])
  rest=pool-cnd-chn-kp
  if t=='Clincher': s=round(rest*0.46);a=round(rest*0.36);sp=rest-s-a
  elif t=='Flasher': s=round(rest*0.44);a=round(rest*0.36);sp=rest-s-a
  else: s=round(rest*3/7);a=s;sp=rest-s-a
  s=max(s,3*kp)
  return dict(str=s,kp=kp,spd=max(1,sp),agl=a,chn=chn,cnd=cnd)
def fit(t,lim,prev):
  best=None
  for h in range(60,86):
    for cut in [1]:
      F=build_stats(t,70-(h-60)-cut)
      if F['spd']<1 or sum(F.values())+(h-60)+cut!=70: continue
      for b in (['very heavy','heavy','normal'] if t!='Flasher' else ['very heavy','heavy','normal','light']):
        m=minw(h,b,F['str'],F['agl'],F['cnd'])
        if lim>=1000: ok=196<=m<=212
        else: ok=m<=lim and m>prev-2
        if not ok: continue
        want=-3 if t=='Clincher' else 0
        sc=abs((lim-m) if lim<1000 else 0)+ (0 if b=='very heavy' else 3)+abs(want)*0
        key=(sc, -h if t!='Clincher' else h)
        if best is None or key<best[0]: best=(key,h,b,cut,F)
  return best
out=[]
for gi,(num,g) in enumerate(ALL):
  gn,loc,desc,temper,towns=g
  gym={'id':'00000000-0000-0000-0000-0000000000'+format(num,'02x'),'gym':gn,'fighters':[]}
  for di,(d,lim) in enumerate(DIVS):
    prev=DIVS[di-1][1] if di else 0
    t=BKT[(gi+di)%3]
    r=fit(t,lim,prev)
    if not r: t='Grinder';r=fit(t,lim,prev)
    _,h,b,cut,F=r
    tr={'Grinder':('agl','cnd'),'Clincher':('str','cnd'),'Flasher':('str','chn')}[t]
    gym['fighters'].append(dict(key=f"k{di}",region='bk',name=nm(),nick=random.choice(NICK),home=random.choice(towns),div=d,hgt=h-60,cut=cut,build=b,**F,
      plan="\n".join(PLANS[t]),planName=f"BK {t}",train=tr[0],train2=tr[1],rec=[0,0,0,0],hist=[],rating=0,status=0,streak=0,ip=0,earn=0,fans=0,ppv=0,locked=True,
      w=nat(h,b,F['str'],F['agl']),mw=minw(h,b,F['str'],F['agl'],F['cnd']),style='BK '+t))
  out.append(gym)
json.dump(out,open(os.path.join(os.path.dirname(__file__),'bots_bk.json'),'w'))
for gm in out[:2]:
  for f in gm['fighters'][::3]: print(gm['gym'][:12],f['div'],f['style'],f['hgt']+60,f['build'],[f[k] for k in ['str','kp','spd','agl','chn','cnd']],f['mw'],sum(f[k] for k in ['str','kp','spd','agl','chn','cnd'])+f['hgt']+f['cut'])
print(sum(len(g['fighters']) for g in out),'fighters')
