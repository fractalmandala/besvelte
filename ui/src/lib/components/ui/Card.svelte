<script lang="ts">
  import type { Snippet } from "svelte"
  import { cx } from "$lib/utils"

  let { class: className, children }: { class?: string; children?: Snippet } = $props()
</script>

<div class={cx("rounded-[22px] bg-raised/60 shadow-[inset_0_0_0_1px_var(--color-line)]", className)}>
  {@render children?.()}
</div>
