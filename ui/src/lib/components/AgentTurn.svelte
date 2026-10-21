<script lang="ts" module>
  import type { AgentName, ThreadEvent, TurnRecord } from "$lib/api"
  import type { ToolCall } from "./Thinking.svelte"

  type Block =
    | { readonly kind: "text"; readonly text: string }
    | { readonly kind: "tools"; readonly calls: readonly ToolCall[]; readonly endAt?: string }
    | { readonly kind: "logs"; readonly lines: readonly string[] }

  const NOISE = /claude\.ai connectors are disabled/

  function closeTools(blocks: Block[], at: string): Block[] {
    const last = blocks.at(-1)
    return last?.kind === "tools" && !last.endAt ? [...blocks.slice(0, -1), { ...last, endAt: at }] : blocks
  }

  export function toBlocks(events: readonly ThreadEvent[], agent: AgentName): Block[] {
    const joiner = agent === "shell" ? "\n" : "\n\n"
    return events.reduce<Block[]>((all, e) => {
      if (e.type === "stderr" && NOISE.test(e.text)) return all
      const blocks = e.type === "text" || e.type === "stderr" ? closeTools(all, e.at) : all
      const last = blocks.at(-1)
      if (e.type === "text") {
        return last?.kind === "text"
          ? [...blocks.slice(0, -1), { kind: "text", text: `${last.text}${joiner}${e.text}` }]
          : [...blocks, { kind: "text", text: e.text }]
      }
      if (e.type === "tool") {
        const call: ToolCall = { at: e.at, name: e.name, target: e.target, point: e.point }
        return last?.kind === "tools" && !last.endAt
          ? [...blocks.slice(0, -1), { kind: "tools", calls: [...last.calls, call] }]
          : [...blocks, { kind: "tools", calls: [call] }]
      }
      if (e.type === "stderr") {
        return last?.kind === "logs"
          ? [...blocks.slice(0, -1), { kind: "logs", lines: [...last.lines, e.text] }]
          : [...blocks, { kind: "logs", lines: [e.text] }]
      }
      return blocks
    }, [])
  }
</script>

<script lang="ts">
  import { Check, ChevronRight, CircleAlert, Terminal } from "@lucide/svelte"
  import { duration } from "$lib/format"
  import AgentAvatar from "./AgentAvatar.svelte"
  import RichText from "./RichText.svelte"
  import Thinking, { prettyToolName } from "./Thinking.svelte"
  import { cx } from "$lib/utils"

  let {
    turn,
    events,
    agent,
    liveTool,
    seed,
  }: {
    turn: TurnRecord
    events: readonly ThreadEvent[]
    agent: AgentName
    liveTool?: string
    seed?: string
  } = $props()

  let blocks = $derived(toBlocks(events, agent))
  let running = $derived(!turn.endedAt)
  let hasText = $derived(blocks.some((b) => b.kind === "text"))
  let openLogs = $state<Record<number, boolean>>({})

  function toggleLogs(index: number) {
    openLogs[index] = !openLogs[index]
  }
</script>

<div class="rise flex gap-3">
  <AgentAvatar {agent} {seed} size={30} mood={running ? "busy" : turn.ok === false ? "stuck" : "done"} />
  <div class="min-w-0 flex-1 space-y-2.5 pt-0.5">
    {#each blocks as b, i}
      {#if b.kind === "text"}
        <div class="max-w-[92%] rounded-[22px] rounded-tl-md border border-line bg-raised px-4 py-3">
          <RichText text={b.text} mono={agent === "shell"} />
        </div>
      {:else if b.kind === "tools"}
        <Thinking
          calls={b.calls}
          running={running && i === blocks.length - 1}
          startAt={b.calls[0]?.at ?? turn.startedAt}
          endAt={b.endAt ?? turn.endedAt}
        />
      {:else if b.kind === "logs"}
        <div class="pl-1">
          <button
            type="button"
            onclick={() => toggleLogs(i)}
            class="inline-flex items-center gap-1 text-[12px] text-mute hover:text-dim cursor-pointer"
          >
            <ChevronRight class={cx("size-3.5 transition", openLogs[i] && "rotate-90")} />
            <Terminal class="size-3.5" />
            <span>{b.lines.length} log line{b.lines.length === 1 ? "" : "s"}</span>
          </button>
          {#if openLogs[i]}
            <pre class="mt-1.5 max-h-56 overflow-auto rounded-2xl border border-line bg-bg p-3 font-mono text-[11.5px] leading-relaxed text-dim">{b.lines.join("\n")}</pre>
          {/if}
        </div>
      {/if}
    {/each}

    {#if !running && !hasText && turn.ok && turn.text}
      <div class="max-w-[92%] rounded-[22px] rounded-tl-md border border-line bg-raised px-4 py-3">
        <RichText text={turn.text} mono={agent === "shell"} />
      </div>
    {/if}

    {#if !turn.endedAt}
      <div class="flex items-center gap-2 pl-1 text-[12.5px] text-accent">
        <span class="flex gap-1">
          {#each [0, 1, 2] as dot}
            <span
              class="size-1.5 animate-bounce rounded-full bg-accent"
              style="animation-delay: {dot * 120}ms;"
            ></span>
          {/each}
        </span>
        Working{liveTool ? ` · ${prettyToolName(liveTool)}` : ""} · {duration(turn.startedAt)}
      </div>
    {:else if turn.ok}
      <div class="flex items-center gap-1.5 pl-1 text-[12px] text-mute">
        <Check class="size-3.5 text-accent" />
        <span>Done in {duration(turn.startedAt, turn.endedAt)}</span>
        {#if turn.costUsd}
          <span>· ${turn.costUsd.toFixed(4)}</span>
        {/if}
      </div>
    {:else}
      <div class="flex items-start gap-2 rounded-2xl border border-danger/25 bg-danger/8 px-3 py-2 text-[13px] text-danger">
        <CircleAlert class="mt-0.5 size-4 shrink-0" />
        <span class="whitespace-pre-wrap break-words">{turn.error || "The turn failed"}</span>
      </div>
    {/if}
  </div>
</div>
