<script>
	import '../layout.css';
	let { children, data } = $props();
</script>

<div class="flex min-h-screen flex-col bg-surface-100 font-body text-content-primary selection:bg-primary/20 selection:text-primary">
	<!-- Navbar -->
	<header class="sticky top-0 z-40 w-full border-b border-white/10 bg-white/70 backdrop-blur-xl transition-all duration-300">
		<div class="container mx-auto flex h-20 items-center justify-between px-6">
			<a href="/" class="flex items-center gap-1 text-2xl font-bold tracking-tight text-slate-900 transition-opacity hover:opacity-80">
				<span class="text-primary">Yaa</span>Qeen
			</a>
			<nav class="hidden gap-8 md:flex">
				<a href="#features" class="text-sm font-semibold text-slate-600 transition-colors hover:text-primary">Fitur Unggulan</a>
				<a href="#pricing" class="text-sm font-semibold text-slate-600 transition-colors hover:text-primary">Investasi</a>
				<a href="#about" class="text-sm font-semibold text-slate-600 transition-colors hover:text-primary">Tentang Kami</a>
			</nav>
			<div class="flex items-center gap-6">
				{#if data.user}
					<a href="/dashboard" class="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary-600 hover:shadow-primary/40 active:scale-95">
						Dashboard Saya
					</a>
				{:else}
					<a href="/login" class="text-sm font-bold text-slate-600 transition-colors hover:text-primary">Masuk</a>
					<a href="/register" class="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary-600 hover:shadow-primary/40 active:scale-95">
						Mulai Hijrah
					</a>
				{/if}
			</div>
		</div>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-slate-100 bg-white py-16">
		<div class="container mx-auto px-6">
			<div class="flex flex-col items-center justify-between gap-8 md:flex-row">
				<div class="text-center md:text-left">
					<span class="text-xl font-bold text-slate-900">YaaQeen</span>
					<p class="mt-2 text-sm text-slate-500">Membangun kebiasaan istiqomah untuk Dunia & Akhirat.</p>
				</div>
				<div class="flex gap-8 text-sm font-medium text-slate-500">
					<a href="#privacy" class="hover:text-primary transition-colors">Privasi</a>
					<a href="#terms" class="hover:text-primary transition-colors">Syarat & Ketentuan</a>
					<a href="#contact" class="hover:text-primary transition-colors">Hubungi Kami</a>
				</div>
				<p class="text-sm text-slate-400">&copy; {new Date().getFullYear()} YaaQeen.</p>
			</div>
		</div>
	</footer>
</div>
