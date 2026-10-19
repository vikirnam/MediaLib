<script>
    import { S } from "./store.svelte.js";
    import { final, rot } from "./lib.js";
    const list = $derived(
        S.reviews
            .map((r) => ({ r, i: S.items.find((i) => i.id == r.item) }))
            .filter((x) => x.i)
            .sort((a, b) => b.r.date.localeCompare(a.r.date)),
    );
</script>

<h1>reviews</h1>
<p class="sub hand">what i thought, once i’d finished</p>
<div style="margin-top:28px">
    {#each list as { r, i } (r.id)}{@const t = S.types.find(
            (x) => x.id == i.type,
        )}{@const sc = final(i, t)}
        <a
            class="rvc"
            style="--c:{t?.color};--r:{rot(r.id) * 0.4}deg"
            href="#/item/{i.id}"
            ><div class="meta">
                {t?.name.toUpperCase()} · {i.title} · {r.date}{sc !== null
                    ? " · ★ " + sc.toFixed(1)
                    : ""}
            </div>
            <h3>{r.title || "Untitled review"}</h3>
            <p>{r.body.split(/\n\n+/)[0].slice(0, 220)}</p></a
        >{:else}<p class="meta">
            No reviews yet. Open a finished item and write one.
        </p>{/each}
</div>
