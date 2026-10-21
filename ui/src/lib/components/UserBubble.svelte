<script lang="ts">
  let { text }: { text: string } = $props()
</script>

<div class="rise flex justify-end">
  <div class="max-w-[78%] rounded-[22px] rounded-br-md border border-accent/25 bg-accent/12 px-4 py-2.5 text-[14px] leading-relaxed text-ink">
    <span class="whitespace-pre-wrap break-words">{text}</span>
  </div>
</div>
