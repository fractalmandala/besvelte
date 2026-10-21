<script lang="ts">
  import type { Snippet } from "svelte"

  let { children }: { children?: Snippet } = $props()
</script>

<div class="px-3 pb-1.5 pt-5 text-[12px] font-bold text-mute">
  {@render children?.()}
</div>
