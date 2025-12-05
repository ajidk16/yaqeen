<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import {
		ArrowRight,
		Sparkles,
		Zap,
		Shield,
		Heart,
		CheckCircle2,
		XCircle,
		Users,
		Trophy,
		Activity,
		Smartphone,
		Globe,
		Clock
	} from 'lucide-svelte';
	import { Button, Card } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { animate } from '$lib/actions/transition';

	// Stats Data
	const stats = [
		{ label: 'Pengguna Aktif', value: '10K+', icon: Users },
		{ label: 'Habit Tercatat', value: '1M+', icon: Activity },
		{ label: 'Rating App', value: '4.9', icon: Trophy }
	];

	// Features Data
	const features = [
		{
			title: 'Tracking Ibadah',
			desc: 'Pantau sholat 5 waktu, puasa, dan tilawah dengan mudah dan menyenangkan.',
			icon: Heart,
			color: 'text-primary'
		},
		{
			title: 'Analitik Cerdas',
			desc: 'Dapatkan wawasan mendalam tentang perkembangan spiritual Anda setiap minggu.',
			icon: Zap,
			color: 'text-secondary'
		},
		{
			title: 'Privasi Terjamin',
			desc: 'Data ibadah Anda tersimpan aman dan terenkripsi. Hanya Anda yang tahu.',
			icon: Shield,
			color: 'text-accent'
		}
	];

	// Pros & Cons Data
	const comparison = {
		pros: [
			'Terintegrasi dalam satu aplikasi',
			'Notifikasi adzan & reminder cerdas',
			'Analitik kemajuan visual',
			'Komunitas yang mendukung',
			'Sinkronisasi antar perangkat'
		],
		cons: [
			'Menggunakan banyak aplikasi terpisah',
			'Sering lupa mencatat manual',
			'Tidak ada gambaran progress',
			'Merasa berjuang sendirian',
			'Data hilang saat ganti HP'
		]
	};
</script>

