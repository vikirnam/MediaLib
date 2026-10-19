<script>
    import { S } from "./store.svelte.js";
    import { final } from "./lib.js";
    let f = $state({ t: "", g: "" });
    const T = (id) => S.types.find((t) => t.id == id);
    const all = $derived(
        S.items
            .filter(
                (i) =>
                    (!f.t || i.type == f.t) && (!f.g || i.tags?.includes(f.g)),
            )
            .map((i) => ({ ...$state.snapshot(i), sc: final(i, T(i.type)) })),
    );
    const rated = $derived(all.filter((i) => i.sc !== null)),
        tags = $derived([...new Set(S.items.flatMap((i) => i.tags || []))]);
    const avg = (a) => {
        const r = a.filter((i) => i.sc !== null);
        return r.length ? r.reduce((x, i) => x + i.sc, 0) / r.length : 0;
    };
    const grp = (fn) => {
        const m = {};
        all.forEach((i) => fn(i).forEach((k) => (m[k] ??= []).push(i)));
        return Object.entries(m)
            .map(([k, v]) => [k, v.length, avg(v)])
            .sort((a, b) => b[1] - a[1]);
    };
    const hist = $derived(
            Array.from(
                { length: 10 },
                (_, k) =>
                    rated.filter((i) => Math.ceil(i.sc || 0.1) == k + 1).length,
            ),
        ),
        mx = $derived(Math.max(1, ...hist));
    const ids = $derived(new Set(all.map((i) => i.id)));
    const kpis = $derived([
        [all.length, "entries"],
        [rated.length, "rated"],
        [avg(all).toFixed(2), "mean score"],
        [S.reviews.filter((r) => ids.has(r.item)).length, "reviews"],
        [S.journal.filter((j) => ids.has(j.item)).length, "notes"],
    ]);
    const cn = (id) => S.categories.find((c) => c.id == id)?.name || id;
</script>

<h1>the <em>numbers</em></h1>
<p class="sub hand">filter by type or tag, everything below follows</p>
<div class="filters" style="margin-top:18px">
    <button class="pill" class:on={!f.t} onclick={() => (f.t = "")}
        >all types</button
    >{#each S.types as t}<button
            class="pill"
            class:on={f.t == t.id}
            onclick={() => (f.t = t.id)}>{t.name}</button
        >{/each}
</div>
<div class="filters">
    <button class="pill" class:on={!f.g} onclick={() => (f.g = "")}
        >any tag</button
    >{#each tags as g}<button
            class="pill"
            class:on={f.g == g}
            onclick={() => (f.g = g)}>#{g}</button
        >{/each}
</div>
<div class="kpis">
    {#each kpis as [b, s], x}<div
            class="kpi"
            style="--r:{((x % 3) - 1) * 1.2}deg"
        >
            <b>{b}</b><span>{s}</span>
        </div>{/each}
</div>
<div class="sec">Score distribution</div>
<div class="hist">
    {#each hist as n, k}<div>
            <i style="height:{(n / mx) * 100}px"></i>{k + 1}
        </div>{/each}
</div>
{#snippet rows(list, label)}{#each list as [k, n, a]}<div class="asp">
            <span>{label(k)} <span class="meta">×{n}</span></span>
            <div class="bar">
                <i style="width:{a * 10}%;background:var(--ink)"></i>
            </div>
            <b>{a ? a.toFixed(1) : "–"}</b>
        </div>{:else}<p class="meta">Nothing yet.</p>{/each}{/snippet}
<div class="sec">Average score by type</div>
{@render rows(
    grp((i) => [i.type]),
    (k) => T(k)?.name,
)}
<div class="sec">By status</div>
{@render rows(
    grp((i) => [i.status]),
    (k) => k,
)}
<div class="sec">Average score by tag</div>
{@render rows(
    grp((i) => i.tags || []),
    (k) => "#" + k,
)}
<div class="sec">Average score by category</div>
{@render rows(
    grp((i) => i.cats || []),
    cn,
)}
<div class="sec">Average by aspect</div>
{@render rows(
    f.t
        ? (T(f.t)?.aspects || []).map((a) => {
              const v = all
                  .map((i) => i.scores?.[a.name])
                  .filter((x) => x != null);
              return [
                  a.name,
                  v.length,
                  v.length ? v.reduce((x, y) => x + y, 0) / v.length : 0,
              ];
          })
        : [],
    (k) => k,
)}
