<script lang="ts">
  import { Hand, Maximize2, Monitor, Pause, X } from "@lucide/svelte"
  import { api, type Computer } from "$lib/api"
  import { clock, createRecorder } from "$lib/recorder.svelte"
  import { createScreen } from "$lib/screen.svelte"
  import LiveScreen, { type AgentPoint } from "./LiveScreen.svelte"
  import Button from "./ui/Button.svelte"
  import { cx } from "$lib/utils"

  let {
    on,
    agentLabel,
    busy,
    points,
    onPause,
    onClose,
    wide = false,
  }: {
    on: string
    agentLabel: string
    busy: boolean
    points?: readonly AgentPoint[]
    onPause?: () => void
    onClose?: () => void
    wide?: boolean
  } = $props()

  function label(str: string): string {
    return str === "local" ? "This Mac" : str.replace(/^cua:(local:)?/, "")
  }

  let picked = $state<string | undefined>()
  let takeover = $state(false)

  $effect(() => {
    on // track on changes
    picked = undefined
  })

  let target = $derived(picked ?? on)
  let screen = createScreen(() => target)
  let rec = createRecorder(() => screen.frame, () => label(target))

  let frame = $derived(screen.frame)
  let error = $derived(screen.error)
  let noScreen = $derived(!frame && error !== undefined)

  function takeOver() {
    if (busy && onPause) onPause()
    takeover = true
  }

  let others = $state<readonly Computer[]>([])
  $effect(() => {
    if (noScreen) {
      api.computers().then(
        (all) => (others = all.filter((c) => c.name !== target && c.kind !== "local")),
        () => (others = []),
      )
    }
  })

  // Fullscreen keyboard listener
  $effect(() => {
    if (!takeover) return
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && e.shiftKey) takeover = false
    }
    window.addEventListener("keydown", esc)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", esc)
      document.body.style.overflow = ""
    }
  })

  let ratio = $derived((frame?.width ?? 1280) / (frame?.height ?? 800))
  let fit = $derived(`min(1500px, calc(100vw - 64px), calc((100vh - 110px) * ${ratio.toFixed(4)}))`)
</script>

