<script lang="ts" module>
	export type View =
		| { readonly kind: "new" }
		| { readonly kind: "thread"; readonly id: string }
		| { readonly kind: "computers" }
		| { readonly kind: "everywhere" };
</script>

<script lang="ts">
	import type { Computer, Thread } from "$lib/api";
	import { ago, AGENT_LABEL, isBusy, title } from "$lib/format";
	import { moodOf } from "./gecko";
	import NewThread from '$lib/iconsfill/newthread.svelte'
	import GeckoIcon from "./GeckoIcon.svelte";
	import AgentAvatar from "./AgentAvatar.svelte";
	import SectionLabel from "./ui/SectionLabel.svelte";
	import Skeleton from "./ui/Skeleton.svelte";
	import { cx } from "$lib/utils";
	import Newthread from "$lib/iconsfill/newthread.svelte";
	import ComputersIcon from '$lib/iconsfill/computers.svelte'
	import EverywhereIcon from '$lib/iconsfill/everywhere.svelte'

	let {
		view,
		onView,
		threads,
		computers,
	}: {
		view: View;
		onView: (view: View) => void;
		threads: readonly Thread[] | undefined;
		computers: readonly Computer[] | undefined;
	} = $props();

	let busy = $derived(threads?.filter((t) => isBusy(t.status)).length ?? 0);
	let open = $derived(threads?.filter((t) => t.status !== "closed") ?? []);
	let closed = $derived(threads?.filter((t) => t.status === "closed") ?? []);
</script>

<div class="box wfull px-bs py-2xl">
	<div class="box gap-md">
		<button
			onclick={() => onView({ kind: "new" })}
			class="wfull xleft ta-l button el-variants el-shape el-size row gap-bs"
			data-variant="primary"
			data-shape="round"
			data-size="lg"
		>
			<Newthread/>
			<span>New thread</span>
		</button>
		<button
			onclick={() => onView({ kind: "everywhere"})}
			class="wfull xleft ta-l button el-variants el-shape el-size row gap-bs"
			data-variant="primary"	
			data-shape="round"
			data-size="lg"
			>
			<EverywhereIcon/>
			Run Everywhere
		</button>	
		<button
			onclick={() => onView({ kind: "computers" })}
			class="wfull xleft ta-l button el-variants el-shape el-size row gap-bs"
			data-variant="primary"	
			data-shape="round"
			data-size="lg"
			>
			<ComputersIcon/>
			Computers
		</button>	
		<div class="box">
				{#if computers?.length}
					<span
						class="rounded-full bg-accent/15 px-1.5 text-[11px] font-semibold text-accent"
						>{computers.length}</span
					>
				{/if}
		</div>
	</div>
	<div class="mt-1 min-h-0 flex-1 overflow-y-auto px-2 pb-4">
		<SectionLabel>Bots{busy ? ` · ${busy} working` : ""}</SectionLabel>
		{#if threads === undefined}
			<div class="space-y-2 px-1">
				<Skeleton class="h-11" />
				<Skeleton class="h-11" />
				<Skeleton class="h-11" />
			</div>
		{:else if open.length === 0 && closed.length === 0}
			<div class="flex items-center gap-3 px-3 py-2">
				<GeckoIcon name="peek" size={44} />
				<p class="text-[13px] leading-relaxed text-mute">
					No bots yet. Start one and it shows up here.
				</p>
			</div>
		{:else}
			<div class="space-y-0.5">
				{#each open as t (t.id)}
					<button
						onclick={() => onView({ kind: "thread", id: t.id })}
						class={cx(
							"group flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition cursor-pointer",
							view.kind === "thread" && view.id === t.id
								? "bg-hover"
								: "hover:bg-hover/60",
						)}
					>
						<AgentAvatar
							agent={t.agent}
							seed={t.id}
							size={34}
							mood={moodOf(t.status, t.turns.at(-1)?.error)}
						/>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-[13px] text-ink">{title(t)}</span
							>
							<span class="block truncate text-[11.5px] text-mute">
								{AGENT_LABEL[t.agent]} · {t.on} · {ago(t.updatedAt)}
							</span>
						</span>
					</button>
				{/each}
			</div>
		{/if}

		{#if closed.length > 0}
			<SectionLabel>Closed</SectionLabel>
			<div class="space-y-0.5">
				{#each closed.slice(0, 20) as t (t.id)}
					<button
						onclick={() => onView({ kind: "thread", id: t.id })}
						class={cx(
							"group flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition opacity-55 cursor-pointer",
							view.kind === "thread" && view.id === t.id
								? "bg-hover !opacity-100"
								: "hover:bg-hover/60",
						)}
					>
						<AgentAvatar
							agent={t.agent}
							seed={t.id}
							size={34}
							mood={moodOf(t.status, t.turns.at(-1)?.error)}
						/>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-[13px] text-ink">{title(t)}</span
							>
							<span class="block truncate text-[11.5px] text-mute">
								{AGENT_LABEL[t.agent]} · {t.on} · {ago(t.updatedAt)}
							</span>
						</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>
	<div
		class="flex items-center gap-2 border-t border-line px-4 py-3 text-[12px] text-mute"
	>
		<span class="size-1.5 rounded-full bg-accent"></span>
		{computers
			? `${computers.length} computer${computers.length === 1 ? "" : "s"}`
			: "…"} · unlimited sessions
	</div>
</div>
