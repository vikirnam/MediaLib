<script>
  import { S, STATIC, put, add, del } from "./store.svelte.js";
  import { final, uid } from "./lib.js";
  let { id } = $props(),
    at = $state(""),
    tx = $state("");
  const it = $derived(S.items.find((i) => i.id == id)),
    t = $derived(S.types.find((x) => x.id == it?.type)),
    sc = $derived(it && final(it, t));
  const js = $derived(
      S.journal.filter((j) => j.item == id).sort((a, b) => a.ts - b.ts),
    ),
    rv = $derived(S.reviews.find((r) => r.item == id));
  const set = (k, v) => {
      it[k] = v;
      put("items", it);
    },
    ed = !STATIC;
  const setS = (k, v) => {
    it.scores = { ...it.scores, [k]: v === "" ? undefined : +v };
    put("items", it);
  };
  const num = (k, e) => set(k, Math.max(0, +e.target.value || 0));
  const sum = $derived(
    (t?.aspects || []).reduce((a, x) => a + Math.max(0, x.weight), 0),
  );
  const tog = (c) =>
    set(
      "cats",
      it.cats.includes(c) ? it.cats.filter((x) => x != c) : [...it.cats, c],
    );
  async function up(e) {
    const f = e.target.files[0];
    if (!f) return;
    set(
      "image",
      (
        await (
          await fetch("/api/upload?name=" + encodeURIComponent(f.name), {
            method: "POST",
            body: f,
          })
        ).json()
      ).path,
    );
  }
  function addJ() {
    if (!tx.trim()) return;
    add("journal", { id: uid(), item: id, at, text: tx, ts: Date.now() });
    tx = "";
  }
  function newRev() {
    add("reviews", {
      id: uid(),
      item: id,
      title: "",
      body: "",
      date: new Date().toISOString().slice(0, 10),
    });
  }
  function rm() {
    if (confirm("Delete this entry and its notes/review?")) {
      S.journal
        .filter((j) => j.item == id)
        .forEach((j) => del("journal", j.id));
      if (rv) del("reviews", rv.id);
      del("items", id);
      location.hash = "#/";
    }
  }
</script>

