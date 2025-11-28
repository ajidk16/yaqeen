<script>
	let { children } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-surface-200 p-4 font-body text-slate-900 relative overflow-hidden">
	<!-- Background Elements -->
	<div class="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
		<div class="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
		<div class="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
	</div>

	<div class="w-full max-w-md space-y-8 rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-2xl shadow-slate-200/50 border border-white/50 animate-scale-in">
		<div class="text-center">
			<a href="/" class="text-3xl font-bold tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
				<span class="text-primary">Habbi</span>Trax
			</a>
		</div>
		{@render children()}
	</div>
</div>