<div class="min-h-screen bg-base-100 overflow-x-hidden font-body">
	<!-- 1. Hero Section -->
	<section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
		<!-- Background Elements -->
		<div
			class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none"
		>
			<div
				class="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-pulse"
			></div>
			<div
				class="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-1000"
			></div>
		</div>

		<div class="container mx-auto px-4 text-center">
			<div
				in:fly={{ y: 20, duration: 800, delay: 0, easing: quintOut }}
				class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200/50 backdrop-blur-sm border border-base-content/5 mb-8 hover:bg-base-200 transition-colors cursor-default"
			>
				<Sparkles class="size-4 text-primary" />
				<span class="text-sm font-medium text-base-content/70">Revolusi Produktivitas Muslim</span>
			</div>

			<h1
				in:fly={{ y: 20, duration: 800, delay: 100, easing: quintOut }}
				class="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-display"
			>
				Seimbangkan <span
					class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
					>Dunia & Akhirat</span
				>
			</h1>

			<p
				in:fly={{ y: 20, duration: 800, delay: 200, easing: quintOut }}
				class="text-xl text-base-content/70 max-w-2xl mx-auto mb-10 leading-relaxed"
			>
				Platform all-in-one untuk membangun kebiasaan positif, memantau ibadah, dan mencapai tujuan
				hidup dengan teknologi yang mengerti kebutuhan Anda.
			</p>

			<div
				in:fly={{ y: 20, duration: 800, delay: 300, easing: quintOut }}
				class="flex flex-col sm:flex-row items-center justify-center gap-4"
			>
				<Button
					onclick={() => goto('#cta')}
					variant="primary"
					size="lg"
					class="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105"
				>
					Mulai Perjalanan Hijrah
					<ArrowRight class="ml-2 size-5" />
				</Button>
				<Button
					onclick={() => goto('#features')}
					variant="ghost"
					size="lg"
					class="rounded-full px-8"
				>
					Pelajari Fitur
				</Button>
			</div>

			<!-- Hero Image/Mockup Placeholder -->
			<!-- <div
				in:fly={{ y: 40, duration: 1000, delay: 400, easing: quintOut }}
				class="mt-16 relative mx-auto max-w-4xl"
			>
				<div
					class="relative rounded-2xl border border-base-content/10 bg-base-100/50 backdrop-blur-xl p-2 shadow-2xl"
				>
					<div
						class="aspect-[16/9] rounded-xl bg-gradient-to-br from-base-200 to-base-300 overflow-hidden flex items-center justify-center relative"
					>
						<div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
						<span class="text-base-content/20 font-bold text-2xl">App Interface Preview</span>
					</div>
				</div>
			</div> -->
		</div>
	</section>

	<!-- 2. Features Section -->
	<section id="features" class="py-24 bg-base-200/50 relative">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16" use:animate={{ type: 'fadeInUp' }}>
				<h2 class="text-3xl md:text-4xl font-bold mb-4 font-display">Fitur Unggulan</h2>
				<p class="text-base-content/60 max-w-2xl mx-auto">
					Dirancang khusus untuk membantu Anda tetap istiqomah di tengah kesibukan.
				</p>
			</div>

			<div class="grid md:grid-cols-3 gap-8">
				{#each features as feature, i}
					<div
						class="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-content/5 hover:-translate-y-2 group"
						use:animate={{ type: 'fadeInUp', delay: i * 100 }}
					>
						<div class="card-body items-center text-center p-8">
							<div
								class="size-16 rounded-2xl bg-base-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
							>
								<svelte:component this={feature.icon} class="size-8 {feature.color}" />
							</div>
							<h3 class="card-title text-xl mb-3 font-display">{feature.title}</h3>
							<p class="text-base-content/70 leading-relaxed">{feature.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- 3. Pros & Cons (Comparison) Section -->
	<section id="comparison" class="py-24 relative overflow-hidden">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16" use:animate={{ type: 'fadeInUp' }}>
				<h2 class="text-3xl md:text-4xl font-bold mb-4 font-display">Mengapa YaaQeen Berbeda?</h2>
				<p class="text-base-content/60 max-w-2xl mx-auto">
					Bandingkan pengalaman Anda dan rasakan perbedaannya.
				</p>
			</div>

			<div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
				<!-- Traditional Way -->
				<div
					class="card bg-base-100 border border-base-content/10 opacity-80 hover:opacity-100 transition-opacity"
					use:animate={{ type: 'slideInLeft' }}
				>
					<div class="card-body">
						<div class="flex items-center gap-3 mb-6">
							<div class="badge badge-lg badge-ghost gap-2 p-4">
								<XCircle class="size-4" />
								Cara Lama
							</div>
						</div>
						<ul class="space-y-4">
							{#each comparison.cons as con}
								<li class="flex items-start gap-3 text-base-content/60">
									<XCircle class="size-5 text-error shrink-0 mt-0.5" />
									<span>{con}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>

				<!-- YaaQeen Way -->
				<div
					class="card bg-base-100 shadow-2xl border-2 border-primary relative overflow-hidden"
					use:animate={{ type: 'slideInRight', delay: 200 }}
				>
					<div class="absolute top-0 right-0 p-4">
						<div class="badge badge-primary badge-lg gap-2 p-4 shadow-lg">
							<CheckCircle2 class="size-4" />
							YaaQeen
						</div>
					</div>
					<div class="card-body">
						<h3 class="text-2xl font-bold mb-6 text-primary font-display">Experience Baru</h3>
						<ul class="space-y-4">
							{#each comparison.pros as pro}
								<li class="flex items-start gap-3 font-medium">
									<CheckCircle2 class="size-5 text-success shrink-0 mt-0.5" />
									<span>{pro}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- 4. About Section (Stats) -->
	<section id="about" class="py-24 bg-base-200/30">
		<div class="container mx-auto px-4">
			<div class="grid lg:grid-cols-2 gap-16 items-center">
				<div class="space-y-8" use:animate={{ type: 'fadeInUp' }}>
					<div
						class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
					>
						<Globe class="size-4" />
						Tentang Kami
					</div>
					<h2 class="text-4xl md:text-5xl font-bold font-display leading-tight">
						Membangun Generasi <br />
						<span class="text-primary">Produktif & Beriman</span>
					</h2>
					<p class="text-lg text-base-content/70 leading-relaxed">
						Kami percaya bahwa teknologi seharusnya mendekatkan kita pada tujuan penciptaan, bukan
						menjauhkannya. YaaQeen lahir dari visi untuk menyelaraskan produktivitas modern dengan
						nilai-nilai spiritual abadi.
					</p>

					<div class="grid grid-cols-3 gap-8 pt-8 border-t border-base-content/10">
						{#each stats as stat}
							<div class="text-center lg:text-left">
								<div class="text-3xl font-bold text-primary mb-1 font-display">{stat.value}</div>
								<div class="text-sm text-base-content/60">{stat.label}</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="relative" use:animate={{ type: 'scaleIn', delay: 200 }}>
					<div
						class="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-3xl opacity-20 blur-2xl"
					></div>
					<div
						class="relative rounded-3xl overflow-hidden shadow-2xl aspect-square bg-base-100 flex items-center justify-center"
					>
						<!-- Placeholder for Team/Office Image -->
						<div class="text-center p-8">
							<Users class="size-20 text-base-content/20 mx-auto mb-4" />
							<p class="text-base-content/40 font-medium">Our Team & Culture</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- 4. Pricing Section -->
	<!-- <section id="pricing" class="py-24 bg-base-200/50">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16" use:animate={{ type: 'fadeInUp' }}>
				<h2 class="text-3xl md:text-4xl font-bold mb-4 font-display">
					Investasi Terbaik untuk Akhirat
				</h2>
				<p class="text-base-content/60 max-w-2xl mx-auto">
					Pilih paket yang sesuai dengan kebutuhan perjalanan spiritual Anda.
				</p>
			</div>

			<div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
				<div
					class="card bg-base-100 border border-base-content/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2"
					use:animate={{ type: 'fadeInUp', delay: 0 }}
				>
					<div class="card-body p-8">
						<h3 class="text-xl font-bold font-display mb-2">Basic</h3>
						<div class="text-4xl font-bold mb-6">
							Gratis<span class="text-base font-normal text-base-content/60">/selamanya</span>
						</div>
						<p class="text-base-content/70 mb-8 text-sm">
							Fitur dasar untuk memulai kebiasaan baik.
						</p>

						<ul class="space-y-4 mb-8 flex-1">
							<li class="flex items-center gap-3 text-sm">
								<CheckCircle2 class="size-4 text-success" />
								<span>Tracker Ibadah Harian</span>
							</li>
							<li class="flex items-center gap-3 text-sm">
								<CheckCircle2 class="size-4 text-success" />
								<span>Jadwal Sholat & Adzan</span>
							</li>
							<li class="flex items-center gap-3 text-sm">
								<CheckCircle2 class="size-4 text-success" />
								<span>Akses Komunitas</span>
							</li>
						</ul>

						<Button variant="ghost" class="w-full border border-base-content/10 hover:bg-base-200"
							>Mulai Gratis</Button
						>
					</div>
				</div>

				<div
					class="card bg-base-100 border-2 border-primary shadow-xl relative scale-105 z-10"
					use:animate={{ type: 'fadeInUp', delay: 100 }}
				>
					<div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
						<div class="badge badge-primary badge-lg shadow-lg font-bold px-4 py-3">
							Paling Populer
						</div>
					</div>
					<div class="card-body p-8">
						<h3 class="text-xl font-bold font-display mb-2 text-primary">Premium</h3>
						<div class="text-4xl font-bold mb-6">
							Rp 29rb<span class="text-base font-normal text-base-content/60">/bulan</span>
						</div>
						<p class="text-base-content/70 mb-8 text-sm">Untuk Anda yang serius ingin istiqomah.</p>

						<ul class="space-y-4 mb-8 flex-1">
							<li class="flex items-center gap-3 text-sm font-medium">
								<CheckCircle2 class="size-4 text-primary" />
								<span>Semua Fitur Basic</span>
							</li>
							<li class="flex items-center gap-3 text-sm font-medium">
								<CheckCircle2 class="size-4 text-primary" />
								<span>Analitik & Insight Mingguan</span>
							</li>
							<li class="flex items-center gap-3 text-sm font-medium">
								<CheckCircle2 class="size-4 text-primary" />
								<span>Jurnal Syukur Unlimited</span>
							</li>
							<li class="flex items-center gap-3 text-sm font-medium">
								<CheckCircle2 class="size-4 text-primary" />
								<span>Backup Data Cloud</span>
							</li>
						</ul>

						<Button variant="primary" class="w-full shadow-lg shadow-primary/20"
							>Coba Premium 7 Hari</Button
						>
					</div>
				</div>

				<div
					class="card bg-base-100 border border-base-content/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2"
					use:animate={{ type: 'fadeInUp', delay: 200 }}
				>
					<div class="card-body p-8">
						<h3 class="text-xl font-bold font-display mb-2">Lifetime</h3>
						<div class="text-4xl font-bold mb-6">
							Rp 499rb<span class="text-base font-normal text-base-content/60">/sekali bayar</span>
						</div>
						<p class="text-base-content/70 mb-8 text-sm">Investasi sekali untuk selamanya.</p>

						<ul class="space-y-4 mb-8 flex-1">
							<li class="flex items-center gap-3 text-sm">
								<CheckCircle2 class="size-4 text-success" />
								<span>Semua Fitur Premium</span>
							</li>
							<li class="flex items-center gap-3 text-sm">
								<CheckCircle2 class="size-4 text-success" />
								<span>Akses Selamanya</span>
							</li>
							<li class="flex items-center gap-3 text-sm">
								<CheckCircle2 class="size-4 text-success" />
								<span>Prioritas Support</span>
							</li>
							<li class="flex items-center gap-3 text-sm">
								<CheckCircle2 class="size-4 text-success" />
								<span>Badge "Early Adopter"</span>
							</li>
						</ul>

						<Button variant="ghost" class="w-full border border-base-content/10 hover:bg-base-200"
							>Beli Lifetime</Button
						>
					</div>
				</div>
			</div>
		</div>
	</section> -->

	<!-- 5. CTA Section -->
	<section id="cta" class="py-24">
		<div class="container mx-auto px-4">
			<div
				class="relative rounded-3xl bg-base-content text-base-100 overflow-hidden shadow-2xl"
				use:animate={{ type: 'scaleIn' }}
			>
				<!-- Background Pattern -->
				<div class="absolute inset-0 opacity-10">
					<div class="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
					<div
						class="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary rounded-full blur-3xl"
					></div>
				</div>

				<div class="relative z-10 px-8 py-20 text-center max-w-3xl mx-auto">
					<h2 class="text-3xl md:text-5xl font-bold mb-6 font-display">Siap Memulai Perubahan?</h2>
					<p class="text-lg text-base-100/80 mb-10 leading-relaxed">
						Bergabunglah sekarang dan rasakan ketenangan dalam setiap langkah produktivitas Anda.
						Gratis untuk memulai.
					</p>

					<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Button
							onclick={() => goto('/register')}
							variant="primary"
							size="lg"
							class="rounded-full px-10 min-w-[200px] shadow-xl hover:scale-105 transition-transform border-none"
						>
							Daftar Gratis
						</Button>
						<div class="flex items-center gap-2 text-sm text-base-100/60">
							<Clock class="size-4" />
							<span>Hanya butuh 2 menit</span>
						</div>
					</div>

					<div
						class="mt-12 pt-8 border-t border-base-100/10 flex items-center justify-center gap-8 opacity-60"
					>
						<!-- Social Proof Logos Placeholder -->
						<span class="text-sm font-medium tracking-widest uppercase"
							>Trusted by 10,000+ Muslims</span
						>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>
