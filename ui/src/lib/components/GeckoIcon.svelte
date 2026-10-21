<script lang="ts">
  import { base } from "$app/paths"
  import { cx } from "$lib/utils"

  export type GeckoIconName =
    | "face" | "happy" | "wink" | "sparkle" | "badge" | "cool"
    | "crawl" | "peek" | "sleep" | "climb" | "idea" | "love"
    | "run" | "laptop" | "terminal" | "server" | "globe" | "cloud"
    | "done" | "failed" | "search" | "settings" | "shield" | "refresh"
    | "mail" | "new" | "link" | "location" | "calendar" | "bell"
    | "nap" | "hide" | "dizzy" | "king" | "code" | "stand"

  const MOTION: Partial<Record<GeckoIconName, string>> = { peek: "gicon-peek", idea: "gicon-glow" }

  function delayFor(name: string): string {
    const n = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
    return `${-((n % 17) / 17) * 3.8}s`
  }

  let {
    name,
    size = 22,
    label,
    class: className,
    still = false,
  }: {
    name: GeckoIconName
    size?: number
    label?: string
    class?: string
    still?: boolean
  } = $props()

  let iconSrc = $derived(`${base}/icons/${name}.png`)
  let delay = $derived(delayFor(name))
</script>

<img
  src={iconSrc}
  width={size}
  height={size}
  alt={label ?? ""}
  aria-hidden={label ? undefined : true}
  draggable={false}
  style="--gi-delay: {delay};"
  class={cx("inline-block shrink-0 select-none object-contain", !still && (MOTION[name] ?? "gicon"), className)}
/>
