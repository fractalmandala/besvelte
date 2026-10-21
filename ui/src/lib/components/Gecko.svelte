<script lang="ts">
  import { GECKO } from "$lib/assets/geckos"
  import type { AgentName } from "$lib/api"
  import { colorFor, FACE, TINT, type GeckoMood, type Mood } from "./gecko"
  import { cx } from "$lib/utils"

  let {
    agent = "brand",
    seed,
    mood = "idle",
    size = 36,
    hoverLove = true,
    class: className,
  }: {
    agent?: AgentName | "brand"
    seed?: string
    mood?: Mood
    size?: number
    hoverLove?: boolean
    class?: string
  } = $props()

  const id = Math.random().toString(36).slice(2, 9)
  let hover = $state(false)
  let focused = $state(false)
  let hop = $state(false)

  $effect(() => {
    if (mood !== "busy") return
    const t = setInterval(() => {
      focused = !focused
    }, 2600)
    return () => clearInterval(t)
  })

  $effect(() => {
    if (mood !== "done") return
    hop = true
    const t = setTimeout(() => {
      hop = false
    }, 950)
    return () => clearTimeout(t)
  })

  let tint = $derived(seed ? colorFor(seed) : TINT[agent])
  let face = $derived<GeckoMood>(hover && hoverLove && mood !== "dead" ? "love" : mood === "busy" && focused ? "look" : FACE[mood])
  let motion = $derived(hop ? "gk-hop" : `gk-${mood}`)
  const { width: W, height: H } = GECKO
</script>

<span
  class={cx("relative inline-grid shrink-0 place-items-center", className)}
  style:width="{size}px"
  style:height="{size}px"
  onmouseenter={() => (hover = true)}
  onmouseleave={() => (hover = false)}
  role="img"
>
  <svg viewBox="0 0 {W} {H}" width={size} height={size} class={cx("gk overflow-visible", motion, (mood === "idle" || mood === "done") && "gk-blink")}>
    <defs>
      <linearGradient id="b{id}" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color={tint.from} />
        <stop offset="1" stop-color={tint.to} />
      </linearGradient>
    </defs>
    <g transform="translate(0,{H}) scale(0.1,-0.1)">
      <path d={GECKO.body} fill="url(#b{id})" />
      <path d={GECKO.shade} fill={tint.shade} />
      <g class="gk-eyes">
        <path class="gk-face" d={GECKO.moods[face]} fill="#060b08" />
      </g>
    </g>
  </svg>
  {#if mood === "asleep" && size >= 24}
    <span class="gk-z" style:font-size="{Math.max(9, size * 0.3)}px" aria-hidden="true">z</span>
  {/if}
</span>

<style>
  @keyframes gk-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.035) } }
  @keyframes gk-scurry { 0% { transform: rotate(-7deg) translate(-2%, 1%) } 100% { transform: rotate(6deg) translate(2%, -1%) } }
  @keyframes gk-hop { 0%,100% { transform: translateY(0) } 25% { transform: translateY(-14%) rotate(-6deg) } 45% { transform: translateY(0) } 60% { transform: translateY(-5%) } }
  @keyframes gk-shake { 0%,80%,100% { transform: translateX(0) } 84% { transform: translateX(-5%) rotate(-4deg) } 88% { transform: translateX(5%) rotate(4deg) } 92% { transform: translateX(-3%) } 96% { transform: translateX(3%) } }
  @keyframes gk-blink { 0%,93%,100% { transform: scaleY(1) } 96% { transform: scaleY(0.08) } }
  @keyframes gk-z { 0% { opacity: 0; transform: translate(0, 0) scale(.7) } 30% { opacity: .9 } 100% { opacity: 0; transform: translate(35%, -60%) scale(1.1) } }
  :global(.gk-z) { position: absolute; right: -6%; top: -4%; font-weight: 800; color: var(--color-dim); animation: gk-z 2.8s ease-out infinite; pointer-events: none; }
  @keyframes gk-pop { from { transform: scale(.6); opacity: 0 } to { transform: none; opacity: 1 } }
  :global(.gk) { transform-origin: 50% 55%; }
  :global(.gk-idle), :global(.gk-done), :global(.gk-asleep) { animation: gk-breathe 3.4s ease-in-out infinite; }
  :global(.gk-asleep) { animation-duration: 5s; filter: saturate(.35) brightness(.75); }
  :global(.gk-busy), :global(.gk-starting) { animation: gk-scurry .42s ease-in-out infinite alternate; }
  :global(.gk-starting) { animation-duration: .7s; }
  :global(.gk-hop) { animation: gk-hop .9s cubic-bezier(.3,1.6,.5,1) 1, gk-breathe 3.4s ease-in-out .9s infinite; }
  :global(.gk-stuck), :global(.gk-dead) { animation: gk-shake 2.6s ease-in-out infinite; }
  :global(.gk-dead) { filter: saturate(.5); }
  :global(.gk-eyes) { transform-box: fill-box; transform-origin: center; }
  :global(.gk-blink .gk-eyes) { animation: gk-blink 4.6s infinite; }
  :global(.gk-face) { animation: gk-pop .22s cubic-bezier(.3,1.5,.5,1) both; transform-box: fill-box; transform-origin: center; }
  @media (prefers-reduced-motion: reduce) { :global(.gk), :global(.gk *) { animation: none !important; } }
</style>
