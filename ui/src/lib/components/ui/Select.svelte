<script lang="ts">
  import type { Snippet } from "svelte"
  import type { HTMLSelectAttributes } from "svelte/elements"
  import { ChevronDown } from "@lucide/svelte"
  import { cx } from "$lib/utils"

  interface Props extends HTMLSelectAttributes {
    class?: string
    children?: Snippet
    value?: string
  }

  let { class: className, children, value = $bindable(), ...rest }: Props = $props()
</script>

<span class={cx("relative inline-flex", className)}>
  <select
    {...rest}
    bind:value
    class="h-9 w-full appearance-none rounded-full bg-hover pl-4 pr-8 text-[13px] font-semibold text-ink outline-none transition hover:bg-[#252a27] focus:ring-2 focus:ring-accent/40"
  >
    {@render children?.()}
  </select>
  <ChevronDown class="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-mute" />
</span>
