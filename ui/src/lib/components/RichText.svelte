<script lang="ts" module>
  interface InlineToken {
    type: "text" | "code" | "bold"
    content: string
  }

  export function parseInline(text: string): InlineToken[] {
    const parts = text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g)
    return parts.map((chunk) => {
      if (chunk.startsWith("`") && chunk.endsWith("`") && chunk.length > 1) {
        return { type: "code", content: chunk.slice(1, -1) }
      }
      if (chunk.startsWith("**") && chunk.endsWith("**")) {
        return { type: "bold", content: chunk.slice(2, -2) }
      }
      return { type: "text", content: chunk }
    })
  }

  interface LineToken {
    type: "quote" | "bullet" | "heading" | "empty" | "text"
    content: string
  }

  export function parseLines(text: string): LineToken[] {
    const lines = text.replace(/^\n+|\n+$/g, "").split("\n")
    return lines.map((line) => {
      const quote = /^>\s?(.*)$/.exec(line)
      if (quote) return { type: "quote", content: quote[1] ?? "" }
      const bullet = /^\s*(?:[-*]|\d+\.)\s+(.*)$/.exec(line)
      if (bullet) return { type: "bullet", content: bullet[1] ?? "" }
      const heading = /^#{1,4}\s+(.*)$/.exec(line)
      if (heading) return { type: "heading", content: heading[1] ?? "" }
      if (!line.trim()) return { type: "empty", content: "" }
      return { type: "text", content: line }
    })
  }
</script>

<script lang="ts">
  let { text, mono = false }: { text: string; mono?: boolean } = $props()

  let parts = $derived(mono ? [] : text.split(/```[a-z0-9-]*\n?/i))
</script>

{#if mono}
  <pre class="whitespace-pre-wrap break-words font-mono text-[12.5px] leading-relaxed text-ink">{text}</pre>
{:else}
  <div class="space-y-1 text-[14px] leading-relaxed">
    {#each parts as part, i}
      {#if i % 2 === 1}
        <pre class="overflow-x-auto rounded-2xl border border-line bg-bg p-3 font-mono text-[12.5px] text-ink">{part.replace(/\n$/, "")}</pre>
      {:else}
        {#each parseLines(part) as line}
          {#if line.type === "quote"}
            <p class="border-l-2 border-accent/50 pl-3 italic text-ink/90">
              {#each parseInline(line.content) as token}
                {#if token.type === "code"}
                  <code class="rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[12.5px] text-accent">{token.content}</code>
                {:else if token.type === "bold"}
                  <strong class="font-semibold text-ink">{token.content}</strong>
                {:else}
                  {token.content}
                {/if}
              {/each}
            </p>
          {:else if line.type === "bullet"}
            <p class="flex gap-2 pl-1">
              <span class="mt-[9px] size-1 shrink-0 rounded-full bg-accent"></span>
              <span class="min-w-0 break-words">
                {#each parseInline(line.content) as token}
                  {#if token.type === "code"}
                    <code class="rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[12.5px] text-accent">{token.content}</code>
                  {:else if token.type === "bold"}
                    <strong class="font-semibold text-ink">{token.content}</strong>
                  {:else}
                    {token.content}
                  {/if}
                {/each}
              </span>
            </p>
          {:else if line.type === "heading"}
            <p class="pt-1 font-semibold text-ink">
              {#each parseInline(line.content) as token}
                {#if token.type === "code"}
                  <code class="rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[12.5px] text-accent">{token.content}</code>
                {:else if token.type === "bold"}
                  <strong class="font-semibold text-ink">{token.content}</strong>
                {:else}
                  {token.content}
                {/if}
              {/each}
            </p>
          {:else if line.type === "empty"}
            <div class="h-2"></div>
          {:else}
            <p class="whitespace-pre-wrap break-words">
              {#each parseInline(line.content) as token}
                {#if token.type === "code"}
                  <code class="rounded-md bg-accent/10 px-1.5 py-0.5 font-mono text-[12.5px] text-accent">{token.content}</code>
                {:else if token.type === "bold"}
                  <strong class="font-semibold text-ink">{token.content}</strong>
                {:else}
                  {token.content}
                {/if}
              {/each}
            </p>
          {/if}
        {/each}
      {/if}
    {/each}
  </div>
{/if}
