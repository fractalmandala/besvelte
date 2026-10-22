<script lang="ts" module>
  export interface AgentPoint {
    readonly key: string
    readonly x: number
    readonly y: number
  }

  const SPECIAL: Record<string, string> = {
    Enter: "Return",
    Backspace: "BackSpace",
    Tab: "Tab",
    Escape: "Escape",
    Delete: "Delete",
    ArrowLeft: "Left",
    ArrowRight: "Right",
    ArrowUp: "Up",
    ArrowDown: "Down",
    Home: "Home",
    End: "End",
    PageUp: "Prior",
    PageDown: "Next",
  }

  function keyFor(e: KeyboardEvent): string | undefined {
    const mods = [e.ctrlKey || e.metaKey ? "ctrl" : "", e.altKey ? "alt" : ""].filter(Boolean)
    const base = SPECIAL[e.key] ?? (mods.length && /^[a-z0-9]$/i.test(e.key) ? e.key.toLowerCase() : undefined)
    return base ? [...mods, base].join("+") : undefined
  }
</script>

<script lang="ts">
  import { api, type ScreenFrame, type ScreenInput } from "$lib/api"
  import { cx } from "$lib/utils"

  let {
    on,
    frame,
    points = [],
    interactive = false,
    error,
    class: className,
  }: {
    on: string
    frame: ScreenFrame | undefined
    points?: readonly AgentPoint[]
    interactive?: boolean
    error?: string
    class?: string
  } = $props()

  let imgEl = $state<HTMLImageElement | null>(null)
  let boxEl = $state<HTMLDivElement | null>(null)
  let now = $state(Date.now())

  let typed = ""
  let flushTimeout: ReturnType<typeof setTimeout> | undefined = undefined
  let mine = $state<readonly AgentPoint[]>([])
  let mouse = $state<{ x: number; y: number } | undefined>()

  let wheel = { delta: 0, x: 0, y: 0, busy: false, timer: undefined as ReturnType<typeof setTimeout> | undefined }

  $effect(() => {
    if (interactive && boxEl) boxEl.focus()
  })

  $effect(() => {
    const t = setInterval(() => (now = Date.now()), 1000)
    return () => clearInterval(t)
  })

  let w = $derived(frame?.width ?? 1280)
  let h = $derived(frame?.height ?? 800)
  let stale = $derived(frame?.at !== undefined && now - frame.at > 4000)

  function send(input: ScreenInput) {
    void api.input(on, input).catch(() => undefined)
  }

  function getAt(e: MouseEvent | WheelEvent) {
    if (!imgEl) return { x: 0, y: 0 }
    const r = imgEl.getBoundingClientRect()
    return {
      x: Math.round(((e.clientX - r.left) / r.width) * w),
      y: Math.round(((e.clientY - r.top) / r.height) * h),
    }
  }

  function flushWheel() {
    wheel.timer = undefined
    if (wheel.busy || Math.abs(wheel.delta) < 4) return
    const amount = Math.min(15, Math.max(1, Math.round(Math.abs(wheel.delta) / 40)))
    const direction = wheel.delta > 0 ? "down" : "up"
    wheel.delta = 0
    wheel.busy = true
    void api
      .input(on, { action: "scroll", x: wheel.x, y: wheel.y, direction, amount })
      .catch(() => undefined)
      .finally(() => {
        wheel.busy = false
        if (Math.abs(wheel.delta) >= 4 && !wheel.timer) wheel.timer = setTimeout(flushWheel, 0)
      })
  }

  function onWheel(e: WheelEvent) {
    if (!interactive) return
    const p = getAt(e)
    wheel.delta += e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY
    wheel.x = p.x
    wheel.y = p.y
    if (!wheel.timer) wheel.timer = setTimeout(flushWheel, 120)
  }

  function ripple(x: number, y: number) {
    mine = [...mine.slice(-4), { key: `${Date.now()}`, x, y }]
  }

  function onKey(e: KeyboardEvent) {
    if (!interactive) return
    if (e.key === "Escape" && e.shiftKey) return
    e.stopPropagation()
    const key = keyFor(e)
    e.preventDefault()
    if (key) {
      if (typed) send({ action: "type", text: typed })
      typed = ""
      send({ action: "key", key })
      return
    }
    if (e.key.length === 1) {
      typed += e.key
      clearTimeout(flushTimeout)
      flushTimeout = setTimeout(() => {
        if (typed) send({ action: "type", text: typed })
        typed = ""
      }, 140)
    }
  }

  const pct = (v: number, of: number) => `${(v / of) * 100}%`
