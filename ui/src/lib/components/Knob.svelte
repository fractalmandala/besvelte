<script lang="ts">
	type Props = {
		value: number;
		min?: number;
		max?: number;
		step?: number;
		defaultValue?: number;
		label: string;
		displayFormatter?: (val: number) => string;
		colorSwatch?: string;
		onColorPick?: (color: string) => void;
		size?: number;
		onchange: (value: number) => void;
	};

	let {
		value,
		min = 0,
		max = 1,
		step = 0.01,
		defaultValue = 0,
		label,
		displayFormatter,
		colorSwatch,
		onColorPick,
		size = 44,
		onchange
	}: Props = $props();

	let isDragging = $state(false);
	let isHovered = $state(false);
	let startY = $state(0);
	let startVal = $state(0);
	let colorInputEl = $state<HTMLInputElement | null>(null);

	const range = $derived(Math.max(0.00001, max - min));
	const normalized = $derived(Math.max(0, Math.min(1, (value - min) / range)));

	// 270-degree arc in 44x44 coordinate system
	const R = 17;
	const C = 2 * Math.PI * R; // ~106.814
	const ARC_LENGTH = (270 / 360) * C; // ~80.11
	const GAP_LENGTH = C - ARC_LENGTH;

	const dashOffset = $derived(ARC_LENGTH * (1 - normalized));
	const rotationDeg = $derived(-135 + normalized * 270);

	const formattedText = $derived.by(() => {
		if (displayFormatter) return displayFormatter(value);
		if (step >= 1) return Math.round(value).toString();
		if (step >= 0.1) return value.toFixed(1);
		return value.toFixed(2);
	});

	function handlePointerDown(e: PointerEvent) {
		isDragging = true;
		startY = e.clientY;
		startVal = value;
		e.currentTarget?.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const deltaY = startY - e.clientY;
		const sensitivity = e.shiftKey ? 500 : 130;
		const change = (deltaY / sensitivity) * range;
		let newVal = startVal + change;
		newVal = Math.round(newVal / step) * step;
		newVal = Math.max(min, Math.min(max, newVal));
		if (newVal !== value) {
			onchange(newVal);
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (isDragging) {
			isDragging = false;
			try {
				e.currentTarget?.releasePointerCapture(e.pointerId);
			} catch {}
		}
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const dir = e.deltaY < 0 ? 1 : -1;
		const delta = (e.shiftKey ? step : Math.max(step, range * 0.04)) * dir;
		let newVal = value + delta;
		newVal = Math.round(newVal / step) * step;
		newVal = Math.max(min, Math.min(max, newVal));
		if (newVal !== value) {
			onchange(newVal);
		}
	}

	function handleDblClick() {
		if (onColorPick && colorInputEl) {
			colorInputEl.click();
		} else {
			onchange(defaultValue);
		}
	}
</script>

<div
	role="presentation"
	class="relative flex flex-col items-center select-none"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<!-- Hidden native color input if onColorPick is enabled -->
	{#if onColorPick}
		<input
			bind:this={colorInputEl}
			type="color"
			value={colorSwatch || '#4cb156'}
			oninput={(e) => onColorPick?.(e.currentTarget.value)}
			class="sr-only"
		/>
	{/if}

	<!-- Floating Tooltip badge on hover or drag -->
	{#if isHovered || isDragging}
		<div
			class="pointer-events-none absolute -top-9 z-50 flex items-center gap-1.5 whitespace-nowrap rounded-md bg-[#111315]/95 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl ring-1 ring-white/15 animate-in fade-in duration-100"
			style="border-bottom: 2px solid oklch(0.68 0.16 145.46);"
		>
			<span class="text-zinc-400">{label}:</span>
			<span class="font-mono font-semibold text-[oklch(0.82_0.14_145.46)]">{formattedText}</span>
			{#if colorSwatch}
				<span
					class="size-2.5 rounded-full inline-block shadow-sm"
					style="background: {colorSwatch};"
				></span>
			{/if}
		</div>
	{/if}

	<!-- Recess Slot matching screenshot -->
	<div
		role="slider"
		tabindex="0"
		aria-label={label}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}
		onwheel={handleWheel}
		ondblclick={handleDblClick}
		class="relative grid place-items-center rounded-lg bg-[#141517]/90 p-1 transition-colors duration-150 hover:bg-[#1a1b1e] cursor-ns-resize touch-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[oklch(0.68_0.16_145.46)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]"
		style="width: {size}px; height: {size}px;"
	>
		<!-- SVG Arc Track & Value Fill -->
		<svg
			viewBox="0 0 44 44"
			class="absolute inset-0 size-full pointer-events-none overflow-visible"
		>
			<defs>
				<!-- Variation gradient of theme colors oklch(0.34163 0.10527 145.46) and oklch(0.31346 0.11005 127.73) -->
				<linearGradient id="theme-knob-grad" x1="0%" y1="100%" x2="100%" y2="0%">
					<stop offset="0%" stop-color="oklch(0.62 0.15 127.73)" />
					<stop offset="50%" stop-color="oklch(0.68 0.16 145.46)" />
					<stop offset="100%" stop-color="oklch(0.82 0.14 145.46)" />
				</linearGradient>
			</defs>

			<!-- Background Track (270 deg) -->
			<circle
				cx="22"
				cy="22"
				r="17"
				fill="none"
				stroke="oklch(0.34163 0.10527 145.46 / 0.22)"
				stroke-width="2.2"
				stroke-linecap="round"
				stroke-dasharray="{ARC_LENGTH} {GAP_LENGTH}"
				transform="rotate(135 22 22)"
			/>

			<!-- Active Value Arc (sweeps with value) -->
			<circle
				cx="22"
				cy="22"
				r="17"
				fill="none"
				stroke={colorSwatch ? colorSwatch : "url(#theme-knob-grad)"}
				stroke-width="2.6"
				stroke-linecap="round"
				stroke-dasharray="{ARC_LENGTH} {C}"
				stroke-dashoffset={dashOffset}
				transform="rotate(135 22 22)"
				style="filter: drop-shadow(0 0 3px {colorSwatch ? colorSwatch : 'oklch(0.68 0.16 145.46 / 0.65)'});"
			/>
		</svg>

		<!-- Metallic Brushed Dial -->
		<div
			class="relative size-[28px] rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.48),inset_0_-1px_2px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-transform duration-75 grid place-items-center"
			style="
				background: conic-gradient(
					from 0deg,
					#46484e 0deg,
					#858a94 45deg,
					#303236 90deg,
					#858a94 135deg,
					#303236 180deg,
					#858a94 225deg,
					#303236 270deg,
					#858a94 315deg,
					#46484e 360deg
				);
				transform: rotate({rotationDeg}deg);
			"
		>
			<!-- Specular highlight overlay -->
			<div
				class="absolute inset-0 rounded-full"
				style="background: radial-gradient(circle at 45% 35%, rgba(255,255,255,0.22) 0%, transparent 60%);"
			></div>

			<!-- If color swatch is active, show jewel in center -->
			{#if colorSwatch}
				<div
					class="size-2.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.8)] border border-white/40"
					style="background: {colorSwatch}; box-shadow: 0 0 6px {colorSwatch};"
				></div>
			{/if}

			<!-- Indicator Notch/Dot in theme color -->
			<div
				class="absolute left-1/2 top-1 -translate-x-1/2 size-1.5 rounded-full"
				style="
					background: {colorSwatch ? colorSwatch : 'oklch(0.82 0.14 145.46)'};
					box-shadow: 0 0 4px {colorSwatch ? colorSwatch : 'oklch(0.82 0.14 145.46)'};
				"
			></div>
		</div>
	</div>

	<!-- Tiny label below knob -->
	<span class="mt-1 max-w-[46px] truncate text-center font-mono text-[9px] text-zinc-400 group-hover:text-zinc-200">
		{label}
	</span>
</div>
