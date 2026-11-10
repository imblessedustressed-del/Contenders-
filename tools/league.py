"""Contenders league runner (commissioner tool).

Uses the real engine in the built index.html (headless Chromium via Playwright), then prints SQL for the
commissioner to run with the Supabase tool.

  python3 tools/league.py venue  in.json   -> prints the venue JSON for a new bout (with venue.tv)
     in.json: {"div": "Heavy", "ratings": [0, 0], "belt": null, "star": 1}
  python3 tools/league.py run    in.json   -> prints the SQL that records a fought bout
     in.json: {"bout": {bouts row: id, fight_date, div, belt, venue, red_user, red_fid, blue_user, blue_fid},
               "red":  {"F": full fighter object from gym_state, "gym": "gym name", "bot": true/false},
               "blue": {...same...},
               "star": 1, "champSide": null, "held": 0}

The SQL updates bouts (status done, summary, result), bout_private (each human manager's own per-round tactics),
both fighters in gym_state (record, rating/status, earnings, fans, PPV, history; a fighter flagged retireAfter is
moved to his gym's retired list) and both gyms' public cards.
"""
import asyncio, json, sys, datetime, os
from playwright.async_api import async_playwright

PAGE = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))

JS_VENUE = '''(a)=>{const contender=Math.max(...a.ratings)>=3;const tier=venueTier(a.div,a.ratings[0],a.ratings[1],a.belt,a.star||1,contender);
  const v=pickVenue(tier);v.tv=broadcastTier(a.belt,a.star||1,contender);return v}'''

JS_RUN = '''(a)=>{const B=a.bout,FA=a.red.F,FB=a.blue.F,div=B.div,belt=B.belt||null,star=a.star||1;
  const rR=FA.rating||0,rB=FB.rating||0;
  const f=simulate(prepFighter(FA,FA,FB,div),prepFighter(FB,FA,FB,div),12);
  const r=f.result,how=r.decision?r.type.toLowerCase():`${r.type} in round ${r.round} (${fmt(r.t)})`,score=f.totals.map(t=>t.join('-')).join(', ');
  const purse=boutPurses(rR,rB,belt,a.champSide??null,star);
  const v=B.venue||{name:'',city:'',cap:1000,tier:'club',tv:'stream'};
  const att=attendanceFor(v,Math.max(rR,rB),belt,star);
  const tier=v.tv||'stream';
  const fans=fightFans(f,belt,tier);
  const tv=broadcastResult(tier,[FA.fans||0,FB.fans||0],[rR,rB],[FA.home,FB.home],a.held||0,purse);
  const d=new Date(B.fight_date+'T12:00:00');
  const date=d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  const sdate=d.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
  const b={rounds:12,belt,div,gym:'',gyms:[a.red.gym,a.blue.gym],recs:[FA.rec.slice(),FB.rec.slice()],date};
  const mgr=[f.rounds.map(R=>(R.mgr||[])[0]||''),f.rounds.map(R=>(R.mgr||[])[1]||'')];
  f.rounds.forEach(R=>{delete R.mgr});
  f.S=f.S.map(x=>({n:x.n,F:{name:x.F.name,nick:x.F.nick,home:x.F.home,hgt:x.F.hgt}}));
  const out=[JSON.parse(JSON.stringify(FA)),JSON.parse(JSON.stringify(FB))];
  [0,1].forEach(i=>{const me=i?FB:FA,op=i?FA:FB,opGym=i?a.red.gym:a.blue.gym;
    applyResult(out[i],i,{w:r.w,decision:r.decision,type:r.type,how,score,ip:f.ip[i],purse:purse[i]+((tv.pay||[0,0])[i]||0),
      fans:fans[i],buys:tv.buys||0,oppRating:i?rR:rB,belt},
      {id:'L'+B.id,bout:B.id,oid:null,oh:ht(60+op.hgt),opp:op.name,ogym:opGym,div,belt,date:sdate,week:1})});
  return{summary:{w:r.w,decision:!!r.decision,type:r.type,round:r.round,how,score,ip:f.ip,ratings:[rR,rB],purse,att,fans,tv},
    result:{f,b},mgr,after:out}}'''


