"""Pack a generated bot file (bots2.json / bots3.json) into one SQL load script. Usage: SET=2 python3 bots/pack_sql.py bots/bots3.json > load.sql"""
import json,sys,os
src=open(os.path.join(os.path.dirname(__file__),'gen2.py')).read().split("out=[]")[0]
FILE=sys.argv[1];sys.argv=[sys.argv[0]]
exec(src)
G=json.load(open(FILE))
TL=list(TYPES);BL=list(BUILDS);DL=[d for d,_ in DIVS]
rows=[];P={};PN={}
for gi,g in enumerate(G):
  towns=GYMS[gi][4]
  for f in g['fighters']:
    t=TL.index(f['style'])
    rows.append("|".join(map(str,[gi,f['key'],f['name'],NICK.index(f['nick']),towns.index(f['home']),DL.index(f['div']),t,f['hgt'],f['cut'],BL.index(f['build']),f['str'],f['kp'],f['spd'],f['agl'],f['chn'],f['cnd']])))
    P[f"{gi}|{t}"]=f['plan'];PN[f"{gi}|{t}"]=f['planName']
d=lambda o:"$j$"+json.dumps(o)+"$j$::jsonb"
gy=[[g['id'],g['gym'],g['loc'],g['desc']] for g in G]
print(f"""begin;
create temp table nb on commit drop as with cfg as (select {d(P)} pl, {d(PN)} pn, {d(NICK)} nk, {d([g[4] for g in GYMS])} tw,
  {d(DL)} dv, {d(BL)} bl, {d(list(BUILDS.values()))} bm, {d([list(TYPES[t]['train']) for t in TYPES])} tr),
raw as (select string_to_array(x,'|') a from unnest(string_to_array($r${";".join(rows)}$r$,';')) x),
f as (select a[1]::int gi, a[2] k, a[3] nm, (select nk->>a[4]::int from cfg) nick, (select tw->a[1]::int->>a[5]::int from cfg) home,
  (select dv->>a[6]::int from cfg) div, a[7]::int ty, a[8]::int hgt, a[9]::int cut, (select bl->>a[10]::int from cfg) build, (select (bm->>a[10]::int)::numeric from cfg) bm,
  a[11]::int st, a[12]::int kp, a[13]::int sp, a[14]::int ag, a[15]::int ch, a[16]::int cn from raw),
f2 as (select f.*, floor((160+9.2*(hgt+60-68))*bm+(st-12)*1.5-(ag-12)+0.5)::int w,
  (select pl->>(gi||'|'||ty) from cfg) plan, (select pn->>(gi||'|'||ty) from cfg) pname,
  (select tr->ty->>0 from cfg) t1, (select tr->ty->>1 from cfg) t2 from f)
select f2.*, floor(w-w*0.0025*(cn+2)+0.5)::int mw, regexp_replace(k,'\\D','','g')::int ord from f2;
create temp table ng on commit drop as select (e->>0)::uuid id, e->>1 gym, e->>2 loc, e->>3 descr, (o-1)::int gi from jsonb_array_elements({d(gy)}) with ordinality t(e,o);
insert into auth.users(id,instance_id,aud,role,email,raw_user_meta_data,raw_app_meta_data,created_at,updated_at)
  select id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','bot'||right(id::text,2)||'@bots.contenders.invalid',jsonb_build_object('gym',gym),'{{}}'::jsonb,now(),now() from ng;
update profiles p set is_bot=true, location=ng.loc, description=ng.descr from ng where p.id=ng.id;
insert into gym_state(user_id,data) select ng.id, jsonb_build_object('roster',(select jsonb_agg(k order by ord) from nb where nb.gi=ng.gi),'retired','[]'::jsonb,'champs','{{}}'::jsonb,'log','[]'::jsonb,'div','Middle','bout','12','week',1,'practiceCleared',true,'plans','{{}}'::jsonb)
 || (select jsonb_object_agg(k, jsonb_build_object('name',nm,'nick',nick,'home',home,'div',div,'hgt',hgt,'cut',cut,'build',build,'str',st,'kp',kp,'spd',sp,'agl',ag,'chn',ch,'cnd',cn,'plan',plan,'planName',pname,'train',t1,'train2',t2,'rec','[0,0,0,0]'::jsonb,'hist','[]'::jsonb,'rating',0,'status',0,'streak',0,'ip',0,'earn',0,'fans',0,'ppv',0,'locked',true)) from nb where nb.gi=ng.gi) from ng;
insert into gym_public(user_id,data) select ng.id, jsonb_build_object('bot',true,'retired','[]'::jsonb,'fighters',(select jsonb_agg(jsonb_build_object('id',k,'name',nm,'nick',nick,'home',home,'div',div,'hgt',hgt,'w',w,'mw',mw,'rec','[0,0,0,0]'::jsonb,'hist','[]'::jsonb,'plan',pname,'train',t1,'active',true,'rating',0,'status',0,'streak',0,'titles','[]'::jsonb,'earn',0,'fans',0,'ppv',0) order by ord) from nb where nb.gi=ng.gi)) from ng;
select ng.gym, p.is_bot, jsonb_array_length(s.data->'roster') roster, jsonb_array_length(c.data->'fighters') pub, (select count(*) from nb where nb.gi=ng.gi and st+kp+sp+ag+ch+cn+hgt+cut<>70) bad70
 from ng join profiles p on p.id=ng.id join gym_state s on s.user_id=ng.id join gym_public c on c.user_id=ng.id;
commit;""")
