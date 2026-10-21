<script lang="ts">
  import type { ThreadStatus } from "$lib/api"
  import { STATUS_LABEL } from "$lib/format"
  import { cx } from "$lib/utils"
  import StatusDot from "./StatusDot.svelte"

  let { status, class: className }: { status: ThreadStatus; class?: string } = $props()

  let tone = $derived(
    status === "failed"
      ? "text-danger bg-danger/10 border-danger/20"
      : status === "closed"
        ? "text-mute bg-raised border-line"
        : "text-accent bg-accent/10 border-accent/20"
  )
</script>

<span class={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", tone, className)}>
  <StatusDot {status} />
  {STATUS_LABEL[status]}
</span>