</script>

{#if !frame?.image}
  {#if !error}
    <!-- Connecting Spinner -->
    <div class={cx("relative aspect-[16/10] w-full overflow-hidden rounded-[22px] bg-black", className)}>
      <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg width="26" height="26" class="block animate-spin" aria-hidden="true">
          <circle cx="13" cy="13" r="12" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="2" />
          <circle cx="13" cy="13" r="12" fill="none" stroke="#3ee39b" stroke-width="2" stroke-linecap="round" stroke-dasharray="21 54" />
        </svg>
      </span>
      <span class="absolute inset-x-0 text-center text-[12.5px] font-semibold text-white/70" style="top: calc(50% + 28px);">
        Connecting to {on.replace(/^cua:(local:)?/, "")}'s screen
      </span>
    </div>
  {:else}
    <div class={cx("grid aspect-[16/10] w-full place-items-center rounded-[22px] bg-raised p-6 text-center", className)}>
      <div>
        <div class="mx-auto mb-3 size-2.5 rounded-full bg-warn pulse-ring"></div>
        <div class="text-[14px] font-bold">Can't reach {on}'s screen</div>
        <div class="mx-auto mt-1 max-w-md text-[12.5px] text-dim">{error}</div>
      </div>
    </div>
  {/if}
{:else}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={boxEl}
    role="region"
    aria-label="{on} interactive screen"
    data-capture-keys={interactive ? "" : undefined}
    tabindex={interactive ? 0 : -1}
    onmousemove={interactive ? (e) => {
      const r = e.currentTarget.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    } : undefined}
    onmouseleave={interactive ? () => (mouse = undefined) : undefined}
    onkeydown={interactive ? onKey : undefined}
    class={cx(
      "relative w-full select-none overflow-hidden rounded-[22px] bg-black outline-none",
      interactive && "[cursor:none] ring-2 ring-accent/70 focus:ring-accent",
      className,
    )}
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <img
      bind:this={imgEl}
      src="data:image/jpeg;base64,{frame.image}"
      alt="{on} screen"
      draggable={false}
      class="block h-auto w-full"
      onclick={interactive ? (e) => {
        const p = getAt(e)
        ripple(p.x, p.y)
        send({ action: "click", ...p })
      } : undefined}
      ondblclick={interactive ? (e) => send({ action: "double_click", ...getAt(e) }) : undefined}
      oncontextmenu={interactive ? (e) => {
        e.preventDefault()
        send({ action: "right_click", ...getAt(e) })
      } : undefined}
      onwheel={interactive ? onWheel : undefined}
    />

    {#each [...points, ...mine] as p (p.key)}
      <span
        class="ripple pointer-events-none absolute size-10 rounded-full border-2 border-accent bg-accent/25"
        style="left: {pct(p.x, w)}; top: {pct(p.y, h)};"
      ></span>
    {/each}

    {#if interactive && mouse}
      <!-- User pointer -->
      <svg
        class="pointer-events-none absolute z-10"
        style="filter: drop-shadow(0 1px 2px rgba(0,0,0,.45)); left: {mouse.x - 4}px; top: {mouse.y - 4}px;"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"
          fill="#111318"
          stroke="#fff"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
    {/if}

    {#if stale}
      <span class="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11.5px] font-bold text-warn backdrop-blur">
        Reconnecting…
      </span>
    {/if}

    {#if frame.cursor}
      <!-- Agent cursor -->
      <svg
        class="cursor-glide pointer-events-none absolute"
        style="filter: drop-shadow(0 1px 2px rgba(0,0,0,.45)); left: {pct(frame.cursor.x, w)}; top: {pct(frame.cursor.y, h)};"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"
          fill="#111318"
          stroke="#3ee39b"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
    {/if}
  </div>
{/if}
