<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Flame, Clock, Calendar, CheckCircle, BookOpen, Activity, ArrowRight, Sparkles, Heart } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { PrayerTimer } from '$lib/runes/prayer.svelte';

	let { data } = $props();
	
	// Initialize Timer
	const timer = new PrayerTimer(data.prayerTimes || []);

	$effect(() => {
		if (data.prayerTimes) {
			timer.updatePrayers(data.prayerTimes);
		}
	});

	const profile = $derived(data.user);

	function getGreeting() {
		const hour = timer.currentTime.getHours();
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
					{getGreeting()}, <span class="text-primary capitalize">{profile.name}!</span> 👋
				</h1>
				<p class="text-base-content/60 mt-1">"Mulai harimu dengan Bismillah."</p>
			</div>
			
			<div class="flex items-center gap-3 bg-base-100 shadow-sm border border-base-content/10 px-4 py-2 rounded-full">
				<div class="relative">
					<Flame class="size-6 text-orange-500 animate-pulse" />
					<div class="absolute inset-0 bg-orange-500/20 blur-lg rounded-full animate-pulse"></div>
				</div>
				<div>
					<span class="font-bold text-lg">{profile.streak}</span>
					<span class="text-xs text-base-content/60 ml-1">Hari Beruntun</span>
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
							<span class="text-sm font-medium uppercase tracking-wider">Sholat Berikutnya</span>
						</div>
						<h2 class="text-4xl font-bold mb-1">{timer.nextPrayer?.name}</h2>
						
						
						{#if timer.nextPrayer}
							<div class="text-5xl font-black font-mono tracking-tighter my-2 tabular-nums">
								{timer.countdown}
							</div>
							<div class="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
								<Clock class="size-3" />
								<span>{timer.nextPrayer?.time}</span>
							</div>
						{:else}
						
							<p class="text-2xl font-mono opacity-90">{timer.nextPrayer ? timer.nextPrayer : 'Sampai jumpa besok'}</p>
						{/if}
					</div>
					
					<div class="flex flex-col gap-2">
						<Button variant="ghost" class="bg-white/20 hover:bg-white/30 text-white border-none gap-2" onclick={() => goto('/jadwal-solat')}>
							Lihat Jadwal
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
						Progres Harian
					</h3>
					
					<div class="space-y-4">
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Ibadah</span>
								<span class="font-bold text-primary">{profile.progress.ibadah}%</span>
							</div>
							<progress class="progress progress-primary w-full" value={profile.progress.ibadah} max="100"></progress>
						</div>
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Kebiasaan</span>
								<span class="font-bold text-secondary">{profile.progress.habits}%</span>
							</div>
							<progress class="progress progress-secondary w-full" value={profile.progress.habits} max="100"></progress>
						</div>
						<div>
							<div class="flex justify-between text-sm mb-1">
								<span>Quran</span>
								<span class="font-bold text-accent">{profile.progress.quran}%</span>
							</div>
							<progress class="progress progress-accent w-full" value={profile.progress.quran} max="100"></progress>
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
					Aktivitas Terkini
				</h2>
				<Button variant="link" class="text-primary no-underline hover:underline p-0 h-auto" onclick={() => goto('/ibadah')}>Lihat Semua</Button>
			</div>

			<div class="grid gap-3">
				{#each profile.recentActivity as activity, i}
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
				{#if profile.recentActivity.length === 0}
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
				<span class="text-xs font-medium">Catat Mood</span>
			</Button>
			<Button  class="h-auto py-4 flex-col gap-2 border-base-content/10 hover:border-secondary hover:text-secondary transition-all" onclick={()=> goto('/ibadah')}>
				<Sparkles class="size-6" />
				<span class="text-xs font-medium">Kebiasaan Baru</span>
			</Button>
			<Button  class="h-auto py-4 flex-col gap-2 border-base-content/10 hover:border-accent hover:text-accent transition-all" onclick={()=> goto('/quran')}>
				<BookOpen class="size-6" />
				<span class="text-xs font-medium">Baca Quran</span>
			</Button>
			<Button  class="h-auto py-4 flex-col gap-2 border-base-content/10 hover:border-info hover:text-info transition-all" onclick={()=> goto('/journal')}>
				<Calendar class="size-6" />
				<span class="text-xs font-medium">Jurnal</span>
			</Button>
		</div>
	</div>
</div>