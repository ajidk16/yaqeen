<script lang="ts">
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { TrendingUp, Award, Zap, Activity, MessageCircleHeart, Quote, BellRing, Check, Sparkles, Heart } from 'lucide-svelte';
	import { Card, Button, Badge } from '$lib/components/ui';

	// Mock Data
	const weeklyData = [
		{ day: 'Sen', value: 80 },
		{ day: 'Sel', value: 65 },
		{ day: 'Rab', value: 90 },
		{ day: 'Kam', value: 75 },
		{ day: 'Jum', value: 85 },
		{ day: 'Sab', value: 50 },
		{ day: 'Ahd', value: 95 }
	];

	// Feedback Logic
	const feedback = {
		title: "MasyaAllah, Luar Biasa!",
		message: "Sholat Subuhmu terjaga 7 hari berturut-turut! Konsistensi adalah kunci keberkahan.",
		suggestion: "Yuk, tambah sedikit dengan Dzikir Pagi hari ini untuk memulai hari dengan lebih tenang.",
		type: "success" // success, warning, info
	};

	// Contextual Wisdom
	const wisdom = {
		text: "Dan mintalah pertolongan (kepada Allah) dengan sabar dan sholat. Dan sesungguhnya yang demikian itu sungguh berat, kecuali bagi orang-orang yang khusyu'.",
		source: "QS. Al-Baqarah: 45"
	};

	// Heartfelt Reminders
	let reminders = $state([
		{ id: 1, text: "Lelah itu wajar, tapi jangan lupa istirahat dengan sujud.", active: true },
		{ id: 2, text: "Rezeki sudah diatur, yang perlu dikejar adalah berkahnya.", active: true },
		{ id: 3, text: "Setiap langkah ke masjid menghapus dosa dan mengangkat derajat.", active: false }
	]);

	function toggleReminder(id: number) {
		const index = reminders.findIndex(r => r.id === id);
		if (index !== -1) {
			reminders[index].active = !reminders[index].active;
		}
	}
	function animateBar(node: HTMLElement, { value, delay }: { value: number; delay: number }) {
		node.style.height = '0px';
		
		const timeout = setTimeout(() => {
			node.style.height = `${value}px`;
		}, delay);

		return {
			update({ value }: { value: number }) {
				node.style.height = `${value}px`;
			},
			destroy() {
				clearTimeout(timeout);
			}
		};
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<!-- Header -->
		<header in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<h1 class="text-3xl font-bold flex items-center gap-3">
				<Activity class="size-8 text-primary" />
				Statistik & Evaluasi
			</h1>
			<p class="text-base-content/60">Pantau progres dan dapatkan insight harianmu.</p>
		</header>

		<!-- Personalized Feedback Card -->
		<div class="card bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg overflow-visible" in:scale={{ duration: 600, start: 0.95, delay: 100 }}>
			<div class="card-body p-6 relative">
				<!-- Decorative Icon -->
				<div class="absolute -top-6 -right-6 size-24 bg-primary/10 rounded-full blur-2xl"></div>
				
				<div class="flex items-start gap-4 relative z-10">
					<div class="size-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
						<MessageCircleHeart class="size-6" />
					</div>
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<h2 class="text-xl font-bold text-primary">{feedback.title}</h2>
							<Badge variant="primary" class="animate-pulse">New</Badge>
						</div>
						<p class="text-base-content/80 font-medium leading-relaxed">
							{feedback.message}
						</p>
						<div class="bg-base-100/50 p-3 rounded-xl border border-primary/10 flex items-start gap-3 mt-2">
							<Sparkles class="size-4 text-warning mt-0.5 shrink-0" />
							<p class="text-sm text-base-content/70 italic">"{feedback.suggestion}"</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="grid md:grid-cols-2 gap-6">
			<!-- Weekly Chart -->
			<div class="card bg-base-100 shadow-sm border border-base-content/10" in:fly={{ x: -20, duration: 800, delay: 200 }}>
				<div class="card-body p-6">
					<div class="flex items-center justify-between mb-6">
						<h2 class="font-bold text-lg">Aktivitas Minggu Ini</h2>
						<div class="badge badge-success gap-1">
							<TrendingUp class="size-3" />
							+12%
						</div>
					</div>

					<div class="flex items-end justify-between gap-2 h-48">
						{#each weeklyData as data, i}
							<div class="flex flex-1 flex-col items-center gap-2 group">
								<div class="relative w-full rounded-t-xl bg-base-200 transition-all duration-500 group-hover:bg-primary/20 overflow-hidden h-full flex items-end">
									<div
										class="w-full rounded-t-xl bg-primary transition-all duration-1000 ease-out group-hover:bg-primary-focus relative"
										use:animateBar={{ value: data.value, delay: 300 + (i * 100) }}
									>
										<div class="absolute -top-8 bg-primary/20 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
											{data.value}%
										</div>
									</div>
								</div>


								<span class="text-xs font-medium text-base-content/40">{data.day}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Contextual Wisdom -->
			<div class="card bg-linear-to-br from-secondary/10 to-secondary/5 border border-secondary/20 shadow-sm" in:fly={{ x: 20, duration: 800, delay: 300 }}>
				<div class="card-body p-6 flex flex-col justify-center text-center space-y-4">
					<Quote class="size-8 text-secondary/40 mx-auto" />
					<p class="text-lg font-serif italic text-base-content/80 leading-relaxed">
						"{wisdom.text}"
					</p>
					<div class="w-12 h-1 bg-secondary/20 mx-auto rounded-full"></div>
					<p class="text-sm font-bold text-secondary uppercase tracking-widest">{wisdom.source}</p>
				</div>
			</div>
		</div>

		<!-- Heartfelt Reminders -->
		<div class="space-y-4" in:fly={{ y: 20, duration: 800, delay: 400 }}>
			<h2 class="text-xl font-bold flex items-center gap-2">
				<BellRing class="size-5 text-accent" />
				Pengingat Hati
			</h2>
			
			<div class="grid gap-3">
				{#each reminders as reminder}
					<div class="card bg-base-100 shadow-sm border border-base-content/10 hover:border-accent/30 transition-all duration-300">
						<div class="card-body p-4 flex-row items-center justify-between gap-4">
							<div class="flex items-center gap-4">
								<div class="size-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
									<Heart class="size-5 {reminder.active ? 'fill-current' : ''}" />
								</div>
								<p class="font-medium text-base-content/80">{reminder.text}</p>
							</div>
							<input 
								type="checkbox" 
								class="toggle toggle-accent" 
								checked={reminder.active} 
								onclick={() => toggleReminder(reminder.id)}
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

