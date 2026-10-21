<script lang="ts">
  import { cx } from "$lib/utils"

  let { class: className }: { class?: string } = $props()
</script>

<div class={cx("skeleton rounded-2xl", className)}></div>
