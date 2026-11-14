"""Bot gyms b4-b7: five fighters per division (one of each type) in every gym. Original names and plans."""
import json,random,uuid,sys
random.seed(int(sys.argv[1]) if len(sys.argv)>1 else 2611)
DIVS=[('Straw',105),('Junior Fly',108),('Fly',112),('Super Fly',115),('Bantam',118),('Super Bantam',122),('Feather',126),('Super Feather',130),('Light',135),('Welter',147),('Super Welter',154),('Middle',160),('Super Middle',168),('Light Heavy',175),('Cruiser',200),('Heavy',1000)]
BUILDS={'very light':.96,'light':.98,'normal':1,'heavy':1.02,'very heavy':1.04}
ORDER=['very heavy','heavy','normal','light','very light']
def R(x): return int(x+0.5)
def nat(h,b,st,ag): return R((160+9.2*(h-68))*BUILDS[b]+(st-12)*1.5-(ag-12)*1.0)
def minw(h,b,st,ag,cnd): w=nat(h,b,st,ag); return R(w-w*0.0025*(cnd+2))
K=['str','kp','spd','agl','chn','cnd']
TYPES={
 'Slugger':      dict(w=(.21,.03,.19,.15,.20,.22),dh=0,train=('str','cnd')),
 'KO Puncher':   dict(w=(.21,.05,.18,.17,.19,.20),dh=0, train=('str','kp')),
 'Dancer':       dict(w=(.15,.02,.23,.24,.16,.20),dh=1, train=('agl','spd')),
 'Counterpuncher':dict(w=(.19,.03,.20,.17,.19,.22),dh=-1,train=('spd','agl')),
 'Clincher':     dict(w=(.18,.02,.19,.16,.20,.25),dh=0,train=('cnd','chn')),
}
LATE="score + 12 - round < 0 and endurance_percent >= 40"
AHEAD="score > 2*(1 + 12 - round)"
def plan(t,temper):
  P={
  'Slugger':["# Slugger: walk him down and break the body",f"{6+temper}B/6/{8-temper} (inside)","if opponent <= tired then 7/7/6 (inside)","if hisstuns > 0 then 7H/8/5",f"if {LATE} then 8H/8/4",f"if {AHEAD} then 3/3/14","if endurance_percent < 40 then 4/4/12 (clinch)"],
  'KO Puncher':["# KO Puncher: set it up, then go for the chin",f"{6+temper}/6/{8-temper}","if opponent <= tired then 7/8/5","if hisstuns > 0 then 7H/9/4",f"if {LATE} then 8H/9/3",f"if {AHEAD} then 3/3/14","if endurance_percent < 40 then 4/5/11 (clinch)"],
  'Dancer':["# Dancer: stick, move and never stand still",f"{5+temper}H/4/{11-temper} (ring)","if round <= 3 then 4H/3/13 (ring)","if opponent = exhausted then 7H/7/6","if score < 0 and round >= 7 then 6H/5/9 (ring)",f"if {AHEAD} then 2/2/16 (ring)","if endurance_percent < 45 then 4/3/13 (ring)"],
  'Counterpuncher':["# Counterpuncher: make him miss, make him pay",f"{6+temper}/6/{8-temper} (counter)","if score < 1 then 7/6/7 (counter)","if opponent <= tired then 6H/6/8 (counter)",f"if {LATE} then 7/7/6",f"if {AHEAD} then 2/2/16","if endurance_percent < 45 then 4/4/12 (counter)"],
  'Clincher':["# Clincher: tie him up and drown him late",f"{5+temper}B/5/{10-temper} (clinch)","if opponent <= tired then 7B/6/7 (inside)","if opponent = exhausted then 7H/8/5 (inside)",f"if {LATE} then 8/7/5 (inside)",f"if {AHEAD} then 2/2/16 (clinch)","if endurance_percent < 40 then 3/3/14 (clinch)"],
  }
  return "\n".join(P[t])
