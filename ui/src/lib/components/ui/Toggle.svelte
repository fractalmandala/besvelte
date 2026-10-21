<script lang="ts">
  import { cx } from "$lib/utils"

  let { checked = $bindable(false), label, onchange }: { checked?: boolean; label: string; onchange?: (v: boolean) => void } = $props()

  function toggle() {
    checked = !checked
    onchange?.(checked)
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  onclick={toggle}
  class="inline-flex items-center gap-2 text-[13px] text-dim hover:text-ink cursor-pointer"
>
  <span class={cx("relative h-5 w-9 rounded-full border transition", checked ? "border-accent/40 bg-accent/80" : "border-line bg-raised")}>
    <span class={cx("absolute top-0.5 size-3.5 rounded-full transition-all", checked ? "left-[18px] bg-accent-ink" : "left-0.5 bg-mute")}></span>
  </span>
  {label}
</button>