def q(s):
    return "$Q$" + s + "$Q$"


def js(o):
    return "$J$" + json.dumps(o) + "$J$::jsonb"


async def page_eval(fn, arg):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/supabase-js*', lambda r: r.abort())
        await pg.goto(PAGE)
        await pg.wait_for_timeout(500)
        out = await pg.evaluate(fn, arg)
        await b.close()
        if errs:
            print('-- page errors: ' + '; '.join(errs), file=sys.stderr)
        return out


def card_entry(F, fid):
    return {'rec': F['rec'], 'rating': F.get('rating', 0), 'status': F.get('status', 0), 'streak': F.get('streak', 0),
            'earn': F.get('earn', 0), 'fans': F.get('fans', 0), 'ppv': F.get('ppv', 0),
            'hist': [{k: h.get(k) for k in ['opp', 'oh', 'div', 'belt', 'date', 'week', 'res', 'score', 'icon', 'plan', 'ogym', 'bout', 'earned']}
                     for h in (F.get('hist') or [])[:25]]}


def fighter_sql(uid, fid, F, div):
    if F.get('retireAfter'):
        F2 = dict(F, fid=fid, div=div)
        F2.pop('retireAfter', None)
        return [
            f"update gym_state set data = (data - {q(fid)}) || jsonb_build_object('roster', coalesce((data->'roster'),'[]'::jsonb) - {q(fid)}, "
            f"'retired', jsonb_build_array({js(F2)}) || coalesce(data->'retired','[]'::jsonb)) where user_id='{uid}';",
            f"update gym_public set data = jsonb_set(jsonb_set(data,'{{fighters}}',(select coalesce(jsonb_agg(f order by o),'[]'::jsonb) from jsonb_array_elements(data->'fighters') with ordinality t(f,o) where f->>'id'<>{q(fid)})),"
            f"'{{retired}}', jsonb_build_array({js(dict(card_entry(F2, fid), id='r0', name=F2['name'], div=div, active=False, titles=[]))}) || coalesce(data->'retired','[]'::jsonb)) where user_id='{uid}';"]
    return [
        f"update gym_state set data = jsonb_set(data, array[{q(fid)}], {js(F)}) where user_id='{uid}';",
        f"update gym_public set data = jsonb_set(data,'{{fighters}}',(select jsonb_agg(case when f->>'id'={q(fid)} then f || {js(card_entry(F, fid))} else f end order by o) from jsonb_array_elements(data->'fighters') with ordinality t(f,o))) where user_id='{uid}';"]


def main():
    mode, path = sys.argv[1], sys.argv[2]
    a = json.load(open(path))
    if mode == 'venue':
        print(json.dumps(asyncio.run(page_eval(JS_VENUE, a))))
        return
    out = asyncio.run(page_eval(JS_RUN, a))
    B = a['bout']
    sql = ['begin;',
           f"update bouts set status='done', summary={js(out['summary'])}, result={js(out['result'])} where id={B['id']} and status<>'done';"]
    for i, side in enumerate(['red', 'blue']):
        uid, fid = B[side + '_user'], B[side + '_fid']
        if not a[side].get('bot'):
            sql.append(f"insert into bout_private(bout_id,user_id,mgr) values ({B['id']},'{uid}',{js(out['mgr'][i])}) on conflict do nothing;")
        sql += fighter_sql(uid, fid, out['after'][i], B['div'])
    sql.append(f"select id,status,summary->>'how' how,summary->>'w' w from bouts where id={B['id']};")
    sql.append('commit;')
    print('\n'.join(sql))
    s = out['summary']
    print(f"-- {a['red']['F']['name']} vs {a['blue']['F']['name']}: winner {'red' if s['w']==0 else 'blue' if s['w']==1 else 'draw'}, {s['how']}, {s['score']}", file=sys.stderr)


if __name__ == '__main__':
    main()
