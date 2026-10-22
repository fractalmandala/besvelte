<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { fade } from 'svelte/transition';
	import { bgState } from '$lib/bitbacks/store.svelte';

	let containerEl = $state<HTMLDivElement | null>(null);
	let currentComponent = $state<Component<any> | null>(null);
	let loadedId = $state<string>('');

	$effect(() => {
		const entry = bgState.activeEntry;
		const id = entry.id;
		let cancelled = false;

		entry
			.loader()
			.then((mod) => {
				if (!cancelled) {
					currentComponent = mod.default;
					loadedId = id;
				}
			})
			.catch((err) => {
				if (!cancelled) {
					console.error(`[BackgroundHost] Failed to load background '${id}':`, err);
				}
			});

		return () => {
			cancelled = true;
		};
	});

	const Active = $derived(currentComponent);
	const activeProps = $derived(bgState.currentProps);

	onMount(() => {
		let isDispatching = false;
		const onWindowMouseMove = (e: MouseEvent) => {
			if (isDispatching || !containerEl || !bgState.enabled) return;
			const canvas = containerEl.querySelector('canvas') || containerEl.firstElementChild;
			if (canvas && e.target !== canvas) {
				isDispatching = true;
				try {
					canvas.dispatchEvent(
						new MouseEvent('mousemove', {
							clientX: e.clientX,
							clientY: e.clientY,
							screenX: e.screenX,
							screenY: e.screenY,
							bubbles: true,
							cancelable: true
						})
					);
				} catch {}
				isDispatching = false;
			}
		};

		window.addEventListener('mousemove', onWindowMouseMove, { passive: true });
		return () => {
			window.removeEventListener('mousemove', onWindowMouseMove);
		};
	});
</script>

{#if bgState.enabled && bgState.opacity > 0}
	<div
		bind:this={containerEl}
		class="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none transition-opacity duration-300"
		style="opacity: {bgState.opacity};"
		aria-hidden="true"
	>
		{#if Active && loadedId === bgState.activeId}
			{#key loadedId}
				<div class="size-full" in:fade={{ duration: 160 }}>
					<Active {...activeProps} />
				</div>
			{/key}
		{/if}
	</div>
{/if}
