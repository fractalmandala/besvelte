<script lang="ts">
  import { Play, Plus, Square, Trash2 } from "@lucide/svelte"
  import { api, type AgentName, type Sandbox } from "$lib/api"
  import { AGENT_LABEL } from "$lib/format"
  import { createPoll } from "$lib/poll.svelte"
  import GeckoIcon from "./GeckoIcon.svelte"
  import Button from "./ui/Button.svelte"
  import Card from "./ui/Card.svelte"
  import Skeleton from "./ui/Skeleton.svelte"
  import { cx } from "$lib/utils"

  const INSTALLABLE: readonly AgentName[] = ["claude-code", "codex", "gemini", "opencode"]
  const RUNTIME_LABEL: Record<string, string> = { container: "Apple container", docker: "Docker", podman: "Podman" }

  let { onChanged }: { onChanged: () => void } = $props()

  let poll = createPoll(api.sandboxes, 5000)
  let data = $derived(poll.data)

  let name = $state("")
  let agents = $state<readonly AgentName[]>(["claude-code"])
  let busy = $state<string | undefined>()
  let error = $state<string | undefined>()

  async function act(label: string, fn: () => Promise<unknown>) {
    busy = label
    error = undefined
    try {
      await fn()
      await poll.refresh()
      onChanged()
    } catch (e) {
      error = (e as Error).message
    } finally {
      busy = undefined
    }
  }

  function toggle(a: AgentName) {
    agents = agents.includes(a) ? agents.filter((x) => x !== a) : [...agents, a]
  }

  let creating = $derived(busy === "create")
</script>

<Card class="mt-7 overflow-hidden">
  <div class="border-b border-line bg-[radial-gradient(ellipse_at_top_left,rgba(52,211,153,0.10),transparent_60%)] p-5">
    <div class="flex items-center gap-2">
      <GeckoIcon name="terminal" size={30} class="-my-1" />
      <h2 class="text-[15px] font-semibold">Sandboxes on this Mac</h2>
      {#if data?.runtime}
        <span class="ml-auto rounded-full bg-raised px-2.5 py-0.5 text-[11.5px] text-dim">{RUNTIME_LABEL[data.runtime] ?? data.runtime}</span>
      {/if}
    </div>
    <p class="mt-1 text-[13px] text-dim">
      A private Linux computer for an agent, running on your own hardware. Each one is its own lightweight VM, so the agent can do anything inside
      without touching your files. Free, no limits.
    </p>

    {#if data && !data.runtime}
      <p class="mt-4 rounded-2xl border border-warn/25 bg-warn/10 px-3 py-2 text-[13px] text-warn">
        No container runtime found. Run <code class="font-mono">brew install container &amp;&amp; container system start</code>, then reload.
      </p>
    {:else}
      <div class="mt-4 flex flex-wrap gap-2">
        <input
          value={name}
          oninput={(e) => (name = e.currentTarget.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          placeholder="Name, e.g. dev"
          disabled={creating}
          class="h-10 w-48 rounded-2xl border border-line bg-raised px-3 text-[13.5px] outline-none placeholder:text-mute focus:border-accent/50"
        />
        <div class="flex flex-1 flex-wrap items-center gap-1.5">
          {#each INSTALLABLE as a (a)}
            <button
              onclick={() => toggle(a)}
              disabled={creating}
              class={cx(
                "h-8 rounded-full border px-3 text-[12.5px] transition cursor-pointer",
                agents.includes(a) ? "border-accent/40 bg-accent/12 text-accent" : "border-line text-dim hover:text-ink",
              )}
            >
              {AGENT_LABEL[a]}
            </button>
          {/each}
        </div>
        <Button
          variant="primary"
          disabled={!name || creating}
          onclick={() => void act("create", () => api.createSandbox(name, [...agents]).then(() => (name = "")))}
        >
          <Plus class="size-4" />
          <span>{creating ? "Creating…" : "Create"}</span>
        </Button>
      </div>

      {#if creating}
        <div class="mt-3 flex items-center gap-2 text-[12.5px] text-accent">
          <span class="size-1.5 rounded-full bg-accent pulse-ring"></span>
          <span>Booting the VM and installing {agents.map((a) => AGENT_LABEL[a]).join(", ")}. Usually under a minute.</span>
        </div>
      {/if}
    {/if}

    {#if error}
      <p class="mt-3 text-[12.5px] text-danger">{error}</p>
    {/if}
  </div>

  <div class="divide-y divide-line">
    {#if !data}
      <div class="p-4">
        <Skeleton class="h-10" />
      </div>
    {:else if data.sandboxes.length === 0}
      <p class="px-5 py-4 text-[13px] text-mute">No sandboxes yet.</p>
    {:else}
      {#each data.sandboxes as s (s.name)}
        {@const running = s.state === "running"}
        {@const mine = busy === s.name}
        <div class="flex items-center gap-3 px-5 py-3">
          <span class={cx("size-2 rounded-full", running ? "bg-accent pulse-ring" : "bg-mute")}></span>
          <div class="min-w-0 flex-1">
            <div class="text-[14px] font-medium">{s.name}</div>
            <div class="font-mono text-[11.5px] text-mute">
              {s.container} · {s.state}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            disabled={mine}
            onclick={() => void act(s.name, () => api.setSandbox(s.name, !running))}
          >
            {#if running}
              <Square class="size-3.5" />
              <span>Stop</span>
            {:else}
              <Play class="size-3.5" />
              <span>Start</span>
            {/if}
          </Button>
          <button
            disabled={mine}
            onclick={() => void act(s.name, () => api.removeSandbox(s.name))}
            class="rounded-lg p-2 text-mute transition hover:bg-danger/10 hover:text-danger disabled:opacity-40 cursor-pointer"
            aria-label="Delete {s.name}"
          >
            <Trash2 class="size-4" />
          </button>
        </div>
      {/each}
    {/if}
  </div>
</Card>