FIRST="""Abel Ade Alonzo Amos Arlo Arturo August Bastian Beau Bennett Boris Brady Bram Cade Calvin Cecil Chance Cliff Colton Cyrus Dale Dante Darnell Deacon Dexter Dimitri Donnie Dorian Earl Efrain Elias Emeka Emmett Enzo Ernesto Ezra Felix Floyd_ Garrett Gideon Grady Hank Harlan Hollis Hugo Ignacio Isaiah Jabari Jalen Jasper Joaquin Jonah Judd Kareem Kendrick Kofi Lamar Lance Leland Lorenzo Lucius Malik Mateo Mason Mitch Monty Nestor Nico Noel Obi Orlando Otis Pablo Percy Quentin Quincy Ramon Rhett Roman Rufus Saul Silas Stefan Thad Tobias Tyrell Ulysses Vaughn Virgil Wade Walker Xavier Yusuf Zane""".split()
LAST="""Abernathy Acosta Ambrose Arceneaux Ashby Barlow Beckett Bellamy Blackwood Boudreaux Bramwell Calloway Cantrell Carrasco Chatman Colfax Crenshaw Dabney Delacroix Draper Dunmore Easton Echols Fairbanks Falcone Fenwick Galloway Garland Gentry Gutierrez Halloran Harrow Hastings Hightower Holloway Ingram Jarvis Kessler Kingsley Lachance Landry Larkin Lockhart Maddox Mancini Marchetti McCrae Mendez Merriweather Nakamura Northcutt Obuya Okafor Oyelaran Pembrook Pettigrew Quintero Radcliffe Rainwater Rasheed Reinholt Rocha Rutledge Salcedo Santangelo Shackleford Slade Stroud Tamayo Thibodeaux Treadwell Underhill Valdez Vasquez Voss Wakefield Whitaker Winslow Yarbrough Zamora Zeller""".split()
FIRST=[f for f in FIRST if not f.endswith('_')]
NICK=["Brick House","The Mechanic","Quicksilver","Sandman","The Mailman","Big Train","Thunder","The Undertaker","Lockjaw","Night Train","The Bull","Mojo","Showtime","Ice Water","The Tailor","Gravedigger","Little Hands","The Freight","Rawhide","Hammerhand","Easy Money","The Prospector","Dynamo","Sweet Feet","Ironside","Copperhead","The Anvil","Cyclone","Tank","Velvet","","","","","","",""]
GYMS=[("Bayou Iron Works","New Orleans, Louisiana","Hot gym, long rounds. We fight every type in every division, so bring your best plan.",0,["New Orleans, Louisiana","Baton Rouge, Louisiana","Lafayette, Louisiana","Houston, Texas","Mobile, Alabama","Biloxi, Mississippi","Kingston, Jamaica","Havana, Cuba"]),
      ("Steel Valley Boxing","Pittsburgh, Pennsylvania","Mill-town fighters. Five styles in every weight class, and none of them back up.",1,["Pittsburgh, Pennsylvania","Youngstown, Ohio","Buffalo, New York","Erie, Pennsylvania","Wheeling, West Virginia","Gary, Indiana","Glasgow, Scotland","Cardiff, Wales"]),
      ("Desert Wind Fight Club","Phoenix, Arizona","Patient boxers from the desert. We win rounds and wait for you to fade.",-1,["Phoenix, Arizona","Tucson, Arizona","El Paso, Texas","Albuquerque, New Mexico","Hermosillo, Mexico","Mexicali, Mexico","Reno, Nevada","Las Cruces, New Mexico"]),
      ("Harbor Lights Boxing","Baltimore, Maryland","A waterfront gym with a fighter for every style. Take your pick.",0,["Baltimore, Maryland","Norfolk, Virginia","Boston, Massachusetts","Providence, Rhode Island","Liverpool, England","Dublin, Ireland","Lagos, Nigeria","San Juan, Puerto Rico"])]
