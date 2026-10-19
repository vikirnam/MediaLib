<script>
    import { S, put, add, del } from "./store.svelte.js";
    import { uid } from "./lib.js";
    const save = (t) => put("types", t),
        ps = (t) =>
            t.aspects.reduce((a, x) => a + Math.max(0, x.weight || 0), 0);
    const addType = () => {
        const name = prompt("Type name?");
        if (name)
            add("types", {
                id: uid(),
                name,
                unit: "Ch",
                color: "#3f6fd9",
                statuses: [
                    "In progress",
                    "Completed",
                    "On Hold",
                    "Dropped",
                    "Planning",
                ],
                aspects: [{ name: "Overall", weight: 1 }],
            });
    };
    const delType = (t) =>
        S.items.some((i) => i.type == t.id)
            ? alert("This type still has entries.")
            : confirm("Delete " + t.name + "?") && del("types", t.id);
    const addCat = () => {
        const name = prompt("Category name?");
        if (name) add("categories", { id: uid(), name });
    };
    const addSt = (t, e) => {
        const v = e.target.value.trim();
        if (v && !t.statuses.includes(v)) {
            t.statuses.push(v);
            save(t);
        }
        e.target.value = "";
    };
</script>

<h1>types &amp; <em>categories</em></h1>
<p class="sub hand">how things are sorted and scored</p>
{#each S.types as t (t.id)}<section class="stype" style="--c:{t.color}">
        <div class="row">
            <input
                type="color"
                value={t.color}
                oninput={(e) => {
                    t.color = e.target.value;
                    save(t);
                }}
            />
            <input
                class="nm"
                value={t.name}
                oninput={(e) => {
                    t.name = e.target.value;
                    save(t);
                }}
            /><span style="flex:1"></span>
            <span class="hand" style="font-size:20px;color:var(--mut)"
                >note position</span
            ><input
                style="width:84px"
                value={t.unit}
                oninput={(e) => {
                    t.unit = e.target.value;
                    save(t);
                }}
            />
        </div>
        <div class="lbl">statuses</div>
        <div class="row">
            {#each t.statuses as s}<span class="chip2"
                    >{s}<button
                        class="x"
                        onclick={() => {
                            t.statuses = t.statuses.filter((x) => x != s);
                            save(t);
                        }}>✕</button
                    ></span
                >{/each}
            <input
                placeholder="+ add status, press enter"
                style="width:210px"
                onkeydown={(e) => e.key == "Enter" && addSt(t, e)}
            />
        </div>
        <div class="lbl">rating aspects &amp; weights</div>
        {#each t.aspects as a, k}<div class="arow">
                <input
                    value={a.name}
                    oninput={(e) => {
                        a.name = e.target.value;
                        save(t);
                    }}
                />
                <input
                    type="number"
                    step=".05"
                    value={a.weight}
                    oninput={(e) => {
                        a.weight = parseFloat(e.target.value) || 0;
                        save(t);
                    }}
                />
                <button
                    class="x"
                    onclick={() => {
                        t.aspects.splice(k, 1);
                        save(t);
                    }}>✕</button
                >
            </div>{/each}
        <button
            class="ghost"
            onclick={() => {
                t.aspects.push({ name: "New aspect", weight: 0 });
                save(t);
            }}>+ aspect</button
        >
        <div class="meter" class:bad={Math.abs(ps(t) - 1) > 0.001}>
            <i style="width:{Math.min(ps(t), 1) * 100}%"></i>
        </div>
        <div class="meta">
            positive weights total {ps(t).toFixed(2)}
            {Math.abs(ps(t) - 1) < 0.001 ? "✓" : "— should be 1.00"} · negative weights
            act as penalties · scores are 0–10
        </div>
        <p style="text-align:right;margin:6px 0 0">
            <button class="x" onclick={() => delType(t)}>delete type</button>
        </p>
    </section>{/each}
<button class="btn" onclick={addType}>+ new type</button>
<h2 class="sec">Categories</h2>
<p class="meta">Groups that can mix items of any type.</p>
<div class="row">
    {#each S.categories as c}<span class="chip2"
            >{c.name}<button class="x" onclick={() => del("categories", c.id)}
                >✕</button
            ></span
        >{/each}<button class="ghost" onclick={addCat}>+ category</button>
</div>
