<script lang="ts">
	import { bgState } from '$lib/bitbacks/store.svelte';
	import Shadermenu from '$lib/iconsfill/shadermenu.svelte';

	let activeEntry = $derived(bgState.activeEntry);
	let isOpen = $derived(bgState.isControllerOpen);
</script>

<button
	type="button"
	class="row shader-menu gap-sm select-none transition-all duration-150 active:scale-98"
	class:is-active={isOpen}
	data-shader-menu-trigger
	onclick={(e) => {
		e.stopPropagation();
		bgState.toggleController();
	}}
	aria-expanded={isOpen}
	aria-label="Toggle Background Shader Controller"
	title="{isOpen ? 'Close' : 'Configure'} shader: {activeEntry.name}"
>
	<p class="text-sm tt-c font-medium">{activeEntry.name}</p>
	<div class="transition-transform duration-200" class:rotate-180={isOpen}>
		<Shadermenu />
	</div>
</button>
