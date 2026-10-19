import { DatabaseSync } from 'node:sqlite'
import fs from 'node:fs'
fs.mkdirSync('data/images', { recursive: true })
export const TABLES = ['types', 'categories', 'items', 'journal', 'reviews']
const db = new DatabaseSync('data/tracker.db')
for (const t of TABLES) db.exec(`create table if not exists ${t}(id text primary key, data text not null)`)
export const put = (t, o) => db.prepare(`insert into ${t}(id,data) values(?,?) on conflict(id) do update set data=excluded.data`).run(o.id, JSON.stringify(o))
export const del = (t, id) => db.prepare(`delete from ${t} where id=?`).run(id)
export const state = () => Object.fromEntries(TABLES.map(t => [t, db.prepare(`select data from ${t}`).all().map(r => JSON.parse(r.data))]))
const T = (id, name, unit, color, st, asp) => ({ id, name, unit, color, statuses: st, aspects: asp.map(([name, weight]) => ({ name, weight })) })
const S1 = ['Watching', 'Completed', 'On Hold', 'Dropped', 'Planning'], S2 = ['Reading', 'Completed', 'On Hold', 'Dropped', 'Planning']
if (!db.prepare('select 1 from types').get()) [
    T('anime', 'Anime', 'Ep', '#d9573f', S1, [['Characters', .3], ['Plot', .3], ['Worldbuilding', .2], ['Visuals', .2]]),
    T('manga', 'Manga', 'Ch', '#7a5fb5', S2, [['Characters', .3], ['Plot', .3], ['Worldbuilding', .2], ['Art', .2]]),
    T('tv', 'TV', 'S1E1', '#2f7f8c', S1, [['Characters', .3], ['Plot', .4], ['Production', .3]]),
    T('movie', 'Movies', '0:00:00', '#b8862b', ['Watched', 'Planning'], [['Story', .4], ['Characters', .3], ['Direction', .3]]),
    T('book', 'Books', 'Ch', '#4f7a46', S2, [['Characters', .3], ['Plot', .3], ['Prose', .4]])].forEach(t => put('types', t))
