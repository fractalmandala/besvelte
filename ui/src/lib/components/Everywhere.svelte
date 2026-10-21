<script lang="ts">
  import { Check, CircleAlert } from "@lucide/svelte"
  import { api, type AgentName, type Computer } from "$lib/api"
  import { AGENT_LABEL } from "$lib/format"
  import GeckoIcon from "./GeckoIcon.svelte"
  import Composer from "./Composer.svelte"
  import EverywhereResultCard from "./EverywhereResultCard.svelte"
  import Card from "./ui/Card.svelte"
  import Select from "./ui/Select.svelte"
  import { cx } from "$lib/utils"

  type Launched = { readonly on: string; readonly id?: string; readonly error?: string }

  let {
    computers,
    onOpen,
  }: {
    computers: readonly Computer[] | undefined
    onOpen: (id: string) => void
  } = $props()

  let picked = $state<readonly string[]>(["local"])
  let agent = $state<AgentName>("claude-code")
  let launched = $state<readonly Launched[]>([])

  function toggle(name: string) {
    picked = picked.includes(name) ? picked.filter((n) => n !== name) : [...picked, name]
  }
</script>

<div class="panel h-full min-w-0 flex-1 overflow-y-auto">
  <div class="mx-auto max-w-4xl px-6 py-10">
    <div class="flex items-center gap-2 text-accent">
      <GeckoIcon name="globe" size={30} />
      <span class="text-[12px] font-semibold uppercase tracking-[0.12em]">Fan out</span>
    </div>
    <h1 class="mt-2 text-[26px] font-semibold tracking-tight">Run one job on every computer</h1>
    <p class="mt-1.5 text-[14px] text-dim">Each computer gets its own thread. Results land side by side as they finish.</p>

    <div class="mt-6 flex flex-wrap gap-2">
      {#each computers ?? [] as c (c.name)}
        {@const on = picked.includes(c.name)}
        <button
          onclick={() => toggle(c.name)}
          class={cx(
            "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] transition cursor-pointer",
            on ? "border-accent/40 bg-accent/12 text-accent" : "border-line bg-raised text-dim hover:text-ink",
          )}
        >
          <span class={cx("grid size-4 place-items-center rounded-full border", on ? "border-accent bg-accent text-accent-ink" : "border-line-strong")}>
            {#if on}
              <Check class="size-3" strokeWidth={3} />
            {/if}
          </span>
          <span>{c.name === "local" ? "This machine" : c.name}</span>
        </button>
      {/each}
    </div>

    <div class="mt-4">
      <Composer
        placeholder="What should every computer do? ({picked.length} selected)"
        disabled={picked.length === 0}
        disabledHint="Pick at least one computer"
        onSubmit={async (prompt) => {
          const res = await api.fanout({ computers: [...picked], agent, prompt })
          launched = res.threads
        }}
      >
        {#snippet footer()}
          <Select bind:value={agent} aria-label="Agent">
            {#each Object.keys(AGENT_LABEL) as a}
              <option value={a}>{AGENT_LABEL[a as AgentName]}</option>
            {/each}
          </Select>
        {/snippet}
      </Composer>
    </div>

    {#if launched.length > 0}
      <div class="mt-8 grid gap-3 md:grid-cols-2">
        {#each launched as l (l.on)}
          {#if l.id}
            <EverywhereResultCard id={l.id} on={l.on} {onOpen} />
          {:else}
            <Card class="p-4">
              <div class="flex items-center gap-2">
                <span class="text-[14px] font-medium">{l.on}</span>
                <CircleAlert class="ml-auto size-4 text-danger" />
              </div>
              <p class="mt-3 text-[13px] text-danger">{l.error}</p>
            </Card>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>
