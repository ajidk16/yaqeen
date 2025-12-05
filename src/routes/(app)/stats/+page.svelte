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
		text: m.stats_wisdom_text(),
		source: m.stats_wisdom_source()
	};

	const reminders = [
		m.stats_reminder_alkahfi(),
		m.stats_reminder_sholawat(),
		m.stats_reminder_sedekah()
	];

	const randomReminder = reminders[Math.floor(Math.random() * reminders.length)];
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<!-- Header -->
		<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<div>
				<h1 class="text-3xl font-bold flex items-center gap-3">
					<TrendingUp class="size-8 text-primary" />
					{m.stats_title()}
				</h1>
				<p class="text-base-content/60">{m.stats_subtitle()}</p>
			</div>
		</div>

		<!-- Weekly Activity Chart -->
		<Card class="overflow-hidden" in:scale={{ duration: 600, start: 0.95, delay: 100 }}>
			<div class="p-6">
				<h3 class="font-bold text-lg mb-6 flex items-center gap-2">
					<BarChart3 class="size-5 text-secondary" />
					{m.stats_weekly_activity()}
				</h3>
				
				<div class="flex items-end justify-between gap-2 h-48">
					{#each activityData as value, i}
						<div class="flex-1 flex flex-col items-center gap-2 group">
							<div 
								class="w-full bg-primary/10 rounded-t-lg relative overflow-hidden transition-all duration-500 group-hover:bg-primary/20"
								style="height: {(value / maxActivity) * 100}%"
							>
								<div 
									class="absolute bottom-0 left-0 w-full bg-primary transition-all duration-1000 ease-out"
									style="height: 0%; animation: grow 1s ease-out forwards {i * 100}ms"
								></div>
							</div>
							<span class="text-xs font-medium text-base-content/60">{days[i]}</span>
						</div>
					{/each}
				</div>
			</div>
		</Card>

		<!-- Wisdom / Reminder -->
		<div class="grid md:grid-cols-2 gap-6">
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

