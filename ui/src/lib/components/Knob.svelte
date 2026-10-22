<script lang="ts">
	type Props = {
		value: number;
		min?: number;
		max?: number;
		step?: number;
		defaultValue?: number;
		label: string;
		unit?: string;
		displayFormatter?: (val: number) => string;
		size?: number;
		onchange: (value: number) => void;
	};

	let {
		value,
		min = 0,
		max = 1,
		step = 0.01,
		defaultValue = min,
		label,
		unit = '',
		displayFormatter,
		size = 54,
		onchange
	}: Props = $props();

	let isDragging = $state(false);
	let isHovered = $state(false);
	let startY = $state(0);
	let startVal = $state(0);

	const range = $derived(Math.max(0.00001, max - min));
	const normalized = $derived(Math.max(0, Math.min(1, (value - min) / range)));

	// Arc geometry in 56x56 coordinate space
	const CX = 28;
	const CY = 28;
	const R = 22;
	const C = 2 * Math.PI * R; // ~138.23
	const ARC_LENGTH = 0.75 * C; // 270 deg = ~103.67
	const GAP_LENGTH = C - ARC_LENGTH;

	// Fill length sweeps from 0 to ARC_LENGTH
	const fillLength = $derived(Math.max(0.001, normalized * ARC_LENGTH));
	// Needle rotation from -135deg (bottom-left) to +135deg (bottom-right)
	const rotationDeg = $derived(-135 + normalized * 270);

	const formattedText = $derived.by(() => {
		if (displayFormatter) return displayFormatter(value);
		if (step >= 1) return Math.round(value).toString();
		if (step >= 0.1) return value.toFixed(1);
		if (step >= 0.01) return value.toFixed(2);
		return value.toFixed(3);
	});

	const formatBound = (val: number) => {
		if (Math.abs(val) >= 100) return Math.round(val).toString();
		if (Math.abs(val) >= 10) return val.toFixed(1).replace(/\.0$/, '');
		if (val === 0) return '0';
		return val.toFixed(1).replace(/\.0$/, '');
	};

	function handlePointerDown(e: PointerEvent) {
		isDragging = true;
		startY = e.clientY;
		startVal = value;
		const target = e.currentTarget as HTMLElement | null;
		try {
			target?.setPointerCapture(e.pointerId);
		} catch {}
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const deltaY = startY - e.clientY;
		const sensitivity = e.shiftKey ? 450 : 150;
		const change = (deltaY / sensitivity) * range;
		let newVal = startVal + change;
		newVal = Math.round(newVal / step) * step;
		newVal = Math.max(min, Math.min(max, newVal));
		if (newVal !== value) {
			onchange(Number(newVal.toFixed(4)));
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (isDragging) {
			isDragging = false;
			const target = e.currentTarget as HTMLElement | null;
			try {
				target?.releasePointerCapture(e.pointerId);
			} catch {}
		}
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const dir = e.deltaY < 0 ? 1 : -1;
		const delta = (e.shiftKey ? step : Math.max(step, range * 0.05)) * dir;
		let newVal = value + delta;
		newVal = Math.round(newVal / step) * step;
		newVal = Math.max(min, Math.min(max, newVal));
		if (newVal !== value) {
			onchange(Number(newVal.toFixed(4)));
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
			e.preventDefault();
			const newVal = Math.min(max, value + (e.shiftKey ? step * 5 : step));
			onchange(Number(newVal.toFixed(4)));
		} else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
			e.preventDefault();
			const newVal = Math.max(min, value - (e.shiftKey ? step * 5 : step));
			onchange(Number(newVal.toFixed(4)));
		} else if (e.key === 'Home') {
			e.preventDefault();
			onchange(min);
		} else if (e.key === 'End') {
			e.preventDefault();
			onchange(max);
		}
	}

	function handleDblClick() {
		onchange(defaultValue);
	}
</script>

