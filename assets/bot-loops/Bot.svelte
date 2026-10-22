<script module lang="ts">
	export const BOT_MOODS = [
		'jack', 'jelly', 'bulge', 'dizzy', 'melt', 'sneeze',
		'roll', 'heart', 'fume', 'blep', 'glitch', 'pong'
	] as const

	export type BotMood = (typeof BOT_MOODS)[number]
</script>

<script lang="ts">
	// Needs `sass` in devDependencies. Adjust the path to wherever src/bot.sass lives in your project.
	import './src/bot.sass'

	type Props = {
		/** One of BOT_MOODS, or null for the still bot. */
		mood?: BotMood | null
		size?: number | string
		label?: string
	}

	let { mood = null, size = 240, label = 'Bot avatar' }: Props = $props()

	// Unique per instance so several bots on one page never share a gradient id.
	const uid = $props.id()

	const BODY = 'M555 28 C800 28 1045 300 1045 620 C1045 880 850 1075 555 1075 C260 1075 62 880 62 620 C62 300 310 28 555 28 Z'
	const HEART = 'M0 62 C-100 -5 -62 -92 0 -40 C62 -92 100 -5 0 62 Z'
	const STAR = 'M0 -34 L8 -11 L33 -10 L13 5 L20 30 L0 16 L-20 30 L-13 5 L-33 -10 L-8 -11 Z'

	const stars = ['b-s1', 'b-s2', 'b-s3', 'b-s4'] as const
	const drops = [[-360, 90], [-300, -60], [-190, -170], [360, 90], [300, -60], [190, -170]] as const
	const floaters = [
		{ cls: 'b-hf1', x: 200, y: 140, dx: -60 },
		{ cls: 'b-hf2', x: 900, y: 110, dx: 50 },
		{ cls: 'b-hf3', x: 553, y: 0, dx: 0 }
	] as const
	const puffs = [
		{ cls: 'b-p1', x: 120, px: -30 },
		{ cls: 'b-p2', x: 120, px: -30 },
		{ cls: 'b-p3', x: 990, px: 30 },
		{ cls: 'b-p4', x: 990, px: 30 }
	] as const
</script>

<svg
	class="bot-avatar"
	data-mood={mood}
	viewBox="-200 -150 1500 1500"
	width={size}
	height={size}
	role="img"
	aria-label={label}
>
	<defs>
		<radialGradient id="{uid}-g" cx="0.45" cy="0.14" r="1">
			<stop offset="0" stop-color="#52cd63" />
			<stop offset="0.5" stop-color="#2eae43" />
			<stop offset="1" stop-color="#12862a" />
		</radialGradient>
	</defs>

	<ellipse class="b-shadow" cx="553" cy="1112" rx="330" ry="34" />

	<g class="b-rig">
		{#if mood === 'glitch'}
			<path class="b-ghost b-ghost-a" d={BODY} />
			<path class="b-ghost b-ghost-b" d={BODY} />
		{/if}

		<path class="b-body" d={BODY} fill="url(#{uid}-g)" />

		{#if mood === 'fume'}
			<path class="b-rage" d={BODY} />
		{/if}

		<g class="b-face">
			{#if mood === 'blep'}
				<path class="b-tongue" d="M520 722 L520 810 Q520 862 560 862 Q600 862 600 810 L600 722 Z" />
			{/if}

			<g class="b-eyes">
				<ellipse class="b-eye b-eye-l" cx="362" cy="520" rx="60" ry="101" />
				<ellipse class="b-eye b-eye-r" cx="755" cy="520" rx="60" ry="101" />
				{#if mood === 'heart'}
					<g transform="translate(362 520)"><path class="b-heart" d={HEART} /></g>
					<g transform="translate(755 520)"><path class="b-heart" d={HEART} /></g>
				{/if}
			</g>

			<path class="b-m b-m-smile" d="M448 690 Q560 752 672 690" />
			<ellipse class="b-m b-m-open" cx="558" cy="712" rx="46" ry="60" />
			<path class="b-m b-m-flat" d="M474 712 L646 712" />
		</g>
	</g>

	{#if mood === 'dizzy'}
		<g transform="translate(553 20)">
			{#each stars as cls}
				<g class="b-star {cls}"><path transform="scale(1.7)" d={STAR} /></g>
			{/each}
		</g>
	{:else if mood === 'sneeze'}
		{#each drops as [dx, dy]}
			<circle class="b-drop" style="--dx:{dx}px;--dy:{dy}px" cx="558" cy="745" r="15" />
		{/each}
		<text class="b-achoo" x="1060" y="100" font-size="110" text-anchor="middle">ACHOO!</text>
	{:else if mood === 'heart'}
		{#each floaters as h}
			<g transform="translate({h.x} {h.y}) scale(.38)">
				<path class="b-hf {h.cls}" style="--dx:{h.dx}px" d={HEART} />
			</g>
		{/each}
	{:else if mood === 'fume'}
		{#each puffs as p}
			<circle class="b-puff {p.cls}" style="--px:{p.px}px" cx={p.x} cy="240" r="34" />
		{/each}
	{/if}
</svg>
