<script lang="ts">
  import type { ThreadStatus } from "$lib/api"
  import { isBusy } from "$lib/format"
  import { cx } from "$lib/utils"

  let { status, class: className }: { status: ThreadStatus; class?: string } = $props()

  let color = $derived(
    status === "failed" ? "bg-danger" : status === "closed" ? "bg-mute" : isBusy(status) ? "bg-accent pulse-ring" : "bg-accent/70"
  )
</script>

<span class={cx("inline-block size-2 shrink-0 rounded-full", color, className)}></span>
