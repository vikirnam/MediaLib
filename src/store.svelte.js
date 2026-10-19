export const STATIC = !!import.meta.env.VITE_STATIC
export const S = $state({ types: [], categories: [], items: [], journal: [], reviews: [] })
export async function load() { Object.assign(S, STATIC ? window.DATA : await (await fetch('/api/state')).json()) }
const timers = {}
export function put(t, o) { if (STATIC) return; clearTimeout(timers[t + o.id]); timers[t + o.id] = setTimeout(() => fetch('/api/put/' + t, { method: 'POST', body: JSON.stringify($state.snapshot(o)) }), 300) }
export function add(t, o) { S[t].push(o); put(t, o); return S[t].at(-1) }
export function del(t, id) { const i = S[t].findIndex(x => x.id == id); if (i >= 0) S[t].splice(i, 1); fetch('/api/del/' + t + '/' + id, { method: 'POST' }) }
