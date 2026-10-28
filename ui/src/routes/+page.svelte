<script lang="ts">
  import { KeyRound } from "@lucide/svelte"
  import { api, readToken, setToken } from "$lib/api"
  import { createPoll } from "$lib/poll.svelte"
  import Sidebar, { type View } from "$lib/components/Sidebar.svelte"
  import NewThread from "$lib/components/NewThread.svelte"
  import ThreadView from "$lib/components/ThreadView.svelte"
  import Computers from "$lib/components/Computers.svelte"
  import Everywhere from "$lib/components/Everywhere.svelte"
  import MemoryStudio from "$lib/components/MemoryStudio.svelte"
  import Logo from "$lib/icons/besvelte-w.svelte"
  import { bgState } from "$lib/bitbacks/store.svelte"
  import BackgroundHost from "$lib/components/BackgroundHost.svelte"
  import BackgroundController from "$lib/components/BackgroundController.svelte"
  import ShaderMenu from "$lib/components/ShaderMenu.svelte"
  import SettingsModal from "$lib/components/SettingsModal.svelte"

  let token = $state<string | undefined>(readToken())

  $effect(() => {
    setToken(token)
  })

  let showSettings = $state(false)

  $effect(() => {
    if (!token) {
      const stored = typeof window !== "undefined" ? (sessionStorage.getItem("openspaces.token") || localStorage.getItem("openspaces.token")) : null
      if (stored) {
        token = stored
        setToken(stored)
        void threads.refresh()
        void computers.refresh()
        void agents.refresh()
        return
      }

      if (import.meta.env.DEV) {
        fetch("/api/dev-token")
          .then((r) => r.json())
          .then((data) => {
            if (data.token) {
              token = data.token
              setToken(data.token)
              try {
                sessionStorage.setItem("openspaces.token", data.token)
                localStorage.setItem("openspaces.token", data.token)
              } catch {}
              void threads.refresh()
              void computers.refresh()
              void agents.refresh()
            }
          })
          .catch(() => {})
      }
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

  // Apple screen header menu & global shortcuts
  $effect(() => {
    const onAction = (e: Event) => {
      const action = (e as CustomEvent<string>).detail
      if (action === "open-settings") {
        showSettings = true
      } else if (action === "new-thread") {
        view = { kind: "new" }
      } else if (action === "chat-emgem") {
        void startOrOpenEmgemThread()
      } else if (action === "open-memory") {
        view = { kind: "memory" }
      } else if (action === "open-computers") {
        view = { kind: "computers" }
      } else if (action === "open-everywhere") {
        view = { kind: "everywhere" }
      }
    }

    const onKey = (e: KeyboardEvent) => {
      const el = e.target instanceof HTMLElement ? e.target : undefined
      const typing = el !== undefined && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)
      const remote = el?.closest("[data-capture-keys]") != null || document.querySelector("[data-takeover]") !== null

      // Cmd+, opens Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault()
        showSettings = !showSettings
        return
      }

      // Cmd+Shift+M or Cmd+M opens Memory Studio
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "m") && e.shiftKey) {
        e.preventDefault()
        view = { kind: "memory" }
        return
      }

      if (!typing && !remote && e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        view = { kind: "new" }
      }
    }

    window.addEventListener("besvelte:action", onAction)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("besvelte:action", onAction)
      window.removeEventListener("keydown", onKey)
    }
  })

  function changed() {
    void threads.refresh()
  }

  async function startOrOpenEmgemThread(prompt?: string) {
    const emgemThread = threads.data?.find((t) => t.agent === "emgem" && t.status !== "closed")
    if (emgemThread) {
      view = { kind: "thread", id: emgemThread.id }
      if (prompt) {
        await api.send(emgemThread.id, prompt)
        changed()
      }
    } else {
      const newThread = await api.start({
        agent: "emgem",
        on: "local",
        prompt: prompt ?? "status",
      })
      changed()
      view = { kind: "thread", id: newThread.id }
    }
  }

  let hasNoToken = $derived(!token || (Boolean(threads.error?.includes("x-openspaces-token")) && threads.data === undefined))
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
  <div class="new-app-shell" style="--sidebar-opacity: {bgState.sidebarOpacity};">
    <BackgroundHost />
    <aside class="sidebar-solo br box">
      <Sidebar
        {view}
        onView={(v) => (view = v)}
        threads={threads.data}
        computers={computers.data}
        onOpenSettings={() => (showSettings = true)}
        onChatEmgem={() => void startOrOpenEmgemThread()}
      />
    </aside>
    <main class="main-solo grow relative overflow-hidden box">
			<ShaderMenu/>
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
        {:else if view.kind === "memory"}
          <MemoryStudio onChatEmgem={(prompt) => void startOrOpenEmgemThread(prompt)} />
        {/if}
      </div>
      <BackgroundController />
    </main>
  </div>

  <SettingsModal
    bind:open={showSettings}
    onChatEmgem={() => void startOrOpenEmgemThread()}
  />
{/if}
