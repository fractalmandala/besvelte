<script lang="ts">
  import type { Snippet } from "svelte"
  import { cx } from "$lib/utils"

  let { label, mono = false, children }: { label: string; mono?: boolean; children?: Snippet } = $props()
</script>

<div class="flex items-center justify-between gap-4 px-4 py-2.5 text-[13px] [&+&]:border-t [&+&]:border-line">
  <span class="text-dim">{label}</span>
  <span class={cx("min-w-0 truncate text-right text-ink", mono && "font-mono text-xs")}>
    {@render children?.()}
  </span>
</div>
