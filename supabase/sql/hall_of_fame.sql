create table if not exists public.hall_of_fame (
  id bigserial primary key, kind text not null check (kind in ('fighter','gym')), wing text not null default '',
  class_month date not null, inducted_at timestamptz not null default now(),
  user_id uuid not null, fid text not null default '', name text, nick text, gym text, div text,
  w int, l int, d int, ko int, title_wins int, champions int, peak int, p4p_weeks int, p4p_top int, earn bigint,
  best_bout bigint, points numeric, first_ballot boolean default false, citation text,
  unique (kind, user_id, fid));
alter table public.hall_of_fame enable row level security;
drop policy if exists "hof readable" on public.hall_of_fame;
create policy "hof readable" on public.hall_of_fame for select using (true);
grant select on public.hall_of_fame to anon, authenticated;

create or replace function private.hof_fighters()
returns table (user_id uuid, fid text, wing text, active boolean, name text, nick text, gym text, div text, w int, l int, d int, ko int,
  title_wins int, peak int, p4p_weeks int, p4p_top int, earn bigint, best_bout bigint, fights int, retired_on text, points numeric)
language sql stable security definer set search_path = public, private as $$
  with f as (
    select g.user_id, k fid, true active, g.data->k v from gym_state g, jsonb_array_elements_text(g.data->'roster') k
    union all
    select g.user_id, r->>'fid', false, r from gym_state g, jsonb_array_elements(coalesce(g.data->'retired','[]')) r where r->>'fid' is not null),
  b as (
    select s.u, s.k, count(*) filter (where b.belt is not null and (b.summary->>'w')::int = s.side) tw,
      (array_agg(b.id order by (b.belt is not null and (b.summary->>'w')::int = s.side) desc,
         coalesce((b.summary->'ratings'->>(1-s.side))::int,0) desc, b.fight_date desc)
         filter (where (b.summary->>'w')::int = s.side and (b.result is not null or b.result_z is not null)))[1] best
    from bouts b cross join lateral (values (0,b.red_user,b.red_fid),(1,b.blue_user,b.blue_fid)) s(side,u,k)
    where b.status='done' group by s.u, s.k),
  pp as (select p.user_id, p.fid, count(*) wk, count(*) filter (where rank=1) top from p4p p group by 1,2)
  select f.user_id, f.fid, coalesce(f.v->>'region',''), f.active, trim(f.v->>'name'), trim(coalesce(f.v->>'nick','')), pr.gym, f.v->>'div',
    (f.v->'rec'->>0)::int, (f.v->'rec'->>1)::int, (f.v->'rec'->>2)::int, (f.v->'rec'->>3)::int,
    coalesce(b.tw,0)::int, coalesce((f.v->>'status')::int,0), coalesce(pp.wk,0)::int, coalesce(pp.top,0)::int,
    coalesce((f.v->>'earn')::numeric,0)::bigint, b.best,
    ((f.v->'rec'->>0)::int + (f.v->'rec'->>1)::int + (f.v->'rec'->>2)::int), f.v->>'retiredOn',
    round( (f.v->'rec'->>0)::int + 0.5*(f.v->'rec'->>3)::int - 0.5*(f.v->'rec'->>1)::int + 12*coalesce(b.tw,0)
      + 3*coalesce((f.v->>'status')::int,0) + 2*coalesce(pp.wk,0) + 4*coalesce(pp.top,0)
      + least(coalesce((f.v->>'earn')::numeric,0)/50000, 20), 1)
  from f join profiles pr on pr.id = f.user_id
  left join b on b.u = f.user_id and b.k = f.fid
  left join pp on pp.user_id = f.user_id and pp.fid = f.fid
  where coalesce(f.v->>'region','') in ('','bk') and f.v ? 'rec' and pr.id::text not like '%0000000000d0'
$$;

