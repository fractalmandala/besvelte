<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowLeft, ArrowRight, Check, RotateCcw, Search, X } from '@lucide/svelte';
	import { bgState } from '$lib/bitbacks/store.svelte';
	import { BACKGROUND_LIST, THEME_PALETTE, type PropControl } from '$lib/bitbacks/registry';
	import Knob from './Knob.svelte';

	let activeEntry = $derived(bgState.activeEntry);
	let currentProps = $derived(bgState.currentProps);
	let controls = $derived(activeEntry.controls);

	let isMenuOpen = $state(false);
	let searchQuery = $state('');
	let containerRef = $state<HTMLDivElement | null>(null);

	const filteredList = $derived(
		searchQuery.trim() === ''
			? BACKGROUND_LIST
			: BACKGROUND_LIST.filter((b) =>
					b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					b.id.toLowerCase().includes(searchQuery.toLowerCase())
				)
	);

	function shortenLabel(label: string): string {
		return label
			.replace(/^(Rays|Light|Beam|Wave|Line|Grid|Dot|Star|Eye)\s+/i, '')
			.trim();
	}

	function rgbTupleToHex(rgb: [number, number, number]): string {
		const r = Math.round(rgb[0] * 255).toString(16).padStart(2, '0');
		const g = Math.round(rgb[1] * 255).toString(16).padStart(2, '0');
		const b = Math.round(rgb[2] * 255).toString(16).padStart(2, '0');
		return `#${r}${g}${b}`;
	}

	onMount(() => {
		function handleClickOutside(e: MouseEvent) {
			if (isMenuOpen && containerRef && !containerRef.contains(e.target as Node)) {
				isMenuOpen = false;
			}
		}
		window.addEventListener('click', handleClickOutside);
		return () => window.removeEventListener('click', handleClickOutside);
	});
</script>

<div
	bind:this={containerRef}
	class="fixed bottom-5 right-5 z-50 select-none font-sans antialiased text-zinc-100"