{#if it}
  <a class="back" href="#/">← back to the log</a>
  <div class="item" style="--c:{t?.color}">
    <div>
      <div class="pol" style="--r:-2deg">
        <div
          class="cover"
          class:img={it.image}
          style={it.image
            ? `background-image:url(${it.image})`
            : "font-size:26px"}
        >
          {it.title}
        </div>
      </div>
      {#if ed}<p>
          <label class="up"
            >📷 {it.image ? "change cover" : "add a cover"}<input
              type="file"
              accept="image/*"
              hidden
              onchange={up}
            /></label
          >{#if it.image}<button class="x" onclick={() => set("image", "")}
              >remove</button
            >{/if}
        </p>{/if}
      {#if it.total || ed}<div
          class="hand"
          style="font-size:22px;margin-top:14px"
        >
          progress · {#if ed}<input
              type="number"
              style="width:64px"
              value={it.done}
              oninput={(e) => num("done", e)}
            />
            /
            <input
              type="number"
              style="width:64px"
              value={it.total}
              oninput={(e) => num("total", e)}
            />
            <button class="x" onclick={() => set("done", it.done + 1)}
              >+1 {t?.unit}</button
            >{:else}{it.done} / {it.total}{/if}
        </div>
        <div class="prog">
          {#each Array(Math.min(it.total, 80)) as _, k}<i class:d={k < it.done}
            ></i>{/each}
        </div>{/if}
    </div>
    <div>
      <div class="meta">
        {t?.name.toUpperCase()} · {it.status.toUpperCase()}
      </div>
      {#if ed}<input
          class="ttl"
          value={it.title}
          oninput={(e) => set("title", e.target.value)}
        />{:else}<h2>{it.title}</h2>{/if}
      <div class="row">
        {#if ed}<select
            value={it.type}
            onchange={(e) => {
              set("type", e.target.value);
              set(
                "status",
                S.types.find((x) => x.id == e.target.value).statuses[0],
              );
            }}
            >{#each S.types as x}<option value={x.id}>{x.name}</option
              >{/each}</select
          >
          <select
            value={it.status}
            onchange={(e) => set("status", e.target.value)}
            >{#each t?.statuses || [] as s}<option>{s}</option>{/each}</select
          >{/if}
        {#each S.categories as c}{#if ed || it.cats.includes(c.id)}<button
              class="pill"
              class:sel={it.cats.includes(c.id)}
              onclick={() => ed && tog(c.id)}>{c.name}</button
            >{/if}{/each}
      </div>
      {#if ed}<input
          placeholder="tags, comma separated"
          style="width:100%"
          value={(it.tags || []).join(", ")}
          onchange={(e) =>
            set("tags", [
              ...new Set(
                e.target.value
                  .split(",")
                  .map((s) => s.trim().replace(/^#/, ""))
                  .filter(Boolean),
              ),
            ])}
        />
      {:else}<div class="tags">
          {#each it.tags || [] as g}<span class="pill">#{g}</span>{/each}
        </div>{/if}
      {#if ed}<textarea
          placeholder="description…"
          value={it.desc}
          oninput={(e) => set("desc", e.target.value)}
        ></textarea>{:else}<p>{it.desc}</p>{/if}
      <h2 class="sec">
        Rating {#if sc !== null}<span class="big" style="font-size:44px"
            >{sc.toFixed(1)}</span
          >{/if}
      </h2>
      {#if Math.abs(sum - 1) > 0.001}<p class="meta">
          ⚠ positive weights sum to {sum.toFixed(2)}, not 1 (fix in Settings)
        </p>{/if}
      {#each t?.aspects || [] as a}<div class="asp">
          <span>{a.name} <span class="meta">×{a.weight}</span></span>
          {#if ed}<input
              type="range"
              min="0"
              max="10"
              step=".5"
              value={it.scores?.[a.name] ?? 0}
              oninput={(e) => setS(a.name, e.target.value)}
            />{:else}<div class="bar">
              <i style="width:{(it.scores?.[a.name] || 0) * 10}%"></i>
            </div>{/if}
          {#if ed}<input
              type="number"
              min="0"
              max="10"
              step=".5"
              placeholder="–"
              value={it.scores?.[a.name] ?? ""}
              oninput={(e) => setS(a.name, e.target.value)}
            />{:else}<b>{it.scores?.[a.name] ?? "–"}</b>{/if}
        </div>{/each}
      <h2 class="sec">Review</h2>
      {#if rv}<div class="rvp" style="--c:{t?.color}">
          {#if ed}<input
              class="ttl"
              placeholder="review title"
              value={rv.title}
              oninput={(e) => {
                rv.title = e.target.value;
                put("reviews", rv);
              }}
            />
            <textarea
              style="min-height:220px;margin-top:10px"
              placeholder="my thoughts and analysis, once finished… (blank line = new paragraph)"
              value={rv.body}
              oninput={(e) => {
                rv.body = e.target.value;
                put("reviews", rv);
              }}
            ></textarea>
            <button
              class="x"
              onclick={() => confirm("Delete review?") && del("reviews", rv.id)}
              >delete review</button
            >
          {:else}<h3 class="serif" style="font-size:26px">{rv.title}</h3>
            {#each rv.body.split(/\n\n+/) as p}<p>{p}</p>{/each}{/if}
        </div>
      {:else if ed}<button class="btn" onclick={newRev}>+ write a review</button
        >{:else}<p class="meta">No review yet.</p>{/if}
      <h2 class="sec">Notes</h2>
      <div class="log">
        {#each js as j (j.id)}<div class="note" style="--r:0deg">
            {#if ed}<input
                class="at"
                style="background:none;border:none;width:140px"
                value={j.at}
                oninput={(e) => {
                  j.at = e.target.value;
                  put("journal", j);
                }}
              /><button class="x" onclick={() => del("journal", j.id)}>✕</button
              >
              <textarea
                style="font:22px Caveat,cursive;border:none;background:none;min-height:50px"
                value={j.text}
                oninput={(e) => {
                  j.text = e.target.value;
                  put("journal", j);
                }}
              ></textarea>
            {:else}<span class="at">{j.at}</span>
              <p>{j.text}</p>{/if}
          </div>{/each}
      </div>
      {#if ed}<div class="row">
          <input
            style="width:120px"
            placeholder={t?.unit}
            bind:value={at}
          /><textarea style="flex:1" placeholder="a thought…" bind:value={tx}
          ></textarea><button class="btn" onclick={addJ}>add</button>
        </div>
        <p><button class="x" onclick={rm}>delete this entry</button></p>{/if}
    </div>
  </div>
{:else}<p>Not found.</p>{/if}
