<script>
    import { S, load, STATIC } from "./store.svelte.js";
    import Log from "./Log.svelte";
    import Item from "./Item.svelte";
    import Reviews from "./Reviews.svelte";
    import Stats from "./Stats.svelte";
    import Settings from "./Settings.svelte";
    let h = $state(location.hash || "#/"),
        ready = $state(false);
    addEventListener("hashchange", () => {
        h = location.hash;
        scrollTo(0, 0);
    });
    load().then(() => (ready = true));
    const page = $derived(h.split("/")[1] || ""),
        id = $derived(h.split("/")[2]);
    const tg = () => {
        const d = document.documentElement;
        d.dataset.theme =
            getComputedStyle(d).getPropertyValue("--paper").trim() == "#1d1a17"
                ? "light"
                : "dark";
    };
    const links = [
        ["", "Log"],
        ["reviews", "Reviews"],
        ["stats", "Stats"],
        ["settings", "Settings"],
    ].filter((l) => !(STATIC && l[0] == "settings"));
</script>

<div class="nav">
    {#each links as [k, n]}<a
            href="#/{k}"
            class:on={page == k || (page == "item" && k == "")}>{n}</a
        >{/each}<span style="flex:1"></span><button class="x" onclick={tg}
        >☾ / ☀</button
    >
</div>
{#if ready}
    {#if page == "item"}<Item {id} />{:else if page == "reviews"}<Reviews
        />{:else if page == "stats"}<Stats
        />{:else if page == "settings"}<Settings />{:else}<Log />{/if}
{/if}
