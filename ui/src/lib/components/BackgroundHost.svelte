<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { bgState } from '$lib/bitbacks/store.svelte';

	let containerEl = $state<HTMLDivElement | null>(null);
	let currentComponent = $state<Component<any> | null>(null);
	let currentId = $state<string>('');
	let isLoading = $state(false);

	$effect(() => {
		const entry = bgState.activeEntry;
		const id = entry.id;
		if (id !== currentId) {
			currentId = id;
			isLoading = true;
			entry
				.loader()
				.then((mod) => {
					if (currentId === id) {
						currentComponent = mod.default;
						isLoading = false;
					}
				})
				.catch((err) => {
					console.error(`[BackgroundHost] Failed to load background '${id}':`, err);
					isLoading = false;
				});
		}
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
		{#if Active}
			{#key currentId}
				<Active {...activeProps} />
			{/key}
		{/if}
	</div>
{/if}
