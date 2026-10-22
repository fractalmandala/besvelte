<script lang="ts">
  import { onMount } from "svelte"
  import {
    Brain,
    Search,
    Plus,
    Trash2,
    RefreshCw,
    Sparkles,
    Check,
    Tag,
    Clock,
    Database,
    SlidersHorizontal,
    MessageSquare,
    ExternalLink
  } from "@lucide/svelte"
  import { api, type MemoryItem, type MemoryStatus } from "$lib/api"
  import { ago } from "$lib/format"
  import AgentAvatar from "./AgentAvatar.svelte"

  let { onChatEmgem }: { onChatEmgem?: (prompt?: string) => void } = $props()

  // State
  let status = $state<MemoryStatus | null>(null)
  let statusLoading = $state(false)

  // Search state
  let searchQuery = $state("")
  let searchType = $state<string>("all")
  let searchResults = $state<MemoryItem[]>([])
  let searching = $state(false)
  let hasSearched = $state(false)

  // Recent state
  let recentItems = $state<MemoryItem[]>([])
  let recentLoading = $state(false)

  // New Memory Form State
  let showCreateForm = $state(false)
  let newTitle = $state("")
  let newContent = $state("")
  let newType = $state("work")
  let saving = $state(false)
  let saveSuccess = $state(false)
  let saveError = $state<string | null>(null)

  let displayItems = $derived(hasSearched && searchQuery.trim() ? searchResults : recentItems)

  const TYPES = ["work", "note", "git", "turn", "screen", "sandbox"]

  async function loadStatus() {
    statusLoading = true
    try {
      status = await api.memoryStatus()
    } catch {}
    finally {
      statusLoading = false
    }
  }

  async function loadRecent() {
    recentLoading = true
    try {
      recentItems = await api.memoryRecent(20, searchType === "all" ? undefined : searchType)
    } catch {}
    finally {
      recentLoading = false
    }
  }

  async function doSearch() {
    const q = searchQuery.trim()
    if (!q) {
      searchResults = []
      hasSearched = false
      return
    }

    searching = true
    hasSearched = true
    try {
      searchResults = await api.memorySearch({
        query: q,
        type: searchType === "all" ? undefined : searchType,
        limit: 10,
        minScore: 0.15,
      })
    } catch {
      searchResults = []
    } finally {
      searching = false
    }
  }

  async function saveMemory(e: SubmitEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    saving = true
    saveError = null
    try {
      await api.memorySave({
        title: newTitle.trim(),
        content: newContent.trim(),
        type: newType,
        metadata: { source: "memory-studio" },
      })
      saveSuccess = true
      newTitle = ""
      newContent = ""
      setTimeout(() => {
        saveSuccess = false
        showCreateForm = false
      }, 1200)

      void loadStatus()
      void loadRecent()
      if (searchQuery.trim()) void doSearch()
    } catch (err) {
      saveError = err instanceof Error ? err.message : "Failed to save memory"
    } finally {
      saving = false
    }
  }

  async function deleteMemory(id: string) {
    try {
      await api.memoryDelete(id)
      recentItems = recentItems.filter((i) => i.id !== id)
      searchResults = searchResults.filter((i) => i.id !== id)
      void loadStatus()
    } catch {}
  }

  onMount(() => {
    void loadStatus()
    void loadRecent()
  })

  $effect(() => {
    // Reload recent when type filter changes if no search query
    if (!searchQuery.trim()) {
      void loadRecent()
    } else {
      void doSearch()
    }
  })

  function typeColor(type: string): string {
    switch (type) {
      case "work": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      case "note": return "text-amber-400 bg-amber-500/10 border-amber-500/20"
      case "git": return "text-blue-400 bg-blue-500/10 border-blue-500/20"
      case "turn": return "text-purple-400 bg-purple-500/10 border-purple-500/20"
      case "screen": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
      default: return "text-white/70 bg-white/5 border-white/10"
    }
  }
</script>

