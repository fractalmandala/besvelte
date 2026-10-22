<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import {
		ArrowLeft,
		ArrowRight,
		Check,
		ChevronDown,
		PanelLeft,
		Power,
		RotateCcw,
		Search,
		Sliders,
		Sparkles,
		X
	} from '@lucide/svelte';
	import { bgState } from '$lib/bitbacks/store.svelte';
	import { BACKGROUND_LIST, THEME_PALETTE, type PropControl } from '$lib/bitbacks/registry';
	import Knob from './Knob.svelte';

	let isOpen = $derived(bgState.isControllerOpen);
	let activeEntry = $derived(bgState.activeEntry);
	let currentProps = $derived(bgState.currentProps);
	let controls = $derived(activeEntry.controls);

	let isPickerOpen = $state(false);
	let searchQuery = $state('');
	let panelRef = $state<HTMLElement | null>(null);

	const numberControls = $derived(
		controls.filter((c): c is Extract<PropControl, { type: 'number' }> => c.type === 'number')
	);
	const otherControls = $derived(controls.filter((c) => c.type !== 'number'));

	const filteredList = $derived(
		searchQuery.trim() === ''
			? BACKGROUND_LIST
			: BACKGROUND_LIST.filter(
					(b) =>
						b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						b.id.toLowerCase().includes(searchQuery.toLowerCase())
				)
	);

	function toHexColor(val: any, fallback = '#10b981'): string {
		if (typeof val === 'string' && val.startsWith('#')) return val;
		if (Array.isArray(val) && val.length >= 3) {
			const r = Math.max(0, Math.min(255, Math.round(Number(val[0]) * (val[0] <= 1 ? 255 : 1))))
				.toString(16)
				.padStart(2, '0');
			const g = Math.max(0, Math.min(255, Math.round(Number(val[1]) * (val[1] <= 1 ? 255 : 1))))
				.toString(16)
				.padStart(2, '0');
			const b = Math.max(0, Math.min(255, Math.round(Number(val[2]) * (val[2] <= 1 ? 255 : 1))))
				.toString(16)
				.padStart(2, '0');
			return `#${r}${g}${b}`;
		}
		return fallback;
	}

	onMount(() => {
		function handlePointerDown(e: PointerEvent) {
			if (!bgState.isControllerOpen) return;
			const target = e.target as HTMLElement | null;
			if (!target) return;

			// Do not close if clicking inside the panel
			if (panelRef && panelRef.contains(target)) return;

			// Do not close if clicking on the ShaderMenu trigger button
			if (target.closest('[data-shader-menu-trigger]') || target.closest('.shader-menu')) {
				return;
			}

			// Don't close if native color picker dialog or active input
			if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'color') {
				return;
			}

			bgState.closeController();
		}

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape' && bgState.isControllerOpen) {
				if (isPickerOpen) {
					isPickerOpen = false;
				} else {
					bgState.closeController();
				}
			}
		}

		window.addEventListener('pointerdown', handlePointerDown);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('pointerdown', handlePointerDown);
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