<div
	role="presentation"
	class="group relative flex flex-col items-center select-none p-2 rounded-xl transition-colors duration-150 hover:bg-white/[0.02]"
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<!-- Top: Full Label -->
	<div class="mb-1.5 flex w-full items-center justify-between gap-1 text-[11px] px-0.5">
		<span class="truncate font-medium text-zinc-300" title={label}>
			{label}
		</span>
		<button
			type="button"
			onclick={handleDblClick}
			class="text-[9.5px] font-mono text-zinc-500 hover:text-emerald-400 transition cursor-pointer"
			title="Double click to reset to default ({defaultValue})"
		>
			<span class="font-mono font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
				{formattedText}{unit}
			</span>
		</button>
	</div>

	<!-- Center: Neumorphic Knob Dial & Arc -->
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
		onkeydown={handleKeyDown}
		ondblclick={handleDblClick}
		class="relative flex items-center justify-center rounded-full cursor-ns-resize touch-none focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50"
		style="width: {size}px; height: {size}px;"
	>
		<!-- SVG 270-degree arc track and value sweep -->
		<svg
			viewBox="0 0 56 56"
			class="absolute inset-0 size-full pointer-events-none overflow-visible"
		>
			<!-- Sunken groove shadow under the track -->
			<circle
				cx={CX}
				cy={CY}
				r={R}
				fill="none"
				stroke="#0e0f12"
				stroke-width="5"
				stroke-linecap="round"
				stroke-dasharray="{ARC_LENGTH} {GAP_LENGTH}"
				transform="rotate(135 {CX} {CY})"
			/>

			<!-- Background Track ring -->
			<circle
				cx={CX}
				cy={CY}
				r={R}
				fill="none"
				stroke="rgba(255, 255, 255, 0.08)"
				stroke-width="3"
				stroke-linecap="round"
				stroke-dasharray="{ARC_LENGTH} {GAP_LENGTH}"
				transform="rotate(135 {CX} {CY})"
			/>

			<!-- Active Value Arc (Understated refined emerald) -->
			{#if normalized > 0.005}
				<circle
					cx={CX}
					cy={CY}
					r={R}
					fill="none"
					stroke="#10b981"
					stroke-width="3.2"
					stroke-linecap="round"
					stroke-dasharray="{fillLength} {C}"
					stroke-dashoffset="0"
					transform="rotate(135 {CX} {CY})"
					style="filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.45));"
				/>
			{/if}
		</svg>

		<!-- Neumorphic Rotary Cap -->
		<div
			class="relative flex items-center justify-center rounded-full transition-transform duration-75"
			style="
				width: {size - 16}px;
				height: {size - 16}px;
				background: linear-gradient(145deg, #23252a, #16171a);
				box-shadow:
					3px 3px 6px rgba(0, 0, 0, 0.65),
					-1.5px -1.5px 4px rgba(255, 255, 255, 0.04),
					inset 0 1px 1px rgba(255, 255, 255, 0.1);
				border: 1px solid rgba(255, 255, 255, 0.05);
				transform: rotate({rotationDeg}deg);
			"
		>
			<!-- Subtle center bevel recess -->
			<div
				class="size-3 rounded-full opacity-40"
				style="
					background: radial-gradient(circle, #0e0f11 0%, #1c1d22 100%);
					box-shadow: inset 1px 1px 2px rgba(0,0,0,0.8);
				"
			></div>

			<!-- Tactile needle indicator line (understated emerald) -->
			<div
				class="absolute top-1 left-1/2 -translate-x-1/2 w-[2px] h-[5px] rounded-full"
				style="
					background: #10b981;
					box-shadow: 0 0 3px rgba(16, 185, 129, 0.6);
				"
			></div>
		</div>
	</div>

	<!-- Bottom: Min & Max range bounds -->
	<div class="mt-1 flex w-full items-center justify-between text-[9px] font-mono text-zinc-500 px-1">
		<span>{formatBound(min)}</span>
		<span>{formatBound(max)}</span>
	</div>
</div>