<div class="flex-1 overflow-y-auto px-8 py-6 space-y-6 max-w-6xl mx-auto w-full">
  <!-- Top Header Banner -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
    <div class="flex items-center gap-3.5">
      <div class="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 via-emerald-600/20 to-teal-900/40 border border-emerald-500/30 shadow-lg shadow-emerald-950/40">
        <Brain class="size-6 text-emerald-400" />
      </div>
      <div>
        <div class="flex items-center gap-2.5">
          <h1 class="text-xl font-bold tracking-tight text-white">Memory Studio</h1>
          <span class="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">EmbeddingGemma-2</span>
        </div>
        <p class="text-xs text-dim mt-0.5">Persistent semantic memory & multimodal index across all your work</p>
      </div>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-3">
      {#if onChatEmgem}
        <button
          onclick={() => onChatEmgem?.()}
          class="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 text-xs transition-colors shadow-lg shadow-emerald-500/20"
        >
          <AgentAvatar agent="emgem" size={18} />
          <span>Chat with Emgem</span>
        </button>
      {/if}

      <button
        onclick={() => (showCreateForm = !showCreateForm)}
        class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium px-3.5 py-2 text-xs transition-colors"
      >
        <Plus class="size-4" />
        <span>Save Note / Update</span>
      </button>
    </div>
  </div>

  <!-- Status Bar Overview -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
      <div>
        <span class="text-[11px] text-dim block font-medium">Engine Daemon</span>
        <div class="flex items-center gap-2 mt-1">
          <div class="size-2 rounded-full {status?.running ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></div>
          <span class="text-sm font-semibold text-white">{status?.running ? "Online (Metal)" : "Offline"}</span>
        </div>
      </div>
      <button
        onclick={loadStatus}
        class="rounded-lg p-1.5 text-dim hover:text-white hover:bg-white/5 transition-colors"
        title="Refresh Status"
      >
        <RefreshCw class="size-4 {statusLoading ? 'animate-spin' : ''}" />
      </button>
    </div>

    <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <span class="text-[11px] text-dim block font-medium">Total Memories Indexed</span>
      <span class="text-lg font-bold text-accent mt-1 block">{status?.memoryCount ?? 0}</span>
    </div>

    <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <span class="text-[11px] text-dim block font-medium">Text Backbone</span>
      <span class="text-xs font-mono text-white mt-1 block truncate">embeddinggemma-2 (768d)</span>
    </div>

    <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <span class="text-[11px] text-dim block font-medium">Multimodal Projector</span>
      <span class="text-xs font-mono text-cyan-400 mt-1 block truncate">mmproj (CLIP Vision)</span>
    </div>
  </div>

  <!-- Create Memory Drawer / Form -->
  {#if showCreateForm}
    <div class="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-4 animate-in slide-in-from-top-3 duration-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Sparkles class="size-4 text-emerald-400" />
          <h3 class="text-sm font-semibold text-white">Record New Work or Note into Memory</h3>
        </div>
        <button onclick={() => (showCreateForm = false)} class="text-xs text-dim hover:text-white">Cancel</button>
      </div>

      <form onsubmit={saveMemory} class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div class="md:col-span-3">
            <input
              bind:value={newTitle}
              placeholder="Title (e.g. Fixed rollup dynamic import bug, Docker setup…)"
              class="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-dim focus:border-accent focus:outline-none"
              required
            />
          </div>
          <div>
            <select
              bind:value={newType}
              class="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-accent focus:outline-none"
            >
              {#each TYPES as t}
                <option value={t}>{t.toUpperCase()}</option>
              {/each}
            </select>
          </div>
        </div>

        <div>
          <textarea
            bind:value={newContent}
            rows="3"
            placeholder="Details, explanation, commands executed, or notes. This will be converted to a 768-d vector and stored."
            class="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-dim focus:border-accent focus:outline-none leading-relaxed"
            required
          ></textarea>
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="text-[11px] text-dim">Stored in <code class="text-accent font-mono">~/.openspaces/memory.db</code></span>
          <button
            type="submit"
            disabled={saving || !newTitle.trim() || !newContent.trim()}
            class="rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-50 text-black font-semibold px-4 py-2 text-xs transition-colors flex items-center gap-2"
          >
            {#if saveSuccess}
              <Check class="size-4" />
              <span>Saved & Embedded!</span>
            {:else if saving}
              <RefreshCw class="size-4 animate-spin" />
              <span>Embedding…</span>
            {:else}
              <Database class="size-4" />
              <span>Save & Embed</span>
            {/if}
          </button>
        </div>

        {#if saveError}
          <p class="text-xs text-red-400 mt-1">{saveError}</p>
        {/if}
      </form>
    </div>
  {/if}

  <!-- Search & Filter Bar -->
  <div class="space-y-3">
    <div class="relative">
      <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-dim" />
      <input
        bind:value={searchQuery}
        onkeydown={(e) => e.key === "Enter" && doSearch()}
        placeholder="Semantic search query (e.g. 'how did we fix the rollup issue', 'docker agent setup', 'test failure')…"
        class="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-10 pr-24 py-3 text-sm text-white placeholder-dim focus:border-accent focus:bg-white/[0.05] focus:outline-none transition-all"
      />
      <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {#if searchQuery}
          <button
            onclick={() => {
              searchQuery = ""
              searchResults = []
              hasSearched = false
            }}
            class="text-[11px] text-dim hover:text-white px-2 py-1 rounded"
          >
            Clear
          </button>
        {/if}
        <button
          onclick={doSearch}
          class="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors"
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </div>
    </div>

    <!-- Type Filter Chips -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
      <span class="text-dim text-[11px] font-medium mr-1 flex items-center gap-1">
        <SlidersHorizontal class="size-3" />
        <span>Filter:</span>
      </span>
      {#each ["all", ...TYPES] as t}
        <button
          onclick={() => (searchType = t)}
          class="rounded-full px-3 py-1 font-medium transition-colors border {searchType === t ? 'bg-accent/20 border-accent/40 text-accent font-semibold' : 'bg-white/5 border-white/5 text-dim hover:text-white'}"
        >
          {t === "all" ? "All Types" : t.toUpperCase()}
          {#if t !== "all" && status?.types?.[t]}
            <span class="ml-1 opacity-60 text-[10px]">({status.types[t]})</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <!-- Results Section -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-dim">
        {#if hasSearched && searchQuery.trim()}
          Semantic Search Results ({searchResults.length})
        {:else}
          Recent Memory Stream ({recentItems.length})
        {/if}
      </h2>
      <button
        onclick={() => (searchQuery.trim() ? doSearch() : loadRecent())}
        class="text-xs text-dim hover:text-white flex items-center gap-1"
      >
        <RefreshCw class="size-3 {recentLoading || searching ? 'animate-spin' : ''}" />
        <span>Refresh</span>
      </button>
    </div>

    <!-- Items Grid -->
    {#if displayItems.length === 0}
      <div class="rounded-2xl border border-white/5 bg-white/[0.01] p-12 text-center space-y-3">
        <Brain class="size-8 text-dim mx-auto opacity-40" />
        <h3 class="text-sm font-semibold text-white">
          {hasSearched ? "No matching memories found" : "No memories recorded yet"}
        </h3>
        <p class="text-xs text-dim max-w-sm mx-auto leading-relaxed">
          {hasSearched
            ? "Try adjusting your query or lowering the similarity threshold. Or ask Emgem to remember something!"
            : "Click 'Save Note / Update' above or chat with Emgem to start building your persistent knowledge graph."}
        </p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each displayItems as item (item.id)}
          <div class="group rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] p-4 transition-all space-y-2">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="rounded-md border px-2 py-0.5 text-[10px] font-semibold {typeColor(item.type)}">
                  {item.type.toUpperCase()}
                </span>
                <h3 class="text-sm font-semibold text-white">{item.title}</h3>
                {#if item.score !== undefined}
                  <span class="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400">
                    {Math.round(item.score * 100)}% match
                  </span>
                {/if}
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {#if onChatEmgem}
                  <button
                    onclick={() => onChatEmgem?.(`Tell me more about: ${item.title}`)}
                    class="rounded-lg p-1 text-dim hover:text-white hover:bg-white/10 transition-colors"
                    title="Ask Emgem about this"
                  >
                    <MessageSquare class="size-3.5" />
                  </button>
                {/if}
                <button
                  onclick={() => deleteMemory(item.id)}
                  class="rounded-lg p-1 text-dim hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Memory"
                >
                  <Trash2 class="size-3.5" />
                </button>
              </div>
            </div>

            <!-- Content -->
            <p class="text-xs text-dim leading-relaxed whitespace-pre-wrap">{item.content}</p>

            <!-- Metadata & Timestamp footer -->
            <div class="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-dim/80">
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1">
                  <Clock class="size-3" />
                  <span>{ago(new Date(item.timestamp).toISOString())}</span>
                </span>
                <span class="font-mono text-[10px] opacity-50">ID: {item.id.slice(0, 8)}…</span>
              </div>

              {#if item.hasImage}
                <span class="text-[10px] rounded bg-cyan-500/15 text-cyan-300 px-1.5 py-0.5">Includes Screenshot</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
