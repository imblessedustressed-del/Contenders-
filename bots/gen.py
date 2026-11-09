import json,random,uuid
random.seed(7)
DIVS=[('Straw',105),('Junior Fly',108),('Fly',112),('Super Fly',115),('Bantam',118),('Super Bantam',122),('Feather',126),('Super Feather',130),('Light',135),('Welter',147),('Super Welter',154),('Middle',160),('Super Middle',168),('Light Heavy',175),('Cruiser',200),('Heavy',1000)]
BUILDS={'very light':.96,'light':.98,'normal':1,'heavy':1.02,'very heavy':1.04}
def nat(h,b,st,ag=12): return round((160+9.2*(h-68))*BUILDS[b]+(st-12)*1.5-(ag-12)*1.0)
def minw(h,b,st,cnd,ag=12): w=nat(h,b,st,ag); return round(w-w*0.0025*(cnd+2))
STY={
 'Slugger':((.20,.06,.20,.19,.17,.18),"# slugger\n7/6/7\nif opponent is tired then 8/7/5\nif hisstuns > 0 then 7H/9/4\nif endurance_percent < 45 then 4/4/12 (clinch)\nif score + 12 - round < 0 then 8H/9/3\nif score > 2*(1 + 12 - round) then 2/2/16"),
 'Dancer':((.13,.03,.20,.27,.17,.20),"# dancer\n7/6/7 (feint)\nif round <= 2 then 6/5/9 (ring)\nif endurance_percent < 50 then 4/3/13\nif score < 0 and round >= 7 then 6H/6/8 (ring)\nif score > 2*(1 + 12 - round) then 2/1/17 (ring)"),
 'Counterpuncher':((.16,.04,.25,.20,.15,.20),"# counter\n5/4/11 (counter)\nif score < 0 then 6/5/9 (counter)\nif endurance_percent < 50 then 4/4/12 (counter)\nif score > 2*(1 + 12 - round) then 2/2/16"),
 'Clincher':((.17,.03,.20,.20,.18,.22),"# clincher\n7/5/8\nif endurance_percent < 60 then 5/5/10 (clinch)\nif opponent is tired then 7B/6/7\nif opponent is exhausted then 7H/8/5\nif endurance_percent < 40 then 2/2/14 (clinch)"),
 'Balanced':((.16,.04,.21,.21,.18,.20),"# balanced\n7/5/8\nif opponent is tired then 7/6/7\nif endurance_percent < 50 then 5/4/11\nif score + 12 - round < 0 then 8/7/5\nif score > 2*(1 + 12 - round) then 2/2/16"),
}
FIRST="Ray Tommy Eddie Carlos Vic Dwayne Mickey Sonny Luis Andre Jimmy Rocco Terrell Hector Billy Ike Marco Jesse Cal Reggie Danny Frankie Omar Wes Gus Benny Lonnie Rafael Curtis Nate Sal Duke Teo Jake".split()
LAST="Malone Okoro Vance Delgado Brennan Sutter Kowal Ferris Mayweather_ Castillo Hollis Bright Quarry Dunleavy Pryor Ruelas Tate Morrow Kincaid Abara Holt Spinner Redd Garza Lyle Pacheco Sloane Carver Ibarra Moss Duran_ Whitlock Benn_ Corrales_".split()
LAST=[l for l in LAST if not l.endswith('_')]
NICK=["The Hammer","Silk","Iron","Lights Out","The Butcher","Smooth","Bulldog","The Professor","Hurricane","Ghost","Cobra","Stone","Kid Dynamite","The Surgeon","Bad News","Tornado","",""," ",""]
TOWNS=["Detroit, Michigan","Philadelphia, Pennsylvania","Las Vegas, Nevada","San Antonio, Texas","Cleveland, Ohio","Newark, New Jersey","Memphis, Tennessee","Fresno, California","Belfast, Northern Ireland","Manchester, England","Tijuana, Mexico","Manila, Philippines","Accra, Ghana","Brooklyn, New York","Chicago, Illinois","Kansas City, Missouri"]
GYMS=[("Iron Mile Boxing Club","Detroit, Michigan","A blue-collar gym. We work the body and wear you down."),
      ("Southside Hammers","Chicago, Illinois","Power punchers. Come to trade or don't come at all."),
      ("Northern Lights Pugilists","Belfast, Northern Ireland","Slick boxers. You won't hit what you can't find."),
      ("Old Dominion Fight Co.","Richmond, Virginia","Old-school ring generals. We study your tapes.")]
GSTY=[['Clincher','Slugger','Balanced'],['Slugger','Slugger','Balanced'],['Dancer','Counterpuncher','Balanced'],['Counterpuncher','Balanced','Dancer']]
used=set()
def name():
  while True:
    n=random.choice(FIRST)+' '+random.choice(LAST)
    if n not in used: used.add(n);return n
def build(div,lim,style):
  w,plan=STY[style]
  best=None
  for h in range(60,85):
    for b in ['very heavy','heavy','normal','light','very light']:
      if lim>=1000:
        if 72<=h<=77 and b in ('heavy','very heavy'): best=(h,b)
        continue
      if minw(h,b,12,12)<=lim and (best is None or nat(h,b,12)>nat(*best,12)): best=(h,b)
  h,b=best
  if lim>=1000: h=random.choice([73,74,75,76]);b=random.choice(['heavy','very heavy'])
  hgt=h-60;cut=random.choice([2,2,3]);pool=70-hgt-cut
  st=[max(3,round(pool*x)) for x in w]
  st[1]=min(st[1],st[0]//3)
  i=0
  while sum(st)!=pool:
    k=[0,2,3,4,5][i%5];st[k]+=1 if sum(st)<pool else -1;i+=1
  st[1]=min(st[1],st[0]//3)
  while sum(st)<pool: st[5]+=1
  F=dict(zip(['str','kp','spd','agl','chn','cnd'],st))
  # re-check weight with real str/cnd; lighten build if needed
  order=['very heavy','heavy','normal','light','very light']
  if lim<1000:
    while minw(h,b,F['str'],F['cnd'],F['agl'])>lim and order.index(b)<4: b=order[order.index(b)+1]
    while minw(h,b,F['str'],F['cnd'],F['agl'])>lim:
      h-=1;F['cnd']+=1
  return dict(F,hgt=h-60,cut=cut,build=b),plan
out=[]
for gi,(gname,loc,desc) in enumerate(GYMS):
  out.append({'id':str(uuid.UUID(int=0xb0+gi)),'gym':gname,'loc':loc,'desc':desc,'fighters':[]})
for di,(d,lim) in enumerate(DIVS):
  for gi in random.sample(range(4),2 if d not in ('Middle','Heavy','Welter') else 3):
    style=random.choice(GSTY[gi]);F,plan=build(d,lim,style)
    nm=name();nk=random.choice(NICK).strip()
    out[gi]['fighters'].append(dict(F,name=nm,nick=nk,home=random.choice(TOWNS),div=d,style=style,plan=plan,planName=f"{style} plan"))
json.dump(out,open('/home/claude/bots/bots.json','w'),indent=1)
for g in out:
  print(g['gym'],len(g['fighters']))
  for f in g['fighters']: print('  ',f['div'],f['name'],f['style'],f['hgt']+60,f['build'],nat(f['hgt']+60,f['build'],f['str'],f['agl']),minw(f['hgt']+60,f['build'],f['str'],f['cnd'],f['agl']),sum(f[k] for k in ['str','kp','spd','agl','chn','cnd','hgt','cut']))