{#if isOpen}
	<!-- Subtle backdrop to catch outside interactions softly -->
	<div
		transition:fade={{ duration: 150 }}
		class="fixed inset-0 z-[790] bg-black/20 backdrop-blur-[1px] pointer-events-none"
		aria-hidden="true"
	></div>

	<!-- Neumorphic Off-Canvas Console Panel -->
	<aside
		bind:this={panelRef}
		transition:fly={{ x: 440, duration: 250, opacity: 0.9 }}
		class="fixed top-3 right-3 bottom-3 z-[800] flex w-96 sm:w-[420px] max-w-[calc(100vw-1.5rem)] flex-col select-none font-sans text-zinc-200 antialiased"
		style="
			background: #17181c;
			border: 1px solid rgba(255, 255, 255, 0.07);
			box-shadow:
				-12px 12px 40px rgba(0, 0, 0, 0.75),
				0 0 0 1px rgba(0, 0, 0, 0.6),
				inset 0 1px 1px rgba(255, 255, 255, 0.09);
		"
		aria-label="Background Shader Controller"
	>
		<!-- Header: Clean Neumorphic Bar -->
		<div class="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 shrink-0">
			<div class="flex items-center gap-2">
				<div
					class="grid size-7 place-items-center rounded-lg"
					style="
						background: #1c1d22;
						box-shadow: inset 1px 1px 3px rgba(0,0,0,0.5), inset -1px -1px 2px rgba(255,255,255,0.03);
						border: 1px solid rgba(255,255,255,0.04);
					"
				>
					<Sparkles class="size-3.5 text-emerald-400/90" />
				</div>
				<div>
					<h2 class="text-[13px] font-semibold tracking-tight text-white">Shader Studio</h2>
					<p class="text-[10px] text-zinc-500 font-mono">Bitbacks Shader Engine</p>
				</div>
			</div>

			<div class="flex items-center gap-1.5">
				<!-- Power Toggle -->
				<button
					type="button"
					onclick={() => bgState.toggleEnabled()}
					class="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition cursor-pointer"
					style="
						background: {bgState.enabled ? '#1e2420' : '#1c1d22'};
						color: {bgState.enabled ? '#34d399' : '#71717a'};
						box-shadow: inset 1px 1px 2px rgba(0,0,0,0.4);
						border: 1px solid {bgState.enabled ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.04)'};
					"
					title={bgState.enabled ? 'Disable shader background' : 'Enable shader background'}
				>
					<Power class="size-3" />
					<span>{bgState.enabled ? 'On' : 'Off'}</span>
				</button>

				<!-- Reset Active Props -->
				<button
					type="button"
					onclick={() => bgState.resetCurrentProps()}
					class="grid size-7 place-items-center rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
					style="
						background: #1c1d22;
						box-shadow: 2px 2px 5px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.02);
						border: 1px solid rgba(255,255,255,0.04);
					"
					title="Reset parameters to default"
				>
					<RotateCcw class="size-3.5" />
				</button>

				<!-- Close Button -->
				<button
					type="button"
					onclick={() => bgState.closeController()}
					class="grid size-7 place-items-center rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
					style="
						background: #1c1d22;
						box-shadow: 2px 2px 5px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.02);
						border: 1px solid rgba(255,255,255,0.04);
					"
					title="Close controller"
				>
					<X class="size-3.5" />
				</button>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
			<!-- Section 1: Active Shader Selector & Carousel Card -->
			<div
				class="relative rounded-xl p-3"
				style="
					background: #141518;
					box-shadow: inset 2px 2px 5px rgba(0,0,0,0.5), inset -1.5px -1.5px 4px rgba(255,255,255,0.03);
					border: 1px solid rgba(255,255,255,0.04);
				"
			>
				<div class="flex items-center justify-between gap-2">
					<!-- Prev Shader -->
					<button
						type="button"
						onclick={() => bgState.prevBackground()}
						class="grid size-7 shrink-0 place-items-center rounded-lg text-zinc-400 hover:text-white hover:scale-105 active:scale-95 transition cursor-pointer"
						style="
							background: linear-gradient(145deg, #24262c, #1a1b1f);
							box-shadow: 2px 2px 5px rgba(0,0,0,0.5), -1px -1px 2px rgba(255,255,255,0.03);
							border: 1px solid rgba(255,255,255,0.05);
						"
						title="Previous background"
					>
						<ArrowLeft class="size-3.5" />
					</button>

					<!-- Active Shader Trigger (Click to open searchable list) -->
					<button
						type="button"
						onclick={() => (isPickerOpen = !isPickerOpen)}
						class="flex-1 min-w-0 flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-left transition hover:bg-white/[0.03] cursor-pointer"
					>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-1.5">
								<span class="text-[13.5px] font-semibold text-white tracking-tight truncate">
									{activeEntry.name}
								</span>
								<span class="rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-mono text-emerald-400 border border-emerald-500/20">
									Active
								</span>
							</div>
							{#if activeEntry.description}
								<p class="text-[10.5px] text-zinc-400 truncate mt-0.5">
									{activeEntry.description}
								</p>
							{/if}
						</div>
						<ChevronDown
							class="size-4 shrink-0 text-zinc-400 transition-transform duration-200 {isPickerOpen ? 'rotate-180' : ''}"
						/>
					</button>

					<!-- Next Shader -->
					<button
						type="button"
						onclick={() => bgState.nextBackground()}
						class="grid size-7 shrink-0 place-items-center rounded-lg text-zinc-400 hover:text-white hover:scale-105 active:scale-95 transition cursor-pointer"
						style="
							background: linear-gradient(145deg, #24262c, #1a1b1f);
							box-shadow: 2px 2px 5px rgba(0,0,0,0.5), -1px -1px 2px rgba(255,255,255,0.03);
							border: 1px solid rgba(255,255,255,0.05);
						"
						title="Next background"
					>
						<ArrowRight class="size-3.5" />
					</button>
				</div>

				<!-- Inline Shader Picker Dropdown -->
				{#if isPickerOpen}
					<div
						transition:fly={{ y: -6, duration: 150 }}
						class="mt-3 pt-3 border-t border-white/[0.06] space-y-2"
					>
						<div class="relative">
							<Search class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
							<input
								type="text"
								bind:value={searchQuery}
								placeholder="Search shaders ({BACKGROUND_LIST.length})..."
								class="w-full rounded-lg bg-[#101114] py-1.5 pl-8 pr-3 text-[11.5px] text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 border border-white/[0.06]"
							/>
						</div>

						<div class="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
							{#each filteredList as bg (bg.id)}
								{@const isSelected = bg.id === activeEntry.id}
								<button
									type="button"
									onclick={() => {
										bgState.setActiveBackground(bg.id);
										isPickerOpen = false;
									}}
									class="w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[11.5px] transition cursor-pointer {isSelected
										? 'bg-emerald-500/10 text-emerald-300 font-medium border border-emerald-500/20'
										: 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'}"
								>
									<span class="truncate pr-2">{bg.name}</span>
									{#if isSelected}
										<Check class="size-3.5 shrink-0 text-emerald-400" />
									{/if}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<div
				class="rounded-xl p-3 space-y-3"
				style="
					background: #15161a;
					box-shadow: 2px 2px 6px rgba(0,0,0,0.4), -1px -1px 3px rgba(255,255,255,0.02);
					border: 1px solid rgba(255,255,255,0.04);
				"
			>
				<!-- Master Shader Opacity -->
				<div class="space-y-1.5">
					<div class="flex items-center justify-between text-[11px]">
						<div class="flex items-center gap-1.5">
							<Sliders class="size-3 text-zinc-400" />
							<span class="font-medium text-zinc-300">Master Opacity</span>
						</div>
						<span class="font-mono font-semibold text-emerald-400 text-[11px]">
							{Math.round(bgState.opacity * 100)}%
						</span>
					</div>

					<div class="relative flex items-center">
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							value={bgState.opacity}
							oninput={(e) => bgState.setOpacity(Number(e.currentTarget.value))}
							class="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#0e0f12] accent-emerald-500"
							style="box-shadow: inset 1px 1px 2px rgba(0,0,0,0.8);"
						/>
					</div>
				</div>

				<!-- Sidebar Glass Opacity -->
				<div class="space-y-1.5 pt-2.5 border-t border-white/[0.04]">
					<div class="flex items-center justify-between text-[11px]">
						<div class="flex items-center gap-1.5">
							<PanelLeft class="size-3 text-zinc-400" />
							<span class="font-medium text-zinc-300">Sidebar Glass Opacity</span>
						</div>
						<span class="font-mono font-semibold text-emerald-400 text-[11px]">
							{Math.round(bgState.sidebarOpacity * 100)}%
						</span>
					</div>

					<div class="relative flex items-center">
						<input
							type="range"
							min="0"
							max="1"
							step="0.01"
							value={bgState.sidebarOpacity}
							oninput={(e) => bgState.setSidebarOpacity(Number(e.currentTarget.value))}
							class="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#0e0f12] accent-emerald-500"
							style="box-shadow: inset 1px 1px 2px rgba(0,0,0,0.8);"
						/>
					</div>
					<div class="flex items-center justify-between text-[9px] font-mono text-zinc-500">
						<span>Glass (0%)</span>
						<span>Solid (100%)</span>
					</div>
				</div>
			</div>

			<!-- Section 3: Dynamic Uniforms / Shader Controls -->
			<div class="space-y-3">
				<div class="flex items-center justify-between px-1">
					<h3 class="text-[11.5px] font-semibold text-zinc-300 tracking-tight uppercase">
						Uniforms & Parameters
					</h3>
					<span class="text-[10px] font-mono text-zinc-500">
						{controls.length} {controls.length === 1 ? 'prop' : 'props'}
					</span>
				</div>

				<!-- Keyed container ensures zero state bleeding when switching shaders -->
				{#key activeEntry.id}
					{#if controls.length === 0}
						<div
							class="rounded-xl p-6 text-center text-zinc-500 text-[11.5px]"
							style="
								background: #141518;
								box-shadow: inset 1px 1px 3px rgba(0,0,0,0.5);
								border: 1px dashed rgba(255,255,255,0.05);
							"
						>
							No customizable parameters for this shader.
						</div>
					{:else}
						<!-- Numerical Props (Knobs Grid) -->
						{#if numberControls.length > 0}
							<div
								class="rounded-xl p-3"
								style="
									background: #141518;
									box-shadow: inset 2px 2px 5px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(255,255,255,0.02);
									border: 1px solid rgba(255,255,255,0.04);
								"
							>
								<div class="grid grid-cols-2 gap-2">
									{#each numberControls as ctrl (activeEntry.id + '_' + ctrl.key)}
										{@const rawVal = currentProps[ctrl.key] ?? ctrl.default}
										<div
											class="rounded-lg p-1.5 flex flex-col items-center justify-center"
											style="
												background: linear-gradient(145deg, #1b1c21, #151619);
												box-shadow: 2px 2px 5px rgba(0,0,0,0.45), -1px -1px 2px rgba(255,255,255,0.02);
												border: 1px solid rgba(255,255,255,0.03);
											"
										>
											<Knob
												label={ctrl.label}
												value={Number(rawVal)}
												min={ctrl.min}
												max={ctrl.max}
												step={ctrl.step}
												defaultValue={ctrl.default}
												size={50}
												onchange={(v) => bgState.setProp(ctrl.key, v)}
											/>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Non-Numerical Props (Colors, Toggles, Selects) -->
						{#if otherControls.length > 0}
							<div
								class="rounded-xl p-3 space-y-3"
								style="
									background: #141518;
									box-shadow: inset 2px 2px 5px rgba(0,0,0,0.5), inset -1px -1px 3px rgba(255,255,255,0.02);
									border: 1px solid rgba(255,255,255,0.04);
								"
							>
								{#each otherControls as ctrl (activeEntry.id + '_' + ctrl.key)}
									{@const rawVal = currentProps[ctrl.key] ?? ctrl.default}

									{#if ctrl.type === 'color'}
										{@const hex = toHexColor(rawVal, ctrl.default)}
										<div
											class="flex items-center justify-between gap-2 p-2 rounded-lg"
											style="
												background: linear-gradient(145deg, #1b1c21, #151619);
												box-shadow: 1.5px 1.5px 4px rgba(0,0,0,0.4);
												border: 1px solid rgba(255,255,255,0.03);
											"
										>
											<div class="min-w-0 flex-1">
												<div class="text-[11.5px] font-medium text-zinc-300 truncate">
													{ctrl.label}
												</div>
												<div class="text-[9.5px] font-mono text-zinc-500">
													{hex.toUpperCase()}
												</div>
											</div>

											<!-- Swatch + Quick Palette -->
											<div class="flex items-center gap-1.5">
												<div class="flex items-center gap-1">
													{#each THEME_PALETTE.slice(0, 3) as pCol}
														<button
															type="button"
															onclick={() => bgState.setProp(ctrl.key, pCol)}
															class="size-3.5 rounded-full border border-white/10 hover:scale-110 transition cursor-pointer"
															style="background: {pCol};"
															title="Apply {pCol}"
														></button>
													{/each}
												</div>

												<!-- Interactive Swatch & Native Color Picker -->
												<label
													class="relative grid size-6 place-items-center rounded-md cursor-pointer border border-white/20 shadow-sm hover:scale-105 active:scale-95 transition"
													style="background: {hex};"
													title="Click to choose custom color"
												>
													<input
														type="color"
														value={hex}
														oninput={(e) => bgState.setProp(ctrl.key, e.currentTarget.value)}
														class="sr-only"
													/>
												</label>
											</div>
										</div>

									{:else if ctrl.type === 'boolean'}
										<div
											class="flex items-center justify-between gap-2 p-2 rounded-lg"
											style="
												background: linear-gradient(145deg, #1b1c21, #151619);
												box-shadow: 1.5px 1.5px 4px rgba(0,0,0,0.4);
												border: 1px solid rgba(255,255,255,0.03);
											"
										>
											<span class="text-[11.5px] font-medium text-zinc-300">
												{ctrl.label}
											</span>

											<button
												type="button"
												onclick={() => bgState.setProp(ctrl.key, !rawVal)}
												class="relative flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer"
												style="
													background: {rawVal ? '#10b981' : '#0e0f12'};
													box-shadow: inset 1px 1px 2px rgba(0,0,0,0.6);
													border: 1px solid {rawVal ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)'};
												"
												title="{ctrl.label}: {rawVal ? 'Enabled' : 'Disabled'}"
											>
												<span
													class="inline-block size-3.5 rounded-full bg-white transition-transform duration-150 {rawVal ? 'translate-x-4.5' : 'translate-x-0.5'}"
													style="box-shadow: 0 1px 2px rgba(0,0,0,0.5);"
												></span>
											</button>
										</div>

									{:else if ctrl.type === 'select'}
										<div
											class="flex flex-col gap-1.5 p-2 rounded-lg"
											style="
												background: linear-gradient(145deg, #1b1c21, #151619);
												box-shadow: 1.5px 1.5px 4px rgba(0,0,0,0.4);
												border: 1px solid rgba(255,255,255,0.03);
											"
										>
											<div class="text-[11px] font-medium text-zinc-300">
												{ctrl.label}
											</div>
											<div class="flex items-center gap-1 rounded-lg p-0.5 bg-[#0e0f12] border border-white/[0.04]">
												{#each ctrl.options as opt}
													{@const isSelected = opt === rawVal}
													<button
														type="button"
														onclick={() => bgState.setProp(ctrl.key, opt)}
														class="flex-1 py-1 rounded-md text-[10.5px] font-medium transition cursor-pointer text-center capitalize {isSelected
															? 'bg-[#22242a] text-emerald-400 shadow-sm border border-white/[0.06]'
															: 'text-zinc-400 hover:text-white'}"
													>
														{opt}
													</button>
												{/each}
											</div>
										</div>
									{/if}
								{/each}
							</div>
						{/if}
					{/if}
				{/key}
			</div>
		</div>

		<!-- Footer: Quick Status Bar -->
		<div class="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5 text-[10px] font-mono text-zinc-500 shrink-0">
			<span>besvelte bitbacks v1</span>
			<span class="text-zinc-400">{activeEntry.id}</span>
		</div>
	</aside>
{/if}
