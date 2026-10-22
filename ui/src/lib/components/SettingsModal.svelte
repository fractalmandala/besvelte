<script lang="ts">
  import { onMount } from "svelte"
  import { X, Cpu, HardDrive, Brain, Sparkles, Database, CheckCircle2, AlertCircle } from "@lucide/svelte"
  import { api, type MemoryStatus } from "$lib/api"
  import AgentAvatar from "./AgentAvatar.svelte"

  let { open = $bindable(false), onChatEmgem }: { open: boolean; onChatEmgem?: () => void } = $props()

  let activeTab = $state<"memory" | "bots" | "shortcuts">("memory")
  let memoryStatus = $state<MemoryStatus | null>(null)
  let loading = $state(false)
  let error = $state<string | null>(null)

  async function loadStatus() {
    loading = true
    error = null
    try {
      memoryStatus = await api.memoryStatus()
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load memory status"
    } finally {
      loading = false
    }
  }

  $effect(() => {
    if (open) {
      void loadStatus()
    }
  })

  function handleKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      open = false
    }
  }
</script>

<svelte:window onkeydown={handleKey} />

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
    <div
      class="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#161819] shadow-2xl flex flex-col max-h-[85vh]"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="flex size-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20">
            <Brain class="size-5" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-white">Besvelte Settings</h2>
            <p class="text-xs text-dim">Preferences, local memory engine & bots</p>
          </div>
        </div>
        <button
          onclick={() => (open = false)}
          class="rounded-lg p-1.5 text-dim hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X class="size-5" />
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex border-b border-white/10 px-6 bg-white/[0.02]">
        <button
          onclick={() => (activeTab = "memory")}
          class="flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors {activeTab === 'memory' ? 'border-accent text-white font-semibold' : 'border-transparent text-dim hover:text-white'}"
        >
          <Database class="size-4" />
          <span>Memory & Models</span>
        </button>
        <button
          onclick={() => (activeTab = "bots")}
          class="flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors {activeTab === 'bots' ? 'border-accent text-white font-semibold' : 'border-transparent text-dim hover:text-white'}"
        >
          <Sparkles class="size-4" />
          <span>Bots & Emgem</span>
        </button>
        <button
          onclick={() => (activeTab = "shortcuts")}
          class="flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors {activeTab === 'shortcuts' ? 'border-accent text-white font-semibold' : 'border-transparent text-dim hover:text-white'}"
        >
          <Cpu class="size-4" />
          <span>Shortcuts & Menu</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        {#if activeTab === "memory"}
          <!-- Live Engine Status Card -->
          <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                {#if memoryStatus?.running}
                  <div class="size-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span class="text-sm font-semibold text-white">Memory Engine Active</span>
                  <span class="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">Metal GPU</span>
                {:else}
                  <div class="size-2.5 rounded-full bg-amber-400"></div>
                  <span class="text-sm font-semibold text-white">Engine Inactive / Loading</span>
                {/if}
              </div>
              <button
                onclick={loadStatus}
                class="rounded-lg bg-white/5 hover:bg-white/10 px-2.5 py-1 text-xs text-dim hover:text-white transition-colors"
              >
                {loading ? "Checking…" : "Refresh"}
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div class="rounded-lg bg-black/30 p-2.5 border border-white/5">
                <span class="text-dim block mb-1">Local Daemon Port</span>
                <span class="font-mono text-white text-[13px]">{memoryStatus?.port ?? 4899} (127.0.0.1)</span>
              </div>
              <div class="rounded-lg bg-black/30 p-2.5 border border-white/5">
                <span class="text-dim block mb-1">Total Indexed Memories</span>
                <span class="font-mono text-accent font-semibold text-[13px]">{memoryStatus?.memoryCount ?? 0} records</span>
              </div>
            </div>
          </div>

          <!-- Models List -->
          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-dim">Loaded GGUF Models</h3>
            
            <div class="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex items-start gap-3">
              <div class="rounded-lg bg-accent/15 p-2 text-accent mt-0.5">
                <Brain class="size-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-white">EmbeddingGemma 2 (Text Backbone)</span>
                  <span class="text-[10px] rounded bg-white/10 px-1.5 py-0.5 font-mono text-dim">271M · Q8_0</span>
                </div>
                <p class="text-[11px] text-dim font-mono truncate mt-0.5">
                  {memoryStatus?.modelPath ?? "models/embeddinggemma-2-Q8_0.gguf"}
                </p>
                <div class="mt-2 flex items-center gap-2 text-[10px] text-dim">
                  <span>Dimension: 768d</span>
                  <span>•</span>
                  <span>Normalization: L2</span>
                  <span>•</span>
                  <span>Context: 8k</span>
                </div>
              </div>
            </div>

            <div class="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 flex items-start gap-3">
              <div class="rounded-lg bg-cyan-500/15 p-2 text-cyan-400 mt-0.5">
                <HardDrive class="size-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold text-white">Multimodal Projector (CLIP Vision)</span>
                  <span class="text-[10px] rounded bg-white/10 px-1.5 py-0.5 font-mono text-dim">473M · Q8_0</span>
                </div>
                <p class="text-[11px] text-dim font-mono truncate mt-0.5">
                  {memoryStatus?.mmprojPath ?? "models/mmproj-embeddinggemma-2-Q8_0.gguf"}
                </p>
                <div class="mt-2 flex items-center gap-2 text-[10px] text-dim">
                  <span>Projects UI screenshots into shared 768d text space</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Storage Details -->
          <div class="rounded-xl border border-white/5 bg-black/20 p-3.5 text-xs space-y-1.5">
            <span class="text-dim block">Local Vector Database:</span>
            <code class="text-accent font-mono text-[11px] block">~/.openspaces/memory.db</code>
            <p class="text-[11px] text-dim leading-relaxed">
              Powered by SQLite vector blobs and hardware-accelerated cosine similarity. Completely local and private on this Mac.
            </p>
          </div>

        {:else if activeTab === "bots"}
          <!-- Emgem Hero Card -->
          <div class="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-emerald-900/10 to-transparent p-5 space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="flex size-11 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 shadow-inner">
                  <AgentAvatar agent="emgem" size={28} />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-semibold text-white">Emgem</h3>
                    <span class="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">Always Available</span>
                  </div>
                  <p class="text-xs text-dim">Persistent Memory Companion</p>
                </div>
              </div>

              {#if onChatEmgem}
                <button
                  onclick={() => {
                    open = false
                    onChatEmgem?.()
                  }}
                  class="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles class="size-3.5" />
                  <span>Chat Now</span>
                </button>
              {/if}
            </div>

            <p class="text-xs text-dim leading-relaxed">
              Emgem is your dedicated memory agent. You can ask Emgem about previous tasks, bug fixes, git updates, or ask it to memorize notes directly from the chat interface.
            </p>

            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <div class="rounded-lg bg-black/40 p-2 border border-white/5">
                <span class="text-emerald-300 font-medium block">Search & Recall</span>
                <span class="text-dim">"What did we do with the rollup bug?"</span>
              </div>
              <div class="rounded-lg bg-black/40 p-2 border border-white/5">
                <span class="text-emerald-300 font-medium block">Save to Memory</span>
                <span class="text-dim">"remember: updated the docker setup"</span>
              </div>
            </div>
          </div>

          <!-- Other Agents -->
          <div class="space-y-2">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-dim">Other Integrated Coding Agents</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex items-center gap-2.5">
                <AgentAvatar agent="claude-code" size={20} />
                <span class="font-medium text-white">Claude Code</span>
              </div>
              <div class="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex items-center gap-2.5">
                <AgentAvatar agent="codex" size={20} />
                <span class="font-medium text-white">Codex</span>
              </div>
              <div class="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex items-center gap-2.5">
                <AgentAvatar agent="gemini" size={20} />
                <span class="font-medium text-white">Gemini CLI</span>
              </div>
              <div class="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex items-center gap-2.5">
                <AgentAvatar agent="shell" size={20} />
                <span class="font-medium text-white">Shell</span>
              </div>
            </div>
          </div>

        {:else if activeTab === "shortcuts"}
          <div class="space-y-4 text-xs">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-dim">Apple Screen Header Menu & Shortcuts</h4>

            <div class="rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
              <div class="flex items-center justify-between p-3 bg-white/[0.02]">
                <span class="text-white">Open Settings</span>
                <kbd class="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white">⌘ ,</kbd>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/[0.02]">
                <span class="text-white">New Thread</span>
                <kbd class="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white">⌘ N</kbd>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/[0.02]">
                <span class="text-white">Chat with Emgem</span>
                <kbd class="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white">⌘ E</kbd>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/[0.02]">
                <span class="text-white">Memory Studio</span>
                <kbd class="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white">⌘ M / ⌘ 1</kbd>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/[0.02]">
                <span class="text-white">Computers</span>
                <kbd class="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white">⌘ 2</kbd>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/[0.02]">
                <span class="text-white">Run Everywhere</span>
                <kbd class="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white">⌘ 3</kbd>
              </div>
              <div class="flex items-center justify-between p-3 bg-white/[0.02]">
                <span class="text-white">Reload Window</span>
                <kbd class="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-white">⌘ R</kbd>
              </div>
            </div>

            <p class="text-[11px] text-dim leading-relaxed">
              These commands are wired up to macOS's native application menu bar in <code class="font-mono text-accent">scripts/desktop.swift</code>.
            </p>
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end border-t border-white/10 px-6 py-3 bg-white/[0.02]">
        <button
          onclick={() => (open = false)}
          class="rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-1.5 text-xs transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  </div>
{/if}
