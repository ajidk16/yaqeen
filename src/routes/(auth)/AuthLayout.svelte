<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	let { children } = $props();
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
</script>

<div class="min-h-screen bg-base-200 flex items-center justify-center p-4 relative overflow-hidden">
	<!-- Background Accents -->
	<div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
		<div
			class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] animate-pulse"
		></div>
		<div
			class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px] animate-pulse"
			style="animation-delay: 2s;"
		></div>
	</div>

	<!-- Main Content -->
	{#if mounted}
		<div in:fade={{ duration: 400, delay: 100 }} class="relative z-10 w-full max-w-md">
			{@render children()}
		</div>
	{/if}
</div>