GYMS2=[("Rust Belt Pugilists","Detroit, Michigan","Factory hours, factory toughness. One of every style in every weight class.",1,["Detroit, Michigan","Flint, Michigan","Toledo, Ohio","Akron, Ohio","Milwaukee, Wisconsin","Windsor, Ontario","Sheffield, England","Leeds, England"]),
       ("Pacific Coast Boxing","San Diego, California","Sunny gym, sharp boxers. Five styles deep in every division.",-1,["San Diego, California","Los Angeles, California","Oxnard, California","Tijuana, Mexico","Ensenada, Mexico","Honolulu, Hawaii","Cebu, Philippines","Auckland, New Zealand"]),
       ("Lone Star Fight Factory","San Antonio, Texas","Big state, big punchers, and a fighter for every style.",0,["San Antonio, Texas","Dallas, Texas","Fort Worth, Texas","Corpus Christi, Texas","Laredo, Texas","Monterrey, Mexico","Oklahoma City, Oklahoma","Tulsa, Oklahoma"]),
       ("Atlantic City Ring Club","Atlantic City, New Jersey","Boardwalk fighters. Every style, every weight, every night.",1,["Atlantic City, New Jersey","Camden, New Jersey","Trenton, New Jersey","Philadelphia, Pennsylvania","Wilmington, Delaware","Bronx, New York","Kingston, Jamaica","Santo Domingo, Dominican Republic"])]
import os
if os.environ.get('SET')=='2': GYMS=GYMS2
OFF=0xb8 if os.environ.get('SET')=='2' else 0xb4
OUT='bots3.json' if os.environ.get('SET')=='2' else 'bots2.json'
taken=set(json.load(open(sys.argv[2]))) if len(sys.argv)>2 else set()
def name():
  while True:
    n=random.choice(FIRST)+' '+random.choice(LAST)
    if n not in taken: taken.add(n);return n
def stats(t,hgt,cut):
  pool=70-hgt-cut;w=TYPES[t]['w']
  st=[max(1,round(pool*x)) for x in w]
  st[1]=min(st[1],max(0,st[0]//2))
  order=[5,2,3,4,0]
  i=0
  while sum(st)!=pool:
    k=order[i%5]
    if sum(st)<pool: st[k]+=1
    elif st[k]>3: st[k]-=1
    i+=1
  st=[min(30,x) for x in st]
  while sum(st)<pool: st[5 if st[5]<30 else 4]+=1
  return dict(zip(K,st))
def fit(t,lim,prev):
  dh=TYPES[t]['dh']+random.choice([-1,0,0,1])
  if lim>=1000:
    h=74+dh+random.choice([0,1]);b=random.choice(['heavy','very heavy','normal'])
    cut=random.choice([1,2,2,3]);return h,b,cut,stats(t,h-60,cut)
  # base height: tallest normal build that makes weight with average stats
  base=max(h for h in range(60,84) if minw(h,'normal',12,12,12)<=lim)
  tgt=base+dh;cut=random.choice([1,2,2,3]);best=None
  for h in range(tgt-2,tgt+4):
    F=stats(t,h-60,cut)
    for b in ORDER:
      m=minw(h,b,F['str'],F['agl'],F['cnd'])
      if m<=lim:
        sc=(lim-m)+2*abs(h-tgt)
        if best is None or sc<best[0]: best=(sc,h,b,F)
  _,h,b,F=best;return h,b,cut,F
out=[]
for gi,(gn,loc,desc,temper,towns) in enumerate(GYMS):
  g={'id':str(uuid.UUID(int=OFF+gi)),'gym':gn,'loc':loc,'desc':desc,'fighters':[]}
  n=0
  for di,(d,lim) in enumerate(DIVS):
    prev=DIVS[di-1][1] if di else 0
    for t in TYPES:
      h,b,cut,F=fit(t,lim,prev)
      tr=TYPES[t]['train']
      g['fighters'].append(dict(F,hgt=h-60,cut=cut,build=b,name=name(),nick=random.choice(NICK),home=random.choice(towns),div=d,
        plan=plan(t,temper),planName=f"{t} ({gn.split()[0]})",train=tr[0],train2=tr[1],style=t,key=f"b{n}"));n+=1
  out.append(g)
json.dump(out,open('/home/claude/contenders-/bots/'+OUT,'w'),indent=1)
for g in out:
  print(g['gym'],len(g['fighters']))
for f in out[0]['fighters'][::7]:
  print(' ',f['div'],f['style'],f['name'],f['hgt']+60,f['build'],[f[k] for k in K],f['cut'],nat(f['hgt']+60,f['build'],f['str'],f['agl']),minw(f['hgt']+60,f['build'],f['str'],f['agl'],f['cnd']),sum(f[k] for k in K)+f['hgt']+f['cut'])
