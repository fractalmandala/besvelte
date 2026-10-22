<script lang="ts">
	interface Props {
		text?: string;
		roundness?: number; // px
		paddingX?: number; // rem
		paddingY?: number; // rem
		accentColor?: string;
		contrast?: 'light' | 'dark' | 'light-contrast' | 'dark-contrast';
		size?: string;
	}

	let {
		text = 'Glassify →',
		roundness = 60,
		paddingX = 3,
		paddingY = 0.5,
		accentColor = '#aaf',
		contrast = 'light',
		size = "text-md"
	}: Props = $props();

	let isHovered = $state(false);
	const isDark = $derived(contrast === 'dark' || contrast === 'dark-contrast');
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="liquid-wrap"
	class:dark={isDark}
	style:--roundness="{roundness}px"
	style:--pad-x="{paddingX}rem"
	style:--pad-y="{paddingY}rem"
	style:--accent={accentColor}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<!-- Dynamic SVG Displacement Layer -->
	<div class="glass-filter"></div>

	<!-- Ambient Specular Halo (active on hover) -->
	{#if isHovered}
		<div class="halo-wrap">
			<div class="halo-rotor"></div>
		</div>
	{/if}

	<!-- Clickable Face -->
	<button class="glass-face" type="button">
		<span class="label {size}">{text}</span>
	</button>

	<!-- Refracted Glass Border / Rim -->
	<div class="glass-rim"></div>

	<!-- Ambient Cast Shadow -->
	<div class="glass-shadow"></div>
</div>

<!-- Reusable SVG Turbulence Filter -->
<svg class="filter-svg" aria-hidden="true">
	<defs>
		<filter id="liquid-displacement" x="0%" y="0%" width="100%" height="100%">
			<feTurbulence
				type="fractalNoise"
				baseFrequency="0.008 0.008"
				numOctaves="2"
				seed="92"
				result="noise"
			/>
			<feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
			<feDisplacementMap
				in="SourceGraphic"
				in2="blurred"
				scale="220"
				xChannelSelector="R"
				yChannelSelector="G"
			/>
		</filter>
	</defs>
</svg>

<style>

	@property --angle-1 {
		syntax: '<angle>';
		inherits: false;
		initial-value: -75deg;
	}

	@property --angle-2 {
		syntax: '<angle>';
		inherits: false;
		initial-value: -45deg;
	}

	.filter-svg {
		position: absolute;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	.liquid-wrap {
		--anim-time: 400ms;
		--anim-ease: cubic-bezier(0.25, 1, 0.5, 1);
		--shadow-bleed: 2em;
		--border-width: clamp(1px, 0.0625em, 4px);

		position: relative;
		width: fit-content;
		border-radius: var(--roundness);
		transition: transform var(--anim-time) var(--anim-ease);
		isolation: isolate;
	}

	.liquid-wrap:active {
		transform: rotate3d(1, 0, 0, 20deg) scale(0.97);
	}

	/* 1. Underlying SVG Refraction Plate */
	.glass-filter {
		position: absolute;
		inset: 0;
		z-index: 1;
		border-radius: var(--roundness);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		filter: url(#liquid-displacement) saturate(150%);
		pointer-events: none;
	}

	/* 2. Glass Face (Specular Gradients & Backdrop Blur) */
	.glass-face {
		all: unset;
		cursor: pointer;
		position: relative;
		z-index: 3;
		display: block;
		border-radius: var(--roundness);
		backdrop-filter: blur(clamp(1px, 0.125em, 4px));
		-webkit-backdrop-filter: blur(clamp(1px, 0.125em, 4px));
		background: linear-gradient(
			-75deg,
			rgba(255, 255, 255, 0.05),
			rgba(255, 255, 255, 0.2),
			rgba(255, 255, 255, 0.05)
		);
		box-shadow:
			inset 0 0.125em 0.125em rgba(0, 0, 0, 0.05),
			inset 0 -0.125em 0.125em rgba(255, 255, 255, 0.5),
			0 0.25em 0.125em -0.125em rgba(0, 0, 0, 0.2),
			0 0 0.1em 0.25em inset rgba(255, 255, 255, 0.2);
		transition: all var(--anim-time) var(--anim-ease);
	}

	.liquid-wrap.dark .glass-face {
		background: linear-gradient(
			-75deg,
			rgba(0, 0, 0, 0.05),
			rgba(0, 0, 0, 0.2),
			rgba(0, 0, 0, 0.05)
		);
		box-shadow:
			inset 0 0.125em 0.125em rgba(254, 254, 254, 0.05),
			inset 0 -0.125em 0.125em rgba(0, 0, 0, 0.5),
			0 0.25em 0.125em -0.125em rgba(254, 254, 254, 0.2),
			0 0 0.1em 0.25em inset rgba(0, 0, 0, 0.2);
	}

	.glass-face:hover {
		transform: scale(0.98);
		backdrop-filter: blur(0.01em);
	}

	/* 3. Button Typography with Liquid Caustic Sheen */
	.label {
		position: relative;
		display: block;
		user-select: none;
		-webkit-user-select: none;
		font-family: inherit;
		white-space: nowrap;
		color: #fff;
		text-shadow: 0 0.12em 0.05em rgba(0, 0, 0, 0.1);
		transition: all var(--anim-time) var(--anim-ease);
	}

	.liquid-wrap.dark .label {
		color: rgba(0, 0, 0, 0.85);
		text-shadow: 0 0.12em 0.05em rgba(255, 255, 255, 0.2);
	}

	/* Light refraction ray passing over text */
	.label::after {
		content: '';
		position: absolute;
		inset: calc(var(--border-width) / 2);
		border-radius: var(--roundness);
		background: linear-gradient(
			var(--angle-2),
			rgba(255, 255, 255, 0) 0%,
			rgba(255, 255, 255, 0.5) 40% 50%,
			rgba(255, 255, 255, 0) 55%
		);
		background-size: 200% 200%;
		background-position: 0% 50%;
		mix-blend-mode: screen;
		pointer-events: none;
		transition:
			background-position calc(var(--anim-time) * 1.25) var(--anim-ease),
			--angle-2 calc(var(--anim-time) * 1.25) var(--anim-ease);
	}

	.liquid-wrap:hover .label::after {
		background-position: 25% 50%;
	}

	.liquid-wrap:active .label::after {
		background-position: 50% 15%;
		--angle-2: -15deg;
	}

	/* 4. Conic Rim Border (Chromic Aberration Line) */
	.glass-rim {
		position: absolute;
		inset: calc(var(--border-width) * -0.5);
		border-radius: var(--roundness);
		padding: var(--border-width);
		box-sizing: border-box;
		z-index: 4;
		pointer-events: none;
		mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
		mask-composite: exclude;
		-webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		background:
			conic-gradient(
				from var(--angle-1) at 50% 50%,
				rgba(0, 0, 0, 0.5),
				rgba(0, 0, 0, 0) 5% 40%,
				rgba(0, 0, 0, 0.5) 50%,
				rgba(0, 0, 0, 0) 60% 95%,
				rgba(0, 0, 0, 0.5)
			),
			linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5));
		transition: --angle-1 500ms ease;
	}

	.liquid-wrap.dark .glass-rim {
		background:
			conic-gradient(
				from var(--angle-1) at 50% 50%,
				rgba(255, 255, 255, 0.6),
				rgba(255, 255, 255, 0) 5% 40%,
				rgba(255, 255, 255, 0.6) 50%,
				rgba(255, 255, 255, 0) 60% 95%,
				rgba(255, 255, 255, 0.6)
			),
			linear-gradient(180deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5));
	}

	.liquid-wrap:hover .glass-rim {
		--angle-1: -125deg;
	}

	.liquid-wrap:active .glass-rim {
		--angle-1: -75deg;
	}

	/* 5. Depth Shadow */
	.glass-shadow {
		position: absolute;
		width: calc(100% + var(--shadow-bleed));
		height: calc(100% + var(--shadow-bleed));
		top: calc(0% - var(--shadow-bleed) / 2);
		left: calc(0% - var(--shadow-bleed) / 2);
		filter: blur(clamp(2px, 0.125em, 12px));
		pointer-events: none;
		z-index: 0;
	}

	.glass-shadow::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--roundness);
		width: calc(100% - var(--shadow-bleed) - 0.25em);
		height: calc(100% - var(--shadow-bleed) - 0.25em);
		top: calc(var(--shadow-bleed) - 0.5em);
		left: calc(var(--shadow-bleed) - 0.875em);
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.05));
	}

	.liquid-wrap.dark .glass-shadow::after {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
	}

	/* 6. Rotating Ambient Iridescent Glow */
	.halo-wrap {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		overflow: hidden;
		opacity: 0.6;
		z-index: 2;
		pointer-events: none;
	}

	.halo-rotor {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		mix-blend-mode: lighten;
		opacity: 0.7;
		background: conic-gradient(
			from 0deg,
			#e7ffff 0%,
			var(--accent) 25%,
			#fff 50%,
			var(--accent) 75%,
			#e7ffff 100%
		);
		animation: spin-gradient 4s ease-in-out infinite;
	}

	@keyframes spin-gradient {
		0% {
			transform: rotate(0deg);
		}
		50% {
			transform: rotate(180deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>