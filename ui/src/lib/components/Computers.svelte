<script lang="ts">
  import { Check, Monitor, Plus, Trash2, X } from "@lucide/svelte"
  import { api, type Computer, type ComputerTest } from "$lib/api"
  import GeckoIcon, { type GeckoIconName } from "./GeckoIcon.svelte"
  import ScreenPane from "./ScreenPane.svelte"
  import Sandboxes from "./Sandboxes.svelte"
  import Button from "./ui/Button.svelte"
  import Card from "./ui/Card.svelte"
  import { cx } from "$lib/utils"

  let {
    computers,
    onChanged,
  }: {
    computers: readonly Computer[] | undefined
    onChanged: () => void
  } = $props()

  const KINDS = [
    { kind: "ssh", label: "SSH", icon: "server" as const, hint: "user@host or a Tailscale name", prefix: "ssh:" },
    { kind: "docker", label: "Docker", icon: "terminal" as const, hint: "container name", prefix: "docker:" },
    { kind: "cua", label: "Cua sandbox", icon: "cloud" as const, hint: "sandbox name, e.g. local:desk", prefix: "cua:" },
  ] as const

  const ICON: Record<string, GeckoIconName> = {
    local: "laptop",
    ssh: "server",
    container: "terminal",
    docker: "terminal",
    podman: "terminal",
    cua: "cloud",
  }

  let viewing = $state<string | undefined>()

  let kind = $state<(typeof KINDS)[number]>(KINDS[0])
  let addName = $state("")
  let addTarget = $state("")
  let addError = $state<string | undefined>()

  async function submitAdd() {
    addError = undefined
    try {
      await api.addComputer(addName.trim(), `${kind.prefix}${addTarget.trim()}`)
      addName = ""
      addTarget = ""
      onChanged()
    } catch (e) {
      addError = (e as Error).message
    }
  }

  let testMap = $state<Record<string, ComputerTest | undefined>>({})
  let testingMap = $state<Record<string, boolean>>({})

  async function runTest(name: string) {
    testingMap[name] = true
    try {
      testMap[name] = await api.testComputer(name)
    } catch (e) {
      testMap[name] = { ok: false, agents: {}, error: (e as Error).message }
    } finally {
      testingMap[name] = false
    }
  }
</script>

{#if viewing}
  <ScreenPane wide on={viewing} agentLabel="Nobody" busy={false} onClose={() => (viewing = undefined)} />
{:else}
  <div class="panel h-full min-w-0 flex-1 overflow-y-auto">
    <div class="mx-auto max-w-3xl px-6 py-10">
      <h1 class="text-[26px] font-semibold tracking-tight">Computers</h1>
      <p class="mt-1.5 text-[14px] text-dim">
        Anything that can run a shell is a computer. Geckobox connects to them directly — no relay, so no hour or session limits.
      </p>

      <Sandboxes {onChanged} />

      <h2 class="mt-10 text-[15px] font-semibold">Your computers</h2>

      <!-- AddComputer -->
      <Card class="mt-3 p-4">
        <div class="flex gap-1.5">
          {#each KINDS as k (k.kind)}
            <button
              onclick={() => (kind = k)}
              class={cx(
                "group inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] transition cursor-pointer",
                k.kind === kind.kind ? "bg-accent/12 text-accent ring-1 ring-accent/30" : "text-dim hover:bg-hover hover:text-ink",
              )}
            >
              <GeckoIcon name={k.icon} size={22} class="-ml-1" />
              <span>{k.label}</span>
            </button>
          {/each}
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <input
            bind:value={addName}
            placeholder="Name, e.g. mac-mini"
            class="h-10 w-44 rounded-2xl border border-line bg-raised px-3 text-[13.5px] outline-none placeholder:text-mute focus:border-accent/50"
          />
          <div class="flex h-10 min-w-[220px] flex-1 items-center rounded-2xl border border-line bg-raised pl-3 focus-within:border-accent/50">
            <span class="font-mono text-[12.5px] text-mute">{kind.prefix}</span>
            <input
              bind:value={addTarget}
              onkeydown={(e) => e.key === "Enter" && void submitAdd()}
              placeholder={kind.hint}
              class="h-full flex-1 bg-transparent px-1 font-mono text-[13px] outline-none placeholder:font-sans placeholder:text-mute"
            />
          </div>
          <Button variant="primary" onclick={() => void submitAdd()} disabled={!addName.trim() || !addTarget.trim()}>
            <Plus class="size-4" />
            <span>Add</span>
          </Button>
        </div>
        {#if addError}
          <p class="mt-2 text-[12.5px] text-danger">{addError}</p>
        {/if}
      </Card>

      <div class="mt-6 space-y-3">
        {#each computers ?? [] as c (c.name)}
          {@const test = testMap[c.name]}
          {@const testing = testingMap[c.name] ?? false}
          <Card class="rise p-4">
            <div class="flex items-center gap-3.5">
              <span class="grid size-11 place-items-center rounded-2xl border border-line bg-raised">
                <GeckoIcon name={ICON[c.kind] ?? "server"} size={40} />
              </span>
              <div class="min-w-0 flex-1">
                <div class="text-[14.5px] font-medium">{c.name === "local" ? "This machine" : c.name}</div>
                <div class="truncate font-mono text-[12px] text-mute">{c.address}</div>
              </div>
              <Button size="sm" variant="ghost" onclick={() => (viewing = c.name)}>
                <Monitor class="size-3.5" />
                <span>Desktop</span>
              </Button>
              <Button size="sm" onclick={() => void runTest(c.name)} disabled={testing}>
                <span>{testing ? "Checking…" : "Check"}</span>
              </Button>
              {#if c.name !== "local"}
                <button
                  onclick={() => void api.removeComputer(c.name).then(onChanged)}
                  class="rounded-lg p-2 text-mute transition hover:bg-danger/10 hover:text-danger cursor-pointer"
                  aria-label="Remove {c.name}"
                >
                  <Trash2 class="size-4" />
                </button>
              {/if}
            </div>

            {#if test}
              <div class="mt-4 border-t border-line pt-3.5">
                {#if test.ok}
                  <div class="flex flex-wrap items-center gap-2">
                    {#if test.host}
                      <span class="mr-1 text-[12.5px] text-dim">{test.host}</span>
                    {/if}
                    {#each Object.entries(test.agents) as [bin, has]}
                      <span
                        class={cx(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11.5px]",
                          has ? "border-accent/25 bg-accent/10 text-accent" : "border-line text-mute",
                        )}
                      >
                        {#if has}
                          <Check class="size-3" />
                        {:else}
                          <X class="size-3" />
                        {/if}
                        <span>{bin}</span>
                      </span>
                    {/each}
                  </div>
                {:else}
                  <p class="text-[13px] text-danger">{test.error ?? "Not reachable"}</p>
                {/if}
              </div>
            {/if}
          </Card>
        {/each}
      </div>
    </div>
  </div>
{/if}
