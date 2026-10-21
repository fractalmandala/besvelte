<script lang="ts" module>
  export interface ModelOption {
    readonly label: string
    readonly value: string | undefined
  }

  export const MODELS: readonly ModelOption[] = [
    { label: "Default", value: undefined },
    { label: "Opus", value: "opus" },
    { label: "Sonnet", value: "sonnet" },
    { label: "Haiku", value: "haiku" },
  ]

  const SLASH = [
    { name: "test", text: "Run the test suite and summarise failures" },
    { name: "deps", text: "Upgrade the dependencies and list what changed" },
    { name: "review", text: "Review the latest changes for bugs" },
    { name: "browse", text: "Open the browser and " },
    { name: "disk", text: "Check disk space and the biggest folders" },
  ] as const

  type MenuKind = "computers" | "slash" | "model" | "agent"
  interface MenuItem {
    readonly id: string
    readonly label: string
    readonly hint?: string
    readonly active?: boolean
  }
  interface Token {
    readonly kind: "computers" | "slash"
    readonly start: number
    readonly query: string
  }

  const TOKEN = /(^|\s)([@/])([\w.-]*)$/

  function parseToken(before: string): Token | undefined {
    const m = TOKEN.exec(before)
    if (!m) return undefined
    const query = m[3] ?? ""
    return { kind: m[2] === "@" ? "computers" : "slash", start: before.length - query.length - 1, query }
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte"
  import { ArrowUp, ChevronDown, Mic, Monitor, Plus } from "@lucide/svelte"
  import type { Computer } from "$lib/api"
  import { createDictation, speechSupported, type Dictation } from "$lib/speech"
  import { cx } from "$lib/utils"

  let {
    placeholder,
    onSubmit,
    disabled = false,
    disabledHint,
    autoFocus = false,
    big = false,
    footer,
    agents,
    agent,
    onAgentChange,
    initial = "",
    computers,
    computer,
    onPickComputer,
    models,
    model,
    onModelChange,
  }: {
    placeholder: string
    onSubmit: (text: string) => Promise<void>
    disabled?: boolean
    disabledHint?: string
    autoFocus?: boolean
    big?: boolean
    footer?: Snippet
    agents?: readonly { readonly value: string; readonly label: string; readonly hint?: string }[]
    agent?: string
    onAgentChange?: (agent: string) => void
    initial?: string
    computers?: readonly Computer[]
    computer?: string
    onPickComputer?: (name: string) => void
    models?: readonly ModelOption[]
    model?: string
    onModelChange?: (model: string | undefined) => void
  } = $props()

  let text = $state(initial)
  let caret = $state(initial.length)
  let sending = $state(false)
  let error = $state<string | undefined>()
  let multi = $state(false)
  let open = $state<"computers" | "model" | "agent" | undefined>()

  let modelBtn = $state<HTMLButtonElement | null>(null)
  let computerBtn = $state<HTMLButtonElement | null>(null)
  let agentBtn = $state<HTMLButtonElement | null>(null)
  let root = $state<HTMLDivElement | null>(null)
  let textareaEl = $state<HTMLTextAreaElement | null>(null)

  let anchorAt = $state<{ right?: number; left?: number; bottom: number; width: number } | undefined>()

  let dismissed = $state<string | undefined>()
  let active = $state(0)
  let sweep = $state(0)
  let listening = $state(false)
  let interim = $state("")
  let dictation: Dictation | undefined = undefined
  let canSpeak = typeof navigator !== "undefined" && speechSupported()

  let rowEls = $state<Array<HTMLButtonElement | null>>([])
  let box = $state<{ top: number; height: number } | undefined>()
  let glideReady = $state(false)

  $effect(() => {
    text = initial
    caret = initial.length
  })

  // Measure button anchor position when open changes
  $effect(() => {
    const btn = open === "model" ? modelBtn : open === "agent" ? agentBtn : open === "computers" ? computerBtn : null
    if (!btn || !root) {
      anchorAt = undefined
      return
    }
    const r = root.getBoundingClientRect()
    const b = btn.getBoundingClientRect()
    const bottom = r.bottom - b.top + 8
    anchorAt =
      open === "model"
        ? { right: r.right - b.right, bottom, width: 184 }
        : { left: b.left - r.left, bottom, width: open === "agent" ? 200 : 240 }
  })

  // Auto-resize textarea
  $effect(() => {
    const el = textareaEl
    if (!el) return
    el.style.height = "0px"
    const h = Math.min(el.scrollHeight, 160)
    el.style.height = `${h}px`
    multi = h > 28 || text.includes("\n")
  })

  let hasComputers = $derived((computers?.length ?? 0) > 0)
  let token = $derived.by(() => {
    const t = parseToken(text.slice(0, caret))
    if (!t || (t.kind === "computers" && !hasComputers)) return undefined
    return t
  })
  let tokenKey = $derived(token ? `${token.kind}:${token.start}` : undefined)

  $effect(() => {
    if (!tokenKey) dismissed = undefined
  })

  let kind = $derived<MenuKind | undefined>(open ?? (token && tokenKey !== dismissed ? token.kind : undefined))
  let query = $derived(open ? "" : (token?.query.toLowerCase() ?? ""))

  let items = $derived.by<readonly MenuItem[]>(() => {
    if (kind === "computers") {
      return (computers ?? [])
        .filter((c) => c.name.toLowerCase().includes(query))
        .map((c) => ({ id: c.name, label: c.name === "local" ? "This Mac" : c.name, hint: c.kind, active: c.name === computer }))
    }
    if (kind === "slash") {
      return SLASH.filter((s) => s.name.startsWith(query)).map((s) => ({
        id: s.name,
        label: `/${s.name}`,
        hint: s.text.replace(/ $/, "…").slice(0, 26),
      }))
    }
    if (kind === "model") {
      return (models ?? []).map((m) => ({ id: m.label, label: m.label, active: m.value === model }))
    }
    if (kind === "agent") {
      return (agents ?? []).map((a) => ({ id: a.value, label: a.label, hint: a.hint, active: a.value === agent }))
    }
    return []
  })

  let menuOpen = $derived(kind !== undefined && items.length > 0)

  $effect(() => {
    active = 0
  })

  // Update glide menu box indicator
  $effect(() => {
    if (!menuOpen) return
    const el = rowEls[active]
    if (el) box = { top: el.offsetTop, height: el.offsetHeight }
    requestAnimationFrame(() => {
      glideReady = true
    })
  })

  function closeMenu() {
    open = undefined
    dismissed = tokenKey
  }

  // Close on outside pointerdown
  $effect(() => {
    if (!menuOpen) return
    const onDown = (e: PointerEvent) => {
      if (root && !root.contains(e.target as Node)) closeMenu()
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  })

  function replaceToken(replacement: string) {
    const start = token?.start ?? caret
    const end = caret
    const next = text.slice(0, start) + replacement + text.slice(end)
    const pos = start + replacement.length
    text = next
    caret = pos
    requestAnimationFrame(() => {
      textareaEl?.focus()
      textareaEl?.setSelectionRange(pos, pos)
    })
  }

  function pick(i: number) {
    const item = items[i]
    if (!item) return
    if (kind === "computers") {
      if (token) replaceToken("")
      onPickComputer?.(item.id)
    } else if (kind === "slash") {
      replaceToken(SLASH.find((s) => s.name === item.id)?.text ?? "")
    } else if (kind === "agent") {
      onAgentChange?.(item.id)
    } else if (kind === "model") {
      const next = models?.find((m) => m.label === item.id)
      onModelChange?.(next?.value)
      if (next?.value === "opus" && model !== "opus") sweep += 1
    }
    open = undefined
    textareaEl?.focus()
  }

  function toggleMic() {
    if (listening) {
      dictation?.stop()
      return
    }
    dictation = createDictation({
      onInterim: (t) => (interim = t),
      onFinal: (t) => {
        if (t) {
          text = text && !/\s$/.test(text) ? `${text} ${t}` : text + t
        }
      },
      onEnd: (err) => {
        listening = false
        if (err) error = `Dictation: ${err}`
      },
    })
    if (!dictation) return
    error = undefined
    listening = true
    dictation.start()
  }

  async function send() {
    const value = text.trim()
    if (!value || sending || disabled) return
    sending = true
    error = undefined
    try {
      await onSubmit(value)
      text = ""
      caret = 0
    } catch (e) {
      error = (e as Error).message
    } finally {
      sending = false
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.isComposing) return
    if (menuOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        pick(active)
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        closeMenu()
        return
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  let sendable = $derived(text.trim().length > 0 && !sending && !disabled)
  let rounded = $derived(big || multi || footer !== undefined)
  let modelLabel = $derived(models?.find((m) => m.value === model)?.label ?? "Default")
  let computerLabel = $derived(computer === "local" ? "This Mac" : computer)
  let shownPlaceholder = $derived(listening ? interim || "Listening…" : disabled && disabledHint ? disabledHint : placeholder)
</script>

<div bind:this={root} class="relative">
  {#if menuOpen && kind}
    <div
      role="listbox"
      class={cx(
        "absolute z-30 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[18px] border border-line-strong bg-raised p-1.5 shadow-[0_18px_50px_-18px_rgba(0,0,0,.9)]",
        anchorAt && open === kind ? "" : "bottom-full mb-2 left-0 w-64",
      )}
      style={anchorAt && open === kind
        ? `bottom: ${anchorAt.bottom}px; width: ${anchorAt.width}px; ${anchorAt.right !== undefined ? `right: ${anchorAt.right}px;` : `left: ${anchorAt.left}px;`}`
        : ""}
    >
      <div class="px-3 pb-1 pt-1.5 text-[11px] font-semibold text-mute">
        {kind === "computers" ? "Run on" : kind === "slash" ? "Quick prompts" : kind === "agent" ? "Agent" : "Model"}
      </div>
      <div class="relative max-h-64 overflow-y-auto">
        {#if box}
          <span
            aria-hidden="true"
            class="pointer-events-none absolute inset-x-0 rounded-[14px] bg-hover"
            style="top: {box.top}px; height: {box.height}px; transition: {glideReady ? 'top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1)' : 'none'};"
          ></span>
        {/if}
        {#each items as item, i (item.id)}
          <button
            bind:this={rowEls[i]}
            type="button"
            role="option"
            aria-selected={i === active}
            onpointerdown={(e) => e.preventDefault()}
            onpointermove={() => i !== active && (active = i)}
            onclick={() => pick(i)}
            class="relative flex w-full items-center justify-between gap-3 rounded-[14px] px-3 py-2 text-left text-[13px] cursor-pointer"
          >
            <span class={cx("truncate font-semibold", item.active ? "text-accent" : "text-ink")}>{item.label}</span>
            {#if item.hint}
              <span class="shrink-0 truncate text-[12px] text-mute">{item.hint}</span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <div
    class={cx(
      "relative overflow-hidden border bg-raised transition-[border-radius,border-color,box-shadow] duration-200 focus-within:border-accent/45 focus-within:shadow-[0_0_0_4px_rgba(62,227,155,0.08)]",
      rounded ? "rounded-[24px]" : "rounded-full",
      disabled ? "border-line opacity-70" : "border-line-strong",
    )}
  >
    {#if sweep > 0}
      <span aria-hidden="true" class="os-sweep pointer-events-none absolute inset-0 opacity-0"></span>
    {/if}

    <div class="relative flex items-end gap-1.5 p-2">
      {#if hasComputers && !big}
        <button
          type="button"
          aria-label="Choose a computer"
          {disabled}
          onclick={() => (open = open === "computers" ? undefined : "computers")}
          class="grid size-9 shrink-0 place-items-center rounded-full text-dim transition hover:bg-hover hover:text-ink active:scale-[.94] disabled:opacity-50 cursor-pointer"
        >
          <Plus class="size-[18px]" strokeWidth={2.2} />
        </button>
      {/if}

      <textarea
        bind:this={textareaEl}
        bind:value={text}
        {disabled}
        oninput={(e) => {
          caret = e.currentTarget.selectionStart
        }}
        onselect={(e) => {
          caret = e.currentTarget.selectionStart
        }}
        onkeydown={onKeyDown}
        rows={1}
        placeholder={shownPlaceholder}
        class={cx(
          "block min-w-0 flex-1 resize-none bg-transparent leading-6 text-ink outline-none placeholder:text-mute",
          big ? "min-h-[64px] px-3 pt-3 pb-1 text-[15px]" : "px-2 py-1.5 text-[14px]",
          !hasComputers && !big && "pl-3",
        )}
      ></textarea>

      {#if !big}
        {#if models}
          <button
            type="button"
            {disabled}
            bind:this={modelBtn}
            onclick={() => (open = open === "model" ? undefined : "model")}
            aria-label="Model"
            class="inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-dim transition hover:bg-hover hover:text-ink active:scale-[.97] disabled:opacity-50 cursor-pointer"
          >
            <span>{modelLabel}</span>
            <ChevronDown class="size-3.5 text-mute" />
          </button>
        {/if}

        {#if canSpeak}
          <button
            type="button"
            {disabled}
            onclick={toggleMic}
            aria-label={listening ? "Stop dictation" : "Start dictation"}
            aria-pressed={listening}
            class={cx(
              "grid size-9 shrink-0 place-items-center rounded-full transition active:scale-[.94] disabled:opacity-50 cursor-pointer",
              listening ? "bg-accent/15 text-accent" : "text-dim hover:bg-hover hover:text-ink",
            )}
          >
            {#if listening}
              <span class="os-eq flex h-4 items-center gap-[3px]" aria-hidden="true">
                <span class="h-full w-[3px] rounded-full bg-accent"></span>
                <span class="h-full w-[3px] rounded-full bg-accent"></span>
                <span class="h-full w-[3px] rounded-full bg-accent"></span>
              </span>
            {:else}
              <Mic class="size-[18px]" strokeWidth={2} />
            {/if}
          </button>
        {/if}

        <button
          type="button"
          onclick={() => void send()}
          disabled={!sendable}
          aria-label="Send"
          class={cx(
            "grid size-9 shrink-0 place-items-center rounded-full transition active:scale-[.94] cursor-pointer",
            sendable ? "bg-accent text-accent-ink hover:bg-[#4ade9f]" : "bg-hover text-mute",
          )}
        >
          <ArrowUp class={cx("size-[18px]", sending && "animate-pulse")} strokeWidth={2.6} />
        </button>
      {/if}
    </div>

    {#if footer || computerLabel || big || agents}
      <div class="relative flex flex-wrap items-center gap-1.5 px-3 pb-3 pt-0.5">
        {#if hasComputers && computerLabel}
          <button
            type="button"
            bind:this={computerBtn}
            onclick={() => (open = open === "computers" ? undefined : "computers")}
            class="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-dim transition hover:bg-hover hover:text-ink active:scale-[.97] cursor-pointer"
          >
            <Monitor class="size-3.5 text-accent" />
            <span>on {computerLabel}</span>
            <ChevronDown class="size-3.5 text-mute" />
          </button>
        {/if}

        {#if agents && agents.length > 0}
          <button
            type="button"
            bind:this={agentBtn}
            {disabled}
            onclick={() => (open = open === "agent" ? undefined : "agent")}
            aria-label="Agent"
            class="inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-dim transition hover:bg-hover hover:text-ink active:scale-[.97] disabled:opacity-50 cursor-pointer"
          >
            <span>{agents.find((a) => a.value === agent)?.label ?? agent}</span>
            <ChevronDown class="size-3.5 text-mute" />
          </button>
        {/if}

        {@render footer?.()}

        {#if big}
          <div class="ml-auto flex items-center gap-1">
            {#if models}
              <button
                type="button"
                {disabled}
                bind:this={modelBtn}
                onclick={() => (open = open === "model" ? undefined : "model")}
                aria-label="Model"
                class="inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-dim transition hover:bg-hover hover:text-ink active:scale-[.97] disabled:opacity-50 cursor-pointer"
              >
                <span>{modelLabel}</span>
                <ChevronDown class="size-3.5 text-mute" />
              </button>
            {/if}

            {#if canSpeak}
              <button
                type="button"
                {disabled}
                onclick={toggleMic}
                aria-label={listening ? "Stop dictation" : "Start dictation"}
                aria-pressed={listening}
                class={cx(
                  "grid size-9 shrink-0 place-items-center rounded-full transition active:scale-[.94] disabled:opacity-50 cursor-pointer",
                  listening ? "bg-accent/15 text-accent" : "text-dim hover:bg-hover hover:text-ink",
                )}
              >
                {#if listening}
                  <span class="os-eq flex h-4 items-center gap-[3px]" aria-hidden="true">
                    <span class="h-full w-[3px] rounded-full bg-accent"></span>
                    <span class="h-full w-[3px] rounded-full bg-accent"></span>
                    <span class="h-full w-[3px] rounded-full bg-accent"></span>
                  </span>
                {:else}
                  <Mic class="size-[18px]" strokeWidth={2} />
                {/if}
              </button>
            {/if}

            <button
              type="button"
              onclick={() => void send()}
              disabled={!sendable}
              aria-label="Send"
              class={cx(
                "grid size-9 shrink-0 place-items-center rounded-full transition active:scale-[.94] cursor-pointer",
                sendable ? "bg-accent text-accent-ink hover:bg-[#4ade9f]" : "bg-hover text-mute",
              )}
            >
              <ArrowUp class={cx("size-[18px]", sending && "animate-pulse")} strokeWidth={2.6} />
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if error}
    <p class="mt-2 px-2 text-[12.5px] text-danger">{error}</p>
  {/if}
</div>

<style>
  @keyframes os-sweep {
    0% { transform: translateX(-100%); opacity: 0; }
    15% { opacity: .5; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  .os-sweep {
    background: linear-gradient(90deg, #ff4d4d, #ff9f43, #ffe14d, #3ee39b, #38d9e8, #4d8dff, #a66bff);
    filter: blur(18px);
    animation: os-sweep 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @keyframes os-eq { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
  .os-eq > span { transform-origin: center; animation: os-eq 900ms ease-in-out infinite; }
  .os-eq > span:nth-child(2) { animation-delay: -300ms; }
  .os-eq > span:nth-child(3) { animation-delay: -600ms; }
  @media (prefers-reduced-motion: reduce) {
    .os-sweep { display: none; }
    .os-eq > span { animation: none; }
  }
</style>
