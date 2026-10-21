<script lang="ts">
  import { KeyRound } from "@lucide/svelte"
  import { api, readToken, setToken } from "$lib/api"
  import { createPoll } from "$lib/poll.svelte"
  import Sidebar, { type View } from "$lib/components/Sidebar.svelte"
  import NewThread from "$lib/components/NewThread.svelte"
  import ThreadView from "$lib/components/ThreadView.svelte"
  import Computers from "$lib/components/Computers.svelte"
  import Everywhere from "$lib/components/Everywhere.svelte"
  import Logo from "$lib/icons/besvelte-w.svelte"
  import BackgroundHost from "$lib/components/BackgroundHost.svelte"
  import BackgroundController from "$lib/components/BackgroundController.svelte"

  let token = $state<string | undefined>(readToken())
  setToken(token)

  $effect(() => {
    if (!token && import.meta.env.DEV) {
      fetch("/api/dev-token")
        .then((r) => r.json())
        .then((data) => {
          if (data.token) {
            token = data.token
            setToken(data.token)
            try {
              sessionStorage.setItem("openspaces.token", data.token)
            } catch {}
            void threads.refresh()
            void computers.refresh()
            void agents.refresh()
          }
        })
        .catch(() => {})
    }
  })

  let view = $state<View>({ kind: "new" })
  let threads = createPoll(api.threads, 1500)
  let computers = createPoll(api.computers, 10_000)
  let agents = createPoll(api.agents, 60_000)

  $effect(() => {
    const onHash = () => {
      if (/token=/.test(window.location.hash)) {
        readToken()
        window.location.reload()
      }
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  })

  $effect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target instanceof HTMLElement ? e.target : undefined
      const typing = el !== undefined && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)
      const remote = el?.closest("[data-capture-keys]") != null || document.querySelector("[data-takeover]") !== null
      if (!typing && !remote && e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        view = { kind: "new" }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function changed() {
    void threads.refresh()
  }

  let hasNoToken = $derived(!token || Boolean(threads.error?.includes("x-openspaces-token")))
</script>

{#if hasNoToken}
  <div class="grid h-full place-items-center px-6">
    <div class="max-w-sm text-center">
      <div class="flex justify-center">
				<Logo/>
			</div>
      <KeyRound class="mx-auto mt-8 size-6 text-accent" />
      <h1 class="mt-3 text-[18px] font-semibold">Open the link from your terminal</h1>
      <p class="mt-2 text-[13.5px] leading-relaxed text-dim">
        For safety, the dashboard only works from the private link that <code class="font-mono text-accent">openspaces ui</code> prints.
      </p>
    </div>
  </div>
{:else}
	<div class="new-app-shell">
		<aside class="sidebar-solo br">
			<Sidebar {view} onView={(v) => (view = v)} threads={threads.data} computers={computers.data} />
		</aside>
		<main class="main-solo grow relative overflow-hidden flex flex-col min-w-0 min-h-0">
			<BackgroundHost />
			<div class="relative z-10 flex-1 min-h-0 min-w-0 flex flex-col">
				{#if view.kind === "new"}
					<NewThread
						agents={agents.data}
						computers={computers.data}
						onStarted={(t) => {
							changed()
							view = { kind: "thread", id: t.id }
						}}
					/>
				{:else if view.kind === "thread"}
					{#key view.id}
						<ThreadView id={view.id} onChanged={changed} />
					{/key}
				{:else if view.kind === "computers"}
					<Computers computers={computers.data} onChanged={() => void computers.refresh()} />
				{:else if view.kind === "everywhere"}
					<Everywhere computers={computers.data} onOpen={(id) => (view = { kind: "thread", id })} />
				{/if}
			</div>
			<BackgroundController />
		</main>
	</div>
{/if}
