export const uid = () => Math.random().toString(36).slice(2, 10);
export const rot = (s) => {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 7) - 3) * 0.8;
};
export const final = (it, t) => {
  let s = 0,
    n = 0;
  for (const a of t?.aspects || []) {
    const v = it.scores?.[a.name];
    if (v !== undefined && v !== null && v !== "") {
      s += a.weight * v;
      n++;
    }
  }
  return n ? Math.max(0, Math.min(10, s)) : null;
};
