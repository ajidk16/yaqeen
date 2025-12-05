<script>
	import Footer from '$lib/components/navigation/Footer.svelte';
	import Navbar from '$lib/components/navigation/Navbar.svelte';
	import { onNavigate } from '$app/navigation';
	import '../layout.css';

	let { children, data } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<div class="flex min-h-screen flex-col bg-surface-100 font-body text-content-primary selection:bg-primary/20 selection:text-primary">
	<Navbar />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />

</div>
