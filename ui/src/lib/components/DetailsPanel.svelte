<script lang="ts">
  import { Monitor, Pause, Square, X } from "@lucide/svelte"
  import type { Thread } from "$lib/api"
  import { ago, AGENT_LABEL, cost, isBusy, title } from "$lib/format"
  import { moodOf } from "./gecko"
  import AgentAvatar from "./AgentAvatar.svelte"
  import Card from "./ui/Card.svelte"
  import IconButton from "./ui/IconButton.svelte"
  import Row from "./ui/Row.svelte"
  import SectionLabel from "./ui/SectionLabel.svelte"
  import StatusPill from "./ui/StatusPill.svelte"

  let {
    thread,
    onDesktop,
    onInterrupt,
    onCloseThread,
    onHide,
  }: {
    thread: Thread
    onDesktop: () => void
    onInterrupt: () => void
    onCloseThread: () => void
    onHide: () => void
  } = $props()

  const KIND_LABEL: Record<string, string> = {
    local: "This machine",
    ssh: "Over SSH",
    container: "Sandbox on this Mac",
    docker: "Docker container",
    podman: "Podman container",
    cua: "Cua sandbox",
  }

  let busy = $derived(isBusy(thread.status))
  let closed = $derived(thread.status === "closed")
  let total = $derived(cost(thread))
</script>

<aside class="panel flex h-full w-[360px] shrink-0 flex-col overflow-y-auto">
  <div class="flex justify-end px-3 pt-3">
    <button onclick={onHide} class="rounded-lg p-1.5 text-mute hover:bg-hover hover:text-ink cursor-pointer" aria-label="Hide details">
      <X class="size-4" />
    </button>
  </div>
  <div class="flex flex-col items-center px-6 pb-5 text-center">
    <AgentAvatar agent={thread.agent} seed={thread.id} size={84} mood={moodOf(thread.status, thread.turns.at(-1)?.error)} />
    <div class="mt-4 line-clamp-2 text-[15px] font-semibold leading-snug">{title(thread)}</div>
    <div class="mt-1 font-mono text-[11.5px] text-mute">{thread.id}</div>
    <div class="mt-3">
      <StatusPill status={thread.status} />
    </div>
    <div class="mt-5 flex gap-3">
      <IconButton label="Watch the desktop" onclick={onDesktop}>
        <Monitor class="size-4" />
      </IconButton>
      <IconButton label="Interrupt the turn" onclick={onInterrupt} disabled={!busy}>
        <Pause class="size-4" />
      </IconButton>
      <IconButton label="Close the thread" onclick={onCloseThread} disabled={closed} class="hover:!border-danger/40 hover:!text-danger">
        <Square class="size-3.5" />
      </IconButton>
    </div>
  </div>

  <div class="space-y-1 px-4 pb-6">
    <SectionLabel>Computer</SectionLabel>
    <Card>
      <button onclick={onDesktop} class="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-hover/50 cursor-pointer">
        <span class="grid size-9 place-items-center rounded-2xl border border-line bg-raised">
          <Monitor class="size-4 text-accent" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-[13.5px] font-medium">{thread.on}</span>
          <span class="flex items-center gap-1.5 text-[12px] text-dim">
            <span class="size-1.5 rounded-full bg-accent"></span> {KIND_LABEL[thread.computer.kind] ?? thread.computer.kind}
          </span>
        </span>
        <span class="text-[12px] text-accent">View</span>
      </button>
    </Card>

    <SectionLabel>Details</SectionLabel>
    <Card>
      <Row label="Agent">{AGENT_LABEL[thread.agent]}{thread.model ? ` · ${thread.model}` : ""}</Row>
      <Row label="Permissions">{thread.autoApprove ? "Auto-approve" : "Edits only"}</Row>
      <Row label="Turns">{thread.turns.length}</Row>
      {#if total > 0}
        <Row label="Cost">${total.toFixed(4)}</Row>
      {/if}
      <Row label="Started">{ago(thread.createdAt)}</Row>
      <Row label="Work dir" mono>{thread.cwd ?? `~/.openspaces/work/${thread.id}`}</Row>
      <Row label="Session" mono>{thread.sessionId ?? "—"}</Row>
    </Card>
    <p class="px-1 pt-3 text-[12px] leading-relaxed text-mute">
      {thread.deleteOnClose && !thread.cwd ? "Closing deletes the work dir on the computer." : "Closing keeps the work dir."} Runs directly on your
      computer — no relay, no session limits.
    </p>
  </div>
</aside>
