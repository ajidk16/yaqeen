<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ArrowRight, Sparkles, Briefcase, BookOpen, Heart, CheckCircle2, Star, Shield, Smartphone, Check } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { animate } from '$lib/actions/transition';

	let visible = $state(false);

	$effect(() => {
		visible = true;
	});

	const personas = [
		{
			title: "Muslim Urban",
			description: "Profesional yang menyeimbangkan karir cemerlang dengan kewajiban spiritual di tengah kesibukan.",
			icon: Briefcase,
			features: ["Notifikasi sholat sesuai jadwal meeting", "Analitik produktivitas ibadah", "Mode Fokus untuk kekhusyukan"]
		},
		{
			title: "Penuntut Ilmu",
			description: "Pelajar yang berdedikasi dalam menghafal Al-Quran dan menjaga rutinitas belajar.",
			icon: BookOpen,
			features: ["Pelacak Hafalan Quran", "Sistem streak belajar", "Jurnal ilmu harian"]
		},
		{
			title: "Pejuang Hijrah",
			description: "Individu yang mencari alat bantu untuk menjaga konsistensi dalam perjalanan memperbaiki diri.",
			icon: Heart,
			features: ["Afirmasi harian Islami", "Tantangan kebaikan komunitas", "Milestone Istiqomah"]
		}
	];

	const pricingPlans = [
		{
			name: "Gratis",
			price: "Rp 0",
			period: "/selamanya",
			description: "Fitur dasar untuk memulai kebiasaan baik.",
			features: ["Hingga 5 kebiasaan", "Analitik dasar", "Riwayat 7 hari", "Akses komunitas"],
			cta: "Mulai Gratis",
			variant: "ghost"
		},
		{
			name: "Pro",
			price: "Rp 19K",
			period: "/bulan",
			description: "Buka potensi penuh diri Anda.",
			features: ["Kebiasaan tak terbatas", "Insight AI canggih", "Riwayat tak terbatas", "Sinkronisasi Cloud", "Dukungan prioritas"],
			cta: "Coba Gratis",
			variant: "primary",
			popular: true
		},
		{
			name: "Lifetime",
			price: "Rp 299K",
			period: "/sekali bayar",
			description: "Bayar sekali, miliki selamanya.",
			features: ["Semua fitur Pro", "Update seumur hidup", "Lencana eksklusif", "Akses awal fitur baru"],
			cta: "Ambil Paket Lifetime",
			variant: "secondary"
		}
	];
</script>

