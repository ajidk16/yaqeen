<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	
	import { Toast } from '$lib/components/ui';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Toast />
{@render children()}
