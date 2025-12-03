<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Flame, Clock, Calendar, CheckCircle, BookOpen, Activity, ArrowRight, Sparkles, Heart } from 'lucide-svelte';
	import { Card, Button, Badge } from '$lib/components/ui';
	import { goto } from '$app/navigation';

	let { data } = $props();
	
	// Calculate next prayer from data
	let nextPrayer = $derived.by(() => {
		if (!data.prayerTimes) return null;
		const now = new Date().getTime();
		return data.prayerTimes.find((p: any) => p.timestamp > now) || null;
	});

	// Merge server data with local state for nextPrayer
	let user = $derived({
		...data.user,
		nextPrayer: nextPrayer ? { ...nextPrayer } : { name: 'All Done', time: 'See you tomorrow' }
	});

	let currentTime = $state(new Date());
	let timeToNextPrayer = $state('');
	let timerInterval: any;

	onMount(() => {
		timerInterval = setInterval(() => {
			currentTime = new Date();
			updateCountdown();
		}, 1000);
		updateCountdown();
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	function updateCountdown() {
		if (!nextPrayer) {
			timeToNextPrayer = '';
			return;
		}

		const now = new Date().getTime();
		const diff = nextPrayer.timestamp - now;

		if (diff <= 0) {
			// Ideally trigger refresh or handle next day
			timeToNextPrayer = '00:00:00';
			return;
		}

		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		timeToNextPrayer = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	function getGreeting() {
		const hour = currentTime.getHours();
		if (hour < 12) return 'Selamat Pagi';
		if (hour < 15) return 'Selamat Siang';
		if (hour < 18) return 'Selamat Sore';
		return 'Selamat Malam';
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<!-- Header -->
		<header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<div>
				<h1 class="text-3xl font-bold">
					{getGreeting()}, <span class="text-primary capitalize">{user.name}!</span> 👋
				</h1>
				<p class="text-base-content/60 mt-1">"Mulai harimu dengan Bismillah."</p>
			</div>
			
			<div class="flex items-center gap-3 bg-base-100 shadow-sm border border-base-content/10 px-4 py-2 rounded-full">
				<div class="relative">
					<Flame class="size-6 text-orange-500 animate-pulse" />
					<div class="absolute inset-0 bg-orange-500/20 blur-lg rounded-full animate-pulse"></div>
				</div>
				<div>
					<span class="font-bold text-lg">{user.streak}</span>
					<span class="text-xs text-base-content/60 ml-1">Day Streak</span>
				</div>
			</div>
		</header>

		<div class="grid md:grid-cols-3 gap-6">
			<!-- Next Prayer Widget -->
			<div class="md:col-span-2 card bg-linear-to-br from-primary to-primary-focus text-primary-content shadow-xl overflow-hidden relative" in:scale={{ duration: 600, start: 0.95, delay: 100 }}>
				<!-- Decorative -->
				<div class="absolute top-0 right-0 -mt-10 -mr-10 size-40 rounded-full bg-white/10 blur-3xl"></div>
				
				<div class="card-body p-6 flex-row items-center justify-between relative z-10">
					<div>
						<div class="flex items-center gap-2 mb-2 text-primary-content/80">
							<Clock class="size-4" />
							<span class="text-sm font-medium uppercase tracking-wider">Next Prayer</span>
						</div>
						<h2 class="text-4xl font-bold mb-1">{user.nextPrayer.name}</h2>
						
						{#if nextPrayer}
							<div class="text-5xl font-black font-mono tracking-tighter my-2 tabular-nums">
								{timeToNextPrayer}
							</div>
							<div class="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
								<Clock class="size-3" />
								<span>{user.nextPrayer.time}</span>
							</div>
						{:else}
							<p class="text-2xl font-mono opacity-90">{user.nextPrayer.time}</p>
						{/if}
					</div>
					
					<div class="flex flex-col gap-2">
						<Button variant="ghost" class="bg-white/20 hover:bg-white/30 text-white border-none gap-2" onclick={() => goto('/jadwal-solat')}>
							View Schedule
							<ArrowRight class="size-4" />
						</Button>
					</div>
				</div>
			</div>

			<!-- Quick Stats -->
			<div class="card bg-base-100 shadow-sm border border-base-content/10" in:fly={{ x: 20, duration: 800, delay: 200 }}>
				<div class="card-body p-6">
					<h3 class="font-bold text-lg mb-4 flex items-center gap-2">
						<Activity class="size-5 text-secondary" />
						Daily Progress
					</h3>
					
					<div class="space-y-4">
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Ibadah</span>
								<span class="font-bold text-primary">{user.progress.ibadah}%</span>
							</div>
							<progress class="progress progress-primary w-full" value={user.progress.ibadah} max="100"></progress>
						</div>
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Habits</span>
								<span class="font-bold text-secondary">{user.progress.habits}%</span>
							</div>
							<progress class="progress progress-secondary w-full" value={user.progress.habits} max="100"></progress>
						</div>
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Quran</span>
								<span class="font-bold text-accent">{user.progress.quran}%</span>
							</div>
							<progress class="progress progress-accent w-full" value={user.progress.quran} max="100"></progress>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent Activity -->
		<div class="space-y-4" in:fly={{ y: 20, duration: 800, delay: 300 }}>
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-bold flex items-center gap-2">
					<Calendar class="size-5 text-base-content/60" />
					Recent Activity
				</h2>
				<Button variant="link" class="text-primary no-underline hover:underline p-0 h-auto" onclick={() => goto('/ibadah')}>See All</Button>
			</div>

			<div class="grid gap-3">
				{#each user.recentActivity as activity, i}
					{@const Icon = activity.type === 'prayer' ? CheckCircle : activity.type === 'quran' ? BookOpen : Activity}
					{@const color = activity.type === 'prayer' ? 'text-success' : activity.type === 'quran' ? 'text-primary' : 'text-warning'}
					<div 
						class="card bg-base-100 shadow-sm border border-base-content/5 hover:shadow-md transition-all duration-300"
						in:fly={{ y: 20, duration: 500, delay: 400 + (i * 100) }}
					>
						<div class="card-body p-4 flex-row items-center gap-4">
							<div class="size-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
								<Icon class="size-5 {color}" />
							</div>
							<div class="flex-1">
								<h4 class="font-bold text-sm">{activity.title}</h4>
								<p class="text-xs text-base-content/60">{activity.time}</p>
							</div>
						</div>
					</div>
				{/each}
				{#if user.recentActivity.length === 0}
					<div class="text-center py-8 text-base-content/40 italic">
						Belum ada aktivitas hari ini.
					</div>
				{/if}
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4" in:fly={{ y: 20, duration: 800, delay: 500 }}>
			<Button  class="h-auto py-4 flex-col gap-2 border-base-content/10 hover:border-primary hover:text-primary transition-all" onclick={()=> goto('/stats')}>
				<Heart class="size-6" />
				<span class="text-xs font-medium">Log Mood</span>
			</Button>
			<Button  class="h-auto py-4 flex-col gap-2 border-base-content/10 hover:border-secondary hover:text-secondary transition-all" onclick={()=> goto('/habits')}>
				<Sparkles class="size-6" />
				<span class="text-xs font-medium">New Habit</span>
			</Button>
			<Button  class="h-auto py-4 flex-col gap-2 border-base-content/10 hover:border-accent hover:text-accent transition-all" onclick={()=> goto('/quran')}>
				<BookOpen class="size-6" />
				<span class="text-xs font-medium">Read Quran</span>
			</Button>
			<Button  class="h-auto py-4 flex-col gap-2 border-base-content/10 hover:border-info hover:text-info transition-all" onclick={()=> goto('/journal')}>
				<Calendar class="size-6" />
				<span class="text-xs font-medium">Journal</span>
			</Button>
		</div>
	</div>
</div>