<div class="min-h-screen bg-base-100 overflow-x-hidden">
	<!-- Hero Section -->
	<section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
		<!-- Background Decoration -->
		<div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
			<div class="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-pulse"></div>
			<div class="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
		</div>

		<div class="container mx-auto px-4 text-center">
			{#if visible}
				<div in:fly={{ y: 20, duration: 800, delay: 0, easing: quintOut }} class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200/50 backdrop-blur-sm border border-base-content/5 mb-8">
					<Sparkles class="size-4 text-primary" />
					<span class="text-sm font-medium text-base-content/70">YaaQeen: Sahabat Hijrah Modern</span>
				</div>

				<h1 in:fly={{ y: 20, duration: 800, delay: 100, easing: quintOut }} class="text-5xl md:text-7xl font-bold tracking-tight mb-6">
					Seimbangkan <span class="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">Dunia & Akhirat</span>
				</h1>

				<p in:fly={{ y: 20, duration: 800, delay: 200, easing: quintOut }} class="text-xl text-base-content/70 max-w-2xl mx-auto mb-10 leading-relaxed">
					YaaQeen membantu Anda membangun kebiasaan istiqomah, memantau ibadah, dan mencapai tujuan duniawi tanpa mengorbankan nilai-nilai spiritual.
				</p>

				<div in:fly={{ y: 20, duration: 800, delay: 300, easing: quintOut }} class="flex flex-col sm:flex-row items-center justify-center gap-4">
					<Button onclick={() => goto('/register')} variant="primary" size="lg" class="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105">
						Mulai Perjalanan Hijrah
						<ArrowRight class="ml-2 size-5" />
					</Button>
					<Button onclick={() => goto('/register')} variant="ghost" size="lg" class="rounded-full px-8">
						Pelajari Lebih Lanjut
					</Button>
				</div>
			{/if}
		</div>
	</section>

	<!-- Personas Section -->
	<section id="features" class="py-24 bg-base-200/50 relative">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16" use:animate={{ type: 'fadeInUp' }}>
				<h2 class="text-3xl md:text-4xl font-bold mb-4">Dirancang untuk Setiap Perjalanan</h2>
				<p class="text-base-content/60 max-w-2xl mx-auto">Baik Anda profesional sibuk, pelajar, atau baru memulai hijrah, YaaQeen beradaptasi dengan kebutuhan Anda.</p>
			</div>

			<div class="grid md:grid-cols-3 gap-8">
				{#each personas as persona, i}
					<div 
						class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-content/5 hover:-translate-y-1 group"
						use:animate={{ type: 'fadeInUp', delay: i * 100 }}
					>
						<div class="card-body items-center text-center p-8">
							<div class="size-16 rounded-2xl bg-linear-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
								<persona.icon class="size-8 text-primary" />
							</div>
							<h3 class="card-title text-xl mb-3">{persona.title}</h3>
							<p class="text-base-content/70 mb-6 text-sm leading-relaxed">{persona.description}</p>
							<ul class="text-left w-full space-y-3">
								{#each persona.features as feature}
									<li class="flex items-center gap-3 text-sm text-base-content/80">
										<CheckCircle2 class="size-4 text-secondary shrink-0" />
										<span>{feature}</span>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Features Grid -->
	<section class="py-24 relative overflow-hidden">
		<div class="container mx-auto px-4">
			<div class="grid lg:grid-cols-2 gap-16 items-center">
				<div class="space-y-8" use:animate={{ type: 'slideInLeft' }}>
					<h2 class="text-3xl md:text-4xl font-bold">Mengapa Memilih YaaQeen?</h2>
					<div class="space-y-6">
						<div class="flex gap-4">
							<div class="mt-1 size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
								<Star class="size-5 text-primary" />
							</div>
							<div>
								<h3 class="font-bold text-lg mb-1">Istiqomah yang Menyenangkan</h3>
								<p class="text-base-content/70">Bangun streak dan raih lencana yang memotivasi konsistensi tanpa mengurangi esensi ibadah.</p>
							</div>
						</div>
						<div class="flex gap-4">
							<div class="mt-1 size-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
								<Shield class="size-5 text-secondary" />
							</div>
							<div>
								<h3 class="font-bold text-lg mb-1">Privasi Adalah Amanah</h3>
								<p class="text-base-content/70">Perjalanan spiritual Anda adalah privasi. Kami menjamin keamanan data Anda dengan standar tertinggi.</p>
							</div>
						</div>
						<div class="flex gap-4">
							<div class="mt-1 size-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
								<Smartphone class="size-5 text-accent" />
							</div>
							<div>
								<h3 class="font-bold text-lg mb-1">Sinkronisasi Tanpa Batas</h3>
								<p class="text-base-content/70">Akses pelacak Anda di mana saja. Sinkronisasi mulus antara ponsel dan desktop.</p>
							</div>
						</div>
					</div>
				</div>
				<div class="relative" use:animate={{ type: 'slideInRight', delay: 200 }}>
					<div class="absolute inset-0 bg-linear-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-3xl -z-10"></div>
					<div class="bg-base-100 rounded-3xl shadow-2xl border border-base-content/5 p-8 rotate-3 hover:rotate-0 transition-transform duration-500">
						<!-- Mockup Content -->
						<div class="space-y-4">
							<div class="flex items-center justify-between mb-8">
								<div class="h-8 w-32 bg-base-200 rounded-lg animate-pulse"></div>
								<div class="size-10 rounded-full bg-base-200 animate-pulse"></div>
							</div>
							{#each [1, 2, 3, 4] as i}
								<div class="flex items-center gap-4 p-4 rounded-xl bg-base-200/50">
									<div class="size-6 rounded-full border-2 border-primary/30"></div>
									<div class="h-4 w-48 bg-base-200 rounded animate-pulse"></div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Pricing Section -->
	<section id="pricing" class="py-24 bg-base-200/50">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16" use:animate={{ type: 'fadeInUp' }}>
				<h2 class="text-3xl md:text-4xl font-bold mb-4">Investasi Terbaik untuk Diri Sendiri</h2>
				<p class="text-base-content/60 max-w-2xl mx-auto">Pilih paket yang sesuai untuk mendukung pertumbuhan pribadi dan spiritual Anda.</p>
			</div>

			<div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
				{#each pricingPlans as plan, i}
					<div 
						class="card bg-base-100 shadow-xl border {plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-base-content/5'} relative hover:-translate-y-1 transition-transform duration-300"
						use:animate={{ type: 'scaleIn', delay: i * 100 }}
					>
						{#if plan.popular}
							<div class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-content text-xs font-bold rounded-full uppercase tracking-wider">
								Paling Populer
							</div>
						{/if}
						<div class="card-body p-8">
							<h3 class="text-lg font-medium mb-2">{plan.name}</h3>
							<div class="flex items-baseline gap-1 mb-4">
								<span class="text-4xl font-bold">{plan.price}</span>
								<span class="text-base-content/60 text-sm">{plan.period}</span>
							</div>
							<p class="text-sm text-base-content/70 mb-6">{plan.description}</p>
							
							<ul class="space-y-3 mb-8 flex-1">
								{#each plan.features as feature}
									<li class="flex items-start gap-3 text-sm">
										<Check class="size-4 text-primary shrink-0 mt-0.5" />
										<span>{feature}</span>
									</li>
								{/each}
							</ul>

							<Button onclick={() => goto('/register')} variant={plan.variant as any} block class="rounded-full">
								{plan.cta}
							</Button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- About Section -->
	<section id="about" class="py-24 relative overflow-hidden">
		<div class="container mx-auto px-4 text-center" use:animate={{ type: 'fadeInUp' }}>
			<div class="max-w-3xl mx-auto space-y-8">
				<div class="inline-flex items-center justify-center size-16 rounded-full bg-base-200 mb-4">
					<Heart class="size-8 text-primary" />
				</div>
				<h2 class="text-3xl md:text-4xl font-bold">Dibuat dengan Cinta & Iman</h2>
				<p class="text-lg text-base-content/70 leading-relaxed">
					YaaQeen lahir dari kesadaran sederhana: di dunia yang serba cepat, mudah untuk kehilangan arah. Kami menciptakan alat yang tidak hanya membantu Anda menyelesaikan tugas, tetapi membantu Anda menjadi pribadi yang lebih baik—di dunia dan akhirat.
				</p>
				<p class="text-lg text-base-content/70 leading-relaxed">
					Misi kami adalah memberdayakan Muslim di seluruh dunia untuk mencapai <span class="font-medium text-primary">Istiqomah</span> melalui teknologi yang menghargai nilai-nilai kita.
				</p>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-24 bg-base-100">
		<div class="container mx-auto px-4">
			<div 
				class="bg-linear-to-r from-primary to-secondary rounded-3xl p-12 text-center text-primary-content relative overflow-hidden"
				use:animate={{ type: 'scaleIn' }}
			>
				<div class="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"></div>
				<div class="relative z-10 max-w-2xl mx-auto space-y-8">
					<h2 class="text-3xl md:text-5xl font-bold">Siap Mengubah Hidup Anda?</h2>
					<p class="text-lg opacity-90">Bergabunglah dengan ribuan Muslim yang sedang membangun versi terbaik diri mereka, satu hari demi satu hari.</p>
					<Button onclick={() => goto('/register')} variant="secondary" size="lg" class="rounded-full px-10 shadow-xl hover:scale-105 transition-transform bg-white text-primary border-none hover:bg-base-100">
						Mulai Sekarang, Gratis!
					</Button>
				</div>
			</div>
		</div>
	</section>
</div>