create or replace function private.hof_gyms()
returns table (user_id uuid, gym text, w int, l int, d int, ko int, title_wins int, champions int, p4p_weeks int, famers int, earn bigint, age_days int, points numeric)
language sql stable security definer set search_path = public, private as $$
  with f as (select * from private.hof_fighters()),
  g as (select f.user_id, max(f.gym) gym, sum(f.w) w, sum(f.l) l, sum(f.d) d, sum(f.ko) ko, sum(f.title_wins) tw,
          count(*) filter (where f.title_wins > 0) ch, sum(f.p4p_weeks) pw, sum(f.earn) earn from f group by f.user_id),
  h as (select user_id, count(*) n from hall_of_fame where kind='fighter' group by 1)
  select g.user_id, g.gym, g.w::int, g.l::int, g.d::int, g.ko::int, g.tw::int, g.ch::int, g.pw::int, coalesce(h.n,0)::int, g.earn::bigint,
    (current_date - pr.created_at::date)::int,
    round(least(g.w,500)/10.0 + 10*g.tw + 15*g.ch + 25*coalesce(h.n,0) + g.pw
      + greatest(0, 100.0*g.w/greatest(1,g.w+g.l) - 50)/2 * least(1, (g.w+g.l)/50.0), 1)
  from g join profiles pr on pr.id = g.user_id left join h on h.user_id = g.user_id
$$;

create or replace function private.hof_gyms_wing(p_wing text)
returns table (user_id uuid, gym text, w int, l int, d int, ko int, title_wins int, champions int, famers int, points numeric)
language sql stable security definer set search_path = public, private as $$
  with f as (select * from private.hof_fighters() where wing = p_wing),
  g as (select f.user_id, max(f.gym) gym, sum(f.w) w, sum(f.l) l, sum(f.d) d, sum(f.ko) ko, sum(f.title_wins) tw,
          count(*) filter (where f.title_wins > 0) ch, sum(f.p4p_weeks) pw from f group by f.user_id),
  h as (select hf.user_id, count(*) n from hall_of_fame hf where hf.kind='fighter' and coalesce(hf.wing,'') = p_wing group by 1)
  select g.user_id, g.gym, g.w::int, g.l::int, g.d::int, g.ko::int, g.tw::int, g.ch::int, coalesce(h.n,0)::int,
    round(least(g.w,500)/10.0 + 10*g.tw + 15*g.ch + 25*coalesce(h.n,0) + g.pw
      + greatest(0, 100.0*g.w/greatest(1,g.w+g.l) - 50)/2 * least(1, (g.w+g.l)/50.0), 1)
  from g left join h on h.user_id = g.user_id
$$;
revoke all on function private.hof_gyms_wing(text) from public, anon, authenticated;

create or replace function public.hof_watch()
returns jsonb language sql stable security definer set search_path = public, private as $$
  select jsonb_build_object(
    'fighters', coalesce((select jsonb_agg(x) from (select user_id, fid, wing, name, nick, gym, div, w, l, d, ko, title_wins, peak, p4p_weeks, p4p_top, earn, best_bout, points
        from private.hof_fighters() f where f.active and not exists (select 1 from hall_of_fame h where h.kind='fighter' and h.user_id=f.user_id and h.fid=f.fid)
        order by points desc, w desc limit 12) x), '[]'),
    'gyms', coalesce((select jsonb_agg(x) from (select user_id, gym, w, l, d, ko, title_wins, champions, p4p_weeks, famers, earn, age_days, points
        from private.hof_gyms() g where not exists (select 1 from hall_of_fame h where h.kind='gym' and h.user_id=g.user_id)
        order by points desc limit 10) x), '[]'),
    'top', coalesce((select jsonb_agg(x order by x.wing, x.points desc) from (select * from (select user_id, fid, wing, active, name, nick, gym, div, w, l, d, ko, title_wins, peak, p4p_weeks, earn, points,
        row_number() over (partition by wing order by points desc, w desc) rk from private.hof_fighters() where w + l + d > 0) z where rk <= 10) x), '[]'),
    'top_gyms', coalesce((select jsonb_agg(x) from (select user_id, gym, w, l, d, ko, title_wins, champions, famers, points
        from private.hof_gyms_wing('') where w + l + d > 0 order by points desc, w desc limit 10) x), '[]'),
    'top_gyms_bk', coalesce((select jsonb_agg(x) from (select user_id, gym, w, l, d, ko, title_wins, champions, famers, points
        from private.hof_gyms_wing('bk') where w + l + d > 0 order by points desc, w desc limit 10) x), '[]'))
