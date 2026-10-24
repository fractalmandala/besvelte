<script lang="ts" module>
	export type View =
		| { readonly kind: "new" }
		| { readonly kind: "thread"; readonly id: string }
		| { readonly kind: "computers" }
		| { readonly kind: "everywhere" }
		| { readonly kind: "memory" };
</script>

<script lang="ts">
	import { Brain, Settings, Sparkles } from "@lucide/svelte";
	import type { Computer, Thread } from "$lib/api";
	import { ago, AGENT_LABEL, isBusy, title } from "$lib/format";
	import { moodOf } from "./gecko";
	import AgentAvatar from "./AgentAvatar.svelte";
	import SectionLabel from "./ui/SectionLabel.svelte";
	import Skeleton from "./ui/Skeleton.svelte";
	import { cx } from "$lib/utils";
	import Newthread from "$lib/iconsfill/newthread.svelte";
	import ComputersIcon from '$lib/iconsfill/computers.svelte'
	import EverywhereIcon from '$lib/iconsfill/everywhere.svelte'
	import BrainIcon from '$lib/iconsfill/brain.svelte'
	import Liquid from '$lib/components/LiquidGlass.svelte'
  import Logo from "$lib/icons/besvelte-w.svelte"
	import Botta1 from '$lib/assets/logotype.svelte'

	let {
		view,
		onView,
		threads,
		computers,
		onOpenSettings,
		onChatEmgem,
	}: {
		view: View;
		onView: (view: View) => void;
		threads: readonly Thread[] | undefined;
		computers: readonly Computer[] | undefined;
		onOpenSettings?: () => void;
		onChatEmgem?: () => void;
	} = $props();

	let busy = $derived(threads?.filter((t) => isBusy(t.status)).length ?? 0);
	let open = $derived(threads?.filter((t) => t.status !== "closed") ?? []);
	let closed = $derived(threads?.filter((t) => t.status === "closed") ?? []);
</script>

<div class="sidebar-solo-child box wfull px-bs">
	<header class="sidebar-solo-header xleft row ycenter">
		<Logo/>
	</header>
	<div class="box gap-md pt-lg">
		<button
			onclick={() => onView({ kind: "new" })}
			class="wfull xleft ta-l button el-variants el-shape el-size row gap-bs"
			data-variant={view.kind === "new" ? "primary" : "ghost"}
			data-shape="round"
			data-size="lg"
		>
			<Newthread/>
			<span class="text-md">New thread</span>
		</button>
		<button
			onclick={() => onView({ kind: "memory" })}
			class="wfull xleft ta-l button el-variants el-shape el-size row gap-bs"
			data-variant={view.kind === "memory" ? "primary" : "ghost"}
			data-shape="round"
			data-size="lg"
		>
			<BrainIcon/>
			<span class="text-md">Memory Studio</span>
		</button>
		<button
			onclick={() => onView({ kind: "everywhere"})}
			class="wfull xleft ta-l button el-variants el-shape el-size row gap-bs"
			data-variant={view.kind === "everywhere" ? "primary" : "ghost"}
			data-shape="round"
			data-size="lg"
		>
			<EverywhereIcon/>
			<span class="text-md">Run Everywhere</span>
		</button>
		<button
			onclick={() => onView({ kind: "computers" })}
			class="wfull xleft ta-l button el-variants el-shape el-size row gap-bs"
			data-variant={view.kind === "computers" ? "primary" : "ghost"}
			data-shape="round"
			data-size="lg"
		>
			<ComputersIcon/>
			<span>Computers</span>
			{#if computers?.length}
				<span class="rounded-full bg-accent/15 px-1.5 text-[11px] font-semibold text-accent ml-auto">
					{computers.length}
				</span>
			{/if}
		</button>
		<!-- Emgem On-Call Bot Hero -->
		<div class="box gap-sm bt pt-xl">
			<p class="text-sm tt-u text-muted">Bots</p>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="pointer row gap-sm ycenter" onclick={() => onChatEmgem?.()}>
				<img class="logomotif" src="/avatars/lime.png" alt="bot"/>
				<p>Emgem</p>
			</div>
		</div>
		<!-- Threads / Active Bots -->
		<div>
			{#if threads === undefined}
				<div class="space-y-2 px-1">
					<Skeleton class="h-11" />
					<Skeleton class="h-11" />
				</div>
			{:else}
				<SectionLabel>Active Threads{busy ? ` · ${busy} working` : ""}</SectionLabel>
				<div class="space-y-0.5">
					{#each open as t (t.id)}
						<button
							onclick={() => onView({ kind: "thread", id: t.id })}
							class={cx(
								"group flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition cursor-pointer",
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
								<span class="block truncate text-[13px] text-ink">{title(t)}</span>
								<span class="block truncate text-[11.5px] text-mute">
									{AGENT_LABEL[t.agent]} · {t.on} · {ago(t.updatedAt)}
								</span>
							</span>
						</button>
					{/each}
				</div>
			{/if}

			{#if closed.length > 0}
				<div class="mt-4">
					<SectionLabel>Closed</SectionLabel>
					<div class="space-y-0.5">
						{#each closed.slice(0, 10) as t (t.id)}
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
									<span class="block truncate text-[13px] text-ink">{title(t)}</span>
									<span class="block truncate text-[11.5px] text-mute">
										{AGENT_LABEL[t.agent]} · {t.on} · {ago(t.updatedAt)}
									</span>
								</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
	<footer class="sidebar-solo-footer row xbetween wfull bt py-bs mt-auto">
		<span class="text-secondary text-sm">{computers ? `${computers.length} computer${computers.length === 1 ? "" : "s"}` : "…"}</span>
		<button onclick={() => onOpenSettings?.()} class="el-variants" data-variant="icon">
			<Settings class="size-4" />
		</button>
	</footer>
</div>
