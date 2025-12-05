<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Toast } from '$lib/components/ui';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col bg-base-200 font-body text-base-content">
	<main class="flex-1">
		{@render children()}
	</main>
</div>

<Toast />
