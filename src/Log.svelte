<script>
    import { S, STATIC, add } from "./store.svelte.js";
    import { final, uid, rot } from "./lib.js";
    let f = $state({ t: "", s: "", g: "" }),
        title = $state(""),
        nt = $state("");
    const T = (id) => S.types.find((t) => t.id == id);
    const sts = $derived([
        ...new Set(
            S.types
                .filter((t) => !f.t || t.id == f.t)
                .flatMap((t) => t.statuses),
        ),
    ]);
    const tags = $derived([...new Set(S.items.flatMap((i) => i.tags || []))]);
    const v = $derived(
        S.items.filter(
            (i) =>
                (!f.t || i.type == f.t) &&
                (!f.s || i.status == f.s) &&
                (!f.g || i.tags?.includes(f.g)),
        ),
    );
    function create() {
        if (!title.trim()) return;
        const ty = T(nt || f.t || S.types[0].id);
        const it = add("items", {
            id: uid(),
            type: ty.id,
            title: title.trim(),
            status: ty.statuses[0],
            done: 0,
            total: 0,
            scores: {},
            cats: [],
            tags: [],
            desc: "",
            image: "",
            created: Date.now(),
        });
        title = "";
        location.hash = "#/item/" + it.id;
    }
</script>

<h1>Vikirna's Media Library</h1>
<!-- <p>the things i’ve <em>watched</em> &amp; read</p> -->
<div class="tabs">
    <button
        class="tab"
        class:on={!f.t}
        style="--c:#444"
        onclick={() => {
            f.t = "";
            f.s = "";
        }}>Everything</button
    >
    {#each S.types as t}<button
            class="tab"
            class:on={f.t == t.id}
            style="--c:{t.color}"
            onclick={() => {
                f.t = t.id;
                f.s = "";
            }}>{t.name}</button
        >{/each}
</div>
<div class="filters">
    {#each sts as s}<button
            class="pill"
            class:on={f.s == s}
            onclick={() => (f.s = f.s == s ? "" : s)}>{s}</button
        >{/each}<span class="meta">{v.length} entries</span>
</div>
<div class="filters">
    {#each tags as g}<button
            class="pill"
            class:on={f.g == g}
            onclick={() => (f.g = f.g == g ? "" : g)}>#{g}</button
        >{/each}
</div>
{#if !STATIC}<form
        class="row"
        onsubmit={(e) => {
            e.preventDefault();
            create();
        }}
    >
        <input placeholder="add a title…" bind:value={title} />
        <select bind:value={nt}
            >{#each S.types as t}<option value={t.id}>{t.name}</option
                >{/each}</select
        ><button class="btn">+ add</button>
    </form>{/if}
<div class="grid" style="margin-top:20px">
    {#each v as i (i.id)}{@const t = T(i.type)}{@const sc = final(i, t)}
        <a
            class="pol"
            style="--r:{rot(i.id)}deg;--c:{t?.color}"
            href="#/item/{i.id}"
        >
            <div
                class="cover"
                class:img={i.image}
                style={i.image ? `background-image:url(${i.image})` : ""}
            >
                {i.title}
            </div>
            {#if sc !== null}<div class="stamp">{sc.toFixed(1)}</div>{/if}
            <div class="cap">{i.title}</div>
            <div class="meta">{t?.name} · {i.status}</div></a
        >{/each}
</div>
