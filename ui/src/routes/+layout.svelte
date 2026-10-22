<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime.js';
	import { modeScript } from '$lib/mode/mode.svelte';
	import '@fractaldesign/fractalstyler/css'
	import "../app.css"
	import '$lib/styles/index.sass'
  let { children } = $props()
</script>

<svelte:head>
	{@html `<script>${modeScript()}<\x2fscript>`}
</svelte:head>

{@render children?.()}

<div style="display:none">
	{#each locales as locale (locale)}
		<a
			href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}
		>{locale}</a>
	{/each}
</div>
