<script lang="ts">
  import type { Snippet } from "svelte"
  import type { HTMLButtonAttributes } from "svelte/elements"
  import { cx } from "$lib/utils"

  interface Props extends HTMLButtonAttributes {
    label: string
    children?: Snippet
  }

  let { label, class: className, children, ...rest }: Props = $props()
</script>

<button
  {...rest}
  title={label}
  aria-label={label}
  class={cx(
    "grid size-10 place-items-center rounded-full bg-raised text-dim transition active:scale-95",
    "hover:bg-hover hover:text-accent disabled:opacity-35 disabled:pointer-events-none",
    className,
  )}
>
  {@render children?.()}
</button>
