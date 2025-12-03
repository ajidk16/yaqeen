<script lang="ts">
	import { page } from '$app/stores';
	import { fly, fade } from 'svelte/transition';
	import { Home, ArrowLeft, AlertTriangle, FileQuestion, ServerCrash } from 'lucide-svelte';

	// Reactive derived values
	let status = $derived($page.status);
	let error = $derived($page.error);
	
	let icon = $derived(
		status === 404 ? FileQuestion : 
		status === 500 ? ServerCrash : 
		AlertTriangle
	);

	let title = $derived(
		status === 404 ? 'Halaman Tidak Ditemukan' : 
		status === 500 ? 'Kesalahan Server' : 
		'Terjadi Kesalahan'
	);
			   
	let description = $derived(
		status === 404 ? "Maaf, kami tidak dapat menemukan halaman yang Anda cari." :
		"Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti."
	);
</script>

<div class="min-h-screen flex items-center justify-center bg-base-200 p-4 font-body">
	<div class="text-center max-w-lg mx-auto" in:fade={{ duration: 300 }}>
		
		<!-- Icon -->
		<div class="mb-8 relative inline-block" in:fly={{ y: 20, duration: 800, delay: 100 }}>
			<div class="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
			<div class="relative bg-base-100 p-6 rounded-3xl shadow-xl text-primary">
				<!-- svelte-ignore svelte_component_deprecated -->
				<svelte:component this={icon} size={64} strokeWidth={1.5} />
			</div>
		</div>

		<!-- Status Code -->
		<h1 class="text-8xl font-black text-base-content/10 mb-2 font-mono" in:fly={{ y: 20, duration: 800, delay: 200 }}>
			{status}
		</h1>

		<!-- Message -->
		<h2 class="text-3xl font-bold mb-4 text-base-content" in:fly={{ y: 20, duration: 800, delay: 300 }}>
			{title}
		</h2>
		
		<p class="text-base-content/60 mb-8 text-lg" in:fly={{ y: 20, duration: 800, delay: 400 }}>
			{error?.message || description}
		</p>

		<!-- Actions -->
		<div class="flex flex-col sm:flex-row gap-4 justify-center" in:fly={{ y: 20, duration: 800, delay: 500 }}>
			<button 
				class="btn btn-outline gap-2 rounded-xl"
				onclick={() => history.back()}
			>
				<ArrowLeft size={20} />
				Kembali
			</button>
			
			<a href="/" class="btn btn-primary gap-2 shadow-lg shadow-primary/30 rounded-xl">
				<Home size={20} />
				Ke Beranda
			</a>
		</div>

	</div>
</div>
