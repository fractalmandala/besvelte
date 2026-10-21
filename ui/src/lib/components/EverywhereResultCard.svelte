<script lang="ts">
  import { Check, CircleAlert } from "@lucide/svelte"
  import { api } from "$lib/api"
  import { duration, isBusy } from "$lib/format"
  import { createPoll } from "$lib/poll.svelte"
  import Card from "./ui/Card.svelte"
  import Skeleton from "./ui/Skeleton.svelte"
  import { cx } from "$lib/utils"

  let {
    id,
    on,
    onOpen,
  }: {
    id: string
    on: string
    onOpen: (id: string) => void
  } = $props()

  let poll = createPoll(() => api.thread(id, 1e9).then((r) => r.thread), 1000)
  let data = $derived(poll.data)
  let turn = $derived(data?.turns.at(-1))
</script>

<button onclick={() => onOpen(id)} class="rise text-left cursor-pointer">
  <Card class={cx("h-full p-4 transition hover:border-accent/30", data && isBusy(data.status) && "glow")}>
    <div class="flex items-center gap-2">
      <span class="text-[14px] font-medium">{on === "local" ? "This machine" : on}</span>
      <span class="ml-auto font-mono text-[11.5px] text-mute">{turn ? duration(turn.startedAt, turn.endedAt) : ""}</span>
      {#if data}
        {#if isBusy(data.status)}
          <span class="size-2 rounded-full bg-accent pulse-ring"></span>
        {:else if turn?.ok}
          <Check class="size-4 text-accent" />
        {:else}
          <CircleAlert class="size-4 text-danger" />
        {/if}
      {/if}
    </div>
    <div class="mt-3 max-h-48 overflow-hidden text-[13px] leading-relaxed text-dim">
      {#if data}
        {#if !turn?.endedAt}
          <span class="text-accent">Working…</span>
        {:else if turn.ok}
          <p class="whitespace-pre-wrap break-words text-ink">{turn.text || "Done."}</p>
        {:else}
          <p class="whitespace-pre-wrap break-words text-danger">{turn.error}</p>
        {/if}
      {:else}
        <Skeleton class="h-16" />
      {/if}
    </div>
  </Card>
</button>
