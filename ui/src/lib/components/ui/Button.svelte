<script lang="ts">
  import type { Snippet } from "svelte"
  import type { HTMLButtonAttributes } from "svelte/elements"
  import { cx } from "$lib/utils"

  type Variant = "primary" | "subtle" | "ghost" | "danger"

  const VARIANT: Record<Variant, string> = {
    primary: "bg-accent text-accent-ink hover:bg-[#4ade9f] font-semibold shadow-[0_0_24px_-6px_var(--color-accent)]",
    subtle: "bg-raised text-ink hover:bg-hover",
    ghost: "text-dim hover:text-ink hover:bg-hover",
    danger: "bg-raised text-danger hover:bg-danger/10",
  }

  interface Props extends HTMLButtonAttributes {
    variant?: Variant
    size?: "sm" | "md"
    children?: Snippet
  }

  let { variant = "subtle", size = "md", class: className, children, ...rest }: Props = $props()
</script>

<button
  {...rest}
  class={cx(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 select-none active:scale-[.97]",
    "disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-accent/60",
    size === "sm" ? "h-8 px-3.5 text-[13px]" : "h-10 px-5 text-sm",
    VARIANT[variant],
    className,
  )}
>
  {@render children?.()}
</button>