$$;
grant execute on function public.hof_watch() to anon, authenticated;
revoke all on function private.hof_fighters() from public, anon, authenticated;
revoke all on function private.hof_gyms() from public, anon, authenticated;

create or replace function private.hof_induct(p_month date default date_trunc('month', now() at time zone 'America/Chicago')::date)
returns int language plpgsql security definer set search_path = public, private as $$
declare n int := 0; t bigint; body text := ''; r record;
begin
  for r in
    select * from (select f.*, row_number() over (partition by f.wing order by f.points desc, f.w desc) rn
      from private.hof_fighters() f
      where not f.active and f.fights >= 15 and f.points >= 120
        and not exists (select 1 from hall_of_fame h where h.kind='fighter' and h.user_id=f.user_id and h.fid=f.fid)) z where rn <= 3
  loop
    insert into hall_of_fame (kind, wing, class_month, user_id, fid, name, nick, gym, div, w, l, d, ko, title_wins, peak, p4p_weeks, p4p_top, earn, best_bout, points, first_ballot, citation)
    values ('fighter', r.wing, p_month, r.user_id, r.fid, r.name, r.nick, r.gym, r.div, r.w, r.l, r.d, r.ko, r.title_wins, r.peak, r.p4p_weeks, r.p4p_top, r.earn, r.best_bout, r.points,
      coalesce(r.retired_on::date >= p_month - 45, true),
      format('%s %s from %s who went %s-%s-%s with %s knockouts%s, rose to status %s%s.',
        case when r.wing='bk' then 'A Bare Knuckles' else 'A' end, lower(r.div)||'weight', r.gym, r.w, r.l, r.d, r.ko,
        case when r.title_wins > 0 then format(', won %s title fight%s', r.title_wins, case when r.title_wins>1 then 's' else '' end) else '' end,
        r.peak, case when r.p4p_weeks > 0 then format(' and spent %s week%s on the Pound for Pound list', r.p4p_weeks, case when r.p4p_weeks>1 then 's' else '' end) else '' end));
    n := n + 1; body := body || format(E'\n- %s%s (%s, %s%sweight), %s-%s-%s', r.name, case when r.nick<>'' then ' "'||r.nick||'"' else '' end, r.gym, case when r.wing='bk' then 'Bare Knuckles ' else '' end, r.div, r.w, r.l, r.d);
  end loop;
  for r in
    select * from private.hof_gyms() g where g.age_days >= 180 and g.points >= 250
      and not exists (select 1 from hall_of_fame h where h.kind='gym' and h.user_id=g.user_id)
    order by g.points desc limit 1
  loop
    insert into hall_of_fame (kind, class_month, user_id, name, gym, w, l, d, ko, title_wins, champions, p4p_weeks, earn, points, citation)
    values ('gym', p_month, r.user_id, r.gym, r.gym, r.w, r.l, r.d, r.ko, r.title_wins, r.champions, r.p4p_weeks, r.earn, r.points,
      format('%s: %s wins, %s title fight wins, %s world champions and %s Hall of Fame fighter%s.', r.gym, r.w, r.title_wins, r.champions, r.famers, case when r.famers=1 then '' else 's' end));
    n := n + 1; body := body || format(E'\n- %s (gym), %s-%s-%s', r.gym, r.w, r.l, r.d);
  end loop;
  if n > 0 then
    insert into topics(forum, title, author) values ('announce', 'Hall of Fame: the Class of ' || trim(to_char(p_month,'Month YYYY')), null) returning id into t;
    insert into posts(topic_id, author, body) values (t, null,
      'The Contenders Hall of Fame welcomes the Class of ' || trim(to_char(p_month,'Month YYYY')) || ':' || body ||
      E'\n\nSee their plaques under Hall of Records, "Hall of Fame". Congratulations to the inductees and their gyms.\n\n- The Commissioner');
  end if;
  return n;
end $$;
revoke all on function private.hof_induct(date) from public, anon, authenticated;
select cron.schedule('contenders-hof-monthly', '11 16 1 * *', $$select private.hof_induct()$$);
