<script lang="ts" module>
  export interface ToolCall {
    readonly at: string
    readonly name: string
    readonly target?: string
    readonly point?: { readonly x: number; readonly y: number }
  }

  interface Row {
    readonly key: string
    readonly name: string
    readonly secondary?: string
    readonly count: number
  }

  /** `mcp__cua__space_bash` → `cua · space_bash`. */
  export function prettyToolName(name: string): string {
    const m = /^mcp__([^_]+(?:_[^_]+)*?)__(.+)$/.exec(name)
    return m ? `${m[1]} · ${m[2]}` : name
  }

  const secondaryOf = (c: ToolCall): string | undefined =>
    c.target || (c.point ? `${Math.round(c.point.x)},${Math.round(c.point.y)}` : undefined)

  /** Collapse consecutive identical calls into one row with a count. Pure. */
  export function toRows(calls: readonly ToolCall[]): Row[] {
    return calls.reduce<Row[]>((rows, c) => {
      const secondary = secondaryOf(c)
      const key = `${c.name}|${secondary ?? ""}`
      const last = rows.at(-1)
      if (last && last.key === key) return [...rows.slice(0, -1), { ...last, count: last.count + 1 }]
      return [...rows, { key, name: c.name, secondary, count: 1 }]
    }, [])
  }
</script>

<script lang="ts">
  import { Check, ChevronDown, Sparkles } from "@lucide/svelte"
  import { duration } from "$lib/format"
  import { cx } from "$lib/utils"

  let {
    calls,
    running,
    startAt,
    endAt,
  }: {
    calls: readonly ToolCall[]
    running: boolean
    startAt: string
    endAt?: string
  } = $props()

  let override = $state<boolean | null>(null)
  let open = $derived(override ?? running)
  let rows = $derived(toRows(calls))
  let total = $derived(calls.length)

  let label = $derived(
    running
      ? total > 0
        ? "Running tools"
        : "Working"
      : total > 0
        ? `Ran ${total} tool${total === 1 ? "" : "s"} · ${duration(startAt, endAt)}`
        : `Thought for ${duration(startAt, endAt)}`,
  )
</script>

<div class="pl-1">
  <button
    type="button"
    onclick={() => (override = !open)}
    aria-expanded={open}
    class="group inline-flex items-center gap-1.5 rounded-xl py-1 pr-2 text-[13px] text-mute transition-colors hover:text-dim cursor-pointer"
  >
    <Sparkles class={cx("size-3.5", running ? "text-accent" : "text-mute")} />
    <span class={cx(running && "thinking-shimmer")}>{label}</span>
    <ChevronDown class={cx("thinking-chevron size-3.5 transition-transform duration-300", open && "rotate-180")} />
  </button>
  <div
    class="thinking-body grid"
    style="grid-template-rows: {open ? '1fr' : '0fr'}; transition: grid-template-rows 400ms cubic-bezier(0.23,1,0.32,1);"
    aria-hidden={!open}
  >
    <div class="min-h-0 overflow-hidden">
      <div class="relative ml-[7px] mt-1 pb-1 pl-4">
        <span class="absolute inset-y-0 left-0 w-px rounded-full bg-line"></span>
        <ul class="space-y-1.5">
          {#each rows as r, i (`${i}-${r.key}`)}
            {@const newest = running && i === rows.length - 1}
            <li
              class="thinking-row flex min-w-0 items-center gap-2 text-[12.5px]"
              style="animation-delay: {Math.min(i, 8) * 40}ms;"
            >
              {#if newest}
                <span class="size-3.5 shrink-0 animate-spin rounded-full border-[1.5px] border-accent/25 border-t-accent"></span>
              {:else}
                <Check class="size-3.5 shrink-0 text-mute" strokeWidth={2.25} />
              {/if}
              <span class={cx("shrink-0 font-mono", newest ? "text-ink" : "text-dim")}>{prettyToolName(r.name)}</span>
              {#if r.secondary}
                <span class="min-w-0 truncate text-mute">{r.secondary}</span>
              {/if}
              {#if r.count > 1}
                <span class="shrink-0 text-mute">×{r.count}</span>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes shimmer-text { from { background-position: 200% 0 } to { background-position: -200% 0 } }
  @keyframes thinking-fade-up { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
  .thinking-shimmer {
    background-image: linear-gradient(90deg, var(--color-mute) 0%, var(--color-mute) 35%, var(--color-ink) 50%, var(--color-mute) 65%, var(--color-mute) 100%);
    background-size: 200% 100%;
    -webkit-background-clip: text; background-clip: text;
    color: transparent; -webkit-text-fill-color: transparent;
    animation: shimmer-text 2.2s linear infinite;
  }
  .thinking-row { animation: thinking-fade-up 380ms cubic-bezier(0.23,1,0.32,1) both; }
  .thinking-chevron { transition-timing-function: cubic-bezier(0.23,1,0.32,1); }
  @media (prefers-reduced-motion: reduce) {
    .thinking-shimmer { animation: none; background-image: none; color: var(--color-dim); -webkit-text-fill-color: currentColor }
    .thinking-row { animation: none }
    .thinking-body, .thinking-chevron { transition: none !important }
  }
</style>