<section class={cx("panel flex min-w-0 flex-col overflow-hidden", wide ? "flex-1" : "w-[52%] max-w-[1100px] shrink-0")}>
  <header class="flex h-14 shrink-0 items-center gap-2.5 px-5">
    <Monitor class="size-4 text-accent" />
    <span class="text-[14.5px] font-bold">{label(target)}</span>
    {#if frame && !noScreen}
      <span class="inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-2.5 py-0.5 text-[11.5px] font-bold text-accent">
        <span class="size-1.5 rounded-full bg-accent pulse-ring"></span> Live
      </span>
    {/if}
    <div class="ml-auto flex items-center gap-1.5">
      {#if frame}
        <Button size="sm" onclick={takeOver}>
          <Hand class="size-3.5" />
          <span>Take over</span>
        </Button>
      {/if}
      {#if onClose}
        <button
          onclick={onClose}
          class="grid size-8 place-items-center rounded-full text-mute hover:bg-hover hover:text-ink cursor-pointer"
          aria-label="Close"
        >
          <X class="size-4" />
        </button>
      {/if}
    </div>
  </header>

  <div class="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-4 pb-4">
    {#if noScreen}
      <div class="grid h-full place-items-center px-4 py-10">
        <div class="max-w-sm text-center">
          <span class="mx-auto grid size-12 place-items-center rounded-[18px] bg-raised">
            <Monitor class="size-5 text-accent" />
          </span>
          <h3 class="mt-4 text-[16px] font-bold">{target === "local" ? "This is your own screen" : "No screen to show"}</h3>
          <p class="mt-1.5 text-[13px] leading-relaxed text-dim">
            {target === "local" ? "The agent works on this Mac, right in front of you." : (error ?? "This computer has no desktop.")}
          </p>
          {#if others.length > 0}
            <div class="mt-5 text-[12px] font-bold text-mute">Watch another computer</div>
            <div class="mt-2 flex flex-wrap justify-center gap-2">
              {#each others as c (c.name)}
                <Button size="sm" onclick={() => (picked = c.name)}>
                  <Monitor class="size-3.5" />
                  <span>{c.name}</span>
                </Button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <!-- Resting card: the live screen; hover reveals an Open pill -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="group/screen relative cursor-pointer" onclick={() => (takeover = true)}>
        <LiveScreen
          on={target}
          {frame}
          {error}
          {points}
          class="transition-shadow duration-150 group-hover/screen:shadow-[0_20px_60px_-25px_rgba(62,227,155,.45)]"
        />
        {#if frame}
          <div class="absolute inset-0 grid place-items-center rounded-[22px] bg-black/0 transition-colors duration-150 group-hover/screen:bg-black/25">
            <span class="translate-y-1 opacity-0 transition duration-150 group-hover/screen:translate-y-0 group-hover/screen:opacity-100">
              <Button size="sm" variant="primary">
                <Maximize2 class="size-3.5" />
                <span>Open</span>
              </Button>
            </span>
          </div>
        {/if}
        {#if rec.recording}
          <span class="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-danger/15 py-0.5 pl-1.5 pr-2 text-[11.5px] font-bold tabular-nums text-danger backdrop-blur">
            <span class="size-2 animate-pulse rounded-full bg-danger"></span> REC {clock(rec.secs)}
          </span>
        {/if}
      </div>

      <div class="mt-3 flex items-center justify-between gap-3 rounded-full bg-raised/70 py-1.5 pl-4 pr-1.5 text-[13px]">
        <span class="flex items-center gap-2 font-semibold text-dim">
          <span class={cx("size-2 rounded-full", busy ? "bg-accent pulse-ring" : "bg-mute")}></span>
          {busy ? `${agentLabel} has control` : `${agentLabel} is waiting`}
        </span>
        <span class="flex gap-1.5">
          {#if busy && onPause}
            <Button size="sm" variant="ghost" onclick={onPause}>
              <Pause class="size-3.5" />
              <span>Pause</span>
            </Button>
          {/if}
          <Button size="sm" variant="primary" onclick={takeOver} disabled={!frame}>
            <Hand class="size-3.5" />
            <span>Take over</span>
          </Button>
        </span>
      </div>
    {/if}
  </div>

  <!-- Fullscreen Takeover Modal -->
  {#if takeover}
    <div
      data-takeover=""
      role="dialog"
      aria-modal="true"
      aria-label="{label(target)}'s screen"
      class="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-6"
    >
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="viewer-fade absolute inset-0 bg-black/75 backdrop-blur-md" onclick={() => (takeover = false)}></div>
      <div
        class="viewer-pop relative flex max-h-full flex-col overflow-hidden rounded-[22px] bg-panel p-2 pt-0 shadow-[0_40px_140px_-40px_rgba(0,0,0,.95),inset_0_0_0_1px_var(--color-line)]"
        style="width: calc({fit} + 16px);"
      >
        <div class="flex h-12 shrink-0 items-center justify-between gap-3 px-2">
          <div class="flex min-w-0 items-center gap-2">
            <span class="truncate text-[13.5px] font-bold">{label(target)}</span>
            <span class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-[11.5px] font-bold text-accent-ink">
              <Hand class="size-3" /> You have control
            </span>
            {#if rec.recording}
              <span class="inline-flex items-center gap-1.5 rounded-full bg-danger/15 py-0.5 pl-1.5 pr-2 text-[11.5px] font-bold tabular-nums text-danger backdrop-blur">
                <span class="size-2 animate-pulse rounded-full bg-danger"></span> REC {clock(rec.secs)}
              </span>
            {/if}
          </div>
          <div class="flex shrink-0 items-center gap-1.5">
            {#if busy && onPause}
              <Button size="sm" variant="ghost" onclick={onPause}>
                <Pause class="size-3.5" />
                <span>Pause {agentLabel}</span>
              </Button>
            {/if}
            {#if rec.supported}
              {#if rec.recording}
                <button
                  onclick={rec.stop}
                  class="inline-flex h-8 items-center gap-1.5 rounded-full bg-danger pl-3 pr-3.5 text-[13px] font-bold text-white transition active:scale-[.96] cursor-pointer"
                >
                  <span class="size-2.5 rounded-[2px] bg-white"></span> End
                </button>
              {:else}
                <Button size="sm" onclick={rec.start}>
                  <span class="grid size-3.5 place-items-center rounded-full border-2 border-current">
                    <span class="size-1.5 rounded-full bg-danger"></span>
                  </span>
                  <span>Record</span>
                </Button>
              {/if}
            {/if}
            <Button size="sm" variant="primary" onclick={() => (takeover = false)}>
              Give back control
            </Button>
            <button
              onclick={() => (takeover = false)}
              aria-label="Collapse"
              class="grid size-8 place-items-center rounded-full text-mute transition hover:bg-hover hover:text-ink cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
          </div>
        </div>
        <LiveScreen on={target} {frame} {error} {points} interactive class="rounded-[14px]" />
      </div>
    </div>
  {/if}
</section>

<style>
  @keyframes viewer-fade { from { opacity: 0 } to { opacity: 1 } }
  @keyframes viewer-pop { from { opacity: 0; transform: scale(.96) translateY(8px) } to { opacity: 1; transform: none } }
  :global(.viewer-fade) { animation: viewer-fade 180ms ease-out both; }
  :global(.viewer-pop) { animation: viewer-pop 240ms cubic-bezier(.23,1,.32,1) both; }
  @media (prefers-reduced-motion: reduce) { :global(.viewer-fade), :global(.viewer-pop) { animation: none; } }
</style>
