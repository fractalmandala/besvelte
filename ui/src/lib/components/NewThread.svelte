<script lang="ts">
  import { SlidersHorizontal } from "@lucide/svelte"
  import { api, type AgentInfo, type AgentName, type Computer, type Thread } from "$lib/api"
  import { AGENT_LABEL } from "$lib/format"
  import Composer, { MODELS } from "./Composer.svelte"
  import Toggle from "./ui/Toggle.svelte"
  import { cx } from "$lib/utils"

  let {
    agents,
    computers,
    onStarted,
  }: {
    agents: readonly AgentInfo[] | undefined
    computers: readonly Computer[] | undefined
    onStarted: (thread: Thread) => void
  } = $props()

  const IDEAS = [
    { label: "Run the tests", text: "Clone my repo, run the tests and summarise what fails" },
    { label: "Upgrade deps", text: "Upgrade the dependencies and open a short changelog" },
    { label: "Check disk", text: "Check disk space and what's using the most memory" },
    { label: "Rank TODOs", text: "Find the TODOs in this project and rank them" },
  ]

  let agent = $state<AgentName>("claude-code")
  let on = $state("local")
  let autoApprove = $state(false)
  let computerTools = $state(true)
  let cwd = $state("")
  let showOptions = $state(false)
  let model = $state<string | undefined>()
  let idea = $state("")

  let agentItems = $derived(
    (agents ?? [{ name: "claude-code", binary: "claude", tested: true }]).map((a) => ({
      value: a.name,
      label: AGENT_LABEL[a.name],
      ...(a.tested ? {} : { hint: "beta" }),
    })),
  )

  let computerList = $derived(computers ?? [{ name: "local", address: "local", kind: "local" as const }])
</script>

<div class="box relative min0 hfull overflow-y">
  <div class="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[360px]"></div>
  <div class="relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-16">
    <h1 class="mb-6 text-center text-[30px] font-semibold tracking-tight">
      Give an agent <span class="text-accent">its own computer.</span>
    </h1>

    <Composer
      big
      autoFocus
      initial={idea}
      computers={computerList}
      computer={on}
      onPickComputer={(comp) => (on = comp)}
      models={MODELS}
      {model}
      onModelChange={(m) => (model = m)}
      placeholder="What should it do?"
      onSubmit={async (prompt) => {
        const thread = await api.start({
          agent,
          on,
          prompt,
          ...(model ? { model } : {}),
          autoApprove,
          ...(computerTools ? { allowTools: ["mcp__cua"] } : {}),
          ...(cwd.trim() ? { cwd: cwd.trim() } : {}),
        })
        onStarted(thread)
      }}
      agents={agentItems}
      {agent}
      onAgentChange={(a) => (agent = a as AgentName)}
    />

    <div class="mt-4 flex flex-wrap items-center justify-center gap-1.5">
      {#each IDEAS as item}
        <button
          onclick={() => (idea = item.text)}
          class="h-8 rounded-full px-3 text-[12.5px] font-semibold text-mute transition hover:bg-raised hover:text-ink cursor-pointer"
        >
          {item.label}
        </button>
      {/each}
      <span class="mx-1 h-4 w-px bg-line-strong"></span>
      <button
        onclick={() => (showOptions = !showOptions)}
        aria-expanded={showOptions}
        class={cx(
          "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold transition hover:bg-raised hover:text-ink cursor-pointer",
          showOptions || autoApprove || cwd.trim() || !computerTools ? "text-dim" : "text-mute",
        )}
      >
        <SlidersHorizontal class="size-3.5" />
        <span>Options</span>
      </button>
    </div>

    {#if showOptions}
      <div class="rise mx-auto mt-3 flex w-full flex-col gap-3 rounded-[20px] bg-raised/60 p-4">
        <Toggle bind:checked={computerTools} label="Let it use computers (Cua)" />
        <Toggle bind:checked={autoApprove} label="Auto-approve everything" />
        <input
          bind:value={cwd}
          placeholder="Work in /path/to/repo (optional)"
          class="h-9 rounded-full bg-hover px-3.5 font-mono text-[12px] text-ink outline-none placeholder:font-sans placeholder:text-mute focus:ring-2 focus:ring-accent/40"
        />
      </div>
    {/if}
  </div>
</div>
