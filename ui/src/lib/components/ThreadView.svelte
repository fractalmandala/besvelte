<script lang="ts">
  import { Info, Monitor } from "@lucide/svelte"
  import { api, type ThreadEvent } from "$lib/api"
  import { AGENT_LABEL, isBusy, title } from "$lib/format"
  import { createThread } from "$lib/thread.svelte"
  import { moodOf } from "./gecko"
  import AgentAvatar from "./AgentAvatar.svelte"
  import AgentTurn from "./AgentTurn.svelte"
  import Composer from "./Composer.svelte"
  import DetailsPanel from "./DetailsPanel.svelte"
  import type { AgentPoint } from "./LiveScreen.svelte"
  import ScreenPane from "./ScreenPane.svelte"
  import Skeleton from "./ui/Skeleton.svelte"
  import StatusPill from "./ui/StatusPill.svelte"
  import UserBubble from "./UserBubble.svelte"
  import { cx } from "$lib/utils"

  let { id, onChanged }: { id: string; onChanged: () => void } = $props()

  const RECENT_MS = 4000

  let threadStore = createThread(() => id)
  let thread = $derived(threadStore.thread)
  let events = $derived(threadStore.events)
  let error = $derived(threadStore.error)

  let side = $state<"computer" | "details">("computer")
  let bottomEl = $state<HTMLDivElement | null>(null)

  $effect(() => {
    // Autoscroll on event length or turn count change
    if (events.length || thread?.turns.length) {
      bottomEl?.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  })

  let byTurn = $derived.by<Record<number, ThreadEvent[]>>(() => {
    const map: Record<number, ThreadEvent[]> = {}
    for (const e of events) {
      if (!map[e.turn]) map[e.turn] = []
      map[e.turn]!.push(e)
    }
    return map
  })

  let busy = $derived(thread ? isBusy(thread.status) : false)
  let closed = $derived(thread ? thread.status === "closed" : false)

  let tools = $derived(events.filter((e) => e.type === "tool"))
  let liveTool = $derived(tools.at(-1))

  let targets = $derived([...new Set(tools.flatMap((e) => (e.type === "tool" && e.target ? [e.target] : [])))])
  let screenOn = $derived(
    thread
      ? thread.computer.kind === "local" && targets.length > 0
        ? `cua:${targets.at(-1)}`
        : thread.on
      : "",
  )

  let now = $state(Date.now())
  $effect(() => {
    const t = setInterval(() => (now = Date.now()), 1000)
    return () => clearInterval(t)
  })

  let points = $derived.by<AgentPoint[]>(() =>
    tools.flatMap((e) =>
      e.type === "tool" && e.point && now - Date.parse(e.at) < RECENT_MS
        ? [{ key: `${e.at}-${e.point.x}-${e.point.y}`, ...e.point }]
        : [],
    ),
  )

  async function act(fn: () => Promise<unknown>) {
    await fn().catch(() => undefined)
    await threadStore.refresh()
    onChanged()
  }
</script>

{#if error && !thread}
  <div class="panel grid flex-1 place-items-center text-[14px] text-dim">{error}</div>
{:else if !thread}
  <div class="panel flex-1 space-y-5 px-10 py-20">
    <Skeleton class="ml-auto h-12 w-2/3" />
    <Skeleton class="h-24 w-4/5" />
    <Skeleton class="ml-auto h-10 w-1/2" />
  </div>
{:else}
  <div class="flex h-full min-w-0 flex-1 gap-2.5">
    <section class="panel flex h-full min-w-0 flex-1 flex-col overflow-hidden">
      <header class="flex h-16 shrink-0 items-center gap-3 px-5">
        <AgentAvatar agent={thread.agent} seed={thread.id} size={34} mood={moodOf(thread.status, thread.turns.at(-1)?.error)} />
        <div class="min-w-0 flex-1">
          <div class="truncate text-[15px] font-bold">{title(thread)}</div>
          <div class="truncate text-[12px] text-mute">
            {AGENT_LABEL[thread.agent]} · {thread.on}
          </div>
        </div>
        <StatusPill status={thread.status} />
        <div class="flex rounded-full bg-raised p-1">
          <button
            onclick={() => (side = "computer")}
            aria-label="Show computer"
            class={cx("grid size-8 place-items-center rounded-full transition cursor-pointer", side === "computer" ? "bg-hover text-accent" : "text-mute hover:text-ink")}
          >
            <Monitor class="size-4" />
          </button>
          <button
            onclick={() => (side = "details")}
            aria-label="Show details"
            class={cx("grid size-8 place-items-center rounded-full transition cursor-pointer", side === "details" ? "bg-hover text-accent" : "text-mute hover:text-ink")}
          >
            <Info class="size-4" />
          </button>
        </div>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto">
        <div class="mx-auto max-w-2xl space-y-6 px-6 py-6">
          {#each thread.turns as turn (turn.index)}
            <div class="space-y-4">
              <UserBubble text={turn.prompt} />
              <AgentTurn
                seed={thread.id}
                {turn}
                events={byTurn[turn.index] ?? []}
                agent={thread.agent}
                liveTool={!turn.endedAt && liveTool?.type === "tool" && liveTool.turn === turn.index ? liveTool.name : undefined}
              />
            </div>
          {/each}
          <div bind:this={bottomEl}></div>
        </div>
      </div>

      <div class="shrink-0 px-5 pb-5 pt-2">
        <div class="mx-auto max-w-2xl">
          <Composer
            placeholder="Message {AGENT_LABEL[thread.agent]}…"
            disabled={busy || closed}
            disabledHint={closed ? "This thread is closed" : "Working… you can send the next message when it's done"}
            onSubmit={async (text) => {
              await api.send(id, text)
              await threadStore.refresh()
              onChanged()
            }}
          />
        </div>
      </div>
    </section>

    {#if side === "computer"}
      <ScreenPane
        on={screenOn}
        agentLabel={AGENT_LABEL[thread.agent]}
        {busy}
        {points}
        onPause={() => void act(() => api.interrupt(id))}
      />
    {:else}
      <DetailsPanel
        {thread}
        onHide={() => (side = "computer")}
        onDesktop={() => (side = "computer")}
        onInterrupt={() => void act(() => api.interrupt(id))}
        onCloseThread={() => void act(() => api.close(id))}
      />
    {/if}
  </div>
{/if}