>
	<!-- Floating Menu Selection Popover -->
	{#if isMenuOpen}
		<div
			class="absolute bottom-full right-0 mb-3 flex w-84 max-w-[calc(100vw-2.5rem)] flex-col rounded-2xl border border-white/10 bg-[#141517]/96 p-3 text-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-black/50 animate-in fade-in slide-in-from-bottom-2 duration-150"
			style="border-color: oklch(0.34163 0.10527 145.46 / 0.4);"
		>
			<!-- Popover Header -->
			<div class="flex items-center justify-between pb-2 border-b border-white/8">
				<div class="flex items-center gap-1.5">
					<span class="text-[12.5px] font-semibold text-white">Select Background</span>
					<span class="text-[11px] text-zinc-400 font-mono">({BACKGROUND_LIST.length})</span>
				</div>
				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={() => bgState.resetCurrentProps()}
						class="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
						title="Reset active background props"
					>
						<RotateCcw class="size-3" />
						Reset
					</button>
					<button
						type="button"
						onclick={() => (isMenuOpen = false)}
						class="grid size-6 place-items-center rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
						title="Close menu"
					>
						<X class="size-3.5" />
					</button>
				</div>
			</div>

			<!-- Search Filter -->
			<div class="relative my-2">
				<Search class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search backgrounds..."
					class="w-full rounded-lg border border-white/10 bg-[#1c1d21] py-1.5 pl-8 pr-3 text-[12px] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[oklch(0.68_0.16_145.46)] focus:border-[oklch(0.68_0.16_145.46)]"
				/>
			</div>

			<!-- Background List -->
			<div class="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
				{#each filteredList as bg (bg.id)}
					{@const isActive = bg.id === bgState.activeId}
					<button
						type="button"
						onclick={() => {
							bgState.setActiveBackground(bg.id);
							isMenuOpen = false;
						}}
						class="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] transition cursor-pointer {isActive
							? 'bg-[oklch(0.34163_0.10527_145.46/0.4)] text-white font-medium border border-[oklch(0.68_0.16_145.46/0.4)] shadow-[0_0_10px_oklch(0.34163_0.10527_145.46/0.25)]'
							: 'text-zinc-300 hover:bg-white/8 hover:text-white'}"
					>
						<div class="min-w-0 flex-1 pr-2">
							<div class="truncate">{bg.name}</div>
							{#if bg.description}
								<div class="truncate text-[10px] text-zinc-400">{bg.description}</div>
							{/if}
						</div>
						{#if isActive}
							<Check class="size-4 shrink-0 text-[oklch(0.82_0.14_145.46)]" />
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Main Dock / Pill matching screenshot -->
	<div
		class="flex flex-col items-center rounded-[28px] border border-white/10 p-3 shadow-2xl backdrop-blur-2xl ring-1 ring-black/40"
		style="
			background: linear-gradient(180deg, rgba(32, 34, 38, 0.95) 0%, rgba(20, 21, 24, 0.98) 100%);
			box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65), 0 0 0 1px oklch(0.34163 0.10527 145.46 / 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.15);
		"
	>
		<!-- Top Row: Stylish Metallic Knobs -->
		<div class="flex items-center gap-2.5 overflow-x-auto max-w-[85vw] px-1 pb-1 scrollbar-none">
			<!-- Opacity Knob (always available) -->
			<Knob
				label="Opacity"
				value={bgState.opacity}
				min={0}
				max={1}
				step={0.01}
				defaultValue={0.25}
				displayFormatter={(v) => Math.round(v * 100) + '%'}
				onchange={(v) => bgState.setOpacity(v)}
			/>

			<!-- Dynamic Shader Prop Knobs (Numbers, Colors, Booleans, Enums) -->
			{#each controls as ctrl (ctrl.key)}
				{@const rawVal = currentProps[ctrl.key] ?? ctrl.default}
				{@const short = shortenLabel(ctrl.label)}

				{#if ctrl.type === 'number'}
					<Knob
						label={short}
						value={Number(rawVal)}
						min={ctrl.min}
						max={ctrl.max}
						step={ctrl.step}
						defaultValue={ctrl.default}
						onchange={(v) => bgState.setProp(ctrl.key, v)}
					/>

				{:else if ctrl.type === 'color'}
					{@const hexColor = typeof rawVal === 'string' ? rawVal : (Array.isArray(rawVal) && rawVal.length === 3 ? rgbTupleToHex(rawVal) : ctrl.default)}
					{@const palIdx = THEME_PALETTE.indexOf(hexColor)}
					<Knob
						label={short}
						value={palIdx >= 0 ? palIdx : 2}
						min={0}
						max={THEME_PALETTE.length - 1}
						step={1}
						defaultValue={2}
						colorSwatch={hexColor}
						displayFormatter={() => hexColor}
						onchange={(v) => bgState.setProp(ctrl.key, THEME_PALETTE[Math.round(v)])}
						onColorPick={(hex) => bgState.setProp(ctrl.key, hex)}
					/>

				{:else if ctrl.type === 'boolean'}
					<Knob
						label={short}
						value={rawVal ? 1 : 0}
						min={0}
						max={1}
						step={1}
						defaultValue={ctrl.default ? 1 : 0}
						displayFormatter={(v) => (v >= 0.5 ? 'On' : 'Off')}
						onchange={(v) => bgState.setProp(ctrl.key, v >= 0.5)}
					/>

				{:else if ctrl.type === 'select'}
					{@const opts = ctrl.options}
					{@const curIdx = Math.max(0, opts.indexOf(rawVal))}
					<Knob
						label={short}
						value={curIdx}
						min={0}
						max={opts.length - 1}
						step={1}
						defaultValue={Math.max(0, opts.indexOf(ctrl.default))}
						displayFormatter={(v) => opts[Math.round(v)] || ''}
						onchange={(v) => bgState.setProp(ctrl.key, opts[Math.round(v)])}
					/>
				{/if}
			{/each}
		</div>

		<!-- Bottom Row: Navigation & Active Name -->
		<div class="mt-2.5 flex items-center justify-center gap-2.5 w-full">
			<!-- Prev Arrow Button -->
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					bgState.prevBackground();
				}}
				class="grid size-6 place-items-center rounded-full bg-white/10 text-zinc-300 transition-all hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
				style="border: 1px solid rgba(255, 255, 255, 0.08);"
				title="Previous Background"
			>
				<ArrowLeft class="size-3.5" />
			</button>

			<!-- Active Background Name (Click to open menu selection) -->
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					isMenuOpen = !isMenuOpen;
				}}
				class="group flex items-center gap-1.5 rounded-xl px-3 py-1 transition-all hover:bg-white/8 active:scale-98 cursor-pointer"
				title="Click to choose background"
			>
				<span class="text-[15px] font-medium tracking-tight text-white/95 transition-colors group-hover:text-[oklch(0.82_0.14_145.46)]">
					{activeEntry.name}
				</span>
			</button>

			<!-- Next Arrow Button -->
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					bgState.nextBackground();
				}}
				class="grid size-6 place-items-center rounded-full bg-white/10 text-zinc-300 transition-all hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
				style="border: 1px solid rgba(255, 255, 255, 0.08);"
				title="Next Background"
			>
				<ArrowRight class="size-3.5" />
			</button>
		</div>
	</div>
</div>
